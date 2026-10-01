import React, { useState } from 'react';
import { Users, Crown, Edit2, Trash2, Copy, Check, Unlock, ChevronDown, ChevronUp } from 'lucide-react';
import { Team, TeamMember } from '../../types/team';
import { Button } from '../common/Button';

interface AdminTeamsTableProps {
  teams: Team[];
  onEditMember: (team: Team, member: TeamMember) => void;
  onDeleteTeam: (teamId: string) => void;
  onReleaseSlot: (slotNumber: number) => void;
}

export const AdminTeamsTable: React.FC<AdminTeamsTableProps> = ({
  teams,
  onEditMember,
  onDeleteTeam,
  onReleaseSlot,
}) => {
  const [copiedPin, setCopiedPin] = useState<string | null>(null);
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);

  const handleCopyPin = (pin: string) => {
    navigator.clipboard.writeText(pin);
    setCopiedPin(pin);
    setTimeout(() => setCopiedPin(null), 2000);
  };

  const toggleExpand = (teamId: string) => {
    setExpandedTeamId(expandedTeamId === teamId ? null : teamId);
  };

  if (teams.length === 0) {
    return (
      <div className="text-center py-12 p-6 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400">
        <Users className="w-10 h-10 mx-auto text-slate-600 mb-2" />
        <p className="text-sm font-medium">لم يتم تسجيل أي فريق حتى الآن</p>
        <p className="text-xs text-slate-500 mt-1">ستظهر الفرق المسجلة هنا لحظياً بمجرد إرسالها</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Users className="w-4 h-4 text-brand-400" />
          <span>كشف الفرق المسجلة ({teams.length} فرق)</span>
        </h2>
      </div>

      {/* Mobile Cards View (< md) */}
      <div className="block md:hidden space-y-3">
        {teams.map((team) => {
          const leader = team.members?.find((m) => m.is_leader);
          const isExpanded = expandedTeamId === team.id;
          const teamLabel = team.team_number ? `تيم ${team.team_number}` : 'في انتظار الحجز';

          return (
            <div
              key={team.id}
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">اسم الفريق:</span>
                  <span className="text-base font-extrabold text-brand-300">
                    {teamLabel}
                  </span>
                </div>

                <button
                  onClick={() => handleCopyPin(team.pin_code)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 text-xs font-mono font-bold text-brand-300"
                >
                  <span>PIN: {team.pin_code}</span>
                  {copiedPin === team.pin_code ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                <div className="flex items-center gap-1.5">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span className="text-slate-400">الليدر:</span>
                  <strong className="text-white">{leader?.full_name || '—'}</strong>
                </div>

                {leader && (
                  <button
                    onClick={() => onEditMember(team, leader)}
                    className="text-slate-400 hover:text-brand-400 p-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {team.slot_number ? (
                <div className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-lg flex items-center justify-between">
                  <span>محجوز: محمية #{team.slot_number}</span>
                  <button
                    onClick={() => onReleaseSlot(team.slot_number!)}
                    className="text-rose-400 hover:text-rose-300 font-bold"
                  >
                    تفريغ
                  </button>
                </div>
              ) : (
                <div className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-lg">
                  لم يختر محمية بعد
                </div>
              )}

              {/* Members Toggle */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => toggleExpand(team.id)}
                  className="flex items-center gap-1 text-xs text-slate-300 hover:text-white"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>الأعضاء (7)</span>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                <Button
                  size="sm"
                  variant="danger"
                  className="py-1 px-2.5 text-xs"
                  onClick={() => onDeleteTeam(team.id)}
                  icon={<Trash2 className="w-3.5 h-3.5" />}
                >
                  حذف
                </Button>
              </div>

              {isExpanded && (
                <div className="pt-2 border-t border-slate-800/80 space-y-1.5 animate-fade-in">
                  {team.members?.map((member) => (
                    <div
                      key={member.id}
                      className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 text-xs flex items-center justify-between"
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        {member.is_leader ? (
                          <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        ) : (
                          <span className="text-[10px] text-slate-500">#{member.member_order}</span>
                        )}
                        <span className="text-slate-200 truncate">{member.full_name}</span>
                      </div>
                      <button
                        onClick={() => onEditMember(team, member)}
                        className="text-slate-500 hover:text-brand-400 p-1 shrink-0"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Desktop Table View (>= md) */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
        <table className="w-full text-right text-xs text-slate-200">
          <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-semibold">
            <tr>
              <th className="p-3.5">اسم الفريق</th>
              <th className="p-3.5">قائد الفريق (الليدر)</th>
              <th className="p-3.5">رمز الدخول (PIN)</th>
              <th className="p-3.5">حالة الحجز</th>
              <th className="p-3.5 text-center">أعضاء الفريق (7)</th>
              <th className="p-3.5 text-center">إجراءات الإدارة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {teams.map((team) => {
              const leader = team.members?.find((m) => m.is_leader);
              const isExpanded = expandedTeamId === team.id;
              const teamLabel = team.team_number ? `تيم ${team.team_number}` : 'في انتظار الحجز';

              return (
                <React.Fragment key={team.id}>
                  <tr className="hover:bg-slate-800/40 transition-colors">
                    {/* Team Name */}
                    <td className="p-3.5 font-bold">
                      {team.team_number ? (
                        <span className="text-brand-300 font-extrabold text-sm">
                          {teamLabel}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">في انتظار الحجز</span>
                      )}
                    </td>

                    {/* Leader */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="font-semibold text-white">{leader?.full_name || '—'}</span>
                        {leader && (
                          <button
                            onClick={() => onEditMember(team, leader)}
                            className="text-slate-500 hover:text-brand-400 p-0.5"
                            title="تعديل اسم الليدر"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </td>

                    {/* PIN */}
                    <td className="p-3.5 font-mono">
                      <button
                        onClick={() => handleCopyPin(team.pin_code)}
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-brand-300 font-bold tracking-wider transition-colors"
                        title="انقر لنسخ الكود"
                      >
                        <span>{team.pin_code}</span>
                        {copiedPin === team.pin_code ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3 text-slate-400" />
                        )}
                      </button>
                    </td>

                    {/* Slot Status */}
                    <td className="p-3.5">
                      {team.slot_number ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold">
                          محمية #{team.slot_number}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px]">
                          لم يحجز بعد
                        </span>
                      )}
                    </td>

                    {/* Expand/Collapse Members */}
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => toggleExpand(team.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors text-xs"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>عرض الأعضاء</span>
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {team.slot_number && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="py-1 px-2 text-[11px] text-amber-400 hover:text-amber-300 border-amber-500/30"
                            onClick={() => onReleaseSlot(team.slot_number!)}
                            icon={<Unlock className="w-3 h-3" />}
                          >
                            إلغاء الحجز
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="danger"
                          className="py-1 px-2 text-[11px]"
                          onClick={() => onDeleteTeam(team.id)}
                          icon={<Trash2 className="w-3 h-3" />}
                        >
                          حذف الفريق
                        </Button>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Members Drawer */}
                  {isExpanded && (
                    <tr className="bg-slate-950/60">
                      <td colSpan={6} className="p-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                          {team.members?.map((member) => (
                            <div
                              key={member.id}
                              className={`p-2.5 rounded-xl border flex items-center justify-between ${
                                member.is_leader
                                  ? 'bg-brand-950/30 border-brand-500/30 text-brand-300'
                                  : 'bg-slate-900 border-slate-800 text-slate-300'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                {member.is_leader ? (
                                  <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                ) : (
                                  <span className="text-[10px] text-slate-500">#{member.member_order}</span>
                                )}
                                <span className="font-medium truncate">{member.full_name}</span>
                              </div>
                              <button
                                onClick={() => onEditMember(team, member)}
                                className="text-slate-500 hover:text-brand-400 p-1 shrink-0"
                                title="تعديل الاسم"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
