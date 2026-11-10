# BukieBrainJobs Master Product & Implementation Checklist

**Document ID:** CHECKLIST-001  
**Status:** Living Canonical Roadmap Tracker  
**Last Updated:** 2026-11-10

This document provides a single, unified checklist of what has been built, what is partially implemented, and what remains to be completed across the BukieBrainJobs monorepo. It establishes the sequential order of execution so engineering moves forward in focused phases rather than scattered work.

**Current product baseline:** BW-008 On-Site Work & In-Progress Verification merged in PR #64 at `7501ce7`; BW-009 Post-Job Completion & Escrow Release PR creation pending; BW-010 Dispute Handling & Support Interface (Item 3.4) PM REVIEW ACCEPTED / OWNER COMMIT APPROVAL PENDING / LOCAL UNCOMMITTED. Phase 4 Mobile Application is active on branch `feature/mobile-accepted-slices`: Phase 4.1 Native Navigation & Shared Shell complete and PM accepted; Phase 4.2 Customer Native Experiences baseline accepted (MOB-001, MOB-BOOK-001, MOB-POST-001, MOB-ACT-001 at `990ef37`, mobile type-check baseline repair at `7040787`, MOB-LIFE-001 native booking lifecycle presentation UI-only at `35b4f0b`), with lifecycle persistence and full offline caching remaining separate and open; Phase 4.3 BrainWorker Native Experiences local UI-preview portions accepted and pushed (MOB-WORK-001 workspace preview at `2252aca`, MOB-WORK-002 invitation action modals preview at `c806442`, MOB-WORK-003 on-site check-in preview at `8f94843`), while real lead push delivery, live invitation responses, and GPS/device validation remain open; Expo SDK 58 upgrade pushed at `cfea7e9`. Mobile Visual Alignment (`MOB-VIS-001`): Slice 1 (Tokens, Shell & Home Screen) committed and pushed at `b82a365`; Slice 2 (Discovery & Service Detail) committed and pushed at `56d5ac7` (refined services.tsx, services/[id].tsx, and services-discovery.test.ts preserving 8 canonical services, routes, and mock behavior); Slice 3 (Shared Form Kit, Booking Prep & Job Posting) is the next active slice. Backend/database, persistence, full offline caching, and real device capabilities remain deferred or open. Latest mobile verification: 229/229 passing tests across 19 suites, `tsc --noEmit` exit 0, Android export passed with 1,430 modules bundled, and compiled Expo browser emulation verified in dark/light at 390x844 and 375x812 (/tmp/bbj-mobile-slice2-qa/browser-emulation-report.json confirms 8 service cards, zero page-level horizontal overflow, 50px search input, 48px CTA/back button, CTA #F7803C with #001A41 text in all 4 theme/viewport combinations; Playwright interactions checked search, clear, filters, reset, routing, and booking navigation; browser emulation checks, not native-device QA; Vercel canceled exact-SHA deployment dpl_CrHz1QvqeQsoGkUWpQiSbm77TSZY solely because mobile changes do not affect the Next.js app / skip unaffected project, not a failed build). Separate web homepage candidate at `apps/web/components/HeroSection.tsx` and `apps/web/app/page.test.tsx` remains uncommitted and separately unaccepted. Preserved QA evidence under `docs/screenshots/` and `docs/check-log.md` remains uncommitted and unmodified.

---

## 1. High-Level Workstream Matrix

| Workstream                               | Status                                                                                                                                                  | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Product Foundation & Contracts**       | **Complete**                                                                                                                                            | Monorepo layout, shared types, Zod schemas, test harnesses.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| **Design System & Visual Standards**     | **Complete**                                                                                                                                            | Tailwind tokens, deep navy/emerald palette, responsive typography.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| **Public Website Foundation**            | **Mostly Complete**                                                                                                                                     | Homepage, services catalog, service details, BrainWorker profiles.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| **Customer Web Platform Foundation**     | **Complete**                                                                                                                                            | Dashboard, job posting, matching, activity hub, booking lifecycle (100% Phase 1 Complete).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| **Customer Payments & Escrow UX**        | **Complete**                                                                                                                                            | Merged to main at 78623cb. Production boundary isolation, fail-closed attribution, provider neutrality, and 479-test coverage verified.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| **Customer Reviews & Reputation**        | **Complete**                                                                                                                                            | Completed & live in production. 608 passing tests across 32 suites. Verified on Vercel deployment 6586791746 (commit 962a870).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| **Customer Notifications & Messaging**   | **Complete**                                                                                                                                            | Messaging (WEB-017) and Notification Center (WEB-018) both complete and live in production.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| **Customer Profile & Account Settings**  | **Complete**                                                                                                                                            | Personal info, saved addresses, auth credentials, notification rules, account data management.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| **BrainWorker Platform**                 | **Complete**                                                                                                                                            | BW-001 Onboarding & Identity, BW-002 Service Catalog & Availability, BW-003 Leads Inbox, BW-004 Booking Management, Item 2.2 Operating Dashboard, BW-005 Profile & Portfolio Management, and BW-006 Earnings, Wallet & Payouts are recorded complete. Latest merge: BW-006, PR #60 at `3f0cc64`; 42/42 wallet contracts reported in Item 2.6.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| **Full Two-Sided Marketplace Lifecycle** | **Complete (Item 3.4 PM Accepted)**                                                                                                                     | BW-007 (Item 3.1), BW-008 (Item 3.2, PR #64 merged), BW-009 (Item 3.3), and BW-010 (Item 3.4) completed; BW-010 PM review accepted, owner commit approval pending.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| **Mobile Application (`apps/mobile`)**   | **In Progress (Phase 4.1 & 4.2 UI baselines accepted; Phase 4.3 UI previews pushed; SDK 58 upgraded; MOB-VIS-001 Slices 1 & 2 complete, Slice 3 next)** | Expo Router tabs, Obsidian Titanium Gunmetal Dark tokens, safe area handling (items 4.1.1 to 4.1.3), customer discovery (MOB-001), booking prep (MOB-BOOK-001), posting (MOB-POST-001), activity hub (MOB-ACT-001 at `990ef37`), and lifecycle presentation (MOB-LIFE-001 at `35b4f0b`) accepted as UI previews; BrainWorker workspace preview (MOB-WORK-001 at `2252aca`), invitation action modals preview (MOB-WORK-002 at `c806442`), and on-site check-in preview (MOB-WORK-003 at `8f94843`) accepted and pushed; Expo SDK 58 upgrade pushed at `cfea7e9`. Visual alignment (`MOB-VIS-001`) Slices 1 and 2 completed and pushed at `b82a365` and `56d5ac7`; Slice 3 (Shared Form Kit, Booking Prep & Job Posting) is next active slice. Real push notifications, live invitation responses, GPS device checks, persistence, full offline caching, and backend integration remain open or deferred. Verified with 229/229 mobile tests across 19 suites, clean type-check, Android bundle export (1,430 modules), and compiled Expo browser emulation at 390x844 and 375x812 in dark/light modes (browser emulation and Expo Go only; native device QA unverified). |
| **Admin & Operational Console**          | **Not Built**                                                                                                                                           | Worker vetting, dispute mediation, category management, analytics.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| **Corporate Portal (`/enterprise`)**     | **Deferred**                                                                                                                                            | Kept intentionally as Coming Soon until consumer launch.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **Backend & Database Integration**       | **Deferred**                                                                                                                                            | Prisma schema exists. Real PostgreSQL connection and REST/GraphQL APIs deferred.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| **Production Hardening & Launch QA**     | **Not Built**                                                                                                                                           | Accessibility audits, native QA, security penetration check, observability.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |

---

## 2. Approved Sequential Execution Order

To keep the platform coherent, work progresses through these phases in order:

```
Phase 1: Customer Web Completion
    └── Payments UX, reviews, notifications, profile/settings, messaging
         │
Phase 2: BrainWorker Web Platform
    └── Onboarding, verification, lead feed, availability, earnings
         │
Phase 3: Two-Sided Marketplace Lifecycle
    └── Real-time worker response, scheduling, check-in, dispute mediation
         │
Phase 4: Mobile Application (`apps/mobile`)
    └── Expo native reconstruction of customer and worker journeys, push alerts
         │
Phase 5: Backend & Database Integration
    └── REST/RPC APIs, PostgreSQL persistence, Paystack/Flutterwave, socket cluster
         │
Phase 6: Production Hardening
    └── Monorepo E2E tests, accessibility sign-off, security review, Core Web Vitals
         │
Phase 7: Launch Readiness
    └── App Store / Play Store releases, production checks, operations readiness
```

---

## 3. Detailed Itemized Checklist

### Phase 1: Customer Web Platform Completion

#### 1.1 Customer Profile & Account Settings

- [x] Personal information editing (`/profile`): Name, primary phone, email address.
- [x] Saved addresses manager: Adding and editing Nigerian service locations with landmark notes.
- [x] Security settings: Password change form, active sessions list, authentication provider linking.
- [x] Notification preferences: Toggles for SMS, WhatsApp, Email, and In-App alerts.
- [x] Account management: Safe account deletion and data export requests.
- [x] Customer isolation enforced through the authenticated session boundary with fail-closed mutations.
- [x] Deterministic loading, saved confirmation, validation error, repository failure, and offline read-only states verified.
- [x] WEB-014 implementation verified through CI, 416 passing web tests, production build, and Vercel preview deployment.

#### 1.2 Customer Payments & Escrow Frontend Experience (WEB-015, Complete)

- [x] Checkout drawer/modal triggered upon booking confirmation with transparent fee schedule breakdown.
- [x] Payment method selection UI: Card (sandbox tokenized entry), Dedicated Bank Transfer (virtual account), and USSD flows matching Nigerian standards.
- [x] Payment authorization state machine: Processing, verified, failed, retry, and timeout states.
- [x] Escrow protection tracker: 4-milestone visual timeline showing funds held securely, technician dispatch, work inspection, and customer approval before payout.
- [x] Digital receipts and invoices: Downloadable and printable receipts (`/receipt/[bookingId]`) with settlement status indicators.
- [x] Customer refund request interface with honest banking settlement timeline indicators.
- [x] Fail-closed customer ownership authorization and offline read-only financial protection.
- [x] Provider-neutral architecture decoupling gateway metadata behind IPaymentProviderAdapter and isolating test fixtures.
- [x] Production repository boundary fully closed: repository.ts has zero test module imports; test construction path lives entirely in testing/harness.ts; exact export surface regression-tested.
- [x] Merged to main at 78623cb. 479 tests passing across 25 suites with 0 failures.

#### 1.3 Customer Reviews & Reputation System

- [x] Post-completion review prompt modal triggered when a booking enters `COMPLETED`.
- [x] Multi-criteria rating inputs: Punctuality, work quality, communication, and overall score (1 to 5 stars).
- [x] Written feedback textarea with honest character limits and guidelines.
- [x] Review display tabs on BrainWorker public profiles (`/brainworkers/[id]`) showing verified customer feedback.
- [x] Review reporting and abuse flagging action.
- [x] Merged to main at 962a870. 608 tests passing across 32 suites with 0 regressions. Verified on Vercel production preview.

#### 1.4 In-App Messaging & Real-Time Chat (WEB-017, Complete)

- [x] Replace "Messages coming soon" dialog in navigation with active chat thread list (`/messages`).
- [x] Conversation view between customer and assigned BrainWorker (`/messages/[jobId]`).
- [x] Photo attachment upload (e.g., leaking pipe, damaged circuit, replacement parts).
- [x] Location share shortcut.
- [x] Offline message caching with pending delivery indicators, failed retry, and cancellation.
- [x] Integration with transport-agnostic messaging repository and client hooks.
- [x] Completed and verified live in production (commit 99f11f1; 208/208 messaging tests, 816/816 web regression tests; Vercel preview verified).

#### 1.5 Notification Center

- [x] Replace "Notifications coming soon" dialog with notification feed (`/notifications`).
- [x] Category tabs: All, Bookings, Messages & Payments, and Account.
- [x] Read and unread badge state tracking with live repository subscription and 99+ capping.
- [x] Deep-link navigation from notifications straight to corresponding sanitized `/jobs?id=...` records.
- [x] Web Push adapter integration with explicit-click opt-in permission and graceful fallback.
- [x] Completed and verified live in production (commit b8eb6e6; 128/128 notification tests, 944/944 web regression tests; Vercel deployment verified).

---

### Phase 2: BrainWorker (Service Provider) Web Platform

#### 2.1 BrainWorker Onboarding & Identity Verification (`BW-001`)

- [x] Dedicated BrainWorker signup entry point (`/brainworker/register`).
- [x] Multi-step onboarding funnel: Trade category selection, experience level, coverage cities.
- [x] Identity check interface: Secure capture of National Identity Number (NIN) / Bank Verification Number (BVN) and government ID upload.
- [x] Trade certifications and apprentice proofs upload.
- [x] Application pending / verification in review status screen (`/brainworker/verification-status`).
- [x] Completed and verified live in production (commit `36b8385`; 137/137 BrainWorker tests, 1,079/1,079 web regression tests; Vercel deployment verified).

#### 2.2 BrainWorker Dashboard & Operating Workspace (Complete: Phases 1 to 4 Verified)

- [x] BrainWorker authenticated home (`/brainworker/dashboard`).
- [x] Operational metric cards: Today's schedule, next scheduled arrival, active jobs, pending quotes, completed jobs, client rating (strictly zero financial/wallet figures).
- [x] Quick toggles: Online/available for instant dispatch vs Off-duty with profile completeness invariant.
- [x] Urgent local requests ticker: Privacy-safe area display, emergency and same-day badges.
- [x] Verified implementation: 40/40 dashboard contracts passed (10 DASH, 8 SVC, 12 COMP, 10 ROUT); 1,546/1,546 monorepo web tests green; 7/7 type-check clean; 42/42 static routes compiled cleanly.

#### 2.3 Job Requests & Leads Inbox (`BW-003`, Complete: Phases 1 to 7 Verified)

- [x] Lead domain contracts & eligibility rules (Phase 1, LEAD-001 to LEAD-007).
- [x] Leads repository & tenant isolation (Phase 2, REP-001 to REP-010).
- [x] Invitation response actions & canonical decline reasons (Phase 3, INV-001 to INV-010).
- [x] Quote submission foundation & catalog diagnostic fee authority (Phase 4, QUO-001 to QUO-016).
- [x] Open requests feed: Filterable by trade, proximity, and urgency (`/brainworker/leads`, Phase 5 UI-001 to UI-006).
- [x] Job lead detail inspection: Review customer problem description, photos, location area, and budget (Phase 5 UI-007 to UI-012).
- [x] Quote submission drawer & direct invitation response UI surfaces (Phase 5 UI-009).
- [x] Route integration & security guards (Phase 6 INT-001 to INT-010).
- [x] Production verification & final audit (Phase 7 PROD-001 to PROD-045): 45/45 contracts verified on `feature/bw-003-leads-inbox` at `cdb7e54`; full suite 1,369/1,369 passed (1,320 web + 42 validation + 7 utils); type-check clean; lint zero errors; production build passed with `/brainworker/leads` static. Post-merge: PR #53 MERGED to `main` at `db968bc`; post-merge CI SUCCESS (runs 37107064066 and 37107064068); 45/45 Phase 7 contracts re-passed on `main`; type-check 6 successful on `main`.

#### 2.4 BrainWorker Booking Management (`BW-004`, Complete: Phases 1 to 8 Verified)

- [x] Domain contracts & lifecycle rules (BOOK-001 to BOOK-017).
- [x] Repository & tenant isolation (REP-001 to REP-014).
- [x] Dispatch progression tracking (DIS-001 to DIS-008).
- [x] On-site arrival and single-snapshot check-in (CHK-001 to CHK-015).
- [x] Itemized scope adjustment requests (SCOPE-001 to SCOPE-018).
- [x] Cancellation handling & reason taxonomy (CAN-001 to CAN-008).
- [x] Operational UI views and accessible components (UI-001 to UI-024).
- [x] Protected routes and security gates (INT-001 to INT-011).

#### 2.5 Service Catalog & Availability Management (`BW-002`)

- [x] Worker service catalog configuration: Add or remove individual services, set hourly rates and diagnostic call-out fees.
- [x] Weekly working hours scheduler: Set working days, time slots (e.g., 8:00 AM to 5:00 PM), and emergency availability.
- [x] Coverage area selector: Select specific neighbourhoods and maximum travel radius.

#### 2.6 BrainWorker Earnings, Wallet & Payouts (`BW-006`, Complete: Phases 1 to 5 Verified)

- [x] Wallet summary: Available balance, pending escrow clearance, and lifetime earnings.
- [x] Nigerian bank account setup form: Select bank (Access, GTBank, Zenith, etc.) and account number with account name verification preview.
- [x] Withdrawal / payout request flow with confirmation history.
- [x] Detailed transaction history with booking references and service fee deductions.
- [x] Verified implementation: 42/42 wallet contracts passed (10 WALLET, 10 REP, 12 COMP, 10 ROUTE); monorepo web tests green; 7/7 type-check clean; 44 static routes compiled cleanly.

#### 2.7 BrainWorker Profile & Portfolio Management (`BW-005`, Complete: Phases 1 to 5 Verified)

- [x] Profile editor: Headshot upload, bio, years in trade, spoken languages.
- [x] Portfolio gallery manager: Before-and-after work photos with short captions.
- [x] Client reviews tab: View customer feedback and submit worker counter-responses.
- [x] Verified implementation: 42/42 profile contracts passed (10 PROF, 10 REP, 12 COMP, 10 ROUTE); 1,588/1,588 monorepo web tests green; 7/7 type-check clean; 43/43 static routes compiled cleanly.

---

### Phase 3: Full Two-Sided Marketplace Lifecycle

#### 3.1 Collaborative Scheduling & Dispatch (`BW-007`, Complete: Phases 1 to 5 Verified)

- [x] Mutually agreed booking arrival window display.
- [x] Reschedule request flow with accept/counter-propose actions for both parties.
- [x] Technician dispatch tracker: Status updates when worker departs and arrives at customer premises.
- [x] Verified implementation: 42/42 scheduling contracts passed (10 SCHED, 10 REP, 12 COMP, 10 ROUTE); 1,665/1,665 monorepo web tests green; 7/7 type-check clean; 44 static and dynamic routes compiled cleanly.

#### 3.2 On-Site Work & In-Progress Verification (`BW-008`, Complete: Phases 1 to 5 Verified)

- [x] Worker check-in confirmation at customer location (GPS coordinates, landmark confirmation, and escrow gate).
- [x] Scope adjustment request: Worker submits additional parts or cost request if diagnostics reveal extra work.
- [x] Customer approval step for on-site scope adjustments with integer kobo total settlement recalculation.
- [x] Work completion submission: Worker uploads photo proof of completed task and requests customer confirmation.
- [x] Verified implementation: 42/42 on-site contracts passed (10 ONSITE, 10 REP, 12 COMP, 10 ROUTE); 1,707/1,707 monorepo web tests green; 7/7 type-check clean; 44 static and dynamic routes compiled cleanly.

#### 3.3 Post-Job Completion & Escrow Release (`BW-009`, Complete: Phases 1 to 5 Verified)

- [x] Customer confirmation flow: "Confirm Satisfaction & Release Payout" (transitions booking to `COMPLETED` and escrow to `ESCROW_RELEASED`).
- [x] 72-hour auto-release safeguard: Timer logic automatically disburses escrow funds if customer does not respond within the inspection window and no dispute is active.
- [x] Mutual rating exchange: Double-blind mutual rating system unlocking ratings upon dual submission across punctuality, quality, communication, and overall criteria.
- [x] Verified implementation: 42/42 completion contracts passed (10 COMPL, 10 REP, 12 COMP, 10 ROUTE); monorepo web tests green; 7/7 type-check clean; 44 static and dynamic routes compiled cleanly.

#### 3.4 Dispute Handling & Support Interface (`BW-010`, PM REVIEW ACCEPTED / OWNER COMMIT APPROVAL PENDING / LOCAL UNCOMMITTED)

- [x] Pure domain contracts (DISP-001 to DISP-010): Enforce canonical 17.5% platform fee schedule (10% service fee + 7.5% trust fee = 1750 bps, 82.5% tasker share), integer Kobo settlement arithmetic, dispute categories, and state machine transitions.
- [x] In-memory repository contracts (REP-001 to REP-010): Private mapping, deep clone isolation, participant tenant authorization, duplicate protection, session-scoped evidence store with draft isolation, and timeline auditing.
- [x] UI component suite (UI-001 to UI-011): DisputeBookingPageView with caller-filtered queries (`getDisputeByBookingId(targetBookingId, currentUser.id)`), cross-record integrity checks, zero demo backdoors, truthful preview heading (`Dispute Workspace Preview: Dispute Resolution and Support`), `LOCAL RECORD: ${status}` badges, `Retry Local Status Update` action, DisputeInitiationModal with synchronous submission locking, DisputeCounterEvidenceModal for BrainWorker counter-evidence with repeat-safe submission, DisputeTimelineView with submitted evidence gallery and accessible fallback thumbnail rendering on load failure, DisputeEvidenceUploader with `useId()` session scoping, BrainWorkerDisputeBanner with `role="alert"`, 44px touch targets, and simulated local status disclosure, HelpCenterView with amber focus ring and honest emergency/qualification/mediation prototype disclosures, and SupportTicketForm rendered in an explicitly read-only, unavailable state with all fields and submit button disabled, with no fake submission simulation.
- [x] Protected dynamic route integration (ROUTE-001 to ROUTE-021): Next.js 15 App Router `/disputes/[bookingId]` with async server component awaiting params and `key={bookingId}` on client view, unauthenticated redirect, 403 participant access control and cross-record mismatch closure (ROUTE-018), 404 booking alerts, reactive offline listeners, state clearance on route change, StrictMode replay resilience (ROUTE-015), A-to-B navigation isolation (ROUTE-016), local booking status sync failure/retry recovery (ROUTE-017, ROUTE-019), idempotent counter-evidence submission retry (ROUTE-020), distinct evidence preservation (ROUTE-020b), unswallowed route params error propagation (ROUTE-012b), and back link navigation rendering "Back to Booking Detail" (ROUTE-021) navigating customers to their protected completion view (`/completion/[bookingId]`) and preserving the BrainWorker destination (`/brainworker/bookings/[bookingId]`).
- [x] Verified local test suite: 110/110 dispute and booking integration tests passing across 6 suites (106 dispute + 4 BookingDetailView tests), 25/25 cross-route completion tests passing, 44/44 deterministic scheduling tests passing, full web suite passing with 1,879/1,879 tests across 126 suites, 0 type errors, 0 lint errors, production build exit code 0. Captured complete 17-screenshot catalog in `docs/screenshots/` without dev overlays.
- [x] Product Manager Review: Accepted by PM. Owner commit approval pending; all work remains strictly local and uncommitted.
- [ ] Reserved: Production PostgreSQL database migrations and backend settlement webhooks (Reserved for Mr. Solomon).
- [ ] Reserved: Production deployment and native mobile screen rollout (Phase 4).

---

### Phase 4: Mobile Application (`apps/mobile`)

#### 4.1 Native Navigation & Shared Shell

- [x] Expo Router configuration with bottom tabs: Home, Services, Jobs, Messages, Profile (IA-001 aligned, verified with 3/3 tabs tests and 17/17 content guardrail tests in apps/mobile).
- [x] Brand-aligned design token implementation in React Native StyleSheet (THEME-001, Obsidian Titanium Gunmetal Dark: dark default; persisted light/dark selection via AsyncStorage; home-header toggle; selected theme restored across home, tab, service-detail, and booking routes; verified in the full 95/95 mobile suite).
- [x] Safe area and status bar handling for iOS and Android (RootLayout SafeAreaProvider + StatusBar whose icon style follows the selected theme and whose background uses the matching canvas, react-native-safe-area-context ~4.12.0 matching Expo SDK 52 standardized across marketing home, tab screens with double-inset prevention, BrainWorker registration, and dynamic tab bar safe-area insets in apps/mobile/app/(tabs)/\_layout.tsx preventing BottomTabBar inset overrides, verified with 8/8 safe-area tests and 4/4 tab tests including nonzero bottom inset regression).

#### 4.2 Customer Native Experiences

- [x] Native public discovery: Homepage, category list, service detail screens (MOB-001: VERIFIED & PASSED; 46/46 mobile unit and integration tests passing across 6 suites; standalone marketing home in app/index.tsx with exact amber primary CTA #FF6B35 / rgb(255, 107, 53), 48dp CTA buttons, and 48dp AllServicesLink; services catalog in app/(tabs)/services.tsx with search input, filter pills, and service cards meeting 48dp targets; shared bottom tab bar geometry resolved in app/(tabs)/\_layout.tsx to 75x49px >= 48dp, with home/jobs/messages/profile kept untouched; service detail in app/services/[id].tsx with 48x48 back button, "Examples in this local catalog", and honest LOCAL PREVIEW disclaimers; browser/device emulation verified 10/10 green with continuous video recorded at docs/screenshots/videos/expo-mob001-discovery-verification.webm and 9 repository-relative screenshots; native Android/iOS runtime unavailable).

##### 4.2.2 Native Booking Preparation, Job Posting, Customer Activity, and Lifecycle (IN PROGRESS)

- [x] Native booking preparation (`MOB-BOOK-001`): Complete and PM accepted after owner-delegated review; local preview only. Verified in the actual Expo web app at 375x812 mobile browser emulation in light and dark themes. Native iOS/Android runtime and screen-reader QA unavailable.
- [x] Multi-step native job-posting flow (`/post-job`, `MOB-POST-001`): PM accepted on 2026-10-31 under the product owner's delegation; native in-memory local preview only. The [QA report](reports/MOB-POST-001-native-job-posting-qa.md) records 147/147 mobile tests across 15 files, TypeScript check exit 0, static exports verified (web, Android, iOS), 5 distinct 375x812 screenshots captured, continuous WebM recording, and compiled Expo browser-emulation checks. This is not native-runtime proof. Actual native iOS/Android runtime, screen-reader and device-specific QA remain unverified. Phase 4.2.2 remains IN PROGRESS.
- [x] Native customer activity hub with segmented controls for All, Active, Upcoming, Past (`MOB-ACT-001`): PM accepted on 2026-11-02 under owner-delegated review; static in-memory preview only. Verified in the compiled Expo application with 154/154 mobile tests passing across 16 files, TypeScript check exit 0, static exports verified (web, Android, iOS), 6 distinct screenshots captured, continuous WebM recording, and Playwright browser-emulation checks. This is not native-runtime proof. Actual native iOS/Android runtime, screen-reader and device-specific QA remain unverified. Phase 4.2.2 remains IN PROGRESS: MOB-LIFE-001 lifecycle presentation is PM accepted on 2026-11-03 under owner delegation; the separate lifecycle persistence and full offline caching item remains unchecked. See decision MOB-ACT-001-DEC-001.
- [x] Native booking lifecycle presentation UI (`MOB-LIFE-001`): PM accepted on 2026-11-03 under owner delegation; UI-only local sample presentation on /jobs tab route using screen-local selection state across 6 approved static sample fixtures with canonical JobStatus milestone mapping. Verified with 169/169 isolated staged mobile tests (172/172 in full dirty working tree; 151/151 in prerequisite commit `7040787`), TypeScript check exit 0, static exports verified (web, Android, iOS), Playwright browser-emulation checks, text/icon contrast compliance (>= 4.5:1), and documented PM baseline exception strictly for 10 date-sensitive web scheduling tests. Native iOS/Android runtime QA remains unverified. Phase 4.2.2 remains IN PROGRESS because persistence and full offline caching remain separate and unchecked; no next slice selected under delegated PM authority. See spec [`MOB-LIFE-001`](specs/MOB-LIFE-001-native-booking-lifecycle-ui-only.md), decision `MOB-LIFE-001-DEC-001`, and QA report `reports/MOB-LIFE-001-native-booking-lifecycle-qa.md`.
- [ ] Native booking lifecycle persistence and full offline caching: Deferred and excluded from MOB-LIFE-001. Requires background synchronization, offline SQLite/local storage, cache invalidation, and network recovery state machines.

#### 4.3 BrainWorker Native Experiences (IN PROGRESS)

- [ ] Worker mobile workspace and lead push notifications: Local UI preview accepted and pushed as `MOB-WORK-001` at `2252aca` (sample lead card at `/brainworker/workspace-preview` with 48dp touch targets and mock lead details); real push notification delivery via Expo Notifications / FCM and backend integration remain open.
- [ ] Immediate job invitation accept/decline action modals: Local UI preview accepted and pushed as `MOB-WORK-002` at `c806442` (accessible Accept confirmation and Decline reason-taxonomy modals with in-memory outcome card); live invitation response submission, booking mutations, and backend integration remain open.
- [ ] On-site check-in with GPS location confirmation: Local UI preview accepted and pushed as `MOB-WORK-003` at `8f94843` (sample check-in preview with simulated radius proximity and manual code entry); real GPS device location confirmation, geolocation hardware permissions, and backend arrival verification remain open.

#### 4.4 Device Capabilities & Push Alerts (Deferred / Open)

- [ ] Push notifications setup via Expo Notifications / FCM.
- [ ] Camera and photo gallery access for work proofs and attachments.
- [ ] Device biometric authentication (Face ID / Fingerprint) for quick wallet access.
- [ ] SQLite local database synchronization for offline browsing.

#### 4.5 Mobile Platform Maintenance & Upgrades

- [x] Upgrade Expo SDK to 58 (`cfea7e9`): Upgraded React Native 0.88, React 19.3.0, Expo 58.0.23, Expo Router 58.0.30; consolidated all 25 workspace dependency overrides into `pnpm-workspace.yaml` (including `image-size: ^2.0.3`); cleared legacy `pnpm` block from `package.json`; verified 222/222 mobile tests passing across 19 suites, `tsc --noEmit` exit 0, dependencies up to date, Android static export clean (`dist-android`, 3.6MB bundle, 48 assets), and Expo Go tunnel verified responding HTTP 200 when checked on Nov 5, 2026. Browser emulation and Expo Go only; native device QA remains unverified.
- [ ] Mobile UI-Only Visual Alignment Pass (`MOB-VIS-001`, IN PROGRESS): Program to elevate typography, spacing, surface contrast, brand tokens, and component polish to match the web/PWA Outlier standard without altering backend, database, auth, network APIs, or routes.
  - [x] Slice 1: Foundation Tokens, Shell & Home Screen (Committed and pushed at `b82a365`). Reconciled Outlier tokens (`ctaFill: #F7803C`, `ctaText: #001A41`, `ctaPressed: #FF8D4D` delivering 6.62:1 contrast dark/light), pill buttons (`borderRadius: 9999`), tab bar active tints (`#F7803C` dark, `#ABEEC8` light via `getStripAccentColor`), title-case labels, exact owner-approved native-home headline (`Book a skilled local or remote worker in minutes or find flexible work that pays what you are worth only on BukieBrainJobs`), home header theme toggle, and updated home source-contract tests.
  - [x] Slice 2: Discovery & Service Detail (Committed and pushed at `56d5ac7`). Refined `app/(tabs)/services.tsx`, `app/services/[id].tsx`, and `app/services-discovery.test.ts`. Preserved all 8 canonical services, routes, and mock behavior. Added 50px search input, rounded filter pills, card elevation, streamlined preview badge, refined task list, 48px CTA/back buttons, and navy-on-coral primary CTA. Verified via 229 passing tests across 19 suites, clean type-check, Android export (1,430 modules), and compiled Expo browser emulation (390x844 and 375x812, dark/light; report in `/tmp/bbj-mobile-slice2-qa/browser-emulation-report.json`). Browser emulation only; native device QA remains unverified. Vercel canceled exact-SHA deployment `dpl_CrHz1QvqeQsoGkUWpQiSbm77TSZY` solely because mobile changes do not affect the Next.js app (skip unaffected project).
  - [ ] Slice 3: Shared Form Kit, Booking Prep & Job Posting (Next Active Slice). Scoped files: `apps/mobile/components/form-kit.tsx`, `apps/mobile/app/book.tsx`, `apps/mobile/app/post-job.tsx`, `apps/mobile/app/book.test.tsx` (and `apps/mobile/app/book.test.ts`), `apps/mobile/app/post-job-native-focus.test.ts`. UI-only boundary: form primitives upgrade, rounded choice chips, input focus states, step indicator polish, review card layout. Zero backend/database, zero network APIs, zero state persistence. No native iOS/Android, VoiceOver/TalkBack, device safe-area, or physical keyboard claims.
  - [ ] Slice 4: Customer Activity Hub & Lifecycle (Pending).
  - [ ] Slice 5: BrainWorker Workspace & Modals (Pending).

---

### Phase 5: Backend & Database Integration (Deferred)

- [ ] Connect Prisma client to production PostgreSQL database.
- [ ] Implement database migrations for users, profiles, jobs, bookings, invitations, messages, reviews, and payments.
- [ ] Implement secure authentication endpoints (JWT / session cookies, bcrypt password hashing, Termii SMS OTP integration).
- [ ] Implement payment webhooks (Paystack / Flutterwave charge success, transfer success, refund events).
- [ ] Production socket cluster deployment for `services/socket-server`.
- [ ] AWS S3 / Cloudinary upload pipeline for user documents and photos.

---

### Phase 6: Production Hardening & Quality Assurance

- [ ] End-to-end user journey tests across all routes using Playwright.
- [ ] Accessibility review: Screen reader audit (VoiceOver / TalkBack), keyboard focus management, 4.5:1 contrast verification, and reduced motion enforcement.
- [ ] Security audit: Tenant and customer data isolation verification, rate limiting on auth endpoints, input sanitization, and secret leaks scan.
- [ ] Performance audit: Core Web Vitals optimization (LCP < 2.5s, CLS < 0.1, INP < 200ms), bundle size analysis, image compression.
- [ ] Observability setup: Sentry error reporting, structured application logging, and health check endpoints.

---

### Phase 7: Launch Readiness & Go-To-Market

- [ ] Production environment smoke testing and DNS verification on primary domain.
- [ ] Customer support operations onboarding and ticketing runbooks.
- [ ] App Store and Google Play Store build submission, review metadata, and screenshot assets.
- [ ] Rollback and disaster recovery rehearsal.
- [ ] Launch readiness sign-off across product, design, engineering, and operations.

---

### Future Milestones (Not in Consumer Launch Scope)

- [ ] **Milestone 7: Corporate B2B Portal (`/enterprise`)**: Organization profiles, team manager roles, consolidated monthly invoicing, and facility maintenance agreements.
- [ ] **Milestone 9: AI Capabilities**: Intelligent technician dispatching, smart quote estimation, automated diagnostic photo analysis.
