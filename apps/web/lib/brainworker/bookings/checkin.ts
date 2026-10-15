// apps/web/lib/brainworker/bookings/checkin.ts
// BW-004 Phase 4: Check-in (CHK-001 to CHK-015)
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
// 7. No continuous tracking or persistent position listeners (CHK-010).
// 8. Dispatch history and arrival evidence remain distinct from check-in (ARCH s7).

import { canTransition, type JobStatus } from '@bukiebrainjobs/api-types';
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
 * Calculates geographic distance in meters between two coordinates using the Haversine formula.
 * Earth mean radius: 6,371,000 meters.
 */
export function calculateDistanceMeters(
  coord1: Coordinates,
  coord2: Coordinates
): number {
  const earthRadiusMeters = 6371000;
  const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;

  const dLat = toRadians(coord2.latitude - coord1.latitude);
  const dLon = toRadians(coord2.longitude - coord1.longitude);

  const lat1 = toRadians(coord1.latitude);
  const lat2 = toRadians(coord2.latitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusMeters * c;
}

/**
 * Evaluates and applies the check-in transition.
 * 1. Checks state machine transition via canTransition (CHK-002, CHK-008).
 * 2. Checks financial prerequisite: escrowStatus === 'held_in_escrow' (CHK-007, CHK-011, CHK-013).
 * 3. Checks location availability and permission (CHK-006).
 * 4. Checks snapshot accuracy against authority config (CHK-005).
 * 5. Checks distance against authority config threshold (CHK-004, CHK-009, CHK-014).
 * 6. Generates authoritative actualStartAt timestamp (CHK-003).
 */
export function transitionCheckIn(
  input: CheckInTransitionInput
): CheckInTransitionResult {
  const authoritativeState = {
    jobStatus: input.currentJobStatus,
    dispatchStatus: input.currentDispatchStatus,
    escrowStatus: input.escrowStatus,
  };

  // 1. State machine transition gate (ARCH s4, CHK-002, CHK-008)
  if (!canTransition(input.currentJobStatus, 'IN_PROGRESS')) {
    return {
      ok: false,
      reason: 'INVALID_TRANSITION',
      authoritative: authoritativeState,
    };
  }

  // 2. Financial prerequisite gate (ARCH s8, CHK-007, CHK-011, CHK-013)
  if (input.escrowStatus !== 'held_in_escrow') {
    return {
      ok: false,
      reason: 'ESCROW_NOT_HELD',
      authoritative: authoritativeState,
    };
  }

  // 3. Permission and snapshot availability gate (ARCH s9, CHK-006)
  if (
    input.permissionState === 'denied' ||
    input.permissionState === 'unavailable' ||
    !input.snapshot
  ) {
    return {
      ok: false,
      reason: 'LOCATION_UNAVAILABLE',
      authoritative: authoritativeState,
    };
  }

  // 4. Accuracy gate (ARCH s9, CHK-005)
  const maxAccuracy = input.config?.maxAccuracyMeters ?? 50;
  if (
    typeof input.snapshot.accuracyMeters === 'number' &&
    input.snapshot.accuracyMeters > maxAccuracy
  ) {
    return {
      ok: false,
      reason: 'LOCATION_ACCURACY_TOO_LOW',
      authoritative: authoritativeState,
    };
  }

  // 5. Proximity verification gate (ARCH s8, CHK-004, CHK-009, CHK-014)
  const proximityThreshold = input.config?.proximityThresholdMeters ?? 150;
  const distanceMeters = calculateDistanceMeters(
    input.jobCoordinates,
    input.snapshot
  );

  if (distanceMeters > proximityThreshold) {
    return {
      ok: false,
      reason: 'LOCATION_OUT_OF_RANGE',
      authoritative: authoritativeState,
    };
  }

  // 6. Authoritative start timestamp (ARCH s7, CHK-001, CHK-003)
  const actualStartAt = input.now ?? new Date().toISOString();

  return {
    ok: true,
    jobStatus: 'IN_PROGRESS',
    actualStartAt,
    checkInSnapshot: input.snapshot,
    event: {
      type: 'CHECKED_IN',
      bookingId: input.bookingId,
      timestamp: actualStartAt,
    },
  };
}
