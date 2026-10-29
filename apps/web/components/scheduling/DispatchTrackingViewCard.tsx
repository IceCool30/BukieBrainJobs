// apps/web/components/scheduling/DispatchTrackingViewCard.tsx
// BW-007 Phase 3: DispatchTrackingViewCard Component

import React from 'react';
import type { DispatchStatus, DispatchTrackingView } from '../../lib/scheduling/types';

export interface DispatchTrackingViewCardProps {
  view: DispatchTrackingView;
  onRefresh?: () => void;
}

const STEPS: { status: DispatchStatus; label: string }[] = [
  { status: 'NOT_STARTED', label: 'Not Started' },
  { status: 'EN_ROUTE', label: 'En Route' },
  { status: 'ARRIVED', label: 'Arrived' },
];

function getStepIndex(status: DispatchStatus): number {
  switch (status) {
    case 'NOT_STARTED':
      return 0;
    case 'EN_ROUTE':
      return 1;
    case 'ARRIVED':
      return 2;
    default:
      return 0;
  }
}

export function DispatchTrackingViewCard({
  view,
  onRefresh,
}: DispatchTrackingViewCardProps): React.JSX.Element {
  const currentIndex = getStepIndex(view.dispatchStatus);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-zinc-100 shadow-sm">
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Dispatch Progression Tracker
          </span>
          <h3 className="mt-0.5 text-lg font-bold text-white">
            Technician Arrival Status
          </h3>
        </div>
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            className="rounded-md border border-zinc-700 bg-zinc-900 px-4 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800"
          >
            Refresh Status
          </button>
        )}
      </div>

      <div className="mt-6">
        <div className="relative flex items-center justify-between">
          <div className="absolute left-0 top-1/2 -z-0 h-1 w-full -translate-y-1/2 bg-zinc-800" />
          <div
            className="absolute left-0 top-1/2 -z-0 h-1 -translate-y-1/2 bg-emerald-500 transition-all duration-300"
            style={{ width: `${(currentIndex / (STEPS.length - 1)) * 100}%` }}
          />

          {STEPS.map((step, idx) => {
            const isCompleted = idx < currentIndex;
            const isCurrent = idx === currentIndex;

            return (
              <div key={step.status} className="relative z-10 flex flex-col items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition ${
                    isCompleted
                      ? 'border-emerald-500 bg-emerald-600 text-white'
                      : isCurrent
                        ? 'border-emerald-400 bg-zinc-950 text-emerald-400 ring-4 ring-emerald-950/60'
                        : 'border-zinc-700 bg-zinc-900 text-zinc-500'
                  }`}
                >
                  {isCompleted ? '✓' : idx + 1}
                </div>
                <span
                  className={`mt-2 text-xs font-semibold ${
                    isCurrent
                      ? 'text-emerald-400'
                      : isCompleted
                        ? 'text-zinc-200'
                        : 'text-zinc-500'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Current Activity
        </span>
        <p className="mt-1 text-sm font-medium text-white">{view.actionRequired}</p>
        <p className="mt-1 text-xs text-zinc-400">
          Scheduled Window: {view.arrivalWindow.display}
        </p>
      </div>

      <div className="mt-4 flex items-start gap-3 rounded-xl border border-sky-900/40 bg-sky-950/20 p-4 text-sky-200">
        <span className="text-lg">🛡️</span>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-sky-300">
            Safety Guidance
          </h4>
          <p className="mt-0.5 text-sm text-sky-100">{view.safetyNotice}</p>
        </div>
      </div>
    </div>
  );
}
