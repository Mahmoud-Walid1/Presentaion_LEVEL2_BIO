import React from 'react';
import { ShieldCheck, Code2, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-slate-800/80 bg-[#090d16]/90 backdrop-blur-md py-6 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-right">
        <div className="flex items-center justify-center sm:justify-start gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <span className="font-medium text-slate-400">
            نظام حجز أدوار العروض التقديمية — المحميات الطبيعية
          </span>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-slate-300 shadow-sm hover:border-brand-500/40 transition-colors">
          <Code2 className="w-3.5 h-3.5 text-brand-400" />
          <span className="text-slate-400">تصميم وتنفيذ:</span>
          <span className="font-bold text-white tracking-wide flex items-center gap-1.5">
            عبد الخالق
            <Sparkles className="w-3 h-3 text-amber-400" />
          </span>
        </div>
      </div>
    </footer>
  );
};
