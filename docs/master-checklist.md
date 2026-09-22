# BukieBrainJobs Master Product & Implementation Checklist

**Document ID:** CHECKLIST-001  
**Status:** Living Canonical Roadmap Tracker  
**Last Updated:** 2026-09-21  

This document provides a single, unified checklist of what has been built, what is partially implemented, and what remains to be completed across the BukieBrainJobs monorepo. It establishes the sequential order of execution so engineering moves forward in focused phases rather than scattered work.

---

## 1. High-Level Workstream Matrix

| Workstream | Status | Notes |
|---|---|---|
| **Product Foundation & Contracts** | **Complete** | Monorepo layout, shared types, Zod schemas, test harnesses. |
| **Design System & Visual Standards** | **Complete** | Tailwind tokens, deep navy/emerald palette, responsive typography. |
| **Public Website Foundation** | **Mostly Complete** | Homepage, services catalog, service details, BrainWorker profiles. |
| **Customer Web Platform Foundation** | **Substantially Complete** | Dashboard, job posting, matching, activity hub, booking lifecycle. |
| **Customer Payments & Escrow UX** | **Complete** | Merged to main at 78623cb. Production boundary isolation, fail-closed attribution, provider neutrality, and 479-test coverage verified. |
| **Customer Reviews & Reputation** | **Complete** | Completed & live in production. 608 passing tests across 32 suites. Verified on Vercel deployment 6586791746 (commit 962a870). |
| **Customer Notifications & Messaging** | **Partially Built** | Shell dialogs exist. Chat threads, socket client, and push UX missing. |
| **Customer Profile & Account Settings** | **Complete** | Personal info, saved addresses, auth credentials, notification rules, account data management. |
| **BrainWorker Platform** | **Not Built** | Onboarding, identity check, job inbox, availability, earnings wallet. |
| **Full Two-Sided Marketplace Lifecycle** | **Partially Built** | Customer state machine is built. Worker accept/decline and check-in are missing. |
| **Mobile Application (`apps/mobile`)** | **Not Built** | Expo starter only. Full native reconstruction required. |
| **Admin & Operational Console** | **Not Built** | Worker vetting, dispute mediation, category management, analytics. |
| **Corporate Portal (`/enterprise`)** | **Deferred** | Kept intentionally as Coming Soon until consumer launch. |
| **Backend & Database Integration** | **Deferred** | Prisma schema exists. Real PostgreSQL connection and REST/GraphQL APIs deferred. |
| **Production Hardening & Launch QA** | **Not Built** | Accessibility audits, native QA, security penetration check, observability. |

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

#### 1.4 In-App Messaging & Real-Time Chat
- [ ] Replace "Messages coming soon" dialog in navigation with active chat thread list (`/messages`).
- [ ] Conversation view between customer and assigned BrainWorker.
- [ ] Photo attachment upload (e.g., leaking pipe, damaged circuit, replacement parts).
- [ ] Location share shortcut.
- [ ] Offline message caching with pending delivery indicators.
- [ ] Integration with `services/socket-server` client hooks.

#### 1.5 Notification Center
- [ ] Replace "Notifications coming soon" dialog with notification feed (`/notifications`).
- [ ] Category tabs: All, Bookings, Account, and Promos.
- [ ] Read and unread badge state tracking.
- [ ] Deep-link navigation from notifications straight to corresponding `/jobs?id=...` records.
- [ ] Web Push service worker integration for background browser notifications.

---

### Phase 2: BrainWorker (Service Provider) Web Platform

#### 2.1 BrainWorker Onboarding & Identity Verification (`BW-001`)
- [ ] Dedicated BrainWorker signup entry point (`/brainworker/register`).
- [ ] Multi-step onboarding funnel: Trade category selection, experience level, coverage cities.
- [ ] Identity check interface: Secure capture of National Identity Number (NIN) / Bank Verification Number (BVN) and government ID upload.
- [ ] Trade certifications and apprentice proofs upload.
- [ ] Application pending / verification in review status screen.

#### 2.2 BrainWorker Dashboard & Operating Workspace
- [ ] BrainWorker authenticated home (`/brainworker/dashboard`).
- [ ] Active jobs metric cards: Today's jobs, pending quotes, total weekly earnings, client rating.
- [ ] Quick toggles: Online/available for instant dispatch vs Off-duty.
- [ ] Urgent local requests ticker.

#### 2.3 Job Requests & Leads Inbox
- [ ] Open requests feed: Filterable by trade, proximity, and urgency.
- [ ] Job lead detail inspection: Review customer problem description, photos, location area, and budget.
- [ ] Quote submission drawer: Worker provides itemized estimate or accepts posted customer rate.
- [ ] Direct invitation response surface: Real worker interface to click "Accept Booking" or "Decline Booking" with reason selection.

#### 2.4 Service Catalog & Availability Management (`BW-002`)
- [ ] Worker service catalog configuration: Add or remove individual services, set hourly rates and diagnostic call-out fees.
- [ ] Weekly working hours scheduler: Set working days, time slots (e.g., 8:00 AM to 5:00 PM), and emergency availability.
- [ ] Coverage area selector: Select specific neighbourhoods and maximum travel radius.

#### 2.5 BrainWorker Earnings, Wallet & Payouts
- [ ] Wallet summary: Available balance, pending escrow clearance, and lifetime earnings.
- [ ] Nigerian bank account setup form: Select bank (Access, GTBank, Zenith, etc.) and account number with account name verification preview.
- [ ] Withdrawal / payout request flow with confirmation history.
- [ ] Detailed transaction history with booking references and service fee deductions.

#### 2.6 BrainWorker Profile & Portfolio Management
- [ ] Profile editor: Headshot upload, bio, years in trade, spoken languages.
- [ ] Portfolio gallery manager: Before-and-after work photos with short captions.
- [ ] Client reviews tab: View customer feedback and submit worker counter-responses.

---

### Phase 3: Full Two-Sided Marketplace Lifecycle

#### 3.1 Collaborative Scheduling & Dispatch
- [ ] Mutually agreed booking arrival window display.
- [ ] Reschedule request flow with accept/counter-propose actions for both parties.
- [ ] Technician dispatch tracker: Status updates when worker departs and arrives at customer premises.

#### 3.2 On-Site Work & In-Progress Verification
- [ ] Worker check-in confirmation at customer location.
- [ ] Scope adjustment request: Worker submits additional parts or cost request if diagnostics reveal extra work.
- [ ] Customer approval step for on-site scope adjustments.
- [ ] Work completion submission: Worker uploads photo proof of completed task and requests customer confirmation.

#### 3.3 Post-Job Completion & Escrow Release
- [ ] Customer confirmation flow: "Confirm Satisfaction & Release Payout".
- [ ] Auto-release timer logic if customer does not respond within the dispute window.
- [ ] Mutual rating exchange: Both parties unlock ratings upon dual submission.

#### 3.4 Dispute Handling & Support Interface
- [ ] Formal dispute creation screen: Customer or worker specifies dispute category (poor workmanship, uncompleted task, damage, pricing disagreement).
- [ ] Evidence upload surface: Photos, receipts, chat transcript excerpt.
- [ ] Dispute status timeline: Under review by BukieBrainJobs team, mediation proposal, resolution reached.
- [ ] Customer help center: Knowledge base, FAQs, and ticket submission.

---

### Phase 4: Mobile Application (`apps/mobile`)

#### 4.1 Native Navigation & Shared Shell
- [ ] Expo Router configuration with bottom tabs: Home, Services, Jobs, Messages, Profile.
- [ ] Brand-aligned design token implementation in React Native StyleSheet.
- [ ] Safe area and status bar handling for iOS and Android.

#### 4.2 Customer Native Experiences
- [ ] Native public discovery: Homepage, category list, service detail screens.
- [ ] Native booking preparation and multi-step job posting forms.
- [ ] Native customer activity hub with segmented controls for All, Active, Upcoming, Past.
- [ ] Native booking lifecycle screens with full offline caching.

#### 4.3 BrainWorker Native Experiences
- [ ] Worker mobile workspace and lead push notifications.
- [ ] Immediate job invitation accept/decline action modals.
- [ ] On-site check-in with GPS location confirmation.

#### 4.4 Device Capabilities & Push Alerts
- [ ] Push notifications setup via Expo Notifications / FCM.
- [ ] Camera and photo gallery access for work proofs and attachments.
- [ ] Device biometric authentication (Face ID / Fingerprint) for quick wallet access.
- [ ] SQLite local database synchronization for offline browsing.

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
