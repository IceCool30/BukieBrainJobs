# WEB-013: Customer Booking Acceptance & Booking Lifecycle

**Document ID:** WEB-013  
**Version:** 1.0  
**Status:** Draft for Independent Product Review  
**Product Area:** Customer Platform  
**Primary User:** Authenticated Customer  
**Implementation Model:** Production-first architecture with deterministic mock data for the current frontend phase  
**Dependencies:** WEB-007, WEB-008, WEB-009, WEB-010, WEB-011, WEB-012, ARCH-002, Design System v1.0

## 1. Purpose

WEB-013 defines the customer experience after a customer expresses interest in or selects a BrainWorker and the request enters the acceptance and booking lifecycle.

The purpose is to make the boundary between customer preference, BrainWorker response, booking confirmation, scheduling, cancellation, expiration, and later execution explicit and truthful.

WEB-013 is a production marketplace capability. The current frontend phase may use deterministic mock lifecycle data and transitions, but the contract must model production concepts so later API/database integration does not require fundamental UX redesign.

A customer expression of interest is not a booking. A BrainWorker response is not payment. A confirmed booking is not dispatch or work completion.

## 2. Product Context

### Direct discovery

```text
Find a Service
  ↓
Service Discovery
  ↓
Service Detail
  ↓
BrainWorker Profile
  ↓
Booking Preparation
  ↓
Customer commitment
  ↓
Acceptance / Booking lifecycle
```

### Job-led matching

```text
Post a Job
  ↓
Customer Job Request
  ↓
Matching
  ↓
Ranked BrainWorker Matches
  ↓
Customer reviews candidates
  ↓
Customer expresses interest / selects
  ↓
WEB-013 Acceptance / Booking lifecycle
```

WEB-013 must converge these paths into a coherent production booking lifecycle.

## 3. Goals

1. Define the lifecycle after WEB-012 selection/interest.
2. Reconcile customer presentation with the authoritative production JobStatus state machine.
3. Separate interest, acceptance, confirmation, scheduling, cancellation, expiration, and later execution.
4. Preserve job context and durable customer reference codes.
5. Provide truthful next actions for each supported state.
6. Define technical failure, offline, stale, authentication, and invalid-context behavior.
7. Establish production-shaped contracts behind a replaceable mock adapter.
8. Preserve WEB-007, WEB-011, and WEB-012 continuity.
9. Prevent unsupported payment, dispatch, availability, assignment, or verification claims.
10. Support mobile, tablet, desktop, keyboard, and assistive technology use.

## 4. Non-Goals

WEB-013 does not authorize or implement:

- Live payment processing or Paystack transactions.
- Wallet, refunds, or disputes.
- Live dispatch or worker tracking.
- Real-time chat.
- New KYC or verification infrastructure.
- Admin operations.
- AI matching.
- Corporate marketplace operations.

These remain separate approved capabilities.

## 5. Authoritative Lifecycle

ARCH-002 establishes this production JobStatus model as authoritative:

```text
OPEN
PENDING_ACCEPTANCE
CONFIRMED
IN_PROGRESS
PENDING_COMPLETION
COMPLETED
PAID
CANCELLED
EXPIRED
DISPUTED
RESOLVED
```

The canonical transition boundary is:

```text
canTransition(from, to)
```

Customer-facing lifecycle labels are presentation mappings from authoritative domain state. Acceptance-response outcomes such as an explicit BrainWorker decline are scoped response records, not JobStatus values, and must never form a competing lifecycle state machine.

The UI must never directly mutate presentation-only statuses. Every lifecycle mutation must cross the canonical transition boundary.

## 6. Lifecycle Model

Conceptually:

```text
Customer Job Request
  ↓
OPEN
  ↓
Customer interest / selection
  ↓
PENDING_ACCEPTANCE
  ↓
BrainWorker response
  ├── explicit decline response
  ├── CONFIRMED
  └── EXPIRED / cancellation where supported
  ↓
Confirmed booking
  ↓
Schedule state
  ↓
IN_PROGRESS
  ↓
PENDING_COMPLETION
  ↓
COMPLETED
  ↓
PAID
```

Important constraints:

- `PENDING_ACCEPTANCE` means awaiting response, not confirmed.
- `CONFIRMED` is the authoritative booking-confirmed boundary.
- `CANCELLED` and `EXPIRED` are distinct.
- The current JobStatus model has no `DECLINED` value. Do not invent one.
- A BrainWorker decline may be represented by a separate acceptance response contract while the job reaches an approved lifecycle state.
- Later execution states must only be shown when the authoritative domain state exists.

## 7. Acceptance Boundary

After customer interest/selection creates a supported request, the customer sees:

**Awaiting BrainWorker response**

This means the request is pending an acceptance decision.

It must not imply:

- acceptance;
- booking confirmation;
- guaranteed availability;
- payment;
- dispatch.

If an explicit acceptance response records a decline, the customer may be told:

**The BrainWorker declined the request.**

Only the underlying acceptance response can justify that wording.

## 8. Booking Confirmation Boundary

Only the authoritative `CONFIRMED` state permits:

**Your booking is confirmed.**

Confirmation may display:

- job/reference code;
- BrainWorker public identity;
- relevant job/service context;
- confirmed schedule when authoritative;
- confirmed pricing when authoritative;
- next supported action.

Confirmation does not imply payment, dispatch, arrival, work start, or completion.

## 9. Expiration

`EXPIRED` is distinct from cancellation and explicit decline.

Customer wording should communicate that the request expired or received no response only when the underlying contract supports that interpretation.

Do not fabricate:

- countdown timers;
- response deadlines;
- response-time promises;
- expiry timestamps.

An expired request is not a technical failure.

## 10. Scheduling

The product must distinguish:

1. Customer requested schedule.
2. Proposed schedule, if negotiation is supported.
3. Confirmed schedule.
4. Schedule changed/unavailable, if supported.

Schedule fields alone do not prove that an appointment is confirmed.

Do not fabricate availability or exact appointment times in mock fixtures.

If the current contract does not support schedule negotiation, WEB-013 must not invent a proposal/acceptance workflow.

## 11. Pricing and Payment

Preserve the ARCH-002 distinction between:

- customer budget;
- BrainWorker rate;
- marketplace pricing;
- estimated total;
- actual total;
- payment authorization;
- payment completion.

A budget is not a worker rate. A rate is not evidence of payment. Booking confirmation is not payment confirmation.

No live payment transaction is introduced solely for WEB-013.

Do not claim escrow, payment protection, funds secured, refund availability, or payout activity without the relevant approved production capability.

## 12. Cancellation

Cancellation is a domain mutation, not a presentation-only status.

Offer cancellation only when the authoritative lifecycle permits customer cancellation.

Before mutation:

- identify the affected job/booking;
- explain what will be cancelled;
- communicate supported consequences;
- confirm destructive action where appropriate.

On success, render authoritative `CANCELLED`.

On failure, retain the previous authoritative state and provide retry. Never show a successful cancelled state before the mutation succeeds.

Do not imply refunds or financial outcomes without an approved payment contract.

## 13. Interest Withdrawal

Where the lifecycle permits it, the customer may withdraw interest established by WEB-012.

The mutation must verify:

```text
authenticated customer
  +
customer owns job
  +
BrainWorker belongs to that job's selection context
  +
current lifecycle permits withdrawal
```

Withdrawal of interest is not cancellation of a confirmed booking.

## 14. WEB-011 Continuity

WEB-011 remains the canonical authenticated customer activity surface at:

```text
/jobs
```

WEB-013 must update/read lifecycle information through the existing customer activity repository/domain boundary.

The activity item must derive customer-facing status from authoritative lifecycle state.

WEB-013 must not create a second booking-management product.

## 15. WEB-012 Continuity

WEB-013 begins from the WEB-012 selection/interest boundary.

Preserve:

- job reference code;
- job title/description where appropriate;
- service/category;
- location;
- requested schedule;
- budget context where supplied;
- selected BrainWorker;
- current lifecycle state.

The customer must not recreate the request simply because it advanced from matching into acceptance.

## 16. WEB-007 Continuity

WEB-007 remains booking preparation and intake for direct discovery.

WEB-013 does not duplicate its preparation form.

The two journeys converge coherently:

```text
Direct discovery → Booking preparation → Commitment → WEB-013
Job posting → Matching → Interest → WEB-013
```

The convergence point must use compatible production domain concepts.

## 17. Authentication and Authorization

WEB-013 uses WEB-008 authentication/session behavior.

Private lifecycle reads and mutations require authenticated customer ownership.

Authorization must exist at the repository/domain action boundary, not only in UI controls.

Protected operations include:

- reading private lifecycle state;
- reading acceptance response;
- expressing/withdrawing interest where supported;
- cancellation;
- schedule confirmation where supported;
- later booking mutations.

Route/query parameters are untrusted and never act as authorization.

Cross-customer reads and mutations must be denied even if a client directly invokes the repository/action.

## 18. Production-Shaped Domain Contracts

Separate these concepts:

```text
CustomerJobRequest
  ↓
CustomerSelection / Interest
  ↓
AcceptanceResponse
  ↓
BookingRequest
  ↓
BookingConfirmation
  ↓
ScheduleProposal / ScheduleConfirmation
  ↓
Cancellation / Expiration
  ↓
Authoritative JobStatus
```

### Booking request

Where supported, carry durable job ID, customer ID, selected BrainWorker ID, request reference, requested schedule, customer budget context, and authoritative lifecycle metadata.

Do not require customer-provided worker pricing.

### Acceptance response

Distinguish pending, accepted, declined, and expired/no-response where supported. Include response timestamps/reasons only when authoritative and customer-safe.

### Booking confirmation

Expose confirmation only when the authoritative lifecycle reaches `CONFIRMED`.

### Schedule

Distinguish requested, proposed, and confirmed schedule states where the production contract supports them.

Durable technical IDs and customer-facing `REQ-XXXXX` reference codes remain distinct.

## 19. Customer-Visible States

Support these states where the underlying domain can represent them:

| State | Customer meaning | Typical action |
|---|---|---|
| Awaiting response | BrainWorker has not responded | Wait, cancel/withdraw if permitted |
| Accepted / confirmed | Acceptance succeeded and the authoritative booking state is `CONFIRMED` | View confirmed details |
| Declined | Explicit acceptance response declined | Review alternatives / return to Jobs |
| Expired | Request expired/no response | Return, retry/recreate where supported |
| Schedule proposed/changed | A supported schedule proposal/change exists | Review supported action |
| Scheduled | Schedule is authoritatively confirmed | View schedule |
| Cancellation pending | Approved cancellation workflow is pending | Prevent duplicate mutation |
| Cancelled | Job reached `CANCELLED` | View history/recovery |
| Technical failure | Requested operation failed | Retry |
| Offline/degraded | Current remote state cannot be verified | Retry |
| Session failure | Authentication/session is unavailable | Re-authenticate |
| Invalid context | Job/booking cannot be safely resolved | Return to Jobs |
| Loading/pending | Read or mutation is active | Wait |

A presentation label must never imply a downstream event that has not occurred.

## 20. Failure Semantics

Keep these distinct:

```text
Declined
  = explicit acceptance response declined

Expired
  = authoritative expiration/no-response outcome

Cancelled
  = canonical cancellation outcome

Technical failure
  = operation could not complete

Offline/degraded
  = current remote state cannot be verified
```

A failed mutation retains the last known valid state.

Pending mutation behavior:

- disable duplicate submission;
- retain valid context;
- communicate pending;
- do not fabricate final state;
- resolve into authoritative success, business rejection, or technical failure.

## 21. Offline and Stale State

When current remote state cannot be verified:

- preserve last known state only when clearly identified as potentially stale;
- do not claim current confirmation without authoritative confirmation;
- provide retry;
- preserve customer context.

Offline/local state must never masquerade as a successful production mutation.

## 22. Mock-First Boundary

Use a deterministic mock lifecycle adapter behind a stable repository/domain interface.

```text
Customer UI
  ↓
Customer Booking/Lifecycle Repository
  ↓
Mock Lifecycle Adapter
```

Later:

```text
Customer UI
  ↓
Customer Booking/Lifecycle Repository
  ↓
API
  ↓
Domain Services
  ↓
PostgreSQL / Prisma
```

Mock data must not trigger real SMS, push, email, payment, dispatch, or worker-device side effects.

## 23. Mock Data Truthfulness

Do not fabricate unsupported operational claims, including:

- BrainWorker availability;
- exact appointment times;
- payment completion;
- escrow activity;
- dispatch/arrival;
- verification claims;
- private contact information;
- hidden risk/ranking information;
- refund outcomes.

Static fixture timestamps are acceptable only as deterministic test data and must not be presented as live operational freshness.

## 24. Routing

The canonical customer lifecycle surface remains `/jobs`.

A detail route may use the customer-facing reference code, subject to existing repository routing.

Sensitive information must not be placed in URLs.

Query parameters must be validated and must never provide authorization.

## 25. Trust and Content Rules

Use state-specific wording:

- "Waiting for the BrainWorker to respond."
- "The BrainWorker accepted your request."
- "Your booking is confirmed."
- "The request expired without a response."
- "Your booking was cancelled."

Do not claim:

- guaranteed acceptance;
- guaranteed availability;
- guaranteed pricing;
- escrow protection without deployed capability;
- payment completion without payment state;
- dispatch before dispatch state exists;
- assignment when only customer interest exists.

## 26. Accessibility

Target WCAG 2.2 AA intent.

Requirements:

- semantic lifecycle status;
- keyboard-accessible actions;
- visible focus;
- repository-standard touch targets;
- accessible labels;
- `aria-busy` for active loading/mutation where appropriate;
- announcements for mutation success/failure;
- confirmation for destructive cancellation where appropriate;
- status meaning not dependent on color;
- reduced-motion support;
- appropriate focus movement after major state changes.

## 27. Responsive Requirements

Support mobile, tablet, desktop, and PWA viewports.

### Mobile

Prioritize:

1. current lifecycle state;
2. job/reference context;
3. BrainWorker context;
4. schedule/pricing context where supported;
5. primary next action;
6. recovery/cancellation.

### Tablet

Use the approved 8-column grid and explicit tablet composition.

### Desktop

Use the established 1280px maximum container and authenticated customer shell. A summary plus lifecycle composition may be used without creating a separate visual language.

## 28. Security and Privacy

The implementation must:

- enforce customer ownership at the repository/domain boundary;
- prevent cross-customer lifecycle reads/mutations;
- validate all route/query input;
- safely render customer text;
- avoid sensitive data in URLs;
- avoid private BrainWorker contact information unless explicitly permitted by lifecycle;
- avoid internal risk, moderation, verification, fraud, and ranking data;
- prevent duplicate mutations;
- use idempotent semantics when supported by production APIs;
- preserve safe authentication return paths.

## 29. Notifications Boundary

WEB-013 may model lifecycle changes that eventually require customer notification, but the frontend phase must not send real SMS, push, email, or FCM notifications without a separate approved notification contract.

Potential future events include response received, booking confirmed, schedule changed, cancellation completed, and expiration.

## 30. User Stories

- As a customer, I want to know whether the BrainWorker has responded.
- As a customer, I want to know when my booking is actually confirmed.
- As a customer, I want to distinguish decline, expiration, and cancellation.
- As a customer, I want to understand schedule state.
- As a customer, I want to cancel when permitted.
- As a customer, I want failed cancellation to leave my actual state unchanged.
- As a customer, I want my job reference and context preserved.
- As a customer, I want Jobs and lifecycle detail to show the same state.
- As a customer, I do not want the platform to claim payment, dispatch, availability, or acceptance when those events have not occurred.
- As a customer using assistive technology, I want lifecycle changes and action results announced clearly.

## 31. Acceptance Criteria

### Lifecycle

1. Every customer-visible lifecycle state maps to an authoritative domain condition.
2. No parallel frontend lifecycle state machine is introduced.
3. Mutations use `canTransition()`.
4. `PENDING_ACCEPTANCE` is shown as awaiting response.
5. `CONFIRMED` is the booking-confirmed boundary.
6. `CANCELLED` is distinct from `EXPIRED`.
7. Decline is shown only from an explicit acceptance response.
8. No `DECLINED` JobStatus is invented.

### Continuity

9. Job reference/context is preserved from WEB-011/WEB-012.
10. Selected BrainWorker context is preserved.
11. WEB-011 remains the canonical Jobs/activity surface.
12. WEB-007 direct booking preparation remains distinct and compatible.

### Scheduling and pricing

13. Requested and confirmed schedule are distinguishable.
14. Proposed schedule is shown only when supported.
15. No fabricated availability or appointment times are shown.
16. Budget, rate, and payment are not conflated.

### Cancellation

17. Cancellation is offered only from permitted states.
18. Duplicate cancellation is prevented.
19. Successful cancellation shows authoritative cancelled state.
20. Failed cancellation retains prior state and provides retry.
21. Refund outcomes are not claimed without payment support.

### Authorization

22. Customer ownership is enforced at repository/domain boundary.
23. Cross-customer reads are denied.
24. Cross-customer mutations are denied.
25. Job/BrainWorker relationships are validated before mutation.
26. Current lifecycle state is validated before mutation.

### Failure

27. Technical failure is distinct from decline, expiration, and cancellation.
28. Offline state does not masquerade as current confirmed state.
29. Invalid context has safe recovery.
30. Session failure uses WEB-008 behavior.
31. Pending mutations do not fabricate final state.

### Trust

32. Confirmation language is used only for authoritative confirmation.
33. Payment claims require authoritative payment state.
34. Dispatch claims require authoritative dispatch state.
35. Escrow claims are not introduced without deployed capability.
36. Private verification/contact/risk data is not exposed.

### Accessibility/responsive

37. Lifecycle actions are keyboard accessible.
38. Focus states are visible.
39. Status and mutation changes are announced appropriately.
40. Status meaning is not color-only.
41. Reduced motion is respected.
42. Mobile, tablet, and desktop are supported.
43. No horizontal scrolling is required for normal use.

### Mock boundary

44. Mock transitions are deterministic.
45. Mock lifecycle is behind a stable repository/domain interface.
46. No real external side effects are triggered.
47. Fixtures contain only contract-supported customer-facing facts.

## 32. Edge Cases

Account for:

- duplicate interest/cancellation submissions;
- mutation failure;
- customer withdrawal after lifecycle changes;
- delayed BrainWorker response;
- explicit decline;
- expiration;
- confirmation;
- schedule proposal/change;
- unsupported schedule mutation;
- cancellation from terminal state;
- session expiry during mutation;
- invalid/other-customer reference;
- network loss after mutation;
- refresh while mutation is pending;
- stale lifecycle data;
- browser back navigation;
- dashboard/Jobs deep links;
- return from BrainWorker profile;
- keyboard-only use;
- screen-reader use;
- reduced motion;
- mobile, tablet, and desktop layouts.

Undefined cases must fail safely and must not create new lifecycle rules.

## 33. Analytics

Potential future measures:

- selection-to-response rate;
- acceptance/confirmation rate;
- decline rate;
- expiration rate;
- cancellation rate;
- schedule-change rate;
- lifecycle mutation failure rate.

Analytics is not required for this slice unless an approved analytics contract exists. Sensitive identity/operational data must not be collected unnecessarily.

## 34. Contract Decisions

The five load-bearing questions from the original §34 are resolved for WEB-013. These decisions are authoritative for the frontend implementation phase and remain compatible with the existing JobStatus, JobInvitation, RespondToInvitationRequest, and canTransition() contracts.

### 34.1 Decline representation

A BrainWorker decline is recorded on the acceptance/invitation response, not as a new JobStatus.

The existing JobInvitation contract is authoritative for this response boundary:

- accepted: false records the explicit decline;
- respondedAt records when the response occurred when authoritative;
- declineReason is optional and customer-safe when supplied;
- the job does not gain a DECLINED JobStatus.

The declined invitation remains a historical response for that BrainWorker. The customer may review alternatives where the matching lifecycle supports another candidate. The job lifecycle remains governed by the canonical JobStatus contract and must not be forced into CANCELLED or EXPIRED merely because one BrainWorker declined.

Customer-facing decline wording is therefore scoped to the acceptance response: **The BrainWorker declined the request.** It must not be presented as a replacement JobStatus.

### 34.2 Schedule negotiation

WEB-013 does not introduce schedule negotiation as an implementation capability.

For this slice:

- the customer requested schedule is carried as request context;
- a confirmed schedule is shown only when an authoritative booking/lifecycle contract supplies it;
- no proposal, counter-proposal, customer accept/reject schedule workflow is rendered;
- no new SCHEDULED JobStatus is introduced.

If a future approved scheduling contract adds proposal/response semantics, those belong in a separate schedule contract and must remain subordinate to the canonical JobStatus model.

### 34.3 Cancellation authority and asynchronous behavior

The existing canonical transition graph is the authority for customer cancellation. In the current contract, the customer may request cancellation only from states where canTransition(currentStatus, 'CANCELLED') is true. That currently permits cancellation from OPEN, PENDING_ACCEPTANCE, CONFIRMED, DISPUTED, and RESOLVED, subject to separate customer-ownership and domain-policy checks.

WEB-013 does not introduce persistent asynchronous cancellation as a lifecycle state. The frontend mutation is synchronous for this mock-first slice:

1. validate customer ownership and lifecycle capability;
2. enter a transient pending UI state;
3. perform the mutation;
4. render authoritative CANCELLED on success;
5. retain the prior authoritative state on failure.

A future production API may use an idempotent asynchronous operation, but that operation must be represented by a separate mutation/pending contract rather than a new JobStatus unless the canonical state machine is formally amended.

### 34.4 Confirmation source

CONFIRMED is authoritative only when the booking/acceptance domain operation records an accepted invitation and successfully crosses the canonical transition boundary:

canTransition('PENDING_ACCEPTANCE', 'CONFIRMED')

For the current frontend contract, the authoritative confirmation source is the accepted RespondToInvitationRequest processed by the booking/lifecycle domain boundary. UI selection, local optimistic state, a BrainWorker profile, a proposed schedule, or a payment event cannot independently produce confirmed-booking language.

The customer-facing confirmation line **Your booking is confirmed.** is therefore rendered only from authoritative CONFIRMED state.

### 34.5 Payment timing

No existing approved WEB-013 contract establishes a payment-before-confirmation, payment-at-confirmation, or payment-after-confirmation rule. Therefore WEB-013 deliberately makes no payment-timing commitment.

For this slice:

- booking confirmation is not payment confirmation;
- no payment state, payment CTA, escrow state, or funds-secured claim is rendered;
- payment execution remains outside WEB-013 and belongs to the separately approved payment/wallet capability;
- when that capability is specified, its payment timing must integrate with the booking lifecycle without redefining CONFIRMED retroactively.

This preserves ARCH-002's distinction between customer budget, BrainWorker rate, marketplace pricing, and actual payment state.

### 34.6 Implementation contract summary

The implementation must use these boundaries:

Customer Job Invitation / Acceptance Response
  -> records accepted or declined response

PENDING_ACCEPTANCE -> CONFIRMED
  -> only through the canonical lifecycle mutation

Schedule
  -> request context only unless a future authoritative schedule contract exists

Cancellation
  -> capability derived from canTransition() + customer/domain authorization

Payment
  -> separate capability; no WEB-013 payment state

No frontend-only status, optimistic confirmation, fabricated schedule, or payment implication may bypass these decisions.

## 35. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Parallel lifecycle models | Derive presentation from authoritative domain state |
| Decline ambiguity | Show decline only from explicit acceptance response |
| Schedule ambiguity | Require authoritative schedule condition |
| Mock operational claims | Keep fixtures contract-supported and deterministic |
| Cross-customer mutation | Enforce ownership and relationship checks at domain boundary |
| Mutation appears successful before completion | Use pending -> authoritative result/error flow |
| Unsupported payment/escrow claims | Keep payment execution outside WEB-013 |

## 36. Implementation Boundary

After product and design approval, implementation is limited to the customer acceptance and booking lifecycle defined here.

Expected areas may include:

```text
apps/web/app/jobs/
apps/web/components/jobs/
apps/web/components/booking/
apps/web/lib/jobs/
apps/web/lib/booking/
apps/web/lib/matching/
packages/api-types/
```

Exact paths must be confirmed against the repository before implementation.

Existing customer activity and matching abstractions should be reused rather than replaced with competing repositories.

## 37. QA Requirements

Verify:

### Product
- state presentation;
- acceptance/decline semantics;
- confirmation boundary;
- schedule semantics;
- cancellation semantics;
- WEB-012 continuity;
- WEB-007 continuity.

### UX
- current state is obvious;
- next action is obvious;
- unsupported claims are absent;
- failures are recoverable;
- pending mutations cannot duplicate;
- context is preserved.

### Accessibility
- keyboard completion;
- screen-reader announcements;
- focus management;
- mutation feedback;
- touch targets;
- contrast;
- reduced motion.

### Responsive
- mobile;
- tablet;
- desktop;
- PWA viewports.

### Security
- ownership checks;
- mutation authorization;
- relationship validation;
- safe routing;
- no sensitive leakage;
- no client-only authorization.

### Regression
- WEB-010 dashboard;
- WEB-011 Jobs/activity;
- WEB-012 matching;
- WEB-007 booking preparation;
- WEB-008 authentication/session return flow.

## 38. Definition of Done

WEB-013 is complete only when:

1. Product specification is approved.
2. Independent product review is complete.
3. Design brief is approved.
4. Independent design review is complete.
5. Implementation authorization is granted.
6. Production-relevant acceptance/booking contracts are defined.
7. Mock lifecycle adapter exists behind a stable repository/domain boundary.
8. Canonical lifecycle transitions are enforced.
9. Customer authorization is enforced at the domain boundary.
10. Required customer-visible states are implemented and tested.
11. WEB-011 continuity works.
12. WEB-012 continuity works.
13. WEB-007 continuity works where applicable.
14. Scheduling and cancellation behavior is truthful.
15. Technical/offline/session states work.
16. Accessibility and responsive requirements pass.
17. Security/privacy requirements pass.
18. Tests, type-check, lint, and production build pass.
19. Vercel preview reaches READY.
20. Independent implementation review is complete.
21. PR is merged and production deployment is verified.

## 39. Source Authority

WEB-013 follows this authority order:

1. Approved live BukieBrainJobs experience and bundled experience standards.
2. Approved product specifications for behavior, terminology, claims, and journeys.
3. `DESIGN.md` for foundational visual tokens and rules.
4. ARCH-002 production-first architectural baseline.
5. Existing canonical domain contracts, including `JobStatus` and `canTransition()`.
6. WEB-011 customer activity model.
7. WEB-012 matching/selection model.
8. WEB-007 booking preparation model.
9. WEB-008 authentication/session behavior.
10. Existing security, accessibility, QA, and deployment standards.

Lower-level material must not override higher-level approved requirements.

## 40. Approval Gate

This document defines product behavior and does not authorize implementation.

Required sequence:

```text
WEB-013 Product & UX Specification
  ↓
Independent Product Review
  ↓
WEB-013A Design Brief
  ↓
Independent Design Review
  ↓
Implementation Authorization
  ↓
Antigravity Implementation
  ↓
Independent Implementation Review
  ↓
Merge
  ↓
Production Verification
```

**Current status: PRODUCT CONTRACT DECISIONS RESOLVED.**
