import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, ChevronLeft, Loader2 } from 'lucide-react';
import { formatImageUrl } from '../utils/helpers';

const SectionCategories = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [section, setSection] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        api.get('/sections/')
            .then(res => {
                const found = res.data.find(s => String(s.id) === String(id));
                setSection(found || null);
            })
            .catch(() => setSection(null))
            .finally(() => setLoading(false));
        window.scrollTo(0, 0);
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="w-8 h-8 text-brand-gold animate-spin" />
            </div>
        );
    }

    if (!section) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-4">
                <p className="text-gray-400">القسم غير موجود</p>
                <button onClick={() => navigate('/')} className="text-brand-gold text-sm font-bold underline">
                    الرجوع للرئيسية
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white" dir="rtl">

            {/* Breadcrumb */}
            <div className="border-b border-gray-100 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center gap-2 text-sm text-gray-400">
                    <button onClick={() => navigate('/')} className="hover:text-brand-dark transition-colors">الرئيسية</button>
                    <ChevronLeft className="w-3 h-3" />
                    <span className="text-brand-dark font-medium">{section.name}</span>
                </div>
            </div>

            {/* عنوان السيكشن */}
            <div className="relative h-[220px] md:h-[320px] overflow-hidden">
                <img
                    src={formatImageUrl(section.image)}
                    className="w-full h-full object-cover"
                    alt={section.name}
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/1200x400'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                    <p className="text-brand-gold text-[10px] font-bold uppercase tracking-[0.5em] mb-2">Collection</p>
                    <h1 className="text-white text-3xl md:text-5xl font-bold">{section.name}</h1>
                </div>
            </div>

            {/* الكاتيجوريز والـ sub category */}
            <div className="max-w-7xl mx-auto px-6 py-14">
                {section.categories && section.categories.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                    <p className="text-gray-400 text-center py-16">لا توجد أقسام فرعية داخل هذا القسم بعد</p>
                )}
            </div>
        </div>
    );
};

export default SectionCategories;
