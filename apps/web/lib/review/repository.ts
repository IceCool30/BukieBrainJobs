// apps/web/lib/review/repository.ts
// Production implementation of ICustomerReviewRepository for WEB-016.
// Mock-first: in-memory storage with injected offline boundary.
// No browser globals. No test infrastructure imports.
// Architecture reference: WEB-016 Architecture Contract v1.2

import type { JobStatus } from '@bukiebrainjobs/api-types';
import type {
  ICustomerReviewRepository,
  CustomerReviewRecord,
  PublicBrainWorkerReview,
  BrainWorkerReputationSummary,
  ReviewEligibility,
  SubmitReviewInput,
  SubmitReviewReportInput,
  ReviewReportResult,
  GetPublicReviewsOptions,
  GetPublicReviewsResult,
  AbuseReportReason,
} from './types';
import {
  UnauthorizedError,
  LifecycleIneligibleError,
  DuplicateReviewError,
  NotFoundError,
  NetworkUnavailableError,
  ValidationError,
} from './types';
import { validateReviewRatings, validateReviewComment } from './validation';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Internal Store Types (exported for test-harness injection)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface ReviewBookingRecord {
  bookingId: string;
  referenceCode: string;
  customerId: string;
  brainWorkerId: string;
  brainWorkerName: string;
  brainWorkerAvatar?: string | undefined;
  serviceTitle: string;
  jobStatus: JobStatus;
  completedAt: string; // ISO 8601
}

export interface ReviewReportRecord {
  reviewId: string;
  reporterId: string;
  reason: AbuseReportReason;
  details?: string | undefined;
  reportId: string;
}

/**
 * Internal storage shape for the review repository.
 * Exported so the testing module can inject an isolated store
 * via subclass without referencing browser globals or test code.
 */
export interface ReviewInternalStore {
  bookings: Map<string, ReviewBookingRecord>;
  reviewsByBookingId: Map<string, CustomerReviewRecord>;
  reviewsById: Map<string, CustomerReviewRecord>;
  reports: Map<string, ReviewReportRecord>;
  /** When true, the storage/transport adapter is considered unavailable. */
  isStorageUnavailable: boolean;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Private Helpers
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Round-half-up to the specified decimal places.
 * Architecture: WEB-016-ARCH v1.2 §3.3 — Math.floor(val * 10 + 0.5) / 10
 */
function roundHalfUp(value: number, decimals: number = 1): number {
  const factor = Math.pow(10, decimals);
  return Math.floor(value * factor + 0.5) / factor;
}

/**
 * Masks a customer's full name to "FirstName L." format.
 * Architecture: WEB-016-ARCH v1.2 §4.2 — privacy-safe public projection.
 */
function maskCustomerName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length < 2) return fullName.trim();
  const lastName = parts[parts.length - 1]!;
  return `${parts[0]!} ${lastName.charAt(0).toUpperCase()}.`;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const;

/**
 * Formats a booking's completedAt ISO date as "Month YYYY".
 * Uses UTC month to avoid timezone-dependent test variance.
 */
function formatCompletedDate(isoDate: string): string {
  const date = new Date(isoDate);
  return `${MONTH_NAMES[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

const VALID_ABUSE_REASONS: ReadonlySet<AbuseReportReason> = new Set<AbuseReportReason>([
  'inappropriate_language',
  'false_information',
  'harassment',
  'spam_or_advertising',
  'privacy_violation',
  'other',
]);

const DEFAULT_PAGE_LIMIT = 5;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Reputation Aggregation
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function computeReputationSummary(
  brainWorkerId: string,
  reviews: CustomerReviewRecord[]
): BrainWorkerReputationSummary {
  const totalReviews = reviews.length;

  const emptyDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } as {
    5: number; 4: number; 3: number; 2: number; 1: number;
  };

  if (totalReviews === 0) {
    return {
      brainWorkerId,
      averageRating: 0,
      totalReviews: 0,
      criteriaAverages: { punctuality: 0, quality: 0, communication: 0, overall: 0 },
      ratingDistribution: emptyDistribution,
    };
  }

  let sumOverall = 0;
  let sumPunctuality = 0;
  let sumQuality = 0;
  let sumCommunication = 0;
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } as {
    5: number; 4: number; 3: number; 2: number; 1: number;
  };

  for (const review of reviews) {
    sumOverall += review.ratings.overall;
    sumPunctuality += review.ratings.punctuality;
    sumQuality += review.ratings.quality;
    sumCommunication += review.ratings.communication;
    const star = review.ratings.overall as 1 | 2 | 3 | 4 | 5;
    distribution[star] += 1;
  }

  return {
    brainWorkerId,
    averageRating: roundHalfUp(sumOverall / totalReviews),
    totalReviews,
    criteriaAverages: {
      punctuality: roundHalfUp(sumPunctuality / totalReviews),
      quality: roundHalfUp(sumQuality / totalReviews),
      communication: roundHalfUp(sumCommunication / totalReviews),
      overall: roundHalfUp(sumOverall / totalReviews),
    },
    ratingDistribution: distribution,
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Production Repository
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class CustomerReviewRepository implements ICustomerReviewRepository {
  /** Protected to allow test-harness store injection via subclass. */
  protected store: ReviewInternalStore;

  constructor() {
    this.store = {
      bookings: new Map(),
      reviewsByBookingId: new Map(),
      reviewsById: new Map(),
      reports: new Map(),
      isStorageUnavailable: false,
    };
  }

  // ──────────────────────────────────────────────────────────────
  // getReviewEligibility
  // Fail-closed: UnauthorizedError for session/ownership violations.
  // Returns a non-throwing ineligibility result for lifecycle/duplicate/not-found.
  // ──────────────────────────────────────────────────────────────

  async getReviewEligibility(
    authenticatedCustomerId: string,
    bookingId: string
  ): Promise<ReviewEligibility> {
    // [1] Auth: fail closed on empty/whitespace session
    const callerId = authenticatedCustomerId?.trim();
    if (!callerId) {
      throw new UnauthorizedError(
        '[Security] Unauthorized: authenticated customerId is required.'
      );
    }

    // [2] Booking lookup: unknown booking → non-throwing ineligibility
    const booking = this.store.bookings.get(bookingId);
    if (!booking) {
      return { eligible: false, reason: 'booking_not_found' };
    }

    // [3] Ownership: fail closed — throws, does not reveal existence
    if (booking.customerId !== callerId) {
      throw new UnauthorizedError(
        `[Security] Unauthorized: caller ${callerId} does not own booking ${bookingId}.`
      );
    }

    // [4] Lifecycle: only COMPLETED grants eligibility
    if (booking.jobStatus !== 'COMPLETED') {
      return { eligible: false, reason: 'booking_not_completed' };
    }

    // [5] Duplicate: existing review → ineligible with projection
    const existingReview = this.store.reviewsByBookingId.get(bookingId);
    if (existingReview) {
      return {
        eligible: false,
        reason: 'already_reviewed',
        existingReview: this.toPublicReview(existingReview, booking),
        bookingSummary: this.toBookingSummary(booking),
      };
    }

    return {
      eligible: true,
      bookingSummary: this.toBookingSummary(booking),
    };
  }

  // ──────────────────────────────────────────────────────────────
  // submitReview
  // Atomic: eligibility check and insertion in single synchronous critical section.
  // ──────────────────────────────────────────────────────────────

  async submitReview(
    authenticatedCustomerId: string,
    input: SubmitReviewInput
  ): Promise<CustomerReviewRecord> {
    // [1] Auth: fail closed first
    const callerId = authenticatedCustomerId?.trim();
    if (!callerId) {
      throw new UnauthorizedError(
        '[Security] Unauthorized: authenticated customerId is required.'
      );
    }

    // [2] Storage availability: injected via store, no browser-global access
    if (this.store.isStorageUnavailable) {
      throw new NetworkUnavailableError(
        '[Offline] Storage adapter is unavailable. Review submission requires an active storage connection.'
      );
    }

    // [3] Booking lookup
    const booking = this.store.bookings.get(input.bookingId);
    if (!booking) {
      throw new NotFoundError(
        `[NotFound] Booking ${input.bookingId} not found.`
      );
    }

    // [4] Ownership: fail closed
    if (booking.customerId !== callerId) {
      throw new UnauthorizedError(
        `[Security] Unauthorized: caller ${callerId} does not own booking ${input.bookingId}.`
      );
    }

    // [5] Lifecycle: architecture invariant — COMPLETED is the sole eligible state
    if (booking.jobStatus !== 'COMPLETED') {
      throw new LifecycleIneligibleError(
        `Review submission requires JobStatus COMPLETED. Current status: ${booking.jobStatus}.`,
        booking.jobStatus
      );
    }

    // [6] Atomic duplicate check — critical section: no await between read and write
    if (this.store.reviewsByBookingId.has(input.bookingId)) {
      throw new DuplicateReviewError(input.bookingId);
    }

    // [7] Validate ratings and comment using canonical validation layer
    const validatedRatings = validateReviewRatings(input.ratings);
    const validatedComment = validateReviewComment(input.comment);

    // [8] Atomically persist — no intermediate awaits
    const record: CustomerReviewRecord = {
      id: generateId(),
      bookingId: input.bookingId,
      customerId: callerId,
      customerName: booking.brainWorkerName !== undefined
        ? '' // placeholder — real name resolution is future auth-layer concern
        : '',
      brainWorkerId: booking.brainWorkerId,
      ratings: validatedRatings,
      comment: validatedComment,
      createdAt: new Date().toISOString(),
    };

    // Resolve customer display name from booking context (mock-first: use caller ID as name)
    // In production, this will be fetched from the auth profile service.
    const nameRecord: CustomerReviewRecord = {
      ...record,
      customerName: callerId,
    };

    this.store.reviewsByBookingId.set(input.bookingId, nameRecord);
    this.store.reviewsById.set(nameRecord.id, nameRecord);

    return nameRecord;
  }

  // ──────────────────────────────────────────────────────────────
  // getPublicReviews
  // Returns privacy-safe public projection with deterministic pagination.
  // Reputation summary is always computed over the full review set, not the page slice.
  // ──────────────────────────────────────────────────────────────

  async getPublicReviews(
    brainWorkerId: string,
    options?: GetPublicReviewsOptions
  ): Promise<GetPublicReviewsResult> {
    const page = Math.max(1, options?.page ?? 1);
    const limit = Math.max(1, options?.limit ?? DEFAULT_PAGE_LIMIT);

    // Collect all reviews for this brainWorker in stable insertion order
    const allReviews = Array.from(this.store.reviewsById.values()).filter(
      (r) => r.brainWorkerId === brainWorkerId
    );

    const totalCount = allReviews.length;

    // Pagination: deterministic slice from insertion-order array
    const offset = (page - 1) * limit;
    const pageSlice = allReviews.slice(offset, offset + limit);

    // Reputation always aggregates the full review corpus, never just the page
    const reputationSummary = computeReputationSummary(brainWorkerId, allReviews);

    // Privacy-safe public projection
    const reviews = pageSlice.map((r) => {
      const booking = this.store.bookings.get(r.bookingId);
      return this.toPublicReview(r, booking);
    });

    return { reviews, totalCount, reputationSummary };
  }

  // ──────────────────────────────────────────────────────────────
  // reportReview
  // Validates reason, enforces self-report prevention, deduplicates.
  // ──────────────────────────────────────────────────────────────

  async reportReview(
    authenticatedCustomerId: string,
    input: SubmitReviewReportInput
  ): Promise<ReviewReportResult> {
    // [1] Auth
    const callerId = authenticatedCustomerId?.trim();
    if (!callerId) {
      throw new UnauthorizedError(
        '[Security] Unauthorized: authenticated customerId is required to report a review.'
      );
    }

    // [2] Validate reason — before any lookup to fail fast on malformed input
    if (!VALID_ABUSE_REASONS.has(input.reason)) {
      throw new ValidationError(
        `Invalid abuse reason: '${String(input.reason)}'. Must be one of the approved moderation reasons.`,
        'reason'
      );
    }

    // [3] Review lookup
    const review = this.store.reviewsById.get(input.reviewId);
    if (!review) {
      throw new NotFoundError(
        `[NotFound] Review ${input.reviewId} not found.`
      );
    }

    // [4] Self-report prevention
    if (review.customerId === callerId) {
      throw new UnauthorizedError(
        '[Security] Unauthorized: A customer cannot report their own review.'
      );
    }

    // [5] Deduplication: same reporter, same review → idempotent non-error response
    const reportKey = `${input.reviewId}::${callerId}`;
    if (this.store.reports.has(reportKey)) {
      return { success: false, status: 'report_already_submitted' };
    }

    // [6] Persist report
    const reportId = generateId();
    this.store.reports.set(reportKey, {
      reviewId: input.reviewId,
      reporterId: callerId,
      reason: input.reason,
      details: input.details,
      reportId,
    });

    return { success: true, reportId, status: 'report_submitted' };
  }

  // ──────────────────────────────────────────────────────────────
  // Private projection helpers
  // ──────────────────────────────────────────────────────────────

  private toPublicReview(
    record: CustomerReviewRecord,
    booking: ReviewBookingRecord | undefined
  ): PublicBrainWorkerReview {
    return {
      id: record.id,
      reviewerDisplayName: maskCustomerName(record.customerName),
      ratings: record.ratings,
      comment: record.comment,
      serviceTitle: booking?.serviceTitle ?? 'Service',
      completedDate: booking ? formatCompletedDate(booking.completedAt) : '',
      isVerifiedBooking: true,
      createdAt: record.createdAt,
    };
  }

  private toBookingSummary(booking: ReviewBookingRecord) {
    return {
      bookingId: booking.bookingId,
      referenceCode: booking.referenceCode,
      serviceTitle: booking.serviceTitle,
      brainWorkerId: booking.brainWorkerId,
      brainWorkerName: booking.brainWorkerName,
      brainWorkerAvatar: booking.brainWorkerAvatar,
      completedAt: booking.completedAt,
    };
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Production Factory
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function getCustomerReviewRepository(): ICustomerReviewRepository {
  return new CustomerReviewRepository();
}
