// apps/web/lib/brainworker/bookings/scopeadjustment.test.ts
// BW-004 Phase 5 RED: Scope Adjustment (SCOPE-001 to SCOPE-018)
// Governed by:
//   docs/specs/BW-004-architecture-contract.md (sections 5, 6, 9, 10, 14, 15, 16)
//   docs/specs/BW-004-booking-management.md (D5, D7, Gate 1, Gate 3)
//   docs/specs/BW-004-test-first-implementation-plan.md (Phase 5)
//
// Invariant Rules:
// 1. Zero imports from testing/ (REP-010).
// 2. Submit allowed only when booking is in IN_PROGRESS (SCOPE-001, SCOPE-002).
// 3. Only one PENDING request per booking (SCOPE-003).
// 4. Closed taxonomy for reasons: ADDITIONAL_PARTS, ADDITIONAL_LABOR, BOTH (SCOPE-004).
// 5. Non-negative integer kobo validation (SCOPE-005, SCOPE-006).
// 6. Authority derives total; client conflict rejected (SCOPE-007).
// 7. Note length max 500 chars, trimmed, control characters rejected (SCOPE-008).
// 8. Withdraw transitions PENDING to WITHDRAWN (SCOPE-009, SCOPE-010).
// 9. Scope adjustments never mutate quote, JobStatus, payment, or escrow (SCOPE-011, SCOPE-012, SCOPE-018).
// 10. Timestamps written authoritatively; no decidedAt fabricated (SCOPE-013).
// 11. BW-004 authors only PENDING and WITHDRAWN; no approve, reject, or expire (SCOPE-014, SCOPE-017).
// 12. No customer decision endpoint, auto-approval, or settlement path (SCOPE-015, SCOPE-016).

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { JobStatus } from '@bukiebrainjobs/api-types';
import {
  transitionScopeAdjustmentRequest,
  transitionScopeAdjustmentWithdraw,
  VALID_SCOPE_ADJUSTMENT_REASONS,
  type ScopeAdjustmentRequestInput,
  type ScopeAdjustmentWithdrawInput,
} from './scopeadjustment';
import type {
  ScopeAdjustment,
  ScopeAdjustmentDraft,
  ScopeAdjustmentReason,
} from './types';
import { BrainWorkerBookingsRepository } from './repository';

const sourceOf = (file: string): string =>
  readFileSync(fileURLToPath(new URL(file, import.meta.url)), 'utf8');

const VALID_DRAFT: ScopeAdjustmentDraft = {
  reason: 'ADDITIONAL_LABOR',
  additionalLaborKobo: 250000,
  additionalMaterialsKobo: 0,
  note: 'Additional pipe welding required due to concealed wall corrosion.',
};

describe('BW-004 Phase 5: Scope Adjustment (SCOPE-001 to SCOPE-018)', () => {
  // ===========================================================================
  // SCOPE-001: submit from IN_PROGRESS
  // ===========================================================================
  it('SCOPE-001: submit from IN_PROGRESS', () => {
    const input: ScopeAdjustmentRequestInput = {
      bookingId: 'booking-scope-001',
      currentJobStatus: 'IN_PROGRESS',
      existingAdjustments: [],
      draft: VALID_DRAFT,
      now: '2026-10-15T11:00:00.000Z',
    };

    const result = transitionScopeAdjustmentRequest(input);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.adjustment.status).toBe('PENDING');
      expect(result.adjustment.bookingId).toBe('booking-scope-001');
      expect(result.adjustment.reason).toBe('ADDITIONAL_LABOR');
      expect(result.adjustment.additionalLaborKobo).toBe(250000);
      expect(result.adjustment.additionalMaterialsKobo).toBe(0);
      expect(result.adjustment.totalAdditionalKobo).toBe(250000);
      expect(result.adjustment.submittedAt).toBe('2026-10-15T11:00:00.000Z');
      expect(result.adjustment.decidedAt).toBeUndefined();
      expect(result.event).toEqual({
        type: 'SCOPE_ADJUSTMENT_REQUESTED',
        bookingId: 'booking-scope-001',
        adjustmentId: result.adjustment.id,
        timestamp: '2026-10-15T11:00:00.000Z',
      });
    }
  });

  // ===========================================================================
  // SCOPE-002: submit refused outside IN_PROGRESS
  // ===========================================================================
  it('SCOPE-002: submit refused outside IN_PROGRESS', () => {
    const nonInProgressStatuses: JobStatus[] = [
      'OPEN',
      'PENDING_ACCEPTANCE',
      'CONFIRMED',
      'COMPLETED',
      'CANCELLED',
      'DISPUTED',
      'EXPIRED',
    ];

    for (const status of nonInProgressStatuses) {
      const result = transitionScopeAdjustmentRequest({
        bookingId: 'booking-scope-002',
        currentJobStatus: status,
        existingAdjustments: [],
        draft: VALID_DRAFT,
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.reason).toBe('INVALID_TRANSITION');
      }
    }
  });

  // ===========================================================================
  // SCOPE-003: only one PENDING request per booking
  // ===========================================================================
  it('SCOPE-003: only one PENDING request per booking', () => {
    const existingPending: ScopeAdjustment = {
      id: 'scope-adj-existing-pending',
      bookingId: 'booking-scope-003',
      reason: 'ADDITIONAL_PARTS',
      additionalLaborKobo: 0,
      additionalMaterialsKobo: 180000,
      totalAdditionalKobo: 180000,
      status: 'PENDING',
      submittedAt: '2026-10-15T10:00:00.000Z',
    };

    const result = transitionScopeAdjustmentRequest({
      bookingId: 'booking-scope-003',
      currentJobStatus: 'IN_PROGRESS',
      existingAdjustments: [existingPending],
      draft: VALID_DRAFT,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe('SCOPE_ADJUSTMENT_ALREADY_PENDING');
    }
  });

  // ===========================================================================
  // SCOPE-004: reason validated against the closed taxonomy
  // ===========================================================================
  it('SCOPE-004: reason validated against the closed taxonomy', () => {
    const invalidReasons = [
      'SCOPE_MISMATCH',
      'CUSTOMER_REQUEST',
      'EXTRA_TIME',
      'OTHER',
      '',
      'parts_and_labor',
    ];

    for (const invalidReason of invalidReasons) {
      const result = transitionScopeAdjustmentRequest({
        bookingId: 'booking-scope-004',
        currentJobStatus: 'IN_PROGRESS',
        existingAdjustments: [],
        draft: {
          ...VALID_DRAFT,
          reason: invalidReason as ScopeAdjustmentReason,
        },
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.reason).toBe('VALIDATION_FAILED');
      }
    }

    // Verify all allowed reasons pass taxonomy validation
    for (const validReason of VALID_SCOPE_ADJUSTMENT_REASONS) {
      const validResult = transitionScopeAdjustmentRequest({
        bookingId: 'booking-scope-004',
        currentJobStatus: 'IN_PROGRESS',
        existingAdjustments: [],
        draft: {
          reason: validReason,
          additionalLaborKobo: validReason === 'ADDITIONAL_PARTS' ? 0 : 100000,
          additionalMaterialsKobo: validReason === 'ADDITIONAL_LABOR' ? 0 : 100000,
        },
      });

      expect(validResult.ok).toBe(true);
    }
  });

  // ===========================================================================
  // SCOPE-005: non-negative integer kobo validation
  // ===========================================================================
  it('SCOPE-005: non-negative integer kobo validation', () => {
    const invalidAmounts = [
      { labor: -100, materials: 0 },
      { labor: 0, materials: -500 },
      { labor: 1500.5, materials: 0 },
      { labor: 0, materials: 220.75 },
      { labor: Number.NaN, materials: 1000 },
      { labor: 1000, materials: Number.POSITIVE_INFINITY },
    ];

    for (const { labor, materials } of invalidAmounts) {
      const result = transitionScopeAdjustmentRequest({
        bookingId: 'booking-scope-005',
        currentJobStatus: 'IN_PROGRESS',
        existingAdjustments: [],
        draft: {
          reason: 'BOTH',
          additionalLaborKobo: labor,
          additionalMaterialsKobo: materials,
        },
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.reason).toBe('VALIDATION_FAILED');
      }
    }
  });

  // ===========================================================================
  // SCOPE-006: at least one of labor or materials above zero
  // ===========================================================================
  it('SCOPE-006: at least one of labor or materials above zero', () => {
    const resultBothZero = transitionScopeAdjustmentRequest({
      bookingId: 'booking-scope-006',
      currentJobStatus: 'IN_PROGRESS',
      existingAdjustments: [],
      draft: {
        reason: 'BOTH',
        additionalLaborKobo: 0,
        additionalMaterialsKobo: 0,
      },
    });

    expect(resultBothZero.ok).toBe(false);
    if (!resultBothZero.ok) {
      expect(resultBothZero.reason).toBe('VALIDATION_FAILED');
    }

    const resultLaborOnly = transitionScopeAdjustmentRequest({
      bookingId: 'booking-scope-006',
      currentJobStatus: 'IN_PROGRESS',
      existingAdjustments: [],
      draft: {
        reason: 'ADDITIONAL_LABOR',
        additionalLaborKobo: 50000,
        additionalMaterialsKobo: 0,
      },
    });
    expect(resultLaborOnly.ok).toBe(true);

    const resultMaterialsOnly = transitionScopeAdjustmentRequest({
      bookingId: 'booking-scope-006',
      currentJobStatus: 'IN_PROGRESS',
      existingAdjustments: [],
      draft: {
        reason: 'ADDITIONAL_PARTS',
        additionalLaborKobo: 0,
        additionalMaterialsKobo: 75000,
      },
    });
    expect(resultMaterialsOnly.ok).toBe(true);
  });

  // ===========================================================================
  // SCOPE-007: total derived by the authority, client total rejected on conflict
  // ===========================================================================
  it('SCOPE-007: total derived by the authority, client total rejected on conflict', () => {
    // Client supplies conflicting claimed total: 400000 instead of 500000
    const conflictingResult = transitionScopeAdjustmentRequest({
      bookingId: 'booking-scope-007',
      currentJobStatus: 'IN_PROGRESS',
      existingAdjustments: [],
      draft: {
        reason: 'BOTH',
        additionalLaborKobo: 300000,
        additionalMaterialsKobo: 200000,
      },
      clientClaimedTotalKobo: 400000,
    });

    expect(conflictingResult.ok).toBe(false);
    if (!conflictingResult.ok) {
      expect(conflictingResult.reason).toBe('VALIDATION_FAILED');
    }

    // Matching or derived total succeeds
    const matchingResult = transitionScopeAdjustmentRequest({
      bookingId: 'booking-scope-007',
      currentJobStatus: 'IN_PROGRESS',
      existingAdjustments: [],
      draft: {
        reason: 'BOTH',
        additionalLaborKobo: 300000,
        additionalMaterialsKobo: 200000,
      },
      clientClaimedTotalKobo: 500000,
    });

    expect(matchingResult.ok).toBe(true);
    if (matchingResult.ok) {
      expect(matchingResult.adjustment.totalAdditionalKobo).toBe(500000);
    }
  });

  // ===========================================================================
  // SCOPE-008: note length and character validation
  // ===========================================================================
  it('SCOPE-008: note length and character validation', () => {
    const tooLongNote = 'x'.repeat(501);
    const resultTooLong = transitionScopeAdjustmentRequest({
      bookingId: 'booking-scope-008',
      currentJobStatus: 'IN_PROGRESS',
      existingAdjustments: [],
      draft: {
        ...VALID_DRAFT,
        note: tooLongNote,
      },
    });

    expect(resultTooLong.ok).toBe(false);
    if (!resultTooLong.ok) {
      expect(resultTooLong.reason).toBe('VALIDATION_FAILED');
    }

    // Note with illegal ASCII control character
    const resultControlChar = transitionScopeAdjustmentRequest({
      bookingId: 'booking-scope-008',
      currentJobStatus: 'IN_PROGRESS',
      existingAdjustments: [],
      draft: {
        ...VALID_DRAFT,
        note: 'Invalid note with null byte \u0000 inside',
      },
    });

    expect(resultControlChar.ok).toBe(false);
    if (!resultControlChar.ok) {
      expect(resultControlChar.reason).toBe('VALIDATION_FAILED');
    }

    // Clean note within 500 characters
    const cleanResult = transitionScopeAdjustmentRequest({
      bookingId: 'booking-scope-008',
      currentJobStatus: 'IN_PROGRESS',
      existingAdjustments: [],
      draft: {
        ...VALID_DRAFT,
        note: '   Proper explanation of extra labor required.   ',
      },
    });

    expect(cleanResult.ok).toBe(true);
    if (cleanResult.ok) {
      expect(cleanResult.adjustment.note).toBe('Proper explanation of extra labor required.');
    }
  });

  // ===========================================================================
  // SCOPE-009: withdraw a PENDING request
  // ===========================================================================
  it('SCOPE-009: withdraw a PENDING request', () => {
    const pendingAdjustment: ScopeAdjustment = {
      id: 'scope-adj-to-withdraw',
      bookingId: 'booking-scope-009',
      reason: 'ADDITIONAL_LABOR',
      additionalLaborKobo: 120000,
      additionalMaterialsKobo: 0,
      totalAdditionalKobo: 120000,
      status: 'PENDING',
      submittedAt: '2026-10-15T09:30:00.000Z',
    };

    const withdrawInput: ScopeAdjustmentWithdrawInput = {
      bookingId: 'booking-scope-009',
      adjustmentId: 'scope-adj-to-withdraw',
      existingAdjustments: [pendingAdjustment],
      now: '2026-10-15T09:45:00.000Z',
    };

    const result = transitionScopeAdjustmentWithdraw(withdrawInput);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.adjustment.status).toBe('WITHDRAWN');
      expect(result.event).toEqual({
        type: 'SCOPE_ADJUSTMENT_WITHDRAWN',
        bookingId: 'booking-scope-009',
        adjustmentId: 'scope-adj-to-withdraw',
        timestamp: '2026-10-15T09:45:00.000Z',
      });
    }
  });

  // ===========================================================================
  // SCOPE-010: withdraw refused for an already decided request
  // ===========================================================================
  it('SCOPE-010: withdraw refused for an already decided request', () => {
    const alreadyWithdrawnAdjustment: ScopeAdjustment = {
      id: 'scope-adj-already-withdrawn',
      bookingId: 'booking-scope-010',
      reason: 'ADDITIONAL_PARTS',
      additionalLaborKobo: 0,
      additionalMaterialsKobo: 95000,
      totalAdditionalKobo: 95000,
      status: 'WITHDRAWN',
      submittedAt: '2026-10-15T08:00:00.000Z',
    };

    const result = transitionScopeAdjustmentWithdraw({
      bookingId: 'booking-scope-010',
      adjustmentId: 'scope-adj-already-withdrawn',
      existingAdjustments: [alreadyWithdrawnAdjustment],
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe('INVALID_TRANSITION');
    }
  });

  // ===========================================================================
  // SCOPE-011: approval never mutates the quote, JobStatus, payment, or escrow
  // ===========================================================================
  it('SCOPE-011: approval never mutates the quote, JobStatus, payment, or escrow', () => {
    const result = transitionScopeAdjustmentRequest({
      bookingId: 'booking-scope-011',
      currentJobStatus: 'IN_PROGRESS',
      existingAdjustments: [],
      draft: VALID_DRAFT,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      // The adjustment mutation carries no financial or jobStatus payload
      expect(result).not.toHaveProperty('jobStatus');
      expect(result).not.toHaveProperty('escrowStatus');
      expect(result).not.toHaveProperty('quoteAmountKobo');
      expect(result).not.toHaveProperty('paymentStatus');
      expect(result).not.toHaveProperty('ledgerMutation');
    }

    // Architectural boundary
    const scopeSource = sourceOf('./scopeadjustment.ts');
    expect(scopeSource).not.toMatch(/from\s+['"][^'"]*payment/);
  });

  // ===========================================================================
  // SCOPE-012: rejection leaves the booking unchanged
  // ===========================================================================
  it('SCOPE-012: rejection leaves the booking unchanged', () => {
    // Read-only rejected projection exists in booking history
    const rejectedAdjustment: ScopeAdjustment = {
      id: 'scope-adj-rejected-prior',
      bookingId: 'booking-scope-012',
      reason: 'ADDITIONAL_PARTS',
      additionalLaborKobo: 0,
      additionalMaterialsKobo: 300000,
      totalAdditionalKobo: 300000,
      status: 'REJECTED',
      submittedAt: '2026-10-14T10:00:00.000Z',
      decidedAt: '2026-10-14T12:00:00.000Z',
    };

    // Submitting a new request succeeds because no PENDING adjustment exists
    const result = transitionScopeAdjustmentRequest({
      bookingId: 'booking-scope-012',
      currentJobStatus: 'IN_PROGRESS',
      existingAdjustments: [rejectedAdjustment],
      draft: VALID_DRAFT,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.adjustment.status).toBe('PENDING');
    }
  });

  // ===========================================================================
  // SCOPE-013: decision stamps, once a customer authority exists, are authority generated; no BW-004 method fabricates them
  // ===========================================================================
  it('SCOPE-013: decision stamps, once a customer authority exists, are authority generated; no BW-004 method fabricates them', () => {
    const authoritativeTime = '2026-10-15T12:30:00.000Z';

    const result = transitionScopeAdjustmentRequest({
      bookingId: 'booking-scope-013',
      currentJobStatus: 'IN_PROGRESS',
      existingAdjustments: [],
      draft: VALID_DRAFT,
      now: authoritativeTime,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.adjustment.submittedAt).toBe(authoritativeTime);
      expect(result.adjustment.decidedAt).toBeUndefined();
    }
  });

  // ===========================================================================
  // SCOPE-014: BW-004 authors only PENDING and WITHDRAWN, with no method to approve, reject, or expire
  // ===========================================================================
  it('SCOPE-014: BW-004 authors only PENDING and WITHDRAWN, with no method to approve, reject, or expire', () => {
    const result = transitionScopeAdjustmentRequest({
      bookingId: 'booking-scope-014',
      currentJobStatus: 'IN_PROGRESS',
      existingAdjustments: [],
      draft: VALID_DRAFT,
    });

    expect(result.ok).toBe(true);

    // Repository interface boundary
    const repositoryPrototype = BrainWorkerBookingsRepository.prototype as unknown as Record<string, unknown>;
    expect(typeof repositoryPrototype.requestScopeAdjustment).toBe('function');
    expect(typeof repositoryPrototype.withdrawScopeAdjustment).toBe('function');
    expect(repositoryPrototype.approveScopeAdjustment).toBeUndefined();
    expect(repositoryPrototype.rejectScopeAdjustment).toBeUndefined();
    expect(repositoryPrototype.expireScopeAdjustment).toBeUndefined();
  });

  // ===========================================================================
  // SCOPE-015: no customer decision endpoint, auto-approval, or timeout approval exists
  // ===========================================================================
  it('SCOPE-015: no customer decision endpoint, auto-approval, or timeout approval exists', () => {
    const result = transitionScopeAdjustmentRequest({
      bookingId: 'booking-scope-015',
      currentJobStatus: 'IN_PROGRESS',
      existingAdjustments: [],
      draft: VALID_DRAFT,
    });

    expect(result.ok).toBe(true);

    // Architectural boundary inspection
    const scopeSource = sourceOf('./scopeadjustment.ts');
    expect(scopeSource).not.toMatch(/autoApprove/i);
    expect(scopeSource).not.toMatch(/setTimeout/);
    expect(scopeSource).not.toMatch(/setInterval/);
    expect(scopeSource).not.toMatch(/customerApprove/i);
  });

  // ===========================================================================
  // SCOPE-016: the repository exposes no settlement path and no quote mutation path
  // ===========================================================================
  it('SCOPE-016: the repository exposes no settlement path and no quote mutation path', () => {
    const result = transitionScopeAdjustmentRequest({
      bookingId: 'booking-scope-016',
      currentJobStatus: 'IN_PROGRESS',
      existingAdjustments: [],
      draft: VALID_DRAFT,
    });

    expect(result.ok).toBe(true);

    const repoSource = sourceOf('./repository.ts');
    expect(repoSource).not.toMatch(/settleScopeAdjustment/);
    expect(repoSource).not.toMatch(/mutateQuote/);
    expect(repoSource).not.toMatch(/updateQuoteAmount/);
    expect(repoSource).not.toMatch(/adjustEscrow/);
  });

  // ===========================================================================
  // SCOPE-017: while no customer decision authority exists, the repository produces no APPROVED, REJECTED, or EXPIRED state and no test simulates one
  // ===========================================================================
  it('SCOPE-017: while no customer decision authority exists, the repository produces no APPROVED, REJECTED, or EXPIRED state and no test simulates one', () => {
    const requestResult = transitionScopeAdjustmentRequest({
      bookingId: 'booking-scope-017',
      currentJobStatus: 'IN_PROGRESS',
      existingAdjustments: [],
      draft: VALID_DRAFT,
    });

    expect(requestResult.ok).toBe(true);
    if (requestResult.ok) {
      expect(requestResult.adjustment.status).toBe('PENDING');
      expect(['APPROVED', 'REJECTED', 'EXPIRED']).not.toContain(requestResult.adjustment.status);
    }

    if (requestResult.ok) {
      const withdrawResult = transitionScopeAdjustmentWithdraw({
        bookingId: 'booking-scope-017',
        adjustmentId: requestResult.adjustment.id,
        existingAdjustments: [requestResult.adjustment],
      });

      expect(withdrawResult.ok).toBe(true);
      if (withdrawResult.ok) {
        expect(withdrawResult.adjustment.status).toBe('WITHDRAWN');
        expect(['APPROVED', 'REJECTED', 'EXPIRED']).not.toContain(withdrawResult.adjustment.status);
      }
    }
  });

  // ===========================================================================
  // SCOPE-018: no test asserts or manufactures revised pricing, payment authorization, escrow adjustment, ledger mutation, or refund/additional-payment behaviour
  // ===========================================================================
  it('SCOPE-018: no test asserts or manufactures revised pricing, payment authorization, escrow adjustment, ledger mutation, or refund/additional-payment behaviour', () => {
    const result = transitionScopeAdjustmentRequest({
      bookingId: 'booking-scope-018',
      currentJobStatus: 'IN_PROGRESS',
      existingAdjustments: [],
      draft: VALID_DRAFT,
    });

    expect(result.ok).toBe(true);

    // Gate 3 architectural boundary
    const scopeSource = sourceOf('./scopeadjustment.ts');
    expect(scopeSource).not.toMatch(/revisedPricing/);
    expect(scopeSource).not.toMatch(/paymentAuthorization/);
    expect(scopeSource).not.toMatch(/ledgerMutation/);
    expect(scopeSource).not.toMatch(/escrowAdjustment/);
  });
});
