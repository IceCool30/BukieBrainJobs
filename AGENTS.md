# BukieBrainJobs Development Standards & Context Map

This file defines the standards and operational map every contributor must follow when working in this repository.

## Repository Overview
- **Project Name**: BukieBrainJobs
- **Architecture**: Monorepo managed with Turborepo and pnpm workspaces
- **Primary Languages and Runtimes**: TypeScript 5.7, Node.js 24 LTS, Next.js 15.5, React 19, React Native / Expo SDK 52, Tailwind CSS v4, Prisma v6, Zustand v5, Vitest v4
- **Workspaces Layout**:
  - `apps/web`: Next.js 15 App Router web application and PWA
  - `apps/mobile`: Expo / React Native mobile application
  - `packages/types`: Shared domain types and TypeScript contracts
  - `packages/validation`: Shared Zod validation schemas
  - `packages/ui`: Shared design tokens, UI primitives, and components
  - `packages/db`: Prisma database client, schema, and migrations
  - `packages/store`: Zustand client state management
  - `packages/utils`: Shared utilities and formatting helpers
  - `packages/api-types`: Shared network API contracts
  - `services/socket-server`: Real-time socket service

## Core Commands
- **Install**: `pnpm install`
- **Dev (Web)**: `pnpm web:dev`
- **Dev (Mobile)**: `pnpm mobile:start`
- **Build**: `pnpm build` (execute on cloud Codespace)
- **Typecheck**: `pnpm type-check` (execute on cloud Codespace)
- **Lint**: `pnpm lint` (execute on cloud Codespace)
- **Test**: `pnpm test` (execute on cloud Codespace)
- **Database Generate**: `pnpm db:generate` (execute on cloud Codespace)
- **Loop Status**: `bash scripts/nine-status.sh` or `pnpm run loop:status`

## Environment & Execution Constraints
- **Local Environment**: Termux on Android. Strict physical RAM limits and aggressive Android Low Memory Killer (LMK).
- **Remote Environment**: Cloud Codespace `effective-fishstick-x5qwp6wrrp64fxwx` (4 cores, 16 GB RAM, Ubuntu 22.04 LTS).
- **Execution Pipeline**:
  - Never run heavy commands locally on Termux (`pnpm test`, `turbo run test`, `pnpm build`).
  - Always dispatch builds, full test suites, and database migrations to the cloud Codespace over SSH:
    `gh codespace ssh -c effective-fishstick-x5qwp6wrrp64fxwx -- "cd /workspaces/BukieBrainJobs && <COMMAND>"`
  - Synchronization Pipeline:
    1. Commit and push from Termux (`git push origin <branch>`).
    2. Sync the Codespace (`gh codespace ssh -c effective-fishstick-x5qwp6wrrp64fxwx -- "cd /workspaces/BukieBrainJobs && git checkout <branch> && git pull origin <branch>"`).
    3. Run verification commands on the Codespace.
- **Safety Protocols**: Never delete, move, or reorganize files or directories without explicit user confirmation.

## Conventions & Standards
- **Voice**: Mr. Solomon Natural Voice across all copy, commits, PRs, and documentation. Never use em dashes.
- **Visual**: Design tokens extracted directly from code and `globals.css` `@theme`; no arbitrary hex values. Deep Navy is primary, Emerald is strategic emphasis/success.
- **Quality**: Anti-generic guardrails strictly enforced (zero slop: no generic icons, taglines, captions, explainers, subheadlines, fake cheerleading, or unsupported absolute claims).
- **Data Integrity**: Production-first architecture with deterministic mock data. Never fabricate rates, coordinates, ratings, verification results, or booking confirmations.

## Engineering Loop State (The 9 Commands)
- **Active Phase**: Baseline Realignment (`/sync` [REALIGN])
- **Loop State Files**:
  - Scope: `docs/scope.md`
  - Context Map: `AGENTS.md`
  - Specifications: `docs/specs/`
  - Verification Log: `docs/check-log.md`
  - Changelog: `CHANGELOG.md`

## Mandatory Skills: Load and Apply on Every Task

These five skills are required for all work in this repository without exception. Load each one at the start of every session and apply it whenever the task falls within its domain. Do not skip, defer, or partially apply these skills.

| Skill | Path | Apply when |
|---|---|---|
| `mr-solomon-nine-command-engineering-loop` | `.agents/skills/mr-solomon-nine-command-engineering-loop/SKILL.md` | Any task lifecycle, planning, architecture spec, development loop, verification, documentation, or debugging phase. |
| `bukiebrainjobs-experience-standards` | `.agents/skills/bukiebrainjobs-experience-standards/SKILL.md` | Any customer-facing UI, copy, motion, responsive layout, component, accessibility, or interaction work. |
| `ui-ux-pro-max` | `.agents/skills/ui-ux-pro-max/SKILL.md` | Any visual design decision, page structure, component quality review, typography, color, animation, or UX pattern. |
| `agent-skills-test-driven-development` | `.agents/skills/agent-skills-test-driven-development/SKILL.md` | Any logic change, bug fix, behavior modification, or new feature implementation. |
| `mr-solomon-natural-voice` | `.agents/skills/mr-solomon-natural-voice/SKILL.md` | Any message, copy, reply, argument, or communication written on behalf of the user or in the user's voice. |

All five skills must be read before work begins on any substantive task. If a task spans multiple domains, apply all relevant skills together.

## Before changing anything

1. Read `README.md`.
2. Read `CONTRIBUTING.md`.
3. Read `docs/00-governance/SOURCE-OF-TRUTH.md`.
4. Read `docs/00-governance/LEGACY-SOURCE-BOUNDARY.md`.
5. Read `docs/02-design-system/DESIGN-CANONICALIZATION.md` when the task touches visual design.
6. Read `docs/02-design-system/LIVE-EXPERIENCE-STANDARD.md` and its bundled skill before any customer-facing design, copy, motion, or interface implementation.
7. Select and read any specialist skill that matches the task, including testing and browser-runtime verification where the change needs it.
8. Read the relevant product, design and technical specifications for the task.
9. Inspect the existing repository before creating files or changing architecture.
10. Check the decision log for related decisions.

## Authority

Do not invent requirements when an approved project document already defines them.

The approved live BukieBrainJobs experience governs the practical baseline for all customer-facing product work, including public pages, marketplace flows, booking, profiles, onboarding, customer and BrainWorker areas, PWA views, native-app screens, visual hierarchy, imagery, interaction behaviour, motion, responsive density, and customer-facing copy. `docs/02-design-system/LIVE-EXPERIENCE-STANDARD.md` and its bundled skill define how to preserve and extend that baseline.

`DESIGN.md` governs supporting visual tokens and visual language. Its legacy product-language passages are governed by `docs/02-design-system/DESIGN-CANONICALIZATION.md`.

Approved BukieBrainJobs product specifications govern product behavior, terminology and user experience.

The approved technical specification governs architecture unless a newer, explicitly approved technical decision supersedes it.

Historical research and project exports are context, not current product authority.

## Required behavior

- Keep changes scoped to the requested task.
- Reuse approved components and packages.
- Put shared contracts and business rules in shared packages where the architecture requires them.
- Keep secrets out of source control.
- Add or update focused tests for changed behavior. For a bug, add a reproduction test before the fix.
- Verify browser-facing work in a real browser or the strongest available equivalent, with visual and runtime evidence recorded proportionately.
- Preserve accessibility requirements.
- Preserve responsive behavior.
- Update documentation when behavior, architecture or decisions change.
- Record material architectural decisions before implementing them.

## Do not

- Start implementation from a vague feature request when a specification is missing.
- Treat historical terminology or research as current product requirements.
- Change the technology stack silently.
- Introduce a new design language or override the approved live experience without an explicitly recorded decision.
- Duplicate shared types or validation rules between apps.
- Add arbitrary colors or typography values when a design token exists.
- Commit generated secrets, local environment files or credentials.
- Perform broad refactors unrelated to the task.
- Delete documentation to make a task appear complete.

## Feature workflow

```text
Product decision
  -> Product specification
  -> Applicable skills and product context
  -> UX/UI requirements (DESIGN.md)
  -> Focused proof of changed behaviour
  -> Design and implementation
  -> Tests and browser-runtime verification where relevant
  -> Security / accessibility / performance review
  -> Preview deployment
  -> Human approval
  -> Merge to main
```

If a required artifact is missing, stop and identify the gap rather than guessing.

## Completion report

For every substantive change, report:

- What changed
- Why it changed
- Files affected
- Tests run
- Security considerations
- Accessibility considerations
- Documentation updated
- Known limitations
