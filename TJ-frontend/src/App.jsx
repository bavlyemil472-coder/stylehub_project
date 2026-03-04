import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProductDetails from './pages/ProductDetails';
import Shop from './pages/Shop';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import MyOrders from './pages/MyOrders';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router>
  <div className="flex flex-col min-h-screen bg-white">
    {/* 1. النبار والتوستر يظهروا في كل الصفحات */}
    <Navbar />
    <Toaster position="top-center" reverseOrder={false} />

    {/* 2. المحتوى المتغير (المنطقة اللي بيتبدل فيها الصفحات) */}
    <main className="flex-grow">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        
        
        <Route 
          path="/checkout" 
          element={<ProtectedRoute><Checkout /></ProtectedRoute>} 
        />
        <Route 
          path="/orders" 
          element={<ProtectedRoute><MyOrders /></ProtectedRoute>} 
        />
        <Route 
          path="/profile" 
          element={<ProtectedRoute><Profile /></ProtectedRoute>} 
        />
      </Routes>
    </main>

    
    <Footer />
  </div>
</Router>
  );
}

export default App;
