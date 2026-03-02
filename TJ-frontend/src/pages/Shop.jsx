import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import api from '../services/api';

const Shop = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            const params = new URLSearchParams(location.search);
            const category = params.get('category');
            const search = params.get('search');
            
            // الإصلاح: استخدام مسار نسبي نظيف
            // api.js baseURL = http://127.0.0.1:8000/api
            let endpoint = '/products/'; 
            
            const queries = [];
            if (category) queries.push(`category=${category}`);
            if (search) queries.push(`search=${search}`);
            
            const finalUrl = queries.length > 0 
                ? `${endpoint}?${queries.join('&')}` 
                : endpoint;

            try {
                const res = await api.get(finalUrl);
                // تأكد من أن الـ Backend يرسل المصفوفة مباشرة أو داخل كائن
                setProducts(Array.isArray(res.data) ? res.data : res.data.results || []);
            } catch (err) {
                console.error("Shop Fetch Error:", err);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [location.search]);

    return (
        <div className="min-h-screen bg-white py-20 px-6">
            <div className="max-w-7xl mx-auto">
                <header className="mb-16 text-center md:text-left">
                    <h1 className="text-5xl font-black text-brand-dark italic uppercase tracking-tighter">
                        {new URLSearchParams(location.search).get('search') ? 'نتائج البحث' : 'تشكيلتنا'}
                    </h1>
                    <div className="h-1 w-20 bg-brand-gold mt-4 mx-auto md:mx-0"></div>
                </header>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-10 h-10 border-4 border-brand-gold border-t-transparent rounded-full animate-spin mb-4"></div>
                        <div className="font-black italic text-brand-dark tracking-widest uppercase">Loading...</div>
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed border-gray-100 rounded-[3rem]">
                        <p className="font-bold text-gray-400 uppercase tracking-widest">لم يتم العثور على منتجات.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
                        {products.map(product => (
                            <Link key={product.id} to={`/product/${product.id}`} className="group">
                                {/* Product Image Container */}
                                <div className="aspect-[3/4] rounded-[2.5rem] overflow-hidden bg-gray-50 mb-6 shadow-sm group-hover:shadow-2xl transition-all duration-700 relative">
                                    <img 
                                        src={product.image} 
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                                        alt={product.name}
                                    />
                                    {/* Overlay for hover */}
                                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </div>

                                {/* Product Info */}
                                <div className="px-2">
                                    <h3 className="font-black text-brand-dark uppercase text-xs mb-2 tracking-wider group-hover:text-brand-gold transition-colors italic">
                                        {product.name}
                                    </h3>
                                    <p className="text-brand-dark font-light text-lg tracking-tight">
                                        <span className="font-bold">{product.price}</span> 
                                        <span className="text-[10px] ml-1 font-black uppercase text-gray-400">EGP</span>
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Shop;