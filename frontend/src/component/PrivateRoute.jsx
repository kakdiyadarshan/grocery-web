import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = () => {
    const { isAuthenticated, loading } = useSelector((state) => state.auth);

    // Only show the full-page spinner if we're loading AND we aren't authenticated yet.
    // This allows authenticated users to stay on their current page while data refreshes in the background.
    if (loading && !isAuthenticated) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]"></div>
            </div>
        );
    }

    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
