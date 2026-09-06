# WEB-008A: Authentication & Account Access Design Brief

**Document ID:** WEB-008A  
**Version:** 1.0  
**Status:** In Review  
**Product Area:** Public Website / Authentication  
**Primary User:** Customer and BrainWorker  
**Experience:** Responsive web, mobile-first  
**Implementation Model:** Mock-data-first  
**Parent Specification:** WEB-008 Product & UX Specification v1.0  
**Design System:** BukieBrainJobs Design System v1.0

## 1. Purpose

WEB-008A translates the approved WEB-008 Product & UX Specification into screen-level visual and interaction direction for Authentication & Account Access.

This brief defines the structure, hierarchy, responsive behavior, states, transitions, accessibility treatment, and content direction for the authentication experience. It does not introduce new product behavior or new foundational design-system rules.

## 2. Source of Truth

- `DESIGN.md` is the authoritative visual source of truth.
- WEB-008 is the authoritative source for authentication behavior and scope.
- WEB-007 is the authoritative source for the booking preparation context and BookingDraft handoff.

Where this brief describes visual treatment, it must remain consistent with those sources.

## 3. Primary Design Objective

Authentication should feel like a natural continuation of the customer's task, not an interruption or a separate administrative system.

The experience should communicate trust, clarity, and low friction while making the four approved authentication methods immediately understandable:

1. Continue with Google
2. Continue with Apple
3. Continue with phone number via OTP
4. Continue with email and password

The customer must always understand why authentication is being requested and where they will return afterward.

## 4. Core UX Principles

- Keep authentication focused on one clear task per screen.
- Make Google and Apple first-class options, not hidden secondary providers.
- Keep phone OTP prominent because it is a core Nigerian marketplace authentication path.
- Keep email/password available as an equally valid alternative.
- Preserve entered information when switching between Sign In and Create Account.
- Preserve the complete booking draft when authentication is triggered from `/book`.
- Make return destinations explicit.
- Avoid unnecessary visual complexity or decorative authentication surfaces.
- Use the locked Design System v1.0 without introducing new primitives.

## 5. Screen Inventory

The design package covers:

1. Authentication Welcome / Entry
2. Sign In
3. Create Account
4. Role Selection
5. Phone Number Entry
6. Phone OTP Verification
7. Email Authentication
8. Forgot Password
9. Reset Password
10. Authentication Loading / Provider Processing
11. Authentication Error States
12. Booking-to-Authentication Handoff
13. Authentication Success / Return State

## 6. Global Authentication Layout

### Desktop

Use the approved fixed 12-column grid with a maximum content width of 1280px and 24px gutters.

The primary authentication content should occupy a restrained central region rather than stretching across the full viewport. A secondary trust/context area may be used where it improves comprehension, but authentication controls remain the visual priority.

### Tablet

Use the approved 8-column grid with 32px margins. Maintain a single clear authentication column unless a secondary context panel materially improves the flow.

### Mobile

Use the approved 4-column grid with 20px margins. Authentication is a single-column experience with full-width controls where practical.

Avoid layouts that force horizontal scrolling or reduce form controls below the required touch target.

## 7. Header and Navigation

Authentication screens should use a restrained header treatment consistent with the public website.

The header should provide:

- BukieBrainJobs brand identity
- Clear route context where useful
- A predictable return path when the user entered authentication from another workflow

Do not introduce a separate authentication visual identity.

## 8. Welcome / Entry Screen

### Purpose

Provide a simple entry point into authentication and explain the immediate reason for signing in or creating an account.

### Recommended hierarchy

1. Page heading
2. Short supporting explanation
3. Continue with Google
4. Continue with Apple
5. Phone number option
6. Email/password option
7. Sign In / Create Account transition where appropriate
8. Return action when authentication was triggered from a prior workflow

The screen should avoid presenting four options as an undifferentiated wall of buttons. Provider grouping and hierarchy should make the choices scannable.

## 9. Sign In Screen

### Heading

Recommended direction: `Welcome back`

### Supporting copy

Use concise copy that explains the user can continue with the account method they previously used.

### Authentication options

Display all four approved methods:

- Continue with Google
- Continue with Apple
- Continue with phone number
- Continue with email and password

Google and Apple must remain visibly first-class options.

Phone and email authentication should have clear labels and not be buried behind an "Other options" control.

### Account creation transition

Provide a clear route to Create Account. Switching between Sign In and Create Account must preserve entered information where technically applicable and must not unexpectedly clear the user's current form state.

## 10. Create Account Screen

### Heading

Recommended direction: `Create your account`

### Supporting copy

Explain that the account can be used to access BukieBrainJobs services and choose a role in the next step.

### Authentication options

The same four first-class methods are available:

- Continue with Google
- Continue with Apple
- Continue with phone number
- Continue with email and password

Do not force the user to choose a role before establishing the account identity unless the approved WEB-008 behavior explicitly requires that sequence. Role selection is a distinct step after account identity entry.

### Sign In transition

Provide a clear route back to Sign In while preserving entered data where appropriate.

## 11. Role Selection

Role selection is a distinct product decision from authentication identity.

The screen should present two clear roles:

- Customer
- BrainWorker

Each role should include a concise description of what the user will do on the platform.

The design must make clear that selecting BrainWorker does not mean the user has already been approved as a BrainWorker. Professional and identity verification remain separate workflows.

## 12. Phone Number Entry

### Purpose

Collect the phone number required for OTP authentication or verification.

### Nigerian input behavior

The interface must comfortably support common Nigerian representations, including:

- `080...`
- `+234...`
- `234...`

Normalization should occur without making the customer manually understand international formatting rules.

### Visual treatment

Use the standard approved input treatment from `DESIGN.md`:

- Label above field
- 1px border
- Deep Navy focus treatment
- 1rem corner radius
- Clear validation state
- Minimum 44px interactive height

Provide concise supporting text explaining that a verification code will be sent to the number.

## 13. Phone OTP Verification

### Purpose

Allow the user to enter the verification code received by phone.

### Layout

The screen should show:

- Clear heading
- Masked destination number
- OTP input
- Verification status
- Resend action when available
- Change-number action
- Return path where relevant

The OTP entry must not visually imply that the account is approved for BrainWorker work. It verifies authentication identity only.

### Error state

Show an inline, human-readable verification error without clearing the entered code unnecessarily.

### Loading state

During verification, prevent duplicate submission and communicate that verification is in progress.

## 14. Email Authentication

Email authentication supports:

- Email address
- Password
- Sign In
- Create Account
- Forgot Password

The form should use standard accessible labels and provide immediate, concise validation feedback.

Do not expose password requirements that are not established by WEB-008 or the later production security specification.

## 15. Forgot Password

The screen should contain:

- Clear heading
- Email input
- Short explanation
- Primary recovery action
- Return to Sign In action

The design should avoid exposing whether an email address belongs to an account when the eventual production implementation is connected.

## 16. Reset Password

The reset screen should provide the approved password reset controls once a valid recovery context exists.

Visual treatment should remain consistent with Email Authentication and should clearly communicate completion without implying that the user has completed identity verification beyond the reset flow.

## 17. Google Authentication

Google authentication is a first-class authentication method.

The UI should provide a clearly labeled `Continue with Google` action using approved platform-recognizable treatment without introducing a new BukieBrainJobs brand color system.

Provider processing must have a visible pending state and must prevent duplicate activation.

Provider failure must return the user to a recoverable authentication state without losing relevant workflow context.

The mock-first implementation must not imply that a production Google OAuth session exists unless the approved implementation scope explicitly introduces it later.

## 18. Apple Authentication

Apple authentication is a first-class authentication method.

The UI should provide a clearly labeled `Continue with Apple` action using approved platform-recognizable treatment without introducing a new BukieBrainJobs brand color system.

Provider processing must have a visible pending state and must prevent duplicate activation.

Provider failure must return the user to a recoverable authentication state without losing relevant workflow context.

The mock-first implementation must not imply that a production Apple Sign In session exists unless the approved implementation scope explicitly introduces it later.

## 19. Booking-to-Authentication Handoff

Authentication may be triggered when a customer attempts to commit a booking request from `/book`.

The transition should explicitly communicate the reason:

`Sign in or create an account to continue with your service request.`

The design must preserve the complete BookingDraft through authentication.

Preserved fields are:

- service
- priceContext
- city
- worker
- streetAddress
- landmark
- date
- arrivalWindow
- jobDescription
- paymentPreference

The customer should not be asked to re-enter these fields after successful authentication.

After authentication, the interface should return the customer to the exact workflow destination required by the booking flow rather than an unrelated dashboard.

## 20. Return Paths

Every authentication entry point must have a clear destination after success.

Examples:

- `/book` returns to booking continuation.
- Service-detail authentication returns to the relevant service workflow.
- General authentication returns to the intended authenticated landing destination.

Return parameters must be treated as untrusted input and validated before use.

The design must never create a confusing dead end after authentication.

## 21. Sign In / Create Account Transition

The transition between Sign In and Create Account should feel continuous and lightweight.

Recommended interaction:

- Use a clear tab, segmented control, or equivalent approved pattern.
- Preserve entered email or phone information when switching.
- Preserve booking context independently from the authentication form.
- Keep the transition smooth and subtle.
- Respect reduced-motion preferences.

The transition must not feel like navigation away from the authentication task.

## 22. Authentication States

Every authentication screen should have defined visual states for:

### Default

Normal interactive state with clear hierarchy.

### Focus

Deep Navy focus treatment consistent with `DESIGN.md`.

### Validation Error

Inline error message, associated with the relevant field, without relying on color alone.

### Loading

Visible pending state, disabled duplicate actions, and accessible status communication.

### Provider Processing

Google or Apple processing state must make it clear that authentication is underway.

### Success

Clear confirmation and transition to the intended destination.

### Failure

Concise explanation, recovery action, preserved context, and no destructive clearing of unrelated entered data.

## 23. Visual Hierarchy

The visual priority should be:

1. Authentication purpose
2. Primary authentication actions
3. Current form fields
4. Provider and alternate method options
5. Recovery and navigation actions
6. Supporting trust/context copy

Do not overuse cards, borders, badges, or decorative elements. Authentication should feel calm and focused.

## 24. Design System Application

The experience uses Design System v1.0 exactly as approved.

### Color

- Deep Navy `#001A41` is the primary action and structural brand color.
- Emerald is reserved for confirmation, positive states, and strategic emphasis.
- Emerald must not replace Deep Navy as the general primary action treatment.
- Error and warning states use the approved semantic palette.

### Typography

Use Hanken Grotesk for headings and Inter for body copy and labels, following the approved type scale.

### Shape

Use the approved 1rem input/button rounding and larger approved card radii where cards are necessary. Primary buttons remain pill-shaped according to the design system.

### Spacing

Use the approved 8px spacing base and responsive margins:

- Desktop: 64px outer margin where applicable
- Tablet: 32px
- Mobile: 20px

### Components

Reuse existing approved button, input, card, radio, alert, and navigation patterns. Do not create a new authentication-specific component language.

## 25. Accessibility

Target WCAG 2.2 AA.

Requirements:

- All controls are keyboard accessible.
- Interactive targets meet the 44px minimum.
- Focus states remain visible.
- Form fields have explicit accessible labels.
- Validation errors use `aria-invalid` and `aria-describedby` where applicable.
- Authentication status changes are communicated to assistive technology.
- Focus moves to the appropriate heading or first invalid control when the state changes materially.
- Provider and OTP loading states do not trap users unexpectedly.
- Reduced-motion preferences are respected.
- Color is never the sole mechanism for communicating state.

## 26. Responsive Behavior

### Mobile

- Single-column layout.
- Full-width primary controls where practical.
- 20px page margins.
- Provider actions remain easy to scan and activate.
- OTP entry remains usable with mobile keyboards.
- No horizontal scrolling.

### Tablet

- 32px margins.
- Single focused authentication column with optional supporting context.

### Desktop

- Centered, restrained authentication surface.
- Maximum content width consistent with the approved grid.
- Optional secondary contextual panel only where it improves comprehension.

## 27. Trust and Content Direction

Authentication copy should be direct, human, concise, and professional.

The design may communicate that authentication protects access to the customer's account and booking activity, but must not invent guarantees about security, verification, payment, or identity approval.

For BrainWorker users, authentication must not be confused with professional verification or account approval.

## 28. Empty and Recovery States

The design must safely handle:

- No return destination
- Invalid return destination
- Expired or invalid OTP context
- Provider cancellation
- Provider failure
- Invalid email/password input
- Unsupported or malformed phone input
- Missing booking context
- Corrupted or incomplete preserved BookingDraft

Recovery should always provide a clear next action.

## 29. Mock-First Boundary

The design must support a mock-first implementation without visually pretending that production infrastructure already exists.

Out of scope for this design and initial mock implementation:

- Production Google OAuth configuration
- Production Apple Sign In configuration
- Real OTP delivery
- Termii integration
- Production password storage
- Production session issuance
- Production account persistence
- Production KYC
- BrainWorker approval
- Payment processing
- Production booking persistence

The UI contract should remain suitable for later replacement of mock authentication behavior with production services.

## 30. Required Review States

Human design review must inspect at minimum:

1. Welcome screen
2. Sign In default
3. Create Account default
4. Google processing
5. Apple processing
6. Phone number entry
7. Nigerian phone examples using `080...`, `234...`, and `+234...`
8. OTP entry
9. OTP error
10. Email/password state
11. Forgot Password
12. Reset Password
13. Role selection
14. Booking authentication handoff from `/book`
15. Preserved booking context after authentication
16. Invalid return destination
17. Provider failure
18. Validation errors
19. Loading state
20. Success and return state
21. Mobile viewport
22. Desktop viewport
23. Keyboard focus
24. Reduced-motion behavior

## 31. Content Requirements

Recommended copy should follow these principles:

- State the task clearly.
- Explain why authentication is needed when entered from booking.
- Use `Continue with Google` and `Continue with Apple` as clear provider labels.
- Use `Continue with phone number` for OTP entry.
- Use `Continue with email` or equivalent clear email/password action language.
- Avoid technical OAuth terminology.
- Avoid implying payment has occurred.
- Avoid implying a BrainWorker has been verified merely because the user authenticated.
- Avoid guaranteed booking, assignment, or dispatch language.
- Keep supporting text short enough for mobile scanning.

## 32. Design Acceptance Criteria

1. All four approved authentication methods are visually first-class.
2. Google is not hidden under a secondary options menu.
3. Apple is not hidden under a secondary options menu.
4. Phone OTP has a clear primary path.
5. Email/password remains clearly accessible.
6. Sign In and Create Account can be reached from each other.
7. Switching between Sign In and Create Account preserves relevant entered data.
8. Role selection clearly distinguishes Customer from BrainWorker.
9. Role selection does not imply BrainWorker approval.
10. Nigerian phone representations are accommodated without unnecessary friction.
11. OTP entry clearly identifies the destination phone number.
12. Authentication loading states prevent duplicate actions.
13. Provider errors are recoverable.
14. Form validation is visible and accessible.
15. Booking authentication explains why authentication is required.
16. All ten BookingDraft fields remain preserved through the authentication handoff.
17. Successful booking authentication returns to the intended workflow destination.
18. Invalid return destinations fail safely.
19. Authentication does not imply payment completion.
20. Authentication does not imply worker assignment or approval.
21. Deep Navy `#001A41` remains the primary action treatment.
22. Emerald remains limited to confirmation, positive states, and strategic emphasis.
23. Existing Design System components are reused.
24. No new foundational design rules are introduced.
25. The experience meets the approved responsive requirements.
26. The experience targets WCAG 2.2 AA.
27. Reduced-motion behavior is supported.
28. No horizontal scrolling is required on normal mobile use.
29. Mock implementation states do not falsely represent production OAuth, OTP delivery, sessions, or account persistence.
30. The complete authentication journey has a clear recovery path from every failure state.

## 33. Implementation Boundary

After human design approval, implementation should be limited to the approved WEB-008 scope and existing project architecture.

Expected UI areas include:

- `apps/web/app/` authentication routes and entry handling
- Authentication screen components within the existing component architecture
- Existing mock data and state infrastructure where applicable
- BookingDraft preservation and return-context handling from WEB-007
- Existing validation and test infrastructure

No new production authentication provider, payment service, KYC system, or database-backed account system should be introduced unless separately approved.

## 34. QA Requirements

Before human implementation approval, QA must verify:

- Functional authentication path coverage for all four methods in mock mode
- Booking handoff and complete draft preservation
- Return-path behavior
- Validation and error states
- Duplicate-action prevention
- Keyboard navigation
- Screen-reader semantics
- Responsive layouts
- Reduced motion
- Regression of WEB-004, WEB-005, WEB-006, and WEB-007
- Type-check and lint
- Production build
- Vercel deployment health and live route availability

## 35. Approval Gate

Current workflow:

`WEB-008 Approved → WEB-008A In Review → Human Design Review → WEB-008A Approved → Antigravity implementation → Independent QA → Human review & approval`

Implementation must not begin from this brief until human design approval is recorded, unless the founder explicitly authorizes an exception.

## 36. Assumptions

1. Google and Apple remain core authentication methods alongside Phone OTP and Email/Password.
2. Phone OTP is the primary non-social authentication path.
3. Authentication identity and BrainWorker approval remain separate concerns.
4. Booking authentication preserves the full WEB-007 BookingDraft.
5. Exact production OAuth, OTP delivery, password storage, and session behavior will be specified separately before production authentication implementation.
6. Existing public-site header and component patterns can support authentication without new foundational primitives.

## 37. Open Risks

1. Production provider configuration may require provider-specific UI or policy details not yet defined.
2. Production phone normalization and OTP delivery rules need a dedicated backend/authentication specification.
3. Account linking behavior when a user attempts multiple authentication methods remains a production identity decision.
4. Production session and refresh-token behavior remains outside this mock-first design scope.
5. The final authenticated landing destinations for Customer and BrainWorker require downstream platform specifications.

## 38. Status

**READY FOR HUMAN DESIGN REVIEW**

WEB-008 Product & UX Specification is approved. This design brief is the next approval artifact and does not authorize implementation until WEB-008A receives human design approval.