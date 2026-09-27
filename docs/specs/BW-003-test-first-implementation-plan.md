# BW-003 Test-First Implementation Plan

**Document ID:** BW-003-TDD  
**Version:** 1.0  
**Status:** Approved Architecture Draft

## 1. Execution Rule

No implementation begins before the corresponding RED contract exists.

Each phase follows RED → GREEN → regression → independent audit. No speculative phase is added merely to make the plan appear complete.

## 2. Phase Map

### Phase 1: Domain Contracts and Eligibility

- LEAD-001 provider completeness gate
- LEAD-002 approved BrainWorker role gate
- LEAD-003 active service-to-skill eligibility
- LEAD-004 coverage city/zone/radius eligibility
- LEAD-005 weekly schedule eligibility
- LEAD-006 customer privacy projection
- LEAD-007 deterministic ordering/pagination

### Phase 2: Repository and Tenant Isolation

- REP-001 authenticated provider required
- REP-002 cross-provider read rejected
- REP-003 cross-provider mutation rejected
- REP-004 incomplete provider receives no leads
- REP-005 authorized lead retrieval
- REP-006 invitation ownership enforced
- REP-007 already-responded invitation rejected
- REP-008 offline mutation fails closed
- REP-009 production export surface contains no testing helpers
- REP-010 storage is tenant-scoped

### Phase 3: Invitation Responses

- INV-001 accept valid invitation
- INV-002 accept records authoritative response time
- INV-003 accept rejects mismatched provider
- INV-004 accept rejects already-responded invitation
- INV-005 decline valid invitation
- INV-006 decline uses canonical taxonomy
- INV-007 decline records authoritative response time
- INV-008 decline does not cancel job
- INV-009 invalid decline reason rejected
- INV-010 response state renders from repository result

### Phase 4: Quotation

- QUO-001 customer-rate acceptance
- QUO-002 worker quote labor line
- QUO-003 optional materials line
- QUO-004 catalog diagnostic fee sourcing
- QUO-005 integer-kobo total derivation
- QUO-006 conflicting client-supplied total rejected
- QUO-007 estimated duration validation
- QUO-008 optional scope-note validation
- QUO-009 quote authorization
- QUO-010 quote remains separate from booking/payment state

### Phase 5: Lead Feed and Inspection UI

- UI-001 loading
- UI-002 populated feed
- UI-003 empty
- UI-004 degraded
- UI-005 offline read-only
- UI-006 repository failure/retry
- UI-007 inspection privacy projection
- UI-008 attachment presentation
- UI-009 accept/decline controls
- UI-010 responsive detail surface
- UI-011 keyboard/focus/drawer semantics
- UI-012 reduced-motion behavior

### Phase 6: Route Integration and Security

- INT-001 unauthenticated redirect
- INT-002 customer fail-closed boundary
- INT-003 unapproved BrainWorker redirect
- INT-004 incomplete provider setup gate
- INT-005 approved complete provider feed load
- INT-006 authenticated ID/repository ID match
- INT-007 static/prerender-safe route
- INT-008 production route contains no testing imports
- INT-009 dashboard link reaches `/brainworker/leads`
- INT-010 no private customer credentials reach the rendered projection

### Phase 7: Production Verification

Required evidence:

- focused BW-003 suite green;
- BrainWorker regression suite green;
- monorepo web regression suite green;
- TypeScript strict check;
- ESLint;
- production build;
- physical testing-boundary inspection;
- Vercel deployment READY;
- runtime error/log review;
- route smoke verification;
- clean branch/mainline lineage before merge authorization.

## 3. Test Data

Fixtures must include complete approved, incomplete, off-duty, multi-service, outside-coverage, inside-coverage, pending invitation, responded invitation, privacy-sensitive job, media job, customer-rate, worker-quote, and offline-cache scenarios.

Fixtures are tenant-scoped and deterministic.

## 4. Security Regression

Every mutation test verifies that authenticated BrainWorker identity is authoritative. Arbitrary provider IDs from the UI are never trusted.

No test requires private customer contact data to render a lead.

## 5. Physical Boundary

Production code must not import `testing/`, test fixtures, test-only factories, or test-only repositories.

## 6. Completion Gate

BW-003 is complete only when all approved phases pass, no blocking defect remains, documentation is reconciled, the resulting mainline deployment is verified, and human merge approval is granted.
