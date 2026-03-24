import { useDispatch } from 'react-redux';
import './App.css';
import { Toaster } from 'sonner';
import Home from './pages/Home';
import { Route, Routes } from 'react-router-dom';
import Adminroutes from './admin/Adminroutes';
import Login from './component/Login';
import Register from './component/Register';
import ForgotPassword from './component/ForgotPassword';


function App() {
  const dispatch = useDispatch();


  return (
    <>
      <Toaster richColors position="top-center" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/admin/*" element={<Adminroutes />} />
      </Routes>
    </>
  );
}

export default App;
