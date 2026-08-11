# Source of Truth and Document Governance

**Document ID:** GOV-001
**Version:** 1.0
**Status:** Approved foundation

## Purpose

This document defines where agents, developers, designers and future contributors should look for authoritative BukieBrainJobs requirements.

## Authority hierarchy

### 1. Product authority

Approved product decisions, Product Bible, PRD and feature specifications define what BukieBrainJobs is supposed to do and why.

### 2. Design authority

`DESIGN.md` is the visual source of truth. Approved DS-001 through DS-012 artifacts formalize that system.

### 3. Feature authority

Approved feature and screen specifications define feature-level behavior, content, states, interactions and acceptance criteria.

### 4. Technical authority

`BukieBrainJobs — Full-Stack Technical Specification.md` and approved engineering specifications define architecture, contracts, data, infrastructure, security and testing requirements.

### 5. Design implementation

Google Antigravity is responsible for interpreting and implementing the visual layout directly from the approved project specifications and DESIGN.md. 

> [!NOTE]
> Google Stitch was previously used as an intermediate visual design tool. It is no longer a required part of the production workflow. Current UI design and implementation are performed directly by Google Antigravity using the approved project specifications and DESIGN.md.

### 6. Engineering implementation

Google Antigravity and human developers implement the approved requirements. Code is not a higher authority than an approved specification.


## Conflict rule

If two sources conflict:

1. Identify the conflict.
2. Determine which source has higher authority.
3. Check the decision log for a newer approved decision.
4. Do not silently invent a compromise.
5. Record a new decision if the conflict requires a product or architectural change.

## Required reading for agents

Before implementing a feature, read:

- `README.md`
- `AGENTS.md`
- `CONTRIBUTING.md`
- `DESIGN.md`
- The relevant product specification
- The relevant screen or UX specification
- The relevant technical specification
- Related decisions in `docs/21-decision-log/`

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
