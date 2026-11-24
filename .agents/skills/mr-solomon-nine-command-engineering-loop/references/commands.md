# The Nine Commands: Operational Runbooks

This guide details the exact trigger conditions, inputs, actions, stop conditions, and outputs for every command in the loop.

---

## 1. `/scope` [PLAN]

- **Verb**: `PLAN`
- **Purpose**: Transform a raw feature request, bug complaint, or product idea into a coarse, numbered, verifiable work breakdown.
- **Trigger**: Starting any non-trivial change, new feature, or refactor.
- **Input**: User prompt, PR description, or high-level issue.
- **Actions**:
  1. Parse requirements and identify target domain/subsystems.
  2. Break work into small, sequential, verifiable slices.
  3. Define explicit acceptance criteria for each slice.
  4. Write or update `docs/scope.md`.
- **Stop Condition**: `docs/scope.md` is updated with numbered tasks and clear acceptance criteria. No application code has been touched.

---

## 2. `/audit` [CONTEXT]

- **Verb**: `CONTEXT`
- **Purpose**: Survey the project to seed and maintain `AGENTS.md` context files so all subsequent commands have an accurate map.
- **Trigger**: Initializing a repository, entering an unfamiliar codebase, or after major stack changes.
- **Input**: Filesystem, `package.json`, build scripts, directory layout, dependency trees.
- **Actions**:
  1. Inspect package managers, scripts, compilers, and test runners.
  2. Identify key architectural boundaries and routing patterns.
  3. Note environment constraints, memory limits, and external dependencies.
  4. Write or update `AGENTS.md` at the project root (and package roots in monorepos).
- **Stop Condition**: `AGENTS.md` accurately reflects commands, paths, and constraints.

---

## 3. `/architect` [DECIDE]

- **Verb**: `DECIDE`
- **Purpose**: Make load-bearing architectural choices and record them as explicit build specifications.
- **Trigger**: Before writing code for any non-trivial task, or when `/develop` encounters an architectural gap.
- **Input**: `docs/scope.md`, `AGENTS.md`, existing schema/API definitions.
- **Actions**:
  1. Identify load-bearing choices: data schemas, API contracts, security rules, error states.
  2. Resolve tradeoffs openly; push back against flawed patterns.
  3. Write a formal build spec in `docs/specs/<feature-name>.md`.
  4. Confirm that all edge cases and failure modes are explicitly specified.
- **Stop Condition**: Build spec document exists in `docs/specs/` with zero unanswered architectural questions.

---

## 4. `/develop` [BUILD]

- **Verb**: `BUILD`
- **Purpose**: Implement the code changes deterministically against the approved specification.
- **Trigger**: Build spec exists in `docs/specs/` (or an explicit `[Assumed Spec]` is documented for trivial 1-line changes).
- **Input**: `docs/specs/<feature-name>.md`.
- **Actions**:
  1. Implement code slice-by-slice, adhering strictly to the spec.
  2. Use existing project patterns, tokens, and utilities.
  3. Apply Mr. Solomon natural voice to all code comments and user-facing copy.
  4. Avoid generic artifacts (icons, taglines, captions, tips, subheadlines).
  5. **Emergency Halt**: If a load-bearing decision is missing from the spec, STOP immediately and call `/architect`. Never invent decisions on the fly.
- **Stop Condition**: Code changes implemented according to spec requirements.

---

## 5. `/check` [VERIFY]

- **Verb**: `VERIFY`
- **Purpose**: Prove that code compiles, types pass, and the git diff is surgical.
- **Trigger**: Following any code implementation in `/develop`.
- **Input**: Staged and unstaged git diff.
- **Actions**:
  1. Run project linter and type checker.
  2. Execute a compilation or build check.
  3. Review `git diff` for accidental files, unwanted formatting changes, or out-of-scope edits.
  4. Log verification status to `docs/check-log.md`.
- **Stop Condition**: Zero lint errors, zero type errors, clean diff confirmed.

---

## 6. `/test` [COVER]

- **Verb**: `COVER`
- **Purpose**: Write and execute a targeted test suite covering the changes made in `/develop`.
- **Trigger**: After building a feature or fixing a bug.
- **Actions**: Scope to changed code, cover normal path + edges + errors, save framework choice.
- **Stop Condition**: Tests exist and pass for the changed scope.

---

## 7. `/document` [WRITE]

- **Verb**: `WRITE`
- **Purpose**: Generate technical pull request descriptions, changelog entries, and release notes from the real diff.
- **Rules**: Derive all documentation strictly from the actual `git diff`. Write in Mr. Solomon natural voice. Zero hallucinated claims or generic marketing phrases.

---

## 8. `/sync` [REALIGN]

- **Verb**: `REALIGN`
- **Purpose**: Surgically update context files, mark completed tasks in `docs/scope.md`, and record final spec status.
- **Rules**: Ensures that documentation never drifts from code reality. Run at the end of each completed slice.

---

## 9. `/debug` [FIX]

- **Verb**: `FIX`
- **Purpose**: Off-rail rapid incident response and bug fixing.
- **Rules**: Reproduce, isolate root cause, apply minimal patch, hand regression test to `/test`. Can be triggered anytime from any phase.
