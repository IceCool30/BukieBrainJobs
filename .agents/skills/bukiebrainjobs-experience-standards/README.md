# BukieBrainJobs Experience Standards

Preserve and extend the approved live BukieBrainJobs product experience across web, PWA, and mobile apps.

This skill ensures that every BukieBrainJobs customer-facing screen feels like part of the approved product rather than a disconnected design experiment. It enforces the live visual system, motion language, accessibility rules, content hierarchy, and quality gates across desktop and mobile.

## What It Enforces

* **Live System Authority**: The live, verified running experience is the primary authority for visual hierarchy, imagery, surfaces, and spacing.
* **Calm Information Hierarchy**: Clean surfaces, restrained elevation, and high-contrast typography (minimum 4.5:1 ratio).
* **Purposeful Motion**: Transitions explain layout changes or confirm touch input. No decorative bouncing, perpetual loops, or ungrounded animations. Honors `prefers-reduced-motion`.
* **Approved Content Language**: Uses the bundled BukieBrainJobs content guide for marketplace terminology, trust language, and microcopy.
* **Strict Quality Gates**: Verifies layout integrity, responsive behavior, keyboard accessibility, and absence of generic placeholder content before delivery.

## Repository Structure

```
bukiebrainjobs-experience-standards-skill/
├── SKILL.md                          # Main agent runbook and rules
└── references/
    ├── BUKIEBRAINJOBS-CONTENT-GUIDE.md # Approved marketplace terminology and microcopy
    ├── live-approved-experience.md     # Visual system and live product patterns
    ├── quality-gates.md                # Delivery checklist and verification criteria
    └── validation-examples.md          # Real-world pass/fail patterns
```

## Installation

```bash
git clone https://github.com/IceCool30/bukiebrainjobs-experience-standards-skill.git
```

Place the folder or its contents in your agent skills directory (for example, `.agents/skills/bukiebrainjobs-experience-standards`).

## Usage

Load this skill whenever creating, reviewing, or refactoring customer-facing web pages, PWA views, native app screens, components, visual assets, or UI copy for BukieBrainJobs.
