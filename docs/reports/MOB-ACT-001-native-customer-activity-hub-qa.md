# MOB-ACT-001 Native Customer Activity Hub QA

Mandatory Skill Gate: PASS (22/22 tests passing on skill gate check).

**Status:** PM accepted on 2026-11-02 following implementation and compiled-app browser QA. Static in-memory preview only. Actual native iOS/Android runtime, physical device points/dp, hardware safe areas, Dynamic Type, and assistive technologies remain explicitly unverified.

## Implementation overview

The existing `/jobs` tab route (`apps/mobile/app/(tabs)/jobs.tsx`) implements the approved Customer Activity Hub:
- Segmented tab control with exactly four tabs: All, Active, Upcoming, Past in spec order. Defaults to All on initial load.
- Exposes `accessibilityRole="tab"`, `accessibilityState={{ selected }}`, `aria-selected={selected}`, and accessible labels. Tab items enforce React Native 48 logical-unit style (`minHeight: 48, minWidth: 48`).
- Renders exactly one sample preview notice above the list: `These sample entries are for preview only. They're not saved to your account.`
- Displays filtered sample cards driven by `apps/mobile/lib/activity-preview.ts` pure helper:
  - All: 6 items (Generator Servicing & Repair, AC Repair & Gas Refill, Plumbing & Pipe Fitting, Electrical & Solar Inverter, Deep Cleaning & Post-Construction, Furniture & Carpentry Work).
  - Active: 3 items (Generator Servicing & Repair, AC Repair & Gas Refill, Plumbing & Pipe Fitting).
  - Upcoming: 1 item (Electrical & Solar Inverter).
  - Past: 2 items (Deep Cleaning & Post-Construction, Furniture & Carpentry Work).
- Each sample card displays the exact service title, visible type label (`Job request`, `Booking`), status label (`Request received`, `Awaiting progress`, `In progress`, `Scheduled`, `Completed`, `Cancelled`), and `Sample` badge.
- Retains `EXPLORE SERVICES` CTA navigating to `/(tabs)/services` with theme contrast compliance (`c.mode === 'light' ? c.card : c.canvas`) including pressed state, with React Native 48 logical-unit minimum target.
- Preserves tab layout, header geometry, safe areas (`edges={['left', 'right']}`), and strict content guardrails (all UI functions <= 25 lines).
- Contains no tab count indicators, no customer records, no identity/address data, no lifecycle mutation actions, no empty/error/retry cards, no persistence/storage, and no network/API calls.

## Tests and type-check

- `pnpm --filter @bukiebrainjobs/mobile test` passed 16/16 test files, 154/154 tests green.
  - `lib/activity-preview.test.ts` (8 tests): validates all six fixture records, complete type and status label mappings, exact sample notice, and filtering logic across All, Active, Upcoming, and Past.
  - `app/jobs.test.ts` (7 tests): validates tab structure, accessibility roles and states without count badges, 48 logical-unit style minimums, notice string reference, helper usage, CTA navigation, and prohibition of empty cards or persistence.
  - `app/content-guardrails.test.ts` (17 tests): validates all function line lengths <= 25 lines across all app screens.
- `pnpm --filter @bukiebrainjobs/mobile type-check` passed with 0 diagnostics.

## Static exports

Static export compilation succeeded across all three platforms without runtime errors:
- Web: `expo export --platform web --output-dir dist-web` exited 0 (1.62 MB bundle)
- Android: `expo export --platform android --output-dir dist-android` exited 0 (3.22 MB Hermes `.hbc`)
- iOS: `expo export --platform ios` exited 0 (3.22 MB Hermes `.hbc`)

## Compiled Expo Playwright Browser QA

Driven by Playwright Chromium (`scripts/verify-expo-activity-hub.mjs`) against the compiled mobile bundle at `http://127.0.0.1:8081`:
- **Tabs and targets**: Verified exactly 4 segment tabs. Every tab item and the CTA measured >= 48 CSS pixels in browser emulation (React Native 48 logical-unit style; native points/dp remain unverified).
- **Preview notice**: Verified exactly 1 sample preview notice rendered.
- **Segment content & label assertions**:
  - All: 6 titles present, mapped type/status labels present, 0 excluded titles, 6 Sample badges.
  - Active: 3 titles present, mapped type/status labels present, 3 excluded titles absent, 3 Sample badges.
  - Upcoming: 1 title present, mapped type/status labels present, 5 excluded titles absent, 1 Sample badge.
  - Past: 2 titles present, mapped type/status labels present, 4 excluded titles absent, 2 Sample badges.
- **CTA Navigation**: `EXPLORE SERVICES` routes to `/(tabs)/services` and renders the services catalog.
- **Overflow checks**:
  - Portrait (375x812): zero horizontal overflow (`scrollWidth <= clientWidth`).
  - Landscape (844x390): zero horizontal overflow (`scrollWidth <= clientWidth`).
- **Reduced motion**: Emulated `prefers-reduced-motion: reduce`; asserted default All segment rendered, and verified zero running CSS animations (`document.getAnimations().filter(a => a.playState === 'running').length === 0`).
- **Zoom proxy**: Emulated 200% body zoom; asserted all 6 sample badges remained rendered, and asserted zero horizontal overflow (`document.documentElement.scrollWidth <= document.documentElement.clientWidth`).
- **CTA Computed Colors and Contrast (WCAG AA >= 4.5:1)**:
  - Dark Normal: Foreground `#0B0E13` (`rgb(11, 14, 19)`), Background `#FF6B35` (`rgb(255, 107, 53)`), Contrast 6.82:1. Icon foreground matches `rgb(11, 14, 19)`.
  - Dark Pressed: Foreground `#0B0E13` (`rgb(11, 14, 19)`), Background `#FF7D4D` (`rgb(255, 125, 77)`), Contrast 7.63:1. Icon foreground matches `rgb(11, 14, 19)`.
  - Light Normal: Foreground `#FFFFFF` (`rgb(255, 255, 255)`), Background `#CC4A14` (`rgb(204, 74, 20)`), Contrast 4.61:1. Icon foreground matches `rgb(255, 255, 255)`.
  - Light Pressed: Foreground `#FFFFFF` (`rgb(255, 255, 255)`), Background `#B34312` (`rgb(179, 67, 18)`), Contrast 5.63:1. Icon foreground matches `rgb(255, 255, 255)`.
  - Dark theme preference was restored in `finally` block following light theme verification.

## Screenshot and Video Catalog

Continuous video recording:
- [`expo-mob-act-001-activity-hub-verification.webm`](../screenshots/videos/expo-mob-act-001-activity-hub-verification.webm): continuous recording covering all segment tabs, touch target verification, CTA navigation, landscape 844x390, and light theme rendering.

Six distinct screenshots captured in the compiled Expo application:
- [`expo-mob-act-001-01-all-portrait-dark.png`](../screenshots/expo-mob-act-001-01-all-portrait-dark.png): 375x812 Portrait Dark showing initial top fold of the Activity hub with "Jobs" header, exact sample preview notice, 4 segment tabs with "All" selected, and the first 5 visible sample cards (Generator Servicing & Repair, AC Repair & Gas Refill, Plumbing & Pipe Fitting, Electrical & Solar Inverter, Deep Cleaning & Post-Construction). The sixth sample card (Furniture & Carpentry Work) and EXPLORE SERVICES CTA are below the fold at 375x812 viewport. Playwright asserts all six cards, and the continuous video recording covers the lower content.
- [`expo-mob-act-001-02-active-portrait-dark.png`](../screenshots/expo-mob-act-001-02-active-portrait-dark.png): 375x812 Portrait Dark showing segment tab "Active" selected with 3 active cards.
- [`expo-mob-act-001-03-upcoming-portrait-dark.png`](../screenshots/expo-mob-act-001-03-upcoming-portrait-dark.png): 375x812 Portrait Dark showing segment tab "Upcoming" selected with 1 upcoming card.
- [`expo-mob-act-001-04-past-portrait-dark.png`](../screenshots/expo-mob-act-001-04-past-portrait-dark.png): 375x812 Portrait Dark showing segment tab "Past" selected with 2 past cards.
- [`expo-mob-act-001-05-all-landscape-dark.png`](../screenshots/expo-mob-act-001-05-all-landscape-dark.png): 844x390 Landscape Dark showing responsive horizontal layout without overflow.
- [`expo-mob-act-001-06-all-portrait-light.png`](../screenshots/expo-mob-act-001-06-all-portrait-light.png): 375x812 Portrait Light showing approved THEME-001 light theme at top fold with "Jobs" header, sample preview notice, 4 segment tabs with "All" selected, light surface tokens, and the first 5 visible sample cards with verified CTA contrast.

## Explicit unverified boundaries

Verification was conducted in compiled Expo web browser emulation. The following native device capabilities remain explicitly unverified:
- Native iOS and Android device runtimes.
- Native hardware notch, status-bar, and home-indicator clearance.
- Native Dynamic Type scaling.
- Native TalkBack (Android) and VoiceOver (iOS) screen-reader announcements.
- Physical touch hardware points/dp (measurements are React Native logical-unit styles and browser CSS pixels).

No backend, API, authentication, database, caching, or persistence code was introduced. All work is local, uncommitted, unstaged, and PM accepted on 2026-11-02 under owner delegation.
