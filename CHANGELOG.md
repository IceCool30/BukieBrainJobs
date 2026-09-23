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

## [1.0.0-web-017] - 2026-09-23

### Added
- WEB-017 In-App Messaging & Real-Time Chat integrated into canonical `/messages` and `/messages/[jobId]` routes.
- `apps/web/lib/messaging/types.ts`: Domain models for conversations, messages, delivery states (pending, sent, delivered, failed), media attachments (JPEG, PNG, WEBP up to 5 MB), structured location snapshots, and `IMessagingRepository` contract.
- `apps/web/lib/messaging/repository.ts`: Production-first `MessagingRepository` with fail-closed customer and booking participant isolation, thread deduplication per `jobId`, offline optimistic message queuing with retry and cancel controls, and deterministic scenario fixtures.
- `apps/web/components/messaging/ConversationHub.tsx`: Authenticated messaging inbox supporting real-time conversation filtering, unread indicators, and 12-column desktop master-detail / mobile responsive layout.
- `apps/web/components/messaging/ChatScreen.tsx`: Active conversation surface with deterministic midnight-rollover date separators, optimistic delivery indicators, failed-message retry, and archived read-only state for completed or cancelled bookings.
- `apps/web/components/messaging/MediaUploadStaging.tsx`: Image attachment staging with client-side MIME and size validation (5 MB maximum) and instant cancellation before dispatch.
- `apps/web/components/messaging/LocationShareModal.tsx` and `LocationMessageCard.tsx`: Explicit one-time structured location snapshot capture with safe external Google Maps link.
- `apps/web/app/messages/page.tsx` and `apps/web/app/messages/[jobId]/page.tsx`: Production routes with Next.js 15 App Router static generation guards and authentication redirects.
- 208 automated messaging tests across 6 phases, bringing the monorepo web test suite to 816 passing tests with 0 failures.

### Changed
- Retired temporary "Messages coming soon" dialog and navigation targets across `DashboardScreen.tsx`, `ProfileNavigation.tsx`, and `JobsNavigation.tsx`, routing directly to `/messages`.
- Production repository boundary verified with 0 imports from `testing/` in production modules.

## [1.0.0-web-016] - 2026-09-22

### Added
- WEB-016 Customer Reviews & Reputation System integrated on completed bookings and BrainWorker profiles (`/brainworkers/[id]`).
- Multi-criteria rating inputs: Punctuality, work quality, communication, and overall score (1 to 5 stars).
- Customer review submission modal with 1,000 Unicode code point limit and honest character countdown.
- Public review feed on BrainWorker profile tabs displaying verified booking badges and timestamps.
- Review reporting and abuse flagging action.
- Fail-closed customer ownership authorization: customers can only review bookings they own that are in `COMPLETED` state.
- Offline protection disabling review submissions while keeping cached reviews accessible.
- 608 passing tests across 32 suites verified live on Vercel preview.

## [1.0.0-web-015] - 2026-09-21

### Added
- WEB-015 Customer Payments & Escrow UX integrated into confirmed bookings and canonical `/receipt/[bookingId]` route.
- `apps/web/lib/payment/types.ts`: Domain models for four-dimensional state machine (JobStatus, BookingStatus, PaymentAuthorizationStatus, EscrowStatus), fee schedule configuration, virtual accounts, USSD shortcodes, checkout sessions, payment attempts, receipts, and ICustomerPaymentRepository interface.
- `apps/web/lib/payment/repository.ts`: MockCustomerPaymentRepository with strict customer isolation, fee calculations, idempotency, failure/timeout simulation, dispute filing, refund handling, receipt generation, and 21 deterministic scenario fixtures.
- `apps/web/components/payment/EscrowProtectionTracker.tsx`: 4-milestone timeline (Booking Confirmed, Escrow Funded, Work & Inspection, Payment Settled), dynamic status badges, and localized release retry button.
- `apps/web/components/payment/CheckoutModal.tsx`: Escrow funding modal with transparent fee schedule breakdown, tabs for Debit/Credit Card (sandbox auto-fill), Bank Transfer (dedicated virtual account), and USSD shortcodes, with offline protection.
- `apps/web/components/payment/CompletionInspectionCard.tsx`: Verification checklist for customer inspection, approval modal with star rating and feedback, and report dispute action.
- `apps/web/components/payment/ReceiptModal.tsx`: Official payment and escrow receipt with Nigerian Naira formatting, print styling, JSON export, settlement badges, and sandbox watermark.
- `apps/web/components/payment/RefundRequestModal.tsx`: Customer refund request modal with reason selection and honest banking settlement timeline indicator.
- `apps/web/components/payment/DisputeModal.tsx`: BukieGuarantee dispute modal freezing escrow payout pending mediation.
- `apps/web/app/receipt/[bookingId]/page.tsx`: Canonical digital receipt page with customer auth guard, print styling, and JSON export.
- 62 automated tests (32 repository unit tests + 30 component integration tests in `PaymentsEscrow.test.tsx`), bringing total web test suite to 478 passing tests across 25 suites with 0 failures.

### Fixed
- Virtual account expiry: removed hard-coded 30-minute duration and made virtual account expiration provider-supplied and conditional.
- Payment method attribution: eliminated unconditional card attribution in payment verification, recording true payment method (card, bank transfer, USSD) across payment attempts, receipts, and history.
- Offline lifecycle protection: replaced hardcoded offline state with live network status detection in `LifecycleStateSurface.tsx`, displaying an offline read-only notice and disabling all financial mutation triggers.
- Test controller segregation and anti-tampering defense: segregated test fixture helpers into `getPaymentTestController()`, typed repository strictly to `ICustomerPaymentRepository`, and eliminated client fallback state synthesis vectors.
- Provider adapter decoupling: extracted `SandboxPaymentProviderAdapter` implementing `IPaymentProviderAdapter`, isolating virtual accounts, USSD generation, and payment branding from generic repository logic.
- Production interface boundary: stripped all test fixture methods from `CustomerPaymentRepository` so production consumers cannot access or invoke state-manipulation controls.
- Test module physical segregation: moved `PaymentInternalStore`, `CustomerPaymentTestController`, and test harnesses into a dedicated testing module (`apps/web/lib/payment/testing/`), ensuring production barrel export does not expose test fixtures or state controls.
- Fail-closed payment method attribution: removed implicit fallback to card in `verifyPayment()` and `checkVerificationStatus()`, failing closed with an explicit error when payment method cannot be authoritatively resolved.
- Master checklist and scope alignment: updated `docs/master-checklist.md` Section 1.2 to In Review with all items checked, and eliminated duplicate WEB-015 block in `docs/scope.md`.

## [1.0.0-web-014] - 2026-09-21

### Added
- WEB-014 Customer Profile & Account Settings on canonical `/profile` surface.
- `apps/web/lib/profile/types.ts`: Domain models for customer profile, saved addresses, notification channels and topics, active sessions, and account data export.
- `apps/web/lib/profile/repository.ts`: MockCustomerProfileRepository providing customer data isolation, Nigerian phone validation, password complexity checks, offline mode support, and fail-closed authorization.
- `apps/web/components/profile/ProfileScreen.tsx`: Tabbed customer profile dashboard supporting Personal Details, Saved Addresses, Security, Notifications, and Account Management.
- `apps/web/components/profile/PersonalDetailsSection.tsx`: Profile identity card with real-time Nigerian phone normalization, email verification status, and name updates.
- `apps/web/components/profile/SavedAddressesSection.tsx`: Address management card grid with default selection, accessible add and edit modal, landmark directions, and deletion confirmation.
- `apps/web/components/profile/SecuritySection.tsx`: Password update card, linked sign-in methods, and active sessions list with remote sign-out support.
- `apps/web/components/profile/NotificationPreferencesSection.tsx`: Granular communication switches across SMS, WhatsApp, Email, and In-App channels.
- `apps/web/components/profile/AccountManagementSection.tsx`: Complete JSON data export and account deletion danger zone with confirmation.
- `apps/web/components/profile/ProfileNavigation.tsx`: Responsive navigation sidebar and mobile bottom navigation with BukieGuarantee watermark and notice dialogs.
- 25 automated tests across repository logic and component interactions, including regression verification for session-switch customer isolation.

### Changed
- Updated dashboard and jobs navigation menus to route directly to `/profile`.
- Enhanced `DashboardScreen.tsx` tab listener to redirect profile query parameter cleanly to `/profile` while preserving the dedicated jobs tab view.

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
- Removed unsupported verification trust claims ("Verified Identity & Community Standards" safety standard card and preferred worker verified badge) from customer lifecycle surface until backed by authoritative verification contracts.

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
