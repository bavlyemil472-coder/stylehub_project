import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import logo from '../assets/logo.jpeg'; 
import { 
  ShoppingBag, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Search,
  ChevronDown,
  LayoutDashboard 
} from 'lucide-react';
import { formatImageUrl } from '../utils/helpers'; 

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const checkStatusAndCart = async () => {
    const token = localStorage.getItem('access_token');
    const isStaff = localStorage.getItem('is_staff') === 'true'; 
    
    setIsLoggedIn(!!token);
    setIsAdmin(isStaff);   

    if (token) {
      try {
        const response = await api.get('/cart/');
        const items = response.data.items || [];
        setCartCount(items.length);
      } catch (error) {
        if (error.response?.status === 401) {
          setIsLoggedIn(false);
          setIsAdmin(false);
          setCartCount(0);
        }
      }
    } else {
      setCartCount(0);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    checkStatusAndCart();
    window.addEventListener('cartUpdated', checkStatusAndCart);
    return () => window.removeEventListener('cartUpdated', checkStatusAndCart);
  }, [location.pathname]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setIsOpen(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear(); 
    setIsLoggedIn(false);
    setIsAdmin(false);
    setCartCount(0);
    navigate('/login');
    setIsOpen(false);
  };

  const isActive = (path) => location.pathname === path ? "text-brand-gold" : "text-white/70";

  return (
    <nav className="bg-[#0a0a0a] text-white sticky top-0 z-[100] border-b border-white/5 backdrop-blur-md bg-opacity-90">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between h-20 items-center">
          
          <Link to="/" className="flex items-center gap-3 group transition-transform duration-500 hover:scale-105">
            <div className="relative">
              <img 
                src={logo} 
                alt="Tres Jolie" 
                className="w-10 h-10 rounded-full border border-brand-gold/30 p-0.5 object-cover" 
              />
              <div className="absolute inset-0 rounded-full bg-brand-gold/20 animate-ping opacity-20 group-hover:opacity-40"></div>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-xl font-black italic tracking-tighter text-brand-gold font-display">TRES JOLIE</span>
              <span className="text-[7px] uppercase tracking-[0.4em] text-gray-500 font-bold">Family Wear</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-10">
            <Link to="/" className={`text-[10px] font-black uppercase tracking-[0.3em] hover:text-brand-gold transition-all duration-300 ${isActive('/')}`}>Home</Link>
            <Link to="/shop" className={`text-[10px] font-black uppercase tracking-[0.3em] hover:text-brand-gold transition-all duration-300 ${isActive('/shop')}`}>Collections</Link>
            
            {isAdmin && (
              <Link 
                to="/admin-dashboard" 
                className="group relative flex items-center gap-2 bg-brand-gold/10 px-4 py-1.5 rounded-full border border-brand-gold/20 hover:bg-brand-gold hover:text-brand-dark transition-all duration-500"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span className="text-[9px] font-black uppercase tracking-wider">Dashboard</span>
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-gold opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-gold"></span>
                </span>
              </Link>
            )}

            {isLoggedIn && (
              <Link to="/orders" className={`text-[10px] font-black uppercase tracking-[0.3em] hover:text-brand-gold transition-all duration-300 ${isActive('/orders')}`}>My Orders</Link>
            )}
          </div>

          <div className="hidden md:flex items-center gap-8">
            <form onSubmit={handleSearchSubmit} className="relative group">
              <input 
                type="text"
                placeholder="Find something..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-[10px] font-bold focus:ring-1 focus:ring-brand-gold/30 w-32 focus:w-56 transition-all duration-700 outline-none placeholder:text-gray-600"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 group-focus-within:text-brand-gold transition-colors" />
            </form>

            <div className="flex items-center gap-6 border-l border-white/10 pl-8">
              <Link to="/cart" className="relative text-white/80 hover:text-brand-gold transition-all duration-300 hover:scale-110">
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-brand-gold text-brand-dark text-[8px] font-black w-4 h-4 flex items-center justify-center rounded-full shadow-lg shadow-brand-gold/20">
                    {cartCount}
                  </span>
                )}
              </Link>

              {isLoggedIn ? (
                <div className="flex items-center gap-5">
                  <Link to="/profile" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 bg-gradient-to-tr from-brand-gold to-[#f3d980] rounded-full flex items-center justify-center text-brand-dark transition-all group-hover:rotate-12 shadow-lg">
                      <User className="w-4 h-4" />
                    </div>
                  </Link>
                  <button onClick={handleLogout} className="text-gray-500 hover:text-red-500 transition-all duration-300">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link to="/login" className="text-[10px] font-black uppercase tracking-widest bg-brand-gold text-brand-dark px-6 py-2.5 rounded-full hover:bg-white transition-all duration-500 shadow-lg shadow-brand-gold/10">
                  Sign In
                </Link>
              )}
            </div>
          </div>

          <div className="md:hidden flex items-center gap-5">
            <Link to="/cart" className="relative">
              <ShoppingBag className="w-5 h-5 text-white/80" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-brand-gold text-brand-dark text-[7px] font-black w-3.5 h-3.5 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>
            <button onClick={() => setIsOpen(!isOpen)} className="text-white">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 " />}
            </button>
          </div>
        </div>
      </div>

      <div className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-500 md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsOpen(false)}>
        <div 
          className={`absolute right-0 top-0 h-full w-[280px] bg-[#0a0a0a] p-8 space-y-10 shadow-2xl transition-transform duration-500 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center border-b border-white/5 pb-6">
            <span className="text-brand-gold font-display italic font-bold">Menu</span>
            <button onClick={() => setIsOpen(false)}><X className="w-5 h-5 text-gray-500" /></button>
          </div>

          <div className="space-y-8">
            <Link to="/" onClick={() => setIsOpen(false)} className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-white hover:text-brand-gold">
              Home <ChevronDown className="w-3 h-3 -rotate-90 text-brand-gold/30" />
            </Link>
            <Link to="/shop" onClick={() => setIsOpen(false)} className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-white hover:text-brand-gold">
              Collections <ChevronDown className="w-3 h-3 -rotate-90 text-brand-gold/30" />
            </Link>

            {isAdmin && (
              <Link 
                to="/admin-dashboard" 
                onClick={() => setIsOpen(false)} 
                className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-brand-gold p-4 bg-brand-gold/5 rounded-xl border border-brand-gold/10 shadow-inner"
              >
                <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
              </Link>
            )}

            {isLoggedIn && (
              <Link to="/orders" onClick={() => setIsOpen(false)} className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-white hover:text-brand-gold">
                My Orders <ChevronDown className="w-3 h-3 -rotate-90 text-brand-gold/30" />
              </Link>
            )}
          </div>

          <div className="pt-10 border-t border-white/5 space-y-6">
            {isLoggedIn ? (
              <>
                <Link to="/profile" onClick={() => setIsOpen(false)} className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-brand-gold">
                    <User className="w-4 h-4" /> Profile Settings
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-red-500">
                    <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </>
            ) : (
              <Link to="/login" onClick={() => setIsOpen(false)} className="block w-full text-center bg-brand-gold text-brand-dark py-4 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand-gold/10">
                Login to Account
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;