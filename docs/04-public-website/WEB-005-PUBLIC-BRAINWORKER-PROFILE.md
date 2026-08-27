# WEB-005: Public BrainWorker Profile

**Status:** Implemented, remote CI and preview verified, merge review pending
**Scope:** Frontend-only, deterministic mock-data public website route
**Route:** `/brainworkers/[brainworkerId]`
**Depends on:** Current approved live experience, `WEB-003`, `WEB-004`, `PLAT-002`, existing homepage discovery, services directory, and booking preparation

## Purpose

WEB-005 provides a guest-accessible profile review step for the four featured BrainWorkers already shown on the public homepage. A customer can review basic service information, confirm the canonical service and active city, then continue to booking preparation.

This is not a directory, account, booking submission, payment, verification, availability, matching, messaging, or authentication feature.

## Public inventory

The v1 public inventory is explicitly limited to `bw-1`, `bw-2`, `bw-3`, and `bw-4` through `PUBLIC_BRAINWORKER_IDS`. Each identifier resolves to a deterministic profile route. Unknown or malformed identifiers use the existing Next.js not-found behavior and do not redirect.

The desktop homepage and compact homepage link to the same profile route. The compact homepage carries its selected active city as canonical query context. Desktop cards intentionally carry no booking context.

## Public-safe data boundary

The route and booking-context component consume `PublicBrainWorker`, a narrow projection of the richer mock record in `apps/web/lib/mock/homepage-data.ts`.

| Permitted field | Purpose |
|---|---|
| `id` | Route and stable identity |
| `name` | Public profile heading and booking handoff |
| `title` | Basic service description |
| `category` | Listed service focus |
| `location` | Public location shown on the profile |
| `startingRate` | Starting price shown before booking |
| `avatarUrl` | Purposeful profile portrait |
| `skills` | Listed skills for customer review |

Ratings, reviews, completed-job counts, trust tiers, verification, testimonials, contact details, availability, matching, payment, Escrow, messaging, and authentication are excluded from the profile journey.

## Canonical context contract

Only `serviceId` and `city` are accepted as incoming context values. `serviceId` must exactly match an identifier in `SERVICE_CATEGORIES`. Its title and display text are always resolved from that canonical record. An incoming `service` display string is ignored. `city` must exactly match an active `NIGERIAN_LOCATIONS` entry.

Invalid or missing values are treated as absent. The BrainWorker category may be shown as a suggested focus, but it is never auto-selected as the customer’s service. The booking action remains unavailable until the customer explicitly selects both a canonical service and an active city.

When both values are valid, the profile back link returns to `/services?category=<serviceId>&q=<canonical-title>&city=<active-city>`. Otherwise, the back link returns to `/#workers`. The booking handoff contains only the canonical service title, public profile starting rate, active city, and public BrainWorker name.

## Experience and accessibility requirements

The page extends the current photo-led live experience through a navy profile hero, purposeful portrait crop, off-white canvas, white content surfaces, restrained green and mint emphasis, compact rounded geometry, Hanken Grotesk headings, Inter interface text, and controlled depth.

The page uses sequential semantic headings, meaningful portrait alternatives, visible focus states, keyboard-reachable links and controls, touch-safe controls, readable contrast, responsive composition, and no horizontal overflow. It uses existing restrained motion utilities and remains usable with reduced motion. The homepage retains no bottom navigation bar.

## Acceptance checklist

### Functional

- [ ] The route resolves exactly `bw-1`, `bw-2`, `bw-3`, and `bw-4`.
- [ ] Unknown and malformed profile identifiers return not-found behavior.
- [ ] The rendered profile uses only the public-safe projection.
- [ ] Valid `serviceId` and active `city` values are resolved canonically.
- [ ] Arbitrary `service` values are rejected.
- [ ] Booking remains unavailable until service and city are explicitly selected.
- [ ] Valid discovery context builds the canonical Services return URL.
- [ ] Valid context builds the canonical booking handoff.
- [ ] The route makes no API, database, authentication, payment, messaging, matching, availability, or external-service request.

### Content and trust

- [ ] Customer-facing identity uses BrainWorker consistently.
- [ ] The page displays only name, title, service focus, location, starting rate, portrait, and listed skills.
- [ ] No ratings, reviews, job counts, verification, trust tiers, testimonials, contact details, availability, payment, Escrow, or unsupported claims appear.
- [ ] Starting rate is presented as a starting point rather than a final price.

### Design, responsive behavior, and accessibility

- [ ] Desktop and compact-mobile entry points use the same profile route.
- [ ] The profile route has usable back navigation with and without discovery context.
- [ ] The photo-led visual treatment remains purposeful and unclipped.
- [ ] The page is checked at 1440, 1280, 1024, 768, 430, 390, and 375px.
- [ ] Keyboard focus, semantic structure, touch targets, reduced motion, contrast, portrait crop, and overflow are checked.

### Quality gates

- [ ] Focused contract tests cover valid and invalid context, public inventory, safe projection, route identity, return URL, booking handoff, and arbitrary-service rejection.
- [ ] Repository quality commands pass independently.
- [x] GitHub Actions, Vercel preview, and browser-runtime evidence are recorded. Standalone remote build and diff-check commands are not separate workflow steps and remain reported explicitly.

## Non-goals

WEB-005 does not authorize a BrainWorker directory, backend queries, database work, authentication, profile persistence, profile editing, verification, availability scheduling, real matching, messaging, booking submission, payments, Escrow, contact disclosure, testimonials, ratings, reviews, native application work, or production deployment.
