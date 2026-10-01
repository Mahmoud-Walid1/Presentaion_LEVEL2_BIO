import React, { useState } from 'react';
import { KeyRound, ArrowRight, UserPlus, AlertCircle, ShieldAlert } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

interface PinLoginCardProps {
  onRegisterClick?: () => void;
}

export const PinLoginCard: React.FC<PinLoginCardProps> = () => {
  const { authenticateByPin, setActiveTab, showToast } = useApp();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = pin.trim();
    if (!clean) {
      setError('يرجى إدخال رمز الـ PIN الخاص بفريقك');
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
      showToast('تم تسجيل الدخول بنجاح! يمكنك الآن حجز المحميات', 'success');
    } else {
      setError('رمز الـ PIN غير مسجل بالنظام، يرجى التأكد أو تسجيل الفريق أولاً');
      showToast('رمز الـ PIN غير موجود', 'error');
    }
  };

  return (
    <div className="p-5 sm:p-7 bg-slate-900/95 border border-slate-800 rounded-3xl shadow-2xl space-y-6">
      {/* Required Action Alert Banner */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs sm:text-sm">
        <AlertCircle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
        <div className="space-y-1">
          <strong className="block font-bold text-amber-200">
            تنبيه: يلزم تسجيل الفريق أو إدخال كود الدخول للبدء في الحجز
          </strong>
          <p className="text-xs text-amber-300/90 leading-relaxed">
            لحجز أي محمية، يجب أولاً تسجيل أعضاء الفريق (7 أفراد) للحصول على كود الـ PIN، أو كتابة الكود الخاص بكم إذا كنتم قد سجلتم بالفعل.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
        {/* Option 1: Quick PIN Entry */}
        <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 text-brand-400">
              <KeyRound className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">سجلت مسبقاً؟</span>
            </div>
            <h3 className="text-base font-extrabold text-white">دخول سريع برمز الـ PIN</h3>
            <p className="text-xs text-slate-400 mt-1">
              أدخل الرمز المكون من 6 أرقام الذي ظهر لك بعد إتمام تسجيل الفريق.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
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
              placeholder="مثال: 489210"
              maxLength={6}
              className="text-center font-mono text-2xl tracking-[0.3em] py-2.5 bg-slate-950"
              error={error}
            />

            <Button
              type="submit"
              size="md"
              className="w-full min-h-[44px] font-bold"
              isLoading={loading}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              دخول وبدء حجز المحميات
            </Button>
          </form>
        </div>

        {/* Option 2: Register New Team */}
        <div className="p-5 rounded-2xl bg-brand-950/20 border border-brand-500/30 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 text-brand-400">
              <UserPlus className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">فريق جديد</span>
            </div>
            <h3 className="text-base font-extrabold text-white">ليس لديك فريق مسجل بعد؟</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              قم بتسجيل قائد الفريق وأسماء الأعضاء الستة (7 أفراد) في خطوة واحدة للحصول فوراً على كود الـ PIN الخاص بكم.
            </p>
          </div>

          <div className="pt-2">
            <Button
              type="button"
              variant="primary"
              size="md"
              className="w-full min-h-[44px] font-extrabold bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 shadow-lg shadow-brand-500/25"
              onClick={() => setActiveTab('register')}
              icon={<UserPlus className="w-5 h-5" />}
            >
              تسجيل فريقك الآن (7 أفراد)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
