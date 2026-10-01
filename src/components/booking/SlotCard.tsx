import React from 'react';
import { CheckCircle2, Lock, ArrowUpRight, Compass, Crown } from 'lucide-react';
import { PresentationSlot } from '../../types/slot';
import { Team } from '../../types/team';
import { Button } from '../common/Button';

interface SlotCardProps {
  slot: PresentationSlot;
  bookedTeam?: Team;
  isMySlot: boolean;
  canBook: boolean;
  isBooking: boolean;
  onBook: (slotNumber: number) => void;
}

export const SlotCard: React.FC<SlotCardProps> = ({
  slot,
  bookedTeam,
  isMySlot,
  canBook,
  isBooking,
  onBook,
}) => {
  const isBooked = slot.is_booked || Boolean(bookedTeam);
  const isBookedByOther = isBooked && !isMySlot;
  const leader = bookedTeam?.members?.find((m) => m.is_leader);

  // Team designation is based on chronological booking rank (فريق 1، فريق 2...)
  const teamNumber = bookedTeam?.team_number;
  const teamName = teamNumber
    ? `فريق ${teamNumber}`
    : bookedTeam
    ? `فريق (${leader?.full_name || 'مسجل'})`
    : 'فريق غير محدد';
  const teamDisplayBadge = isMySlot ? `${teamName} (فريقكم)` : teamName;

  return (
    <div
      className={`relative rounded-2xl p-4 sm:p-5 border transition-all duration-200 flex flex-col justify-between overflow-hidden ${
        isMySlot
          ? 'bg-emerald-950/30 border-emerald-500/70 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/40'
          : isBookedByOther
          ? 'bg-slate-900/90 border-rose-500/30'
          : 'bg-slate-900 border-slate-800 hover:border-brand-500/60 active:border-brand-500 hover:shadow-lg'
      }`}
    >
      <div>
        {/* Slot Top Badges */}
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
            #{slot.id}
          </span>

          {isMySlot ? (
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>محجوزة لفريقكم</span>
            </span>
          ) : isBookedByOther ? (
            <span className="flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-500/15 px-2.5 py-0.5 rounded-full border border-rose-500/30">
              <Lock className="w-3.5 h-3.5 text-rose-400" />
              <span>محجوزة</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-brand-400 bg-brand-500/10 px-2.5 py-0.5 rounded-full border border-brand-500/20">
              <span>متاحة للحجز</span>
            </span>
          )}
        </div>

        {/* Title */}
        <div className="flex items-start gap-2.5 mb-2.5">
          <div
            className={`p-2 rounded-xl shrink-0 mt-0.5 ${
              isMySlot
                ? 'bg-emerald-500/10 text-emerald-400'
                : isBookedByOther
                ? 'bg-rose-500/10 text-rose-400'
                : 'bg-brand-500/10 text-brand-400'
            }`}
          >
            <Compass className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-extrabold text-white leading-snug">
              {slot.title}
            </h4>
          </div>
        </div>

        {/* Prominent Booking Box */}
        {isBooked ? (
          <div
            className={`p-3 rounded-xl border mb-3 space-y-1.5 ${
              isMySlot
                ? 'bg-emerald-950/40 border-emerald-500/30'
                : 'bg-rose-950/25 border-rose-500/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">الفريق الحاجز:</span>
              <span
                className={`font-black text-xs px-2.5 py-0.5 rounded-md ${
                  isMySlot
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}
              >
                {teamDisplayBadge}
              </span>
            </div>

            {leader && (
              <div className="flex items-center gap-1.5 text-xs text-slate-300 pt-0.5">
                <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="text-slate-400">الليدر:</span>
                <span className="font-semibold text-slate-100 truncate">{leader.full_name}</span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-slate-400 mb-3 bg-slate-950/40 p-2 rounded-xl border border-slate-800/80">
            متاحة للحجز الآن، اضغط أدناه لاختيارها لفريقك.
          </p>
        )}
      </div>

      {/* Action Area */}
      <div className="pt-2 border-t border-slate-800/80 mt-auto">
        {isMySlot ? (
          <div className="text-center py-2 text-xs font-bold text-emerald-400 flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>محمية معتمدة لـ {teamName}</span>
          </div>
        ) : isBookedByOther ? (
          <div className="text-center py-2 text-xs text-rose-400/90 font-bold bg-rose-500/5 rounded-xl border border-rose-500/10">
            تم الحجز بواسطة {teamName}
          </div>
        ) : (
          <Button
            size="md"
            variant="primary"
            className="w-full min-h-[44px] font-bold shadow-brand-500/20 text-xs sm:text-sm"
            disabled={!canBook || isBooking}
            isLoading={isBooking}
            onClick={() => onBook(slot.id)}
            icon={<ArrowUpRight className="w-4 h-4" />}
          >
            حجز هذه المحمية
          </Button>
        )}
      </div>
    </div>
  );
};
