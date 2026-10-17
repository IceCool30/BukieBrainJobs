// apps/web/components/brainworker/dashboard/DashboardMetricsCards.tsx
// BrainWorker Operating Dashboard: Metrics Cards Sub-Component
// Item 2.2 in master checklist (COMP-003 to COMP-008)

import React, { type JSX, type ReactNode } from 'react';
import type { DashboardMetricsCardsProps } from './types';

const CARD_ACTION =
  'rounded-lg border border-[var(--amber)]/40 px-3 py-1.5 text-xs font-semibold text-[var(--amber)] transition-colors hover:bg-[var(--amber-dim)] hover:border-[var(--amber)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--card-bg)]';

function formatNextStartTime(isoString: string | null): string | null {
  if (!isoString) return null;
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getUTCHours().toString().padStart(2, '0')}:${d.getUTCMinutes().toString().padStart(2, '0')}`;
}

interface MetricCardProps {
  testId: string;
  label: string;
  value: ReactNode;
  caption: string;
  // Readings (counts, times, scores) take the mono numeral treatment; empty states read as plain copy.
  isReading?: boolean;
  action?: ReactNode;
}

function MetricCard({ testId, label, value, caption, isReading = true, action }: MetricCardProps) {
  return (
    <div data-testid={testId} className="flex flex-col rounded-lg border border-[var(--lead)] bg-[var(--card-bg)] p-5 shadow-xs transition-colors hover:border-[var(--rule)]">
      <span className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--text-muted)]">{label}</span>
      <div className="mt-3 flex min-h-9 items-center justify-between gap-3">
        <span className={isReading ? 'font-mono text-3xl font-semibold tracking-tight text-[var(--text-main)]' : 'text-lg font-semibold text-[var(--text-main)]'}>
          {value}
        </span>
        {action}
      </div>
      <p className="mt-1.5 text-sm text-[var(--text-muted)]">{caption}</p>
    </div>
  );
}

export function DashboardMetricsCards({
  metrics,
  onSelectActiveJob,
  onNavigateToLeads,
}: DashboardMetricsCardsProps): JSX.Element {
  const nextStart = formatNextStartTime(metrics.nextScheduledStartAt);
  const hasRating = typeof metrics.clientRating === 'number';

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <MetricCard testId="metric-today-bookings" label="Today's Schedule" value={metrics.todayBookingsCount} caption="Bookings scheduled for today" />
      <MetricCard
        testId="metric-next-start"
        label="Next Arrival"
        value={nextStart ?? 'No more jobs today'}
        isReading={nextStart !== null}
        caption={nextStart ? 'Earliest upcoming start' : 'Schedule clear'}
      />
      <MetricCard
        testId="metric-active-jobs"
        label="Active Jobs"
        value={metrics.activeJobsCount}
        caption="Currently in progress or en route"
        action={
          metrics.activeJobId && (
            <button type="button" onClick={() => onSelectActiveJob?.(metrics.activeJobId!)} className={CARD_ACTION}>
              View Active Job
            </button>
          )
        }
      />
      <MetricCard
        testId="metric-pending-quotes"
        label="Pending Quotes"
        value={metrics.pendingQuotesCount}
        caption="Customer invitations awaiting response"
        action={
          <button type="button" onClick={() => onNavigateToLeads?.()} className={CARD_ACTION}>
            Review Leads
          </button>
        }
      />
      <MetricCard testId="metric-completed-jobs" label="Completed Jobs" value={metrics.completedJobsCount} caption="All-time fulfilled service bookings" />
      <MetricCard
        testId="metric-client-rating"
        label="Customer Rating"
        value={hasRating ? `${metrics.clientRating} / 5.0` : 'No reviews yet'}
        isReading={hasRating}
        caption="Verified quality score"
      />
    </div>
  );
}
