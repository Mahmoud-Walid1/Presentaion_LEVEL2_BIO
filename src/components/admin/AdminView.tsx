import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminLoginModal } from './AdminLoginModal';
import { AdminHeader } from './AdminHeader';
import { AdminSlotGrid } from './AdminSlotGrid';
import { AdminTeamsTable } from './AdminTeamsTable';
import { EditMemberModal } from './EditMemberModal';
import { Team, TeamMember } from '../../types/team';
import { updateTeamMember, deleteTeam } from '../../services/teamService';
import { releaseSlot } from '../../services/slotService';

export const AdminView: React.FC = () => {
  const { isAdmin, slots, teams, refreshData, showToast } = useApp();
  const [selectedMember, setSelectedMember] = useState<{ team: Team; member: TeamMember } | null>(null);

  if (!isAdmin) {
    return <AdminLoginModal />;
  }

  const handleEditMember = (team: Team, member: TeamMember) => {
    setSelectedMember({ team, member });
  };

  const handleSaveMember = async (memberId: string, newName: string) => {
    if (!selectedMember) return;
    const success = await updateTeamMember(selectedMember.team.id, memberId, newName);
    if (success) {
      await refreshData();
      showToast('تم تعديل الاسم بنجاح', 'success');
    } else {
      showToast('فشل تعديل الاسم', 'error');
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذا الفريق؟')) return;
    const success = await deleteTeam(teamId);
    if (success) {
      await refreshData();
      showToast('تم حذف الفريق بنجاح وتفريغ دوره إن وجد', 'success');
    } else {
      showToast('فشل حذف الفريق', 'error');
    }
  };

  const handleReleaseSlot = async (slotNumber: number) => {
    if (!window.confirm(`هل أنت متأكد من تفريغ وإلغاء حجز بريزنتيشن ${slotNumber}؟`)) return;
    const success = await releaseSlot(slotNumber);
    if (success) {
      await refreshData();
      showToast(`تم تفريغ بريزنتيشن ${slotNumber} بنجاح`, 'success');
    } else {
      showToast('فشل تفريغ الدور', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
      <AdminHeader />
      <AdminSlotGrid slots={slots} teams={teams} onReleaseSlot={handleReleaseSlot} />
      <AdminTeamsTable
        teams={teams}
        onEditMember={handleEditMember}
        onDeleteTeam={handleDeleteTeam}
        onReleaseSlot={handleReleaseSlot}
      />

      <EditMemberModal
        isOpen={Boolean(selectedMember)}
        member={selectedMember?.member || null}
        onClose={() => setSelectedMember(null)}
        onSave={handleSaveMember}
      />
    </div>
  );
};
