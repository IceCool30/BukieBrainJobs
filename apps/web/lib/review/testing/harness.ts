// apps/web/lib/review/testing/harness.ts
// Isolated test harness for WEB-016 repository contract tests.
// Phase 3 GREEN: replaces StubCustomerReviewRepository with IsolatedCustomerReviewRepository.
// The harness injects the ReviewTestStore into the production CustomerReviewRepository
// via a protected subclass — following the identical pattern used by the payment module.
//
// Architecture: WEB-016 Architecture Contract v1.2, Section 6.2 (Zero-Leakage Production Boundary)
// No test code is imported or executed from production modules.
// Production `repository.ts` does not import from this module.

import type { ICustomerReviewRepository, CustomerReviewRecord, AbuseReportReason } from '../types';
import type { ReviewInternalStore } from '../repository';
import { CustomerReviewRepository } from '../repository';

import type {
  ReviewInternalBookingRecord,
} from './fixtures';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Test Store
// Extends ReviewInternalStore with test-lifecycle reset() utility.
// Structurally satisfies ReviewInternalStore so IsolatedCustomerReviewRepository
// can accept it via the protected `store` field.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface ReviewTestStore extends ReviewInternalStore {
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
  /** Seed a single booking record into the test store. */
  seedBooking(booking: ReviewInternalBookingRecord): void;
  /** Seed multiple bookings at once. */
  seedBookings(bookings: ReviewInternalBookingRecord[]): void;
  /** Pre-seed a submitted review record (e.g., for already-reviewed scenarios). */
  seedReview(review: CustomerReviewRecord): void;
  /** Simulate storage/transport unavailability (offline boundary injection). */
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
// Isolated Repository (Phase 3 GREEN: injects test store into production class)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Extends the production CustomerReviewRepository and overrides its internal store
 * with the injected test store. This allows the test harness to seed state and
 * observe mutations without modifying production code.
 *
 * Follows the exact same pattern as IsolatedCustomerPaymentRepository in the payment module.
 */
class IsolatedCustomerReviewRepository extends CustomerReviewRepository {
  constructor(testStore: ReviewTestStore) {
    super();
    // Override the protected store with the injected test store
    this.store = testStore;
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
 * The repository is the production CustomerReviewRepository with a test store injected.
 * All repository behavior is real — only the storage layer is isolated.
 */
export function createReviewTestHarness(): ReviewTestHarness {
  const store = createReviewTestStore();
  const testController = new ReviewTestController(store);
  const repository = new IsolatedCustomerReviewRepository(store);
  return { repository, testController, store };
}
