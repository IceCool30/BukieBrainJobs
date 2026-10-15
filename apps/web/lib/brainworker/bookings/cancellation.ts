// apps/web/lib/brainworker/bookings/cancellation.ts
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

import type { JobStatus } from '@bukiebrainjobs/api-types';
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

/**
 * Evaluates and applies provider cancellation transition.
 * RED Phase Stub: throws "RED: not implemented".
 */
export function transitionProviderCancellation(
  _input: CancellationTransitionInput
): CancellationTransitionResult {
  throw new Error('RED: not implemented');
}
