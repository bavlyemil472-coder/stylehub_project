import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { formatImageUrl } from '../utils/helpers';

const Cart = () => {
  const [items, setItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      const response = await api.get('/cart/');
      setItems(response.data.items || []);
      setTotalPrice(response.data.total_cart_price || 0);
    } catch (error) {
      console.error("Cart Fetch Error:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCart(); }, []);

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      setUpdating(true);
      await api.put(`/cart/update/${itemId}/`, { quantity: newQuantity });
      await fetchCart();
    } catch (error) {
      toast.error("فشل في تحديث الكمية");
    } finally {
      setUpdating(false);
    }
  };

  const removeItem = async (itemId) => {
    try {
      setUpdating(true);
      await api.delete(`/cart/remove/${itemId}/`);
      toast.success("تم الحذف من السلة");
      await fetchCart();
    } catch (error) {
      toast.error("فشل في حذف المنتج");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white" dir="rtl">

      {/* Header */}
      <div className="border-b border-gray-100 px-6 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-brand-dark">حقيبة التسوق</h1>
          {items.length > 0 && (
            <span className="text-gray-400 text-sm">{items.length} منتج</span>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {items.length === 0 ? (
          <div className="text-center py-32">
            <ShoppingBag className="w-16 h-16 text-gray-200 mx-auto mb-6" />
            <p className="text-gray-400 text-base font-medium mb-8">حقيبتك فارغة حالياً</p>
            <Link to="/shop" className="bg-brand-dark text-white px-10 py-3.5 text-sm font-bold uppercase tracking-widest hover:bg-brand-gold transition-colors">
              ابدأ التسوق
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

            {/* المنتجات */}
            <div className={`lg:col-span-7 transition-opacity duration-300 ${updating ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
              {items.map((item, idx) => (
                <div key={item.id} className={`flex gap-6 py-6 ${idx !== items.length - 1 ? 'border-b border-gray-100' : ''}`}>
                  {/* الصورة */}
                  <Link to={`/product/${item.variant}`} className="w-24 h-32 flex-shrink-0 overflow-hidden bg-gray-50">
                    <img
                      src={formatImageUrl(item.image)}
                      alt={item.product_name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }}
                    />
                  </Link>

                  {/* التفاصيل */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-base font-bold text-brand-dark mb-1">{item.product_name}</h3>
                        <p className="text-sm text-gray-400">المقاس: {item.size}</p>
                        <p className="text-sm font-bold text-brand-gold mt-1">{item.price} EGP</p>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* الكمية والإجمالي */}
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center border border-gray-200">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1} className="px-3 py-2 hover:bg-gray-50 text-lg disabled:opacity-30">−</button>
                        <span className="px-4 py-2 text-sm font-bold border-x border-gray-200">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-3 py-2 hover:bg-gray-50 text-lg">+</button>
                      </div>
                      <p className="text-base font-bold text-brand-dark">{item.total_price} EGP</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* الملخص */}
            <div className="lg:col-span-5">
              <div className="bg-brand-dark p-8 text-white sticky top-24">
                <h2 className="text-sm font-bold uppercase tracking-widest text-brand-gold mb-8 pb-4 border-b border-white/10">
                  ملخص الطلب
                </h2>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">المجموع الفرعي</span>
                    <span className="text-sm font-bold">{totalPrice} EGP</span>
                  </div>
                  {/* ✅ شيلنا Free Shipping */}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">الشحن</span>
                    <span className="text-gray-400 text-sm">يحدد عند الدفع</span>
                  </div>
                  <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                    <span className="text-white font-bold">الإجمالي</span>
                    <span className="text-2xl font-bold text-brand-gold">{totalPrice} EGP</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-brand-gold text-brand-dark py-4 text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-white transition-all duration-300"
                >
                  المتابعة للدفع
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
