import React from 'react';
import { AlertCircle } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  hint?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  hint,
  id,
  className = '',
  ...props
}) => {
  const inputId = id || (label ? `input-${label.replace(/\s+/g, '-')}` : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5 text-right">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-semibold text-slate-300 flex items-center justify-between"
        >
          <span>{label}</span>
          {hint && <span className="text-[11px] font-normal text-slate-400">{hint}</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute right-3.5 text-slate-400 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={`w-full rounded-xl bg-slate-900/90 text-slate-100 border text-sm transition-all duration-150 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 ${
            icon ? 'pr-10 pl-3.5 py-2.5' : 'px-3.5 py-2.5'
          } ${
            error
              ? 'border-rose-500/80 bg-rose-950/10 focus:ring-rose-500/40 focus:border-rose-500'
              : 'border-slate-800 hover:border-slate-700'
          } ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs text-rose-400 flex items-center gap-1 mt-0.5 animate-fade-in">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};
