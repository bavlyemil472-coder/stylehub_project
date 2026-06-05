import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Phone, ChevronDown, MapPin, MessageCircle } from 'lucide-react';

const policies = [
  {
    title: 'سياسة الاستبدال',
    content: `يمكنك طلب استبدال المنتج بمقاس مختلف (أكبر أو أصغر) عن طريق التواصل معنا.\n\nفي حالة الاستبدال، تتحمل شركة الشحن رسوم التوصيل.\n\nإذا طُلب الاستبدال بعد استلام الطلب لأي سبب، سيتم احتساب رسوم شحن جديدة.`
  },
  {
    title: 'سياسة الإرجاع',
    content: `لا يتم قبول الإرجاع بعد استلام الطلب.\n\nفي حال وجود أي مشكلة في المنتج بعد التسليم، يمكنك التواصل معنا وسنقوم بمساعدتك عبر الاستبدال.`
  },
  {
    title: 'سياسة الفحص والاستلام',
    content: `يحق للعميل فحص الطلب أمام المندوب قبل الاستلام.\n\nلا يُسمح بالقبول الجزئي للطلب — إذا كان الطلب يحتوي على أكثر من منتج، يجب قبوله أو رفضه بالكامل.`
  },
];

const PolicyItem = ({ title, content }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/8">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-right group"
      >
        <span className={`text-sm font-semibold transition-colors ${open ? 'text-brand-gold' : 'text-gray-300 group-hover:text-white'}`}>
          {title}
        </span>
        <ChevronDown className={`w-4 h-4 text-brand-gold flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="pb-5">
          {content.split('\n\n').map((para, i) => (
            <p key={i} className="text-gray-400 text-sm leading-7 mb-3 last:mb-0">{para}</p>
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
    <footer className="bg-[#0B0B0B] text-white border-t border-white/5 mt-32" dir="rtl">

      {/* القسم الرئيسي */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-12 gap-12">

        {/* البراند */}
        <div className="md:col-span-4 space-y-5">
          <div>
            <h2 className="text-3xl font-black italic text-brand-gold tracking-tight mb-1">TRES JOLIE</h2>
            <p className="text-xs text-gray-500 uppercase tracking-widest">Family Wear • Since 1994</p>
          </div>
          <p className="text-gray-400 text-sm leading-7">
            الجودة ليست مجرد فعل، بل هي عادة نغزلها في كل قطعة. أكثر من 30 عام من الخبرة في عالم الأزياء العائلية.
          </p>
          {/* السوشيال */}
          <div className="flex gap-3 pt-2">
            <a
              href={socialLinks.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white/5 hover:bg-brand-gold/20 border border-white/10 hover:border-brand-gold/40 px-4 py-2.5 rounded-lg transition-all group"
            >
              <Facebook className="w-4 h-4 text-gray-400 group-hover:text-brand-gold transition-colors" />
              <span className="text-xs font-semibold text-gray-400 group-hover:text-brand-gold transition-colors">Facebook</span>
            </a>
            <a
              href={socialLinks.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white/5 hover:bg-[#25D366]/10 border border-white/10 hover:border-[#25D366]/40 px-4 py-2.5 rounded-lg transition-all group"
            >
              <MessageCircle className="w-4 h-4 text-gray-400 group-hover:text-[#25D366] transition-colors" />
              <span className="text-xs font-semibold text-gray-400 group-hover:text-[#25D366] transition-colors">WhatsApp</span>
            </a>
          </div>
        </div>

        {/* روابط سريعة */}
        <div className="md:col-span-2 md:col-start-6">
          <h3 className="text-white text-sm font-bold mb-5 pb-3 border-b border-white/10">روابط سريعة</h3>
          <ul className="space-y-3">
            {[
              { to: '/', label: 'الرئيسية' },
              { to: '/shop', label: 'المنتجات' },
              { to: '/orders', label: 'طلباتي' },
            ].map(link => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="text-gray-400 hover:text-white text-sm transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 rounded-full bg-brand-gold/50 group-hover:bg-brand-gold transition-colors"></span>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* تواصل معنا */}
        <div className="md:col-span-3 md:col-start-9">
          <h3 className="text-white text-sm font-bold mb-5 pb-3 border-b border-white/10">تواصل معنا</h3>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-brand-gold flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 mb-0.5">واتساب</p>
                <a href={socialLinks.whatsapp} className="text-sm text-gray-300 hover:text-white transition-colors">01559892697</a>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-brand-gold flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 mb-0.5">الموقع</p>
                <p className="text-sm text-gray-300">مصر</p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* السياسات */}
      <div className="max-w-7xl mx-auto px-6 pb-10">
        <div className="border-t border-white/10 pt-10">
          <h3 className="text-white text-sm font-bold mb-4">السياسات</h3>
          <div className="max-w-2xl">
            {policies.map((policy) => (
              <PolicyItem key={policy.title} title={policy.title} content={policy.content} />
            ))}
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/5 py-6 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-600">© 2026 TRES JOLIE FAMILY WEAR. ALL RIGHTS RESERVED.</p>
          <p className="text-xs text-gray-700">Made with ❤️ in Egypt</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
