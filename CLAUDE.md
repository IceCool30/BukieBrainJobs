# BukieBrainJobs — Claude Code Project Guidelines

## 1. Local Resource Constraints (Termux on Android)
- **Local Environment**: Termux on Android with strict RAM limits and aggressive Android Low Memory Killer (LMK).
- **CRITICAL**: NEVER run heavy builds, type-checks, or monorepo-wide tests locally in Termux (`pnpm build`, `tsc --noEmit`, `pnpm type-check`, `pnpm test`, `turbo run test`). Doing so triggers Android LMK `SIGKILL` (exit code 137).

## 2. Cloud Compute Hierarchy & Remote Execution
- **PRIMARY: Google Cloud Shell VM (100% Free / $0)**:
  Always dispatch builds, tests, and heavy commands to Google Cloud Shell using the preinstalled CLI wrappers:
  - `gsync <branch>` — Syncs git branch to Google Cloud Shell (fetches and resets to `origin/<branch>`).
  - `gcheck` — Runs TypeScript compiler checks (`pnpm type-check`) on Google Cloud Shell.
  - `gtest [args]` — Runs `pnpm test` on Google Cloud Shell (supports test paths, e.g. `gtest app/brainworker/`).
  - `gbuild [args]` — Runs `pnpm build` on Google Cloud Shell (e.g. `gbuild --filter @bukiebrainjobs/web`).
  - `gexec "<command>"` — Dispatches arbitrary shell commands inside `~/BukieBrainJobs` on Google Cloud Shell.
  - `gvibe` — Runs Mistral Vibe on Google Cloud Shell.
  - `gssh` — Interactive session on Google Cloud Shell.
- **SSH Tunnel Logs**: Lines like `Listening on local port [xxxxx]` and `Tunnel stopped` are normal gcloud SSH output. Wait 2 to 5 seconds for remote output to appear.
- **FALLBACK: GitHub Codespaces**:
  Use `effective-fishstick-x5qwp6wrrp64fxwx` (`ctest`, `cbuild`, `cssh`) only when Cloud Shell is unavailable.
- **HEAVY COMPUTE: Google Colab**:
  Dispatch synthetic seeding and heavy benchmarks via `colab` CLI.

## 3. The 5-Step Synchronization Pipeline
Whenever you modify code, follow this exact sequence:
1. **Edit locally**: Edit files in Termux.
2. **Commit & Push**: `git add <files> && git commit -m "..." && git push origin <branch>`.
3. **Sync Cloud Shell**: `gsync <branch>`.
4. **Verify on Cloud Shell**: `gcheck`, `gtest <path>`, `gbuild`.
5. **Inspect CI & Vercel**: `gh pr checks <pr#>` and `gh pr view <pr#> --json statusCheckRollup`.

## 4. GitHub & Vercel Integration
- **GitHub CLI (`gh`)**: Authenticated as `IceCool30`. Use `gh pr checks <pr#>`, `gh run list --branch <branch>`, and `gh run view <run-id> --log-failed`.
- **Vercel Deployments**: Vercel triggers automatically on `git push origin <branch>` via GitHub integration. Do not attempt unauthenticated `vercel` CLI commands. View deployment status and preview URLs using `gh pr checks <pr#>` and `gh pr view <pr#> --json statusCheckRollup`. If CLI access is needed, supply `--token <token>` or export `VERCEL_TOKEN=<token>` and run `gvercel <args>`.
- **Reference**: Detailed troubleshooting and workflow patterns in `docs/19-deployment-operations/REMOTE-EXECUTION-GUIDE.md`.

## 5. Engineering Standards
- **Mandatory Approval**: NEVER delete, move, or reorganize files without explicit confirmation.
- **TDD Rigor**: Write failing tests before implementation (RED -> GREEN -> REFACTOR).
- **Mr. Solomon Voice**: Direct, human, clear, anti-generic. No corporate slop, no fake enthusiasm, no em dashes.
- **Canonical Context Map**: Consult `AGENTS.md` and `docs/specs/` for architectural boundaries.

## 6. Mandatory Skill Gate (Every Task, No Exceptions)

These seven skills are required on every task. They are load-bearing rules, not suggestions:

`mr-solomon-nine-command-engineering-loop`, `mr-solomon-natural-voice`, `bukiebrainjobs-content-style`, `bukiebrainjobs-trades-design-system`, `bukiebrainjobs-experience-standards`, `ui-ux-pro-max`, `agent-skills-test-driven-development`

**The gate:**

1. **Load before you touch anything.** Do not create, edit, or delete any file until all seven skills have been loaded through the skills tool and triaged. Reading these rules is not loading a skill. `AGENTS.md` names the paths.
2. **Declare before the first edit.** Print this block in your reply before any file change:

```
SKILL GATE
- mr-solomon-nine-command-engineering-loop: APPLIED
- mr-solomon-natural-voice: APPLIED
- bukiebrainjobs-content-style: OUT OF SCOPE (no customer-facing copy in this task)
- bukiebrainjobs-trades-design-system: OUT OF SCOPE (no trades styling or dual-theme layout change)
- bukiebrainjobs-experience-standards: OUT OF SCOPE (no UI or interaction change)
- ui-ux-pro-max: OUT OF SCOPE (no visual or layout decision)
- agent-skills-test-driven-development: APPLIED
GATE PASSED
```

3. **Every line is required.** A missing line fails the gate the same as a skipped skill. No silent omission.
4. **`OUT OF SCOPE` needs a real reason.** "Not relevant" is not a reason. "No customer-facing copy in this diff" is. If you cannot say why it is out of scope, it is in scope.
5. **`mr-solomon-nine-command-engineering-loop` and `mr-solomon-natural-voice` are almost never out of scope.** The first governs the task itself, the second governs everything you write.
6. **Re-gate on task change.** A new task, or a materially different task, runs the gate again.
7. **If work already started without the gate, stop.** Load, declare, then continue from where you are.
8. **Every agent, no exceptions.** Primary agent, subagent, teammate, spawned worker. Whoever edits, declares. When you spawn a subordinate, put this gate in its system prompt.
9. **A task is not finished while the gate is unpassed.** An unpassed gate makes any result inadmissible for review.
10. **Verify the gate, do not just claim it.** Run `bash scripts/check-skill-gate.sh` from the repository root. It fails loudly if any rule file lost the gate or dropped one of the seven skills. Run it before review, and treat a failure as a blocker for the task, not a warning.
