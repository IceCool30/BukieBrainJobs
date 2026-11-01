# WEB-009: Customer Job Posting & Request Creation Product & UX Specification

**Document ID:** WEB-009 <br>
**Version:** 1.1 <br>
**Status:** Approved v1.1 Product Specification <br>
**Product area:** Customer job posting <br>
**Route:** `/post-job` <br>
**Authority:** Approved product specification by delegated Product Manager under the Operating Charter's Product Architecture and Documentation function, dated 30 October 2026. Product approval only; implementation execution is held pending the requesting PM's explicit review and approval of this document set.

> **Delegation notice.** This product specification records product decisions approved by the delegated PM acting on the product owner's behalf. It does not claim that the owner personally performed a design review, that a separate human reviewer signed off, or that Product Architect approval exists. WEB-009A's design review checklist in sections 30-31 and its implementation boundary remain untouched and are not claimed satisfied by this product approval.

## 1. Purpose

WEB-009 describes the customer-facing product behavior for posting a job request. A customer can describe either a specific service need or a broader project, provide location and timing details, and submit a request for later review. A successful mock-first submission means the request was received by the prototype flow. It does not mean a BrainWorker was matched, assigned, contacted, or booked.

This file is the canonical WEB-009 v1.1 product specification. It does not prescribe the visual design, page layout, or platform-specific interaction model.

## 2. Scope and boundary

This specification covers the product intent and behavior for the public `/post-job` journey on the web surface. It does not prescribe the visual design, page layout, or platform-specific interaction model.

The WEB-009 v1 experience remains mock-first. It does not include production database persistence, real request creation, matching, dispatch, BrainWorker bidding or chat, notifications, payment processing, escrow, KYC, media storage, or production booking records. This task also makes no production-authentication changes. Existing authentication behavior is described as a product boundary. Production authentication is outside this task and must not be changed under this specification.

Native screens are not specified here. The operating charter requires core customer journeys across web, PWA, and native apps, while allowing each surface to use an appropriate interaction model. A native adaptation needs its own approved specification. This document does not authorize or define one.

## 3. Approved product behavior

| Product concern | Approved behavior | Source basis |
|---|---|---|
| Job type | Support both a specific service request and a broader project. The customer must choose one. | WEB-009A §7; `JOB_TYPES`; shared validation contract. |
| Category | Optional. Provide an `I'm not sure` path. Do not require category-specific questionnaires in v1. | WEB-009A §7; validation contract; current screen. |
| Job details | Required trimmed title (10 to 100 characters) and free-form description (20 to 1,000 trimmed characters). Whitespace-only required input is invalid. | PM product decision; current screen and validator limits. |
| Location | Required city from the seven active canonical cities and required street address (at least 5 characters). Landmark optional (at most 100 characters). Whitespace-only required input is invalid. City availability must follow the active-market rule and must not imply immediate fulfillment in an inactive market. | WEB-009A §8; `NIGERIAN_LOCATIONS`; PM product decision. |
| Schedule | Required timing preference. EXACT choices: Urgent / Today; Tomorrow; Flexible / Within a week; Specific Date. Specific Date must be a real calendar date and not in the past. | WEB-009A §9; `SCHEDULE_OPTIONS`; PM product decision. |
| Budget | Optional. One amount with Fixed or Negotiable type, or omitted. Not a final quote, locked price, payment authorization, or BrainWorker acceptance. No arbitrary new amount cap. | WEB-009A §10; PM product decision. |
| Preferred BrainWorker | Optional validated preference from the existing public mock directory, with names derived from known IDs. It does not imply assignment, confirmed availability, a booking, or guaranteed matching. Native names/IDs-only presentation is defined separately in MOB-POST-001; no existing web presentation is changed here. | WEB-009A §11; current screen and mock data; PM product decision. |
| Contact details | Do not ask customers to repeat contact details already associated with authentication. | WEB-009A §§8 and 13; current screen. |
| Authentication boundary | Guests may complete the form. Existing web mock-auth protected commitment preserves the draft and applies authentication at submission. Production authentication is outside this task and must not be changed under this specification. | WEB-009A §§5 and 13; current web screen and tests. |
| Request review | Editable review before final submission. Product requires reviewability; WEB-009A prescribes its screen sequence (five steps with Back and Continue). The current web implementation is a single scroll form with live preview, not a sequential wizard. | WEB-009A §12; current screen and tests. |
| Submission result | Honest mock-first `Request received` semantics and, if the mock flow provides one, a simulated reference in the `REQ-xxxxx` format. A confirmation must not claim a match, assignment, acceptance, payment, or confirmed booking. | WEB-009A §§15-16; helper tests; current screen. |
| Failure and recovery | A failed or offline web submission must not be presented as success. Preserve the entered draft and provide a retry path. Prevent accidental duplicate submission while processing. | WEB-009A §§15 and 18; current screen and tests. |
| Prefill and restored data | Treat query parameters, stored drafts, and preferred-worker identifiers as untrusted. Normalize and validate prefilled values. Customer edits remain authoritative. | WEB-009A §§4, 14 and 24; current context helper. |


## 4. Mock-first submission and data boundary

The matrix places WEB-009 under the ARCH-002 Phase 1 mock boundary and says the current form dispatches to the customer activity repository for cross-flow continuity. The web screen calls that repository after its prototype submission outcome succeeds. This specification does not authorize a database write, production API call, payment, or production job record.

The shared `CustomerJobCreationInput` contract describes customer-known intake data and does not require marketplace pricing, a pre-assigned worker, fabricated coordinates, or mandatory skill selection. It is a data contract, not permission to connect the form to production services.

The customer draft currently includes category, arrival-window, budget-type, and preferred-worker fields. The creation input currently used by the screen does not represent all of those fields. The precise mock record and retained fields are resolved in Section 7, item 7. The meaning of “received” in the customer activity view is honest mock-first `Request received` semantics under the ARCH-002 Phase 1 mock boundary. These are product requirements, not proof of runtime behavior.

## 5. Product behavior and screen-flow distinction

### Product-level behavior

The product outcome is a customer-submitted request for later review. The customer can provide the job details described in Section 3, retain them through the authentication handoff, and receive an honest mock-first confirmation or recover from a failed attempt. Product meaning must remain distinct from a match, assignment, booking, or payment.

### WEB-009A screen flow

WEB-009A is a screen-level design brief. It describes this sequence:

1. Job Requirement
2. Location
3. Schedule / Urgency
4. Budget / Rate
5. Review
6. Authentication check
7. Submit Request
8. Failure / Retry or Request Received

It also describes Back and Continue behavior, validation before advancing, review edits, responsive layouts, and accessible progress. Those details are design-flow requirements in WEB-009A, not evidence that the product-level flow has been approved. WEB-009A's own header still says `Draft, Ready for Agent Review`; the artifact matrix lists a different approval status. This approval establishes WEB-009 product authority. WEB-009A remains a draft design brief with separate review and implementation gates. Its historical matrix approval label is provenance, not evidence that those gates passed.

### Existing web implementation evidence

The current `PostJobScreen` renders the form sections on one page. Its numbered progress controls scroll to sections; they do not move through a sequential step state. It also renders a live request preview and validates the complete draft on submission. The screen tests cover the five visible sections, validation, mock-auth handoff, draft restoration, submission, and failure recovery. They do not demonstrate the sequential Back / Continue flow described in WEB-009A.

The existing screen and tests are implementation evidence only. Under the source-of-truth rules, code does not replace an approved product specification.

## 6. Platform and native boundary

This is a product-level WEB-009 specification, not a native screen specification. The product outcome may apply across platforms under the operating charter, but this document does not decide whether a native app uses a step-by-step wizard, a single form, a local preview, or a different authentication handoff.

Any native adaptation must state how it preserves the approved product behavior and must resolve its own interaction, draft-restoration, and authentication details. No native implementation or visual restyling is authorized by this specification.

## 7. Resolved PM product decisions

The eleven open questions from the prior draft are resolved as follows:

1. **Which artifact is authoritative?** WEB-009 v1.1 is the canonical product specification at `docs/specs/WEB-009-customer-job-posting.md`. WEB-009A remains a separate screen-level design brief with its own `Draft, Ready for Agent Review` status and sections 30-31. The matrix's `Approved product specification` row for WEB-009 is reconciled with this PM-approved status; the matrix's `Approved implementation contract` row for WEB-009A remains recorded but its sections 30-31 review verdict and Product Architect authorization are not established by this document.

2. **Is the product journey sequential?** The product requires reviewability but does not mandate a true multi-step sequence as product behavior. WEB-009A's five-step sequence with Back and Continue is a screen-level design choice. The current web screen uses a single scroll form with live preview; no web redesign or code change is approved here.

3. **What are the text and address limits?** After trimming: title 10 to 100 characters, description 20 to 1,000 characters, street address at least 5 characters, and optional landmark at most 100 characters. Whitespace-only required input is invalid. These are product requirements adopted from the current validator and PM decision.

4. **What is the budget model?** Budget is optional. One amount with Fixed or Negotiable type, or omitted. Not a price lock, quote, payment authority, or acceptance.

5. **Are arrival windows part of WEB-009?** Arrival window is an optional product field. EXACT labels: Morning (9:00 AM - 12:00 PM); Afternoon (1:00 PM - 4:00 PM); Evening (4:00 PM - 7:00 PM); Any time. A preference, not a guaranteed appointment.

6. **Which active-market list governs validation?** Only the seven canonical active labels: Lagos; Abuja (FCT); Port Harcourt; Ibadan; Enugu; Kano; Benin City. These come from `NIGERIAN_LOCATIONS` where `status === 'active'`. Inactive or unrecognized cities do not imply immediate fulfillment.

7. **What does mock submission retain?** The mock record retains title, description, type, address, city, optional landmark, date at 09:00Z or current time, and positive budget kobo. It does NOT retain category, urgency, arrival window, budget type, or worker preference as distinct activity fields under the current creation input contract. These remain form/review-only under the accepted mock boundary.

8. **What are schedule semantics in the mock record?** Urgency and arrival window are preferences, not confirmed appointments. The existing screen maps a selected date to a timestamp and otherwise uses the current time. This does not imply a confirmed appointment.

9. **How long and where is a draft retained?** The existing web guest-auth handoff saves a snapshot in sessionStorage when available, with an in-memory Map fallback outside the browser. It is not continuous autosave. There is no explicit time TTL or cross-session retention guarantee. The screen attempts restoration from that store on load and clears the saved draft only after successful mock repository creation. Storage failure must not be represented as successful preservation. No production-authentication or storage change is authorized.

10. **What is the native adaptation?** This document does not define native screens. MOB-POST-001 is the native adaptation specification under delegated PM decision MOB-POST-001-DEC-001, with implementation held pending requesting PM document review and explicit approval.

11. **What are the final acceptance criteria?** See Section 9 below.

## 8. Approval and implementation status

This document is `Approved v1.1 Product Specification` as approved by the delegated Product Manager under the Operating Charter's Product Architecture and Documentation function, dated 30 October 2026.

**Implementation hold:** Product approval is not permission to start implementation in this run. The requesting PM must review and explicitly approve this document set before any implementation may begin.

No application code, test, backend, database, payment, or production-authentication file was changed as part of this product approval. Matrix and README updates were made to reflect this approved specification. The WEB-009A design brief remains untouched.

WEB-009A original provenance and requirements remain untouched. WEB-009A sections 30-31 and its implementation boundary are not claimed satisfied by this product approval. No separate external human review, personal owner review, or Product Architect authorization is asserted.

## 9. Acceptance criteria

- [ ] Job type supports specific service or broader project as required choices.
- [ ] Category is optional with an `I'm not sure` path; no category-specific questionnaires in v1.
- [ ] Title is required, 10 to 100 characters trimmed; whitespace-only invalid.
- [ ] Description is required, 20 to 1,000 trimmed characters; whitespace-only invalid.
- [ ] Street address is required, at least 5 trimmed characters; whitespace-only invalid.
- [ ] City is required from the seven active canonical cities only.
- [ ] Landmark optional, at most 100 trimmed characters.
- [ ] Schedule choice required from EXACT four labels; Specific Date must be real and not past.
- [ ] Arrival window optional from EXACT four labels; preference, not guaranteed appointment.
- [ ] Budget optional with one amount and Fixed or Negotiable type, or omitted; not a quote or price lock.
- [ ] Preferred BrainWorker optional, from four public mock IDs/names only; preference only, no assignment or matching claims.
- [ ] Editable review before final submission.
- [ ] Honest mock-first `Request received` confirmation with optional simulated `REQ-xxxxx` reference; no match/assignment/payment claims.
- [ ] Failure preserves draft; retry path available; no false success.
- [ ] Query parameters, stored drafts, and worker identifiers treated as untrusted.
- [ ] No media upload in v1.
- [ ] No production database persistence, API call, payment, escrow, KYC, or booking record.
- [ ] No production-authentication change.

## 10. Source references

- [WEB-009A: Customer Job Posting Design Brief](../04-public-website/WEB-009A-CUSTOMER-JOB-POSTING-DESIGN-BRIEF.md) - sections 30-31 and provenance untouched
- [Approved Public Website Artifact Matrix](../04-public-website/APPROVED-ARTIFACT-MATRIX.md)
- [Source of Truth and Document Governance](../00-governance/SOURCE-OF-TRUTH.md)
- [Operating Charter](../01-product/OPERATING-CHARTER.md)
- [Specifications index](README.md)
- [Current web job-posting screen](../../apps/web/components/post-job/PostJobScreen.tsx)
- [Draft storage (sessionStorage with memory fallback)](../../apps/web/lib/auth/storage.ts)
- [Current web screen tests](../../apps/web/app/post-job/PostJobScreen.test.tsx)
- [Job-posting helper contracts](../../apps/web/lib/post-job/index.ts) and [helper tests](../../apps/web/lib/post-job/post-job.test.ts)
- [Shared job-draft validation contract](../../packages/validation/src/prototypeFormValidation.ts) and [validation tests](../../packages/validation/src/prototypeFormValidation.test.ts)
- [Shared job API types](../../packages/api-types/src/jobs.ts)
- [MOB-POST-001 decision record](../21-decision-log/MOB-POST-001-NATIVE-JOB-POSTING.md)
- [MOB-POST-001 native build specification](MOB-POST-001-native-job-posting.md)
