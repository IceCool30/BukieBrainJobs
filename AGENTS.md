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
- **Typecheck**: `gcheck` (execute `pnpm type-check` on Google Cloud Shell)
- **Test**: `gtest [args]` (execute Vitest on Google Cloud Shell) or `ctest` (fallback Codespace)
- **Build**: `gbuild [args]` (execute Next.js/Turbo build on Google Cloud Shell) or `cbuild` (fallback Codespace)
- **Remote Sync**: `gsync <branch>` (Google Cloud Shell: fetches and resets to `origin/<branch>`)
- **Remote Exec**: `gexec "<command>"` (execute arbitrary shell command on Google Cloud Shell)
- **Remote SSH**: `gssh` (interactive session on Google Cloud Shell) or `cssh` (fallback Codespace)
- **Vibe on Cloud**: `gvibe` (execute Mistral Vibe on Google Cloud Shell)
- **PR Checks / Vercel**: `gh pr checks <pr#>` and `gh pr view <pr#> --json statusCheckRollup`
- **Database Generate**: `pnpm db:generate` (execute on Google Cloud Shell / Codespace)
- **Loop Status**: `bash scripts/nine-status.sh` or `pnpm run loop:status`
- **Canonical Remote Guide**: `docs/19-deployment-operations/REMOTE-EXECUTION-GUIDE.md`

## Environment & Execution Constraints
- **Local Environment**: Termux on Android. Strict physical RAM limits and aggressive Android Low Memory Killer (LMK).
- **Primary Cloud Compute (100% Free / $0)**: Google Cloud Shell VM via `gcloud cloud-shell ssh` (tied to `solomonogarbukie@gmail.com`).
- **Paid Fallback Compute**: Cloud Codespace `effective-fishstick-x5qwp6wrrp64fxwx` (4 cores, 16 GB RAM, Ubuntu 22.04 LTS).
- **Heavy Compute Sandbox (Google Colab CLI)**:
  - Ephemeral cloud GPU/TPU environments provisioned via the universal `colab` CLI.
  - Dedicated strictly to heavy data operations: Gemini prompt stress-testing, deterministic synthetic seeding, asset/media processing, and dispatch math.
  - Full operational protocol governed by `docs/03-architecture/ARCH-003-GOOGLE-COLAB-COMPUTE-PIPELINE.md`.
- **Execution Pipeline**:
  - NEVER run heavy commands locally on Termux (`pnpm build`, `tsc --noEmit`, `pnpm type-check`, `pnpm test`, `turbo run test`). Doing so triggers Android LMK `SIGKILL` (exit 137).
  - **PRIMARY: Dispatch Builds and Tests to Google Cloud Shell**:
    Always use the free Google Cloud Shell compute layer as the primary execution venue:
    ```bash
    gsync   # Syncs git branch to Google Cloud Shell (resets to origin/<branch>)
    gcheck  # Runs pnpm type-check on Google Cloud Shell
    gtest   # Runs pnpm test on Google Cloud Shell (supports test path args)
    gbuild  # Runs pnpm build on Google Cloud Shell (supports build args)
    gexec   # Runs arbitrary command inside ~/BukieBrainJobs on Google Cloud Shell
    gvibe   # Runs vibe CLI on Google Cloud Shell
    gssh    # Opens interactive session on Google Cloud Shell
    ```
  - **The 5-Step Synchronization Pipeline**:
    1. Edit code locally on Termux.
    2. Commit and push from Termux (`git add <files> && git commit -m "..." && git push origin <branch>`).
    3. Sync Google Cloud Shell (`gsync <branch>`).
    4. Run verification on Google Cloud Shell (`gcheck`, `gtest <path>`, `gbuild`).
    5. Check GitHub CI and Vercel preview status on GitHub (`gh pr checks <pr#>`).
  - **Vercel Deployments**: Vercel triggers automatically on `git push origin <branch>` via GitHub integration. Do not run unauthenticated `vercel` CLI commands; inspect deployment results with `gh pr checks <pr#>`. If CLI access is needed, supply `--token <token>` or export `VERCEL_TOKEN=<token>`.
  - **SSH Tunnel Logs**: Output like `Listening on local port [xxxxx]` and `Tunnel stopped` are normal gcloud SSH connection logs. Wait 2 to 5 seconds for remote output.
  - **FALLBACK: Cloud Codespace**:
    Use GitHub Codespaces only when Cloud Shell is unreachable or during maintenance:
    ```bash
    ctest   # Runs pnpm test on Codespace
    cbuild  # Runs pnpm build on Codespace
    cssh    # Opens SSH session to Codespace
    ```
    Codespace Dispatch: `gh codespace ssh -c effective-fishstick-x5qwp6wrrp64fxwx -- "cd /workspaces/BukieBrainJobs && <COMMAND>"`
- **Safety Protocols**: Never delete, move, or reorganize files or directories without explicit user confirmation.
- **System 1 High-Speed Coprocessor**:
  - Acts as an ultra-fast, read-only scout, indexer, and navigator (running on Gemini Flash Lite). Handles file slicing, log distillation, monorepo routing, and rule verification.
  - The primary agent retains 100% authority and responsibility over architectural design, reasoning, and code implementation. System 1 never replaces top-model reasoning; it strips away noise so the top model executes with maximum intelligence, speed, and context efficiency.

## Conventions & Standards
- **Voice**: Mr. Solomon Natural Voice across all copy, commits, PRs, and documentation. Never use em dashes.
- **Customer-Facing Content**: Whenever customer-facing content is written, it must activate, first, `mr-solomon-natural-voice` and `bukiebrainjobs-content-style`. These are the two mandatory skills that must be used together for any customer-facing copy.
- **Visual**: Design tokens extracted directly from code and `globals.css` `@theme`; no arbitrary hex values. Deep Navy is primary, Emerald is strategic emphasis/success.
- **Quality**: Anti-generic guardrails strictly enforced (zero slop: no generic icons, taglines, captions, explainers, subheadlines, fake cheerleading, or unsupported absolute claims).
- **Data Integrity**: Production-first architecture with deterministic mock data. Never fabricate rates, coordinates, ratings, verification results, or booking confirmations.

## Engineering Loop State (The 9 Commands)
- **Governing Operating System**: `mr-solomon-nine-command-engineering-loop` governs every task (both large features and small fixes) via phase isolation (`/scope`, `/audit`, `/architect`, `/develop`, `/check`, `/test`, `/document`, `/sync`, `/debug`).
- **Active Phase**: Phase 2 BrainWorker Web Platform (/check [VERIFY] Phase 7: Production Verification & Audit)
- **Active Slice**: 21. BW-003 BrainWorker Job Requests & Leads Inbox (Phase 6 GREEN Accepted, entering Phase 7)
- **Loop State Files**:
  - Scope: `docs/scope.md`
  - Master Checklist: `docs/master-checklist.md`
  - Context Map: `AGENTS.md`
  - Specifications: `docs/specs/`
  - Verification Log: `docs/check-log.md`
  - Changelog: `CHANGELOG.md`

## Mandatory Skills: Load and Apply on Every Task

These skills are required for all work in this repository without exception. Load each one at the start of every session and apply it whenever the task falls within its domain. Do not skip, defer, or partially apply these skills.

**This is enforced as a hard gate, not a preference.** Before your first file edit, load all six through the skills tool, triage each one as `APPLIED` or `OUT OF SCOPE`, and print the `SKILL GATE` block exactly as specified in `.clinerules` section 6 (mirrored in `CLAUDE.md`). The declaration must appear in your reply before any edit. A missing line fails the gate. `OUT OF SCOPE` requires a specific reason, not a vague one. Re-run the gate whenever the task materially changes.

Every agent is bound by this: primary agent, subagent, teammate, spawned worker. Whoever edits, declares. When spawning a subordinate, include the gate in its system prompt.

| Skill | Path | Apply when |
|---|---|---|
| `mr-solomon-nine-command-engineering-loop` | `.agents/skills/mr-solomon-nine-command-engineering-loop/SKILL.md` | Primary operating system for all tasks: planning, architecture spec, development loop, verification, documentation, or debugging phase. |
| `mr-solomon-natural-voice` | `.agents/skills/mr-solomon-natural-voice/SKILL.md` | Required for all communications, documentation, and (first) for all customer-facing content. |
| `bukiebrainjobs-content-style` | `.agents/skills/bukiebrainjobs-content-style/SKILL.md` | Customer-facing copy, marketplace terminology, and microcopy (must be applied together with `mr-solomon-natural-voice`). |
| `bukiebrainjobs-experience-standards` | `.agents/skills/bukiebrainjobs-experience-standards/SKILL.md` | Any customer-facing UI, copy, motion, responsive layout, component, accessibility, or interaction work. |
| `ui-ux-pro-max` | `.agents/skills/ui-ux-pro-max/SKILL.md` | Any visual design decision, page structure, component quality review, typography, color, animation, or UX pattern. |
| `agent-skills-test-driven-development` | `.agents/skills/agent-skills-test-driven-development/SKILL.md` | Any logic change, bug fix, behavior modification, or new feature implementation. |

All mandatory skills must be read before work begins on any substantive task. If a task spans multiple domains, apply all relevant skills together.

Two skills are almost never out of scope: `mr-solomon-nine-command-engineering-loop` governs the task itself, and `mr-solomon-natural-voice` governs everything written. If you cannot state a concrete reason a skill is out of scope, treat it as in scope.

Verify rather than claim: run `bash scripts/check-skill-gate.sh` from the repository root before review. It fails loudly if any rule file lost the gate or dropped one of the six skills. Treat a failure as a blocker for the task, not a warning.


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
