# BW-009 Post-Job Completion & Escrow Release Specification

**Document ID:** BW-009  
**Version:** 1.0  
**Status:** Complete & Verified  
**Primary Route:** `/completion/[bookingId]`  
**Item Reference:** Master Checklist Item 3.3  
**Last Updated:** 2026-10-20  

---

## 1. Purpose and Architectural Summary

BW-009 governs the final financial settlement, inspection, and review phase of the BukieBrainJobs two-sided marketplace lifecycle. Following on-site completion submission (BW-008), this specification defines how customer satisfaction is confirmed, how escrow funds are safely disbursed, how the 72-hour auto-release safeguard operates, how disputes pause financial settlements, and how double-blind mutual ratings are collected and revealed.

The specification establishes:
1. **Integer Kobo Financial Distribution:** Payout arithmetic uses integer kobo exclusively. The platform fee is fixed at 10 percent (1000 basis points). The tasker payout receives the remainder, guaranteeing zero fractional loss and ensuring tasker payout plus platform fee equals total settlement.
2. **Authoritative Customer Satisfaction Confirmation:** When a customer approves the delivered work, the booking status transitions from `PENDING_COMPLETION` to `COMPLETED`, and escrow status transitions from `ESCROW_HELD` to `ESCROW_RELEASED`.
3. **72-Hour Inspection Window & Auto-Release:** If a customer does not take action within 72 hours of completion submission, escrow funds become eligible for automatic release to protect service providers from indefinite payment delays.
4. **Dispute Hold Freeze:** If a dispute is raised during the inspection window, auto-release timers freeze immediately, and escrow status shifts to `DISPUTED`. Funds remain securely held until resolution.
5. **Double-Blind Mutual Review Mechanism:** Both parties submit ratings across four standard criteria (punctuality, quality, communication, overall). Reviews remain masked until both parties have submitted or until a 14-day disclosure window elapses.
6. **Unified Dual-Sided Route:** A protected route at `/completion/[bookingId]` providing role-tailored views for customers and BrainWorkers while preserving access control boundaries.

---

## 2. Domain Invariants and Specifications (COMPL-001 to COMPL-010)

The pure domain layer (`apps/web/lib/completion/domain.ts`) enforces business rules without side effects:

1. **COMPL-001 (Integer Kobo Settlement Split):**
   - Platform fee is strictly 10 percent (1000 bps): `platformFeeKobo = Math.floor(totalSettlementKobo * 0.10)`.
   - Tasker payout is `totalSettlementKobo - platformFeeKobo`.
   - Invariant: `taskerPayoutKobo + platformFeeKobo === totalSettlementKobo`.
2. **COMPL-002 (Escrow Auto-Release Window Evaluation):**
   - Evaluates remaining time against a 72-hour inspection window.
   - Accurately computes remaining hours and milliseconds.
   - Designates `isEligible: true` only when elapsed time is 72 hours or greater.
3. **COMPL-003 (Dispute Freezes Auto-Release):**
   - When a dispute is active or escrow is marked `DISPUTED`, auto-release eligibility is strictly false regardless of time elapsed.
4. **COMPL-004 (Customer Satisfaction Release Validation):**
   - Validates that customer satisfaction confirmation is only permitted when job status is `PENDING_COMPLETION` and escrow is `ESCROW_HELD`.
   - Rejects confirmations on non-pending or already-released bookings.
5. **COMPL-005 (Dispute Reason and Details Validation):**
   - Mandates an approved dispute reason (`INCOMPLETE_WORK`, `POOR_QUALITY`, `DAMAGE_INCIDENT`, `UNAUTHORIZED_EXTRA_CHARGES`, `OTHER`).
   - Requires non-empty, trimmed dispute details explaining the problem.
6. **COMPL-006 (Mutual Review Rating Boundaries):**
   - Validates four core criteria (punctuality, quality, communication, overall).
   - Each rating must be an integer between 1 and 5 inclusive.
7. **COMPL-007 (Double-Blind Review Masking: Initial State):**
   - When neither party has submitted, review status is `AWAITING_BOTH`.
   - Individual ratings remain hidden.
8. **COMPL-008 (Double-Blind Review Masking: Single Submission):**
   - When one party has submitted, review status is `AWAITING_CUSTOMER` or `AWAITING_WORKER`.
   - Submitted ratings remain masked to the counterparty to prevent retaliatory scoring.
9. **COMPL-009 (Double-Blind Review Unmasking: Both Submitted):**
   - When both parties submit reviews, review status transitions to `MUTUAL_REVEALED`.
   - Both reviews and ratings become visible.
10. **COMPL-010 (Post-Completion Payout State Transition):**
    - Transition targets job status `COMPLETED` and escrow status `ESCROW_RELEASED`.
    - Disallows transitions if an active dispute exists.

---

## 3. Repository Contracts (REP-001 to REP-010)

The repository layer (`apps/web/lib/completion/repository.ts`) implements state persistence, tenant isolation, deep cloning, and atomic mutations:

1. **REP-001 (State Initialization & Retrieval):**
   - `getCompletionState` returns cloned state or `null` for non-existent bookings.
   - `initCompletionState` initializes state records with defensive isolation.
2. **REP-002 (Customer Satisfaction Confirmation Mutation):**
   - Validates customer identity and transitions booking status to `COMPLETED` and escrow to `ESCROW_RELEASED`.
3. **REP-003 (Unauthorized Satisfaction Confirmation Guard):**
   - Rejects confirmation attempts by non-customer parties with `UnauthorizedCompletionError`.
4. **REP-004 (Auto-Release Payout Execution):**
   - Transitions state to `COMPLETED` and `ESCROW_RELEASED` when 72 hours have elapsed and no dispute exists.
5. **REP-005 (Auto-Release Premature Rejection):**
   - Rejects auto-release requests when the 72-hour window has not elapsed.
6. **REP-006 (Dispute Raising Mutation):**
   - Sets `isDisputed: true`, marks escrow as `DISPUTED`, and records dispute details.
7. **REP-007 (Dispute Blocks Auto-Release and Release Actions):**
   - Throws `DisputeActiveError` if auto-release or customer satisfaction confirmation is attempted on a disputed record.
8. **REP-008 (Mutual Review Submission Persistence):**
   - Persists reviewer ratings, timestamps, and comments for customer and BrainWorker roles.
9. **REP-009 (Duplicate Review Prevention):**
   - Rejects repeated review submissions from the same party with `DuplicateReviewError`.
10. **REP-010 (Mutual Review Status Evolution to Revealed):**
    - Updates mutual review status to `MUTUAL_REVEALED` once both parties have submitted.

---

## 4. UI Components Architecture (COMP-001 to COMP-012)

The Trades Design System components (`apps/web/components/completion/`) deliver dark-only, accessible interfaces built on Obsidian Titanium Gunmetal tokens:

1. **`CompletionInspectionSummary.tsx` (`COMP-001` to `COMP-002`):**
   - Itemized financial breakdown: base quote, approved adjustments, and total settlement rendered in Nigerian Naira.
   - Photographic proof gallery and completion summary note with accessible alt tags and responsive grid.
2. **`EscrowReleaseActions.tsx` (`COMP-003` to `COMP-005`):**
   - Primary "Inspect & Release Escrow" action and secondary "Raise Dispute" trigger.
   - Disables release button and displays loading feedback during submission.
   - Enforces 44px minimum touch targets and emerald brand action tokens.
3. **`AutoReleaseCountdownCard.tsx` (`COMP-006` to `COMP-008`):**
   - Live countdown display for the 72-hour inspection window.
   - Displays auto-release eligible badge when deadline elapses.
   - Renders dispute freeze alert when `isDisputed: true`, communicating that funds remain held.
4. **`DisputeInitiationModal.tsx` (`COMP-009`):**
   - Accessible modal dialog for raising disputes.
   - Requires reason selection and non-empty description before enabling submission.
5. **`MutualBlindReviewForm.tsx` (`COMP-010` to `COMP-012`):**
   - Star rating inputs across punctuality, quality, communication, and overall criteria.
   - Masked waiting state when only the current user has submitted.
   - Unmasked side-by-side review cards once both parties complete submission.

---

## 5. Protected Route Architecture (ROUTE-001 to ROUTE-010)

The protected route at `apps/web/app/completion/[bookingId]/page.tsx` integrates domain, repository, and UI layers:

1. **ROUTE-001 (Unauthenticated Access Guard):**
   - Renders authentication prompt with sign-in link when no active session is detected.
2. **ROUTE-002 (Tenant Isolation Guard):**
   - Rejects third-party access with a restricted access notice. Only the customer and assigned BrainWorker may access the completion view.
3. **ROUTE-003 (Loading State):**
   - Renders loading spinner while booking parameters and completion records resolve.
4. **ROUTE-004 (Missing Record Handling):**
   - Renders unavailable record notification when the booking ID cannot be found.
5. **ROUTE-005 (Customer Perspective):**
   - Renders inspection summary, escrow release action triggers, countdown card, and review form.
6. **ROUTE-006 (BrainWorker Perspective):**
   - Renders inspection summary, countdown card, and review form, while suppressing customer release action buttons.
7. **ROUTE-007 (Customer Confirmation Interaction):**
   - Clicking "Inspect & Release Escrow" triggers confirmation and transitions the view to completed status.
8. **ROUTE-008 (Dispute Initiation Interaction):**
   - Opening dispute modal and submitting freezes countdown timer with an active dispute alert.
9. **ROUTE-009 (Blind Review Masking):**
   - Renders masked counterparty state after the current user submits feedback.
10. **ROUTE-010 (Mutual Feedback Unmasking):**
    - Unmasks both customer and BrainWorker reviews when both have submitted.

---

## 6. Traceability and Verification Matrix

| Contract ID | Layer | Test File | Status |
|---|---|---|---|
| `COMPL-001` to `COMPL-010` | Pure Domain | `apps/web/lib/completion/domain.test.ts` | Verified (10/10) |
| `REP-001` to `REP-010` | Repository | `apps/web/lib/completion/repository.test.ts` | Verified (10/10) |
| `COMP-001` to `COMP-012` | UI Components | `apps/web/components/completion/completion.test.tsx` | Verified (12/12) |
| `ROUTE-001` to `ROUTE-010` | Route Integration | `apps/web/app/completion/[bookingId]/CompletionRoute.test.tsx` | Verified (10/10) |

Total Test Coverage: 42 passed across 4 test suites. Zero regressions. Zero type errors.

---

## 7. Security and Financial Integrity

- **Integer Arithmetic:** Floating point math is strictly excluded from financial calculations.
- **Fail-Closed Escrow:** Escrow release requires verified customer confirmation or confirmed deadline expiry with zero active disputes.
- **Retaliation Protection:** Blind review masking ensures neither party can view counterparty feedback until both have submitted.
- **No Em Dashes:** Clean, direct copy across all user-facing screens and documentation.
