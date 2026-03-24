import { useDispatch } from 'react-redux';
import './App.css';
import { Toaster } from 'sonner';
import Home from './pages/Home';
import { Route, Routes } from 'react-router-dom';
import Adminroutes from './admin/Adminroutes';
import ProductDetail from './pages/ProductDetail';


function App() {
  const dispatch = useDispatch();


  return (
    <>
      <Toaster richColors position="top-center" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product-details/:id" element={<ProductDetail />} />
        <Route path="/admin/*" element={<Adminroutes />} />
      </Routes>
    </>
  );
}

export default App;
