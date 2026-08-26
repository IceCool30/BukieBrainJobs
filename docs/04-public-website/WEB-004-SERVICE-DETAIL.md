# WEB-004: Public Service Detail

**Status:** Approved implementation contract
**Scope:** Mock-data-driven public website route
**Route:** `/services/[serviceId]`
**Depends on:** Current approved live experience, `WEB-003`, `WEB-001`, existing service discovery, and existing booking preparation

## Purpose

WEB-004 closes the decision gap between public service discovery and booking preparation. A customer who has selected a service category can review a concise, factual description of that category before continuing to booking preparation.

This is not a booking, payment, matching, professional-verification, availability, review, or customer-account feature. It must remain a deterministic public service-review route until a later approved feature package expands the journey.

## User and primary job

The primary visitor is a customer who has reached a service category from homepage search, the mobile service grid, or the services directory.

The page must answer three questions without clutter:

1. What type of work does this service cover?
2. What starting price is currently shown?
3. What should I do next?

The primary action is **Continue to booking**. The secondary action is **Back to services**.

## Content and data boundary

Use only the canonical public mock boundary at `apps/web/lib/mock/homepage-data.ts`.

| Page content | Existing source |
|---|---|
| Service identifier, title, description, photo, category group, starting price, and common jobs | `SERVICE_CATEGORIES` |
| Active customer-facing locations | `NIGERIAN_LOCATIONS` filtered to `status: 'active'` |
| Booking transition | Existing `/book` query convention using `service`, `price`, and optional `city` |

Do not use `packages/store/src/mockData.ts`, `MOCK_TESTIMONIALS`, passport tiers, ratings, reviews, identity checks, wallets, Escrow fields, payment data, disputes, or historical availability records.

## Experience requirements

The route must extend the approved live experience rather than create a parallel visual language.

| Concern | Required behavior |
|---|---|
| Visual hierarchy | Photo-led hero, readable navy contrast, direct service title, starting price, common work, and one primary action |
| Visual system | Off-white canvas, white cards, navy structure, mint focus and highlight, green secondary emphasis, Hanken Grotesk display, Inter body, compact rounded corners, restrained navy-tinted depth |
| Image treatment | Use the selected service photo with meaningful crop and preserved subject context. Do not use a generic icon tile as the primary visual |
| Responsive layout | Use the 1280px desktop container, 12/8/4 grid logic, 24px desktop gutter, and mobile-safe 20px margins. Mobile must be a focused review view, not a compressed desktop page |
| Navigation | Provide an accessible back link to `/services` and preserve the current public header and footer patterns where appropriate |
| Content | Use direct customer-facing language. Do not make claims about verified professionals, payment protection, guarantees, quality outcomes, availability windows, or final prices |
| Motion | Use existing restrained motion utilities only. Hover feedback must not be essential. Reduced motion must remain supported through the global experience baseline |

## Required route states

| State | Required outcome |
|---|---|
| Valid service identifier | Render the matching deterministic service detail and the available booking action |
| Unknown or malformed service identifier | Render the existing Next.js not-found response. Do not redirect silently to another service |
| Booking transition | Continue to `/book` with the selected service and starting price. Preserve an optional selected active city if supplied through the query string |
| Location information | Show only the current approved active locations from the canonical homepage dataset. Do not add availability, Notify Me, Coming Soon, or controlled-activation behavior |

## Accessibility requirements

The route must provide semantic heading order, descriptive image alternative text, visible focus styles, keyboard-reachable links and controls, target sizes of at least 44px for primary touch actions, readable contrast, and a useful not-found response. The primary image must describe the service context. Decorative icons must be hidden from assistive technology when their adjacent text already supplies the meaning.

## Acceptance checklist

### Functional

- [ ] `/services/[serviceId]` resolves every `SERVICE_CATEGORIES` identifier.
- [ ] Unknown service identifiers return the existing not-found response.
- [ ] The page displays only the selected category's deterministic content.
- [ ] The primary action passes the selected title and starting price into the existing booking route.
- [ ] A valid city query is preserved when continuing to booking.
- [ ] The route makes no API, database, payment, authentication, messaging, or storage request.

### Content and trust

- [ ] All copy uses Customer, BrainWorker, Job, Service, Book, Profile, and Location consistently.
- [ ] The page does not show testimonials, ratings, reviews, BukiePassport, verification claims, Escrow, payment protection, dispute behavior, guaranteed outcomes, fabricated proof, or technical readiness notices.
- [ ] Starting price is presented as a starting point, not a final or binding amount.
- [ ] No Coming Soon, Notify Me, or legacy activation model appears.

### Design and interaction

- [ ] The desktop page follows the approved photo-led, restrained premium direction.
- [ ] The mobile page is focused, uncluttered, and has no bottom navigation bar.
- [ ] Image, card, button, and type treatment aligns with the active service-directory and homepage patterns.
- [ ] The primary action and back navigation remain clear without depending on hover.

### Accessibility and responsiveness

- [ ] Semantic structure, accessible labels, image alternatives, visible focus, keyboard navigation, and contrast pass manual review.
- [ ] The route has no horizontal overflow or clipping at 1440, 1280, 1024, 768, 430, 390, and 375 pixels.
- [ ] The primary controls are usable with keyboard and touch.

### Quality gates

- [ ] Focused route or pure-helper tests prove the new service-detail lookup and booking URL behavior.
- [ ] `pnpm install --frozen-lockfile`, `pnpm run db:generate`, `pnpm turbo type-check`, `pnpm turbo lint`, `pnpm turbo run build --filter @bukiebrainjobs/web`, `pnpm test`, and `git diff --check` pass.
- [ ] Browser verification covers a valid detail route, an invalid route, the booking transition, desktop, and mobile.
- [ ] Documentation, mock-data boundary, and any material decision entry are updated in the same change set.

## Non-goals

WEB-004 does not authorize backend integration, authentication, account persistence, booking submission, payments, verification, availability scheduling, real BrainWorker matching, messaging, price calculation, reviews, location activation, or native application implementation.
