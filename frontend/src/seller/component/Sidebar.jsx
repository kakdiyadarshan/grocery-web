import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../redux/slice/auth.slice';
import LogoutModal from '../../admin/component/LogoutModal';
import { FiHome, FiPackage, FiLogOut, FiX, FiChevronDown, FiShoppingCart } from 'react-icons/fi';
import { LuReceiptIndianRupee } from "react-icons/lu";
import { MdOutlineReviews } from "react-icons/md";
import { PiSealPercentLight } from "react-icons/pi";

const Sidebar = ({ isOpen, onClose }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [openDropdown, setOpenDropdown] = useState('');

    const handleLogoutClick = () => {
        setIsLogoutModalOpen(true);
    };

    const handleLogoutConfirm = () => {
        setIsLoading(true);
        dispatch(logout());
        setIsLoading(false);
        setIsLogoutModalOpen(false);
        navigate('/login');
    };

    const toggleDropdown = (name) => {
        setOpenDropdown(prev => prev === name ? '' : name);
    };

    const sellerMenuItems = [
        { name: 'Dashboard', icon: <FiHome />, path: '/seller/sellerdashboard' },
        { name: 'Orders', icon: <FiShoppingCart />, path: '/seller/orders' },
        { name: 'Transactions', icon: <LuReceiptIndianRupee />, path: '/seller/transactions' },
        { name: 'Products', icon: <FiPackage />, path: '/seller/products' },
        { name: 'Offers', icon: <PiSealPercentLight />, path: '/seller/offers' },
        { name: 'Reviews', icon: <MdOutlineReviews />, path: '/seller/reviews' },
    ];

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={onClose}
                ></div>
            )}

            <aside className={`h-screen bg-white fixed left-0 top-0 z-50 flex flex-col transition-all duration-300 border-r border-gray-100
 w-72 lg:w-72
 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
            >
                {/* Brand Logo & Close Button - */}
                <div className="h-20 flex items-center justify-between px-8 border-b border-gray-50">
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold text-textPrimary tracking-tight">
                            Seller <span className="text-primary">Panel.</span>
                        </h1>
                    </div>
                    {/* Close button for mobile */}
                    <button onClick={onClose} className="lg:hidden text-gray-500 hover:text-primary transition-colors">
                        <FiX size={24} />
                    </button>
                </div>

                {/* Navigation Menu */}
                <nav className="flex-1 overflow-y-auto py-4 px-4 no-scrollbar">
                    <ul className="space-y-2">
                        {sellerMenuItems.map((item, index) => (
                            <li key={index}>
                                {item.subItems ? (
                                    <div className="flex flex-col">
                                        <button
                                            onClick={() => toggleDropdown(item.name)}
                                            className={`flex justify-between items-center px-4 py-3.5 rounded-md transition-all duration-300 group font-medium w-full ${openDropdown === item.name
                                                ? 'bg-primaryLight text-primary'
                                                : 'text-textSecondary hover:bg-primaryLight hover:text-primary'
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <span className="text-xl transition-transform group-hover:scale-110 shrink-0">{item.icon}</span>
                                                <span className="">{item.name}</span>
                                            </div>
                                            <FiChevronDown className={`transition-transform duration-300 ${openDropdown === item.name ? 'rotate-180' : ''}`} />
                                        </button>
                                        <div className={`overflow-hidden transition-all duration-300 ${openDropdown === item.name ? 'max-h-max mt-1' : 'max-h-0'}`}>
                                            <ul className="space-y-1 ml-4 border-l-2 border-gray-100 pl-4 py-1">
                                                {item.subItems.map((subItem, idx) => (
                                                    <li key={idx}>
                                                        <NavLink
                                                            to={subItem.path}
                                                            onClick={onClose}
                                                            className={({ isActive }) =>
                                                                `flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-300 group font-medium text-sm ${isActive
                                                                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                                                                    : 'text-textSecondary hover:bg-primaryLight hover:text-primary'
                                                                }`
                                                            }
                                                        >
                                                            <span className="text-lg transition-transform group-hover:scale-110 shrink-0">{subItem.icon}</span>
                                                            <span className="">{subItem.name}</span>
                                                        </NavLink>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                ) : (
                                    <NavLink
                                        to={item.path}
                                        onClick={onClose}
                                        className={({ isActive }) =>
                                            `flex items-center gap-4 px-4 py-3.5 rounded-md transition-all duration-300 group font-medium ${isActive
                                                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                                : 'text-textSecondary hover:bg-primaryLight hover:text-primary'
                                            }`
                                        }
                                    >
                                        <span className="text-xl transition-transform group-hover:scale-110 shrink-0">{item.icon}</span>
                                        <span className="">{item.name}</span>
                                    </NavLink>
                                )}
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* User / Logout Section - */}
                <div className="p-6 border-t border-gray-50">
                    <button
                        onClick={handleLogoutClick}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-[4px] text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all duration-300 group"
                    >
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-red-100 transition-colors shrink-0">
                            <FiLogOut className="text-lg" />
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-semibold text-textPrimary group-hover:text-red-600">Logout</p>
                        </div>
                    </button>
                </div>
            </aside>
            <LogoutModal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={handleLogoutConfirm}
                isLoading={isLoading}
            />
        </>
    );
};

export default Sidebar;