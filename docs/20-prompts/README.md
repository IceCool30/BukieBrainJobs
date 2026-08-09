# Prompt Library

The Prompt Library stores approved prompts used by Google Stitch, Google Antigravity and QA agents.

## Rules

- Every prompt must reference its specification ID.
- Prompts are versioned like project artifacts.
- A prompt cannot change product requirements silently.
- Prompts should be self-contained enough for the target tool to execute safely.
- Antigravity prompts must explicitly state whether the task is design orchestration, implementation, refactoring or QA.
- Stitch prompts must reference the approved design system.
- QA prompts must reference acceptance criteria and known edge cases.

## Structure

```text
docs/20-prompts/
├── stitch/
├── antigravity/
└── qa/
```

## Current prompt artifact

`WEB-001B-MCP` is the approved Antigravity-to-Stitch orchestration prompt for the public homepage. It must be stored under `docs/20-prompts/antigravity/` when the full prompt is transferred from the project source material.

## Promotion rule

A prompt becomes an approved production prompt only after the referenced specification is approved and the prompt has been reviewed for scope, safety and tool compatibility.
