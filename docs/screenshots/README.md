# BukieBrainJobs BW-010 Browser Verification Screenshots

This directory contains 17 browser verification captures for Milestone 3.4 (Dispute Handling & Support Interface, `BW-010`). All screenshots are captured against the live Next.js development server across the primary dispute route at `http://127.0.0.1:3000/disputes/book-101` and the seeded customer completion-return route at `http://127.0.0.1:3000/completion/book-101`, with zero development overlays, accurate Outlier tokens, and verified honest local prototype disclosures.

## Catalog

| Filename | Viewport | Theme | Role | Description |
|---|---|---|---|---|
| [`bw010-desktop-dark.png`](./bw010-desktop-dark.png) | 1280x800 | Dark | Customer | Active dispute view with "Back to Booking Detail" breadcrumb targeting /completion/book-101, "Dispute Workspace Preview: Dispute Resolution and Support", "LOCAL RECORD: UNDER REVIEW" badge, local preview disclaimers, and read-only disabled support ticket form. |
| [`bw010-desktop-light.png`](./bw010-desktop-light.png) | 1280x800 | Light | Customer | Active dispute view rendered in Outlier light theme tokens with "Back to Booking Detail" breadcrumb targeting /completion/book-101 and read-only disabled support ticket form. |
| [`bw010-mobile-dark.png`](./bw010-mobile-dark.png) | 375x812 | Dark | Customer | Mobile responsive active dispute view showing header, local record status badge, and preview disclosures. |
| [`bw010-mobile-light.png`](./bw010-mobile-light.png) | 375x812 | Light | Customer | Mobile responsive active dispute view in light theme. |
| [`bw010-worker-desktop-dark.png`](./bw010-worker-desktop-dark.png) | 1280x800 | Dark | BrainWorker | BrainWorker dispute response view showing "Back to Booking Detail" breadcrumb targeting /brainworker/bookings/book-101, "BrainWorker Dispute Response" role header, simulated timer pause notice, and BrainWorkerDisputeBanner with role="alert". |
| [`bw010-01-customer-initiation-modal.png`](./bw010-01-customer-initiation-modal.png) | 1280x800 | Dark | Customer | Dispute initiation modal populated with category, problem description, and prototype disclosure: "This local preview records your dispute and pauses its simulated completion timer. It does not hold, move, or release real funds." |
| [`bw010-modal-desktop-dark.png`](./bw010-modal-desktop-dark.png) | 1280x800 | Dark | Customer | Dedicated desktop dark capture of the dispute initiation modal. |
| [`bw010-modal-mobile-light.png`](./bw010-modal-mobile-light.png) | 375x812 | Light | Customer | Mobile light capture of the dispute initiation modal with corrected prototype disclosure and 44px touch targets. |
| [`bw010-02-partial-sync-failure.png`](./bw010-02-partial-sync-failure.png) | 1280x800 | Dark | Customer | Partial synchronization failure state showing unconfirmed header status, red recovery alert with failure details, and the "Retry Local Status Update" button. |
| [`bw010-03-customer-dispute-filed-synced.png`](./bw010-03-customer-dispute-filed-synced.png) | 1280x800 | Dark | Customer | Successful recovery state after clicking "Retry Local Status Update", showing the alert dismissed, synchronized local status, and paused simulated timer text. |
| [`bw010-04-worker-counter-modal.png`](./bw010-04-worker-counter-modal.png) | 1280x800 | Dark | BrainWorker | Worker counter-evidence modal dialog showing populated uploader (pressure_gauge_test.png, 193 KB), enabled submit action, and honest prototype disclosure: "This local preview records your counter-evidence on this simulated dispute record for booking book-101. All submitted attachments are recorded on the local preview timeline. It does not hold, move, or release real funds, and no platform mediator has been contacted." |
| [`bw010-05-counter-evidence-submitted.png`](./bw010-05-counter-evidence-submitted.png) | 1280x800 | Dark | BrainWorker | Audit timeline and Submitted Evidence gallery showing appended and attributed BrainWorker counter-evidence (pressure_gauge_test.png, Uploaded by BrainWorker • 193 KB) alongside customer attachments, with matching COUNTER_EVIDENCE_SUBMITTED timeline event. |
| [`bw010-06-navigation-retention.png`](./bw010-06-navigation-retention.png) | 1280x800 | Dark | Customer | Booking A-to-B navigation retention and state isolation showing clean route /disputes/book-102 with REF: book-102 and un-disputed state ("File a Booking Dispute") free of residual state or errors from book-101. |
| [`bw010-07-offline-state.png`](./bw010-07-offline-state.png) | 1280x800 | Dark | Customer | Reactive offline state showing top warning banner: "Device is currently offline. Mutation actions are disabled until connection is restored." |
| [`bw010-08-customer-completion-return.png`](./bw010-08-customer-completion-return.png) | 1280x800 | Dark | Customer | Customer return flow at /completion/book-101 reached via "Back to Booking Detail", showing disabled "Inspect & Release Escrow", disabled "Dispute Active" action, "Dispute Active: Auto-Release Paused" badge, and truthful local preview notice stating that simulated completion countdown is paused while dispute is active without holding real funds. |
| [`bw010-tablet-dark.png`](./bw010-tablet-dark.png) | 768x1024 | Dark | Customer | Responsive tablet capture in Outlier dark theme with "Back to Booking Detail" breadcrumb targeting /completion/book-101, verified honest local preview copy, and LOCAL RECORD: UNDER REVIEW status badge. |
| [`bw010-tablet-light.png`](./bw010-tablet-light.png) | 768x1024 | Light | Customer | Responsive tablet capture in Outlier light theme with "Back to Booking Detail" breadcrumb targeting /completion/book-101, verified honest local preview copy, and LOCAL RECORD: UNDER REVIEW status badge. |

---

# BukieBrainJobs MOB-001 Mobile Discovery Screenshots & Video

This section catalogs the 9 compiled Expo mobile screen verification captures and continuous video recording for Milestone 4.2.1 (Native Public Discovery, `MOB-001`). All captures verify the standalone marketing homepage (`app/index.tsx`), the category directory (`app/(tabs)/services.tsx`), the service detail screen (`app/services/[id].tsx`), and the not-found fallback across 375x812 mobile portrait, 812x375 landscape, safe areas, and 48dp touch targets. The formal QA report is available at [`../reports/MOB-001-compiled-expo-qa.md`](../reports/MOB-001-compiled-expo-qa.md).

## Native Simulator and Emulator Environment Audit & Status

- **Execution Environment**: Linux container (`Linux 55d52da071bf x86_64`).
- **iOS Simulator (`xcrun simctl`)**: UNAVAILABLE. The iOS Simulator strictly requires macOS and Xcode; it is not supported on Linux. The authorized host inventory was checked (Termux, Cloud Shell, Codespace, Colab, active container); zero macOS hosts exist. No iOS testing is claimed.
- **Android Emulator Workflow Audit**:
  - Android SDK command-line tools (`cmdline-tools`), `platform-tools` (adb 37.0.1), and `emulator` (37.2.13.0) were installed in the container environment.
  - Hardware acceleration (`/dev/kvm`) is missing in this container. CPU inspection (`/proc/cpuinfo`) reveals zero hardware virtualization flags (`vmx|svm = 0`).
  - Tested 4 distinct system image configurations under software emulation (`-no-accel`):
    1. `android-36 x86_64 google_apis_playstore`: Failed due to lack of AVX/F16C instructions in QEMU TCG.
    2. `android-30 x86_64 google_apis`: Failed due to Ranchu userdata keystore encryption failure in TCG leaving `/data` unmounted.
    3. `android-30 x86 aosp_atd`: Booted `surfaceflinger`, `zygote`, and reached ADB `device` state, but `PackageManagerService` remained blocked for >15 minutes due to sequential cryptographic hashing of 21 APEX packages (~20.7s per package under TCG).
    4. `android-28 x86 default` (`pie_phone`): Booted with SwiftShader software rendering to ADB `device` state, but `/data` partition failed to mount during `post-fs-data` initialization without native hardware acceleration.
  - **Android Native Coverage Status**: UNAVAILABLE without hardware virtualization (`/dev/kvm`), physical device attachment via ADB, or remote cloud device infrastructure.
- **Real Compiled Expo Mobile App QA (Browser/Device Emulation)**:
  - Exported the real, compiled Expo mobile application using `expo export --platform web --output-dir dist-web` directly from `apps/mobile`.
  - Driven by Playwright Chromium (`scripts/verify-expo-mobile-qa.mjs`) emulating mobile device viewports (375x812 portrait and 812x375 landscape) with touch events enabled.
  - Exercised the complete discovery user journey: standalone marketing homepage (`app/index.tsx`), navigation via CTA to services catalog (`app/(tabs)/services.tsx`), live text search with query "AC", search clear action, category filter pill "Utilities & Structure", non-matching empty state search, reset filters action, navigation to service detail (`app/services/[id].tsx`), landscape orientation, back navigation to catalog, and invalid service ID fallback screen.
  - Verified amber primary CTA (`rgb(255, 107, 53)`), 48x48dp touch targets, and source-level safe-area boundaries across all interactive elements (native OS safe-area runtime insets remain unavailable in browser emulation).

## Compiled Expo App Continuous Recording (Browser/Device Emulation)

- **File**: [`expo-mob001-discovery-verification.webm`](./videos/expo-mob001-discovery-verification.webm)
- **Description**: Continuous video recording of the actual compiled Expo mobile application running on `react-native-web` and `expo-router` in mobile device emulation. Covers homepage portrait/landscape, navigation to services catalog, live search, category filter pill, empty state, filter reset, service detail drill-down, landscape detail, back navigation, and invalid ID fallback.

## Compiled Expo App Screenshot Catalog

| Filename | Viewport | Orientation | Screen / Surface | Description |
|---|---|---|---|---|
| [`expo-mob001-01-homepage-portrait.png`](./expo-mob001-01-homepage-portrait.png) | 375x812 | Portrait | Standalone Homepage (`app/index.tsx`) | Compiled Expo marketing homepage showing brand wordmark, hero value prop, exact amber primary CTA (`#FF6B35` / `rgb(255, 107, 53)`), 48dp CTA buttons, "View all services" link (>= 48x48dp target), and featured service rows routing to `/(tabs)/services`. |
| [`expo-mob001-02-homepage-landscape.png`](./expo-mob001-02-homepage-landscape.png) | 812x375 | Landscape | Standalone Homepage (`app/index.tsx`) | Compiled Expo marketing homepage rendered in 812x375 landscape viewport showing responsive hero and action buttons. |
| [`expo-mob001-03-services-catalog-all.png`](./expo-mob001-03-services-catalog-all.png) | 375x812 | Portrait | Category Directory (`app/(tabs)/services.tsx`) | Compiled Expo services tab showing "Services" header, LOCAL PREVIEW notice card, accessible search input, 4 text-only filter pills with "All" selected, and 8 canonical service cards. |
| [`expo-mob001-04-services-catalog-search-ac.png`](./expo-mob001-04-services-catalog-search-ac.png) | 375x812 | Portrait | Search Filtering (`app/(tabs)/services.tsx`) | Live search with query "AC" populated in search input, 48x48dp clear button rendered, and matching catalog cards displayed (including Generator Servicing & Repair and AC Repair & Gas Refill). |
| [`expo-mob001-05-services-catalog-filter-utilities.png`](./expo-mob001-05-services-catalog-filter-utilities.png) | 375x812 | Portrait | Category Filter (`app/(tabs)/services.tsx`) | Active "Utilities & Structure" pill filtering catalog to exactly 2 cards: Plumbing & Pipe Fitting and Electrical & Solar Inverter with selected state. |
| [`expo-mob001-06-services-catalog-empty-state.png`](./expo-mob001-06-services-catalog-empty-state.png) | 375x812 | Portrait | Empty State (`app/(tabs)/services.tsx`) | Non-matching search query "xyznonexistent123" displaying zero service cards, "No matching services found" notice, and 48dp "Reset filters" button. |
| [`expo-mob001-07-service-detail-generator.png`](./expo-mob001-07-service-detail-generator.png) | 375x812 | Portrait | Service Detail (`app/services/[id].tsx`) | Generator Servicing & Repair screen with 48x48 back button, category tag, task checklist, and truthful LOCAL PREVIEW card. |
| [`expo-mob001-08-service-detail-landscape.png`](./expo-mob001-08-service-detail-landscape.png) | 812x375 | Landscape | Service Detail (`app/services/[id].tsx`) | Service detail screen in 812x375 landscape orientation showing responsive layout and 48dp touch targets. |
| [`expo-mob001-09-service-detail-notfound.png`](./expo-mob001-09-service-detail-notfound.png) | 375x812 | Portrait | Not-Found Fallback (`app/services/[id].tsx`) | Invalid service ID screen showing alert icon, "Service Not Found" heading, and 48dp "Back to services directory" button. |

## Deprecated Viewport Artifacts (Historical Reference)

The following artifacts were captured from an earlier standalone HTML replica (`preview-discovery.html` via `scripts/verify-mobile-discovery-qa.mjs`) and are retained strictly for historical review:
- [`mob001-discovery-verification.webm`](./videos/mob001-discovery-verification.webm)
- [`mob001-01-homepage-portrait.png`](./mob001-01-homepage-portrait.png) through [`mob001-10-service-detail-large-text.png`](./mob001-10-service-detail-large-text.png)

---

# BukieBrainJobs MOB-POST-001 Mobile Job Posting Screenshots & Video

This section catalogs the 6 compiled Expo mobile screen verification captures and continuous video recording for Milestone 4.2.2 (Multi-Step Native Job Posting Flow, `MOB-POST-001`). All captures verify the native multi-step job posting route (`app/post-job.tsx`) across 375x812 mobile portrait viewport, retaining source-level SafeAreaView boundaries (hardware safe-area insets remain unverified in browser emulation), accessible form controls, and React Native 48 logical-unit styles plus >= 48 CSS-pixel browser emulation (native dp/pt unverified) in the actual compiled Expo application.

## Compiled Expo App Continuous Recording

- **File**: [`expo-mob-post-001-job-posting-verification.webm`](./videos/expo-mob-post-001-job-posting-verification.webm)
- **Description**: Continuous video recording of the compiled Expo mobile application demonstrating the 5-step job posting journey: requirement selection, location input, schedule choice, budget entry with formatted currency, review summary with formatted budget row, and local request preview with reference code.

## Compiled Expo App Screenshot Catalog

| Filename | Viewport | Orientation | Screen / Step | Description |
|---|---|---|---|---|
| [`expo-mob-post-001-01-requirement-action.png`](./expo-mob-post-001-01-requirement-action.png) | 375x812 | Portrait | Step 1: Job Requirement (`app/post-job.tsx`) | Step 1 of job posting showing the Service category section with category options, job title input populated with "Service a 5kVA generator", description populated, and visible Continue button scrolled into view. |
| [`expo-mob-post-001-02-location-action.png`](./expo-mob-post-001-02-location-action.png) | 375x812 | Portrait | Step 2: Location (`app/post-job.tsx`) | Step 2 with canonical city "Lagos" selected, street address input populated with "14 Admiralty Way, Lekki Phase 1", Back button, and Continue button. |
| [`expo-mob-post-001-03-schedule-action.png`](./expo-mob-post-001-03-schedule-action.png) | 375x812 | Portrait | Step 3: Schedule (`app/post-job.tsx`) | Step 3 with timing preference "Flexible / Within a week" selected, Back button, and Continue button. |
| [`expo-mob-post-001-04-budget-preference.png`](./expo-mob-post-001-04-budget-preference.png) | 375x812 | Portrait | Step 4: Budget Preference (`app/post-job.tsx`) | Standalone budget step showing optional budget amount populated ("25000"), "Fixed" budget type chip selected, live helper display formatted as "₦25,000 (Fixed)", and accessible Continue button. |
| [`expo-mob-post-001-05-review-summary.png`](./expo-mob-post-001-05-review-summary.png) | 375x812 | Portrait | Step 5: Review (`app/post-job.tsx`) | Review step summarizing all entered job requirements, location, schedule, and budget formatted as "₦25,000 (Fixed)" with mock-auth notice and edit step action. |
| [`expo-mob-post-001-06-local-preview-complete.png`](./expo-mob-post-001-06-local-preview-complete.png) | 375x1195 | Portrait | Local Request Preview (`app/post-job.tsx`) | Completed local request preview captured from top header down to generated local reference (REQ-93130), summary card, edit step actions, and disabled "Preview ready" button. |

---

# BukieBrainJobs MOB-WORK-002 Native BrainWorker Workspace Immediate Invitation Action Modals Screenshots

This section catalogs the 7 compiled Expo mobile screen verification captures for Milestone 4.3 (BrainWorker Native Experiences, `MOB-WORK-002`). All captures verify the native immediate job invitation accept/decline action modals on the BrainWorker workspace preview route (`app/brainworker/workspace-preview.tsx`) across 375x812 mobile portrait viewport, retaining truthful simulated prototype disclosures, 6 canonical BW-003 decline reasons, local in-memory outcome cards, theme contrast compliance (Dark and Light), and zero backend mutations.

## Compiled Expo App Screenshot Catalog

| Filename | Viewport | Orientation | Theme | Screen / State | Description |
|---|---|---|---|---|---|
| [`expo-mob-work-002-01-invitation-actions-dark.png`](./expo-mob-work-002-01-invitation-actions-dark.png) | 375x812 | Portrait | Dark | Invitation Actions Card (`app/brainworker/workspace-preview.tsx`) | Alert detail inspection showing the dedicated SAMPLE INVITATION ACTIONS card for Generator Servicing & Repair with LOCAL PREVIEW badge, truthful simulation disclaimer, and React Native 48 logical-unit Accept and Decline buttons (browser CSS >= 48x48 measurement, native dp/pt unverified) in Outlier dark theme. |
| [`expo-mob-work-002-02-accept-modal-dark.png`](./expo-mob-work-002-02-accept-modal-dark.png) | 375x812 | Portrait | Dark | Accept Confirmation Modal (`app/brainworker/workspace-preview.tsx`) | Transparent overlay modal confirming acceptance preview with explicit disclaimer that no server booking or provider commitment is made, Cancel button, and Confirm button in Outlier dark theme. |
| [`expo-mob-work-002-03-accepted-outcome-dark.png`](./expo-mob-work-002-03-accepted-outcome-dark.png) | 375x812 | Portrait | Dark | Accepted Outcome Card (`app/brainworker/workspace-preview.tsx`) | In-memory simulated accepted outcome card showing green accent border, truthful local preview notice, and accessible Reset preview outcome button in Outlier dark theme. |
| [`expo-mob-work-002-04-decline-modal-dark.png`](./expo-mob-work-002-04-decline-modal-dark.png) | 375x812 | Portrait | Dark | Decline Modal: 6 Reasons (`app/brainworker/workspace-preview.tsx`) | Single-choice decline reason modal listing all 6 canonical BW-003 reasons with accessible radio buttons, disabled confirmation until selection, and Cancel action in Outlier dark theme. |
| [`expo-mob-work-002-05-declined-outcome-dark.png`](./expo-mob-work-002-05-declined-outcome-dark.png) | 375x812 | Portrait | Dark | Declined Outcome Card (`app/brainworker/workspace-preview.tsx`) | In-memory simulated declined outcome card showing amber accent border, selected reason label, truthful local simulation notice, and Reset preview outcome button in Outlier dark theme. |
| [`expo-mob-work-002-06-invitation-actions-light.png`](./expo-mob-work-002-06-invitation-actions-light.png) | 375x812 | Portrait | Light | Invitation Actions Card: Light (`app/brainworker/workspace-preview.tsx`) | Alert detail invitation actions card rendered in Outlier light theme tokens with verified button border contrast and legible action text. |
| [`expo-mob-work-002-07-decline-modal-light.png`](./expo-mob-work-002-07-decline-modal-light.png) | 375x812 | Portrait | Light | Decline Modal: Light (`app/brainworker/workspace-preview.tsx`) | Decline modal dialog rendered in Outlier light theme tokens showing all 6 canonical decline reasons with verified radio border contrast and Cancel button. |

---

# BukieBrainJobs MOB-WORK-003 Native BrainWorker On-Site Check-In Location Simulation Preview Screenshots

This section catalogs the 7 compiled Expo mobile screen verification captures for Milestone 4.3 (BrainWorker Native Experiences, `MOB-WORK-003`). All captures verify the native on-site check-in location simulation preview on the BrainWorker workspace preview route (`app/brainworker/workspace-preview.tsx`) in Chromium browser emulation of a compiled Expo Web export (`expo export --platform web` built to a temporary directory outside the git tree and served with SPA fallback). Hardware device sensors, native iOS/Android permissions, live GPS fixes, and native Dynamic Type are explicitly not claimed.

## Test Commands and Verification Results

- Focused Verifier Unit Test: `node scripts/verify-expo-workspace.test.mjs` (7 passed, 0 failed)
- Guardrails Unit Test Suite: `pnpm --filter @bukiebrainjobs/mobile test app/worker-workspace.test.ts` (34 passed, 0 failed)
- Helper Unit Test Suite: `pnpm --filter @bukiebrainjobs/mobile test lib/worker-workspace-preview.test.ts` (11 passed, 0 failed)
- Independent M3 Browser QA Run: `node scripts/verify-expo-workspace.mjs --slice=MOB-WORK-003` (PASSED cleanly)
- Verified M3 Interactions:
  - Acceptance of sample lead `lead_gen_01` into local in-memory accepted outcome.
  - Inline check-in preview expansion with `CheckInEntryButton` (`Preview on-site check-in`).
  - State 1 initial unsimulated arrival layout (`SAMPLE LOCATION SIMULATION`, `LOCAL PREVIEW ONLY`, `Arrival Snapshot: Not simulated`, `CONFIRMED (Sample)`) captured after opening the inline check-in panel and before simulation.
  - Single-tap check-in simulation triggering State 2 (`SIMULATED ARRIVAL (Preview)` and `Arrival view previewed in memory`).
  - Strict preservation of booking status tag (`CONFIRMED (Sample)`) with zero status changes and no dialog/modal popups.
  - In-memory reset via `Reset location simulation` cleanly restoring State 1 without unmounting the check-in section.
  - OS-preference check verifying that browser `prefers-color-scheme: light` does not override the app-selected obsidian dark theme tokens while the app remains in dark mode.
  - App-selected light mode verification toggled via the accessible home-screen theme toggle (`Switch to light mode`), verifying saved light tokens and WCAG AA contrast on the expanded inline check-in panel.
  - Compact landscape viewport (844x390) with zero horizontal overflow.
  - Clearly labelled 125% browser text-scaling proxy with zero horizontal overflow and legible labels.
  - Zero external network requests, zero location sensor calls, and zero console/page errors.

## Compiled Expo App Screenshot Catalog

| Filename | Viewport | Orientation | Theme / Mode | Screen / State | Description |
|---|---|---|---|---|---|
| [`expo-mob-work-003-01-checkin-ready-dark.png`](./expo-mob-work-003-01-checkin-ready-dark.png) | 375x812 | Portrait | Obsidian Dark | State 1: Initial Unsimulated View (`app/brainworker/workspace-preview.tsx`) | Inline check-in simulation section captured after expanding the inline check-in panel and before simulation, showing `SAMPLE LOCATION SIMULATION` eyebrow, `LOCAL PREVIEW ONLY` badge, mandatory location simulation disclaimer, sample job card (`CONFIRMED (Sample)`), schematic card with `Arrival Snapshot: Not simulated`, and `Simulate on-site check-in` button (minHeight: 48). |
| [`expo-mob-work-003-02-checkin-simulated-dark.png`](./expo-mob-work-003-02-checkin-simulated-dark.png) | 375x812 | Portrait | Obsidian Dark | State 2: Simulated Outcome View (`app/brainworker/workspace-preview.tsx`) | Simulated arrival view showing `SAMPLE CHECK-IN SIMULATED`, `SIMULATED ARRIVAL (Preview)` status badge, `Arrival view previewed in memory` verification stamp, temporary preview boundary disclaimer, and `Reset location simulation` button. No modal appeared and booking status remains unmutated. |
| [`expo-mob-work-003-03-checkin-reset-dark.png`](./expo-mob-work-003-03-checkin-reset-dark.png) | 375x812 | Portrait | Obsidian Dark | State 1: Restored Unsimulated View (`app/brainworker/workspace-preview.tsx`) | Clean return to State 1 following tap on `Reset location simulation`. `Arrival Snapshot: Not simulated` and `Simulate on-site check-in` are restored in memory while keeping the check-in section open. |
| [`expo-mob-work-003-04-checkin-simulated-light-scheme.png`](./expo-mob-work-003-04-checkin-simulated-light-scheme.png) | 375x812 | Portrait | prefers-color-scheme: light (App Dark Retained) | OS-Preference Test While App Remains Dark (`app/brainworker/workspace-preview.tsx`) | Separate OS-preference test under browser `prefers-color-scheme: light` verifying retention of obsidian dark tokens while the app-selected theme remains dark, not serving as light-theme evidence. |
| [`expo-mob-work-003-05-checkin-simulated-landscape.png`](./expo-mob-work-003-05-checkin-simulated-landscape.png) | 844x390 | Landscape | Obsidian Dark | Compact Landscape View (`app/brainworker/workspace-preview.tsx`) | Responsive simulated arrival view in compact 844x390 landscape viewport with zero horizontal overflow, visible controls, and verified >= 48px touch targets. |
| [`expo-mob-work-003-06-checkin-simulated-scaled-text.png`](./expo-mob-work-003-06-checkin-simulated-scaled-text.png) | 375x812 | Portrait | 125% Text Scaling Proxy (Obsidian Dark) | Browser Text Scaling Proxy (`app/brainworker/workspace-preview.tsx`) | 125% rendered-text scaling proxy applied in browser emulation verifying zero layout overflow, legible disclaimers, and intact `SIMULATED ARRIVAL (Preview)` badge without clipping. |
| [`expo-mob-work-003-07-checkin-ready-app-light.png`](./expo-mob-work-003-07-checkin-ready-app-light.png) | 375x812 | Portrait | App-Selected Light Mode | State 1: App-Selected Light Ready View (`app/brainworker/workspace-preview.tsx`) | Route rendered in app-selected light mode activated via the accessible home-screen theme toggle (`Switch to light mode`), navigating to the accepted lead preview and expanding the inline check-in panel. Demonstrates State 1 unsimulated check-in interface with verified light tokens and WCAG AA contrast compliance. |
