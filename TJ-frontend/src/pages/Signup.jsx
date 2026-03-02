import React, { useState } from 'react';
import { User, Lock, Mail, ArrowRight, UserCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const Signup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      return toast.error("كلمات المرور غير متطابقة");
    }

    setLoading(true);
    try {
      await api.post('accounts/register/', {
        username: formData.username,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password
      });
      
      toast.success("تم إنشاء الحساب بنجاح! يمكنك تسجيل الدخول الآن");
      navigate('/login');
    } catch (error) {
      const errorMsg = error.response?.data 
        ? Object.values(error.response.data).flat()[0] 
        : "فشل عملية التسجيل";
      toast.error(errorMsg);
      console.error("Signup Error:", error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-12">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="text-brand-gold font-black uppercase tracking-[0.4em] text-[9px] mb-2 block">Join the Family</span>
          <h2 className="text-4xl font-bold font-display italic text-brand-dark uppercase tracking-tighter">إنشاء حساب</h2>
        </div>

        <div className="bg-brand-gray/30 rounded-[2.5rem] p-8 border border-brand-gray shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Username */}
            <div className="relative">
              <User className="absolute left-4 top-3.5 text-gray-300 w-4 h-4" />
              <input 
                name="username" 
                type="text" 
                placeholder="اسم المستخدم (Username)" 
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-brand-gold transition-all" 
                onChange={handleChange} 
                required 
              />
            </div>

            {/* Name Grid */}
            <div className="grid grid-cols-2 gap-4">
              <input 
                name="first_name" 
                type="text" 
                placeholder="الاسم الأول" 
                className="w-full px-4 py-3.5 bg-white border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-brand-gold transition-all" 
                onChange={handleChange} 
                required 
              />
              <input 
                name="last_name" 
                type="text" 
                placeholder="الاسم الأخير" 
                className="w-full px-4 py-3.5 bg-white border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-brand-gold transition-all" 
                onChange={handleChange} 
                required 
              />
            </div>

            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-gray-300 w-4 h-4" />
              <input 
                name="email" 
                type="email" 
                placeholder="البريد الإلكتروني" 
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-brand-gold transition-all" 
                onChange={handleChange} 
                required 
              />
            </div>

            {/* Passwords */}
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-gray-300 w-4 h-4" />
              <input 
                name="password" 
                type="password" 
                placeholder="كلمة السر" 
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-brand-gold transition-all" 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-gray-300 w-4 h-4" />
              <input 
                name="confirmPassword" 
                type="password" 
                placeholder="تأكيد كلمة السر" 
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-brand-gold transition-all" 
                onChange={handleChange} 
                required 
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-brand-dark text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-brand-gold hover:text-brand-dark transition-all duration-500 shadow-xl disabled:opacity-50"
            >
              {loading ? "جاري الإنشاء..." : "إنشاء حساب"} 
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              لديك حساب بالفعل؟{' '}
              <Link to="/login" className="text-brand-gold border-b border-brand-gold pb-0.5 ml-1">
                تسجيل الدخول
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;