import React from 'react';
import { FiShoppingCart } from 'react-icons/fi';

const AdminLoader = ({
    message = "Loading...",
    icon: Icon = FiShoppingCart,
    minHeight = "min-h-[60vh]"
}) => {
    return (
        <div className={`flex flex-col items-center justify-center ${minHeight} gap-4`}>
            <div className="relative w-16 h-16">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Icon className="text-primary animate-pulse" size={24} />
                </div>
            </div>
            {message && (
                <p className="text-textSecondary font-medium animate-pulse">{message}</p>
            )}
        </div>
    );
};

export default AdminLoader;
