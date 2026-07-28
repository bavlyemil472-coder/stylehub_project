import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, Loader2 } from 'lucide-react';
import logo from '../assets/logo.jpeg';
import { formatImageUrl } from '../utils/helpers';

const Home = () => {
    const [sections, setSections] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [sectionsRes, categoriesRes] = await Promise.all([
                    api.get('/sections/'),
                    api.get('/categories/')
                ]);
                setSections(sectionsRes.data);
                setCategories(categoriesRes.data);
            } catch (err) {
                console.error("فشل في جلب البيانات:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="bg-white min-h-screen" dir="rtl">

            {/* Hero */}
            <section className="relative bg-[#0a0a0a] overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-brand-gold/5"></div>
                </div>

                <div className="relative z-10 max-w-5xl mx-auto px-6 py-14 md:py-16 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 text-center md:text-right">

                    <img src={logo} className="w-16 h-16 md:w-20 md:h-20 rounded-full border border-brand-gold/40 p-1 flex-shrink-0" alt="Tres Jolie" />

                    <div className="flex flex-col items-center md:items-start">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-brand-gold text-[9px] font-bold uppercase tracking-[0.4em]">Since 1994</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold text-white leading-none mb-2">تري جولي <span className="text-brand-gold font-light text-xl md:text-2xl">— بيت العيلة</span></h1>
                        <p className="text-gray-500 text-[10px] uppercase tracking-[0.3em]">Premium Family Wear • Collections 2026</p>
                    </div>

                    <div className="flex gap-3 md:mr-auto">
                        <button onClick={() => navigate('/shop')} className="bg-brand-gold text-brand-dark px-7 py-3 text-xs font-bold uppercase tracking-widest hover:bg-white transition-all duration-300 whitespace-nowrap">
                            تسوق الآن
                        </button>
                        <button onClick={() => document.getElementById('sections').scrollIntoView({ behavior: 'smooth' })} className="text-white border border-white/20 px-7 py-3 text-xs font-bold uppercase tracking-widest hover:border-brand-gold hover:text-brand-gold transition-all duration-300 whitespace-nowrap">
                            الأقسام
                        </button>
                    </div>
                </div>
            </section>

            {/* Sections - بانرات كبيرة */}
            <section id="sections" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-6">

                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 text-brand-gold animate-spin" />
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {sections.length > 0 ? (
                                <>
                                    <div className="flex items-center gap-6 mb-10">
                                        <div className="flex-1 h-[1px] bg-gray-100"></div>
                                        <div className="text-center">
                                            <p className="text-brand-gold text-[10px] font-bold uppercase tracking-[0.5em] mb-1">Collections</p>
                                            <h2 className="text-2xl font-bold text-brand-dark">الأقسام</h2>
                                        </div>
                                        <div className="flex-1 h-[1px] bg-gray-100"></div>
                                    </div>

                                    {sections.map(section => (
                                        <div
                                            key={section.id}
                                            onClick={() => navigate(`/section/${section.id}`)}
                                            className="relative overflow-hidden cursor-pointer group h-[260px] md:h-[420px]"
                                        >
                                            <img
                                                src={formatImageUrl(section.image)}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                alt={section.name}
                                                onError={(e) => { e.target.src = 'https://via.placeholder.com/1200x500'; }}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                                                <p className="text-brand-gold text-[10px] font-bold uppercase tracking-[0.5em] mb-3">Collection</p>
                                                <h3 className="text-white text-3xl md:text-5xl font-bold mb-5">{section.name}</h3>
                                                <span className="inline-flex items-center gap-2 border border-white/40 text-white text-xs font-bold uppercase tracking-widest px-6 py-3 group-hover:bg-brand-gold group-hover:text-brand-dark group-hover:border-brand-gold transition-all duration-300">
                                                    تسوق المجموعة
                                                    <ArrowLeft className="w-4 h-4" />
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            ) : (
                                /* لو مفيش Sections عرض الكاتيجوريز العادية */
                                <div>
                                    <div className="flex items-center gap-6 mb-10">
                                        <div className="flex-1 h-[1px] bg-gray-100"></div>
                                        <div className="text-center">
                                            <p className="text-brand-gold text-[10px] font-bold uppercase tracking-[0.5em] mb-1">Collections</p>
                                            <h2 className="text-2xl font-bold text-brand-dark">الأقسام</h2>
                                        </div>
                                        <div className="flex-1 h-[1px] bg-gray-100"></div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {categories.map(cat => (
                                            <div key={cat.id} onClick={() => navigate(`/shop?category=${cat.id}`)} className="relative overflow-hidden cursor-pointer group">
                                                <div className="aspect-[4/5] overflow-hidden bg-gray-100">
                                                    <img src={formatImageUrl(cat.image)} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={cat.name} />
                                                </div>
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>
                                                <div className="absolute bottom-0 right-0 left-0 p-6">
                                                    <h3 className="text-white text-2xl font-bold mb-3">{cat.name}</h3>
                                                    <div className="flex items-center gap-2 text-brand-gold text-sm font-bold">
                                                        <span>استكشف المجموعة</span>
                                                        <ArrowLeft className="w-4 h-4" />
                                                    </div>
                                                </div>
                                                <div className="absolute inset-0 border-2 border-brand-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* زرار كل المنتجات */}
                            <div className="text-center pt-10">
                                <button onClick={() => navigate('/shop')} className="border border-brand-dark text-brand-dark px-12 py-3.5 text-sm font-bold uppercase tracking-widest hover:bg-brand-dark hover:text-white transition-all duration-300">
                                    عرض كل المنتجات
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* اقتباس */}
            <section className="py-20 bg-[#0a0a0a]">
                <div className="max-w-3xl mx-auto text-center px-6">
                    <div className="flex items-center justify-center gap-4 mb-8">
                        <div className="h-[1px] w-12 bg-brand-gold/40"></div>
                        <img src={logo} className="w-8 h-8 rounded-full opacity-60" alt="" />
                        <div className="h-[1px] w-12 bg-brand-gold/40"></div>
                    </div>
                    <p className="text-white/60 text-xl md:text-2xl leading-relaxed font-light">
                        "الجودة ليست مجرد فعل، بل هي عادة نغزلها في كل قطعة — تري جولي، خبرة أكثر من 30 عام."
                    </p>
                </div>
            </section>

            {/* مميزات */}
            <section className="py-16 border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {[
                            { num: '30+', label: 'سنة خبرة' },
                            { num: '100%', label: 'قطن طبيعي' },
                            { num: '48h', label: 'توصيل سريع' },
                            { num: '5★', label: 'تقييم العملاء' },
                        ].map((item, i) => (
                            <div key={i} className="space-y-2">
                                <p className="text-3xl font-bold text-brand-dark">{item.num}</p>
                                <p className="text-gray-400 text-sm">{item.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-10 bg-[#0a0a0a] text-center border-t border-white/5">
                <p className="text-gray-600 text-xs uppercase tracking-[0.5em]">© 2026 TRES JOLIE FAMILY WEAR. ALL RIGHTS RESERVED.</p>
            </footer>
        </div>
    );
};

export default Home;
