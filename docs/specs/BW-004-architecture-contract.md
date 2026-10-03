# BW-004 Architecture Contract

**Document ID:** BW-004-ARCH
**Version:** 0.2 (Revision A)
**Status:** APPROVED as the implementation baseline. Product, architecture, and implementation gates closed by Product Owner decision on 2026-10-03. Implementation is authorized only on `feature/bw-004-booking-management`.
**Package:** 2 of 4
**Depends on:** `BW-004-booking-management.md` (BW-004-PROD), decisions D1 to D10

## 1. Objective

Keep BW-004 transport-agnostic and replaceable, the same way BW-003 is. UI
depends on an `IBrainWorkerBookingsRepository` contract. Business rules stay
out of presentation components. Phase 1 may use deterministic in-memory or
localStorage data behind the contract. No backend is activated.

## 2. Provider Gate

`authenticated && role === 'brainworker' && isBrainWorkerApproved && operationalProfile.isComplete`

Plus booking ownership: `booking.taskerProfileId === authenticated BrainWorker ID`.
The repository enforces both independently. Route guards are not the sole
security boundary. A booking owned by another provider returns `null` or a
not-found result, never a distinguishable forbidden result.

## 3. Shared Types Ownership

- `JobStatus`, `JOB_STATUS_TRANSITIONS`, `canTransition`, `InvalidTransitionError`
  stay in `packages/api-types/src/jobs.ts`. BW-004 imports them and does not
  redefine or extend them.
- BW-004 specific types live under `apps/web/lib/brainworker/bookings/`. They
  are promoted to a shared package only when a second consumer exists, for
  example the customer-side scope approval slice. Before implementation,
  inspect existing type ownership and do not duplicate.

## 4. Three Independent Authorities

Booking lifecycle, dispatch and arrival, and financial readiness are three
separate dimensions with three separate authorities. BW-004 collapses none of
them and derives no value across them.

| Dimension | Authority | Owner of that authority |
| --- | --- | --- |
| Booking lifecycle | `JobStatus` and `canTransition()` in `packages/api-types/src/jobs.ts` | `packages/api-types` |
| Dispatch and arrival | Booking-scoped `DispatchStatus` record | BW-004 |
| Financial readiness | `PaymentContext` in `apps/web/lib/payment/types.ts` | WEB-015 payment domain |

Financial readiness is itself four separate fields, not one state. They are
carried together on `PaymentContext` and remain independently readable:

| Financial field | Type | Meaning |
| --- | --- | --- |
| `jobStatus` | `JobStatus` | Lifecycle position. Not a financial fact. |
| `bookingStatus` | `string` | Booking-side record state. |
| `paymentAuthStatus` | `PaymentAuthorizationStatus` | Whether payment authorization succeeded. |
| `escrowStatus` | `EscrowStatus` | Whether funds are held, released, disputed, or refunded. |

A booking may be `CONFIRMED` with `paymentAuthStatus` not yet `verified` and
`escrowStatus === 'unfunded'`. That is a valid state, not a defect to be papered
over. BW-004 reads `escrowStatus` for the check-in prerequisite and reads none
of the other three as a substitute for it.

Enforced rules:

- `CONFIRMED` does not imply escrow funding. `CONFIRMED` means the booking
  relationship is authoritatively established. WEB-015 permits a confirmed but
  unfunded booking, and that is the semantics BW-004 implements.
- `IN_PROGRESS` does not imply escrow funding. A successful check-in is not
  evidence that funds are held.
- Arrival implies nothing about escrow, and escrow implies nothing about arrival.
- No composite status is permitted. `READY_FOR_CHECK_IN`, or any equivalent, must
  not be added to `JobStatus`, must not be added as a field on the booking record,
  and must not become a source of truth. Preconditions surface only through
  `allowedActions`, derived by the authority at read time.
- WEB-017 describes `CONFIRMED` as escrow funded, which contradicts WEB-015. That
  is registered as a governed cross-spec correction (BW-004-PROD section 6).
  BW-004 does not adopt the WEB-017 wording and does not edit WEB-017. BW-004
  does not reconcile the two specifications locally, and invents no rule of its
  own to bridge them. The inconsistency is identified for correction, not
  absorbed into this contract.
- `EscrowStatusType` in `packages/ui/src/components/EscrowShield.tsx` is a legacy
  presentation enum with different casing and values. It is not an authority and
  must not be imported here. No third escrow vocabulary may be created.

## 5. Core Contracts

```ts
type DispatchStatus = 'NOT_STARTED' | 'EN_ROUTE' | 'ARRIVED';

type ScopeAdjustmentStatus =
  | 'PENDING' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN' | 'EXPIRED';

type ScopeAdjustmentReason = 'ADDITIONAL_PARTS' | 'ADDITIONAL_LABOR' | 'BOTH';

type ProviderCancellationReason =
  | 'SCHEDULE_CONFLICT' | 'UNABLE_TO_REACH_SITE'
  | 'SCOPE_MISMATCH' | 'CUSTOMER_UNRESPONSIVE' | 'OTHER';

interface EscrowStatus {
  // imported from `apps/web/lib/payment/types.ts`, never redefined here
}

interface LocationSnapshot {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
}

interface ProviderBookingSummary {
  bookingId: string;
  referenceCode: string;
  jobStatus: JobStatus;
  dispatchStatus: DispatchStatus;
  title: string;
  serviceId: string;
  scheduledStartAt: string;
  generalLocation: { cityId: string; neighbourhoodOrZone: string };
  escrowStatus: EscrowStatus;      // authoritative, imported from the payment domain
  hasPendingScopeAdjustment: boolean;
  unreadMessageCount: number;
}

interface ProviderBookingDetail extends ProviderBookingSummary {
  description: string;
  landmark?: string;
  exactAddress?: string;          // present only when D8 unlock rules pass
  dispatchUpdatedAt?: string;
  actualStartAt?: string;
  scopeAdjustments: ScopeAdjustment[];
  allowedActions: ProviderBookingAction[];  // computed by the authority
  conversationId?: string;
}

type ProviderBookingAction =
  | 'MARK_EN_ROUTE' | 'MARK_ARRIVED' | 'CHECK_IN'
  | 'REQUEST_SCOPE_ADJUSTMENT' | 'WITHDRAW_SCOPE_ADJUSTMENT'
  | 'CANCEL_BOOKING' | 'OPEN_CONVERSATION';

interface ScopeAdjustmentDraft {
  reason: ScopeAdjustmentReason;
  additionalLaborKobo: number;
  additionalMaterialsKobo: number;
  note?: string;
}

interface ScopeAdjustment extends ScopeAdjustmentDraft {
  id: string;
  bookingId: string;
  totalAdditionalKobo: number;   // derived by the authority
  status: ScopeAdjustmentStatus;
  submittedAt: string;           // authority generated
  decidedAt?: string;            // authority generated
}
```

The projection contains no customer phone, no customer email, and no billing
fields. `allowedActions` is computed by the authority from state, ownership,
escrow context, and dispatch status. The UI renders it and never recomputes it.

## 6. Repository Contract

```ts
interface IBrainWorkerBookingsRepository {
  getBookings(brainWorkerId: string, options?: { cursor?: string; limit?: number }): Promise<BookingPage>;
  getBooking(brainWorkerId: string, bookingId: string): Promise<ProviderBookingDetail | null>;
  updateDispatchStatus(brainWorkerId: string, bookingId: string, next: 'EN_ROUTE' | 'ARRIVED', snapshot?: LocationSnapshot): Promise<BookingMutationResult>;
  checkIn(brainWorkerId: string, bookingId: string, snapshot: LocationSnapshot): Promise<BookingMutationResult>;
  requestScopeAdjustment(brainWorkerId: string, bookingId: string, draft: ScopeAdjustmentDraft): Promise<ScopeAdjustment>;
  withdrawScopeAdjustment(brainWorkerId: string, bookingId: string, adjustmentId: string): Promise<ScopeAdjustment>;
  cancelBooking(brainWorkerId: string, bookingId: string, reason: ProviderCancellationReason): Promise<BookingMutationResult>;
  subscribe?(brainWorkerId: string, listener: (event: BookingFeedEvent) => void): () => void;
}
```

Exact result and event types are finalized in the RED phase without changing
the invariants here. `BookingMutationResult` carries the authoritative
resulting `jobStatus`, `dispatchStatus`, and timestamps, or a typed refusal.

`ESCROW_NOT_HELD` is produced from `EscrowStatus`, never from a lifecycle value.
There is no `escrowHeld` boolean in the projection, so the client cannot infer,
cache, or invent financial readiness.

### Typed refusals

**Gate 1.** The contract contains no method that approves, rejects, or expires a
scope adjustment, and no `APPROVED` result can originate here. Any such state
arrives only from a customer authority that does not exist yet.

`UNAUTHENTICATED`, `NOT_APPROVED`, `PROFILE_INCOMPLETE`, `NOT_FOUND`,
`INVALID_TRANSITION`, `OFFLINE`, `ESCROW_NOT_HELD`, `LOCATION_UNAVAILABLE`,
`LOCATION_OUT_OF_RANGE`, `LOCATION_ACCURACY_TOO_LOW`,
`SCOPE_ADJUSTMENT_ALREADY_PENDING`, `VALIDATION_FAILED`, `STALE_STATE`.

`NOT_FOUND` covers both missing and foreign bookings.

## 7. State Machine Boundary

- `checkIn` calls `canTransition(current,'IN_PROGRESS')`. `cancelBooking`
  calls `canTransition(current,'CANCELLED')` and additionally requires
  current to be `CONFIRMED`. Anything else throws or returns
  `INVALID_TRANSITION` and preserves prior state.
- No BW-004 method writes `PENDING_COMPLETION`, `COMPLETED`, `PAID`,
  `DISPUTED`, `RESOLVED`, or `EXPIRED`.
- Dispatch status is stored on the booking-scoped dispatch record. It is
  forward-only. Dispatch may only be authored while `jobStatus === 'CONFIRMED'`.
  Once check-in moves the booking to `IN_PROGRESS`, the dispatch record is frozen
  and preserved as history, never cleared and never rewritten. A frozen
  `ARRIVED` dispatch alongside `IN_PROGRESS` is the expected state after a
  successful check-in, not an invalid combination.
- `checkIn` additionally requires `escrowStatus` to report funds held. This is
  read from the payment authority and never inferred from `CONFIRMED` or
  `IN_PROGRESS`. A lifecycle transition must never stand in for a financial fact.
- No method in this contract writes escrow, payment, refund, or payout state, and
  none may be extended to do so. Check-in in particular changes the lifecycle
  only; it does not move money and does not record funding.
- Writes are compare-and-set on the observed state. A concurrent customer
  cancellation yields `STALE_STATE` plus the authoritative state.

## 8. Location Boundary

The client supplies a `LocationSnapshot`. The authority decides validity against
the job coordinates using a configured proximity threshold and a maximum
acceptable `accuracyMeters`. The threshold is never a client constant.

The threshold is a **product decision, not an architectural invariant**. 200
meters is the current proposal and is unapproved. What is architectural is only
that the authority owns the value, reads it from configuration, and may change it
without a BW-004 release. No module hardcodes a numeric radius, no UI copy states
one, and no test asserts a radius as a fixed platform fact.
Snapshots are used for the decision and stored only as evidence on the
dispatch or check-in record. They are not returned to the customer projection.
No background or continuous tracking, no `watchPosition` retention.

## 9. Payment and Escrow Boundary

BW-004 reads `EscrowStatus` through the existing WEB-015 payment repository
contract. It does not import payment internals, and it never calls a payment,
escrow, refund, or payout method.

- Funding is a financial fact read from the payment authority. It is never
  derived from `CONFIRMED`, from `IN_PROGRESS`, or from dispatch status.
- A scope adjustment is an additive record. It does not alter the BW-003 quote,
  the booking amounts, escrow, or `JobStatus`. Settlement of an approved
  adjustment is a later decision and is not modelled here.
- **Gate 3.** No method here revises pricing, records customer authorization,
  changes payment authorization, adjusts escrow, mutates a ledger, or produces a
  refund or additional payment. Each of those is unowned. BW-004 must not
  manufacture any of them, and no repository method may be added that does.
- Booking confirmation, payment confirmation, and permission to begin physical
  work remain three distinct facts. Check-in enforces the second against the
  third and never conflates them.

## 10. Messaging and Notification Boundary

- Contact shortcut resolves a `conversationId` through the existing WEB-017
  messaging repository, scoped by `jobId`. BW-004 does not write to the
  message store and does not expose raw contact credentials.
- The pipeline is fixed: BW-004 domain mutation, then authoritative domain
  event, then WEB-018 notification projection. BW-004 never creates,
  updates, or writes a notification record directly.
- BW-004 emits domain events (`DISPATCH_UPDATED`, `CHECKED_IN`,
  `SCOPE_ADJUSTMENT_REQUESTED`, `SCOPE_ADJUSTMENT_WITHDRAWN`,
  `BOOKING_CANCELLED_BY_PROVIDER`). The WEB-018 notification authority consumes
  them and owns delivery, rendering, and copy. BW-004 owns no delivery channel.

## 11. Realtime Boundary

`subscribe` is optional and transport-agnostic, as in BW-003. The UI must not
treat a local refresh as an authoritative update, and must not render a mutation
as successful until the returned authoritative state confirms it.

## 12. Offline Boundary

Cached reads are tenant-scoped by BrainWorker ID and flagged possibly stale.
Every mutation fails closed with `OFFLINE`. No queue. No stored location
snapshot for later submission.

## 13. Route Security

Routes: `/brainworker/bookings` and `/brainworker/bookings/[bookingId]`
(names finalized here, subject to approval). Same sequence as BW-003:

1. retrieve authenticated session;
2. redirect unauthenticated user to login with return path;
3. fail closed for non-BrainWorker role;
4. redirect unapproved provider to verification status;
5. block incomplete operational profiles;
6. bind repository calls to the authenticated BrainWorker ID;
7. `bookingId` is parsed and validated, never trusted as ownership.

Routes are static or prerender safe, with data loaded client-side behind the
session guard, as `/brainworker/leads` does.

## 14. Physical Layout

- Production: `apps/web/lib/brainworker/bookings/`, mirroring the established
  `leads/` split: `types.ts`, `domain.ts` (projection, allowed actions, dispatch
  rules), `repository.ts`, and one module per subject (`checkin.ts`,
  `dispatch.ts`, `scopeadjustment.ts`, `cancellation.ts`), each with a
  co-located `*.test.ts`. Route: `apps/web/app/brainworker/bookings/page.tsx`
  and `booking/[bookingId]/page.tsx`.
- Testing helpers: `apps/web/lib/brainworker/bookings/testing/` with
  `fixtures.ts`, `harness.ts`, and `index.ts`, matching the leads subtree.
- Production modules contain zero imports from `testing/`. The production
  export surface contains no test helpers.
- Dashboard code is not modified except for one optional link to
  `/brainworker/bookings`, which needs its own approval note in the plan.

## 15. Validation Rules

- Kobo values are non-negative integers. Total is derived. A client total that
  conflicts is rejected.
- At least one of labor or materials is above zero.
- Note length at most 500 characters, trimmed, control characters rejected.
- Latitude and longitude within valid ranges. `accuracyMeters` is finite and
  positive.
- Reasons validate against the closed taxonomies above. Free text is not a
  taxonomy.

## 16. Architectural Invariants

- One authoritative provider identity.
- One authoritative JobStatus machine. No competing status value, and no composite
  status such as `READY_FOR_CHECK_IN`.
- Three independent authorities for lifecycle, dispatch, and financial readiness.
  No value is derived across them.
- Escrow is read-only to BW-004, and never inferred from a lifecycle value.
- Scope adjustment has no approval, rejection, pricing, settlement, or quote
  mutation path in this module.
- Client never authors timestamps, totals, allowed actions, or location validity.
- No customer phone or email in any BW-004 projection.
- No payment, escrow, or payout mutation.
- No matching-engine change.
- No testing imports in production.
- No backend activation implied.
