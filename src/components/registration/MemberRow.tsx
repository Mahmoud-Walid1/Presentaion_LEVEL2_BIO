import React from 'react';
import { Crown, User } from 'lucide-react';
import { Input } from '../common/Input';

interface MemberRowProps {
  index: number;
  value: string;
  onChange: (val: string) => void;
  error?: string;
}

export const MemberRow: React.FC<MemberRowProps> = ({
  index,
  value,
  onChange,
  error,
}) => {
  const isLeader = index === 0;

  return (
    <div
      className={`p-3.5 rounded-xl border transition-all duration-150 ${
        isLeader
          ? 'bg-brand-950/20 border-brand-500/30 shadow-sm'
          : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700/80'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {isLeader ? (
            <span className="flex items-center gap-1 text-xs font-bold text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-md border border-brand-500/20">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>قائد الفريق (الليدر)</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs font-medium text-slate-400">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span>العضو رقم {index + 1}</span>
            </span>
          )}
        </div>
      </div>

      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={isLeader ? 'الاسم الثلاثي لقائد الفريق...' : `اسم العضو رقم ${index + 1}...`}
        error={error}
        icon={isLeader ? <Crown className="w-4 h-4 text-amber-400" /> : <User className="w-4 h-4 text-slate-500" />}
      />
    </div>
  );
};
