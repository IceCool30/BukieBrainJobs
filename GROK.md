# BukieBrainJobs — Grok CLI Project Rules

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
- **Vercel Deployments**: Vercel triggers automatically on `git push origin <branch>` via GitHub integration. Do not attempt unauthenticated `vercel` CLI commands. View deployment status and preview URLs using `gh pr checks <pr#>` and `gh pr view <pr#> --json statusCheckRollup`. If CLI access is needed, supply `--token <token>` or export `VERCEL_TOKEN=<token>`.
- **Reference**: Detailed troubleshooting and workflow patterns in `docs/19-deployment-operations/REMOTE-EXECUTION-GUIDE.md`.

## 5. Engineering Standards
- **Mandatory Approval**: NEVER delete, move, or reorganize files without explicit confirmation.
- **TDD Rigor**: Write failing tests before implementation (RED -> GREEN -> REFACTOR).
- **Mr. Solomon Voice**: Direct, human, clear, anti-generic. No corporate slop, no fake enthusiasm, no em dashes.
- **Canonical Context Map**: Consult `AGENTS.md` and `docs/specs/` for architectural boundaries.
