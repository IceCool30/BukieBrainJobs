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
* **NEVER Run Heavy Commands Locally in Termux**: DO NOT run monorepo-wide tests (`pnpm test`, `turbo run test`), Vitest across multiple suites, or Next.js production builds (`pnpm build`) locally on Termux.
* **PRIMARY: Dispatch Builds and Tests to Google Cloud Shell**:
  Always use the free Google Cloud Shell compute layer as the primary execution venue:
  ```bash
  gtest   # Runs pnpm test on Google Cloud Shell
  gbuild  # Runs pnpm build on Google Cloud Shell
  gsync   # Syncs git branch to Google Cloud Shell
  gvibe   # Runs vibe CLI on Google Cloud Shell
  gssh    # Opens interactive session on Google Cloud Shell
  ```
  Synchronization Pipeline for Google Cloud Shell:
  1. Commit and push from Termux (`git push origin <branch>`).
  2. Sync Google Cloud Shell (`gsync <branch>` or `gcloud cloud-shell ssh --authorize-session --command="cd ~/BukieBrainJobs && git checkout <branch> && git pull origin <branch>"`).
  3. Run the verification command on Google Cloud Shell (`gtest` or `gbuild`).
* **FALLBACK: Cloud Codespace**:
  Use GitHub Codespaces only when Cloud Shell is unreachable or during maintenance:
  ```bash
  ctest   # Runs pnpm test on Codespace
  cbuild  # Runs pnpm build on Codespace
  cssh    # Opens SSH session to Codespace
  ```
* **HEAVY DATA SANDBOX: Google Colab**:
  Dispatch prompt benchmarking, synthetic seeding, asset compression, and dispatch math to ephemeral Colab instances:
  ```bash
  colab run --gpu L4 scripts/colab/<script>.py
  ```

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
  * All communication and documentation ➔ Follow the direct human standard of `mr-solomon-natural-voice`.
