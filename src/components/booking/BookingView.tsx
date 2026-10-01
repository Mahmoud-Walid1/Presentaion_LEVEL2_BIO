import React, { useState } from 'react';
import { CalendarCheck, UserCheck, AlertTriangle, Compass } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PinLoginCard } from './PinLoginCard';
import { SlotGrid } from './SlotGrid';
import { BookingSuccessModal } from './BookingSuccessModal';
import { bookSlot } from '../../services/slotService';

export const BookingView: React.FC = () => {
  const { activeTeam, slots, teams, showToast, refreshData } = useApp();
  const [bookingSlotId, setBookingSlotId] = useState<number | null>(null);
  const [justBookedSlot, setJustBookedSlot] = useState<number | null>(null);

  if (!activeTeam) {
    return <PinLoginCard />;
  }

  const leader = activeTeam.members?.find((m) => m.is_leader);
  const otherMembers = activeTeam.members?.filter((m) => !m.is_leader) || [];
  const hasBooked = activeTeam.slot_number !== null;
  const chosenSlot = slots.find((s) => s.id === activeTeam.slot_number);

  const officialTeamTitle = activeTeam.team_number
    ? `تيم ${activeTeam.team_number}`
    : 'فريق غير محجوز بعد';

  const handleBookSlot = async (slotNumber: number) => {
    if (hasBooked) {
      showToast('فريقكم قام بحجز محمية مسبقاً بالفعل', 'error');
      return;
    }

    setBookingSlotId(slotNumber);
    try {
      const res = await bookSlot(activeTeam.id, slotNumber);
      if (res.success) {
        setJustBookedSlot(slotNumber);
        showToast(res.message, 'success');
        await refreshData();
      } else {
        showToast(res.message, 'error');
      }
    } catch {
      showToast('حدث خطأ أثناء حجز المحمية', 'error');
    } finally {
      setBookingSlotId(null);
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
              {hasBooked ? `اسم الفريق الرسمي: ${officialTeamTitle}` : 'في انتظار اختيار المحمية'}
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 pt-0.5">
              <span className="flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>قائد الفريق: <strong className="text-slate-100">{leader?.full_name || 'غير محدد'}</strong></span>
              </span>
              {chosenSlot && (
                <span className="flex items-center gap-1 text-brand-300">
                  <Compass className="w-3.5 h-3.5 shrink-0" />
                  <span>المحمية: <strong className="text-white">{chosenSlot.title}</strong></span>
                </span>
              )}
            </div>
          </div>

          {/* Booking Status Pill */}
          <div className="shrink-0">
            {hasBooked ? (
              <div className="p-3 sm:px-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-3">
                <CalendarCheck className="w-6 h-6 shrink-0" />
                <div>
                  <div className="text-[11px] font-semibold text-emerald-300">تم الحجز رسمياً</div>
                  <div className="text-sm sm:text-base font-extrabold text-white">
                    {officialTeamTitle} • {chosenSlot?.title}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 sm:px-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 shrink-0" />
                <div>
                  <div className="text-[11px] font-semibold text-amber-300">اختر محمية الآن</div>
                  <div className="text-xs text-slate-300">أسبقية الحجز تحدد رقم فريقكم</div>
                </div>
              </div>
            )}
          </div>
        </div>

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

      {/* Slots Section */}
      <SlotGrid
        slots={slots}
        teams={teams}
        mySlotNumber={activeTeam.slot_number}
        canBook={!hasBooked}
        bookingSlotId={bookingSlotId}
        onBookSlot={handleBookSlot}
      />

      {/* Celebration Modal */}
      {justBookedSlot !== null && (
        <BookingSuccessModal
          isOpen={justBookedSlot !== null}
          slotNumber={justBookedSlot}
          slotTitle={slots.find((s) => s.id === justBookedSlot)?.title}
          teamNumber={activeTeam.team_number || undefined}
          onClose={() => setJustBookedSlot(null)}
        />
      )}
    </div>
  );
};
