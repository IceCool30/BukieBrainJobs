// apps/web/lib/brainworker/dashboard/domain.test.ts
// BrainWorker Operating Dashboard: Phase 1 RED Contracts (DASH-001 to DASH-010)

import { describe, expect, it } from 'vitest';
import {
  computeDashboardMetrics,
  projectUrgentLeadTicker,
} from './domain';

describe('BrainWorker Operating Dashboard Domain Contracts (DASH-001 to DASH-010)', () => {
  const referenceDate = new Date('2026-10-15T10:00:00.000Z');

  it('DASH-001: computes todayBookingsCount strictly for bookings scheduled on current calendar date', () => {
    const bookings = [
      {
        bookingId: 'bk-today-1',
        scheduledStartAt: '2026-10-15T09:00:00.000Z',
        jobStatus: 'CONFIRMED',
      },
      {
        bookingId: 'bk-today-2',
        scheduledStartAt: '2026-10-15T14:30:00.000Z',
        jobStatus: 'CONFIRMED',
      },
      {
        bookingId: 'bk-yesterday',
        scheduledStartAt: '2026-10-14T11:00:00.000Z',
        jobStatus: 'COMPLETED',
      },
      {
        bookingId: 'bk-tomorrow',
        scheduledStartAt: '2026-10-16T10:00:00.000Z',
        jobStatus: 'CONFIRMED',
      },
    ];

    const metrics = computeDashboardMetrics({
      bookings,
      leads: [],
      now: referenceDate,
    });

    expect(metrics.todayBookingsCount).toBe(2);
  });

  it('DASH-002: identifies nextScheduledStartAt as the earliest upcoming scheduled booking for today', () => {
    const bookings = [
      {
        bookingId: 'bk-past-today',
        scheduledStartAt: '2026-10-15T08:00:00.000Z',
        jobStatus: 'COMPLETED',
      },
      {
        bookingId: 'bk-next-today',
        scheduledStartAt: '2026-10-15T12:00:00.000Z',
        jobStatus: 'CONFIRMED',
      },
      {
        bookingId: 'bk-later-today',
        scheduledStartAt: '2026-10-15T16:00:00.000Z',
        jobStatus: 'CONFIRMED',
      },
      {
        bookingId: 'bk-cancelled-earlier',
        scheduledStartAt: '2026-10-15T11:00:00.000Z',
        jobStatus: 'CANCELLED_BY_PROVIDER',
      },
    ];

    const metrics = computeDashboardMetrics({
      bookings,
      leads: [],
      now: referenceDate,
    });

    expect(metrics.nextScheduledStartAt).toBe('2026-10-15T12:00:00.000Z');
  });

  it('DASH-003: computes activeJobsCount for jobs currently in progress or en route', () => {
    const bookings = [
      {
        bookingId: 'bk-in-progress',
        scheduledStartAt: '2026-10-15T09:00:00.000Z',
        jobStatus: 'IN_PROGRESS',
        dispatchStatus: 'ARRIVED',
      },
      {
        bookingId: 'bk-en-route',
        scheduledStartAt: '2026-10-15T13:00:00.000Z',
        jobStatus: 'CONFIRMED',
        dispatchStatus: 'EN_ROUTE',
      },
      {
        bookingId: 'bk-confirmed-not-started',
        scheduledStartAt: '2026-10-15T15:00:00.000Z',
        jobStatus: 'CONFIRMED',
        dispatchStatus: 'NOT_STARTED',
      },
    ];

    const metrics = computeDashboardMetrics({
      bookings,
      leads: [],
      now: referenceDate,
    });

    expect(metrics.activeJobsCount).toBe(2);
  });

  it('DASH-004: resolves activeJobId returning the current active booking ID for quick deep-linking', () => {
    const bookings = [
      {
        bookingId: 'bk-active-target',
        scheduledStartAt: '2026-10-15T09:00:00.000Z',
        jobStatus: 'IN_PROGRESS',
        dispatchStatus: 'ARRIVED',
      },
      {
        bookingId: 'bk-future',
        scheduledStartAt: '2026-10-15T15:00:00.000Z',
        jobStatus: 'CONFIRMED',
        dispatchStatus: 'NOT_STARTED',
      },
    ];

    const metrics = computeDashboardMetrics({
      bookings,
      leads: [],
      now: referenceDate,
    });

    expect(metrics.activeJobId).toBe('bk-active-target');
  });

  it('DASH-005: computes pendingQuotesCount by counting actionable invitations with state PENDING', () => {
    const leads = [
      { id: 'lead-1', invitationState: 'PENDING' },
      { id: 'lead-2', invitationState: 'ACCEPTED' },
      { id: 'lead-3', invitationState: 'PENDING' },
      { id: 'lead-4', invitationState: 'DECLINED' },
    ];

    const metrics = computeDashboardMetrics({
      bookings: [],
      leads,
      now: referenceDate,
    });

    expect(metrics.pendingQuotesCount).toBe(2);
  });

  it('DASH-006: computes completedJobsCount counting jobs with jobStatus COMPLETED', () => {
    const bookings = [
      {
        bookingId: 'bk-1',
        scheduledStartAt: '2026-10-14T09:00:00.000Z',
        jobStatus: 'COMPLETED',
      },
      {
        bookingId: 'bk-2',
        scheduledStartAt: '2026-10-15T08:00:00.000Z',
        jobStatus: 'COMPLETED',
      },
      {
        bookingId: 'bk-3',
        scheduledStartAt: '2026-10-15T14:00:00.000Z',
        jobStatus: 'CONFIRMED',
      },
    ];

    const metrics = computeDashboardMetrics({
      bookings,
      leads: [],
      now: referenceDate,
    });

    expect(metrics.completedJobsCount).toBe(2);
  });

  it('DASH-007: resolves clientRating or defaults to null when unreviewed', () => {
    const metricsRated = computeDashboardMetrics({
      bookings: [],
      leads: [],
      now: referenceDate,
      clientRating: 4.85,
    });
    expect(metricsRated.clientRating).toBe(4.85);

    const metricsUnrated = computeDashboardMetrics({
      bookings: [],
      leads: [],
      now: referenceDate,
      clientRating: null,
    });
    expect(metricsUnrated.clientRating).toBeNull();
  });

  it('DASH-008: projects urgentLeads ticker items exclusively from unquoted EMERGENCY and SAME_DAY leads', () => {
    const leads = [
      {
        id: 'lead-urg-1',
        title: 'Emergency Generator Repair',
        categoryName: 'Generator Maintenance',
        locationArea: 'Lekki Phase 1',
        urgency: 'EMERGENCY',
        invitationState: 'PENDING',
        createdAt: '2026-10-15T09:30:00.000Z',
      },
      {
        id: 'lead-urg-2',
        title: 'Same-day AC Troubleshooting',
        categoryName: 'Air Conditioning',
        locationArea: 'Victoria Island',
        urgency: 'SAME_DAY',
        invitationState: 'PENDING',
        createdAt: '2026-10-15T09:45:00.000Z',
      },
      {
        id: 'lead-sched',
        title: 'Scheduled Electrical Wiring',
        categoryName: 'Electrical',
        locationArea: 'Ikeja GRA',
        urgency: 'SCHEDULED',
        invitationState: 'PENDING',
        createdAt: '2026-10-15T09:15:00.000Z',
      },
      {
        id: 'lead-accepted',
        title: 'Emergency Plumbing Fix',
        categoryName: 'Plumbing',
        locationArea: 'Surulere',
        urgency: 'EMERGENCY',
        invitationState: 'ACCEPTED',
        createdAt: '2026-10-15T09:00:00.000Z',
      },
    ];

    const ticker = projectUrgentLeadTicker({
      leads,
      maxItems: 5,
    });

    expect(ticker).toHaveLength(2);
    expect(ticker.map((item) => item.id)).toEqual(['lead-urg-1', 'lead-urg-2']);
    expect(ticker[0]).toEqual({
      id: 'lead-urg-1',
      title: 'Emergency Generator Repair',
      tradeCategory: 'Generator Maintenance',
      locationArea: 'Lekki Phase 1',
      urgency: 'EMERGENCY',
      postedAt: '2026-10-15T09:30:00.000Z',
    });
  });

  it('DASH-009: boundary check: metric objects strictly omit financial fields', () => {
    const metrics = computeDashboardMetrics({
      bookings: [],
      leads: [],
      now: referenceDate,
    });

    const metricKeys = Object.keys(metrics);
    expect(metricKeys).not.toContain('walletBalance');
    expect(metricKeys).not.toContain('escrowNgn');
    expect(metricKeys).not.toContain('feeDeductions');
    expect(metricKeys).not.toContain('payoutPending');
  });

  it('DASH-010: zero NaN or floating-point drift: handles empty booking and lead arrays gracefully', () => {
    const metrics = computeDashboardMetrics({
      bookings: [],
      leads: [],
      now: referenceDate,
    });

    expect(metrics).toEqual({
      todayBookingsCount: 0,
      nextScheduledStartAt: null,
      activeJobsCount: 0,
      activeJobId: null,
      pendingQuotesCount: 0,
      completedJobsCount: 0,
      clientRating: null,
    });

    const ticker = projectUrgentLeadTicker({
      leads: [],
    });
    expect(ticker).toEqual([]);
  });
});
