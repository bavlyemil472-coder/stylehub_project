import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, ArrowRight, Truck, ShoppingBag, Package } from 'lucide-react';

const OrderSuccess = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const orderId = location.state?.orderId || queryParams.get('merchant_order_id') || queryParams.get('order_id');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12" dir="rtl">
      <div className="max-w-md w-full">

        {/* بطاقة النجاح */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">

          {/* الهيدر */}
          <div className="bg-brand-dark px-6 py-8 text-center">
            <div className="w-16 h-16 bg-brand-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-9 h-9 text-brand-gold" />
            </div>
            <h1 className="text-xl font-bold text-white mb-1">تم تأكيد طلبك بنجاح!</h1>
            <p className="text-gray-400 text-sm">شكراً لثقتك في Tres Jolie</p>
          </div>

          {/* تفاصيل الطلب */}
          <div className="p-6 space-y-4">

            {/* رقم الطلب */}
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-sm text-gray-500 font-medium">رقم الطلب</span>
              <span className="text-base font-black text-brand-dark">#{orderId || '—'}</span>
            </div>

            {/* حالة الطلب */}
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-sm text-gray-500 font-medium">حالة الطلب</span>
              <span className="flex items-center gap-1.5 text-xs font-bold text-brand-gold bg-brand-dark px-3 py-1.5 rounded-full">
                <Package className="w-3 h-3" /> جاري التجهيز
              </span>
            </div>

            {/* التوصيل */}
            <div className="flex justify-between items-center py-3">
              <span className="text-sm text-gray-500 font-medium">التوصيل</span>
              <span className="flex items-center gap-1.5 text-sm font-bold text-gray-700">
                <Truck className="w-4 h-4 text-brand-gold" /> خلال 48 ساعة
              </span>
            </div>

            {/* رسالة */}
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-center">
              <p className="text-sm text-gray-600 leading-relaxed">
                بدأنا الآن في تجهيز قطعك المختارة 🎉<br />
                سيتم التواصل معك قريباً لتأكيد التوصيل.
              </p>
            </div>
          </div>

          {/* الأزرار */}
          <div className="px-6 pb-6 space-y-3">
            <Link
              to="/orders"
              className="w-full bg-brand-dark text-white py-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-brand-gold hover:text-brand-dark transition-all"
            >
              تتبع حالة الطلب
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/shop"
              className="w-full border border-gray-200 text-gray-600 py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:border-brand-dark hover:text-brand-dark transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              العودة للمتجر
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-gray-300 mt-6">
          Tres Jolie Family Wear © 2026
        </p>
      </div>
    </div>
  );
};

export default OrderSuccess;
