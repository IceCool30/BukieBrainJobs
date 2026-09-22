// apps/web/lib/review/testing/fixtures.ts
// Deterministic test fixtures for WEB-016 repository contract tests.
// All fixture data is isolated to this testing module and never imported by production code.

import type {
  CustomerReviewRecord,
  ReviewRatings,
  PublicBrainWorkerReview,
} from '../types';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Fixture: Canonical Customer IDs
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const FIXTURE_CUSTOMER_ID = 'usr-customer-review-01';
export const FIXTURE_OTHER_CUSTOMER_ID = 'usr-customer-review-02';
export const FIXTURE_BRAINWORKER_ID = 'usr-brainworker-review-01';
export const FIXTURE_OTHER_BRAINWORKER_ID = 'usr-brainworker-review-02';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Fixture: Internal Booking Records (Test Harness State)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import type { JobStatus } from '@bukiebrainjobs/api-types';

export interface ReviewInternalBookingRecord {
  bookingId: string;
  referenceCode: string;
  customerId: string;
  brainWorkerId: string;
  brainWorkerName: string;
  brainWorkerAvatar?: string | undefined;
  serviceTitle: string;
  jobStatus: JobStatus;
  completedAt: string;
}

export const FIXTURE_COMPLETED_BOOKING: ReviewInternalBookingRecord = {
  bookingId: 'book-completed-rev-001',
  referenceCode: 'BKG-REV001',
  customerId: FIXTURE_CUSTOMER_ID,
  brainWorkerId: FIXTURE_BRAINWORKER_ID,
  brainWorkerName: 'Emeka Okafor',
  brainWorkerAvatar: '/images/workers/emeka.jpg',
  serviceTitle: 'AC Deep Chemical Cleaning',
  jobStatus: 'COMPLETED',
  completedAt: '2026-09-20T14:00:00.000Z',
};

export const FIXTURE_ALREADY_REVIEWED_BOOKING: ReviewInternalBookingRecord = {
  bookingId: 'book-already-reviewed-001',
  referenceCode: 'BKG-REVDUP01',
  customerId: FIXTURE_CUSTOMER_ID,
  brainWorkerId: FIXTURE_BRAINWORKER_ID,
  brainWorkerName: 'Emeka Okafor',
  serviceTitle: 'Plumbing Drainage Pressure Test',
  jobStatus: 'COMPLETED',
  completedAt: '2026-09-15T10:00:00.000Z',
};

/** All non-COMPLETED lifecycle states parameterized for REP-006. */
export const NON_COMPLETED_JOB_STATUSES: JobStatus[] = [
  'OPEN',
  'PENDING_ACCEPTANCE',
  'CONFIRMED',
  'IN_PROGRESS',
  'PENDING_COMPLETION',
  'PAID',
  'CANCELLED',
  'EXPIRED',
  'DISPUTED',
  'RESOLVED',
];

export const NON_COMPLETED_BOOKINGS: ReviewInternalBookingRecord[] =
  NON_COMPLETED_JOB_STATUSES.map((status, i) => ({
    bookingId: `book-ineligible-${status.toLowerCase()}-${i}`,
    referenceCode: `BKG-INELIGIBLE${i}`,
    customerId: FIXTURE_CUSTOMER_ID,
    brainWorkerId: FIXTURE_BRAINWORKER_ID,
    brainWorkerName: 'Emeka Okafor',
    serviceTitle: `Service Booking (${status})`,
    jobStatus: status,
    completedAt: '2026-09-10T08:00:00.000Z',
  }));

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Fixture: Valid Ratings Combinations
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const FIXTURE_RATINGS_FIVE_STAR: ReviewRatings = {
  punctuality: 5,
  quality: 5,
  communication: 5,
  overall: 5,
};

export const FIXTURE_RATINGS_MIXED: ReviewRatings = {
  punctuality: 4,
  quality: 5,
  communication: 3,
  overall: 4,
};

export const FIXTURE_RATINGS_FOR_AVERAGE: ReviewRatings[] = [
  { punctuality: 4, quality: 4, communication: 4, overall: 4 },
  { punctuality: 5, quality: 5, communication: 5, overall: 5 },
  { punctuality: 3, quality: 3, communication: 3, overall: 4 },
];

/** Produces an averageRating of 4.3 (mean of 4, 5, 4 for overall) */
export const FIXTURE_REPUTATION_REVIEWS_FOR_ROUNDING: ReviewRatings[] = [
  { punctuality: 4, quality: 5, communication: 4, overall: 4 },
  { punctuality: 5, quality: 5, communication: 5, overall: 5 },
  { punctuality: 4, quality: 4, communication: 4, overall: 4 },
];

/**
 * Rounding boundary reviews — mean of overall is 4.65 (must round to 4.7 via round-half-up).
 * REP-021: Four reviews averaging 4.65 = (5+4+5+4.6 => only integers valid)
 *
 * To get a mean of 4.65 using integer 1-5 ratings:
 * 20 reviews: 13 × 5 + 7 × 4 = 65 + 28 = 93; 93 / 20 = 4.65
 */
export const FIXTURE_RATINGS_ROUND_UP_BOUNDARY: ReviewRatings[] = [
  // 13 five-star overall ratings
  ...Array(13).fill({ punctuality: 5, quality: 5, communication: 5, overall: 5 }),
  // 7 four-star overall ratings
  ...Array(7).fill({ punctuality: 4, quality: 4, communication: 4, overall: 4 }),
];

/**
 * Rounding boundary reviews — mean of overall is 4.64 (must round to 4.6 via round-half-up).
 * 25 reviews: 16 × 5 + 9 × 4 = 80 + 36 = 116; 116 / 25 = 4.64
 */
export const FIXTURE_RATINGS_ROUND_DOWN_BOUNDARY: ReviewRatings[] = [
  ...Array(16).fill({ punctuality: 5, quality: 5, communication: 5, overall: 5 }),
  ...Array(9).fill({ punctuality: 4, quality: 4, communication: 4, overall: 4 }),
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Fixture: Pre-seeded CustomerReviewRecord (for already-reviewed scenarios)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const FIXTURE_EXISTING_REVIEW: CustomerReviewRecord = {
  id: 'rev-fixture-existing-001',
  bookingId: FIXTURE_ALREADY_REVIEWED_BOOKING.bookingId,
  customerId: FIXTURE_CUSTOMER_ID,
  customerName: 'Adaeze Nwosu',
  brainWorkerId: FIXTURE_BRAINWORKER_ID,
  ratings: FIXTURE_RATINGS_FIVE_STAR,
  comment: 'Excellent service. Very punctual and professional.',
  createdAt: '2026-09-15T12:00:00.000Z',
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Fixture: Public Review for Report Tests
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const FIXTURE_PUBLIC_REVIEW: PublicBrainWorkerReview = {
  id: 'rev-public-fixture-001',
  reviewerDisplayName: 'Adaeze N.',
  ratings: FIXTURE_RATINGS_FIVE_STAR,
  comment: 'Very professional and punctual.',
  serviceTitle: 'Plumbing Drainage Pressure Test',
  completedDate: 'September 2026',
  isVerifiedBooking: true,
  createdAt: '2026-09-15T12:00:00.000Z',
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Fixture: Pagination
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** 12 completed bookings with reviews for a single BrainWorker — used in pagination tests. */
export function buildPaginationFixtureBookings(
  brainWorkerId: string,
  count: number
): ReviewInternalBookingRecord[] {
  return Array.from({ length: count }, (_, i) => ({
    bookingId: `book-paginated-${brainWorkerId}-${i + 1}`,
    referenceCode: `BKG-PAG${i + 1}`,
    customerId: `usr-customer-pagtest-${i + 1}`,
    brainWorkerId,
    brainWorkerName: 'Babatunde Adeleke',
    serviceTitle: `Service ${i + 1}`,
    jobStatus: 'COMPLETED' as JobStatus,
    completedAt: `2026-09-${String(i + 1).padStart(2, '0')}T10:00:00.000Z`,
  }));
}
