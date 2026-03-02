import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ArrowRight, Loader2, Sparkles } from 'lucide-react';
import logo from '../assets/logo.jpeg';

const Home = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                // التأكد من أن المسار هو /categories/ ليتطابق مع urls.py في الباك إيند
                const res = await api.get('/categories/'); 
                setCategories(res.data);
            } catch (err) {
                console.error("فشل في جلب الأقسام:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    return (
        <div className="bg-white min-h-screen font-body">
            {/* 1. Hero Section - التصميم الفاخر المظلم */}
            <section className="relative h-[80vh] flex items-center justify-center bg-[#0b0b0b] overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#D4AF3710_0%,_transparent_70%)]"></div>
                <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                
                <div className="relative z-10 text-center px-6 max-w-4xl">
                    <div className="inline-block relative mb-8">
                        <img 
                            src={logo} 
                            className="w-24 h-24 mx-auto rounded-full border-2 border-brand-gold/20 p-1.5 shadow-[0_0_50px_rgba(212,175,55,0.1)] transition-transform duration-700 hover:rotate-[360deg]" 
                            alt="Tri Jolie Logo" 
                        />
                        <Sparkles className="absolute -top-2 -right-2 text-brand-gold w-5 h-5 animate-pulse" />
                    </div>

                    <h1 className="text-4xl md:text-7xl font-bold text-white mb-6 font-display italic tracking-tighter leading-tight">
                        أناقة عائلتكم <br/> 
                        <span className="text-brand-gold font-display not-italic">تبدأ بلمسة فرنسية</span>
                    </h1>

                    <p className="text-gray-500 text-[10px] md:text-[12px] mb-12 uppercase tracking-[0.6em] font-black italic">
                        Premium Family Wear • Collections 2026
                    </p>

                    <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
                        <button 
                            onClick={() => navigate('/shop')}
                            className="bg-brand-gold text-brand-dark px-12 py-4 rounded-full text-[11px] font-black uppercase tracking-widest transition-all duration-500 hover:bg-white hover:scale-105 shadow-2xl shadow-brand-gold/20"
                        >
                            تسوق الآن
                        </button>
                        <button 
                            onClick={() => document.getElementById('categories').scrollIntoView({ behavior: 'smooth' })}
                            className="text-white border border-white/20 px-12 py-4 rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-white hover:text-brand-dark transition-all duration-500"
                        >
                            استكشف الأقسام
                        </button>
                    </div>
                </div>

                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
                    <div className="w-[1px] h-12 bg-gradient-to-b from-brand-gold to-transparent"></div>
                </div>
            </section>

            {/* 2. Categories Section */}
            <section id="categories" className="py-32 max-w-7xl mx-auto px-6">
                <div className="text-center mb-24">
                    <span className="text-brand-gold text-[10px] font-black uppercase tracking-[0.5em] mb-4 block">Our Legacy</span>
                    <h2 className="text-3xl md:text-5xl font-bold font-display italic text-brand-dark uppercase tracking-tight">التصنيفات الراقية</h2>
                    <div className="w-20 h-[2px] bg-brand-gold mx-auto mt-8"></div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="w-8 h-8 text-brand-gold animate-spin" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">جاري تحضير المجموعات</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {categories.length > 0 ? (
                            categories.map((cat) => (
                                <div 
                                    key={cat.id}
                                    onClick={() => navigate(`/shop?category=${cat.id}`)}
                                    className="relative h-[500px] rounded-[3rem] overflow-hidden group cursor-pointer shadow-2xl transition-all duration-700 hover:-translate-y-4"
                                >
                                    <img 
                                        src={cat.image} 
                                        className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110"
                                        alt={cat.name}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/20 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-100" />
                                    
                                    <div className="absolute bottom-10 left-10 right-10">
                                        <p className="text-brand-gold text-[9px] font-black uppercase tracking-[0.4em] mb-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                                            Exclusive Collection
                                        </p>
                                        <h4 className="text-2xl font-bold text-white font-display italic mb-4">{cat.name}</h4>
                                        <div className="h-[1px] w-0 bg-white group-hover:w-full transition-all duration-700 mb-6"></div>
                                        <div className="flex items-center gap-3 text-white font-black uppercase text-[9px] tracking-[0.2em]">
                                            استكشف الآن <ArrowRight className="w-4 h-4 text-brand-gold" />
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-32 text-center bg-brand-gray/30 rounded-[3rem] border-2 border-dashed border-gray-100">
                                <p className="text-gray-400 text-[11px] font-black uppercase tracking-[0.4em]">لا توجد مجموعات متاحة حالياً</p>
                            </div>
                        )}
                    </div>
                )}
            </section>

            {/* 3. Quote Section */}
            <section className="py-32 bg-brand-gray/20">
                <div className="max-w-4xl mx-auto text-center px-6">
                    <p className="text-brand-dark/40 text-4xl md:text-6xl font-display italic leading-snug">
                        "الجودة ليست مجرد فعل، بل هي عادة نغزلها في كل قطعة."
                    </p>
                </div>
            </section>

            <footer className="py-16 border-t border-gray-50 text-center">
                <p className="text-[10px] text-gray-300 font-bold uppercase tracking-[0.8em]">
                    &copy; 2026 TRI JOLIE FAMILY WEAR. ALL RIGHTS RESERVED.
                </p>
            </footer>
        </div>
    );
};

export default Home;