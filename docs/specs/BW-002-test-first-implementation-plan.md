# Test-First Implementation Plan: BW-002 BrainWorker Service Catalog & Availability (v1.2)

| Field | Value |
|---|---|
| **Document ID** | BW-002-PLAN |
| **Feature** | BrainWorker Service Catalog & Availability Management |
| **Status** | 🟢 Complete & Verified (v1.2) |
| **Version** | 1.2 |
| **Governing Loop** | Mr. Solomon 9-Command Engineering Loop (`/architect` to `/develop` to `/check`) |
| **Baseline Tests** | 1,079/1,079 Passing in Monorepo Web Test Suite |
| **Executed Tests** | 115 Operational Tests across 7 Suites (100% Pass) |
| **Total Monorepo Web Tests** | 1,194/1,194 Passing across 67 Suites (0 Failures, 0 Regressions) |
| **Date** | 2026-09-26 |

---

## 1. Test Architecture & Phased RED/GREEN Strategy

Following the disciplined test-first standard executed during BW-001, BW-002 was executed across **7 sequential operational slices**. Each phase began with failing contract tests (RED), followed by minimal domain and component implementation to turn tests green (GREEN), verified by strict type-checking, linting, production build checks, and regression tests.

```
Phase 1: Domain Validation & Pricing Invariants (CAT-001 to CAT-010, 10 tests)
  └── Phase 2: Operations Repository & Tenant Isolation (REP-001 to REP-010, 10 tests)
        └── Phase 3: Client Store & State Management (STO-001 to STO-006, 40 tests)
              └── Phase 4: Service Catalog Component (CMP-001 to CMP-009, 24 tests)
                    └── Phase 5: Availability Schedule Component (SCH-001 to SCH-011, 11 tests)
                          └── Phase 6: Coverage Area & Location Component (COV-001 to COV-010, 10 tests)
                                └── Phase 7: Route Integration, Guards & Dashboard Banner (INT-001 to INT-010, 10 tests)
```

---

## 2. Itemized Test Suites Breakdown (115 Operational Tests)

### Suite 1: Domain Validation & Invariants (`apps/web/lib/brainworker/catalog/validation.test.ts` - 10 Tests)
- **CAT-001**: Validates category belongs strictly to the 8 canonical BW-001 categories (`generator`, `ac`, `plumbing`, `electrical`, `carpentry`, `painting`, `masonry`, `welding`) and rejects consumer-only categories like `cleaning` or `appliance`.
- **CAT-002**: Validates hourly rate falls between ₦2,000 and ₦50,000 (rejection of rates below ₦2k, above ₦50k, or non-integers).
- **CAT-003**: Validates diagnostic call-out fee between ₦2,000 and ₦20,000.
- **CAT-004**: Validates weekly schedule: enforces `endHour > startHour` for active days.
- **CAT-005**: Rejects daily schedule windows under 2 hours (`endHour - startHour < 2`).
- **CAT-006**: Rejects daily hours outside standard operating window (06:00 to 22:00).
- **CAT-007**: Validates travel radius selection is strictly one of `[5, 10, 15, 25, 50]`.
- **CAT-008**: **Operational Readiness Invariant**: Proves `isComplete` evaluates to `true` if and only if all 6 criteria are met; explicitly asserts that 1 active service + 1 active day alone returns `false` when city, coverage areas, diagnostic fee, or radius are missing.
- **CAT-009**: **Canonical Service Registry Adherence**: Enforces that configured service IDs must strictly exist in `CANONICAL_SERVICES_REGISTRY`; rejects un-registered or arbitrary service IDs.
- **CAT-010**: **Dispatch Eligibility Separation**: Verifies that `isComplete === true` with `isAvailable === false` is valid, but does not grant real-time dispatch eligibility (`isDispatchEligibleNow === false`).

### Suite 2: Operations Repository & Tenant Isolation (`apps/web/lib/brainworker/catalog/repository.test.ts` - 10 Tests)
- **REP-001**: Hydrates initial operational profile from browser storage for an approved BrainWorker.
- **REP-002**: Saves service catalog selections and updates `diagnosticFeeNgn`.
- **REP-003**: Preserves existing configured rates when toggling a service between `ACTIVE` and `PAUSED`.
- **REP-004**: Saves weekly availability schedule and updates global `isAvailable` (On-Duty/Off-Duty) status.
- **REP-005**: **Coverage Refinement**: Saves primary city and operational LGAs, enforcing that `primaryCityId` must be in the provider's verified onboarding `coverageCities`.
- **REP-006**: **Tenant Isolation**: Fails closed throwing `FORBIDDEN_TENANT_ACCESS` if caller session attempts to read or mutate another provider's profile.
- **REP-007**: **Matching Hydration Adapter**: Verifies `getMatchingHydrationProfile()` returns valid `TaskerSkill[]` with `hourlyRateKobo` mapped directly from canonical registry `skillId`.
- **REP-008**: Reactive observer subscription dispatches updates on catalog or schedule mutations.
- **REP-009**: **Lossless Schedule Preservation**: Proves that the 7-day `weeklySchedule` is stored and retrieved losslessly across all 7 days without data truncation.
- **REP-010**: **No Single-Window Collapse**: Proves matching hydration does not silently collapse or fabricate the seven-day schedule into an arbitrary global start/end window.

### Suite 3: Client Store & State Management (`apps/web/lib/brainworker/catalog/store.test.ts` - 40 Tests)
- **STO-001**: Initializes default draft state matching repository profile with clean default draft values and `isComplete === false`.
- **STO-002**: Optimistically adds and removes services from catalog draft; verifies canonical service registry matching and rejects arbitrary service IDs.
- **STO-003**: Updates hourly rate for a specific service with live validation feedback, minimum (₦2,000) and maximum (₦50,000) boundary checking, and integer enforcement.
- **STO-004**: Updates day schedule row and detects time sequence errors (`endHour <= startHour`, windows under 2 hours, hours outside 06:00 to 22:00).
- **STO-005**: Copies Monday hours to all weekdays in store state, preserving Saturday and Sunday schedules unchanged and clearing weekday validation errors.
- **STO-006**: Computes `isComplete` flag strictly according to the 6-criteria operational readiness invariant; validates preservation when toggling `isAvailable` off-duty; tests dynamic invalidation on removed services, cleared cities, invalid fees, or disabled days.

### Suite 4: Service Catalog Component (`apps/web/components/brainworker/catalog/ServiceCatalogEditor.test.tsx` - 24 Tests)
- **CMP-001**: Renders diagnostic call-out fee input with recommended tag.
- **CMP-002**: Strictly satisfies boundary invariant: zero mention of credit settlement or refund against major repairs.
- **CMP-003**: Diagnostic fee bounded updates (₦2,000 to ₦20,000) and live bounds validation feedback.
- **CMP-004**: Renders category filter tabs for all 8 canonical categories; switches active tab and displays corresponding canonical services.
- **CMP-005**: Adding a service from canonical registry creates a configured service card with default rate and ACTIVE status; prevents duplicate additions.
- **CMP-006**: Asynchronously hydrates catalog from repository prop or fallback singleton.
- **CMP-007**: Updating hourly rate displays live validation feedback; toggles status between ACTIVE (Emerald) and PAUSED (Slate) while preserving configured rate.
- **CMP-008**: Inline confirmation prompt on removal; card removal updates list; saving catalog triggers repository save, shows toast, disables button during flight, and handles errors cleanly.
- **CMP-009**: Full accessibility: role attributes, aria-labels, arrow navigation across tabs, `aria-invalid="true"` on errors, and zero imports from `testing/`.

### Suite 5: Availability Schedule Component (`apps/web/components/brainworker/catalog/AvailabilityEditor.test.tsx` - 11 Tests)
- **SCH-001**: Renders global dispatch duty toggle (`On-Duty` vs `Off-Duty`) with dispatch eligibility description.
- **SCH-002**: Renders 7-day schedule grid with per-day active toggles.
- **SCH-003**: Changing start/end time updates day window and preserves other days.
- **SCH-004a**: Shows inline error when end hour is not strictly greater than start hour.
- **SCH-004b**: Shows inline error when the daily window is under 2 hours.
- **SCH-004c**: Shows inline error for hours outside the 06:00 to 22:00 operating bounds.
- **SCH-005**: "Copy Monday to Weekdays" updates Tuesday through Friday and leaves weekend untouched.
- **SCH-006**: Emergency dispatch readiness toggle updates `isEmergencyAvailable` (< 2hr arrival window).
- **SCH-009**: Save persists the full 7-day schedule losslessly with no fabricated global window.
- **SCH-010**: Accessible schedule controls with switch roles, keyboard reachability, and associated error messaging.
- **SCH-011**: Physical testing boundary verified (zero testing imports in production component).

### Suite 6: Coverage Area & Location Component (`apps/web/components/brainworker/catalog/CoverageEditor.test.tsx` - 10 Tests)
- **COV-001**: Primary city selector restricted strictly to verified onboarding cities.
- **COV-002**: Unverified city persistence fails closed with inline error and preserved draft.
- **COV-003**: Operational zones selector requires at least one zone before save.
- **COV-004**: Travel radius restricted strictly to `[5, 10, 15, 25, 50]` km whitelist.
- **COV-005**: Cross-worker coverage save fails closed with tenant isolation error and preserved draft.
- **COV-006**: Save persists the full coverage payload losslessly through `saveCoverage` only.
- **COV-007**: Coverage edits leave dispatch duty status untouched and preserve `isComplete` semantics.
- **COV-008**: Coverage editing never touches the matching hydration profile.
- **COV-009**: Keyboard reachable controls with accessible labels and error messaging.
- **COV-010**: Physical testing boundary verified (zero testing imports in production component).

### Suite 7: Route Integration, Guards & Dashboard Banner (`apps/web/app/brainworker/BrainWorkerOperationsRoutes.test.tsx` - 10 Tests)
- **INT-001**: Unauthenticated visitor accessing `/brainworker/services` or `/brainworker/availability` redirects to `/login` without triggering repository reads.
- **INT-002**: Customer session accessing `/brainworker/services` or `/brainworker/availability` receives fail-closed boundary card without repository queries.
- **INT-003**: Unapproved BrainWorker accessing operational routes redirects to `/brainworker/verification-status`.
- **INT-004**: Approved BrainWorker loads `/brainworker/services`, renders `ServiceCatalogEditor`, and saves catalog updates.
- **INT-005**: `/brainworker/availability` integrates `AvailabilityEditor` and `CoverageEditor`, deriving verified cities authoritatively from onboarding repository.
- **INT-006**: `/brainworker/dashboard` renders unconfigured setup prompt banner when `isComplete === false` with direct links to services and availability.
- **INT-007**: `/brainworker/dashboard` separates `isComplete` and `isAvailable`: on-duty displays "Ready for Dispatch", off-duty displays "Paused".
- **INT-008**: Dashboard quick duty toggle toggles availability via repository while proving profile completeness remains unchanged.
- **INT-009**: Static prerendering and SSR mount safety: route components render without `ReferenceError` or unhandled window access (`○ (Static)`).
- **INT-010**: Physical boundary verification: production route source files contain zero imports from `testing/`.

---

## 3. Physical Boundary & Invariant Gates

- **INT-009**: Static/Prerender safety across all provider routes (`○ (Static)` for `/brainworker/services`, `/brainworker/availability`, and `/brainworker/dashboard`).
- **INT-010**: Physical boundary: Production modules contain zero imports from `testing/`.

---

## 4. Execution Gates & Exit Criteria

All gates have been executed on the cloud Codespace (`effective-fishstick-x5qwp6wrrp64fxwx`) and verified live on Vercel:

| Gate | Target Standard | Actual Result | Status |
|---|---|---|---|
| **BW-002 Suites (1-7)** | 100% PASS (115 tests) | 115/115 passed across 7 suites | 🟢 PASS |
| **BrainWorker Platform Suite** | 252/252 PASS | 252/252 passed across 19 suites | 🟢 PASS |
| **Monorepo Web Regression** | ≥ 1,129 PASS (1,079 baseline + new tests) | 1,194/1,194 passed across 67 suites (0 failures) | 🟢 PASS |
| **TypeScript Strict** | 0 errors | 0 errors across all 6 packages | 🟢 PASS |
| **ESLint** | 0 errors / 0 warnings in BW-002 code | 0 errors, 0 warnings, 0 suppressions | 🟢 PASS |
| **Next.js Production Build** | 38/38 routes compiled cleanly | 38/38 routes compiled in 15.7s (`○ (Static)`) | 🟢 PASS |
| **Physical Boundary** | 0 imports from `testing/` in production | Boundary inspection confirmed clean | 🟢 PASS |
| **Live Vercel Preview** | Clean deployment with 0 console errors | Deployment `ARX73uJA1qqbS5JVQbw2mKHnER7V` READY | 🟢 PASS |
| **Git Working Tree** | Clean & synchronized with remote `main` | 41 commits ahead, 0 behind main, tree clean | 🟢 PASS |
