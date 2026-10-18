// apps/web/components/scheduling/ArrivalWindowCard.tsx
// BW-007 Phase 3: ArrivalWindowCard Component

import React from 'react';
import type { ArrivalWindow, DispatchStatus, JobStatus } from '../../lib/scheduling/types';

export interface ArrivalWindowCardProps {
  arrivalWindow: ArrivalWindow;
  jobStatus: JobStatus;
  dispatchStatus: DispatchStatus;
  onRequestReschedule?: () => void;
  canReschedule?: boolean;
}

function formatDispatchStatusLabel(status: DispatchStatus): string {
  switch (status) {
    case 'NOT_STARTED':
      return 'Not Started';
    case 'EN_ROUTE':
      return 'En Route';
    case 'ARRIVED':
      return 'Arrived';
    default:
      return status;
  }
}

export function ArrivalWindowCard({
  arrivalWindow,
  jobStatus,
  dispatchStatus,
  onRequestReschedule,
  canReschedule = true,
}: ArrivalWindowCardProps): React.JSX.Element {
  const isRescheduleDisabled =
    dispatchStatus === 'EN_ROUTE' ||
    dispatchStatus === 'ARRIVED' ||
    canReschedule === false;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 text-zinc-100 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-500">
            Agreed Arrival Window
          </span>
          <h3 className="mt-1 text-lg font-bold text-white sm:text-xl">
            {arrivalWindow.display}
          </h3>
          <p className="mt-1 text-sm text-zinc-400">
            Scheduled for {arrivalWindow.date} ({arrivalWindow.startHour}:00 - {arrivalWindow.endHour}:00)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs font-medium text-zinc-200">
            {jobStatus}
          </span>
          <span className="inline-flex items-center rounded-full border border-emerald-900/60 bg-emerald-950/40 px-3 py-1 text-xs font-medium text-emerald-400">
            {formatDispatchStatusLabel(dispatchStatus)}
          </span>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end border-t border-zinc-800/80 pt-4">
        <button
          type="button"
          disabled={isRescheduleDisabled}
          onClick={onRequestReschedule}
          className="inline-flex items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-100 shadow-sm transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Request Reschedule
        </button>
      </div>
    </div>
  );
}
