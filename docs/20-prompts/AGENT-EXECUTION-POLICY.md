# Agent Execution Policy

**Document ID:** AOP-001
**Version:** 1.0
**Status:** Active

## Purpose

This policy governs Google Antigravity, Google Stitch MCP orchestration, QA agents, and any future coding or design agent working on BukieBrainJobs.

## Required Reading

Before work begins, an agent must identify and read the applicable:

1. `AGENTS.md`
2. `docs/00-governance/SOURCE-OF-TRUTH.md`
3. `docs/00-governance/DOCUMENTATION-INDEX.md`
4. `docs/00-governance/DECISION-LOG.md`
5. The relevant product specification
6. The relevant Design System artifact
7. The relevant technical specification
8. Security and QA guidance for the affected domain

## Authority Rules

- Do not invent product requirements.
- Do not replace an approved design decision with a framework default.
- Do not reinterpret brand colors or typography.
- Do not bypass documented business rules or state machines.
- Do not create a second source of truth.
- Do not modify unrelated modules while implementing a scoped feature.
- If two authoritative documents conflict, stop and record the conflict for resolution unless an explicit precedence rule already resolves it.

## Feature Factory

The required sequence is:

`Product specification -> UX/UI specification -> approved design -> engineering specification -> implementation -> QA -> release`

A design-generation agent must not implement code.

An engineering agent must not redesign an approved screen without an explicit change request.

A QA agent must evaluate implementation against the approved specification rather than redesigning the feature during testing.

## Change Discipline

Every material change must identify:

- Document or feature ID
- Version
- Reason
- Affected areas
- Validation performed
- Any follow-up work

## Foundation Gate

Until the repository foundation is formally released, agents must not introduce application implementation merely because an application directory or placeholder exists.
