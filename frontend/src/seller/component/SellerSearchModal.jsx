import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Search, X, ShoppingBag, Folder, User, List,
  ArrowRight, Clock, Hash, ChevronRight
} from 'lucide-react';
import { fetchSellerOrders } from '../../redux/slice/order.slice';
import { getAllProducts } from '../../redux/slice/product.slice';
import { IMAGE_URL } from '../../utils/baseUrl';

const SellerSearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({
    products: [],
    orders: []
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { products } = useSelector((state) => state.product);
  const { allorders: orders } = useSelector((state) => state.order);

  useEffect(() => {
    if (isOpen && user?._id) {
      dispatch(fetchSellerOrders());
      dispatch(getAllProducts({ seller: user._id, paginate: false }));
      setTimeout(() => {
        document.getElementById('seller-search-input')?.focus();
      }, 100);
    }
  }, [isOpen, dispatch, user?._id]);

  const handleSearch = useCallback((searchTerm) => {
    setQuery(searchTerm);
    if (!searchTerm.trim()) {
      setResults({ products: [], orders: [] });
      return;
    }

    const lowerQuery = searchTerm.toLowerCase();

    const filteredProducts = products?.filter(p =>
      p.name?.toLowerCase()?.includes(lowerQuery)
    )?.slice(0, 5) || [];

    const filteredOrders = orders?.filter(o =>
      o._id?.toLowerCase()?.includes(lowerQuery) ||
      o.userId?.firstname?.toLowerCase()?.includes(lowerQuery) ||
      o.userId?.lastname?.toLowerCase()?.includes(lowerQuery) ||
      o.items?.some(item => item.productId?.name?.toLowerCase()?.includes(lowerQuery))
    )?.slice(0, 5) || [];

    setResults({
      products: filteredProducts,
      orders: filteredOrders
    });
  }, [products, orders]);

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

  const hasResults = results.products.length > 0 || results.orders.length > 0;

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
            id="seller-search-input"
            type="text"
            placeholder="Search for your products or orders..."
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
              <h3 className="text-textPrimary font-bold text-lg">Search Products & Orders</h3>
              <p className="text-textSecondary text-sm mt-1">Start typing to find specific orders or products</p>
            </div>
          ) : !hasResults ? (
            <div className="py-12 text-center">
              <h3 className="text-textPrimary font-bold text-lg">No matches found</h3>
              <p className="text-textSecondary text-sm mt-1">We couldn't find anything matching "{query}"</p>
            </div>
          ) : (
            <div className="space-y-6">
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
                        onClick={() => navigateTo(`/seller/products/view/${prod._id}`)}
                        className="w-full flex items-center justify-between p-3 rounded-[4px] hover:bg-green-50 group transition-all"
                      >
                        <div className="flex items-center gap-3 text-left overflow-hidden">
                          <div className="w-10 h-10 rounded-[4px] bg-gray-50 flex-shrink-0 border border-gray-100">
                             <img src={prod.images?.[0]?.url || `${IMAGE_URL}/${prod.images?.[0]?.public_id}`} alt="" className="w-full h-full object-cover rounded-[4px]" />
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
                        onClick={() => navigateTo(`/seller/orders/${order._id}`)}
                        className="w-full flex items-center justify-between p-3 rounded-[4px] hover:bg-green-50 group transition-all"
                      >
                        <div className="flex items-center gap-3 text-left font-medium">
                          <div className="p-2 rounded-[4px] bg-green-50 text-primary border border-green-100">
                            <Hash size={14} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-textPrimary uppercase">Order #{order._id.slice(-6)}</p>
                            <p className="text-[10px] text-textSecondary font-medium">
                              By {order.userId?.firstname || 'Guest'} | {order.items?.length} items
                            </p>
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

export default SellerSearchModal;
