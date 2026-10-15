// apps/web/lib/brainworker/bookings/scopeadjustment.ts
// BW-004 Phase 5: Scope Adjustment (SCOPE-001 to SCOPE-018)
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
    super(message ? `${code}: ${message}` : `SCOPE_ADJUSTMENT_REFUSED: ${code}`);
    this.name = 'ScopeAdjustmentError';
    this.code = code;
  }
}

// Regex matching ASCII control characters except tab, newline, and carriage return
const CONTROL_CHARACTERS_REGEX = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/;

/**
 * Validates a scope adjustment draft according to ARCH section 15 rules:
 * 1. Closed taxonomy check for reasons (SCOPE-004).
 * 2. Non-negative integer kobo amounts (SCOPE-005).
 * 3. At least one of labor or materials > 0 (SCOPE-006).
 * 4. Derived total matches client claim if provided (SCOPE-007).
 * 5. Note trimmed, <= 500 characters, no illegal control characters (SCOPE-008).
 */
export function validateScopeAdjustmentDraft(
  input: ScopeAdjustmentValidationInput
): ScopeAdjustmentValidationResult {
  // 1. Closed reason taxonomy
  if (
    typeof input.reason !== 'string' ||
    !VALID_SCOPE_ADJUSTMENT_REASONS.has(input.reason as ScopeAdjustmentReason)
  ) {
    return {
      ok: false,
      reason: 'VALIDATION_FAILED',
      message: 'Reason must be one of: ADDITIONAL_PARTS, ADDITIONAL_LABOR, BOTH',
    };
  }

  const reason = input.reason as ScopeAdjustmentReason;

  // 2. Kobo amounts must be non-negative integers
  const labor = input.additionalLaborKobo;
  const materials = input.additionalMaterialsKobo;

  if (
    typeof labor !== 'number' ||
    !Number.isFinite(labor) ||
    !Number.isInteger(labor) ||
    labor < 0
  ) {
    return {
      ok: false,
      reason: 'VALIDATION_FAILED',
      message: 'additionalLaborKobo must be a non-negative integer',
    };
  }

  if (
    typeof materials !== 'number' ||
    !Number.isFinite(materials) ||
    !Number.isInteger(materials) ||
    materials < 0
  ) {
    return {
      ok: false,
      reason: 'VALIDATION_FAILED',
      message: 'additionalMaterialsKobo must be a non-negative integer',
    };
  }

  // 3. At least one of labor or materials must be above zero
  if (labor === 0 && materials === 0) {
    return {
      ok: false,
      reason: 'VALIDATION_FAILED',
      message: 'At least one of additionalLaborKobo or additionalMaterialsKobo must be greater than zero',
    };
  }

  // 4. Derive total authoritatively
  const derivedTotalKobo = labor + materials;

  if (input.clientClaimedTotalKobo !== undefined) {
    if (
      typeof input.clientClaimedTotalKobo !== 'number' ||
      input.clientClaimedTotalKobo !== derivedTotalKobo
    ) {
      return {
        ok: false,
        reason: 'VALIDATION_FAILED',
        message: `Client claimed total (${input.clientClaimedTotalKobo}) conflicts with derived total (${derivedTotalKobo})`,
      };
    }
  }

  // 5. Note validation
  let validatedNote: string | undefined = undefined;
  if (input.note !== undefined && input.note !== null) {
    if (typeof input.note !== 'string') {
      return {
        ok: false,
        reason: 'VALIDATION_FAILED',
        message: 'Note must be a string',
      };
    }

    const trimmed = input.note.trim();
    if (trimmed.length > 500) {
      return {
        ok: false,
        reason: 'VALIDATION_FAILED',
        message: 'Note length must not exceed 500 characters',
      };
    }

    if (CONTROL_CHARACTERS_REGEX.test(trimmed)) {
      return {
        ok: false,
        reason: 'VALIDATION_FAILED',
        message: 'Note contains illegal control characters',
      };
    }

    if (trimmed.length > 0) {
      validatedNote = trimmed;
    }
  }

  return {
    ok: true,
    validDraft: {
      reason,
      additionalLaborKobo: labor,
      additionalMaterialsKobo: materials,
      ...(validatedNote !== undefined ? { note: validatedNote } : {}),
    },
    derivedTotalKobo,
  };
}

/**
 * Evaluates and applies a scope adjustment request transition.
 */
export function transitionScopeAdjustmentRequest(
  input: ScopeAdjustmentRequestInput
): ScopeAdjustmentRequestResult {
  // 1. Lifecycle transition check: only allowed from IN_PROGRESS (ARCH s5, SCOPE-001, SCOPE-002)
  if (input.currentJobStatus !== 'IN_PROGRESS') {
    return {
      ok: false,
      reason: 'INVALID_TRANSITION',
    };
  }

  // 2. Concurrency check: only one PENDING request per booking (ARCH s6, SCOPE-003)
  if (input.existingAdjustments.some((adj) => adj.status === 'PENDING')) {
    return {
      ok: false,
      reason: 'SCOPE_ADJUSTMENT_ALREADY_PENDING',
    };
  }

  // 3. Draft validation (ARCH s15, SCOPE-004 to SCOPE-008)
  const validation = validateScopeAdjustmentDraft({
    reason: input.draft?.reason,
    additionalLaborKobo: input.draft?.additionalLaborKobo,
    additionalMaterialsKobo: input.draft?.additionalMaterialsKobo,
    note: input.draft?.note,
    clientClaimedTotalKobo: input.clientClaimedTotalKobo,
  });

  if (!validation.ok) {
    return {
      ok: false,
      reason: 'VALIDATION_FAILED',
    };
  }

  // 4. Construct authoritative ScopeAdjustment record (ARCH s5, Gate 1, Gate 3)
  const submittedAt = input.now ?? new Date().toISOString();
  const id = input.idGenerator
    ? input.idGenerator()
    : `scope-adj-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

  const adjustment: ScopeAdjustment = {
    id,
    bookingId: input.bookingId,
    reason: validation.validDraft.reason,
    additionalLaborKobo: validation.validDraft.additionalLaborKobo,
    additionalMaterialsKobo: validation.validDraft.additionalMaterialsKobo,
    totalAdditionalKobo: validation.derivedTotalKobo,
    ...(validation.validDraft.note !== undefined ? { note: validation.validDraft.note } : {}),
    status: 'PENDING',
    submittedAt,
    // decidedAt is strictly undefined; BW-004 never fabricates customer decisions (Gate 1, SCOPE-013)
  };

  // 5. Emit typed domain event (ARCH s10)
  const event: BookingFeedEvent = {
    type: 'SCOPE_ADJUSTMENT_REQUESTED',
    bookingId: input.bookingId,
    adjustmentId: adjustment.id,
    timestamp: submittedAt,
  };

  return {
    ok: true,
    adjustment,
    event,
  };
}

/**
 * Evaluates and applies a scope adjustment withdrawal transition.
 */
export function transitionScopeAdjustmentWithdraw(
  input: ScopeAdjustmentWithdrawInput
): ScopeAdjustmentWithdrawResult {
  const target = input.existingAdjustments.find((adj) => adj.id === input.adjustmentId);
  if (!target) {
    return {
      ok: false,
      reason: 'NOT_FOUND',
    };
  }

  // Only PENDING adjustments may be withdrawn (ARCH s6, SCOPE-009, SCOPE-010)
  if (target.status !== 'PENDING') {
    return {
      ok: false,
      reason: 'INVALID_TRANSITION',
    };
  }

  const timestamp = input.now ?? new Date().toISOString();
  const withdrawnAdjustment: ScopeAdjustment = {
    ...target,
    status: 'WITHDRAWN',
  };

  const event: BookingFeedEvent = {
    type: 'SCOPE_ADJUSTMENT_WITHDRAWN',
    bookingId: input.bookingId,
    adjustmentId: target.id,
    timestamp,
  };

  return {
    ok: true,
    adjustment: withdrawnAdjustment,
    event,
  };
}
