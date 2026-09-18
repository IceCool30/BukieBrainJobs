# File Schemas & State Specifications

In the NINE loop, state lives on disk. Below are the canonical file schemas for the state persistence layer.

---

## 1. `AGENTS.md` (Context Map)

```markdown
# AGENTS.md

## Repository Overview
- **Project Name**: [Project Name]
- **Architecture**: [Monorepo / Single Package / Microservices]
- **Primary Languages & Runtimes**: [e.g., TypeScript, Node.js 20, Python 3.11]

## Core Commands
- **Install**: `pnpm install`
- **Dev**: `pnpm dev`
- **Build**: `pnpm build`
- **Typecheck**: `pnpm typecheck`
- **Lint**: `pnpm lint`
- **Test**: `pnpm test`

## Environment & Execution Constraints
- [constraints]

## Conventions & Standards
- Voice: Mr. Solomon Natural Voice across all copy and documentation.
- Visual: Design tokens extracted from code; no arbitrary hex values.
- Quality: Anti-generic guardrails strictly enforced (zero slop).
```

---

## 2. `docs/scope.md` (Scope Plan)

```markdown
# Project Scope & Task Breakdown

## Objective
...

## Planned Work Slices
- [ ] **1. ...**
  - Spec: ...
  - Acceptance Criteria: ...
```

---

## 3. `docs/specs/<feature>.md` (Build Spec)

```markdown
# Spec: [Feature Name]
**Status**: Proposed | Assumed | In Progress | Accepted

## Decision
...

## Requirements
...

## Acceptance Criteria
...
```
