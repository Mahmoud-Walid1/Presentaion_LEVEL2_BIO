import React, { useState } from 'react';
import { Users, UserPlus, CheckCircle2, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MemberRow } from './MemberRow';
import { PinDisplayModal } from './PinDisplayModal';
import { Button } from '../common/Button';
import { createTeam } from '../../services/teamService';
import { TOTAL_TEAM_MEMBERS } from '../../constants/defaults';

export const RegistrationView: React.FC = () => {
  const { setActiveTeam, setActiveTab, showToast, refreshData } = useApp();
  const [members, setMembers] = useState<string[]>(Array(TOTAL_TEAM_MEMBERS).fill(''));
  const [errors, setErrors] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdPin, setCreatedPin] = useState<string | null>(null);

  const filledCount = members.filter((m) => m.trim().length >= 2).length;
  const isFormComplete = filledCount === TOTAL_TEAM_MEMBERS;

  const handleMemberChange = (index: number, value: string) => {
    const updated = [...members];
    updated[index] = value;
    setMembers(updated);

    if (errors[index] && value.trim().length >= 2) {
      const newErrors = { ...errors };
      delete newErrors[index];
      setErrors(newErrors);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<number, string> = {};
    members.forEach((name, idx) => {
      if (!name.trim()) {
        newErrors[idx] = idx === 0 ? 'يرجى إدخال اسم قائد الفريق' : 'يرجى إدخال اسم العضو';
      } else if (name.trim().length < 2) {
        newErrors[idx] = 'الاسم يجب ألا يقل عن حرفين';
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      showToast('يرجى ملء جميع أسماء الأعضاء السبعة بشكل صحيح', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const leaderName = members[0];
      const otherMembers = members.slice(1);
      const res = await createTeam({ leader_name: leaderName, member_names: otherMembers });

      if (res.success && res.team) {
        setCreatedPin(res.team.pin_code);
        setActiveTeam(res.team);
        showToast('تم تسجيل الفريق وتوليد رمز الـ PIN بنجاح', 'success');
        await refreshData();
      } else {
        showToast(res.message || 'حدث خطأ أثناء التسجيل', 'error');
      }
    } catch {
      showToast('حدث خطأ غير متوقع أثناء إرسال البيانات', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProceedToBooking = () => {
    setCreatedPin(null);
    setActiveTab('booking');
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 animate-fade-in">
      {/* Header Info */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold mb-3">
          <Users className="w-3.5 h-3.5" />
          <span>التسجيل موحد لـ 7 أفراد</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          تسجيل بيانات الفريق
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-2 max-w-md mx-auto">
          يقوم قائد الفريق بتسجيل اسمه وأسماء الأعضاء الستة للحصول على رمز الـ PIN الخاص بحجز البريزنتيشن.
        </p>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <span className="text-xs font-bold text-slate-300">قائمة أعضاء الفريق (7 أفراد)</span>
          <span className="text-xs font-medium text-slate-400">
            اكتمل {filledCount} من {TOTAL_TEAM_MEMBERS}
          </span>
        </div>

        <div className="space-y-3">
          {members.map((name, index) => (
            <MemberRow
              key={index}
              index={index}
              value={name}
              onChange={(val) => handleMemberChange(index, val)}
              error={errors[index]}
            />
          ))}
        </div>

        {/* Completion Checklist Banner */}
        <div className="pt-2">
          {!isFormComplete ? (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>متبقي إدخال {TOTAL_TEAM_MEMBERS - filledCount} أعضاء لتفعيل زر التسجيل.</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>اكتملت بيانات الفريق السبعة وجاهز للحفظ وتوليد الـ PIN.</span>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <Button
            type="submit"
            size="lg"
            className="w-full"
            isLoading={isSubmitting}
            disabled={!isFormComplete || isSubmitting}
            icon={<UserPlus className="w-5 h-5" />}
          >
            تأكيد التسجيل وتوليد كود الـ PIN
          </Button>
        </div>
      </form>

      {/* Success Modal */}
      {createdPin && (
        <PinDisplayModal
          isOpen={Boolean(createdPin)}
          pinCode={createdPin}
          onClose={() => setCreatedPin(null)}
          onProceedToBooking={handleProceedToBooking}
        />
      )}
    </div>
  );
};
