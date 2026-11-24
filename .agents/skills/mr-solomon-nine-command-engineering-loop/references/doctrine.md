# The Doctrine of NINE

The NINE engineering loop is founded on four immutable principles that prevent context collapse, eliminate hallucinations, and ensure reliable execution across any software project.

---

## Principle 1: Each Phase Owns One Job

Engineering breakdowns occur when an agent tries to plan, design, code, test, and document in a single uncontrolled generation.

In NINE:
- `/scope` plans and decomposes, but does not design technical internals.
- `/audit` scans and maps existing code, but makes no changes.
- `/architect` makes structural decisions and writes specs, but does not write application code.
- `/develop` implements against specs, but makes no load-bearing design decisions.
- `/check` verifies builds and diffs, but does not write new features.
- `/test` writes and runs test suites, but does not refactor architecture.
- `/document` writes changelogs and PRs, but does not alter implementation.
- `/sync` updates context files, but does not invent new tasks.
- `/debug` diagnoses and fixes root causes, but does not introduce out-of-scope features.

Each command has a single entry condition, a single responsibility, and a single exit gate.

---

## Principle 2: State Lives in Files, Not in Chat

Chat history is volatile and subject to context truncation and hallucination.

In NINE:
- The source of truth is always the filesystem and git repository.
- Scope lives in `docs/scope.md`.
- Context maps live in `AGENTS.md`.
- Architecture specifications live in `docs/specs/*.md`.
- Verification logs live in `docs/check-log.md`.
- Change history lives in `git log` and `CHANGELOG.md`.

If the chat session ends, crashes, or is cleared, any agent running NINE can read the repository files and immediately resume work at the exact current phase with zero information loss.

---

## Principle 3: `/develop` Will Not Invent a Load-Bearing Decision

The most dangerous failure mode in AI pair programming is silent architectural invention during coding. When an agent hits an ambiguous database relation, an unstated authentication flow, or an undefined API contract, it often invents a solution silently.

Under NINE:
- `/develop` is explicitly prohibited from making load-bearing architectural choices.
- If `/develop` encounters a gap in the spec, it must immediately halt.
- Control returns to `/architect` to make the decision, document the spec, and seek confirmation before coding resumes.

---

## Principle 4: `/debug` is Off-Rail Anytime Something Breaks

Unlike the sequential pipeline from `/scope` to `/sync`, `/debug` operates as an emergency off-rail intervention:
- It can be summoned from any phase the moment an unexpected error, build failure, or test break occurs.
- It operates with a strict protocol: reproduce, isolate root cause, apply minimal patch, hand a regression test to `/test`.
