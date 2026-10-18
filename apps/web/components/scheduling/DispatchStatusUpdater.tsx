// apps/web/components/scheduling/DispatchStatusUpdater.tsx
// BW-007 Phase 3: DispatchStatusUpdater Component

import React from 'react';
import type { DispatchStatus } from '../../lib/scheduling/types';

export interface DispatchStatusUpdaterProps {
  dispatchStatus: DispatchStatus;
  onUpdateStatus: (nextStatus: DispatchStatus) => Promise<void> | void;
  isUpdating?: boolean;
}

export function DispatchStatusUpdater({
  dispatchStatus,
  onUpdateStatus,
  isUpdating = false,
}: DispatchStatusUpdaterProps): React.JSX.Element {
  if (dispatchStatus === 'ARRIVED') {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-emerald-900/60 bg-emerald-950/30 px-4 py-3 text-emerald-300">
        <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
        <span className="text-sm font-semibold text-emerald-200">
          Arrived on site
        </span>
      </div>
    );
  }

  if (dispatchStatus === 'EN_ROUTE') {
    return (
      <button
        type="button"
        disabled={isUpdating}
        onClick={() => onUpdateStatus('ARRIVED')}
        className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
      >
        {isUpdating ? 'Updating...' : 'Mark Arrived'}
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={isUpdating}
      onClick={() => onUpdateStatus('EN_ROUTE')}
      className="inline-flex items-center justify-center rounded-lg bg-zinc-800 px-4 py-2.5 text-sm font-semibold text-zinc-100 shadow-sm transition hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
    >
      {isUpdating ? 'Updating...' : 'Mark En Route'}
    </button>
  );
}
