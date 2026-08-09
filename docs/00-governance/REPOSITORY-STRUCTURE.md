# Repository Structure

**Document ID:** GOV-002
**Version:** 1.0
**Status:** Approved foundation

## Objective

Keep BukieBrainJobs understandable to a human developer, Google Antigravity, future agents and external collaborators.

## Target structure

```text
BukieBrainJobs/
├── .github/
│   ├── workflows/
│   ├── ISSUE_TEMPLATE/
│   └── CODEOWNERS
├── apps/
│   ├── web/
│   └── mobile/
├── packages/
│   ├── ui/
│   ├── design-tokens/
│   ├── types/
│   ├── validation/
│   ├── database/
│   ├── auth/
│   ├── config/
│   └── utils/
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
├── infrastructure/
├── scripts/
├── DESIGN.md
├── AGENTS.md
├── CONTRIBUTING.md
├── SECURITY.md
└── README.md
```

## Architectural boundary

`apps/` contains deployable applications.

`packages/` contains reusable contracts, domain logic, UI primitives, validation and infrastructure abstractions that must be shared across applications where applicable.

`docs/` contains durable product and engineering knowledge.

`infrastructure/` contains deployment and operational configuration once those requirements are approved.

`scripts/` contains repeatable repository tooling, not business logic.

## Rules

- Do not create a new top-level directory for a single feature without an architectural reason.
- Do not place shared business logic inside one application when another app needs the same rule.
- Do not put product specifications inside source-code directories.
- Do not create duplicate copies of design tokens.
- Do not introduce microservices merely because a domain exists. The approved architecture starts simple and evolves when scale requires it.

## Implementation baseline

The technical specification defines pnpm workspaces, Turborepo, TypeScript strict mode and Node 20 LTS. The repository structure must remain consistent with that specification when application code is introduced.
