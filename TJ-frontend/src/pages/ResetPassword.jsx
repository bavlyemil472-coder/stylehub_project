import React, { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Lock, KeyRound, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ResetPassword = () => {
    const [formData, setFormData] = useState({ token: '', password: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('password_reset/confirm/', {
                token: formData.token,
                password: formData.password
            });
            toast.success("تم تغيير كلمة السر بنجاح! يمكنك الآن تسجيل الدخول");
            navigate('/login');
        } catch (err) {
            toast.error("الكود غير صحيح أو انتهت صلاحيته");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-white px-6">
            <div className="max-w-md w-full text-center">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold font-display italic text-brand-dark uppercase tracking-tight">كلمة سر جديدة</h1>
                    <p className="text-[10px] text-gray-400 mt-2 uppercase tracking-[0.2em]">أدخل الكود المرسل لإيميلك وكلمة السر الجديدة</p>
                </header>

                <form onSubmit={handleSubmit} className="space-y-4 bg-brand-gray/30 p-8 rounded-[2rem] border border-brand-gray">
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="كود التحقق (Token)"
                            className="w-full bg-white border border-gray-100 rounded-xl py-4 px-4 text-xs font-bold outline-none focus:ring-1 focus:ring-brand-gold text-center tracking-[0.5em]"
                            value={formData.token}
                            onChange={(e) => setFormData({...formData, token: e.target.value})}
                            required
                        />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                        <input 
                            type="password" 
                            placeholder="كلمة السر الجديدة"
                            className="w-full bg-white border border-gray-100 rounded-xl py-4 pl-12 pr-4 text-xs font-bold outline-none focus:ring-1 focus:ring-brand-gold"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            required
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-brand-dark text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-brand-gold hover:text-brand-dark transition-all duration-500 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "تأكيد التغيير"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;