import { Team } from '../types/team';
import { PresentationSlot } from '../types/slot';

/**
 * يحدد الفريق الحاجز لمحمية معينة اعتماداً على team_id في جدول المحميات
 * أو قائمة slot_numbers الخاصة بالفريق (بدلاً من الحقل القديم slot_number).
 */
export const findSlotTeam = (slot: PresentationSlot, teams: Team[]): Team | undefined => {
  if (slot.team_id) {
    const byId = teams.find((t) => t.id === slot.team_id);
    if (byId) return byId;
  }
  return teams.find((t) => t.slot_numbers?.includes(slot.id) || t.slot_number === slot.id);
};

export const getTeamLabel = (team: Team | undefined): string =>
  team ? `فريق ${team.team_number ?? '—'}` : 'شاغر';
