import { Team } from '../types/team';
import { PresentationSlot } from '../types/slot';

export const exportTeamsToCsv = (teams: Team[], slots: PresentationSlot[]) => {
  const headers = ['رقم الدور', 'اسم الدور', 'اسم الفريق', 'رمز الدخول (PIN)', 'اسم القائد', 'أعضاء الفريق'];

  const rows = slots.map((slot) => {
    const team = teams.find((t) => t.slot_number === slot.id);
    const leader = team?.members?.find((m) => m.is_leader)?.full_name || 'غير محجوز';
    const otherMembers = team?.members
      ?.filter((m) => !m.is_leader)
      ?.map((m) => m.full_name)
      .join(' - ') || '—';
    const teamLabel = team ? `تيم ${slot.id}` : 'شاغر';
    const pin = team?.pin_code || '—';

    return [
      slot.id,
      slot.title,
      teamLabel,
      pin,
      leader,
      `"${otherMembers}"`,
    ];
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `جدول_البريزنتيشن_النهائي_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
