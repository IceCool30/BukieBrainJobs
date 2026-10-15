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
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
          <CheckCircle className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Confirmed</span>
        </span>
      );
    case 'IN_PROGRESS':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-950/60 text-blue-300 border border-blue-800/60">
          <Clock className="w-3.5 h-3.5" aria-hidden="true" />
          <span>In Progress</span>
        </span>
      );
    case 'CANCELLED':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-950/60 text-red-300 border border-red-800/60">
          <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Cancelled</span>
        </span>
      );
    case 'EXPIRED':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-stone-900 text-stone-400 border border-stone-800">
          <Clock className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Expired</span>
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-stone-900 text-stone-300 border border-stone-800">
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
        <div className="h-8 bg-stone-800 rounded w-1/3" />
        <div className="h-24 bg-stone-900 rounded border border-stone-800" />
        <div className="h-24 bg-stone-900 rounded border border-stone-800" />
        <div className="h-24 bg-stone-900 rounded border border-stone-800" />
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div
        data-testid="bookings-error-state"
        className="w-full max-w-4xl mx-auto p-6 bg-red-950/30 border border-red-800/80 rounded-lg text-stone-200 space-y-4"
        role="alert"
      >
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-red-400 shrink-0" aria-hidden="true" />
          <div>
            <h2 className="text-base font-semibold text-red-200">Failed to load bookings schedule</h2>
            <p className="text-sm text-stone-400 mt-0.5">{errorMessage}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void fetchBookings()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-100 rounded text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 motion-reduce:transition-none"
        >
          <RefreshCw className="w-4 h-4" aria-hidden="true" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  const hasAnyBookings = items.length > 0;

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6 text-stone-100 font-sans">
      <header className="border-b border-stone-800 pb-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-stone-100">Operational Dispatch Sheet</h1>
          <p className="text-xs text-stone-400 mt-0.5">Authoritative bookings and site schedule</p>
        </div>
        <div className="text-xs text-stone-500 font-mono">
          Total: {items.length}
        </div>
      </header>

      {isDegraded && (
        <div
          data-testid="bookings-degraded-banner"
          className="p-3 bg-amber-950/40 border border-amber-800/70 rounded text-amber-200 text-xs flex items-center gap-2"
          role="status"
        >
          <Radio className="w-4 h-4 shrink-0 text-amber-400" aria-hidden="true" />
          <span>Network connection degraded. Displaying cached operational booking data.</span>
        </div>
      )}

      {isOffline && (
        <div
          data-testid="bookings-offline-banner"
          className="p-3 bg-stone-900 border border-stone-800 rounded text-stone-300 text-xs flex items-center gap-2"
          role="status"
        >
          <WifiOff className="w-4 h-4 shrink-0 text-stone-400" aria-hidden="true" />
          <span>Device is currently offline. Mutation actions are disabled until connection is restored.</span>
        </div>
      )}

      {!hasAnyBookings ? (
        <div
          data-testid="bookings-empty-state"
          className="p-8 text-center bg-stone-900/50 border border-stone-800 rounded-lg space-y-4"
        >
          <Calendar className="w-10 h-10 text-stone-600 mx-auto" aria-hidden="true" />
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-stone-200">No active bookings scheduled</h2>
            <p className="text-xs text-stone-400 max-w-sm mx-auto">
              You do not have any confirmed jobs on your schedule right now. Check available client requests in Leads.
            </p>
          </div>
          <Link
            href="/brainworker/leads"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-medium text-xs rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 motion-reduce:transition-none"
          >
            <span>View Available Leads</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Today Group */}
          <section data-testid="group-today" className="space-y-3">
            <div className="flex items-center justify-between border-b border-stone-800/80 pb-1.5">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Today</span>
              </h2>
              <span className="text-xs text-stone-500 font-mono">{partitioned.today.length}</span>
            </div>
            {partitioned.today.length === 0 ? (
              <p className="text-xs text-stone-500 italic py-2">No bookings scheduled for today.</p>
            ) : (
              <div className="space-y-2.5">
                {partitioned.today.map((booking) => renderBookingCard(booking, onSelectBooking))}
              </div>
            )}
          </section>

          {/* Upcoming Group */}
          <section data-testid="group-upcoming" className="space-y-3">
            <div className="flex items-center justify-between border-b border-stone-800/80 pb-1.5">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Upcoming</span>
              </h2>
              <span className="text-xs text-stone-500 font-mono">{partitioned.upcoming.length}</span>
            </div>
            {partitioned.upcoming.length === 0 ? (
              <p className="text-xs text-stone-500 italic py-2">No upcoming bookings in the next 7 days.</p>
            ) : (
              <div className="space-y-2.5">
                {partitioned.upcoming.map((booking) => renderBookingCard(booking, onSelectBooking))}
              </div>
            )}
          </section>

          {/* Later Group */}
          <section data-testid="group-later" className="space-y-3">
            <div className="flex items-center justify-between border-b border-stone-800/80 pb-1.5">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Then Later</span>
              </h2>
              <span className="text-xs text-stone-500 font-mono">{partitioned.later.length}</span>
            </div>
            {partitioned.later.length === 0 ? (
              <p className="text-xs text-stone-500 italic py-2">No bookings scheduled beyond 7 days.</p>
            ) : (
              <div className="space-y-2.5">
                {partitioned.later.map((booking) => renderBookingCard(booking, onSelectBooking))}
              </div>
            )}
          </section>

          {/* Cancelled / Expired Group */}
          <section data-testid="group-cancelled-expired" className="space-y-3">
            <div className="flex items-center justify-between border-b border-stone-800/80 pb-1.5">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Cancelled / Expired</span>
              </h2>
              <span className="text-xs text-stone-500 font-mono">{partitioned.cancelledExpired.length}</span>
            </div>
            {partitioned.cancelledExpired.length === 0 ? (
              <p className="text-xs text-stone-500 italic py-2">No cancelled or expired records.</p>
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
      className="p-3.5 bg-stone-900 border border-stone-800 hover:border-stone-700 rounded transition-colors motion-reduce:transition-none cursor-pointer space-y-2.5 focus-within:ring-2 focus-within:ring-emerald-500"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-stone-500">{booking.referenceCode}</span>
            {renderStatusBadge(booking.jobStatus)}
          </div>
          <h3 className="text-sm font-semibold text-stone-100 truncate">{booking.title}</h3>
        </div>
        <div className="text-right shrink-0">
          <div className="text-xs font-semibold text-stone-200">{timeFormatted}</div>
          <div className="text-xs text-stone-500">{dateFormatted}</div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-stone-400 pt-1 border-t border-stone-800/60">
        <div className="flex items-center gap-1.5 truncate">
          <MapPin className="w-3.5 h-3.5 text-stone-500 shrink-0" aria-hidden="true" />
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
          className="text-xs text-emerald-400 hover:text-emerald-300 font-medium inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400 motion-reduce:transition-none"
        >
          <span>View details</span>
          <ArrowRight className="w-3 h-3" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
