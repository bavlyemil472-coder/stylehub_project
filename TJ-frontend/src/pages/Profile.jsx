import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { User, Mail, Save, Loader2, UserCircle, ShieldCheck } from 'lucide-react';

const Profile = () => {
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        username: ''
    });

    // 1. جلب البيانات عند تحميل الصفحة
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // التعديل: إضافة / في البداية لضمان المسار الصحيح
                const res = await api.get('/accounts/profile/');
                setFormData({
                    first_name: res.data.first_name || '',
                    last_name: res.data.last_name || '',
                    email: res.data.email || '',
                    username: res.data.username || ''
                });
            } catch (err) {
                toast.error("فشل في تحميل بيانات الحساب");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    // 2. دالة حفظ التعديلات
    const handleUpdate = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            // التعديل: إضافة / واستخدام البيانات المحدثة
            await api.patch('/accounts/profile/', {
                first_name: formData.first_name,
                last_name: formData.last_name,
                email: formData.email
            });
            toast.success("تم تحديث بياناتك بنجاح", {
                style: {
                    background: '#0B0B0B',
                    color: '#D4AF37',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                }
            });
        } catch (err) {
            toast.error(err.response?.data?.detail || "حدث خطأ أثناء التحديث");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white">
            <Loader2 className="w-10 h-10 text-brand-gold animate-spin mb-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-dark">Authenticating...</span>
        </div>
    );

    return (
        <div className="min-h-screen bg-white py-24 px-6">
            <div className="max-w-2xl mx-auto">
                <header className="mb-16 text-center">
                    <span className="text-brand-gold font-black uppercase tracking-[0.4em] text-[9px] mb-3 block animate-fade-in">Private Access</span>
                    <h1 className="text-4xl font-bold font-display italic text-brand-dark uppercase tracking-tighter">الملف الشخصي</h1>
                    <div className="h-[2px] w-16 bg-brand-gold mx-auto mt-6 shadow-sm"></div>
                </header>

                <div className="bg-brand-gray/20 rounded-[3rem] p-10 md:p-14 border border-brand-gray relative overflow-hidden shadow-sm">
                    {/* خلفية جمالية بسيطة */}
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                        <UserCircle className="w-40 h-40" />
                    </div>

                    <form onSubmit={handleUpdate} className="space-y-8 relative z-10">
                        
                        <div className="flex flex-col items-center mb-12">
                            <div className="relative group">
                                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-brand-gold/20 mb-5 overflow-hidden transition-transform duration-500 group-hover:scale-105">
                                    <UserCircle className="w-16 h-16 text-gray-100" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 bg-brand-gold text-white p-1.5 rounded-full shadow-md">
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                </div>
                            </div>
                            <div className="text-center">
                                <p className="text-[11px] font-black text-brand-dark uppercase tracking-[0.2em]">Member ID</p>
                                <p className="text-[12px] font-bold text-brand-gold italic mt-1">@{formData.username}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-brand-dark flex items-center gap-2">
                                    <span className="w-1 h-1 bg-brand-gold rounded-full"></span> الاسم الأول
                                </label>
                                <input 
                                    type="text" 
                                    value={formData.first_name}
                                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                                    className="w-full bg-white border border-gray-100 rounded-2xl py-4 px-5 text-xs font-bold text-brand-dark focus:ring-1 focus:ring-brand-gold transition-all outline-none shadow-sm hover:border-brand-gold/30"
                                    required
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-brand-dark flex items-center gap-2">
                                    <span className="w-1 h-1 bg-brand-gold rounded-full"></span> الاسم الأخير
                                </label>
                                <input 
                                    type="text" 
                                    value={formData.last_name}
                                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                                    className="w-full bg-white border border-gray-100 rounded-2xl py-4 px-5 text-xs font-bold text-brand-dark focus:ring-1 focus:ring-brand-gold transition-all outline-none shadow-sm hover:border-brand-gold/30"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-brand-dark flex items-center gap-2">
                                <span className="w-1 h-1 bg-brand-gold rounded-full"></span> البريد الإلكتروني
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                <input 
                                    type="email" 
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    className="w-full bg-white border border-gray-100 rounded-2xl py-4 pl-14 pr-5 text-xs font-bold text-brand-dark focus:ring-1 focus:ring-brand-gold transition-all outline-none shadow-sm"
                                    required
                                />
                            </div>
                        </div>

                        <div className="pt-8">
                            <button 
                                type="submit" 
                                disabled={isSaving}
                                className="w-full bg-brand-dark text-white py-5 px-12 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] hover:bg-brand-gold hover:text-brand-dark transition-all duration-700 flex items-center justify-center gap-4 disabled:opacity-50 shadow-2xl shadow-brand-dark/20 active:scale-[0.98]"
                            >
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin text-brand-gold" /> : <Save className="w-4 h-4" />}
                                تحديث بيانات العضوية
                            </button>
                        </div>
                    </form>
                </div>

                <div className="mt-12 text-center space-y-4">
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.4em] opacity-60">
                        Tri Jolie Prestige &bull; Confidential Data
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Profile;