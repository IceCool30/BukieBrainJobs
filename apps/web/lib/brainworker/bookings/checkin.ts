// apps/web/lib/brainworker/bookings/checkin.ts
// BW-004 Phase 4 RED: Check-in (CHK-001 to CHK-015)
// Governed by:
//   docs/specs/BW-004-architecture-contract.md (sections 4, 5, 7, 8, 9, 10, 14, 16)
//   docs/specs/BW-004-booking-management.md (D2, D3, D7, D8, D9)
//   docs/specs/BW-004-test-first-implementation-plan.md (Phase 4)
//
// Invariant Rules:
// 1. Zero imports from testing/ (REP-010).
// 2. canTransition is the gate; no direct state writes (CHK-002).
// 3. actualStartAt and timestamps are written by the authority, never client-authored (CHK-003).
// 4. Proximity threshold is read from authority configuration; no module hardcodes a radius (CHK-014, CHK-015).
// 5. Financial prerequisite is read from EscrowStatus ('held_in_escrow'), never inferred from CONFIRMED (CHK-007, CHK-011, CHK-013).
// 6. Check-in never writes escrow, payment, refund, or payout state (CHK-012).
// 7. No continuous tracking or watchPosition retention (CHK-010).
// 8. Dispatch history and arrival evidence remain distinct from check-in (ARCH s7).

import type { JobStatus } from '@bukiebrainjobs/api-types';
import type { EscrowStatus } from '../../payment/types';
import type {
  DispatchStatus,
  LocationSnapshot,
  BookingFeedEvent,
} from './types';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface CheckInAuthorityConfig {
  proximityThresholdMeters: number;
  maxAccuracyMeters: number;
}

export interface CheckInTransitionInput {
  bookingId: string;
  currentJobStatus: JobStatus;
  currentDispatchStatus: DispatchStatus;
  escrowStatus: EscrowStatus;
  jobCoordinates: Coordinates;
  snapshot?: LocationSnapshot | null | undefined;
  permissionState?: 'granted' | 'denied' | 'prompt' | 'unavailable' | undefined;
  now?: string | undefined;
  config?: CheckInAuthorityConfig | undefined;
}

export type CheckInTransitionResult =
  | {
      ok: true;
      jobStatus: 'IN_PROGRESS';
      actualStartAt: string;
      checkInSnapshot: LocationSnapshot;
      event: BookingFeedEvent;
    }
  | {
      ok: false;
      reason:
        | 'INVALID_TRANSITION'
        | 'ESCROW_NOT_HELD'
        | 'LOCATION_UNAVAILABLE'
        | 'LOCATION_OUT_OF_RANGE'
        | 'LOCATION_ACCURACY_TOO_LOW'
        | 'STALE_STATE';
      authoritative: {
        jobStatus: JobStatus;
        dispatchStatus: DispatchStatus;
        escrowStatus: EscrowStatus;
      };
    };

/**
 * Evaluates and applies the check-in transition.
 * RED Phase Stub: throws "RED: not implemented".
 */
export function transitionCheckIn(
  _input: CheckInTransitionInput
): CheckInTransitionResult {
  throw new Error('RED: not implemented');
}

/**
 * Calculates geographic distance in meters between two coordinates using the Haversine formula.
 * RED Phase Stub: throws "RED: not implemented".
 */
export function calculateDistanceMeters(
  _coord1: Coordinates,
  _coord2: Coordinates
): number {
  throw new Error('RED: not implemented');
}
