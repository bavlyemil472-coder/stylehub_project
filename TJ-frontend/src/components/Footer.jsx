import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Phone, ChevronDown } from 'lucide-react';

const policies = [
  {
    title: 'سياسة الاستبدال',
    content: `يمكنك طلب استبدال المنتج بمقاس مختلف (أكبر أو أصغر) عن طريق التواصل معنا.

في حالة الاستبدال، تتحمل شركة الشحن رسوم التوصيل.

إذا طُلب الاستبدال بعد استلام الطلب لأي سبب، سيتم احتساب رسوم شحن جديدة.`
  },
  {
    title: 'سياسة الإرجاع',
    content: `لا يتم قبول الإرجاع بعد استلام الطلب.

في حال وجود أي مشكلة في المنتج بعد التسليم، يمكنك التواصل معنا وسنقوم بمساعدتك عبر الاستبدال.`
  },
  {
    title: 'سياسة الفحص والاستلام',
    content: `يحق للعميل فحص الطلب أمام المندوب قبل الاستلام.

لا يُسمح بالقبول الجزئي للطلب — إذا كان الطلب يحتوي على أكثر من منتج، يجب قبوله أو رفضه بالكامل.`
  },
];

const PolicyItem = ({ title, content }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-t border-white/10">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-right group"
      >
        <span className="text-sm font-bold text-gray-300 group-hover:text-brand-gold transition-colors">
          {title}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-brand-gold flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="pb-5 pr-1">
          {content.split('\n\n').map((para, i) => (
            <p key={i} className="text-gray-500 text-sm leading-relaxed mb-3 last:mb-0">
              {para}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

const Footer = () => {
  const socialLinks = {
    facebook: "https://www.facebook.com/share/1Ag9BPyEXd/",
    whatsapp: "https://wa.me/01559892697"
  };

  return (
    <footer className="bg-[#0B0B0B] text-white pt-20 pb-10 border-t border-white/5 px-6 mt-32" dir="rtl">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">

        {/* البراند */}
        <div className="space-y-6 text-center md:text-right">
          <h2 className="text-2xl font-bold italic text-brand-gold tracking-tighter">TRES JOLIE</h2>
          <p className="text-gray-500 text-[10px] uppercase tracking-[0.2em] leading-relaxed">
            الجودة ليست مجرد فعل، بل هي عادة نغزلها في كل قطعة.
          </p>
        </div>

        {/* الروابط */}
        <div className="flex flex-col items-center gap-4">
          <h3 className="text-brand-gold text-[11px] font-black uppercase tracking-widest mb-2">اكتشف</h3>
          <Link to="/" className="text-gray-400 hover:text-white text-[10px] uppercase font-bold tracking-widest transition-colors">الرئيسية</Link>
          <Link to="/collections" className="text-gray-400 hover:text-white text-[10px] uppercase font-bold tracking-widest transition-colors">المجموعات</Link>
          <Link to="/orders" className="text-gray-400 hover:text-white text-[10px] uppercase font-bold tracking-widest transition-colors">طلباتي</Link>
        </div>

        {/* تواصل معنا */}
        <div className="flex flex-col items-center md:items-start gap-6">
          <h3 className="text-brand-gold text-[11px] font-black uppercase tracking-widest mb-2">تواصل معنا</h3>
          <div className="flex gap-6">
            <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-brand-gold transition-all">
              <Facebook size={20} />
            </a>
            <a href={socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-[#25D366] transition-all">
              <Phone size={20} />
            </a>
          </div>
        </div>
      </div>

      {/* ✅ السياسات — accordion */}
      <div className="max-w-7xl mx-auto mt-16">
        <h3 className="text-brand-gold text-[11px] font-black uppercase tracking-widest mb-2">
          السياسات
        </h3>
        {policies.map((policy) => (
          <PolicyItem key={policy.title} title={policy.title} content={policy.content} />
        ))}
        <div className="border-t border-white/10" />
      </div>

      {/* Copyright */}
      <div className="mt-12 pt-8 border-t border-white/5 text-center">
        <p className="text-[9px] text-gray-600 font-black uppercase tracking-[0.4em]">
          © 2026 TRES JOLIE FAMILY WEAR. ALL RIGHTS RESERVED.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
