# Implementation Handoff

Status: NOT AUTHORIZED

This document defines what must be true before application implementation begins.

## Required handoff package

An implementation agent must be able to begin from the repository alone and identify:

- Product requirements and scope.
- Approved design authority.
- Approved screen and component specifications.
- Technical architecture and stack versions.
- Data model and API contracts.
- Authentication and authorization rules.
- Security and privacy requirements.
- QA and acceptance criteria.
- Deployment and environment rules.
- Agent execution policy.
- Current decisions and unresolved risks.

## Agent start procedure

1. Read `AGENTS.md`.
2. Read `docs/00-governance/SOURCE-OF-TRUTH.md`.
3. Read the current foundation status and release gate.
4. Read only the product, design, and engineering specifications relevant to the requested task.
5. Verify that the requested feature has an approved specification.
6. Stop if the source set is missing, contradictory, or materially ambiguous.
7. Do not infer business rules from screenshots alone.
8. Do not create a second source of truth.
9. Implement only within the approved scope after the foundation gate is released.

## Current restriction

The repository foundation is still being consolidated. This handoff document therefore does not authorize coding. It defines the future handoff contract only.
