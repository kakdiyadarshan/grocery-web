import { useState, useRef, useEffect } from 'react';
import { User, Heart, ShoppingBag, Menu, ChevronDown, ChevronUp, AlignLeft, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import logo from '../Image/logo.png';
import Cart from './Cart';
import { getCart } from '../redux/slice/cart.slice';
import { getWishlist } from '../redux/slice/wishlist.slice';

import { getAllCategories } from '../redux/slice/category.slice';

const Header = () => {
  const dispatch = useDispatch();
  const { cart } = useSelector((state) => state.cart);
  const { wishlist } = useSelector((state) => state.wishlist);
  const { categories } = useSelector((state) => state.category);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const categoryMenuRef = useRef(null);

  useEffect(() => {
    dispatch(getCart());
    dispatch(getWishlist());
    dispatch(getAllCategories());
  }, [dispatch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(event.target)) {
        setIsCategoryMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const cartCount = cart?.items?.length || 0;
  const wishlistCount = wishlist?.items?.length || 0;

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
            <div className="hidden md:flex flex-1 justify-center mx-6 lg:mx-12">
              <div className="flex items-center w-full max-w-2xl border border-[var(--primary)] rounded p-[2px]">
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full px-4 py-2 outline-none text-[var(--text-gray)] bg-transparent text-sm sm:text-base"
                />
                <button className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] transition-colors text-white px-6 lg:px-8 py-2 rounded text-sm sm:text-base font-medium">
                  Search
                </button>
              </div>
            </div>

            {/* Icons */}
            <div className="flex items-center gap-4 sm:gap-6">
              {/* User Icon Wrapper */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="text-[var(--text-gray)] hover:text-[var(--primary)] transition-colors flex items-center"
                >
                  <User className="w-6 h-6 sm:w-7 sm:h-7 stroke-[1.5]" />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute -right-2 top-full mt-4 w-40 bg-white border border-gray-100 shadow-md z-50 py-3 rounded-sm">
                    <ul className="flex flex-col gap-1">
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
                      <li>
                        <Link to="/logout" className="block px-5 py-1.5 text-[15px] text-[var(--text-gray)] hover:text-[var(--primary)] transition-colors">
                          Logout
                        </Link>
                      </li>
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
          <div className="flex md:hidden mt-4 items-center border border-[var(--primary)] rounded p-[2px]">
            <input
              type="text"
              placeholder="Search"
              className="w-full px-3 py-2 outline-none text-[var(--text-gray)] bg-transparent text-sm"
            />
            <button className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] transition-colors text-white px-5 py-2 rounded text-sm font-medium">
              Search
            </button>
          </div>
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
                          <Link to={`/category/${category._id}`} className="flex items-center justify-between px-5 py-2.5 hover:bg-gray-50 hover:text-[var(--primary)] transition-colors">
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
                <Link to="/category" className="text-[var(--text-gray)] hover:text-[var(--primary)] font-bold text-[15px] transition-colors">Shop</Link>
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
          <Link to="/category" onClick={() => setIsMobileMenuOpen(false)} className="text-[15px] font-bold text-[var(--text-gray)] hover:text-[var(--primary)] transition-colors border-b border-gray-50 pb-3">Shop</Link>
          <Link to="/aboutus" onClick={() => setIsMobileMenuOpen(false)} className="text-[15px] font-bold text-[var(--text-gray)] hover:text-[var(--primary)] transition-colors border-b border-gray-50 pb-3">About us</Link>
          <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="text-[15px] font-bold text-[var(--text-gray)] hover:text-[var(--primary)] transition-colors border-b border-gray-50 pb-3">Contact us</Link>
          <Link to="/blog" onClick={() => setIsMobileMenuOpen(false)} className="text-[15px] font-bold text-[var(--text-gray)] hover:text-[var(--primary)] transition-colors border-b border-gray-50 pb-3">Blog</Link>
        </div>
      </div>

      {/* Cart Drawer Component */}
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  );
};

export default Header;
