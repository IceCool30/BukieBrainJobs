# BukieBrainJobs Canonical Documentation Consolidation Plan

**Document ID:** GOV-006
**Version:** 1.0
**Status:** Historical plan; current hierarchy is in SOURCE-OF-TRUTH.md and DS-013

> Current web/PWA appearance follows the Outlier skill. THEME-001 governs theme mechanics. This plan preserves the original source-consolidation decisions only.

## Purpose

This document defines how project source material becomes canonical repository documentation before application implementation begins.

## Authority Order

1. Product decisions and approved specifications maintained in the repository.
2. `DESIGN.md` as historical visual source material and brand provenance; current web/PWA appearance follows the Outlier skill.
3. DS-001 through DS-012 as historical v1.0 records; DS-013 and THEME-001 govern current web/PWA visuals and theme behavior.
4. Approved WEB specifications and subsequent module specifications.
5. The Full-Stack Technical Specification for engineering requirements.
6. Marketplace research and the TaskRabbit playbook for strategic context and comparative guidance.
7. Historical conversation exports and branch summaries are reference material only.

## Consolidation Rules

- Do not treat a conversation transcript as a specification.
- Do not create duplicate specifications in multiple directories.
- Preserve approved terminology and decision IDs.
- Preserve source versions when importing large authoritative documents.
- Record any reconciliation as an explicit decision instead of silently changing source material.
- Do not introduce application code while the foundation gate is closed.
- Every agent-facing instruction must identify the source documents it is allowed to use.

## Canonicalization Workstreams

### Product

- Product Foundation
- Product Bible
- PRD
- Operating Charter
- Roadmap
- Marketplace strategy and research register

### Design

- `DESIGN.md` as historical visual source material
- DS-001 through DS-012 as historical v1.0 design records
- DS-013 Outlier skill and THEME-001 for current web/PWA appearance and theme mechanics
- Design tokens
- Component specifications

### Experience

- Information architecture
- Screen catalog
- Public Website specifications
- Authentication and role-based journeys
- Customer, BrainWorker, Corporate and Admin experiences

### Engineering

- Full-Stack Technical Specification
- Architecture baseline
- API catalogue
- Database model
- Authentication and authorization
- Payments
- Messaging and notifications
- Background jobs
- Infrastructure

### Quality

- Security baseline
- Accessibility standards
- QA baseline
- Release baseline
- Observability and incident procedures

### Agent Operations

- `AGENTS.md`
- [DEPRECATED] Stitch prompts
- Antigravity prompts
- QA prompts
- Feature Factory workflow

## Foundation Gate

The foundation is ready for application implementation only when the canonical documentation set has been reviewed, indexed, and verified against the source register.

Until then, agents must not infer missing requirements from repository structure, historical summaries, or general product assumptions.
