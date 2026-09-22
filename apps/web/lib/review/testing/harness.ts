// apps/web/lib/review/testing/harness.ts
// Isolated test harness and controller for WEB-016 repository contract tests.
// This module never imports from production `../repository.ts` during Phase 2 RED.
// The harness exposes the ICustomerReviewRepository interface so that tests
// target the contract, not the implementation.
//
// Architecture: WEB-016 Architecture Contract v1.2, Section 6.2 (Zero-Leakage Production Boundary)

import type {
  ICustomerReviewRepository,
  CustomerReviewRecord,
  PublicBrainWorkerReview,
  BrainWorkerReputationSummary,
  ReviewEligibility,
  SubmitReviewInput,
  SubmitReviewReportInput,
  ReviewReportResult,
  GetPublicReviewsResult,
  AbuseReportReason,
} from '../types';

import type {
  ReviewInternalBookingRecord,
} from './fixtures';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Internal Test Store
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface ReviewTestStore {
  /** Canonical booking records keyed by bookingId. */
  bookings: Map<string, ReviewInternalBookingRecord>;
  /** Submitted review records keyed by bookingId (one review per booking). */
  reviewsByBookingId: Map<string, CustomerReviewRecord>;
  /** All review records keyed by review ID (for public projection lookups). */
  reviewsById: Map<string, CustomerReviewRecord>;
  /** Abuse reports keyed by `${reviewId}::${reporterId}` composite key. */
  reports: Map<string, { reviewId: string; reporterId: string; reason: AbuseReportReason; details?: string; reportId: string }>;
  /** When true, the adapter simulates an unavailable storage/transport condition. */
  isStorageUnavailable: boolean;
  reset(): void;
}

export function createReviewTestStore(): ReviewTestStore {
  const store: ReviewTestStore = {
    bookings: new Map(),
    reviewsByBookingId: new Map(),
    reviewsById: new Map(),
    reports: new Map(),
    isStorageUnavailable: false,
    reset() {
      this.bookings.clear();
      this.reviewsByBookingId.clear();
      this.reviewsById.clear();
      this.reports.clear();
      this.isStorageUnavailable = false;
    },
  };
  return store;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Test Controller Interface
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface IReviewTestController {
  /** Seed a booking record into the test store. */
  seedBooking(booking: ReviewInternalBookingRecord): void;
  /** Seed multiple bookings at once. */
  seedBookings(bookings: ReviewInternalBookingRecord[]): void;
  /** Pre-seed a submitted review record (for already-reviewed scenarios). */
  seedReview(review: CustomerReviewRecord): void;
  /** Simulate storage/transport unavailability (repository offline test). */
  setStorageUnavailable(unavailable: boolean): void;
  /** Reset all store state to clean baseline. */
  reset(): void;
  /** Read current review count for state mutation verification. */
  getReviewCount(): number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Test Controller Implementation
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class ReviewTestController implements IReviewTestController {
  constructor(private readonly store: ReviewTestStore) {}

  seedBooking(booking: ReviewInternalBookingRecord): void {
    this.store.bookings.set(booking.bookingId, { ...booking });
  }

  seedBookings(bookings: ReviewInternalBookingRecord[]): void {
    for (const booking of bookings) {
      this.seedBooking(booking);
    }
  }

  seedReview(review: CustomerReviewRecord): void {
    this.store.reviewsByBookingId.set(review.bookingId, { ...review });
    this.store.reviewsById.set(review.id, { ...review });
  }

  setStorageUnavailable(unavailable: boolean): void {
    this.store.isStorageUnavailable = unavailable;
  }

  reset(): void {
    this.store.reset();
  }

  getReviewCount(): number {
    return this.store.reviewsById.size;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Stub Repository (Phase 2 RED: intentionally unimplemented)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Stub repository used during Phase 2 RED to expose the ICustomerReviewRepository interface.
 * All methods throw NotImplementedError. Phase 3 GREEN will replace this with
 * the production CustomerReviewRepository injected with the test store.
 *
 * This class is strictly test infrastructure and must never be referenced by production code.
 */
export class StubCustomerReviewRepository implements ICustomerReviewRepository {
  constructor(private readonly _store: ReviewTestStore) {}

  async getReviewEligibility(
    _authenticatedCustomerId: string,
    _bookingId: string
  ): Promise<ReviewEligibility> {
    throw new Error('[Stub] CustomerReviewRepository.getReviewEligibility is not yet implemented.');
  }

  async submitReview(
    _authenticatedCustomerId: string,
    _input: SubmitReviewInput
  ): Promise<CustomerReviewRecord> {
    throw new Error('[Stub] CustomerReviewRepository.submitReview is not yet implemented.');
  }

  async getPublicReviews(
    _brainWorkerId: string
  ): Promise<GetPublicReviewsResult> {
    throw new Error('[Stub] CustomerReviewRepository.getPublicReviews is not yet implemented.');
  }

  async reportReview(
    _authenticatedCustomerId: string,
    _input: SubmitReviewReportInput
  ): Promise<ReviewReportResult> {
    throw new Error('[Stub] CustomerReviewRepository.reportReview is not yet implemented.');
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Public Factory
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface ReviewTestHarness {
  repository: ICustomerReviewRepository;
  testController: IReviewTestController;
  store: ReviewTestStore;
}

/**
 * Creates an isolated review test harness with a clean store for each test.
 * During Phase 2 RED, the repository is a stub. Phase 3 GREEN will inject the
 * production CustomerReviewRepository implementation via this same factory interface.
 */
export function createReviewTestHarness(): ReviewTestHarness {
  const store = createReviewTestStore();
  const testController = new ReviewTestController(store);
  const repository = new StubCustomerReviewRepository(store);
  return { repository, testController, store };
}
