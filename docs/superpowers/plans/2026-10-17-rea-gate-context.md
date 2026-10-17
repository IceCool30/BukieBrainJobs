# REA Gate and Active Context Implementation Plan

> **For agentic workers:** Execute the approved maintenance task inline. Read the repository gates before edits. The owner's later 17 October instruction authorizes committing and publishing today's changes on a separate branch, but not merging to `main`.

**Goal:** Enforce REA in all eight-skill gate declarations and refresh active-task notes through merged BW-006.

**Architecture:** Retain the existing Bash gate checker and mirrored agent rules. Preserve historical feature records and identify the next product task as awaiting owner selection unless the repository proves otherwise.

**Tech Stack:** Bash, Node.js built-in test runner, Markdown.

**Spec:** The user's 17 October 2026 request to include REA in the gate checklist and refresh active-task notes; `AGENTS.md` mandatory skill policy.

## Global Constraints

No application changes, dependency updates, merge to `main`, production deployment, or invented verification results. Publish only today's gate, regression-test, and documentation work on `chore/rea-gates-2026-10-17`. Global skill files, CLI installations, and account connector configuration stay outside the project repository.

## Gate enforcement

- [x] Add `scripts/check-skill-gate.test.mjs` using `node:test` and disposable fixtures. A complete eight-skill declaration must pass; removing REA from any required rule file must fail.
- [x] Run `node --test scripts/check-skill-gate.test.mjs` against the current checker and record the missing-REA failures.
- [x] Add REA to `scripts/check-skill-gate.sh`, `AGENTS.md`, `CLAUDE.md`, and `.clinerules`. Align skill counts and remove the duplicate Trades Design System row.
- [x] Run the focused test suite and `bash scripts/check-skill-gate.sh` after the fix.

## Active-task notes

- [x] Reconcile `AGENTS.md`, `README.md`, `docs/scope.md`, and `docs/master-checklist.md` against merged commits and approved BW-004, dashboard, BW-005 profile, and BW-006 wallet documents.
- [x] Preserve historical BW-003 notes. Correct the obsolete planned BW-005 wallet identifier to the merged BW-006 record without inventing completion evidence.
- [x] Record actual maintenance checks in `docs/check-log.md` and the scoped change in `CHANGELOG.md`.
- [x] Run `bash -n scripts/check-skill-gate.sh`, `git diff --check`, and inspect the full local diff and repository status. Do not run unrelated application suites for this Bash-and-documentation change.
