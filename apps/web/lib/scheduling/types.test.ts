// apps/web/lib/scheduling/types.test.ts
// BW-007 Phase 1: Collaborative Scheduling and Dispatch Domain Contracts

import { describe, expect, it } from 'vitest';
import {
  deriveDispatchTrackingView,
  evaluateRescheduleResponse,
  formatArrivalWindow,
  validateRescheduleProposal,
} from './domain';
import type {
  ArrivalWindow,
  DispatchStatus,
  JobStatus,
  ProposeRescheduleInput,
  RescheduleRequest,
  RespondRescheduleInput,
} from './types';

describe('BW-007 Collaborative Scheduling and Dispatch Domain Invariants', () => {
  const referenceNow = new Date('2026-10-20T08:00:00.000Z');

  const validWindow: ArrivalWindow = {
    date: '2026-10-20',
    startHour: 10,
    endHour: 13,
    display: 'Tuesday, Oct 20, 2026, 10:00 AM - 1:00 PM WAT',
  };

  const samplePendingRequest: RescheduleRequest = {
    id: 'resched-req-001',
    bookingId: 'booking-101',
    requesterRole: 'CLIENT',
    requesterId: 'cust-456',
    proposedWindows: [validWindow],
    reason: 'TRAFFIC_DELAY',
    status: 'PENDING',
    createdAt: '2026-10-20T07:30:00.000Z',
  };

  it('SCHED-001: formatArrivalWindow produces standard West Africa Time (WAT) display string and validates 24h bounds (startHour < endHour)', () => {
    const formatted = formatArrivalWindow('2026-10-20', 9, 12);
    expect(formatted.date).toBe('2026-10-20');
    expect(formatted.startHour).toBe(9);
    expect(formatted.endHour).toBe(12);
    expect(formatted.display).toContain('WAT');
    expect(formatted.display).toMatch(/9:00\s*AM/i);
    expect(formatted.display).toMatch(/12:00\s*PM/i);

    expect(() => formatArrivalWindow('2026-10-20', 14, 10)).toThrow(/startHour must be strictly less than endHour/i);
    expect(() => formatArrivalWindow('2026-10-20', 10, 10)).toThrow(/startHour must be strictly less than endHour/i);
    expect(() => formatArrivalWindow('2026-10-20', -1, 10)).toThrow(/between 0 and 24/i);
    expect(() => formatArrivalWindow('2026-10-20', 9, 25)).toThrow(/between 0 and 24/i);
  });

  it('SCHED-002: validateRescheduleProposal requires jobStatus === CONFIRMED, refusing all other statuses', () => {
    const proposal: ProposeRescheduleInput = {
      bookingId: 'booking-101',
      requesterRole: 'CLIENT',
      requesterId: 'cust-456',
      proposedWindows: [validWindow],
      reason: 'CUSTOMER_UNAVAILABLE',
    };

    const confirmedResult = validateRescheduleProposal(proposal, 'CONFIRMED', 'NOT_STARTED', referenceNow);
    expect(confirmedResult.valid).toBe(true);

    const nonConfirmedStatuses: JobStatus[] = [
      'OPEN',
      'PENDING_ACCEPTANCE',
      'IN_PROGRESS',
      'PENDING_COMPLETION',
      'COMPLETED',
      'PAID',
      'CANCELLED',
      'EXPIRED',
      'DISPUTED',
      'RESOLVED',
    ];

    for (const status of nonConfirmedStatuses) {
      const result = validateRescheduleProposal(proposal, status, 'NOT_STARTED', referenceNow);
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/CONFIRMED/i);
    }
  });

  it('SCHED-003: validateRescheduleProposal refuses proposals when dispatchStatus is EN_ROUTE or ARRIVED', () => {
    const proposal: ProposeRescheduleInput = {
      bookingId: 'booking-101',
      requesterRole: 'TASKER',
      requesterId: 'artisan-789',
      proposedWindows: [validWindow],
      reason: 'TRAFFIC_DELAY',
    };

    const enRouteResult = validateRescheduleProposal(proposal, 'CONFIRMED', 'EN_ROUTE', referenceNow);
    expect(enRouteResult.valid).toBe(false);
    expect(enRouteResult.error).toMatch(/en route|already on the road/i);

    const arrivedResult = validateRescheduleProposal(proposal, 'CONFIRMED', 'ARRIVED', referenceNow);
    expect(arrivedResult.valid).toBe(false);
    expect(arrivedResult.error).toMatch(/arrived|on-site/i);

    const notStartedResult = validateRescheduleProposal(proposal, 'CONFIRMED', 'NOT_STARTED', referenceNow);
    expect(notStartedResult.valid).toBe(true);
  });

  it('SCHED-004: validateRescheduleProposal requires at least 1 and at most 3 candidate arrival windows', () => {
    const emptyProposal: ProposeRescheduleInput = {
      bookingId: 'booking-101',
      requesterRole: 'CLIENT',
      requesterId: 'cust-456',
      proposedWindows: [],
      reason: 'PARTS_PROCUREMENT',
    };
    const emptyResult = validateRescheduleProposal(emptyProposal, 'CONFIRMED', 'NOT_STARTED', referenceNow);
    expect(emptyResult.valid).toBe(false);
    expect(emptyResult.error).toMatch(/at least 1/i);

    const excessiveProposal: ProposeRescheduleInput = {
      bookingId: 'booking-101',
      requesterRole: 'CLIENT',
      requesterId: 'cust-456',
      proposedWindows: [
        validWindow,
        { ...validWindow, startHour: 13, endHour: 16 },
        { ...validWindow, startHour: 16, endHour: 19 },
        { ...validWindow, startHour: 19, endHour: 21 },
      ],
      reason: 'PARTS_PROCUREMENT',
    };
    const excessiveResult = validateRescheduleProposal(excessiveProposal, 'CONFIRMED', 'NOT_STARTED', referenceNow);
    expect(excessiveResult.valid).toBe(false);
    expect(excessiveResult.error).toMatch(/at most 3/i);
  });

  it('SCHED-005: validateRescheduleProposal validates that all candidate windows are strictly in the future (minimum 1 hour ahead of reference now)', () => {
    const pastWindow: ArrivalWindow = {
      date: '2026-10-20',
      startHour: 7,
      endHour: 9,
      display: 'Tuesday, Oct 20, 2026, 7:00 AM - 9:00 AM WAT',
    };
    const pastProposal: ProposeRescheduleInput = {
      bookingId: 'booking-101',
      requesterRole: 'CLIENT',
      requesterId: 'cust-456',
      proposedWindows: [pastWindow],
      reason: 'WEATHER',
    };
    const pastResult = validateRescheduleProposal(pastProposal, 'CONFIRMED', 'NOT_STARTED', referenceNow);
    expect(pastResult.valid).toBe(false);
    expect(pastResult.error).toMatch(/future|minimum 1 hour ahead/i);

    const tooCloseWindow: ArrivalWindow = {
      date: '2026-10-20',
      startHour: 8,
      endHour: 10,
      display: 'Tuesday, Oct 20, 2026, 8:00 AM - 10:00 AM WAT',
    };
    const tooCloseProposal: ProposeRescheduleInput = {
      bookingId: 'booking-101',
      requesterRole: 'CLIENT',
      requesterId: 'cust-456',
      proposedWindows: [tooCloseWindow],
      reason: 'WEATHER',
    };
    const tooCloseResult = validateRescheduleProposal(tooCloseProposal, 'CONFIRMED', 'NOT_STARTED', referenceNow);
    expect(tooCloseResult.valid).toBe(false);
    expect(tooCloseResult.error).toMatch(/future|minimum 1 hour ahead/i);
  });

  it('SCHED-006: validateRescheduleProposal requires non-empty reasonNote when reason is OTHER', () => {
    const otherWithoutNote: ProposeRescheduleInput = {
      bookingId: 'booking-101',
      requesterRole: 'TASKER',
      requesterId: 'artisan-789',
      proposedWindows: [validWindow],
      reason: 'OTHER',
    };
    const failedResult = validateRescheduleProposal(otherWithoutNote, 'CONFIRMED', 'NOT_STARTED', referenceNow);
    expect(failedResult.valid).toBe(false);
    expect(failedResult.error).toMatch(/reasonNote is required when reason is OTHER/i);

    const otherWithWhitespaceNote: ProposeRescheduleInput = {
      ...otherWithoutNote,
      reasonNote: '   ',
    };
    const whitespaceResult = validateRescheduleProposal(otherWithWhitespaceNote, 'CONFIRMED', 'NOT_STARTED', referenceNow);
    expect(whitespaceResult.valid).toBe(false);
    expect(whitespaceResult.error).toMatch(/reasonNote is required when reason is OTHER/i);

    const otherWithValidNote: ProposeRescheduleInput = {
      ...otherWithoutNote,
      reasonNote: 'Estate security gate closed for maintenance until afternoon',
    };
    const successResult = validateRescheduleProposal(otherWithValidNote, 'CONFIRMED', 'NOT_STARTED', referenceNow);
    expect(successResult.valid).toBe(true);
  });

  it('SCHED-007: evaluateRescheduleResponse with ACCEPT transitions request to ACCEPTED and atomically derives the new agreed arrival window', () => {
    const acceptResponse: RespondRescheduleInput = {
      action: 'ACCEPT',
      selectedWindow: validWindow,
      respondedBy: 'artisan-789',
    };

    const evaluation = evaluateRescheduleResponse(samplePendingRequest, acceptResponse, referenceNow);
    expect(evaluation.ok).toBe(true);
    expect(evaluation.nextStatus).toBe('ACCEPTED');
    expect(evaluation.newAgreedWindow).toEqual(validWindow);
  });

  it('SCHED-008: evaluateRescheduleResponse with DECLINE transitions request to DECLINED and preserves original agreed arrival window', () => {
    const declineResponse: RespondRescheduleInput = {
      action: 'DECLINE',
      respondedBy: 'artisan-789',
    };

    const evaluation = evaluateRescheduleResponse(samplePendingRequest, declineResponse, referenceNow);
    expect(evaluation.ok).toBe(true);
    expect(evaluation.nextStatus).toBe('DECLINED');
    expect(evaluation.newAgreedWindow).toBeUndefined();
  });

  it('SCHED-009: evaluateRescheduleResponse with COUNTER transitions previous request to COUNTERED and validates counter-proposed candidate windows', () => {
    const counterWindow: ArrivalWindow = {
      date: '2026-10-21',
      startHour: 14,
      endHour: 17,
      display: 'Wednesday, Oct 21, 2026, 2:00 PM - 5:00 PM WAT',
    };

    const validCounter: RespondRescheduleInput = {
      action: 'COUNTER',
      counterWindows: [counterWindow],
      counterReason: 'PARTS_PROCUREMENT',
      counterNote: 'Need until Wednesday to procure verified genuine compressor',
      respondedBy: 'artisan-789',
    };

    const validEval = evaluateRescheduleResponse(samplePendingRequest, validCounter, referenceNow);
    expect(validEval.ok).toBe(true);
    expect(validEval.nextStatus).toBe('COUNTERED');

    const invalidCounter: RespondRescheduleInput = {
      action: 'COUNTER',
      counterWindows: [],
      counterReason: 'PARTS_PROCUREMENT',
      respondedBy: 'artisan-789',
    };

    const invalidEval = evaluateRescheduleResponse(samplePendingRequest, invalidCounter, referenceNow);
    expect(invalidEval.ok).toBe(false);
    expect(invalidEval.error).toMatch(/counter candidate windows required/i);
  });

  it('SCHED-010: deriveDispatchTrackingView maps dispatch status to appropriate customer-facing progression state, safety guidance, and arrival prompts', () => {
    const notStartedView = deriveDispatchTrackingView({
      bookingId: 'booking-101',
      jobStatus: 'CONFIRMED',
      dispatchStatus: 'NOT_STARTED',
      arrivalWindow: validWindow,
    });
    expect(notStartedView.safetyNotice).toContain('Ensure someone 18+ is home to receive the artisan');
    expect(notStartedView.actionRequired).toMatch(/awaiting scheduled window|preparing/i);

    const enRouteView = deriveDispatchTrackingView({
      bookingId: 'booking-101',
      jobStatus: 'CONFIRMED',
      dispatchStatus: 'EN_ROUTE',
      dispatchUpdatedAt: '2026-10-20T09:15:00.000Z',
      arrivalWindow: validWindow,
    });
    expect(enRouteView.safetyNotice).toContain('Ensure someone 18+ is home to receive the artisan');
    expect(enRouteView.actionRequired).toMatch(/traveling|on the way/i);

    const arrivedView = deriveDispatchTrackingView({
      bookingId: 'booking-101',
      jobStatus: 'CONFIRMED',
      dispatchStatus: 'ARRIVED',
      dispatchUpdatedAt: '2026-10-20T09:50:00.000Z',
      arrivalWindow: validWindow,
    });
    expect(arrivedView.actionRequired).toMatch(/arrived|admit/i);
  });
});
