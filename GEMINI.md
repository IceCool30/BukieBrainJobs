# BukieBrainJobs Development & Environment Rules

## 1. MANDATORY APPROVAL & SAFETY PROTOCOLS
* **CRITICAL FILE OPERATIONS**: NEVER delete, move, or reorganize files or directories without first seeking and receiving explicit approval from the user.
* **PROPOSAL FIRST**: Always present the exact list of files, the rationale, and the proposed folder organization plan to the user, and wait for their explicit confirmation before taking any action.
* **KEEP USER INFORMED**: Provide proactive updates on what is being done at every step.

---

## 2. CLOUD COMPUTE HIERARCHY & EXECUTION PIPELINE
* **Environment Context**:
  * **Local Terminal**: Termux on Android (strict RAM limits and Android Low Memory Killer / LMK).
  * **Primary Cloud Compute (100% Free / $0)**: Google Cloud Shell VM via `gcloud cloud-shell ssh` (tied to `solomonogarbukie@gmail.com`).
  * **Paid Fallback Compute**: GitHub Codespace `effective-fishstick-x5qwp6wrrp64fxwx` (4 CPU cores, 16 GB RAM, Ubuntu 22.04 LTS).
  * **Heavy Compute Sandbox**: Google Colab ephemeral GPU/TPU instances (T4, L4, A100) via universal `colab` CLI.

### Execution Rules
* **NEVER Run Heavy Commands Locally in Termux**: DO NOT run monorepo-wide tests (`pnpm test`, `turbo run test`), Vitest across multiple suites, TypeScript compiler checks (`tsc --noEmit`, `pnpm type-check`), or Next.js production builds (`pnpm build`) locally on Termux. Doing so causes Android LMK `SIGKILL` (exit 137).
* **PRIMARY: Dispatch Builds and Tests to Google Cloud Shell**:
  Always use the free Google Cloud Shell compute layer as the primary execution venue:
  ```bash
  gsync   # Syncs git branch to Google Cloud Shell (fetches and resets to origin/<branch>)
  gcheck  # Runs pnpm type-check on Google Cloud Shell
  gtest   # Runs pnpm test on Google Cloud Shell (supports test path args)
  gbuild  # Runs pnpm build on Google Cloud Shell (supports build args)
  gexec   # Runs command on Google Cloud Shell inside ~/BukieBrainJobs with correct PATH
  gvibe   # Runs vibe CLI on Google Cloud Shell
  gssh    # Opens interactive session on Google Cloud Shell
  ```
  The 5-Step Synchronization Pipeline for Google Cloud Shell:
  1. Commit and push from Termux (`git add <files> && git commit -m "..." && git push origin <branch>`).
  2. Sync Google Cloud Shell (`gsync <branch>`).
  3. Run verification commands on Google Cloud Shell (`gcheck`, `gtest <path>`, `gbuild`).
  4. Verify GitHub CI and Vercel preview deployment status:
     ```bash
     gh pr checks <pr#>
     gh pr view <pr#> --json statusCheckRollup
     ```
  5. Inspect failed CI workflow logs if needed: `gh run view <run-id> --log-failed`.
* **Vercel Deployments**:
  Vercel is linked to the GitHub repository and deploys automatically on every `git push origin <branch>`. Never attempt bare unauthenticated `vercel` CLI commands. View deployment status and preview URLs using `gh pr checks <pr#>`. If CLI access is strictly needed, pass `--token <token>` or export `VERCEL_TOKEN=<token>` and run `gvercel <args>`.
* **SSH Tunnel Output**:
  Output such as `Listening on local port [xxxxx]` and `Tunnel stopped` are normal gcloud SSH connection logs. Wait 2 to 5 seconds for remote command output to print.
* **Canonical Guide**: Consult `docs/19-deployment-operations/REMOTE-EXECUTION-GUIDE.md`.

---

## 3. GIT & ENVIRONMENT CLEANLINESS
* Do NOT commit machine-local files, phone memory limits, or local configuration to the GitHub repository. All local files belong in `.gitignore_global`.

---

## 4. SYSTEM 1 HIGH-SPEED COPROCESSOR (GLOBAL & PERMANENT)
* **Role Separation**: The `system1` subagent acts as an ultra-fast, read-only scout, indexer, and navigator (running on Gemini Flash Lite). It executes the complete 11-mode suite (SLICE, DISTILL, ROUTE, SAFETY_GUARD, DIFF_AUDIT, CONFLICT_TRIAGE, DEPENDENCY_SCAN, LOOP_PHASE_GATE, VOICE_AUDIT, SCORE, COMPUTE_TIER).
* **Zero Conversational Filler**: Output is strictly structured JSON or typed markdown blocks with zero fluff, intros, or summaries.
* **Top-Model Reasoning Authority**: The primary agent retains 100% authority and responsibility over architectural design, reasoning, and code implementation. System 1 never replaces the primary agent's deep reasoning; it merely strips away noise so the top model executes with maximum intelligence, speed, and context efficiency.

---

## 5. THE OPERATING SYSTEM: MR. SOLOMON 9-COMMAND ENGINEERING LOOP
* **Governing Framework**: The `mr-solomon-nine-command-engineering-loop` is the mandatory primary operating system for every task, both large features and small fixes.
* **Execution Rhythm**: Every task adheres to phase isolation (`/scope`, `/audit`, `/architect`, `/develop`, `/check`, `/test`, `/document`, `/sync`, `/debug`), scaled to the task size.
* **Dynamic Skill Orchestration**: Specialized skills are pulled in on-demand as each phase dictates:
  * `/develop` & `/test` ➔ Activates `agent-skills-test-driven-development`.
  * Frontend & UI phases ➔ Activates `bukiebrainjobs-experience-standards` and `ui-ux-pro-max`.
  * Customer-facing content ➔ Activates, first, `mr-solomon-natural-voice` and `bukiebrainjobs-content-style`. These are the two mandatory skills that must be used together for any customer-facing copy.
  * Reverse engineering, APK audits, bundle inspections, external API synthesis, network traces & opaque debugging ➔ Activates `reverse-engineer-anything` (REA). Must be actively evaluated and used on every task touching compiled/bundled artifacts, mobile APKs, HAR network captures, or undocumented integrations.
  * All communication and documentation ➔ Follow the direct human standard of `mr-solomon-natural-voice`.

---

## 6. MANDATORY & SPECIALIST SKILLS DIRECTORY (ONBOARDING & INSTALLATION)
Every developer, AI agent, and CI worker operating on BukieBrainJobs must have access to these core skills. If a skill or its underlying MCP engine is absent from the active environment, install and link it using the canonical instructions below:

| Skill | Canonical Repository / Source | Scope & Trigger | Installation / Activation Command |
|---|---|---|---|
| `reverse-engineer-anything` (REA) | [morluto/rea](https://github.com/morluto/rea) (npm: `rea-agents`) | APK audits, network HAR captures, external API reverse engineering, minified production bundles, opaque native debugging | `npx -y rea-agents@latest setup -y --client antigravity`<br/>(or `bun add -g rea-agents && rea setup`)<br/>Verify: `rea mcp doctor` |
| `mr-solomon-nine-command-engineering-loop` | BukieBrainJobs Skill Suite | Governing operating system for all 9 development phases (`/scope` to `/debug`) | Active in `.agents/skills/mr-solomon-nine-command-engineering-loop/` |
| `mr-solomon-natural-voice` | BukieBrainJobs Skill Suite | Human-standard tone across all communication, PRs, docs, and customer copy (no corporate fluff, no em dashes) | Active in `.agents/skills/mr-solomon-natural-voice/` |
| `bukiebrainjobs-content-style` | BukieBrainJobs Skill Suite | Marketplace terminology, microcopy, UI labels, trust language (paired with `mr-solomon-natural-voice`) | Active in `.agents/skills/bukiebrainjobs-content-style/` |
| `bukiebrainjobs-experience-standards` | BukieBrainJobs Skill Suite | Customer-facing UI, motion language, accessibility, responsive design | Active in `.agents/skills/bukiebrainjobs-experience-standards/` |
| `ui-ux-pro-max` | BukieBrainJobs Skill Suite | Visual design intelligence, component hierarchy, typography, design tokens | Active in `.agents/skills/ui-ux-pro-max/` |
| `agent-skills-test-driven-development` | [agent-skills-tdd](https://github.com/obra/superpowers) | Test-driven development for all logic changes, bug fixes, and new features | Active in `.agents/skills/agent-skills-test-driven-development/` |

