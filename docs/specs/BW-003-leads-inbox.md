# BW-003 BrainWorker Job Requests & Leads Inbox

**Document ID:** BW-003  
**Version:** 1.0  
**Status:** In Review  
**Primary Route:** `/brainworker/leads`

## 1. Purpose

BW-003 gives an approved BrainWorker a controlled workspace for receiving, inspecting, and responding to customer job invitations.

The feature consumes the authoritative provider identity, verified trade categories, service catalog, availability, operational coverage, and readiness established by BW-001 and BW-002. It does not create a second matching taxonomy.

## 2. Provider Eligibility

Lead access requires:

1. an authenticated session;
2. `role === 'brainworker'`;
3. `isBrainWorkerApproved === true`; and
4. `operationalProfile.isComplete === true`.

Incomplete providers must not load leads or perform invitation actions. They are directed to the existing BW-002 setup surfaces.

`isComplete` is setup completeness, not live duty. A complete provider may be off duty. Dispatch eligibility remains a separate domain condition.

## 3. Lead Eligibility

A lead may be presented only when the authoritative lead/matching contract establishes:

- at least one active configured service whose platform skill/category matches the job requirement;
- the job location is within the provider's configured operational city/zone and travel-radius boundary;
- the provider is operationally eligible for the requested timing according to the BW-002 weekly schedule and duty state;
- the invitation belongs to the authenticated provider.

The UI must not calculate an independent match score.

## 4. Lead Feed

Each feed item may expose before booking confirmation:

- job title;
- problem description;
- service/category;
- general city and neighbourhood/zone;
- landmark where supplied;
- requested timeframe;
- urgency;
- customer pricing mode and permitted budget/rate information;
- authorized attachment previews;
- invitation state;
- invitation timing derived from authoritative timestamps.

The following remain masked:

- exact residential house/flat number;
- private phone number;
- private email address;
- billing information;
- unrelated private account data.

Required states: loading, populated, empty, degraded, offline, repository/network failure, and unauthorized/ineligible.

## 5. Lead Inspection

The inspection surface may be a desktop drawer and a mobile full-screen detail surface. It preserves the feed authorization boundary and must not expose private customer contact credentials before confirmation.

## 6. Invitation Responses

Accept and Decline operate on a specific invitation.

### Accept

Requires an approved authenticated BrainWorker, invitation ownership, an unresponded invitation, a valid current state, and connectivity. The authoritative mutation records the response timestamp and state transition. The client never manufactures `respondedAt`.

Acceptance uses the existing canonical booking state machinery and does not imply payment or escrow settlement.

### Decline

Records invitation ID, authenticated provider identity, canonical decline reason, and authoritative `respondedAt`. Declining does not cancel the customer job.

Canonical reasons:

- `SCHEDULE_CONFLICT`
- `OUTSIDE_COVERAGE_AREA`
- `SKILL_TOOL_MISMATCH`
- `RATE_BUDGET_MISMATCH`
- `TEMPORARILY_UNAVAILABLE`
- `OTHER`

Freeform text is not the primary taxonomy. An optional note, if later approved for `OTHER`, must be separately bounded and validated.

## 7. Response Timing

The domain/repository layer owns invitation timestamps. The UI may calculate elapsed response time from authoritative `sentAt` and `respondedAt`, but never writes those timestamps.

## 8. Quotation

Quotation is a provider response mechanism, separate from booking confirmation, escrow, checkout, and payout.

Two explicit pricing modes:

1. `CUSTOMER_POSTED_RATE`: provider accepts the authoritative customer-posted rate where permitted.
2. `WORKER_QUOTE`: provider submits an itemized estimate.

A worker quote contains:

- `laborAmountKobo`;
- optional `materialsAmountKobo`;
- `diagnosticFeeKobo` sourced from the active BW-002 catalog;
- computed `totalAmountKobo`;
- estimated duration in hours;
- optional scope notes.

Amounts are integer kobo values. Total is derived from line items and is not independently editable.

Quotation submission is online and authorization-protected. Its lifecycle must use only states established by the approved quotation contract.

## 9. Offline Behaviour

While offline:

- cached authorized lead data may be inspected;
- no new lead is claimed as fresh;
- Accept, Decline, quote submission, and rate acceptance are disabled;
- no assignment or booking confirmation is fabricated;
- cached data is clearly identified as potentially stale.

No offline mutation queue is introduced in BW-003.

## 10. Accessibility and Responsive Requirements

- Minimum interactive target: 44px.
- Full keyboard operation.
- Visible focus states.
- Semantic headings, controls, dialogs/drawers, and form labels.
- Screen-reader announcements for material feed-state changes.
- Reduced-motion support.
- Mobile detail remains fully usable.
- No color-only status communication.

## 11. Security Requirements

Every read and mutation derives authorization from the authenticated provider identity.

Fail-closed cases include unauthenticated sessions, customer sessions, unapproved providers, missing or mismatched provider IDs, invitation ownership mismatch, already-responded invitations, and unauthorized lead access.

Sensitive customer fields must not be returned merely because a caller knows a job ID.

## 12. Non-Goals

BW-003 does not implement matching-engine ranking changes, payments/escrow, payout/wallet logic, booking fulfillment, check-in, scope changes, completion/disputes, customer-side quote negotiation, or production database migration solely for the frontend slice.

## 13. Acceptance Criteria

- [ ] Approved complete BrainWorker can load `/brainworker/leads`.
- [ ] Incomplete providers are blocked from lead loading and response actions.
- [ ] Lead eligibility uses authoritative services/skills and BW-002 coverage inputs.
- [ ] Customer privacy boundary is enforced before confirmation.
- [ ] Feed supports loading, populated, empty, degraded, offline, and failure states.
- [ ] Inspection preserves the same authorization boundary.
- [ ] Accept and Decline are invitation-scoped and authorization-protected.
- [ ] Decline uses the canonical taxonomy.
- [ ] Response timing comes from authoritative timestamps.
- [ ] Quotation supports customer-rate acceptance and worker itemized quotes without conflating booking/payment.
- [ ] Offline mode is read-only for lead mutations.
- [ ] Production/testing boundaries remain physically separated.
- [ ] Accessibility and responsive requirements are verified.

## 14. Verification

Completion requires focused BW-003 tests, BrainWorker regression tests, strict type-check, lint, production build, physical-boundary inspection, Vercel verification, and post-merge regression verification.
