# Test-First Implementation Plan: BW-002 BrainWorker Service Catalog & Availability (v1.0)

| Field | Value |
|---|---|
| **Document ID** | BW-002-PLAN |
| **Feature** | BrainWorker Service Catalog & Availability Management |
| **Status** | 🟡 Proposed for Implementation Plan Approval (v1.0) |
| **Version** | 1.0 |
| **Governing Loop** | Mr. Solomon 9-Command Engineering Loop (`/architect` to `/develop`) |
| **Baseline Tests** | 1,079/1,079 Passing in Monorepo Web Test Suite |
| **Date** | 2026-09-25 |

---

## 1. Test Architecture & Phased RED/GREEN Strategy

Following the disciplined test-first standard executed during BW-001, BW-002 is organized into **6 sequential implementation phases**. Each phase begins with failing contract tests (RED), followed by the minimal domain and component implementation to turn tests green (GREEN), verified by strict type-checking, linting, and regression tests.

```
Phase 1: Domain Validation & Pricing Invariants (CAT-001 to CAT-008)
  └── Phase 2: Operations Repository & Tenant Isolation (REP-001 to REP-008)
        └── Phase 3: Client Store & Form State Management (STO-001 to STO-006)
              └── Phase 4: Service Catalog & Rates Component (CMP-001 to CMP-008)
                    └── Phase 5: Availability & Schedule Components (SCH-001 to SCH-008)
                          └── Phase 6: Route Integration, Guards & Dashboard Banner (INT-001 to INT-008)
```

---

## 2. Itemized Test Suites Breakdown

### Suite 1: Domain Validation & Pricing Invariants (`lib/brainworker/catalog/validation.test.ts`)
- **CAT-001**: Validates hourly rate falls between ₦2,000 and ₦50,000.
- **CAT-002**: Rejects rates below ₦2,000 or above ₦50,000 with user-friendly errors.
- **CAT-003**: Rejects non-integer or fractional Naira rates.
- **CAT-004**: Validates diagnostic call-out fee between ₦2,000 and ₦20,000.
- **CAT-005**: Validates weekly schedule: ensures `endHour > startHour` for active days.
- **CAT-006**: Rejects daily schedule windows under 2 hours.
- **CAT-007**: Rejects operating hours outside 06:00 to 22:00.
- **CAT-008**: Validates travel radius selection is one of `[5, 10, 15, 25, 50]`.

### Suite 2: Operations Repository & Tenant Isolation (`lib/brainworker/catalog/repository.test.ts`)
- **REP-001**: Hydrates initial operational profile for verified BrainWorker.
- **REP-002**: Saves service catalog selections and updates `diagnosticFeeNgn`.
- **REP-003**: Preserves existing rates when toggling a service between `active` and `paused`.
- **REP-004**: Saves weekly availability schedule and updates global `isAvailable` status.
- **REP-005**: Saves primary city and travel radius coverage.
- **REP-006**: **Tenant Isolation**: Fails closed if caller session attempts to read or mutate another provider's profile.
- **REP-007**: **Matching Hydration Contract**: Verifies `getMatchingProfile()` returns valid `TaskerSkill[]` with `hourlyRateKobo` and valid `workingHoursStart`/`workingHoursEnd`.
- **REP-008**: Reactive observer subscription dispatches updates on catalog or schedule mutation.

### Suite 3: Client Store & State Management (`lib/brainworker/catalog/store.test.ts`)
- **STO-001**: Initializes default draft state matching repository profile.
- **STO-002**: Optimistically adds and removes services from catalog draft.
- **STO-003**: Updates hourly rate for a specific service.
- **STO-004**: Updates day schedule row and detects time sequence errors.
- **STO-005**: Copies Monday hours to all weekdays in store state.
- **STO-006**: Computes `isComplete` flag based on active services and active schedule days.

### Suite 4: Service Catalog Component (`components/brainworker/catalog/ServiceCatalogEditor.test.tsx`)
- **CMP-001**: Renders diagnostic call-out fee input with recommended tag.
- **CMP-002**: Renders category filter tabs and filters service options.
- **CMP-003**: Adding a service creates a configured service card with default rate.
- **CMP-004**: Updating hourly rate displays live validation feedback.
- **CMP-005**: Toggling service switch toggles active badge between emerald and slate.
- **CMP-006**: Removing service card updates list after confirmation.
- **CMP-007**: Saving catalog triggers repository save and renders success toast.
- **CMP-008**: Accessible keyboard navigation and aria labels across all interactive elements.

### Suite 5: Availability & Schedule Component (`components/brainworker/catalog/AvailabilityEditor.test.tsx`)
- **SCH-001**: Renders global duty toggle (On-Duty vs Off-Duty).
- **SCH-002**: Renders 7-day schedule grid with day toggles.
- **SCH-003**: Changing start/end time updates day window.
- **SCH-004**: Displays inline error if end time is set earlier than start time.
- **SCH-005**: "Copy Monday to Weekdays" updates Tuesday through Friday.
- **SCH-006**: Emergency dispatch toggle updates `isEmergencyAvailable`.
- **SCH-007**: Travel radius slider snaps to discrete kilometer values.
- **SCH-008**: Accessible focus states and minimum 44x44px touch targets.

### Suite 6: Route Integration, Guards & Dashboard Banner (`app/brainworker/BrainWorkerOperationsRoutes.test.tsx`)
- **INT-001**: Unauthenticated visitor accessing `/brainworker/services` redirects to `/login`.
- **INT-002**: Customer session accessing `/brainworker/services` receives fail-closed boundary notice.
- **INT-003**: Unapproved BrainWorker accessing `/brainworker/services` redirects to `/brainworker/verification-status`.
- **INT-004**: Approved BrainWorker successfully loads `/brainworker/services` and saves catalog.
- **INT-005**: Approved BrainWorker successfully loads `/brainworker/availability` and saves schedule.
- **INT-006**: `/brainworker/dashboard` renders unconfigured setup prompt card when profile is incomplete.
- **INT-007**: `/brainworker/dashboard` renders "Ready for Dispatch" banner when profile is complete.
- **INT-008**: Static prerendering safety: all new routes mount cleanly without `ReferenceError` during static generation.

---

## 3. Execution Gates & Exit Criteria

Before BW-002 can be authorized for production merge to `main`, it must satisfy the following exit gates:

| Gate | Target Standard | Verification Command |
|---|---|---|
| **BW-002 Suites (1–6)** | 100% PASS (~44 new tests) | `pnpm --filter @bukiebrainjobs/web test catalog` |
| **BW-001 Regression** | 137/137 PASS | `pnpm --filter @bukiebrainjobs/web test brainworker` |
| **Monorepo Regression** | ≥ 1,123 PASS (1,079 baseline + new tests) | `pnpm --filter @bukiebrainjobs/web test` |
| **TypeScript Strict** | 0 errors | `pnpm --filter @bukiebrainjobs/web type-check` |
| **ESLint** | 0 errors / 0 warnings in BW-002 code | `pnpm --filter @bukiebrainjobs/web lint` |
| **Next.js Production Build** | 38/38 routes compiled cleanly | `pnpm --filter @bukiebrainjobs/web build` |
| **Physical Boundary** | 0 imports from `testing/` in production | Boundary inspection test |
| **Vercel Preview** | Clean deployment with 0 console errors | Vercel preview deployment |
| **Git Working Tree** | Clean & synchronized with remote `main` | `git status` |
