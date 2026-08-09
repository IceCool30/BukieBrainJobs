# BukieBrainJobs Foundation Release Gate

**Status:** BLOCKED
**Purpose:** Prevent application implementation until the project documentation can serve as a reliable handoff point for humans and AI agents.

## Release conditions

All conditions below must be true before the gate can change to `RELEASED`.

### Governance

- [ ] Source-of-truth hierarchy is complete and discoverable.
- [ ] Agent operating policy is current.
- [ ] Repository structure and development workflow are current.
- [ ] Decision log contains all material architectural/design conflicts.

### Product

- [ ] Product foundation is present.
- [ ] Roadmap is present.
- [ ] Approved screen specifications are registered.
- [ ] Out-of-scope boundaries are documented.

### Design

- [ ] `DESIGN.md` is present and authoritative.
- [ ] DS-001 through DS-012 are physically present or formally verified as mirrored.
- [ ] Design tokens and accessibility rules are consistent with the approved design system.
- [ ] No unresolved visual-system conflict remains that an implementation agent could reasonably misinterpret.

### Engineering

- [ ] Full technical specification is physically consolidated or independently verified section by section.
- [ ] Sections 01-27 have canonical destinations and verification status.
- [ ] Architecture guardrails are explicit.
- [ ] API, database, state-machine, authentication, payments, real-time, jobs, infrastructure, testing, and secrets requirements are discoverable.

### Operations

- [ ] Security baseline is present.
- [ ] QA baseline is present.
- [ ] Release/deployment baseline is present.
- [ ] Environment and secrets policy is present.

### Agent handoff

- [ ] Antigravity can identify the files it must read before implementation.
- [ ] Stitch can identify the visual authority and approved design artifacts.
- [ ] Agents are explicitly forbidden from inventing missing requirements.
- [ ] Agents are explicitly forbidden from bypassing approval gates.

## Release decision

The gate may be changed to `RELEASED` only after a verification pass records evidence for every checked item.

Until then:

**Application code must not be introduced into the repository as part of foundation work.**

## Required evidence

The final release record must identify:

- Commit or tag containing the verified foundation.
- Source files checked.
- Artifact versions checked.
- Known conflicts and their approved resolution.
- Outstanding risks accepted for implementation.
- Person responsible for the release decision.

This gate is intentionally stricter than a simple documentation checklist. The purpose is to make the repository dependable as the company's permanent engineering handoff point.