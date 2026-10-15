// apps/web/lib/brainworker/bookings/cancellation.ts
// BW-004 Phase 6: Provider Cancellation (CAN-001 to CAN-008)
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
// 8. No financial mutation, fee, or reputation deduction is produced or claimed (CAN-008).

import { canTransition, type JobStatus } from '@bukiebrainjobs/api-types';
import type {
  DispatchStatus,
  ProviderCancellationReason,
  BookingFeedEvent,
} from './types';

export const VALID_PROVIDER_CANCELLATION_REASONS: ReadonlySet<ProviderCancellationReason> =
  new Set([
    'SCHEDULE_CONFLICT',
    'UNABLE_TO_REACH_SITE',
    'SCOPE_MISMATCH',
    'CUSTOMER_UNRESPONSIVE',
    'OTHER',
  ]);

export interface CancellationTransitionInput {
  bookingId: string;
  currentJobStatus: JobStatus;
  currentDispatchStatus: DispatchStatus;
  reason: unknown;
  note?: unknown;
  expectedVersion?: number | string | undefined;
  actualVersion?: number | string | undefined;
  now?: string | undefined;
}

export type CancellationTransitionResult =
  | {
      ok: true;
      jobStatus: 'CANCELLED';
      cancelledBy: 'brainworker';
      cancellationReason: ProviderCancellationReason;
      cancellationNote?: string | undefined;
      cancelledAt: string;
      event: BookingFeedEvent;
    }
  | {
      ok: false;
      reason:
        | 'INVALID_TRANSITION'
        | 'VALIDATION_FAILED'
        | 'STALE_STATE';
      authoritative: {
        jobStatus: JobStatus;
        dispatchStatus: DispatchStatus;
      };
    };

// Regex matching ASCII control characters except tab, newline, and carriage return
const CONTROL_CHARACTERS_REGEX = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/;

/**
 * Evaluates and applies provider cancellation transition.
 * CAN-001: cancel from CONFIRMED transitions to CANCELLED.
 * CAN-002: cancel refused from IN_PROGRESS.
 * CAN-003: cancel refused from every terminal or non-CONFIRMED state.
 * CAN-004: reason validated against closed taxonomy.
 * CAN-005: OTHER requires a bounded note (1 to 500 characters, no control chars).
 * CAN-006: cancelledBy and reason recorded authoritatively.
 * CAN-007: concurrent cancellation yields STALE_STATE with authoritative state.
 * CAN-008: no financial, fee, or score impact is produced or claimed.
 */
export function transitionProviderCancellation(
  input: CancellationTransitionInput
): CancellationTransitionResult {
  const authoritative = {
    jobStatus: input.currentJobStatus,
    dispatchStatus: input.currentDispatchStatus,
  };

  // 1. Concurrency / Stale state check
  if (
    input.expectedVersion !== undefined &&
    input.actualVersion !== undefined &&
    input.expectedVersion !== input.actualVersion
  ) {
    return {
      ok: false,
      reason: 'STALE_STATE',
      authoritative,
    };
  }

  // 2. State machine gate: provider can only cancel from CONFIRMED
  if (
    input.currentJobStatus !== 'CONFIRMED' ||
    !canTransition(input.currentJobStatus, 'CANCELLED')
  ) {
    return {
      ok: false,
      reason: 'INVALID_TRANSITION',
      authoritative,
    };
  }

  // 3. Reason taxonomy validation
  if (
    typeof input.reason !== 'string' ||
    !VALID_PROVIDER_CANCELLATION_REASONS.has(input.reason as ProviderCancellationReason)
  ) {
    return {
      ok: false,
      reason: 'VALIDATION_FAILED',
      authoritative,
    };
  }

  const validatedReason = input.reason as ProviderCancellationReason;

  // 4. Note validation
  let validatedNote: string | undefined = undefined;

  if (validatedReason === 'OTHER') {
    if (
      input.note === undefined ||
      input.note === null ||
      typeof input.note !== 'string'
    ) {
      return {
        ok: false,
        reason: 'VALIDATION_FAILED',
        authoritative,
      };
    }

    const trimmed = input.note.trim();
    if (
      trimmed.length === 0 ||
      trimmed.length > 500 ||
      CONTROL_CHARACTERS_REGEX.test(trimmed)
    ) {
      return {
        ok: false,
        reason: 'VALIDATION_FAILED',
        authoritative,
      };
    }

    validatedNote = trimmed;
  } else if (input.note !== undefined && input.note !== null) {
    if (typeof input.note !== 'string') {
      return {
        ok: false,
        reason: 'VALIDATION_FAILED',
        authoritative,
      };
    }

    const trimmed = input.note.trim();
    if (
      trimmed.length > 500 ||
      CONTROL_CHARACTERS_REGEX.test(trimmed)
    ) {
      return {
        ok: false,
        reason: 'VALIDATION_FAILED',
        authoritative,
      };
    }

    if (trimmed.length > 0) {
      validatedNote = trimmed;
    }
  }

  // 5. Successful transition
  const nowIso = input.now ?? new Date().toISOString();

  return {
    ok: true,
    jobStatus: 'CANCELLED',
    cancelledBy: 'brainworker',
    cancellationReason: validatedReason,
    ...(validatedNote ? { cancellationNote: validatedNote } : {}),
    cancelledAt: nowIso,
    event: {
      type: 'BOOKING_CANCELLED_BY_PROVIDER',
      bookingId: input.bookingId,
      reason: validatedReason,
      timestamp: nowIso,
    },
  };
}
