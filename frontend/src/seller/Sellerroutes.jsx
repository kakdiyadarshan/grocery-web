import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PrivateRoute from '../component/PrivateRoute';

const SellerDashboard = () => (
    <div className="p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800">Welcome to Seller Dashboard</h1>
        <p className="mt-2 text-gray-500">Your store metrics will appear here.</p>
    </div>
);

const Sellerroutes = () => {
    return (
        <Routes>
            <Route element={<PrivateRoute allowedRoles={['seller']} />}>
                <Route path="sellerdashboard" element={<SellerDashboard />} />
                {/* Additional seller routes go here */}
            </Route>
        </Routes>
    );
};

export default Sellerroutes;
