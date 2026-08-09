# Contributing to BukieBrainJobs

## Purpose

BukieBrainJobs is being built as a long-lived product, not as an unstructured prototype. Every contribution must preserve product intent, design consistency, maintainability, security and traceability.

## Before you start

Read:

1. `README.md`
2. `AGENTS.md`
3. `docs/00-governance/SOURCE-OF-TRUTH.md`
4. `docs/00-governance/DEVELOPMENT-WORKFLOW.md`
5. The specification and decision documents relevant to your task

## Branching

Use short-lived branches with clear names:

```text
feature/<area>-<short-name>
fix/<area>-<short-name>
refactor/<area>-<short-name>
docs/<area>-<short-name>
chore/<area>-<short-name>
```

Do not work directly on `main` for application changes.

## Commit messages

Use clear conventional-style messages:

```text
feat: add customer service search
fix: handle expired booking state
refactor: extract shared booking validation
docs: update payment architecture
chore: update dependency metadata
test: cover booking transition rules
```

A commit should represent one coherent change.

## Pull requests

Every PR should explain:

- Problem being solved
- Intended behavior
- Relevant specification IDs
- Main files changed
- Tests performed
- Accessibility impact
- Security impact
- Performance impact
- Documentation impact
- Known limitations

Do not merge a feature that contradicts an approved specification without an approved decision update.

## Product and design gate

Application code should not be created solely from a visual screenshot or an informal prompt. The relevant feature must have enough product, UX, UI and technical definition to remove major implementation ambiguity.

The approved workflow is:

```text
Product specification
    -> UX specification
    -> Stitch design
    -> Design review
    -> Engineering specification
    -> Implementation
    -> QA
```

## Design rules

`DESIGN.md` is authoritative for the visual system.

Use shared semantic tokens and reusable components. Do not introduce local color, typography or spacing systems to solve a one-off screen.

## Engineering rules

- TypeScript strict mode.
- Avoid `any`.
- Validate external input at system boundaries.
- Keep shared contracts in shared packages.
- Keep business logic testable and independent from UI concerns.
- Use transactions for multi-step financial or state-critical operations where required.
- Verify third-party webhooks cryptographically.
- Apply authorization at the server boundary.
- Log useful operational information without exposing secrets or sensitive personal data.

## Testing

Changed behavior should have appropriate tests. Critical marketplace flows must have integration or end-to-end coverage before production release.

The approved testing strategy includes unit, integration, API, web E2E, mobile E2E and real-time/socket testing where applicable.

## Documentation changes

If a change affects product behavior, architecture, design rules, APIs, database models, security, deployment or developer workflow, update the relevant documentation in the same change set.

## No secrets

Never commit:

- `.env` files containing secrets
- API keys
- private certificates
- payment credentials
- identity-provider credentials
- database credentials
- production tokens
- service-account JSON keys

Use approved secret-management mechanisms instead.
