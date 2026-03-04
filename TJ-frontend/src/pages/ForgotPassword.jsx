import React, { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Mail, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('password_reset/', { email });
            toast.success("إذا كان الإيميل مسجلاً، فستصلك رسالة تحتوي على كود التغيير");

            setTimeout(() => navigate('/reset-password'), 2000);
        } catch (err) {
            toast.error("حدث خطأ، يرجى المحاولة لاحقاً");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-white px-6">
            <div className="max-w-md w-full text-center">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold font-display italic text-brand-dark uppercase tracking-tight">نسيت كلمة السر؟</h1>
                    <p className="text-[10px] text-gray-400 mt-2 uppercase tracking-[0.2em]">أدخل بريدك الإلكتروني لاستعادة الوصول لحسابك</p>
                </header>

                <form onSubmit={handleSubmit} className="space-y-4 bg-brand-gray/30 p-8 rounded-[2rem] border border-brand-gray">
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                        <input 
                            type="email" 
                            placeholder="البريد الإلكتروني"
                            className="w-full bg-white border border-gray-100 rounded-xl py-4 pl-12 pr-4 text-xs font-bold outline-none focus:ring-1 focus:ring-brand-gold"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-brand-dark text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-brand-gold hover:text-brand-dark transition-all duration-500 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "إرسال كود الاستعادة"}
                        {!loading && <ArrowRight className="w-4 h-4" />}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
