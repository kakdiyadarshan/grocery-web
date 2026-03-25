import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../redux/slice/auth.slice';
// import LogoutModal from './LogoutModal';
import { FiHome, FiUsers, FiShoppingBag, FiPackage, FiMail, FiSliders, FiDollarSign, FiLogOut, FiX, FiGrid, FiHelpCircle, FiShield, FiFileText, FiCalendar, FiTag, FiStar, FiLayers, FiImage } from 'react-icons/fi';
import { MdCategory } from 'react-icons/md';
import { LuNotebookPen ,LuNotebookTabs } from "react-icons/lu";
import { FaRegBell } from "react-icons/fa";

const Sidebar = ({ isOpen, onClose }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogoutClick = () => {
        setIsLogoutModalOpen(true);
    };

    const handleLogoutConfirm = () => {
        setIsLoading(true);
        dispatch(logout());
        setIsLoading(false);
        setIsLogoutModalOpen(false);
        navigate('/admin');
    };
    const menuItems = [
        { name: 'Dashboard', icon: <FiHome />, path: '/admin/dashboard' },
        { name: 'Products', icon: <FiPackage />, path: '/admin/products' },
        { name: 'Category', icon: <MdCategory  />, path: '/admin/categories' },
        { name: 'Privacy Policy', icon: <FiFileText />, path: '/admin/privacy-policy' },
        { name: 'Blogs', icon: <LuNotebookPen />, path: '/admin/blogs' },
        { name: 'Blog Categories', icon: <LuNotebookTabs  />, path: '/admin/blog-categories' },
        { name: 'Subscribe', icon: <FaRegBell />, path: '/admin/subscribe' }
    ];

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 min-[600px]:hidden backdrop-blur-sm"
                    onClick={onClose}
                ></div>
            )}

            <aside
                className={`h-screen bg-white shadow-2xl fixed left-0 top-0 z-50 flex flex-col transition-all duration-300 border-r border-gray-100 font-jost 
                w-72 min-[600px]:w-20 lg:w-72
                ${isOpen ? 'translate-x-0' : '-translate-x-full'} min-[600px]:translate-x-0`}
            >
                {/* Brand Logo & Close Button - dark:border-gray-700 */}
                <div className="h-24 flex items-center justify-between px-8 min-[600px]:px-0 lg:px-8 border-b border-gray-50 min-[600px]:justify-center lg:justify-between">
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold text-textPrimary tracking-tight min-[600px]:hidden lg:block">Grocery<span className="text-primary">web.</span></h1>
                    </div>
                    {/* Close button for mobile */}
                    <button onClick={onClose} className="min-[600px]:hidden text-gray-500 hover:text-primary transition-colors">
                        <FiX size={24} />
                    </button>
                </div>

                {/* Navigation Menu */}
                <nav className="flex-1 overflow-y-auto py-8 px-4 min-[600px]:px-2 lg:px-4 no-scrollbar">
                    <ul className="space-y-2">
                        {menuItems.map((item, index) => (
                            <li key={index}>
                                <NavLink
                                    to={item.path}
                                    onClick={onClose} // Close sidebar on mobile when link is clicked
                                    className={({ isActive }) =>
                                        `flex items-center gap-4 px-4 py-3.5 rounded-md transition-all duration-300 group font-medium min-[600px]:justify-center lg:justify-start ${isActive
                                            ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                            : 'text-textSecondary hover:bg-primaryLight hover:text-primary'
                                        }`
                                    }
                                >
                                    <span className="text-xl transition-transform group-hover:scale-110 shrink-0">{item.icon}</span>
                                    <span className="min-[600px]:hidden lg:block">{item.name}</span>
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* User / Logout Section - dark:border-gray-700 */}
                <div className="p-6 border-t border-gray-50 min-[600px]:p-4 lg:p-2">
                    <button
                        onClick={handleLogoutClick}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-[4px] text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all duration-300 group min-[600px]:justify-center lg:justify-start min-[600px]:px-0 lg:px-4"
                    >
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-red-100 transition-colors shrink-0">
                            <FiLogOut className="text-lg" />
                        </div>
                        <div className="text-left min-[600px]:hidden lg:block">
                            <p className="text-sm font-semibold text-textPrimary group-hover:text-red-600">Logout</p>
                        </div>
                    </button>
                </div>
            </aside>
            {/* <LogoutModal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={handleLogoutConfirm}
                isLoading={isLoading}
            /> */}
        </>
    );
};

export default Sidebar;