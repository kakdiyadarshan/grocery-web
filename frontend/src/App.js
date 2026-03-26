import { useDispatch } from 'react-redux';
import './App.css';
import { Toaster } from 'sonner';
import Home from './pages/Home';
import Wishlist from './pages/Wishlist';
import Cart from './pages/Cart';
import { Route, Routes } from 'react-router-dom';
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
import InvoicePage from './pages/InvoicePage';
import Shop from './pages/Shop';


import Layout from './component/Layout';
import OrderCompleted from './pages/OrderCompleted';
import OrderTracking from './pages/OrderTracking';
import Termscondition from './pages/Termscondition';
import UserProfile from './pages/UserProfile';

function App() {
  const dispatch = useDispatch();


  return (
    <>
      <Toaster richColors position="top-center" />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/aboutus" element={<About />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogDetails />} />
          <Route path="/faqs" element={<FAQs />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-condition" element={<Termscondition />} />
          <Route path="/shipping-policy" element={<ShippingPolicy />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/product-details/:id" element={<ProductDetail />} />
          <Route path='/checkout' element={<CheckOut />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/my-order" element={<MyOrder />} />
          <Route path='/order-tracking' element={<OrderTracking />} />
          <Route path='/order-completed' element={<OrderCompleted />} />
          <Route path='/invoice' element={<InvoicePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/category" element={<Shop />} />
          <Route path="/profile" element={<UserProfile />} />
          {/* <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} /> */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<ForgotPassword />} />
        <Route path="/admin/*" element={<Adminroutes />} />
      </Routes>
    </>
  );
}

export default App;

