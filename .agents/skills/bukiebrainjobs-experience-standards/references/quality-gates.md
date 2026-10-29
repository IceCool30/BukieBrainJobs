# BukieBrainJobs Experience Quality Gates

Use this checklist before presenting customer-facing work as complete. Treat a failed required check as a reason to fix the work, not as a cosmetic note.

## 1. Source and Scope

| Check | Pass condition |
|---|---|
| Current authority | Web/PWA appearance follows the Outlier skill, theme mechanics follow THEME-001, and product behavior follows approved feature specifications. |
| Screen purpose | The primary user, task, and action are explicit. |
| Platform intent | Web and PWA are designed for their context, not merely resized. Native visual restyling remains separately scoped. |
| Product truth | Visible claims match implemented and documented product behaviour. |

## 2. Visual Consistency

| Check | Pass condition |
|---|---|
| Tokens | Web/PWA colors and typography come from the Outlier skill and current CSS tokens. No competing palette is introduced. |
| Theme | Dark is the default, light remains supported, and the saved preference and existing toggle placements follow THEME-001. |
| Native scope | Do not apply web/PWA Outlier styling to native screens without a separate approval. |
| Surface language | Use theme-aware surfaces and the correct geometry for the context. Operational radii stay compact; marketing radii stay within their defined components. |
| Contrast and focus | Text, controls, and focus indicators meet applicable WCAG 2.2 AA requirements in both themes. |
| Imagery | Photos are purposeful, properly cropped, and keep people’s faces and work visible. |
| Page hierarchy | The primary action is evident before secondary detail. |
| Clutter | Every element supports a real task. Decorative information has been removed or moved to an appropriate detail page. |

## 3. Responsive and Mobile Quality

| Check | Pass condition |
|---|---|
| Mobile hierarchy | The mobile screen is direct and service-first. It does not replicate every desktop section. |
| Touch targets | Important controls are easy to tap and have visible touch feedback. |
| Overflow | No horizontal overflow, clipped dropdown, cropped critical text, or obscured control exists. |
| Header | Mobile scroll controls remain compact and blur-free. |
| Navigation | The homepage does not receive a bottom navigation bar unless the user explicitly approves a changed product rule. |
| Content density | Supporting detail is reduced where it does not help the immediate mobile task. |

## 4. Motion and Accessibility

| Check | Pass condition |
|---|---|
| Purpose | Every animation communicates discovery, focus, selection, navigation, or feedback. |
| Restraint | No auto-playing, looping, bouncing, parallax, or decorative motion distracts from the task. |
| Performance | Motion uses composited properties where possible and does not animate layout dimensions or create page shift. |
| Search | Suggestions open below the search field. Keyboard Escape dismisses the panel without clearing a typed query. |
| Reduced motion | `prefers-reduced-motion: reduce` leaves all content visible and usable. |
| Keyboard | Controls are focusable, focus indicators are visible, and drawers or panels close with Escape where appropriate. |
| Semantics | Interactive controls have accessible labels, images have meaningful alt text, and headings follow a logical hierarchy. |

## 5. Content and Trust

| Check | Pass condition |
|---|---|
| Voice | Copy is natural, concise, professional, direct, and action-oriented. |
| Terminology | `Customer`, `BrainWorker`, `Professional`, `Job`, `Service`, `Profile`, `Verification`, and `Escrow` are used correctly. |
| Claims | No invented counts, ratings, availability, guarantees, coverage, verification, payment protection, or safety claim appears. |
| Microcopy | Labels are explicit, actions are clear, and errors explain recovery. |
| Punctuation | No em dash is used in customer-facing copy. |

## 6. Engineering Quality

| Check | Pass condition |
|---|---|
| Minimalism | The implementation uses the smallest number of components, states, utilities, and dependencies necessary. |
| Reuse | Existing components, tokens, assets, and patterns are extended before inventing a parallel system. |
| Focus | Functions have a single clear responsibility. Complex logic is split before it becomes difficult to follow. |
| Control flow | The code uses early returns and avoids deep nesting or premature abstraction. |
| Comments | Comments explain a non-obvious reason or business constraint, not obvious code mechanics. |
| Validation | Relevant type checks, linting, and visual tests pass. |

## Delivery Record

Document these facts in the final delivery:

1. The active branch and commit, if code changed.
2. Which desktop and mobile sizes were checked.
3. Reduced-motion and keyboard outcomes when interactions changed.
4. Any fact that still needs product, legal, or content confirmation.
5. The deployed preview when deployment occurred.
