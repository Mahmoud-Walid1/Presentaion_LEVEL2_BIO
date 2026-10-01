import React, { useState } from 'react';
import { UserCheck } from 'lucide-react';
import { TeamMember } from '../../types/team';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

interface EditMemberModalProps {
  isOpen: boolean;
  member: TeamMember | null;
  onClose: () => void;
  onSave: (memberId: string, newName: string) => Promise<void>;
}

export const EditMemberModal: React.FC<EditMemberModalProps> = ({
  isOpen,
  member,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(member?.full_name || '');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (member) setName(member.full_name);
  }, [member]);

  if (!member) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    await onSave(member.id, name.trim());
    setLoading(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={member.is_leader ? 'تعديل اسم قائد الفريق' : `تعديل اسم العضو (${member.member_order})`}
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4 py-2">
        <Input
          label="الاسم الجديد"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="أدخل الاسم..."
          icon={<UserCheck className="w-4 h-4 text-slate-400" />}
          autoFocus
        />

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            إلغاء
          </Button>
          <Button variant="primary" size="sm" type="submit" isLoading={loading}>
            حفظ التعديل
          </Button>
        </div>
      </form>
    </Modal>
  );
};
