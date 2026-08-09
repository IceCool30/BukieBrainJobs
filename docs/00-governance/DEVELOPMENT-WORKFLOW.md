# Development Workflow

**Document ID:** GOV-003
**Version:** 1.0
**Status:** Approved foundation

## Core rule

No production feature should move directly from an idea to code.

## Feature Factory

```text
Idea / request
    ↓
Product specification
    ↓
UX flow and states
    ↓
Screen / UI specification
    ↓
Google Stitch design
    ↓
Human design approval
    ↓
Engineering specification
    ↓
Google Antigravity implementation
    ↓
Automated tests
    ↓
Security + accessibility + performance review
    ↓
Human approval
    ↓
Merge / release
```

## Required feature package

Each substantive feature should have:

1. Product brief
2. UX specification
3. Screen specification
4. Stitch prompt or design reference
5. Engineering specification
6. API and data requirements where applicable
7. Acceptance criteria
8. QA checklist
9. Decision log entry when material decisions are made

## Design gate

Antigravity must not start implementation merely because a Stitch design exists. The design must be explicitly approved and mapped to the relevant product and technical requirements.

## Engineering gate

Before implementation, verify:

- Scope is approved.
- Existing components have been checked for reuse.
- Relevant API and data contracts are known.
- Authorization rules are known.
- Validation rules are known.
- Error and empty states are defined.
- Accessibility requirements are defined.
- Security requirements are defined.
- Observability requirements are understood.

## Review gate

Before merge:

- Lint passes.
- Type-check passes.
- Relevant unit tests pass.
- Relevant integration tests pass.
- Critical E2E flows pass where applicable.
- Security review passes.
- Accessibility review passes.
- Documentation is updated.

## Environment strategy

The intended environment progression is:

```text
local → development → staging → production
```

Environment-specific secrets must never be hard-coded. Production credentials must never be used in local development.

## Failure handling

When a requirement is ambiguous or contradictory:

1. Stop at the boundary where the ambiguity matters.
2. Identify the exact question.
3. Check the source-of-truth hierarchy.
4. Ask for a decision or create a clearly labelled assumption.
5. Record the final decision if it affects future work.

## Agent safety rule

Agents should prefer a small, reversible change over a broad refactor. If an architectural change is necessary, document it before implementing it.
