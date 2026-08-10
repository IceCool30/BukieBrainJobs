# Prompt Library

The Prompt Library stores approved prompts used by Google Antigravity and QA agents.

## Rules

- Every prompt must reference its specification ID.
- Prompts are versioned like project artifacts.
- A prompt cannot change product requirements silently.
- Prompts should be self-contained enough for the target tool to execute safely.
- Antigravity prompts must explicitly state whether the task is design orchestration, implementation, refactoring or QA.
- [DEPRECATED] Stitch prompts are no longer part of the production pipeline.
- QA prompts must reference acceptance criteria and known edge cases.

## Structure

```text
docs/20-prompts/
├── stitch/ (Deprecated)
├── antigravity/
└── qa/
```

## Current prompt artifact

`WEB-001B-MCP` was the approved Antigravity-to-Stitch orchestration prompt for the public homepage. It is preserved for historical context but is now DEPRECATED.

## Promotion rule


A prompt becomes an approved production prompt only after the referenced specification is approved and the prompt has been reviewed for scope, safety and tool compatibility.
