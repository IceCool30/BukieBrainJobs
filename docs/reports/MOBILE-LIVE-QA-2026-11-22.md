# Mobile Live QA Report

**Date:** 2026-11-22
**Scope:** Live pass over every route and interactive element in `apps/mobile`
**Status:** Complete with environment limitation

## Environment and method

The target device was `Galaxy_S26_Ultra_API_37`, Android 17 (API 37), 1440 by 3120, 500 dpi. The native dev build could not be produced on this Windows host, so the pass was run against the compiled Expo web runtime in headless Chromium at 430 by 932, with a small static server and SPA fallback. This is the same screen code and route tree as the native app, rendered through React Native Web. It is not a native emulator run. The distinction matters and is recorded as a limitation below.

## What the project calls done

The approved baseline is Phase 4 Native Application preview, merged in PR #68 at `17e11d3`. A route is acceptable here when it opens without crash, matches the approved MOB specification, keeps truthful preview language, gives buttons a visible result or is plainly non-interactive, keeps labels and touch targets usable, and handles validation and empty states without inventing facts.

Deferred by the project and not treated as failures: real PostgreSQL persistence, FCM push, hardware GPS, camera and biometric sensors, live account data, and physical device screen reader QA.

## Route results

All 11 routes rendered with no console errors and no page errors.

| Route | Result | Evidence |
|---|---|---|
| `/` marketing home | PASS | Hero copy, CTA labels, featured services |
| `/home` tab home | PASS | LOCAL PREVIEW banner, categories, activity card |
| `/services` | PASS | Search field, four filter pills, eight services |
| `/services/generator` | PASS | Service detail and booking entry |
| `/services/does-not-exist` | PASS | Service Not Found and Back to services |
| `/book?serviceId=generator` | PASS | Form sections, preview notice, summary |
| `/post-job` | PASS | Step 1 of 5, required fields, Continue |
| `/jobs` | PASS | Four segments, six samples, read-only cancelled record |
| `/messages` | PASS | No conversations and preview notice |
| `/profile` | PASS | LOCAL PREVIEW banner and four menu rows |
| `/brainworker/register` | PASS | Form, validation, workspace preview link |
| `/brainworker/workspace-preview` | PASS | Disclaimer, offline card, wallet, lead cards |

## Interaction results

| Check | Result | Notes |
|---|---|---|
| Home CTA Find a BrainWorker | PASS | Navigates to `/services` |
| Home CTA Become a BrainWorker | PASS | Navigates to `/brainworker/register` |
| Home CTA Post a Job | PASS | Navigates to `/post-job` |
| Services search empty state and Reset filters | PASS | Empty state appears, reset restores all services |
| Service detail to booking | PASS | Carries `serviceId=generator` |
| Booking validation on empty required fields | PASS | Error summary and highlighted fields |
| Booking full submit | NOT VERIFIED | Automation filled text inputs but did not select the required city chip. The form correctly blocked submission. This is a test gap, not an app defect. |
| Job posting validation | PASS | Step 1 blocks Continue until a job type is chosen |
| Job posting full five-step flow | NOT VERIFIED | Automation did not select chips, so Continue stayed on step 1. Test gap. |
| Jobs card opens lifecycle detail and Back to Activity | PASS | Milestone view opens and list restores |
| Jobs segment filter | PASS | Cancelled filter renders the read-only record |
| Registration validation and workspace link | PASS | Invalid submit blocked, preview link navigates |
| Workspace lead detail and accept flow | PASS | Detail opens, accept confirms, outcome appears |
| Workspace biometric unlock | PASS | Prompt opens, Simulate Success unlocks wallet |
| Workspace offline toggle and sync | PASS | Toggle switches to Simulated Offline, sync button responds |
| Workspace check-in simulation | NOT VERIFIED | Button label changed after accept; automation selector missed it |
| Profile menu rows | PASS as designed | Rows are visibly preview-only and have no press action |

## Findings

1. **Stale QA assertion.** `scripts/verify-expo-mobile-qa.mjs` asserts the old CTA colour `#FF6B35`. The current Outlier token is `#F7803C`, rendered as `rgb(247, 128, 60)`. The script aborts on step 1 even though the app matches the approved design system. This is a test defect.

2. **Native Android build blocked on this host.** The Expo dev build hit four separate environment failures in sequence: Maven Central DNS resolution, Google Maven timeouts, Windows 260 character path limits in generated `prefab_command.bat` and CMake object paths, and a Ninja `build.ninja still dirty after 100 tries` loop. Mirrors, short pnpm store paths, CMake 4.1.2, and a regenerated native project cleared the first three. The Ninja loop remains.

3. **Preview-only surfaces.** The profile rows and messages tab are static by design. They are labelled as local preview and should not be treated as broken navigation.

4. **Validation works as specified.** Booking requires a city chip and job posting requires a job type before advancing. The automation gap was in selecting chips, not in the app.

## Proposed fixes

1. Update the CTA assertion in `verify-expo-mobile-qa.mjs` to the current Outlier coral token `#F7803C`, and review other hardcoded colour expectations in the same script family. This is a small, focused test change.

2. Move native Android QA to a Linux CI runner with KVM or to EAS build. The repository already records that previous Linux containers lacked `/dev/kvm`, so this needs a runner with hardware virtualisation. Keep this Windows host for web-compiled QA only.

3. If local Windows native builds are required later, record the environment setup as a developer note: repository mirrors for Maven Central and Google Maven, `virtual-store-dir-max-length=20`, CMake 4.1.2 via `cmake.dir` in `android/local.properties`, and a checkout path without spaces. The remaining Ninja regeneration loop still needs a toolchain-level fix.

4. Extend the interaction scripts to select chips by role and accessible name so the booking submit and five-step job wizard can be verified end to end. The validation paths are already proven.

## Security, accessibility and data considerations

No secrets were used or printed. The app made no network calls and created no real booking, account, payment, or notification. Theme and preview state stayed local. No console errors were observed in any route. Touch targets and contrast were not remeasured in this pass beyond the existing scripted contrast suite, which could not run to completion because of finding 1.

## Known limitations

- This is a compiled web runtime pass, not a native emulator pass.
- Native screen reader, Dynamic Type, hardware sensors, and physical device behaviour remain unverified.
- The gate verification script and its Node test require bash, which is not available on this Windows host. The nine-skill gate was loaded and declared in session, but scripted verification could not run here.
- Three interaction flows remain unverified as noted above; each is blocked by test automation gaps rather than an observed app failure.
