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

  useEffect(() => {
    fetchCart();
  }, []);

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
    <div className="min-h-screen bg-white py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-24">
          <span className="text-brand-gold text-[9px] font-black uppercase tracking-[0.6em] mb-3 block">Your Selection</span>
          <h1 className="text-4xl font-bold text-brand-dark uppercase tracking-tighter font-display italic">حقيبة التسوق</h1>
        </header>
        
        {items.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="w-12 h-12 text-gray-200 mx-auto mb-6" />
            <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-8">حقيبتك فارغة حالياً</p>
            <Link to="/shop" className="bg-brand-dark text-white px-10 py-4 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-brand-gold transition-colors">ابدأ التسوق</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
            <div className={`lg:col-span-7 space-y-12 transition-opacity duration-500 ${updating ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
              {items.map((item) => (
                <div key={item.id} className="flex gap-8 items-start group relative pb-12 border-b border-gray-50 last:border-0">
                  <div className="w-28 h-40 flex-shrink-0 rounded-[2rem] overflow-hidden bg-brand-gray border border-gray-50 shadow-sm transition-transform duration-700 group-hover:scale-[1.02]">
                    <img 
                      src={formatImageUrl(item.image)} 
                      alt={item.product_name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }} 
                    />
                  </div>

                  <div className="flex-1 flex flex-col h-40 justify-between py-2">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <h3 className="text-[12px] font-black text-brand-dark uppercase tracking-widest">{item.product_name}</h3>
                        <button onClick={() => removeItem(item.id)} className="text-gray-200 hover:text-red-500 transition-all"><Trash2 className="w-4 h-4" /></button>
                      </div>
                      <div className="flex gap-3">
                        <span className="text-[9px] font-black text-brand-gold uppercase tracking-[0.2em] bg-brand-gold/5 px-3 py-1 rounded-full">Size: {item.size}</span>
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] px-3 py-1">Price: {item.price} EGP</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-end pt-4">
                      <div className="flex items-center bg-brand-gray rounded-full p-1.5 border border-gray-100">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white"><Minus className="w-3 h-3" /></button>
                        <span className="w-10 text-center text-xs font-black">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white"><Plus className="w-3 h-3" /></button>
                      </div>
                      
                      <div className="text-right">
                         <p className="text-xl font-bold text-brand-dark font-display italic tracking-tight">{item.total_price} <span className="text-[10px] not-italic ml-1">EGP</span></p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-5">
              <div className="bg-brand-dark p-12 rounded-[3rem] text-white sticky top-24 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)] border border-white/5">
                <h2 className="text-[11px] font-black mb-12 border-b border-white/10 pb-6 uppercase tracking-[0.5em] text-brand-gold italic">Cart Summary</h2>
                
                <div className="space-y-6 mb-12">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">المجموع الفرعي</span>
                    <span className="text-sm font-bold tracking-widest">{totalPrice} EGP</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">الشحن</span>
                    <span className="text-[10px] font-black text-brand-gold uppercase tracking-[0.2em]">Free Shipping</span>
                  </div>
                  <div className="pt-8 border-t border-white/10 flex justify-between items-center">
                    <span className="text-white uppercase text-[11px] font-black tracking-[0.3em]">الإجمالي النهائي</span>
                    <div className="text-right">
                      <span className="text-3xl font-bold text-brand-gold font-display italic tracking-tight">{totalPrice}</span>
                      <span className="text-brand-gold text-xs ml-2 font-display italic">EGP</span>
                    </div>
                  </div>
                </div>

                <button onClick={() => navigate('/checkout')} className="group w-full bg-brand-gold text-brand-dark py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-white transition-all duration-700">
                  المتابعة للدفع
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-500" />
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