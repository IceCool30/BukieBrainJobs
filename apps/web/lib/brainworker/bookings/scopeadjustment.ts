// apps/web/lib/brainworker/bookings/scopeadjustment.ts
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

import type { JobStatus } from '@bukiebrainjobs/api-types';
import type {
  ScopeAdjustment,
  ScopeAdjustmentDraft,
  ScopeAdjustmentReason,
  BookingFeedEvent,
} from './types';

export const VALID_SCOPE_ADJUSTMENT_REASONS: ReadonlySet<ScopeAdjustmentReason> =
  new Set(['ADDITIONAL_PARTS', 'ADDITIONAL_LABOR', 'BOTH']);

export interface ScopeAdjustmentValidationInput {
  reason: unknown;
  additionalLaborKobo: unknown;
  additionalMaterialsKobo: unknown;
  note?: unknown;
  clientClaimedTotalKobo?: unknown;
}

export type ScopeAdjustmentValidationResult =
  | {
      ok: true;
      validDraft: ScopeAdjustmentDraft;
      derivedTotalKobo: number;
    }
  | {
      ok: false;
      reason: 'VALIDATION_FAILED';
      message: string;
    };

export interface ScopeAdjustmentRequestInput {
  bookingId: string;
  currentJobStatus: JobStatus;
  existingAdjustments: readonly ScopeAdjustment[];
  draft: ScopeAdjustmentDraft;
  clientClaimedTotalKobo?: number | undefined;
  now?: string | undefined;
  idGenerator?: (() => string) | undefined;
}

export type ScopeAdjustmentRequestResult =
  | {
      ok: true;
      adjustment: ScopeAdjustment;
      event: BookingFeedEvent;
    }
  | {
      ok: false;
      reason:
        | 'INVALID_TRANSITION'
        | 'SCOPE_ADJUSTMENT_ALREADY_PENDING'
        | 'VALIDATION_FAILED';
    };

export interface ScopeAdjustmentWithdrawInput {
  bookingId: string;
  adjustmentId: string;
  existingAdjustments: readonly ScopeAdjustment[];
  now?: string | undefined;
}

export type ScopeAdjustmentWithdrawResult =
  | {
      ok: true;
      adjustment: ScopeAdjustment;
      event: BookingFeedEvent;
    }
  | {
      ok: false;
      reason:
        | 'NOT_FOUND'
        | 'INVALID_TRANSITION'
        | 'STALE_STATE';
    };

export class ScopeAdjustmentError extends Error {
  readonly code: string;
  constructor(code: string, message?: string) {
    super(message ?? `SCOPE_ADJUSTMENT_REFUSED: ${code}`);
    this.name = 'ScopeAdjustmentError';
    this.code = code;
  }
}

/**
 * Validates a scope adjustment draft according to ARCH section 15 rules.
 * RED Phase Stub: throws "RED: not implemented".
 */
export function validateScopeAdjustmentDraft(
  _input: ScopeAdjustmentValidationInput
): ScopeAdjustmentValidationResult {
  throw new Error('RED: not implemented');
}

/**
 * Evaluates and creates a scope adjustment request.
 * RED Phase Stub: throws "RED: not implemented".
 */
export function transitionScopeAdjustmentRequest(
  _input: ScopeAdjustmentRequestInput
): ScopeAdjustmentRequestResult {
  throw new Error('RED: not implemented');
}

/**
 * Evaluates and applies a scope adjustment withdrawal.
 * RED Phase Stub: throws "RED: not implemented".
 */
export function transitionScopeAdjustmentWithdraw(
  _input: ScopeAdjustmentWithdrawInput
): ScopeAdjustmentWithdrawResult {
  throw new Error('RED: not implemented');
}
