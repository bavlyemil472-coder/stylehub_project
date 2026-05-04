import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import api from '../services/api';
import { formatImageUrl } from '../utils/helpers';
import { ShoppingBag } from 'lucide-react';

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
            
            let endpoint = '/products/';
            const queries = [];
            if (category) queries.push(`category=${category}`);
            if (search) queries.push(`search=${search}`);
            
            const finalUrl = queries.length > 0 
                ? `${endpoint}?${queries.join('&')}` 
                : endpoint;

            try {
                const res = await api.get(finalUrl);
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

    const searchQuery = new URLSearchParams(location.search).get('search');

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <div className="border-b border-gray-100 px-6 py-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-2xl font-bold text-brand-dark">
                        {searchQuery ? `نتائج البحث: "${searchQuery}"` : 'جميع المنتجات'}
                    </h1>
                    {!loading && (
                        <p className="text-gray-400 text-sm mt-1">
                            {products.length} منتج
                        </p>
                    )}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-10">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-40">
                        <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-400 text-sm">جاري التحميل...</p>
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-40">
                        <ShoppingBag className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                        <p className="text-gray-400 text-sm">لم يتم العثور على منتجات</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {products.map(product => (
                            <Link 
                                key={product.id} 
                                to={`/product/${product.id}`} 
                                className="group"
                            >
                                {/* صورة المنتج */}
                                <div className="relative overflow-hidden bg-gray-50 mb-3">
                                    <div className="aspect-[3/4]">
                                        <img 
                                            src={formatImageUrl(product.image)} 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                            alt={product.name}
                                            onError={(e) => { e.target.src = 'https://via.placeholder.com/400x500'; }}
                                        />
                                    </div>
                                    {/* زرار السلة عند الهوفر */}
                                    <div className="absolute bottom-0 left-0 right-0 bg-brand-dark text-white text-center py-3 text-[11px] font-bold uppercase tracking-widest translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                        عرض المنتج
                                    </div>
                                </div>

                                {/* تفاصيل المنتج */}
                                <div>
                                    <h3 className="text-brand-dark text-sm font-medium mb-1 truncate">
                                        {product.name}
                                    </h3>
                                    <p className="text-brand-dark font-bold text-sm">
                                        {product.price} <span className="text-gray-400 text-xs font-normal">EGP</span>
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
