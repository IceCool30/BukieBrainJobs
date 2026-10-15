// apps/web/lib/brainworker/bookings/checkin.test.ts
// BW-004 Phase 4 RED: Check-in (CHK-001 to CHK-015)
// Governed by:
//   docs/specs/BW-004-architecture-contract.md (sections 4, 5, 7, 8, 9, 10, 14, 16)
//   docs/specs/BW-004-booking-management.md (D2, D3, D7, D8, D9)
//   docs/specs/BW-004-test-first-implementation-plan.md (Phase 4)
//
// Invariant Rules:
// 1. Zero imports from testing/ (REP-010).
// 2. canTransition is the gate; no direct state write (CHK-002).
// 3. actualStartAt and timestamps are written by the authority, never client-authored (CHK-003).
// 4. Proximity threshold is read from authority configuration; no module hardcodes a radius (CHK-014, CHK-015).
// 5. Financial prerequisite is read from EscrowStatus ('held_in_escrow'), never inferred from CONFIRMED (CHK-007, CHK-011, CHK-013).
// 6. Check-in never writes escrow, payment, refund, or payout state (CHK-012).
// 7. No continuous tracking or watchPosition retention (CHK-010).
// 8. Dispatch history and arrival evidence remain distinct from check-in (ARCH s7).

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { JobStatus } from '@bukiebrainjobs/api-types';
import type { EscrowStatus } from '../../payment/types';
import {
  transitionCheckIn,
  type CheckInTransitionInput,
  type CheckInAuthorityConfig,
  type Coordinates,
} from './checkin';
import type { LocationSnapshot } from './types';

const sourceOf = (file: string): string =>
  readFileSync(fileURLToPath(new URL(file, import.meta.url)), 'utf8');

const JOB_SITE_COORDINATES: Coordinates = {
  latitude: 9.0765,
  longitude: 7.3986,
};

const VALID_SNAPSHOT: LocationSnapshot = {
  latitude: 9.0765,
  longitude: 7.3986,
  accuracyMeters: 10,
};

const DEFAULT_CONFIG: CheckInAuthorityConfig = {
  proximityThresholdMeters: 150,
  maxAccuracyMeters: 30,
};

describe('BW-004 Phase 4: Check-in (CHK-001 to CHK-015)', () => {
  // ---------------------------------------------------------------------------
  // CHK-001: valid snapshot from CONFIRMED produces IN_PROGRESS
  // ---------------------------------------------------------------------------
  it('CHK-001: valid snapshot from CONFIRMED produces IN_PROGRESS', () => {
    const input: CheckInTransitionInput = {
      bookingId: 'booking-chk-001',
      currentJobStatus: 'CONFIRMED',
      currentDispatchStatus: 'ARRIVED',
      escrowStatus: 'held_in_escrow',
      jobCoordinates: JOB_SITE_COORDINATES,
      snapshot: VALID_SNAPSHOT,
      permissionState: 'granted',
      config: DEFAULT_CONFIG,
    };

    const result = transitionCheckIn(input);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.jobStatus).toBe('IN_PROGRESS');
      expect(result.actualStartAt).toBeDefined();
      expect(result.checkInSnapshot).toEqual(VALID_SNAPSHOT);
      expect(result.event).toEqual({
        type: 'CHECKED_IN',
        bookingId: 'booking-chk-001',
        timestamp: result.actualStartAt,
      });
    }
  });

  // ---------------------------------------------------------------------------
  // CHK-002: canTransition is the gate; no direct state write
  // ---------------------------------------------------------------------------
  it('CHK-002: canTransition is the gate; no direct state write', () => {
    const invalidStatuses: JobStatus[] = [
      'IN_PROGRESS',
      'PENDING_ACCEPTANCE',
      'OPEN',
      'COMPLETED',
      'CANCELLED',
      'DISPUTED',
      'EXPIRED',
    ];

    for (const status of invalidStatuses) {
      const result = transitionCheckIn({
        bookingId: 'booking-chk-002',
        currentJobStatus: status,
        currentDispatchStatus: 'ARRIVED',
        escrowStatus: 'held_in_escrow',
        jobCoordinates: JOB_SITE_COORDINATES,
        snapshot: VALID_SNAPSHOT,
        permissionState: 'granted',
        config: DEFAULT_CONFIG,
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(['INVALID_TRANSITION', 'STALE_STATE']).toContain(result.reason);
        expect(result.authoritative.jobStatus).toBe(status);
      }
    }

    // Module boundary: checkin.ts must import and route transitions through canTransition
    const checkinSource = sourceOf('./checkin.ts');
    expect(checkinSource).toMatch(/canTransition/);
  });

  // ---------------------------------------------------------------------------
  // CHK-003: actualStartAt written by the authority
  // ---------------------------------------------------------------------------
  it('CHK-003: actualStartAt written by the authority', () => {
    const authoritativeTime = '2026-10-15T10:15:00.000Z';

    const result = transitionCheckIn({
      bookingId: 'booking-chk-003',
      currentJobStatus: 'CONFIRMED',
      currentDispatchStatus: 'ARRIVED',
      escrowStatus: 'held_in_escrow',
      jobCoordinates: JOB_SITE_COORDINATES,
      snapshot: VALID_SNAPSHOT,
      permissionState: 'granted',
      now: authoritativeTime,
      config: DEFAULT_CONFIG,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.actualStartAt).toBe(authoritativeTime);
      expect(result.event.timestamp).toBe(authoritativeTime);
    }

    const defaultResult = transitionCheckIn({
      bookingId: 'booking-chk-003',
      currentJobStatus: 'CONFIRMED',
      currentDispatchStatus: 'ARRIVED',
      escrowStatus: 'held_in_escrow',
      jobCoordinates: JOB_SITE_COORDINATES,
      snapshot: VALID_SNAPSHOT,
      permissionState: 'granted',
      config: DEFAULT_CONFIG,
    });

    expect(defaultResult.ok).toBe(true);
    if (defaultResult.ok) {
      expect(new Date(defaultResult.actualStartAt).toISOString()).toBe(
        defaultResult.actualStartAt
      );
    }
  });

  // ---------------------------------------------------------------------------
  // CHK-004: out-of-range snapshot refused, prior state retained
  // ---------------------------------------------------------------------------
  it('CHK-004: out-of-range snapshot refused, prior state retained', () => {
    // 0.05 degrees away is ~5.5 kilometers away
    const farSnapshot: LocationSnapshot = {
      latitude: JOB_SITE_COORDINATES.latitude + 0.05,
      longitude: JOB_SITE_COORDINATES.longitude + 0.05,
      accuracyMeters: 10,
    };

    const result = transitionCheckIn({
      bookingId: 'booking-chk-004',
      currentJobStatus: 'CONFIRMED',
      currentDispatchStatus: 'ARRIVED',
      escrowStatus: 'held_in_escrow',
      jobCoordinates: JOB_SITE_COORDINATES,
      snapshot: farSnapshot,
      permissionState: 'granted',
      config: DEFAULT_CONFIG,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe('LOCATION_OUT_OF_RANGE');
      expect(result.authoritative).toEqual({
        jobStatus: 'CONFIRMED',
        dispatchStatus: 'ARRIVED',
        escrowStatus: 'held_in_escrow',
      });
    }
  });

  // ---------------------------------------------------------------------------
  // CHK-005: unusable accuracy refused
  // ---------------------------------------------------------------------------
  it('CHK-005: unusable accuracy refused', () => {
    // 80 meters accuracy is worse than max acceptable accuracy of 30 meters
    const lowAccuracySnapshot: LocationSnapshot = {
      latitude: JOB_SITE_COORDINATES.latitude,
      longitude: JOB_SITE_COORDINATES.longitude,
      accuracyMeters: 80,
    };

    const result = transitionCheckIn({
      bookingId: 'booking-chk-005',
      currentJobStatus: 'CONFIRMED',
      currentDispatchStatus: 'ARRIVED',
      escrowStatus: 'held_in_escrow',
      jobCoordinates: JOB_SITE_COORDINATES,
      snapshot: lowAccuracySnapshot,
      permissionState: 'granted',
      config: DEFAULT_CONFIG,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe('LOCATION_ACCURACY_TOO_LOW');
      expect(result.authoritative).toEqual({
        jobStatus: 'CONFIRMED',
        dispatchStatus: 'ARRIVED',
        escrowStatus: 'held_in_escrow',
      });
    }
  });

  // ---------------------------------------------------------------------------
  // CHK-006: denied or unavailable permission refused with a distinct code
  // ---------------------------------------------------------------------------
  it('CHK-006: denied or unavailable permission refused with a distinct code', () => {
    // Denied permission
    const deniedResult = transitionCheckIn({
      bookingId: 'booking-chk-006',
      currentJobStatus: 'CONFIRMED',
      currentDispatchStatus: 'ARRIVED',
      escrowStatus: 'held_in_escrow',
      jobCoordinates: JOB_SITE_COORDINATES,
      snapshot: null,
      permissionState: 'denied',
      config: DEFAULT_CONFIG,
    });

    expect(deniedResult.ok).toBe(false);
    if (!deniedResult.ok) {
      expect(deniedResult.reason).toBe('LOCATION_UNAVAILABLE');
      expect(deniedResult.authoritative.jobStatus).toBe('CONFIRMED');
    }

    // Unavailable device location
    const unavailableResult = transitionCheckIn({
      bookingId: 'booking-chk-006',
      currentJobStatus: 'CONFIRMED',
      currentDispatchStatus: 'ARRIVED',
      escrowStatus: 'held_in_escrow',
      jobCoordinates: JOB_SITE_COORDINATES,
      snapshot: null,
      permissionState: 'unavailable',
      config: DEFAULT_CONFIG,
    });

    expect(unavailableResult.ok).toBe(false);
    if (!unavailableResult.ok) {
      expect(unavailableResult.reason).toBe('LOCATION_UNAVAILABLE');
    }
  });

  // ---------------------------------------------------------------------------
  // CHK-007: escrow not held refused
  // ---------------------------------------------------------------------------
  it('CHK-007: escrow not held refused', () => {
    const nonHeldStatuses: EscrowStatus[] = [
      'unfunded',
      'release_pending',
      'released',
      'release_failed',
      'disputed',
      'refund_pending',
      'refunded',
      'refund_failed',
    ];

    for (const escrowStatus of nonHeldStatuses) {
      const result = transitionCheckIn({
        bookingId: 'booking-chk-007',
        currentJobStatus: 'CONFIRMED',
        currentDispatchStatus: 'ARRIVED',
        escrowStatus,
        jobCoordinates: JOB_SITE_COORDINATES,
        snapshot: VALID_SNAPSHOT,
        permissionState: 'granted',
        config: DEFAULT_CONFIG,
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.reason).toBe('ESCROW_NOT_HELD');
        expect(result.authoritative).toEqual({
          jobStatus: 'CONFIRMED',
          dispatchStatus: 'ARRIVED',
          escrowStatus,
        });
      }
    }
  });

  // ---------------------------------------------------------------------------
  // CHK-008: check-in refused when jobStatus is not CONFIRMED
  // ---------------------------------------------------------------------------
  it('CHK-008: check-in refused when jobStatus is not CONFIRMED', () => {
    const nonConfirmed: JobStatus[] = [
      'IN_PROGRESS',
      'PENDING_ACCEPTANCE',
      'OPEN',
      'COMPLETED',
      'CANCELLED',
      'DISPUTED',
    ];

    for (const jobStatus of nonConfirmed) {
      const result = transitionCheckIn({
        bookingId: 'booking-chk-008',
        currentJobStatus: jobStatus,
        currentDispatchStatus: jobStatus === 'IN_PROGRESS' ? 'ARRIVED' : 'NOT_STARTED',
        escrowStatus: 'held_in_escrow',
        jobCoordinates: JOB_SITE_COORDINATES,
        snapshot: VALID_SNAPSHOT,
        permissionState: 'granted',
        config: DEFAULT_CONFIG,
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(['INVALID_TRANSITION', 'STALE_STATE']).toContain(result.reason);
        expect(result.authoritative.jobStatus).toBe(jobStatus);
      }
    }
  });

  // ---------------------------------------------------------------------------
  // CHK-009: no client-supplied threshold is trusted
  // ---------------------------------------------------------------------------
  it('CHK-009: no client-supplied threshold is trusted', () => {
    // 500 meters away from job site
    const snapshotAt500m: LocationSnapshot = {
      latitude: JOB_SITE_COORDINATES.latitude + 0.0045,
      longitude: JOB_SITE_COORDINATES.longitude,
      accuracyMeters: 10,
    };

    // Client attempts to pass a fabricated threshold in input options
    const clientPayloadWithFakeThreshold = {
      bookingId: 'booking-chk-009',
      currentJobStatus: 'CONFIRMED' as const,
      currentDispatchStatus: 'ARRIVED' as const,
      escrowStatus: 'held_in_escrow' as const,
      jobCoordinates: JOB_SITE_COORDINATES,
      snapshot: snapshotAt500m,
      permissionState: 'granted' as const,
      // Authority configuration strictly overrides any client-side claims
      config: {
        proximityThresholdMeters: 100,
        maxAccuracyMeters: 25,
      },
      clientClaimedThreshold: 1000,
    };

    const result = transitionCheckIn(clientPayloadWithFakeThreshold);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe('LOCATION_OUT_OF_RANGE');
    }
  });

  // ---------------------------------------------------------------------------
  // CHK-010: no continuous tracking or watchPosition retention
  // ---------------------------------------------------------------------------
  it('CHK-010: no continuous tracking or watchPosition retention', () => {
    const result = transitionCheckIn({
      bookingId: 'booking-chk-010',
      currentJobStatus: 'CONFIRMED',
      currentDispatchStatus: 'ARRIVED',
      escrowStatus: 'held_in_escrow',
      jobCoordinates: JOB_SITE_COORDINATES,
      snapshot: VALID_SNAPSHOT,
      permissionState: 'granted',
      config: DEFAULT_CONFIG,
    });

    expect(result.ok).toBe(true);

    // Architectural boundary checks
    const checkinSource = sourceOf('./checkin.ts');
    expect(checkinSource).not.toMatch(/watchPosition/);
    expect(checkinSource).not.toMatch(/navigator\.geolocation/);
    expect(checkinSource).not.toMatch(/setInterval/);
  });

  // ---------------------------------------------------------------------------
  // CHK-011: the financial prerequisite is read from EscrowStatus, never inferred from CONFIRMED or IN_PROGRESS
  // ---------------------------------------------------------------------------
  it('CHK-011: the financial prerequisite is read from EscrowStatus, never inferred from CONFIRMED or IN_PROGRESS', () => {
    // Both calls have jobStatus === 'CONFIRMED', but different escrowStatus
    const funded = transitionCheckIn({
      bookingId: 'booking-chk-011-funded',
      currentJobStatus: 'CONFIRMED',
      currentDispatchStatus: 'ARRIVED',
      escrowStatus: 'held_in_escrow',
      jobCoordinates: JOB_SITE_COORDINATES,
      snapshot: VALID_SNAPSHOT,
      permissionState: 'granted',
      config: DEFAULT_CONFIG,
    });

    const unfunded = transitionCheckIn({
      bookingId: 'booking-chk-011-unfunded',
      currentJobStatus: 'CONFIRMED',
      currentDispatchStatus: 'ARRIVED',
      escrowStatus: 'unfunded',
      jobCoordinates: JOB_SITE_COORDINATES,
      snapshot: VALID_SNAPSHOT,
      permissionState: 'granted',
      config: DEFAULT_CONFIG,
    });

    expect(funded.ok).toBe(true);
    expect(unfunded.ok).toBe(false);
    if (!unfunded.ok) {
      expect(unfunded.reason).toBe('ESCROW_NOT_HELD');
    }
  });

  // ---------------------------------------------------------------------------
  // CHK-012: check-in never writes escrow, payment, refund, or payout state
  // ---------------------------------------------------------------------------
  it('CHK-012: check-in never writes escrow, payment, refund, or payout state', () => {
    const result = transitionCheckIn({
      bookingId: 'booking-chk-012',
      currentJobStatus: 'CONFIRMED',
      currentDispatchStatus: 'ARRIVED',
      escrowStatus: 'held_in_escrow',
      jobCoordinates: JOB_SITE_COORDINATES,
      snapshot: VALID_SNAPSHOT,
      permissionState: 'granted',
      config: DEFAULT_CONFIG,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      // Must not mutate payment or escrow fields
      expect(result).not.toHaveProperty('escrowStatus');
      expect(result).not.toHaveProperty('paymentStatus');
      expect(result).not.toHaveProperty('refundAmount');
      expect(result).not.toHaveProperty('payoutAmount');
    }

    const checkinSource = sourceOf('./checkin.ts');
    expect(checkinSource).not.toMatch(/from\s+['"][^'"]*payment\/repository/);
  });

  // ---------------------------------------------------------------------------
  // CHK-013: an unfunded CONFIRMED booking fails closed with ESCROW_NOT_HELD and preserves prior state
  // ---------------------------------------------------------------------------
  it('CHK-013: an unfunded CONFIRMED booking fails closed with ESCROW_NOT_HELD and preserves prior state', () => {
    const result = transitionCheckIn({
      bookingId: 'booking-chk-013',
      currentJobStatus: 'CONFIRMED',
      currentDispatchStatus: 'ARRIVED',
      escrowStatus: 'unfunded',
      jobCoordinates: JOB_SITE_COORDINATES,
      snapshot: VALID_SNAPSHOT,
      permissionState: 'granted',
      config: DEFAULT_CONFIG,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe('ESCROW_NOT_HELD');
      expect(result.authoritative).toEqual({
        jobStatus: 'CONFIRMED',
        dispatchStatus: 'ARRIVED',
        escrowStatus: 'unfunded',
      });
    }
  });

  // ---------------------------------------------------------------------------
  // CHK-014: the proximity threshold is read from authority configuration and no module hardcodes a radius
  // ---------------------------------------------------------------------------
  it('CHK-014: the proximity threshold is read from authority configuration and no module hardcodes a radius', () => {
    // Coordinate ~250m away from job site
    const snapshotAt250m: LocationSnapshot = {
      latitude: JOB_SITE_COORDINATES.latitude + 0.00225,
      longitude: JOB_SITE_COORDINATES.longitude,
      accuracyMeters: 10,
    };

    // With a 300m authority threshold, this succeeds
    const resultLenient = transitionCheckIn({
      bookingId: 'booking-chk-014',
      currentJobStatus: 'CONFIRMED',
      currentDispatchStatus: 'ARRIVED',
      escrowStatus: 'held_in_escrow',
      jobCoordinates: JOB_SITE_COORDINATES,
      snapshot: snapshotAt250m,
      permissionState: 'granted',
      config: { proximityThresholdMeters: 300, maxAccuracyMeters: 30 },
    });

    // With a 200m authority threshold, this fails closed
    const resultStrict = transitionCheckIn({
      bookingId: 'booking-chk-014',
      currentJobStatus: 'CONFIRMED',
      currentDispatchStatus: 'ARRIVED',
      escrowStatus: 'held_in_escrow',
      jobCoordinates: JOB_SITE_COORDINATES,
      snapshot: snapshotAt250m,
      permissionState: 'granted',
      config: { proximityThresholdMeters: 200, maxAccuracyMeters: 30 },
    });

    expect(resultLenient.ok).toBe(true);
    expect(resultStrict.ok).toBe(false);
    if (!resultStrict.ok) {
      expect(resultStrict.reason).toBe('LOCATION_OUT_OF_RANGE');
    }
  });

  // ---------------------------------------------------------------------------
  // CHK-015: no test asserts 200 meters as a fixed platform fact and no UI copy states a radius
  // ---------------------------------------------------------------------------
  it('CHK-015: no test asserts 200 meters as a fixed platform fact and no UI copy states a radius', () => {
    const result = transitionCheckIn({
      bookingId: 'booking-chk-015',
      currentJobStatus: 'CONFIRMED',
      currentDispatchStatus: 'ARRIVED',
      escrowStatus: 'held_in_escrow',
      jobCoordinates: JOB_SITE_COORDINATES,
      snapshot: VALID_SNAPSHOT,
      permissionState: 'granted',
      config: DEFAULT_CONFIG,
    });

    expect(result.ok).toBe(true);

    // Architectural boundary checks (ARCH s8, OWNER decision 1 remains open)
    const checkinSource = sourceOf('./checkin.ts');
    expect(checkinSource).not.toMatch(/const\s+PROXIMITY_THRESHOLD\s*=\s*200/);
    expect(checkinSource).not.toMatch(/from\s+['"][^'"]*testing/);
  });
});
