// apps/web/components/brainworker/bookings/BookingsListView.tsx
// BW-004 Phase 7 GREEN: Operational Booking List View (UI-001 to UI-006)
// Governed by:
//   docs/specs/BW-004-architecture-contract.md (sections 5, 6, 7, 14, 15, 16)
//   docs/specs/BW-004-booking-management.md
//   docs/specs/BW-004-test-first-implementation-plan.md (Phase 7: UI-001 to UI-006)
//
// Invariant Rules:
// 1. Zero imports from testing/ (REP-010).
// 2. Operational dispatch sheet style: clean, utilitarian, zero decorative distraction.
// 3. Grouped into Today, Upcoming, Then Later, and Cancelled/Expired.
// 4. Sorted strictly by scheduledStartAt ascending; zero urgency scores.
// 5. Offline disables all mutations with plain-language reasons.
// 6. Zero financial balances, earnings, or fee summaries anywhere.
// 7. Strictly zero em dashes in comments, identifiers, or UI text.

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  ArrowRight,
  WifiOff,
  Radio,
} from 'lucide-react';
import type {
  IBrainWorkerBookingsRepository,
  ProviderBookingSummary,
} from '../../../lib/brainworker/bookings/types';

export interface BookingsListViewProps {
  brainWorkerId: string;
  repository: IBrainWorkerBookingsRepository;
  isDegraded?: boolean;
  isOffline?: boolean;
  onSelectBooking?: (bookingId: string) => void;
}

interface PartitionedBookings {
  today: ProviderBookingSummary[];
  upcoming: ProviderBookingSummary[];
  later: ProviderBookingSummary[];
  cancelledExpired: ProviderBookingSummary[];
}

function partitionBookings(items: ProviderBookingSummary[]): PartitionedBookings {
  const now = new Date();
  const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
  const todayEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));
  const upcomingEnd = new Date(todayStart.getTime() + 7 * 24 * 60 * 60 * 1000);

  const today: ProviderBookingSummary[] = [];
  const upcoming: ProviderBookingSummary[] = [];
  const later: ProviderBookingSummary[] = [];
  const cancelledExpired: ProviderBookingSummary[] = [];

  for (const item of items) {
    if (item.jobStatus === 'CANCELLED' || item.jobStatus === 'EXPIRED') {
      cancelledExpired.push(item);
      continue;
    }

    const scheduled = new Date(item.scheduledStartAt);
    if (scheduled >= todayStart && scheduled <= todayEnd) {
      today.push(item);
    } else if (scheduled > todayEnd && scheduled <= upcomingEnd) {
      upcoming.push(item);
    } else {
      later.push(item);
    }
  }

  const sortByScheduled = (a: ProviderBookingSummary, b: ProviderBookingSummary) =>
    new Date(a.scheduledStartAt).getTime() - new Date(b.scheduledStartAt).getTime();

  today.sort(sortByScheduled);
  upcoming.sort(sortByScheduled);
  later.sort(sortByScheduled);
  cancelledExpired.sort(sortByScheduled);

  return { today, upcoming, later, cancelledExpired };
}

function renderStatusBadge(status: string): React.ReactElement {
  switch (status) {
    case 'CONFIRMED':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-[var(--brand-green-dim)] text-[var(--brand-green)] border border-[var(--brand-green-border)]">
          <CheckCircle className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Confirmed</span>
        </span>
      );
    case 'IN_PROGRESS':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-[var(--tag-bg)] text-[var(--amber)] border border-[var(--lead)]">
          <Clock className="w-3.5 h-3.5" aria-hidden="true" />
          <span>In Progress</span>
        </span>
      );
    case 'CANCELLED':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-[var(--danger-dim)] text-[var(--danger)] border border-[var(--danger-border)]">
          <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Cancelled</span>
        </span>
      );
    case 'EXPIRED':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-[var(--card-bg)] text-[var(--text-muted)] border border-[var(--lead)]">
          <Clock className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Expired</span>
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-[var(--card-bg)] text-[var(--text-muted)] border border-[var(--lead)]">
          <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{status}</span>
        </span>
      );
  }
}

export function BookingsListView({
  brainWorkerId,
  repository,
  isDegraded = false,
  isOffline = false,
  onSelectBooking,
}: BookingsListViewProps): React.ReactElement {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [items, setItems] = useState<ProviderBookingSummary[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const page = await repository.getBookings(brainWorkerId);
      setItems(page.items);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not load bookings';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }, [brainWorkerId, repository]);

  useEffect(() => {
    void fetchBookings();
  }, [fetchBookings]);

  const partitioned = useMemo(() => partitionBookings(items), [items]);

  if (isLoading) {
    return (
      <div
        data-testid="bookings-loading-skeleton"
        className="w-full max-w-4xl mx-auto p-4 space-y-4 animate-pulse motion-reduce:animate-none"
        aria-busy="true"
        aria-label="Loading bookings schedule"
      >
        <div className="h-8 bg-[var(--tag-bg)] rounded w-1/3" />
        <div className="h-24 bg-[var(--card-bg)] rounded border border-[var(--lead)]" />
        <div className="h-24 bg-[var(--card-bg)] rounded border border-[var(--lead)]" />
        <div className="h-24 bg-[var(--card-bg)] rounded border border-[var(--lead)]" />
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div
        data-testid="bookings-error-state"
        className="w-full max-w-4xl mx-auto p-6 bg-[var(--danger-dim)] border border-[var(--danger-border)] rounded-lg text-[var(--text-main)] space-y-4"
        role="alert"
      >
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-[var(--danger)] shrink-0" aria-hidden="true" />
          <div>
            <h2 className="text-base font-semibold text-red-200">Failed to load bookings schedule</h2>
            <p className="text-sm text-[var(--text-muted)] mt-0.5">{errorMessage}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void fetchBookings()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--tag-bg)] hover:bg-[var(--card-hover)] text-[var(--text-main)] rounded text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)] motion-reduce:transition-none"
        >
          <RefreshCw className="w-4 h-4" aria-hidden="true" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  const hasAnyBookings = items.length > 0;

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6 text-[var(--text-main)] font-sans">
      <header className="border-b border-[var(--lead)] pb-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-[var(--text-main)]">Operational Dispatch Sheet</h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">Authoritative bookings and site schedule</p>
        </div>
        <div className="text-xs text-[var(--text-muted)] font-mono">
          Total: {items.length}
        </div>
      </header>

      {isDegraded && (
        <div
          data-testid="bookings-degraded-banner"
          className="p-3 bg-[var(--amber-dim)] border border-[var(--amber)]/30 rounded text-amber-200 text-xs flex items-center gap-2"
          role="status"
        >
          <Radio className="w-4 h-4 shrink-0 text-[var(--amber)]" aria-hidden="true" />
          <span>Network connection degraded. Displaying cached operational booking data.</span>
        </div>
      )}

      {isOffline && (
        <div
          data-testid="bookings-offline-banner"
          className="p-3 bg-[var(--card-bg)] border border-[var(--lead)] rounded text-[var(--text-muted)] text-xs flex items-center gap-2"
          role="status"
        >
          <WifiOff className="w-4 h-4 shrink-0 text-[var(--text-muted)]" aria-hidden="true" />
          <span>Device is currently offline. Mutation actions are disabled until connection is restored.</span>
        </div>
      )}

      {!hasAnyBookings ? (
        <div
          data-testid="bookings-empty-state"
          className="p-8 text-center bg-[var(--bg)] border border-[var(--lead)] rounded-lg space-y-4"
        >
          <Calendar className="w-10 h-10 text-[var(--text-muted)] mx-auto" aria-hidden="true" />
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-[var(--text-main)]">No active bookings scheduled</h2>
            <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
              You do not have any confirmed jobs on your schedule right now. Check available client requests in Leads.
            </p>
          </div>
          <Link
            href="/brainworker/leads"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--amber)] hover:bg-[var(--amber-hover)] text-[var(--text-main)] font-medium text-xs rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)] motion-reduce:transition-none"
          >
            <span>View Available Leads</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Today Group */}
          <section data-testid="group-today" className="space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--lead)] pb-1.5">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-green)] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Today</span>
              </h2>
              <span className="text-xs text-[var(--text-muted)] font-mono">{partitioned.today.length}</span>
            </div>
            {partitioned.today.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)] italic py-2">No bookings scheduled for today.</p>
            ) : (
              <div className="space-y-2.5">
                {partitioned.today.map((booking) => renderBookingCard(booking, onSelectBooking))}
              </div>
            )}
          </section>

          {/* Upcoming Group */}
          <section data-testid="group-upcoming" className="space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--lead)] pb-1.5">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--amber)] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Upcoming</span>
              </h2>
              <span className="text-xs text-[var(--text-muted)] font-mono">{partitioned.upcoming.length}</span>
            </div>
            {partitioned.upcoming.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)] italic py-2">No upcoming bookings in the next 7 days.</p>
            ) : (
              <div className="space-y-2.5">
                {partitioned.upcoming.map((booking) => renderBookingCard(booking, onSelectBooking))}
              </div>
            )}
          </section>

          {/* Later Group */}
          <section data-testid="group-later" className="space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--lead)] pb-1.5">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Then Later</span>
              </h2>
              <span className="text-xs text-[var(--text-muted)] font-mono">{partitioned.later.length}</span>
            </div>
            {partitioned.later.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)] italic py-2">No bookings scheduled beyond 7 days.</p>
            ) : (
              <div className="space-y-2.5">
                {partitioned.later.map((booking) => renderBookingCard(booking, onSelectBooking))}
              </div>
            )}
          </section>

          {/* Cancelled / Expired Group */}
          <section data-testid="group-cancelled-expired" className="space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--lead)] pb-1.5">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Cancelled / Expired</span>
              </h2>
              <span className="text-xs text-[var(--text-muted)] font-mono">{partitioned.cancelledExpired.length}</span>
            </div>
            {partitioned.cancelledExpired.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)] italic py-2">No cancelled or expired records.</p>
            ) : (
              <div className="space-y-2.5 opacity-75">
                {partitioned.cancelledExpired.map((booking) => renderBookingCard(booking, onSelectBooking))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

function renderBookingCard(
  booking: ProviderBookingSummary,
  onSelectBooking?: (bookingId: string) => void
): React.ReactElement {
  const dateFormatted = new Date(booking.scheduledStartAt).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
  });
  const timeFormatted = new Date(booking.scheduledStartAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <article
      key={booking.bookingId}
      data-testid={`booking-card-${booking.bookingId}`}
      onClick={() => onSelectBooking?.(booking.bookingId)}
      className="p-3.5 bg-[var(--card-bg)] border border-[var(--lead)] hover:border-[var(--rule)] rounded transition-colors motion-reduce:transition-none cursor-pointer space-y-2.5 focus-within:ring-2 focus-within:ring-emerald-500"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[var(--text-muted)]">{booking.referenceCode}</span>
            {renderStatusBadge(booking.jobStatus)}
          </div>
          <h3 className="text-sm font-semibold text-[var(--text-main)] truncate">{booking.title}</h3>
        </div>
        <div className="text-right shrink-0">
          <div className="text-xs font-semibold text-[var(--text-main)]">{timeFormatted}</div>
          <div className="text-xs text-[var(--text-muted)]">{dateFormatted}</div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-[var(--text-muted)] pt-1 border-t border-[var(--lead)]">
        <div className="flex items-center gap-1.5 truncate">
          <MapPin className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" aria-hidden="true" />
          <span className="truncate">
            {booking.generalLocation.neighbourhoodOrZone}, {booking.generalLocation.cityId}
          </span>
        </div>
        <Link
          href={`/brainworker/bookings/${booking.bookingId}`}
          onClick={(e) => {
            if (onSelectBooking) {
              e.preventDefault();
              onSelectBooking(booking.bookingId);
            }
          }}
          className="text-xs text-[var(--brand-green)] hover:text-emerald-300 font-medium inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--amber)] motion-reduce:transition-none"
        >
          <span>View details</span>
          <ArrowRight className="w-3 h-3" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
