# Architecture & Build Specifications

This directory holds the build specifications for the BukieBrainJobs platform, governed by the `/architect` [DECIDE] and `/develop` [BUILD] phases of the Mr. Solomon 9-Command Engineering Loop.

## Purpose & Authority

Under the NINE loop, no feature or architectural change may be implemented in `/develop` without an explicit, approved build specification in `docs/specs/`. If `/develop` discovers an undefined decision or edge case during implementation, it must halt and hand control back to `/architect`.

Detailed product UX briefs continue to be archived under `docs/04-public-website/` and architecture ADRs under `docs/03-architecture/`. This directory serves as the direct, actionable build specification index for engineering implementation.

## Specification Index

| Spec ID | Feature Name | Status | Primary Doc Reference |
|---|---|---|---|
| `00-engineering-loop` | 9-Command Engineering Loop Integration | Accepted & Operational | `AGENTS.md` |
| `FOUND-001` | Foundation & Stack Upgrade | Accepted & Operational | `docs/00-governance/TECHNICAL-BASELINE.md` |
| `ARCH-002` | Production-First Contract Alignment | Accepted & Operational | `docs/03-architecture/ARCH-002-CONTRACT-DECISIONS.md` |
| `WEB-001` | Public Customer Homepage | Live in Production | `docs/04-public-website/WEB-001-HOMEPAGE.md` |
| `WEB-004` | Service Category Detail | Live in Production | `docs/04-public-website/WEB-004-SERVICE-DETAIL.md` |
| `WEB-005` | Public BrainWorker Profile | Live in Production | `docs/04-public-website/WEB-005-PUBLIC-BRAINWORKER-PROFILE.md` |
| `WEB-006` | Services Discovery Catalog | Live in Production | `docs/04-public-website/WEB-006-SERVICES-DISCOVERY.md` |
| `WEB-007` | Public Booking Preparation | Live in Production | `docs/04-public-website/WEB-007-PUBLIC-BOOKING-PREPARATION.md` |
| `WEB-008` | Customer Authentication & Verification | Live in Production | `docs/04-public-website/WEB-008A-AUTHENTICATION-DESIGN-BRIEF.md` |
| `WEB-009` | Customer Job Posting | Live in Production | `docs/04-public-website/WEB-009A-CUSTOMER-JOB-POSTING-DESIGN-BRIEF.md` |
| `WEB-010` | Customer Dashboard | Live in Production | `docs/04-public-website/WEB-010A-CUSTOMER-DASHBOARD-DESIGN-BRIEF.md` |
| `WEB-011` | Customer Jobs & Bookings Activity Hub | Live in Production | `docs/specs/WEB-011-customer-jobs-and-bookings.md` |
| `WEB-012` | Customer Job Matching & Match Results | Live in Production | `docs/04-public-website/WEB-012-CUSTOMER-JOB-MATCHING-PRODUCT-UX-SPECIFICATION.md` |
| `WEB-013` | Customer Booking Acceptance & Lifecycle | Live in Production | `docs/specs/WEB-013-customer-booking-lifecycle.md` |
| `WEB-014` | Customer Profile & Account Settings | Live in Production | `docs/specs/WEB-014-customer-profile-settings.md` |
| `WEB-015` | Customer Payments & Escrow UX | Live in Production | `docs/specs/WEB-015-customer-payments-escrow.md` |
| `WEB-016` | Customer Reviews & Reputation | Live in Production | `docs/specs/WEB-016-customer-reviews-reputation.md` |
| `WEB-017` | In-App Messaging & Real-Time Chat | Live in Production | `docs/specs/WEB-017-messaging-chat.md` |
| `WEB-018` | Notification Center & Push UX | Live in Production | `docs/specs/WEB-018-notification-center.md` |
| `BW-001` | BrainWorker Onboarding & Identity Verification | Live in Production | `docs/specs/BW-001-onboarding.md` |
| `BW-002` | BrainWorker Service Catalog & Availability | Candidate Next Scope | `docs/specs/BW-002-service-catalog-availability.md` |

