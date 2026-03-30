import { useState, useRef, useEffect, useMemo } from 'react';
import { User, Heart, ShoppingBag, Menu, ChevronDown, ChevronUp, AlignLeft, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import logo from '../Image/logo.png';
import Cart from './Cart';
import { getCart } from '../redux/slice/cart.slice';
import { getWishlist } from '../redux/slice/wishlist.slice';
import { logout, fetchUserProfile } from '../redux/slice/auth.slice';
import { getAllProducts } from '../redux/slice/product.slice';

import { getAllCategories } from '../redux/slice/category.slice';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { cart } = useSelector((state) => state.cart);
  const { wishlist } = useSelector((state) => state.wishlist);
  const { categories } = useSelector((state) => state.category);
  const { products = [] } = useSelector((state) => state.product || {});
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState([]);
  const userMenuRef = useRef(null);
  const categoryMenuRef = useRef(null);
  const desktopSearchRef = useRef(null);
  const mobileSearchRef = useRef(null);
  const lastProfileFetchAtRef = useRef(0);

  useEffect(() => {
    dispatch(getCart());
    dispatch(getWishlist());
    dispatch(getAllCategories());
  }, [dispatch]);

  useEffect(() => {
    // Keep header avatar in sync with server updates (e.g., photo upload on profile page).
    if (!isAuthenticated) return;
    const now = Date.now();
    if (now - lastProfileFetchAtRef.current < 10_000) return; // throttle
    lastProfileFetchAtRef.current = now;
    dispatch(fetchUserProfile());
  }, [dispatch, isAuthenticated, location.pathname]);

  useEffect(() => {
    if (!products.length) {
      dispatch(getAllProducts());
    }
  }, [dispatch, products.length]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('recentSearches');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setRecentSearches(parsed.slice(0, 5));
        }
      }
    } catch (error) {
      setRecentSearches([]);
    }
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
    }, 180);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(event.target)) {
        setIsCategoryMenuOpen(false);
      }
      const clickedInsideDesktop = desktopSearchRef.current?.contains(event.target);
      const clickedInsideMobile = mobileSearchRef.current?.contains(event.target);
      if (!clickedInsideDesktop && !clickedInsideMobile) {
        setIsSuggestionsOpen(false);
        setActiveSuggestionIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const query = new URLSearchParams(location.search).get('search') || '';
    if (location.pathname === '/shop' || location.pathname === '/category') {
      setSearchTerm(query);
    }
  }, [location.pathname, location.search]);

  const cartCount = cart?.items?.filter(item => item?.productId).length || 0;
  const wishlistCount = wishlist?.items?.filter(item => item?.productId).length || 0;

  const userPhotoUrl = user?.photo?.url || '';
  const userFullName = `${user?.firstname || ''} ${user?.lastname || ''}`.trim() || user?.name || '';
  const userInitials = userFullName
    ? userFullName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => (part[0] ? part[0].toUpperCase() : ''))
      .join('')
    : 'U';

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
    setIsUserMenuOpen(false);
  };

  const confirmLogout = () => {
    dispatch(logout());
    setIsLogoutModalOpen(false);
  };

  const handleSearch = (event) => {
    event.preventDefault();
    const trimmedSearch = searchTerm.trim();
    setIsSuggestionsOpen(false);
    setActiveSuggestionIndex(-1);
    if (trimmedSearch) {
      const nextRecentSearches = [trimmedSearch, ...recentSearches.filter((item) => item.toLowerCase() !== trimmedSearch.toLowerCase())].slice(0, 5);
      setRecentSearches(nextRecentSearches);
      localStorage.setItem('recentSearches', JSON.stringify(nextRecentSearches));
    }
    navigate(trimmedSearch ? `/shop?search=${encodeURIComponent(trimmedSearch)}` : '/shop');
  };

  const suggestionProducts = useMemo(() => {
    const searchValue = debouncedSearchTerm.toLowerCase();
    if (!searchValue) return [];

    return [...products]
      .map((product) => {
        const name = (product.name || '').toLowerCase();
        const category = (product.category?.categoryName || '').toLowerCase();
        const description = (product.description || '').toLowerCase();

        let score = 0;
        if (name.startsWith(searchValue)) score += 6;
        if (name.includes(searchValue)) score += 4;
        if (category.startsWith(searchValue)) score += 3;
        if (category.includes(searchValue)) score += 2;
        if (description.includes(searchValue)) score += 1;

        return { product, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || (a.product.name || '').localeCompare(b.product.name || ''))
      .slice(0, 8)
      .map((item) => item.product);
  }, [products, debouncedSearchTerm]);

  const handleSuggestionSelect = (product) => {
    setSearchTerm(product.name || '');
    setIsSuggestionsOpen(false);
    setActiveSuggestionIndex(-1);
    navigate(`/product-details/${product._id}`);
  };

  const handleRecentSearchSelect = (value) => {
    setSearchTerm(value);
    setIsSuggestionsOpen(false);
    setActiveSuggestionIndex(-1);
    navigate(`/shop?search=${encodeURIComponent(value)}`);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const handleSuggestionKeyDown = (event) => {
    if (!isSuggestionsOpen) return;

    const optionsCount = suggestionProducts.length + (debouncedSearchTerm ? 1 : 0);
    if (!optionsCount) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveSuggestionIndex((prev) => (prev + 1) % optionsCount);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveSuggestionIndex((prev) => (prev <= 0 ? optionsCount - 1 : prev - 1));
    } else if (event.key === 'Escape') {
      setIsSuggestionsOpen(false);
      setActiveSuggestionIndex(-1);
    } else if (event.key === 'Enter' && activeSuggestionIndex >= 0) {
      event.preventDefault();
      if (activeSuggestionIndex < suggestionProducts.length) {
        handleSuggestionSelect(suggestionProducts[activeSuggestionIndex]);
      } else {
        handleSearch(event);
      }
    }
  };

  const highlightMatch = (text, query) => {
    if (!text || !query) return text;
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const matchIndex = lowerText.indexOf(lowerQuery);
    if (matchIndex === -1) return text;

    return (
      <>
        {text.slice(0, matchIndex)}
        <span className="text-[var(--primary)] font-semibold">{text.slice(matchIndex, matchIndex + query.length)}</span>
        {text.slice(matchIndex + query.length)}
      </>
    );
  };

  const renderSuggestions = () => {
    if (!isSuggestionsOpen) return null;

    return (
      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded z-[70] max-h-80 overflow-y-auto">
        {debouncedSearchTerm && suggestionProducts.length > 0 ? (
          <ul className="py-1">
            {suggestionProducts.map((product, index) => (
              <li key={product._id}>
                <button
                  type="button"
                  onClick={() => handleSuggestionSelect(product)}
                  className={`w-full text-left px-3 py-2 transition-colors flex items-center gap-3 ${activeSuggestionIndex === index ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
                >
                  <img
                    src={product.images?.[0]?.url || 'https://via.placeholder.com/80?text=No+Image'}
                    alt={product.name}
                    className="w-9 h-9 rounded object-cover border border-gray-100"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm text-[var(--text-gray)] truncate">{highlightMatch(product.name, debouncedSearchTerm)}</span>
                    <span className="block text-xs text-gray-400 truncate">{highlightMatch(product.category?.categoryName || 'General', debouncedSearchTerm)}</span>
                  </span>
                </button>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={() => navigate(`/shop?search=${encodeURIComponent(debouncedSearchTerm)}`)}
                className={`w-full text-left px-3 py-2 text-sm border-t border-gray-100 transition-colors ${activeSuggestionIndex === suggestionProducts.length ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
              >
                View all results for "<span className="font-semibold">{debouncedSearchTerm}</span>"
              </button>
            </li>
          </ul>
        ) : debouncedSearchTerm ? (
          <p className="px-3 py-2 text-sm text-gray-400">No matching products found.</p>
        ) : recentSearches.length > 0 ? (
          <div className="py-1">
            <div className="px-3 py-2 flex items-center justify-between border-b border-gray-100">
              <span className="text-xs uppercase tracking-wide text-gray-400">Recent searches</span>
              <button type="button" onClick={clearRecentSearches} className="text-xs text-[var(--primary)] hover:underline">
                Clear
              </button>
            </div>
            {recentSearches.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => handleRecentSearchSelect(item)}
                className="w-full text-left px-3 py-2 text-sm text-[var(--text-gray)] hover:bg-gray-50 transition-colors"
              >
                {item}
              </button>
            ))}
          </div>
        ) : (
          <p className="px-3 py-2 text-sm text-gray-400">Type to search products by name, category, or description.</p>
        )}
      </div>
    );
  };

  return (
    <header className="bg-white sticky top-0 z-50">
      {/* Main Header */}
      <div className="border-b border-gray-100 py-4">
        <div className="container mx-auto px-4 lg:px-6">
          {/* Top Row: Logo, Desktop Search, and Icons */}
          <div className="flex items-center justify-between">

            {/* Logo */}
            <div className="flex-shrink-0">
              <Link to="/">
                <img
                  src={logo}
                  alt="Gromend"
                  className="h-10 sm:h-12 w-auto object-contain"
                />
              </Link>
            </div>

            {/* Search Bar - Desktop */}
            <form className="hidden md:flex flex-1 justify-center mx-6 lg:mx-12" onSubmit={handleSearch}>
              <div className="relative w-full max-w-2xl" ref={desktopSearchRef}>
                <div className="flex items-center border border-[var(--primary)] rounded p-[2px]">
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setIsSuggestionsOpen(true);
                      setActiveSuggestionIndex(-1);
                    }}
                    onFocus={() => setIsSuggestionsOpen(true)}
                    onKeyDown={handleSuggestionKeyDown}
                    className="w-full px-4 py-2 outline-none text-[var(--text-gray)] bg-transparent text-sm sm:text-base"
                  />
                  <button
                    type="submit"
                    className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] transition-colors text-white px-6 lg:px-8 py-2 rounded text-sm sm:text-base font-medium"
                  >
                    Search
                  </button>
                </div>
                {renderSuggestions()}
              </div>
            </form>

            {/* Icons */}
            <div className="flex items-center gap-4 sm:gap-6">
              {/* User Icon Wrapper */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="text-[var(--text-gray)] hover:text-[var(--primary)] transition-colors flex items-center"
                >
                  {isAuthenticated ? (
                    userPhotoUrl ? (
                      <img
                        src={userPhotoUrl}
                        alt={userFullName || 'User'}
                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border border-gray-200"
                      />
                    ) : (
                      <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[var(--primary)] text-white text-xs sm:text-sm font-semibold flex items-center justify-center border border-[var(--primary)]">
                        {userInitials}
                      </span>
                    )
                  ) : (
                    <User className="w-6 h-6 sm:w-7 sm:h-7 stroke-[1.5]" />
                  )}
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute -right-2 top-full mt-4 w-40 bg-white border border-gray-100 shadow-md z-50 py-3 rounded-sm">
                    <ul className="flex flex-col gap-1">
                      {isAuthenticated ? (
                        <>
                          <li>
                            <Link to="/profile" className="block px-5 py-1.5 text-[15px] text-[var(--text-gray)] hover:text-[var(--primary)] transition-colors">
                              My Profile
                            </Link>
                          </li>
                          <li>
                            <button
                              onClick={handleLogoutClick}
                              className="w-full text-left block px-5 py-1.5 text-[15px] text-[var(--text-gray)] hover:text-[var(--primary)] transition-colors"
                            >
                              Logout
                            </button>
                          </li>
                        </>
                      ) : (
                        <>
                          <li>
                            <Link to="/login" className="block px-5 py-1.5 text-[15px] text-[var(--text-gray)] hover:text-[var(--primary)] transition-colors">
                              Login
                            </Link>
                          </li>
                          <li>
                            <Link to="/register" className="block px-5 py-1.5 text-[15px] text-[var(--text-gray)] hover:text-[var(--primary)] transition-colors">
                              Register
                            </Link>
                          </li>
                        </>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              {/* Wishlist Icon */}
              <Link to="/wishlist" className="relative text-[var(--text-gray)] hover:text-[var(--primary)] transition-colors flex items-center gap-2">
                <div className="relative">
                  <Heart className="w-6 h-6 sm:w-7 sm:h-7 stroke-[1.5]" />
                  <span className="absolute -top-1.5 -right-2 sm:-top-2 sm:-right-2 bg-[var(--primary)] text-white text-[10px] sm:text-xs font-bold rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center border border-white">
                    {wishlistCount}
                  </span>

                </div>
              </Link>

              {/* Cart Icon */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative flex items-center gap-2 text-[var(--text-gray)] hover:text-[var(--primary)] transition-colors"
              >
                <div className="relative">
                  <ShoppingBag className="w-6 h-6 sm:w-7 sm:h-7 stroke-[1.5]" />
                  <span className="absolute -top-1.5 -right-2 sm:-top-2 sm:-right-2 bg-[var(--primary)] text-white text-[10px] sm:text-xs font-bold rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center border border-white">
                    {cartCount}
                  </span>

                </div>
                <span className="hidden md:block font-medium text-[var(--text-gray)] ml-1">My Cart</span>
              </button>
            </div>
          </div>

          {/* Search Bar - Mobile (Hidden on md and up) */}
          <form className="flex md:hidden mt-4" onSubmit={handleSearch}>
            <div className="relative w-full" ref={mobileSearchRef}>
              <div className="flex items-center border border-[var(--primary)] rounded p-[2px]">
                <input
                  type="text"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setIsSuggestionsOpen(true);
                    setActiveSuggestionIndex(-1);
                  }}
                  onFocus={() => setIsSuggestionsOpen(true)}
                  onKeyDown={handleSuggestionKeyDown}
                  className="w-full px-3 py-2 outline-none text-[var(--text-gray)] bg-transparent text-sm"
                />
                <button type="submit" className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] transition-colors text-white px-5 py-2 rounded text-sm font-medium">
                  Search
                </button>
              </div>
              {renderSuggestions()}
            </div>
          </form>
        </div>
      </div>

      {/* Sub Header Navigation */}
      <div className="border-b border-gray-100">
        <div className="container mx-auto px-4 lg:px-6 py-2">
          <div className="flex items-center justify-between">
            {/* Left Side: Category Button & Navigation */}
            <div className="flex items-center gap-8">
              {/* Category Dropdown */}
              <div className="relative z-50" ref={categoryMenuRef}>
                <button
                  onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
                  className={`bg-[var(--primary)] hover:bg-[var(--primary-hover)] transition-colors text-white px-5 py-2.5 rounded flex items-center gap-3 font-medium text-[14px] sm:text-[15px] ${isCategoryMenuOpen ? 'rounded-b-none' : ''}`}
                >
                  <AlignLeft className="w-[18px] h-[18px] sm:w-5 sm:h-5 stroke-[2]" />
                  <span className="tracking-wide lg:mr-4">Shop By Category</span>
                  {isCategoryMenuOpen ? (
                    <ChevronUp className="w-4 h-4 hidden lg:block" />
                  ) : (
                    <ChevronDown className="w-4 h-4 hidden lg:block" />
                  )}
                </button>

                {/* Dropdown Menu */}
                {isCategoryMenuOpen && (
                  <div className="absolute top-full left-0 w-[240px] sm:w-[260px] bg-white border border-gray-100 shadow-xl rounded-b py-2 text-[var(--text-gray)]">
                    <ul className="flex flex-col">
                      {categories?.length > 0 && categories.map((category) => (
                        <li key={category._id}>
                          <Link
                            to={`/shop?category=${encodeURIComponent(category.categoryName)}`}
                            onClick={() => setIsCategoryMenuOpen(false)}
                            className="flex items-center justify-between px-5 py-2.5 hover:bg-gray-50 hover:text-[var(--primary)] transition-colors"
                          >
                            <span className="text-[14.5px]">{category.categoryName}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Desktop Nav Links */}
              <nav className="hidden lg:flex items-center gap-7">
                <Link to="/" className="text-[var(--text-gray)] hover:text-[var(--primary)] font-bold text-[15px] transition-colors">Home</Link>
                <Link to="/shop" className="text-[var(--text-gray)] hover:text-[var(--primary)] font-bold text-[15px] transition-colors">Shop</Link>
                <Link to="/aboutus" className="text-[var(--text-gray)] hover:text-[var(--primary)] font-bold text-[15px] transition-colors">About us</Link>
                <Link to="/contact" className="text-[var(--text-gray)] hover:text-[var(--primary)] font-bold text-[15px] transition-colors">Contact us</Link>
                <Link to="/blog" className="text-[var(--text-gray)] hover:text-[var(--primary)] font-bold text-[15px] transition-colors">Blog</Link>
              </nav>
            </div>

            {/* Mobile Right Side: Menu Button */}
            <div className="lg:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="flex items-center gap-2 text-[#2c4e68] text-[var(--text-gray)] hover:text-[var(--primary)] font-bold text-[15px] sm:text-[16px] transition-colors"
              >
                Menu
                <Menu className="w-6 h-6 stroke-[2]" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Offcanvas Menu */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-[80] lg:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 left-0 h-full w-[80vw] sm:w-[320px] bg-white z-[90] transform transition-transform duration-300 ease-in-out flex flex-col shadow-2xl lg:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="px-5 py-5 flex items-center justify-between border-b border-gray-100">
          <h2 className="text-[17px] font-bold text-[var(--text-gray)] tracking-wide">Menu</h2>
          <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-400 hover:text-[var(--primary)] transition-colors">
            <X className="w-6 h-6 stroke-[1.5]" />
          </button>
        </div>

        <div className="flex flex-col px-5 py-4 gap-4 overflow-y-auto">
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-[15px] font-bold text-[var(--text-gray)] hover:text-[var(--primary)] transition-colors border-b border-gray-50 pb-3">Home</Link>
          <Link to="/shop" onClick={() => setIsMobileMenuOpen(false)} className="text-[15px] font-bold text-[var(--text-gray)] hover:text-[var(--primary)] transition-colors border-b border-gray-50 pb-3">Shop</Link>
          <Link to="/aboutus" onClick={() => setIsMobileMenuOpen(false)} className="text-[15px] font-bold text-[var(--text-gray)] hover:text-[var(--primary)] transition-colors border-b border-gray-50 pb-3">About us</Link>
          <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="text-[15px] font-bold text-[var(--text-gray)] hover:text-[var(--primary)] transition-colors border-b border-gray-50 pb-3">Contact us</Link>
          <Link to="/blog" onClick={() => setIsMobileMenuOpen(false)} className="text-[15px] font-bold text-[var(--text-gray)] hover:text-[var(--primary)] transition-colors border-b border-gray-50 pb-3">Blog</Link>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity"
            onClick={() => setIsLogoutModalOpen(false)}
          ></div>

          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-[450px] p-8 md:p-10 transform transition-all animate-in fade-in zoom-in duration-200">
            <div className="text-center">
              <h3 className="text-xl md:text-2xl font-semibold text-[#1F2937] mb-8">
                Are you sure you want to signOut?
              </h3>

              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={confirmLogout}
                  className="flex-1 bg-[#F34E4E] hover:bg-[#E33E3E] text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-sm active:scale-95"
                >
                  SignOut
                </button>
                <button
                  onClick={() => setIsLogoutModalOpen(false)}
                  className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-[#1F2937] font-semibold py-3 px-6 rounded-lg transition-colors active:scale-95"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart Drawer Component */}
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  );
};

export default Header;
