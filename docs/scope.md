# Project Scope & Task Breakdown

## Objective
Establish, verify, and expand the BukieBrainJobs customer marketplace across web and mobile using production-first contracts, deterministic mock data boundaries, and strict brand and voice standards.

## Master Product Checklist
See [docs/master-checklist.md](./master-checklist.md) for the complete, sequential product checklist across all 7 development phases.

## Active Work Slice

- [ ] **20. BW-002 BrainWorker Service Catalog & Availability Management**
  - **Spec**: `docs/specs/BW-002-service-catalog-availability.md` (Pending formal scope authorization)
  - **Acceptance Criteria**:
    - [ ] Worker service catalog configuration: Add/remove individual services, set hourly rates and diagnostic call-out fees
    - [ ] Weekly working hours scheduler: Set working days, time slots (e.g., 8:00 AM to 5:00 PM), and emergency availability
    - [ ] Coverage area selector: Select specific neighbourhoods and maximum travel radius
  - **Verification Command**: `pnpm --filter @bukiebrainjobs/web type-check && pnpm --filter @bukiebrainjobs/web lint && pnpm --filter @bukiebrainjobs/web test`

## Completed & Verified Slices

- [x] **19. BW-001 BrainWorker Onboarding & Identity Verification**
  - **Spec**: `docs/specs/BW-001-onboarding.md`
  - **Acceptance Criteria**:
    - [x] Dedicated BrainWorker signup entry point (`/brainworker/register`)
    - [x] Multi-step onboarding funnel (`/brainworker/onboarding`): Identity, trade category selection, experience level, coverage cities, credentials staging, and review
    - [x] Identity check interface: Secure capture of National Identity Number (NIN) / Bank Verification Number (BVN) and government ID upload
    - [x] Trade certifications and apprentice proofs upload with format and size validation
    - [x] Verification status monitor route (`/brainworker/verification-status`) with real-time observer updates
    - [x] Operating workspace guard on `/brainworker/dashboard` strictly enforcing `role === 'brainworker' && isBrainWorkerApproved === true`
    - [x] Fail-closed customer boundary cards preventing customer account conversion and unauthorized repository queries
    - [x] Strict ephemeral preview isolation: authoritative record retains metadata only; client preview URLs remain UI-local
  - **Verification Evidence**: Complete / Live on `main` at commit `36b8385`; 137/137 BW-001 tests passed; 1,079/1,079 monorepo web tests passed; production build passed with all 36 static pages generated.

- [x] **18. WEB-018 Notification Center & Push UX**
  - **Spec**: `docs/specs/WEB-018-notification-center.md`
  - **Acceptance Criteria**:
    - [x] In-app notification feed at `/notifications` with categorized tabs (All, Bookings, Messages & Payments, Account)
    - [x] Read and unread badge state tracking and mark-all-as-read actions
    - [x] Deep-link navigation from notifications straight to corresponding `/jobs?id=...` and `/messages/[jobId]` records
    - [x] Web Push service worker integration for background browser notifications with explicit opt-in
    - [x] Deterministic mock notification repository and offline handling
  - **Verification Evidence**: Complete / Live on `main` at commit `b8eb6e6`; 128/128 notification tests passed; 944/944 web tests passed.

- [x] **17. WEB-017 In-App Messaging & Real-Time Chat**
  - **Spec**: `docs/specs/WEB-017-messaging-chat.md`
  - **Acceptance Criteria**:
    - [x] Customer and BrainWorker active conversation threads at `/messages`
    - [x] Message history, pending delivery indicators, and offline caching
    - [x] Photo attachment and location share shortcuts
    - [x] Authorization: fail-closed access on missing or mismatched customer identifiers
    - [x] Offline state: optimistic queued delivery with retry/cancel actions
    - [x] Retired temporary "Messages coming soon" modal notices and routes
  - **Verification Evidence**: Complete / Live at commit `99f11f1`; CI and Deploy Web passed; 208/208 WEB-017 tests passed; 816/816 monorepo web tests passed; production build 31/31 pages; Vercel production preview verified.

- [x] **16. WEB-016 Customer Reviews & Reputation**
  - **Spec**: `docs/specs/WEB-016-customer-reviews-reputation.md`
  - **Acceptance Criteria**:
    - [x] Post-completion review prompt triggered on completed bookings
    - [x] Multi-criteria ratings (punctuality, quality, communication, overall 1-5 stars)
    - [x] Written customer feedback with honest character limits (1,000 Unicode code points)
    - [x] Public review feed on BrainWorker profile tabs with verified booking badge
    - [x] Review reporting and abuse flagging action
    - [x] Authorization: customer can only review a booking they own and that is in COMPLETED state
    - [x] Offline state: review submission disabled and form read-only while offline
  - **Verification Command**: `pnpm --filter @bukiebrainjobs/web type-check && pnpm --filter @bukiebrainjobs/web lint && pnpm --filter @bukiebrainjobs/web test`

- [x] **15. WEB-015 Customer Payments & Escrow Frontend Experience**
  - **Spec**: `docs/specs/WEB-015-customer-payments-escrow.md`
  - **Acceptance Criteria**:
    - [x] Checkout drawer and modal triggered from confirmed bookings
    - [x] Payment method selection UI (Card, Bank Transfer, USSD) matching Nigerian standards
    - [x] Payment authorization state machine (processing, verified, failed, retry, timeout)
    - [x] Escrow timeline and customer inspection approval flow
    - [x] Digital receipts and invoices at `/receipt/[bookingId]`
    - [x] Customer refund request interface with honest timeline indicators
    - [x] Financial mutations derive caller identity from the authenticated session and fail closed on authorization mismatch
    - [x] Payment and escrow mutations are disabled in offline read-only state
    - [x] Production repository boundary closed: zero testing imports in repository.ts; exact export surface regression-tested
  - **Verification Evidence**: PR #52 merged as `78623cbc4f85504a0c62932c589413c919765ad3`; CI/Vercel checks passed; 479 web tests passed; production build passed.

- [x] **14. WEB-014 Customer Profile & Account Settings**
  - **Spec**: `docs/specs/WEB-014-customer-profile-settings.md`
  - **Acceptance Criteria**:
    - [x] Personal information editing at `/profile` (full name, phone number, email address)
    - [x] Saved addresses manager supporting flexible Nigerian service locations with landmark notes
    - [x] Security settings for password management, provider linking, and session control
    - [x] Notification preferences across SMS, WhatsApp, Email, and in-app alerts
    - [x] Account data management (data export and safe account closure flows)
    - [x] Customer isolation enforced through the authenticated session boundary with fail-closed mutations
    - [x] Complete deterministic state coverage including loading, saved confirmation, validation error, repository failure, and offline read-only state
  - **Verification Evidence**: PR #51 merged as `d961839471258a123172446deb5ef42ddd1f7f8c`; CI/Vercel checks passed; 416 web tests passed; production build passed.

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

- [ ] **19. BW-001 BrainWorker Platform Onboarding & Verification**
  - **Spec**: `docs/specs/BW-001-onboarding.md`
  - **Acceptance Criteria**:
    - [ ] Dedicated provider registration flow at `/brainworker/register`
    - [ ] Multi-step onboarding funnel (trade category, experience, coverage cities)
    - [ ] Identity check interface for NIN/BVN and government ID upload
    - [ ] Trade certifications and apprenticeship documentation upload
    - [ ] Verification in review status screen
  - **Verification Command**: `pnpm test`

- [ ] **20. BW-002 BrainWorker Service Management & Availability**
  - **Spec**: `docs/specs/BW-002-service-management.md`
  - **Acceptance Criteria**:
    - [ ] Worker service catalog configuration, hourly rates, and diagnostic fees
    - [ ] Weekly working hours scheduler and emergency dispatch toggles
    - [ ] Coverage area selector and travel radius management
  - **Verification Command**: `pnpm test`
