# BukieBrainJobs Live Experience Standard

**Status:** Required for all customer-facing product work

## Purpose

This document makes the approved, currently live BukieBrainJobs experience the practical baseline for the entire customer-facing product. It governs future public website pages, search, service discovery, booking, job posting, BrainWorker profiles and onboarding, customer and BrainWorker areas, enterprise and support pages, PWA views, native-app screens, shared components, visual assets, interactions, motion, and visible copy.

The approved homepage is the clearest current reference for visual restraint, image treatment, information hierarchy, and mobile focus. It is a product-quality reference, not a layout that every future screen must clone.

> The live approved experience is the primary authority for how BukieBrainJobs should feel in use. Existing design documentation supports that experience only where it remains consistent with the approved live result.

## Required Skill

Before designing, writing, reviewing, or implementing any customer-facing work, contributors must read:

`docs/02-design-system/skills/bukiebrainjobs-experience-standards/SKILL.md`

The bundled skill defines the mandatory workflow, product-wide visual and interaction rules, content-density standards, quality gates, and reference map. Customer-facing copy must also follow its bundled BukieBrainJobs content guide.

## Surface contexts

BukieBrainJobs ships one product on three surfaces. Experience quality must remain high on all three.

| Context | Meaning | UI expectation |
|---|---|---|
| Website | Desktop or mobile browser, not installed | Full responsive website. The homepage uses the compact shell below 768px and the full layout at desktop widths. |
| PWA | Installed or standalone web app only | Full product in a standalone shell. The homepage uses the compact shell in standalone mode. Detect standalone with `display-mode: standalone` or iOS `navigator.standalone`; viewport width is a separate PLAT-002 homepage-shell signal. |
| Native | Expo Android and iOS apps | Full product with native navigation and OS capabilities. Same journeys and outcomes as web and PWA. |

Do not build a reduced journey for any surface by policy. Layout and chrome may adapt. Core tasks must remain available.

## Authority Order

| Priority | Authority | Use it for |
|---|---|---|
| 1 | Approved current live experience and approved implemented product patterns | Visual hierarchy, imagery, interaction behaviour, motion, responsive density, content decisions, service flows, marketplace states, and platform adaptation. |
| 2 | `skills/bukiebrainjobs-experience-standards/SKILL.md` | Mandatory workflow, global standards, screen-purpose rules, quality gates, and implementation guardrails. |
| 3 | `DESIGN.md` and `DESIGN-CANONICALIZATION.md` | Approved tokens, typography, spacing, radius, grid, elevation, and visual accessibility constraints. |
| 4 | Approved product specifications | Product naming, marketplace behaviour, user journeys, and valid claims. |
| 5 | Feature-specific requirements that are explicitly approved | New behaviour or a justified extension of the design system. |

When sources conflict, do not silently choose an older document, generic pattern, or historical mockup over the live approved result. Identify the conflict, preserve the live baseline, and record the decision before implementing a material visual or interaction change.

## Official Marketplace Terminology

**BrainWorker** is the official customer-facing name for every person who offers services through BukieBrainJobs. Use it consistently in calls to action, navigation, profiles, onboarding, booking, service discovery, trust copy, and public metadata. Do not substitute “professional,” “worker,” “provider,” “artisan,” “technician,” “freelancer,” or “vendor” as the role identity. Use a specific trade only where it adds necessary context.

The approved homepage headline is a named exception that retains its exact deployed wording. It does not relax the BrainWorker identity rule elsewhere.

## Non-Negotiable Outcomes

Every screen must make one real BukieBrainJobs task clearer, safer, and easier to complete. Retain operational content and the information needed for the immediate decision. Move useful deeper detail to the relevant point in the flow or a clear deeper destination. Remove promotional repetition, decorative framing, generic AI-style copy, duplicate trust statements, unsupported claims, and unnecessary status clutter.

Future work must preserve a premium, photo-led marketplace experience; clear platform-appropriate task hierarchy; restrained navy, mint, and green use; concise human content; accessible motion; verified claims; responsive layouts; and maintainable implementation.

Future work must not introduce a disconnected design language, decorative motion, wide mobile blur bars, generic copy, unsupported trust claims, duplicated tokens, arbitrary colours, excessive abstractions, unscoped refactors, or a desktop layout merely compressed into mobile.

## How to Extend the Product

Use the live experience as a system to extend, not a screen to clone. Begin with the screen’s user, task, primary action, decision risk, platform, and necessary information. Inspect the nearest approved product pattern before adding a new visual or interaction treatment. Use progressive disclosure for detail that is not needed at the first decision.

A new reusable pattern requires explicit approval, relevant accessibility and responsive checks, and an update to the bundled live baseline before it is treated as a product standard. The bundled skill provides the required visual, motion, content, accessibility, performance, and code-quality checks before work is considered complete.
