# BukieBrainJobs Remote Execution Guide: Cloud Shell, Vercel, and GitHub

This guide is the canonical instruction manual for all AI agents and developers across any CLI environment (Cline, OpenCode, Mistral Vibe, Claude Code, Codex, Grok, GenCode / Antigravity). Follow these procedures strictly to avoid execution errors, out-of-memory crashes, or broken deployment loops.

---

## 1. Golden Rule: Local Termux vs Remote Cloud Shell

### Local Environment (Termux on Android)
- Termux operates under physical mobile memory constraints and aggressive Android Low Memory Killer (LMK) termination.
- **NEVER run heavy tasks locally in Termux**:
  - Do NOT run `pnpm build` or `turbo run build`.
  - Do NOT run `tsc --noEmit` or `pnpm type-check`.
  - Do NOT run full test suites (`pnpm test` or `turbo run test`).
  - Running these locally will result in abrupt process termination (`SIGKILL`, code 137, or silent exit). This is an OS memory kill, not a code defect.

### Primary Remote Compute (Google Cloud Shell VM)
- Google Cloud Shell is a dedicated Linux VM tied to `solomonogarbukie@gmail.com`.
- It is 100% free ($0 spend) and has full RAM and CPU capacity.
- All builds, type-checks, full test suites, and Vercel CLI tasks must run on Google Cloud Shell.

---

## 2. Remote Command Reference

The following wrapper binaries are installed in PATH (`/data/data/com.termux/files/usr/bin/`) and available anywhere in Termux:

| Command | Action | Example |
|---|---|---|
| `gsync [branch]` | Fetches origin and resets Cloud Shell working tree to `origin/[branch]`. | `gsync feature/bw-003-leads-inbox` |
| `gtest [args]` | Runs `pnpm test` on Cloud Shell with optional test arguments. | `gtest` or `gtest apps/web/app/brainworker/` |
| `gbuild [args]` | Runs Next.js/Turbo build on Cloud Shell. | `gbuild` or `gbuild --filter @bukiebrainjobs/web` |
| `gcheck [args]` | Runs TypeScript compiler checks (`pnpm type-check`) on Cloud Shell. | `gcheck` |
| `gexec "<command>"` | Runs any arbitrary command on Cloud Shell inside `~/BukieBrainJobs` with correct PATH. | `gexec "git status"` or `gexec "pnpm lint"` |
| `gvercel [args]` | Runs Vercel CLI on Cloud Shell with automatic token passthrough if `$VERCEL_TOKEN` is set. | `gvercel ls` |
| `gvibe [args]` | Launches Mistral Vibe CLI on Cloud Shell. | `gvibe` |
| `gssh` | Opens an interactive SSH session to Cloud Shell. | `gssh` |

---

## 3. The 5-Step Development and Verification Loop

Whenever writing code or fixing bugs, execute this exact sequence:

### Step 1: Make Code Changes Locally
Edit files locally in the repository on Termux. Run only lightweight unit tests or single-file checks if needed.

### Step 2: Commit and Push to GitHub
Commit your changes and push them to the remote branch on GitHub:
```bash
git add <files>
git commit -m "feat/fix: descriptive summary"
git push origin <branch>
```

### Step 3: Synchronize Google Cloud Shell
Update the Cloud Shell VM to match your newly pushed commit:
```bash
gsync <branch>
```
`gsync` automatically fetches origin, checks out your branch, and resets the Cloud Shell directory to `origin/<branch>`.

### Step 4: Verify Remote Build, Typecheck, and Tests
Run your verification commands on Cloud Shell:
```bash
# 1. Verify TypeScript types
gcheck

# 2. Run relevant tests
gtest <optional-path-to-test-file>

# 3. Verify Next.js production build
gbuild
```

### Step 5: Check GitHub CI and Vercel Deployment
Once your commit is pushed to GitHub, GitHub Actions and Vercel trigger automatically:
```bash
# Check all pull request checks (CI and Vercel)
gh pr checks <pr-number>

# View PR details and preview deployment URL
gh pr view <pr-number> --json statusCheckRollup
```

---

## 4. GitHub CLI (`gh`) Integration

GitHub CLI is authenticated on both Termux and Cloud Shell under `IceCool30`.

- Check current pull request checks:
  ```bash
  gh pr checks <pr-number>
  ```
- Check GitHub Actions workflow status:
  ```bash
  gh run list --branch <branch>
  ```
- View failed step logs for a workflow run:
  ```bash
  gh run view <run-id> --log-failed
  ```

---

## 5. Vercel Deployments: How They Work

### Automated Git Deployments
- Vercel is connected directly to the `IceCool30/BukieBrainJobs` repository.
- Every `git push` to a branch with an open pull request automatically generates a Vercel preview deployment.
- Every `git push` to `main` generates a Vercel production deployment.
- You do NOT need to run manual `vercel deploy` commands.

### Inspecting Vercel Deployments
- Run `gh pr checks <pr-number>` to see if the Vercel deployment succeeded or failed.
- If Vercel reports an error, inspect the GitHub Actions run or view the failed build logs:
  ```bash
  gh run view <run-id> --log-failed
  ```
- If you have a `VERCEL_TOKEN`, you can export it locally:
  ```bash
  export VERCEL_TOKEN="<your-token>"
  gvercel ls bukiebrainjobs
  ```

---

## 6. Common Pitfalls and Solutions

### Pitfall 1: "Listening on local port [xxxxx]... Tunnel stopped."
- **Why it happens**: When `gcloud cloud-shell ssh` connects, it prints port-forwarding and tunnel teardown info to standard error.
- **Resolution**: This is completely normal and indicates a healthy connection. Wait 2 to 5 seconds for the remote command output to print. Do NOT cancel the command.

### Pitfall 2: Running `pnpm build` or `pnpm test` locally causes exit code 137 / SIGKILL
- **Why it happens**: Termux hit the Android Low Memory Killer limit.
- **Resolution**: Never run heavy builds locally. Always run `gbuild` or `gtest`.

### Pitfall 3: "pnpm: command not found" or "node: command not found" on Cloud Shell
- **Why it happens**: A raw SSH command was run without exporting the Node.js PATH.
- **Resolution**: Use `gexec "<command>"`, or if running raw SSH, include:
  ```bash
  export PATH="$HOME/.local/node/bin:$HOME/.local/bin:$PATH"
  ```

### Pitfall 4: "Error: No existing credentials found" when running `vercel`
- **Why it happens**: Vercel CLI is not logged in interactively on Cloud Shell.
- **Resolution**: Do not run bare `vercel` commands. Vercel is driven through Git pushes to GitHub. Verify status with `gh pr checks <pr-number>`. If manual CLI access is strictly needed, supply `--token <token>`.

### Pitfall 5: Cloud Shell has merge conflicts or aborts git pull
- **Why it happens**: Stray files or previous edits were written directly on Cloud Shell.
- **Resolution**: Run `gsync <branch>`. It automatically runs `git reset --hard origin/<branch>` to bring Cloud Shell into 100% clean alignment with GitHub.
