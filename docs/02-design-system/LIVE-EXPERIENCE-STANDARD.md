# BukieBrainJobs Live Experience Standard

Status: Required for customer-facing product work

## Purpose

This document makes the approved, currently live BukieBrainJobs homepage experience the practical baseline for future customer-facing screens and pages. It prevents visual drift between the website, PWA, and future product surfaces.

> The live approved experience is the primary authority for how BukieBrainJobs should feel in use. Existing design documentation supports that experience only where it remains consistent with the approved live result.

## Required skill

Before designing, writing, reviewing, or implementing any customer-facing interface, agents must read:

`docs/02-design-system/skills/bukiebrainjobs-experience-standards/SKILL.md`

The bundled skill includes the companion BukieBrainJobs customer-content guide. Customer-facing copy must follow both documents.

## Authority order

| Priority | Authority | Use it for |
|---|---|---|
| 1 | Approved current live experience and its implemented homepage components | Visual hierarchy, imagery, interaction behavior, motion, responsive density, service-card presentation, and mobile PWA restraint. |
| 2 | `skills/bukiebrainjobs-experience-standards/SKILL.md` | The mandatory workflow, rules, quality gates, and implementation guardrails that preserve the live experience. |
| 3 | `DESIGN.md` and `DESIGN-CANONICALIZATION.md` | Approved tokens, typography, spacing, radius, grid, elevation, and visual accessibility constraints. |
| 4 | Approved product specifications | Product naming, marketplace behavior, user journeys, and valid claims. |
| 5 | Feature-specific requirements that are explicitly approved | New behavior or a justified extension of the design system. |

When sources conflict, do not silently choose an older document over the live approved result. Identify the conflict, preserve the live baseline, and record the decision before implementing a material visual or interaction change.

## Official marketplace terminology

**BrainWorker** is the official customer-facing name for every person who offers services through BukieBrainJobs. Use it consistently in calls to action, navigation, profiles, onboarding, booking, service discovery, trust copy, and public metadata. Do not substitute “professional,” “worker,” “provider,” “artisan,” “technician,” “freelancer,” or “vendor” as the role identity. Use a specific trade only where it adds necessary context.

## Non-negotiable outcomes

Future work must preserve a premium, photo-led marketplace experience; clear service-first mobile discovery; restrained navy, mint, and green use; concise human content; accessible motion; verified claims; responsive layouts; and maintainable implementation.

Future work must not introduce a disconnected design language, decorative motion, wide mobile blur bars, generic AI-style copy, unsupported trust claims, duplicated tokens, arbitrary colours, excessive abstractions, or unscoped refactors.

## How to extend the design

Use the live experience as a system to extend, not a screen to clone. A new screen should reuse the design grammar while meeting its specific job. The bundled skill provides the required visual, motion, content, accessibility, performance, and code-quality checks before work is considered complete.
