import React, { useState } from 'react';
import { KeyRound, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

export const PinLoginCard: React.FC = () => {
  const { authenticateByPin, showToast } = useApp();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = pin.trim();
    if (!clean) {
      setError('يرجى إدخال رمز الـ PIN');
      return;
    }
    if (clean.length !== 6 || !/^\d+$/.test(clean)) {
      setError('الرمز يجب أن يتكون من 6 أرقام فقط');
      return;
    }

    setLoading(true);
    setError('');
    const success = await authenticateByPin(clean);
    setLoading(false);

    if (success) {
      showToast('تم تسجيل الدخول بنجاح', 'success');
    } else {
      setError('رمز الـ PIN غير صحيح أو غير مسجل بالنظام');
      showToast('رمز الـ PIN غير موجود، تأكد من صحة الكود', 'error');
    }
  };

  return (
    <div className="max-w-md mx-auto my-6 sm:my-12 px-4 animate-fade-in">
      <div className="p-6 sm:p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-brand-600/10 border border-brand-500/20 flex items-center justify-center text-brand-400 mb-3">
            <KeyRound className="w-7 h-7" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white">تسجيل الدخول لحجز المحمية</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            أدخل رمز الـ PIN المكون من 6 أرقام الذي ظهر لك بعد تسجيل أسماء الفريق
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              value={pin}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                setPin(val);
                if (error) setError('');
              }}
              placeholder="••••••"
              maxLength={6}
              className="text-center font-mono text-3xl tracking-[0.4em] py-3.5 bg-slate-950"
              error={error}
              autoFocus
            />
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full h-12 text-sm sm:text-base font-bold shadow-brand-500/20"
            isLoading={loading}
            icon={<ArrowRight className="w-5 h-5" />}
          >
            دخول واختيار المحمية
          </Button>
        </form>
      </div>
    </div>
  );
};
