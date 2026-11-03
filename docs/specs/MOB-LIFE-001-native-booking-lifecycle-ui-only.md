# MOB-LIFE-001: Native Customer Booking Lifecycle Presentation (UI-Only)

**Scope:** Approved for scoped implementation by delegated PM on 2026-11-03
**Implementation:** Complete
**Acceptance:** Accepted by delegated PM on 2026-11-03 (UI-only local sample scope; native device runtime QA unverified; Phase 4.2.2 IN PROGRESS)
**Phase:** 4.2.2 IN PROGRESS. Separate booking-lifecycle execution, booking-state mutations, and offline caching remain out of scope and unchecked.

## 1. Scope and Objective

This specification defines a strictly UI-only customer booking lifecycle presentation within the existing native Jobs screen at `apps/mobile/app/(tabs)/jobs.tsx`. It provides an in-place inspection view for the six approved static sample activity rows without introducing new routes, URL parameters, backend services, network communications, database tables, new local storage, or booking-state mutation actions.

The objective is to adapt the lifecycle progression behavior of `WEB-013` to the native mobile experience using honest presentation boundaries:
- Selection of an activity card opens an in-place lifecycle detail view on the `/jobs` screen.
- An accessible Back action dismisses the detail view and returns the customer to the activity list.
- All selection state is screen-local and held in component memory only (`useState`).
- The feature introduces no new persistence or local storage. The existing `THEME-001` saved theme preference mechanism using AsyncStorage remains untouched and continues to function normally.
- The existing six activity sample cards, segment filtering (`All`, `Active`, `Upcoming`, `Past`), sample preview notice, and `EXPLORE SERVICES` CTA remain fully preserved.

## 2. Surface and Navigation Boundaries

1. **Single-Screen In-Place Surface**:
   - Implemented strictly within `apps/mobile/app/(tabs)/jobs.tsx`.
   - No new route, stack screen, modal route, or URL identifier is introduced in Expo Router.
   - When an activity card is tapped, the list view is replaced in-place by the lifecycle detail view.
   - When the customer taps the Back action, the detail view closes and restores the list view.
2. **Screen-Local State Isolation**:
   - Active view selection is stored in React local state (e.g. `selectedSampleIndex: number | null`).
   - Selection state is never persisted to AsyncStorage, SQLite, URL query parameters, or global stores.
   - Navigating away from the Jobs tab automatically clears the selection.
   - This restriction applies strictly to this feature's selection state; existing `THEME-001` AsyncStorage usage for theme preference is preserved.
3. **Preservation of Existing Activity Hub**:
   - Exactly four segment tabs (`All`, `Active`, `Upcoming`, `Past`) remain present.
   - Tab ordering and default selection (`All`) remain untouched.
   - The exact preview notice banner is preserved: `These sample entries are for preview only. They're not saved to your account.`
   - The `EXPLORE SERVICES` primary CTA is preserved with its existing navigation to `/(tabs)/services`.

## 3. Canonical JobStatus Mapping and Sample Data Boundaries

All lifecycle presentations must map strictly to authoritative canonical `JobStatus` values. In accordance with `WEB-013`, non-canonical statuses such as `DECLINED`, `SCHEDULED`, `CANCELLATION_PENDING`, or `PAYMENT_PENDING` must never be added to `JobStatus`.

### Canonical JobStatus Set
`OPEN`, `PENDING_ACCEPTANCE`, `CONFIRMED`, `IN_PROGRESS`, `PENDING_COMPLETION`, `COMPLETED`, `PAID`, `CANCELLED`, `EXPIRED`, `DISPUTED`, `RESOLVED`.

The full canonical `JobStatus` list is preserved to maintain contract integrity. However, this native UI-only screen does not implement payment execution, paid status presentation (`PAID`), dispute handling (`DISPUTED`, `RESOLVED`), expiry (`EXPIRED`), or completion-review actions. While `PENDING_COMPLETION` is shown only as a generic informational timeline milestone described below, no sample fixture maps to it. Only the six existing sample fixtures and their explicit canonical mappings are represented in this slice; `PAID`, `EXPIRED`, `DISPUTED`, and `RESOLVED` remain completely unrepresented.

### Fixture Mapping for the Six Approved Samples
The detail presentation maps each existing sample fixture in `apps/mobile/lib/activity-preview.ts` to one canonical `JobStatus`:

| Sample Index | Service Title | Existing Type | Existing Display Label | Canonical JobStatus | Lifecycle Presentation Heading |
|---|---|---|---|---|---|
| 0 | Generator Servicing & Repair | `job_request` | Request received | `OPEN` | Request Received |
| 1 | AC Repair & Gas Refill | `booking` | Awaiting progress | `PENDING_ACCEPTANCE` | Awaiting BrainWorker response |
| 2 | Plumbing & Pipe Fitting | `booking` | In progress | `IN_PROGRESS` | Work in Progress |
| 3 | Electrical & Solar Inverter | `booking` | Scheduled | `CONFIRMED` | Booking Confirmed |
| 4 | Deep Cleaning & Post-Construction | `booking` | Completed | `COMPLETED` | Work Completed |
| 5 | Furniture & Carpentry Work | `job_request` | Cancelled | `CANCELLED` | Request Cancelled |

### Strict Privacy and Anti-Manufacturing Guardrails
1. **No Schedule Fabrication**:
   - Zero appointment dates, time windows, countdown timers, or calendar dates appear on any sample.
   - A `CONFIRMED` sample (Sample 3) may display confirmed-booking language ("Your booking is confirmed.") solely because its canonical status is `CONFIRMED`. It must not display or imply an appointment date or time.
   - The existing activity label `Scheduled` is retained strictly as a presentation label; it does not represent a schedule contract or timestamp.
2. **No Personal or Transactional Data**:
   - Zero worker names, customer identities, phone numbers, avatars, home addresses, service coordinates, or landmarks.
   - Zero prices, hourly rates, estimates, payments, invoices, or fake reference codes.
3. **No Invitation Response or Decline Fixture**:
   - Decline is an invitation response property (`accepted: false`), not a `JobStatus`.
   - Because the local sample fixtures contain no authoritative invitation records, invitation response and decline presentation are strictly out of scope.
   - Decline semantics must remain completely separate from `JobStatus` across all screens, code, and documentation.

## 4. Adapted Lifecycle Presentation Blocks (WEB-013 Adaptation)

`WEB-013` specifies a five-block lifecycle layout. In this native UI-only presentation, the structure is adapted honestly to display only what local in-memory data supports:

1. **Current State Block**:
   - Displays the service title, visible `Sample` badge, and current status presentation label.
   - Displays truthful narrative copy explaining the current lifecycle stage without unverified backend claims:
     - For `OPEN` (Sample 0): "This sample represents a service request received and awaiting provider matching."
     - For `PENDING_ACCEPTANCE` (Sample 1): "This sample represents a booking awaiting a BrainWorker response."
     - For `IN_PROGRESS` (Sample 2): "This sample represents work that is in progress."
     - For `CONFIRMED` (Sample 3): "Your booking is confirmed." (displays confirmed-booking language solely because canonical status is `CONFIRMED`, without schedule or appointment assertions).
     - For `COMPLETED` (Sample 4): "This sample represents work marked complete."
     - For `CANCELLED` (Sample 5): "This sample represents a cancelled request."
2. **Lifecycle Position Indicator**:
   - A linear step indicator representing progression across canonical milestones aligned with WEB-013:
     1. `Request Submitted` (`OPEN`)
     2. `Worker Response Pending` (`PENDING_ACCEPTANCE`)
     3. `Confirmed` (`CONFIRMED`)
     4. `In Progress` (`IN_PROGRESS`)
     5. `Awaiting Completion` (`PENDING_COMPLETION`)
     6. `Completed` (`COMPLETED`)
   - Informational milestone distinction: `Awaiting Completion` (`PENDING_COMPLETION`) is included purely as a generic informational timeline milestone to reflect the canonical milestone progression of WEB-013. No sample fixture maps to `PENDING_COMPLETION`. The six existing sample fixtures map strictly to `OPEN`, `PENDING_ACCEPTANCE`, `IN_PROGRESS`, `CONFIRMED`, `COMPLETED`, and `CANCELLED`.
   - Excluded milestones and payment guardrail: The final milestone `Completed` maps strictly to `COMPLETED`. `PAID`, `EXPIRED`, `DISPUTED`, and `RESOLVED` remain completely unrepresented. `PAID` is not added to the milestone sequence, payment status is not displayed, and payment behavior is strictly out of scope.
   - For `CANCELLED` (Sample 5): displays a clear `Cancelled` terminal indicator without progression steps.
   - Active milestone is highlighted using semantic theme tokens; past milestones show completed styling; future milestones show inactive styling.
3. **Sample Context Block**:
   - Shows the static activity type (`Job request` or `Booking`).
   - Displays an explicit local preview disclaimer: `This is a local demonstration of the booking lifecycle. No live service record or provider assignment exists.`
4. **Back / Dismiss Action**:
   - Dedicated, prominent Back button (`< Back to Activity`) positioned in the detail view.
   - Meets the minimum hit target of at least 48x48 logical units.
5. **Excluded Action and Recovery Blocks**:
   - `WEB-013` action blocks (such as Cancel Booking, Accept Quote, Release Escrow) require authenticated backend mutations and are explicitly excluded.
   - `WEB-013` recovery blocks (such as Retry Sync, Network Reconnect, Offline Warning) require network state machines and are explicitly excluded.

## 5. Theme Mechanics and Visual Standards (THEME-001)

1. **Theme Inheritance**:
   - Follows `docs/specs/THEME-001-light-dark-toggle.md` mechanics.
   - First-visit default is Obsidian Titanium Gunmetal Dark.
   - Respects the customer's saved light/dark preference loaded from AsyncStorage via `useThemeColors()`.
   - The theme toggle remains exclusively in the home screen header; no toggle is added to `/jobs`.
2. **Semantic Theme Tokens**:
   - Feature code must use existing semantic theme tokens from `apps/mobile/lib/theme.ts` via `useThemeColors()`:
     - Canvas background: `c.canvas`
     - Card / Surface background: `c.card`
     - Section strip background: `c.strip`
     - Primary text: `c.mainText`
     - Muted text: `c.mutedText`
     - Borders and dividers: `c.divider`
     - Primary brand accent: `c.amber`
     - Interactive hover/press: `c.amberHover`
     - Success / Completed accent: `c.green`
     - Cancellation / Destructive accent: `c.danger`
   - Hardcoded raw color hex values are prohibited in feature code. No web/PWA CSS classes or modifications to the shared theme engine are permitted.

## 6. Accessibility and Layout Boundaries

1. **Touch Targets**:
   - Every interactive control (segment tabs, activity cards, Back action, Explore Services button) must enforce a minimum tap target of at least 48x48 logical units (`minHeight: 48, minWidth: 48`).
2. **Semantic Accessibility Attributes**:
   - Activity cards declare `accessibilityRole="button"`, descriptive `accessibilityLabel`, and `accessibilityHint="Opens lifecycle details"`.
   - Back action declares `accessibilityRole="button"` and `accessibilityLabel="Back to activity list"`.
   - Headings declare `accessibilityRole="header"`.
   - Lifecycle steps declare accessible text descriptions indicating active, completed, or upcoming status.
3. **Safe Areas and Viewport Responsiveness**:
   - Retains existing `<SafeAreaView edges={['left', 'right']}>` to prevent double-inset overrides with bottom tab bar.
   - Validated across mobile portrait (375x812) and landscape (844x390) viewports.
   - Prevents horizontal overflow (`scrollWidth <= clientWidth`).
   - Supports 200% zoom proxy and reduced motion (`prefers-reduced-motion`).

## 7. Explicit Exclusions and Non-Goals

The following areas are strictly out of scope for this slice:
1. **No Backend or Network Operations**:
   - Zero REST/GraphQL endpoints, HTTP requests, WebSockets, or remote synchronization.
2. **No Authentication or Session Handling**:
   - Zero user login checks, session tokens, authentication cookies, auth redirects, or role-based access gates.
3. **No Production-Record Reads or Writes**:
   - Zero queries or writes against production or staged database records. Data is strictly limited to the six in-memory presentation sample fixtures.
4. **No New Persistence or Local Storage**:
   - Zero new AsyncStorage keys, SQLite tables, or browser storage entries introduced by this feature.
   - Existing `THEME-001` theme preference storage in AsyncStorage remains unchanged and fully operational.
5. **No Offline Caching Infrastructure**:
   - Offline mutation queues, sync workers, and cache hydration remain separate and unchecked under checklist item 4.2.2.
6. **No Booking-State Mutations**:
   - Zero cancellation execution modals, status mutation triggers, or status transition requests.
   - Zero BrainWorker invitation responses, accept actions, or decline actions.
   - Screen-local view selection state (`selectedSampleIndex: number | null`) is permitted as in-memory UI state only.
7. **No Payment or Escrow Behavior**:
   - Zero Paystack integration, wallet calls, escrow holds, or funds release controls.
8. **No Route or URL Additions**:
   - No new route files under `apps/mobile/app/`.

## 8. Acceptance Criteria

1. **In-Place Detail View**: Tapping any of the six sample activity cards on `/jobs` replaces the list view in-place with the lifecycle presentation for that sample.
2. **Dismiss / Back Interaction**: Tapping the Back action dismisses the detail view and returns the customer to the active segment list with preserved filter selection.
3. **Canonical JobStatus Compliance**: Each sample accurately displays its mapped canonical `JobStatus` milestone (`OPEN`, `PENDING_ACCEPTANCE`, `IN_PROGRESS`, `CONFIRMED`, `COMPLETED`, `CANCELLED`). Zero non-canonical statuses appear.
4. **Awaiting Response Presentation**: Sample 1 (`PENDING_ACCEPTANCE`) displays heading "Awaiting BrainWorker response", milestone "Worker Response Pending", and narrative "This sample represents a booking awaiting a BrainWorker response."
5. **Confirmed Booking Language Guardrail**: "Your booking is confirmed." is rendered only for the `CONFIRMED` sample (Sample 3). No appointment date, time, or schedule value is displayed.
6. **Privacy and Zero-Manufacturing Compliance**: No fake reference codes, prices, addresses, or personal names appear anywhere on the detail surface.
7. **Semantic Theme Token Usage**: All styling uses existing tokens (`c.canvas`, `c.card`, `c.amber`, `c.green`, `c.danger`, etc.) without hardcoded colors or shared theme engine changes.
8. **Touch Targets**: All interactive elements (cards, Back button, tabs, CTA) measure at least 48 logical units in React Native style and >= 48 CSS pixels in browser emulation.
9. **Responsive Layout**: Zero horizontal document overflow in 375x812 portrait and 844x390 landscape viewports.
10. **Preserved Hub Behavior**: Segment filtering, sample counts (6 total), sample notice, and `EXPLORE SERVICES` CTA remain fully functional and regression-free.
11. **Exclusions Honored**: No backend, auth, database, network, persistence, booking-state mutation, payment, or offline caching code is introduced.

## 9. Verification and QA Plan

1. **Unit and Guardrail Tests (`apps/mobile`)**:
   - Vitest suite in `lib/lifecycle-preview.test.ts` covering lifecycle mapping helpers, milestone resolution, and guardrails.
   - Source-content guardrail suite in `app/jobs.test.ts` verifying source-level tab structure, conditional detail mounting patterns, Back dismissal handler, and absence of forbidden strings, storage, or mutations. Actual runtime interaction proof for selection, Back dismissal, filter preservation, and milestone progression belongs to the compiled Playwright suite.
   - Full monorepo test run (`pnpm test`) must be executed to ensure zero mobile or shared package regressions. Pre-existing, independently reproduced failures outside this mobile UI scope may be allowed only under an explicit delegated-PM baseline exception recorded in the QA report and decision record.
2. **Static Bundling and Compilation**:
   - TypeScript compiler check (`pnpm --filter @bukiebrainjobs/mobile type-check`) must exit with 0 diagnostics.
   - Static exports must succeed across all three targets:
     - Web: `expo export --platform web`
     - Android: `expo export --platform android`
     - iOS: `expo export --platform ios`
3. **Compiled Expo Browser QA (Playwright)**:
   - Automated browser verification against compiled bundle on port 8081:
     - Exercises tapping each card, verifying detail content, and returning to the list.
     - Asserts canonical status labels and absence of schedule/price/identity strings.
     - Verifies touch target dimensions (>= 48 CSS pixels).
     - Verifies zero horizontal overflow in portrait and landscape viewports.
     - Validates theme contrast in both Dark and Light modes.
     - Captures distinct evidence screenshots and continuous WebM verification video.
4. **Known QA Limits**:
   - Testing is performed via compiled Expo web emulation in Chromium.
   - Physical iOS and Android hardware runtimes, native OS safe-area cutouts, native Dynamic Type scaling, and platform screen readers (VoiceOver/TalkBack) remain unverified in browser emulation.
5. **Post-Push Vercel Verification Protocol**:
   - After an explicitly approved push, perform direct inspection of the Vercel deployment record for project `bukie-brain-jobs`, matching the exact `feature/mobile-accepted-slices` branch and commit SHA. GitHub checks and status rollups may serve only as supporting evidence, not as a substitute for direct Vercel deployment verification.
   - Do not manually deploy or merge.
   - Report the actual outcome transparently, including when Vercel cancels or skips an unaffected web project build, and never claim deployment success without evidence.
   - This deployment check is external CI/CD verification only and introduces zero network behavior or API calls to the mobile application.
