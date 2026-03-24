import { useDispatch } from 'react-redux';
import './App.css';
import { Toaster } from 'sonner';
import Home from './pages/Home';
import { Route, Routes } from 'react-router-dom';
import Adminroutes from './admin/Adminroutes';
import ContactUs from './pages/ContactUs';
import FAQs from './pages/FAQs';
import PrivacyPolicy from './pages/PrivacyPolicy';
import ShippingPolicy from './pages/ShippingPolicy';
import About from './pages/About';

function App() {
  const dispatch = useDispatch();


  return (
    <>
      <Toaster richColors position="top-center" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/about" element={<About />} />
        <Route path="/faqs" element={<FAQs />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/shipping-policy" element={<ShippingPolicy />} />
        <Route path="/admin/*" element={<Adminroutes />} />
      </Routes>
    </>
  );
}

export default App;
