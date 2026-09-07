# WEB-011A: Customer Jobs & Bookings Design Brief

**Document ID:** WEB-011A  
**Feature:** WEB-011 Customer Jobs & Bookings  
**Version:** 1.0  
**Status:** Draft for Independent Design Review  
**Milestone:** Customer Platform  
**Primary Route:** `/jobs`  
**Primary User:** Authenticated Customer  
**Experience:** Responsive Web, PWA  
**Implementation Model:** Mock-first  
**Design Authority:** `DESIGN.md` Design System v1.0  
**Product Authority:** Approved WEB-011 Product & UX Specification v1.0  
**Implementation:** Not authorized until this design brief is independently reviewed and approved

---

## 1. Purpose

WEB-011A translates the approved WEB-011 Product & UX Specification into a precise visual and interaction direction for the customer Jobs / Bookings experience.

The design must give customers one coherent place to understand:

- What they requested
- What they booked
- What is active
- What is upcoming
- What has been completed
- What action is available next

The experience must extend the authenticated customer experience established by WEB-010.

It must not create separate Jobs and Bookings products.

---

## 2. Design Principles

### 2.1 One Customer Activity Experience

Jobs and Bookings are represented within one unified activity surface.

The interface distinguishes:

**Activity Type**
- Job Request
- Booking

from:

**Activity Status**
- Request received
- Awaiting progress
- Scheduled
- In progress
- Completed
- Cancelled

Type and status must never be visually conflated.

---

### 2.2 Current Activity Gets Priority

The page should prioritize information according to customer urgency:

1. Current or active activity requiring attention
2. Upcoming activity
3. Requests awaiting progress
4. Recent or completed activity
5. Secondary actions

Past activity should remain accessible without dominating the experience.

---

### 2.3 Honest Marketplace State

The design must communicate only what the current product state supports.

Use:
- "Request received"

Do not use:
- "BrainWorker assigned" unless the underlying product capability genuinely supports assignment.

Use:
- "Booking request prepared"

rather than:
- "Service confirmed" when confirmation is not supported.

No visual treatment should imply that mock data represents live marketplace execution.

---

## 3. Route and Navigation

### Canonical Route
`/jobs`

The independent product review verified that `/jobs` does not conflict with an existing top-level route and recommended formalizing it as the canonical WEB-011 route.

### Dashboard Integration
WEB-010's Jobs / Bookings navigation item must point directly to:
`/jobs`

The dashboard remains the authenticated home.
WEB-011 becomes the detailed activity-management surface.

### Legacy Dashboard Query
If `/dashboard?tab=jobs` exists or is encountered:
- It must not create a second Jobs experience.
- It should resolve cleanly to `/jobs` or otherwise preserve a coherent route transition.
- The exact behavior must follow the implementation conventions established in the repository.

---

## 4. Page Structure

The primary desktop experience should use a 12-column layout consistent with the Design System.

Recommended structure:

```text
┌──────────────────────────────────────────────────────────────┐
│ Authenticated Sidebar │ Page Header                         │
│                       │ Jobs & Bookings                      │
│ Home                  │ Supporting context                   │
│ Jobs / Bookings       │                                      │
│ Messages              │ Filters                              │
│ Notifications         │                                      │
│ Profile               │ ┌──────────────┬───────────────────┐ │
│                       │ │ Activity     │ Activity Detail   │ │
│                       │ │ List         │                   │ │
│                       │ │              │                   │ │
│                       │ │              │                   │ │
│                       │ └──────────────┴───────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

### Desktop Recommendation
Use a master-detail composition where the activity list occupies approximately 5 columns and the selected activity detail occupies approximately 7 columns.

This is a design recommendation, not a new grid rule. The repository's existing 12-column system remains authoritative.

The design may instead use a slide-over detail surface if that produces a cleaner implementation and stronger responsive behavior.

The final visual design should choose one pattern and document it explicitly before implementation.

---

## 5. Mobile and PWA Structure

Mobile should not attempt to compress the desktop master-detail experience into a narrow two-column layout.

Use a dedicated full-screen detail view.

### Activity List
Header  
↓  
Filter controls  
↓  
Current activity  
↓  
Upcoming activity  
↓  
Requests  
↓  
Past activity  
↓  
Mobile navigation

### Activity Detail
Sticky header (`← Back`, Activity type)  
↓  
Title and Status  
↓  
Primary information (Schedule, Location, Price / budget, Reference code)  
↓  
Customer-provided information (Description, Preferred BrainWorker context)  
↓  
Primary supported action

The back control must return to the correct filtered activity state.

Minimum touch target:
**48px**

This exceeds the repository's general 44px accessibility baseline and provides an appropriate mobile interaction target for this navigation pattern. The repository baseline requires accessible touch targets and WCAG 2.2 AA intent.

---

## 6. Header

The page header should establish clear context without excessive visual weight.

Recommended title:
**Jobs & Bookings**

Supporting text:
"Keep track of your service requests, bookings, and activity in one place."

The header should use the approved Hanken Grotesk heading system and Inter for supporting interface text.

Do not introduce decorative hero treatment.
The page is an authenticated utility experience, not a marketing landing page.

---

## 7. Activity Filters

Initial filters:
- All
- Active
- Upcoming
- Past

These should appear as a compact segmented control, tabs, or equivalent approved filter pattern.

The visual treatment must make the selected state unmistakable without relying on color alone.

### URL Synchronization
Filter state should be reflected in the URL.

Examples:
- `/jobs`
- `/jobs?view=active`
- `/jobs?view=upcoming`
- `/jobs?view=past`

`view=all` may either be explicit or represented by the absence of the parameter, depending on repository routing conventions.

Unsupported values must safely resolve to the default view.
The URL must never determine authorization.

---

## 8. Activity Deep Linking

An individual activity should be addressable through a safe identifier.

Recommended pattern:
`/jobs?id=REQ-72941`

The identifier is a navigation reference only.
It must not contain sensitive customer information.

The application must:
- Validate the identifier.
- Resolve only activity belonging to the authenticated customer.
- Handle missing activity safely.
- Handle malformed identifiers safely.
- Provide a clear not-found state.
- Preserve the selected filter where appropriate.

Browser Back and Forward navigation must work naturally.

Refreshing a deep-linked activity should return the user to the same activity when the authenticated session and mock data support it.

---

## 9. Activity List

Each activity should be presented as a clear, scannable card or list row.

Recommended information hierarchy:
1. Activity Type
2. Title
3. Status
4. Location and Schedule
5. Budget / Price and Reference code
6. Primary next action

Not every activity contains every field. Optional information should disappear cleanly rather than leaving empty placeholders.

### Visual Hierarchy
The strongest visual weight should go to:
1. Activity title
2. Status
3. Next action

Secondary metadata should remain visually quieter.
Activity type should be identifiable at a glance without competing with the title.

---

## 10. Activity Type Treatment

Use a restrained type indicator.

Examples:
- `JOB REQUEST`
- `BOOKING`

The indicator should be visually distinct from the status.

Do not create separate color systems for Jobs and Bookings unless those colors already exist as approved semantic tokens.

The Design System remains authoritative for color usage. `#001A41` is the primary brand/action color, while Emerald is reserved for approved positive or emphasis treatment.

---

## 11. Status Treatment

Statuses should use approved semantic treatments.

Examples:
- **Request received:** Neutral or informative treatment.
- **Awaiting progress:** Informative treatment.
- **Scheduled:** Positive or informative treatment.
- **In progress:** Active treatment.
- **Completed:** Approved positive treatment.
- **Cancelled:** Approved error or neutral treatment according to the semantic context.

Status must never depend on color alone. Every status should include visible text.
Where appropriate, the accessible name should communicate the same meaning to assistive technology.

---

## 12. Activity Detail

The activity detail surface is the primary secondary interaction.

Recommended hierarchy:
1. **Context:** Activity type and status.
2. **Title:** Service or job title.
3. **Primary information:** Location, Schedule, Budget or price, Reference code.
4. **Customer-provided information:** Description and other supported request details.
5. **Preferred BrainWorker:** Show only when a preference exists. The design must make clear that a preferred BrainWorker is a customer preference, not an assignment.
6. **Next action:** Show only actions supported by the current mock contract.

---

## 13. Activity Detail Desktop Pattern

Preferred design: Master-detail layout.

Approximate composition in 12-column grid:
- Activity list: 5 columns
- Gap: 1 column
- Activity detail: 6 columns

A 5/7 split is also acceptable if the final design provides better readability.

The activity list should remain usable while the detail surface is visible.
The selected activity should have a clear visual selected state.
The detail panel should not visually overpower the list.

---

## 14. Activity Detail Mobile Pattern

Use a dedicated route state or full-screen presentation.

Header:
`← Jobs & Bookings`

Content:
- Activity type
- Status
- Title
- Details
- Next action

The mobile design must avoid nested scrolling where practical.
The primary page should remain vertically scrollable.
The sticky header should remain visually lightweight.

---

## 15. Primary Actions

The action displayed for an activity must derive from the supported state.

Examples of acceptable actions:
- View details
- Return to Dashboard
- Continue supported flow
- Find a Service
- Post a Job

Do not design operational controls for:
- Dispatch
- Live tracking
- Payment
- Refund
- Cancellation
- Rescheduling
- Messaging

unless an existing approved product contract already supports the specific action.
WEB-011 explicitly excludes those production capabilities.

---

## 16. Empty States

### No Activity (First-Run)
The first-run experience should communicate:
"Your activity will appear here"

Supporting message should explain that service requests and bookings will appear in this area.

Primary action:
**Find a Service**

Secondary action:
**Post a Job**

No fake history. No fake counts. No fabricated completed jobs.
The repository's product rules explicitly prohibit fake customer history and require useful first-run actions.

---

## 17. Filtered Empty State

Example:
"No upcoming activity"

Supporting message:
"You do not have any upcoming activity yet."

Provide an appropriate continuation action where useful.
Do not show the generic first-run state when the customer has activity elsewhere.

---

## 18. Loading State

Loading should preserve the page structure.

Use stable skeleton or equivalent loading treatment for:
- Activity list
- Selected detail
- Status information

Avoid large layout shifts. Loading states must be accessible.
Do not display placeholder values that could be mistaken for real customer activity.

---

## 19. Partial Failure

If one activity section fails:
- Preserve sections that successfully loaded.
- Clearly identify the unavailable section.
- Provide retry.
- Avoid replacing the entire experience with a generic error.

The customer should understand what is unavailable. This follows the established WEB-011 resilience model.

---

## 20. Full Failure

If the activity source fails:

Display:
"We could not load your activity"

Provide:
- Retry
- Back to Dashboard
- Find a Service
- Post a Job where appropriate

Do not display stale activity as current unless explicitly identified as stale.
Do not fabricate an empty account state when the data source has actually failed.

---

## 21. Offline / Degraded State

Preserve the application shell where possible.

The interface may retain:
- Authenticated navigation
- Stable page structure
- Previously available local UI state

It must clearly indicate that current activity cannot be refreshed.
The UI must not imply that the displayed activity is current when freshness cannot be verified.

---

## 22. Authentication State

WEB-011 uses WEB-008 authentication behavior.

If the customer session expires:
1. Preserve valid return context.
2. Redirect through the existing authentication flow.
3. Return to `/jobs` or the supported activity destination after successful authentication.

No new authentication pathway should be designed.

---

## 23. Navigation Integration

Authenticated navigation remains:
- Home
- Jobs / Bookings
- Messages
- Notifications
- Profile

Wallet remains deferred. WEB-011 must not introduce Wallet into the navigation.
The navigation treatment should visually identify Jobs / Bookings as the current destination.

---

## 24. Dashboard Continuity

WEB-010 remains the customer's home base.
Dashboard activity cards should link into WEB-011.

Example transition:
Dashboard → Recent activity → `/jobs` → Selected activity

The transition should preserve the user's context.
If the dashboard links directly to an activity, the URL should support the selected activity state.

---

## 25. WEB-009 Continuity

A successfully submitted WEB-009 request should be capable of appearing in WEB-011 as:
**Job Request** with **Request received** when that is the only confirmed state.

The interface may display:
- Request title
- Description
- Location
- Schedule
- Budget
- Preferred BrainWorker
- Reference code

only where those values exist in the supported mock contract.
The design must not imply matching has occurred.

---

## 26. WEB-007 Continuity

WEB-007 remains the booking preparation flow.
WEB-011 represents resulting customer activity.

The design should therefore distinguish:
"Booking request prepared" from "Booking operationally confirmed" unless an approved future contract supports the latter.

---

## 27. Logo Watermark

The independent product review specifically requested a defined watermark treatment.

Use:
`/images/logo-badge-512.png` inside the activity detail container.

Recommended treatment:
- Ambient opacity: approximately 3% to 4%
- Positioned within the detail surface
- Non-interactive
- Decorative only
- Must not interfere with text contrast
- Must not compete with the activity content
- Must not appear behind critical text where it reduces readability

The watermark should feel like a subtle brand signature rather than a dominant graphic.
This treatment remains consistent with the existing visual treatment referenced in the WEB-009 and WEB-010 experience.

---

## 28. Design System Compliance

WEB-011A must use the locked Design System v1.0.

### Color
- Primary brand/action: `#001A41`
- Strategic emphasis / positive: `#296A4B`
- Supporting semantic colors must use the approved token system.
- No arbitrary colors should be introduced for normal interface states.

### Typography
- Headings: Hanken Grotesk
- Body and interface: Inter
- The approved typography scale remains authoritative.

### Layout
- Desktop: 12-column grid, Maximum container: 1280px, 24px gutter
- Mobile: 20px page margin

### Spacing
- Established 4px micro-unit with an 8px primary rhythm.

### Radii
- Approved radius tokens (`rounded-xl`, `rounded-2xl`). Do not introduce new foundational radius values.

---

## 29. Visual Character

The page should feel:
- Professional
- Calm
- Clear
- Trustworthy
- Structured
- Premium without being decorative

The authenticated experience should not resemble an advertising page.
The visual system uses generous space, high-contrast surfaces, strong typography, and restrained emphasis.

---

## 30. Responsive Behavior

### Mobile
- Single-column layout
- Full-width activity cards
- Compact filter controls
- Full-screen detail
- Sticky back header
- Bottom navigation
- 48px minimum touch targets for key navigation controls

### Tablet
Adaptive layout preserving readable activity cards and detail content. The master-detail relationship may collapse to a sequential interaction where the viewport does not comfortably support both surfaces.

### Desktop
Authenticated sidebar and 12-column content system. The activity list and detail should remain visually balanced. No normal workflow should require horizontal scrolling.

---

## 31. Accessibility

Target: **WCAG 2.2 AA intent**

Requirements:
- Semantic page structure
- Correct heading hierarchy
- Keyboard navigation
- Visible focus states
- Accessible filter controls
- Accessible status communication (color independence)
- Meaningful labels
- Sufficient contrast
- Touch targets meeting repository requirements (48px for key mobile navigation)
- Accessible detail presentation
- Accessible loading announcements
- Accessible error announcements
- Reduced-motion support

Status cannot be communicated through color alone. Selected filters must have a programmatically identifiable selected state. The detail back control must have a clear accessible name.

---

## 32. Security and Privacy

The visual design must account for customer activity being private data.

The implementation contract must ensure:
- Activity is scoped to the authenticated customer.
- Query parameters are treated as untrusted.
- Sensitive information is not placed into URLs.
- Internal identifiers are not unnecessarily exposed.
- Customer descriptions are safely rendered.
- Authentication boundaries remain centralized.

---

## 33. Shared Type Contracts

The independent product review requested explicit frontend contracts.

Presentation contracts:

```text
CustomerActivityItem
├── id
├── type ('job_request' | 'booking')
├── title
├── status
├── service
├── location
├── schedule
├── budgetOrPrice
├── description
├── preferredWorker
├── referenceCode
└── nextAction

CustomerActivityViewModel
├── customer
├── activities
├── activeActivities
├── upcomingActivities
├── pastActivities
└── availableFilters
```

These are frontend/domain presentation contracts, not a production database schema.
The eventual TypeScript interfaces should be placed in `packages/types/src/index.ts`.

---

## 34. URL State Contract

- Default: `/jobs`
- Filter: `/jobs?view=active`, `/jobs?view=upcoming`, `/jobs?view=past`
- Activity: `/jobs?id=REQ-72941`
- Combined state: `/jobs?view=active&id=REQ-72941`

The implementation must validate parameters, normalize supported values, ignore unsupported values safely, preserve browser navigation, avoid sensitive information, and never use query parameters for authorization.

---

## 35. Motion

Motion should remain subtle and purposeful:
- Filter selection transition
- Activity selection
- Detail entrance
- Loading state transitions
- Success or state communication

Avoid large page animations, decorative motion, or excessive card movement. Respect reduced-motion preferences.

---

## 36. Content Direction

Interface copy should be direct and truthful:
- Preferred: "Request received" (Not: "Your BrainWorker has been notified")
- Preferred: "Booking request prepared" (Not: "Your service is confirmed")
- Preferred: "No upcoming activity" (Not: "Nothing is happening")

The interface should explain what the customer can do next without pretending that unsupported marketplace operations exist.

---

## 37. Design States

The design must provide specifications for:
1. First-run / no activity
2. All activity
3. Active activity
4. Upcoming activity
5. Past activity
6. Job Request
7. Booking
8. Selected activity
9. Activity with preferred BrainWorker
10. Activity without preferred BrainWorker
11. Activity with budget
12. Activity without budget
13. Activity with reference code
14. Activity without reference code
15. Filtered empty state
16. Loading
17. Partial failure
18. Full failure
19. Offline/degraded
20. Invalid activity
21. Unknown status
22. Expired session
23. Mobile detail
24. Desktop detail
25. Reduced-motion mode

---

## 38. Design Anti-Patterns

Do not introduce:
- Separate Jobs and Bookings top-level pages
- Fake BrainWorker assignments
- Fake payment confirmations
- Fake dispatch states
- Fake tracking maps
- Fake messaging
- Fake notification delivery
- Fake wallet balances
- Fake completed transactions
- Fake customer history
- Heavy marketing imagery
- New primary colors
- New foundational typography
- Unapproved component patterns
- Sensitive customer data in URLs

---

## 39. Deliverables Expected from Design

### Desktop
1. Jobs / Bookings overview
2. Activity list with All filter
3. Active filter
4. Upcoming filter
5. Past filter
6. Selected activity detail
7. No activity state
8. Filtered empty state
9. Partial failure state
10. Full failure state

### Mobile / PWA
1. Jobs / Bookings overview
2. Activity list
3. Filter interaction
4. Activity detail
5. No activity state
6. Filtered empty state
7. Loading state
8. Error state
9. Offline/degraded state

---

## 40. Design Review Checklist

Before independent design review, verify:

**Product alignment:**
- [ ] Unified Customer Activity model
- [ ] Jobs and Bookings remain one experience
- [ ] Status and type are distinct
- [ ] WEB-007 continuity preserved
- [ ] WEB-009 continuity preserved
- [ ] WEB-010 dashboard continuity preserved

**Navigation:**
- [ ] `/jobs` is canonical
- [ ] Jobs / Bookings dashboard link points to `/jobs`
- [ ] Filter state is URL-addressable
- [ ] Activity state is deep-linkable
- [ ] Browser Back / Forward behavior is defined

**Visual:**
- [ ] DESIGN.md remains authoritative
- [ ] Deep Navy `#001A41` is used for primary/action treatment
- [ ] Emerald remains strategic emphasis
- [ ] Hanken Grotesk headings
- [ ] Inter body/UI
- [ ] Approved spacing
- [ ] Approved radii
- [ ] Approved grid
- [ ] Existing authenticated visual language is preserved

**Responsive:**
- [ ] Desktop layout defined
- [ ] Tablet behavior defined
- [ ] Mobile layout defined
- [ ] Mobile detail view defined
- [ ] Touch targets defined (48px for key mobile controls)
- [ ] No normal horizontal scrolling

**Accessibility:**
- [ ] Keyboard navigation
- [ ] Visible focus
- [ ] Semantic structure
- [ ] Filter semantics
- [ ] Status semantics
- [ ] Accessible detail navigation
- [ ] Loading announcements
- [ ] Error announcements
- [ ] Reduced motion

**Trust and privacy:**
- [ ] No fake operational state
- [ ] No fake payment state
- [ ] No fake assignment
- [ ] No fake history
- [ ] No sensitive URL state
- [ ] Customer activity remains private

**Contracts:**
- [ ] CustomerActivityItem defined
- [ ] CustomerActivityViewModel defined
- [ ] Mock-first boundary preserved
- [ ] No production backend introduced

---

## 41. Implementation Boundary

This design brief does not authorize implementation.

After independent design review approval, implementation may proceed within the approved WEB-011 scope.

Expected implementation areas include:
- `apps/web/app/jobs/`
- `apps/web/components/`
- `packages/types/`

Exact repository paths must be confirmed against the current repository before engineering begins. Implementation must remain mock-first. No production backend infrastructure should be introduced solely for WEB-011.

---

## 42. Design Authority

Source hierarchy:
1. Approved WEB-011 Product & UX Specification
2. Approved WEB-011A Design Brief
3. `DESIGN.md`
4. WEB-010 contracts
5. WEB-009 contracts
6. WEB-007 contracts
7. WEB-008 authentication behavior
8. Repository security, accessibility, QA and deployment baselines

If a lower-level source conflicts with a higher-level source, the higher-level source wins.

---

## 43. Approval Gate

The required workflow is:

```text
WEB-011 Product & UX Specification
            ↓
Independent Product Review
            ↓
WEB-011A Design Brief
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

WEB-011 has passed the first gate.  
WEB-011A now requires independent design review.  
Implementation remains unauthorized until WEB-011A receives an acceptable independent design-review verdict.

---

## Final Design Brief Status

**WEB-011A v1.0: READY FOR INDEPENDENT DESIGN REVIEW**

The design direction is now sufficiently specified for the next gate without reopening the approved product requirements.
