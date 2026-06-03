import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { ShoppingBag, Wallet, MapPin, User, Phone, ChevronRight, ShieldCheck, Camera, Truck } from 'lucide-react';
import { formatImageUrl } from '../utils/helpers';

const Checkout = () => {
    const navigate = useNavigate();
    const [cart, setCart] = useState(null);
    const [shippingRates, setShippingRates] = useState([]);
    const [selectedShippingPrice, setSelectedShippingPrice] = useState(0);
    const [screenshot, setScreenshot] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

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
        setSelectedShippingPrice(rate ? parseFloat(rate.price) : 0);
    };

    const handleCreateOrder = async (e) => {
        if (e) e.preventDefault();
        if (isSubmitting) return;

        if (!formData.full_name || !formData.address || !formData.phone || !formData.city) {
            toast.error("يرجى ملء جميع بيانات الشحن واختيار المحافظة");
            return;
        }

        if (formData.payment_method === 'INSTAPAY' && !screenshot) {
            toast.error("يرجى رفع صورة سكرين شوت للتحويل");
            return;
        }

        const phoneRegex = /^01[0125][0-9]{8}$/;
        if (!phoneRegex.test(formData.phone)) {
            toast.error("يرجى إدخال رقم هاتف مصري صحيح مكون من 11 رقم");
            return;
        }

        setIsSubmitting(true);
        const loadingToast = toast.loading('جاري معالجة طلبك...');

        try {
            const dataToSend = new FormData();
            Object.keys(formData).forEach(key => dataToSend.append(key, formData[key]));

            if (screenshot) dataToSend.append('payment_screenshot', screenshot);

            const token = localStorage.getItem('access_token');
            if (!token && cart?.items) {
                dataToSend.append('guest_cart', JSON.stringify(
                    cart.items.map(item => ({
                        variant_id: item.variant_id || item.id,
                        quantity: item.quantity
                    }))
                ));
            }

            const response = await api.post('/orders/create/', dataToSend, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast.dismiss(loadingToast);

            if (formData.payment_method === 'visa') {
                if (response.data.payment_url) {
                    toast.success('جاري توجيهك لصفحة الدفع الآمن...');
                    window.location.href = response.data.payment_url;
                } else {
                    toast.error("رابط الدفع غير متاح حالياً، جرب الكاش");
                    setIsSubmitting(false);
                }
            } else {
                toast.success('تم تسجيل طلبك بنجاح! شكراً لثقتك.');
                navigate('/order-success', { state: { orderId: response.data.id } });
            }
        } catch (err) {
            toast.dismiss(loadingToast);
            setIsSubmitting(false);
            const errorMsg = err.response?.data?.error || "حدث خطأ أثناء إتمام الطلب.";
            toast.error(errorMsg);
        }
    };

    if (!cart) return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-2 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-gray-400">جاري التحميل...</p>
            </div>
        </div>
    );

    const totalPrice = parseFloat(cart.total_cart_price || 0) + selectedShippingPrice;

    return (
        <div className="min-h-screen bg-gray-50" dir="rtl">

            {/* Header */}
            <div className="bg-white border-b border-gray-100 px-6 py-5">
                <div className="max-w-5xl mx-auto flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-brand-gold" />
                    <div>
                        <p className="text-xs text-gray-400 font-medium">Secure Checkout</p>
                        <h1 className="text-xl font-bold text-brand-dark">إتمام الطلب</h1>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* ===== الفورم ===== */}
                <div className="lg:col-span-7 space-y-6">

                    {/* بيانات الشحن */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                        <h2 className="text-base font-bold text-brand-dark mb-5 flex items-center gap-2">
                            <span className="w-7 h-7 bg-brand-dark text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                            بيانات الشحن
                        </h2>

                        <div className="space-y-4">
                            {/* الاسم */}
                            <div>
                                <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
                                    <User className="w-3.5 h-3.5 text-brand-gold" /> الاسم الكامل
                                </label>
                                <input
                                    type="text" required
                                    disabled={isSubmitting}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3.5 px-4 text-sm text-brand-dark focus:bg-white focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/10 transition-all outline-none"
                                    placeholder="مثال: أحمد محمد علي"
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                />
                            </div>

                            {/* الهاتف */}
                            <div>
                                <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
                                    <Phone className="w-3.5 h-3.5 text-brand-gold" /> رقم الهاتف
                                </label>
                                <input
                                    type="tel" required
                                    disabled={isSubmitting}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3.5 px-4 text-sm text-brand-dark focus:bg-white focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/10 transition-all outline-none"
                                    placeholder="01xxxxxxxxx"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>

                            {/* المحافظة */}
                            <div>
                                <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
                                    <MapPin className="w-3.5 h-3.5 text-brand-gold" /> المحافظة
                                </label>
                                <select
                                    required
                                    disabled={isSubmitting}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3.5 px-4 text-sm text-brand-dark focus:bg-white focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/10 transition-all outline-none cursor-pointer"
                                    value={formData.city}
                                    onChange={(e) => handleCityChange(e.target.value)}
                                >
                                    <option value="">اختر المحافظة...</option>
                                    {shippingRates.map(rate => (
                                        <option key={rate.id} value={rate.city_name}>
                                            {rate.city_name} — {rate.price} EGP شحن
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* العنوان */}
                            <div>
                                <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
                                    <MapPin className="w-3.5 h-3.5 text-brand-gold" /> عنوان التوصيل التفصيلي
                                </label>
                                <textarea
                                    required
                                    disabled={isSubmitting}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3.5 px-4 text-sm text-brand-dark focus:bg-white focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/10 transition-all outline-none min-h-[90px] resize-none"
                                    placeholder="المنطقة، اسم الشارع، رقم المنزل..."
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* طريقة الدفع */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                        <h2 className="text-base font-bold text-brand-dark mb-5 flex items-center gap-2">
                            <span className="w-7 h-7 bg-brand-dark text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                            طريقة الدفع
                        </h2>

                        <div className="grid grid-cols-2 gap-3">
                            {/* كاش */}
                            <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={() => setFormData({ ...formData, payment_method: 'cash' })}
                                className={`flex flex-col items-center gap-2.5 py-5 px-4 rounded-xl border-2 transition-all duration-300 ${formData.payment_method === 'cash'
                                    ? 'border-brand-gold bg-brand-dark text-white shadow-lg'
                                    : 'border-gray-200 text-gray-500 bg-white hover:border-gray-300'}`}
                            >
                                <Wallet className={`w-6 h-6 ${formData.payment_method === 'cash' ? 'text-brand-gold' : 'text-gray-400'}`} />
                                <span className="text-sm font-bold">كاش عند الاستلام</span>
                            </button>

                            {/* InstaPay */}
                            <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={() => setFormData({ ...formData, payment_method: 'INSTAPAY' })}
                                className={`flex flex-col items-center gap-2.5 py-5 px-4 rounded-xl border-2 transition-all duration-300 ${formData.payment_method === 'INSTAPAY'
                                    ? 'border-brand-gold bg-brand-dark text-white shadow-lg'
                                    : 'border-gray-200 text-gray-500 bg-white hover:border-gray-300'}`}
                            >
                                <span className={`text-lg font-black italic ${formData.payment_method === 'INSTAPAY' ? 'text-brand-gold' : 'text-gray-400'}`}>IP</span>
                                <span className="text-sm font-bold">InstaPay</span>
                            </button>
                        </div>

                        {/* InstaPay تفاصيل */}
                        {formData.payment_method === 'INSTAPAY' && (
                            <div className="mt-4 p-5 bg-amber-50 border border-amber-200 rounded-xl">
                                <p className="text-sm font-bold text-gray-700 mb-1">حوّل على:</p>
                                <p className="text-base font-black text-brand-dark select-all mb-4 font-mono">
                                    youssefjan3@instapay
                                </p>
                                <p className="text-sm font-bold text-gray-700 mb-1">أو على الرقم:</p>
                                <p className="text-base font-black text-brand-dark select-all mb-4 font-mono">
                                    01212846565
                                </p>

                                <div className="relative">
                                    <input
                                        type="file" accept="image/*"
                                        disabled={isSubmitting}
                                        onChange={(e) => setScreenshot(e.target.files[0])}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    <div className={`border-2 border-dashed rounded-xl py-4 px-5 flex items-center gap-3 transition-colors ${screenshot ? 'border-green-400 bg-green-50' : 'border-gray-300 bg-white hover:border-brand-gold'}`}>
                                        <Camera className={`w-5 h-5 flex-shrink-0 ${screenshot ? 'text-green-500' : 'text-brand-gold'}`} />
                                        <span className="text-sm font-medium text-gray-600 truncate">
                                            {screenshot ? `✅ ${screenshot.name}` : "ارفع سكرين شوت التحويل"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* زرار الإرسال — موبايل بس */}
                    <button
                        onClick={handleCreateOrder}
                        disabled={isSubmitting}
                        className={`lg:hidden w-full py-4 rounded-xl text-base font-bold flex items-center justify-center gap-2 transition-all
                            ${isSubmitting ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-brand-dark text-white hover:bg-brand-gold hover:text-brand-dark'}`}
                    >
                        {isSubmitting ? 'جاري المعالجة...' : 'إتمام الطلب'}
                        {!isSubmitting && <ChevronRight className="w-4 h-4" />}
                    </button>
                </div>

                {/* ===== ملخص الطلب ===== */}
                <div className="lg:col-span-5">
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden sticky top-24">
                        {/* العنوان */}
                        <div className="bg-brand-dark px-6 py-4 flex items-center justify-between">
                            <h2 className="text-white font-bold text-base">ملخص الطلب</h2>
                            <ShoppingBag className="w-5 h-5 text-brand-gold" />
                        </div>

                        {/* المنتجات */}
                        <div className="p-5 space-y-4 max-h-[320px] overflow-y-auto">
                            {(cart.items || []).map((item) => (
                                <div key={item.id} className="flex gap-3 items-start">
                                    <div className="relative flex-shrink-0">
                                        <div className="w-14 h-18 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                                            <img
                                                src={formatImageUrl(item.image)}
                                                alt={item.product_name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <span className="absolute -top-1.5 -right-1.5 bg-brand-gold text-brand-dark w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black">
                                            {item.quantity}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-brand-dark leading-tight line-clamp-2">{item.product_name}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">مقاس: {item.size}</p>
                                    </div>
                                    <p className="text-sm font-bold text-brand-dark flex-shrink-0">
                                        {(item.price * item.quantity).toFixed(0)} EGP
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* التفاصيل المالية */}
                        <div className="border-t border-gray-100 p-5 space-y-3">
                            <div className="flex justify-between items-center text-sm text-gray-500">
                                <span>المنتجات</span>
                                <span className="font-semibold text-brand-dark">{parseFloat(cart.total_cart_price || 0).toFixed(0)} EGP</span>
                            </div>
                            <div className="flex justify-between items-center text-sm text-gray-500">
                                <span className="flex items-center gap-1.5">
                                    <Truck className="w-3.5 h-3.5" /> الشحن
                                </span>
                                <span className="font-semibold text-brand-dark">
                                    {selectedShippingPrice > 0 ? `${selectedShippingPrice} EGP` : '—'}
                                </span>
                            </div>

                            <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                                <span className="text-base font-bold text-brand-dark">الإجمالي</span>
                                <span className="text-xl font-black text-brand-gold">{totalPrice.toFixed(0)} EGP</span>
                            </div>
                        </div>

                        {/* زرار إتمام الطلب */}
                        <div className="px-5 pb-5">
                            <button
                                onClick={handleCreateOrder}
                                disabled={isSubmitting}
                                className={`w-full py-4 rounded-xl text-base font-bold flex items-center justify-center gap-2 transition-all
                                    ${isSubmitting ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-brand-dark text-white hover:bg-brand-gold hover:text-brand-dark'}`}
                            >
                                {isSubmitting ? 'جاري المعالجة...' : 'إتمام الطلب الآن'}
                                {!isSubmitting && <ChevronRight className="w-4 h-4" />}
                            </button>
                            <p className="text-xs text-gray-400 text-center mt-3 flex items-center justify-center gap-1">
                                <ShieldCheck className="w-3 h-3" /> دفع آمن ومحمي
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
