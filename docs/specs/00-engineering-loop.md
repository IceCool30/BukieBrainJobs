# Spec: 00-engineering-loop (Mr. Solomon 9-Command Engineering Loop Integration)

**Status**: Accepted

## Decision
Incorporate the Mr. Solomon 9-Command Engineering Loop as the primary engineering operating system across the BukieBrainJobs monorepo. Establish file-backed state files (`AGENTS.md`, `docs/scope.md`, `docs/specs/`, `docs/check-log.md`, `CHANGELOG.md`) and enforce strict anti-generic guardrails and Mr. Solomon natural voice across all written artifacts.

## Requirements
1. Expand `AGENTS.md` to conform to the NINE context map schema.
2. Initialize `docs/scope.md` to record completed and upcoming work slices.
3. Establish `docs/specs/` as the canonical build specification home.
4. Initialize `docs/check-log.md` with verified test and type-check baselines.
5. Create root `CHANGELOG.md` written in Mr. Solomon natural voice without em dashes.
6. Provide `scripts/nine-status.sh` and `"loop:status"` in `package.json` for rapid status inspection.
7. Clean all test suites in `apps/web` of em dash usage in describe blocks.

## Acceptance Criteria
1. `bash scripts/nine-status.sh` passes and reports valid scope, context, and specs.
2. `pnpm type-check` passes with zero errors on cloud Codespace.
3. `pnpm test` passes with all tests green on cloud Codespace.
4. Git working tree remains clean and properly tracked.

## Build Plan
- Step 1: Update `AGENTS.md`.
- Step 2: Create `docs/scope.md`.
- Step 3: Create `docs/specs/README.md` and spec files.
- Step 4: Create `docs/check-log.md`.
- Step 5: Create `CHANGELOG.md`.
- Step 6: Create `scripts/nine-status.sh` and update `package.json`.
- Step 7: Clean test suite describe labels.
- Step 8: Run local and Codespace verification.

## Edge Cases & Failure Modes
- Local Termux Out-Of-Memory: Local execution of heavy test/build commands triggers Android LMK. Mitigated by strictly dispatching heavy tasks to the cloud Codespace over SSH.
- Em dash regressions: Punctuation rule strictly forbids em dashes (Unicode U+2014 or double hyphens). Mitigated by automated grep checks before committing.

## Out of Scope
- Backend database migrations or production server deployments.
