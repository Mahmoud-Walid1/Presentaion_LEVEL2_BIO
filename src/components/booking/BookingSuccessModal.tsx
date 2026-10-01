import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, CheckCircle, ArrowRight } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

interface BookingSuccessModalProps {
  isOpen: boolean;
  slotNumber: number;
  slotTitle?: string;
  teamNumber?: number;
  bookedCount?: number;
  allowedLimit?: number;
  onClose: () => void;
}

export const BookingSuccessModal: React.FC<BookingSuccessModalProps> = ({
  isOpen,
  slotTitle,
  teamNumber,
  bookedCount = 1,
  allowedLimit = 2,
  onClose,
}) => {
  useEffect(() => {
    if (isOpen) {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#10b981', '#f59e0b', '#ec4899'],
      });
    }
  }, [isOpen]);

  const officialTeamName = teamNumber ? `تيم ${teamNumber}` : 'فريقكم';
  const hasRemaining = bookedCount < allowedLimit;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="تم تأكيد حجز المحمية" maxWidth="md">
      <div className="text-center py-2 sm:py-3 space-y-4">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
          <Trophy className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 inline-block mb-2">
            تم تسجيل أسبقية الحجز بنجاح
          </span>
          <h3 className="text-lg sm:text-xl font-bold text-slate-200">
            أصبح اسم فريقكم الرسمي الآن:
          </h3>
          <div className="text-3xl sm:text-4xl font-black text-brand-400 mt-1">
            {officialTeamName}
          </div>

          {slotTitle && (
            <div className="mt-3 p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-300">
              <span className="text-slate-400 block mb-0.5">المحمية المضافة:</span>
              <strong className="text-sm font-bold text-white block">{slotTitle}</strong>
            </div>
          )}

          {/* Progress Banner */}
          <div className="mt-3 p-2.5 rounded-xl bg-brand-500/10 border border-brand-500/20 text-xs text-brand-300 font-semibold">
            {hasRemaining ? (
              <span>
                اكتمل حجز {bookedCount} من {allowedLimit} محميات. يمكنك الآن اختيار المحمية المتبقية.
              </span>
            ) : (
              <span className="text-emerald-300 font-bold">
                اكتملت حصة فريقكم بالكامل بنجاح ({allowedLimit} من {allowedLimit} محميات).
              </span>
            )}
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800">
          <Button
            variant="primary"
            className="w-full min-h-[46px] font-bold"
            onClick={onClose}
            icon={hasRemaining ? <ArrowRight className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          >
            {hasRemaining ? 'متابعة لاختيار المحمية الثانية' : 'عرض بطاقة الفريق'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
