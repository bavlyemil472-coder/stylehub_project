import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, Loader2, ChevronLeft } from 'lucide-react';
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
            <section className="relative h-screen bg-[#0a0a0a] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-40 bg-gradient-to-b from-transparent to-brand-gold/30"></div>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1px] h-40 bg-gradient-to-t from-transparent to-brand-gold/30"></div>
                    <div className="absolute right-20 top-1/2 -translate-y-1/2 h-[1px] w-40 bg-gradient-to-l from-transparent to-brand-gold/20"></div>
                    <div className="absolute left-20 top-1/2 -translate-y-1/2 h-[1px] w-40 bg-gradient-to-r from-transparent to-brand-gold/20"></div>
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-brand-gold/5"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-brand-gold/10"></div>

                <div className="relative z-10 text-center px-6 max-w-3xl">
                    <div className="mb-10">
                        <img src={logo} className="w-20 h-20 mx-auto rounded-full border border-brand-gold/40 p-1 shadow-[0_0_40px_rgba(212,175,55,0.15)]" alt="Tres Jolie" />
                    </div>
                    <div className="flex items-center justify-center gap-4 mb-8">
                        <div className="h-[1px] w-16 bg-gradient-to-r from-transparent to-brand-gold/60"></div>
                        <span className="text-brand-gold text-[10px] font-bold uppercase tracking-[0.5em]">Since 1994</span>
                        <div className="h-[1px] w-16 bg-gradient-to-l from-transparent to-brand-gold/60"></div>
                    </div>
                    <h1 className="text-5xl md:text-8xl font-bold text-white mb-4 leading-none tracking-tight">تري جولي</h1>
                    <p className="text-brand-gold text-2xl md:text-3xl font-light mb-8 tracking-widest">بيت العيلة</p>
                    <p className="text-gray-500 text-xs mb-12 uppercase tracking-[0.5em]">Premium Family Wear • Collections 2026</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <button onClick={() => navigate('/shop')} className="bg-brand-gold text-brand-dark px-10 py-3.5 text-sm font-bold uppercase tracking-widest hover:bg-white transition-all duration-300 min-w-[160px]">
                            تسوق الآن
                        </button>
                        <button onClick={() => document.getElementById('sections').scrollIntoView({ behavior: 'smooth' })} className="text-white border border-white/20 px-10 py-3.5 text-sm font-bold uppercase tracking-widest hover:border-brand-gold hover:text-brand-gold transition-all duration-300 min-w-[160px]">
                            الأقسام
                        </button>
                    </div>
                </div>

                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer group" onClick={() => document.getElementById('sections').scrollIntoView({ behavior: 'smooth' })}>
                    <span className="text-gray-600 text-[9px] uppercase tracking-[0.3em] group-hover:text-brand-gold transition-colors">Scroll</span>
                    <div className="w-[1px] h-8 bg-gradient-to-b from-brand-gold/60 to-transparent animate-pulse"></div>
                </div>
            </section>

            {/* Sections + Categories */}
            <section id="sections" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-6">

                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 text-brand-gold animate-spin" />
                        </div>
                    ) : (
                        <div className="space-y-20">
                            {/* لو في Sections */}
                            {sections.length > 0 ? sections.map(section => (
                                <div key={section.id}>
                                    {/* عنوان القسم */}
                                    <div className="flex items-center gap-6 mb-10">
                                        <div className="flex-1 h-[1px] bg-gray-100"></div>
                                        <div className="text-center">
                                            <p className="text-brand-gold text-[10px] font-bold uppercase tracking-[0.5em] mb-1">Collection</p>
                                            <h2 className="text-2xl font-bold text-brand-dark">{section.name}</h2>
                                        </div>
                                        <div className="flex-1 h-[1px] bg-gray-100"></div>
                                    </div>

                                    {/* الكاتيجوريز جوا القسم */}
                                    {section.categories?.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {section.categories.map(cat => (
                                                <div key={cat.id} className="space-y-3">
                                                    {/* الكاتيجوري الرئيسية */}
                                                    <div
                                                        onClick={() => navigate(`/shop?category=${cat.id}`)}
                                                        className="relative overflow-hidden cursor-pointer group"
                                                    >
                                                        <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                                                            <img
                                                                src={formatImageUrl(cat.image)}
                                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                                alt={cat.name}
                                                            />
                                                        </div>
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>
                                                        <div className="absolute bottom-0 right-0 left-0 p-4">
                                                            <h3 className="text-white text-xl font-bold mb-1">{cat.name}</h3>
                                                            <div className="flex items-center gap-2 text-brand-gold text-xs font-bold">
                                                                <span>استكشف</span>
                                                                <ArrowLeft className="w-3 h-3" />
                                                            </div>
                                                        </div>
                                                        <div className="absolute inset-0 border-2 border-brand-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                    </div>

                                                    {/* الـ Subcategories */}
                                                    {cat.subcategories?.length > 0 && (
                                                        <div className="flex flex-wrap gap-2">
                                                            {cat.subcategories.map(sub => (
                                                                <button
                                                                    key={sub.id}
                                                                    onClick={() => navigate(`/shop?subcategory=${sub.id}`)}
                                                                    className="text-xs font-bold px-4 py-2 border border-gray-200 text-gray-600 hover:border-brand-gold hover:text-brand-gold transition-all"
                                                                >
                                                                    {sub.name}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-400 text-center py-8">لا توجد أقسام فرعية</p>
                                    )}
                                </div>
                            )) : (
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
                            <div className="text-center">
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
