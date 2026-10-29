# BW-008 On-Site Work & In-Progress Verification Specification

> **Current visual direction notice, 29 October 2026:** This specification remains authoritative for product behavior, content, flows, validation, and acceptance criteria. Its earlier website/PWA palette, typography, surfaces, radii, and component examples are historical and are superseded by `.agents/skills/bukiebrainjobs-outlier-design-system/SKILL.md`. Theme mechanics, dark default, light mode, saved preference, and existing toggle placements follow `docs/specs/THEME-001-light-dark-toggle.md`. Native visual restyling is separately scoped.

**Document ID:** BW-008  
**Version:** 1.0  
**Status:** Complete & Verified  
**Primary Route:** `/onsite/[bookingId]`  
**Item Reference:** Master Checklist Item 3.2  
**Last Updated:** 2026-10-18  

---

## 1. Purpose and Architectural Summary

BW-008 defines the physical execution and in-progress verification phase of the BukieBrainJobs marketplace lifecycle. It bridges the transition from technician arrival on-site to physical job completion, providing bilateral verification, financial safeguards, and dynamic scope adjustments.

The specification governs:
1. **Physical Arrival Check-In:** Verified location snapshot capture (GPS coordinates and landmark confirmations) transitioning the booking from `CONFIRMED` to `IN_PROGRESS` via the `@bukiebrainjobs/api-types` state machine `canTransition()`.
2. **Escrow Gate Precondition:** Check-in requires escrow to be fully funded (`ESCROW_HELD`). Bookings with `UNFUNDED` or invalid escrow fail closed.
3. **Integer Kobo Scope Adjustments:** On-site discovery of hidden faults or additional labor/parts requires explicit customer sign-off. Cost adjustments are strictly calculated in integer kobo (`additionalLaborKobo`, `additionalMaterialsKobo`) with derived total settlements (`baseQuoteKobo + approvedAdjustmentKobo`).
4. **Single Active Pending Adjustment Guard:** Only one pending scope adjustment is allowed per booking at any time, preventing concurrent conflicting proposals.
5. **Work Completion Proof Submission:** Technician completion submission requires at least one photographic proof URL and a descriptive summary note. Submission transitions booking status from `IN_PROGRESS` to `PENDING_COMPLETION` and permanently locks future scope adjustments.
6. **Unified Dual-Sided Route:** A protected route at `/onsite/[bookingId]` rendering role-specific views for customers and BrainWorkers while maintaining clean security boundaries and SSR mount safety.

---

## 2. Domain Invariants and Specifications (ONSITE-001 to ONSITE-010)

The pure domain layer (`apps/web/lib/onsite/domain.ts`) enforces business rules and validation invariants without side effects:

1. **ONSITE-001 (Valid Check-In Snapshot & Escrow Gate):**
   - Validates that check-in occurs only when current status is `CONFIRMED` and escrow is `ESCROW_HELD`.
   - Requires valid latitude and longitude coordinates and records an ISO timestamp.
   - Returns `eligible: true` and the confirmed `checkedInAt` timestamp.
2. **ONSITE-002 (Escrow Gate Fail-Closed):**
   - Strictly refuses check-in if `escrowStatus` is `UNFUNDED`, returning an error without mutating state.
3. **ONSITE-003 (Invalid Coordinates Rejection):**
   - Refuses check-in if GPS coordinates are missing, non-numeric, or outside geographic bounds.
4. **ONSITE-004 (Scope Adjustment Categorization & Positive Kobo Constraint):**
   - Validates adjustment requests across approved categories: `ADDITIONAL_PARTS`, `ADDITIONAL_LABOR`, or `BOTH`.
   - Requires at least one positive kobo amount (`additionalLaborKobo > 0` or `additionalMaterialsKobo > 0`).
   - Rejects zero or negative adjustments.
5. **ONSITE-005 (Mandatory Scope Description):**
   - Mandates a non-empty, trimmed description explaining why the scope adjustment is required on-site.
6. **ONSITE-006 (Execution Job Status Precondition for Scope Adjustment):**
   - Scope adjustments are only allowed when `jobStatus` is `IN_PROGRESS`.
   - Refuses proposals when `jobStatus` is `CONFIRMED`, `COMPLETED`, or `PENDING_COMPLETION`.
7. **ONSITE-007 (Single Active Scope Adjustment Guard):**
   - Refuses new scope adjustment proposals if a `PENDING` adjustment already exists for the booking.
8. **ONSITE-008 (Customer Approval & Settlement Derivation):**
   - Approving a scope adjustment marks it as `APPROVED` and atomically recalculates the total settlement:
     `totalSettlementKobo = baseQuoteKobo + approvedAdjustmentKobo`.
9. **ONSITE-009 (Customer Decline Preservation):**
   - Declining a scope adjustment marks it as `DECLINED` with an optional reason note.
   - Preserves base quote and approved adjustment kobo unchanged.
10. **ONSITE-010 (Completion Proof Validation):**
    - Completion submissions require `jobStatus === 'IN_PROGRESS'`.
    - Requires at least one photo proof URL and a descriptive summary note.
    - Strictly blocks completion submission if a scope adjustment is currently `PENDING`.
    - Targets status transition to `PENDING_COMPLETION`.

---

## 3. Repository Contracts (REP-001 to REP-010)

The repository layer (`apps/web/lib/onsite/repository.ts`) implements state persistence, tenant isolation, and atomic mutations:

1. **REP-001 (State Initialization & Retrieval):**
   - `getOnSiteState` returns cloned state or `null` for non-existent bookings.
   - `initOnSiteState` initializes state records cleanly.
2. **REP-002 (Atomic Check-In Mutation):**
   - `recordCheckIn` verifies eligibility and transitions booking status from `CONFIRMED` to `IN_PROGRESS`.
   - Records the snapshot and arrival timestamp.
3. **REP-003 (Check-In Gate Enforcement):**
   - Fails closed and preserves `CONFIRMED` status when escrow is not funded.
4. **REP-004 (Scope Adjustment Submission):**
   - Generates unique adjustment IDs, computes derived totals, and appends to the history list.
   - Sets `activeScopeAdjustment` to the new `PENDING` request.
5. **REP-005 (Concurrent Adjustment Prevention):**
   - Rejects new adjustment submissions while an active `PENDING` request exists.
6. **REP-006 (Approval Persistence & Settlement Recalculation):**
   - Updates adjustment status to `APPROVED`, clears `activeScopeAdjustment`, and updates `approvedAdjustmentKobo` and `totalSettlementKobo`.
7. **REP-007 (Decline Persistence):**
   - Updates adjustment status to `DECLINED`, clears `activeScopeAdjustment`, and leaves settlement figures unchanged.
8. **REP-008 (Completion Submission Validation & Transition):**
   - Validates proof URLs and notes, transitions status to `PENDING_COMPLETION`, and records the payload.
9. **REP-009 (Completion Blocker for Pending Adjustments):**
   - Rejects completion submission with a descriptive error when a scope adjustment remains `PENDING`.
10. **REP-010 (Post-Completion Scope Adjustment Lock):**
    - Rejects any further scope adjustment requests once completion has been submitted.

---

## 4. UI Components Architecture (COMP-001 to COMP-012)

The Trades Design System components (`apps/web/components/onsite/`) deliver dark-only, accessible interfaces built on Obsidian Titanium Gunmetal tokens:

1. **`CheckInPanel.tsx` (`COMP-001` to `COMP-003`):**
   - Provides physical check-in trigger button with minimum 44px touch height.
   - Captures GPS coordinates and optional landmark reference.
   - Disables check-in and renders warning banner when escrow is `UNFUNDED`.
2. **`ScopeAdjustmentModal.tsx` (`COMP-004` to `COMP-005`):**
   - Accessible dialog (`role="dialog"`, `aria-modal="true"`).
   - Category selection (`ADDITIONAL_PARTS`, `ADDITIONAL_LABOR`, `BOTH`).
   - Integer kobo inputs with live derived total calculations.
   - Form validation blocking submission until positive amounts and description are supplied.
3. **`CustomerScopeReviewCard.tsx` (`COMP-006` to `COMP-008`):**
   - Clear itemized breakdown of additional parts, labor, and total additional cost.
   - Side-by-side comparison of original base quote and requested new total.
   - Action buttons for Approve and Decline with optional decline feedback input.
4. **`CompletionSubmissionForm.tsx` (`COMP-009` to `COMP-010`):**
   - Dynamic photo proof URL collection list with add and remove actions.
   - Textarea for work summary notes.
   - Disables submission and alerts technician when a pending scope adjustment is unresolved.
5. **`OnSiteStatusBanner.tsx` (`COMP-011`):**
   - Displays execution state (`Confirmed`, `In Progress`, `Pending Completion`).
   - Highlights verified physical presence with formatted arrival time.
   - Displays escrow protection status badge.
6. **Design Standards (`COMP-012`):**
   - Strictly dark theme (`#0B0E13` background, `#13171E` cards, `#F0F4F9` primary text).
   - Zero light fills, zero theme toggle elements.
   - Accessible focus outlines and 44px minimum tap targets.

---

## 5. Route Integration Contracts (ROUTE-001 to ROUTE-010)

The route component (`apps/web/app/onsite/[bookingId]/page.tsx`) unites domain, persistence, and UI into a cohesive surface:

1. **ROUTE-001 (Unauthenticated Visitor Redirection):**
   - Visitors without active session redirect to `/login?redirect=/onsite/[bookingId]` without querying repository data.
2. **ROUTE-002 (Customer Clean View):**
   - Authenticated customer with no pending adjustments views `OnSiteStatusBanner` and verified arrival status without scope prompt noise.
3. **ROUTE-003 (Customer Active Adjustment Review):**
   - Authenticated customer with active `PENDING` adjustment mounts `CustomerScopeReviewCard` with Approve and Decline triggers.
4. **ROUTE-004 (BrainWorker Arrival Check-In View):**
   - Authenticated BrainWorker with `CONFIRMED` booking mounts `CheckInPanel`.
5. **ROUTE-005 (BrainWorker Active Execution Controls):**
   - Authenticated BrainWorker with `IN_PROGRESS` booking renders controls to request scope adjustments and submit completion.
6. **ROUTE-006 (Non-Existent Session Error Handling):**
   - Displays graceful error state (`Booking on-site session not found`) for invalid booking references.
7. **ROUTE-007 (Check-In Delegation & Transition):**
   - Clicking check-in delegates to `recordCheckIn` and transitions route view to `IN_PROGRESS`.
8. **ROUTE-008 (Customer Approval Delegation):**
   - Clicking approve delegates to `respondToScopeAdjustment(..., APPROVE)` and refreshes total settlement figures.
9. **ROUTE-009 (Completion Submission Delegation):**
   - Submitting work completion delegates to `submitCompletion` and transitions route view to `PENDING_COMPLETION`.
10. **ROUTE-010 (SSR Safety & Production Boundary Isolation):**
    - Renders safely via `renderToString` without throwing.
    - Strictly zero imports from `testing/` or test libraries in production code.

---

## 6. Verification and Test Coverage Summary

All 42 contracts passed across 4 comprehensive test suites:
- `lib/onsite/domain.test.ts`: 10 passed (`ONSITE-001` to `ONSITE-010`)
- `lib/onsite/repository.test.ts`: 10 passed (`REP-001` to `REP-010`)
- `components/onsite/OnSiteUI.test.tsx`: 12 passed (`COMP-001` to `COMP-012`)
- `app/onsite/OnSiteRoute.test.tsx`: 10 passed (`ROUTE-001` to `ROUTE-010`)

Full web regression suite: 114 test files passed, 1,707 total tests passing.
Production build: `/onsite/[bookingId]` compiled cleanly as dynamic server-rendered page.
