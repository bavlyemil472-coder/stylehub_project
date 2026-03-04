import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { ShoppingBag, Truck, CreditCard, Wallet, MapPin, User, Phone, ChevronRight, ShieldCheck } from 'lucide-react';

const Checkout = () => {
    const navigate = useNavigate();
    const [cart, setCart] = useState(null);
    const [shippingRates, setShippingRates] = useState([]); 
    const [selectedShippingPrice, setSelectedShippingPrice] = useState(0); 
    
    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        address: '',
        city: '', 
        payment_method: 'cash'
    });

    useEffect(() => {
        
        api.get('/cart/') 
            .then(res => setCart(res.data))
            .catch(() => {
                toast.error("عذراً، السلة فارغة أو حدث خطأ في التحميل");
                navigate('/shop');
            });

        
        api.get('/shipping-rates/')
            .then(res => setShippingRates(res.data))
            .catch(err => console.error("Error fetching shipping rates:", err));
    }, [navigate]);

    
    const handleCityChange = (cityName) => {
        const rate = shippingRates.find(r => r.city_name === cityName);
        setFormData({ ...formData, city: cityName });
        
        if (rate) {
            setSelectedShippingPrice(parseFloat(rate.price));
        } else {
            setSelectedShippingPrice(0);
        }
    };

    const handleCreateOrder = async (e) => {
        if (e) e.preventDefault();
        
        if (!formData.full_name || !formData.address || !formData.phone || !formData.city) {
            toast.error("يرجى ملء جميع بيانات الشحن واختيار المحافظة");
            return;
        }

        const phoneRegex = /^01[0125][0-9]{8}$/; 
        if (!phoneRegex.test(formData.phone)) {
            toast.error("يرجى إدخال رقم هاتف مصري صحيح مكون من 11 رقم");
            return;
        }

        const loadingToast = toast.loading('جاري معالجة طلبك...');

        try {
            const response = await api.post('/orders/create/', formData);
            toast.dismiss(loadingToast);

            if (formData.payment_method === 'visa') {
                if (response.data.payment_url) {
                    toast.success('جاري توجيهك لصفحة الدفع الآمن...');
                    window.location.href = response.data.payment_url;
                } else {
                    toast.error("رابط الدفع غير متاح حالياً، جرب الكاش");
                }
            } else {
                toast.success('تم تسجيل طلبك بنجاح! شكراً لثقتك.');
                navigate('/order-success', { state: { orderId: response.data.id } });
            }
        } catch (err) {
            toast.dismiss(loadingToast);
            const errorMsg = err.response?.data?.error || "حدث خطأ أثناء إتمام الطلب.";
            toast.error(errorMsg);
        }
    };

    if (!cart) return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-brand-gold border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-gold">جاري تأمين الاتصال...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-white py-20 px-6">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">
                
                
                <div className="lg:col-span-7">
                    <header className="mb-12">
                        <div className="flex items-center gap-2 mb-2">
                             <ShieldCheck className="w-4 h-4 text-brand-gold" />
                             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Secure Checkout</span>
                        </div>
                        <h1 className="text-3xl font-bold font-display italic text-brand-dark uppercase tracking-tight">إتمام الطلب</h1>
                        <div className="h-[2px] w-12 bg-brand-gold mt-4"></div>
                    </header>

                    <form className="space-y-10" onSubmit={handleCreateOrder}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-dark">
                                    <User className="w-3 h-3" /> الاسم الكامل
                                </label>
                                <input 
                                    type="text" 
                                    required
                                    className="w-full bg-brand-gray/50 border border-transparent rounded-2xl py-4 px-5 text-sm font-bold text-brand-dark focus:bg-white focus:border-brand-gold transition-all outline-none"
                                    placeholder="الاسم الكامل كما هو مطلوب..."
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-dark">
                                    <Phone className="w-3 h-3" /> رقم الهاتف
                                </label>
                                <input 
                                    type="tel" 
                                    required
                                    className="w-full bg-brand-gray/50 border border-transparent rounded-2xl py-4 px-5 text-sm font-bold text-brand-dark focus:bg-white focus:border-brand-gold transition-all outline-none"
                                    placeholder="01xxxxxxxxx"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                />
                            </div>
                        </div>

                        
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-dark">
                                <MapPin className="w-3 h-3" /> المحافظة
                            </label>
                            <select 
                                required
                                className="w-full bg-brand-gray/50 border border-transparent rounded-2xl py-4 px-5 text-sm font-bold text-brand-dark focus:bg-white focus:border-brand-gold transition-all outline-none appearance-none cursor-pointer"
                                value={formData.city}
                                onChange={(e) => handleCityChange(e.target.value)}
                            >
                                <option value="">اختر المحافظة...</option>
                                {shippingRates.map(rate => (
                                    <option key={rate.id} value={rate.city_name}>
                                        {rate.city_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-dark">
                                <MapPin className="w-3 h-3" /> عنوان التوصيل التفصيلي
                            </label>
                            <textarea 
                                required
                                className="w-full bg-brand-gray/50 border border-transparent rounded-2xl py-4 px-5 text-sm font-bold text-brand-dark focus:bg-white focus:border-brand-gold transition-all min-h-[100px] outline-none"
                                placeholder="المنطقة، اسم الشارع، رقم المنزل..."
                                value={formData.address}
                                onChange={(e) => setFormData({...formData, address: e.target.value})}
                            />
                        </div>

                        <div className="pt-6">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6">اختر وسيلة الدفع المفضلة</h3>
                            <div className="grid grid-cols-2 gap-6">
                                <button 
                                    type="button"
                                    onClick={() => setFormData({...formData, payment_method: 'cash'})}
                                    className={`flex flex-col items-center gap-3 py-6 px-4 rounded-[2rem] border-2 transition-all duration-500 ${formData.payment_method === 'cash' ? 'border-brand-gold bg-brand-dark text-white' : 'border-brand-gray text-gray-400 bg-white hover:border-brand-gold/30'}`}
                                >
                                    <Wallet className={`w-6 h-6 ${formData.payment_method === 'cash' ? 'text-brand-gold' : ''}`} />
                                    <span className="font-black uppercase text-[10px] tracking-widest">الدفع عند الاستلام</span>
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setFormData({...formData, payment_method: 'visa'})}
                                    className={`flex flex-col items-center gap-3 py-6 px-4 rounded-[2rem] border-2 transition-all duration-500 ${formData.payment_method === 'visa' ? 'border-brand-gold bg-brand-dark text-white' : 'border-brand-gray text-gray-400 bg-white hover:border-brand-gold/30'}`}
                                >
                                    <CreditCard className={`w-6 h-6 ${formData.payment_method === 'visa' ? 'text-brand-gold' : ''}`} />
                                    <span className="font-black uppercase text-[10px] tracking-widest">بطاقة ائتمان</span>
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                
                <div className="lg:col-span-5">
                    <div className="bg-brand-dark rounded-[3rem] p-10 text-white sticky top-24 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] border border-white/5">
                        <h2 className="text-[11px] font-black mb-10 border-b border-white/10 pb-6 uppercase tracking-[0.5em] text-brand-gold flex justify-between items-center">
                            <span>Order Summary</span>
                            <ShoppingBag className="w-4 h-4" />
                        </h2>

                        <div className="space-y-8 max-h-[350px] overflow-y-auto mb-10 pr-2 custom-scrollbar">
                            {(cart.items || []).map((item) => (
                                <div key={item.id} className="flex justify-between items-start group">
                                    <div className="flex gap-4">
                                        <div className="relative">
                                            <div className="w-16 h-20 bg-white/5 rounded-2xl flex items-center justify-center text-[10px] font-bold text-brand-gold border border-white/10 overflow-hidden">
                                                <img 
                                                    src={item.image.startsWith('http') ? item.image : `http://127.0.0.1:8000${item.image}`} 
                                                    alt={item.product_name} 
                                                    className="w-full h-full object-cover opacity-90" 
                                                />
                                            </div>
                                            <span className="absolute -top-2 -right-2 bg-brand-gold text-brand-dark w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black">
                                                {item.quantity}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-bold uppercase text-[11px] tracking-tight text-white mb-1">{item.product_name}</p>
                                            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Size: {item.size}</p>
                                            <p className="text-[10px] text-brand-gold/60 mt-1 font-bold">{item.price} EGP</p>
                                        </div>
                                    </div>
                                    <p className="text-sm font-bold text-brand-gold italic">
                                        {(item.price * item.quantity).toFixed(0)} EGP
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="pt-10 border-t border-white/10 space-y-4">
                            <div className="flex justify-between items-center text-gray-400">
                                <span className="text-[10px] font-bold uppercase tracking-widest">الشحن</span>
                                <span className="text-[10px] font-bold uppercase text-brand-gold">
                                    {selectedShippingPrice > 0 ? `${selectedShippingPrice} EGP` : "اختر المحافظة"}
                                </span>
                            </div>
                            <div className="flex justify-between items-center mb-12">
                                <span className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[11px]">المجموع النهائي</span>
                                <div className="text-right">
                                    <span className="text-3xl font-bold text-brand-gold font-display italic tracking-tight">
                                        
                                        {parseFloat(cart.total_cart_price || 0) + selectedShippingPrice}
                                    </span>
                                    <span className="text-brand-gold text-[10px] ml-2 font-black uppercase">EGP</span>
                                </div>
                            </div>
                            
                            <button 
                                onClick={handleCreateOrder}
                                className="w-full bg-brand-gold text-brand-dark py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-[11px] hover:bg-white hover:scale-[1.02] transition-all duration-500 flex items-center justify-center gap-3 shadow-xl shadow-brand-gold/10 group"
                            >
                                إتمام الطلب الآن
                                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Checkout;
