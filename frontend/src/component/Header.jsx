import { useState, useRef, useEffect, useMemo } from 'react';
import { User, Heart, ShoppingBag, Menu, ChevronDown, ChevronUp, AlignLeft, X, Search, LogOut } from 'lucide-react';
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
  const { products = [], allProducts = [] } = useSelector((state) => state.product || {});
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
  // const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const userMenuRef = useRef(null);
  const categoryMenuRef = useRef(null);
  const desktopSearchRef = useRef(null);
  const mobileSearchRef = useRef(null);
  const lastProfileFetchAtRef = useRef(0);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getCart());
      dispatch(getWishlist());
    }
    dispatch(getAllCategories());
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    // Keep header avatar in sync with server updates (e.g., photo upload on profile page).
    if (!isAuthenticated) return;
    const now = Date.now();
    if (now - lastProfileFetchAtRef.current < 10_000) return; // throttle
    lastProfileFetchAtRef.current = now;
    dispatch(fetchUserProfile());
  }, [dispatch, isAuthenticated, location.pathname]);

  useEffect(() => {
    if (!allProducts.length) {
      dispatch(getAllProducts({ paginate: false }));
    }
  }, [dispatch, allProducts.length]);

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

  const cartCount = isAuthenticated ? (cart?.items?.filter(item => item?.productId && (item.productId.name || item.productId.productName))?.length || 0) : 0;
  const wishlistCount = isAuthenticated ? (wishlist?.items?.filter(item => item?.productId && (item.productId.name || item.productId.productName))?.length || 0) : 0;

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

  // const handleLogout = () => {
  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
    setIsUserMenuOpen(false);
  };

  const confirmLogout = () => {
    dispatch(logout());
    setIsLogoutModalOpen(false);
    setIsMobileMenuOpen(false);
    navigate('/');
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

  const availableCategories = useMemo(() => {
    if (!categories || !allProducts) return [];
    return categories.filter(cat =>
      allProducts.some(product => {
        const productCatName = typeof product.category === 'object' ? product.category?.categoryName : product.category;
        return productCatName === cat.categoryName;
      })
    );
  }, [categories, allProducts]);

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
      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 shadow-md rounded-md z-[70] max-h-[450px] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
        {debouncedSearchTerm && suggestionProducts.length > 0 ? (
          <ul className="py-2">
            <li className="px-4 py-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 mb-1">
              Products Found
            </li>
            {suggestionProducts.map((product, index) => (
              <li key={product._id}>
                <button
                  type="button"
                  onClick={() => handleSuggestionSelect(product)}
                  className={`w-full text-left px-4 py-2.5 transition-all flex items-center gap-4 ${activeSuggestionIndex === index ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
                >
                  <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0">
                    <img
                      src={product.images?.[0]?.url || 'https://via.placeholder.com/80?text=No+Image'}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="block text-[14px] font-semibold text-gray-800 truncate">{highlightMatch(product.name, debouncedSearchTerm)}</span>
                      {product.weighstWise?.every(w => w.stock <= 0) && (
                        <span className="text-[9px] bg-red-100 text-red-500 font-bold px-1.5 py-0.5 rounded uppercase shrink-0">Sold Out</span>
                      )}
                    </div>
                    <span className="block text-[12px] text-gray-400 font-medium truncate mt-0.5">{highlightMatch(product.category?.categoryName || 'General', debouncedSearchTerm)}</span>
                  </div>
                  <div className="text-[14px] font-bold text-[var(--primary)] whitespace-nowrap">
                    ₹{product.weighstWise?.[0]?.price || 0}
                  </div>
                </button>
              </li>
            ))}
            <li className="mt-1 pt-1 border-t border-gray-50">
              <button
                type="button"
                onClick={() => navigate(`/shop?search=${encodeURIComponent(debouncedSearchTerm)}`)}
                className={`w-full text-left px-4 py-3 text-sm text-[var(--primary)] font-bold transition-colors ${activeSuggestionIndex === suggestionProducts.length ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
              >
                View all results for "<span className="italic">{debouncedSearchTerm}</span>"
              </button>
            </li>
          </ul>
        ) : debouncedSearchTerm ? (
          <div className="px-6 py-8 text-center">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6 text-gray-300" />
            </div>
            <p className="text-sm text-gray-500 font-medium">No results found for "<span className="font-bold">{debouncedSearchTerm}</span>"</p>
            <p className="text-xs text-gray-400 mt-1">Try check for typos or use different keywords</p>
          </div>
        ) : recentSearches.length > 0 ? (
          <div className="py-2">
            <div className="px-4 py-2 flex items-center justify-between border-b border-gray-50 mb-1">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Recent searches</span>
              <button type="button" onClick={clearRecentSearches} className="text-[11px] font-bold text-rose-500 hover:text-rose-600 transition-colors uppercase tracking-wider">
                Clear All
              </button>
            </div>
            {recentSearches.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => handleRecentSearchSelect(item)}
                className="w-full text-left px-4 py-2.5 text-[14px] text-gray-600 hover:bg-gray-50 flex items-center gap-3 transition-colors group"
              >
                <div className="w-7 h-7 rounded-md bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-white transition-colors">
                  <Search className="w-3.5 h-3.5" />
                </div>
                {item}
              </button>
            ))}
          </div>
        ) : (
          <div className="px-6 py-8 text-center">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6 text-gray-300" />
            </div>
            <p className="text-sm text-gray-500 font-bold">What are you looking for?</p>
            <p className="text-xs text-gray-400 mt-1">Search by products, categories, or tags</p>
          </div>
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
                <div className="flex items-center border border-gray-200 rounded-md px-4 py-1.5 focus-within:border-[var(--primary)] focus-within:bg-white focus-within:ring-4 focus-within:ring-[var(--primary-light)] transition-all duration-300">
                  <Search className="w-5 h-5 text-gray-400 mr-3" />
                  <input
                    type="text"
                    placeholder="Search for products, categories..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setIsSuggestionsOpen(true);
                      setActiveSuggestionIndex(-1);
                    }}
                    onFocus={() => setIsSuggestionsOpen(true)}
                    onKeyDown={handleSuggestionKeyDown}
                    className="w-full py-1.5 outline-none text-[var(--text-gray)] bg-transparent text-sm sm:text-base placeholder:text-gray-400 font-medium"
                  />
                  <button
                    type="submit"
                    className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] transition-all text-white px-6 py-2 rounded-md text-sm font-[500] shadow-sm active:scale-95 whitespace-nowrap ml-2"
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
                  <div className="absolute -right-2 top-full  mt-4 w-56 bg-white border border-gray-100 shadow-xl z-[999] py-2 rounded-lg overflow-hidden animate-fadeIn">
                    <ul className="flex flex-col">
                      {isAuthenticated ? (
                        <>
                          {/* User Info Header */}
                          <li className="px-5 py-3 bg-gray-50/50 border-b border-gray-100 mb-1">
                            <p className="text-[13px] font-bold text-gray-900 truncate">{userFullName || 'User Account'}</p>
                            <p className="text-[11px] text-gray-400 truncate mt-0.5">{user?.email}</p>
                          </li>

                          <li>
                            <Link
                              to="/profile"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-3 px-5 py-2.5 text-[14px] text-[var(--text-gray)] hover:text-[var(--primary)] hover:bg-gray-50 transition-all font-medium"
                            >
                              <User size={17} className="stroke-[1.5]" />
                              My Profile
                            </Link>
                          </li>
                          {/* <li>
                            <Link
                              to="/my-order"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-3 px-5 py-2.5 text-[14px] text-[var(--text-gray)] hover:text-[var(--primary)] hover:bg-gray-50 transition-all font-medium"
                            >
                              <ShoppingBag size={17} className="stroke-[1.5]" />
                              My Orders
                            </Link>
                          </li> */}
                          <li className="border-t border-gray-100 mt-1 pt-1">
                            <button
                              onClick={handleLogoutClick}
                              className="w-full text-left flex items-center gap-3 px-5 py-2.5 text-[14px] text-rose-500 hover:bg-rose-50 transition-all font-semibold"
                            >
                              <X size={17} className="stroke-[2]" />
                              Logout
                            </button>
                          </li>
                        </>
                      ) : (
                        <>
                          <li>
                            <Link
                              to="/login"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-3 px-5 py-3 text-[14px] text-[var(--text-gray)] hover:text-[var(--primary)] hover:bg-gray-50 transition-all font-bold"
                            >
                              <User size={17} className="stroke-[2]" />
                              Login
                            </Link>
                          </li>
                          <li className="border-t border-gray-50">
                            <Link
                              to="/register"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-3 px-5 py-3 text-[14px] text-[var(--text-gray)] hover:text-[var(--primary)] hover:bg-gray-50 transition-all font-bold"
                            >
                              Register Account
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
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-1 focus-within:border-[var(--primary)] focus-within:bg-white transition-all duration-300">
                <Search className="w-4 h-4 text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setIsSuggestionsOpen(true);
                    setActiveSuggestionIndex(-1);
                  }}
                  onFocus={() => setIsSuggestionsOpen(true)}
                  onKeyDown={handleSuggestionKeyDown}
                  className="w-full py-2 outline-none text-[var(--text-gray)] bg-transparent text-sm placeholder:text-gray-400 font-medium"
                />
                <button type="submit" className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] transition-all text-white px-4 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ml-2">
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
                      {availableCategories?.length > 0 && availableCategories.map((category) => (
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
        <div className="px-5 py-5 flex items-center justify-between border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <div className="w-10 h-10 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-bold">
                  {userPhotoUrl ? <img src={userPhotoUrl} alt="User" className="w-full h-full rounded-full object-cover" /> : userInitials}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-900 truncate max-w-[150px]">{userFullName || 'Account'}</span>
                  <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="text-[11px] text-[var(--primary)] font-bold uppercase tracking-wider">View Profile</Link>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                  <User size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-900">Welcome Guest</span>
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-[11px] text-[var(--primary)] font-bold uppercase tracking-wider">Login / Register</Link>
                </div>
              </div>
            )}
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-400 hover:text-[var(--primary)] transition-colors">
            <X className="w-6 h-6 stroke-[1.5]" />
          </button>
        </div>

        <div className="flex flex-col px-5 py-4 gap-4 overflow-y-auto">
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 text-[15px] font-bold text-[var(--text-gray)] hover:text-[var(--primary)] transition-colors border-b border-gray-50 pb-3">Home</Link>
          <Link to="/shop" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 text-[15px] font-bold text-[var(--text-gray)] hover:text-[var(--primary)] transition-colors border-b border-gray-50 pb-3">Shop</Link>
          {isAuthenticated && (
            <>
              <Link to="/my-order" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 text-[15px] font-bold text-[var(--text-gray)] hover:text-[var(--primary)] transition-colors border-b border-gray-50 pb-3">My Orders</Link>
            </>
          )}
          <Link to="/aboutus" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 text-[15px] font-bold text-[var(--text-gray)] hover:text-[var(--primary)] transition-colors border-b border-gray-50 pb-3">About us</Link>
          <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 text-[15px] font-bold text-[var(--text-gray)] hover:text-[var(--primary)] transition-colors border-b border-gray-50 pb-3">Contact us</Link>
          <Link to="/blog" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 text-[15px] font-bold text-[var(--text-gray)] hover:text-[var(--primary)] transition-colors border-b border-gray-50 pb-3">Blog</Link>

          {isAuthenticated && (
            <button
              onClick={handleLogoutClick}
              className="flex items-center gap-3 text-[15px] font-bold text-rose-500 hover:text-rose-600 transition-colors pt-2"
            >
              Logout
            </button>
          )}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        // <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        //   <div
        //     className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity"
        //     onClick={() => setIsLogoutModalOpen(false)}
        //   ></div>

        //   <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-[450px] p-8 md:p-10 transform transition-all animate-in fade-in zoom-in duration-200">
        //     <div className="text-center">
        //       <h3 className="text-xl md:text-2xl font-semibold text-[#1F2937] mb-8">
        //         Are you sure you want to signOut?
        //       </h3>

        //       <div className="flex items-center justify-center gap-4">
        //         <button
        //           onClick={confirmLogout}
        //           className="flex-1 bg-[#F34E4E] hover:bg-[#E33E3E] text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-sm active:scale-95"
        //         >
        //           SignOut
        //         </button>
        //         <button
        //           onClick={() => setIsLogoutModalOpen(false)}
        //           className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-[#1F2937] font-semibold py-3 px-6 rounded-lg transition-colors active:scale-95"
        //         >
        //           Cancel
        //         </button>
        //       </div>
        //     </div>
        //   </div>
        // </div>

        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">

          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsLogoutModalOpen(false)}
          ></div>

          <div className="relative w-full max-w-md rounded-2xl bg-white/80 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.2)] border border-white/30 p-8 animate-fadeIn">

            <div className="flex justify-center mb-5">
              <div className="w-14 h-14 flex items-center justify-center rounded-full bg-red-100 text-red-500 shadow-inner">
                <LogOut size={26} />
              </div>
            </div>

            <h3 className="text-2xl font-semibold text-gray-800 text-center mb-2">
              Sign Out?
            </h3>

            <p className="text-gray-500 text-center mb-8 text-sm">
              Are you sure you want to log out from your account?
            </p>

            <div className="flex gap-4">

              <button
                onClick={confirmLogout}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold shadow-lg hover:shadow-red-300/40 hover:scale-[1.02] transition-all duration-200 active:scale-95"
              >
                Sign Out
              </button>

              <button
                onClick={() => setIsLogoutModalOpen(false)}
                className="flex-1 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 font-medium hover:bg-gray-100 transition-all duration-200 active:scale-95"
              >
                Cancel
              </button>

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
