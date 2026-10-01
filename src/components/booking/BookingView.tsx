import React, { useState } from 'react';
import { CalendarCheck, UserCheck, AlertTriangle, Compass, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PresentationSlot } from '../../types/slot';
import { PinLoginCard } from './PinLoginCard';
import { SlotGrid } from './SlotGrid';
import { ConfirmBookingModal } from './ConfirmBookingModal';
import { BookingSuccessModal } from './BookingSuccessModal';
import { bookSlot } from '../../services/slotService';

export const BookingView: React.FC = () => {
  const { activeTeam, slots, teams, globalMaxSlots, showToast, refreshData } = useApp();
  const [selectedSlotForConfirm, setSelectedSlotForConfirm] = useState<PresentationSlot | null>(null);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [justBookedSlot, setJustBookedSlot] = useState<number | null>(null);

  if (!activeTeam) {
    return <PinLoginCard />;
  }

  const leader = activeTeam.members?.find((m) => m.is_leader);
  const otherMembers = activeTeam.members?.filter((m) => !m.is_leader) || [];

  // Team booked slots
  const teamBookedSlots = slots.filter((s) => s.team_id === activeTeam.id);
  const allowedLimit = activeTeam.max_slots || globalMaxSlots;
  const isComplete = teamBookedSlots.length >= allowedLimit;
  const remainingCount = Math.max(0, allowedLimit - teamBookedSlots.length);

  const officialTeamTitle = activeTeam.team_number
    ? `تيم ${activeTeam.team_number}`
    : 'فريق غير محجوز بعد';

  const handleInitiateBooking = (slotNumber: number) => {
    if (isComplete) {
      showToast(`فريقكم أكمل حجز الحصص المتاحة له بالكامل (${allowedLimit} محميات)`, 'info');
      return;
    }

    const slot = slots.find((s) => s.id === slotNumber);
    if (!slot) return;
    setSelectedSlotForConfirm(slot);
  };

  const handleConfirmBooking = async () => {
    if (!selectedSlotForConfirm) return;

    setIsSubmittingBooking(true);
    try {
      const res = await bookSlot(activeTeam.id, selectedSlotForConfirm.id);
      if (res.success) {
        setJustBookedSlot(selectedSlotForConfirm.id);
        showToast(res.message, 'success');
        setSelectedSlotForConfirm(null);
        await refreshData();
      } else {
        showToast(res.message, 'error');
      }
    } catch {
      showToast('حدث خطأ أثناء حجز المحمية', 'error');
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-4 sm:py-8 px-3 sm:px-6 lg:px-8 space-y-6 sm:space-y-8 animate-fade-in pb-20 md:pb-12">
      {/* Active Team Identity Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-brand-950/40 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] sm:text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20">
                الفريق المسجل
              </span>
              <span className="text-xs font-mono text-slate-400">
                PIN: <strong className="text-white tracking-widest">{activeTeam.pin_code}</strong>
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white">
              {activeTeam.team_number ? `اسم الفريق الرسمي: ${officialTeamTitle}` : 'في انتظار حجز المحميات'}
            </h2>

            <div className="flex items-center gap-1.5 text-xs text-slate-300 pt-0.5">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>قائد الفريق: <strong className="text-slate-100">{leader?.full_name || 'غير محدد'}</strong></span>
            </div>
          </div>

          {/* Booking Progress Pill */}
          <div className="shrink-0">
            {isComplete ? (
              <div className="p-3 sm:px-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-3">
                <CalendarCheck className="w-6 h-6 shrink-0" />
                <div>
                  <div className="text-[11px] font-semibold text-emerald-300">اكتمل الحجز بالكامل</div>
                  <div className="text-sm sm:text-base font-extrabold text-white">
                    {teamBookedSlots.length} من {allowedLimit} محميات معتمدة
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 sm:px-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 shrink-0" />
                <div>
                  <div className="text-[11px] font-semibold text-amber-300">
                    محجوز {teamBookedSlots.length} من {allowedLimit} محميات
                  </div>
                  <div className="text-xs text-slate-300 font-bold">
                    متبقي لكم اختيار {remainingCount} محمية إضافية
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Selected Reserves Badges */}
        {teamBookedSlots.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-800/80">
            <span className="text-xs text-slate-400 font-medium block mb-2">المحميات المعتمدة لفريقكم:</span>
            <div className="flex flex-wrap gap-2">
              {teamBookedSlots.map((slot) => (
                <div
                  key={slot.id}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-brand-500/15 border border-brand-500/30 text-xs font-bold text-white shadow-sm"
                >
                  <Compass className="w-4 h-4 text-brand-400 shrink-0" />
                  <span>{slot.title}</span>
                  <span className="text-[10px] text-brand-300 font-mono">#{slot.id}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Team Members List Strip */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="text-xs text-slate-400 font-medium">أعضاء الفريق (7):</span>
          <span className="text-xs px-2.5 py-1 rounded-lg bg-brand-500/10 text-brand-300 border border-brand-500/20 font-semibold">
            {leader?.full_name} (الليدر)
          </span>
          {otherMembers.map((m) => (
            <span
              key={m.id}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700/60"
            >
              {m.full_name}
            </span>
          ))}
        </div>
      </div>

      {/* Slots Grid */}
      <SlotGrid
        slots={slots}
        teams={teams}
        mySlotNumber={null}
        canBook={!isComplete}
        bookingSlotId={selectedSlotForConfirm?.id || null}
        onBookSlot={handleInitiateBooking}
      />

      {/* Confirmation Modal Before Booking */}
      <ConfirmBookingModal
        isOpen={Boolean(selectedSlotForConfirm)}
        slot={selectedSlotForConfirm}
        isLoading={isSubmittingBooking}
        onConfirm={handleConfirmBooking}
        onClose={() => setSelectedSlotForConfirm(null)}
      />

      {/* Celebration Modal After Success */}
      {justBookedSlot !== null && (
        <BookingSuccessModal
          isOpen={justBookedSlot !== null}
          slotNumber={justBookedSlot}
          slotTitle={slots.find((s) => s.id === justBookedSlot)?.title}
          teamNumber={activeTeam.team_number || undefined}
          bookedCount={teamBookedSlots.length}
          allowedLimit={allowedLimit}
          onClose={() => setJustBookedSlot(null)}
        />
      )}
    </div>
  );
};
