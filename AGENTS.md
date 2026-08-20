# BukieBrainJobs Development Standards

This file defines the standards every contributor must follow when working in this repository.

## Before changing anything

1. Read `README.md`.
2. Read `CONTRIBUTING.md`.
3. Read `docs/00-governance/SOURCE-OF-TRUTH.md`.
4. Read `docs/00-governance/LEGACY-SOURCE-BOUNDARY.md`.
5. Read `docs/02-design-system/DESIGN-CANONICALIZATION.md` when the task touches visual design.
6. Read `docs/02-design-system/LIVE-EXPERIENCE-STANDARD.md` and its bundled skill before any customer-facing design, copy, motion, or interface implementation.
7. Select and read any specialist skill that matches the task, including testing and browser-runtime verification where the change needs it.
8. Read the relevant product, design and technical specifications for the task.
9. Inspect the existing repository before creating files or changing architecture.
10. Check the decision log for related decisions.

## Authority

Do not invent requirements when an approved project document already defines them.

The approved live BukieBrainJobs experience governs the practical baseline for all customer-facing product work, including public pages, marketplace flows, booking, profiles, onboarding, customer and BrainWorker areas, PWA views, native-app screens, visual hierarchy, imagery, interaction behaviour, motion, responsive density, and customer-facing copy. `docs/02-design-system/LIVE-EXPERIENCE-STANDARD.md` and its bundled skill define how to preserve and extend that baseline.

`DESIGN.md` governs supporting visual tokens and visual language. Its legacy product-language passages are governed by `docs/02-design-system/DESIGN-CANONICALIZATION.md`.

Approved BukieBrainJobs product specifications govern product behavior, terminology and user experience.

The approved technical specification governs architecture unless a newer, explicitly approved technical decision supersedes it.

Historical research and project exports are context, not current product authority.

## Required behavior

- Keep changes scoped to the requested task.
- Reuse approved components and packages.
- Put shared contracts and business rules in shared packages where the architecture requires them.
- Keep secrets out of source control.
- Add or update focused tests for changed behavior. For a bug, add a reproduction test before the fix.
- Verify browser-facing work in a real browser or the strongest available equivalent, with visual and runtime evidence recorded proportionately.
- Preserve accessibility requirements.
- Preserve responsive behavior.
- Update documentation when behavior, architecture or decisions change.
- Record material architectural decisions before implementing them.

## Do not

- Start implementation from a vague feature request when a specification is missing.
- Treat historical terminology or research as current product requirements.
- Change the technology stack silently.
- Introduce a new design language or override the approved live experience without an explicitly recorded decision.
- Duplicate shared types or validation rules between apps.
- Add arbitrary colors or typography values when a design token exists.
- Commit generated secrets, local environment files or credentials.
- Perform broad refactors unrelated to the task.
- Delete documentation to make a task appear complete.

## Feature workflow

```text
Product decision
  -> Product specification
  -> Applicable skills and product context
  -> UX/UI requirements (DESIGN.md)
  -> Focused proof of changed behaviour
  -> Design and implementation
  -> Tests and browser-runtime verification where relevant
  -> Security / accessibility / performance review
  -> Preview deployment
  -> Human approval
  -> Merge to main
```

If a required artifact is missing, stop and identify the gap rather than guessing.

## Completion report

For every substantive change, report:

- What changed
- Why it changed
- Files affected
- Tests run
- Security considerations
- Accessibility considerations
- Documentation updated
- Known limitations
