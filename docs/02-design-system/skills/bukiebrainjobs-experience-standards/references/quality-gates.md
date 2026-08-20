# BukieBrainJobs Experience Quality Gates

Use this checklist before presenting any customer-facing BukieBrainJobs work as complete. Apply the checks relevant to the changed screen, component, flow, platform, or copy. A failed required check is a reason to fix the work, not a cosmetic note.

## 1. Source, Scope, and Product Purpose

| Check | Pass condition |
|---|---|
| Live-first authority | The work extends the current approved product rather than an obsolete mockup, generic trend, or unapproved parallel pattern. |
| User and task | The primary user, task, decision risk, and primary action are explicit. |
| Platform intent | Website, PWA, and native-app variants are adapted to their own context, not merely resized. |
| Comparable pattern | The nearest approved component or flow was reviewed before introducing a new interaction, visual treatment, or copy convention. |
| Product truth | Visible claims match implemented and documented product behaviour. Unknown facts are flagged rather than invented. |
| Change control | A reusable new pattern is recorded in the live baseline and validation examples after approval. |

## 2. Decision Architecture and Content Density

| Check | Pass condition |
|---|---|
| Primary task | The screen makes one meaningful next action clear before secondary detail. |
| Element purpose | Every visible heading, line, badge, statistic, image, reassurance, and CTA is operational, decision-supporting, legally required, or necessary for accessibility. |
| Progressive disclosure | Useful deeper detail appears at the relevant decision point or through a meaningful link, without hiding material terms or required consent. |
| Repetition | Generic taglines, decorative labels, duplicate trust language, status clutter, and stacked explanations have been removed or consolidated. |
| Copy test | Retained visible language answers what it means, why it matters now, and what the person should do next. |
| Action clarity | Primary and secondary actions are explicit, mutually distinguishable, and use one consistent name for the same outcome. |
| State clarity | Empty, loading, error, success, unavailable-market, and permission states explain the current situation and recovery path. |

## 3. Visual System, Imagery, and Assets

| Check | Pass condition |
|---|---|
| Colour | Navy, green, mint, and off-white follow the approved restrained roles. No new arbitrary colour system appears. |
| Typography | Hanken Grotesk remains the display face and Inter remains the body and interface face. Hierarchy and line length suit the viewport. |
| Surface language | Cards, sheets, and modals use clear white surfaces, compact corners, subtle borders, and controlled depth. |
| Contrast and effects | Text and controls maintain usable contrast. Blur, gradients, glass, glow, and shadow serve a specific purpose and do not compete with tasks. |
| Imagery | Photos are purposeful, correctly sized, and intentionally cropped. Faces, practical work, and adjacent text remain visible. |
| Media stability | Media reserves space, loads responsively, and does not cause disruptive layout shift. |
| Official assets | Partner marks and brand assets use approved source files, correct proportions, and clear space. They are not recoloured or distorted. |

## 4. Responsive, PWA, and Native-App Quality

| Check | Pass condition |
|---|---|
| Screen hierarchy | The changed platform leads with its immediate task. Mobile is not a compressed copy of desktop. |
| Relevant devices | The change is checked at small phone, larger phone, tablet, desktop, and landscape conditions where its layout or interaction changes. |
| Dynamic content | Large text, longer labels, keyboard appearance, asynchronous states, and real content do not crop, overlap, or hide critical controls. |
| Overflow | No horizontal overflow, clipped suggestion, cropped critical text, off-screen focus, or hidden control exists. |
| Safe areas | Native and PWA controls respect device safe areas, system bars, and platform system gestures. |
| Touch targets | Web controls are easy to select. Native targets are at least 44pt on iOS or 48dp on Android. Smaller visual icons have adequate hit areas. |
| Navigation | Navigation matches the product hierarchy and platform convention. The homepage has no bottom navigation unless Solomon explicitly approves a changed rule. |
| State preservation | A back action, sheet dismissal, orientation change, or transient interruption does not unnecessarily discard a person’s relevant task state. |

## 5. Interaction, Motion, and Accessibility

| Check | Pass condition |
|---|---|
| Semantic controls | Buttons, links, inputs, and menus use the correct semantic control and accessible name. |
| Focus | Keyboard focus is visible, logical, and never obscured by sticky UI, sheets, drawers, banners, or overlays. |
| Dismissal | Modals, drawers, sheets, menus, suggestions, and transient panels have an accessible and predictable dismissal route. |
| Input methods | Essential actions do not rely only on hover, gesture, drag, swipe, or colour. Keyboard and touch alternatives exist. |
| Search and dynamic panels | Suggestions, filters, and results remain visible above surrounding content, are tappable and keyboard-safe, open in the expected direction, and do not trap the person. |
| Motion purpose | Animation communicates discovery, focus, selection, navigation, feedback, or a real state transition. |
| Motion restraint | Motion is short, interruptible, input-safe, and uses stable composited properties where possible. It does not animate layout dimensions or create page shift. |
| Reduced motion | `prefers-reduced-motion: reduce` leaves all information, state changes, and essential actions visible and usable. |
| Semantic structure | Images have meaningful alternatives, headings are sequential, reading order is logical, and state is not communicated through colour alone. |

## 6. Forms, Booking, and Recovery

| Check | Pass condition |
|---|---|
| Field clarity | Inputs have visible labels where required, suitable input types, helpful examples where useful, and clear required or optional treatment. |
| Error recovery | Validation explains the specific issue and recovery step. Invalid submission moves focus to a useful summary or first invalid field without losing entered data. |
| Feedback | Loading, success, pending, unavailable, and failure states make the current outcome and next action clear. |
| Material information | Scope, price, location, timing, permission, privacy, payment, escrow, verification, cancellation, and other material terms appear before the relevant irreversible decision. |
| Honesty | Trust, verification, payment, safety, availability, and service claims describe actual supported product behaviour only. |
| Continuity | A person can return from deeper detail, close a non-destructive overlay, or correct a field without unnecessary loss of progress. |

## 7. Content and Trust

| Check | Pass condition |
|---|---|
| Voice | Copy is natural, concise, professional, direct, and action-oriented. |
| Terminology | `BrainWorker` is the sole customer-facing identity label for the person offering services. `Customer`, `Job`, `Service`, `Profile`, `Verification`, and `Escrow` are used correctly. |
| Headline exception | The protected homepage headline retains its approved wording. Its use of “worker” does not create a broader terminology exception. |
| Claims | No invented counts, ratings, availability, guarantees, coverage, verification, payment protection, safety claim, or outcome claim appears. |
| Microcopy | Labels are explicit, actions are clear, links describe their destination, and errors explain recovery. |
| Location and currency | Location and currency language reflects the actual active market and supported feature. |
| Punctuation | No em dash appears in customer-facing copy. |

## 8. Engineering Quality

| Check | Pass condition |
|---|---|
| Minimalism | The implementation uses the smallest number of components, states, utilities, and dependencies necessary. |
| Reuse | Existing components, tokens, assets, and patterns are extended before inventing a parallel system. |
| Focus | Functions have one clear responsibility. Complex logic is split before it becomes difficult to follow. |
| Control flow | The code uses early returns and avoids deep nesting, duplicate state, and premature abstraction. |
| Performance | The primary task is not delayed by unnecessary visual assets, blocking animation, avoidable client work, or unstable loading behaviour. |
| Comments | Comments explain a non-obvious reason or business constraint, not obvious code mechanics. |
| Validation | Relevant type checks, linting, automated tests, and visual checks pass. |

## Delivery Record

Document these facts in the final delivery:

1. The active branch and commit, if code changed.
2. The customer task and product context reviewed.
3. The desktop, phone, tablet, landscape, and text-scaling conditions checked where relevant.
4. Keyboard, touch, overlay, form-recovery, and reduced-motion outcomes when those interactions changed.
5. Any fact that still needs product, legal, security, or content confirmation.
6. The deployed preview when deployment occurred.
7. Whether a reusable new pattern was added to the live baseline or intentionally kept local to one screen.
