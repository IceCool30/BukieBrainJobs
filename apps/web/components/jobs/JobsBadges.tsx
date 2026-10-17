'use client';

import React from 'react';
import {
  Briefcase,
  FileText,
  Clock,
  Calendar,
  CheckCircle2,
  X,
} from 'lucide-react';
import {
  CustomerActivityType,
  CustomerActivityStatus,
} from '@bukiebrainjobs/types';

interface TypeBadgeProps {
  type: CustomerActivityType;
}

export function TypeBadge({ type }: TypeBadgeProps) {
  if (type === 'job_request') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold font-mono uppercase tracking-wider bg-[var(--tag-bg)] text-[var(--text-main)] border border-[var(--lead)]">
        <FileText className="h-3 w-3 text-[var(--text-muted)]" />
        JOB REQUEST
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold font-mono uppercase tracking-wider bg-[var(--brand-green-dim)] text-[var(--brand-green)] border border-[var(--brand-green-border)]">
      <Briefcase className="h-3 w-3 text-[var(--brand-green)]" />
      BOOKING
    </span>
  );
}

interface StatusBadgeProps {
  status: CustomerActivityStatus;
  label: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  switch (status) {
    case 'in_progress':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-[var(--amber-dim)] text-[var(--amber)] border border-[var(--amber)]/30">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--amber)] animate-pulse" />
          {label}
        </span>
      );
    case 'scheduled':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-[var(--brand-green-dim)] text-[var(--brand-green)] border border-[var(--brand-green-border)]">
          <Calendar className="h-3 w-3 text-[var(--brand-green)]" />
          {label}
        </span>
      );
    case 'awaiting_progress':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-sky-500/10 text-[var(--text-main)] border border-sky-500/20">
          <Clock className="h-3 w-3 text-sky-500" />
          {label}
        </span>
      );
    case 'request_received':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
          <CheckCircle2 className="h-3 w-3 text-teal-500" />
          {label}
        </span>
      );
    case 'completed':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-[var(--brand-green-dim)] text-[var(--brand-green)] border border-[var(--brand-green-border)]">
          <CheckCircle2 className="h-3 w-3 text-[var(--brand-green)]" />
          {label}
        </span>
      );
    case 'cancelled':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium bg-[var(--tag-bg)] text-[var(--text-muted)] border border-[var(--lead)]">
          <X className="h-3 w-3 text-[var(--text-muted)]" />
          {label}
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-[var(--tag-bg)] text-[var(--text-main)] border border-[var(--lead)]">
          {label}
        </span>
      );
  }
}
