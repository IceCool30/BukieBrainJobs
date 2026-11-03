# MOB-WORK-001 Native BrainWorker Workspace & Local Lead Alert Preview QA

Mandatory Skill Gate: PASS (22/22 tests passing on skill gate check).

**Status:** PM accepted on 2026-11-03 for scoped UI-only local sample workspace preview, based on reviewed source, TDD evidence, and passing verification. Does not complete Phase 4.3 Item 1 (remains IN PROGRESS because real push delivery and backend integration are deferred). Physical iOS and Android device runtime, Dynamic Type, and assistive technologies remain explicitly unverified.

## Implementation Overview

The dedicated workspace preview stack screen (`apps/mobile/app/brainworker/workspace-preview.tsx`) implements the approved UI-only provider workspace preview:

- **Controlled Entry Point**: Clearly labelled informational preview link on `/brainworker/register` (`apps/mobile/app/brainworker/register.tsx`) with label `View Sample Workspace Preview`, role `button`, accessibility label, and 48 logical-unit minimum hit target (`minHeight: 48`). Tapping the link navigates to `/brainworker/workspace-preview`.
- **Preserved Registration Behavior**: Registration form submission on `/brainworker/register` preserves its exact behavior: displaying the confirmation Alert and returning to `/`. It never redirects to the preview or implies registration or approval.
- **Root Stack Registration**: `/brainworker/workspace-preview` is registered in `apps/mobile/app/_layout.tsx` as an isolated native stack screen outside the customer tab shell.
- **Customer Tab Shell Isolation**: All five customer tabs (`home`, `services`, `jobs`, `messages`, `profile`) in `apps/mobile/app/(tabs)/` remain completely unmodified.
- **Truthful Disclaimer Banner**: Displayed prominently at the top fold using `c.strip` background and `c.divider` border:
  `Sample preview only. The leads shown here are local examples. This is not a live BrainWorker account, lead feed or push alert service.`
- **Workspace Header Block**:
  - Eyebrow: `BRAINWORKER WORKSPACE` in uppercase monospace font.
  - Title: `BrainWorker workspace preview` with informational subtitle: `Explore sample leads and alert details.`
  - Mode badge: Immutable tag marked `SAMPLE PREVIEW`. Zero fabricated worker identity, rating, balance, or live availability state claims.
- **In-App Lead Alert Presentation Banner**:
  - Static sample alert banner with `SAMPLE LEAD ALERT` tag, sample category, neighborhood, problem summary, and sample urgency.
  - Explicit `View sample details` action button meeting React Native 48 logical-unit minimum target (`minHeight: 48`), accessible button role, and accessibility label.
- **Static Lead Feed List**:
  - Exactly three immutable sample leads (`lead_gen_01`, `lead_ac_02`, `lead_plumb_03`) based on existing canonical service categories (`Generator Servicing & Repair`, `AC Repair & Gas Refill`, `Plumbing & Pipe Fitting`).
  - Strict BW-003 privacy masking: zero customer names, phone numbers, emails, or exact house/street addresses (neighborhood and landmark only).
  - Explicit sample values: timeframe marked as sample window, urgency marked as sample, budget marked as sample range.
  - Each card provides a >= 48dp touch target opening in-place detail inspection.
- **In-Place Detail Inspection View**:
  - Full problem description, sample timeframe, sample budget, sample pricing mode, and location boundary.
  - Dedicated Back button with label `Back to Lead Feed`, minHeight 48, minWidth 48, button role, and accessibilityLabel="Back to lead feed", restoring the lead feed list.
  - Reiteration of the truthful local sample disclaimer.
  - Strict exclusion of accept/decline actions, booking mutations, GPS, camera, biometrics, or push code.
- **Semantic Theme Tokens**: Exclusively uses existing tokens from `apps/mobile/lib/theme.ts` via `useThemeColors()` under `THEME-001`, supporting dark mode (default) and light mode.
- **Function Length Guardrails**: Every component function in `apps/mobile/app/brainworker/workspace-preview.tsx`, `apps/mobile/app/brainworker/register.tsx`, and `scripts/verify-expo-workspace.mjs` is strictly <= 25 lines.

## Tests and Type-Check

- **TDD RED/GREEN Verification**:
  - **Initial Feature RED**: Initial test suites (`apps/mobile/lib/worker-workspace-preview.test.ts` with 7 tests and `apps/mobile/app/worker-workspace.test.ts` with 9 tests) were written prior to component implementation to define the contract for immutable fixtures, entry link on registration, disclaimer copy, touch targets, and exclusion of live/push capabilities. The initial run failed as expected due to missing screen routes and fixtures; the raw terminal output of that initial run was executed interactively and not captured to a persisted log file prior to GREEN execution.
  - **Contrast & Layout Regression RED**: When 4 focused regression tests were added to `apps/mobile/app/worker-workspace.test.ts` to assert `getStripTextColor`/`getStripAccentColor` on strip surfaces, `c.canvas`/`c.card` on CTA foregrounds, `c.amberHover` on the light registration preview link, and vertical footer stacking, Vitest was executed and captured an explicit RED failure: 4 failed, 9 passed (13 total).
  - **Final Gap Regression RED**: When 3 additional focused tests were added to `apps/mobile/app/worker-workspace.test.ts` asserting `c.cardHover` pressed state on `SampleLeadCard` (preventing text disappearance in light mode), `c.mutedText` for >= 3:1 clickable card boundary contrast, and explicit `accessibilityRole="text"` and `accessibilityLabel` on the disclaimer text, Vitest was executed and captured an explicit RED failure: 3 failed, 13 passed (16 total).
  - **Large Text Navigation & Icon Contrast Regression RED**: When 2 guardrail regression tests were added to `apps/mobile/app/worker-workspace.test.ts` asserting that `verifyLargeText` navigates directly to `/brainworker/workspace-preview`, verifies workspace title presence via `getByText('BrainWorker workspace preview')`, throws `Workspace title missing before scaling`, and checks failure condition `scaledFontSize <= initialFontSize`, and that `measureIconContrast` asserts threshold `minRatio = 3.0`, checks `ratio < minRatio`, throws `Icon contrast failure`, calls the verifier in both dark and light themes, and resolves nearest background using `getBg(el)`, Vitest was executed and captured an explicit RED failure: 2 failed, 16 passed (18 total).
  - **GREEN Verification**: After implementing the direct navigation and font scaling assertions in `verifyLargeText`, along with the unified nearest-background icon and text contrast scanning engines in `scripts/verify-expo-workspace.mjs`, all unit and guardrail tests passed cleanly: 18/18 tests green in `apps/mobile/app/worker-workspace.test.ts`, and full mobile suite 197/197 tests green across 19 files.
- **Distinction Between Source-Guardrail Assertions and Compiled Runtime Evidence**:
  - **Source-Guardrail Static Assertions (`apps/mobile/app/worker-workspace.test.ts`)**: Vitest unit tests inspecting repository source files, verifying AST/source tokens, structural constraints, and verification script contracts before compilation. These guarantee that registration submission preserves its return flow, customer tabs remain untouched, screen copy contains `Explore sample leads and alert details.` and excludes stale phrasing, touch target minimums are declared, and that `scripts/verify-expo-workspace.mjs` contains required navigation, failure branches, and threshold assertions.
  - **Compiled Playwright Runtime Evidence (`scripts/verify-expo-workspace.mjs`)**: Headless Chromium browser tests running against the actual compiled Expo web bundle (`dist-web`). These execute dynamic user interactions, verify live DOM hierarchy and bounding box points (>= 48px), perform full-scan contrast checks against computed styles across 41 text nodes and 4 icons in feed, 16 text nodes and 3 icons in details, test responsive layouts at 375x812 and 844x390, and execute the 125% rendered-text scaling proxy measuring actual font scaling (24px to 30px) without horizontal layout overflow.
- **Focused Unit & Guardrail Tests**:
  - `apps/mobile/lib/worker-workspace-preview.test.ts` (7 tests): validates truthful disclaimer, 3 immutable fixtures, canonical service category mapping, BW-003 privacy masking, anti-fabrication rules, and lead lookup helper.
  - `apps/mobile/app/worker-workspace.test.ts` (19 tests): validates root layout registration, entry link on register.tsx, preservation of registration submission, customer tab isolation, screen titles and disclaimers including `Explore sample leads and alert details.`, 48dp touch targets, in-place detail inspection, strict exclusion of accept/decline actions and push/network code, strip tokens, CTA foreground contrast, light registration preview link token, vertical footer stacking, theme-safe `cardHover` pressed state on `SampleLeadCard`, `c.mutedText` clickable card boundary, explicit disclaimer `accessibilityRole` and `accessibilityLabel`, direct `/brainworker/workspace-preview` navigation, title presence check, and `scaledFontSize <= initialFontSize` failure condition in `verifyLargeText`, `measureIconContrast` minRatio=3.0, ratio < minRatio failure condition, and verifier invocations in both themes, and `accessible={false}` on all 5 workspace Ionicons and the registration preview link icon.
- **Mobile Unit Test Suite**: `pnpm --filter @bukiebrainjobs/mobile test` passed 19/19 test files, 198/198 tests green.
- **Mobile TypeScript Check**: `pnpm --filter @bukiebrainjobs/mobile type-check` passed with 0 diagnostics.
- **Static Exports**:
  - Web: `expo export --platform web --output-dir dist-web` exited 0 (1.64 MB bundle).
  - Android: `expo export --platform android --output-dir dist-android` exited 0 (3.25 MB Hermes `.hbc`).
  - iOS: `expo export --platform ios --output-dir dist-ios` exited 0 (3.25 MB Hermes `.hbc`).

## Compiled Expo Playwright Browser QA

Executed via Playwright Chromium (`scripts/verify-expo-workspace.mjs`) against the compiled mobile bundle on port 8081:

- **Touch Targets**:
  - Registration preview link: >= 48px (`minHeight: 48`).
  - Workspace navigation back button: >= 48px (`minHeight: 48, minWidth: 48`).
  - Lead alert `View sample details` button: >= 48px (`minHeight: 48`).
  - Each lead card: >= 48px (`minHeight: 48`).
  - Detail `Back to Lead Feed` button: >= 48px (`minHeight: 48, minWidth: 48`).
- **Controlled Entry Flow**:
  - Loaded `/brainworker/register`.
  - Tapped `View Sample Workspace Preview`.
  - Verified clean navigation to `/brainworker/workspace-preview`.
- **Feed and Alert Interaction**:
  - Tapped `View sample details` on the static alert banner.
  - Verified detail inspection view loaded with full problem description, sample timeframe, sample budget, sample pricing mode, and disclaimer.
  - Tapped `Back to Lead Feed` and verified return to lead feed view.
  - Tapped AC Repair lead card and verified detail inspection view loaded.
  - Tapped `Back to Lead Feed` and verified return to lead feed view.
- **Accessibility Roles, Labels, and Decorative Icons**:
  - Feed disclaimer text: verified explicit `accessibilityRole="text"` and `accessibilityLabel` containing full truthful disclaimer copy.
  - Detail disclaimer text: verified explicit `accessibilityRole="text"` and `accessibilityLabel` containing full truthful disclaimer copy.
  - Decorative icons: all 5 Ionicons on the workspace preview screen and the eye icon on the registration preview link declare `accessible={false}` because adjacent visible text or parent button accessibility labels carry the meaning. The source guardrail test verifies that `accessible={false}` is declared; generated web accessibility-tree behavior and native screen-reader behavior (iOS VoiceOver, Android TalkBack) remain explicitly unverified.
- **Responsive Viewport Audits**:
  - 375px portrait (375x812): zero horizontal overflow (`scrollWidth <= clientWidth`).
  - Landscape (844x390): zero horizontal overflow (`scrollWidth <= clientWidth`).
- **Lead Card Footer Geometry at 375px Across All 3 Cards**:
  - Verified vertical stacking (`timeframe.y > budget.y`) and absence of collision across all 3 sample lead cards (`Generator Servicing & Repair`, `AC Repair & Gas Refill`, `Plumbing & Pipe Fitting`).
  - Zero horizontal crowding or text collision on 375px portrait viewports.
- **Rendered-Text Scaling Proxy (125%)**:
  - Explicitly navigates directly to `/brainworker/workspace-preview`, ensuring test execution occurs directly on the workspace screen and not on `/` after light mode toggle.
  - Verifies presence of workspace title (`BrainWorker workspace preview`).
  - Measures initial computed font size on the workspace title (24px).
  - Scales all rendered text leaf nodes across the page by 125% via inline `style.fontSize = (computed * 1.25) + 'px'`.
  - Asserts that measured font size increased (`scaledFontSize: 30px > initialFontSize: 24px`).
  - Verifies zero layout blowout or horizontal scrolling (`scrollWidth: 375, clientWidth: 375, noOverflow: true`).
  - Restores all modified styles cleanly via `restoreScaledFonts`.
  - Explicitly designated as a browser-only proxy; native iOS Dynamic Type and Android font scaling remain unverified.
- **Computed WCAG AA Contrast Ratios (>= 4.5:1 for normal text, >= 3:1 for controls/boundaries/icons)**:
  - **Resolution Methodology & Scope Limits**:
    - The verifier (`scripts/verify-expo-workspace.mjs`) resolves background colors for all text leaf nodes, meaningful icons, and controls by ascending the DOM tree to locate the nearest non-transparent computed background (`window.getComputedStyle(cur).backgroundColor !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent'`), falling back to the canvas root background if none is set.
    - All design token colors and surface backgrounds in `obsidianDarkTokens` and `lightTokens` are 100% opaque hex colors (`#0B0E13`, `#13171E`, `#FFFFFF`, `#F7F9FC`, etc.).
    - The verifier does not perform multi-layer Porter-Duff alpha compositing or transparency blending, because all scanned UI elements and parent container surfaces in the preview are fully opaque. If semi-transparent overlay surfaces (such as translucent modal scrims) are introduced in future slices, alpha compositing would be implemented for those specific layers.
  - **Full-Scan Text Contrast Across All Visible Rendered Text Nodes**:
    - Dark mode Workspace Feed: 41 visible text nodes scanned, all >= 4.5:1 (min 6.04:1, range 6.04:1 to 17.50:1).
    - Dark mode Alert Detail View: 16 visible text nodes scanned, all >= 4.5:1 (min 6.04:1, range 6.04:1 to 17.50:1).
    - Dark mode AC Lead Detail View: 16 visible text nodes scanned, all >= 4.5:1 (min 6.04:1, range 6.04:1 to 17.50:1).
    - Light mode Workspace Feed: 41 visible text nodes scanned, all >= 4.5:1 (min 4.61:1, range 4.61:1 to 17.16:1).
    - Light mode Plumbing Detail View: 16 visible text nodes scanned, all >= 4.5:1 (min 4.61:1, range 4.61:1 to 17.16:1).
  - **Full-Scan Icon Contrast Across All Meaningful Visible Icons (Ionicons & SVG)**:
    - Dark mode Workspace Feed: 4 visible icons scanned, all >= 3:1 (min 6.34:1, range 6.34:1 to 7.03:1).
    - Dark mode Alert Detail View: 3 visible icons scanned, all >= 3:1 (min 6.34:1, range 6.34:1 to 7.03:1).
    - Dark mode AC Lead Detail View: 3 visible icons scanned, all >= 3:1 (min 6.34:1, range 6.34:1 to 7.03:1).
    - Light mode Workspace Feed: 4 visible icons scanned, all >= 3:1 (min 4.37:1, range 4.37:1 to 12.90:1).
    - Light mode Plumbing Detail View: 3 visible icons scanned, all >= 3:1 (min 4.37:1, range 4.37:1 to 12.90:1).
  - **Representative Element Ratios**:
    - Dark mode Registration Link Text: `#FF6B35` on `#0B0E13` = **6.82:1** (>= 4.5:1).
    - Dark mode Registration Link Border: `#FF6B35` on `#0B0E13` = **6.82:1** (>= 3:1).
    - Dark mode Workspace Title: `#F0F4F9` on `#0B0E13` = **17.50:1** (>= 4.5:1).
    - Dark mode Disclaimer Banner Text: `#8897AB` on `#07090D` = **6.70:1** (>= 4.5:1).
    - Dark mode Badge Text: `#FF6B35` on `#07090D` = **7.03:1** (>= 4.5:1).
    - Dark mode CTA Normal Text & Icon: `#0B0E13` on `#FF6B35` = **6.82:1** (>= 4.5:1 text, >= 3:1 icon).
    - Dark mode CTA Pressed Text & Icon: `#0B0E13` on `#FF7D4D` = **7.63:1** (>= 4.5:1 text, >= 3:1 icon).
    - Dark mode Clickable Card Boundary: border `#8897AB` on `#13171E` = **6.04:1** (>= 3:1).
    - Dark mode Card Normal Title: `#F0F4F9` on `#13171E` = **16.26:1** (>= 4.5:1).
    - Dark mode Card Pressed Title: `#F0F4F9` on `#191E27` = **15.13:1** (>= 4.5:1).
    - Dark mode Detail Back Button Text & Icon: `#FF6B35` on `#13171E` = **6.34:1** (>= 4.5:1 text, >= 3:1 icon).
    - Dark mode AC Detail Title: `#F0F4F9` on `#13171E` = **16.26:1** (>= 4.5:1).
    - Light mode Registration Link Text: `#B34312` (`c.amberHover`) on `#F7F9FC` = **5.34:1** (>= 4.5:1).
    - Light mode Registration Link Border: `#B34312` (`c.amberHover`) on `#F7F9FC` = **5.34:1** (>= 3:1).
    - Light mode Workspace Title: `#001A41` on `#F7F9FC` = **16.27:1** (>= 4.5:1).
    - Light mode Disclaimer Banner Text: `#D6E4F5` on `#001A41` = **13.30:1** (>= 4.5:1).
    - Light mode Badge Text: `#ABEEC8` on `#001A41` = **12.90:1** (>= 4.5:1).
    - Light mode CTA Normal Text & Icon: `#FFFFFF` on `#CC4A14` = **4.61:1** (>= 4.5:1 text, >= 3:1 icon).
    - Light mode CTA Pressed Text & Icon: `#FFFFFF` on `#B34312` = **5.63:1** (>= 4.5:1 text, >= 3:1 icon).
    - Light mode Clickable Card Boundary: border `#475569` on `#FFFFFF` = **7.58:1** (>= 3:1).
    - Light mode Card Normal Title: `#001A41` on `#FFFFFF` = **17.16:1** (>= 4.5:1).
    - Light mode Card Pressed Title: `#001A41` on `#F1F3F6` = **15.43:1** (>= 4.5:1).
    - Light mode Plumbing Detail Title: `#001A41` on `#FFFFFF` = **17.16:1** (>= 4.5:1).
    - Light mode Detail Back Button Text & Icon: `#CC4A14` on `#FFFFFF` = **4.61:1** (>= 4.5:1 text, >= 3:1 icon).
- **Anti-Fabrication Audits**:
  - Zero fabricated worker names (`Babajide`, `Solomon`, `Bukie`, `John Doe`).
  - Zero email addresses, phone numbers, or exact house/plot numbers.
  - Zero live dispatch claims, push notification claims, ratings, or verification badges.
  - Timeframe, urgency, and budget explicitly designated as sample only.
- **Console and Runtime Integrity**: Zero console errors or unhandled page exceptions during the entire verification run.

## Evidence Captures

- [`expo-mob-work-001-01-register-preview-link-dark.png`](screenshots/expo-mob-work-001-01-register-preview-link-dark.png) (375x812 Portrait Dark, registration screen showing sample workspace preview link)
- [`expo-mob-work-001-02-workspace-feed-dark.png`](screenshots/expo-mob-work-001-02-workspace-feed-dark.png) (375x812 Portrait Dark, workspace preview feed with disclaimer, header, alert banner, and sample leads)
- [`expo-mob-work-001-03-alert-detail-dark.png`](screenshots/expo-mob-work-001-03-alert-detail-dark.png) (375x812 Portrait Dark, detail view opened from lead alert action)
- [`expo-mob-work-001-04-lead-detail-dark.png`](screenshots/expo-mob-work-001-04-lead-detail-dark.png) (375x812 Portrait Dark, detail view opened from AC Repair sample lead card)
- [`expo-mob-work-001-05-workspace-landscape-dark.png`](screenshots/expo-mob-work-001-05-workspace-landscape-dark.png) (844x390 Landscape Dark, responsive workspace feed, zero overflow)
- [`expo-mob-work-001-06-workspace-feed-light.png`](screenshots/expo-mob-work-001-06-workspace-feed-light.png) (375x812 Portrait Light, light theme workspace feed with contrast compliance)
- [`expo-mob-work-001-07-lead-detail-light.png`](screenshots/expo-mob-work-001-07-lead-detail-light.png) (375x812 Portrait Light, light theme lead detail view with Back button contrast compliance)

## Known Limitations

- **UI-Only Scope**: This slice implements the mobile workspace layout and in-app lead alert presentation UI only.
- **No Push Notification Infrastructure**: Actual OS push notifications, `expo-notifications`, push permission requests, device token registration, APNs/FCM delivery, and background daemons remain deferred to Phase 4.4 and backend integration.
- **No Accept/Decline Controls**: Invitation response actions belong to Phase 4.3 Item 2 (`Immediate job invitation accept/decline action modals`).
- **No Hardware Capabilities**: Location tracking, GPS check-in, camera, photo uploads, and biometrics remain deferred.
- **Physical Device Runtime, Web Accessibility Tree, and Screen Readers**: Physical iOS and Android device point scaling, Dynamic Type, assistive touch, generated web accessibility-tree semantics, and native iOS VoiceOver / Android TalkBack screen readers remain explicitly unverified; decorative icon `accessible={false}` flags are verified strictly via source-level guardrails.
