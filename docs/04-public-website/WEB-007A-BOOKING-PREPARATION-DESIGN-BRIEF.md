# WEB-007A: Public Booking Preparation & Intake Design Brief

**Document ID:** WEB-007A  
**Version:** 1.0  
**Status:** Approved  
**Product Area:** Public Website  
**Route:** `/book`  
**Primary User:** Customer  
**Parent Specification:** WEB-007  
**Design System:** DESIGN.md, v1.0

## 1. Purpose

This brief translates the approved WEB-007 Product & UX Specification into a screen-level design direction for human review.

It defines hierarchy, layout, component treatment, responsive behavior, states, and interaction expectations. It does not change WEB-007 product behavior or introduce new design-system foundations.

## 2. Design Authority

- `DESIGN.md` is the visual source of truth.
- WEB-007 is the feature behavior authority.
- This brief is subordinate to both.
- No new foundational colors, typography, spacing scale, radii, component primitives, or motion rules are introduced here.

The established design language is Corporate Modern with Premium Minimalism: controlled whitespace, high-contrast surfaces, Deep Navy structure, restrained Emerald emphasis, and clear functional hierarchy.

## 3. Primary Design Objective

Make `/book` feel like one calm, trustworthy preparation task rather than a long administrative form.

The customer should understand, in order:

1. What service they are requesting.
2. Where the work will happen.
3. When they want it.
4. What the BrainWorker needs to know.
5. How they prefer to pay later.
6. What they are about to submit.

The interface must never make a mock preparation request look like a completed paid booking.

## 4. Page Structure

Desktop composition:

```text
Global page header
        ↓
Booking page title + concise supporting copy
        ↓
┌──────────────────────────────┬─────────────────────┐
│ Booking preparation form     │ Booking summary     │
│                              │                     │
│ Service                      │ Service             │
│ Location                     │ Starting price      │
│ Schedule                     │ Preferred worker    │
│ Job details                  │ Location            │
│ Payment preference            │ Schedule            │
│                              │ Job details         │
│ Primary submit action        │ Payment preference  │
└──────────────────────────────┴─────────────────────┘
        ↓
Supporting return-to-discovery action
```

Mobile composition:

```text
Header
  ↓
Title + supporting copy
  ↓
Service context
  ↓
Location
  ↓
Schedule
  ↓
Job details
  ↓
Payment preference
  ↓
Booking summary
  ↓
Primary submit action
  ↓
Return to discovery
```

On mobile, the summary should remain close to the submission decision. Do not force the customer to navigate to another page merely to review the request.

## 5. Header

Use the existing public-site header pattern. Do not create a separate booking-specific navigation system.

The header should provide brand continuity and a clear route back toward discovery where the existing site pattern supports it.

## 6. Page Introduction

Use a concise H1 communicating preparation rather than payment.

Recommended direction: **Prepare your service request**.

Supporting copy should explain that the customer is providing the details needed to arrange the service. Avoid claims that imply immediate worker assignment or payment completion.

H1 uses the approved headline hierarchy and Deep Navy.

## 7. Service Context Card

Purpose: reassure the customer that the selected service and handoff context were preserved.

Display where available:

- Service name
- Starting price
- Preferred BrainWorker, when supplied

Treatment:

- White card surface
- Approved border treatment
- Large approved card radius
- Clear label/value hierarchy
- Starting price visually prominent but explicitly labeled as a starting price
- Preferred worker shown as context, not assignment

If context is missing, show a neutral recovery treatment with a clear route back to service discovery. Never show placeholder names or invented prices.

## 8. Form Sections

### 8.1 Location

Section heading should be clear and task-oriented.

Fields:

- City, required
- Street address, required
- Landmark or estate-gate description, optional

Use the approved input pattern from DESIGN.md: label above field, 1px border, 1rem radius, Deep Navy focus treatment, visible focus state.

For Nigerian address use cases, supporting helper text may clarify that landmarks and estate gates are useful for locating the property. Keep helper copy short.

### 8.2 Schedule

Fields:

- Preferred date
- Arrival window

Date options should make Today, Tomorrow, Weekend, and Specific date easy to understand without creating a visually dense calendar experience.

Arrival windows should use the established radio or selection treatment. The active selection uses the approved Emerald positive-selection treatment.

### 8.3 Job Details

Use a generous multiline field because practical descriptions may contain symptoms, constraints, or instructions.

Recommended placeholder direction:

`Tell the BrainWorker what you need help with.`

Do not use placeholder text as the only field label or instruction.

### 8.4 Payment Preference

Present Card, Bank Transfer, and USSD as mutually understandable preference choices.

Explicit supporting copy should state that this is a payment preference for the later payment step and that no payment is taken here.

Use circular radio controls where the selection is single-choice.

## 9. Booking Summary

The summary is a review surface, not a second editable form.

Display:

- Service
- Starting price
- Preferred BrainWorker, when available
- City
- Address
- Landmark, when available
- Date
- Arrival window
- Job description
- Payment preference

Use strong hierarchy for the most decision-relevant information and compact secondary rows for supporting details.

The starting-price row must retain explicit language distinguishing it from a final price.

## 10. Primary Action

The primary action should be visually dominant and positioned after the customer has completed the preparation information.

Recommended copy direction: **Submit service request**.

Do not use labels such as `Pay now`, `Complete payment`, `Book and pay`, or wording that implies a confirmed assignment.

Use the existing primary button treatment from DESIGN.md: Deep Navy, white text, pill-shaped, no new button variant.

The action must have a visible pending state and must not allow duplicate submission.

## 11. Return-to-Discovery Action

Provide a clear secondary route back to service discovery.

Use the existing secondary button or text-link pattern rather than introducing a new navigation component.

Where context permits, preserve service/category/city query context.

## 12. Validation Presentation

Validation should be local, immediate enough to be useful, and visually subordinate to the task itself.

Requirements:

- Keep labels visible.
- Place concise error text close to the invalid control.
- Use the approved semantic error treatment.
- Associate errors with their controls.
- Do not rely on color alone.
- On blocked submission, focus the first invalid control.
- Correcting a field removes its relevant error.

Avoid large generic error banners when a field-level explanation is sufficient. A page-level message may be used for submission-level failure.

## 13. Submission Failure State

When mock submission fails:

- Preserve every entered value.
- Keep the customer on the page.
- Explain that the request could not be submitted in the current attempt.
- Provide a clear retry action.
- Do not suggest payment failure when no payment occurred.

The failure treatment should use the approved semantic error style and remain visually calm.

## 14. Loading State

During submission:

- Disable the primary submit action.
- Show an accessible pending indicator or status.
- Prevent repeated submission.
- Keep the form context visible.
- Do not replace the entire page with a blocking spinner unless required by the existing component system.

## 15. Confirmation State

Successful mock preparation should transition to a focused confirmation surface.

Structure:

```text
Success indicator
      ↓
Confirmation heading
      ↓
Concise explanation of what was prepared
      ↓
Booking summary
      ↓
Clear next/return action
```

The copy must accurately communicate mock preparation. It must not claim that:

- payment was completed
- a BrainWorker was assigned
- dispatch has started
- a production booking record exists

Move focus to the confirmation heading or equivalent accessible landmark.

## 16. Missing or Invalid Context

If service context is missing or invalid, the page should remain stable and explain what is missing.

Preferred recovery pattern:

```text
Neutral context state
        ↓
Short explanation
        ↓
Return to services
```

Do not fabricate a service, price, worker, or location.

If the city is invalid or inactive, explain that the selected location is unavailable and provide a route to choose another active location. Do not silently substitute a city.

## 17. Responsive Design

### Mobile, below 768px

- Single-column layout.
- 20px page margins.
- Full-width primary action where practical.
- Form fields sized for touch.
- Minimum 44px interactive target.
- Avoid side-by-side fields when they create cramped controls.
- Summary follows the form.

### Tablet, 768px to 1024px

- Use the approved 8-column grid and 32px margins.
- Maintain comfortable field widths.
- Summary may remain below the form or move into an adaptive secondary column when space permits.

### Desktop, 1024px and above

- Use the approved fixed-grid approach.
- Maximum content width follows the 1280px container.
- Use 24px grid gutters.
- Prefer a primary form column with a narrower summary column.
- Keep the summary visually available without competing with the form.

No normal viewport should require horizontal scrolling.

## 18. Visual Hierarchy

Priority order:

1. Page purpose
2. Selected service
3. Required task inputs
4. Submission decision
5. Booking summary
6. Supporting context
7. Recovery and secondary actions

Use typography weight and spacing before color to establish hierarchy, consistent with DESIGN.md.

Emerald should remain restrained and strategic. It may signal valid selection, success, or another approved positive state, but must not become the dominant page color.

## 19. Component Usage

Prefer existing project components and established patterns for:

- Header
- Buttons
- Inputs
- Textareas
- Radio controls
- Cards
- Status messages
- Form errors
- Loading indicators

Do not introduce a new component primitive when an existing approved component can satisfy the requirement.

## 20. Interaction and Motion

Interactions should be subtle and purposeful.

Permitted direction:

- Small state transitions for selection and validation.
- Subtle loading transition.
- Calm confirmation transition.

Respect reduced-motion preferences.

Do not introduce decorative animation that competes with form completion.

## 21. Accessibility

Target WCAG 2.2 AA as required by WEB-007.

Design review must verify:

- Keyboard completion from start to finish.
- Visible focus states.
- Correct label/control relationships.
- Error relationships and announcements.
- Focus movement after blocked submission.
- Focus movement after successful confirmation.
- 44px minimum interactive targets.
- Sufficient contrast.
- No information communicated by color alone.
- Logical heading hierarchy.
- Reduced-motion behavior.

## 22. Content Rules

Copy should be direct, human, concise, and professional.

Use Nigerian context naturally where it improves clarity, especially around addresses and payment preferences.

Avoid:

- Fake urgency
- Guaranteed worker assignment
- Guaranteed final price language
- Payment-complete language
- Technical implementation terminology in customer-facing copy
- Unnecessary legal or operational detail inside the form

## 23. Design States Required for Review

Human design review should cover at minimum:

1. Normal populated booking context.
2. `/book` with missing query context.
3. Invalid service context.
4. Invalid or inactive city.
5. Empty initial form.
6. Field validation errors.
7. Completed valid form before submission.
8. Submission pending.
9. Submission failure with preserved draft.
10. Successful mock confirmation.
11. Mobile layout.
12. Desktop layout.
13. Keyboard focus state.
14. Reduced-motion behavior where visually relevant.

## 24. Design Review Checklist

- [ ] WEB-007 behavior is preserved without reinterpretation.
- [ ] DESIGN.md visual rules are followed.
- [ ] Deep Navy remains the primary action color.
- [ ] Emerald remains restrained.
- [ ] Starting price is not presented as a guaranteed final price.
- [ ] Preferred BrainWorker is not presented as assigned.
- [ ] Payment preference is not presented as payment completion.
- [ ] The primary action does not imply payment.
- [ ] Missing and invalid context has a safe recovery path.
- [ ] Validation is understandable without relying on color alone.
- [ ] Mobile is single-column and touch-friendly.
- [ ] Desktop uses the approved container/grid.
- [ ] No horizontal scrolling is required.
- [ ] Accessibility requirements are represented in the design.
- [ ] No new foundational design rules were introduced.

## 25. Approval Gate

Status remains **In Review** until the human design review is complete.

Required sequence:

```text
WEB-007 Approved
      ↓
WEB-007A Design Brief In Review
      ↓
Human Design Review
      ↓
WEB-007A Approved
      ↓
Antigravity implementation
      ↓
Independent QA
```

Implementation of WEB-007 must not begin solely because this brief exists. The design approval gate remains mandatory.
