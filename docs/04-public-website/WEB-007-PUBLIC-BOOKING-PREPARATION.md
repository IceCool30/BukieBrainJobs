# WEB-007: Public Booking Preparation & Intake Flow

**Document ID:** WEB-007  
**Version:** 1.0  
**Status:** Approved  
**Product Area:** Public Website  
**Route:** `/book`  
**Primary User:** Customer  
**Experience:** Responsive web, mobile-first  
**Implementation Model:** Mock-data-first  
**Dependencies:** WEB-004, WEB-005, WEB-006, Design System v1.0

## 1. Purpose

WEB-007 defines the public booking preparation and intake experience that begins after a customer has discovered a service or BrainWorker.

The flow turns customer intent into a structured booking request containing the service, location, schedule, job details, starting-price context, preferred BrainWorker context where applicable, and payment preference.

This is a booking preparation and intake experience, not the complete production booking, payment, matching, or account system.

## 2. Product Context

The established customer journey is:

```text
Homepage
    ↓
Service Discovery
    ↓
Service Detail
    ↓
BrainWorker Profile
    ↓
Booking Preparation
    ↓
Authentication
    ↓
Payment
    ↓
Booking Confirmation
```

Guests can discover services and BrainWorkers without authentication. Authentication belongs at the booking commitment point in the eventual production flow.

WEB-007 sits between public discovery and the account-backed booking process. WEB-004, WEB-005, and WEB-006 provide the preceding handoff contexts.

## 3. Problem

A customer who has found a suitable service or BrainWorker needs a clear way to describe the actual job before committing. WEB-007 provides one guided experience for location, scheduling, job details, payment preference, and final review.

## 4. Goals

1. Preserve context from the preceding discovery journey.
2. Clearly communicate the selected service and starting-price information.
3. Capture useful Nigerian location context, including landmarks.
4. Support realistic scheduling preferences.
5. Prevent invalid or incomplete submissions.
6. Provide clear validation and failure feedback.
7. Preserve entered information after simulated submission failure.
8. Produce a clear confirmation state in the mock experience.
9. Maintain accessibility across the complete interaction.
10. Establish a frontend contract that can later connect to a production booking service.

## 5. Non-Goals

WEB-007 does not implement:

- Real payment processing
- Paystack integration
- Flutterwave integration
- Card tokenization
- Bank-transfer processing
- USSD processing
- Database persistence
- Production booking records
- Real BrainWorker matching
- Real-time dispatch
- Socket communication
- In-app messaging
- Production authentication enforcement
- Customer KYC
- Payment webhooks
- Escrow processing
- Production notifications
- Dispute resolution

## 6. Target User

The primary user is a Nigerian customer who has discovered a service or BrainWorker and wants to request the service.

The customer may be a first-time visitor, returning customer, or visitor arriving from service discovery, a service-detail page, or a BrainWorker profile.

## 7. Entry Points

### Service Detail

A service-detail CTA may hand off service, starting-price, and city context to `/book`.

### BrainWorker Profile

A BrainWorker profile CTA may hand off service, starting-price, city, and preferred-worker context to `/book`.

### Direct Entry

The route must tolerate `/book` without query parameters. Missing context must not cause a crash or create misleading service or price information.

## 8. URL Handoff Contract

Supported query parameters:

| Parameter | Purpose | Required |
|---|---|---|
| `service` | Selected service or category | No |
| `price` | Starting-price context | No |
| `city` | Selected city | No |
| `worker` | Preferred BrainWorker context | No |
| `note` | Optional pre-populated job note | No |
| `mockError` | Development and test failure simulation | No |

All query values are untrusted input and must be normalized and validated before presentation or use.

## 9. Context Validation

### Service

If `service` matches a canonical supported service or category, use it. Invalid service context must fail safely and must not be presented as real.

### City

If `city` matches an active marketplace location, use it. Invalid, unrecognized, missing, or inactive city context must not silently redirect the customer to another city.

Controlled activation must be respected. The booking experience must not imply that every Nigerian capital is immediately live.

### Worker

If `worker` is valid, display it as preferred BrainWorker context only. It must never imply that the BrainWorker has already been assigned or booked.

### Price

Incoming price is starting-price context. It must not be presented as a final guaranteed price unless a later canonical pricing specification explicitly establishes that behavior.

## 10. Core UX Flow

```text
Customer enters /book
        ↓
Review service context
        ↓
Confirm location
        ↓
Enter address
        ↓
Enter landmark or estate-gate information
        ↓
Choose date
        ↓
Choose arrival window
        ↓
Describe job
        ↓
Choose payment preference
        ↓
Review booking summary
        ↓
Submit booking request
        ↓
Mock processing
        ↓
Confirmation
```

The flow should feel like one coherent task rather than unrelated forms.

## 11. Information Architecture

The experience is organized into:

1. Service
2. Location
3. Schedule
4. Job details
5. Payment preference
6. Booking summary
7. Confirmation

The established booking form hierarchy is:

```text
Service
    ↓
Location
    ↓
Date & Time
    ↓
Additional Details
    ↓
Price Summary
    ↓
Continue
```

WEB-007 adds payment preference as preparation for the later payment journey.

## 12. Service Context

Display where available:

- Service name
- Starting price
- Preferred BrainWorker
- Relevant service context

If no preferred BrainWorker exists, do not render an empty worker section.

If service context is missing, render a neutral recovery state rather than inventing a service or price.

## 13. Location

The customer must provide the service location.

### Required

- City
- Street address

### Optional

- Landmark
- Estate-gate description

Whitespace-only address input is invalid.

The location experience must support Nigerian address patterns without requiring map functionality for this slice.

## 14. Schedule

The customer can communicate a preferred service date and arrival window.

Date concepts include:

- Today
- Tomorrow
- Weekend
- Specific date

Arrival windows include:

- Morning
- Afternoon
- Evening

Invalid or past dates must be rejected. Exact calendar policy beyond these defined concepts remains an implementation assumption until a scheduling specification establishes it.

## 15. Job Details

The customer provides a natural-language description of the task or problem.

The field should support practical customer language, for example:

```text
My generator starts but stops after a few minutes.
Please check the fuel system and electrical connections.
```

Whitespace-only job descriptions are invalid. Reasonable length limits must protect the interface and future backend boundary without inventing unsupported product restrictions.

## 16. Payment Preference

Supported choices:

- Card
- Bank Transfer
- USSD

This is a preference selection only. No payment transaction occurs during WEB-007.

The interface must never imply that a card was charged, a transfer was initiated, or a USSD transaction was completed.

## 17. Booking Summary

The final review should display, where available:

- Service
- Starting price
- Preferred BrainWorker
- City
- Address
- Landmark
- Date
- Arrival window
- Job description
- Payment preference

Starting-price context must remain clearly distinguishable from a final price.

## 18. Primary Action

The primary action submits the prepared booking request. The final copy may be refined during UI and content design, but it must not imply payment.

The action must be visually primary, keyboard accessible, touch friendly, and provide an accessible pending state.

## 19. Navigation

The customer must have a clear route back to discovery. Useful service, category, city, and preferred-worker context should be preserved where applicable.

The customer must not lose relevant context unnecessarily when returning to discovery.

## 20. Authentication Boundary

Existing product decisions establish guest discovery and authentication at the booking commitment point.

WEB-007 remains mock-first and does not introduce production authentication enforcement solely to simulate the later stage.

The eventual production sequence is:

```text
Booking preparation
        ↓
Customer commitment
        ↓
Authentication
        ↓
Payment
        ↓
Production booking confirmation
```

## 21. Submission Model

Submission is deterministic and mock-based.

Success path:

```text
Draft
  ↓
Validating
  ↓
Submitting
  ↓
Success
```

Failure path:

```text
Draft
  ↓
Validating
  ↓
Submitting
  ↓
Failure
  ↓
Retry
```

No permanent booking record is created.

`mockError=1` must produce a deterministic failure state for testing.

## 22. Success State

The confirmation state must clearly communicate that the request was successfully prepared in the mock experience. It must not falsely claim a production booking, payment, worker assignment, or dispatch.

The confirmation should show the relevant booking summary and provide a clear return action.

## 23. Error and Failure Handling

Validation errors and mock/system failures must be distinguishable.

Submission failure must preserve entered draft information and provide retry.

Rapid repeated submission must not create duplicate mock submissions.

Offline browser state should fail safely and preserve the draft where possible.

## 24. Accessibility

The complete flow targets WCAG 2.2 AA.

Requirements:

- All interactive controls are keyboard accessible.
- Interactive controls meet the 44px minimum target.
- Focus states are visible.
- Form controls have accessible labels.
- Validation uses appropriate `aria-invalid` and `aria-describedby` relationships.
- Focus moves to the first invalid control when validation blocks submission.
- Confirmation moves focus appropriately for assistive-technology users.
- Reduced-motion preferences are respected.
- Contrast must meet the approved accessibility baseline.

## 25. Responsive Requirements

The complete experience must work on:

- Mobile
- Tablet
- Desktop
- PWA viewports

Mobile uses a single-column flow. Tablet and desktop may use adaptive layouts, including an optional form and summary split on larger screens.

No horizontal scrolling should be required for normal use.

## 26. Design System Requirements

WEB-007 uses the locked BukieBrainJobs Design System v1.0.

The experience must use:

- Deep Navy for primary/action treatment
- Emerald as strategic emphasis
- Approved typography
- Approved spacing
- Approved grid and layout
- Approved component library
- Approved iconography
- Approved motion principles
- Approved accessibility standards

No new foundational design rules may be introduced by WEB-007.

## 27. Mock Data Boundary

WEB-007 consumes existing canonical mock data for services, locations, starting-price context, and BrainWorker context where available.

The conceptual boundary is:

```text
Booking UI
    ↓
Booking service interface
    ↓
Mock implementation
```

The later production boundary can replace the mock implementation without redesigning the user experience.

## 28. Mock Booking Draft

```text
BookingDraft

service
priceContext
city
worker
streetAddress
landmark
date
arrivalWindow
jobDescription
paymentPreference
```

This is a draft request model, not a production booking entity. No permanent identifier, payment transaction, assignment, or database record is required.

## 29. User Stories

- As a customer, I want to review the service I selected so I know what I am requesting.
- As a customer, I want to provide my service location so the professional knows where the work will happen.
- As a customer, I want to add a landmark so the professional can find the location more easily.
- As a customer, I want to select a date and arrival window so I can communicate when I need the service.
- As a customer, I want to describe the job so the professional understands what I need.
- As a customer, I want to choose a preferred payment method so I know how I intend to pay later.
- As a customer, I want to review my request before submitting it so I can catch mistakes.
- As a customer, I want my information preserved when submission fails so I do not have to fill out the form again.
- As a customer using assistive technology, I want validation and confirmation states announced clearly so I can complete the flow independently.

## 30. Success Metrics

Primary metric:

**Completed booking-intake submissions**

For the mock-first implementation, the equivalent measurable outcome is a successful mock booking preparation submission.

Secondary metrics may include:

- Form-start rate
- Validation-error rate
- Completion rate by step
- Back-to-services rate
- Mock submission failure rate
- Mobile completion rate
- Preferred-worker selection rate

Analytics implementation is not required for this slice unless an existing analytics contract already exists.

## 31. Acceptance Criteria

### Entry and Context

1. `/book` renders safely without query parameters.
2. Valid service, price, city, and worker parameters hydrate appropriate context.
3. Invalid query parameters do not crash the interface.
4. Invalid or inactive cities do not silently redirect to another city.

### Form

5. The customer can provide a valid city.
6. The customer can provide a street address.
7. The customer can provide a landmark or estate-gate description.
8. The customer can select a valid service date.
9. The customer can select an arrival window.
10. The customer can provide meaningful job details.
11. The customer can select a payment preference.

### Validation

12. Empty required fields produce clear inline errors.
13. Whitespace-only address or job-description input is rejected.
14. Errors are associated with relevant controls.
15. Focus moves appropriately to the first invalid control.
16. Correcting an invalid field clears its relevant error.

### Submission

17. A valid form enters a visible pending state.
18. Duplicate submission is prevented while pending.
19. Successful mock submission produces an accessible confirmation state.
20. Confirmation displays the relevant booking summary.
21. `mockError=1` produces a deterministic failure state.
22. Failure preserves entered draft information.
23. Retry is available after submission failure.

### Navigation

24. The customer can return to service discovery.
25. Relevant service, category, and city context is preserved where applicable.
26. Preferred BrainWorker context is displayed without implying assignment.

### Accessibility

27. All interactive controls are keyboard accessible.
28. All interactive controls meet the 44px minimum target.
29. Focus states are visible.
30. Form controls have accessible labels.
31. Validation uses appropriate `aria-invalid` and `aria-describedby` relationships.
32. Confirmation moves focus appropriately for assistive-technology users.
33. The interface targets WCAG 2.2 AA.

### Responsive

34. The complete flow works on mobile.
35. The complete flow works on tablet.
36. The complete flow works on desktop.
37. No horizontal scrolling is required for normal use.

### Mock-first boundary

38. No real payment transaction occurs.
39. No production booking record is persisted.
40. No real BrainWorker is assigned.
41. No production matching occurs.
42. No production authentication system is introduced solely for this slice.

## 32. Edge Cases

The implementation must account for:

1. Missing service.
2. Invalid service.
3. Missing price.
4. Malformed price.
5. Missing city.
6. Invalid city.
7. Inactive city.
8. Missing worker.
9. Invalid worker context.
10. Very long query parameters.
11. Encoded query values.
12. Empty query values.
13. Whitespace-only form fields.
14. Invalid date.
15. Past date.
16. Missing arrival window.
17. Rapid repeated submission.
18. Submission failure.
19. Offline browser state.
20. Browser back navigation.
21. Refresh during form completion.
22. Small-screen layout.
23. Keyboard-only navigation.
24. Screen-reader navigation.
25. Reduced-motion preference.

Any edge case not explicitly defined must fail safely and preserve user data where possible. It must not invent a new product rule.

## 33. Out-of-Scope Future Enhancements

Defer:

- Exact appointment-time selection
- Live availability calendars
- Real BrainWorker availability
- Automated matching
- Real-time dispatch
- Customer account persistence
- Saved addresses
- Map-based address selection
- Payment gateway integration
- Wallet
- Escrow
- Booking modifications
- Booking cancellation
- Messaging
- Push notifications
- Production analytics
- Customer KYC
- Risk scoring

## 34. Dependencies

Existing dependencies:

- WEB-004 service-detail handoff
- WEB-005 BrainWorker-profile handoff
- WEB-006 service-discovery handoff
- Existing mock service data
- Existing Nigerian location data
- Existing validation package
- Existing design system
- Existing component and test infrastructure

Required before implementation:

- Approved WEB-007 Product & UX Specification
- Approved WEB-007 Design Brief
- WEB-007 decision-log registration
- Human approval of final design requirements

## 35. Implementation Boundary

Once the design gate is approved, engineering is limited to the WEB-007 booking preparation experience.

Expected areas include:

```text
apps/web/app/book/
apps/web/components/BookingScreen.tsx
packages/validation/
```

The existing booking prototype may be refactored if compatible with this specification.

Tests should cover validation, query hydration, component behavior, error states, success states, accessibility interactions, and responsive behavior where practical.

Canonical service and location data must not be changed as part of WEB-007 unless separately approved.

## 36. QA Requirements

Before WEB-007 is complete, verify:

### Product

- Correct service context
- Correct location context
- Correct schedule flow
- Correct job-detail flow
- Correct payment-preference behavior
- Correct confirmation state

### UX

- Clear progression
- No unnecessary fields
- No confusing commitment language
- Clear error recovery
- Draft preserved after failure

### Accessibility

- Keyboard completion
- Screen-reader labels
- Error associations
- Focus management
- Touch targets
- Contrast
- Reduced motion

### Responsive

- Mobile
- Tablet
- Desktop
- PWA viewport behavior

### Security

- Query parameters treated as untrusted input
- No unsafe redirects
- No sensitive data exposed
- No payment secrets
- No false production state

### Regression

WEB-004, WEB-005, and WEB-006 journeys must continue to reach `/book` correctly.

## 37. Definition of Done

WEB-007 is complete only when:

1. Product specification is approved.
2. Design brief is approved.
3. Implementation matches the approved specification.
4. Mock booking flow works end-to-end.
5. Query handoffs from WEB-004, WEB-005, and WEB-006 work.
6. Validation works.
7. Error recovery works.
8. Confirmation works.
9. Accessibility requirements pass.
10. Responsive requirements pass.
11. Existing product journeys do not regress.
12. Required tests pass.
13. Security review passes.
14. No real payment, persistence, matching, or production authentication is introduced outside scope.
15. Final implementation is reviewed before merge.

## 38. Assumptions

### ASSUMPTION 1: Exact final CTA wording

The action must clearly submit a booking request, but final production wording can be refined during UI and content design.

### ASSUMPTION 2: Exact field length limits

Reasonable validation bounds are required, but the canonical product material does not establish exact limits for address, landmark, and job details.

### ASSUMPTION 3: Exact date rules

The source defines Today, Tomorrow, Weekend, and Specific Date, but does not establish every calendar rule.

### ASSUMPTION 4: Payment preference requirement

Payment preference is included in booking preparation, while actual payment remains outside scope.

### ASSUMPTION 5: Direct `/book` default behavior

The route must tolerate direct entry without inventing a misleading service or price. Exact recovery presentation belongs to the design brief.

## 39. Open Risks

### Risk 1: Authentication timing

The broader product requires authentication at the booking commitment point, while this slice remains mock-first. Production booking and authentication specifications must reconcile the final transition explicitly.

### Risk 2: Pricing

Starting-price context is available, but final pricing is not implemented. UI language must avoid presenting a starting price as a final quote.

### Risk 3: Marketplace availability

Controlled activation means not every capital is necessarily live. Booking preparation must not assume nationwide live coverage.

### Risk 4: Prototype divergence

`BookingScreen.tsx` already contains prototype behavior. The approved specification is the product authority and the prototype must not silently override it.

### Risk 5: Production integration

The mock booking contract should be structured so a later production API can replace the mock implementation without redesigning the experience.

## 40. Status and Approval

**Product scope:** Defined  
**Primary user:** Defined  
**Core journey:** Defined  
**Entry points:** Defined  
**URL contract:** Defined  
**Form structure:** Defined  
**Validation behavior:** Defined  
**Submission states:** Defined  
**Confirmation:** Defined  
**Error recovery:** Defined  
**Accessibility:** Defined  
**Responsive behavior:** Defined  
**Mock boundary:** Defined  
**Out of scope:** Defined  
**Acceptance criteria:** Defined  
**Implementation boundary:** Defined  
**Assumptions:** Explicitly documented  
**Open risks:** Explicitly documented

**Status: Approved for Design Brief**

Approval sequence:

```text
WEB-007 Product & UX Specification
            ↓
Human approval
            ↓
WEB-007 Design Brief
            ↓
Human design approval
            ↓
Antigravity implementation
            ↓
QA
            ↓
PR review
            ↓
Merge
```

No production backend, payment integration, authentication enforcement, matching, or database persistence may be introduced under WEB-007 without a separate approved requirement.
