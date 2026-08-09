import React from 'react';

export interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center bg-white border border-dashed border-[#E9ECEF] rounded-[32px] gap-4 ${className}`}>
      <div className="w-16 h-16 rounded-full bg-[#F8F9FF] border border-[#E9ECEF] flex items-center justify-center text-[#001A41] text-2xl shadow-inner">
        {icon || '📋'}
      </div>

      <div className="space-y-1 max-w-sm">
        <h4 className="font-display font-bold text-base text-[#001A41]">{title}</h4>
        <p className="font-body text-xs text-[#64748B] leading-relaxed">{description}</p>
      </div>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="bg-[#296A4B] hover:bg-[#205139] text-white font-body font-bold text-xs px-5 py-2.5 rounded-full transition-all shadow-sm active:scale-95 mt-2"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
