# Development Ready Baseline

Status: READY FOR DEVELOPMENT
Version: 1.0

## Purpose

This document supersedes any earlier interpretation that the repository itself must remain closed to developer commits while canonical documentation is being expanded.

The repository is now safe to use as the development baseline. Application implementation may proceed on normal feature branches, provided each feature follows the approved specification and review workflow.

## What remains protected

Development readiness does not authorize agents to invent missing product requirements.

The following remain mandatory:

- Approved product specifications govern product behavior.
- `DESIGN.md` plus `docs/02-design-system/DESIGN-CANONICALIZATION.md` govern visual design.
- The approved technical specification governs architecture.
- Historical research is not implementation authority.
- Missing or contradictory requirements must be surfaced before consequential implementation.
- Secrets and production credentials must never enter source control.
- Feature branches and pull requests must be used for substantive implementation work.

## Source consolidation status

The repository contains governance, product summaries, design governance, architecture references, QA, security, deployment guidance and agent controls. Some long-form source artifacts remain represented by canonical registers and source references rather than duplicated verbatim copies.

This is a documentation-maintenance item, not permission to invent requirements.

## Development workflow

```text
Approved feature specification
        ↓
UX / UI specification
        ↓
Approved Stitch design
        ↓
Engineering specification
        ↓
Feature branch
        ↓
Implementation
        ↓
Tests
        ↓
Security / accessibility review
        ↓
Pull request
        ↓
Human approval
        ↓
main
```

## Branch rule

Do not commit substantive application changes directly to `main`.

Use a descriptive feature or fix branch and open a pull request.

## Final authority rule

Repository structure and governance must never become a substitute for the actual approved product decision. When a required detail is not present, stop and identify the gap.
