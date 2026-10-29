// apps/web/components/scheduling/RescheduleResponseCard.tsx
// BW-007 Phase 3: RescheduleResponseCard Component

import React, { useState } from 'react';
import type { ArrivalWindow, RescheduleReason, RescheduleRequest } from '../../lib/scheduling/types';

export interface RescheduleResponseCardProps {
  request: RescheduleRequest;
  currentUserRole: 'CLIENT' | 'TASKER';
  onAccept?: (selectedWindow: ArrivalWindow) => Promise<void> | void;
  onDecline?: () => Promise<void> | void;
  onCounter?: (
    counterWindows: ArrivalWindow[],
    counterReason?: RescheduleReason,
    counterNote?: string
  ) => Promise<void> | void;
  isSubmitting?: boolean;
}

export function RescheduleResponseCard({
  request,
  currentUserRole,
  onAccept,
  onDecline,
  onCounter,
  isSubmitting = false,
}: RescheduleResponseCardProps): React.JSX.Element {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const isRequester = currentUserRole === request.requesterRole;

  if (isRequester) {
    return (
      <div className="rounded-2xl border border-amber-900/40 bg-amber-950/20 p-5 text-amber-200">
        <div className="flex items-start gap-3">
          <span className="text-xl">⏳</span>
          <div>
            <h4 className="font-semibold text-amber-100">
              Reschedule Proposal Submitted
            </h4>
            <p className="mt-1 text-sm text-amber-300/80">
              Awaiting response from counterparty. You will receive an update once they accept, decline, or suggest another window.
            </p>
            <div className="mt-3 space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                Proposed Candidate Windows:
              </span>
              {request.proposedWindows.map((win, idx) => (
                <div key={idx} className="text-xs text-amber-200">
                  • {win.display}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const selectedWindow = request.proposedWindows[selectedIndex] ?? request.proposedWindows[0];

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-zinc-100 shadow-sm">
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Reschedule Request Received
          </span>
          <h4 className="mt-0.5 text-base font-bold text-white">
            Counterparty Proposed New Arrival Window
          </h4>
        </div>
        <span className="rounded-full border border-zinc-700 bg-zinc-900 px-2.5 py-0.5 text-xs font-medium text-zinc-300">
          Reason: {request.reason}
        </span>
      </div>

      {request.reasonNote && (
        <p className="mt-3 rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 text-sm text-zinc-300">
          <span className="font-semibold text-zinc-400">Note:</span> {request.reasonNote}
        </p>
      )}

      <div className="mt-4 space-y-2">
        <span className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Select Arrival Window:
        </span>
        {request.proposedWindows.map((win, idx) => (
          <label
            key={idx}
            className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition ${
              selectedIndex === idx
                ? 'border-emerald-500 bg-emerald-950/20 text-white'
                : 'border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="selectedArrivalWindow"
                aria-label={win.display}
                checked={selectedIndex === idx}
                onChange={() => setSelectedIndex(idx)}
                className="h-4 w-4 border-zinc-700 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-sm font-medium">{win.display}</span>
            </div>
            {selectedIndex === idx && (
              <span className="text-xs font-semibold text-emerald-400">Selected</span>
            )}
          </label>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-zinc-800/80 pt-4">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => onDecline?.()}
          className="rounded-md border border-zinc-700 bg-zinc-900 px-5 py-2 text-sm font-medium text-rose-400 transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:opacity-50"
        >
          Decline
        </button>

        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => onCounter?.(request.proposedWindows, request.reason, request.reasonNote)}
          className="rounded-md border border-zinc-700 bg-zinc-900 px-5 py-2 text-sm font-medium text-zinc-200 transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
        >
          Counter
        </button>

        <button
          type="button"
          disabled={isSubmitting || !selectedWindow}
          onClick={() => {
            if (selectedWindow) {
              onAccept?.(selectedWindow);
            }
          }}
          className="inline-flex items-center justify-center outlier-pill-button rounded-full bg-[var(--amber)] px-5 py-2 text-sm font-semibold text-[#001A41] shadow-sm transition hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[var(--amber)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Accept
        </button>
      </div>
    </div>
  );
}
