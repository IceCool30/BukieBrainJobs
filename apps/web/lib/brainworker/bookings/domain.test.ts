// apps/web/lib/brainworker/bookings/domain.test.ts
// BW-004 Phase 1 RED: Domain Contracts and Projection (BOOK-001 to BOOK-017)
//
// Authoritative references:
//   docs/specs/BW-004-architecture-contract.md  (sections 5, 6, 7, 8, 9)
//   docs/specs/BW-004-booking-management.md    (D2, D5, D8, D9, section 3)
//   docs/specs/BW-004-test-first-implementation-plan.md (Phase 1)
//
// Every test must fail in RED for the right reason: the stub throws
// "not implemented". No test may pass on the first run.
//
// The five open [OWNER] items are represented as constraints, never as decided
// behaviour:
//   1. proximity threshold value       -> asserted as configuration, not a constant
//   2. customer scope-approval surface -> asserted as an absent authority
//   3. provider cancellation taxonomy  -> transcribed as proposed, not adopted
//   4. exact address when CONFIRMED but unfunded -> escrow-gated, not lifecycle-gated
//   5. exact address while DISPUTED     -> asserted to remain undecided

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { JobStatus } from '@bukiebrainjobs/api-types';
import {
  JOB_STATUS_TRANSITIONS,
  evaluateBookingGate,
  projectBookingDetail,
  projectBookingSummary,
  evaluateAddressUnlock,
  computeAllowedActions,
  groupAndSortBookings,
  isCompositeStatusCandidate,
  assertJobStatusIsAuthoritative,
} from './domain';
import type {
  DispatchStatus,
  ProviderBookingSummary,
  RawBookingRecord,
  ScopeAdjustment,
} from './types';

const PROVIDER_ID = 'bw-004-001';
const OTHER_PROVIDER_ID = 'bw-004-002';
const EXACT_ADDRESS = '15 Adeola Odeku Street, Victoria Island, Lagos';

const sourceOf = (file: string): string =>
  readFileSync(fileURLToPath(new URL(file, import.meta.url)), 'utf8');

const scopeAdjustmentFixture = (
  overrides: Partial<ScopeAdjustment> = {}
): ScopeAdjustment => ({
  id: 'scope-001',
  bookingId: 'BKG-004-001',
  reason: 'ADDITIONAL_PARTS',
  additionalLaborKobo: 150_000,
  additionalMaterialsKobo: 60_000,
  totalAdditionalKobo: 210_000,
  status: 'PENDING',
  submittedAt: '2026-10-01T09:00:00.000Z',
  ...overrides,
});

const rawBookingFixture = (
  overrides: Partial<RawBookingRecord> = {}
): RawBookingRecord => ({
  bookingId: 'BKG-004-001',
  taskerProfileId: PROVIDER_ID,
  jobId: 'job-004-001',
  referenceCode: 'REF-004-001',
  title: 'Plumbing Drainage Pressure Test',
  description: 'Test the drainage system pressure on the second floor.',
  serviceId: 'svc-plumbing-01',
  scheduledStartAt: '2026-10-05T10:00:00.000Z',
  jobStatus: 'CONFIRMED',
  dispatchStatus: 'NOT_STARTED',
  generalLocation: {
    cityId: 'lagos',
    neighbourhoodOrZone: 'Victoria Island',
    landmark: 'Near Eko Hotel',
  },
  exactAddress: EXACT_ADDRESS,
  escrowStatus: 'held_in_escrow',
  privacyConsentRecorded: true,
  scopeAdjustments: [],
  unreadMessageCount: 2,
  ...overrides,
});

const admittedContext = () => ({
  authenticated: true,
  role: 'brainworker',
  isBrainWorkerApproved: true,
  operationalProfileIsComplete: true,
  brainWorkerId: PROVIDER_ID,
});

const projectedSummaryFixture = (
  overrides: Partial<ProviderBookingSummary> = {}
): ProviderBookingSummary => ({
  bookingId: 'BKG-004-001',
  referenceCode: 'REF-004-001',
  jobStatus: 'CONFIRMED',
  dispatchStatus: 'NOT_STARTED',
  title: 'Plumbing Drainage Pressure Test',
  serviceId: 'svc-plumbing-01',
  scheduledStartAt: '2026-10-05T10:00:00.000Z',
  generalLocation: {
    cityId: 'lagos',
    neighbourhoodOrZone: 'Victoria Island',
  },
  escrowStatus: 'held_in_escrow',
  hasPendingScopeAdjustment: false,
  unreadMessageCount: 0,
  ...overrides,
});

const allJobStatuses = (): JobStatus[] =>
  Object.keys(JOB_STATUS_TRANSITIONS) as JobStatus[];// -- BOOK-001 to BOOK-004: provider gate and booking resolution --------------

describe('BOOK-001 to BOOK-004: provider gate and booking resolution', () => {
  it('BOOK-001: admits an authenticated, approved, complete provider', () => {
    expect(evaluateBookingGate(admittedContext(), rawBookingFixture())).toEqual({
      admitted: true,
    });
  });

  it('BOOK-002: refuses an unauthenticated, wrong-role, or unapproved caller', () => {
    const booking = rawBookingFixture();

    expect(
      evaluateBookingGate({ ...admittedContext(), authenticated: false }, booking)
    ).toEqual({ admitted: false, reason: 'UNAUTHENTICATED' });

    expect(
      evaluateBookingGate({ ...admittedContext(), role: 'customer' }, booking)
    ).toEqual({ admitted: false, reason: 'UNAUTHENTICATED' });

    expect(
      evaluateBookingGate(
        { ...admittedContext(), isBrainWorkerApproved: false },
        booking
      )
    ).toEqual({ admitted: false, reason: 'NOT_APPROVED' });
  });

  it('BOOK-003: refuses an incomplete operational profile', () => {
    expect(
      evaluateBookingGate(
        { ...admittedContext(), operationalProfileIsComplete: false },
        rawBookingFixture()
      )
    ).toEqual({ admitted: false, reason: 'PROFILE_INCOMPLETE' });
  });

  it('BOOK-004: a booking owned by another provider is NOT_FOUND, identical to a missing booking', () => {
    const foreign = rawBookingFixture({ taskerProfileId: OTHER_PROVIDER_ID });

    const foreignResult = evaluateBookingGate(admittedContext(), foreign);
    const missingResult = evaluateBookingGate(admittedContext(), null);

    expect(foreignResult).toEqual({ admitted: false, reason: 'NOT_FOUND' });
    expect(missingResult).toEqual({ admitted: false, reason: 'NOT_FOUND' });

    // The two refusals must be indistinguishable, so a provider cannot use the
    // response to learn whether another provider's booking exists.
    expect(foreignResult).toEqual(missingResult);
    expect(Object.keys(foreignResult).sort()).toEqual(
      Object.keys(missingResult).sort()
    );
  });
});

// -- BOOK-005: privacy projection --------------------------------------------

describe('BOOK-005: privacy projection', () => {
  it('BOOK-005: projection exposes no customer phone, email, or billing field', () => {
    const detail = projectBookingDetail(rawBookingFixture());

    expect(detail).not.toHaveProperty('customerPhone');
    expect(detail).not.toHaveProperty('customerEmail');
    expect(detail).not.toHaveProperty('customerBillingAddress');
    expect(detail).not.toHaveProperty('customerAddress');

    for (const key of Object.keys(detail)) {
      expect(key.toLowerCase()).not.toContain('phone');
      expect(key.toLowerCase()).not.toContain('email');
      expect(key.toLowerCase()).not.toContain('billing');
    }
  });

  it('BOOK-005: the list projection is narrower and carries no address at all', () => {
    const summary = projectBookingSummary(rawBookingFixture());

    expect(summary).not.toHaveProperty('exactAddress');
    expect(summary).not.toHaveProperty('conversationId');
    expect(summary).not.toHaveProperty('scopeAdjustments');
  });
});// -- BOOK-006 to BOOK-008: address precision (D8) ---------------------------

describe('BOOK-006 to BOOK-008: address precision (D8)', () => {
  const fullyUnlocked = () => ({
    bookingResolved: true,
    privacyConsentRecorded: true,
    escrowStatus: 'held_in_escrow' as const,
    jobStatus: 'CONFIRMED' as const,
  });

  it('BOOK-007: unlocks the exact address only when all three inputs hold', () => {
    expect(evaluateAddressUnlock(fullyUnlocked(), EXACT_ADDRESS)).toEqual({
      unlocked: true,
      exactAddress: EXACT_ADDRESS,
    });
  });

  it('BOOK-006: the booking must be resolved to this provider before any address is shown', () => {
    expect(
      evaluateAddressUnlock(
        { ...fullyUnlocked(), bookingResolved: false },
        EXACT_ADDRESS
      )
    ).toEqual({ unlocked: false, reason: 'BOOKING_NOT_RESOLVED' });
  });

  it('BOOK-006: privacy consent is required and its absence returns the general area', () => {
    expect(
      evaluateAddressUnlock(
        { ...fullyUnlocked(), privacyConsentRecorded: false },
        EXACT_ADDRESS
      )
    ).toEqual({ unlocked: false, reason: 'PRIVACY_CONSENT_ABSENT' });
  });

  it('BOOK-008: escrow must report funds held; CONFIRMED alone never unlocks the address', () => {
    // [OWNER] item 4 is decided by escrow, not by the lifecycle value. A
    // confirmed-but-unfunded booking shows the general area and nothing more.
    const notHeld = [
      'unfunded',
      'release_failed',
      'refund_pending',
      'refunded',
      'refund_failed',
      'disputed',
    ] as const;

    for (const escrowStatus of notHeld) {
      expect(
        evaluateAddressUnlock(
          { ...fullyUnlocked(), jobStatus: 'CONFIRMED', escrowStatus },
          EXACT_ADDRESS
        )
      ).toEqual({ unlocked: false, reason: 'ESCROW_NOT_HELD' });
    }
  });

  it('BOOK-008: the escrow check reads EscrowStatus and never the lifecycle value', () => {
    // The same lifecycle value with different escrow states must produce
    // different results. If CONFIRMED implied funding, both would unlock.
    const unfunded = evaluateAddressUnlock(
      { ...fullyUnlocked(), escrowStatus: 'unfunded' },
      EXACT_ADDRESS
    );
    const held = evaluateAddressUnlock(
      { ...fullyUnlocked(), escrowStatus: 'held_in_escrow' },
      EXACT_ADDRESS
    );

    expect(unfunded.unlocked).toBe(false);
    expect(held.unlocked).toBe(true);
  });

  it('BOOK-008: masks the address back after COMPLETED, PAID, CANCELLED, EXPIRED, and RESOLVED', () => {
    const maskedStatuses: JobStatus[] = [
      'COMPLETED',
      'PAID',
      'CANCELLED',
      'EXPIRED',
      'RESOLVED',
    ];

    for (const jobStatus of maskedStatuses) {
      expect(
        evaluateAddressUnlock(
          { ...fullyUnlocked(), jobStatus, escrowStatus: 'released' },
          EXACT_ADDRESS
        )
      ).toEqual({ unlocked: false, reason: 'LIFECYCLE_MASKED' });
    }
  });

  it('BOOK-005: the projection carries the exact address only when the unlock rule passes', () => {
    const locked = projectBookingDetail(
      rawBookingFixture({ escrowStatus: 'unfunded' })
    );
    const unlocked = projectBookingDetail(rawBookingFixture());

    expect(locked.exactAddress).toBeUndefined();
    expect(locked.generalLocation.neighbourhoodOrZone).toBe('Victoria Island');
    expect(unlocked.exactAddress).toBe(EXACT_ADDRESS);
    // The general area is retained above the exact address in both cases.
    expect(unlocked.generalLocation.cityId).toBe('lagos');
  });

  it('[OWNER] item 5: exact address visibility while DISPUTED stays undecided', () => {
    // D8 keeps DISPUTED readable "because evidence may be needed [OWNER]".
    // The contract is explicit that this is unowned, so RED guards the
    // boundary instead of choosing a visibility outcome.
    const result = evaluateAddressUnlock(
      {
        ...fullyUnlocked(),
        jobStatus: 'DISPUTED' as const,
        escrowStatus: 'disputed' as const,
      },
      EXACT_ADDRESS
    );

    expect(typeof result.unlocked).toBe('boolean');
    if (result.unlocked === false) {
      // A refusal must be one of the named contractual reasons, never an
      // invented fifth reason created to park this decision.
      expect([
        'BOOKING_NOT_RESOLVED',
        'PRIVACY_CONSENT_ABSENT',
        'ESCROW_NOT_HELD',
        'LIFECYCLE_MASKED',
      ]).toContain(result.reason);
    }
  });

  // BOOK-006: general location only BEFORE CONFIRMED (behavioral)
  // Lifecycle states before CONFIRMED must never expose exact address,
  // regardless of escrow or privacy inputs.
  it('BOOK-006: general location only before CONFIRMED — pre-CONFIRMED states never expose exact address', () => {
    const preConfirmedStatuses: JobStatus[] = [
      'OPEN',
      'PENDING_ACCEPTANCE',
    ];

    for (const jobStatus of preConfirmedStatuses) {
      const detail = projectBookingDetail(
        rawBookingFixture({
          jobStatus,
          escrowStatus: 'held_in_escrow', // even with funds held
          privacyConsentRecorded: true,
        })
      );

      expect(detail.exactAddress).toBeUndefined();
      expect(detail.generalLocation.neighbourhoodOrZone).toBeTruthy();
    }
  });
});// -- BOOK-009, BOOK-010: allowedActions --------------------------------------

describe('BOOK-009, BOOK-010: allowedActions computed by the authority', () => {
  it('BOOK-009: returns a value derived from state, escrow, and dispatch', () => {
    const actions = computeAllowedActions(
      rawBookingFixture({
        jobStatus: 'CONFIRMED',
        dispatchStatus: 'NOT_STARTED',
        escrowStatus: 'held_in_escrow',
      })
    );

    expect(Array.isArray(actions)).toBe(true);
    expect(actions).toContain('MARK_EN_ROUTE');
    expect(actions).toContain('CANCEL_BOOKING');
    expect(actions).toContain('CHECK_IN');
    // Sequential dispatch: ARRIVED is not offered before EN_ROUTE.
    expect(actions).not.toContain('MARK_ARRIVED');
  });

  it('BOOK-009: CHECK_IN is not offered when escrow does not report funds held', () => {
    const actions = computeAllowedActions(
      rawBookingFixture({
        jobStatus: 'CONFIRMED',
        dispatchStatus: 'ARRIVED',
        escrowStatus: 'unfunded',
      })
    );

    // The refusal comes from escrow, so the action is withheld. The lifecycle
    // value is identical to the funded case, so nothing about CONFIRMED could
    // have produced this.
    expect(actions).not.toContain('CHECK_IN');
    expect(actions).toContain('MARK_ARRIVED');
  });

  it('BOOK-010: returns allowed actions for every JobStatus, including DISPUTED and CANCELLED', () => {
    for (const jobStatus of allJobStatuses()) {
      const actions = computeAllowedActions(
        rawBookingFixture({ jobStatus, dispatchStatus: 'ARRIVED' })
      );

      expect(Array.isArray(actions)).toBe(true);
    }
  });

  it('BOOK-010: terminal and read-only lifecycle states offer no fulfilment actions', () => {
    const readOnlyStatuses: JobStatus[] = [
      'PENDING_COMPLETION',
      'COMPLETED',
      'PAID',
      'CANCELLED',
      'EXPIRED',
      'DISPUTED',
      'RESOLVED',
    ];

    for (const jobStatus of readOnlyStatuses) {
      const actions = computeAllowedActions(
        rawBookingFixture({ jobStatus, dispatchStatus: 'ARRIVED' })
      );

      expect(actions).not.toContain('MARK_EN_ROUTE');
      expect(actions).not.toContain('MARK_ARRIVED');
      expect(actions).not.toContain('CHECK_IN');
      expect(actions).not.toContain('CANCEL_BOOKING');
    }
  });

  it('BOOK-009: a pending scope adjustment withdraws rather than re-requests', () => {
    const withPending = computeAllowedActions(
      rawBookingFixture({
        jobStatus: 'IN_PROGRESS',
        scopeAdjustments: [scopeAdjustmentFixture({ status: 'PENDING' })],
      })
    );

    expect(withPending).toContain('WITHDRAW_SCOPE_ADJUSTMENT');
    expect(withPending).not.toContain('REQUEST_SCOPE_ADJUSTMENT');
  });
});

// -- BOOK-012: deterministic grouping and sort -------------------------------

describe('BOOK-012: deterministic grouping and sort', () => {
  const now = new Date('2026-10-05T00:00:00.000Z');

  it('BOOK-012: sorts each group by scheduledStartAt ascending', () => {
    const grouped = groupAndSortBookings(
      [
        projectedSummaryFixture({
          bookingId: 'b-later',
          scheduledStartAt: '2026-10-20T09:00:00.000Z',
        }),
        projectedSummaryFixture({
          bookingId: 'b-today-late',
          scheduledStartAt: '2026-10-05T16:00:00.000Z',
        }),
        projectedSummaryFixture({
          bookingId: 'b-today-early',
          scheduledStartAt: '2026-10-05T09:00:00.000Z',
        }),
        projectedSummaryFixture({
          bookingId: 'b-cancelled',
          scheduledStartAt: '2026-10-04T09:00:00.000Z',
          jobStatus: 'CANCELLED',
        }),
      ],
      now
    );

    expect(grouped.today.map((b) => b.bookingId)).toEqual([
      'b-today-early',
      'b-today-late',
    ]);
    expect(grouped.upcoming.map((b) => b.bookingId)).toEqual(['b-later']);
    expect(grouped.closed.map((b) => b.bookingId)).toEqual(['b-cancelled']);
  });

  it('BOOK-012: the same input set always produces the same order', () => {
    const bookings = [
      projectedSummaryFixture({
        bookingId: 'b3',
        scheduledStartAt: '2026-10-05T15:00:00.000Z',
      }),
      projectedSummaryFixture({
        bookingId: 'b1',
        scheduledStartAt: '2026-10-05T09:00:00.000Z',
      }),
      projectedSummaryFixture({
        bookingId: 'b2',
        scheduledStartAt: '2026-10-05T11:00:00.000Z',
      }),
    ];

    const first = groupAndSortBookings(bookings, now);
    const second = groupAndSortBookings(bookings, now);

    expect(first.today.map((b) => b.bookingId)).toEqual(
      second.today.map((b) => b.bookingId)
    );
  });
});// -- BOOK-011, BOOK-013 to BOOK-017: structural invariants ------------------
//
// Proven against the contract surface and the module source, not against a
// purpose-built predicate that could be written to pass.

const CANONICAL_JOB_STATUSES: JobStatus[] = [
  'OPEN',
  'PENDING_ACCEPTANCE',
  'CONFIRMED',
  'IN_PROGRESS',
  'PENDING_COMPLETION',
  'COMPLETED',
  'PAID',
  'CANCELLED',
  'EXPIRED',
  'DISPUTED',
  'RESOLVED',
];

describe('BOOK-011: the module introduces no new JobStatus value', () => {
  it('BOOK-011: JobStatus stays owned by packages/api-types', () => {
    expect(Object.keys(JOB_STATUS_TRANSITIONS).sort()).toEqual(
      [...CANONICAL_JOB_STATUSES].sort()
    );
  });

  it('BOOK-011: the bookings module declares no JobStatus type of its own', () => {
    expect(sourceOf('./types.ts')).not.toMatch(/type\s+JobStatus\s*=/);
    expect(sourceOf('./domain.ts')).not.toMatch(/type\s+JobStatus\s*=/);
  });
});

describe('BOOK-013, BOOK-014: lifecycle never implies escrow funding', () => {
  // BOOK-013: CONFIRMED does not imply escrow funding (behavioral).
  // Hold lifecycle constant at CONFIRMED, vary only escrow.
  // The projection must never report funding for the unfunded case.
  it('BOOK-013: CONFIRMED does not imply escrow funding — same lifecycle, different escrow yields different projection', () => {
    const funded = projectBookingDetail(
      rawBookingFixture({
        jobStatus: 'CONFIRMED',
        escrowStatus: 'held_in_escrow',
      })
    );
    const unfunded = projectBookingDetail(
      rawBookingFixture({
        jobStatus: 'CONFIRMED',
        escrowStatus: 'unfunded',
      })
    );

    // Same lifecycle value, different escrow -> projection must differ.
    // If CONFIRMED implied funding, both would show funded.
    expect(funded.escrowStatus).toBe('held_in_escrow');
    expect(unfunded.escrowStatus).toBe('unfunded');
    expect(funded.escrowStatus).not.toBe(unfunded.escrowStatus);
    expect(funded).not.toHaveProperty('escrowHeld');
    expect(unfunded).not.toHaveProperty('escrowHeld');
  });

  // BOOK-014: IN_PROGRESS does not imply escrow funding (behavioral).
  // Same shape: hold lifecycle constant at IN_PROGRESS, vary only escrow.
  it('BOOK-014: IN_PROGRESS does not imply escrow funding — same lifecycle, different escrow yields different projection', () => {
    const funded = projectBookingDetail(
      rawBookingFixture({
        jobStatus: 'IN_PROGRESS',
        escrowStatus: 'held_in_escrow',
      })
    );
    const unfunded = projectBookingDetail(
      rawBookingFixture({
        jobStatus: 'IN_PROGRESS',
        escrowStatus: 'unfunded',
      })
    );

    expect(funded.escrowStatus).toBe('held_in_escrow');
    expect(unfunded.escrowStatus).toBe('unfunded');
    expect(funded.escrowStatus).not.toBe(unfunded.escrowStatus);
    expect(funded).not.toHaveProperty('escrowHeld');
    expect(unfunded).not.toHaveProperty('escrowHeld');
  });

  // Additional proof: the allowed actions must gate CHECK_IN on escrow,
  // not on lifecycle. CONFIRMED + unfunded must withhold CHECK_IN.
  it('BOOK-013/014: CHECK_IN is gated by escrow, not lifecycle', () => {
    const actionsConfirmedUnfunded = computeAllowedActions(
      rawBookingFixture({
        jobStatus: 'CONFIRMED',
        dispatchStatus: 'ARRIVED',
        escrowStatus: 'unfunded',
      })
    );
    const actionsConfirmedFunded = computeAllowedActions(
      rawBookingFixture({
        jobStatus: 'CONFIRMED',
        dispatchStatus: 'ARRIVED',
        escrowStatus: 'held_in_escrow',
      })
    );

    expect(actionsConfirmedUnfunded).not.toContain('CHECK_IN');
    expect(actionsConfirmedFunded).toContain('CHECK_IN');
  });

  it('BOOK-013: escrow is read-only; no escrow, payment, or payout write is exposed', () => {
    // Scan code only. The comments in this file deliberately use these words to
    // state the prohibition, so prose must not be mistaken for an API surface.
    const code = sourceOf('./types.ts')
      .split('\n')
      .filter((line) => !line.trimStart().startsWith('//'))
      .join('\n');

    for (const forbidden of [
      'setEscrowStatus',
      'releaseEscrow',
      'refund',
      'capturePayment',
      'updatePaymentAuthorization',
      'payout',
    ]) {
      expect(code).not.toContain(forbidden);
    }
  });
});

describe('BOOK-015: no composite status', () => {
  it('BOOK-015: READY_FOR_CHECK_IN is not a JobStatus and not a booking field', () => {
    expect(
      (Object.keys(JOB_STATUS_TRANSITIONS) as string[]).includes(
        'READY_FOR_CHECK_IN'
      )
    ).toBe(false);
    expect(sourceOf('./types.ts')).not.toContain('READY_FOR_CHECK_IN');
  });

  it('BOOK-015: check-in is a lifecycle transition, not a dispatch status', () => {
    const dispatchValues: DispatchStatus[] = [
      'NOT_STARTED',
      'EN_ROUTE',
      'ARRIVED',
    ];

    expect(dispatchValues).toHaveLength(3);
    expect(dispatchValues).not.toContain('CHECKED_IN' as DispatchStatus);

    const source = sourceOf('./types.ts');
    const start = source.indexOf('export type DispatchStatus');
    expect(source.slice(start, start + 200)).not.toContain('CHECKED_IN');
  });

  it('BOOK-015: the composite guard rejects a composite name and accepts every real JobStatus', () => {
    expect(isCompositeStatusCandidate('READY_FOR_CHECK_IN')).toBe(true);
    expect(isCompositeStatusCandidate('ESCROW_FUNDED')).toBe(true);

    for (const status of allJobStatuses()) {
      expect(isCompositeStatusCandidate(status)).toBe(false);
      expect(() => assertJobStatusIsAuthoritative(status)).not.toThrow();
    }

    expect(() => assertJobStatusIsAuthoritative('READY_FOR_CHECK_IN')).toThrow();
  });
});

describe('BOOK-016: EscrowStatus is authoritative, never a derived boolean', () => {
  it('BOOK-016: the projection carries EscrowStatus and no escrowHeld boolean', () => {
    const detail = projectBookingDetail(rawBookingFixture());

    expect(detail.escrowStatus).toBe('held_in_escrow');
    expect(detail).not.toHaveProperty('escrowHeld');
    expect(detail).not.toHaveProperty('isEscrowHeld');
    expect(detail).not.toHaveProperty('isFunded');
    expect(detail).not.toHaveProperty('funded');
  });

  it('BOOK-016: EscrowStatus is imported from the payment domain, never redefined', () => {
    const source = sourceOf('./types.ts');

    expect(source).toContain(
      "import type { EscrowStatus } from '../../payment/types'"
    );
    expect(source).not.toMatch(/type\s+EscrowStatus\s*=/);
    expect(source).not.toMatch(/'held_in_escrow'\s*\|/);
  });
});

describe('BOOK-017: no third escrow vocabulary', () => {
  it('BOOK-017: EscrowShield is never imported', () => {
    for (const file of ['./types.ts', './domain.ts']) {
      expect(sourceOf(file)).not.toContain('EscrowShield');
    }
  });

  it('BOOK-017: escrow values come from the payment domain, not restated here', () => {
    const source = sourceOf('./types.ts');

    // The authoritative union lives in apps/web/lib/payment/types.ts.
    expect(source).not.toMatch(/'unfunded'/);
    expect(source).not.toMatch(/'held_in_escrow'/);
    expect(source).not.toMatch(/'release_pending'/);
  });
});// -- [OWNER] items 1 and 2, plus Gate 1 and Gate 3 --------------------------

describe('[OWNER] and gate constraints', () => {
  it('[OWNER] item 1: no proximity radius is hardcoded as a platform constant', () => {
    for (const file of ['./types.ts', './domain.ts']) {
      const source = sourceOf(file);

      // ARCH section 8: the threshold is a product decision owned by
      // configuration, not a module constant.
      expect(source).not.toMatch(/\b(200|250|300|500)\s*(m|meters|metres)\b/i);
      expect(source).not.toMatch(/PROXIMITY_(RADIUS|THRESHOLD)\s*=\s*\d/);
      expect(source).not.toMatch(/proximityMeters\s*[:=]/);
    }
  });

  it('Gate 1: the repository contract has no approve, reject, or expire scope-adjustment method', () => {
    const source = sourceOf('./types.ts');
    const contract = source.slice(
      source.indexOf('export interface IBrainWorkerBookingsRepository')
    );

    for (const forbidden of [
      'approveScopeAdjustment',
      'rejectScopeAdjustment',
      'expireScopeAdjustment',
      'decideScopeAdjustment',
    ]) {
      expect(contract).not.toContain(forbidden);
    }
  });

  it('[OWNER] item 2: no BW-004 method can return an APPROVED scope adjustment', () => {
    const source = sourceOf('./types.ts');
    const contract = source.slice(
      source.indexOf('export interface IBrainWorkerBookingsRepository')
    );

    // A request may be submitted. Its outcome cannot be decided here.
    expect(
      /requestScopeAdjustment[\s\S]*?Promise<ScopeAdjustment>/.test(contract)
    ).toBe(true);
    expect(contract).not.toContain('Promise<ProviderBookingAction');
  });

  it('Gate 3: the scope adjustment draft carries no repricing, fee, or settlement field', () => {
    const source = sourceOf('./types.ts');
    const draft = source.slice(
      source.indexOf('export interface ScopeAdjustmentDraft'),
      source.indexOf('export interface ScopeAdjustment extends')
    );

    for (const forbidden of [
      'diagnosticFeeKobo',
      'totalKobo',
      'newTotal',
      'settlement',
      'paymentMethod',
      'refund',
      'escrow',
      'authorizedBy',
      'approvedBy',
    ]) {
      expect(draft).not.toContain(forbidden);
    }
  });

  it('Gate 3: the total is derived by the authority on the record, not supplied by the caller', () => {
    const source = sourceOf('./types.ts');
    const draft = source.slice(
      source.indexOf('export interface ScopeAdjustmentDraft'),
      source.indexOf('export interface ScopeAdjustment extends')
    );

    expect(draft).not.toContain('totalAdditionalKobo');
    expect(source).toContain('totalAdditionalKobo: number;');
  });
});