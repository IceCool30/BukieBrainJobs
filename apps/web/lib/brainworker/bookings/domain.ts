// apps/web/lib/brainworker/bookings/domain.ts
// BW-004 Phase 1: Domain Contracts and Projection (BOOK-001 to BOOK-017)
// Governed by: BW-004-ARCH v0.2, BW-004-PROD v0.2
//
// RED phase. Every export below is a stub that throws. The signatures are the
// approved contract surface; the behaviour is not written yet. No implementation
// in this file decides an [OWNER] item.
//
// Invariants this module must never violate:
//   - Booking lifecycle, dispatch, and financial readiness stay three
//     independent dimensions. No value is derived across them.
//   - Escrow is read-only here and never inferred from a lifecycle value.
//   - No composite status, no third escrow vocabulary, no testing imports.

import { JOB_STATUS_TRANSITIONS } from '@bukiebrainjobs/api-types';
import type { EscrowStatus } from '../../payment/types';
import type {
  AddressUnlockInputs,
  AddressUnlockResult,
  DispatchStatus,
  ProviderBookingAction,
  ProviderBookingDetail,
  ProviderBookingSummary,
  RawBookingRecord,
  ScopeAdjustmentDraft,
} from './types';

// BOOK-001 to BOOK-004: provider gate and booking resolution.
//
// A booking owned by another provider is NOT_FOUND, identical to a missing
// booking. There is no distinguishable foreign-booking refusal (ARCH s6).
export type BookingGateFailure =
  | 'UNAUTHENTICATED'
  | 'NOT_APPROVED'
  | 'PROFILE_INCOMPLETE'
  | 'NOT_FOUND';

export type BookingGateResult =
  | { admitted: true }
  | { admitted: false; reason: BookingGateFailure };

export function evaluateBookingGate(
  context: {
    authenticated: boolean;
    role: string;
    isBrainWorkerApproved: boolean;
    operationalProfileIsComplete: boolean;
    brainWorkerId: string;
  },
  booking: Pick<RawBookingRecord, 'taskerProfileId'> | null
): BookingGateResult {
  throw new Error('RED: evaluateBookingGate not implemented');
}

// BOOK-005: privacy projection. The projection carries no customer phone, no
// customer email, and no billing field. Exact address presence is decided by
// evaluateAddressUnlock and is the only conditional field.
export function projectBookingSummary(
  booking: RawBookingRecord
): ProviderBookingSummary {
  throw new Error('RED: projectBookingSummary not implemented');
}

export function projectBookingDetail(
  booking: RawBookingRecord
): ProviderBookingDetail {
  throw new Error('RED: projectBookingDetail not implemented');
}

// BOOK-006, BOOK-007, BOOK-008: address precision (D8).
//
// Three inputs, all required: booking resolution, privacy consent, and escrow
// funds held. No proximity value appears here; proximity is a check-in concern
// owned by configuration (ARCH s8), not an address-unlock gate.
export function evaluateAddressUnlock(
  inputs: AddressUnlockInputs,
  exactAddress: string
): AddressUnlockResult {
  throw new Error('RED: evaluateAddressUnlock not implemented');
}

// BOOK-009, BOOK-010: allowedActions computed by the authority from state,
// ownership, escrow context, and dispatch status. Returns a value for every
// JobStatus including DISPUTED and CANCELLED, never throwing on a valid state.
export function computeAllowedActions(
  booking: Pick<
    RawBookingRecord,
    'jobStatus' | 'dispatchStatus' | 'escrowStatus' | 'scopeAdjustments' | 'cancellationReason'
  >
): ProviderBookingAction[] {
  throw new Error('RED: computeAllowedActions not implemented');
}

// BOOK-012: deterministic grouping and sort by scheduledStartAt from the
// authoritative value. No client-side ranking or urgency score.
export function groupAndSortBookings(
  bookings: ProviderBookingSummary[],
  now: Date
): { today: ProviderBookingSummary[]; upcoming: ProviderBookingSummary[]; closed: ProviderBookingSummary[] } {
  throw new Error('RED: groupAndSortBookings not implemented');
}

// BOOK-015: guard against a composite status ever entering the module. The
// single JobStatus machine stays authoritative in packages/api-types.
export function isCompositeStatusCandidate(value: string): boolean {
  throw new Error('RED: isCompositeStatusCandidate not implemented');
}

export function assertJobStatusIsAuthoritative(status: string): void {
  throw new Error('RED: assertJobStatusIsAuthoritative not implemented');
}

// BOOK-011 and BOOK-016 are proven by type and structure rather than by a
// runtime predicate. Re-export the authoritative values so tests assert
// against the real contract, not a copy.
export { JOB_STATUS_TRANSITIONS };
export type { EscrowStatus };