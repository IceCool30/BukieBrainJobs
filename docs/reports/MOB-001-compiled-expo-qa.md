# MOB-001 Native Public Discovery: Compiled Expo Application QA & Environment Audit Report

**Date:** 2026-10-30  
**Branch:** `feature/bw-010-dispute-support` (Local uncommitted)  
**Milestone:** Phase 4.2.1 Native Public Discovery (`MOB-001`)  
**Status:** VERIFIED & PASSED (Shared bottom tab bar 75x49px >= 48dp; Milestone checked `[x]`; All 10 Playwright assertions green)  

---

## 1. Executive Summary

Per Owner and PM steering instructions:
1. Native emulator retries concluded after a final fresh test on `pie_phone` (Android 28 x86 default).
2. The authorized environment inventory was audited; zero macOS hosts exist (iOS Simulator unavailable).
3. The primary CTA on the marketing homepage (`FindWorkerButton` in `app/index.tsx`) was corrected to use exact amber (`#FF6B35` / `rgb(255, 107, 53)`) via static stylesheet flattening, eliminating the Radix Slot style wipeout bug on web.
4. Accessible search input label (`accessibilityLabel="Search services"`) and filter pill selected state (`accessibilityState={{ selected: active }}`) were added to `app/(tabs)/services.tsx`.
5. The Playwright automation script (`scripts/verify-expo-mobile-qa.mjs`) was updated with strict outcome assertions and hard failure on missing, invisible, wrong-count, or undersized touch targets (< 48x48dp), modular functions (all <= 25 lines), and repository-relative output targeting `docs/screenshots`.
6. Compiled app targets were asserted: Homepage CTA buttons (count 2, 333x48 px), View all services link (count 1, 146x48 px), 6 featured service rows (count 6, 333x62 px), services search input (count 1, 287x48 px), 4 filter pills (count 4, 85-185x48 px), 8 service cards (count 8, 339x127 px), search clear button (count 1, 48x48 px), search reset button (count 1, 118x48 px), detail/not-found back buttons (count 1 each, >= 48x48 px), and all 5 shared bottom tabs (count 5, 75x49 px) all satisfy >= 48x48dp.
7. Shared bottom tab bar geometry resolved: Per PM decision, `apps/mobile/app/(tabs)/_layout.tsx` was updated with the minimal geometry change (`BASE_TAB_BAR_HEIGHT = 64`, `tabBarItemStyle: { minHeight: 48 }`), elevating all 5 tab hit areas from 75x45 px to 75x49 px without altering colors, icons, labels, or screen content. Out-of-scope tab screens (`home.tsx`, `jobs.tsx`, `messages.tsx`, `profile.tsx`) were kept 100% untouched.
8. Verified across 375x812 mobile portrait and 812x375 landscape. Safe-area handling is confirmed at the source code level, while native OS runtime insets are marked as unavailable in browser emulation.
9. Local Metro bundling was tested across all platforms: Following alignment of transitive `react-native-screens` to the Expo SDK 52 bundled version (`~4.4.0`), static export succeeded 100% across Web (1.43 MB), Android (2.88 MB Hermes bytecode), and iOS (2.89 MB Hermes bytecode).
10. All 46/46 mobile unit and integration tests are 100% green across 6 suites.
11. Documentation across [docs/master-checklist.md](../master-checklist.md), [docs/scope.md](../scope.md), [docs/check-log.md](../check-log.md), and [docs/screenshots/README.md](../screenshots/README.md) was updated with truthful availability labels without false native claims.

---

## 2. Native Environment Audit & Hardware Boundaries

### iOS Simulator Status: UNAVAILABLE
- **Requirement:** Apple iOS Simulator strictly requires macOS and Xcode (`xcrun simctl`).
- **Inventory Audit:** Checked all 5 authorized environments:
  - Termux on Android: Linux ARM64
  - Google Cloud Shell: Linux x86_64 Debian VM
  - Cloud Codespace: Linux x86_64 Ubuntu VM
  - Google Colab: Linux x86_64 GCP GPU VM
  - Local container: Linux x86_64 Ubuntu (`55d52da071bf`)
- **Finding:** Zero macOS hosts exist in the authorized inventory. No native iOS claims are made.

### Android Emulator Status: UNAVAILABLE
- **Requirement:** Official Android emulator hardware acceleration requires `/dev/kvm`.
- **Hardware Audit:** `/proc/cpuinfo` confirms zero virtualization flags (`vmx|svm = 0`). The container cannot load KVM modules.
- **Tested Configurations Under Software Emulation (`-no-accel`):**
  1. `android-36 x86_64 google_apis_playstore`: Failed due to missing AVX/F16C instruction support in QEMU TCG.
  2. `android-30 x86_64 google_apis`: Failed due to Ranchu userdata keystore encryption failure in TCG leaving `/data` unmounted.
  3. `android-30 x86 aosp_atd`: Booted `surfaceflinger`, `zygote`, and reached ADB `device` state, but `PackageManagerService` remained unpublished for >15 minutes due to sequential cryptographic hashing of 21 APEX packages (~20.7s per package under TCG).
  4. `android-28 x86 default` (`pie_phone`): Booted with SwiftShader software rendering to ADB `device` state, but `/data` partition failed to mount during `post-fs-data` initialization without native hardware acceleration.
- **Finding:** Native Android emulator execution is impossible in this environment without hardware virtualization (`/dev/kvm`), physical device attachment via ADB, or remote cloud device infrastructure.

### Metro Platform Export Audit: ALL PLATFORMS VERIFIED (Web, Android, iOS)
- **Root Cause & Dependency Alignment:** An unpinned transitive peer dependency previously pulled `react-native-screens@4.27.0` (incompatible with React Native 0.76 codegen). Pinned `"react-native-screens": "~4.4.0"` (the official Expo SDK 52 bundled version) in `apps/mobile/package.json` and root overrides.
- **Web Export:** `pnpm --filter @bukiebrainjobs/mobile exec expo export --platform web --output-dir dist-web` succeeded cleanly (1.43 MB JS bundle).
- **Android Export:** `pnpm --filter @bukiebrainjobs/mobile exec expo export --platform android` succeeded cleanly (2.88 MB Hermes bytecode `.hbc` bundle, 981 modules).
- **iOS Export:** `pnpm --filter @bukiebrainjobs/mobile exec expo export --platform ios` succeeded cleanly (2.89 MB Hermes bytecode `.hbc` bundle, 984 modules).

---

## 3. Real Compiled Expo Mobile App QA (Browser and Device Emulation)

The compiled Expo mobile app was built for web:
```bash
pnpm --filter @bukiebrainjobs/mobile exec expo export --platform web --output-dir dist-web
```

Driven by Playwright Chromium (`scripts/verify-expo-mobile-qa.mjs`) simulating iPhone viewport (375x812 portrait and 812x375 landscape with touch enabled):

| Step | Action | Outcome Assertion / Verification | Artifact |
|---|---|---|---|
| 1 | Load Marketing Homepage | Brand wordmark, hero value prop, exact amber primary CTA (`#FF6B35` / `rgb(255, 107, 53)`), 48dp CTA buttons (count: 2, 333x48), "View all services" link (count: 1, 146x48), 6 featured rows (count: 6, 333x62) | [`expo-mob001-01-homepage-portrait.png`](../screenshots/expo-mob001-01-homepage-portrait.png) |
| 2 | Switch to Landscape | 812x375 horizontal layout, responsive spacing, touch targets preserved | [`expo-mob001-02-homepage-landscape.png`](../screenshots/expo-mob001-02-homepage-landscape.png) |
| 3 | Click CTA to Services Catalog | Single "Services" header, LOCAL PREVIEW card, search input (count: 1, 287x48), 4 filter pills (count: 4, 85-185x48), 8 service cards (count: 8, 339x127), shared bottom tab bar (count: 5, 75x49) | [`expo-mob001-03-services-catalog-all.png`](../screenshots/expo-mob001-03-services-catalog-all.png) |
| 4 | Search Queries "AC" and "AC Repair" | Query "AC" positively includes AC card; 48x48 clear button verified (count: 1); query "AC Repair" uniquely matches AC Repair & Gas Refill; clear click restores all 8 cards | [`expo-mob001-04-services-catalog-search-ac.png`](../screenshots/expo-mob001-04-services-catalog-search-ac.png) |
| 5 | Filter Pill "Utilities & Structure" | Pill selected state active; filters list to exactly 2 cards: Plumbing & Pipe Fitting and Electrical & Solar Inverter | [`expo-mob001-05-services-catalog-filter-utilities.png`](../screenshots/expo-mob001-05-services-catalog-filter-utilities.png) |
| 6 | Search Query "xyznonexistent123" | Empty state displays zero cards; "No matching services found" notice verified; reset button verified with 48dp target (count: 1, 118x48); click restores all 8 cards | [`expo-mob001-06-services-catalog-empty-state.png`](../screenshots/expo-mob001-06-services-catalog-empty-state.png) |
| 7 | Click "Generator Servicing & Repair" | Detail screen, 48x48 back button (count: 1), category tag, task checklist, LOCAL PREVIEW card | [`expo-mob001-07-service-detail-generator.png`](../screenshots/expo-mob001-07-service-detail-generator.png) |
| 8 | Detail in Landscape | 812x375 landscape orientation, responsive task grid, back target >= 48dp | [`expo-mob001-08-service-detail-landscape.png`](../screenshots/expo-mob001-08-service-detail-landscape.png) |
| 9 | Click Back Button | Navigation cleanly returns to `/services` catalog | Verified |
| 10 | Route `/services/non-existent-999` | "Service Not Found" heading, alert icon, 48dp "Back to services directory" button (count: 1, 233x48) | [`expo-mob001-09-service-detail-notfound.png`](../screenshots/expo-mob001-09-service-detail-notfound.png) |

Continuous video recording: [`expo-mob001-discovery-verification.webm`](../screenshots/videos/expo-mob001-discovery-verification.webm).

### Target Size Audit & Shared Bottom Tab Bar Resolution
- **Verified Targets (>= 48x48dp)**:
  - Homepage CTA Buttons: count 2, 333x48 px (VERIFIED)
  - Homepage View all services: count 1, 146x48 px (VERIFIED)
  - Homepage Featured Service Rows: count 6, 333x62 px (VERIFIED)
  - Services Search Input: count 1, 287x48 px (VERIFIED)
  - Services Filter Pills: count 4, 85x48 to 185x48 px (VERIFIED)
  - Services Catalog Cards: count 8, 339x127 px (VERIFIED)
  - Search Clear Button: count 1, 48x48 px (VERIFIED)
  - Search Reset Button: count 1, 118x48 px (VERIFIED)
  - Detail & Not-Found Back Buttons: count 1 each, >= 48x48 px (VERIFIED)
  - Shared Bottom Tab Bar: count 5, 75x49 px (VERIFIED, all 5 tabs >= 48x48dp)
- **Shared Bottom Tab Bar Geometry Resolution**:
  - Initial measurement rendered at 75x45 px due to `BASE_TAB_BAR_HEIGHT = 60` with 14px total vertical padding and 1px border.
  - Per PM decision, updated `BASE_TAB_BAR_HEIGHT` to 64 and added `tabBarItemStyle: { minHeight: 48 }` in `apps/mobile/app/(tabs)/_layout.tsx`.
  - Re-measured on compiled Expo application: all 5 tab items now measure exactly 75x49 px, passing the hard assertion in `verifyBottomTabBar`.
  - Added unit regression test in `apps/mobile/app/tabs.test.ts` enforcing minimum 48dp content height and `tabBarItemStyle.minHeight`.
  - Out-of-scope tab screens (`home.tsx`, `jobs.tsx`, `messages.tsx`, `profile.tsx`) were kept 100% untouched.

### Safe Area Handling Assessment
- **Source Level:** Verified via unit tests (`app/safe-area.test.ts` 8/8 passing). Root layout wraps screens in `SafeAreaProvider`; marketing homepage and detail screens declare `edges={['top', 'left', 'right', 'bottom']}`; tab screens declare `edges={['left', 'right']}` to avoid double-inset overrides.
- **Runtime Level:** Browser device emulation cannot execute native OS window insets or notch cutouts; native runtime safe-area verification is therefore marked unavailable.

---

## 4. Test Suite and Build Gates

- **Mobile Unit & Integration Tests:** 46/46 passed across 6 test suites (`vitest run` in `apps/mobile`).
- **Mobile TypeScript Compiler:** 0 errors (`tsc --noEmit`).
- **Playwright Compiled-App QA:** 10/10 steps and assertions passed with exit code 0 (`[QA Flow] All 10 verification steps and assertions passed.`). All visible interactive elements (CTA buttons, View all services, featured rows, search input, filter pills, service cards, clear, reset, back buttons, and all 5 shared bottom tabs) verified >= 48x48dp.
- **Skill Gate Guard:** Passed (`bash scripts/check-skill-gate.sh`).
- **Git Diff Hygiene:** Passed cleanly with 0 whitespace issues and strictly 0 em dashes.
- **Untouched Scope Boundary:** Zero modifications to `apps/mobile/app/(tabs)/home.tsx`, `jobs.tsx`, `messages.tsx`, and `profile.tsx`.
- **Database and Backend Boundary:** Zero database schema, SQL, migration, or backend changes.
- **Deployment Boundary:** Zero commits, pushes, PRs, EAS cloud uploads, or deployments.
- **Overall Milestone Status:** VERIFIED & COMPLETED (Milestone checked `[x]`).
