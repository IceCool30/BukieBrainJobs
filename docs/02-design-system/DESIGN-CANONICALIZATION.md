# BukieBrainJobs Design Canonicalization

Status: Canonical guidance
Version: 2.0
Approved: 29 October 2026

## Purpose

This document identifies the current design authority and separates visual rules from product behavior. It supersedes earlier design canonicalization statements that assigned visual authority to `DESIGN.md` or the Trades design skill.

## Authority

For website and PWA appearance, use `.agents/skills/bukiebrainjobs-outlier-design-system/SKILL.md`. It defines the current Outlier tokens, typography, surfaces, radii, button shapes, imagery treatment, and responsive visual rules. The implementation in `apps/web/app/globals.css` is the source for exact token values.

Use `docs/specs/THEME-001-light-dark-toggle.md` for theme behavior. The site remains dark by default, supports light mode, stores the selection under `bbj_theme_mode`, and keeps the already approved toggle placements. THEME-001 does not replace the Outlier visual skill.

Use approved product and feature specifications for routes, language, task flows, states, validation, and acceptance criteria. Use `docs/02-design-system/LIVE-EXPERIENCE-STANDARD.md` and its bundled skill for task clarity, accessibility, content density, motion, and interaction quality.

Native screen restyling is deferred. Do not apply the web/PWA Outlier treatment to native screens without a separate approved scope.

## Historical material

The original `DESIGN.md`, the former DS-001 through DS-012 visual direction, the retired Trades skill, its HTML reference pages, and older screen-specific color examples remain in the repository for provenance. They are not current sources for web/PWA colors, typography, surfaces, component appearance, or theme policy.

Older feature and UX specifications remain useful for their product requirements. Their original routes, behavior, content, states, and acceptance criteria remain in force unless superseded by an approved decision. Any conflicting palette, radius, or styling examples are historical and must not override the Outlier skill.

`DESIGN.md` may be consulted for layout history only where its guidance does not conflict with the Outlier skill, THEME-001, current source code, or approved product requirements.

## Visual implementation rules

Use theme-aware shared tokens and existing components. The Outlier skill is the single detailed source for exact values, including coral accents, accessible light-theme contrast, the navy desktop navigation, fixed light text over photography, pill-shaped marketing CTAs, and compact operational radii.

Do not create a second palette, force a theme toggle onto every route, remove light mode, or use global overflow clipping to hide a layout defect. Preserve existing text, content hierarchy, behavior, and product logic unless the approved feature specification says otherwise.

## BukieBrainJobs terminology

The following product terms remain canonical:

| Legacy source language | BukieBrainJobs meaning |
|---|---|
| Candidate | BrainWorker, when referring to a service professional |
| Employer or recruiter | Customer or business customer, according to the feature specification |
| Apply Now | Book a Service, Request Service, or another approved flow action |
| Job opportunity | Service opportunity or job opportunity, according to the approved marketplace flow |
| Elite Professional Ledger | Not a BukieBrainJobs product name |

Do not copy legacy recruitment terminology into current interfaces merely because it appears in an older visual reference.

## Conflict rule

When sources disagree, first identify whether the conflict concerns appearance, theme behavior, or product behavior. Use the Outlier skill for web/PWA appearance, THEME-001 for theme mechanics, and the approved feature specification for product behavior. Record a new decision when those authorities need to change. Do not silently invent a compromise.
