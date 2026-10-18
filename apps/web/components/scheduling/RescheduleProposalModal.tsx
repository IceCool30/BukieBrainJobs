// apps/web/components/scheduling/RescheduleProposalModal.tsx
// BW-007 Phase 3: RescheduleProposalModal Component

import React, { useState } from 'react';
import { formatArrivalWindow } from '../../lib/scheduling/domain';
import type { ArrivalWindow, RescheduleReason } from '../../lib/scheduling/types';

export interface RescheduleProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitProposal: (input: {
    proposedWindows: ArrivalWindow[];
    reason: RescheduleReason;
    reasonNote?: string | undefined;
  }) => Promise<void> | void;
  currentArrivalWindow?: ArrivalWindow;
  isSubmitting?: boolean;
}

const REASON_OPTIONS: { value: RescheduleReason; label: string }[] = [
  { value: 'PARTS_PROCUREMENT', label: 'Parts Procurement' },
  { value: 'TRAFFIC_DELAY', label: 'Traffic Delay' },
  { value: 'CUSTOMER_UNAVAILABLE', label: 'Customer Unavailable' },
  { value: 'WEATHER', label: 'Severe Weather' },
  { value: 'EMERGENCY', label: 'Emergency' },
  { value: 'OTHER', label: 'Other Reason' },
];

export function RescheduleProposalModal({
  isOpen,
  onClose,
  onSubmitProposal,
  currentArrivalWindow,
  isSubmitting = false,
}: RescheduleProposalModalProps): React.JSX.Element | null {
  const [reason, setReason] = useState<RescheduleReason>('PARTS_PROCUREMENT');
  const [reasonNote, setReasonNote] = useState<string>('');
  const [candidateDate, setCandidateDate] = useState<string>('2026-10-26');
  const [startHour, setStartHour] = useState<string>('14');
  const [endHour, setEndHour] = useState<string>('17');
  const [localError, setLocalError] = useState<string | null>(null);

  if (!isOpen) {
    return null;
  }

  const isOtherWithoutNote =
    reason === 'OTHER' && reasonNote.trim().length === 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    const parsedStart = parseInt(startHour, 10);
    const parsedEnd = parseInt(endHour, 10);

    if (isNaN(parsedStart) || isNaN(parsedEnd)) {
      setLocalError('Start and end hours must be valid integers');
      return;
    }

    if (parsedStart >= parsedEnd) {
      setLocalError('Start hour must be strictly before end hour');
      return;
    }

    try {
      const candidate = formatArrivalWindow(candidateDate, parsedStart, parsedEnd);
      await onSubmitProposal({
        proposedWindows: [candidate],
        reason,
        reasonNote: reason === 'OTHER' || reasonNote.trim().length > 0 ? reasonNote.trim() : undefined,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid candidate arrival window';
      setLocalError(message);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reschedule-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-zinc-100 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <h2 id="reschedule-modal-title" className="text-xl font-bold text-white">
            Propose Reschedule
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-900 hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        {currentArrivalWindow && (
          <div className="mt-4 rounded-lg border border-zinc-800/80 bg-zinc-900/50 p-3 text-sm text-zinc-300">
            <span className="font-semibold text-zinc-400">Current Window:</span>{' '}
            {currentArrivalWindow.display}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="reschedule-reason"
              className="block text-sm font-medium text-zinc-300"
            >
              Reason for reschedule
            </label>
            <select
              id="reschedule-reason"
              aria-label="Reason for reschedule"
              value={reason}
              onChange={(e) => setReason(e.target.value as RescheduleReason)}
              className="mt-1 block w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              {REASON_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {reason === 'OTHER' && (
            <div>
              <label
                htmlFor="reason-note"
                className="block text-sm font-medium text-zinc-300"
              >
                Reason note
              </label>
              <textarea
                id="reason-note"
                aria-label="Reason note"
                rows={3}
                value={reasonNote}
                onChange={(e) => setReasonNote(e.target.value)}
                placeholder="Explain the specific situation requiring a reschedule..."
                className="mt-1 block w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-500 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          )}

          <div className="space-y-3 rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Candidate Arrival Window
            </span>

            <div>
              <label
                htmlFor="candidate-date"
                className="block text-xs font-medium text-zinc-300"
              >
                Candidate date
              </label>
              <input
                id="candidate-date"
                aria-label="Candidate date"
                type="date"
                value={candidateDate}
                onChange={(e) => setCandidateDate(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="start-hour"
                  className="block text-xs font-medium text-zinc-300"
                >
                  Start hour
                </label>
                <input
                  id="start-hour"
                  aria-label="Start hour"
                  type="number"
                  min="0"
                  max="23"
                  value={startHour}
                  onChange={(e) => setStartHour(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label
                  htmlFor="end-hour"
                  className="block text-xs font-medium text-zinc-300"
                >
                  End hour
                </label>
                <input
                  id="end-hour"
                  aria-label="End hour"
                  type="number"
                  min="1"
                  max="24"
                  value={endHour}
                  onChange={(e) => setEndHour(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {localError && (
            <p className="text-sm font-medium text-rose-400">{localError}</p>
          )}

          <div className="flex items-center justify-end gap-3 border-t border-zinc-800 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isOtherWithoutNote}
              className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit proposal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
