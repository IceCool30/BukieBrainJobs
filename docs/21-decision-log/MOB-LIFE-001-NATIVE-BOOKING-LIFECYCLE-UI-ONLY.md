# MOB-LIFE-001: Native Customer Booking Lifecycle Presentation Decision Record

**Decision ID:** MOB-LIFE-001-DEC-001
**Date:** 2026-11-03
**Status:** PM accepted on 2026-11-03 under owner delegation (UI-only local sample scope; native device runtime QA unverified; Phase 4.2.2 IN PROGRESS)

**Decision:** The PM, acting under the product owner's explicit delegation, authorizes the scoped native customer booking lifecycle presentation described in `docs/specs/MOB-LIFE-001-native-booking-lifecycle-ui-only.md`. This authorizes only an in-place single-screen detail presentation on the existing `/jobs` tab route using screen-local selection state for the six existing static sample fixtures with canonical JobStatus milestone mapping.

**Authority:** PM under product owner delegation. No personal owner review, separate human/design review, or Product Architect approval is claimed.

**Monorepo Test Suite Baseline Exception:** Delegated PM explicitly approves a narrow baseline exception for 10 independently reproduced, pre-existing, date-sensitive test failures in the web package during `pnpm test` (1,754/1,764 passed; 6 failures in `apps/web/lib/scheduling/repository.test.ts` and 4 failures in `apps/web/app/scheduling/SchedulingRoute.test.tsx` caused by hardcoded October 25 to 27, 2026 candidate windows failing the future-window validator against the November 3, 2026 test execution date). Mobile package unit tests (169/169 passed in isolated staged snapshot; 172/172 passed in dirty working tree; 151/151 passed in prerequisite commit `7040787`), shared validation (42/42 tests across 2/2 files), and shared utils (7/7 tests across 2/2 test files) remain strictly green with zero regressions. Mobile type-check baseline errors (11 errors independently reproduced on prior committed HEAD `990ef37`) were cleanly repaired in prerequisite commit `7040787` and require no mobile exception.

**Boundaries:** Deterministic local sample UI only. No backend, database, authentication, network/API, production records, new persistence, offline caching, booking mutations, or payment behavior. THEME-001 Dark default and selectable Light retained via existing semantic tokens and home-header toggle. Full offline caching and background sync remain separate, deferred, and unchecked in Phase 4.2.2.

**References:** `docs/specs/MOB-LIFE-001-native-booking-lifecycle-ui-only.md`, `docs/specs/WEB-013-customer-booking-lifecycle.md`, `docs/specs/THEME-001-light-dark-toggle.md`
