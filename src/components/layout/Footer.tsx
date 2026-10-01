import React from 'react';
import { ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-slate-800/80 bg-[#090d16]/60 py-6 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-brand-400" />
          <span>نظام حجز أدوار العروض التقديمية الفوري المباشر</span>
        </div>
        <div className="flex items-center gap-1">
          <span>تم التصميم بمعايير احترافية ونظيفة</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 mx-1" />
        </div>
      </div>
    </footer>
  );
};
