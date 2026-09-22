# Test-First Implementation Plan: WEB-016 Customer Reviews & Reputation System (v1.1)

| Field | Value |
|---|---|
| **Document ID** | WEB-016-TEST |
| **Feature** | Customer Reviews & Reputation System |
| **Status** | 🟡 Proposed for Test-First Approval (Revised v1.1) |
| **Version** | 1.1 |
| **Workstream** | Phase 1 — Customer Web Platform Completion |
| **Governing Loop** | Mr. Solomon 9-Command Engineering Loop (`/develop` & `/test` Gate) |
| **Activated Skill** | `agent-skills-test-driven-development` |
| **Prerequisites** | Scope v1.0 (Approved), Architecture v1.2 (Approved), UX v1.1 (Approved) |
| **Date** | 2026-09-22 |

---

## 1. Executive Summary & TDD Doctrine

This document establishes the strict Test-Driven Development (TDD) protocol for **WEB-016: Customer Reviews & Reputation System**. In accordance with the project's engineering loop and `agent-skills-test-driven-development`:

> **No production code or UI component may be written before its corresponding failing test is committed.**
>
> Tests represent authoritative proof of domain correctness. The implementation team writes the test first (RED), writes the minimal code to satisfy the test (GREEN), refactors for clarity and performance (REFACTOR), and verifies the full suite over SSH on the cloud Codespace.

### Mandatory Environment & Cloud SSH Rules
- **Zero Heavy Execution on Termux**: Monorepo-wide test runs (`pnpm test`, `turbo run test`), broad Vitest suites, type-checking (`turbo run check-types`), and Next.js builds (`pnpm build`) will not run locally in Termux.
- **Cloud Codespace SSH Dispatch**: All test suites, type-checking, linting, and build verifications are dispatched over SSH to cloud Codespace `effective-fishstick-x5qwp6wrrp64fxwx`:
  ```bash
  gh codespace ssh -c effective-fishstick-x5qwp6wrrp64fxwx -- "cd /workspaces/BukieBrainJobs && <COMMAND>"
  ```
- **Synchronization Pipeline**:
  1. Commit changes locally on Termux (`git commit`).
  2. Push branch to remote (`git push origin <branch>`).
  3. Pull and execute verification on Codespace.

---

## 2. Test Suite Architecture & File Layout

Six dedicated test suites will provide automated coverage of the defined domain, validation, UI, accessibility, reporting, and integration behaviors:

```
BukieBrainJobs/apps/web/
├── lib/review/
│   ├── validation.test.ts          # Suite 1: Pure validation routines & character bounds
│   └── repository.test.ts          # Suite 2: Domain repository, eligibility, duplicate, rounding, reporting
├── components/review/
│   ├── ReviewPromptCard.test.tsx   # Suite 3: JobsScreen card, receipt decoupling, offline state
│   ├── ReviewPromptModal.test.tsx  # Suite 4: Multi-criteria modal, radio ARIA, live counter, submission
│   ├── PublicReviewFeed.test.tsx   # Suite 5: Profile review tab, summary card, distribution, load more
│   └── ReportReviewModal.test.tsx  # Suite 6: Abuse reporting modal, auth gate, deduplication
```

---

## 3. Seven-Phase RED-GREEN-REFACTOR Implementation Sequence

The implementation proceeds in seven strictly sequential phases. Test-support infrastructure is created only as required to execute failing tests:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Phase 1: Pure Domain Types & Validation (TDD)                               │
│ ├── RED: Write apps/web/lib/review/validation.test.ts                       │
│ ├── GREEN: Implement apps/web/lib/review/validation.ts and types.ts         │
│ └── REFACTOR: Clean up validation helpers & regex                           │
├─────────────────────────────────────────────────────────────────────────────┤
│ Phase 2: Repository Contract Tests (RED) & Test Infrastructure Preparation  │
│ ├── RED: Write apps/web/lib/review/repository.test.ts                       │
│ └── Create minimum test-only harness/fixtures in lib/review/testing/ to     │
│     execute failing repository contract tests                               │
├─────────────────────────────────────────────────────────────────────────────┤
│ Phase 3: CustomerReviewRepository (GREEN & REFACTOR)                        │
│ ├── GREEN: Implement apps/web/lib/review/repository.ts                      │
│ ├── VERIFY: Assert zero-leakage production module boundary in index.ts      │
│ └── REFACTOR: Ensure clean in-memory map isolation and atomic operations    │
├─────────────────────────────────────────────────────────────────────────────┤
│ Phase 4: Review Prompt Card & Modal Components (TDD)                        │
│ ├── RED: Write ReviewPromptCard.test.tsx & ReviewPromptModal.test.tsx       │
│ ├── GREEN: Implement StarRatingGroup, CharacterCountTextarea,               │
│ │   ReviewPromptModal, and ReviewPromptCard                                 │
│ └── REFACTOR: Polish WCAG 2.2 AA focus trap, touch targets, and ARIA        │
├─────────────────────────────────────────────────────────────────────────────┤
│ Phase 5: Public Review Feed & Reporting Components (TDD)                    │
│ ├── RED: Write PublicReviewFeed.test.tsx & ReportReviewModal.test.tsx       │
│ ├── GREEN: Implement PublicReviewSummary, PublicReviewCard,                 │
│ │   PublicReviewFeed, and ReportReviewModal                                 │
│ └── REFACTOR: Optimize load-more pagination and empty state presentation    │
├─────────────────────────────────────────────────────────────────────────────┤
│ Phase 6: Screen & Route Integration (TDD)                                   │
│ ├── RED: Extend JobsScreen and brainworker profile page tests               │
│ ├── GREEN: Integrate ReviewPromptCard into LifecycleStateSurface.tsx        │
│ ├── GREEN: Integrate PublicReviewFeed into /brainworkers/[id]/page.tsx      │
│ └── REFACTOR: Verify tab state synchronization and deep-linking             │
├─────────────────────────────────────────────────────────────────────────────┤
│ Phase 7: Full Verification Pipeline (Cloud Codespace)                       │
│ ├── Run full regression suite (479+ tests) via SSH on Codespace             │
│ ├── Run turbo run check-types and turbo run lint                            │
│ ├── Run production build (pnpm build) on Codespace                          │
│ ├── Verify Vercel preview deployment reaches READY                          │
│ └── Complete independent implementation review                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Comprehensive Test Case Inventory

### 4.1 Canonical Counting Rule
For all validation and character counting:
- Length is calculated using Unicode code points via `Array.from(comment.trim()).length` (or `[...comment.trim()].length`) rather than raw UTF-16 code units. This ensures emojis and multi-byte characters are counted accurately.

---

### Suite 1: Pure Validation (`apps/web/lib/review/validation.test.ts`)

| Test ID | Test Description | Given / When / Then Specification |
|:---|:---|:---|
| `VAL-001` | Validate complete valid review | **Given** 4 valid ratings (1 to 5) and comment of 250 characters<br>**When** `validateReviewInput` runs<br>**Then** returns `{ valid: true, errors: {} }`. |
| `VAL-002` | Require all 4 rating criteria | **Given** review missing `punctuality` rating<br>**When** `validateReviewInput` runs<br>**Then** returns `{ valid: false, errors: { punctuality: 'Please select a rating for punctuality.' } }`. |
| `VAL-003` | Enforce integer star range (1 to 5) | **Given** rating value of 0, 6, -1, or 4.5<br>**When** `validateRating` runs<br>**Then** rejects with invalid rating error. |
| `VAL-004` | Allow empty optional written comment | **Given** 4 valid ratings and empty string or undefined comment<br>**When** `validateReviewInput` runs<br>**Then** returns `{ valid: true, errors: {} }`. |
| `VAL-005` | Trim whitespace from written comment | **Given** comment with leading/trailing spaces (`"   clean work   "`)<br>**When** sanitized<br>**Then** whitespace is trimmed to `"clean work"`. |
| `VAL-006` | Enforce exactly 1,000-character upper bound | **Given** comment of exactly 1,000 Unicode code points<br>**When** `validateReviewInput` runs<br>**Then** returns `{ valid: true }`. |
| `VAL-007` | Reject comment exceeding 1,000 characters | **Given** comment of 1,001 Unicode code points<br>**When** `validateReviewInput` runs<br>**Then** returns `{ valid: false, errors: { comment: 'Written feedback cannot exceed 1,000 characters.' } }`. |
| `VAL-008` | Reject null bytes in comment | **Given** comment containing null byte (`\0`)<br>**When** `validateReviewInput` runs<br>**Then** returns `{ valid: false, errors: { comment: 'Feedback contains invalid control characters.' } }`. |
| `VAL-009` | Reject non-printable control characters | **Given** comment containing ASCII control characters (`\x01` through `\x1F` excluding `\n`, `\r`, `\t`)<br>**When** `validateReviewInput` runs<br>**Then** rejects with invalid character error. |
| `VAL-010` | Preserve valid Unicode content | **Given** comment with accented characters, Yoruba diacritics, or emojis (`"Iṣẹ́ dáadáa! 👏"` )<br>**When** `validateReviewInput` runs<br>**Then** returns `{ valid: true }` and preserves characters intact. |

---

### Suite 2: Domain Repository (`apps/web/lib/review/repository.test.ts`)

| Test ID | Test Description | Given / When / Then Specification |
|:---|:---|:---|
| `REP-001` | Zero-leakage module boundary & exports | **Given** `apps/web/lib/review/index.ts` and `repository.ts`<br>**When** exports and AST imports are verified<br>**Then** `index.ts` exports only production repository factory and domain types; zero imports from `testing/`, zero test backdoors. |
| `REP-002` | Eligibility happy path (`COMPLETED`) | **Given** caller owns booking in `JobStatus: COMPLETED` with no review<br>**When** `getReviewEligibility` runs<br>**Then** returns `{ eligible: true, bookingSummary: { ... } }`. |
| `REP-003` | Exhaustive non-COMPLETED lifecycle rejection | **Given** booking in any of the 10 non-COMPLETED states: `OPEN`, `PENDING_ACCEPTANCE`, `CONFIRMED`, `IN_PROGRESS`, `PENDING_COMPLETION`, `PAID`, `CANCELLED`, `EXPIRED`, `DISPUTED`, `RESOLVED`<br>**When** `getReviewEligibility` runs for each state<br>**Then** returns `{ eligible: false, reason: 'booking_not_completed' }` for all 10 states. |
| `REP-004` | Non-mutation on unauthorized eligibility check | **Given** caller does not own the booking<br>**When** `getReviewEligibility` is called<br>**Then** fails closed with `UnauthorizedError`; repository state is completely untouched. |
| `REP-005` | Fail-closed ownership authorization on submit | **Given** authenticated customer ID does not match `booking.customerId`<br>**When** `submitReview` is invoked<br>**Then** throws `UnauthorizedError`; review count remains unchanged; no record is persisted. |
| `REP-006` | Atomic duplicate submission rejection | **Given** review already submitted for `bookingId`<br>**When** second submission is attempted<br>**Then** throws `DuplicateReviewError`; review count remains 1. |
| `REP-007` | Review immutability | **Given** submitted `CustomerReviewRecord`<br>**When** entity is inspected<br>**Then** contains `createdAt` but no `updatedAt`; repository exposes no update/delete method. |
| `REP-008` | Injected unavailable adapter fails closed | **Given** repository adapter configured to offline/unavailable<br>**When** `submitReview` or `reportReview` is attempted<br>**Then** throws `[Offline]` error without reading browser `window` or `navigator`; review count remains unchanged. |
| `REP-009` | Authoritative reputation rounding (round-half-up) | **Given** reviews with overall ratings `[5, 5, 4]` (mean = 4.6667)<br>**When** `getPublicReviews` is invoked<br>**Then** returns `averageRating: 4.7`. |
| `REP-010` | Disaggregated criteria averages | **Given** reviews where overall ratings differ from punctuality ratings<br>**When** `getPublicReviews` is invoked<br>**Then** `averageRating` strictly equals `criteriaAverages.overall`, while other criteria maintain independent means. |
| `REP-011` | Zero reviews calm boundary | **Given** BrainWorker with zero reviews<br>**When** `getPublicReviews` is invoked<br>**Then** returns `averageRating: 0.0`, `totalReviews: 0`, and empty review array. |
| `REP-012` | Public projection privacy masking & field omission | **Given** customer `Babajide Adeleke` with phone `+234803...` and address `Lekki`<br>**When** `getPublicReviews` is invoked<br>**Then** `reviewerDisplayName` is masked to `Babajide A.`; `customerId`, `phone`, `email`, and `address` fields are completely absent from projection. |
| `REP-013` | Report abuse happy path | **Given** authenticated customer reports a review with valid reason<br>**When** `reportReview` runs<br>**Then** returns `{ success: true, status: 'report_submitted', reportId: ... }`. |
| `REP-014` | Report abuse deduplication | **Given** customer already reported review `rev-1`<br>**When** customer reports `rev-1` again<br>**Then** returns `status: 'report_already_submitted'`; moderation ticket count remains 1. |
| `REP-015` | Reject self-reporting | **Given** customer attempts to report their own review<br>**When** `reportReview` runs<br>**Then** throws `UnauthorizedError`; moderation ticket count is 0. |
| `REP-016` | Default public review pagination | **Given** BrainWorker with 8 reviews<br>**When** `getPublicReviews` is called with no options<br>**Then** returns first 5 reviews, `totalCount: 8`. |
| `REP-017` | Explicit page and limit options | **Given** BrainWorker with 8 reviews<br>**When** `getPublicReviews(bwId, { page: 2, limit: 3 })` is called<br>**Then** returns reviews 4 through 6. |
| `REP-018` | Pagination final page boundary | **Given** BrainWorker with 8 reviews<br>**When** `getPublicReviews(bwId, { page: 2, limit: 5 })` is called<br>**Then** returns remaining 3 reviews. |
| `REP-019` | Authoritative totalCount across pages | **Given** paginated queries on page 1, 2, and 3<br>**When** results inspected<br>**Then** `totalCount` consistently returns 8 on all pages. |
| `REP-020` | Authoritative reputationSummary across pages | **Given** paginated queries<br>**When** results inspected<br>**Then** `reputationSummary` is identical on all pages (computed over full review set). |
| `REP-021` | Exact round-half-up boundary testing | **Given** review sets with means `4.65`, `4.64`, `4.25`, and `4.24`<br>**When** reputation summary calculated<br>**Then** returns exactly `4.7`, `4.6`, `4.3`, and `4.2` respectively across all criteria. |
| `REP-022` | Booking not found fails closed | **Given** non-existent `bookingId`<br>**When** `getReviewEligibility` and `submitReview` called<br>**Then** eligibility returns `{ eligible: false, reason: 'booking_not_found' }`; submit throws `NotFoundError`; no records created. |

---

### Suite 3: Review Prompt Card (`apps/web/components/review/ReviewPromptCard.test.tsx`)

| Test ID | Test Description | Given / When / Then Specification |
|:---|:---|:---|
| `CRD-001` | Render prompt on `COMPLETED` booking | **Given** activity with `jobStatus === 'COMPLETED'` and review eligible<br>**When** `ReviewPromptCard` renders<br>**Then** displays headline `Rate your experience with {workerName}` and `Leave a review` button. |
| `CRD-002` | Decoupled receipt action (Receipt Available) | **Given** `paymentContext.receiptAvailable === true`<br>**When** `ReviewPromptCard` renders<br>**Then** renders both `Leave a review` and `View Receipt` buttons. |
| `CRD-003` | Decoupled receipt action (Receipt Unavailable) | **Given** `paymentContext.receiptAvailable === false` or `null`<br>**When** `ReviewPromptCard` renders<br>**Then** renders `Leave a review`; `View Receipt` button is completely omitted. |
| `CRD-004` | Render already-reviewed summary badge | **Given** `reason === 'already_reviewed'`<br>**When** card renders<br>**Then** displays `REVIEW SUBMITTED` badge and `View on {workerName}'s profile` deep-link. |
| `CRD-005` | UI offline disabled state | **Given** `isOffline === true`<br>**When** card renders<br>**Then** `Leave a review` button is disabled with tooltip explainer. |
| `CRD-006` | Trigger submission modal on click | **Given** active review prompt<br>**When** user clicks `Leave a review`<br>**Then** opens `ReviewPromptModal`. |
| `CRD-007` | Ineligible booking hides review CTA | **Given** activity in `IN_PROGRESS` or `CONFIRMED`<br>**When** card renders<br>**Then** review prompt is completely omitted. |
| `CRD-008` | Eligibility evaluation failure fails closed | **Given** eligibility service throws error<br>**When** card renders<br>**Then** review prompt remains safely hidden without crashing UI. |

---

### Suite 4: Review Submission Modal (`apps/web/components/review/ReviewPromptModal.test.tsx`)

| Test ID | Test Description | Given / When / Then Specification |
|:---|:---|:---|
| `MDL-001` | Initial unselected state (No defaults) | **Given** modal opens for completed booking<br>**When** rendered<br>**Then** all 4 rating criteria display `Select a rating`; 0 stars selected. |
| `MDL-002` | WCAG 2.2 AA Star Radio Semantics & 44px touch targets | **Given** rating criteria rows<br>**When** DOM is inspected<br>**Then** each criterion has `role="radiogroup"`, star options have `role="radio"`, and minimum $44 \times 44\text{px}$ touch targets. |
| `MDL-003` | Star selection interaction & label | **Given** criterion row<br>**When** user clicks 4th star<br>**Then** updates state to 4, displays label `4 of 5 • Very good`, and fills 4 stars in `text-amber-500`. |
| `MDL-004` | Keyboard navigation in star radiogroup | **Given** focused star radio<br>**When** user presses `ArrowRight`<br>**Then** selection advances to next star and updates `aria-checked`. |
| `MDL-005` | Live 1,000-character counter | **Given** customer types in written feedback textarea<br>**When** 142 characters typed<br>**Then** counter renders `142 / 1,000 characters` in `aria-live="polite"` region. |
| `MDL-006` | Character limit overflow protection | **Given** user enters 1,005 characters<br>**When** rendered<br>**Then** counter turns red (`text-rose-600`), error message appears, and submit button is disabled. |
| `MDL-007` | Validation guard on incomplete ratings | **Given** user selects only 3 criteria and clicks Submit<br>**When** form validated<br>**Then** submission is blocked and missing criterion displays error message. |
| `MDL-008` | Submits complete 4-rating payload | **Given** all 4 criteria selected (Punctuality: 5, Quality: 4, Comm: 5, Overall: 5)<br>**When** user clicks `Submit review`<br>**Then** `submitReview` is invoked with all 4 authoritative numeric values in `SubmitReviewInput`. |
| `MDL-009` | Submitting state lock | **Given** valid form<br>**When** user clicks `Submit review`<br>**Then** submit button shows spinner and all form controls are disabled. |
| `MDL-010` | Success confirmation screen | **Given** successful repository persistence<br>**When** response returns<br>**Then** displays green checkmark, `Thank you for your feedback`, and `Done` button. |
| `MDL-011` | Error handling & draft preservation | **Given** repository returns simulated failure<br>**When** submit fails<br>**Then** displays alert banner, re-enables controls, and preserves customer's written draft text. |
| `MDL-012` | Modal labelledby relationship | **Given** modal rendered<br>**When** DOM inspected<br>**Then** `aria-labelledby` points to `review-modal-title`. |
| `MDL-013` | Focus restoration on dismiss | **Given** modal opened from trigger button<br>**When** dismissed via close or `Escape`<br>**Then** keyboard focus returns to the triggering button. |
| `MDL-014` | Focus trap inside active modal | **Given** open modal<br>**When** user tabs past last interactive element<br>**Then** focus wraps back to first element inside modal. |
| `MDL-015` | Overflow aria-invalid & aria-errormessage | **Given** character count > 1,000<br>**When** rendered<br>**Then** textarea has `aria-invalid="true"` and `aria-errormessage="review-comment-error"`. |
| `MDL-016` | Counter aria-live polite announcements | **Given** character counter<br>**When** DOM inspected<br>**Then** carries `aria-live="polite"` attribute. |
| `MDL-017` | Form-level whitespace trimming | **Given** user inputs `"   Clean and prompt service   "`<br>**When** submitted<br>**Then** payload comment received by repository is trimmed to `"Clean and prompt service"`. |

---

### Suite 5: Public Review Feed & Reputation (`apps/web/components/review/PublicReviewFeed.test.tsx`)

| Test ID | Test Description | Given / When / Then Specification |
|:---|:---|:---|
| `FED-001` | Reputation summary panel layout | **Given** BrainWorker with reviews<br>**When** "Customer reviews" tab renders<br>**Then** displays bold overall rating (`4.9`), star glyphs, `Verified bookings only` badge, and 4 criteria progress bars. |
| `FED-002` | Star distribution bar rendering | **Given** rating distribution data<br>**When** summary renders<br>**Then** displays counts for 5, 4, 3, 2, 1 stars. |
| `FED-003` | Verified review card presentation | **Given** public review record<br>**When** card renders<br>**Then** displays masked name (`Babajide A.`), `Verified booking` badge, service context, date, criteria tags, and comment text. |
| `FED-004` | XSS protection (safe text node rendering) | **Given** review comment containing `<script>alert('xss')</script>`<br>**When** card renders<br>**Then** rendered safely as raw text; zero script execution or HTML injection. |
| `FED-005` | Empty review state | **Given** BrainWorker with 0 reviews<br>**When** tab renders<br>**Then** displays calm empty state `No customer reviews yet`. |
| `FED-006` | "Load more reviews" pagination flow | **Given** BrainWorker with 12 reviews (5 rendered initially)<br>**When** user clicks `Load more reviews`<br>**Then** fetches next 5, shows spinner, and appends cards to feed. |
| `FED-007` | End-of-list indicator | **Given** all reviews loaded<br>**When** rendered<br>**Then** displays `Showing all 12 reviews`; `Load more` button is hidden. |
| `FED-008` | Report action opens reporting modal | **Given** public review card<br>**When** user clicks `Report this review`<br>**Then** opens `ReportReviewModal` pre-populated with that review's ID. |
| `FED-009` | Tab switching to Customer reviews | **Given** BrainWorker profile page<br>**When** user clicks `Customer reviews ({count})` tab<br>**Then** review feed renders and service focus section is hidden. |
| `FED-010` | Tab switching back to Service focus | **Given** Customer reviews tab active<br>**When** user clicks `Service focus` tab<br>**Then** service skills and location cards render. |
| `FED-011` | Deep-link tab activation | **Given** navigation to `/brainworkers/bw-1#reviews` or `?tab=reviews`<br>**When** page loads<br>**Then** Customer reviews tab is active by default. |

---

### Suite 6: Abuse Reporting Modal (`apps/web/components/review/ReportReviewModal.test.tsx`)

| Test ID | Test Description | Given / When / Then Specification |
|:---|:---|:---|
| `RPT-001` | Unauthenticated access gate | **Given** unauthenticated visitor clicks `Report this review`<br>**When** action triggered<br>**Then** redirects to `/login` or opens auth modal; report modal is blocked. |
| `RPT-002` | Render 6 moderation reasons | **Given** authenticated customer opens report modal<br>**When** modal renders<br>**Then** displays 6 approved radio reasons with subtitle `Tell us why you believe this review should be reviewed.` |
| `RPT-003` | Unconstrained details field with content safety | **Given** user types details<br>**When** details entered<br>**Then** accepts input without 500-character restriction, but rejects null bytes and control characters. |
| `RPT-004` | Deduplicated report submission | **Given** review already reported by caller<br>**When** user opens modal<br>**Then** displays info banner `You have already submitted a report for this review.` and submit is disabled. |
| `RPT-005` | Self-report rejection | **Given** review authored by current customer<br>**When** report attempted<br>**Then** fails closed with `UnauthorizedError`. |
| `RPT-006` | Report success confirmation | **Given** report submitted successfully<br>**When** response returns<br>**Then** displays `Report received` and confirmation body. |
| `RPT-007` | Reject invalid abuse reason | **Given** submission payload with undefined or unrecognized reason<br>**When** validated<br>**Then** submission is blocked with validation error. |
| `RPT-008` | Reject missing authenticated caller | **Given** empty caller string<br>**When** `reportReview` called<br>**Then** throws `UnauthorizedError`. |
| `RPT-009` | Reject missing review ID | **Given** non-existent `reviewId`<br>**When** `reportReview` called<br>**Then** throws `NotFoundError`. |
| `RPT-010` | Non-mutation on report failure | **Given** reporting fails due to authorization or validation<br>**When** error occurs<br>**Then** zero moderation records are created in persistence. |

---

## 5. Verification & Acceptance Criteria Gate

Before marking `/test` complete and declaring WEB-016 ready for delivery:

- [ ] All 6 test suites pass on cloud Codespace `effective-fishstick-x5qwp6wrrp64fxwx`.
- [ ] 0 test regressions across existing 479 tests in `apps/web`.
- [ ] `turbo run check-types` passes with zero errors.
- [ ] `turbo run lint` passes with zero errors.
- [ ] WCAG 2.2 AA accessibility verification passes.
- [ ] Next.js production build (`pnpm build`) succeeds on Codespace.
- [ ] Git commit and push to remote branch.
- [ ] Vercel preview deployment reaches `READY`.
- [ ] Independent implementation review completed.

---

*WEB-016 Test-First Implementation Plan v1.1 — prepared under the Mr. Solomon 9-Command Engineering Loop*
