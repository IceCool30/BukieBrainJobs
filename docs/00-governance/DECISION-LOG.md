# Decision Log

**Document ID:** GOV-004
**Version:** 1.3
**Status:** Approved foundation

This file is the index for material product, design and engineering decisions. Detailed decisions may later be split into individual ADR files under `docs/21-decision-log/`.

## Decision format

Every material decision should record:

- Decision ID
- Date
- Status
- Context
- Decision
- Alternatives considered
- Consequences
- Affected areas
- Source references

## Current locked decisions

### GOV-001: Repository is the durable engineering source

**Status:** Approved

The GitHub repository will contain the durable project guidance required for humans and agents to understand and build BukieBrainJobs safely.

### GOV-002: Design authority

**Status:** Approved

`DESIGN.md` is the visual source of truth. Approved design-system artifacts formalize and extend it without silently contradicting it.

### GOV-003: Product-to-engineering separation

**Status:** Superseded / Updated

Product defines requirements and technical specifications. Engineering interprets approved product specifications and DESIGN.md for UI design and implementation.

### GOV-004: Documentation before application code

**Status:** Approved

The repository foundation is being established before application code is committed. Application implementation should only begin after the relevant specifications and engineering requirements are available.

### GOV-005: Shared contracts

**Status:** Approved

Shared API contracts, database shapes, validation rules and reusable business logic must be defined once in the shared package layer where the approved architecture requires them.

### DS-011: Semantic design tokens

**Status:** Approved

The platform uses a semantic token architecture shared across web and mobile. Deep Navy is the primary brand/action system and Emerald is strategic emphasis/success. The legacy green-primary technical example must not override `DESIGN.md`.

### WEB-001: Homepage baseline

**Status:** Approved

The public homepage is customer-first, supports three marketplace entry paths, supports guest discovery, and uses controlled activation across 36 Nigerian state capitals plus Abuja as the initial geographic architecture.

### PLAT-001: Full product parity across website, PWA, and native

**Date:** 2026-08-22
**Status:** Approved (shell detection refined by PLAT-002)

**Context:** Users must be free to choose desktop website, installed PWA, or native Android/iOS without losing core marketplace capability.

**Decision:**

1. Website, PWA, and native each deliver the full product for core customer and BrainWorker journeys.
2. Platform tools may improve delivery of the same feature (for example native push), but must not remove the feature from other surfaces.
3. Desktop website remains a first-class full product.

**Alternatives considered:**

- Web-only customer path with native reserved for BrainWorkers
- PWA as a reduced mobile shell

**Consequences:**

- Shared contracts and business logic stay in packages
- UI chrome may differ by surface
- Feature specs for core journeys must plan for all three surfaces

**Affected areas:** README, product foundation, operating charter, live experience standard, technical baseline, `apps/web`, `apps/mobile`

### PLAT-002: Homepage mobile shell and no bottom nav

**Date:** 2026-08-22
**Status:** Approved
**Supersedes:** PLAT-001 detection clause that treated viewport as never-PWA

**Context:** Product wants the compact mobile shell for phone browsers and for installed PWAs, while desktop keeps the full marketing homepage. The live experience standard forbids a bottom navigation bar on the homepage.

**Decision:**

1. Homepage uses the mobile shell when viewport is mobile width (below 768px) or when the session is installed/standalone (including iOS `navigator.standalone`).
2. Desktop width keeps the full website homepage layout.
3. The homepage never mounts a bottom navigation bar.
4. Core journeys remain available on all surfaces; this decision only controls homepage chrome and layout choice.

**Alternatives considered:**

- Standalone-only shell (rejected; phone browser would stay on marketing layout)
- Bottom nav on mobile homepage (rejected; conflicts with live experience standard)

**Consequences:**

- `useIsPwa` combines mobile viewport and standalone signals
- `BottomNav` is not used on `/`
- README and product foundation document the shell rule

**Affected areas:** `apps/web/hooks/useIsPwa.ts`, `apps/web/app/page.tsx`, README, product foundation, live experience standard

### WEB-002: Enterprise / For Business is post-launch

**Date:** 2026-08-22
**Status:** Approved

**Context:** The public `/enterprise` page previously described live-sounding enterprise capabilities (SLAs, account management, consolidated billing, API integration). The product is not ready to commit to that scope for the first public launch.

**Decision:**

1. Keep the `/enterprise` route and homepage navigation label so the direction remains visible.
2. Replace sales-style enterprise content with a Coming Soon page.
3. Enterprise / Corporate Portal is not part of the first public launch.
4. First launch focus remains the consumer marketplace: discovery, booking, and trust.
5. Do not present enterprise operational features as available until a later approved milestone.

**Alternatives considered:**

- Keep the full enterprise sales page (rejected; over-promises)
- Remove the nav link and route (rejected; loses future-signal)

**Consequences:**

- `/enterprise` is informational only until Corporate Portal work is approved
- Roadmap Milestone 7 remains the planning home for corporate capabilities
- Public website copy must not imply live enterprise account operations

**Affected areas:** `apps/web/app/enterprise/page.tsx`, roadmap, product foundation, homepage navigation

### WEB-003: Current approved live experience governs WEB-001 completion

**Date:** 2026-08-26
**Status:** Approved
**Supersedes:** Conflicting public behavior in WEB-001 and WEB-002 only where it contradicts the current approved live experience.

**Context:** The WEB-001 completion gate reconciled older planning documents with the current approved BukieBrainJobs customer experience. Earlier records contained public launch-state, controlled-activation, and trust-content assumptions that no longer match the approved product direction.

**Decision:**

1. The current approved live experience, then the latest explicit product direction, governs the WEB-001 completion gate.
2. Do not restore public BukiePassport, unsupported verification, Escrow, payment, guarantee, dispute, or fabricated testimonial claims from historical material.
3. Treat Lagos, Abuja, Port Harcourt, Ibadan, Enugu, Kano, and Benin City as the active locations shown in the current experience. Do not restore a public Notify Me flow or the former 36-capitals-plus-Abuja activation model.
4. Keep `/enterprise` as the current launch-ready recurring-work page. The WEB-002 Coming Soon state is superseded for this route.
5. Keep public journeys launch-ready and customer-facing. Internal mock implementation details must not appear as customer readiness notices.
6. Deterministic mock data and client-only interaction states remain permitted for WEB-001. This decision does not authorize backend, payment, verification, or identity-document implementation.

**Alternatives considered:**

- Restore older requirements verbatim during completion review, rejected because it would contradict the approved customer experience.
- Remove the enterprise route, rejected because the approved live experience retains it as a business-service entry point.

**Consequences:**

- Historical specifications remain useful only where they do not conflict with this decision and the live experience standard.
- Completion review prioritizes usable discovery, booking preparation, BrainWorker profiles, client validation, accessibility, and deterministic recovery states.
- Older public trust or launch-state copy must not silently re-enter the product.

**Affected areas:** `apps/web`, homepage and supporting public routes, live experience standard, future WEB-001 audit work, historical WEB-001 and WEB-002 references.

**Source references:** Explicit user-approved WEB-001 completion direction, `docs/02-design-system/LIVE-EXPERIENCE-STANDARD.md`, and the current approved web experience.

### WEB-004: Public service detail between discovery and booking preparation

**Date:** 2026-08-26
**Status:** Approved implementation contract

**Context:** The current public discovery flow moves from homepage search or `/services` category discovery directly to booking preparation. The services directory labels its action `Review details`, but no dedicated service-detail route exists. The active public-website roadmap identifies service details as remaining scope, and the current homepage mock boundary already provides factual service data.

**Decision:**

1. Add a deterministic public route at `/services/[serviceId]` for existing public service categories.
2. Use only the current public `SERVICE_CATEGORIES` and active `NIGERIAN_LOCATIONS` mock data to present a concise service review.
3. Keep the page a guest-accessible information and booking-preparation step. It may link to the existing booking route with the selected service and starting price.
4. Do not add backend, authentication, payment, Escrow, verification, profile, availability, testimonial, review, matching, location-activation, or corporate behavior.
5. Follow the live approved experience and WEB-003. Do not restore historical public trust claims or activation flows.

**Consequences:**

- `Review details` actions must route to the service-detail page rather than directly to booking preparation.
- Existing discovery and booking code remains the source for entry and exit behavior.
- A focused mock-data lookup helper and tests are required to keep invalid routes deterministic.

**Affected areas:** `apps/web/app/services`, `apps/web/lib/mock/homepage-data.ts`, `docs/04-public-website/WEB-004-SERVICE-DETAIL.md`, and public service discovery.

## Adding a decision

Do not edit a historical decision to hide a change. If a decision changes, create a new decision, link the superseded decision and explain the reason.

---

## FOUNDATION-002 Baseline Upgrade Decisions (2026-08-10)

### FOUND-001: Node 20 LTS superseded by Node 22 LTS

**Date:** 2026-08-10
**Status:** Approved

Node 20 LTS reached end-of-life in April 2026. Node 22 LTS is the current long-term support release. All CI, deployment, and local tooling declarations updated to Node 22. `.nvmrc` pinned to `22`.

### FOUND-002: Next.js 14 upgraded to Next.js 15

**Date:** 2026-08-10
**Status:** Approved

Next.js 15 (15.5.21) is the current stable release with security patches covering CVEs present in 14.2.5 (GHSA-gp8f-8m3g-qvj9). Next.js 15 brings async Request APIs, React 19 compatibility, and Turbopack stability. Phase 1 mock-only app has minimal App Router surface area so migration impact is low.

### FOUND-003: React 18 upgraded to React 19 (web only)

**Date:** 2026-08-10
**Status:** Approved

React 19 is required by Next.js 15. Mobile app remains on React 18.3.1 per Expo SDK 52 compatibility constraints.

### FOUND-004: NextAuth v5 beta replaced with NextAuth v4 stable

**Date:** 2026-08-10
**Status:** Approved

`next-auth@5.0.0-beta.25` violates the no-prerelease policy. NextAuth v5 has no stable release as of 2026-08-10. Downgraded to `next-auth@4.24.15` (latest stable). Authentication implementation is Phase 2 scope; no Phase 1 functionality is affected.

### FOUND-005: Tailwind CSS v3 upgraded to Tailwind CSS v4 (CSS-first)

**Date:** 2026-08-10
**Status:** Approved

Tailwind v4 uses a CSS-first configuration model. `tailwind.config.ts` is simplified to content paths only. Design tokens migrated to CSS `@theme` block in `globals.css`. PostCSS plugin updated from `tailwindcss` to `@tailwindcss/postcss`. Autoprefixer removed (bundled in v4).

### FOUND-006: Prisma v5 upgraded to Prisma v6

**Date:** 2026-08-10
**Status:** Approved

Prisma 6.x (6.17.0) is the current stable major with performance improvements and API stability. No schema changes required for v5-to-v6 migration. Prisma v7 introduces Driver Adapters as required (breaking change); deferred until Phase 2 backend work begins.

### FOUND-007: Zustand v4 unified to v5 across all workspaces

**Date:** 2026-08-10
**Status:** Approved

`apps/web` was on Zustand v4 while `packages/store` and `apps/mobile` were on v5. This split created a risk of dual-instance Zustand in the web bundle. Unified to `zustand@5.0.14` across all workspaces.

### FOUND-008: Socket server package.json created

**Date:** 2026-08-10
**Status:** Approved

`services/socket-server` had source code but no `package.json`. This was a critical infrastructure gap preventing Turborepo from building or type-checking the socket server. Created `package.json` with socket.io, @socket.io/redis-adapter, ioredis, and typescript dev tools.

### FOUND-009: ESLint configuration created for apps/web

**Date:** 2026-08-10
**Status:** Approved

`apps/web` had no `.eslintrc.json` despite `pnpm turbo lint` being defined in CI. Created with `next/core-web-vitals` and `next/typescript` rulesets.

### FOUND-010: Standardize project baseline on Node 24 LTS

**Date:** 2026-08-10
**Status:** Approved

Project runtime baseline standardized on Node.js 24 LTS to align local, CI, deployment, and Vercel environments. All `.nvmrc`, `package.json` engines, and GitHub Actions workflows updated to Node 24.
