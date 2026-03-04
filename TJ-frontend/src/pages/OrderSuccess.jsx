import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, ArrowRight, Truck, Sparkles, ShoppingBag } from 'lucide-react';

const OrderSuccess = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  const orderId = location.state?.orderId || queryParams.get('merchant_order_id') || queryParams.get('order_id');

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 py-12">
      <div className="max-w-sm w-full text-center">
        
        <div className="relative mb-12 inline-block">
          <div className="absolute inset-0 bg-brand-gold/10 rounded-full scale-[2.5] blur-3xl animate-pulse"></div>
          <div className="relative z-10 w-20 h-20 bg-brand-dark rounded-full flex items-center justify-center shadow-2xl">
            <CheckCircle className="w-10 h-10 text-brand-gold" />
          </div>
          <Sparkles className="absolute -top-2 -right-2 w-5 h-5 text-brand-gold animate-bounce" />
        </div>

        <h1 className="text-2xl font-bold font-display italic text-brand-dark mb-3 uppercase tracking-tight">
          تم تأكيد طلبك بنجاح
        </h1>
        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-10 leading-relaxed">
          شكراً لثقتك في Tri Jolie. <br/> بدأنا الآن في تجهيز قطعك المختارة بكل حب.
        </p>

        <div className="bg-brand-gray/40 rounded-[2rem] p-8 mb-10 border border-brand-gray relative overflow-hidden">
          <div className="absolute top-1/2 -left-3 w-6 h-6 bg-white rounded-full -translate-y-1/2 border-r border-brand-gray"></div>
          <div className="absolute top-1/2 -right-3 w-6 h-6 bg-white rounded-full -translate-y-1/2 border-l border-brand-gray"></div>
          
          <div className="flex justify-between items-center mb-6 border-b border-brand-gray/50 pb-4">
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400">رقم الطلب</span>
            <span className="text-sm font-bold text-brand-dark font-display italic">
              #{orderId || 'TRJ-' + Math.floor(Math.random() * 9000 + 1000)}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400">حالة الطلب</span>
            <span className="flex items-center gap-1.5 text-[8px] font-black text-brand-gold uppercase tracking-widest bg-brand-dark px-3 py-1.5 rounded-full">
              <Truck className="w-3 h-3" /> جاري التجهيز
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <Link 
            to="/orders" 
            className="group w-full bg-brand-dark text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-brand-gold hover:text-brand-dark transition-all duration-500 shadow-xl shadow-brand-dark/10"
          >
            تتبع حالة الطلب 
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
          
          <Link 
            to="/shop" 
            className="flex items-center justify-center gap-2 text-gray-400 py-2 text-[9px] font-black uppercase tracking-[0.4em] hover:text-brand-gold transition-colors"
          >
            <ShoppingBag className="w-3 h-3" /> العودة للمتجر
          </Link>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-50">
          <p className="text-[8px] text-gray-300 font-bold uppercase tracking-[0.6em]">
            Tri Jolie Family Wear &copy; 2026
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
