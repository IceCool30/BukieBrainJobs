# Live Approved BukieBrainJobs Experience Baseline

## Use This as the Primary Visual Authority

This baseline records the experience that is currently approved and deployed from the BukieBrainJobs feature branch. It is not a historical mockup or an aspirational design document. Use it to judge whether a new page, screen, or component belongs in the product.

When the live implementation changes with explicit approval, update this file in the same change set. Do not preserve a historical pattern that the live product has deliberately replaced.

## Experience Character

The approved product feels **calm, capable, photo-led, clear, and premium without excess**. It uses real service imagery and purposeful contrast instead of saturated backgrounds, dense decoration, or generic marketing content. The primary job is always obvious: find a service, book a BrainWorker, post a job, or become a BrainWorker.

| Principle | Live expression |
|---|---|
| Clarity before decoration | Headings, search, calls to action, and service choices remain readable at a glance. |
| Image-led quality | BrainWorker and service photos carry most of the visual richness. |
| Colour restraint | Navy creates structure, mint and green create emphasis, and the quiet off-white canvas gives content room. |
| Real marketplace confidence | UI explains the next action without unsupported proof, ratings, guarantees, or inflated claims. |
| One coherent system | Desktop feels editorial and spacious. Mobile feels focused and direct. Neither feels like an unrelated product. |

## Live Brand Tokens and Surface Language

| Token or pattern | Current approved usage |
|---|---|
| Canvas | `#F8F9FF` is the default page background. |
| Navy | `#001A41` anchors headings, primary controls, the hero, footer, and shadow depth. |
| Green | `#296A4B` supports service actions and selected secondary emphasis. |
| Mint | `#ABEEC8` provides short highlight, focus, and brand-name emphasis. |
| Heading type | Use the implemented display font with strong weight and tight but readable tracking. |
| Body type | Use the implemented body font with plain language and comfortable line height. |
| Card surface | Use white, a thin slate border, soft navy-tinted elevation, and clear padding. |
| Radius | Use a compact, slightly softened radius. The product favours `rounded-xl` and `rounded-2xl`, not excessive pill forms. |
| Page rhythm | Use clear section separation and purposeful whitespace rather than colour blocks. |

Avoid copying visual trends that conflict with this language. In particular, do not add broad frosted glass, heavy blur, fluorescent gradients, oversize blobs, ornamental illustration, or decorative statistics.

## Desktop Homepage Patterns

### Hero and Header

The desktop hero uses the approved paired BrainWorker image with the people’s faces and practical work context visible. The navigation belongs to the hero composition rather than appearing as a disconnected panel. Navy depth is controlled through vignettes and contrast, never a full opaque overlay that buries the image.

The approved hero headline is:

> Book a skilled local or remote BrainWorker in minutes or find flexible work that pays what you are worth only on BukieBrainJobs

The search field is central to the hero task. Its suggestions open **below** the field, include real service imagery, and remain unclipped. Its focus state is visible without displacing the page.

### Service Discovery

Desktop service cards use a deliberate image-first pattern:

- A 5:4 photo with a purposeful crop.
- A small white starting-price label at the upper left.
- A clean white card body with a concise service title.
- A quiet neutral border and restrained navy-tinted depth.
- Pointer-only hover feedback: small lift, image response, and a navy directional arrow.

Do not replace service photography with generic coloured icon tiles when an appropriate real photo exists.

### Supporting Sections

Use white and off-white surfaces as the default. Preserve an editorial content hierarchy: a clear heading, a short human supporting line where useful, a primary decision, and only the details that help a visitor make it. Link to dedicated screens for deeper information rather than expanding every section into a wall of copy.

## Mobile PWA and App Patterns

### Core Role

The mobile experience is a compact service-discovery product, not a compressed desktop landing page. It should direct someone quickly to a service, job, or appropriate marketplace path.

### Mobile Hero

The approved mobile hero is compact and photo-governed. It uses the same paired-BrainWorker image with intentional positioning so faces and meaningful work remain visible. Navy depth exists only at controlled side and lower edges to support text. Do not restore a broad blue overlay above the image.

The mobile top controls are minimal:

- Use the standalone brand icon, not a crowded wordmark.
- Use one accessible menu control.
- Keep the menu control compact, solid navy when scrolled, and free of blur.
- Do not use a bottom navigation bar on the homepage.

The search field is 44px high, uses a correctly centred icon, opens matching services below the field, and retains accessible keyboard dismissal.

### Mobile Service Grid

The mobile service discovery block uses a calm two-column grid with full-width card containment. Cards retain the image, price label, and title, but remove desktop-only hover affordances. They must never overflow horizontally, cut off imagery, or crowd the first task.

### Mobile Motion

Mobile motion is intentionally more visible at discovery moments than the original conservative pass, but it remains short and purposeful.

| Interaction | Approved motion behaviour |
|---|---|
| Service discovery enters view | Reveal the service heading and cards with a restrained upward and opacity transition. Stagger items briefly. |
| Service card press | Give a concise press response and small image response. |
| Search focus | Apply a slight scale, mint focus ring, and controlled navy depth. |
| Search suggestions | Reveal below the field without shifting the hero layout. |
| Menu drawer | Use a short open and close transition. Preserve Escape dismissal and body-scroll restoration. |
| Scroll header | Keep it compact and blur-free. Do not animate a broad translucent bar over content. |
| Reduced motion | Keep all content visible and usable with animation removed. |

## Accessibility Baseline

The approved experience requires visible focus states, keyboard access, semantic structure, descriptive labels, real alt text, readable contrast, and motion reduction. Do not trade accessibility for a visual effect.

Do not depend on hover as the only way to expose essential information. Do not use colour as the only state indicator. Do not hide visible text in an icon-only interaction without an accessible label.

## Current Implementation Anchors

Use these live components as starting points when the repository is available:

| Concern | Current reference component or file |
|---|---|
| Shared visual tokens and motion rules | `apps/web/app/globals.css` |
| Desktop hero and search | `apps/web/components/HeroSection.tsx` |
| Desktop navigation and mobile drawer | `apps/web/components/Navbar.tsx` |
| Desktop service cards | `apps/web/components/PopularServices.tsx` |
| Mobile PWA hero, search, and service grid | `apps/web/components/PwaHome.tsx` |
| Customer-facing vocabulary and claims | `references/BUKIEBRAINJOBS-CONTENT-GUIDE.md` |

Use these components to understand approved patterns. Reuse and extend them where appropriate. Do not copy their layout mechanically into an unrelated screen.
