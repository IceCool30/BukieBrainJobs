# Live Approved BukieBrainJobs Experience Baseline

## Use This as the Primary Product Authority

This reference records the experience approved and deployed from the BukieBrainJobs feature branch. It is a living product baseline, not a historical mockup or a collection of fixed layouts. Use it to judge whether a new website page, PWA view, native-app screen, component, asset, interaction, or content decision belongs in BukieBrainJobs.

When Solomon explicitly approves a reusable new pattern, update this file in the same change set. Do not preserve a historical pattern that the live product has deliberately replaced.

The approved homepage is the strongest live reference for the product’s visual quality, restraint, image treatment, task hierarchy, and mobile focus. Reuse its principles across the product. Do not mechanically copy its composition into unrelated product journeys.

## Product Experience Character

The approved product feels **calm, capable, photo-led, clear, and premium without excess**. It uses purposeful service imagery, honest surfaces, and direct marketplace actions rather than saturated backgrounds, dense decoration, or generic marketing content. A person should quickly understand whether to find a service, book a BrainWorker, post a job, manage a marketplace task, or become a BrainWorker.

| Principle | Product-wide expression |
|---|---|
| Clarity before decoration | The next meaningful action is obvious before secondary information. |
| Task before framing | Retain operational content and the supporting information needed for a decision. Remove repetitive promotion and decorative explanation. |
| Image-led quality | Real service and BrainWorker imagery carries visual richness when it improves recognition, trust, or task context. |
| Colour restraint | Navy creates structure, mint and green create emphasis, and the quiet off-white canvas creates room for content. |
| Honest marketplace confidence | UI explains the next action without invented ratings, guarantees, coverage, availability, or safety claims. |
| One coherent system | Website, PWA, and native-app screens share a brand and quality bar while adapting hierarchy and interaction to their platform. |

## Live Brand Tokens and Surface Language

| Token or pattern | Current approved usage |
|---|---|
| Canvas | `#F8F9FF` is the default page background. |
| Navy | `#001A41` anchors headings, primary controls, the hero, footer, focus treatment, and controlled shadow depth. |
| Green | `#296A4B` supports service actions, selected links, and restrained secondary emphasis. |
| Mint | `#ABEEC8` provides short highlights, focus treatment, and limited brand emphasis. |
| Display typography | Hanken Grotesk is the established heading and display typeface. |
| Body and interface typography | Inter is the established body and interface typeface. |
| Card surface | Use white, a thin slate border, clear padding, and soft navy-tinted elevation. |
| Radius | Use a compact, slightly softened radius. The product favours `rounded-xl` and `rounded-2xl`, not excessive pills. |
| Page rhythm | Use clear section separation and purposeful whitespace instead of repeated colour blocks. |
| Icons and marks | Use a consistent vector icon language and official brand marks with correct proportions and clear space. |

Avoid visual trends that conflict with this language. Do not add broad frosted glass, heavy blur, fluorescent gradients, oversized blobs, ornamental illustration, decorative statistics, or arbitrary per-screen style systems.

## Product-Wide Interaction and Content Patterns

### Decision Architecture

Every screen must prioritise one real task. Secondary detail should appear at the relevant decision point or through a meaningful deeper link, not as a repeated overview layer.

| Keep | Move, consolidate, or remove |
|---|---|
| Service, job, booking, profile, account, verification, payment, availability, and recovery information that supports the current task | Generic taglines, decorative headings, repeated trust assurance, unsupported proof, status clutter, and explanatory text that does not change a decision |
| Clear primary and secondary actions | Multiple competing primary actions |
| Helpful price, scope, location, schedule, or state information when implemented and relevant | Detail that belongs in a later form step, profile section, help page, or dedicated screen |
| Actionable empty, loading, error, success, and unavailable-market states | Vague system messages, placeholder copy, and internal terminology |

### Images, Assets, and Surfaces

Use images when they make the service, person, work, or marketplace context easier to understand. Preserve faces, practical work, and readable overlays through intentional focal positioning. Do not crop people carelessly, obscure faces with a full overlay, or replace useful imagery with generic coloured icon tiles.

Use official partner marks without recolouring, distortion, or invented variants. Cards, sheets, and modals must stay visually distinct from their background through surface, border, and controlled elevation rather than excessive shadow or blur.

### Interaction, Motion, and Accessibility

Controls must expose their state, support keyboard and touch use, provide visible focus, and remain unobscured by sticky elements or overlays. Essential interactions must not depend only on hover, gesture, or colour. Press feedback is stable and concise.

Motion communicates discovery, focus, selection, navigation, or feedback. It uses shared timing, opacity, and transform where possible. It is interruptible, does not block input or shift layout, and respects reduced-motion preferences.

## Approved Homepage-Specific Baseline

### Desktop Hero and Header

The desktop hero uses the approved paired-BrainWorker image with the people’s faces and practical work context visible. The navigation belongs to the hero composition rather than appearing as a disconnected panel. Navy depth is controlled through vignettes and contrast, never a full opaque overlay that buries the image.

The approved homepage headline is:

> Book a skilled local or remote worker in minutes or find flexible work that pays what you are worth only on BukieBrainJobs

This exact headline is protected. Its use of “worker” is an approved headline exception and does not replace the required BrainWorker identity elsewhere.

The two-tier search is the central hero task. It uses a full-width service query row and a location plus Search row. Suggestions open **below** the field, include real service imagery, remain unclipped, and preserve keyboard dismissal without clearing the query.

The desktop header remains focused on navigation and primary actions. Do not restore the removed scrolling status strip, availability wording, contact utility line, or other nonessential framing.

### Desktop Service Discovery and Supporting Content

Desktop service cards use an intentional image-first pattern:

- A 5:4 photo with a purposeful crop.
- A small white starting-price label at the upper left.
- A clean white card body with a concise service title.
- A quiet neutral border and restrained navy-tinted depth.
- Pointer-only hover feedback through a small lift, image response, and navy directional arrow.

Supporting homepage sections keep one clear, purpose-led heading and only the decision support required for their role. The desktop homepage retains service discovery, price estimation, BrainWorker selection, booking actions, concise marketplace paths, and legal-support footer navigation. It does not need repeated taglines, decorative labels, or multi-layer introductions.

### Mobile Homepage and PWA

The mobile homepage is a compact service-discovery product, not a compressed desktop landing page. Its approved order is the photo-led hero, search, supporting line, partner strip, service grid, and footer. Desktop-style explainers, testimonials, BrainWorker profiles, price estimator, FAQs, and marketplace pathway cards stay off the mobile landing view unless explicitly approved as necessary to the immediate task.

The mobile hero keeps the paired-BrainWorker image visible with intentional positioning. Navy depth exists only at controlled side and lower edges to support text. Do not restore a broad navy overlay above the image.

The mobile top controls remain minimal:

- Use the standalone brand icon, not a crowded wordmark.
- Use one accessible menu control.
- Keep the menu control compact, solid navy when scrolled, and free of blur.
- Do not use a bottom navigation bar on the homepage.

The mobile search is 44px high, uses a correctly centred icon, opens matching services below the field, and retains accessible keyboard dismissal. The service grid is a calm two-column composition with full-width containment. Cards retain an image, price label, and concise title, but omit desktop-only hover affordances.

### Mobile Motion

Mobile motion is perceptible only at meaningful discovery moments and remains short and purposeful.

| Interaction | Approved behaviour |
|---|---|
| Service discovery enters view | Reveal the service heading and cards with a restrained upward and opacity transition. Stagger items briefly. |
| Service card press | Give a concise press response and small image response without changing layout bounds. |
| Search focus | Apply a slight scale, mint focus ring, and controlled navy depth. |
| Search suggestions | Reveal below the field without shifting the hero layout. |
| Menu drawer | Use a short open and close transition. Preserve Escape dismissal and body-scroll restoration. |
| Scroll header | Keep it compact and blur-free. Do not animate a broad translucent bar over content. |
| Reduced motion | Keep all content visible and usable with animation removed. |

## Accessibility Baseline

The approved experience requires visible focus states, keyboard access, semantic structure, descriptive labels, real alt text, readable contrast, logical headings, and motion reduction. Do not trade accessibility for a visual effect.

Do not depend on hover as the only way to expose essential information. Do not use colour as the only state indicator. Do not hide visible text in an icon-only interaction without an accessible label. Sticky UI, drawers, sheets, and overlays must not obscure keyboard focus or prevent a clear dismissal route.

## Current Implementation Anchors

Use these live components as starting points when the repository is available. Extend their underlying patterns where appropriate, but do not copy their layout mechanically into an unrelated screen.

| Concern | Current reference component or file |
|---|---|
| Shared visual tokens and motion rules | `apps/web/app/globals.css` |
| Desktop hero and search | `apps/web/components/HeroSection.tsx` |
| Desktop navigation and mobile drawer | `apps/web/components/Navbar.tsx` |
| Desktop service cards | `apps/web/components/PopularServices.tsx` |
| Mobile PWA hero, search, and service grid | `apps/web/components/PwaHome.tsx` |
| Booking and price-estimation flow | `apps/web/components/modals/DirectBookingModal.tsx` and `apps/web/components/PriceEstimator.tsx` |
| Customer-facing vocabulary and claims | `references/BUKIEBRAINJOBS-CONTENT-GUIDE.md` |

A new approved screen can become an implementation anchor after it has been reviewed for visual quality, responsive behaviour, accessibility, truthful content, and maintainable code.
