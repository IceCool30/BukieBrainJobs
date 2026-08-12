# BukieBrainJobs

BukieBrainJobs is a Nigerian two-sided services marketplace connecting customers with trusted local professionals called BrainWorkers.

This repository is the engineering and documentation source of truth for the product. Product decisions, design rules, architecture, implementation guidance, and development workflow must be traceable to the documentation in this repository.

## Current repository status

**Phase:** Repository Foundation

**Code status:** No application code has been committed yet.

The repository is intentionally being established as a governed project foundation before application code is introduced.

## Source-of-truth hierarchy

When documents conflict, use this order unless a documented decision explicitly changes it:

1. `docs/00-governance/SOURCE-OF-TRUTH.md`
2. Approved product requirements and decisions
3. `DESIGN.md` for visual and interaction rules
4. Approved design-system artifacts
5. Approved feature and screen specifications
6. Technical architecture and implementation specifications
7. Google Antigravity implementation and design interpretation

Never silently resolve a material conflict by inventing a requirement.

## Toolchain and responsibilities

| Area | Authority / Tool | Responsibility |
|---|---|---|
| Product architecture | ChatGPT | Product decisions, specifications, UX, architecture, acceptance criteria |
| UI design & Engineering | Google Antigravity | UI design interpretation, frontend, backend, APIs, infrastructure, testing and deployment |
| Source control | GitHub | Versioned source, documentation, reviews and release history |

> [!NOTE]
> Google Stitch was previously used as an intermediate visual design tool. It is no longer a required part of the production workflow. Current UI design and implementation are performed directly by Google Antigravity using the approved project specifications and DESIGN.md.


Antigravity and any other coding agent must read the repository guidance before modifying code.

## Intended repository structure

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
│   ├── design-tokens/
│   ├── types/
│   ├── validation/
│   ├── database/
│   ├── auth/
│   ├── config/
│   └── utils/
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
├── infrastructure/
├── scripts/
├── DESIGN.md
├── CONTRIBUTING.md
├── SECURITY.md
└── README.md
```

This is the target organizational model. Directories should only become implementation-bearing when their requirements are approved and work begins.

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

The approved technical specification defines a pnpm workspace with Turborepo, TypeScript strict mode and Node 20 LTS. The intended application architecture includes a Next.js web application, an Expo mobile application and shared packages for contracts, validation, business logic and infrastructure concerns.

The implementation must follow the approved technical specification rather than recreating requirements from memory.

## Design baseline

`DESIGN.md` is the visual source of truth. The approved system uses Deep Navy as the primary brand and action system, Emerald as strategic emphasis, Hanken Grotesk for display and headings, and Inter for body and interface text.

Do not introduce arbitrary colors, typography, spacing, radii, motion or component behavior outside the approved system.

## Status

This repository currently contains the company and product foundation only. Application implementation will be introduced deliberately after the local working tree has been aligned with this repository structure and the relevant engineering specifications have been reviewed.

<!-- Sync deployment trigger -->
