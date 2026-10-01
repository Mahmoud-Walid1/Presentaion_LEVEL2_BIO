import React from 'react';
import { HelpCircle, Compass, CheckCircle2, X } from 'lucide-react';
import { PresentationSlot } from '../../types/slot';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

interface ConfirmBookingModalProps {
  isOpen: boolean;
  slot: PresentationSlot | null;
  isLoading: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmBookingModal: React.FC<ConfirmBookingModalProps> = ({
  isOpen,
  slot,
  isLoading,
  onConfirm,
  onClose,
}) => {
  if (!slot) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={isLoading ? () => {} : onClose}
      title="تأكيد اختيار المحمية"
      maxWidth="md"
    >
      <div className="space-y-4 py-1 text-center sm:text-right">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-brand-500/10 border border-brand-500/25 flex items-center justify-center text-brand-400">
          <HelpCircle className="w-7 h-7" />
        </div>

        <div className="text-center">
          <h4 className="text-base sm:text-lg font-bold text-white">
            هل أنت متأكد من رغبتك في حجز هذه المحمية؟
          </h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            بمجرد التأكيد سيتم تسجيل هذا الموضوع لفريقكم نهائياً وتحديد رقم واسم الفريق حسب أسبقية الحجز.
          </p>
        </div>

        {/* Selected Reserve Preview Box */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-brand-500/40 shadow-inner flex items-center gap-3 text-right">
          <div className="p-2.5 rounded-xl bg-brand-500/15 text-brand-400 shrink-0">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400">المحمية المختارة #{slot.id}:</div>
            <div className="text-base sm:text-lg font-black text-white">
              {slot.title}
            </div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-right text-xs text-amber-300 leading-relaxed">
          <strong className="block font-bold mb-0.5">ملاحظة هامة:</strong>
          لا يمكن التراجع أو استبدال المحمية بعد التأكيد إلا من خلال التواصل مع المشرف العام للفعالية.
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 pt-3 border-t border-slate-800">
          <Button
            type="button"
            variant="outline"
            size="md"
            className="w-full sm:w-auto min-h-[44px]"
            onClick={onClose}
            disabled={isLoading}
            icon={<X className="w-4 h-4" />}
          >
            تراجع واختيار أخرى
          </Button>

          <Button
            type="button"
            variant="primary"
            size="md"
            className="w-full sm:w-auto min-h-[44px] font-bold shadow-brand-500/25"
            onClick={onConfirm}
            isLoading={isLoading}
            icon={<CheckCircle2 className="w-4 h-4" />}
          >
            نعم، تأكيد حجز هذه المحمية
          </Button>
        </div>
      </div>
    </Modal>
  );
};
