import React, { useState, useMemo } from 'react';
import { CheckCircle2, Unlock, Compass, Search } from 'lucide-react';
import { PresentationSlot } from '../../types/slot';
import { Team } from '../../types/team';
import { Button } from '../common/Button';

interface AdminSlotGridProps {
  slots: PresentationSlot[];
  teams: Team[];
  onReleaseSlot: (slotNumber: number) => void;
}

export const AdminSlotGrid: React.FC<AdminSlotGridProps> = ({
  slots,
  teams,
  onReleaseSlot,
}) => {
  const [query, setQuery] = useState('');

  const filteredSlots = useMemo(() => {
    if (!query.trim()) return slots;
    return slots.filter((s) => s.title.toLowerCase().includes(query.toLowerCase()));
  }, [slots, query]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Compass className="w-4 h-4 text-brand-400" />
          <span>مراقبة وتوزيع موضوعات المحميات الطبيعية ({slots.length} محمية)</span>
        </h2>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="بحث في المحميات..."
            className="w-full pr-8 pl-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {filteredSlots.map((slot) => {
          const bookedTeam = teams.find((t) => t.slot_number === slot.id);
          const isBooked = slot.is_booked || Boolean(bookedTeam);
          const leader = bookedTeam?.members?.find((m) => m.is_leader);

          return (
            <div
              key={slot.id}
              className={`p-3 rounded-2xl border flex flex-col justify-between transition-all ${
                isBooked
                  ? 'bg-brand-950/40 border-brand-500/40 shadow-sm'
                  : 'bg-slate-900 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                    #{slot.id}
                  </span>
                  {isBooked ? (
                    <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>محجوز</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-slate-400">شاغر</span>
                  )}
                </div>

                <div className="text-xs font-bold text-white leading-tight min-h-[2rem]">
                  {slot.title}
                </div>

                <div className="text-[11px] text-slate-400 mt-2 min-h-[1.8rem]">
                  {isBooked ? (
                    <div className="bg-slate-950/70 p-1.5 rounded-lg border border-slate-800/60">
                      <span className="text-brand-300 font-extrabold block">
                        تيم {slot.id}
                      </span>
                      <span className="block text-[10px] text-slate-400 truncate">
                        الليدر: {leader?.full_name || '—'}
                      </span>
                    </div>
                  ) : (
                    <span className="text-slate-500 text-[10px]">متاح للحجز</span>
                  )}
                </div>
              </div>

              {isBooked && (
                <div className="pt-2 mt-2 border-t border-slate-800">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-[10px] py-1 text-rose-400 hover:text-rose-300 hover:border-rose-500/40"
                    onClick={() => onReleaseSlot(slot.id)}
                    icon={<Unlock className="w-3 h-3" />}
                  >
                    تفريغ المحمية
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
