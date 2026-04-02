import { useDispatch, useSelector } from 'react-redux';
import './App.css';
import { Toaster } from 'sonner';
import Home from './pages/Home';
import Wishlist from './pages/Wishlist';
import Cart from './pages/Cart';
import { Route, Routes, Navigate } from 'react-router-dom';
import Adminroutes from './admin/Adminroutes';
import Login from './component/Login';
import Register from './component/Register';
import ForgotPassword from './component/ForgotPassword';
import ContactUs from './pages/ContactUs';
import FAQs from './pages/FAQs';
import PrivacyPolicy from './pages/PrivacyPolicy';
import ShippingPolicy from './pages/ShippingPolicy';
import About from './pages/About';
import Blog from './pages/Blog';
import BlogDetails from './pages/BlogDetails';
import ProductDetail from './pages/ProductDetail';
import CheckOut from './pages/CheckOut';
import MyOrder from './pages/MyOrder';
import Shop from './pages/Shop';

import Layout from './component/Layout';
import OrderCompleted from './pages/OrderCompleted';
import OrderTracking from './pages/OrderTracking';
import Termscondition from './pages/Termscondition';
import UserProfile from './pages/UserProfile';

import PrivateRoute from './component/PrivateRoute';

function App() {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <>
      <Toaster richColors position="bottom-right" expand={true} />
      <Routes>
        {/* Layout Wrapper for Shared Components (Header/Footer) */}
        <Route element={<Layout />}>

          {/* --- PUBLIC ROUTES (Accessible to Everyone) --- */}
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product-details/:id" element={<ProductDetail />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/aboutus" element={<About />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogDetails />} />
          <Route path="/faqs" element={<FAQs />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-condition" element={<Termscondition />} />
          <Route path="/shipping-policy" element={<ShippingPolicy />} />

          {/* --- PRIVATE ROUTES (Authenticated Users Only) --- */}
          <Route element={<PrivateRoute />}>
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<CheckOut />} />
            <Route path="/my-order" element={<MyOrder />} />
            <Route path="/order-tracking/:id" element={<OrderTracking />} />
            <Route path="/order-completed" element={<OrderCompleted />} />
          </Route>

        </Route>

        {/* --- GUEST-ONLY ROUTES (Non-Authenticated Users Only) --- */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/" replace /> : <Register />}
        />
        <Route
          path="/forgot-password"
          element={isAuthenticated ? <Navigate to="/" replace /> : <ForgotPassword />}
        />

        {/* --- ADMIN ROUTES --- */}
        <Route path="/admin/*" element={<Adminroutes />} />

        {/* Catch-all Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
