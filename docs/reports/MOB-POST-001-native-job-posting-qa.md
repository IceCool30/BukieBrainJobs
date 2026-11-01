# MOB-POST-001 Native Job Posting QA

Mandatory Skill Gate: PASS.

**Status:** The actual Expo app passed the recorded browser-emulation checks. PM acceptance remains pending. Native iOS/Android and assistive-technology behavior is not verified.

## Runtime emulation

The 50-check audit covered these viewport configurations across the five steps and Local request preview:

| Viewport | Theme and orientation | Result |
|---|---|---|
| 390 × 844 | Light, portrait | All steps and preview checked; no horizontal overflow. |
| 844 × 390 | Dark, landscape | All steps and preview checked; no horizontal overflow. |
| 375 × 812 | Dark, portrait | All steps and preview checked; no horizontal overflow. |

The full Expo smoke run also passed title validation, Back draft retention, Review editing, the five-step flow, Local request preview, simulated preview failure and Retry, and overflow checks at 375 and 390 CSS pixels.

Both browser-emulated canvas checks passed: dark `rgb(11, 14, 19)` and light `rgb(247, 249, 252)`. The browser run confirms the approved light-mode rendering path, while native-device behavior remains unverified.

The audit recorded 25 standard passes, 18 browser-measured touch-target passes, one reduced-motion browser pass, one browser-zoom observation, one limited browser safe-area result, and four native-only checks as unverified. All 18 touch-target checks found no control below 44 or 48 CSS pixels, with the smallest measured control at 48 CSS pixels. These are browser CSS-pixel measurements, not native points or density-independent pixels.

Browser keyboard tab order and text entry passed. Browser `prefers-reduced-motion` emulation showed zero animations while the step remained visible. A 200% browser-zoom proxy was observed, not treated as Dynamic Type. Browser safe-area insets were zero; the top control was 48 × 48 CSS pixels at x=18, y=18 inside the viewport. Raw audit log: `/tmp/cue-cline-review/expo-emulation-acceptance.log`.

## Focus RED/GREEN evidence

The clean RED run recorded eight focus timeouts: Back from Location, Schedule, Budget and Review, plus Edit Job Requirement, Location, Schedule and Budget. It ended with `FAIL: back/edit focus check failed`; the verifier exits with code 1 on failure and the clean log contains no PASS lines. After the focus-restoration fix, the GREEN run recorded PASS for all eight checks and ended with `PASS: back/edit focus check`. The [runtime verifier](../../scripts/verify-expo-post-job-journey.mjs) checks active-element identity for each target. The captured logs are `/tmp/cue-cline-review/back-edit-focus-red-clean.log` and `/tmp/cue-cline-review/back-edit-focus-green.log`.

## Tests and type-check

The test-only refactor preserves all 13 fields, all three invalid values, all 39 field/value pairs, the test name, and the existing assertions. The focused helper test passed 46/46. The full mobile suite now passes 14 files and 136/136 tests: the original 128 plus 8 new native-accessibility-focus regression cases. An AST check found every function-like declaration and callback within limits: route 63 declarations, max 25 lines; new regression 21 declarations, max 13 lines; helper 33 declarations, max 21 lines; helper tests 60 declarations, max 24 lines; existing Expo runner 44 declarations, max 24 lines.

`pnpm --filter @bukiebrainjobs/mobile type-check` exits 2 with exactly the same 11 known baseline diagnostics: ten unused `@ts-expect-error` directives and one booking-focus type mismatch in `app/book.tsx`. Output is byte-identical to the pre-fix run. The changed route and new test add no diagnostic. TypeScript is not green.

The skill-gate script passed before edits and after verification.

## Native accessibility focus correction

A focused regression isolated and executed the route's actual `usePostJobEffects` function declarations with mocked React and native boundaries. RED ran 8 cases with 5 actual native-behavior assertion failures and 3 passes; the route was byte-identical to the pre-task baseline during RED. GREEN ran the same command with 8/8 passing after the minimal route change.

Implementation, route-local only:
- Added `Platform` to the `react-native` import.
- Added a nine-line `focusNativeElement(target)` helper. On web it calls `target?.focus?.()` and returns, so DOM focus is preserved and no native API runs. On native it returns early for a null target, calls `findNodeHandle(target)`, and calls `AccessibilityInfo.setAccessibilityFocus(node)` only when `node !== null`, including a zero handle.
- The existing common pending-focus effect now delegates to `focusNativeElement(ref?.current ?? null)`. Animation-frame scheduling, cleanup, state, focus destinations, announcements, navigation, draft retention, validation, local preview, error and Retry behavior remain unchanged.

The regression is evidence for API dispatch only. It is not proof of actual iOS/Android runtime behavior or screen-reader operation.

Expo browser verification after the correction:
- `node scripts/verify-expo-post-job-journey.mjs` exited 0: full journey, validation, Back/Continue retention and editing, all five steps, local preview, simulated failure and Retry, and overflow passed.
- `--navigation-focus-only`, `--step-focus-only`, `--review-focus-only`, and `--back-edit-focus-only` all exited 0. City, schedule, budget, Review and Local request preview DOM focus passed, plus all eight Back/Edit checks.
- A temporary validation-focus verifier exited 0 after correction: all eight validation-error DOM-focus targets passed (job type, title, description, city, street address, timing preference, preferred date, budget type). The verifier's Review-heading selector was corrected for an ambiguous final heading; no application code changed.

Raw logs are under `/tmp/cue-cline-review/native-focus/` (focused-red.log, focused-green.log, helper-tests.log, mobile-suite.log, typecheck-before-fix.log, typecheck-after-fix.log, function-length.log, expo-full-journey.log, expo-navigation-focus.log, expo-step-focus.log, expo-review-focus.log, expo-back-edit-focus.log, expo-validation-focus-clean.log, skill-gate-before.log, skill-gate-after.log).

## Recording

A continuous recording of the actual Expo browser emulation shows the five-step journey through Local request preview. It is WebM, VP9, 390 × 844, and 8.68 seconds long: [expo-mob-post-001-job-posting-verification.webm](../screenshots/videos/expo-mob-post-001-job-posting-verification.webm).

## Unverified limits

The audit used Expo web emulation, not a native iOS or Android runtime. Native notch, status-bar and home-indicator clearance, soft-keyboard avoidance, Dynamic Type, OS reduced-motion behavior, and VoiceOver/TalkBack or other screen-reader behavior remain unverified. The zero-inset browser safe-area check cannot establish native clearance. Browser touch measurements cannot establish native 44 pt or 48 dp targets.

No backend, API, authentication, or database work was performed. No staging, commit, push, merge, rebase, or deployment was performed.
