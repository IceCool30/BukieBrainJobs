# MOB-LIFE-001 Native Booking Lifecycle Presentation QA

Mandatory Skill Gate: PASS (22/22 tests passing on skill gate check).

**Status:** PM accepted on 2026-11-03 under owner delegation (UI-only local sample scope; native runtime QA unverified; Phase 4.2.2 IN PROGRESS). Static in-memory preview only. Actual native iOS/Android runtime, physical device points/dp, hardware safe areas, Dynamic Type, and assistive technologies remain explicitly unverified.

## Implementation overview

The `/jobs` tab route (`apps/mobile/app/(tabs)/jobs.tsx`) implements the approved in-place customer booking lifecycle presentation:

- In-place detail presentation: Tapping any of the six sample activity cards replaces the list view in-place with the adapted lifecycle presentation for that sample.
- Dedicated Back action: Prominent `< Back to Activity` button positioned in the detail view dismisses the presentation and restores the active segment list with preserved filter selection (`All`, `Active`, `Upcoming`, `Past`). Enforces React Native 48 logical-unit minimum target (`minHeight: 48, minWidth: 48`), accessible button role, and `accessibilityLabel="Back to activity list"`.
- Filter preservation: Segment tab filter state is preserved in component state. Tapping Back returns the customer to their previously selected filter (verified with `Past` and `All`).
- Screen-local memory: Selection state (`selectedSampleIndex: number | null`) is held purely in component React state. It is never written to AsyncStorage, SQLite, URL query parameters, or global stores.
- Navigation reset: Attached navigation blur listener resets `selectedSampleIndex` to `null` whenever navigating away from the Jobs screen.
- Canonical `JobStatus` mapping for the six approved static sample fixtures:
  - Sample 0 (Generator Servicing & Repair): Canonical `OPEN`, presentation heading "Request Received", truthful narrative "This sample represents a service request received and awaiting provider matching."
  - Sample 1 (AC Repair & Gas Refill): Canonical `PENDING_ACCEPTANCE`, presentation heading "Awaiting BrainWorker response", truthful narrative "This sample represents a booking awaiting a BrainWorker response."
  - Sample 2 (Plumbing & Pipe Fitting): Canonical `IN_PROGRESS`, presentation heading "Work in Progress", truthful narrative "This sample represents work that is in progress."
  - Sample 3 (Electrical & Solar Inverter): Canonical `CONFIRMED`, presentation heading "Booking Confirmed", truthful narrative "Your booking is confirmed." Displays confirmed-booking language solely because canonical status is `CONFIRMED`, without schedule or appointment assertions.
  - Sample 4 (Deep Cleaning & Post-Construction): Canonical `COMPLETED`, presentation heading "Work Completed", truthful narrative "This sample represents work marked complete."
  - Sample 5 (Furniture & Carpentry Work): Canonical `CANCELLED`, presentation heading "Request Cancelled", truthful narrative "This sample represents a cancelled request." Displays a single clear cancelled status via `CurrentStateBlock` with `c.danger` accent without duplicate blocks or progression steps.
- Headings and Accessibility: Lifecycle status headings declare `accessibilityRole="header"`. Service titles declare `accessibilityRole="header"`.
- Generic linear milestone sequence (adapted from WEB-013):
  1. `Request Submitted` (`OPEN`)
  2. `Worker Response Pending` (`PENDING_ACCEPTANCE`)
  3. `Confirmed` (`CONFIRMED`)
  4. `In Progress` (`IN_PROGRESS`)
  5. `Awaiting Completion` (`PENDING_COMPLETION`, informational generic timeline milestone only, no sample fixture maps to it)
  6. `Completed` (`COMPLETED`)
- Excluded milestones and payment guardrail: The final milestone `Completed` maps strictly to `COMPLETED`. `PAID`, `EXPIRED`, `DISPUTED`, and `RESOLVED` remain completely unrepresented. `PAID` is not added to the milestone sequence, payment status is not displayed, and payment behavior is strictly out of scope.
- Sample context block: Displays the static activity entry type (`Job request` or `Booking`) and the local preview disclaimer: `This is a local demonstration of the booking lifecycle. No live service record or provider assignment exists.` Takes only `sample` prop (`sampleIndex` removed).
- Semantic theme tokens: Exclusively uses existing tokens from `apps/mobile/lib/theme.ts` via `useThemeColors()` (`c.canvas`, `c.card`, `c.strip`, `c.mainText`, `c.mutedText`, `c.divider`, `c.amber`, `c.green` for success/completed, `c.danger` for cancelled/destructive). Zero hardcoded raw color hex values.
- Function length guardrails: Every function in `apps/mobile/app/(tabs)/jobs.tsx`, `apps/mobile/lib/lifecycle-preview.ts`, and `scripts/verify-expo-lifecycle.mjs` is strictly <= 25 lines.

## Tests and type-check

- `pnpm --filter @bukiebrainjobs/mobile test` passed 17/17 test files, 172/172 tests green in the full dirty working tree, and 17/17 test files, 169/169 tests green in the isolated staged snapshot (distinguished from 151/151 tests in prerequisite commit `7040787` and accurately separating the 3 extra tests in unstaged MOB-POST edits):
  - `lib/lifecycle-preview.test.ts` (11 tests): validates canonical status mapping for all 6 samples, exact presentation headings, truthful narratives, local demonstration disclaimer, milestone sequence, active/completed/upcoming progression resolution, and terminal cancelled behavior.
  - `apps/mobile/app/jobs.test.ts` (14 tests): source-content guardrail suite (not rendered-component interaction tests) verifying source patterns for tab structure, accessible roles and states without count badges, 48 logical-unit minimum targets on tabs, cards, back button, and CTA, sample preview notice, CTA navigation, in-place lifecycle detail conditional mounting, Back button dismissal handler, navigation blur reset, status heading role="header", non-duplicated cancelled status, absence of schedule/price/personal data fabrication, and absence of prohibited storage or mutations. Actual runtime interaction proof for selection, Back dismissal, filter preservation, and milestone progression belongs to the compiled Playwright suite.
  - `app/content-guardrails.test.ts` (17 tests): validates all function line lengths <= 25 lines across all app screens.
- `pnpm --filter @bukiebrainjobs/mobile type-check` passed with 0 diagnostics. Prior committed HEAD `990ef37` independently reproduced the exact same 11 type diagnostics across 6 files; these baseline errors were repaired in prerequisite commit `7040787` (151/151 tests passing, 0 type diagnostics). On top of that prerequisite, the isolated staged lifecycle snapshot type-checks cleanly with 0 diagnostics, proving this is not a lifecycle regression and requires no mobile exception.
- Monorepo full test run (`pnpm test`):
  - `@bukiebrainjobs/mobile`: 17/17 files passed, 172/172 tests green (169/169 in staged lifecycle snapshot; 151/151 in prerequisite commit `7040787`).
  - `@bukiebrainjobs/validation`: 2/2 files passed, 42/42 tests green.
  - `@bukiebrainjobs/utils`: 2/2 files passed, 7/7 tests green.
  - `@bukiebrainjobs/web`: 118/120 files passed (120 total files), 1,754/1,764 tests passed. Exactly 10 failures occurred across two untouched date-sensitive scheduling test files: 6 failures in `apps/web/lib/scheduling/repository.test.ts` and 4 failures in `apps/web/app/scheduling/SchedulingRoute.test.tsx` (reproduced with `Error: All candidate windows must be in the future with a minimum 1 hour ahead of the current time` because candidate windows hardcoded October 25 to 27, 2026, evaluated against current task date November 3, 2026). Delegated PM approved an explicit narrow baseline exception for these 10 pre-existing web failures; mobile scope remains strictly green with zero regressions.

## Static exports

Static export compilation completed successfully across all three platforms.

- Web: `expo export --platform web --output-dir dist-web` exited 0 (1.63 MB bundle)
- Android: `expo export --platform android --output-dir dist-android` exited 0 (3.23 MB Hermes `.hbc`)
- iOS: `expo export --platform ios --output-dir dist-ios` exited 0 (3.23 MB Hermes `.hbc`)

## Compiled Expo Playwright Browser QA

Driven by Playwright Chromium (`scripts/verify-expo-lifecycle.mjs`) against the compiled mobile bundle on port 8081:

- **Touch targets**: Every segment tab, activity card, Back button, and Explore Services CTA measured >= 48 CSS pixels in browser emulation (React Native 48 logical-unit style; native points/dp remain unverified).
- **In-place selection, portrait overflow, and progression assertions across all six samples**:
  - Sample 0: Tapped card, verified zero portrait horizontal overflow, verified heading "Request Received", narrative, disclaimer, verified all 6 milestone step labels and explicit states (Request Submitted: Current step; Worker Response Pending, Confirmed, In Progress, Awaiting Completion, Completed: Upcoming), dark heading and Back button contrast (text 6.82:1 / icon 6.82:1 normal, text 7.03:1 / icon 7.03:1 pressed), tapped Back, verified list view restored.
  - Sample 1: Tapped card, verified zero portrait horizontal overflow, verified heading "Awaiting BrainWorker response", narrative, verified milestone step labels and explicit states (Request Submitted: Completed; Worker Response Pending: Current step; Confirmed, In Progress, Awaiting Completion, Completed: Upcoming), tapped Back.
  - Sample 2: Tapped card, verified zero portrait horizontal overflow, verified heading "Work in Progress", narrative, verified milestone step labels and explicit states (Request Submitted, Worker Response Pending, Confirmed: Completed; In Progress: Current step; Awaiting Completion, Completed: Upcoming), tapped Back.
  - Sample 3: Tapped card, verified zero portrait horizontal overflow, verified heading "Booking Confirmed", narrative "Your booking is confirmed." rendered solely for Sample 3, verified milestone step labels and explicit states (Request Submitted, Worker Response Pending: Completed; Confirmed: Current step; In Progress, Awaiting Completion, Completed: Upcoming), verified zero appointment dates or times, tapped Back.
  - Sample 4: Tapped card, verified zero portrait horizontal overflow, verified heading "Work Completed", narrative, verified milestone step labels and explicit states (Request Submitted, Worker Response Pending, Confirmed, In Progress, Awaiting Completion: Completed; Completed: Current step), tapped Back.
  - Sample 5: Tapped card, verified zero portrait horizontal overflow, verified absence of LIFECYCLE PROGRESSION block, verified exactly one "Request Cancelled" text and single heading role, truthful narrative, tapped Back.
- **Filter preservation coverage**:
  - Selected `Past` tab, verified `aria-selected="true"`.
  - Verified exactly 2 items shown (Deep Cleaning & Post-Construction, Furniture & Carpentry Work).
  - Opened Sample 5 detail view and tapped Back.
  - Verified `Past` tab remained selected (`aria-selected="true"`).
  - Verified exactly 2 items returned after Back navigation.
  - Selected `All` tab, verified `aria-selected="true"`, and verified all 6 items returned.
- **Confirmed booking phrase isolation**:
  - "Your booking is confirmed." asserted present on Sample 3 (`CONFIRMED`).
  - "Your booking is confirmed." asserted absent on Samples 0, 1, 2, 4, 5.
- **Anti-fabrication checks on every sample detail**:
  Automated regex assertions in `scripts/verify-expo-lifecycle.mjs` evaluate rendered text across each of the six sample details:
  - Currency and payment terms: zero matches for `₦`, `NGN`, `$`, `USD`, `price`, `hourly`, `budget`, `invoice`, `escrow`, `wallet`.
  - Fake transaction and reference identifiers: zero matches for `fake_ref`, `TX-[0-9]+`, `TXN[0-9]*`, `BK-[0-9]+`, `REF-[0-9]+`, `transaction_id`.
  - Identity field labels and known names: zero matches for `Customer Name`, `Worker Name`, `Provider Name`, `Email Address`, `Phone Number`, `User ID`, `Customer ID`, `Worker ID`, `Provider ID`, `Babajide`, `Solomon`, `Bukie`, `Emeka`, `Chidi`, `Musa`, `John Doe`.
  - Email patterns: zero matches for standard email regex (`[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}`).
  - Nigerian phone patterns: zero matches for `080\d{8}`, `090\d{8}`, `070\d{8}`, `081\d{8}`, `\+234\d+`.
  - Address and location terms: zero matches for `Lagos`, `Ikeja`, `Abuja`, `Victoria Island`, `Street`, `Avenue`, `Close`, `Road`, `Plot`.
  - Coordinate values and labels: zero matches for coordinate pairs (`\b-?\d{1,3}\.\d+,\s*-?\d{1,3}\.\d+\b`), `latitude`, `longitude`, `coordinates`.
  - Time formats and clock terms: zero matches for clock times (`\b\d{1,2}:\d{2}\s*(am|pm)?\b`), `AM`, `PM`, `today`, `tomorrow`, `yesterday`, `countdown`, `appointment`.
  - Calendar dates and months: zero matches for numeric date formats (`\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b`, `\b\d{4}[/-]\d{1,2}[/-]\d{1,2}\b`) or named calendar months (January through December).
  - Confirmation phrase isolation: "Your booking is confirmed." confirmed present solely for Sample 3 (`CONFIRMED`) and strictly absent from Samples 0, 1, 2, 4, 5.
- **Computed WCAG AA Contrast Ratios (>= 4.5:1 for normal text)**:
  - Dark mode heading: Foreground `#FF6B35` (`rgb(255, 107, 53)`), Background `#13171E` (`rgb(19, 23, 30)`), Contrast Ratio **6.34:1**.
  - Dark mode Back button (normal): Text and icon separately inspected; both render identical foreground `#FF6B35` (`rgb(255, 107, 53)`), Background `#0B0E13` (`rgb(11, 14, 19)`), Contrast Ratio **6.82:1** for text and **6.82:1** for icon.
  - Dark mode Back button (pressed): Text and icon separately inspected; both render identical foreground `#FF6B35` (`rgb(255, 107, 53)`), Background `#07090D` (`rgb(7, 9, 13)`), Contrast Ratio **7.03:1** for text and **7.03:1** for icon.
  - Light mode heading: Foreground `#CC4A14` (`rgb(204, 74, 20)`), Background `#FFFFFF` (`rgb(255, 255, 255)`), Contrast Ratio **4.61:1**.
  - Light mode Back button (normal): Text and icon separately inspected; both render identical foreground `#B34312` (`rgb(179, 67, 18)` `c.amberHover`), Background `#F7F9FC` (`rgb(247, 249, 252)` `c.canvas`), Contrast Ratio **5.34:1** for text and **5.34:1** for icon.
  - Light mode Back button (pressed): Text and icon separately inspected; both render identical foreground `#B34312` (`rgb(179, 67, 18)` `c.amberHover`), Background `#FFFFFF` (`rgb(255, 255, 255)` `c.card`), Contrast Ratio **5.63:1** for text and **5.63:1** for icon.
- **Responsive overflow checks**:
  - Portrait (375x812): zero horizontal overflow (`scrollWidth <= clientWidth`).
  - Landscape (844x390): zero horizontal overflow (`scrollWidth <= clientWidth`).
- **Theme mechanics**:
  - Dark mode: default Obsidian Titanium Gunmetal Dark verified with approved tokens.
  - Light mode: switched to light mode via home screen toggle, opened detail view on `/jobs`, verified light theme surfaces and contrast, verified zero overflow, restored dark mode.
- **Reduced motion**: Emulated `prefers-reduced-motion: reduce`; verified zero running CSS animations (`document.getAnimations().filter(a => a.playState === 'running').length === 0`).
- **Zoom proxy**: Emulated 200% body zoom; verified detail rendering and asserted zero horizontal overflow.
- **Verifier Hygiene**: Temporary video recording saved under OS temp path (`os.tmpdir()`); zero repository files or directories deleted.

## Screenshot and Video Catalog

Continuous video recording:

- [`expo-mob-life-001-lifecycle-verification.webm`](../screenshots/videos/expo-mob-life-001-lifecycle-verification.webm): continuous recording covering touch target verification, opening each of the 6 sample detail views, asserting headings, narratives, and milestone progression, filter preservation on Past tab, dismissing via Back button, landscape 844x390, light theme rendering, reduced motion, and 200% zoom proxy.

Six distinct screenshots captured in the compiled Expo application:

- [`expo-mob-life-001-01-detail-generator-dark.png`](../screenshots/expo-mob-life-001-01-detail-generator-dark.png): 375x812 Portrait Dark showing Sample 0 (`OPEN`) in-place detail view with Back button, "Request Received" heading, truthful narrative, active "Request Submitted" step, upcoming steps, and local demonstration disclaimer.
- [`expo-mob-life-001-02-detail-ac-dark.png`](../screenshots/expo-mob-life-001-02-detail-ac-dark.png): 375x812 Portrait Dark showing Sample 1 (`PENDING_ACCEPTANCE`) in-place detail view with "Awaiting BrainWorker response" heading, truthful narrative, completed step 1, and active "Worker Response Pending" step.
- [`expo-mob-life-001-03-detail-confirmed-dark.png`](../screenshots/expo-mob-life-001-03-detail-confirmed-dark.png): 375x812 Portrait Dark showing Sample 3 (`CONFIRMED`) in-place detail view with "Booking Confirmed" heading, "Your booking is confirmed." narrative, active "Confirmed" step, and zero schedule/date fabrication.
- [`expo-mob-life-001-04-detail-cancelled-dark.png`](../screenshots/expo-mob-life-001-04-detail-cancelled-dark.png): 375x812 Portrait Dark showing Sample 5 (`CANCELLED`) in-place detail view with single clean "Request Cancelled" heading, truthful narrative, and absence of generic progression steps or duplicate cards.
- [`expo-mob-life-001-05-detail-landscape-dark.png`](../screenshots/expo-mob-life-001-05-detail-landscape-dark.png): 844x390 Landscape Dark showing responsive detail layout without horizontal overflow.
- [`expo-mob-life-001-06-detail-portrait-light.png`](../screenshots/expo-mob-life-001-06-detail-portrait-light.png): 375x812 Portrait Light showing approved THEME-001 light theme detail view with light surface tokens, contrast compliance (4.61:1 heading, 5.34:1 Back normal, 5.63:1 Back pressed), and Back button.

## Explicit unverified boundaries

Verification was conducted in compiled Expo web browser emulation. The following native device capabilities remain explicitly unverified:

- Native iOS and Android device runtimes.
- Native hardware notch, status-bar, and home-indicator clearance.
- Native Dynamic Type scaling.
- Native TalkBack (Android) and VoiceOver (iOS) screen-reader announcements.
- Physical touch hardware points/dp (measurements are React Native logical-unit styles and browser CSS pixels).

No backend, API, authentication, database, caching, booking-state mutation, payment, or persistence code was introduced. Prior MOB-ACT-001 baseline is committed and pushed as 990ef37; all MOB-LIFE-001 work was local, uncommitted, and unstaged at QA and acceptance time.
