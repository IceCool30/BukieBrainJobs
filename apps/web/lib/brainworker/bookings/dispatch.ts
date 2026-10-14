// apps/web/lib/brainworker/bookings/dispatch.ts
// BW-004 Phase 3 RED: Dispatch Tracking (DIS-001 to DIS-008)
// Governed by: BW-004-ARCH v0.2 section 4 (Authorities), section 7 (State Machine), section 10 (Messaging/Events), section 14 (Physical Layout)
//
// Invariant Rules:
// 1. Zero imports from testing/ (REP-010).
// 2. Dispatch status is forward-only: NOT_STARTED -> EN_ROUTE -> ARRIVED, or NOT_STARTED -> ARRIVED (DIS-003, DIS-004).
// 3. Dispatch can only be updated while jobStatus === 'CONFIRMED' (DIS-001, DIS-002, DIS-005).
// 4. Once check-in moves the booking to IN_PROGRESS, dispatch freezes as historical evidence (ARCH s7).
// 5. Timestamps are authoritative, never client-authored (DIS-006).
// 6. Optional location snapshot is stored on arrival, absent on en route (DIS-007).
// 7. Dispatch updates emit domain events only; zero notification records are written (DIS-008).

import type { JobStatus } from '@bukiebrainjobs/api-types';
import type {
  DispatchStatus,
  LocationSnapshot,
  BookingFeedEvent,
} from './types';

export interface DispatchTransitionInput {
  bookingId: string;
  currentJobStatus: JobStatus;
  currentDispatchStatus: DispatchStatus;
  nextDispatchStatus: 'EN_ROUTE' | 'ARRIVED';
  snapshot?: LocationSnapshot | undefined;
  now?: string | undefined;
}

export type DispatchTransitionResult =
  | {
      ok: true;
      dispatchStatus: DispatchStatus;
      dispatchUpdatedAt: string;
      arrivalSnapshot?: LocationSnapshot | undefined;
      event: BookingFeedEvent;
    }
  | {
      ok: false;
      reason: 'INVALID_TRANSITION' | 'STALE_STATE';
      authoritative: {
        jobStatus: JobStatus;
        dispatchStatus: DispatchStatus;
      };
    };

/**
 * Evaluates and applies a forward-only dispatch transition.
 * RED Phase Stub: throws "RED: not implemented".
 */
export function transitionDispatch(
  _input: DispatchTransitionInput
): DispatchTransitionResult {
  throw new Error('RED: not implemented');
}
