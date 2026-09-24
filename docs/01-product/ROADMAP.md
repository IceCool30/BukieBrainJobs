# BukieBrainJobs Roadmap

**Document ID:** PROD-002  
**Version:** 2.0  
**Status:** Active Product Baseline  
**Last Updated:** 2026-09-21  
**Master Checklist:** See [docs/master-checklist.md](../master-checklist.md) for the complete, sequential engineering execution order.

---

## Strategic Sequencing Overview

Work in this repository is executed sequentially to maintain platform coherence:

1. **Phase 1: Customer Web Platform Completion** (Profile, Payments UX, Reviews, Messaging, Notifications)
2. **Phase 2: BrainWorker Web Platform** (Onboarding, Verification, Lead Feed, Availability, Earnings)
3. **Phase 3: Two-Sided Marketplace Lifecycle** (Real-time worker response, Scheduling, Check-in, Disputes)
4. **Phase 4: Mobile Application** (`apps/mobile` native Expo reconstruction)
5. **Phase 5: Backend & Database Integration** (PostgreSQL, Prisma persistence, Paystack/Flutterwave, Webhooks)
6. **Phase 6: Production Hardening & Quality Assurance** (E2E tests, Accessibility sign-off, Security audits, Core Web Vitals)
7. **Phase 7: Launch Readiness** (App Store / Play Store releases, Operations readiness)

---

## Milestone Status Summary

### Milestone 1: Foundation
**Status: Complete & Verified**
- Monorepo structure established (Turborepo, pnpm workspaces, 7 shared packages).
- Design system tokens, color system (Deep Navy and Emerald), and responsive typography.
- Production-first mock data contracts (`ARCH-002`) and domain state machines.
- Mr. Solomon 9-Command Engineering Loop operating system integration.

### Milestone 2: Public Website
**Status: Complete & Verified (Live in Production)**
- `WEB-001`: Public Customer Homepage with category exploration and trust markers.
- `WEB-004`: Service Category Detail pages (`/services/[serviceId]`).
- `WEB-005`: Public BrainWorker Profile pages (`/brainworkers/[brainworkerId]`).
- `WEB-006`: Services Discovery Catalog with live search and city filtering (`/services`).
- Trust and safety pages: BukieGuarantee (`/guarantee`).
- Business signal: `/enterprise` route kept intentionally as a Coming Soon signal until consumer marketplace launch.

### Milestone 3: Authentication
**Status: Complete & Verified (Live in Production)**
- `WEB-008`: Nigerian phone number OTP formatting and validation (`080...` format).
- Email and password login and registration (`/login`, `/register`).
- Social mock provider authentication with explicit error handling.
- Account verification and password recovery flows (`/verify`, `/forgot-password`, `/reset-password`).
- Role-aware session routing and unauthenticated boundary protection.

### Milestone 4: Customer Platform
**Status: Complete (100% Phase 1 Customer Web Platform Live in Production)**
- `WEB-007`: Public Booking Preparation form (`/book`).
- `WEB-009`: Multi-step Customer Job Posting with review summary (`/post-job`).
- `WEB-010`: Authenticated Customer Dashboard with metric cards (`/dashboard`).
- `WEB-011`: Customer Jobs & Bookings Activity Hub with master-detail layout, deep linking, and deterministic states (`/jobs`).
- `WEB-012`: Ranked candidate recommendations and match explanations (`/job/[referenceCode]/matches`).
- **Completed Customer Experience Slices (Live in Production)**:
  - `WEB-014`: Customer Profile and Saved Locations (`/profile`)
  - `WEB-015`: Customer Payments and Escrow checkout UX (`/receipt/[bookingId]`)
  - `WEB-016`: Customer Reviews and Ratings flow (`/brainworkers/[id]`)
  - `WEB-017`: In-App Messaging & Real-Time Chat (`/messages`, `/messages/[jobId]`)
  - `WEB-018`: In-App Notification Center (`/notifications`)

### Milestone 5: BrainWorker Platform
**Status: In Progress (Phase 2 Active - Milestone Slice 1 Complete)**
- `BW-001`: BrainWorker Onboarding, NIN/BVN identity check, and trade credential verification (`/brainworker/register`, `/brainworker/onboarding`, `/brainworker/verification-status`, `/brainworker/dashboard`). **(Complete & Verified Live in Production)**
- `BW-002`: Service Catalog and Working Hours Availability scheduler.
- BrainWorker Operating Dashboard (`/brainworker/dashboard`).
- Local Job Requests & Leads Inbox with direct quote/accept/decline actions.
- Earnings, Wallet, and Nigerian bank payout setup.
- Worker Profile and portfolio before/after photo gallery.

### Milestone 6: Booking Lifecycle & Payments
**Status: Partially Complete (Customer Lifecycle Live; Two-Sided Completion Planned)**
- `WEB-013`: Customer lifecycle state machine complete (awaiting response, confirmed, declined, expired, cancelled).
- **Remaining Scope in Phase 3**:
  - Worker-side invitation accept and decline actions.
  - Mutual arrival window scheduling and technician dispatch tracking.
  - On-site check-in and on-site scope adjustments.
  - Work completion photo proof and customer confirmation release.
  - Dispute resolution workflow, evidence upload, and customer support center.
  - Real escrow payment hold and release mechanisms.

### Milestone 7: Corporate Portal
**Status: Deferred (Post-Launch)**
- Enterprise business solutions remain post-launch scope.
- `/enterprise` remains a Coming Soon signal until consumer marketplace operations are mature.

### Milestone 8: Admin & Operational Console
**Status: Planned (Phase 6/7)**
- Platform operations console: Worker verification review, dispute mediation, category management, and platform analytics.

### Milestone 9: AI Capabilities
**Status: Future Evaluation**
- Future capabilities will be evaluated against product value, operational safety, and privacy boundaries.

### Milestone 10: Production Hardening
**Status: Planned (Phase 6)**
- End-to-end regression suites across all customer and worker journeys.
- Full accessibility review: Screen reader audit, keyboard focus, contrast compliance.
- Security audit: Tenant isolation, rate limiting, and sensitive data protections.
- Core Web Vitals profiling, route optimization, and Sentry observability.

### Milestone 11: Launch
**Status: Planned (Phase 7)**
- Production smoke tests and primary domain cutover.
- App Store and Google Play Store package release.
- Customer support runbooks and operational monitoring.
