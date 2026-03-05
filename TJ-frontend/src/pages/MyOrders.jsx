import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Package, Clock, CheckCircle2, Truck, AlertCircle, ChevronRight, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatImageUrl } from '../utils/helpers'; 

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await api.get('/orders/my/');
                setOrders(response.data);
            } catch (err) {
                setError("فشل في تحميل الطلبات، يرجى المحاولة لاحقاً.");
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const getStatusStyle = (status) => {
        const s = status.toLowerCase();
        if (s.includes('deliver')) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
        if (s.includes('ship') || s.includes('route')) return 'text-blue-600 bg-blue-50 border-blue-100';
        if (s.includes('pend') || s.includes('process')) return 'text-brand-gold bg-brand-gold/5 border-brand-gold/20';
        if (s.includes('cancel')) return 'text-red-600 bg-red-50 border-red-100';
        return 'text-gray-500 bg-gray-50 border-gray-100';
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white">
            <div className="w-12 h-12 border-[3px] border-brand-gold/10 border-t-brand-gold rounded-full animate-spin mb-6"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-dark animate-pulse">Tri Jolie Logistics</p>
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex items-center justify-center bg-white px-6">
            <div className="text-center max-w-xs">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
                <p className="text-[11px] font-bold text-brand-dark uppercase tracking-widest leading-relaxed">{error}</p>
                <button onClick={() => window.location.reload()} className="mt-6 text-[9px] font-black text-brand-gold uppercase tracking-[0.3em] border-b border-brand-gold pb-1">إعادة المحاولة</button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-white py-24 px-6">
            <div className="max-w-3xl mx-auto">
                <header className="mb-24 text-center">
                    <span className="text-brand-gold font-black uppercase tracking-[0.5em] text-[9px] mb-3 block">Member Archive</span>
                    <h1 className="text-4xl font-bold font-display italic text-brand-dark uppercase tracking-tighter">سجل الطلبات</h1>
                    <div className="h-[2px] w-12 bg-brand-gold mx-auto mt-6"></div>
                </header>
                
                {orders.length === 0 ? (
                    <div className="py-24 text-center border-2 border-dashed border-brand-gray rounded-[3rem] bg-brand-gray/10">
                        <ShoppingBag className="w-10 h-10 mx-auto text-gray-200 mb-8" />
                        <h3 className="text-xs font-black text-brand-dark uppercase tracking-[0.2em] mb-3">خزانتك فارغة حالياً</h3>
                        <p className="text-gray-400 text-[10px] uppercase tracking-[0.2em] mb-10 italic font-medium px-10 leading-relaxed">لم تقم بإجراء أي طلبات بعد. اكتشف مجموعتنا الجديدة الآن.</p>
                        <button 
                            onClick={() => navigate('/shop')} 
                            className="bg-brand-dark text-white px-10 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-brand-gold hover:text-brand-dark transition-all duration-500 shadow-xl shadow-brand-dark/10"
                        >
                            بدء التسوق
                        </button>
                    </div>
                ) : (
                    <div className="space-y-16">
                        {orders.map((order) => (
                            <div key={order.id} className="group">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 pb-8 border-b border-gray-100 group-hover:border-brand-gold/30 transition-all duration-500">
                                    
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-4">
                                            <h3 className="text-xl font-bold text-brand-dark font-display italic tracking-tight">#{order.id}</h3>
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border ${getStatusStyle(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 text-gray-400">
                                            <Clock className="w-3 h-3" />
                                            <p className="text-[10px] font-bold uppercase tracking-widest">
                                                {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between w-full md:w-auto md:gap-12">
                                        <div className="text-left md:text-right">
                                            <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1.5 opacity-60">Total Value</p>
                                            <p className="text-2xl font-bold text-brand-dark font-display italic leading-none">{order.total_amount} <span className="text-[11px] font-sans not-italic ml-1">EGP</span></p>
                                        </div>
                                        <button className="w-10 h-10 bg-brand-gray/50 rounded-full flex items-center justify-center group-hover:bg-brand-dark group-hover:text-white transition-all duration-500">
                                            <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-6 flex flex-wrap gap-6 overflow-x-auto pb-2 scrollbar-hide">
                                    {order.items?.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-4 bg-brand-gray/20 px-4 py-2 rounded-2xl border border-transparent hover:border-brand-gold/10 transition-colors">
                                            <div className="relative">
                                                <div className="w-10 h-10 bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
                                                    {item.product_image ? (
                                                        <img 
                                                            src={formatImageUrl(item.product_image)} 
                                                            className="w-full h-full object-cover" 
                                                            alt={item.product_name} 
                                                        />
                                                    ) : (
                                                        <Package className="w-full h-full p-2.5 text-gray-200" />
                                                    )}
                                                </div>
                                                <span className="absolute -top-2 -right-2 w-5 h-5 bg-brand-dark text-white text-[8px] font-black rounded-full flex items-center justify-center shadow-md">
                                                    {item.quantity}
                                                </span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-brand-dark uppercase tracking-tight truncate max-w-[120px]">{item.product_name}</span>
                                                <span className="text-[9px] text-brand-gold font-bold italic uppercase tracking-widest">Size: {item.size}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <footer className="mt-40 text-center opacity-40">
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.8em]">Authentic Quality &bull; Tri Jolie</p>
                </footer>
            </div>
        </div>
    );
};

export default MyOrders;