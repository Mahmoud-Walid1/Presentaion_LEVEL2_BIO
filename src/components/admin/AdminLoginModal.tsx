import React, { useState } from 'react';
import { Lock, KeyRound } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

export const AdminLoginModal: React.FC = () => {
  const { setIsAdmin, showToast } = useApp();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password === adminPassword) {
      setIsAdmin(true);
      showToast('تم تسجيل دخول المشرف بنجاح', 'success');
    } else {
      setError('كلمة مرور الإدارة غير صحيحة');
      showToast('كلمة المرور غير صحيحة', 'error');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto my-16 p-6 sm:p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl animate-fade-in">
      <div className="text-center mb-6">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 mb-3">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-white">لوحة تحكم المشرف العام</h2>
        <p className="text-xs text-slate-400 mt-1">
          أدخل كلمة مرور الإدارة للوصول إلى التحكم الكامل بالفرق والحجوزات
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (error) setError('');
          }}
          placeholder="أدخل كلمة مرور الأدمن..."
          error={error}
          icon={<KeyRound className="w-4 h-4 text-slate-400" />}
        />

        <Button
          type="submit"
          size="lg"
          className="w-full"
          isLoading={loading}
          icon={<Lock className="w-4 h-4" />}
        >
          دخول لوحة التحكم
        </Button>
      </form>
    </div>
  );
};
