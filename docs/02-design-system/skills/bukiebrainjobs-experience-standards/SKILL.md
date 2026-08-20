---
name: bukiebrainjobs-experience-standards
description: Preserve and extend the approved live BukieBrainJobs product experience. Use whenever creating, modifying, reviewing, or refactoring any customer-facing BukieBrainJobs web page, PWA view, native-app screen, component, visual asset usage, interaction, animation, or UI copy. Enforces the live visual system, motion language, accessibility, content standards, and maintainable implementation rules across desktop and mobile.
---

# BukieBrainJobs Experience Standards

## Purpose

Use this skill to make every future BukieBrainJobs customer-facing screen feel like part of the currently approved product, not a separate design exercise. Treat the **live, verified homepage experience** as the primary authority for visual hierarchy, imagery, surfaces, spacing, motion, and mobile restraint.

Read `references/live-approved-experience.md` before proposing or implementing UI work. Read `references/BUKIEBRAINJOBS-CONTENT-GUIDE.md` before creating or revising customer-facing copy. Read `references/quality-gates.md` before delivery.

## Authority Order

Resolve conflict in this order. Do not let older planning documents override the approved live result.

1. The current approved, deployed BukieBrainJobs experience and the active feature-branch implementation.
2. The user’s latest explicit direction.
3. Documented, implemented product behavior, legal requirements, accessibility requirements, and security requirements.
4. The bundled content guide for customer-facing language.
5. Earlier design files and historical mockups, only when they agree with the current live result.

If sources conflict, identify the conflict and ask for a decision before changing the approved experience.

## Required Workflow

1. Inspect the nearest equivalent live component on both desktop and mobile before writing code.
2. Identify the screen’s primary action, user type, and whether it is a website, PWA, or native-app context.
3. Reuse the live visual and motion language. Do not invent a competing style or pattern.
4. Read the bundled content guide when changing visible language.
5. Build the smallest maintainable change that solves the screen’s core job.
6. Test the experience at desktop and mobile widths, with keyboard navigation and reduced motion enabled.
7. Compare the result with the quality gates before delivery. Flag any unresolved product or content fact.

## Visual System

Use the live experience as the pattern, not as a rigid collection of copied layouts.

| Element | Required direction |
|---|---|
| Page canvas | Use the quiet off-white base `#F8F9FF` for ordinary page surfaces. |
| Primary brand colour | Use navy `#001A41` for headings, primary actions, focused states, and controlled hero depth. |
| Supporting brand colour | Use green `#296A4B` for selected links and restrained secondary emphasis. |
| Highlight colour | Use mint `#ABEEC8` for focus rings, short highlights, and limited accents. |
| Colour restraint | Keep dense navy primarily in the header, hero, footer, and deliberate primary actions. Do not use full-brand-colour section backgrounds by default. |
| Typography | Preserve the implemented display and body font roles. Use concise, high-contrast headings and readable body text. Do not introduce an unrelated typeface. |
| Geometry | Use the live compact radius language, usually `rounded-xl` or `rounded-2xl` where the current components use it. Do not default to pills or over-rounded containers. |
| Cards | Use honest white surfaces, thin neutral borders, restrained navy-tinted elevation, clear internal spacing, and real imagery when the service or person benefits from it. |
| Imagery | Let photos carry visual interest. Keep artisan faces, key work, product context, and text unobscured. Use `object-cover` only with intentional focal positioning. |
| Effects | Prefer clean layering, soft shadows, and contrast. Do not add broad glass effects, heavy gradients, decorative glow, or blur over operational content. |

Maintain a calm information hierarchy. Every screen should make the primary benefit, primary action, supporting information, and secondary actions easy to distinguish.

## Desktop and Mobile Must Share a System, Not a Layout

Use the same brand, typography, card language, imagery quality, and trust standards on every platform. Adapt the density and interaction model for each context.

| Context | Required behaviour |
|---|---|
| Desktop website | Use generous but purposeful whitespace, richer supporting context, image-led service cards, and pointer-aware hover feedback. |
| Mobile PWA or app | Prioritize service discovery, direct actions, compact hierarchy, and touch feedback. Remove supporting material that does not help the immediate task. |
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
- Uses `BrainWorker` as the mandatory customer-facing name for any person who offers services on the platform. Do not use `professional`, `worker`, `provider`, `artisan`, `technician`, `freelancer`, or `vendor` as a substitute identity label. Use a trade or skill only when it gives necessary context, such as “electrician” or “plumber.”
- Uses `Customer`, `Job`, `Service`, `Profile`, `Verification`, and `Escrow` accurately.
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
