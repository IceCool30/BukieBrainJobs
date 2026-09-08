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
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
        <FileText className="h-3 w-3 text-slate-500" />
        JOB REQUEST
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-[#001A41] border border-indigo-200">
      <Briefcase className="h-3 w-3 text-indigo-500" />
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
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
          {label}
        </span>
      );
    case 'scheduled':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
          <Calendar className="h-3 w-3 text-emerald-600" />
          {label}
        </span>
      );
    case 'awaiting_progress':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-800 border border-blue-200">
          <Clock className="h-3 w-3 text-blue-600" />
          {label}
        </span>
      );
    case 'request_received':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-50 text-teal-800 border border-teal-200">
          <CheckCircle2 className="h-3 w-3 text-teal-600" />
          {label}
        </span>
      );
    case 'completed':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-900 border border-emerald-300">
          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
          {label}
        </span>
      );
    case 'cancelled':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
          <X className="h-3 w-3 text-slate-400" />
          {label}
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
          {label}
        </span>
      );
  }
}
