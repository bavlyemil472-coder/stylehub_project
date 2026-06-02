import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { formatImageUrl } from '../utils/helpers';
import { ShoppingBag, ChevronLeft } from 'lucide-react';

const Shop = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [subcategories, setSubcategories] = useState([]);
    const [categoryName, setCategoryName] = useState('');
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            const params = new URLSearchParams(location.search);
            const category = params.get('category');
            const subcategory = params.get('subcategory');
            const search = params.get('search');
            const section = params.get('section');

            let endpoint = '/products/';
            const queries = [];
            if (category) queries.push(`category=${category}`);
            if (subcategory) queries.push(`subcategory=${subcategory}`);
            if (search) queries.push(`search=${search}`);
            if (section) queries.push(`section=${section}`);

            const finalUrl = queries.length > 0 ? `${endpoint}?${queries.join('&')}` : endpoint;

            try {
                const res = await api.get(finalUrl);
                setProducts(Array.isArray(res.data) ? res.data : res.data.results || []);

                if (category) {
                    const catRes = await api.get(`/subcategories/?category=${category}`);
                    setSubcategories(catRes.data);
                    const allCats = await api.get('/categories/');
                    const cat = allCats.data.find(c => c.id === parseInt(category));
                    if (cat) setCategoryName(cat.name);
                } else {
                    setSubcategories([]);
                    setCategoryName('');
                }
            } catch (err) {
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [location.search]);

    const params = new URLSearchParams(location.search);
    const searchQuery = params.get('search');
    const currentCategory = params.get('category');
    const currentSubcategory = params.get('subcategory');

    return (
        <div className="min-h-screen bg-white" dir="rtl">

            {/* Header */}
            <div className="px-6 py-6 border-b border-gray-100">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-2xl font-bold text-brand-dark">
                        {searchQuery ? `نتائج: "${searchQuery}"` : categoryName || 'جميع المنتجات'}
                    </h1>
                    {!loading && <p className="text-gray-400 text-sm mt-1">{products.length} منتج</p>}
                </div>
            </div>

            {/* Subcategory Filters */}
            {subcategories.length > 0 && (
                <div className="border-b border-gray-100 px-6 py-3">
                    <div className="max-w-7xl mx-auto flex gap-3 overflow-x-auto pb-1">
                        <button
                            onClick={() => navigate(`/shop?category=${currentCategory}`)}
                            className={`text-sm font-bold px-4 py-2 whitespace-nowrap transition-all ${!currentSubcategory ? 'bg-brand-dark text-white' : 'border border-gray-200 text-gray-600 hover:border-brand-gold hover:text-brand-gold'}`}
                        >
                            الكل
                        </button>
                        {subcategories.map(sub => (
                            <button
                                key={sub.id}
                                onClick={() => navigate(`/shop?category=${currentCategory}&subcategory=${sub.id}`)}
                                className={`text-sm font-bold px-4 py-2 whitespace-nowrap transition-all ${currentSubcategory === String(sub.id) ? 'bg-brand-dark text-white' : 'border border-gray-200 text-gray-600 hover:border-brand-gold hover:text-brand-gold'}`}
                            >
                                {sub.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

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
                                    <div className="aspect-[3/4]">
                                        <img
                                            src={formatImageUrl(product.image)}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            alt={product.name}
                                            onError={(e) => { e.target.src = 'https://via.placeholder.com/400x500'; }}
                                        />
                                    </div>

                                    {/* ✅ Badge الخصم على الكارد */}
                                    {product.discount > 0 && (
                                        <div className="absolute top-2 right-2 bg-red-600 text-white text-[11px] font-bold px-2 py-1 z-10">
                                            -{product.discount}%
                                        </div>
                                    )}

                                    <div className="absolute bottom-0 left-0 right-0 bg-brand-dark/90 text-white text-center py-3 text-sm font-bold translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-center justify-center gap-2">
                                        <ShoppingBag className="w-4 h-4" />
                                        أضف للسلة
                                    </div>
                                </Link>

                                <Link to={`/product/${product.id}`} className="flex flex-col flex-1">
                                    <h3 className="text-brand-dark text-base font-semibold mb-1 leading-snug line-clamp-2">{product.name}</h3>

                                    {/* ✅ السعر مع الخصم */}
                                    <div className="mt-auto">
                                        <p className="text-brand-dark font-bold text-base">
                                            {product.price}{' '}
                                            <span className="text-gray-400 text-sm font-normal">EGP</span>
                                        </p>
                                        {product.original_price && (
                                            <p className="text-xs text-gray-400 line-through">
                                                {product.original_price} EGP
                                            </p>
                                        )}
                                    </div>
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
