import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AnnouncementBar = () => {
  const [announcement, setAnnouncement] = useState(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    api.get('/announcement/')
      .then(res => {
        if (res.data.length > 0) {
          setAnnouncement(res.data[0].text);
        }
      })
      .catch(() => {});
  }, []);

  if (!visible || !announcement) return null;

  return (
    <div className="bg-[#D4251C] text-white text-center py-2 px-10 text-sm font-bold flex items-center justify-center relative sticky top-0 z-[101]">
      <span>🔥 {announcement}</span>
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
