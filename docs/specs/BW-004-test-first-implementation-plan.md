# BW-004 Test-First Implementation Plan

**Document ID:** BW-004-TDD
**Version:** 0.2 (Revision A)
**Status:** APPROVED as the implementation baseline. Product, architecture, and implementation gates closed by Product Owner decision on 2026-10-03. Implementation is authorized only on `feature/bw-004-booking-management`.
**Package:** 4 of 4
**Depends on:** BW-004-PROD, BW-004-ARCH, BW-004-UX

> **Revision A.** REVIEWED, NOT YET APPROVED. Adds escrow-independence contracts,
> the three-input address unlock policy, refusal to hardcode the proximity value,
> the absence of any scope approval path, and the event-only notification
> assertion.

## 1. Execution Rule

No implementation begins before the corresponding RED contract exists. Each
phase runs RED to GREEN to regression to independent audit. No speculative
phase is added to make this plan look complete.

No `feature/bw-004-*` branch is created until this whole package is approved.

### Verified tooling

Taken from the repository, not assumed:

| Concern | Command |
| --- | --- |
| Workspace test entry point | `pnpm test` (runs `turbo run test`) |
| Web and BrainWorker suite | `pnpm --filter @bukiebrainjobs/web test`, which is `vitest run` |
| One focused test file | `pnpm --filter @bukiebrainjobs/web test <path>` |
| Type check | `pnpm type-check` (runs `turbo run type-check`) |
| Shared types check | `pnpm --filter @bukiebrainjobs/api-types type-check` (`tsc --noEmit`) |

`@bukiebrainjobs/api-types` has no `test` script. Its only gate is
`type-check`, so shared-type contracts are proved by `gcheck` and by the
web suite that consumes them, never by a suite that does not exist.

Builds, type checks, and suites run on Google Cloud Shell via `gtest`, `gcheck`,
and `gbuild`, never locally in Termux. Local runs are a single-file `vitest run`
against one test path and nothing wider.

## 2. Phase Map

### Phase 1: Domain Contracts and Projection

- BOOK-001 provider gate: approved, complete provider admitted
- BOOK-002 unapproved provider refused
- BOOK-003 incomplete operational profile refused
- BOOK-004 foreign booking projects as not found, not forbidden
- BOOK-005 projection omits customer phone, email, and billing fields
- BOOK-006 general location only before `CONFIRMED`
- BOOK-007 exact address present only under the D8 unlock rule
- BOOK-008 escrow-pending booking shows general area, not exact address
- BOOK-009 `allowedActions` computed by the authority from state and escrow
- BOOK-010 allowed actions in every JobStatus, including DISPUTED and CANCELLED
- BOOK-011 no new JobStatus value is introduced by the module
- BOOK-012 deterministic grouping and sort by `scheduledStartAt`
- BOOK-013 `CONFIRMED` does not imply escrow funding and no path derives funding from a lifecycle value
- BOOK-014 `IN_PROGRESS` does not imply escrow funding
- BOOK-015 no composite status such as `READY_FOR_CHECK_IN` exists in `JobStatus` or on the booking record
- BOOK-016 no `escrowHeld` boolean is exposed; the projection carries the authoritative `EscrowStatus`
- BOOK-017 the `EscrowShield` presentation enum is not imported and no third escrow vocabulary exists

### Phase 2: Repository and Tenant Isolation

- REP-001 unauthenticated read refused
- REP-002 cross-provider read refused
- REP-003 cross-provider mutation refused
- REP-004 unapproved provider mutation refused
- REP-005 missing booking ID returns not found
- REP-006 storage is tenant-scoped by BrainWorker ID
- REP-007 offline mutation fails closed with `OFFLINE`
- REP-008 no stored location snapshot survives for later submission
- REP-009 production export surface contains no testing helpers
- REP-010 production modules contain zero `testing/` imports
- REP-011 compare-and-set rejects a stale concurrent mutation
- REP-012 the exact address unlocks only when booking resolution, privacy policy, and escrow policy all pass
- REP-013 any single failing unlock input returns the general area
- REP-014 the address is scoped to one booking assigned to the provider, never to the list or the customer profile

### Phase 3: Dispatch Tracking

- DIS-001 mark en route from `CONFIRMED`
- DIS-002 mark arrived from `CONFIRMED`
- DIS-003 direct `NOT_STARTED -> ARRIVED` permitted
- DIS-004 no backward transition
- DIS-005 dispatch update refused when jobStatus is not `CONFIRMED`
- DIS-006 authoritative timestamp recorded, never client-authored
- DIS-007 optional snapshot stored on arrival, absent on en route
- DIS-008 dispatch update emits a domain event, no notification delivery

### Phase 4: Check-in

- CHK-001 valid snapshot from `CONFIRMED` produces `IN_PROGRESS`
- CHK-002 `canTransition` is the gate; no direct state write
- CHK-003 `actualStartAt` written by the authority
- CHK-004 out-of-range snapshot refused, prior state retained
- CHK-005 unusable accuracy refused
- CHK-006 denied or unavailable permission refused with a distinct code
- CHK-007 escrow not held refused
- CHK-008 check-in refused when jobStatus is not `CONFIRMED`
- CHK-009 no client-supplied threshold is trusted
- CHK-010 no continuous tracking or `watchPosition` retention
- CHK-011 the financial prerequisite is read from `EscrowStatus`, never inferred from `CONFIRMED` or `IN_PROGRESS`
- CHK-012 check-in never writes escrow, payment, refund, or payout state
- CHK-013 an unfunded `CONFIRMED` booking fails closed with `ESCROW_NOT_HELD` and preserves prior state
- CHK-014 the proximity threshold is read from authority configuration and no module hardcodes a radius
- CHK-015 no test asserts 200 meters as a fixed platform fact and no UI copy states a radius

### Phase 5: Scope Adjustment

- SCOPE-001 submit from `IN_PROGRESS`
- SCOPE-002 submit refused outside `IN_PROGRESS`
- SCOPE-003 only one `PENDING` request per booking
- SCOPE-004 reason validated against the closed taxonomy
- SCOPE-005 non-negative integer kobo validation
- SCOPE-006 at least one of labor or materials above zero
- SCOPE-007 total derived by the authority, client total rejected on conflict
- SCOPE-008 note length and character validation
- SCOPE-009 withdraw a `PENDING` request
- SCOPE-010 withdraw refused for an already decided request
- SCOPE-011 approval never mutates the quote, JobStatus, payment, or escrow
- SCOPE-012 rejection leaves the booking unchanged
- SCOPE-013 decision stamps, once a customer authority exists, are authority
      generated; no BW-004 method fabricates them
- SCOPE-014 BW-004 authors only `PENDING` and `WITHDRAWN`, with no method to approve, reject, or expire
- SCOPE-015 no customer decision endpoint, auto-approval, or timeout approval exists
- SCOPE-016 the repository exposes no settlement path and no quote mutation path
- SCOPE-017 while no customer decision authority exists, the repository produces
      no `APPROVED`, `REJECTED`, or `EXPIRED` state and no test simulates one
- SCOPE-018 no test asserts or manufactures revised pricing, payment
      authorization, escrow adjustment, ledger mutation, or refund/additional-payment behaviour

### Phase 6: Provider Cancellation

- CAN-001 cancel from `CONFIRMED`
- CAN-002 cancel refused from `IN_PROGRESS`
- CAN-003 cancel refused from every terminal state
- CAN-004 reason validated against the taxonomy
- CAN-005 `OTHER` requires a bounded note
- CAN-006 `cancelledBy` and reason recorded by the authority
- CAN-007 concurrent customer cancellation yields authoritative state, no
      false success
- CAN-008 no refund, penalty, or rating effect is produced or claimed

### Phase 7: UI

- UI-001 list loading
- UI-002 populated list, grouped and sorted
- UI-003 empty state links to `/brainworker/leads` and fabricates no bookings
- UI-004 degraded state keeps last authorized data
- UI-005 offline state disables every mutation with a reason
- UI-006 repository failure and retry
- UI-007 detail renders all five blocks
- UI-008 address rendering for masked, unlocked, and escrow-pending cases
- UI-009 contact control opens the conversation, exposes no credentials
- UI-010 sequential dispatch controls with disabled reasons
- UI-011 check-in copy states single-snapshot capture, no override
- UI-012 every typed refusal renders its own message and next step
- UI-013 scope form derives total and never says approved while pending
- UI-014 cancellation dialog focus containment and focus restore
- UI-015 keyboard operation and visible focus
- UI-016 reduced motion
- UI-017 no color-only status
- UI-018 mobile detail fully usable at 320px
- UI-019 no earnings, payout, or wallet figure anywhere
- UI-020 disputed and cancelled states render read-only with no actions
- UI-021 no control approves, rejects, or auto-decides a scope request
- UI-022 `APPROVED` and `REJECTED` render only as read-only projections
- UI-023 the surface emits domain events only and creates no notification record
- UI-024 check-in copy states the payment prerequisite and implies no payment change

### Phase 8: Route Integration and Security

- INT-001 unauthenticated redirect with return path
- INT-002 customer fail-closed boundary
- INT-003 unapproved provider redirect to verification status
- INT-004 incomplete profile setup gate
- INT-005 approved complete provider list load
- INT-006 authenticated ID matches repository ID
- INT-007 `bookingId` validated and never trusted for ownership
- INT-008 static or prerender safe route
- INT-009 production route contains no testing imports
- INT-010 dashboard link reaches `/brainworker/bookings` and carries no
      booking authority
- INT-011 no private customer credentials in the rendered projection

### Phase 9: Production Verification

Required evidence:

- focused BW-004 suite green;
- BrainWorker regression suite green;
- monorepo web regression suite green;
- TypeScript strict check;
- ESLint;
- production build;
- physical testing-boundary inspection;
- Vercel deployment READY;
- runtime error and log review;
- route smoke verification;
- clean branch and mainline lineage before merge authorization.
- assertion that no BW-004 module or test depends on the WEB-017 `CONFIRMED` wording
- confirmation that the WEB-017 cross-spec correction is tracked as a governed
  dependency and was not silently absorbed

## 3. External Dependencies

| Spec | Relationship |
| --- | --- |
| `packages/api-types` `JobStatus` and `canTransition` | Lifecycle authority. Imported, never redefined, never bypassed. |
| WEB-013 | Booking lifecycle rules. Every mutation respects the transition guard. |
| WEB-015 | `EscrowStatus` is the financial authority. Read-only to BW-004. |
| WEB-017 | Conversation lookup and post-completion read-only rules. Its funded `CONFIRMED` wording is not adopted and needs a governed correction. |
| WEB-018 | Notification projection. BW-004 emits domain events only and creates no notification record. |
| BW-003 | The accepted quote stays immutable under any scope adjustment. |

## 4. Test Data

Fixtures must include approved complete, unapproved, incomplete, foreign-owned,
and off-duty providers; bookings in `CONFIRMED`, `IN_PROGRESS`,
`PENDING_COMPLETION`, `COMPLETED`, `PAID`, `CANCELLED`, `EXPIRED`,
`PENDING_COMPLETION` with escrow held, and `DISPUTED`; confirmed-unfunded;
each dispatch status; in-range, out-of-range, low-accuracy, and denied
location; pending, approved, rejected, and withdrawn scope adjustments;
cancellation races; offline cache; multi-item and zero-item scope requests.

Fixtures are tenant-scoped and deterministic.

## 5. Security Regression

Every mutation test proves that the authenticated BrainWorker identity is
authoritative. A provider ID supplied by the UI is never trusted. No test
requires customer contact data to render. No test may construct a transition
the architecture contract does not permit.

## 6. Physical Boundary

Production code must not import `testing/`, fixtures, factories, or test-only
repositories. Verified by INT-009, INT-010, REP-009, REP-010.

## 7. Blocked Phase

**Gate 1.** Phase 5 cannot ship to users until the customer-side scope approval
surface exists (BW-004-PROD section 6, item 1). It must arrive as a separately
governed customer-side slice, or as an explicitly approved extension to an
existing customer slice. The provider-side code and tests may land behind the
availability of that decision; the control must not reach users first.

SCOPE-017 and SCOPE-018 exist to prove Gate 1 and Gate 3 in code. Both are
required to pass before the implementation phase may be called complete, and
neither may be deleted or relaxed to make a phase green. Being the approved
baseline does not waive them.

## 8. Completion Gate

BW-004 is complete only when every approved phase passes, no blocking defect
remains, documentation is reconciled, the mainline deployment is verified, and
human merge approval is granted.

This package becomes the implementation baseline only after Gates 1, 2, and 3
are resolved by their owners and reflected in these four documents. Until then
the package is architecturally accepted and no `feature/bw-004-*` branch exists.
Resolving a gate means a named owner has decided it, not that a document
restated it.
