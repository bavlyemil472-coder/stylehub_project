import React, { useState } from 'react';
import { Lock, User, LogIn } from 'lucide-react'; 
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading('جاري تسجيل الدخول...');
    
    try {
      const response = await api.post('token/', {
        username: formData.username,
        password: formData.password
      });

      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      
      toast.dismiss(loadingToast);
      toast.success(`أهلاً بك مجدداً يا ${formData.username} ✨`);

      setTimeout(() => {
        window.location.href = "/";
      }, 1000);

    } catch (error) {
      toast.dismiss(loadingToast);
      console.error("Server Response Error:", error.response?.data);
      
      if (error.response?.status === 401) {
        toast.error("بيانات الدخول غير صحيحة (تأكد من اسم المستخدم وكلمة السر)");
      } else {
        toast.error("حدث خطأ ما في الاتصال بالسيرفر");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white shadow-2xl rounded-[2.5rem] border border-gray-100 p-10">
        
        <div className="text-center mb-10">
          <h2 className="text-4xl font-black text-brand-dark italic uppercase tracking-tighter mb-2">تسجيل الدخول</h2>
          <div className="h-1.5 w-12 bg-brand-gold mx-auto rounded-full"></div>
          <p className="mt-4 text-gray-500 font-medium">مرحباً بك في <span className="text-brand-dark font-black tracking-widest">TRI JOLIE</span></p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">اسم المستخدم</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
              <input
                type="text"
                name="username"
                value={formData.username}
                placeholder="Username"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-gold outline-none transition-all font-bold text-brand-dark"
                onChange={handleChange}
                required
              />
            </div>
          </div>


          <div className="space-y-1">
            <div className="flex justify-between items-center px-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">كلمة السر</label>
              
              <Link 
                to="/forgot-password" 
                className="text-[9px] font-bold text-brand-gold uppercase tracking-tighter hover:text-brand-dark transition-colors"
              >
                نسيت كلمة السر؟
              </Link>
            </div>
            
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
              <input
                type="password"
                name="password"
                value={formData.password}
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-gold outline-none transition-all font-bold text-brand-dark"
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-brand-dark text-brand-gold py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl active:scale-95 mt-8"
          >
            دخول <LogIn className="w-5 h-5" />
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
            ليس لديك حساب؟ 
            <Link to="/signup" className="text-brand-gold ml-2 hover:underline decoration-2">إنشاء حساب</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
