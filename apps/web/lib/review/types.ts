// apps/web/lib/review/types.ts
// Canonical domain types, interfaces, and error classes for WEB-016 Customer Reviews & Reputation System
// Authoritative reference: WEB-016 Architecture Contract v1.2

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Core Rating Primitives
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Authoritative 1-to-5 integer star rating.
 * Floating point, negative, zero, or out-of-bounds ratings are rejected.
 */
export type ReviewRating = 1 | 2 | 3 | 4 | 5;

/**
 * The four mandatory evaluation criteria for every BukieBrainJobs review.
 */
export interface ReviewRatings {
  punctuality: ReviewRating;
  quality: ReviewRating;
  communication: ReviewRating;
  overall: ReviewRating;
}

export type ReviewRatingCriterion = keyof ReviewRatings;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Review Entities & Projections
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Authoritative internal review record.
 * Uses bookingId as the canonical identifier linking to the completed booking.
 */
export interface CustomerReviewRecord {
  id: string;
  bookingId: string;
  customerId: string;
  customerName: string;
  brainWorkerId: string;
  ratings: ReviewRatings;
  comment?: string | undefined;
  createdAt: string; // ISO 8601 timestamp
}

/**
 * Publicly visible review projection on BrainWorker profile.
 * Masks private customer identifiers while preserving service verification context.
 */
export interface PublicBrainWorkerReview {
  id: string;
  reviewerDisplayName: string; // Masked for privacy, e.g. "Babajide A."
  ratings: ReviewRatings;
  comment?: string | undefined;
  serviceTitle: string; // e.g. "Plumbing Drainage Pressure Test"
  completedDate: string; // Month and year, e.g. "September 2026"
  isVerifiedBooking: true; // Verified completed booking marker
  createdAt: string; // ISO 8601 timestamp
}

/**
 * Authoritative reputation summary for a BrainWorker.
 * averageRating is strictly the mean of ReviewRatings.overall.
 * All averages rounded to 1 decimal place using round-half-up.
 */
export interface BrainWorkerReputationSummary {
  brainWorkerId: string;
  averageRating: number; // e.g. 4.9 (arithmetic mean of overall ratings)
  totalReviews: number;
  criteriaAverages: {
    punctuality: number;
    quality: number;
    communication: number;
    overall: number; // identical to averageRating
  };
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Review Eligibility & Form State
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type ReviewIneligibilityReason =
  | 'not_authenticated'
  | 'not_booking_owner'
  | 'booking_not_completed'
  | 'already_reviewed'
  | 'booking_not_found';

export interface ReviewBookingSummary {
  bookingId: string;
  referenceCode: string;
  serviceTitle: string;
  brainWorkerId: string;
  brainWorkerName: string;
  brainWorkerAvatar?: string | undefined;
  completedAt: string;
}

export interface ReviewEligibility {
  eligible: boolean;
  reason?: ReviewIneligibilityReason | undefined;
  bookingSummary?: ReviewBookingSummary | undefined;
  existingReview?: PublicBrainWorkerReview | undefined;
}

export type ReviewFormStatus =
  | 'idle'
  | 'editing'
  | 'submitting'
  | 'submitted'
  | 'validation_error'
  | 'authorization_error'
  | 'repository_error'
  | 'offline'
  | 'already_reviewed'
  | 'ineligible';

export interface SubmitReviewInput {
  bookingId: string;
  ratings: ReviewRatings;
  comment?: string | undefined;
}

export interface ReviewValidationErrors {
  punctuality?: string | undefined;
  quality?: string | undefined;
  communication?: string | undefined;
  overall?: string | undefined;
  comment?: string | undefined;
  bookingId?: string | undefined;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Moderation & Reporting Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type ReportStatus =
  | 'report_not_submitted'
  | 'report_submitting'
  | 'report_submitted'
  | 'report_already_submitted'
  | 'report_failed';

export type AbuseReportReason =
  | 'inappropriate_language'
  | 'false_information'
  | 'harassment'
  | 'spam_or_advertising'
  | 'privacy_violation'
  | 'other';

export interface SubmitReviewReportInput {
  reviewId: string;
  reason: AbuseReportReason;
  details?: string | undefined;
}

export interface ReviewReportResult {
  success: boolean;
  reportId?: string | undefined;
  status: ReportStatus;
  errorMessage?: string | undefined;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Authoritative Repository Interface
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface GetPublicReviewsOptions {
  page?: number | undefined;
  limit?: number | undefined;
}

export interface GetPublicReviewsResult {
  reviews: PublicBrainWorkerReview[];
  totalCount: number;
  reputationSummary: BrainWorkerReputationSummary;
}

export interface ICustomerReviewRepository {
  /**
   * Evaluates eligibility for an authenticated customer and booking.
   * Fails closed on invalid session, unauthorized caller, or non-completed booking.
   */
  getReviewEligibility(
    authenticatedCustomerId: string,
    bookingId: string
  ): Promise<ReviewEligibility>;

  /**
   * Atomically submits a customer review for a completed booking.
   * Enforces caller ownership, COMPLETED lifecycle, 1:1 uniqueness, and character bounds.
   */
  submitReview(
    authenticatedCustomerId: string,
    input: SubmitReviewInput
  ): Promise<CustomerReviewRecord>;

  /**
   * Retrieves sanitized public reviews and reputation summary for a BrainWorker.
   */
  getPublicReviews(
    brainWorkerId: string,
    options?: GetPublicReviewsOptions
  ): Promise<GetPublicReviewsResult>;

  /**
   * Submits an abuse report against a public review.
   * Rejects self-reporting and duplicate reports from the same customer.
   */
  reportReview(
    authenticatedCustomerId: string,
    input: SubmitReviewReportInput
  ): Promise<ReviewReportResult>;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Domain Error Classes
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class ValidationError extends Error {
  public readonly field?: string | undefined;
  public readonly errors?: ReviewValidationErrors | undefined;

  constructor(message: string, field?: string, errors?: ReviewValidationErrors) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.errors = errors;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string = 'Unauthorized: Caller does not have permission for this operation.') {
    super(message);
    this.name = 'UnauthorizedError';
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

export class LifecycleIneligibleError extends Error {
  public readonly currentStatus?: string | undefined;

  constructor(message: string, currentStatus?: string) {
    super(message);
    this.name = 'LifecycleIneligibleError';
    this.currentStatus = currentStatus;
    Object.setPrototypeOf(this, LifecycleIneligibleError.prototype);
  }
}

export class DuplicateReviewError extends Error {
  public readonly bookingId?: string | undefined;

  constructor(bookingId?: string) {
    super(
      bookingId
        ? `DuplicateReviewError: A review already exists for booking ${bookingId}. Reviews are immutable.`
        : 'DuplicateReviewError: A review already exists for this booking.'
    );
    this.name = 'DuplicateReviewError';
    this.bookingId = bookingId;
    Object.setPrototypeOf(this, DuplicateReviewError.prototype);
  }
}

export class NotFoundError extends Error {
  constructor(message: string = 'NotFoundError: The requested resource was not found.') {
    super(message);
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class NetworkUnavailableError extends Error {
  constructor(message: string = 'NetworkUnavailableError: The operation cannot be completed offline.') {
    super(message);
    this.name = 'NetworkUnavailableError';
    Object.setPrototypeOf(this, NetworkUnavailableError.prototype);
  }
}
