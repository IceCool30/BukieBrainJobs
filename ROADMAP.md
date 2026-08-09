# Project Roadmap for BukieBrainJobs

## North Star (6-12 Months)
"Need something done at home today? Book a verified Tasker in minutes, pay in-app, chat in-app, rate after."
Initial rollout will cover Lagos, expanding subsequently to Abuja and Port Harcourt. The launch focuses on five high-demand service categories.

---

## Phase 0: Foundations (1-2 weeks)
- Standardize terminology: **Client** (person needing help) and **Tasker** (verified professional).
- Redefine the core transaction unit to booking a Tasker for a specific service category and calendar time slot.
- Pricing mechanics: Taskers set hourly rates or flat-rate packages; the platform applies a 12-18% service fee on the client side.
- Secure escrow: Implement a Paystack pre-authorization hold that automatically releases upon job completion.
- MVP categories: Furniture Assembly, Moving/Heavy Lifting, Cleaning, Handyman/Minor Repairs, Mounting.

---

## Phase 1: MVP & Hybridization (6-10 weeks / Months 0-3)
**Objective:** Deliver a complete, functional booking loop in Lagos using mock data.

| Week | Milestones |
|------|------------|
| 1-2 | Scaffold monorepo, configure Turborepo workspaces, and set up shared packages (`@bukiebrainjobs/ui`, `@bukiebrainjobs/types`, `@bukiebrainjobs/store`). |
| 3-4 | Implement core screens: Service discovery, Tasker profile, Booking form, Checkout flow, and Chat sandbox. Populate `packages/store` with mock data. |
| 5   | Integrate the **BukiePassport** UI (camera capture, selfie preview) with a simulated verification flow. |
| 6   | Introduce a **dual payment state machine**: instant release for tasks under ₦50k, and milestone escrow for larger projects. |
| 7   | Build the **Tasker Management Interface** (onboarding, rate configuration, service-area mapping, and availability toggles). |
| 8   | Deploy a **basic matching engine** based on proximity, same-day availability boosts, and 30-day performance scores. |
| 9   | Create an **Admin Console** to verify Taskers, inspect bookings, process refunds/disputes, and force escrow releases. |
| 10  | Integrate a **chat filter** to mask off-platform contact terms until escrow is confirmed. |
| 11  | Conduct end-to-end UI testing, visual QA against **DESIGN.md**, and an accessibility audit. |
| 12  | Demo the product to stakeholders, collect feedback, and iterate on the UI. |

### Deliverables
- A functional web app (`apps/web`) and mobile app (`apps/mobile`).
- Consistent application of shared design tokens.
- An optional Storybook showcasing UI components.

### Immediate Engineering Build Order (Phase 1 MVP)
1. Schema definition (categories, tasker_profiles, tasker_categories, bookings).
2. Tasker onboarding UI (category selection, hourly rates, LGA service-area selector).
3. Client browsing engine (category filters, proximity-based discovery lists).
4. Booking mechanics (creation and Paystack pre-authorization holds).
5. Task lifecycle flow (accept/decline and real-time status updates).
6. Chat wiring (booking-specific chat channels).
7. Completion toggle leading to automatic escrow release and a reviewer UI.
8. Ranking baseline (incorporating availability and performance boosters).

---

## Phase 2: Trust & Liquidity (Next 8-12 weeks / Months 3-6)

### 2A: Core Backend Foundations
- Establish a **Node.js and Express** API gateway built with type-safe TypeScript and OpenAPI contracts.
- Implement **PostgreSQL 16** with a **Prisma** schema covering users, taskers, bookings, payments, and escrow.
- Integrate **Clerk** for authentication, using client-side wrappers.
- Transition from mock data to real API calls for services and Tasker listings.

### 2B: Trust & Liquidity Enhancements
- **BukiePassport upgrade:** Deploy a multi-tier pipeline via Smile ID or Dojah, handling NIN/BVN validation, liveness checks, and address audits through QoreID.
- **BukieGuarantee fund:** Offer up to ₦500k in property-damage indemnity for transactions completed on-platform.
- **B2C Growth & Partnerships:** Partner with local furniture stores, appliance retailers, and property managers to embed booking widgets at checkout.
- Expand operations to **Abuja** and **Port Harcourt** with targeted marketing campaigns.

---

## Phase 3: Scale & Differentiation (Months 6-12+)
- **Dynamic Revenue Systems:** Introduce surge pricing for peak windows and offer algorithmic pricing guidance to Taskers.
- **Monetization Expansion:** Support featured and promoted listings, B2B corporate facilities contracts, and "BukiePro" subscription tiers.
- **Advanced Features:** Launch native mobile applications, a push-notification engine via FCM/Expo, automated in-app time tracking, and AI-driven matching algorithms.
- **Regional Horizon:** Evaluate compliance requirements and draft a launch roadmap for **Ghana** and **Kenya**.

---

## Phase 4: Public Launch & Operational Scaling

| Week | Milestones |
|------|------------|
| 25-26 | Deploy the web application to **Vercel** (production) and mobile apps to the **App Store** and **Google Play**. |
| 27-28 | Enable **Socket.io** chat functionality and FCM/Expo push notifications. |
| 29   | Configure **Sentry** for error tracking and **Datadog** for performance dashboards. |
| 30   | Apply comprehensive SEO best practices, including title tags, meta descriptions, and structured data. |
| 31-32 | Expand the service footprint to additional Nigerian cities and onboard new artisan categories. |
| 33   | Maintain ongoing A/B testing, LCP optimization, and overall performance tuning. |

---

## Ongoing Maintenance & Growth
- Run two-week sprint cycles to deliver continuous improvements like rating systems, loyalty programs, and administrative features.
- Conduct quarterly performance reviews focusing on cost analysis, database scaling, and CDN cache optimization.
- Foster community engagement through partnerships with local trade unions and localized UX research.

---

**References**
- [AGENTS.md](AGENTS.md): Development policies and command shortcuts.
- [DESIGN.md](DESIGN.md): Visual language and component guidelines.
- [README.md](README.md): Repository onboarding and overview.
- [TECHNICAL_SPEC.md](TECHNICAL_SPEC.md): Full-Stack Technical Specification with architecture, API contracts, Prisma schema, and implementation details.

*This roadmap is a living document and will evolve as milestones are achieved.*
