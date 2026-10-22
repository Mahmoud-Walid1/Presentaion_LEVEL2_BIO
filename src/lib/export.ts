import { Team } from '../types/team';
import { PresentationSlot } from '../types/slot';
import { findSlotTeam, getTeamLabel } from './findSlotTeam';

const csvCell = (value: string | number): string => `"${String(value).replace(/"/g, '""')}"`;

export const exportTeamsToCsv = (teams: Team[], slots: PresentationSlot[]) => {
  const headers = ['رقم المحمية', 'اسم المحمية', 'الفريق الحاجز', 'رمز الدخول (PIN)', 'اسم القائد', 'أعضاء الفريق'];

  const rows = slots.map((slot) => {
    const team = findSlotTeam(slot, teams);
    const members = [...(team?.members ?? [])].sort((a, b) => a.member_order - b.member_order);
    const leader = members.find((m) => m.is_leader)?.full_name || (team ? '—' : 'غير محجوز');
    const otherMembers = members.filter((m) => !m.is_leader).map((m) => m.full_name).join(' - ') || '—';

    return [slot.id, slot.title, getTeamLabel(team), team?.pin_code || '—', leader, otherMembers].map(csvCell);
  });

  const csvContent = '\uFEFF' + [headers.map(csvCell).join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `جدول_المحميات_النهائي_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
