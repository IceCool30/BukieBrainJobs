// apps/web/lib/brainworker/dashboard/domain.ts
// BrainWorker Operating Dashboard: Pure Domain Aggregation
// Item 2.2 in master checklist (DASH-001 to DASH-010)

import type {
  BrainWorkerDashboardMetrics,
  UrgentLeadTickerItem,
} from './types';

function toUtcDateKey(date: Date): string {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return '';
  }
  return date.toISOString().slice(0, 10);
}

function isSameCalendarDay(dateStr: string, referenceDate: Date): boolean {
  if (!dateStr || typeof dateStr !== 'string') return false;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return false;
  const targetKey = toUtcDateKey(d);
  const refKey = toUtcDateKey(referenceDate);
  return targetKey !== '' && targetKey === refKey;
}

export function computeDashboardMetrics(params: {
  bookings?: Array<{
    bookingId: string;
    scheduledStartAt: string;
    jobStatus: string;
    dispatchStatus?: string | undefined;
  }> | undefined;
  leads?: Array<{
    id: string;
    invitationState?: string | undefined;
    urgency?: string | undefined;
  }> | undefined;
  now?: Date | undefined;
  clientRating?: number | null | undefined;
}): BrainWorkerDashboardMetrics {
  const bookings = params.bookings ?? [];
  const leads = params.leads ?? [];
  const referenceDate = params.now instanceof Date && !Number.isNaN(params.now.getTime())
    ? params.now
    : new Date();

  // DASH-001: todayBookingsCount
  const todayBookings = bookings.filter((b) =>
    isSameCalendarDay(b.scheduledStartAt, referenceDate)
  );
  const todayBookingsCount = todayBookings.length;

  // DASH-002: nextScheduledStartAt
  const refTime = referenceDate.getTime();
  const upcomingToday = todayBookings
    .filter((b) => {
      if (b.jobStatus === 'COMPLETED' || b.jobStatus.startsWith('CANCEL')) {
        return false;
      }
      const startTime = new Date(b.scheduledStartAt).getTime();
      return !Number.isNaN(startTime) && startTime >= refTime;
    })
    .sort(
      (a, b) =>
        new Date(a.scheduledStartAt).getTime() - new Date(b.scheduledStartAt).getTime()
    );

  const nextScheduledStartAt = upcomingToday[0]?.scheduledStartAt ?? null;

  // DASH-003 & DASH-004: activeJobsCount and activeJobId
  const activeBookings = bookings.filter((b) => {
    const isProgress = b.jobStatus === 'IN_PROGRESS';
    const isEnRouteOrArrived =
      b.dispatchStatus === 'EN_ROUTE' || b.dispatchStatus === 'ARRIVED';
    return isProgress || isEnRouteOrArrived;
  });

  const activeJobsCount = activeBookings.length;
  const activeJobId = activeBookings[0]?.bookingId ?? null;

  // DASH-005: pendingQuotesCount
  const pendingQuotesCount = leads.filter(
    (l) => l.invitationState === 'PENDING'
  ).length;

  // DASH-006: completedJobsCount
  const completedJobsCount = bookings.filter(
    (b) => b.jobStatus === 'COMPLETED'
  ).length;

  // DASH-007: clientRating
  const clientRating =
    typeof params.clientRating === 'number' && !Number.isNaN(params.clientRating)
      ? params.clientRating
      : null;

  return {
    todayBookingsCount,
    nextScheduledStartAt,
    activeJobsCount,
    activeJobId,
    pendingQuotesCount,
    completedJobsCount,
    clientRating,
  };
}

export function projectUrgentLeadTicker(params: {
  leads?: Array<{
    id: string;
    title: string;
    categoryName?: string | undefined;
    locationArea: string;
    urgency: string;
    invitationState?: string | undefined;
    createdAt: string;
  }> | undefined;
  maxItems?: number | undefined;
}): UrgentLeadTickerItem[] {
  const leads = params.leads ?? [];
  const limit = typeof params.maxItems === 'number' && params.maxItems > 0
    ? params.maxItems
    : 5;

  const urgentLeads = leads
    .filter((lead) => {
      const isUrgent =
        lead.urgency === 'EMERGENCY' || lead.urgency === 'SAME_DAY';
      const isActionable =
        !lead.invitationState || lead.invitationState === 'PENDING';
      return isUrgent && isActionable;
    })
    .slice(0, limit)
    .map((lead): UrgentLeadTickerItem => ({
      id: lead.id,
      title: lead.title,
      tradeCategory: lead.categoryName || 'General Maintenance',
      locationArea: lead.locationArea,
      urgency: lead.urgency as 'EMERGENCY' | 'SAME_DAY' | 'SCHEDULED' | 'FLEXIBLE',
      postedAt: lead.createdAt,
    }));

  return urgentLeads;
}
