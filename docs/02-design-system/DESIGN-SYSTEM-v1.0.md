# BukieBrainJobs Design System v1.0

**Document ID:** DS-000
**Version:** 1.0
**Status:** Locked

## Authority

The root `DESIGN.md` remains the visual source of truth. This document records the approved design-system status and directs agents to the individual DS artifacts when those are consolidated into this repository.

## Approved artifacts

| ID | Artifact | Status |
|---|---|---|
| DS-001 | Brand Identity | Approved |
| DS-002 | Logo System | Approved |
| DS-003 | Color System | Approved |
| DS-004 | Typography System | Approved |
| DS-005 | Grid and Layout System | Approved |
| DS-006 | Spacing System | Approved |
| DS-007 | Iconography System | Approved |
| DS-008 | Component Library Foundation | Approved |
| DS-009 | Motion System | Approved |
| DS-010 | Accessibility Standards | Approved |
| DS-011 | Design Token System | Approved |
| DS-012 | Final Design System Review | Approved |

## Core visual rules

- Corporate Modern direction
- Premium Minimalism
- Deep Navy as primary brand and action system
- Emerald as strategic emphasis and success signal
- Hanken Grotesk for display and headings
- Inter for body and interface content
- 12-column desktop grid
- 8-column tablet grid
- 4-column mobile grid
- 1280px maximum content container
- 24px standard gutters
- 8px primary spacing rhythm with approved 4px micro-unit
- Approved radius and elevation system
- Outline-first, rounded iconography
- Subtle, purposeful motion
- WCAG 2.2 AA accessibility target

## Product adaptation

The original visual source contains recruitment-oriented examples. BukieBrainJobs retains the visual system while adapting product terminology to the marketplace domain.

Examples:

| Generic / source example | BukieBrainJobs |
|---|---|
| Candidate | BrainWorker |
| Employer | Client |
| Job Listing | Service / Job |
| Apply Now | Book a Service |
| Recruitment Dashboard | Booking Dashboard |

## Token conflict resolution

An older technical specification example maps green as a generic `primary` token. That mapping is not authoritative for BukieBrainJobs.

The approved mapping is:

- Primary brand/action: Deep Navy `#001A41`
- Strategic emphasis/success: Emerald `#296A4B`

The engineering token package must follow this approved semantic mapping.

## Design gate

No screen may introduce a new foundational visual rule without an explicit design-system revision and decision record.
