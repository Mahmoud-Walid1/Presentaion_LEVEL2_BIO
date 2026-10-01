import React, { useState } from 'react';
import { Copy, Check, KeyRound, ArrowLeft } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

interface PinDisplayModalProps {
  isOpen: boolean;
  pinCode: string;
  onClose: () => void;
  onProceedToBooking: () => void;
}

export const PinDisplayModal: React.FC<PinDisplayModalProps> = ({
  isOpen,
  pinCode,
  onClose,
  onProceedToBooking,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(pinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="تم تسجيل الفريق بنجاح" maxWidth="md">
      <div className="text-center py-2 space-y-4">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
          <KeyRound className="w-7 h-7" />
        </div>

        <div>
          <h4 className="text-base font-bold text-slate-100">رمز الدخول الخاص بفريقك (PIN)</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            احفظ هذا الرمز المكون من 6 أرقام. ستحتاجه للدخول وحجز دور البريزنتيشن الخاص بفريقك.
          </p>
        </div>

        {/* 6-Digit PIN Display Card */}
        <div className="bg-slate-950 border border-brand-500/40 rounded-2xl p-4 shadow-inner">
          <div className="font-mono text-3xl sm:text-4xl font-black tracking-widest text-brand-400 text-center select-all">
            {pinCode}
          </div>
        </div>

        <div className="flex items-center justify-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopy}
            icon={copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          >
            {copied ? 'تم النسخ بنجاح' : 'نسخ رمز الـ PIN'}
          </Button>
        </div>

        <div className="pt-2 border-t border-slate-800 flex gap-2">
          <Button
            variant="primary"
            className="w-full"
            onClick={onProceedToBooking}
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            الانتقال لحجز البريزنتيشن الآن
          </Button>
        </div>
      </div>
    </Modal>
  );
};
