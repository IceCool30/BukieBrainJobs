# BukieBrainJobs

BukieBrainJobs is a Nigerian two-sided services marketplace connecting customers with skilled local and remote providers called BrainWorkers.

This repository is the engineering and documentation source of truth for the product. Product decisions, design rules, architecture, implementation guidance, and development workflow are traceable to the documentation here.

## Current repository status

**Phase:** Active development, live public homepage

**Code status:** A public homepage is live and approved on the `feature/web-001-homepage-redesign` branch. The monorepo scaffold, design system, and product foundation are complete.

- `apps/web` — Next.js 15 web application with the live public homepage and PWA support
- `apps/mobile` — Expo mobile application
- `packages/` — shared contracts, UI, validation, database, store, API types, utilities
- `services/socket-server` — real-time messaging service
- `docs/` — governance, product, design system, and feature specifications

The public homepage is the current focus area. New pages must follow the live-first experience standard described below.

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

The approved technical baseline uses a pnpm workspace with Turborepo, TypeScript strict mode, and Node 24+. The application architecture includes a Next.js 15 web application, an Expo mobile application, and shared packages for contracts, validation, business logic and infrastructure concerns.

Implementation must follow the approved technical specification rather than recreating requirements from memory.

## Design baseline

`DESIGN.md` is the visual source of truth. The approved system uses Deep Navy as the primary brand and action system, Emerald as strategic emphasis, Hanken Grotesk for display and headings, and Inter for body and interface text.

Do not introduce arbitrary colors, typography, spacing, radii, motion or component behavior outside the approved system.

## Status

The product foundation, design system, live-first experience standard, and monorepo scaffold are in place. The public homepage is live, approved, and continuously deployed through Vercel previews on the feature branch. Feature implementation proceeds through approved specifications, short-lived branches, review, and merge to main.
