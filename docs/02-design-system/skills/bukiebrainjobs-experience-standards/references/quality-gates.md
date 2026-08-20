# BukieBrainJobs Experience Quality Gates

Use this checklist before presenting customer-facing work as complete. Treat a failed required check as a reason to fix the work, not as a cosmetic note.

## 1. Source and Scope

| Check | Pass condition |
|---|---|
| Live-first authority | The work extends the currently approved live experience rather than an obsolete mockup or generic pattern. |
| Screen purpose | The primary user, task, and action are explicit. |
| Platform intent | Desktop, PWA, and app versions have been designed for their own context, not merely resized. |
| Product truth | Visible claims match implemented and documented product behaviour. |

## 2. Visual Consistency

| Check | Pass condition |
|---|---|
| Colour | Navy, green, mint, and off-white are used with the approved restraint. |
| Typography | The existing display and body roles are preserved. No unrelated typeface is introduced. |
| Surface language | Cards use clear white surfaces, compact corners, subtle borders, and controlled depth. |
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
| Terminology | `BrainWorker` is the sole customer-facing identity label for a service provider. `Customer`, `Job`, `Service`, `Profile`, `Verification`, and `Escrow` are used correctly. |
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
