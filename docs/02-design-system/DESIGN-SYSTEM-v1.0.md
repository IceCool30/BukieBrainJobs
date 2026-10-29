# BukieBrainJobs Design System v1.0

**Document ID:** DS-000
**Version:** 1.0
**Status:** Historical v1.0 record; visual rules superseded for web/PWA

> **Current authority, 29 October 2026:** Preserve this file as a record of the original v1.0 foundation. For current website and PWA appearance, use `.agents/skills/bukiebrainjobs-outlier-design-system/SKILL.md`. For dark-default/light-mode behavior, preference persistence, and toggle placements, use `docs/specs/THEME-001-light-dark-toggle.md`. Native visual restyling remains separately scoped.

## Authority

This section records the original v1.0 authority arrangement. `DESIGN.md` is now historical visual reference, not the current web/PWA source. The Outlier skill and THEME-001 are the current visual and theme authorities.

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

## Historical Core Visual Rules

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

## Historical Token Conflict Resolution

An older technical specification example maps green as a generic `primary` token. That mapping is not authoritative for BukieBrainJobs.

The approved mapping is:

- Primary brand/action: Deep Navy `#001A41`
- Strategic emphasis/success: Emerald `#296A4B`

The engineering token package followed this v1.0 mapping at the time. Current web/PWA token values and roles are defined by the Outlier skill and `apps/web/app/globals.css`.

## Design gate

No screen may introduce a new foundational visual rule without an explicit design-system revision and decision record.
