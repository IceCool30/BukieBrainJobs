# MOB-BOOK-001: Native Booking Preparation

**Document ID:** MOB-BOOK-001  
**Status:** Approved for scoped implementation  
**Decision:** `docs/21-decision-log/MOB-BOOK-001-NATIVE-BOOKING-PREPARATION.md`  
**Product area:** Native mobile app  
**Route:** `/book`  
**Primary user:** Customer

## 1. Approval and authority

The product owner explicitly delegated product-manager review and approval for this task. The resulting PM decision approves only this native booking-preparation slice and supersedes WEB-007A's human-review gate only for this adaptation. It does not state that a separate human reviewer completed a review or that Product Architect approval exists. It does not create a general approval-process exception.

WEB-007 remains the product behavior authority. WEB-007A supplies the booking-screen hierarchy, field, state, and interaction requirements, adapted to the existing native component system. Native screens do not inherit the web/PWA visual system. THEME-001 governs dark-default, light-mode, saved preference, and toggle behavior.

This specification does not authorize `/post-job`, WEB-009, WEB-009A, web/PWA booking changes, or use of the combined MOB-002 draft as implementation authority.

## 2. Objective and scope

Provide one native booking-preparation route for a customer entering from an existing mobile service detail screen. Use existing canonical services, shared booking validation, the current native design tokens and form components, and a deterministic local preview.

The route must also render safely when opened directly or with an invalid `serviceId`. It must not invent service, price, city, worker, or availability context. Without a valid service ID, show the canonical service choices unselected and require the customer to choose one.

## 3. Flow and content

Present the task as one scrollable form in this order:

1. Service selection from the canonical mobile service catalog.
2. City and street address, with optional landmark or estate-gate details.
3. Preferred date and arrival window.
4. Job description.
5. Payment preference.
6. A compact review summary and the primary action.

Keep the primary action after the summary. Provide a clear return to service discovery. The service-detail entry action is labelled `Prepare booking request` and passes only the selected catalog `serviceId` to `/book`.

The native catalog has no starting-price data or BrainWorker directory. Do not display invented prices, preferred-worker data, live coverage, availability, or assignment. Use the active city values already exposed by the shared validation package.

Date choices include Today, Tomorrow, Weekend, and a customer-entered specific date. As the smallest explicit calendar assumption, Weekend selects the upcoming Saturday, including the current day when it is Saturday. This is a preferred date only, not a statement of availability. Arrival windows are Morning, Afternoon, and Evening. Payment choices are Card, Bank transfer, and USSD.

## 4. Submission states and truthful claims

Use the existing booking domain module and deterministic local-preview reference. Invalid forms show field-level errors and an announced summary. The submission button has a visible pending/disabled state and prevents duplicate submission.

On simulated failure, retain every entered value and offer retry. On success, show the local preview reference and a summary. State clearly that no production booking was created, no BrainWorker was assigned, and no payment was taken. Payment selection is a preference for a later step only.

The `mockError=1` route parameter may be used to exercise the deterministic failure state. Query parameters are untrusted and must not cause a crash or populate unverified content.

## 5. Native theme behavior

Preserve THEME-001 exactly: dark is the first-visit default regardless of device appearance; the customer may switch to light mode; the selected mode persists through AsyncStorage; and a single accessible toggle sits in the native home-screen header next to the brand. The selected mode must be available across native routes, including `/book`, and the status bar follows the mode. Keep the current Obsidian Titanium Gunmetal Dark values unchanged and derive light values only from already approved light tokens. Do not change web or PWA theme behavior.

## 6. Non-goals

- `/post-job` route, UI, tests, or domain logic.
- Web or PWA changes.
- Backend, database, schema, migration, API, server, or production persistence.
- Production authentication, payment transactions, matching, dispatch, notifications, or assignment.
- New service or location data, invented prices, or new native visual primitives.
- Staging, commit, push, merge, deployment, or production release.

## 7. Acceptance criteria

- `/book` is registered in native navigation and is reachable from a service detail screen with its selected catalog service.
- Missing or invalid `serviceId` is handled safely and cannot display a fabricated service.
- The form uses existing service data and shared booking validation.
- Required city, address, date, arrival window, job description, and payment preference are validated; landmark remains optional.
- Date choices include Today, Tomorrow, Weekend, and a specific date; invalid and past dates are rejected.
- Controls have accessible labels, selected state, visible text errors, and at least 48dp touch targets.
- Submission cannot be repeated while pending. Success and failure states are truthful; failure preserves the draft and supports retry.
- The summary includes the available service, location, date, arrival window, job description, and payment preference without unsupported price or assignment claims.
- Theme selection defaults to dark, toggles to light, persists, survives navigation, and is exposed by an accessible home-header control.
- No `/post-job` implementation or payment, backend, API, authentication, or production-record work occurs.

## 8. Verification

Run focused theme, booking-domain, route-registration, and screen-contract tests first, then the complete mobile test suite and mobile type-check. Export the Expo app for web and exercise the compiled app in a mobile browser viewport, including valid form submission, invalid input, preview failure with preserved values, the theme toggle, and navigation from service detail. Record a short screen video and state clearly that browser emulation is not native iOS or Android simulator coverage. Use an iOS or Android simulator only if one is available in the environment.
