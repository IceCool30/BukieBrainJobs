// apps/web/lib/brainworker/bookings/domain.ts
// BW-004 Phase 1: Domain Contracts and Projection (BOOK-001 to BOOK-017)
// Governed by: BW-004-ARCH v0.2, BW-004-PROD v0.2

import { JOB_STATUS_TRANSITIONS, canTransition } from '@bukiebrainjobs/api-types';
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

const PROVIDER_CANCELLATION_REASONS: ReadonlySet<string> = new Set([
  'SCHEDULE_CONFLICT',
  'UNABLE_TO_REACH_SITE',
  'SCOPE_MISMATCH',
  'CUSTOMER_UNRESPONSIVE',
  'OTHER',
]);

const TERMINAL_JOB_STATUSES: ReadonlySet<string> = new Set([
  'PENDING_COMPLETION',
  'COMPLETED',
  'PAID',
  'CANCELLED',
  'EXPIRED',
  'DISPUTED',
  'RESOLVED',
]);

const READ_ONLY_JOB_STATUSES: ReadonlySet<string> = new Set([
  'PENDING_COMPLETION',
  'COMPLETED',
  'PAID',
  'CANCELLED',
  'EXPIRED',
  'DISPUTED',
  'RESOLVED',
]);

const FULFILMENT_ACTIONS: ReadonlySet<ProviderBookingAction> = new Set([
  'MARK_EN_ROUTE',
  'MARK_ARRIVED',
  'CHECK_IN',
  'CANCEL_BOOKING',
]);

const MASKED_STATUSES: ReadonlySet<string> = new Set([
  'COMPLETED',
  'PAID',
  'CANCELLED',
  'EXPIRED',
  'RESOLVED',
]);

const HELD_ESCROW_STATUSES: ReadonlySet<EscrowStatus> = new Set(['held_in_escrow']);

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
  if (!context.authenticated || context.role !== 'brainworker') {
    return { admitted: false, reason: 'UNAUTHENTICATED' };
  }

  if (!context.isBrainWorkerApproved) {
    return { admitted: false, reason: 'NOT_APPROVED' };
  }

  if (!context.operationalProfileIsComplete) {
    return { admitted: false, reason: 'PROFILE_INCOMPLETE' };
  }

  if (!booking) {
    return { admitted: false, reason: 'NOT_FOUND' };
  }

  if (booking.taskerProfileId !== context.brainWorkerId) {
    return { admitted: false, reason: 'NOT_FOUND' };
  }

  return { admitted: true };
}

// BOOK-005: privacy projection. The projection carries no customer phone, no
// customer email, and no billing field. Exact address presence is decided by
// evaluateAddressUnlock and is the only conditional field.
export function projectBookingSummary(
  booking: RawBookingRecord
): ProviderBookingSummary {
  const hasPendingScopeAdjustment = booking.scopeAdjustments.some(
    (adj) => adj.status === 'PENDING'
  );

  return {
    bookingId: booking.bookingId,
    referenceCode: booking.referenceCode,
    jobStatus: booking.jobStatus,
    dispatchStatus: booking.dispatchStatus,
    title: booking.title,
    serviceId: booking.serviceId,
    scheduledStartAt: booking.scheduledStartAt,
    generalLocation: {
      cityId: booking.generalLocation.cityId,
      neighbourhoodOrZone: booking.generalLocation.neighbourhoodOrZone,
    },
    escrowStatus: booking.escrowStatus,
    hasPendingScopeAdjustment,
    unreadMessageCount: booking.unreadMessageCount,
  };
}

export function projectBookingDetail(
  booking: RawBookingRecord
): ProviderBookingDetail {
  const summary = projectBookingSummary(booking);
  const unlockResult = evaluateAddressUnlock(
    {
      bookingResolved: true,
      privacyConsentRecorded: booking.privacyConsentRecorded,
      escrowStatus: booking.escrowStatus,
      jobStatus: booking.jobStatus,
    },
    booking.exactAddress
  );

  const allowedActions = computeAllowedActions({
    jobStatus: booking.jobStatus,
    dispatchStatus: booking.dispatchStatus,
    escrowStatus: booking.escrowStatus,
    scopeAdjustments: booking.scopeAdjustments,
    cancellationReason: booking.cancellationReason,
  });

  return {
    ...summary,
    description: booking.description,
    landmark: booking.generalLocation.landmark,
    exactAddress: unlockResult.unlocked ? unlockResult.exactAddress : undefined,
    dispatchUpdatedAt: booking.dispatchUpdatedAt,
    actualStartAt: booking.actualStartAt,
    scopeAdjustments: booking.scopeAdjustments,
    allowedActions,
    conversationId: booking.conversationId,
  };
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
  if (!inputs.bookingResolved) {
    return { unlocked: false, reason: 'BOOKING_NOT_RESOLVED' };
  }

  if (!inputs.privacyConsentRecorded) {
    return { unlocked: false, reason: 'PRIVACY_CONSENT_ABSENT' };
  }

  if (!HELD_ESCROW_STATUSES.has(inputs.escrowStatus)) {
    return { unlocked: false, reason: 'ESCROW_NOT_HELD' };
  }

  if (MASKED_STATUSES.has(inputs.jobStatus)) {
    return { unlocked: false, reason: 'LIFECYCLE_MASKED' };
  }

  return { unlocked: true, exactAddress };
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
  const { jobStatus, dispatchStatus, escrowStatus, scopeAdjustments, cancellationReason } = booking;

  const actions: ProviderBookingAction[] = [];

  if (READ_ONLY_JOB_STATUSES.has(jobStatus)) {
    return actions;
  }

  const hasPendingScope = scopeAdjustments.some((adj) => adj.status === 'PENDING');

  if (hasPendingScope) {
    actions.push('WITHDRAW_SCOPE_ADJUSTMENT');
  } else {
    actions.push('REQUEST_SCOPE_ADJUSTMENT');
  }

  actions.push('OPEN_CONVERSATION');

  if (jobStatus === 'CONFIRMED') {
    if (dispatchStatus === 'NOT_STARTED') {
      actions.push('MARK_EN_ROUTE');
      actions.push('CANCEL_BOOKING');
    } else if (dispatchStatus === 'EN_ROUTE') {
      actions.push('MARK_ARRIVED');
      actions.push('CANCEL_BOOKING');
    } else if (dispatchStatus === 'ARRIVED') {
      if (HELD_ESCROW_STATUSES.has(escrowStatus)) {
        actions.push('CHECK_IN');
      }
      actions.push('CANCEL_BOOKING');
    }
  } else if (jobStatus === 'IN_PROGRESS') {
    if (HELD_ESCROW_STATUSES.has(escrowStatus)) {
      actions.push('CHECK_IN');
    }
    actions.push('CANCEL_BOOKING');
  } else if (jobStatus === 'PENDING_ACCEPTANCE') {
    actions.push('CANCEL_BOOKING');
  } else if (jobStatus === 'OPEN') {
    actions.push('CANCEL_BOOKING');
  }

  if (jobStatus === 'DISPUTED') {
    actions.push('CANCEL_BOOKING');
  }

  return actions;
}

// BOOK-012: deterministic grouping and sort by scheduledStartAt from the
// authoritative value. No client-side ranking or urgency score.
export function groupAndSortBookings(
  bookings: ProviderBookingSummary[],
  now: Date
): { today: ProviderBookingSummary[]; upcoming: ProviderBookingSummary[]; closed: ProviderBookingSummary[] } {
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  const today: ProviderBookingSummary[] = [];
  const upcoming: ProviderBookingSummary[] = [];
  const closed: ProviderBookingSummary[] = [];

  for (const booking of bookings) {
    const scheduled = new Date(booking.scheduledStartAt);

    if (TERMINAL_JOB_STATUSES.has(booking.jobStatus)) {
      closed.push(booking);
    } else if (scheduled >= todayStart && scheduled <= todayEnd) {
      today.push(booking);
    } else if (scheduled > todayEnd) {
      upcoming.push(booking);
    } else {
      closed.push(booking);
    }
  }

  const sortByScheduled = (a: ProviderBookingSummary, b: ProviderBookingSummary) =>
    new Date(a.scheduledStartAt).getTime() - new Date(b.scheduledStartAt).getTime();

  today.sort(sortByScheduled);
  upcoming.sort(sortByScheduled);
  closed.sort(sortByScheduled);

  return { today, upcoming, closed };
}

// BOOK-015: guard against a composite status ever entering the module. The
// single JobStatus machine stays authoritative in packages/api-types.
const COMPOSITE_CANDIDATES: ReadonlySet<string> = new Set([
  'READY_FOR_CHECK_IN',
  'ESCROW_FUNDED',
]);

export function isCompositeStatusCandidate(value: string): boolean {
  return COMPOSITE_CANDIDATES.has(value);
}

export function assertJobStatusIsAuthoritative(status: string): void {
  if (!Object.keys(JOB_STATUS_TRANSITIONS).includes(status)) {
    throw new Error(`Invalid JobStatus: ${status}`);
  }

  if (isCompositeStatusCandidate(status)) {
    throw new Error(`Composite status not permitted: ${status}`);
  }
}

// BOOK-011 and BOOK-016 are proven by type and structure rather than by a
// runtime predicate. Re-export the authoritative values so tests assert
// against the real contract, not a copy.
export { JOB_STATUS_TRANSITIONS };
export type { EscrowStatus };