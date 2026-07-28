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

            {/* Hero — شريط مضغوط */}
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

            {/* اقتباس تحريري - علامة تنصيص كبيرة */}
            <section className="py-14 border-b border-gray-100">
                <div className="max-w-3xl mx-auto text-center px-6">
                    <span className="font-display text-brand-gold/25 text-6xl md:text-8xl leading-none block mb-[-1rem] md:mb-[-1.5rem]">"</span>
                    <p className="font-display italic text-lg md:text-2xl text-brand-dark leading-relaxed">
                        الجودة ليست مجرد فعل، بل هي عادة نغزلها في كل قطعة
                    </p>
                    <p className="text-brand-gold text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em] md:tracking-[0.4em] mt-4">تري جولي — أكثر من 30 عامًا من الخبرة</p>
                </div>
            </section>

            {/* Sections - عرض تحريري (Editorial) */}
            <section id="sections" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-6">

                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 text-brand-gold animate-spin" />
                        </div>
                    ) : (
                        <div>
                            {sections.length > 0 ? (
                                <>
                                    <div className="mb-14 text-center">
                                        <p className="text-brand-gold text-[10px] font-bold uppercase tracking-[0.5em] mb-2">Collections</p>
                                        <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-dark">الأقسام</h2>
                                        <div className="w-14 h-[2px] bg-brand-gold mx-auto mt-4"></div>
                                    </div>

                                    <div className="space-y-6 md:space-y-16">
                                        {sections.map((section, idx) => {
                                            const reversed = idx % 2 === 1;
                                            const previewCats = (section.categories || []).slice(0, 4);
                                            const extraCount = (section.categories || []).length - previewCats.length;
                                            return (
                                                <React.Fragment key={section.id}>

                                                    {/* ===== نسخة الموبايل: صورة + نص فوقها ===== */}
                                                    <div
                                                        onClick={() => navigate(`/section/${section.id}`)}
                                                        className="md:hidden relative overflow-hidden cursor-pointer group h-[380px]"
                                                    >
                                                        <img
                                                            src={formatImageUrl(section.image)}
                                                            className="w-full h-full object-cover"
                                                            alt={section.name}
                                                            onError={(e) => { e.target.src = 'https://via.placeholder.com/800x900'; }}
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/10"></div>

                                                        <div className="absolute inset-0 flex flex-col items-center justify-end text-center px-6 pb-7">
                                                            <span className="text-brand-gold text-[9px] font-bold uppercase tracking-[0.4em] mb-2">Collection</span>
                                                            <h3 className="font-display text-2xl font-bold text-white mb-3">{section.name}</h3>
                                                            <div className="w-8 h-[2px] bg-brand-gold mb-4"></div>

                                                            {previewCats.length > 0 && (
                                                                <div className="flex items-center gap-2 mb-5">
                                                                    {previewCats.map((cat, i) => (
                                                                        <div
                                                                            key={cat.id}
                                                                            style={{ zIndex: previewCats.length - i }}
                                                                            className={`w-10 h-10 rounded-full overflow-hidden border-2 border-white/80 shadow-md ${i !== 0 ? '-mr-3' : ''}`}
                                                                        >
                                                                            <img src={formatImageUrl(cat.image)} className="w-full h-full object-cover" alt={cat.name} />
                                                                        </div>
                                                                    ))}
                                                                    {extraCount > 0 && (
                                                                        <span className="-mr-3 w-10 h-10 rounded-full bg-brand-gold text-brand-dark text-[10px] font-bold flex items-center justify-center border-2 border-white/80 z-0">
                                                                            +{extraCount}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}

                                                            <span className="inline-flex items-center gap-2 bg-brand-gold text-brand-dark text-[11px] font-bold uppercase tracking-widest px-6 py-2.5">
                                                                تسوق المجموعة
                                                                <ArrowLeft className="w-3.5 h-3.5" />
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* ===== نسخة التابلت/الديسكتوب: تحريرية جنب بعض ===== */}
                                                    <div
                                                        className={`hidden md:flex flex-col ${reversed ? 'md:flex-row-reverse' : 'md:flex-row'} gap-8 items-center`}
                                                    >
                                                        {/* صورة السيكشن */}
                                                        <div
                                                            onClick={() => navigate(`/section/${section.id}`)}
                                                            className="relative overflow-hidden cursor-pointer group w-full md:w-3/5 h-[420px] flex-shrink-0"
                                                        >
                                                            <img
                                                                src={formatImageUrl(section.image)}
                                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                                alt={section.name}
                                                                onError={(e) => { e.target.src = 'https://via.placeholder.com/1000x700'; }}
                                                            />
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent"></div>
                                                            <div className="absolute inset-0 border border-brand-gold/0 group-hover:border-brand-gold/60 transition-all duration-500"></div>
                                                        </div>

                                                        {/* النص + معاينة الكاتيجوريز */}
                                                        <div className="w-full md:w-2/5 text-center md:text-right flex flex-col items-center md:items-start">
                                                            <span className="text-brand-gold text-[10px] font-bold uppercase tracking-[0.4em] mb-3">Collection</span>
                                                            <h3 className="font-display text-3xl md:text-4xl font-bold text-brand-dark mb-4">{section.name}</h3>
                                                            <div className="w-10 h-[2px] bg-brand-gold mb-5"></div>

                                                            {previewCats.length > 0 && (
                                                                <div className="flex items-center gap-2 mb-6">
                                                                    {previewCats.map((cat, i) => (
                                                                        <div
                                                                            key={cat.id}
                                                                            style={{ zIndex: previewCats.length - i }}
                                                                            className={`w-11 h-11 rounded-full overflow-hidden border-2 border-white shadow-md ${i !== 0 ? '-mr-3' : ''}`}
                                                                            title={cat.name}
                                                                        >
                                                                            <img src={formatImageUrl(cat.image)} className="w-full h-full object-cover" alt={cat.name} />
                                                                        </div>
                                                                    ))}
                                                                    {extraCount > 0 && (
                                                                        <span className="-mr-3 w-11 h-11 rounded-full bg-brand-dark text-white text-[10px] font-bold flex items-center justify-center border-2 border-white z-0">
                                                                            +{extraCount}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}

                                                            <button
                                                                onClick={() => navigate(`/section/${section.id}`)}
                                                                className="inline-flex items-center gap-2 border border-brand-dark text-brand-dark text-xs font-bold uppercase tracking-widest px-7 py-3 hover:bg-brand-dark hover:text-white transition-all duration-300"
                                                            >
                                                                تسوق المجموعة
                                                                <ArrowLeft className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </React.Fragment>
                                            );
                                        })}
                                    </div>
                                </>
                            ) : (
                                /* لو مفيش Sections عرض الكاتيجوريز العادية */
                                <div>
                                    <div className="mb-14 text-center">
                                        <p className="text-brand-gold text-[10px] font-bold uppercase tracking-[0.5em] mb-2">Collections</p>
                                        <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-dark">الأقسام</h2>
                                        <div className="w-14 h-[2px] bg-brand-gold mx-auto mt-4"></div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {categories.map(cat => (
                                            <div key={cat.id} onClick={() => navigate(`/shop?category=${cat.id}`)} className="relative overflow-hidden cursor-pointer group">
                                                <div className="aspect-[4/5] overflow-hidden bg-gray-100">
                                                    <img src={formatImageUrl(cat.image)} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={cat.name} />
                                                </div>
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>
                                                <div className="absolute bottom-0 right-0 left-0 p-6">
                                                    <h3 className="font-display text-white text-2xl font-bold mb-3">{cat.name}</h3>
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
                            <div className="text-center pt-16">
                                <button onClick={() => navigate('/shop')} className="border border-brand-dark text-brand-dark px-12 py-3.5 text-sm font-bold uppercase tracking-widest hover:bg-brand-dark hover:text-white transition-all duration-300">
                                    عرض كل المنتجات
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* مميزات - أرقام بخط Playfair وفواصل رفيعة */}
            <section className="py-16 bg-[#0a0a0a]">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-white/10">
                        {[
                            { num: '30+', label: 'سنة خبرة' },
                            { num: '100%', label: 'قطن طبيعي' },
                            { num: '48h', label: 'توصيل سريع' },
                            { num: '5★', label: 'تقييم العملاء' },
                        ].map((item, i) => (
                            <div key={i} className="text-center py-6 md:py-2 px-2">
                                <p className="font-display text-3xl md:text-4xl font-bold text-brand-gold mb-1">{item.num}</p>
                                <p className="text-gray-400 text-[10px] md:text-[11px] uppercase tracking-[0.15em] md:tracking-[0.2em]">{item.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer strip */}
            <footer className="py-10 bg-[#0a0a0a] text-center border-t border-white/5">
                <p className="text-gray-600 text-xs uppercase tracking-[0.5em]">© 2026 TRES JOLIE FAMILY WEAR. ALL RIGHTS RESERVED.</p>
            </footer>
        </div>
    );
};

export default Home;
