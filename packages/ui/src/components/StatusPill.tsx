import React from 'react';
import { TaskStatus } from '@bukiebrainjobs/types';

export interface StatusPillProps {
  /** The TaskStatus enum value from @bukiebrainjobs/types */
  status: TaskStatus;
  /** Size variant: 'sm' (compact) or 'md' (standard) */
  size?: 'sm' | 'md';
  /** Toggle status indicator icon/dot (default: true) */
  showIcon?: boolean;
  /** Additional custom CSS classes */
  className?: string;
}

interface StatusStyleConfig {
  label: string;
  bg: string;
  text: string;
  border: string;
  dotColor: string;
  pulse?: boolean;
  icon: React.ReactNode;
}

const statusConfigs: Record<TaskStatus, StatusStyleConfig> = {
  draft: {
    label: 'Draft',
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-300',
    dotColor: 'bg-slate-400',
    icon: (
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
  booking_confirmed: {
    label: 'Confirmed',
    bg: 'bg-[#001A41]/10',
    text: 'text-[#001A41]',
    border: 'border-[#001A41]/25',
    dotColor: 'bg-[#001A41]',
    icon: (
      <svg className="w-3 h-3 text-[#001A41]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  artisan_en_route: {
    label: 'En Route',
    bg: 'bg-amber-100',
    text: 'text-amber-800',
    border: 'border-amber-300',
    dotColor: 'bg-amber-500',
    pulse: true,
    icon: (
      <svg className="w-3 h-3 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  job_in_progress: {
    label: 'In Progress',
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-300',
    dotColor: 'bg-blue-600',
    pulse: true,
    icon: (
      <svg className="w-3 h-3 text-blue-700 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  invoice_submitted: {
    label: 'Invoice Pending',
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    border: 'border-purple-300',
    dotColor: 'bg-purple-600',
    icon: (
      <svg className="w-3 h-3 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  completed_and_paid: {
    label: 'Completed & Paid',
    bg: 'bg-[#296A4B]/15',
    text: 'text-[#296A4B]',
    border: 'border-[#296A4B]/30',
    dotColor: 'bg-[#296A4B]',
    icon: (
      <svg className="w-3 h-3 text-[#296A4B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  disputed: {
    label: 'Disputed',
    bg: 'bg-red-100',
    text: 'text-red-700',
    border: 'border-red-300',
    dotColor: 'bg-red-600',
    pulse: true,
    icon: (
      <svg className="w-3 h-3 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
  cancelled: {
    label: 'Cancelled',
    bg: 'bg-slate-100',
    text: 'text-slate-500 line-through',
    border: 'border-slate-200',
    dotColor: 'bg-slate-400',
    icon: (
      <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
      </svg>
    ),
  },
};

export const StatusPill: React.FC<StatusPillProps> = ({
  status,
  size = 'md',
  showIcon = true,
  className = '',
}) => {
  const config = statusConfigs[status] ?? statusConfigs.draft;
  const sizeClasses =
    size === 'sm'
      ? 'text-[10px] px-2.5 py-0.5 gap-1 min-h-[22px]'
      : 'text-[11px] px-3 py-1 gap-1.5 min-h-[26px]';

  return (
    <span
      className={`inline-flex items-center rounded-full font-display font-extrabold uppercase tracking-wider border transition-all ${config.bg} ${config.text} ${config.border} ${sizeClasses} ${className}`}
    >
      {showIcon && (
        <span className="relative flex items-center justify-center shrink-0">
          {config.pulse && (
            <span
              className={`absolute inline-flex h-2 w-2 rounded-full opacity-75 animate-ping ${config.dotColor}`}
            />
          )}
          {config.icon}
        </span>
      )}
      <span>{config.label}</span>
    </span>
  );
};
