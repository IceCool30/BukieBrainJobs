// apps/web/lib/brainworker/bookings/dispatch.ts
// BW-004 Phase 3: Dispatch Tracking (DIS-001 to DIS-008)
// Governed by:
//   docs/specs/BW-004-architecture-contract.md (sections 4, 5, 7, 10, 14, 16)
//   docs/specs/BW-004-booking-management.md (D5, D6, D8)
//   docs/specs/BW-004-test-first-implementation-plan.md (Phase 3)
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
 * DIS-001: mark en route from CONFIRMED.
 * DIS-002: mark arrived from CONFIRMED.
 * DIS-003: direct NOT_STARTED -> ARRIVED permitted.
 * DIS-004: no backward transition (refuses ARRIVED -> EN_ROUTE, ARRIVED -> NOT_STARTED, EN_ROUTE -> NOT_STARTED).
 * DIS-005: dispatch update refused when jobStatus is not CONFIRMED (e.g. IN_PROGRESS freezes dispatch as history).
 * DIS-006: authoritative timestamp recorded, never client-authored.
 * DIS-007: optional snapshot stored on arrival, absent on en route.
 * DIS-008: dispatch update emits a domain event (DISPATCH_UPDATED), zero notification records written.
 */
export function transitionDispatch(
  input: DispatchTransitionInput
): DispatchTransitionResult {
  // 1. Dispatch update refused when jobStatus is not CONFIRMED (DIS-005)
  if (input.currentJobStatus !== 'CONFIRMED') {
    return {
      ok: false,
      reason: 'STALE_STATE',
      authoritative: {
        jobStatus: input.currentJobStatus,
        dispatchStatus: input.currentDispatchStatus,
      },
    };
  }

  // 2. Forward-only dispatch transitions (DIS-003, DIS-004)
  // Legal paths:
  //   NOT_STARTED -> EN_ROUTE
  //   NOT_STARTED -> ARRIVED (direct transition permitted, DIS-003)
  //   EN_ROUTE -> ARRIVED
  const isForwardTransition =
    (input.currentDispatchStatus === 'NOT_STARTED' &&
      (input.nextDispatchStatus === 'EN_ROUTE' || input.nextDispatchStatus === 'ARRIVED')) ||
    (input.currentDispatchStatus === 'EN_ROUTE' && input.nextDispatchStatus === 'ARRIVED');

  if (!isForwardTransition) {
    return {
      ok: false,
      reason: 'INVALID_TRANSITION',
      authoritative: {
        jobStatus: input.currentJobStatus,
        dispatchStatus: input.currentDispatchStatus,
      },
    };
  }

  // 3. Authoritative timestamp recorded, never client-authored (DIS-006)
  const timestamp = input.now ?? new Date().toISOString();

  // 4. Optional snapshot stored on arrival, absent on en route (DIS-007)
  const arrivalSnapshot =
    input.nextDispatchStatus === 'ARRIVED' && input.snapshot ? input.snapshot : undefined;

  // 5. Emit domain event, no notification delivery (DIS-008)
  const event: BookingFeedEvent = {
    type: 'DISPATCH_UPDATED',
    bookingId: input.bookingId,
    dispatchStatus: input.nextDispatchStatus,
    timestamp,
  };

  return {
    ok: true,
    dispatchStatus: input.nextDispatchStatus,
    dispatchUpdatedAt: timestamp,
    arrivalSnapshot,
    event,
  };
}
