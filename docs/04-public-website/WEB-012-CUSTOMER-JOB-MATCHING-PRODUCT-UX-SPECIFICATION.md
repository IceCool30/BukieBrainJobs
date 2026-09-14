# WEB-012: Customer Job Matching & BrainWorker Match Results

**Document ID:** WEB-012  
**Version:** 1.0  
**Status:** Draft for Independent Product Review  
**Product Area:** Customer Marketplace  
**Primary User:** Authenticated Customer  
**Implementation Model:** Production-first architecture with deterministic mock data for the current frontend phase  
**Dependencies:** WEB-005, WEB-006, WEB-008, WEB-009, WEB-010, WEB-011, ARCH-002, Design System v1.0

## 1. Purpose

WEB-012 defines the customer experience for viewing BrainWorker matches generated from a customer job request.

The product goal is to move a customer from a submitted request into an understandable marketplace matching experience without falsely representing a match as an assignment, acceptance, booking, payment, or dispatch event.

The current implementation phase uses deterministic mock matching data. The underlying product contract must nevertheless model the production marketplace concepts required for a later backend and matching-service integration without fundamental UX redesign.

## 2. Product Context

BukieBrainJobs supports two complementary customer marketplace paths:

### Direct discovery

```text
Find a Service
    ↓
Service Discovery
    ↓
BrainWorker Profile
    ↓
Booking Preparation
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
Customer reviews options
    ↓
Customer selects / expresses interest
    ↓
Later acceptance / booking lifecycle
```

WEB-012 implements the customer-facing matching stage of the second path. It does not replace direct discovery, BrainWorker profiles, booking preparation, or the unified customer activity surface.

## 3. Primary User Problem

A customer may know the work they need without knowing which BrainWorker is appropriate.

The customer should not have to understand internal matching logic. The platform should present suitable candidates in a clear order and explain the principal reasons each candidate is relevant.

The experience must distinguish:

- Request context
- Matching state
- Match candidate
- Customer selection or interest
- BrainWorker acceptance
- Booking confirmation
- Payment

These are separate product states.

## 4. Goals

1. Let an authenticated customer open matches for a supported job request.
2. Preserve enough job context for the customer to understand what is being matched.
3. Present eligible BrainWorkers in a ranked order.
4. Explain principal match reasons in customer-friendly language.
5. Provide relevant professional information without exposing private verification or risk data.
6. Allow customer selection or expression of interest where the supported lifecycle permits it.
7. Make clear that selection is not acceptance, assignment, booking, payment, or dispatch.
8. Provide useful no-match recovery.
9. Provide explicit loading, failure, degraded, offline, and invalid-context states.
10. Establish production-relevant contracts that can later connect to a real matching service.

## 5. Non-Goals

WEB-012 does not itself implement:

- Production matching infrastructure.
- Real BrainWorker notification delivery.
- Dispatch infrastructure.
- Payment processing.
- Wallet transactions.
- Refunds or disputes.
- Full booking lifecycle implementation unless an existing approved contract already supports a required transition.
- New KYC or BrainWorker verification infrastructure.
- Real-time chat infrastructure.
- AI matching recommendations.
- Enterprise or admin functionality.

These boundaries describe the current implementation phase. They do not remove these capabilities from the eventual production platform where they are part of the broader approved architecture or later product specifications.

## 6. Entry Points

The primary entry path is:

```text
Dashboard
  ↓
Jobs / Bookings
  ↓
Job Request Detail
  ↓
View Matches
  ↓
WEB-012 Match Results
```

A customer may also enter WEB-012 from a supported post-job confirmation or another approved job-request surface.

A match destination must always retain a valid job context. The implementation must not rely on arbitrary query parameters as an authorization mechanism.

## 7. Job Context

The match experience must identify the customer request being matched.

Where supported, display:

- Job title.
- Job type.
- Service or category.
- Location context.
- Requested schedule.
- Customer budget context, if supplied.
- Reference code.
- Concise customer description.

The technical UUID remains a technical identifier. The customer-facing reference code remains distinct and is preferred for visible request identification.

Customer-entered content must be rendered safely and must not be treated as executable markup.

## 8. Matching Eligibility Model

The production-oriented matching contract should evaluate hard eligibility conditions before ranking candidates.

Relevant eligibility inputs include, where supported by production data:

1. Service/category or skill relevance.
2. Service-area compatibility.
3. Location proximity where valid coordinates exist.
4. Availability compatibility with the requested schedule.
5. BrainWorker verification/approval state.
6. Rate and budget compatibility where pricing information exists.
7. Other hard constraints defined by the production matching domain.

The customer UI should receive the outcome of eligibility evaluation rather than expose internal eligibility rules or sensitive verification data.

A mock candidate must not be treated as eligible merely because it exists in a fixture.

## 9. Ranking Model

The customer should receive a ranked match set.

The conceptual priority is:

1. Hard eligibility constraints.
2. Service and skill relevance.
3. Availability fit.
4. Location and service-area fit.
5. Pricing or budget compatibility.
6. Quality and reliability signals.
7. Additional marketplace relevance signals when formally defined.

The exact numerical scoring algorithm is not defined by this specification. Engineering must not invent customer-visible scores or claim a particular mathematical ranking formula.

The contract should permit the backend matching service to change ranking logic without changing the customer-facing information architecture.

## 10. Match Explanation

Every displayed match should provide concise, customer-readable reasons when those reasons are supported by the matching contract.

Examples:

- Matches your requested service.
- Available for your requested schedule.
- Serves your location.
- Fits your stated budget.
- Strong experience with this type of work.

Do not expose:

- Proprietary ranking weights.
- Internal numerical match scores unless later explicitly approved.
- Internal risk signals.
- Private verification details.
- Sensitive customer or BrainWorker data.

If no explanation is available, the UI should not invent one.

## 11. Match Card

A match card should prioritize decision-useful information.

Recommended hierarchy:

```text
BrainWorker name + photo
Verification / approval indicator where publicly supported
Relevant services / skills
Rating and completed-work signal where supported
Location / service area
Availability context where supported
Rate / pricing context where supported
Why this matches
Primary action
```

The card must not imply that the BrainWorker has accepted the job.

The card should provide a clear path to the BrainWorker profile or match detail.

## 12. BrainWorker Information and Privacy

The customer may see information already approved for customer-facing BrainWorker profiles, including:

- Display name.
- Profile photo.
- Relevant services and skills.
- Public rating or completed-work summary where supported.
- Public service-area context.
- Public professional information relevant to the request.
- Pricing or rate context where supported.

Never expose:

- NIN.
- BVN.
- Verification documents.
- Private phone number.
- Private email address.
- Internal risk or fraud signals.
- Internal moderation notes.
- Private location data.
- Hidden matching scores.

## 13. Match Detail / Profile Continuity

Selecting a match should lead to a detail experience that allows the customer to evaluate the professional.

Where the existing WEB-005 profile supports it, the experience may reuse the canonical BrainWorker profile rather than creating a competing profile system.

The match context should remain available so the customer understands which job request the professional is being considered for.

The customer should be able to return to the match results without losing the request context.

## 14. Customer Selection / Interest

Where the current contract supports a customer selection or interest action, the action must use precise language such as:

- Select BrainWorker.
- Express interest.
- Continue with this BrainWorker.

The final label should be determined during design and content review based on the actual lifecycle contract.

Selection or interest must not claim:

- Assignment.
- Acceptance.
- Booking confirmation.
- Payment.
- Dispatch.
- Guaranteed availability.

If the current mock adapter cannot persist a selection, it must show an honest pending or simulated state rather than imply a production transaction occurred.

## 15. State Model

WEB-012 must explicitly support these customer-visible states:

### Matching in progress

The request is valid and the matching operation is represented as running.

Display stable loading treatment and communicate that matching is being prepared or evaluated.

Do not display invented candidate names or fake progress percentages.

### Matches available

At least one suitable candidate is available.

Display ranked results and supported match explanations.

### No suitable matches yet

The matching operation completed without a suitable candidate under current conditions, while the request remains valid.

Provide useful recovery actions.

### No matches for current constraints

The system can identify that current constraints are preventing suitable results.

Explain the constraint category only where the contract supports that explanation.

### Partial match data / degraded service

Some matching information is available while another non-critical part of the result cannot be loaded.

Preserve usable results and clearly identify unavailable information.

### Matching service failure

The matching operation failed technically.

This state must not be rendered as an empty marketplace.

Provide retry and a safe return path.

### Offline / degraded connectivity

Preserve the authenticated application shell where possible.

Do not claim current matching freshness when the client cannot verify it.

### Authentication/session failure

Use WEB-008 authentication behavior and preserve a validated return destination.

### Invalid or expired job context

The requested job cannot safely be resolved.

Provide a clear recovery path to Jobs / Bookings and Post a Job or Find a Service where appropriate.

## 16. No-Match Recovery

When there are no suitable matches, provide useful options supported by the request state:

- Review request details.
- Adjust schedule.
- Adjust location where appropriate.
- Adjust budget when budget is flexible.
- Return to activity detail.
- Continue waiting when the production lifecycle supports waiting.
- Find a Service as an alternative when appropriate.

Do not pressure customers into choosing unsuitable professionals merely to avoid an empty state.

## 17. Failure Semantics

The UI must distinguish three materially different conditions:

```text
No matches
    = matching completed successfully, zero eligible results

Matching failed
    = matching operation could not complete

Context invalid
    = requested job cannot be safely resolved
```

These must never collapse into one generic empty state.

Repository or adapter errors must propagate as errors. The frontend must never manufacture a successful match result when the data source fails.

## 18. WEB-009 Continuity

WEB-009 is the source context for job-led matching.

A valid job request may carry:

- Job title.
- Description.
- Job type.
- Category or "I'm not sure" state.
- Location.
- Schedule.
- Optional customer budget.
- Optional selected skills.
- Optional preferred BrainWorker.
- Durable reference code.

WEB-012 must not require customers to repeat this information simply to view matches.

The preferred BrainWorker remains a preference until a later approved lifecycle establishes a supported selection or acceptance state.

## 19. WEB-011 Continuity

WEB-011 remains the unified customer activity surface.

A supported job activity may expose a **View Matches** action when its underlying state permits matching.

The customer journey is:

```text
/jobs
  ↓
Job Request Detail
  ↓
View Matches
  ↓
WEB-012
```

WEB-012 must provide a clear route back to the originating activity.

## 20. WEB-010 Continuity

WEB-010 remains the authenticated customer home base.

The dashboard may surface a job request requiring customer attention and route into WEB-011 or directly into a supported match destination while preserving context.

WEB-012 must not create a second authenticated home or separate Jobs product.

## 21. Authentication

WEB-012 uses the authentication/session model established by WEB-008.

Customer-specific matches and selection actions are authenticated experiences.

If the session expires:

1. Preserve a valid return context.
2. Redirect through the existing authentication flow.
3. Return the customer to the supported match destination after authentication.

No new authentication pathway is introduced.

## 22. URL and Routing Contract

The exact route should be confirmed against current repository routing during the design brief and implementation inspection.

The route must support a durable job context without exposing sensitive information.

Preferred conceptual form:

```text
/job/[referenceCode]/matches
```

or another repository-consistent route established during design.

Query parameters may be used for non-sensitive UI state such as presentation mode, but they must be validated and must never act as authorization.

The technical UUID should not be unnecessarily exposed in customer-facing URLs when the durable reference code can safely identify the request.

## 23. Production-Relevant Domain Contracts

The domain model should conceptually separate:

```text
CustomerJobRequest
    ↓
MatchingRequestContext
    ↓
EligibilityResult
    ↓
MatchCandidate
    ↓
MatchExplanation
    ↓
RankedMatchResult
    ↓
CustomerSelection / Interest
    ↓
Acceptance / Booking lifecycle
```

A conceptual `MatchCandidate` should be capable of carrying:

- Durable BrainWorker identifier.
- Public BrainWorker profile reference.
- Eligibility outcome.
- Rank/order supplied by the matching domain.
- Supported professional signals.
- Supported pricing context.
- Supported availability context.
- Customer-safe match explanations.

A conceptual `RankedMatchResult` should carry:

- Durable job identifier/reference.
- Matching status.
- Candidate collection.
- Result freshness/context where supported.
- Available recovery information.
- Selection state where supported.

These are domain/application contracts, not a directive to invent a final database schema.

## 24. Mock Adapter

The first frontend implementation should use a deterministic mock matching adapter behind a stable interface.

The adapter should support fixtures for:

- Matching in progress.
- Multiple ranked matches.
- Single match.
- No matches.
- Constraint-driven no match.
- Partial result degradation.
- Matching failure.
- Offline/degraded mode.
- Invalid job context.
- Selection/interest pending or simulated state where required.

The mock adapter must never claim that it notified a real BrainWorker or created a real booking.

Replacing the adapter with a production matching service should preserve the customer-facing information architecture wherever possible.

## 25. Data Integrity

WEB-012 must follow ARCH-002 production-first rules.

In particular:

- Do not fabricate worker rates.
- Do not fabricate coordinates.
- Do not fabricate verification results.
- Do not fabricate availability.
- Do not fabricate ratings or completed-job statistics.
- Do not fabricate assignment or acceptance.
- Do not fabricate payment or booking confirmation.
- Do not turn repository failure into success.

If a value is unavailable, the UI should omit it or communicate that it is unavailable rather than inventing a plausible value.

## 26. Accessibility

Target WCAG 2.2 AA intent.

Requirements:

- Semantic match-card structure.
- Keyboard navigation.
- Visible focus.
- Logical heading hierarchy.
- Accessible loading announcements.
- Accessible failure and no-match states.
- Status communicated without color alone.
- Accessible selection controls.
- Minimum 44px interactive target consistent with existing repository standards.
- Reduced-motion support.
- Screen-reader-friendly explanation text.
- No information conveyed only through decorative icons.

Matching progress must not depend on animation alone.

## 27. Responsive Behavior

### Mobile

Prioritize:

1. Job context.
2. Matching state.
3. Ranked match cards.
4. Primary match action.
5. Recovery actions.

Use a single-column flow with thumb-accessible controls.

### Tablet

Use adaptive spacing and card layout while preserving the same information hierarchy.

### Desktop

Use the authenticated customer shell established by WEB-010 and WEB-011.

The match result surface may use a wider results layout where it improves comparison, but it must not introduce a separate visual language.

## 28. Content and Trust Rules

The interface should use precise operational language.

Preferred:

> We found BrainWorkers who may be a good fit for your request.

Not:

> Your BrainWorker has been assigned.

Preferred:

> Select a BrainWorker to continue.

Not:

> Your BrainWorker has accepted the job.

Preferred:

> Matching is still in progress.

Not:

> We have notified professionals and are waiting for responses.

unless the underlying production capability actually supports that statement.

## 29. Security and Privacy

The implementation must:

- Enforce authenticated customer access to customer-specific matches.
- Treat route parameters as untrusted.
- Avoid sensitive information in URLs.
- Validate job context server-side when backend integration exists.
- Avoid exposing another customer's request.
- Avoid exposing private BrainWorker verification information.
- Avoid internal ranking and risk data.
- Safely render customer-entered text.
- Avoid storing sensitive authentication data in client state.
- Preserve safe return destinations through authentication.

The mock implementation must not weaken these production boundaries merely because its data source is local or deterministic.

## 30. Performance

The experience should:

- Render the application shell quickly.
- Use stable loading placeholders.
- Avoid unnecessary client-side recalculation of ranking data.
- Avoid layout shifts.
- Keep result filtering and interaction responsive.
- Avoid loading large unrelated datasets.
- Allow the future production service to paginate or limit results without redesigning the core UI.

## 31. Edge Cases

The implementation must account for:

1. Job reference missing.
2. Invalid job reference.
3. Expired job context.
4. Job belongs to another customer.
5. Job is not eligible for matching.
6. Job has no category.
7. Job uses "I'm not sure".
8. Job has no budget.
9. Job has flexible budget.
10. Job has no preferred BrainWorker.
11. Preferred BrainWorker is unavailable.
12. No eligible BrainWorkers.
13. Multiple eligible BrainWorkers.
14. Candidate has incomplete optional public information.
15. Matching request still processing.
16. Matching service failure.
17. Partial result failure.
18. Offline client.
19. Session expiry.
20. Invalid return path.
21. Repeated selection action.
22. Selection persistence failure.
23. Very long customer description.
24. Unsafe customer-provided markup.
25. Small-screen viewport.
26. Keyboard-only navigation.
27. Screen-reader navigation.
28. Reduced-motion preference.

Undefined edge cases must fail safely and must not silently create new product rules.

## 32. QA Requirements

### Functional

Verify:

- Valid job context loads.
- Job context is displayed correctly.
- Matching states are distinct.
- Ranked results render correctly.
- Match explanations render only when supported.
- BrainWorker profile continuity works.
- Selection/interest action behaves according to the supported contract.
- No-match recovery works.
- Retry works after failure.
- WEB-011 links into WEB-012 correctly.
- WEB-009 request context is preserved.
- WEB-008 authentication handoff works.

### Data integrity

Verify that no mock failure becomes success and no unsupported operational state is fabricated.

### Accessibility

Verify keyboard navigation, focus, semantic structure, announcements, status communication, contrast, touch targets, and reduced-motion behavior.

### Responsive

Verify mobile, tablet, and desktop layouts without normal horizontal scrolling.

### Security/privacy

Verify authenticated boundaries, safe URL handling, safe rendering, no sensitive BrainWorker/customer data exposure, and safe return paths.

### Technical

- Tests pass.
- Type-check passes.
- Lint passes.
- Production build passes.
- Vercel preview reaches Ready.
- Relevant routes return successfully.
- No new runtime/deployment errors are introduced.

## 33. Success Criteria

WEB-012 succeeds when an authenticated customer can:

1. Open matching for a valid job request.
2. Understand the request being matched.
3. See suitable BrainWorkers in a coherent ranked order.
4. Understand why candidates are relevant.
5. Review relevant public professional information.
6. Distinguish a match from an assignment.
7. Select or express interest without false confirmation.
8. Understand when no suitable match exists.
9. Recover from failure and degraded states.
10. Return to the originating activity.
11. Use the experience on mobile and desktop.
12. Use the experience with keyboard and assistive technology.
13. Trust that private customer and BrainWorker information remains protected.

## 34. Definition of Done

WEB-012 is complete only when:

- Product specification is approved.
- Design brief is approved.
- Production-relevant domain contracts are defined.
- Mock matching adapter is implemented behind a stable interface.
- Required states are implemented and tested.
- WEB-009 and WEB-011 continuity works.
- Accessibility requirements pass.
- Security/privacy requirements pass.
- Tests pass.
- Type-check passes.
- Lint passes.
- Production build passes.
- Vercel preview passes.
- Independent implementation review is completed.
- PR is merged.
- Production deployment is verified.
- No unsupported operational claims remain.
- No mock data failure is represented as success.

## 35. Assumptions

### ASSUMPTION 1: Exact route

The canonical customer-facing route is not yet locked. The design brief must confirm the route against current repository conventions.

### ASSUMPTION 2: Selection lifecycle

The product direction permits customer selection or expression of interest, but the exact transition into BrainWorker acceptance and booking is not yet defined by WEB-012. The specification therefore does not claim that selection creates a booking.

### ASSUMPTION 3: Match freshness

The exact production freshness/expiry model for matching results is not yet established. The UI must therefore avoid implying real-time freshness unless the underlying contract supplies it.

### ASSUMPTION 4: Result count

The maximum number of match candidates displayed initially is not locked. The design brief should determine a practical presentation limit while keeping the domain contract extensible.

## 36. Open Risks

1. Broad projects may produce weaker structured matching signals.
2. "I'm not sure" requests require robust skill inference in the future matching domain.
3. Budget semantics may differ across service types.
4. Location precision may vary between requests.
5. Availability data may become stale.
6. Verification state may change after a match is generated.
7. Ranking logic may evolve as marketplace data accumulates.
8. Customer selection may require a more detailed acceptance lifecycle.
9. Real-time notifications may change the appropriate post-selection state.
10. Payment and booking lifecycle integration will introduce additional states later.

These risks do not block the current product specification because the customer-facing contract explicitly separates match results from later marketplace execution.

## 37. Source Authority

WEB-012 implementation and design decisions must follow:

1. Approved WEB-012 Product & UX Specification.
2. Approved WEB-012A Design Brief.
3. `DESIGN.md` Design System v1.0.
4. ARCH-002 production-first contract decisions.
5. WEB-011 customer activity model.
6. WEB-009 job creation model.
7. WEB-008 authentication/session behavior.
8. WEB-005 BrainWorker profile behavior.
9. WEB-006 service discovery behavior.
10. Repository security, accessibility, QA, and deployment baselines.

Lower-level material must not override a higher-level approved requirement.

## 38. Approval Gate

This specification does not authorize implementation.

Required sequence:

```text
WEB-012 Product & UX Specification
            ↓
Independent Product Review
            ↓
WEB-012A Design Brief
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

**Current status: READY FOR INDEPENDENT PRODUCT REVIEW.**
