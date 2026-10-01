import React, { useState, useMemo } from 'react';
import { Search, Filter, Compass, CheckCircle2, Lock } from 'lucide-react';
import { PresentationSlot } from '../../types/slot';
import { Team } from '../../types/team';
import { SlotCard } from './SlotCard';

interface SlotGridProps {
  slots: PresentationSlot[];
  teams: Team[];
  mySlotNumber: number | null;
  canBook: boolean;
  bookingSlotId: number | null;
  onBookSlot: (slotNumber: number) => void;
}

export const SlotGrid: React.FC<SlotGridProps> = ({
  slots,
  teams,
  mySlotNumber,
  canBook,
  bookingSlotId,
  onBookSlot,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'available' | 'booked'>('all');

  const bookedCount = useMemo(() => {
    return slots.filter((s) => s.is_booked || teams.some((t) => t.slot_number === s.id)).length;
  }, [slots, teams]);

  const availableCount = slots.length - bookedCount;

  const filteredSlots = useMemo(() => {
    return slots.filter((slot) => {
      const isBooked = slot.is_booked || teams.some((t) => t.slot_number === slot.id);
      const matchesSearch = slot.title.toLowerCase().includes(searchQuery.trim().toLowerCase());

      if (!matchesSearch) return false;
      if (filterMode === 'available') return !isBooked;
      if (filterMode === 'booked') return isBooked;
      return true;
    });
  }, [slots, teams, searchQuery, filterMode]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Live Stats & Search Bar */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-brand-400" />
              <span>موضوعات العروض التقديمية (30 محمية طبيعية مصرية)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              كل فريق يختار محمية واحدة فقط، والحجز لحظي بالأسبقية المباشرة
            </p>
          </div>

          {/* Quick Counters */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>المتاح: {availableCount}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-semibold text-rose-400">
              <Lock className="w-4 h-4" />
              <span>المحجوز: {bookedCount}</span>
            </div>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-3 border-t border-slate-800/80">
          <div className="relative w-full sm:flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث باسم المحمية (مثال: رأس محمد، وادي الريان، سيوة...)"
              className="w-full pr-10 pl-4 py-2 text-xs sm:text-sm bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center gap-1 w-full sm:w-auto">
            <button
              onClick={() => setFilterMode('all')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterMode === 'all'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              الكل ({slots.length})
            </button>
            <button
              onClick={() => setFilterMode('available')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterMode === 'available'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              المتاح ({availableCount})
            </button>
            <button
              onClick={() => setFilterMode('booked')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterMode === 'booked'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              المحجوز ({bookedCount})
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Slots */}
      {filteredSlots.length === 0 ? (
        <div className="text-center py-12 p-6 rounded-3xl bg-slate-900 border border-slate-800 text-slate-400">
          <Filter className="w-10 h-10 mx-auto text-slate-600 mb-2" />
          <p className="text-sm font-semibold text-slate-300">لا توجد نتائج مطابقة لبحثك</p>
          <p className="text-xs text-slate-500 mt-1">جرب البحث بكلمات أخرى أو اختر عرض "الكل"</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredSlots.map((slot) => {
            const bookedTeam = teams.find((t) => t.slot_number === slot.id);
            return (
              <SlotCard
                key={slot.id}
                slot={slot}
                bookedTeam={bookedTeam}
                isMySlot={mySlotNumber === slot.id}
                canBook={canBook}
                isBooking={bookingSlotId === slot.id}
                onBook={onBookSlot}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
