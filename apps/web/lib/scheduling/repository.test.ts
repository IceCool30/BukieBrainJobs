// apps/web/lib/scheduling/repository.test.ts
// BW-007 Phase 2: Collaborative Scheduling and Dispatch Repository Contracts

import { beforeEach, describe, expect, it } from 'vitest';
import {
  getSchedulingRepository,
  resetSchedulingRepository,
} from './repository';
import type {
  ArrivalWindow,
  ProposeRescheduleInput,
} from './types';

describe('BW-007 Phase 2: SchedulingRepository Contracts', () => {
  const sampleWindow: ArrivalWindow = {
    date: '2026-10-25',
    startHour: 10,
    endHour: 13,
    display: 'Sunday, Oct 25, 2026, 10:00 AM - 1:00 PM WAT',
  };

  const newCandidateWindow: ArrivalWindow = {
    date: '2026-10-26',
    startHour: 14,
    endHour: 17,
    display: 'Monday, Oct 26, 2026, 2:00 PM - 5:00 PM WAT',
  };

  beforeEach(() => {
    resetSchedulingRepository();
  });

  it('REP-001: seedBookingSchedule initializes and getBookingSchedule retrieves record', async () => {
    const repo = getSchedulingRepository();

    const seeded = await repo.seedBookingSchedule({
      bookingId: 'booking-001',
      jobStatus: 'CONFIRMED',
      agreedArrivalWindow: sampleWindow,
      dispatchStatus: 'NOT_STARTED',
    });

    expect(seeded.bookingId).toBe('booking-001');
    expect(seeded.jobStatus).toBe('CONFIRMED');
    expect(seeded.agreedArrivalWindow).toEqual(sampleWindow);
    expect(seeded.dispatchStatus).toBe('NOT_STARTED');

    const fetched = await repo.getBookingSchedule('booking-001');
    expect(fetched).toEqual(seeded);

    const nonExistent = await repo.getBookingSchedule('nonexistent-booking');
    expect(nonExistent).toBeNull();
  });

  it('REP-002: proposeReschedule generates PENDING request with id, timestamps, and window payload', async () => {
    const repo = getSchedulingRepository();
    await repo.seedBookingSchedule({
      bookingId: 'booking-002',
      jobStatus: 'CONFIRMED',
      agreedArrivalWindow: sampleWindow,
    });

    const proposal: ProposeRescheduleInput = {
      bookingId: 'booking-002',
      requesterRole: 'CLIENT',
      requesterId: 'client-123',
      proposedWindows: [newCandidateWindow],
      reason: 'PARTS_PROCUREMENT',
    };

    const request = await repo.proposeReschedule(proposal);
    expect(request.id).toBeDefined();
    expect(request.bookingId).toBe('booking-002');
    expect(request.status).toBe('PENDING');
    expect(request.requesterRole).toBe('CLIENT');
    expect(request.proposedWindows).toEqual([newCandidateWindow]);
    expect(request.createdAt).toBeDefined();
  });

  it('REP-003: proposeReschedule throws when another request for the same booking is already PENDING', async () => {
    const repo = getSchedulingRepository();
    await repo.seedBookingSchedule({
      bookingId: 'booking-003',
      jobStatus: 'CONFIRMED',
      agreedArrivalWindow: sampleWindow,
    });

    const proposal: ProposeRescheduleInput = {
      bookingId: 'booking-003',
      requesterRole: 'CLIENT',
      requesterId: 'client-123',
      proposedWindows: [newCandidateWindow],
      reason: 'CUSTOMER_UNAVAILABLE',
    };

    await repo.proposeReschedule(proposal);

    await expect(repo.proposeReschedule(proposal)).rejects.toThrow(
      /already pending|active reschedule request/i
    );
  });

  it('REP-004: proposeReschedule throws when dispatchStatus is EN_ROUTE or ARRIVED', async () => {
    const repo = getSchedulingRepository();
    await repo.seedBookingSchedule({
      bookingId: 'booking-004-a',
      jobStatus: 'CONFIRMED',
      agreedArrivalWindow: sampleWindow,
      dispatchStatus: 'EN_ROUTE',
    });

    const proposalA: ProposeRescheduleInput = {
      bookingId: 'booking-004-a',
      requesterRole: 'TASKER',
      requesterId: 'artisan-555',
      proposedWindows: [newCandidateWindow],
      reason: 'TRAFFIC_DELAY',
    };

    await expect(repo.proposeReschedule(proposalA)).rejects.toThrow(
      /en route|already on the road/i
    );

    await repo.seedBookingSchedule({
      bookingId: 'booking-004-b',
      jobStatus: 'CONFIRMED',
      agreedArrivalWindow: sampleWindow,
      dispatchStatus: 'ARRIVED',
    });

    const proposalB: ProposeRescheduleInput = {
      bookingId: 'booking-004-b',
      requesterRole: 'TASKER',
      requesterId: 'artisan-555',
      proposedWindows: [newCandidateWindow],
      reason: 'TRAFFIC_DELAY',
    };

    await expect(repo.proposeReschedule(proposalB)).rejects.toThrow(
      /arrived|on-site/i
    );
  });

  it('REP-005: getPendingRescheduleRequest returns pending request or null when none exist', async () => {
    const repo = getSchedulingRepository();
    await repo.seedBookingSchedule({
      bookingId: 'booking-005',
      jobStatus: 'CONFIRMED',
      agreedArrivalWindow: sampleWindow,
    });

    const initialPending = await repo.getPendingRescheduleRequest('booking-005');
    expect(initialPending).toBeNull();

    const request = await repo.proposeReschedule({
      bookingId: 'booking-005',
      requesterRole: 'CLIENT',
      requesterId: 'client-123',
      proposedWindows: [newCandidateWindow],
      reason: 'WEATHER',
    });

    const activePending = await repo.getPendingRescheduleRequest('booking-005');
    expect(activePending).toEqual(request);
  });

  it('REP-006: respondReschedule with ACCEPT transitions to ACCEPTED and atomically updates agreedArrivalWindow', async () => {
    const repo = getSchedulingRepository();
    await repo.seedBookingSchedule({
      bookingId: 'booking-006',
      jobStatus: 'CONFIRMED',
      agreedArrivalWindow: sampleWindow,
    });

    const request = await repo.proposeReschedule({
      bookingId: 'booking-006',
      requesterRole: 'CLIENT',
      requesterId: 'client-123',
      proposedWindows: [newCandidateWindow],
      reason: 'PARTS_PROCUREMENT',
    });

    const result = await repo.respondReschedule(request.id, {
      action: 'ACCEPT',
      selectedWindow: newCandidateWindow,
      respondedBy: 'artisan-999',
    });

    expect(result.request.status).toBe('ACCEPTED');
    expect(result.updatedSchedule.agreedArrivalWindow).toEqual(newCandidateWindow);

    const schedule = await repo.getBookingSchedule('booking-006');
    expect(schedule?.agreedArrivalWindow).toEqual(newCandidateWindow);
  });

  it('REP-007: respondReschedule with DECLINE transitions to DECLINED and preserves existing agreedArrivalWindow', async () => {
    const repo = getSchedulingRepository();
    await repo.seedBookingSchedule({
      bookingId: 'booking-007',
      jobStatus: 'CONFIRMED',
      agreedArrivalWindow: sampleWindow,
    });

    const request = await repo.proposeReschedule({
      bookingId: 'booking-007',
      requesterRole: 'TASKER',
      requesterId: 'artisan-999',
      proposedWindows: [newCandidateWindow],
      reason: 'TRAFFIC_DELAY',
    });

    const result = await repo.respondReschedule(request.id, {
      action: 'DECLINE',
      respondedBy: 'client-123',
    });

    expect(result.request.status).toBe('DECLINED');
    expect(result.updatedSchedule.agreedArrivalWindow).toEqual(sampleWindow);

    const schedule = await repo.getBookingSchedule('booking-007');
    expect(schedule?.agreedArrivalWindow).toEqual(sampleWindow);
  });

  it('REP-008: respondReschedule with COUNTER transitions to COUNTERED and preserves existing agreedArrivalWindow', async () => {
    const repo = getSchedulingRepository();
    await repo.seedBookingSchedule({
      bookingId: 'booking-008',
      jobStatus: 'CONFIRMED',
      agreedArrivalWindow: sampleWindow,
    });

    const request = await repo.proposeReschedule({
      bookingId: 'booking-008',
      requesterRole: 'CLIENT',
      requesterId: 'client-123',
      proposedWindows: [newCandidateWindow],
      reason: 'CUSTOMER_UNAVAILABLE',
    });

    const counterSlot: ArrivalWindow = {
      date: '2026-10-27',
      startHour: 9,
      endHour: 12,
      display: 'Tuesday, Oct 27, 2026, 9:00 AM - 12:00 PM WAT',
    };

    const result = await repo.respondReschedule(request.id, {
      action: 'COUNTER',
      counterWindows: [counterSlot],
      counterReason: 'PARTS_PROCUREMENT',
      counterNote: 'Need genuine replacement part first',
      respondedBy: 'artisan-999',
    });

    expect(result.request.status).toBe('COUNTERED');
    expect(result.updatedSchedule.agreedArrivalWindow).toEqual(sampleWindow);

    const schedule = await repo.getBookingSchedule('booking-008');
    expect(schedule?.agreedArrivalWindow).toEqual(sampleWindow);
  });

  it('REP-009: updateDispatchStatus allows NOT_STARTED -> EN_ROUTE -> ARRIVED and rejects backwards transitions', async () => {
    const repo = getSchedulingRepository();
    await repo.seedBookingSchedule({
      bookingId: 'booking-009',
      jobStatus: 'CONFIRMED',
      agreedArrivalWindow: sampleWindow,
      dispatchStatus: 'NOT_STARTED',
    });

    const enRouteRecord = await repo.updateDispatchStatus('booking-009', 'EN_ROUTE');
    expect(enRouteRecord.dispatchStatus).toBe('EN_ROUTE');
    expect(enRouteRecord.dispatchUpdatedAt).toBeDefined();

    const arrivedRecord = await repo.updateDispatchStatus('booking-009', 'ARRIVED');
    expect(arrivedRecord.dispatchStatus).toBe('ARRIVED');

    await expect(repo.updateDispatchStatus('booking-009', 'EN_ROUTE')).rejects.toThrow(
      /invalid dispatch transition|forward-only/i
    );
    await expect(repo.updateDispatchStatus('booking-009', 'NOT_STARTED')).rejects.toThrow(
      /invalid dispatch transition|forward-only/i
    );
  });

  it('REP-010: deriveCustomerDispatchView returns tracking view with safetyNotice and action prompt', async () => {
    const repo = getSchedulingRepository();
    await repo.seedBookingSchedule({
      bookingId: 'booking-010',
      jobStatus: 'CONFIRMED',
      agreedArrivalWindow: sampleWindow,
      dispatchStatus: 'NOT_STARTED',
    });

    const view = await repo.deriveCustomerDispatchView('booking-010');
    expect(view.bookingId).toBe('booking-010');
    expect(view.dispatchStatus).toBe('NOT_STARTED');
    expect(view.arrivalWindow).toEqual(sampleWindow);
    expect(view.safetyNotice).toContain('Ensure someone 18+ is home to receive the artisan');
    expect(view.actionRequired).toMatch(/awaiting scheduled window|preparing/i);
  });
});
