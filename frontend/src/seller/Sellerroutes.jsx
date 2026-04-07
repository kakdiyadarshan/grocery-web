import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PrivateRoute from '../component/PrivateRoute';
import Layout from './pages/Layout';
import SellerDashboard from './pages/SellerDashboard';
import Product from './pages/Product';
import ProductDetailsSeller from './pages/ProductDetailsSeller';
import Profile from './pages/Profile';
import Reviews from './pages/Reviews';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';

const Sellerroutes = () => {
    return (
        <Routes>
            <Route element={<PrivateRoute allowedRoles={['seller']} />}>
                <Route path="/" element={<Layout />} >
                    <Route index element={<Navigate to="sellerdashboard" replace />} />
                    <Route path="sellerdashboard" element={<SellerDashboard />} />
                    <Route path="orders" element={<Orders />} />
                    <Route path="orders/:id" element={<OrderDetails />} />
                    <Route path="products" element={<Product />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="products/view/:id" element={<ProductDetailsSeller />} />
                    <Route path="transactions" element={<SellerDashboard />} />
                    <Route path="reviews" element={<Reviews />} />
                </Route>
            </Route>
        </Routes>
    );
};

export default Sellerroutes;
