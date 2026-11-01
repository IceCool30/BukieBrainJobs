# BW-010 Dispute Handling & Support Interface Specification

> **Current visual direction notice, 29 October 2026:** This specification is authoritative for product behavior, content, flows, validation, and acceptance criteria. Website and PWA visual tokens and theme appearance follow `.agents/skills/bukiebrainjobs-outlier-design-system/SKILL.md`. Theme mechanics, dark default, light mode, saved preference, and existing toggle placements follow `docs/specs/THEME-001-light-dark-toggle.md`. Native visual restyling remains separately scoped.

**Document ID:** BW-010  
**Version:** 1.0  
**Status:** LOCAL UNCOMMITTED / PM REVIEW PENDING  
**Primary Route:** `/disputes/[bookingId]`  
**Item Reference:** Master Checklist Item 3.4  
**Last Updated:** 2026-10-30  

---

## 1. Purpose and Architectural Summary

BW-010 establishes the dispute handling and customer support interface for the BukieBrainJobs two-sided marketplace. It provides a local preview dispute resolution and support workspace for bookings where delivered work, completion terms, or pricing are challenged in prototype flows.

Key architectural boundaries:
1. **Canonical 17.5% Platform Fee Schedule:** All financial breakdowns and settlement proposals strictly respect the canonical 17.5% platform fee schedule (10% service fee + 7.5% trust fee = 1750 bps, leaving an 82.5% tasker share), identical to the payment contracts defined in `packages/api-types/src/payments.ts`. All arithmetic operates in integer Kobo without floating-point calculations.
2. **Workflow State vs. Payout Authority:** Dispute status transitions (`DRAFT`, `SUBMITTED`, `UNDER_REVIEW`, `ACTION_REQUIRED`, `PROPOSAL_OFFERED`, `RESOLVED`, `CLOSED`) govern only internal prototype state in this local preview workspace. This workspace does not manage real escrow, funds, payment, or release timers. Copy never claims that real funds are held, moved, or released, or that live platform mediation is engaged.
3. **Participant Parity and Confidentiality:** Both verified Customers and assigned BrainWorkers have first-class, role-tailored access to the dispute workspace. Non-participants fail closed with 403 Forbidden notices.
4. **Session-Scoped Memory and Blob Lifecycle:** Uploaded evidence files (up to 5 files, 5 MB each, JPEG/PNG/WEBP/PDF) are managed through a session-scoped in-memory store (`apps/web/lib/disputes/evidence-store.ts`). Committed preview URLs have session lifetime in this local prototype. Uncommitted drafts are isolated by `sessionId` and revoked upon item removal, modal cancellation, or unmount. When evidence is committed to a dispute record, blob URLs are bound to the `recordId`, preserving them across navigation and view re-renders for the duration of the browser session while permitting explicit cleanup upon record retirement.
5. **Fail-Closed Operations and Idempotency:** If submit handlers reject or are unavailable, forms fail closed with honest error reports. Synchronous submission locking prevents double-submission race conditions. Unknown bookings or unauthorized participants fail closed with zero synthetic backdoor fallback.

---

## 2. Pure Domain Invariants (DISP-001 to DISP-010)

The pure domain layer (`apps/web/lib/disputes/domain.ts`) enforces business rules without side effects:

1. **DISP-001 (Participant Authorization):** Initiator role must be either `customer` or `brainworker`. Unauthenticated or invalid roles are rejected.
2. **DISP-002 (Eligible Booking Status):** Disputes may only be initiated on bookings in `IN_PROGRESS` or `PENDING_COMPLETION` status. Confirmed, cancelled, or already completed bookings cannot enter dispute.
3. **DISP-003 (Dispute Category Enforcement):** Requires an approved category: `POOR_WORKMANSHIP`, `UNCOMPLETED_TASK`, `PROPERTY_DAMAGE`, `PRICING_DISAGREEMENT`, or `COMMUNICATION_FAILURE`.
4. **DISP-004 (Description Boundaries):** Description must be trimmed, non-empty, and between 20 and 2,000 characters.
5. **DISP-005 (Evidence Attachment Limits):** Maximum 5 evidence items. Each item must not exceed 5 MB (5,242,880 bytes). Supported MIME types are `image/jpeg`, `image/png`, `image/webp`, and `application/pdf`.
6. **DISP-006 (Canonical 17.5% Fee Schedule):**
   - Platform fee bps is strictly 1750 (17.5%).
   - Service fee: 10.0% (1000 bps).
   - Trust fee: 7.5% (750 bps).
   - `platformFeeKobo = Math.floor((totalSettlementKobo * 1750) / 10000)`.
   - `taskerShareKobo = totalSettlementKobo - platformFeeKobo`.
   - Invariant: `taskerShareKobo + platformFeeKobo === totalSettlementKobo`.
7. **DISP-007 (Simulated Timer Pause in Local Prototype):** When a dispute is filed, simulated auto-release timer logic is paused in the local workspace. In this prototype, real escrow and payments are not affected, and real funds are not held, moved, or released.
8. **DISP-008 (Lifecycle State Machine):**
   - `DRAFT -> SUBMITTED -> UNDER_REVIEW`.
   - `UNDER_REVIEW -> ACTION_REQUIRED | PROPOSAL_OFFERED | RESOLVED`.
   - `PROPOSAL_OFFERED -> RESOLVED | UNDER_REVIEW`.
   - `RESOLVED -> CLOSED`.
   - Disallows arbitrary terminal jumps.
9. **DISP-009 (Settlement Proposal Validation):** Settlement proposals must allocate customer refund and BrainWorker payout in integer Kobo such that their sum matches the held escrow total.
10. **DISP-010 (Counter-Evidence Validation):** Counterparty evidence submissions must adhere to the same 5-item, 5 MB, and MIME constraints as initial dispute evidence.

---

## 3. Repository Layer Contracts (REP-001 to REP-010)

The repository interface (`apps/web/lib/disputes/repository.ts`) governs state isolation and persistence:

1. **REP-001 (Isolated In-Memory Storage):** Uses private mapping with defensive deep cloning on reads and writes.
2. **REP-002 (Tenant Access Authorization):** Only the verified customer or assigned BrainWorker may query or mutate a booking dispute.
3. **REP-003 (Duplicate Dispute Prevention):** Rejects secondary dispute initiation if an active dispute already exists for the booking.
4. **REP-004 (Counter-Evidence Appending):** Appends verified evidence with uploader ID and timestamps without overwriting prior evidence.
5. **REP-005 (Timeline Audit Logging):** Every state transition and submission appends an immutable timeline event.
6. **REP-006 (Mediation Proposal Recording):** Records settlement proposal terms with proposed refund, payout, and reason notes.
7. **REP-007 (Settlement Resolution Execution):** Atomically applies resolution terms, updates status to `RESOLVED`, and records closing timestamps.
8. **REP-008 (Session-Scoped Evidence Isolation):** Integrates with `evidence-store.ts` to manage draft lifecycle safely per `sessionId` and bind committed files to `recordId`.
9. **REP-009 (Offline Read-Only Safety):** Disables dispute initiation and mutations when offline without fabricating synthetic records.
10. **REP-010 (Prerender Safety):** Contains zero imports from `testing/` and guarantees clean execution in server and client contexts.

---

## 4. UI Components (UI-001 to UI-010)

The dispute component suite (`apps/web/components/disputes/`) provides accessible, responsive interfaces adhering to Outlier operational geometry (`rounded-lg` 8px radius, theme tokens `--bg`, `--card-bg`, `--amber`, `--brand-green`, `--lead`, `--rule`):

- **DisputeBookingPageView:** Master local mediation workspace preview coordinating timeline, initiation triggers, counter-evidence triggers, banner notices, help center, and support tickets. Header plainly displays `Dispute Workspace Preview: Dispute Resolution and Support` with explicit disclaimers that it does not manage real escrow, funds, payment, or release timers. Status badge is labeled as `LOCAL RECORD: ${status}`. Unknown bookings and unauthenticated access fail closed.
- **DisputeInitiationModal (UI-001 to UI-003):** Accessible modal dialog with focus trapping, category dropdown, character count, file uploader with session-scoped draft registration, and same-tick submission locking. Explicitly clarifies: "This local preview records your dispute and pauses its simulated completion timer. It does not hold, move, or release real funds."
- **DisputeCounterEvidenceModal (UI-005b):** Accessible modal dialog for the assigned BrainWorker to append counterparty evidence to an existing dispute with focus trapping, same-tick submission locking, and session-scoped upload lifecycle.
- **DisputeTimelineView (UI-004 to UI-006, UI-011):** Chronological timeline of dispute events, local dispute record badges, settlement preview disclosures, and a dedicated Submitted Evidence gallery rendering thumbnail previews with accessible image error fallback (`role="img"`, `aria-label="Image Preview (Unavailable)"`), PDF indicators, uploader badges, file sizes, and external view links.
- **DisputeEvidenceUploader (UI-007 to UI-008):** File drag and drop target with client-side file size and MIME checks, scoped to a specific `sessionId` via `useId()` to isolate draft memory across views.
- **BrainWorkerDisputeBanner (UI-009):** Prominent notice banner for BrainWorker booking views with `role="alert"`, 44px touch targets, truthful unavailable state when record is absent, and explicit disclosure that simulated timer logic is paused in the local workspace while real escrow and payments are unaffected.
- **SupportTicketForm & HelpCenterView (UI-010):** Read-only, disabled support ticket inquiry form. All input fields and submit actions are permanently disabled, submission is marked explicitly unavailable in this local interface preview, and programmatic submission no-ops without fake review or success claims. Help center FAQs clarify that the local preview does not dispatch support tickets or contact emergency services, worker badges reflect simulated sample data without external background checks, and dispute notes and evidence are stored locally without contacting a platform mediator.

---

## 5. Protected Route Integration (ROUTE-001 to ROUTE-021)

The route `/disputes/[bookingId]` (`apps/web/app/disputes/[bookingId]/page.tsx`) enforces:

- **ROUTE-001:** Unauthenticated visitors are redirected to `/login?redirect=/disputes/[bookingId]`.
- **ROUTE-002:** Unauthorized visitors (neither customer nor worker) receive an accessible 403 alert.
- **ROUTE-003:** Non-existent booking references display an accessible 404 alert with zero demo-prefix backdoor fabrication.
- **ROUTE-004:** Customer participant view when eligible to file a dispute.
- **ROUTE-005:** Customer participant view when a dispute is active, displaying the local preview workspace notice and simulated timer pause.
- **ROUTE-006:** BrainWorker participant view displaying active dispute banner and preventing duplicate filing.
- **ROUTE-007:** Reactive offline event listeners displaying status warning and disabling form mutations with honest recoverable errors.
- **ROUTE-008:** Successful dispute filing updates view state and timeline without page reload.
- **ROUTE-009:** Support ticket form renders honestly as unavailable without fake submission success claims.
- **ROUTE-010:** DisputeTimelineView renders submitted evidence attachments with thumbnail previews, badges, and external links.
- **ROUTE-011:** BrainWorker counter-evidence workflow opens DisputeCounterEvidenceModal and submits evidence to the existing dispute via `submitCounterEvidence`.
- **ROUTE-012:** Navigating between bookings immediately clears previous dispute state and guards against stale async loads via generation counters.
- **ROUTE-012b:** Server component propagates unexpected `params` Promise rejections directly to error boundaries without swallowing exceptions, while empty `bookingId` fails closed into an accessible 404 alert.
- **ROUTE-013:** UI eligibility is strictly derived from `completionState` job status (`IN_PROGRESS` or `PENDING_COMPLETION`).
- **ROUTE-014:** Outlier operational UI hierarchy with `rounded-lg` 8px radius, single primary title, and clean card grouping.
- **ROUTE-015:** React StrictMode effect replay resilience: route parameter resolution and data fetching complete cleanly without getting stuck in a loading state.
- **ROUTE-016:** Clean A-to-B navigation isolation: Next.js 15 async server page awaiting params and passing `bookingId` with `key={bookingId}` resets modal and child state cleanly and discards pending old mutation resolution.
- **ROUTE-017:** Local booking status synchronization error handling and recovery: if `completionRepo.raiseDispute` rejects after dispute creation, the created dispute is preserved, an accessible alert (`role="alert"`) displays the honest local booking synchronization failure, the header displays `"Dispute Workspace Preview: Dispute Resolution and Support"` explaining that local booking record synchronization is unconfirmed, and `"Retry Local Status Update"` allows the user to re-attempt local status update without creating duplicate disputes.
- **ROUTE-018:** Cross-record tenant integrity: mismatched participant records between completion and dispute records fail closed into 403 Forbidden without disclosing any foreign dispute content.
- **ROUTE-019:** Truthful unconfirmed sync representation: reloading the page with an unconfirmed local booking update reflects that local booking record synchronization is unconfirmed and preserves the "Retry Local Status Update" recovery button.
- **ROUTE-020:** Repeat-safe counter-evidence submission: re-reads the latest dispute from repository before submitting and skips already recorded evidence IDs, preventing duplicates on ambiguous network retries.
- **ROUTE-020b:** Preserves distinct evidence items having matching filenames or captions when IDs differ, ensuring multi-angle or separate evidence files with identical names are not suppressed.
- **ROUTE-021:** Back link navigation: renders "Back to Booking Detail" for both customer and BrainWorker. Navigates customer to their protected role-tailored completion view at `/completion/[bookingId]` (per approved BW-009 specification). Preserves the BrainWorker destination (`/brainworker/bookings/[bookingId]`).

---

## 6. Reserved Work & Deferred Boundaries

The following areas are strictly reserved or deferred:
1. **Production Backend & Database:**
   - PostgreSQL schema migrations for disputes, evidence attachments, and timeline events (Reserved for Mr. Solomon).
   - Production payment gateway settlement webhooks (Paystack, Flutterwave) and live bank transfers (Reserved for Mr. Solomon).
2. **External Release & Native Mobile:**
   - Production cloud deployment to Vercel (Deferred pending PM approval and merge).
   - Mobile app (`apps/mobile`) native screens and push notifications (Phase 4).
