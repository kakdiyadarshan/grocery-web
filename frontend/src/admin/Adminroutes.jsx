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
import BlogAdmin from './pages/BlogAdmin'
import BlogCategoryAdmin from './pages/BlogCategoryAdmin'
import Subscribe from './pages/Subscribe'
import Termscondition from './pages/Termscondition'
import Offers from './pages/Offer'
import Faqs from './pages/Faqs'
import Profile from './pages/Profile'
import OfferBanners from './pages/OfferBanners'
import CreateOfferBanner from './pages/CreateOfferBanner'
import Banners from './pages/Banners'
import CreateBanner from './pages/CreateBanner'

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
                    <Route path="terms-condition" element={<Termscondition />} />
                    <Route path="blogs" element={<BlogAdmin />} />
                    <Route path="subscribe" element={<Subscribe />} />
                    <Route path="blog-categories" element={<BlogCategoryAdmin />} />
                    <Route path="offers" element={<Offers />} />
                    <Route path="faqs" element={<Faqs />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="banners" element={<Banners />} />
                    <Route path="banners/create" element={<CreateBanner />} />
                    <Route path="banners/edit/:id" element={<CreateBanner />} />
                    <Route path="offerbanners/create" element={<CreateOfferBanner />} />
                    <Route path="offerbanners/edit/:id" element={<CreateOfferBanner />} />
                    <Route path="offerbanners" element={<OfferBanners />} />

                    <Route path="settings" element={<div className="p-6 h-full flex items-center justify-center text-gray-400 font-medium">Coming Soon</div>} />

                    <Route path="contact-us" element={<ContactUs />} />
                </Route>
            </Route>
        </Routes>
    )
}

export default Adminroutes
