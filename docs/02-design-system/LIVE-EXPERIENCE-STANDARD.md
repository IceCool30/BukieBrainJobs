# BukieBrainJobs Live Experience Standard

**Status:** Required for all customer-facing product work

## Purpose

This document makes the approved BukieBrainJobs product experience the practical baseline for customer-facing work. It governs task clarity, content, interaction, motion, accessibility, responsive behavior, and useful product patterns across public pages, marketplace flows, signed-in areas, PWA views, and native screens. It does not define current web/PWA visual tokens.

The approved homepage remains a reference for its photo treatment, information hierarchy, and mobile focus. It is not a source for site-wide tokens or a layout that every future screen must clone.

> For web/PWA appearance, use `.agents/skills/bukiebrainjobs-outlier-design-system/SKILL.md`. For theme mechanics and toggle placements, use THEME-001. This standard continues to govern product UX, accessibility, motion, and interaction quality.

## Required Skill

Before designing, writing, reviewing, or implementing customer-facing work, contributors must read the relevant sources:

- `.agents/skills/bukiebrainjobs-outlier-design-system/SKILL.md` for web/PWA appearance
- `docs/specs/THEME-001-light-dark-toggle.md` for theme behavior and toggle placement
- `docs/02-design-system/skills/bukiebrainjobs-experience-standards/SKILL.md` for general product UX and accessibility

The bundled experience skill defines the mandatory workflow, product-wide interaction rules, content-density standards, quality gates, and implementation guardrails. Customer-facing copy must also follow its bundled BukieBrainJobs content guide.

## Surface contexts

BukieBrainJobs ships one product on three surfaces. Experience quality must remain high on all three.

| Context | Meaning | UI expectation |
|---|---|---|
| Website | Desktop or mobile browser, not installed | Full responsive website. The homepage uses the compact shell below 768px and the full layout at desktop widths. |
| PWA | Installed or standalone web app only | Full product in a standalone shell. The homepage uses the compact shell in standalone mode. Detect standalone with `display-mode: standalone` or iOS `navigator.standalone`; viewport width is a separate PLAT-002 homepage-shell signal. |
| Native | Expo Android and iOS apps | Full product with native navigation and OS capabilities. Same journeys and outcomes as web and PWA. |

Do not build a reduced journey for any surface by policy. Layout and chrome may adapt. Core tasks must remain available.

The Outlier visual approval covers website and PWA screens. It does not authorize restyling native screens. Preserve existing native appearance until a separate native design scope is approved.

## Authority Order

| Priority | Authority | Use it for |
|---|---|---|
| 1 | Approved current live experience and implemented product patterns | Product task hierarchy, homepage-specific imagery, interactions, motion, responsive density, content decisions, marketplace states, and platform adaptation. It does not replace the Outlier visual authority. |
| 2 | `skills/bukiebrainjobs-experience-standards/SKILL.md` | Mandatory workflow, global standards, screen-purpose rules, quality gates, and implementation guardrails. |
| 3 | `.agents/skills/bukiebrainjobs-outlier-design-system/SKILL.md` and `docs/specs/THEME-001-light-dark-toggle.md` | Current website/PWA appearance, theme-aware tokens, dark default, light mode, saved preference, and toggle placements. |
| 4 | Approved product specifications | Product naming, marketplace behaviour, user journeys, and valid claims. |
| 5 | Feature-specific requirements that are explicitly approved | New behaviour or a justified extension of the design system. |

When sources conflict, do not silently choose an older document, generic pattern, or historical mockup over the live approved result. Identify the conflict, preserve the live baseline, and record the decision before implementing a material visual or interaction change.

## Official Marketplace Terminology

**BrainWorker** is the official customer-facing name for every person who offers services through BukieBrainJobs. Use it consistently in calls to action, navigation, profiles, onboarding, booking, service discovery, trust copy, and public metadata. Do not substitute “professional,” “worker,” “provider,” “artisan,” “technician,” “freelancer,” or “vendor” as the role identity. Use a specific trade only where it adds necessary context.

The approved homepage headline is a named exception that retains its exact deployed wording. It does not relax the BrainWorker identity rule elsewhere.

## Non-Negotiable Outcomes

Every screen must make one real BukieBrainJobs task clearer, safer, and easier to complete. Retain operational content and the information needed for the immediate decision. Move useful deeper detail to the relevant point in the flow or a clear deeper destination. Remove promotional repetition, decorative framing, generic AI-style copy, duplicate trust statements, unsupported claims, and unnecessary status clutter.

Future work must preserve a photo-led marketplace, clear task hierarchy, concise human content, accessible motion, truthful claims, responsive layouts, and maintainable implementation. Web/PWA appearance follows the Outlier skill and THEME-001. Native appearance remains outside this approval.

Future work must not introduce a disconnected design language, decorative motion, wide mobile blur bars, generic copy, unsupported trust claims, duplicated tokens, arbitrary colors, excessive abstractions, unscoped refactors, or a desktop layout merely compressed into mobile.

## How to Extend the Product

Use the live experience as a system to extend, not a screen to clone. Begin with the screen’s user, task, primary action, decision risk, platform, and necessary information. Inspect the nearest approved product pattern before adding a new visual or interaction treatment. Use progressive disclosure for detail that is not needed at the first decision.

A new reusable pattern requires explicit approval, relevant accessibility and responsive checks, and an update to the bundled live baseline before it is treated as a product standard. The bundled skill provides the required visual, motion, content, accessibility, performance, and code-quality checks before work is considered complete.
