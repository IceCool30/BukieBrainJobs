# Test-First Implementation Plan: BW-002 BrainWorker Service Catalog & Availability (v1.2)

| Field | Value |
|---|---|
| **Document ID** | BW-002-PLAN |
| **Feature** | BrainWorker Service Catalog & Availability Management |
| **Status** | 🟡 Proposed for Implementation Plan Approval (v1.2 - Reconciled) |
| **Version** | 1.2 |
| **Governing Loop** | Mr. Solomon 9-Command Engineering Loop (`/architect` to `/develop`) |
| **Baseline Tests** | 1,079/1,079 Passing in Monorepo Web Test Suite |
| **New Test Target** | 50 Primary Tests (Suites 1–6) + 2 Boundary Tests = 52 Tests |
| **Date** | 2026-09-25 |

---

## 1. Test Architecture & Phased RED/GREEN Strategy

Following the disciplined test-first standard executed during BW-001, BW-002 is organized into **6 sequential implementation phases**. Each phase begins with failing contract tests (RED), followed by the minimal domain and component implementation to turn tests green (GREEN), verified by strict type-checking, linting, and regression tests.

```
Phase 1: Domain Validation & Pricing Invariants (CAT-001 to CAT-010, 10 tests)
  └── Phase 2: Operations Repository & Tenant Isolation (REP-001 to REP-010, 10 tests)
        └── Phase 3: Client Store & State Management (STO-001 to STO-006, 6 tests)
              └── Phase 4: Service Catalog & Rates Component (CMP-001 to CMP-008, 8 tests)
                    └── Phase 5: Availability & Schedule Components (SCH-001 to SCH-008, 8 tests)
                          └── Phase 6: Route Integration, Guards & Dashboard Banner (INT-001 to INT-008, 8 tests)
```

---

## 2. Itemized Test Suites Breakdown (50 Primary Tests)

### Suite 1: Domain Validation & Invariants (`lib/brainworker/catalog/validation.test.ts` — 10 Tests)
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

### Suite 2: Operations Repository & Tenant Isolation (`lib/brainworker/catalog/repository.test.ts` — 10 Tests)
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

### Suite 3: Client Store & State Management (`lib/brainworker/catalog/store.test.ts` — 6 Tests)
- **STO-001**: Initializes default draft state matching repository profile.
- **STO-002**: Optimistically adds and removes services from catalog draft.
- **STO-003**: Updates hourly rate for a specific service with live validation feedback.
- **STO-004**: Updates day schedule row and detects time sequence errors.
- **STO-005**: Copies Monday hours to all weekdays in store state.
- **STO-006**: Computes `isComplete` flag strictly according to the 6-criteria operational readiness invariant.

### Suite 4: Service Catalog Component (`components/brainworker/catalog/ServiceCatalogEditor.test.tsx` — 8 Tests)
- **CMP-001**: Renders diagnostic call-out fee input with recommended tag (zero mention of credit settlement rules).
- **CMP-002**: Renders category filter tabs for all 8 canonical categories.
- **CMP-003**: Adding a service from canonical registry creates a configured service card with default rate.
- **CMP-004**: Updating hourly rate displays live validation feedback.
- **CMP-005**: Toggling service switch toggles active badge between `ACTIVE` (Emerald) and `PAUSED` (Slate).
- **CMP-006**: Removing service card updates list after confirmation.
- **CMP-007**: Saving catalog triggers repository save and renders success toast.
- **CMP-008**: Accessible keyboard navigation and aria labels across all interactive elements.

### Suite 5: Availability & Schedule Component (`components/brainworker/catalog/AvailabilityEditor.test.tsx` — 8 Tests)
- **SCH-001**: Renders global dispatch duty toggle (`On-Duty` vs `Off-Duty`) with dispatch eligibility description.
- **SCH-002**: Renders 7-day schedule grid with day toggles.
- **SCH-003**: Changing start/end time updates day window.
- **SCH-004**: Displays inline error if end time is set earlier than or less than 2 hours after start time.
- **SCH-005**: "Copy Monday to Weekdays" updates Tuesday through Friday.
- **SCH-006**: Emergency dispatch readiness toggle updates `isEmergencyAvailable` (< 2hr arrival window).
- **SCH-007**: Primary city selector restricts choices strictly to verified onboarding cities.
- **SCH-008**: Travel radius discrete slider snaps to `[5, 10, 15, 25, 50]` km.

### Suite 6: Route Integration, Guards & Dashboard Banner (`app/brainworker/BrainWorkerOperationsRoutes.test.tsx` — 8 Tests)
- **INT-001**: Unauthenticated visitor accessing `/brainworker/services` redirects to `/login`.
- **INT-002**: Customer session accessing `/brainworker/services` receives fail-closed boundary card without repository queries.
- **INT-003**: Unapproved BrainWorker accessing `/brainworker/services` redirects to `/brainworker/verification-status`.
- **INT-004**: Approved BrainWorker successfully loads `/brainworker/services` and saves catalog.
- **INT-005**: Approved BrainWorker successfully loads `/brainworker/availability` and saves schedule.
- **INT-006**: `/brainworker/dashboard` renders unconfigured setup prompt banner when `isComplete === false`.
- **INT-007**: `/brainworker/dashboard` renders "Ready for Dispatch" banner when `isComplete === true` and on-duty.
- **INT-008**: Static prerendering safety: all new routes mount cleanly without `ReferenceError` during static generation.

---

## 3. Physical Boundary & Invariant Gates

- **INT-009**: Static/Prerender safety across all provider routes (`○ (Static)`).
- **INT-010**: Physical boundary: Production modules contain zero imports from `testing/`.

---

## 4. Execution Gates & Exit Criteria

Before BW-002 can be authorized for production merge to `main`, it must satisfy the following exit gates:

| Gate | Target Standard | Verification Command |
|---|---|---|
| **BW-002 Suites (1–6)** | 100% PASS (50 primary tests) | `pnpm --filter @bukiebrainjobs/web test catalog` |
| **BW-001 Regression** | 137/137 PASS | `pnpm --filter @bukiebrainjobs/web test brainworker` |
| **Monorepo Regression** | ≥ 1,129 PASS (1,079 baseline + 50 new tests) | `pnpm --filter @bukiebrainjobs/web test` |
| **TypeScript Strict** | 0 errors | `pnpm --filter @bukiebrainjobs/web type-check` |
| **ESLint** | 0 errors / 0 warnings in BW-002 code | `pnpm --filter @bukiebrainjobs/web lint` |
| **Next.js Production Build** | 38/38 routes compiled cleanly | `pnpm --filter @bukiebrainjobs/web build` |
| **Physical Boundary** | 0 imports from `testing/` in production | Boundary inspection test |
| **Vercel Preview** | Clean deployment with 0 console errors | Vercel preview deployment |
| **Git Working Tree** | Clean & synchronized with remote `main` | `git status` |
