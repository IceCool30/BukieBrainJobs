# BukieBrainJobs Canonical Documentation Consolidation Plan

**Document ID:** GOV-006
**Version:** 1.0
**Status:** Active

## Purpose

This document defines how project source material becomes canonical repository documentation before application implementation begins.

## Authority Order

1. Product decisions and approved specifications maintained in the repository.
2. `DESIGN.md` for visual source material and brand rules.
3. Approved DS-001 through DS-012 records for the Design System.
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

- `DESIGN.md`
- DS-001 through DS-012
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
