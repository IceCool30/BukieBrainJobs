# BW-007 Collaborative Scheduling and Dispatch Specification

**Document ID:** BW-007  
**Version:** 1.0  
**Status:** Complete & Verified  
**Primary Route:** `/scheduling/[bookingId]`  
**Item Reference:** Master Checklist Item 3.1  
**Last Updated:** 2026-10-18  

---

## 1. Purpose and Architectural Summary

BW-007 establishes the synchronized, collaborative scheduling and real-time technician dispatch tracking surface for BukieBrainJobs. It represents the foundational bridge between customers and verified artisans (BrainWorkers) in Phase 3 (Full Two-Sided Marketplace Lifecycle).

The specification governs:
1. **Mutually Agreed Arrival Window Display**: Formatted canonical West Africa Time (WAT) arrival windows with 24-hour chronological validation (`startHour < endHour`) and date presentation.
2. **Collaborative Reschedule Negotiation**: A balanced two-sided workflow where either party can propose 1 to 3 alternate arrival windows with structured reason taxonomies. Proposals require atomic acceptance, refusal, or counter-proposals while strictly locking out modifications once the technician has departed.
3. **Forward-Only Dispatch Tracking**: A forward progression tracker (`NOT_STARTED` -> `EN_ROUTE` -> `ARRIVED`) that prevents backwards state regression and provides continuous operational visibility.
4. **Customer Safety Notice**: Mandatory display of customer guidance (`"Ensure someone 18+ is home to receive the artisan"`) across customer dispatch views.
5. **Unified Role-Adaptive Route**: A single protected surface at `/scheduling/[bookingId]` providing tailored controls for customers and artisans while maintaining physical tenant and role isolation.

---

## 2. Domain Invariants and Specifications (SCHED-001 to SCHED-010)

The pure domain layer (`apps/web/lib/scheduling/domain.ts`) enforces business rules and calculation invariants without side effects:

1. **SCHED-001 (Canonical WAT Arrival Window Formatting & 24h Bounds):**
   - Validates that `startHour` and `endHour` are integers between 0 and 24.
   - Enforces strict chronological ordering (`startHour < endHour`).
   - Formats display strings into standard West Africa Time (e.g. `Tuesday, Oct 20, 2026, 10:00 AM - 1:00 PM WAT`).
2. **SCHED-002 (Booking Status Gate):**
   - Rescheduling is strictly permitted only when the booking `jobStatus` is `CONFIRMED`.
   - Refuses proposals for unconfirmed or terminal statuses (`OPEN`, `PENDING_ACCEPTANCE`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`, `DISPUTED`, etc.).
3. **SCHED-003 (Active Dispatch Locking):**
   - Rescheduling is rejected when `dispatchStatus` is `EN_ROUTE` or `ARRIVED` to protect artisans already on the road or on-site.
4. **SCHED-004 (Candidate Windows Volume):**
   - Reschedule proposals must contain at least 1 and at most 3 candidate arrival windows.
5. **SCHED-005 (Future Time Constraint):**
   - All proposed arrival windows must be strictly in the future with a minimum 1-hour lead time relative to the reference time.
6. **SCHED-006 (Structured Reason Taxonomy & Mandatory Note):**
   - Supports recognized reason codes: `TRAFFIC_DELAY`, `PARTS_PROCUREMENT`, `CUSTOMER_UNAVAILABLE`, `WEATHER`, `EMERGENCY`, and `OTHER`.
   - Mandates a non-empty `reasonNote` whenever `OTHER` is selected.
7. **SCHED-007 (Atomic Acceptance Transition):**
   - Accepting a pending reschedule transitions status to `ACCEPTED` and atomically updates the agreed arrival window to the selected candidate slot.
8. **SCHED-008 (Decline Transition):**
   - Declining a pending reschedule transitions status to `DECLINED` while preserving the existing agreed arrival window intact.
9. **SCHED-009 (Counter-Proposal Validation):**
   - Countering a pending reschedule transitions status to `COUNTERED` and enforces valid candidate arrival windows (1 to 3 future slots).
10. **SCHED-010 (Dispatch Tracking Progression View):**
    - Derives customer progression state, safety guidance (`"Ensure someone 18+ is home to receive the artisan"`), and contextual arrival prompts across `NOT_STARTED`, `EN_ROUTE`, and `ARRIVED`.

---

## 3. Repository Contracts (REP-001 to REP-010)

The repository layer (`apps/web/lib/scheduling/repository.ts`) provides in-memory state management, concurrency control, and forward-only state progression:

1. **REP-001 (Schedule Record Provisioning & Retrieval):**
   - `seedBookingSchedule` stores schedule state and `getBookingSchedule` retrieves cloned records or `null`.
2. **REP-002 (Unique Request Provisioning):**
   - `proposeReschedule` generates unique request IDs, creates `PENDING` records, and captures ISO timestamps.
3. **REP-003 (Single-Pending Request Concurrency Guard):**
   - Rejects new reschedule proposals if an active `PENDING` request already exists for that booking.
4. **REP-004 (Repository Active Dispatch Invariant):**
   - Throws invariant errors if reschedule is proposed while dispatch is `EN_ROUTE` or `ARRIVED`.
5. **REP-005 (Active Pending Query):**
   - `getPendingRescheduleRequest` returns the active pending request or `null` when resolved or absent.
6. **REP-006 (Atomic Acceptance Persistence):**
   - `respondReschedule` with `ACCEPT` updates status to `ACCEPTED` and mutates the schedule `agreedArrivalWindow`.
7. **REP-007 (Decline Persistence):**
   - `respondReschedule` with `DECLINE` updates status to `DECLINED` and retains the agreed window.
8. **REP-008 (Counter Persistence):**
   - `respondReschedule` with `COUNTER` updates status to `COUNTERED` and retains the agreed window.
9. **REP-009 (Forward-Only Dispatch Transitions):**
   - `updateDispatchStatus` strictly enforces `NOT_STARTED` -> `EN_ROUTE` -> `ARRIVED` and rejects backwards transitions.
10. **REP-010 (Customer Dispatch View Assembly):**
    - `deriveCustomerDispatchView` returns the tracking view with safety notice and action required text.

---

## 4. UI Components Architecture (COMP-001 to COMP-012)

The Trades Design System components (`apps/web/components/scheduling/`) provide accessible, dark-only user interfaces:

1. **`ArrivalWindowCard.tsx` (`COMP-001` to `COMP-003`):**
   - Displays agreed arrival window details, job status badge, and dispatch progression badge.
   - Disables reschedule trigger button when dispatch is active or `canReschedule` is false.
   - Invokes `onRequestReschedule` on click.
2. **`RescheduleProposalModal.tsx` (`COMP-004` to `COMP-006`):**
   - Accessible modal dialog (`role="dialog"`, `aria-modal="true"`).
   - Candidate date and hour selectors with reason dropdown.
   - Enforces non-empty `reasonNote` when reason is `OTHER` before enabling submission.
   - Triggers `onSubmitProposal` with validated payload.
3. **`RescheduleResponseCard.tsx` (`COMP-007` to `COMP-009`):**
   - Renders "Awaiting response from counterparty" banner when viewed by the requester.
   - Renders candidate window radio selector, Accept, Decline, and Counter buttons when viewed by the counterparty.
   - Invokes `onAccept` with the explicitly chosen arrival window.
4. **`DispatchTrackingViewCard.tsx` (`COMP-010` to `COMP-011`):**
   - 3-step visual progress bar (`Not Started` -> `En Route` -> `Arrived`).
   - Renders contextual action prompt and mandatory safety notice.
5. **`DispatchStatusUpdater.tsx` (`COMP-012`):**
   - Artisan-facing forward status button: "Mark En Route" when `NOT_STARTED`, "Mark Arrived" when `EN_ROUTE`.
   - Transitions to a confirmed on-site badge with controls removed when `ARRIVED`.

---

## 5. Route Integration Contracts (ROUTE-001 to ROUTE-010)

The route surface (`apps/web/app/scheduling/[bookingId]/page.tsx`) unites the scheduling experience:

1. **ROUTE-001 (Unauthenticated Visitor Redirection):**
   - Unauthenticated visitors are redirected to `/login?redirect=/scheduling/[bookingId]` without executing repository queries.
2. **ROUTE-002 (Customer View Adaptation):**
   - Authenticated customers mount `DispatchTrackingViewCard` with the safety notice and section title `"Technician Arrival Status"`.
3. **ROUTE-003 (Artisan View Adaptation):**
   - Authenticated BrainWorkers mount `ArrivalWindowCard` (`"Agreed Arrival Window"`) and `DispatchStatusUpdater` ("Mark En Route").
4. **ROUTE-004 (Non-Existent Schedule Error State):**
   - Renders a clean "Booking schedule not found" card with return navigation.
5. **ROUTE-005 & ROUTE-006 (Counterparty Decision Controls):**
   - Counterparty viewing pending request sees candidate windows, Accept, Decline, and Counter controls.
6. **ROUTE-007 (Requester Passive Status View):**
   - Requester viewing their own pending request sees the awaiting response banner with decision buttons suppressed.
7. **ROUTE-008 (Technician Progression Delegation):**
   - Clicking "Mark En Route" calls `repository.updateDispatchStatus(bookingId, 'EN_ROUTE')`.
8. **ROUTE-009 (Reschedule Acceptance Delegation):**
   - Clicking "Accept" calls `repository.respondReschedule` and immediately refreshes the displayed arrival window.
9. **ROUTE-010 (SSR Safety & Production Boundary Isolation):**
   - Renders without throwing under `renderToString` and contains zero imports from `testing/`.

---

## 6. Verification Summary

| Suite | File | Tests Passed | Status |
|---|---|---|---|
| Domain Invariants | `apps/web/lib/scheduling/types.test.ts` | 10/10 | Passed |
| Repository Contracts | `apps/web/lib/scheduling/repository.test.ts` | 10/10 | Passed |
| UI Components | `apps/web/components/scheduling/SchedulingUI.test.tsx` | 12/12 | Passed |
| Route Integration | `apps/web/app/scheduling/SchedulingRoute.test.tsx` | 10/10 | Passed |
| **Total BW-007 Contracts** | **All 4 Suites** | **42/42** | **100% Passed** |
| Monorepo Web Suite | `@bukiebrainjobs/web` | 1,665/1,665 | 110/110 Files Passed |
| Monorepo Typecheck | Monorepo (`turbo run type-check`) | 7/7 Packages | Clean (`FULL TURBO`) |
| Production Build | `pnpm --filter @bukiebrainjobs/web build` | 44/44 Routes | Compiled Cleanly (`/scheduling/[bookingId]`: 7.44 kB) |
| Skill Gate Guard | `bash scripts/check-skill-gate.sh` | 8/8 Skills | Passed |
