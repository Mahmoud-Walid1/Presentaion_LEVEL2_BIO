import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { ToastMessage } from '../../types/state';

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-brand-400 shrink-0" />,
  };

  const borderStyles = {
    success: 'border-emerald-500/40 bg-slate-900/95',
    error: 'border-rose-500/40 bg-slate-900/95',
    info: 'border-brand-500/40 bg-slate-900/95',
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-fade-in">
      <div
        className={`flex items-start gap-3 p-4 rounded-xl shadow-2xl border backdrop-blur-md ${borderStyles[toast.type]}`}
      >
        {icons[toast.type]}
        <div className="flex-1 text-sm font-medium text-slate-100 leading-snug">
          {toast.message}
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-200 transition-colors p-0.5"
          aria-label="إغلاق الإشعار"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
