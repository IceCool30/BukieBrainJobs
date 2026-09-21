# BukieBrainJobs

BukieBrainJobs is a Nigerian two-sided services marketplace connecting customers with skilled local and remote providers called BrainWorkers.

This repository is the engineering and documentation source of truth for the product. Product decisions, design rules, architecture, implementation guidance, and development workflow are traceable to the documentation here.

## Platform policy: full product on every surface

BukieBrainJobs is one product delivered on three equal surfaces. Users choose how they access it. No surface is intentionally feature-limited.

| Surface | Codebase | How users open it |
|---|---|---|
| Website (desktop browser) | `apps/web` | URL in a desktop browser |
| Mobile web shell / PWA | `apps/web` | Phone browser, or home-screen install |
| Native Android and iOS | `apps/mobile` (Expo) | App Store / Google Play |

**Policy rules**

1. Every core customer and BrainWorker journey must be available on website, PWA, and native.
2. Desktop website is a first-class full product, not a reduced mobile site.
3. Mobile browser and installed PWA share the compact mobile shell on the homepage. Desktop width keeps the full marketing homepage.
4. PWA install remains a full product path for people who do not want store apps.
5. Native is a full product path for people who prefer store apps, with stronger OS tools where useful (push, camera, biometrics).
6. Platform enhancements may improve delivery of the same feature. They must not remove the feature from other surfaces.
7. The homepage does not use a bottom navigation bar (live experience standard).

Shared business rules, trust model, booking model, and design system stay one source of truth across all surfaces.

## Current repository status

**Phase:** Phase 1 Customer Web Platform Completion (Active)

**Code status:** The core Customer Web Platform is live in production on main at `https://bukie-brain-jobs.vercel.app`. The public website, authentication, customer dashboard, job posting, matching results, and activity hub with booking lifecycle are verified and deployed.

- `apps/web`: Next.js 15 web application with live customer marketplace and PWA support
- `apps/mobile`: Expo mobile application (Phase 4 native reconstruction target)
- `packages/`: Shared contracts, UI design system, validation schemas, database client, store, API types, and utilities
- `services/socket-server`: Real-time messaging service
- `docs/`: Governance, product roadmap, design system, master checklist, and build specifications

The current execution target is Phase 1 (Customer Web Platform Completion), beginning with `WEB-014: Customer Profile & Account Settings`. Track progress in [docs/master-checklist.md](docs/master-checklist.md) and [docs/scope.md](docs/scope.md).

## Live-first experience standard

The approved live homepage experience is the primary design authority for all future pages and screens. Before starting any customer-facing work, read `docs/02-design-system/LIVE-EXPERIENCE-STANDARD.md` and the bundled skill at `docs/02-design-system/skills/bukiebrainjobs-experience-standards/`.

The live homepage establishes the product's visual identity:

- Calm, photo-led, premium design with navy, green, mint, and off-white used with restraint
- Hanken Grotesk for display text, Inter for body text
- Image-led service cards, a two-tier search in the hero, and a compact three-brand trust strip
- **BrainWorker** is the official customer-facing identity for service providers; the onboarding call to action is "Become a BrainWorker"
- Supported trust brands on the homepage are Paystack, Flutterwave, and Dojah
- No unsupported absolute claims, exact counts, ratings, or guarantees appear in customer-facing copy
- Motion explains interaction and never competes with service discovery or booking actions
- Homepage has no bottom navigation bar

## Source-of-truth hierarchy

When documents conflict, use this order unless a documented decision explicitly changes it:

1. `docs/00-governance/SOURCE-OF-TRUTH.md`
2. The approved live experience standard and skill
3. Approved product requirements and decisions
4. `DESIGN.md` for visual and interaction rules
5. Approved design-system artifacts
6. Approved feature and screen specifications
7. Technical architecture and implementation specifications
8. Implementation that follows the approved specifications

Never silently resolve a material conflict by inventing a requirement.

## Responsibilities

| Area | Responsibility |
|---|---|
| Product and specifications | Product decisions, feature specifications, UX, architecture, acceptance criteria |
| Design and engineering | UI interpretation from DESIGN.md, frontend, backend, APIs, infrastructure, testing and deployment |
| Source control | Versioned source, documentation, reviews and release history on GitHub |

All contributors must read the repository guidance before modifying code.

## Repository structure

```text
BukieBrainJobs/
├── .github/
│   ├── workflows/
│   ├── ISSUE_TEMPLATE/
│   └── CODEOWNERS
│
├── apps/
│   ├── web/
│   └── mobile/
│
├── packages/
│   ├── ui/
│   ├── types/
│   ├── validation/
│   ├── db/
│   ├── store/
│   ├── api-types/
│   └── utils/
│
├── services/
│   └── socket-server/
│
├── docs/
│   ├── 00-governance/
│   ├── 01-product/
│   ├── 02-design-system/
│   ├── 03-information-architecture/
│   ├── 04-public-website/
│   ├── 05-authentication/
│   ├── 06-customer-platform/
│   ├── 07-brainworker-platform/
│   ├── 08-booking/
│   ├── 09-payments-wallet/
│   ├── 10-messaging-notifications/
│   ├── 11-corporate/
│   ├── 12-admin/
│   ├── 13-api/
│   ├── 14-database/
│   ├── 15-analytics/
│   ├── 16-security-compliance/
│   ├── 17-accessibility/
│   ├── 18-qa-testing/
│   ├── 19-deployment-operations/
│   ├── 20-prompts/
│   └── 21-decision-log/
│
├── DESIGN.md
├── CONTRIBUTING.md
├── SECURITY.md
└── README.md
```

Directories become implementation-bearing when their requirements are approved and work begins.

## Engineering principles

- TypeScript strict mode.
- Define shared contracts once and reuse them across applications.
- Keep business logic out of platform-specific UI code.
- Prefer simple, modular architecture over premature distributed systems.
- Treat security, accessibility and observability as first-class requirements.
- Do not commit secrets.
- Do not introduce dependencies without a reason and ownership.
- Do not create one-off UI patterns when an approved shared component can be reused.
- Do not implement an unapproved product requirement.

## Development gate

A feature is not implementation-ready until the repository contains, or explicitly references, its approved:

- Product specification
- UX specification
- UI or screen specification
- Technical specification
- API and data requirements
- Acceptance criteria
- Edge cases and failure states
- Accessibility requirements
- Security requirements
- QA checklist

See `CONTRIBUTING.md` and `docs/00-governance/DEVELOPMENT-WORKFLOW.md`.

## Architecture baseline

The approved technical baseline uses a pnpm workspace with Turborepo, TypeScript strict mode, and Node 24+. The application architecture includes a Next.js 15 web application (website and PWA), an Expo native mobile application, and shared packages for contracts, validation, business logic and infrastructure concerns.

Implementation must follow the approved technical specification rather than recreating requirements from memory.

## Design baseline

`DESIGN.md` is the visual source of truth. The approved system uses Deep Navy as the primary brand and action system, Emerald as strategic emphasis, Hanken Grotesk for display and headings, and Inter for body and interface text.

Do not introduce arbitrary colors, typography, spacing, radii, motion or component behavior outside the approved system.

## Status

The product foundation, design system, live-first experience standard, and core customer web workflows are complete and verified in production. Development proceeds sequentially through the approved 7-phase roadmap, governed by the Mr. Solomon 9-Command Engineering Loop. Track implementation on [docs/master-checklist.md](docs/master-checklist.md).
