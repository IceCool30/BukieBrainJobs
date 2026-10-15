// apps/web/lib/brainworker/dashboard/service.test.ts
// BrainWorker Operating Dashboard: Phase 2 Service Layer Contracts (SVC-001 to SVC-008)

import { describe, expect, it, vi } from 'vitest';
import { createBrainWorkerDashboardService } from './service';
import type { IBrainWorkerBookingsRepository } from '../bookings/types';
import type { IBrainWorkerLeadsRepository } from '../leads/types';
import type { IBrainWorkerOperationsRepository } from '../catalog/types';

describe('BrainWorker Operating Dashboard Service Contracts (SVC-001 to SVC-008)', () => {
  const referenceDate = new Date('2026-10-15T10:00:00.000Z');

  it('SVC-001: strict tenant isolation: queries bookings, leads, and profile solely for provided brainWorkerId', async () => {
    const mockBookingsRepo = {
      getBookings: vi.fn().mockResolvedValue({ items: [] }),
    };
    const mockLeadsRepo = {
      getLeads: vi.fn().mockResolvedValue({ items: [] }),
    };
    const mockOperationsRepo = {
      getOperationalProfile: vi.fn().mockResolvedValue(null),
    };

    const service = createBrainWorkerDashboardService({
      bookingsRepo: mockBookingsRepo as unknown as IBrainWorkerBookingsRepository,
      leadsRepo: mockLeadsRepo as unknown as IBrainWorkerLeadsRepository,
      operationsRepo: mockOperationsRepo as unknown as IBrainWorkerOperationsRepository,
    });

    await service.getDashboardFeed('bw-tenant-999');

    expect(mockBookingsRepo.getBookings).toHaveBeenCalledWith('bw-tenant-999');
    expect(mockLeadsRepo.getLeads).toHaveBeenCalledWith('bw-tenant-999');
    expect(mockOperationsRepo.getOperationalProfile).toHaveBeenCalledWith('bw-tenant-999');
  });

  it('SVC-002: orchestrates repositories concurrently for minimal roundtrip latency', async () => {
    let bookingsStarted = false;
    let leadsStarted = false;

    const mockBookingsRepo = {
      getBookings: vi.fn().mockImplementation(async () => {
        bookingsStarted = true;
        await new Promise((resolve) => setTimeout(resolve, 10));
        return { items: [] };
      }),
    };
    const mockLeadsRepo = {
      getLeads: vi.fn().mockImplementation(async () => {
        leadsStarted = true;
        expect(bookingsStarted).toBe(true);
        await new Promise((resolve) => setTimeout(resolve, 10));
        return { items: [] };
      }),
    };
    const mockOperationsRepo = {
      getOperationalProfile: vi.fn().mockResolvedValue(null),
    };

    const service = createBrainWorkerDashboardService({
      bookingsRepo: mockBookingsRepo as unknown as IBrainWorkerBookingsRepository,
      leadsRepo: mockLeadsRepo as unknown as IBrainWorkerLeadsRepository,
      operationsRepo: mockOperationsRepo as unknown as IBrainWorkerOperationsRepository,
    });

    await service.getDashboardFeed('bw-concurrent-1');
    expect(bookingsStarted).toBe(true);
    expect(leadsStarted).toBe(true);
  });

  it('SVC-003: integrates operational profile status alongside live metrics', async () => {
    const mockOperationsRepo = {
      getOperationalProfile: vi.fn().mockResolvedValue({
        brainWorkerId: 'bw-profile-1',
        isComplete: true,
        availability: {
          isAcceptingNewJobs: true,
          emergencyAvailability: true,
        },
        catalog: {
          services: [
            {
              serviceId: 'generator',
              title: 'Generator Maintenance',
            },
          ],
        },
      }),
    };

    const service = createBrainWorkerDashboardService({
      operationsRepo: mockOperationsRepo as unknown as IBrainWorkerOperationsRepository,
    });

    const feed = await service.getDashboardFeed('bw-profile-1');

    expect(feed.operationalStatus).toEqual({
      isComplete: true,
      isAvailable: true,
      isEmergencyAvailable: true,
      primaryTradeName: 'Generator Maintenance',
    });
  });

  it('SVC-004: aggregates bookings to live counters using computeDashboardMetrics', async () => {
    const mockBookingsRepo = {
      getBookings: vi.fn().mockResolvedValue({
        items: [
          {
            bookingId: 'bk-1',
            scheduledStartAt: '2026-10-15T09:00:00.000Z',
            jobStatus: 'IN_PROGRESS',
            dispatchStatus: 'ARRIVED',
          },
          {
            bookingId: 'bk-2',
            scheduledStartAt: '2026-10-15T14:00:00.000Z',
            jobStatus: 'CONFIRMED',
            dispatchStatus: 'NOT_STARTED',
          },
          {
            bookingId: 'bk-3',
            scheduledStartAt: '2026-10-14T11:00:00.000Z',
            jobStatus: 'COMPLETED',
          },
        ],
      }),
    };

    const service = createBrainWorkerDashboardService({
      bookingsRepo: mockBookingsRepo as unknown as IBrainWorkerBookingsRepository,
    });

    const feed = await service.getDashboardFeed('bw-aggregate-1', {
      now: referenceDate,
    });

    expect(feed.metrics.todayBookingsCount).toBe(2);
    expect(feed.metrics.activeJobsCount).toBe(1);
    expect(feed.metrics.activeJobId).toBe('bk-1');
    expect(feed.metrics.completedJobsCount).toBe(1);
  });

  it('SVC-005: formats urgentLeads ticker items respecting urgentLeadsLimit', async () => {
    const mockLeadsRepo = {
      getLeads: vi.fn().mockResolvedValue({
        items: [
          {
            id: 'lead-1',
            title: 'Urgent Leak Repair',
            categoryName: 'Plumbing',
            locationArea: 'Lekki Phase 1',
            urgency: 'EMERGENCY',
            invitationState: 'PENDING',
            createdAt: '2026-10-15T09:30:00.000Z',
          },
          {
            id: 'lead-2',
            title: 'AC Tripping Breaker',
            categoryName: 'HVAC',
            locationArea: 'Victoria Island',
            urgency: 'SAME_DAY',
            invitationState: 'PENDING',
            createdAt: '2026-10-15T09:40:00.000Z',
          },
          {
            id: 'lead-3',
            title: 'Generator Stalling',
            categoryName: 'Generator',
            locationArea: 'Ikoyi',
            urgency: 'EMERGENCY',
            invitationState: 'PENDING',
            createdAt: '2026-10-15T09:50:00.000Z',
          },
        ],
      }),
    };

    const service = createBrainWorkerDashboardService({
      leadsRepo: mockLeadsRepo as unknown as IBrainWorkerLeadsRepository,
    });

    const feed = await service.getDashboardFeed('bw-ticker-1', {
      urgentLeadsLimit: 2,
    });

    expect(feed.urgentLeads).toHaveLength(2);
    expect(feed.urgentLeads[0]?.id).toBe('lead-1');
    expect(feed.urgentLeads[1]?.id).toBe('lead-2');
  });

  it('SVC-006: gracefully handles incomplete profiles without crashing', async () => {
    const mockOperationsRepo = {
      getOperationalProfile: vi.fn().mockResolvedValue({
        brainWorkerId: 'bw-incomplete',
        isComplete: false,
        catalog: { services: [] },
        availability: { isAcceptingNewJobs: false, emergencyAvailability: false },
      }),
    };

    const service = createBrainWorkerDashboardService({
      operationsRepo: mockOperationsRepo as unknown as IBrainWorkerOperationsRepository,
    });

    const feed = await service.getDashboardFeed('bw-incomplete');

    expect(feed.operationalStatus.isComplete).toBe(false);
    expect(feed.operationalStatus.primaryTradeName).toBeNull();
    expect(feed.metrics.todayBookingsCount).toBe(0);
    expect(feed.metrics.activeJobsCount).toBe(0);
  });

  it('SVC-007: resilient error handling: falls back to safe empty state if a repository fails', async () => {
    const mockBookingsRepo = {
      getBookings: vi.fn().mockRejectedValue(new Error('Network failure')),
    };
    const mockLeadsRepo = {
      getLeads: vi.fn().mockRejectedValue(new Error('Storage unavailable')),
    };
    const mockOperationsRepo = {
      getOperationalProfile: vi.fn().mockRejectedValue(new Error('Database offline')),
    };

    const service = createBrainWorkerDashboardService({
      bookingsRepo: mockBookingsRepo as unknown as IBrainWorkerBookingsRepository,
      leadsRepo: mockLeadsRepo as unknown as IBrainWorkerLeadsRepository,
      operationsRepo: mockOperationsRepo as unknown as IBrainWorkerOperationsRepository,
    });

    const feed = await service.getDashboardFeed('bw-fail-resilient');

    expect(feed).toBeDefined();
    expect(feed.metrics.todayBookingsCount).toBe(0);
    expect(feed.metrics.activeJobsCount).toBe(0);
    expect(feed.urgentLeads).toEqual([]);
    expect(feed.operationalStatus.isComplete).toBe(false);
  });

  it('SVC-008: financial boundary assertion: feed contains zero financial or wallet fields', async () => {
    const service = createBrainWorkerDashboardService();

    const feed = await service.getDashboardFeed('bw-boundary-check');

    const feedKeys = Object.keys(feed);
    expect(feedKeys).not.toContain('walletBalance');
    expect(feedKeys).not.toContain('escrowNgn');
    expect(feedKeys).not.toContain('bankAccount');
    expect(feedKeys).not.toContain('payoutPending');

    const metricKeys = Object.keys(feed.metrics);
    expect(metricKeys).not.toContain('walletBalance');
    expect(metricKeys).not.toContain('escrowNgn');
  });
});
