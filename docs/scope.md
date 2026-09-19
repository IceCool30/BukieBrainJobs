# Project Scope & Task Breakdown

## Objective
Establish, verify, and expand the BukieBrainJobs customer marketplace across web and mobile using production-first contracts, deterministic mock data boundaries, and strict brand and voice standards.

## Active Work Slice

_No active slice. Work is complete._

## Completed & Verified Slices

- [x] **13. WEB-013 Customer Booking Acceptance & Booking Lifecycle**
  - **Spec**: `docs/specs/WEB-013-customer-booking-lifecycle.md`
  - **Acceptance Criteria**:
    - [x] Formalize acceptance response boundary and transition to CONFIRMED via canTransition()
    - [x] Decline recorded on invitation without creating a DECLINED JobStatus
    - [x] Cancellation derived strictly from canTransition(status, 'CANCELLED') with authorization
    - [x] Requested schedule rendered as context without schedule negotiation or SCHEDULED status
    - [x] Booking confirmation strictly separated from payment (zero payment claims)
    - [x] Distinct UI states: awaiting response, confirmed, declined, expired, cancelled, and mutations
    - [x] Full TDD suite covering acceptance, decline, cancellation, schedule, and authorization
  - **Verification Command**: `pnpm test && pnpm type-check`

- [x] **0. Mr. Solomon 9-Command Loop Baseline Realignment**
  - **Spec**: `docs/specs/00-engineering-loop.md`
  - **Acceptance Criteria**:
    - [x] AGENTS.md expanded to full context map schema
    - [x] docs/scope.md established with verified historical slices
    - [x] docs/specs/ initialized with canonical index and build specs
    - [x] docs/check-log.md initialized with verified baseline
    - [x] CHANGELOG.md established in Mr. Solomon natural voice
    - [x] Status script loop:status wired to package.json
    - [x] Test suite describe titles cleaned of em dashes
  - **Verification Command**: `bash scripts/nine-status.sh`

- [x] **1. Foundation & Repository Baseline Upgrade**
  - **Spec**: `docs/specs/FOUND-001-baseline.md`
  - **Acceptance Criteria**:
    - [x] Upgraded to Node 24 LTS, Next.js 15.5, React 19, Tailwind CSS v4, Prisma v6, Zustand v5
    - [x] Established Turborepo monorepo with 7 shared packages
    - [x] Vitest v4 testing pipeline configured with global jsdom
  - **Verification Command**: `pnpm type-check && pnpm test`

- [x] **2. ARCH-002 Production-First Mock Data Contracts**
  - **Spec**: `docs/specs/ARCH-002-contracts.md`
  - **Acceptance Criteria**:
    - [x] Canonical separation of JobStatus (open, in_progress, completed, cancelled) and BookingStatus
    - [x] Strict UserRole enum across web, mobile, and db layers
    - [x] Standardized Nigerian locations (7 active cities) and service categories (8 active categories)
  - **Verification Command**: `pnpm --filter @bukiebrainjobs/web test lib/jobs/arch002-alignment.test.ts`

- [x] **3. WEB-001 Public Homepage**
  - **Spec**: `docs/specs/WEB-001-homepage.md`
  - **Acceptance Criteria**:
    - [x] Customer-first entry paths and category exploration
    - [x] Featured BrainWorkers display without premature booking claims
    - [x] Viewport shell detection without bottom nav on homepage
  - **Verification Command**: `pnpm --filter @bukiebrainjobs/web test`

- [x] **4. WEB-004 Service Detail**
  - **Spec**: `docs/specs/WEB-004-service-detail.md`
  - **Acceptance Criteria**:
    - [x] Deterministic service detail route at /services/[serviceId]
    - [x] Starting rates and service deliverables displayed honestly
    - [x] Clean handoff into booking preparation
  - **Verification Command**: `pnpm --filter @bukiebrainjobs/web test lib/services/services.test.ts`

- [x] **5. WEB-005 Public BrainWorker Profile**
  - **Spec**: `docs/specs/WEB-005-public-brainworker-profile.md`
  - **Acceptance Criteria**:
    - [x] Guest-accessible route at /brainworkers/[brainworkerId]
    - [x] PublicBrainWorker projection with zero sensitive verification data exposed
    - [x] Explicit category and active city validation on booking handoff
  - **Verification Command**: `pnpm --filter @bukiebrainjobs/web test`

- [x] **6. WEB-006 Services Discovery Catalog**
  - **Spec**: `docs/specs/WEB-006-services-discovery.md`
  - **Acceptance Criteria**:
    - [x] Bidirectional URL query synchronization for search, category, and city
    - [x] Active city validation with graceful nationwide fallback notices
    - [x] Accessible empty and reset states
  - **Verification Command**: `pnpm --filter @bukiebrainjobs/web test app/services/ServicesDirectory.test.tsx`

- [x] **7. WEB-007 Public Booking Preparation**
  - **Spec**: `docs/specs/WEB-007-booking-preparation.md`
  - **Acceptance Criteria**:
    - [x] Booking preparation form with address and notes validation
    - [x] Pricing summary without fake discount claims
    - [x] Clean authentication handoff preserving return destination
  - **Verification Command**: `pnpm --filter @bukiebrainjobs/web test app/book/BookingScreen.test.tsx`

- [x] **8. WEB-008 Authentication & Account Verification**
  - **Spec**: `docs/specs/WEB-008-authentication.md`
  - **Acceptance Criteria**:
    - [x] Nigerian phone OTP format validation and verification
    - [x] Email/password login and registration with role assignment
    - [x] Social mock providers with explicit error simulation support
    - [x] Safe password reset without account enumeration
  - **Verification Command**: `pnpm --filter @bukiebrainjobs/web test app/login/LoginScreen.test.tsx lib/auth/auth.test.ts`

- [x] **9. WEB-009 Customer Job Posting**
  - **Spec**: `docs/specs/WEB-009-customer-job-posting.md`
  - **Acceptance Criteria**:
    - [x] Multi-step job posting with review summary synchronization
    - [x] Urgency and specific date schedule validation
    - [x] Fail-honest error handling when repository rejects
  - **Verification Command**: `pnpm --filter @bukiebrainjobs/web test app/post-job/PostJobScreen.test.tsx`

- [x] **10. WEB-010 Customer Dashboard**
  - **Spec**: `docs/specs/WEB-010-customer-dashboard.md`
  - **Acceptance Criteria**:
    - [x] Authenticated customer home base with operational identity
    - [x] Real-time metric cards and quick action navigation
    - [x] Active bookings summary linking to unified activity hub
  - **Verification Command**: `pnpm --filter @bukiebrainjobs/web test app/dashboard/DashboardScreen.test.tsx`

- [x] **11. WEB-011 Customer Jobs & Bookings Activity Hub**
  - **Spec**: `docs/specs/WEB-011-customer-jobs-and-bookings.md`
  - **Acceptance Criteria**:
    - [x] Unified customer activity hub at /jobs with 12-column master-detail layout on desktop and full-screen detail on mobile
    - [x] Browser Back/Forward and mobile detail URL state synchronization without parameter persistence issues
    - [x] Parameter validation via normalizeActivityId preventing malformed or unauthorized query params from being trusted channels
    - [x] Decorative watermark confirmed non-interactive, subordinate, and aria-hidden at 3.5% opacity
    - [x] "Scheduled" preserved strictly as a presentation label without leaking into domain JobStatus
    - [x] Complete deterministic state coverage (first-run, filtered empty, loading, partial failure, offline, unauthenticated)
    - [x] Full test coverage in monorepo with zero regressions
  - **Verification Command**: `pnpm test && pnpm type-check`

- [x] **12. WEB-012 Customer Job Matching & Match Results**
  - **Spec**: `docs/specs/WEB-012-customer-job-matching.md`
  - **Acceptance Criteria**:
    - [x] Durable route at /job/[referenceCode]/matches
    - [x] Ranked candidates with customer-friendly match explanations
    - [x] Express interest / select BrainWorker action without false assignment claims
    - [x] Distinct states for in progress, available, no match, degraded, offline, and failure
  - **Verification Command**: `pnpm --filter @bukiebrainjobs/web test app/job/MatchResultsScreen.test.tsx lib/matching/matching.test.ts`

## Upcoming Planned Slices

- [ ] **14. BrainWorker Platform Onboarding & Verification**
  - **Spec**: `docs/specs/BW-001-onboarding.md`
  - **Acceptance Criteria**:
    - [ ] BrainWorker onboarding funnel and role verification
    - [ ] Identity check interface with clear privacy boundaries
  - **Verification Command**: `pnpm test`

- [ ] **15. BrainWorker Service Management & Availability**
  - **Spec**: `docs/specs/BW-002-service-management.md`
  - **Acceptance Criteria**:
    - [ ] Service offering configuration and hourly/daily rates
    - [ ] Weekly availability schedule management
  - **Verification Command**: `pnpm test`
