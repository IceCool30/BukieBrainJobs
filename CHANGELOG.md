# Changelog

All notable changes to the BukieBrainJobs platform are documented in this file.

The format follows practical release notes written plainly in engineering language. Written in Mr. Solomon natural voice.

## [Unreleased]

### Added
- Integrated the Mr. Solomon 9-Command Engineering Loop as the primary engineering framework across the monorepo.
- Created `docs/scope.md` tracking active, completed, and upcoming work slices with explicit verification commands.
- Established `docs/specs/` directory and index bridging architecture specifications to the build loop.
- Initialized `docs/check-log.md` with full test and type-check audit trails.
- Added `scripts/nine-status.sh` and `"loop:status"` command in root `package.json`.

### Changed
- Expanded `AGENTS.md` to conform to the canonical NINE context map schema, recording Termux environment limits and cloud Codespace execution requirements.
- Standardized test suite describe block titles across `apps/web` to eliminate em dashes.

## [1.0.0-web-013] - 2026-09-19

### Added
- WEB-013 Customer Booking Acceptance and Lifecycle on canonical `/jobs` surface.
- `LifecycleStateSurface.tsx` implementing the 5-block structure: current state, lifecycle position, context, actions, and recovery.
- `LifecycleStepIndicator.tsx` supporting desktop horizontal layout and mobile compact vertical progress.
- `CancellationModal.tsx` modal for safe cancellation confirmation with reason selection and transient pending state.
- Extended domain types in `@bukiebrainjobs/types` (`JobLifecycleAction`, `CustomerActivityItem`, `JobInvitation`).
- Mock repository methods supporting invitation responses (accept, decline) and customer-authorized cancellations with `canTransition()` enforcement.
- Deterministic mock activity fixtures covering awaiting response, explicit decline, confirmed booking, expiration, and cancellation.
- 21 automated tests in `apps/web` (14 lifecycle domain tests in `lib/jobs/lifecycle.test.ts` and 7 integration tests in `app/jobs/JobsScreen.test.tsx`), bringing total monorepo test coverage to 420 passing tests.

### Fixed
- Enforced strict customer data isolation in `MockCustomerActivityRepository.getActivities()` and `getActivityById()`.
- Enforced fail-closed authorization in `mutateJobStatus()`: missing ownership or mismatched customerId is rejected.
- Prevented manufactured invitations: acceptance and decline strictly require an active invitation on the job.
- Removed payment-result copy ("Completed & Paid", "payment settled") from `LifecycleStateSurface.tsx` to preserve the payment boundary.
- Removed mock acceptance and decline simulation controls from the customer lifecycle UI.
- Bound decline presentation strictly to `PENDING_ACCEPTANCE`, preventing stale or contradictory invitation data from overriding authoritative states (`CONFIRMED`, `CANCELLED`, `EXPIRED`).
- Eliminated overclaiming copy from `CancellationModal.tsx`: removed unverified "stop further processing" language and aligned titles and body text dynamically between service requests and confirmed bookings.
- Decoupled invitation dispatch from the exported `MockCustomerActivityRepository` class, replacing it with a standalone `dispatchDomainInvitation()` service function.
- Eliminated confirmed schedule fabrication: `confirmedSchedule` is retained solely from authoritative contracts and remains undefined otherwise; requested schedule is displayed separately.
- Enforced `PENDING_ACCEPTANCE` boundary on decline mutations: `DECLINE_INVITATION` now rejects operations outside that lifecycle state.
- Hardened invitation creation boundary: removed `SEND_INVITATION` from customer-facing `JobLifecycleAction` and `mutateJobStatus`, separating invitation dispatch into an internal domain operation.
- Removed synthetic fallback identifiers (`inv-...-sim`, `bw-simulated-artisan`) from simulation controls and guarded controls with active invitation check.
- Implemented accessible focus trap and focus restoration to the trigger button in `CancellationModal.tsx`.

### Added
- WEB-012 customer job matching at `/job/[referenceCode]/matches`.
- Production-first matching domain contracts in `apps/web/lib/matching/types.ts`.
- Deterministic mock matching adapter in `apps/web/lib/matching/mock-adapter.ts` supporting multiple states: in progress, matches available, no match, constraint-driven no match, degraded service, failure, and offline.
- Match candidate cards displaying public photo, skills, rating, starting rates, and customer-safe match explanations.
- "Express interest" / "Select BrainWorker" action with honest pending feedback and zero false booking or assignment claims.
- 59 automated tests covering component rendering, states, selection, and error recovery.

## [1.0.0-arch-002] - 2026-09-16

### Added
- ARCH-002 production contract alignment across packages and database schema.
- Strict separation between `JobStatus` (`open`, `in_progress`, `completed`, `cancelled`) and `BookingStatus`.
- Unified `UserRole` enum (`CUSTOMER`, `BRAINWORKER`, `ADMIN`, `CORPORATE_ADMIN`) across database and application types.
- Canonical Nigerian location dataset (7 active launch cities) and 8 core service categories.

## [1.0.0-web-011] - 2026-09-15

### Added
- WEB-011 customer jobs and bookings activity hub at `/jobs`.
- Distinct tabs for posted job requests and confirmed bookings.
- Direct "View Matches" action routing into the WEB-012 matching experience.

## [1.0.0-web-010] - 2026-09-14

### Added
- WEB-010 authenticated customer dashboard at `/dashboard`.
- Customer greeting, operational identity badges, metrics overview, and quick action cards.
- Integrated booking summary card linking directly to `/jobs`.

## [1.0.0-web-009] - 2026-09-13

### Added
- WEB-009 customer job posting flow at `/post-job`.
- Multi-step form with live review summary card synchronization.
- Urgency selection with date picker validation.
- Honest error boundary handling repository rejection without losing customer input.

## [1.0.0-web-008] - 2026-09-12

### Added
- WEB-008 authentication and verification flows at `/login`, `/register`, `/verify`, `/forgot-password`, and `/reset-password`.
- Nigerian phone number validation (080... format) and 6-digit OTP verification.
- Safe password recovery without account enumeration.
- Mock social provider authentication (Google, Apple) with simulation error hooks.

## [1.0.0-web-007] - 2026-09-11

### Added
- WEB-007 public booking preparation at `/book`.
- Service and location query parameter hydration.
- Address and notes validation with honest price calculation.

## [1.0.0-web-006] - 2026-09-10

### Added
- WEB-006 services discovery catalog at `/services`.
- Bidirectional URL query synchronization for search queries, categories, and cities.
- Active city validation with graceful nationwide fallback notices for unknown cities.

## [1.0.0-web-005] - 2026-09-08

### Added
- WEB-005 public BrainWorker profile at `/brainworkers/[brainworkerId]`.
- Guest-accessible profile consuming only `PublicBrainWorker` projection without exposing private verification documents or contact details.
- Explicit service and city validation before handing off to booking preparation.

## [1.0.0-web-004] - 2026-09-06

### Added
- WEB-004 service category detail page at `/services/[serviceId]`.
- Honest display of starting rates and deliverables from canonical service categories.

## [1.0.0-web-001] - 2026-09-01

### Added
- WEB-001 customer-first public homepage at `/`.
- Three marketplace entry paths (service categories, BrainWorkers, direct search).
- Viewport shell detection rendering mobile view below 768px without bottom navigation.

## [1.0.0-found] - 2026-08-10

### Added
- Modernized monorepo toolchain to Node 24 LTS, Next.js 15.5, React 19, Tailwind CSS v4, Prisma v6, and Zustand v5.
- Standardized package structure across apps and shared packages.
