# BW-004 BrainWorker Booking Management and Fulfillment: Product Specification

**Document ID:** BW-004-PROD
**Version:** 0.2 (Revision A)
**Status:** APPROVED as the implementation baseline. Product, architecture, and implementation gates closed by Product Owner decision on 2026-10-03. Implementation is authorized only on `feature/bw-004-booking-management`.
**Package:** 1 of 4 (Product Specification, Architecture Contract, UX Design Specification, Test-First Implementation Plan)
**Scope source:** `docs/specs/BW-004-scope-and-product-decision.md` (Approved)
**Primary User:** Approved BrainWorker

> **Revision A change record.** The review gate returned REVIEWED, NOT YET
> APPROVED with seven locks. Incorporated here: `CONFIRMED` is independent of
> escrow funding (D8, D9); check-in requires the authoritative financial
> prerequisite, fails closed, and never changes escrow itself (D2); the WEB-017
> `CONFIRMED` wording conflict is registered as a governed cross-spec correction
> (section 6); a scope adjustment may be submitted but never approved, rejected,
> priced, or settled by BW-004 (D5); the customer approval surface is an explicit
> dependency, not an implied capability (D5, section 6); the 200 meter proximity
> rule is labelled a product decision rather than a platform invariant (D2); and
> address unlock is tied to booking resolution, privacy policy, and escrow policy
> (D8). The three authorities are separated in section 3.

> This document resolves the ten open product decisions from the approved scope
> artifact. It authorizes no implementation and no feature branch. Every decision
> below is derived from the existing authoritative contracts (`JOB_STATUS_TRANSITIONS`
> and `canTransition` in `packages/api-types/src/jobs.ts`, WEB-013, WEB-015, WEB-017,
> BW-003) and not from the shape of any current screen. Decisions that go beyond
> what those contracts already fix are marked **[OWNER]** and need explicit product
> owner confirmation at approval.

## 1. Purpose

Give an approved BrainWorker one controlled workspace to run a confirmed booking:
see it, reach the customer through the platform, signal departure and arrival,
check in on site, and ask for a scope adjustment when the work turns out to be
different from what was quoted.

## 2. Provider Eligibility

Same gate as BW-003: authenticated session, `role === 'brainworker'`,
`isBrainWorkerApproved === true`, `operationalProfile.isComplete === true`.
In addition, every booking read and mutation requires that the booking is
assigned to the authenticated provider (`taskerProfileId` match). A booking
assigned to another provider is indistinguishable from a missing booking.

## 3. Authority Boundaries: Three Independent Dimensions

Booking confirmation, payment confirmation, and permission to begin physical
work are three different things with three different authorities. BW-004 treats
them as independent and never collapses them.

| Dimension | Authority | BW-004 authority |
| --- | --- | --- |
| Booking lifecycle | `JobStatus` and `canTransition()` in `packages/api-types/src/jobs.ts` | None. Read only, mutate only through the existing guard. |
| Dispatch and arrival | Booking-scoped `DispatchStatus` record (D3) | Provider-authored, forward-only |
| Financial readiness | `PaymentContext` in `apps/web/lib/payment/types.ts` (WEB-015), four separate fields: `jobStatus`, `bookingStatus`, `paymentAuthStatus`, `escrowStatus` | None. Read only, never mutated. |

Binding consequences:

- `CONFIRMED` does not imply escrow funding. `CONFIRMED` means the booking
  relationship has been authoritatively established. Funding is expressed only
  by the escrow authority, in `EscrowStatus`.
- A booking may be `CONFIRMED` while `paymentAuthStatus` is not yet `verified`
  and `escrowStatus` is `unfunded`. That is a valid state, not a defect to paper
  over. BW-004 reads `escrowStatus` for the check-in prerequisite and reads none
  of the other three `PaymentContext` fields as a substitute for it.
- `IN_PROGRESS` does not imply escrow funding either. Reaching `IN_PROGRESS`
  proves that a check-in passed. It is not evidence that funds are held, and it
  must not be read as such by any downstream surface.
- Arrival does not imply funding, and funding does not imply arrival. The two
  axes are separate records with no derived value on either side.
- BW-004 must not create a composite or derived status such as
  `READY_FOR_CHECK_IN` inside `JobStatus`, nor add such a field to the booking
  record as a new source of truth. When a precondition affects what the provider
  may do, the authority derives it at read time and expresses it through
  `allowedActions`. The UI never computes it.
- `EscrowStatusType` in `packages/ui/src/components/EscrowShield.tsx` is a
  legacy presentation enum with different casing and different values. It is not
  an authority. BW-004 must not read it, must not adopt it, and must not create a
  third escrow vocabulary.

## 4. Resolved Decisions

### D1. Booking state ownership

- BW-004 reads every `JobStatus` value and never adds, renames, or aliases one.
  `DECLINED`, `SCHEDULED`, `ARRIVED`, `EN_ROUTE`, and similar are not JobStatus.
- BW-004 may initiate exactly two JobStatus transitions, both through
  `canTransition`:
  1. `CONFIRMED -> IN_PROGRESS`, produced only by a valid check-in (D2).
  2. `CONFIRMED -> CANCELLED`, produced only by provider cancellation (D6).
- `IN_PROGRESS -> PENDING_COMPLETION` is completion submission. It is a later
  slice. BW-004 does not initiate it, and arrival tracking never produces it.
- All other transitions (`PAID`, `DISPUTED`, `RESOLVED`, `EXPIRED`, and the
  customer confirmation of completion) are not initiated by BW-004.
- Departure and arrival are not JobStatus. They are a separate booking-scoped
  dispatch record (D3).

### D2. Check-in semantics

- Preconditions, all three required and all three checked by the authority: the
  booking is `CONFIRMED` and assigned to the provider; the device is online; and
  the escrow authority reports funds held. `CONFIRMED` alone is never sufficient,
  because `CONFIRMED` does not imply funding (section 3, D9).
- The financial prerequisite is read from `EscrowStatus` (WEB-015). Check-in never
  writes escrow, never infers escrow, and never treats a lifecycle value as a
  financial signal. An unfunded booking fails closed with `ESCROW_NOT_HELD`.
- Evidence: one location snapshot taken at the moment of the check-in action.
  No continuous tracking (consistent with WEB-017). No photo is required.
- Validity: the authority compares the snapshot with the job coordinates
  (`latitude`, `longitude`). The client never decides validity.
- The proximity threshold is a **product decision**, not a platform invariant and
  not an architectural constant. The proposal is 200 meters **[OWNER]**. What is
  architectural is only this: the authority owns the threshold, it is configured
  rather than hardcoded in the client, and it may change without a BW-004 release.
  The numeric value must not leak into UI copy or test expectations as though the
  platform had fixed it.
- Result on valid check-in: `canTransition('CONFIRMED','IN_PROGRESS')`, with
  `actualStartAt` and the status history entry written by the authority. The
  client never manufactures either timestamp.
- If location permission is denied, location is unavailable, or the snapshot is
  outside the threshold: check-in is refused with a specific reason. There is
  no manual override in v1. The provider is pointed to the booking conversation.

### D3. Arrival evidence and tracking

- A booking-scoped `DispatchStatus` exists, separate from JobStatus:
  `NOT_STARTED`, `EN_ROUTE`, `ARRIVED`.
- `EN_ROUTE` and `ARRIVED` may be set only while the booking is `CONFIRMED`,
  moving forward only (`NOT_STARTED -> EN_ROUTE -> ARRIVED`, and
  `NOT_STARTED -> ARRIVED` is permitted). No going back in v1.
- Each update stores an authoritative timestamp. `ARRIVED` may carry one
  optional location snapshot. It is evidence, not a gate: check-in does not
  require `ARRIVED`.
- Dispatch is authored only while the booking is `CONFIRMED`. Once check-in moves
  it to `IN_PROGRESS`, the dispatch record freezes and stays visible as history.
  It is never cleared and never rewritten.
- Customer-visible tracking is limited to the dispatch label and its
  authoritative time. No coordinates, no map, no live position, and no ETA
  computed by the client.

### D4. Customer notification behavior

- Channel: the existing WEB-018 notification center only. No SMS, email, push, or
  WhatsApp is introduced by BW-004. BW-004 emits domain events; the notification
  authority decides delivery.
- Notifying provider actions: `EN_ROUTE`, `ARRIVED`, valid check-in, scope
  adjustment request submitted, provider cancellation.
- Non-notifying: failed or refused attempts, viewing, and any read.
- Copy is factual, names the BrainWorker, and claims nothing the authority did
  not record. Final copy lives in the UX specification. It must not imply
  payment, completion, or live tracking.

### D5. Scope-change lifecycle and approval

- A scope adjustment request is allowed only while the booking is `IN_PROGRESS`
  (after check-in, because the trigger is on-site discovery).
- Request shape: `bookingId`, reason category (`ADDITIONAL_PARTS`,
  `ADDITIONAL_LABOR`, `BOTH`), itemized additional amounts in integer kobo
  (`additionalLaborKobo`, `additionalMaterialsKobo`, at least one above zero),
  optional bounded note (500 characters). The total is derived and not
  client-editable, same rule as BW-003 quotes.
- Lifecycle states in the record vocabulary: `PENDING`, `APPROVED`, `REJECTED`,
  `WITHDRAWN`, `EXPIRED`. One `PENDING` request per booking at a time. The
  provider may withdraw a `PENDING` request.
- What BW-004 may author: `PENDING` and `WITHDRAWN`, and nothing else. BW-004
  implements no transition into `APPROVED`, `REJECTED`, or `EXPIRED`, and exposes
  no customer decision endpoint, no auto-approval, no timeout approval, and no
  simulated decision. Those states are read-only projections of a decision
  authority that does not exist yet.
- BW-004 therefore must not claim that a request has been approved, rejected,
  priced into the booking, or financially settled. There is no complete
  scope-change transaction in BW-004, and no screen may imply one.
- Customer approval is mandatory and belongs to the customer surface. No work
  scope change takes effect on provider say-so.
- Effect: the request never changes JobStatus. The original quote is not
  mutated. An approved request is a separate additive record. How an approved
  amount reaches escrow or payment is not decided here; it is a dependency on a
  later payments decision (see section 6).
- Rejection: the booking continues under the original scope. The provider sees
  the outcome and may submit a new request only after a rejection or
  withdrawal.
- Explicit dependency, not an implied capability: no customer-side approve or
  reject surface exists today. WEB-013 provides none, while the roadmap and
  WEB-018 both anticipate one. BW-004 is provider-side only. That surface must be
  delivered as a separately governed customer-side slice, or as an explicitly
  approved extension to an existing customer slice, before BW-004 may ship the
  request action to users **[OWNER]**.
- **Gate 1.** BW-004 can originate and submit the BrainWorker's scope-adjustment
  request, but it cannot represent customer approval until an authoritative
  customer-side approval capability exists. No implementation may create a
  provider-side `APPROVED` state, flag, or message that has no corresponding
  customer authority. `APPROVED` in the record vocabulary is reserved for a
  decision BW-004 does not own, does not write, and cannot display as an
  outcome until that authority ships.

### D6. Cancellation interaction

- The provider may cancel only from `CONFIRMED`, the single state where
  `canTransition(status,'CANCELLED')` is true and no work has started.
- Once `IN_PROGRESS`, the provider cannot cancel. The routes out are scope
  adjustment, completion (later slice), or dispute (later slice).
- Cancellation requires a reason from a bounded taxonomy (proposed:
  `SCHEDULE_CONFLICT`, `UNABLE_TO_REACH_SITE`, `SCOPE_MISMATCH`,
  `CUSTOMER_UNRESPONSIVE`, `OTHER`) **[OWNER]**, a confirmation step, and
  connectivity. The authority records `cancelledBy` and `cancellationReason`.
- Race with customer cancellation: the authority decides. If the booking is
  already `CANCELLED`, the provider sees the authoritative state and no error
  claiming success.
- Refund, penalty, and reputation consequences of provider cancellation are
  not defined here and the UI must not promise any.

### D7. Offline behavior

- Readable offline: cached booking list and detail for the authenticated
  provider, marked possibly stale, tenant-scoped by BrainWorker ID.
- Disabled offline: dispatch updates, check-in, scope adjustment request,
  withdraw, cancellation, and opening a new conversation write.
- No offline queue. No optimistic success. Same stance as BW-003. A location
  snapshot is never stored for later submission.

### D8. Location and privacy boundaries

- Before `CONFIRMED`: BW-003 projection only (general city and zone, landmark).
- `CONFIRMED` and later, assigned provider only: the exact address unlocks once
  the payment context reports escrow held. If the booking is confirmed but
  unfunded, the provider sees the general area and an honest funding-pending
  message **[OWNER]**.
- Locked resolution: `CONFIRMED` remains independent of escrow funding. WEB-015 is
  correct that `CONFIRMED` can be unfunded. WEB-017's description of `CONFIRMED`
  as escrow funded is the outlier and is registered as a governed cross-spec
  correction (section 6). BW-004 implements the WEB-015 semantics and must not
  adopt the WEB-017 wording.
- Customer phone and email are never exposed to the provider by BW-004. The
  contact shortcut is the in-platform conversation (WEB-017), which exists for
  `CONFIRMED`, `IN_PROGRESS`, and `DISPUTED`. No call or WhatsApp link.
- After `COMPLETED`, `PAID`, `CANCELLED`, `EXPIRED`, or `RESOLVED`: the exact
  address is masked back to the general area. The conversation becomes
  read-only per WEB-017 rules. `DISPUTED` keeps the address readable because
  evidence may be needed **[OWNER]**.
- Address unlock is governed by three separate inputs, all required. Booking
  resolution: the exact address belongs to one specific booking assigned to this
  provider, never to the list, the customer profile, or a search result. Privacy
  policy: the platform may show a service address to the assigned provider for the
  engagement, and the customer consented through booking. Escrow policy: the
  exact address unlocks only once the escrow authority reports funds held, so a
  funded commitment exists before the provider travels. Losing any one of the
  three returns the view to the general area. This is the resolved booking,
  privacy, and escrow policy, enforced by the authority and never in the client.
- The provider's own location snapshots are used only for check-in and
  arrival validation and are not shown to the customer.

### D9. Interaction with booking, payment, and escrow states

- BW-004 reads `JobStatus` and `EscrowStatus` (WEB-015) as two independent inputs
  and mutates neither. Booking confirmation, payment confirmation, and permission
  to begin physical work are never treated as the same fact (section 3).
- Behavior by lifecycle state, with the financial prerequisite stated separately
  rather than folded into the lifecycle value:
  - `CONFIRMED`: dispatch updates, cancel, contact. Check-in is offered and is
    refused unless the escrow authority separately reports funds held.
  - `IN_PROGRESS`: scope adjustment request, contact. Read-only otherwise.
  - `PENDING_COMPLETION`, `COMPLETED`, `PAID`, `RESOLVED`: read-only, contact
    where WEB-017 allows.
  - `DISPUTED`: read-only view with a disputed notice, contact where allowed.
  - `CANCELLED`, `EXPIRED`: read-only history.
- Financial prerequisite, stated independently: the only financial value that
  affects BW-004 is whether the escrow authority reports funds held. It gates
  check-in and the exact address unlock, and nothing else. It is never inferred
  from `CONFIRMED` or `IN_PROGRESS`, and it is never written.
- BW-004 shows no earnings, payout, or wallet figure. That is BW-005.

### D10. Route and entry ownership

- BW-004 owns a bookings list and a booking detail route under
  `/brainworker/bookings` and `/brainworker/bookings/[bookingId]`. Exact
  path names are confirmed in the architecture contract. Actions are in-page
  controls, not separate routes.
- The Dashboard and Operating Workspace stays separate. It may link to
  `/brainworker/bookings`, and nothing else. It does not render check-in or
  dispatch controls and holds no booking authority.
- BW-004 does not edit `/brainworker/leads`. After an accepted invitation, a
  link to the booking is the only integration point.

## 5. Non-Goals

Completion submission, customer confirmation, escrow release, ratings,
disputes, payouts, wallet, matching changes, mobile native behavior,
real-time continuous GPS, schedule negotiation, a customer-side scope approval
surface (including any customer approve or reject endpoint, auto-approval, or
timeout approval), deriving escrow state from lifecycle state, backend or database
activation, and any new JobStatus value.

## 6. Dependencies Surfaced During Specification

1. Customer-side approval of scope adjustments (D5). No surface exists. Must be a
   separately governed customer slice, or an explicitly approved extension to an
   existing one.
2. Payment treatment of an approved scope adjustment (D5). No owner; decided out
   of scope for BW-004 under Gate 3.
3. Governed correction to WEB-017, which describes `CONFIRMED` as escrow funded
   while WEB-015 permits an unfunded `CONFIRMED`. The resolution is locked in D8:
   `CONFIRMED` is independent of funding and WEB-015 governs. The WEB-017 text
   still needs correcting through its own governed process. BW-004 does not edit
   WEB-017 and does not wait for that edit.
   - **Gate 2.** BW-004 identifies this statement as requiring correction. It
     does not reconcile the two specifications locally and does not invent a new
     rule to paper over the inconsistency. The authoritative financial model
     stays four separate dimensions: `JobStatus`, `BookingStatus`,
     `PaymentAuthorizationStatus`, and `EscrowStatus`, as carried by
     `PaymentContext` in `apps/web/lib/payment/types.ts`. BW-004 reads them and
     derives nothing across them.
4. Proximity threshold value and location authority (D2). The authority is
   architectural; the numeric value is a product decision (200 meters proposed).
5. Provider cancellation consequences (D6).
6. Address exposure while `DISPUTED`, and any cancellation penalty (D6, D8).
7. Settlement of an approved scope adjustment (D5). No owner; decided out of
   scope for BW-004 under Gate 3.
   - **Gate 3.** Until the product establishes who owns revised pricing,
     customer authorization, payment authorization, escrow adjustment, ledger
     mutation, and refund or additional-payment behaviour, BW-004 must not
     manufacture any of those outcomes. A scope adjustment is representable as
     an operational request with no settled financial consequence.

Gates 1, 2, and 3 were resolved by Product Owner decision on 2026-10-03, each
closing as a standing restriction on BW-004 rather than an approval. The
remaining items above are flagged, not assumed.

## 7. Acceptance Criteria

- [ ] Each of the ten scope decisions is resolved here or explicitly deferred.
- [ ] No new JobStatus value; every transition goes through `canTransition`.
- [ ] BW-004 initiates only `CONFIRMED -> IN_PROGRESS` and `CONFIRMED -> CANCELLED`.
- [ ] Dispatch status is separate from JobStatus.
- [ ] Provider never sees customer phone or email.
- [ ] Exact address unlock follows D8.
- [ ] Scope adjustment never mutates quote, JobStatus, payment, or escrow.
- [ ] Offline is read-only with no queue.
- [ ] Client never authors timestamps, totals, or location validity.
- [ ] Dashboard remains a separate surface.
- [ ] [OWNER] items are confirmed or changed before approval.
- [ ] Lock 1: `CONFIRMED` is independent of escrow funding and no code path derives
      funding from a lifecycle value.
- [ ] Lock 2: check-in requires the authoritative escrow prerequisite, fails closed
      when unfunded, and never writes escrow.
- [ ] Lock 3: the WEB-017 conflict is registered as a governed correction and the
      WEB-017 wording is adopted nowhere in BW-004.
- [ ] Lock 4: BW-004 can submit a scope request but has no approval, rejection,
      pricing, settlement, or quote mutation path.
- [ ] Lock 5: the customer approval surface is an explicit dependency and the
      request control does not ship before it exists.
- [ ] Lock 6: the 200 meter rule is labelled a product decision, with no
      architecture invariant, UI copy, or test hardcoding it as a platform fact.
- [ ] Lock 7: address unlock is tied to booking resolution, privacy policy, and
      escrow policy.
- [ ] Gate 1: no provider-side `APPROVED` state, flag, or message exists without
      a corresponding customer authority; `APPROVED` is reserved for a decision
      BW-004 does not own, write, or display as an outcome.
- [ ] Gate 2: the WEB-017 conflict is identified for governed correction, not
      reconciled locally; the authoritative financial model stays `JobStatus` +
      `BookingStatus` + `PaymentAuthorizationStatus` + `EscrowStatus`, with
      nothing derived across them.
- [ ] Gate 3: no revised pricing, customer authorization, payment authorization,
      escrow adjustment, ledger mutation, or refund/additional-payment outcome
      is manufactured by BW-004.
- [ ] Gates 1, 2, and 3 are reflected in copy, controls, and layout, not only in
      the written decisions.
- [ ] No composite status such as `READY_FOR_CHECK_IN` exists in `JobStatus` or in
      any BW-004 record.
