import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './Layout'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import { useSelector } from 'react-redux'
import PrivateRoute from './PrivateRoute'
import DataTable from './component/DataTable'
import Product from './pages/Product'
import Category from './pages/Category'
import PrivacyPolicy from './pages/PrivacyPolicy'
import ContactUs from './pages/ContactUs'

const Adminroutes = () => {
    const { isAuthenticated, user } = useSelector((state) => state.auth);

    return (
        <Routes>
            <Route
                path="/"
                element={
                    isAuthenticated && user?.role === 'admin'
                        ? <Navigate to="/admin/dashboard" replace />
                        : <Login />
                }
            />
            <Route element={<PrivateRoute allowedRoles={['admin']} />}>
                <Route element={<Layout />}>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="categories" element={<Category />} />
                    <Route path="products" element={<Product />} />
                    <Route path="privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="contact-us" element={<ContactUs />} />
                </Route>
            </Route>
        </Routes>
    )
}

export default Adminroutes
