# WEB-010A: Customer Dashboard & Authenticated Home Design Brief

**Version:** 1.0  
**Status:** Draft for Independent Agent Design Review  
**Feature:** WEB-010 Customer Dashboard & Authenticated Home  
**Target Surface:** Authenticated Customer Website / PWA, with native mobile journey equivalence  
**Implementation:** Not authorized until this design brief is independently reviewed and approved

## 1. Purpose

Define the screen-level visual, interaction, responsive, accessibility, and state behavior for the authenticated customer dashboard established by the approved WEB-010 Product & UX Specification.

The dashboard is the signed-in customer's operational home. It must feel like a natural continuation of the existing BukieBrainJobs product, not a second marketing homepage.

## 2. Source of Truth

Design and implementation decisions must follow this order:

1. Approved WEB-010 Product & UX Specification v1.0
2. This WEB-010A Design Brief once approved
3. `DESIGN.md` Design System v1.0
4. Existing WEB-008 authentication and marketplace contracts
5. Repository accessibility, security, QA, and mock-first baselines

No new foundational visual language may be introduced without an explicit Design System revision.

## 3. Product Intent

The authenticated dashboard should immediately answer:

- Where am I?
- What do I need to do next?
- What active or upcoming work do I have?
- How do I quickly find a service or post a job?

The strongest content priority belongs to active and upcoming customer work when it exists. When no activity exists, the dashboard should provide a useful first-run experience without fabricated metrics, bookings, requests, or activity.

## 4. Primary Screen Structure

### 4.1 Desktop

Use the locked 12-column desktop grid and maximum content width defined by `DESIGN.md`.

Structure:

1. Persistent authenticated sidebar
2. Main dashboard content area
3. Optional contextual utility area only where required by an approved state

The sidebar provides access to:

- Home
- Jobs / Bookings
- Messages
- Notifications
- Profile

Wallet is not a live navigation destination until the underlying wallet/payment capability exists. Settings remains within Profile/account management.

### 4.2 Mobile / PWA

Use the mobile layout rules from `DESIGN.md`, including 20px page margins.

Structure:

1. Compact authenticated header
2. Main dashboard content
3. Persistent bottom navigation

Bottom navigation is for authenticated customer surfaces only. It must not be introduced on the public homepage.

### 4.3 Native Mobile Equivalence

The native mobile experience should preserve the same information hierarchy, primary actions, state semantics, and navigation intent. Platform-specific interaction patterns may differ where required by the native surface, but product behavior must remain consistent.

## 5. Header and Identity

The header should establish the customer's authenticated context without consuming excessive vertical space.

Required:

- Customer greeting
- Clear account/profile access
- Page identity where useful
- Accessible focus order

Do not expose unnecessary personal information on the dashboard surface.

## 6. Primary Action Area

The first major action area should make both marketplace entry paths immediately available:

### Primary
**Find a Service**

Destination: existing `/services` discovery journey.

### Secondary
**Post a Job**

Destination: existing `/post-job` customer job posting journey.

Do not recreate service discovery or job posting inside the dashboard.

The primary action should use the approved Deep Navy action treatment from `DESIGN.md`. Emerald may provide strategic emphasis but must not replace Deep Navy as the primary action color.

## 7. Active and Upcoming Work

When customer activity exists, active and upcoming work receives the strongest content priority.

Each item should communicate only the information required for orientation and the next action, such as:

- Service or job name
- Concise status
- Location context
- Schedule context
- Appropriate next action

Avoid dense operational tables on the dashboard.

### Interaction

Cards or equivalent surfaces should provide a clear, keyboard-accessible action target. The entire surface should not be made clickable if that would obscure the actual action or create accessibility ambiguity.

## 8. Recent Activity

Recent completed or historical requests/bookings provide continuity after active work.

This section should remain visually subordinate to active and upcoming work.

If no recent activity exists, use a concise intentional empty state rather than placeholder metrics.

## 9. Marketplace Continuation

A restrained marketplace continuation area may appear when supported by mock data and the approved specification.

It may point customers back toward discovery or repeat a relevant marketplace action.

It must not become:

- A recommendation-heavy feed
- A second homepage
- An analytics dashboard
- A personalized AI surface

## 10. First-Run State

For a newly authenticated customer with no activity:

1. Welcome the customer.
2. Establish that this is their account home.
3. Briefly explain the two ways to get started.
4. Present Find a Service as the primary action.
5. Present Post a Job as the secondary action.
6. Keep normal Profile/settings access available.

Do not show:

- Fake bookings
- Fake job requests
- Fake activity
- Artificial counters
- Empty charts with no product value

The first-run state should feel complete, not broken or unfinished.

## 11. Dashboard State Designs

The design must explicitly account for the following states.

### 11.1 First-run / No Activity

Prioritize welcome content and the two marketplace actions.

### 11.2 Active Work

Prioritize active requests/bookings and their next actions.

### 11.3 Upcoming Work

Prioritize schedule awareness and preparation actions.

### 11.4 Recent Activity Only

Show useful historical continuity without overstating importance.

### 11.5 Mixed State

Order active work first, upcoming work next, then recent activity. Preserve a clear visual hierarchy rather than equal-weight sections.

### 11.6 Loading

Use stable skeleton or equivalent loading treatment. Preserve the eventual layout geometry as much as practical to avoid layout shift.

### 11.7 Partial Failure

A failed section must not unnecessarily block the rest of the dashboard. Identify the unavailable section and provide an appropriate retry or recovery action.

### 11.8 Individual Section Empty

Use concise, useful empty states with an appropriate next action. Do not fill empty sections with meaningless decoration.

### 11.9 Authentication / Session Failure

Follow the established WEB-008 authentication/session behavior. Do not invent a new authentication flow.

### 11.10 Offline / Degraded

Retain useful local shell and navigation where possible. Clearly distinguish unavailable live data from known local state. Never fabricate current status, freshness, booking state, or request state.

## 12. Navigation Behavior

### Desktop Sidebar

The active destination must be visually identifiable and keyboard accessible.

### Mobile Bottom Navigation

The initial destinations are:

- Home
- Jobs / Bookings
- Messages
- Notifications
- Profile

The navigation should support thumb-friendly interaction and the minimum approved touch target size.

Messages and Notifications may be represented as planned or unavailable destinations until their underlying functionality exists. The UI must not imply that unavailable functionality is live.

## 13. Integration Boundaries

The dashboard links into existing journeys only:

- `/services` for service discovery
- Existing service detail journey
- Existing booking preparation journey
- `/post-job` for customer job posting
- Existing WEB-008 authentication/session behavior

The dashboard must not duplicate these workflows.

## 14. Mock-First Boundary

The first implementation remains mock-data-first.

Allowed:

- Static or deterministic mock dashboard data
- Loading, empty, partial failure, offline/degraded, and success state demonstrations
- Navigation into existing implemented product surfaces

Not allowed:

- Production database mutations solely for WEB-010
- Real matching or dispatch
- Real-time chat infrastructure
- Push notification infrastructure
- Real payment processing
- Wallet transactions
- New booking lifecycle logic
- New review system
- New KYC workflow
- AI recommendations
- Analytics-heavy personalization

Future capabilities may appear only as clearly bounded navigation or placeholder states where the approved product specification calls for them.

## 15. Visual System

Follow `DESIGN.md` exactly.

Key locked requirements include:

- Deep Navy `#001A41` for primary actions and primary interface emphasis
- Emerald as strategic accent/positive emphasis, not primary action replacement
- Mint for approved supporting emphasis where appropriate
- Approved canvas, surface, text, border, and state treatments from the Design System
- Hanken Grotesk for headlines
- Inter for body text and labels
- Approved radii, spacing, buttons, cards, and form controls
- WCAG 2.2 AA intent

Do not introduce a dashboard-specific color system, typography system, radius system, or spacing system.

## 16. Responsive Composition

### Mobile

- Single-column content
- 20px page margins
- Bottom navigation
- Compact cards and clear vertical hierarchy
- No horizontal overflow

### Tablet

- Adaptive content width
- Preserve primary actions near the top of the experience
- Maintain readable card density

### Desktop

- 12-column grid
- Maximum content width from `DESIGN.md`
- Persistent sidebar
- Strong separation between navigation and operational content
- Avoid excessive whitespace that pushes active work below the fold

## 17. Accessibility

Target WCAG 2.2 AA.

Requirements:

- Semantic landmarks and headings
- Logical heading hierarchy
- Keyboard navigation
- Visible focus states
- Minimum 44px interactive target size
- Meaningful accessible names
- Status changes communicated appropriately
- No color-only state communication
- Sufficient contrast according to the Design System
- Reduced-motion consideration for non-essential motion
- Loading states that do not trap focus
- Error recovery accessible without pointer-only interaction

## 18. Trust and Privacy

The dashboard must not expose more customer information than necessary.

Location and work details should be presented at the level required for orientation and approved workflows.

Never imply that a BrainWorker has been assigned, a payment has completed, a message has been delivered, or a booking has a live status unless the underlying capability actually exists.

## 19. Interaction and Content Principles

Use direct, task-oriented labels.

Preferred actions:

- Find a Service
- Post a Job
- View Details
- Continue
- Retry

Avoid vague labels such as "Explore More" where a specific action can be named.

Dashboard content should prioritize customer decisions and next actions over promotional copy.

## 20. Error and Recovery Design

Every dashboard data section should have a defined recovery path where failure is recoverable.

Examples:

- Section unavailable: identify the affected area and offer Retry.
- Entire dashboard unavailable: preserve authenticated shell and provide a clear recovery action.
- Session expired: use WEB-008 authentication behavior.
- Offline: explain that live data may be unavailable without claiming stale data is current.

Do not use generic error messages when the affected action or section can be named clearly.

## 21. Performance Intent

The dashboard should prioritize fast perceived readiness.

Design for:

- Stable initial layout
- Minimal layout shift
- Progressive rendering of independent sections where appropriate
- No heavy visual treatment that delays operational content
- No unnecessary network-dependent decorative elements

## 22. QA Design Matrix

The design review must verify at minimum:

| Area | Required verification |
| --- | --- |
| First-run | No activity is represented honestly and both marketplace paths are clear |
| Active work | Active work receives highest priority |
| Upcoming work | Schedule context and next action are clear |
| Recent activity | Historical content remains subordinate |
| Mixed state | Correct content ordering is preserved |
| Loading | Layout remains stable |
| Partial failure | Failed section is isolated where possible |
| Offline | No fabricated freshness or status |
| Navigation | Desktop sidebar and mobile bottom navigation behave as specified |
| Public boundary | Bottom navigation is absent from public homepage |
| Auth | WEB-008 session behavior is reused |
| Accessibility | WCAG 2.2 AA intent and 44px targets are met |
| Responsive | Mobile, tablet, and desktop compositions remain usable |
| Design System | No unauthorized foundational visual rules are introduced |
| Mock boundary | No production integrations are introduced |

## 23. Edge Cases

The design must account for:

1. New customer with no activity
2. Customer with only one active request
3. Customer with multiple active requests
4. Customer with only upcoming work
5. Customer with only historical activity
6. Customer with active, upcoming, and historical activity
7. Very long service/job titles
8. Long location strings
9. Missing optional location context
10. No recent activity
11. Empty individual section
12. Partial section failure
13. Entire dashboard data failure
14. Slow network
15. Offline launch
16. Returning online
17. Expired authentication session
18. Narrow mobile viewport
19. Large text / accessibility settings
20. Keyboard-only navigation
21. Reduced-motion preference
22. Planned destination not yet implemented
23. No wallet capability
24. No messages capability
25. No notifications capability

## 24. Implementation Guardrails

This design brief does not authorize implementation by itself.

Implementation may begin only after the independent agent design review returns:

**APPROVED FOR IMPLEMENTATION**

or an equivalent explicit approval recorded in the repository.

If the review returns changes required, the design brief must be corrected and reviewed again before implementation.

Implementation must:

- Use the approved design contract
- Preserve the mock-first boundary
- Avoid unrelated refactors
- Reuse established authentication and marketplace patterns
- Maintain repository quality gates
- Include appropriate tests
- Verify the Vercel preview before merge

## 25. Design Review Request

The independent agent should inspect this artifact against:

- WEB-010 Product & UX Specification v1.0
- WEB-010 product decision record in Issue #30
- `DESIGN.md` Design System v1.0
- WEB-008 authentication behavior
- Existing public marketplace surfaces
- Repository accessibility, security, QA, and mock-first baselines

The review should inspect the actual repository sources and identify any contradiction, omission, scope creep, accessibility issue, responsive issue, or design-system violation.

Required review verdict:

- **APPROVED FOR IMPLEMENTATION**, or
- **CHANGES REQUIRED**

The agent must not implement or merge application code as part of this design review.

## 26. Approval Gate

**Current status:** Draft for Independent Agent Design Review

**Implementation authorization:** Not yet granted

**Next action after approval:** Prepare and issue the WEB-010 implementation instruction to Antigravity, then implement on a feature branch with QA and Vercel verification before merge.
