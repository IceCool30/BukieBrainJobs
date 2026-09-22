# Spec: WEB-016 Customer Reviews & Reputation System Architecture Contract (v1.2)

| Field | Value |
|---|---|
| **Document ID** | WEB-016-ARCH |
| **Feature** | Customer Reviews & Reputation System |
| **Status** | 🟡 Proposed for Architecture Approval (Revised v1.2) |
| **Version** | 1.2 |
| **Workstream** | Phase 1 — Customer Web Platform Completion |
| **Governing Loop** | Mr. Solomon 9-Command Engineering Loop (`/architect`) |
| **Scope Contract** | WEB-016 Scope & Product Contract v1.0 |
| **Date** | 2026-09-21 |

---

## 1. Executive Summary & Core Architectural Doctrine

WEB-016 establishes the customer-facing Reviews & Reputation architecture for the BukieBrainJobs platform. Once a service booking reaches `JobStatus: COMPLETED`, an authenticated customer who owns that booking can submit a multi-criteria structured review, rate the BrainWorker across four required dimensions, provide written feedback within explicit character limits, view verified public reviews on BrainWorker profiles, and flag inappropriate content for moderation.

### Core Architectural Doctrine
> **The UI renders authoritative state; it does not manufacture state.**
>
> The frontend collects and presents customer sentiment, but it cannot authoritatively manufacture review eligibility, mutate moderation records, or fabricate reputation scores. All eligibility evaluations, duplicate submission protections, and review projections originate from authoritative domain rules enforced at the repository boundary.

---

## 2. Authoritative Lifecycle & Eligibility Invariants

### 2.1 Sole Lifecycle Prerequisite: `JobStatus === COMPLETED`
Review eligibility is evaluated exclusively against the authoritative `JobStatus` lifecycle value defined in `@bukiebrainjobs/api-types`.

- WEB-016 requires `JobStatus === 'COMPLETED'`.
- Financial states such as escrow settlement, payment authorization, refund state, or release state do not independently grant review eligibility.
- If the authoritative `JobStatus` has transitioned from `COMPLETED` to another lifecycle value such as `PAID`, that value is not eligible under the WEB-016 rule because review submission requires the exact `COMPLETED` lifecycle state.
- No review may be submitted for bookings in `OPEN`, `PENDING_ACCEPTANCE`, `CONFIRMED`, `IN_PROGRESS`, `PENDING_COMPLETION`, `PAID`, `DISPUTED`, or `CANCELLED`.

### 2.2 Formal Eligibility Equation
A customer is eligible to submit a review if and only if all five conditions hold:

$$\text{Eligible} = (\text{AuthSession} \neq \emptyset) \land (\text{CallerId} = \text{Booking.CustomerId}) \land (\text{BookingExists} = \text{true}) \land (\text{JobStatus} = \text{COMPLETED}) \land (\text{ExistingReview} = \emptyset)$$

If any single condition fails, review submission fails closed.

### 2.3 Authoritative Lifecycle & State Matrix

| JobStatus | Booking Ownership | Existing Review? | Connectivity | Review Eligible? | System Behavior & UI State |
|:---|:---|:---|:---|:---|:---|
| `COMPLETED` | Matches Caller | No | Online | **YES** | Active prompt; interactive form (`idle` / `editing`) |
| `COMPLETED` | Matches Caller | Yes | Any | **NO** | Submission disabled; renders submitted review (`already_reviewed`) |
| `COMPLETED` | Caller $\neq$ Owner | Any | Any | **NO** | Access denied; fail closed with authorization error (`authorization_error`) |
| `PAID` | Matches Caller | No | Any | **NO** | Ineligible; `PAID` is a distinct post-completion lifecycle state; eligibility requires exact `COMPLETED` |
| `IN_PROGRESS` | Matches Caller | No | Any | **NO** | Ineligible; work actively underway (`ineligible`) |
| `PENDING_COMPLETION` | Matches Caller | No | Any | **NO** | Ineligible; inspection pending, not yet confirmed complete (`ineligible`) |
| `CONFIRMED` | Matches Caller | No | Any | **NO** | Ineligible; job scheduled/funded but not completed (`ineligible`) |
| `DISPUTED` | Matches Caller | No | Any | **NO** | Ineligible; dispute mediation active (`ineligible`) |
| `CANCELLED` | Matches Caller | No | Any | **NO** | Ineligible; cancelled bookings cannot be reviewed (`ineligible`) |
| `COMPLETED` | Matches Caller | No | **Offline** | **NO** | Form rendered read-only; submission disabled (`offline`) |

---

## 3. Product Decisions & Domain Rules

### 3.1 Written Feedback Character Limit
- **Maximum Length**: Exactly **1,000 characters** (UTF-8).
- **Minimum Length**: **0 characters**. Written comment is optional; numeric ratings are mandatory.
- **Trimming**: Whitespace is trimmed before validation and persistence.
- **UI Counter**: Visual counter displays `X / 1,000 characters` with `aria-live="polite"`.
- **Enforcement**: Enforced synchronously in client validation and authoritatively at the repository boundary.

### 3.2 Review Immutability
- Once submitted, reviews are **strictly immutable** in WEB-016 v1.
- No editing, updating, or deletion by customers is supported.
- `CustomerReviewRecord` contains `createdAt` (ISO 8601). It does not contain `updatedAt`, preventing any implication of a customer edit workflow.

### 3.3 Atomic Uniqueness Invariant (Duplicate Protection)
- One completed booking yields at most one customer review.
- **Atomicity Rule**: Duplicate protection must be enforced atomically at the authoritative persistence boundary using the `bookingId` uniqueness invariant.
- In-memory mock repositories must execute eligibility check and record insertion in a single synchronous critical section, guaranteeing that concurrent requests for the same `bookingId` cannot both observe `ExistingReview = null`.
- At the future database boundary, this is enforced by a unique constraint on `bookingId` inside a serializable transaction.

### 3.4 Reputation Calculation & Rounding Precision
- **Primary Metric Definition**:
  $$\text{averageRating} = \text{arithmetic mean of } \text{ReviewRatings.overall}$$
  The BrainWorker's primary public rating is strictly the mean of all customer overall scores, not a blended average of disparate sub-criteria.
- **Criteria Averages Definition**:
  - `criteriaAverages.punctuality` = arithmetic mean of all punctuality ratings.
  - `criteriaAverages.quality` = arithmetic mean of all work quality ratings.
  - `criteriaAverages.communication` = arithmetic mean of all communication ratings.
  - `criteriaAverages.overall` = arithmetic mean of all overall ratings (identical to `averageRating`).
- **Domain Precision Rule**: All metrics (`averageRating` and each criterion average) are rounded to **one decimal place (tenths)** using standard round-half-up:
  $$\text{roundedRating} = \frac{\lfloor \text{rawAverage} \times 10 + 0.5 \rfloor}{10}$$
- **Presentation Rule**: Display values always format to one decimal place (e.g., `4.9`, `5.0`, `3.5`).
- **Zero Reviews Boundary**: If a BrainWorker has zero reviews, `averageRating: 0.0` and `totalReviews: 0`. The UI displays an explicit calm empty state ("No customer reviews yet") rather than empty stars.

### 3.5 Abuse Reporting Invariants
- An authenticated customer may report a public review for moderation.
- **Reporting Deduplication**: A customer can report a specific review at most **once**. The domain rejects duplicate reporting attempts by the same customer with `report_already_submitted`.
- **Self-Reporting Invariant**: A customer cannot report their own review. Attempting to do so fails closed with an authorization error.
- **Non-Destructive Action**: Reporting never deletes, hides, or mutates the review directly. It creates an isolated moderation record.

---

## 4. TypeScript Domain Model & Module Boundary

### 4.1 Single Source of Truth
To prevent drift across packages:
- All feature-specific domain types, interfaces, and validation schemas reside canonically in `apps/web/lib/review/types.ts`.
- `@bukiebrainjobs/types` and `@bukiebrainjobs/api-types` remain unmodified for WEB-016 v1, preserving the existing package dependency hierarchy.

### 4.2 Rating Primitives
```typescript
/**
 * Authoritative 1-to-5 integer star rating.
 * Floating point, negative, or zero ratings are rejected.
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
```

### 4.3 Review Entities & Projections
```typescript
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
  comment?: string;
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
  comment?: string;
  serviceTitle: string; // e.g. "AC Deep Chemical Cleaning"
  completedDate: string; // Month and year, e.g. "September 2026"
  isVerifiedBooking: true; // Verified completed booking marker
  createdAt: string;
}

/**
 * Authoritative reputation summary for a BrainWorker.
 * averageRating is strictly the mean of ReviewRatings.overall.
 * All averages rounded to 1 decimal place.
 */
export interface BrainWorkerReputationSummary {
  brainWorkerId: string;
  averageRating: number; // e.g. 4.9 (mean of overall ratings)
  totalReviews: number;
  criteriaAverages: {
    punctuality: number;
    quality: number;
    communication: number;
    overall: number; // matches averageRating
  };
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}
```

### 4.4 Review Eligibility & Form State
```typescript
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
  brainWorkerAvatar?: string;
  completedAt: string;
}

export interface ReviewEligibility {
  eligible: boolean;
  reason?: ReviewIneligibilityReason;
  bookingSummary?: ReviewBookingSummary;
  existingReview?: PublicBrainWorkerReview;
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
  comment?: string;
}

export interface ReviewValidationErrors {
  punctuality?: string;
  quality?: string;
  communication?: string;
  overall?: string;
  comment?: string;
}
```

### 4.5 Moderation & Reporting Types
```typescript
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
  details?: string;
}

export interface ReviewReportResult {
  success: boolean;
  reportId?: string;
  status: ReportStatus;
  errorMessage?: string;
}
```

---

## 5. Authoritative Repository Boundary

The frontend interacts with the review domain exclusively through the `ICustomerReviewRepository` interface:

```typescript
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
    options?: { page?: number; limit?: number }
  ): Promise<{
    reviews: PublicBrainWorkerReview[];
    totalCount: number;
    reputationSummary: BrainWorkerReputationSummary;
  }>;

  /**
   * Submits an abuse report against a public review.
   * Rejects self-reporting and duplicate reports from the same customer.
   */
  reportReview(
    authenticatedCustomerId: string,
    input: SubmitReviewReportInput
  ): Promise<ReviewReportResult>;
}
```

---

## 6. Architecture & Implementation Design

### 6.1 Clean Module Organization
Following the production-first discipline of WEB-015:

```
apps/web/lib/review/
├── index.ts                      # Public exports (repository factory, types)
├── types.ts                      # Canonical domain types & interfaces
├── repository.ts                 # Production CustomerReviewRepository (in-memory domain store)
├── validation.ts                 # Pure validation functions & character limit rules
└── testing/
    ├── index.ts                  # Test harness public interface
    ├── harness.ts                # Isolated ReviewTestHarness with state overrides
    ├── fixtures.ts               # Deterministic seed bookings and reviews
    └── mock-storage.ts           # Optional browser localStorage persistence for prototype testing
```

### 6.2 Zero-Leakage Production Boundary
- `repository.ts` has zero imports from `testing/` and exposes no backdoor mutation methods.
- The `CustomerReviewRepository` constructor does not accept arbitrary external stores from callers.
- All fixture injection and test state manipulation live entirely in `lib/review/testing/harness.ts`.

### 6.3 Clean Offline Boundary
- Offline detection is an **application/UI layer responsibility**.
- The UI listens to network status and disables review submission, rendering the form read-only.
- The repository does not read browser globals (`window` or `navigator`).
- If an environment adapter or test harness sets the repository to an unavailable state, any attempted write mutation fails closed with an explicit `[Offline]` error.

### 6.4 Storage Classification
- Production repository storage in Phase 1 uses an encapsulated in-memory Map structure.
- Any `localStorage` persistence used for interactive development sessions is classified as mock-only and isolated behind the testing adapter, never leaking into the production repository contract.

---

## 7. Deterministic Test States & Fixture Matrix

The testing harness (`ReviewTestHarness`) provides 14 deterministic fixtures covering every lifecycle invariant:

| State ID | Scenario / Invariant Verified | Expected Behavior |
|:---|:---|:---|
| `completed_booking_reviewable` | Booking `COMPLETED`, caller is owner, no prior review. | `eligible: true`; form active in `idle` state. |
| `completed_booking_already_reviewed` | Booking `COMPLETED`, review already submitted. | `eligible: false`, `reason: 'already_reviewed'`; renders submitted review. |
| `completed_booking_unauthorized` | Booking `COMPLETED`, caller is not booking owner. | Fails closed with `UnauthorizedError`. |
| `non_completed_booking_in_progress` | Booking in `IN_PROGRESS`. | `eligible: false`, `reason: 'booking_not_completed'`. |
| `non_completed_booking_pending` | Booking in `PENDING_COMPLETION`. | `eligible: false`, `reason: 'booking_not_completed'`. |
| `booking_not_found` | Non-existent `bookingId`. | `eligible: false`, `reason: 'booking_not_found'`. |
| `review_submission_success` | Valid ratings (1 to 5) and comment $\le$ 1,000 chars. | Atomically persists review, updates reputation summary, returns record. |
| `review_submission_validation_error` | Missing criterion or comment > 1,000 chars. | Rejects with field-specific validation errors. |
| `review_submission_duplicate_rejection` | Concurrent submission attempt for same booking. | Rejects second submission atomically with `DuplicateReviewError`. |
| `review_submission_repository_failure` | Simulated network or persistence failure. | Returns `repository_error`; preserves user draft in UI state. |
| `offline_read_only` | Network disconnected. | Write mutations rejected with `[Offline]`; UI controls disabled. |
| `public_reviews_available` | BrainWorker has verified customer reviews. | Renders rounded summary, rating breakdown, and verified review cards. |
| `public_reviews_empty` | BrainWorker has zero customer reviews. | Renders calm empty state ("No customer reviews yet"). |
| `report_abuse_success` | Authenticated customer reports another's review. | Creates moderation ticket, returns `status: 'report_submitted'`. |
| `report_abuse_duplicate` | Customer attempts to report same review twice. | Rejects with `status: 'report_already_submitted'`. |
| `report_abuse_self_report` | Customer attempts to report their own review. | Fails closed with `UnauthorizedError`. |

---

## 8. Content Safety, Privacy & XSS Protection

Customer reviews are untrusted user-generated content. Three protection layers are enforced:

1. **Input Normalization**:
   - Strips leading and trailing whitespace.
   - Rejects null bytes and non-printable control characters.
   - Enforces 1,000 character maximum.

2. **Safe Presentation**:
   - Customer comments are stored as plain UTF-8 strings.
   - React components render comments as standard child text nodes (`<p>{review.comment}</p>`), never via `dangerouslySetInnerHTML`.

3. **Privacy Masking**:
   - Customer names are masked in public projections (e.g., `Babajide Adeleke` $\rightarrow$ `Babajide A.`).
   - Customer phone numbers, email addresses, and location details are never exposed to public review consumers.

---

## 9. Persistence Invariants for Eventual Backend (Phase 2)

When Phase 2 connects to a live database, the persistence layer must satisfy these invariants:

1. **Uniqueness Constraint**: A unique index on `bookingId` ensures 1:1 review-to-booking cardinality:
   ```sql
   CREATE UNIQUE INDEX idx_reviews_booking_id ON reviews(booking_id);
   ```
2. **Referential Integrity**: Foreign keys linking `booking_id` to the completed booking, `customer_id` to the reviewer, and `brainworker_id` to the recipient.
3. **Data Integrity Constraints**:
   ```sql
   CHECK (punctuality_rating >= 1 AND punctuality_rating <= 5)
   CHECK (quality_rating >= 1 AND quality_rating <= 5)
   CHECK (communication_rating >= 1 AND communication_rating <= 5)
   CHECK (overall_rating >= 1 AND overall_rating <= 5)
   CHECK (char_length(comment) <= 1000)
   ```
4. **Moderation Report Constraint**: A composite unique index on `(review_id, reporter_id)` to enforce one report per customer:
   ```sql
   CREATE UNIQUE INDEX idx_review_reports_unique ON review_reports(review_id, reporter_id);
   ```

---

## 10. Verification & Execution Plan

Implementation (`/develop`) is gated on approval of this Architecture Contract and the accompanying UX/Design specification. Verification requires:

1. **Test-Driven Development (`/test`)**:
   - Unit tests covering eligibility rules, atomic duplicate rejection, 1,000 character limit validation, and reputation rounding.
   - Component tests covering the post-completion review prompt modal, star rating interaction, live character counter, public review tabs, and abuse reporting modal.
2. **Codespace SSH Pipeline Execution (`/check`)**:
   - All tests and Next.js builds dispatched over SSH to cloud Codespace `effective-fishstick-x5qwp6wrrp64fxwx`.
   - Zero test execution locally in Termux.
3. **Vercel Preview Deployment**:
   - Git push, branch synchronization, and verification that the Vercel preview reaches `READY`.

---

*WEB-016 Architecture Contract v1.2 — prepared under the Mr. Solomon 9-Command Engineering Loop*
