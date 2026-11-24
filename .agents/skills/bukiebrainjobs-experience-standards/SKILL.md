---
name: bukiebrainjobs-experience-standards
description: Preserve BukieBrainJobs product UX across customer-facing web pages, PWA views, native-app screens, components, interactions, motion, and copy. Enforces task clarity, accessibility, content standards, responsive behavior, and maintainable implementation. Current web/PWA visual tokens come from the Outlier design skill; native visual restyling remains separately scoped.
---

# BukieBrainJobs Experience Standards

## Purpose

Use this skill to keep every customer-facing BukieBrainJobs screen clear, truthful, accessible, responsive, and consistent with approved product behavior. The live homepage is a product-pattern reference, not the authority for current web/PWA visual tokens.

For web/PWA appearance, read `.agents/skills/bukiebrainjobs-outlier-design-system/SKILL.md`. Read `docs/specs/THEME-001-light-dark-toggle.md` for theme mechanics and `references/live-approved-experience.md` for product patterns. Read `references/BUKIEBRAINJOBS-CONTENT-GUIDE.md` before creating or revising customer-facing copy. Read `references/quality-gates.md` before delivery. Do not apply the web/PWA visual rollout to native screens without a separate approved scope.

## Authority Order

Resolve conflict in this order. Do not let older planning documents override the approved live result.

1. The user’s latest explicit direction.
2. Documented, implemented product behavior, legal requirements, accessibility requirements, and security requirements.
3. The Outlier skill for web/PWA appearance and THEME-001 for theme mechanics.
4. This skill for product UX, content density, accessibility, motion, and implementation quality.
5. The bundled content guide for customer-facing language.
6. Earlier design files and historical mockups as non-authoritative context.

If sources conflict, identify the conflict and ask for a decision before changing the approved experience.

## Required Workflow

1. Inspect the nearest equivalent live component on both desktop and mobile before writing code.
2. Identify the screen’s primary action, user type, and whether it is a website, PWA, or native-app context.
3. For web/PWA, follow Outlier for appearance and THEME-001 for theme behavior. Reuse approved product interactions without inventing a competing pattern.
4. Read the bundled content guide when changing visible language.
5. Build the smallest maintainable change that solves the screen’s core job.
6. Test the experience at desktop and mobile widths, with keyboard navigation and reduced motion enabled.
7. Compare the result with the quality gates before delivery. Flag any unresolved product or content fact.

## Visual Authority

Use the Outlier skill and current web tokens for exact web/PWA colors, typography, surfaces, radii, buttons, and responsive component styling. Preserve THEME-001's dark default, light theme, saved preference, and approved toggle placements.

This general experience skill does not define a second visual palette. It continues to govern task hierarchy, truthful content, accessibility, responsive behavior, and interaction quality. Keep text over photography readable, preserve useful imagery, and do not obscure operational content with effects.

Native apps continue to use native navigation and platform conventions. Preserve their existing appearance until a separate native visual scope is approved.

## Desktop and Mobile Must Share a System, Not a Layout

Use the same brand, typography, card language, imagery quality, and trust standards on every platform. Adapt the density and interaction model for each context.

| Context | Required behaviour |
|---|---|
| Desktop website | Use generous but purposeful whitespace, richer supporting context, image-led service cards, and pointer-aware hover feedback. |
| Mobile PWA or app | Prioritize service discovery, direct actions, compact hierarchy, and touch feedback. Use Outlier for PWA appearance. Preserve existing native visual styling until a separate native scope is approved. |
| Mobile homepage | Keep the hero compact and photo-led. Keep the fixed menu compact, solid navy, and blur-free. Do not add a bottom navigation bar to the homepage. |
| Responsive behaviour | Recompose the hierarchy for the viewport. Do not merely shrink the desktop page. Protect tap targets, text wrapping, card readability, and horizontal overflow. |

## Motion and Interaction Language

Use motion to explain state changes, improve touch confidence, and add premium polish. Never use it as decoration.

1. Reuse the existing shared motion tokens and utility classes before writing new animation CSS.
2. Keep interaction transitions short and controlled. Use the existing easing and timing vocabulary.
3. Use visible but restrained mobile section reveals only for meaningful discovery moments, such as a service grid entering the viewport.
4. Use concise press feedback on touch controls. Use hover elevation, image response, and directional affordances only inside pointer-capable media queries.
5. Animate opacity, transform, colour, shadow, and border colour. Do not animate layout dimensions, large page reflows, or scroll position for decoration.
6. Keep search results appearing below the field. Preserve keyboard dismissal with `Escape` without clearing an entered query.
7. Keep the mobile scroll header free of backdrop blur and broad translucent overlays.
8. Honour `prefers-reduced-motion: reduce`. Content must remain visible and usable with motion removed.

Do not add autoplaying media, perpetual loops, parallax that moves content independently of the user, bounce effects, large entrance animations, or animated backgrounds unless the user explicitly approves a specific product reason.

## Customer-Facing Content

Apply the bundled content guide as a mandatory companion standard. The guide governs visible copy, terminology, claims, trust language, microcopy, accessibility, and localization.

At minimum, ensure that every customer-facing change:

- Uses clear, human, professional, action-oriented language.
- Uses `Customer`, `BrainWorker`, `Professional`, `Job`, `Service`, `Profile`, `Verification`, and `Escrow` accurately.
- Avoids em dashes, filler, generic AI-sounding descriptions, and unsupported absolute claims.
- Does not invent availability, safety, verification, rating, coverage, payment, or outcome claims.
- States the next action clearly and uses meaningful labels and link text.

Preserve the approved homepage hero headline unless the user explicitly asks to change it:

> Book a skilled local or remote worker in minutes or find flexible work that pays what you are worth only on BukieBrainJobs

## Implementation Standards

Write pragmatic, minimal code that is safe to maintain as the product grows.

1. Prefer existing components, tokens, native platform capabilities, and straightforward composition.
2. Avoid premature abstractions, design-pattern layers, duplicated styling systems, and one-off utility files.
3. Keep functions focused. Split a function that grows beyond one clear responsibility or roughly 25 lines.
4. Prefer early returns and flat control flow. Avoid deeply nested conditionals and state chains.
5. Use semantic HTML, accessible names, visible focus states, and keyboard-safe interactions.
6. Never solve a visual issue by hiding content, lowering contrast, or making an interaction inaccessible.
7. Add comments only to explain non-obvious reasoning or product constraints. Do not narrate obvious code.
8. Use real product data and assets where available. Do not leave customer-visible placeholders or invented social proof.
9. Preserve Next.js, React, and Tailwind conventions already established in the application. Do not introduce a library solely for small interaction polish.

## Mandatory Quality Gates

Before presenting work as complete, verify all relevant items below.

| Area | Verify |
|---|---|
| Source authority | The implementation matches the current approved live experience and does not follow a conflicting historical mockup. |
| Visual consistency | Colour, type, radii, imagery, surfaces, and spacing feel native to the approved homepage. |
| Responsive quality | The desktop and mobile versions share a system but are each designed for their actual context. |
| Motion | Motion clarifies interaction, respects reduced motion, and does not create blur, layout shift, or distraction. |
| Accessibility | Keyboard paths, focus visibility, readable contrast, labels, and touch targets are preserved. |
| Content | The content guide has been applied and no unsupported claims or generic filler remain. |
| Engineering | Type checks pass, changed code is focused, and no avoidable duplication or spaghetti logic has been introduced. |
| Verification | Inspect the deployed or local result on desktop and mobile before reporting completion. |

## Reference Map

| Reference | Read when |
|---|---|
| `references/live-approved-experience.md` | Starting any visual, interaction, responsive, or motion work. |
| `references/BUKIEBRAINJOBS-CONTENT-GUIDE.md` | Creating or revising visible copy, labels, notifications, onboarding, errors, or trust language. |
| `references/quality-gates.md` | Performing implementation review or preparing delivery. |

Do not dilute the approved BukieBrainJobs experience to follow a trend. Make future pages clearer, more useful, and more coherent by extending the live system with the same restraint.
