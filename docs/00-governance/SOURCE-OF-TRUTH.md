# Source of Truth and Document Governance

**Document ID:** GOV-001
**Version:** 1.3
**Status:** Approved foundation

## Purpose

This document defines where developers, designers and future contributors should look for authoritative BukieBrainJobs requirements.

## Authority hierarchy

### 1. Product authority

Approved product decisions, Product Bible, PRD and feature specifications define what BukieBrainJobs is supposed to do and why.

### 2. Design authority

For web/PWA appearance, `.agents/skills/bukiebrainjobs-outlier-design-system/SKILL.md` is the current visual authority. `docs/specs/THEME-001-light-dark-toggle.md` governs theme behavior, including the dark default, light mode, persisted preference, and toggle placements. Native screen restyling is deferred. `DESIGN.md` and the original DS-001 through DS-012 direction are retained as historical source material, not current visual authority.

### 3. Feature authority

Approved feature and screen specifications define feature-level behavior, content, states, interactions and acceptance criteria.

### 4. Technical authority

The full-stack technical specification and approved engineering specifications define architecture, contracts, data, infrastructure, security and testing requirements.

### 5. Design implementation

Web/PWA appearance is implemented from the Outlier skill and current theme-aware tokens. Product flows and behavior come from approved feature specifications. Use `DESIGN.md` only as historical layout context where it does not conflict with current requirements.

### 6. Engineering implementation

Contributors implement the approved requirements. Code is not a higher authority than an approved specification.

## Conflict rule

If two sources conflict:

1. Identify the conflict.
2. Determine which source has higher authority.
3. Check the decision log for a newer approved decision.
4. Do not silently invent a compromise.
5. Record a new decision if the conflict requires a product or architectural change.

## Required reading before implementation

Before implementing a feature, read:

- `README.md`
- `AGENTS.md` (Development Standards)
- `CONTRIBUTING.md`
- `.agents/skills/bukiebrainjobs-outlier-design-system/SKILL.md` for web/PWA visual work
- `docs/specs/THEME-001-light-dark-toggle.md` for theme behavior or toggle placement
- The relevant product specification
- The relevant screen or UX specification
- The relevant technical specification
- Related decisions in `docs/00-governance/DECISION-LOG.md` and `docs/21-decision-log/`

Read `DESIGN.md` only when historical layout provenance is relevant. Do not treat its palette, typography, surfaces, or component prescriptions as current UI requirements.

## External project documents

The initial project source material was developed outside this repository. The repository is progressively becoming the durable source of truth. When a source document is copied or consolidated here, its version and provenance must be recorded.

Do not create multiple competing copies of the same specification without a clear canonical location.

## Status vocabulary

Use these statuses consistently:

- Draft
- In Review
- Approved
- Superseded
- Deprecated

Only Approved documents should be treated as implementation authority.

## Change control

Material changes to product behavior, architecture, security, data models, APIs or design foundations require a documented decision before implementation.
