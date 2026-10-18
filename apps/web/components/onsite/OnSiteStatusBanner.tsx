// apps/web/components/onsite/OnSiteStatusBanner.tsx
// BW-008: On-Site Work & In-Progress Verification
// Dual-Sided On-Site Status Banner

'use client';

import React from 'react';
import type { JobStatus } from '@bukiebrainjobs/api-types';
import type { OnSiteEscrowStatus } from '../../lib/onsite/types';

export interface OnSiteStatusBannerProps {
  jobStatus: JobStatus;
  checkedInAt?: string | undefined;
  escrowStatus: OnSiteEscrowStatus;
}

export function OnSiteStatusBanner({
  jobStatus,
  checkedInAt,
  escrowStatus,
}: OnSiteStatusBannerProps): React.ReactElement {
  const isEscrowFunded = escrowStatus === 'ESCROW_HELD';

  const formatStatus = (status: JobStatus): string => {
    switch (status) {
      case 'IN_PROGRESS':
        return 'In Progress';
      case 'CONFIRMED':
        return 'Confirmed';
      case 'PENDING_COMPLETION':
        return 'Pending Completion';
      case 'COMPLETED':
        return 'Completed';
      case 'DISPUTED':
        return 'Disputed';
      default:
        return status;
    }
  };

  const formatTime = (isoString: string): string => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-zinc-100 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800 text-amber-400">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-zinc-100">
                On-Site Execution Status
              </span>
              <span className="rounded-md border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-xs font-medium text-zinc-300">
                {formatStatus(jobStatus)}
              </span>
            </div>
            {checkedInAt && (
              <p className="text-xs text-zinc-400">
                Arrived at {formatTime(checkedInAt)} (Physical presence verified)
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ${
              isEscrowFunded
                ? 'border border-emerald-800 bg-emerald-950 text-emerald-400'
                : 'border border-amber-800 bg-amber-950 text-amber-400'
            }`}
          >
            {isEscrowFunded ? 'Escrow Protected' : 'Escrow Unfunded'}
          </span>
        </div>
      </div>
    </div>
  );
}
