// apps/web/lib/brainworker/bookings/cancellation.test.ts
// BW-004 Phase 6 RED: Provider Cancellation (CAN-001 to CAN-008)
// Governed by:
//   docs/specs/BW-004-architecture-contract.md (sections 5, 6, 7, 10, 14, 15, 16)
//   docs/specs/BW-004-booking-management.md (D6, D7)
//   docs/specs/BW-004-test-first-implementation-plan.md (Phase 6)
//
// Invariant Rules:
// 1. Zero imports from testing/ (REP-010).
// 2. Cancellation allowed only from CONFIRMED (CAN-001, CAN-002, CAN-003).
// 3. canTransition is the gate; no direct state writes (ARCH s7).
// 4. Closed taxonomy for reasons (CAN-004).
// 5. OTHER requires a bounded note (CAN-005).
// 6. cancelledBy and reason recorded authoritatively (CAN-006).
// 7. Concurrent customer cancellation yields authoritative state (CAN-007).
// 8. No refund, penalty, rating, or financial mutation is produced or claimed (CAN-008).

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { JobStatus } from '@bukiebrainjobs/api-types';
import {
  transitionProviderCancellation,
  VALID_PROVIDER_CANCELLATION_REASONS,
  type CancellationTransitionInput,
} from './cancellation';
import type { ProviderCancellationReason } from './types';

const sourceOf = (file: string): string =>
  readFileSync(fileURLToPath(new URL(file, import.meta.url)), 'utf8');

describe('BW-004 Phase 6: Provider Cancellation (CAN-001 to CAN-008)', () => {
  // ===========================================================================
  // CAN-001: cancel from CONFIRMED
  // ===========================================================================
  it('CAN-001: cancel from CONFIRMED', () => {
    const input: CancellationTransitionInput = {
      bookingId: 'booking-can-001',
      currentJobStatus: 'CONFIRMED',
      currentDispatchStatus: 'NOT_STARTED',
      reason: 'SCHEDULE_CONFLICT',
      now: '2026-10-15T14:00:00.000Z',
    };

    const result = transitionProviderCancellation(input);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.jobStatus).toBe('CANCELLED');
      expect(result.cancelledBy).toBe('brainworker');
      expect(result.cancellationReason).toBe('SCHEDULE_CONFLICT');
      expect(result.cancelledAt).toBe('2026-10-15T14:00:00.000Z');
      expect(result.event).toEqual({
        type: 'BOOKING_CANCELLED_BY_PROVIDER',
        bookingId: 'booking-can-001',
        reason: 'SCHEDULE_CONFLICT',
        timestamp: '2026-10-15T14:00:00.000Z',
      });
    }
  });

  // ===========================================================================
  // CAN-002: cancel refused from IN_PROGRESS
  // ===========================================================================
  it('CAN-002: cancel refused from IN_PROGRESS', () => {
    const input: CancellationTransitionInput = {
      bookingId: 'booking-can-002',
      currentJobStatus: 'IN_PROGRESS',
      currentDispatchStatus: 'ARRIVED',
      reason: 'SCOPE_MISMATCH',
    };

    const result = transitionProviderCancellation(input);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe('INVALID_TRANSITION');
      expect(result.authoritative).toEqual({
        jobStatus: 'IN_PROGRESS',
        dispatchStatus: 'ARRIVED',
      });
    }
  });

  // ===========================================================================
  // CAN-003: cancel refused from every terminal state
  // ===========================================================================
  it('CAN-003: cancel refused from every terminal state', () => {
    const terminalStatuses: JobStatus[] = [
      'COMPLETED',
      'CANCELLED',
      'DISPUTED',
      'EXPIRED',
      'PENDING_COMPLETION',
      'PAID',
      'OPEN',
      'PENDING_ACCEPTANCE',
    ];

    for (const status of terminalStatuses) {
      const result = transitionProviderCancellation({
        bookingId: 'booking-can-003',
        currentJobStatus: status,
        currentDispatchStatus: 'NOT_STARTED',
        reason: 'SCHEDULE_CONFLICT',
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(['INVALID_TRANSITION', 'STALE_STATE']).toContain(result.reason);
        expect(result.authoritative.jobStatus).toBe(status);
      }
    }
  });

  // ===========================================================================
  // CAN-004: reason validated against the taxonomy
  // ===========================================================================
  it('CAN-004: reason validated against the taxonomy', () => {
    const invalidReasons = [
      'PRICE_TOO_LOW',
      'FOUND_BETTER_JOB',
      'CUSTOMER_RUDE',
      'WEATHER',
      'OTHER_REASON',
      '',
      null,
      undefined,
    ];

    for (const invalidReason of invalidReasons) {
      const result = transitionProviderCancellation({
        bookingId: 'booking-can-004',
        currentJobStatus: 'CONFIRMED',
        currentDispatchStatus: 'NOT_STARTED',
        reason: invalidReason,
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.reason).toBe('VALIDATION_FAILED');
      }
    }

    // Verify all allowed reasons pass taxonomy validation
    for (const validReason of VALID_PROVIDER_CANCELLATION_REASONS) {
      const validResult = transitionProviderCancellation({
        bookingId: 'booking-can-004',
        currentJobStatus: 'CONFIRMED',
        currentDispatchStatus: 'NOT_STARTED',
        reason: validReason,
        ...(validReason === 'OTHER' ? { note: 'Valid explanation for OTHER' } : {}),
      });

      expect(validResult.ok).toBe(true);
    }
  });

  // ===========================================================================
  // CAN-005: OTHER requires a bounded note
  // ===========================================================================
  it('CAN-005: OTHER requires a bounded note', () => {
    // Missing note for OTHER
    const resultMissingNote = transitionProviderCancellation({
      bookingId: 'booking-can-005',
      currentJobStatus: 'CONFIRMED',
      currentDispatchStatus: 'NOT_STARTED',
      reason: 'OTHER',
    });
    expect(resultMissingNote.ok).toBe(false);
    if (!resultMissingNote.ok) {
      expect(resultMissingNote.reason).toBe('VALIDATION_FAILED');
    }

    // Empty note for OTHER
    const resultEmptyNote = transitionProviderCancellation({
      bookingId: 'booking-can-005',
      currentJobStatus: 'CONFIRMED',
      currentDispatchStatus: 'NOT_STARTED',
      reason: 'OTHER',
      note: '   ',
    });
    expect(resultEmptyNote.ok).toBe(false);
    if (!resultEmptyNote.ok) {
      expect(resultEmptyNote.reason).toBe('VALIDATION_FAILED');
    }

    // Note exceeding 500 characters
    const resultTooLongNote = transitionProviderCancellation({
      bookingId: 'booking-can-005',
      currentJobStatus: 'CONFIRMED',
      currentDispatchStatus: 'NOT_STARTED',
      reason: 'OTHER',
      note: 'x'.repeat(501),
    });
    expect(resultTooLongNote.ok).toBe(false);
    if (!resultTooLongNote.ok) {
      expect(resultTooLongNote.reason).toBe('VALIDATION_FAILED');
    }

    // Note containing illegal control characters
    const resultControlChar = transitionProviderCancellation({
      bookingId: 'booking-can-005',
      currentJobStatus: 'CONFIRMED',
      currentDispatchStatus: 'NOT_STARTED',
      reason: 'OTHER',
      note: 'Illegal character \u0000 in explanation',
    });
    expect(resultControlChar.ok).toBe(false);
    if (!resultControlChar.ok) {
      expect(resultControlChar.reason).toBe('VALIDATION_FAILED');
    }

    // Valid note for OTHER succeeds
    const resultValidNote = transitionProviderCancellation({
      bookingId: 'booking-can-005',
      currentJobStatus: 'CONFIRMED',
      currentDispatchStatus: 'NOT_STARTED',
      reason: 'OTHER',
      note: 'Equipment breakdown en route to job site.',
    });
    expect(resultValidNote.ok).toBe(true);
    if (resultValidNote.ok) {
      expect(resultValidNote.cancellationNote).toBe('Equipment breakdown en route to job site.');
    }
  });

  // ===========================================================================
  // CAN-006: cancelledBy and reason recorded by the authority
  // ===========================================================================
  it('CAN-006: cancelledBy and reason recorded by the authority', () => {
    const authoritativeTime = '2026-10-15T15:30:00.000Z';

    const result = transitionProviderCancellation({
      bookingId: 'booking-can-006',
      currentJobStatus: 'CONFIRMED',
      currentDispatchStatus: 'NOT_STARTED',
      reason: 'UNABLE_TO_REACH_SITE',
      now: authoritativeTime,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.cancelledBy).toBe('brainworker');
      expect(result.cancellationReason).toBe('UNABLE_TO_REACH_SITE');
      expect(result.cancelledAt).toBe(authoritativeTime);
      expect(result.event.timestamp).toBe(authoritativeTime);
    }
  });

  // ===========================================================================
  // CAN-007: concurrent customer cancellation yields authoritative state, no false success
  // ===========================================================================
  it('CAN-007: concurrent customer cancellation yields authoritative state, no false success', () => {
    // Expected version 1 but actual version 2 (customer cancelled concurrently)
    const resultStale = transitionProviderCancellation({
      bookingId: 'booking-can-007',
      currentJobStatus: 'CANCELLED',
      currentDispatchStatus: 'NOT_STARTED',
      reason: 'SCHEDULE_CONFLICT',
      expectedVersion: 1,
      actualVersion: 2,
    });

    expect(resultStale.ok).toBe(false);
    if (!resultStale.ok) {
      expect(['STALE_STATE', 'INVALID_TRANSITION']).toContain(resultStale.reason);
      expect(resultStale.authoritative.jobStatus).toBe('CANCELLED');
    }
  });

  // ===========================================================================
  // CAN-008: no refund, penalty, or rating effect is produced or claimed
  // ===========================================================================
  it('CAN-008: no refund, penalty, or rating effect is produced or claimed', () => {
    const result = transitionProviderCancellation({
      bookingId: 'booking-can-008',
      currentJobStatus: 'CONFIRMED',
      currentDispatchStatus: 'NOT_STARTED',
      reason: 'CUSTOMER_UNRESPONSIVE',
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result).not.toHaveProperty('refundAmountKobo');
      expect(result).not.toHaveProperty('penaltyFeeKobo');
      expect(result).not.toHaveProperty('ratingImpact');
      expect(result).not.toHaveProperty('reputationDeduction');
      expect(result).not.toHaveProperty('escrowMutation');
    }

    // Architectural boundary
    const cancelSource = sourceOf('./cancellation.ts');
    expect(cancelSource).not.toMatch(/refund/i);
    expect(cancelSource).not.toMatch(/penalty/i);
    expect(cancelSource).not.toMatch(/rating/i);
    expect(cancelSource).not.toMatch(/from\s+['"][^'"]*payment/);
  });
});
