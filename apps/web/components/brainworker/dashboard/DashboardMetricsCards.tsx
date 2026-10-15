// apps/web/components/brainworker/dashboard/DashboardMetricsCards.tsx
// BrainWorker Operating Dashboard: Metrics Cards Sub-Component
// Item 2.2 in master checklist (COMP-003 to COMP-008)

import React, { type JSX } from 'react';
import type { DashboardMetricsCardsProps } from './types';

function formatNextStartTime(isoString: string | null): string {
  if (!isoString) return 'No more jobs today';
  try {
    const d = new Date(isoString);
    if (Number.isNaN(d.getTime())) return 'No more jobs today';
    const hours = d.getUTCHours().toString().padStart(2, '0');
    const minutes = d.getUTCMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  } catch {
    return 'No more jobs today';
  }
}

export function DashboardMetricsCards({
  metrics,
  onSelectActiveJob,
  onNavigateToLeads,
}: DashboardMetricsCardsProps): JSX.Element {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {/* Today's Bookings (COMP-003) */}
      <div
        data-testid="metric-today-bookings"
        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Today&apos;s Schedule
        </span>
        <div className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
          {metrics.todayBookingsCount}
        </div>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Bookings scheduled for today
        </p>
      </div>

      {/* Next Scheduled Arrival (COMP-004) */}
      <div
        data-testid="metric-next-start"
        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Next Arrival
        </span>
        <div className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
          {formatNextStartTime(metrics.nextScheduledStartAt)}
        </div>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {metrics.nextScheduledStartAt ? 'Earliest upcoming start' : 'Schedule clear'}
        </p>
      </div>

      {/* Active Jobs & Deep-Link CTA (COMP-005) */}
      <div
        data-testid="metric-active-jobs"
        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Active Jobs
        </span>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-3xl font-bold text-slate-900 dark:text-white">
            {metrics.activeJobsCount}
          </span>
          {metrics.activeJobId && (
            <button
              type="button"
              onClick={() => onSelectActiveJob?.(metrics.activeJobId!)}
              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:bg-emerald-500 dark:hover:bg-emerald-600"
            >
              View Active Job
            </button>
          )}
        </div>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Currently in progress or en route
        </p>
      </div>

      {/* Pending Quotes (COMP-006) */}
      <div
        data-testid="metric-pending-quotes"
        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Pending Quotes
        </span>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-3xl font-bold text-slate-900 dark:text-white">
            {metrics.pendingQuotesCount}
          </span>
          <button
            type="button"
            onClick={() => onNavigateToLeads?.()}
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            Review Leads
          </button>
        </div>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Customer invitations awaiting response
        </p>
      </div>

      {/* Completed Jobs Counter (COMP-007) */}
      <div
        data-testid="metric-completed-jobs"
        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Completed Jobs
        </span>
        <div className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
          {metrics.completedJobsCount}
        </div>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          All-time fulfilled service bookings
        </p>
      </div>

      {/* Customer Rating (COMP-008) */}
      <div
        data-testid="metric-client-rating"
        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Customer Rating
        </span>
        <div className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
          {typeof metrics.clientRating === 'number'
            ? `${metrics.clientRating} / 5.0`
            : 'No reviews yet'}
        </div>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Verified quality score
        </p>
      </div>
    </div>
  );
}
