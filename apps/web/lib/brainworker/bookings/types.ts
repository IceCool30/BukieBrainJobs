// apps/web/lib/brainworker/bookings/types.ts
// BW-004 Phase 1: Domain Contracts and Projection
// Governed by: BW-004-ARCH v0.2 section 5 (Core Contracts), section 6 (Repository)
// RED phase. Contract shapes are transcribed from the approved architecture
// contract. No behaviour is implemented here.

import type { JobStatus } from '@bukiebrainjobs/api-types';
import type { EscrowStatus } from '../../payment/types';

// -- Dispatch (ARCH section 5) ----------------------------------------------
// Forward-only, three values. Check-in is a lifecycle transition, not a
// dispatch status. No composite value such as CHECKED_IN is permitted.
export type DispatchStatus = 'NOT_STARTED' | 'EN_ROUTE' | 'ARRIVED';

// -- Scope adjustment (ARCH section 5, Gate 1, Gate 3) ----------------------
export type ScopeAdjustmentStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'WITHDRAWN'
  | 'EXPIRED';

export type ScopeAdjustmentReason =
  | 'ADDITIONAL_PARTS'
  | 'ADDITIONAL_LABOR'
  | 'BOTH';

export interface ScopeAdjustmentDraft {
  reason: ScopeAdjustmentReason;
  additionalLaborKobo: number;
  additionalMaterialsKobo: number;
  note?: string | undefined;
}

export interface ScopeAdjustment extends ScopeAdjustmentDraft {
  id: string;
  bookingId: string;
  totalAdditionalKobo: number;
  status: ScopeAdjustmentStatus;
  submittedAt: string;
  decidedAt?: string | undefined;
}

// -- Cancellation (ARCH section 5, D6 [OWNER]) -----------------------------
// This is the architecture contract's PROPOSED taxonomy. docs/scope.md records
// it as unconfirmed and the consequences as undecided. It is transcribed, not
// decided. No penalty, reputation, refund, or escrow effect exists on this type.
export type ProviderCancellationReason =
  | 'SCHEDULE_CONFLICT'
  | 'UNABLE_TO_REACH_SITE'
  | 'SCOPE_MISMATCH'
  | 'CUSTOMER_UNRESPONSIVE'
  | 'OTHER';

// -- Allowed actions (ARCH section 5) ---------------------------------------
// Computed by the authority at read time. The UI renders and never recomputes.
export type ProviderBookingAction =
  | 'MARK_EN_ROUTE'
  | 'MARK_ARRIVED'
  | 'CHECK_IN'
  | 'REQUEST_SCOPE_ADJUSTMENT'
  | 'WITHDRAW_SCOPE_ADJUSTMENT'
  | 'CANCEL_BOOKING'
  | 'OPEN_CONVERSATION';

// -- Location (ARCH section 8) ----------------------------------------------
// The client supplies a snapshot. The authority decides validity against a
// configured threshold. No numeric radius appears in this module.
export interface LocationSnapshot {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
}
// -- Provider projections (ARCH section 5) ----------------------------------
// generalLocation is a structured object, not a preformatted string. The
// authority composes display copy; the projection carries the parts.
export interface GeneralLocation {
  cityId: string;
  neighbourhoodOrZone: string;
  landmark?: string | undefined;
}

export interface ProviderBookingSummary {
  bookingId: string;
  referenceCode: string;
  jobStatus: JobStatus;
  dispatchStatus: DispatchStatus;
  title: string;
  serviceId: string;
  scheduledStartAt: string;
  generalLocation: GeneralLocation;
  escrowStatus: EscrowStatus;
  hasPendingScopeAdjustment: boolean;
  unreadMessageCount: number;
}

export interface ProviderBookingDetail extends ProviderBookingSummary {
  description: string;
  landmark?: string | undefined;
  exactAddress?: string | undefined;
  dispatchUpdatedAt?: string | undefined;
  actualStartAt?: string | undefined;
  scopeAdjustments: ScopeAdjustment[];
  allowedActions: ProviderBookingAction[];
  conversationId?: string | undefined;
}

// -- Raw stored booking -----------------------------------------------------
// Internal only. Never returned to the provider projection.
export interface RawBookingRecord {
  bookingId: string;
  taskerProfileId: string;
  jobId: string;
  referenceCode: string;
  title: string;
  description: string;
  serviceId: string;
  scheduledStartAt: string;
  jobStatus: JobStatus;
  dispatchStatus: DispatchStatus;
  generalLocation: GeneralLocation;
  exactAddress: string;
  escrowStatus: EscrowStatus;
  privacyConsentRecorded: boolean;
  cancellationReason?: ProviderCancellationReason | undefined;
  scopeAdjustments: ScopeAdjustment[];
  unreadMessageCount: number;
  conversationId?: string | undefined;
  dispatchUpdatedAt?: string | undefined;
  actualStartAt?: string | undefined;
}

// -- Refusals (ARCH section 6) ----------------------------------------------
// NOT_FOUND covers both a missing booking and a booking owned by another
// provider. There is deliberately no distinguishable foreign-booking refusal.
export type BookingRefusalReason =
  | 'UNAUTHENTICATED'
  | 'NOT_APPROVED'
  | 'PROFILE_INCOMPLETE'
  | 'NOT_FOUND'
  | 'INVALID_TRANSITION'
  | 'OFFLINE'
  | 'ESCROW_NOT_HELD'
  | 'LOCATION_UNAVAILABLE'
  | 'LOCATION_OUT_OF_RANGE'
  | 'LOCATION_ACCURACY_TOO_LOW'
  | 'SCOPE_ADJUSTMENT_ALREADY_PENDING'
  | 'VALIDATION_FAILED'
  | 'STALE_STATE';

export type BookingMutationResult =
  | {
      ok: true;
      bookingId: string;
      jobStatus: JobStatus;
      dispatchStatus: DispatchStatus;
      updatedAt: string;
    }
  | {
      ok: false;
      reason: BookingRefusalReason;
      authoritative?: {
        jobStatus: JobStatus;
        dispatchStatus: DispatchStatus;
        escrowStatus: EscrowStatus;
      };
    };

export interface BookingPage {
  items: ProviderBookingSummary[];
  nextCursor?: string | undefined;
}

// -- Address unlock (ARCH section 5, D8) ------------------------------------
// Three independent inputs, all required: booking resolution, privacy policy,
// and escrow policy. Losing any one returns the view to the general area.
// DISPUTED is excluded from the mask-back list because evidence may be needed;
// that exclusion is [OWNER] item 5 and is not decided here.
export type AddressUnlockRefusal =
  | 'BOOKING_NOT_RESOLVED'
  | 'PRIVACY_CONSENT_ABSENT'
  | 'ESCROW_NOT_HELD'
  | 'LIFECYCLE_MASKED';

export interface AddressUnlockInputs {
  bookingResolved: boolean;
  privacyConsentRecorded: boolean;
  escrowStatus: EscrowStatus;
  jobStatus: JobStatus;
}

export type AddressUnlockResult =
  | { unlocked: true; exactAddress: string }
  | { unlocked: false; reason: AddressUnlockRefusal };

// -- Repository (ARCH section 6) -------------------------------------------
// No method approves, rejects, or expires a scope adjustment (Gate 1).
// No method writes escrow, payment, refund, or payout (Gate 3).
export interface IBrainWorkerBookingsRepository {
  getBookings(
    brainWorkerId: string,
    options?: { cursor?: string | undefined; limit?: number | undefined }
  ): Promise<BookingPage>;

  getBooking(
    brainWorkerId: string,
    bookingId: string
  ): Promise<ProviderBookingDetail | null>;

  updateDispatchStatus(
    brainWorkerId: string,
    bookingId: string,
    next: 'EN_ROUTE' | 'ARRIVED',
    snapshot?: LocationSnapshot | undefined
  ): Promise<BookingMutationResult>;

  checkIn(
    brainWorkerId: string,
    bookingId: string,
    snapshot: LocationSnapshot
  ): Promise<BookingMutationResult>;

  requestScopeAdjustment(
    brainWorkerId: string,
    bookingId: string,
    draft: ScopeAdjustmentDraft
  ): Promise<ScopeAdjustment>;

  withdrawScopeAdjustment(
    brainWorkerId: string,
    bookingId: string,
    adjustmentId: string
  ): Promise<ScopeAdjustment>;

  cancelBooking(
    brainWorkerId: string,
    bookingId: string,
    reason: ProviderCancellationReason
  ): Promise<BookingMutationResult>;

  // Declared as a property signature. An optional method cannot return an
  // arrow function type directly.
  subscribe?: (
    brainWorkerId: string,
    listener: (event: BookingFeedEvent) => void
  ) => () => void;
}

// Domain events only. BW-004 never writes a notification record.
export type BookingFeedEvent =
  | { type: 'DISPATCH_UPDATED'; bookingId: string; dispatchStatus: DispatchStatus; timestamp: string }
  | { type: 'CHECKED_IN'; bookingId: string; timestamp: string }
  | { type: 'SCOPE_ADJUSTMENT_REQUESTED'; bookingId: string; adjustmentId: string; timestamp: string }
  | { type: 'SCOPE_ADJUSTMENT_WITHDRAWN'; bookingId: string; adjustmentId: string; timestamp: string }
  | { type: 'BOOKING_CANCELLED_BY_PROVIDER'; bookingId: string; reason: ProviderCancellationReason; timestamp: string };
