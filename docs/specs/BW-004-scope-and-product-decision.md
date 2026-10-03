# BW-004 BrainWorker Booking Management and Fulfillment: Scope and Product Decision

**Document ID:** BW-004-SCOPE
**Version:** 0.2
**Status:** Approved by Product Owner on 2026-10-03 (approval gate BW-004 Scope and Product Decision: APPROVED). This approves scope identity and product decisions only. The three implementation gates in section 8 were closed by Product Owner decision on 2026-10-03, and this approval is subject to the governed boundaries established in the four BW-004 package documents.
**Scope Identifier:** BW-004
**Title:** BrainWorker Booking Management and Fulfillment
**Primary Route(s):** To be decided (no route is authorized by this artifact)
**Primary User:** Approved BrainWorker

> This artifact establishes scope identity and product decisions only. It authorizes
> no implementation, no architecture contract, no UX specification, no test plan,
> and no feature branch.

## 1. Canonical Identity

BW-004 is BrainWorker Booking Management and Fulfillment.

This is the only source-backed assignment of the BW-004 identifier: `docs/scope.md`
(Upcoming Planned Slices, slice 22) explicitly labels BW-004 as BrainWorker Booking
Management and Fulfillment and points at the future spec
`docs/specs/BW-004-booking-management.md`, which does not exist yet.

No code, route, test, or contract in this repository may claim the BW-004
identifier for any other slice.

## 2. Relationship to the Dashboard and Operating Workspace

The BrainWorker Dashboard and Operating Workspace (`docs/master-checklist.md`
§2.2: authenticated home at `/brainworker/dashboard`, active-jobs metric cards,
online/off-duty toggle, urgent local requests ticker) remains a separate
outstanding BrainWorker surface.

It is not BW-004. This artifact does not rename it, absorb it, or authorize
work on it. The existing `/brainworker/dashboard` route continues to be governed
by its current BW-001/BW-002 behavior until a separate scope decision addresses it.

Governance reconciliation in section 8 removes the apparent contradiction
without renaming either slice.

## 3. Scope Boundaries

BW-004 owns the BrainWorker side of confirmed-booking execution, within the
subjects below. Each subject still requires detailed product, architecture, UX,
and test decisions before implementation:

1. **Active booking management**: the provider view and handling of bookings
   that have left the invitation and quote stage.
2. **Customer contact shortcuts**: authorized, booking-scoped access to the
   customer communication paths the platform already permits.
3. **On-site check-in**: provider confirmation of presence at the job location.
4. **Arrival tracking**: provider-side dispatch status updates between departure
   and arrival.
5. **Scope adjustment requests**: provider requests for additional parts or labor
   when on-site discovery changes the work.

Anything beyond these five subjects (completion submission, customer
confirmation, escrow release, ratings, disputes, payouts) belongs to later
slices unless a future approved spec explicitly assigns it to BW-004.

## 4. Dependencies

BW-004 consumes, and must not duplicate or rewrite, the established surfaces:

- **BW-001 identity and approval**: authenticated session, brainworker role,
  approval flag, verified trade categories and coverage cities.
- **BW-002 operations**: service catalog, weekly availability, operational
  zones, travel radius, readiness versus live duty.
- **BW-003 leads, invitations, and quotes**: invitation ownership, canonical
  decline taxonomy, authoritative timestamps, catalog-sourced diagnostic fees,
  quote independence from booking, payment, and escrow.
- **Customer booking lifecycle (WEB-013)**: the authoritative JobStatus state
  machine and its canTransition boundary. BW-004 must not invent competing
  status values.
- **Messaging (WEB-017)**: existing conversation threads, authorization, and
  offline behavior.
- **Notifications (WEB-018)**: existing feed, deep links, and push opt-in
  behavior.
- **Payments and escrow (WEB-015)**: where relevant, as a read-only boundary.
  BW-004 authorizes no new payment or escrow rules (see section 5).

## 5. Explicit Non-Goals

Out of scope unless a future approved spec explicitly adds them:

- No new payment, escrow, payout, or settlement rules.
- No dispute system creation or expansion.
- No customer-side quote negotiation or booking fulfillment workflow.
- No mobile (Expo) implementation.
- No production backend or database activation merely because a future
  integration will require it.
- No invented fulfillment behavior: no fabricated check-ins, arrival events,
  scope approvals, completions, confirmations, or ratings.
- No matching-engine ranking changes.
- No relaxation of tenant isolation, privacy projection, or offline fail-closed
  behavior established by BW-001 through BW-003.

## 6. Open Product Decisions

Each item below is unresolved. It is recorded here so it is not guessed during
specification. The future BW-004 specification package must resolve each one
or explicitly defer it:

1. Booking state ownership: which JobStatus values and transitions the
   BrainWorker surface may initiate versus only display.
2. Check-in semantics: what constitutes a valid check-in, what evidence it
   requires, and which state transition (if any) it produces.
3. Arrival evidence: what departure and arrival updates mean, what evidence
   backs them, and whether customer-visible tracking is in scope.
4. Customer notification behavior: which provider actions notify the customer,
   through which channel, and with what copy.
5. Scope-change lifecycle and approval: request shape, customer approval step,
   effect on quote and booking state, and rejection path.
6. Cancellation interaction: what the provider can and cannot cancel, from
   which states, and how it interacts with canTransition and the customer
   cancellation path.
7. Offline behavior: what is readable offline, what is disabled offline, and
   whether any offline queue is permitted (default: none, consistent with
   BW-003).
8. Location and privacy boundaries: what location precision the provider sees
   before, during, and after the job, and when exact address and customer
   contact details unlock, if ever, and under which state.
9. Interaction with booking, payment, and escrow states: how BW-004 reads
   CONFIRMED, IN_PROGRESS, PENDING_COMPLETION, COMPLETED, PAID, and DISPUTED
   without mutating payment or settlement.
10. Route and entry ownership: which routes BW-004 owns versus the Dashboard
    workspace, and how the two surfaces link without duplicating authority.

## 7. Acceptance Criteria

Only criteria directly supported by the approved scope above. Unresolved detail
is marked as requiring the future specification package rather than asserted:

- [ ] BW-004 scope identity (Booking Management and Fulfillment) is recorded
      and the Dashboard is documented as a separate surface.
- [ ] The five scope subjects (section 3) are the bounded subject of the future
      specification package; no additional fulfillment behavior is assumed.
- [ ] Dependencies (section 4) are consumed, not duplicated; the WEB-013 state
      machine and canTransition boundary are named as authoritative.
- [ ] Non-goals (section 5) are respected by the future specification package.
- [ ] Every open decision (section 6) is resolved or explicitly deferred by the
      future specification package. None is implemented on assumption.
- [ ] No implementation branch, contract, component, route, or test is created
      under this artifact.

## 8. Governance Reconciliation

- `docs/scope.md` slice 22 remains the canonical BW-004 pointer (Booking
  Management and Fulfillment). Its spec pointer stays listed as future; this
  scope artifact does not create that spec.
- `docs/master-checklist.md` section 2.2 (Dashboard and Operating Workspace)
  is annotated as a separate outstanding surface, not BW-004. That annotation
  is authorized by this approved artifact and is not a checklist state change.
- This artifact created no architecture, UX, or test-first specification. The
  four-document package now exists as separate documents, each at CONDITIONAL
  APPROVAL. None of them was created or approved by this artifact.
- No feature branch is created by this change.
- Next gate after approval: the four-document BW-004 specification package
  (product spec, architecture contract, UX specification, test-first
  implementation plan), each approved before any feature branch.

### Implementation Gates (Resolved 2026-10-03)

All three gates were closed by Product Owner decision on 2026-10-03. They are
recorded here as resolved so the scope source is no less precise than the
package it points at. Closing a gate did not widen BW-004's boundary. Each one
closed as a restriction that stands.

1. **Scope-adjustment customer approval: Resolved.** BW-004 may originate and
   submit the BrainWorker's scope-adjustment request. It cannot approve,
   reject, or expire that request, and it cannot expose an authority-less
   `APPROVED` state, flag, or message. Customer approval remains a separate
   customer-side capability that BW-004 does not create.
2. **WEB-017 / `CONFIRMED` contradiction: Resolved by governance, not locally
   patched.** `CONFIRMED` remains independent of payment and escrow state. The
   contradiction in WEB-017 is identified for governed correction. BW-004 does
   not edit WEB-017 and does not reconcile the two specs locally.
3. **Settlement of an approved adjustment: Resolved as out of scope.** BW-004
   cannot mutate pricing, customer authorization, payment authorization,
   escrow, ledger, refunds, or additional-payment state, and cannot
   manufacture a settlement outcome.

The standing implementation boundary:

> BW-004 can request a scope adjustment, but it cannot create customer
> authority, approve, reject, or expire the adjustment, mutate payment or
> escrow, or manufacture a settlement outcome.

And:

> `CONFIRMED` is a booking/job state, not shorthand for "escrow funded."

Each gate was resolved by a named owner decision. A document restating a gate
does not resolve it.

## Verification

- Scope artifact exists at this path with status Approved; the three
  implementation gates in section 8 are recorded as resolved by Product Owner
  decision, with their boundaries intact.
- The four package documents carry the same resolved-gate status, so the scope
  source and the package agree.
- No production code, test, route, or contract added or modified.
- `docs/scope.md` and `docs/master-checklist.md` annotations only; no
  implementation effect.
