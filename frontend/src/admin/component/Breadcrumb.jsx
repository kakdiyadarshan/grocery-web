import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { FiChevronRight, FiHome } from 'react-icons/fi';

const Breadcrumb = () => {
    const location = useLocation();

    if (
        location.pathname === '/admin/dashboard' ||
        location.pathname === '/admin' ||
        location.pathname === '/admin/' ||
        location.pathname === '/seller/dashboard' ||
        location.pathname === '/seller' ||
        location.pathname === '/seller/'
    ) {
        return null;
    }

    const pathnames = location.pathname.split('/').filter((x) => x);

    const routeNameMap = {
        admin: 'Home',
        seller: 'Home',
        dashboard: 'Dashboard',
        users: 'Users',
        products: 'Products',
        orders: 'Orders',
        settings: 'Settings',
        category: 'Category',
        subcategory: 'Sub Category',
        privacypolicy: 'Privacy Policy',
        appointments: 'Appointments',
        profile: 'Profile',
        offers: 'Offers',
        'offer-banners': 'Offer Banners',
        'product-sliders': 'Product Sliders',
        instagramfeed: 'Instagram Feed',
        banners: 'Banners',
        stocks: 'Stocks',
        rentals: 'Rentals',
        transactions: 'Transactions',
        reviews: 'Reviews',
        contact: 'Contact',
        faqs: 'FAQ',
        termscondition: 'Terms & Conditions',
        element: 'Elements',
        create: 'Create',
        edit: 'Edit'
    };

    const isId = (segment) => segment.length > 20;

    const getDisplayName = (segment, index, array) => {
        if (index > 0 && array[index - 1] === 'edit' && isId(segment)) {
            return 'Edit';
        }

        if (isId(segment)) {
            if (index > 0 && array[index - 1] === 'view') return 'View Details';
            return 'Details';
        }

        return routeNameMap[segment] ||
            segment.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    return (
        <nav className="flex justify-start mt-1" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
                {pathnames.map((value, index) => {

                    if ((value === 'edit' || value === 'view') && index + 1 < pathnames.length && isId(pathnames[index + 1])) {
                        return null;
                    }

                    const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                    const isLast = index === pathnames.length - 1;
                    const displayName = getDisplayName(value, index, pathnames);

                    if (value === 'admin') {
                        return (
                            <li key={to} className="inline-flex items-center">
                                <Link
                                    to="/admin/dashboard"
                                    className="inline-flex items-center text-sm font-medium text-textPrimary hover:text-primaryHover transition-colors"
                                >
                                    <FiHome className="mr-2" size={16} />
                                    <span className="hidden sm:inline">Dashboard</span>
                                </Link>
                            </li>
                        );
                    }
                    if (value === 'seller') {
                        return (
                            <li key={to} className="inline-flex items-center">
                                <Link
                                    to="/seller/dashboard"
                                    className="inline-flex items-center text-sm font-medium text-textPrimary hover:text-primaryHover transition-colors"
                                >
                                    <FiHome className="mr-2" size={16} />
                                    <span className="hidden sm:inline">Dashboard</span>
                                </Link>
                            </li>
                        );
                    }

                    return (
                        <li key={to}>
                            <div className="flex items-center">
                                <FiChevronRight className="w-4 h-4 text-gray-400 mx-1" />

                                {isLast ? (
                                    <span className="text-sm font-medium text-gray-500 truncate max-w-[150px] sm:max-w-none">
                                        {displayName}
                                    </span>
                                ) : (
                                    <Link
                                        to={to}
                                        className="text-sm font-medium text-gray-700 hover:text-primaryHover transition-colors"
                                    >
                                        {displayName}
                                    </Link>
                                )}
                            </div>
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

export default Breadcrumb;