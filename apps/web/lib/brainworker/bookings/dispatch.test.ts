// apps/web/lib/brainworker/bookings/dispatch.test.ts
// BW-004 Phase 3 RED: Dispatch Tracking (DIS-001 to DIS-008)
// Governed by:
//   docs/specs/BW-004-architecture-contract.md (sections 5, 7, 10, 14, 16)
//   docs/specs/BW-004-booking-management.md (D5, D6, D8)
//   docs/specs/BW-004-test-first-implementation-plan.md (Phase 3)
//
// Invariant Rules:
// 1. Dispatch status is forward-only: NOT_STARTED -> EN_ROUTE -> ARRIVED, or NOT_STARTED -> ARRIVED.
// 2. Dispatch can only be authored while jobStatus === 'CONFIRMED'.
// 3. Once check-in moves the booking to IN_PROGRESS, dispatch freezes as historical evidence.
// 4. Timestamps are authoritative, never client-authored.
// 5. Optional location snapshot is stored on arrival, absent on en route.
// 6. Dispatch updates emit domain events only (DISPATCH_UPDATED); zero notification records are written.
// 7. Zero imports from testing/ (REP-010).

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { JobStatus } from '@bukiebrainjobs/api-types';
import {
  transitionDispatch,
  type DispatchTransitionInput,
} from './dispatch';
import type { LocationSnapshot } from './types';

const sourceOf = (file: string): string =>
  readFileSync(fileURLToPath(new URL(file, import.meta.url)), 'utf8');

const FIXTURE_SNAPSHOT: LocationSnapshot = {
  latitude: 6.5244,
  longitude: 3.3792,
  accuracyMeters: 12,
};

describe('BW-004 Phase 3: Dispatch Tracking (DIS-001 to DIS-008)', () => {
  // ---------------------------------------------------------------------------
  // DIS-001: mark en route from CONFIRMED
  // ---------------------------------------------------------------------------
  it('DIS-001: mark en route from CONFIRMED', () => {
    const input: DispatchTransitionInput = {
      bookingId: 'booking-001',
      currentJobStatus: 'CONFIRMED',
      currentDispatchStatus: 'NOT_STARTED',
      nextDispatchStatus: 'EN_ROUTE',
    };

    const result = transitionDispatch(input);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.dispatchStatus).toBe('EN_ROUTE');
      expect(result.dispatchUpdatedAt).toBeDefined();
      expect(result.event).toEqual({
        type: 'DISPATCH_UPDATED',
        bookingId: 'booking-001',
        dispatchStatus: 'EN_ROUTE',
        timestamp: result.dispatchUpdatedAt,
      });
    }
  });

  // ---------------------------------------------------------------------------
  // DIS-002: mark arrived from CONFIRMED
  // ---------------------------------------------------------------------------
  it('DIS-002: mark arrived from CONFIRMED', () => {
    const input: DispatchTransitionInput = {
      bookingId: 'booking-001',
      currentJobStatus: 'CONFIRMED',
      currentDispatchStatus: 'EN_ROUTE',
      nextDispatchStatus: 'ARRIVED',
    };

    const result = transitionDispatch(input);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.dispatchStatus).toBe('ARRIVED');
      expect(result.dispatchUpdatedAt).toBeDefined();
      expect(result.event).toEqual({
        type: 'DISPATCH_UPDATED',
        bookingId: 'booking-001',
        dispatchStatus: 'ARRIVED',
        timestamp: result.dispatchUpdatedAt,
      });
    }
  });

  // ---------------------------------------------------------------------------
  // DIS-003: direct NOT_STARTED -> ARRIVED permitted
  // ---------------------------------------------------------------------------
  it('DIS-003: direct NOT_STARTED -> ARRIVED permitted', () => {
    const input: DispatchTransitionInput = {
      bookingId: 'booking-001',
      currentJobStatus: 'CONFIRMED',
      currentDispatchStatus: 'NOT_STARTED',
      nextDispatchStatus: 'ARRIVED',
    };

    const result = transitionDispatch(input);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.dispatchStatus).toBe('ARRIVED');
      expect(result.dispatchUpdatedAt).toBeDefined();
      expect(result.event).toEqual({
        type: 'DISPATCH_UPDATED',
        bookingId: 'booking-001',
        dispatchStatus: 'ARRIVED',
        timestamp: result.dispatchUpdatedAt,
      });
    }
  });

  // ---------------------------------------------------------------------------
  // DIS-004: no backward transition
  // ---------------------------------------------------------------------------
  it('DIS-004: no backward transition', () => {
    // Attempting ARRIVED -> EN_ROUTE must be refused
    const backwardFromArrived = transitionDispatch({
      bookingId: 'booking-001',
      currentJobStatus: 'CONFIRMED',
      currentDispatchStatus: 'ARRIVED',
      nextDispatchStatus: 'EN_ROUTE',
    });

    expect(backwardFromArrived.ok).toBe(false);
    if (!backwardFromArrived.ok) {
      expect(backwardFromArrived.reason).toBe('INVALID_TRANSITION');
      expect(backwardFromArrived.authoritative).toEqual({
        jobStatus: 'CONFIRMED',
        dispatchStatus: 'ARRIVED',
      });
    }
  });

  // ---------------------------------------------------------------------------
  // DIS-005: dispatch update refused when jobStatus is not CONFIRMED
  // ---------------------------------------------------------------------------
  it('DIS-005: dispatch update refused when jobStatus is not CONFIRMED', () => {
    const nonConfirmedStatuses: JobStatus[] = [
      'IN_PROGRESS',
      'PENDING_ACCEPTANCE',
      'OPEN',
      'COMPLETED',
      'CANCELLED',
      'DISPUTED',
    ];

    for (const status of nonConfirmedStatuses) {
      const result = transitionDispatch({
        bookingId: 'booking-001',
        currentJobStatus: status,
        currentDispatchStatus: status === 'IN_PROGRESS' ? 'ARRIVED' : 'NOT_STARTED',
        nextDispatchStatus: 'EN_ROUTE',
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.reason).toBe('STALE_STATE');
        expect(result.authoritative.jobStatus).toBe(status);
      }
    }
  });

  // ---------------------------------------------------------------------------
  // DIS-006: authoritative timestamp recorded, never client-authored
  // ---------------------------------------------------------------------------
  it('DIS-006: authoritative timestamp recorded, never client-authored', () => {
    const authoritativeTime = '2026-10-14T20:00:00.000Z';

    const result = transitionDispatch({
      bookingId: 'booking-001',
      currentJobStatus: 'CONFIRMED',
      currentDispatchStatus: 'NOT_STARTED',
      nextDispatchStatus: 'EN_ROUTE',
      now: authoritativeTime,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.dispatchUpdatedAt).toBe(authoritativeTime);
      expect(result.event.timestamp).toBe(authoritativeTime);
    }

    const defaultResult = transitionDispatch({
      bookingId: 'booking-001',
      currentJobStatus: 'CONFIRMED',
      currentDispatchStatus: 'NOT_STARTED',
      nextDispatchStatus: 'EN_ROUTE',
    });

    expect(defaultResult.ok).toBe(true);
    if (defaultResult.ok) {
      expect(new Date(defaultResult.dispatchUpdatedAt).toISOString()).toBe(
        defaultResult.dispatchUpdatedAt
      );
    }
  });

  // ---------------------------------------------------------------------------
  // DIS-007: optional snapshot stored on arrival, absent on en route
  // ---------------------------------------------------------------------------
  it('DIS-007: optional snapshot stored on arrival, absent on en route', () => {
    // Arrival with snapshot stores the snapshot
    const arrivedWithSnapshot = transitionDispatch({
      bookingId: 'booking-001',
      currentJobStatus: 'CONFIRMED',
      currentDispatchStatus: 'EN_ROUTE',
      nextDispatchStatus: 'ARRIVED',
      snapshot: FIXTURE_SNAPSHOT,
    });

    expect(arrivedWithSnapshot.ok).toBe(true);
    if (arrivedWithSnapshot.ok) {
      expect(arrivedWithSnapshot.arrivalSnapshot).toEqual(FIXTURE_SNAPSHOT);
    }

    // Arrival without snapshot succeeds with undefined snapshot
    const arrivedWithoutSnapshot = transitionDispatch({
      bookingId: 'booking-001',
      currentJobStatus: 'CONFIRMED',
      currentDispatchStatus: 'EN_ROUTE',
      nextDispatchStatus: 'ARRIVED',
    });

    expect(arrivedWithoutSnapshot.ok).toBe(true);
    if (arrivedWithoutSnapshot.ok) {
      expect(arrivedWithoutSnapshot.arrivalSnapshot).toBeUndefined();
    }

    // En route discards any snapshot provided
    const enRouteWithSnapshot = transitionDispatch({
      bookingId: 'booking-001',
      currentJobStatus: 'CONFIRMED',
      currentDispatchStatus: 'NOT_STARTED',
      nextDispatchStatus: 'EN_ROUTE',
      snapshot: FIXTURE_SNAPSHOT,
    });

    expect(enRouteWithSnapshot.ok).toBe(true);
    if (enRouteWithSnapshot.ok) {
      expect(enRouteWithSnapshot.arrivalSnapshot).toBeUndefined();
    }
  });

  // ---------------------------------------------------------------------------
  // DIS-008: dispatch update emits a domain event, no notification delivery
  // ---------------------------------------------------------------------------
  it('DIS-008: dispatch update emits a domain event, no notification delivery', () => {
    const result = transitionDispatch({
      bookingId: 'booking-001',
      currentJobStatus: 'CONFIRMED',
      currentDispatchStatus: 'NOT_STARTED',
      nextDispatchStatus: 'EN_ROUTE',
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.event).toEqual({
        type: 'DISPATCH_UPDATED',
        bookingId: 'booking-001',
        dispatchStatus: 'EN_ROUTE',
        timestamp: expect.any(String),
      });
    }

    // Architectural boundary checks
    const dispatchSource = sourceOf('./dispatch.ts');
    expect(dispatchSource).not.toMatch(/from\s+['"][^'"]*notifications/i);
    expect(dispatchSource).not.toMatch(/from\s+['"][^'"]*testing/);
  });
});
