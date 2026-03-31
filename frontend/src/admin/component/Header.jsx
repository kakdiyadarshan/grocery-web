import React, { useEffect, useState } from 'react';
import { Menu, Bell, Search, ChevronDown, MessageSquare, Maximize } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { fetchUserProfile } from '../../redux/slice/auth.slice';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications, markNotificationSeen, clearAllNotifications } from '../../redux/slice/notifications.slice';
import { IMAGE_URL } from '../../utils/baseUrl';
import { FiBell, FiUser, FiX, FiShoppingCart, FiTrash2, FiCheck, FiStar } from 'react-icons/fi';
import { FaUserCheck } from "react-icons/fa";
import { RiShoppingBag4Line } from "react-icons/ri";
import { FaStar } from "react-icons/fa6";
import SearchModal from './SearchModal';
import { initSocketConnection, disconnectSocket } from '../../utils/socketService';

const Header = ({ onToggleSidebar }) => {

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading } = useSelector((state) => state.auth);
  const { items: notifications } = useSelector((state) => state.notifications);
  const unseenNotifications = notifications.filter(n => !n.seen);

  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullScreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullScreen(false);
      }
    }
  };

  useEffect(() => {
    dispatch(fetchUserProfile());
    dispatch(fetchNotifications());
  }, [dispatch]);

  useEffect(() => {
    if (user?._id) {
      const token = localStorage.getItem('token');
      initSocketConnection(dispatch, user._id, token);
    }
    return () => {
      disconnectSocket();
    };
  }, [dispatch, user?._id]);

  useEffect(() => {
    // Shortcut listener for Searching
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Close notifications on click outside
    const handleClickOutside = (e) => {
      if (isNotificationOpen && !e.target.closest('.notification-container')) {
        setIsNotificationOpen(false);
      }
    };
    window.addEventListener('click', handleClickOutside);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('click', handleClickOutside);
    };
  }, [isNotificationOpen]);

  const handleMarkSeen = (e, id) => {
    e.stopPropagation();
    dispatch(markNotificationSeen(id));
  };

  const handleClearAll = (e) => {
    e.stopPropagation();
    dispatch(clearAllNotifications());
  };

  const handleNotificationClick = (n) => {
    dispatch(markNotificationSeen(n._id));
    setIsNotificationOpen(false);
    if (n.payload?.orderId || n.type === 'new_order' || n.type === 'order_status' || n.type === 'order_completed') {
      navigate(`/admin/orders/${n.payload?.orderId}`);
    }
    if (n.type === 'new_review') {
      navigate(`/admin/reviews`);
    }
    if (n.type === 'user_register') {
      navigate(`/admin/users`);
    }
  };

  const getNotificationStyle = (type) => {
    switch (type?.toLowerCase()) {
      case 'new_order':
      case 'order':
      case 'order_status':
      case 'order_completed':
        return { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: RiShoppingBag4Line };
      case 'user_register':
        return { bg: 'bg-blue-50', text: 'text-blue-600', icon: FaUserCheck };
      case 'new_review':
        return { bg: 'bg-amber-50', text: 'text-amber-600', icon: FaStar };
      default:
        return { bg: 'bg-gray-50', text: 'text-gray-600', icon: FiBell };
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between h-20 px-4 backdrop-blur-xl bg-white border-b border-gray-100/50 shadow-[0_4px_30px_rgba(0,0,0,0.02)] sm:px-6 lg:px-8 transition-all duration-300">
        <div className="flex items-center gap-3 sm:gap-6 flex-1">
          <button onClick={onToggleSidebar} className="p-2.5 text-gray-500 bg-gray-50/50 rounded-xl lg:hidden hover:bg-green-50 hover:text-green-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/30 active:scale-95">
            <Menu size={22} strokeWidth={2.5} />
          </button>

          <div className="hidden lg:flex items-center group cursor-pointer" onClick={() => setIsSearchModalOpen(true)}>
            <div className="relative flex items-center w-80 xl:w-96">
              <Search size={18} className="absolute left-4 text-gray-400 group-focus-within:text-primary transition-colors duration-200" />
              <input
                type="text"
                readOnly
                placeholder="Search anything..."
                className="w-full bg-gray-50/50 border border-gray-200/80 rounded-md py-2.5 pl-11 pr-4 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-[#228B22]/10 transition-all duration-300 cursor-pointer"
              />
              <div className="absolute right-3 px-2 py-0.5 rounded border border-gray-200 bg-white text-[10px] font-medium text-gray-400">
                Ctrl K
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-5">
          <div className="hidden sm:flex items-center gap-2 pr-4 border-r border-gray-100">
            <button onClick={toggleFullScreen} className="p-2.5 text-gray-500 rounded-xl hover:bg-green-50 hover:text-green-600 transition-all duration-200 focus:outline-none">
              <Maximize size={20} />
            </button>
            <div className="relative notification-container">
              <button
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className={`p-2.5 rounded-xl transition-all duration-200 focus:outline-none relative ${isNotificationOpen ? 'bg-green-50 text-green-600 ring-2 ring-green-500/20' : 'text-gray-500 hover:bg-green-50 hover:text-green-600'}`}
              >
                <FiBell size={20} />
                {unseenNotifications.length > 0 && (
                  <span className="absolute top-2.5 right-2.5 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border-2 border-white"></span>
                  </span>
                )}
              </button>

              {isNotificationOpen && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-[4px] shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-200 transform origin-top-right">
                  <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between bg-white">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                      Notifications
                      <span className="px-2 py-0.5 bg-green-50 text-green-600 text-[10px] rounded-[4px]">{unseenNotifications.length} New</span>
                    </h3>
                    {unseenNotifications.length > 0 && (
                      <button
                        onClick={handleClearAll}
                        className="text-[11px] font-bold text-primary hover:text-primaryHover transition-colors flex items-center gap-1"
                      >
                        <FiCheck size={12} />
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                    {unseenNotifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                          <FiBell size={32} className="opacity-20" />
                        </div>
                        <p className="text-textPrimary text-sm font-medium">No notifications yet</p>
                        <p className="text-textSecondary text-xs mt-1">We'll notify you when something happens</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-50">
                        {unseenNotifications.map((n) => {
                          const style = getNotificationStyle(n.type);
                          return (
                            <div
                              key={n._id || n.createdAt}
                              onClick={() => handleNotificationClick(n)}
                              className={`px-5 py-4 hover:bg-green-50 transition-all cursor-pointer flex gap-4 group relative items-start ${!n.seen ? 'bg-green-50/20' : ''}`}
                            >
                              <div className={`p-2 rounded-[4px] shrink-0 ${style.bg} ${style.text} group-hover:scale-110 transition-transform duration-200`}>
                                <style.icon size={18} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <p className={`text-sm leading-snug line-clamp-2 ${!n.seen ? 'font-bold text-gray-900' : 'font-medium text-gray-600'}`}>
                                    {n.message}
                                  </p>
                                  {!n.seen && <span className="w-2 h-2 rounded-full bg-primary shrink-0"></span>}
                                </div>
                                <p className="text-[11px] text-textSecondary mt-1.5 font-medium flex items-center gap-1">
                                  {new Date(n.createdAt).toLocaleString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })}
                                </p>
                              </div>
                              <button
                                onClick={(e) => handleMarkSeen(e, n._id)}
                                className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-all self-start"
                                title="Dismiss"
                              >
                                <FiX size={14} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {unseenNotifications.length > 0 && (
                    <div className="px-5 py-3 bg-gray-50/50 border-t border-gray-50 text-center">
                      <button className="text-xs font-bold text-gray-500 hover:text-primary transition-colors">
                        View All Activity
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <Link to={'/admin/profile'} className="flex items-center gap-3 pl-1 md:pl-2 pr-1 rounded-full transition-all">
            <div className="text-right hidden lg:block">
              <p className="text-sm font-bold text-textPrimary leading-tight">
                {user?.firstname} {user?.lastname}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-primary font-bold">
                {user?.role}
              </p>
            </div>

            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-tr from-primary to-primaryLight p-0.5">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                {user?.photo ? (
                  <img src={`${IMAGE_URL}/${user?.photo?.public_id}`} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <FiUser className="text-primary" size={20} />
                )}
              </div>
            </div>
          </Link>
        </div>
      </header>

      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />
    </>
  )
}

export default Header;