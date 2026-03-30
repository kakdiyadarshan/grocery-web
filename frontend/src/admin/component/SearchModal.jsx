import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Search, X, ShoppingBag, Folder, User, List,
  ArrowRight, Clock, Hash, ChevronRight
} from 'lucide-react';
import { getAllCategories } from '../../redux/slice/category.slice';
import { fetchAllUsers } from '../../redux/slice/auth.slice';
import { fetchOrders } from '../../redux/slice/order.slice';
import { getAllProducts } from '../../redux/slice/product.slice';
import { IMAGE_URL } from '../../utils/baseUrl';

const SearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({
    products: [],
    categories: [],
    users: [],
    orders: []
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { categories } = useSelector((state) => state.category);

  console.log("categories", categories);
  const { products } = useSelector((state) => state.product);
  const { allorders: orders } = useSelector((state) => state.order);
  const { users } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isOpen) {
      dispatch(getAllCategories());
      dispatch(fetchAllUsers());
      dispatch(fetchOrders());
      dispatch(getAllProducts());
      setTimeout(() => {
        document.getElementById('global-search-input')?.focus();
      }, 100);
    }
  }, [isOpen, dispatch]);

  const handleSearch = useCallback((searchTerm) => {
    setQuery(searchTerm);
    if (!searchTerm.trim()) {
      setResults({ products: [], categories: [], users: [], orders: [] });
      return;
    }

    const lowerQuery = searchTerm.toLowerCase();

    const filteredCategories = categories?.filter(c =>
      c.categoryName?.toLowerCase()?.includes(lowerQuery)
    )?.slice(0, 5) || [];

    const filteredProducts = products?.filter(p =>
      p.name?.toLowerCase()?.includes(lowerQuery)
    )?.slice(0, 5) || [];

    const filteredUsers = users?.filter(u =>
      u.firstname?.toLowerCase()?.includes(lowerQuery) ||
      u.lastname?.toLowerCase()?.includes(lowerQuery) ||
      u.email?.toLowerCase()?.includes(lowerQuery)
    )?.slice(0, 5) || [];

    const filteredOrders = orders?.filter(o =>
      o._id?.toLowerCase()?.includes(lowerQuery) ||
      o.userId?.firstname?.toLowerCase()?.includes(lowerQuery)
    )?.slice(0, 5) || [];

    setResults({
      categories: filteredCategories,
      products: filteredProducts,
      users: filteredUsers,
      orders: filteredOrders
    });
  }, [categories, products, users, orders]);

  const navigateTo = (path) => {
    navigate(path);
    onClose();
    setQuery('');
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const hasResults = results.products.length > 0 ||
    results.categories.length > 0 ||
    results.users.length > 0 ||
    results.orders.length > 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] sm:pt-[15vh] px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-white rounded-[4px] shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Search Input Bar */}
        <div className="flex items-center px-6 py-5 border-b border-gray-100 bg-gray-50/30">
          <Search size={22} className="text-primary mr-4" />
          <input
            id="global-search-input"
            type="text"
            placeholder="Search for products, categories, orders or users..."
            className="flex-1 bg-transparent border-none outline-none text-lg text-gray-800 placeholder-gray-400 font-medium"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-4 custom-scrollbar">
          {!query.trim() ? (
            <div className="py-12 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={28} className="text-gray-300" />
              </div>
              <h3 className="text-textPrimary font-bold text-lg">Search the entire admin</h3>
              <p className="text-textSecondary text-sm mt-1">Start typing to find what you're looking for</p>
            </div>
          ) : !hasResults ? (
            <div className="py-12 text-center">
              <h3 className="text-textPrimary font-bold text-lg">No matches found</h3>
              <p className="text-textSecondary text-sm mt-1">We couldn't find anything matching "{query}"</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Categories Section */}
              {results.categories.length > 0 && (
                <div>
                  <h4 className="px-3 text-sm font-[600] capitalize text-primary mb-3 flex items-center gap-2">
                    <Folder size={12} /> Categories
                  </h4>
                  <div className="space-y-1">
                    {results.categories.map((cat) => (
                      <button
                        key={cat._id}
                        onClick={() => navigateTo('/admin/categories')}
                        className="w-full flex items-center justify-between p-3 rounded-[4px] hover:bg-green-50 group transition-all"
                      >
                        <div className="flex items-center gap-3 text-left">
                          <div className="w-10 h-10 rounded-[4px] bg-gray-50 flex-shrink-0 border border-gray-100">
                            <img src={`${IMAGE_URL}/${cat?.categoryImage?.public_id}`} alt="" className="w-full h-full object-cover rounded-[4px]" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-700">{cat?.categoryName}</p>
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-gray-300 group-hover:text-primary transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Products Section */}
              {results.products.length > 0 && (
                <div>
                  <h4 className="px-3 text-sm font-[600] capitalize text-primary mb-3 flex items-center gap-2">
                    <ShoppingBag size={12} /> Products
                  </h4>
                  <div className="space-y-1">
                    {results.products.map((prod) => (
                      <button
                        key={prod._id}
                        onClick={() => navigateTo(`/admin/products`)}
                        className="w-full flex items-center justify-between p-3 rounded-[4px] hover:bg-green-50 group transition-all"
                      >
                        <div className="flex items-center gap-3 text-left overflow-hidden">
                          <div className="w-10 h-10 rounded-[4px] bg-gray-50 flex-shrink-0 border border-gray-100">
                            <img src={`${IMAGE_URL}/${prod.images?.[0]?.public_id}`} alt="" className="w-full h-full object-cover rounded-[4px]" />
                          </div>
                          <div className="truncate">
                            <p className="text-sm font-bold text-textPrimary truncate">{prod.name}</p>
                            <p className="text-[10px] text-textSecondary font-medium uppercase tracking-wider">${prod.weighstWise?.[0]?.price || '0.00'}</p>
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-gray-300 group-hover:text-primary transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Users Section */}
              {results.users.length > 0 && (
                <div>
                  <h4 className="px-3 text-sm font-[600] capitalize text-primary mb-3 flex items-center gap-2">
                    <User size={12} /> Users
                  </h4>
                  <div className="space-y-1">
                    {results.users.map((u) => (
                      <button
                        key={u._id}
                        onClick={() => navigateTo('/admin/users')}
                        className="w-full flex items-center justify-between p-3 rounded-[4px] hover:bg-green-50 group transition-all"
                      >
                        <div className="flex items-center gap-3 text-left">
                          <div className="w-8 h-8 rounded-full bg-green-50 text-primary flex items-center justify-center font-bold text-xs border border-primary uppercase">
                            {u.firstname?.charAt(0)}{u.lastname?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-textPrimary">{u.firstname} {u.lastname}</p>
                            <p className="text-[11px] text-textSecondary font-medium tracking-tight">{u.email}</p>
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-gray-300 group-hover:text-primary transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Orders Section */}
              {results.orders.length > 0 && (
                <div>
                  <h4 className="px-3 text-sm font-[600] capitalize text-primary mb-3 flex items-center gap-2">
                    <List size={12} /> Orders
                  </h4>
                  <div className="space-y-1">
                    {results.orders.map((order) => (
                      <button
                        key={order._id}
                        onClick={() => navigateTo(`/admin/orders/${order._id}`)}
                        className="w-full flex items-center justify-between p-3 rounded-[4px] hover:bg-green-50 group transition-all"
                      >
                        <div className="flex items-center gap-3 text-left font-medium">
                          <div className="p-2 rounded-[4px] bg-green-50 text-primary border border-green-100">
                            <Hash size={14} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-textPrimary uppercase">Order #{order._id.slice(-6)}</p>
                            <p className="text-[10px] text-textSecondary font-medium">By {order.userId?.firstname || 'Guest'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-primary">${order.totalAmount?.toFixed(2)}</span>
                          <ChevronRight size={16} className="text-gray-300 group-hover:text-primary transition-colors" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
