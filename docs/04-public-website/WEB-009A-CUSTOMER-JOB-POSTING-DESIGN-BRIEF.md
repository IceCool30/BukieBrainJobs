# WEB-009A: Customer Job Posting Design Brief

**Version:** 1.0  
**Status:** Draft, Ready for Agent Review  
**Product area:** Public Website  
**Related specification:** WEB-009 v1.1, Customer Job Posting & Request Creation Product & UX Specification  
**Route:** `/post-job`

## 1. Design Objective

Design the customer job posting experience as a dedicated, accessible, mobile-first flow for customers who want to describe work they need completed and submit a request for later review and matching.

The experience must make job posting feel straightforward without pretending that matching, assignment, payment, or booking has already occurred.

## 2. Design Principles

1. **Customer-first clarity:** Each step should answer what the customer needs to provide and why.
2. **Low-friction completion:** Keep the number of decisions and required fields low while collecting enough information for a useful request.
3. **Honest marketplace state:** The interface must distinguish request submission from matching, assignment, payment, and confirmed booking.
4. **Trust through context:** Show relevant service, location, schedule, budget, and preference information at review time.
5. **Progressive commitment:** Guests can begin and complete the form before authentication is required at submission.
6. **Recoverability:** Validation, authentication, submission failure, and restoration states must preserve user-entered information where possible.
7. **Design System consistency:** Use the locked Design System v1.0 without introducing new foundational visual rules.

## 3. Locked Design System Requirements

The implementation must follow `DESIGN.md` and the locked Design System v1.0.

- Primary/action color: Deep Navy `#001A41`.
- Emerald is a strategic emphasis/accent color, not the primary action color.
- Headlines: Hanken Grotesk.
- Body and labels: Inter.
- Mobile horizontal margin: 20px.
- Desktop maximum content width: 1280px.
- Desktop layout may use the approved 12-column grid.
- Use approved button, input, card, spacing, and radius patterns.
- Maintain WCAG 2.2 AA intent.
- Do not introduce new global colors, typography, component primitives, or visual language solely for WEB-009.

## 4. Entry Points and Route Context

Primary route: `/post-job`.

The flow must support direct navigation without requiring a previous discovery session.

Potential entry points include:

- Homepage primary or secondary job-posting CTA.
- Service discovery or category experiences.
- BrainWorker profile or service context where the customer decides to post a request instead.
- Direct `/post-job` navigation.

If context is supplied from another surface, it may prefill relevant fields only after normalization and validation. User-entered values remain authoritative.

## 5. Overall Flow

```text
/post-job
   |
   v
Job Requirement
   |
   v
Location
   |
   v
Schedule / Urgency
   |
   v
Budget / Rate
   |
   v
Review
   |
   v
Authentication Check
   |
   v
Submit Request
   |
   +----> Failure / Retry
   |
   v
Request Received
```

Authentication is required for final submission. Guest users may complete the form before that boundary.

## 6. Screen Inventory

| ID | Screen / State | Purpose |
| --- | --- | --- |
| PJ-01 | Job Requirement | Establish what work the customer needs |
| PJ-02 | Location | Capture city and service address |
| PJ-03 | Schedule / Urgency | Capture timing preference |
| PJ-04 | Budget | Capture optional budget preference |
| PJ-05 | Preferred BrainWorker | Optional worker preference |
| PJ-06 | Review | Confirm the request before submission |
| PJ-07 | Authentication Handoff | Require authentication while preserving the draft |
| PJ-08 | Restored Request | Return the authenticated user to the preserved draft |
| PJ-09 | Submission | Show request processing state |
| PJ-10 | Request Received | Confirm receipt with simulated reference code |
| PJ-11 | Validation Errors | Explain and recover from invalid fields |
| PJ-12 | Submission Failure / Offline | Preserve draft and provide retry/recovery |

## 7. PJ-01: Job Requirement

### Purpose

Collect the minimum information required to understand the customer's request.

### Content

- Job type:
  - Specific service request.
  - Broader project.
- Category:
  - Optional but encouraged.
  - Include an explicit **I'm not sure** path.
- Job title: required.
- Job description: required.

### Interaction

The customer selects the type of work, optionally identifies a category, provides a concise title, and describes what they need.

The description should support plain-language input. Do not introduce category-specific questionnaires in v1.

### Validation

- Job type must be selected.
- Title must contain non-whitespace content.
- Description must contain non-whitespace content.
- Category may be empty or `I'm not sure`.

## 8. PJ-02: Location

### Required information

- City: required.
- Street address: required.
- Landmark: optional but encouraged.

### Design direction

Use clear labels and Nigerian location terminology. The city selection should align with the platform's activated-market model.

If the selected city is not an activated market, the interface must not imply that immediate fulfillment is available. The experience should use the established coming-soon / activation language where applicable.

### Validation

- City is required.
- Street address is required.
- Whitespace-only address is invalid.
- Landmark is optional.

Contact information must not be collected again. Authentication already provides the relevant account contact information.

## 9. PJ-03: Schedule / Urgency

Provide exactly these v1 choices:

- Urgent / Today.
- Tomorrow.
- Flexible / Within a week.
- Specific Date.

If **Specific Date** is selected, collect the preferred date.

An arrival window may be collected where supported by the approved WEB-009 product specification. The interface must clearly distinguish a preference from a guaranteed appointment time.

### Validation

- A schedule choice is required.
- Specific Date requires a valid date.
- Past dates must not be accepted.

## 10. PJ-04: Budget

Budget is optional and flexible in v1.

The UI should allow the customer to:

- Provide a budget range or amount where appropriate.
- Indicate that the budget is flexible.
- Continue without specifying a budget.

The design must not imply that a submitted budget is a final quote, locked price, payment authorization, or BrainWorker acceptance.

## 11. PJ-05: Preferred BrainWorker

The customer may optionally identify a preferred BrainWorker.

This preference is informational only. It must not be presented as:

- Assignment.
- Availability confirmation.
- Booking confirmation.
- Guaranteed matching.

If no worker is selected, the customer can continue normally.

## 12. PJ-06: Review

The review screen should present a compact, readable summary of the request before submission.

Recommended sections:

1. Job requirement.
2. Location.
3. Schedule.
4. Budget.
5. Preferred BrainWorker, if selected.

Each section should provide an obvious edit action that returns to the relevant step without losing the rest of the draft.

### Submission language

The primary action should communicate request submission, not payment or booking.

Use language consistent with **Request received** and avoid claims that a BrainWorker has been assigned or contacted unless that actually occurs in a future production implementation.

## 13. PJ-07: Authentication Handoff

Guest users may complete the request but must authenticate before final submission.

The handoff must:

- Explain why authentication is required.
- Preserve the complete `JobRequestDraft`.
- Support the existing WEB-008 authentication methods.
- Return the user to `/post-job` after authentication.
- Restore the draft without silently changing values.

The flow must not require the customer to re-enter contact information already associated with authentication.

## 14. PJ-08: Restored Request

After successful authentication, the user should see the preserved request and continue from the appropriate point.

The interface should make restoration explicit enough to reassure the user that their information was retained.

The customer must be able to edit restored values before submission.

## 15. PJ-09: Submission

Submission is a mock-first operation in v1.

Visual states:

- Ready.
- Validating.
- Submitting.
- Success.
- Failure.

The submission state must prevent accidental duplicate actions while processing.

No real payment, matching, dispatch, notification, database persistence, or production request creation is implied by this design brief.

## 16. PJ-10: Request Received

The confirmation screen must clearly state that the request was received.

It should include:

- Simulated reference code in the format `REQ-xxxxx`.
- Concise summary of the submitted request.
- Honest explanation that review and matching happen later.
- Appropriate next navigation, such as returning to the homepage or browsing services.

Do not claim:

- A BrainWorker has been assigned.
- A BrainWorker has accepted the request.
- Payment has been taken.
- A booking has been confirmed.
- A match has been completed.

## 17. PJ-11: Validation Errors

Validation should be local, specific, and recoverable.

Requirements:

- Identify the affected field.
- Use `aria-invalid` where applicable.
- Associate error text with the relevant input using `aria-describedby`.
- Move focus to the first invalid field after a failed validation submission where appropriate.
- Preserve all valid input.
- Avoid generic errors when a field-specific explanation is available.

## 18. PJ-12: Submission Failure / Offline

When submission fails:

- Preserve the draft.
- Explain that the request was not confirmed.
- Provide a retry action.
- Do not generate misleading confirmation language.
- Do not clear the completed form.

Offline or network failure states should be understandable without technical jargon.

## 19. Progress and Navigation

Use a clear step indicator on the multi-step flow.

The indicator should communicate current progress without requiring users to understand internal route names.

Navigation rules:

- Back returns to the previous step with data preserved.
- Continue validates the current step before advancing.
- Review allows edits.
- Final submission is distinct from intermediate Continue actions.

The browser back button should not unexpectedly discard the draft.

## 20. Responsive Behavior

### Mobile

- Single-column layout.
- 20px horizontal margins.
- Full-width primary actions where appropriate.
- Inputs and controls sized for touch.
- Progress remains visible without consuming excessive vertical space.
- Review content is scannable and stacked.

### Tablet

- Adaptive single or constrained two-column presentation where it improves readability.
- Preserve touch-friendly controls.

### Desktop

- Center the flow within the approved 1280px maximum content width.
- Use the approved 12-column grid where useful.
- Consider a form-and-summary composition on review without creating unnecessary density.

## 21. Component Direction

Reuse existing platform components and Design System patterns wherever possible.

Likely component categories include:

- Page shell.
- Step header / progress indicator.
- Text input.
- Textarea.
- Select / searchable location control.
- Radio or segmented choices.
- Date input.
- Optional budget control.
- Summary card.
- Inline validation message.
- Authentication handoff panel.
- Submission state.
- Confirmation panel.

Do not create a new design primitive unless an existing approved pattern cannot satisfy the requirement.

## 22. Content Direction

Copy should be:

- Direct.
- Plain-language.
- Specific about required versus optional information.
- Honest about marketplace state.
- Consistent with the BukieBrainJobs content style guide.

Avoid language that implies certainty where the system only records a preference or request.

## 23. Trust and Transparency

The design must preserve the distinction between:

**Customer action:** submitting a request.

**Platform action:** receiving and later reviewing the request.

**Future marketplace action:** matching or contacting BrainWorkers.

**Future transaction action:** payment, booking, escrow, or fulfillment.

Only the first two exist within this v1 mock-first experience.

## 24. Security-Aware UX

The design must treat route parameters, prefilled values, and restored draft data as untrusted input.

User-visible behavior must not expose sensitive information unnecessarily.

Do not expose internal identifiers, implementation details, or backend assumptions through the interface.

The UI must not imply that client-side state alone constitutes a trusted production request record.

## 25. Mock-First Boundary

WEB-009A is a design artifact for the mock-first product surface.

Out of scope for this design:

- Production database persistence.
- Real matching algorithms.
- BrainWorker bidding or chat.
- Notifications.
- Payment processing.
- Escrow.
- KYC or identity verification.
- Media or attachment storage.
- Production booking records.
- Real dispatch or assignment.

Attachments may be represented only as an optional **coming soon** indication if needed for expectation setting.

## 26. Interaction States

Every relevant input and action should have an intentional state for:

- Empty.
- Filled.
- Focused.
- Hovered where applicable.
- Disabled.
- Invalid.
- Valid.
- Loading.
- Submission in progress.
- Success.
- Failure.
- Offline where relevant.

## 27. Edge Cases

The design review should explicitly test the following cases:

1. Direct navigation to `/post-job`.
2. Guest completes all steps and is asked to authenticate at submission.
3. Authenticated customer enters `/post-job` directly.
4. User selects `I'm not sure` for category.
5. User skips optional budget.
6. User chooses flexible budget.
7. User skips landmark.
8. User selects Specific Date with an invalid or past date.
9. User uses whitespace-only title or description.
10. User uses whitespace-only address.
11. User returns to a previous step and edits data.
12. User authenticates and restores a draft.
13. User refreshes during the flow where draft restoration is supported.
14. Submission fails.
15. User retries after failure.
16. User loses connectivity during submission.
17. User attempts duplicate submission.
18. User enters malformed prefill values through URL parameters.
19. User selects a preferred BrainWorker without any assignment being guaranteed.
20. Selected city is not currently activated for public marketplace operation.

## 28. Accessibility Requirements

Target WCAG 2.2 AA intent.

Required design considerations:

- Keyboard accessibility.
- Visible focus states.
- Logical tab order.
- Semantic labels.
- Correct input associations.
- Screen-reader-friendly progress indication.
- Accessible error messaging.
- Adequate touch target sizing, targeting 44px minimum where applicable.
- Sufficient contrast using the locked Design System.
- No information conveyed by color alone.
- Reduced-motion-safe interaction where animation is introduced.

## 29. Design Quality Bar

WEB-009A is ready for implementation only when the reviewer can confirm that:

1. The complete customer journey is represented.
2. Every required WEB-009 field has a clear visual treatment.
3. Optional fields are visibly optional.
4. Job type supports both specific services and broader projects.
5. Category remains optional and includes `I'm not sure`.
6. Title and description are present without category-specific questions.
7. Location requirements are clear.
8. Schedule choices match the approved v1 rules.
9. Budget remains optional and flexible.
10. Preferred BrainWorker is clearly a preference only.
11. Review supports editing.
12. Authentication handoff preserves the draft.
13. Existing WEB-008 authentication patterns are respected.
14. Submission language does not imply payment or assignment.
15. Confirmation uses `Request received` semantics.
16. A simulated `REQ-xxxxx` reference is represented.
17. Failure preserves the draft.
18. Offline behavior is represented where relevant.
19. Accessibility states are designed, not left to implementation assumptions.
20. Mobile behavior is complete.
21. Desktop behavior is complete.
22. Empty, validation, loading, success, and failure states are covered.
23. The Design System is followed.
24. No new foundational visual rules are introduced.
25. Security-aware handling of untrusted prefill/state is respected.
26. Mock-first boundaries are visible in the design where needed.
27. Copy is direct and does not overpromise platform behavior.
28. The design does not require real backend functionality.
29. The implementation can proceed without major product assumptions.
30. No unresolved blocker remains against WEB-009 v1.1 or the locked Design System.

## 30. Design Review Checklist

The agent reviewer should evaluate WEB-009A against:

- WEB-009 v1.1 approved product requirements.
- `DESIGN.md` and Design System v1.0.
- WEB-008 authentication and account-access patterns.
- Approved artifact governance.
- Repository UX and accessibility standards.
- Security baseline.
- QA baseline.
- Mock-first architecture boundary.
- Existing public website patterns.

The reviewer must not implement code during this review.

### Required verdict

Return exactly one of:

**APPROVED FOR IMPLEMENTATION**

or

**CHANGES REQUIRED**

If changes are required, list each blocker with the relevant requirement and the specific correction needed.

## 31. Implementation Boundary

This document authorizes design review only.

It does **not** authorize application implementation.

Implementation may begin only after the agent review returns **APPROVED FOR IMPLEMENTATION** and the product architect explicitly authorizes the implementation stage.

## 32. Assumptions

- The existing WEB-008 authentication journey remains the source of truth for login and registration methods.
- The existing activated-market behavior remains authoritative for city availability messaging.
- The existing Design System v1.0 remains locked during WEB-009 implementation.
- The mock-first architecture remains the implementation boundary for this feature.

## 33. Open Risks

- Exact existing component availability may affect how closely the final screens map to the brief.
- Activated-market presentation may require reuse of the existing WEB-006 discovery state patterns.
- The final handling of browser refresh and session restoration must remain consistent with the approved implementation architecture.

## 34. Definition of Ready for Implementation

WEB-009A is Ready for Implementation only when:

- The agent has reviewed this brief.
- The agent has explicitly returned **APPROVED FOR IMPLEMENTATION**.
- No blocking design issue remains.
- The implementation boundary remains mock-first.
- The Design System remains unchanged unless a separate approved revision is created.
