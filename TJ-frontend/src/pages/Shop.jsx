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
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [location.search]);

    const searchQuery = new URLSearchParams(location.search).get('search');

    return (
        <div className="min-h-screen bg-white" dir="rtl">
            <div className="px-6 py-8 border-b border-gray-100">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-brand-dark">
                            {searchQuery ? `نتائج: "${searchQuery}"` : 'جميع المنتجات'}
                        </h1>
                        {!loading && (
                            <p className="text-gray-400 text-sm mt-1">{products.length} منتج</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-40">
                        <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-400 text-sm">جاري التحميل...</p>
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-40">
                        <ShoppingBag className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                        <p className="text-gray-500 text-base font-medium">لم يتم العثور على منتجات</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10">
                        {products.map(product => (
                            <div key={product.id} className="group flex flex-col">
                                <Link to={`/product/${product.id}`} className="relative overflow-hidden bg-gray-50 block mb-3">
                                    <div className="aspect-[3/4]"> {/* ✅ */}
                                        <img 
                                            src={formatImageUrl(product.image)} 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                            alt={product.name}
                                            onError={(e) => { e.target.src = 'https://via.placeholder.com/400x500'; }}
                                        />
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 bg-brand-dark/90 text-white text-center py-3 text-sm font-bold translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-center justify-center gap-2">
                                        <ShoppingBag className="w-4 h-4" />
                                        أضف للسلة
                                    </div>
                                </Link>

                                <Link to={`/product/${product.id}`} className="flex flex-col flex-1">
                                    <h3 className="text-brand-dark text-base font-semibold mb-1 leading-snug line-clamp-2">
                                        {product.name}
                                    </h3>
                                    <p className="text-brand-dark font-bold text-base mt-auto">
                                        {product.price}{' '}
                                        <span className="text-gray-400 text-sm font-normal">EGP</span>
                                    </p>
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Shop;
