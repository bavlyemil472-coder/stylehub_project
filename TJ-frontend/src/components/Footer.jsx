import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Phone } from 'lucide-react';

const Footer = () => {
  // روابط السوشيال ميديا
  const socialLinks = {
    
    facebook: "https://www.facebook.com/your_page",
    whatsapp: "https://wa.me/201234567890" // اكتب رقمك بعد الـ 20
  };

  return (
    <footer className="bg-[#0B0B0B] text-white pt-20 pb-10 border-t border-white/5 px-6 mt-32">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">
        
        {/* البلوك الأول: من نحن */}
        <div className="space-y-6 text-center md:text-right">
          <h2 className="text-2xl font-bold italic text-brand-gold tracking-tighter">TRES JOLIE</h2>
          <p className="text-gray-500 text-[10px] uppercase tracking-[0.2em] leading-relaxed">
            الجودة ليست مجرد فعل، بل هي عادة نغزلها في كل قطعة.
          </p>
        </div>

        {/* البلوك الثاني: روابط سريعة */}
        <div className="flex flex-col items-center gap-4">
          <h3 className="text-brand-gold text-[11px] font-black uppercase tracking-widest mb-2">اكتشف</h3>
          <Link to="/" className="text-gray-400 hover:text-white text-[10px] uppercase font-bold tracking-widest transition-colors">الرئيسية</Link>
          <Link to="/collections" className="text-gray-400 hover:text-white text-[10px] uppercase font-bold tracking-widest transition-colors">المجموعات</Link>
          <Link to="/orders" className="text-gray-400 hover:text-white text-[10px] uppercase font-bold tracking-widest transition-colors">طلباتي</Link>
        </div>

        {/* البلوك الثالث: تواصل معنا */}
        <div className="flex flex-col items-center md:items-left gap-6">
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

      {/* الحقوق السفلية */}
      <div className="mt-20 pt-8 border-t border-white/5 text-center">
        <p className="text-[9px] text-gray-600 font-black uppercase tracking-[0.4em]">
          © 2026 TRI JOLIE FAMILY WEAR. ALL RIGHTS RESERVED.
        </p>
      </div>
    </footer>
  );
};

export default Footer;