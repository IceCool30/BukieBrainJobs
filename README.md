# BukieBrainJobs

BukieBrainJobs is a Nigerian two-sided services marketplace connecting customers with trusted local professionals called BrainWorkers.

This repository is the engineering and documentation source of truth for the product. Product decisions, design rules, architecture, implementation guidance, and development workflow must be traceable to the documentation in this repository.

## Current repository status

**Phase:** Active development

**Code status:** Monorepo scaffold is in place.

- `apps/web` — Next.js web application
- `apps/mobile` — Expo mobile application
- `packages/` — shared contracts, UI, validation, database, utilities
- `services/socket-server` — real-time messaging service

Feature work proceeds on short-lived branches. The public homepage redesign is the current focus area.

## Source-of-truth hierarchy

When documents conflict, use this order unless a documented decision explicitly changes it:

1. `docs/00-governance/SOURCE-OF-TRUTH.md`
2. Approved product requirements and decisions
3. `DESIGN.md` for visual and interaction rules
4. Approved design-system artifacts
5. Approved feature and screen specifications
6. Technical architecture and implementation specifications
7. Implementation that follows the approved specifications

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

The approved technical baseline uses a pnpm workspace with Turborepo, TypeScript strict mode, and Node 24+. The application architecture includes a Next.js web application, an Expo mobile application, and shared packages for contracts, validation, business logic and infrastructure concerns.

Implementation must follow the approved technical specification rather than recreating requirements from memory.

## Design baseline

`DESIGN.md` is the visual source of truth. The approved system uses Deep Navy as the primary brand and action system, Emerald as strategic emphasis, Hanken Grotesk for display and headings, and Inter for body and interface text.

Do not introduce arbitrary colors, typography, spacing, radii, motion or component behavior outside the approved system.

## Status

The product foundation, design system, and monorepo scaffold are in place. Feature implementation proceeds through approved specifications, short-lived branches, review, and merge to main.
