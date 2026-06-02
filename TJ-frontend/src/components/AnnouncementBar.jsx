import React, { useState } from 'react';

/**
 * AnnouncementBar — شريط إعلاني في أعلى الصفحة
 *
 * طريقة الاستخدام:
 * 1. استورده في Navbar.jsx أو Layout.jsx
 *    import AnnouncementBar from './AnnouncementBar';
 *
 * 2. حطه فوق أي حاجة تانية:
 *    <AnnouncementBar />
 *    <Navbar />
 *
 * 3. عدّل النص أو اللون من هنا حسب العرض الحالي.
 */

const AnnouncementBar = () => {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="bg-[#D4251C] text-white text-center py-2 px-10 text-sm font-bold flex items-center justify-center relative">
      <span>
        🔥 Today deal sale off <strong>70%</strong>. Hurry Up →
      </span>

      {/* زرار الإغلاق */}
      <button
        onClick={() => setVisible(false)}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition-colors text-lg leading-none"
        aria-label="إغلاق الإعلان"
      >
        ✕
      </button>
    </div>
  );
};

export default AnnouncementBar;
