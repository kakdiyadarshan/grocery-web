import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    ShoppingBag,
    ShoppingCart,
    Users,
    Settings,
    X,
    Tag,
    LogOut,
    Store,
    PieChart,
    ChevronRight
} from 'lucide-react';

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
    const location = useLocation();

    const navItems = [
        {
            title: 'Overview', items: [
                { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
                { name: 'Analytics', path: '/admin/analytics', icon: <PieChart size={20} /> },
            ]
        },
        {
            title: 'Management', items: [
                { name: 'Products', path: '/admin/products', icon: <ShoppingBag size={20} /> },
                { name: 'Categories', path: '/admin/categories', icon: <Tag size={20} /> },
                { name: 'Orders', path: '/admin/orders', icon: <ShoppingCart size={20} /> },
                { name: 'Customers', path: '/admin/customers', icon: <Users size={20} /> },
                { name: 'Vendors', path: '/admin/vendors', icon: <Store size={20} /> },
            ]
        },
        {
            title: 'System', items: [
                { name: 'Settings', path: '/admin/settings', icon: <Settings size={20} /> },
            ]
        }
    ];

    return (
        <>
            {isSidebarOpen && (
                <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300" onClick={() => setIsSidebarOpen(false)}/>
            )}

            <aside className={`fixed top-0 left-0 z-50 flex flex-col h-screen w-[280px] bg-white border-r border-gray-100 shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-transform duration-300 cubic-bezier(0.4, 0, 0.2, 1) lg:static lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center justify-between h-20 px-6">
                    <Link to="/admin/dashboard" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-700 rounded-md flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                            <ShoppingBag className="text-white" size={22} strokeWidth={2.5} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Grocery</span>
                            <span className="text-[10px] font-semibold text-green-600 uppercase tracking-widest">Workspace</span>
                        </div>
                    </Link>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="p-2 text-gray-400 bg-gray-50 rounded-xl lg:hidden hover:bg-red-50 hover:text-red-500 transition-colors active:scale-95"
                    >
                        <X size={20} strokeWidth={2.5} />
                    </button>
                </div>

                {/* Sidebar Navigation */}
                <div className="flex-1 px-4 py-4 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    <div className="space-y-8">
                        {navItems.map((section, idx) => (
                            <div key={idx}>
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider pl-3 mb-3">
                                    {section.title}
                                </p>
                                <ul className="space-y-1">
                                    {section.items.map((item) => {
                                        const isActive = location.pathname.includes(item.path);
                                        return (
                                            <li key={item.name}>
                                                <Link
                                                    to={item.path}
                                                    onClick={() => setIsSidebarOpen(false)}
                                                    className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 ${isActive
                                                            ? 'bg-gradient-to-r from-green-500/10 to-transparent text-green-700 font-semibold'
                                                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-medium'
                                                        }`}
                                                >
                                                    {isActive && (
                                                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-green-500 rounded-r-full"></span>
                                                    )}
                                                    <div className="flex items-center gap-3">
                                                        <div className={`transition-colors duration-200 ${isActive ? 'text-green-600' : 'text-gray-400 group-hover:text-gray-700'}`}>
                                                            {item.icon}
                                                        </div>
                                                        <span className="text-sm">{item.name}</span>
                                                    </div>
                                                    {isActive && <ChevronRight size={16} className="text-green-500" />}
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar Footer Logout */}
                <div className="p-4 bg-gray-50/50 mt-auto">
                    <button className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors duration-200 active:scale-[0.98]">
                        <LogOut size={18} strokeWidth={2.5} />
                        <span>Log Out</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
