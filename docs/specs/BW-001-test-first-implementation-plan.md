# Test-First Implementation Plan: BW-001 BrainWorker Platform Onboarding & Identity Verification (v1.0)

| Field | Value |
|---|---|
| **Document ID** | BW-001-TEST |
| **Feature** | BrainWorker Onboarding & Identity Verification |
| **Status** | 🟡 Proposed for Test-First Approval (v1.0) |
| **Version** | 1.0 |
| **Workstream** | Phase 2: BrainWorker (Service Provider) Web Platform |
| **Governing Loop** | Mr. Solomon 9-Command Engineering Loop (`/develop` & `/test` Gate) |
| **Activated Skill** | `agent-skills-test-driven-development` |
| **Prerequisites** | Scope v1.0 (Locked), Architecture Contract v1.0 (Locked), UX Specification v1.0 (Locked) |
| **Date** | 2026-09-24 |

---

## 1. Executive Summary & TDD Protocol

This document establishes the strict Test-Driven Development (TDD) protocol for **BW-001: BrainWorker Platform Onboarding & Identity Verification**. In accordance with the project's engineering loop and `agent-skills-test-driven-development`:

> **No production code or UI component may be written before its corresponding failing test is committed.**
>
> Tests represent authoritative proof of domain correctness. The implementation team writes the test first (RED), writes the minimal code to satisfy the test (GREEN), refactors for clarity and performance (REFACTOR), and verifies the full suite over SSH on the cloud Codespace.

### Mandatory Environment & Cloud SSH Rules
- **Zero Heavy Execution on Termux**: Monorepo-wide test runs (`pnpm test`, `turbo run test`), broad Vitest suites, type-checking (`tsc --noEmit`), and Next.js builds (`pnpm build`) will not run locally in Termux.
- **Cloud Codespace SSH Dispatch**: All test suites, type-checking, linting, and build verifications are dispatched over SSH to cloud Codespace `effective-fishstick-x5qwp6wrrp64fxwx`:
  ```bash
  gh codespace ssh -c effective-fishstick-x5qwp6wrrp64fxwx -- "cd /workspaces/BukieBrainJobs && <COMMAND>"
  ```
- **Synchronization Pipeline**:
  1. Commit changes locally on Termux (`git commit`).
  2. Push branch to remote (`git push origin <branch>`).
  3. Pull and execute verification on Codespace.

---

## 2. Invariant Assertions Across All Suites

Every test suite in BW-001 enforces four core project invariants:

1. **Format Validation Is Never Verification**:
   Tests asserting NIN/BVN format checking strictly verify that the UI labels inputs as `"11-digit format valid"` and never asserts `"Verified"`.
2. **Single Operating Gatekeeper (`isBrainWorkerApproved`)**:
   Tests asserting workspace access strictly check `isBrainWorkerApproved: true` on the session/auth storage. Neither `SUBMITTED` nor `PENDING_REVIEW` grants access to `/brainworker/dashboard`.
3. **Fail-Closed Role & Tenant Isolation**:
   Customer accounts (`role: 'customer'`) and cross-provider query attempts fail closed with `UnauthorizedError`.
4. **Physical Boundary Isolation**:
   Production files have zero imports from `lib/brainworker/testing/`.

---

## 3. Test Suite Breakdown (Phases 1–8)

The implementation is broken down into 8 phased test suites:

```
apps/web/
├── lib/brainworker/
│   ├── types.test.ts                                     # Suite 1: Domain types & enums
│   ├── validation.test.ts                                 # Suite 1: Format & file validation
│   └── repository.test.ts                                # Suite 2: Repository contract & lifecycle
├── components/brainworker/onboarding/
│   ├── DocumentUploadCard.test.tsx                       # Suite 3: Document staging & preview
│   ├── IdentityStepForm.test.tsx                         # Suite 4: Stepper & Step 1 Identity
│   ├── TradeStepForm.test.tsx                            # Suite 5: Step 2 Trade & Coverage
│   ├── CredentialsAndReviewForms.test.tsx                # Suite 6: Step 3 & Step 4 Review
│   └── VerificationStatusCard.test.tsx                   # Suite 7: Status Monitor states
└── app/brainworker/
    └── BrainWorkerRoutes.test.tsx                        # Suite 8: Route integration & guards
```

---

### Suite 1: Domain Models, Types & Format Validation
- **Files**: `apps/web/lib/brainworker/types.test.ts`, `apps/web/lib/brainworker/validation.test.ts`
- **Scope**:
  - `TYP-001`: Validates domain enums and status literals (`BrainWorkerOnboardingStatus`, `OnboardingStep`, `IdentityIdentifierType`, `SpecificDocumentType`, `RejectionReasonCode`).
  - `VAL-001`: Validates 11-digit NIN format check (`/^\d{11}$/`), rejecting non-numeric, short (<11), and long (>11) strings.
  - `VAL-002`: Validates 11-digit BVN format check (`/^\d{11}$/`), rejecting non-numeric, short (<11), and long (>11) strings.
  - `VAL-003`: Confirms `maskIdentityIdentifier` outputs `•••••••${last4}` for valid 11-digit inputs.
  - `VAL-004`: Validates document file size enforcement (accepts <= 5 MB `5,242,880` bytes; rejects > 5 MB).
  - `VAL-005`: Validates MIME whitelist (`image/jpeg`, `image/png`, `image/webp`, `application/pdf`), rejecting unsupported extensions.
  - `VAL-006`: Validates date of birth calculation, enforcing >= 18 years requirement.

---

### Suite 2: Repository Contract & Multi-Tenant Isolation
- **File**: `apps/web/lib/brainworker/repository.test.ts`
- **Scope**:
  - `REP-001`: Throws `UnauthorizedError` if `brainWorkerId` is empty or unauthenticated.
  - `REP-002`: Throws `UnauthorizedError` if authenticated user has `role: 'customer'`.
  - `REP-003`: Enforces provider isolation: provider A cannot query or mutate provider B's record.
  - `REP-004`: Creates initial `DRAFT` record for a new BrainWorker with `status: 'DRAFT'` and step `identity`.
  - `REP-005`: Saves draft step data (`saveDraftStep`) and persists updates across steps.
  - `REP-006`: Stages documents (`stageDocument`) under the correct `DocumentCategory` and `SpecificDocumentType`.
  - `REP-007`: Removes staged documents (`removeStagedDocument`).
  - `REP-008`: Rejects submission if mandatory steps or documents are missing (Government ID or Trade Proof).
  - `REP-009`: Transitions status from `DRAFT` to `SUBMITTED` upon valid `submitOnboarding()`, stamping `submittedAt`.
  - `REP-010`: Prevents mutations (`saveDraftStep`, `stageDocument`) when status is `SUBMITTED`, `PENDING_REVIEW`, or `REJECTED`.
  - `REP-011`: Unlocks only flagged step when operational review sets status to `REMEDIATION_REQUIRED`.
  - `REP-012`: Records authoritative rejection details with explicit `RejectionReasonCode` and message.
  - `REP-013`: Sets `isBrainWorkerApproved: true` strictly upon `APPROVED` resolution.

---

### Suite 3: Document Staging & Preview Card Component
- **File**: `apps/web/components/brainworker/onboarding/DocumentUploadCard.test.tsx`
- **Scope**:
  - `DOC-001`: Renders dropzone with supported formats indicator and 5 MB ceiling notice.
  - `DOC-002`: Displays actionable client-side error when user selects a file > 5 MB.
  - `DOC-003`: Displays actionable error when user selects an unsupported file format.
  - `DOC-004`: Renders aspect-ratio constrained thumbnail for image uploads using object URLs.
  - `DOC-005`: Renders accessible document card for PDF uploads with file name and formatted size.
  - `DOC-006`: Calls `onRemove` and properly revokes object URLs when user clicks "Remove".
  - `DOC-007`: Allows single-click "Replace" file action.
  - `DOC-008`: Disables file picker and remove controls when `disabled={true}` (submitted state).

---

### Suite 4: Stepper Progress & Step 1 Identity Form
- **File**: `apps/web/components/brainworker/onboarding/IdentityStepForm.test.tsx`
- **Scope**:
  - `STP-001`: `FunnelProgressBar` renders 4 steps with active step highlight and completed checkmarks.
  - `STP-002`: `FunnelProgressBar` renders compact mobile status bar with step ratio (`Step X of 4`).
  - `IDE-001`: Renders legal name fields (first, middle, last) and validates non-empty submission.
  - `IDE-002`: Renders date of birth selectors and displays error if applicant is under 18 years old.
  - `IDE-003`: Toggles identifier selector between NIN and BVN.
  - `IDE-004`: Sanitizes 11-digit input to numbers only and shows live character counter.
  - `IDE-005`: Displays `"✓ 11-digit format valid"` when 11 digits are entered, and never displays `"Verified"`.
  - `IDE-006`: Masks input on blur (`•••••••1234`) with "Show / Edit" toggle.
  - `IDE-007`: Validates Nigerian residential address fields (Street, State, LGA).
  - `IDE-008`: Disables "Save & Continue" button until all identity requirements are satisfied.

---

### Suite 5: Step 2 Trade & Coverage Form
- **File**: `apps/web/components/brainworker/onboarding/TradeStepForm.test.tsx`
- **Scope**:
  - `TRD-001`: Renders selection grid of the 8 canonical categories with icons and accessible radio semantics.
  - `TRD-002`: Allows selection of exactly one primary trade category.
  - `TRD-003`: Allows adding and removing sub-specialty tags (up to 5 tags maximum).
  - `TRD-004`: Renders 3 experience tier cards (Apprentice, Journeyman, Master Craftsman).
  - `TRD-005`: Validates years in trade as a positive integer between 1 and 50.
  - `TRD-006`: Renders interactive pills for the 7 canonical Nigerian coverage cities.
  - `TRD-007`: Requires at least 1 coverage city to be selected before proceeding.
  - `TRD-008`: "Back to Identity" returns to Step 1 without data loss; "Save & Continue" advances to Step 3.

---

### Suite 6: Step 3 Credentials & Step 4 Review Forms
- **File**: `apps/web/components/brainworker/onboarding/CredentialsAndReviewForms.test.tsx`
- **Scope**:
  - `CRD-001`: Renders mandatory Government ID section with document type selector.
  - `CRD-002`: Renders mandatory Trade Proof section with certificate / freedom letter selector.
  - `CRD-003`: Renders optional Workshop / Equipment Proof section with work proof type selector.
  - `CRD-004`: Disables "Save & Continue" until at least 1 Government ID and 1 Trade Proof are staged.
  - `REV-001`: Renders comprehensive summary cards for Identity, Trade, and Credentials.
  - `REV-002`: Renders masked NIN/BVN in summary (`•••••••1234`).
  - `REV-003`: Provides "Edit" buttons on summary cards jumping directly back to respective steps.
  - `REV-004`: Renders truthfulness and terms checkboxes; submit button disabled until both are checked.
  - `REV-005`: Triggers `submitOnboarding()` on submit click and renders loading indicator.

---

### Suite 7: Verification Status Monitor Component
- **File**: `apps/web/components/brainworker/onboarding/VerificationStatusCard.test.tsx`
- **Scope**:
  - `STA-001`: Renders `SUBMITTED` card with queue placement notification and 24–48h turnaround disclaimers.
  - `STA-002`: Renders `PENDING_REVIEW` card with pulsing in-progress badge and multi-stage review checklist.
  - `STA-003`: Renders `REMEDIATION_REQUIRED` card with explicit reviewer issue text and direct "Update [Step]" CTA.
  - `STA-004`: Renders `REJECTED` card with plain-language explanation matching authoritative `RejectionReasonCode`.
  - `STA-005`: Renders `APPROVED` card with verified badge and direct CTA routing to `/brainworker/dashboard`.

---

### Suite 8: Route Integration, Role Guards & Static Safety
- **File**: `apps/web/app/brainworker/BrainWorkerRoutes.test.tsx`
- **Scope**:
  - `INT-001`: `/brainworker/register` renders provider signup form and handles registration.
  - `INT-002`: `/brainworker/register` displays error on duplicate phone/email and shows customer boundary alert.
  - `INT-003`: Unauthenticated visitor accessing `/brainworker/onboarding` redirects to `/login?redirect=/brainworker/onboarding`.
  - `INT-004`: Authenticated Customer accessing `/brainworker/onboarding` is blocked with boundary conflict notice.
  - `INT-005`: Approved BrainWorker (`isBrainWorkerApproved: true`) accessing `/brainworker/onboarding` redirects to `/brainworker/dashboard`.
  - `INT-006`: Submitted BrainWorker accessing `/brainworker/onboarding` redirects to `/brainworker/verification-status`.
  - `INT-007`: Unapproved BrainWorker accessing `/brainworker/dashboard` redirects to `/brainworker/verification-status`.
  - `INT-008`: `/brainworker/verification-status` renders real repository status for authenticated BrainWorker.
  - `INT-009`: Prerender guard ensures all routes compile safely during Next.js static generation without ReferenceErrors.

---

## 4. Execution Workflow & Verification Gate

Once the Test-First Plan is approved:

1. **Branch Creation**:
   - `git checkout -b feature/bw-001-brainworker-onboarding`
2. **Phase 1 RED (Suites 1 & 2)**:
   - Commit failing domain types, validation, and repository tests.
   - Verify genuine failures on Codespace.
3. **Phase 1 GREEN**:
   - Implement minimal domain models, validation utilities, and mock repository.
   - Verify green on Codespace.
4. **Phases 2 through 8 (Iterative Component & Route RED/GREEN)**:
   - Progressively implement funnel forms, status cards, and page routes.
5. **Final Production Verification Gate**:
   - Full test suite passing (all WEB + BW suites).
   - TypeScript `pnpm tsc --noEmit` clean (`exactOptionalPropertyTypes: true`).
   - ESLint `pnpm lint` clean.
   - Next.js `pnpm build` clean with all routes prerendered.
   - Physical boundary inspection: 0 `testing/` imports in production code.
   - Vercel preview deployment audit.
