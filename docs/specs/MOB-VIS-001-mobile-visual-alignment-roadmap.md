# MOB-VIS-001: Mobile UI-Only Visual Alignment Specification & Roadmap

**Document ID:** MOB-VIS-001

**Status:** In Progress (Slice 1 & Slice 2 Completed & Pushed; Next: Slice 3 Shared Form Kit, Booking Prep & Job Posting)

**Governing Authority:** [THEME-001](../../docs/specs/THEME-001-light-dark-toggle.md), [.agents/skills/bukiebrainjobs-outlier-design-system](../../.agents/skills/bukiebrainjobs-outlier-design-system/SKILL.md), [docs/02-design-system/LIVE-EXPERIENCE-STANDARD.md](../../docs/02-design-system/LIVE-EXPERIENCE-STANDARD.md)

**Date:** 2026-11-10

**Target Package:** `apps/mobile`

---

## 1. Executive Summary & Objective

The product owner has assessed that the mobile application (`apps/mobile`) required visual polish to align with the aesthetic quality, surface refinement, and brand fidelity of the Outlier design system established on web/PWA (while the separate web homepage candidate remains uncommitted and unaccepted, avoiding any claim that the entire product or web codebase has been accepted).

The objective of `MOB-VIS-001` is to establish a focused, stepwise, UI-only visual alignment program. This specification defines how the mobile application will adopt the visual tokens, typography hierarchy, elevation, geometry, and button language established by the Outlier design system on web/PWA, while strictly preserving:

- All existing mobile routes, screens, and navigation architectures.
- All mock data boundaries and in-memory test fixtures.
- Dual-theme functionality under `THEME-001` (dark default, light support, single toggle in home header, saved in `AsyncStorage`).
- Zero changes to backend, database, network APIs, or authentication.

---

## 2. Read-Only Screen Inventory: Source-Level Web/PWA Reference vs. Mobile

This inventory represents a source-level structural and stylistic code comparison between the web/PWA reference codebase (`apps/web`) and the current Expo mobile codebase (`apps/mobile`). Note that while baseline web/PWA styles serve as reference, the separate web homepage candidate (`apps/web/components/HeroSection.tsx`) remains uncommitted and separately unaccepted, and no claim is made that the entire product or web codebase has been accepted. This inventory is not a recorded browser viewport test or native device runtime test. Native-device, screen-reader, and hardware-dependent QA remain explicitly unverified.

| Screen / Flow                                                       | Web/PWA Reference Source (`apps/web`)                                                                                                                                                                                | Current Mobile Source (`apps/mobile`)                                                                                                                                                                                          | Visual Gap & Proposed Alignment Target                                                                                                                                                                                                                                                                                                                                                                                                      |
| ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Marketing Home** (`app/index.tsx`)                                | Refined Outlier hero with rounded pill CTA (`.outlier-pill-button`), subtle dark navy backdrop, balanced typography, and responsive service list. Note: the separate web homepage candidate (`HeroSection.tsx`) remains uncommitted/unaccepted. | Aligned in Slice 1 (`b82a365`): Outlier pill CTAs (`borderRadius: 9999`), title-case labels, harmonious brand header with integrated theme toggle pill, card elevation, and exact owner-approved headline. | Completed in Slice 1 (`b82a365`). Integrated Outlier rounded-pill CTAs (`borderRadius: 9999`), title-case labels ("Find a BrainWorker", "Become a BrainWorker", "Post a Job"), brand header with theme toggle pill, card elevation, resolved CTA contrast (`ctaFill: #F7803C`, `ctaText: #001A41`), and exact owner-approved headline (`Book a skilled local or remote worker in minutes or find flexible work that pays what you are worth only on BukieBrainJobs`). Separate web homepage candidate remains uncommitted/unaccepted. |
| **App Shell & Tabs** (`app/(tabs)/_layout.tsx`)                     | Sticky strip navigation (`--strip-bg`), subtle borders (`--lead` / `--rule`), clean tab icons with active state indicators (`--nav-accent: #ABEEC8`).                                                                | Aligned in Slice 1 (`b82a365`): Refined tab bar geometry with dual-theme active indicator (`#F7803C` dark, `#ABEEC8` light on persistent navy strip via `getStripAccentColor`), polished title typography, and correct strip colors. | Completed in Slice 1 (`b82a365`). Tab bar geometry refined with subtle active indicator (dark active tint `#F7803C`, light active tint `#ABEEC8` on persistent navy strip, not semantic amber `#C2410C`), polished header styling, and correct theme strip colors.                                                                                                                                                                     |
| **Services Catalog** (`app/(tabs)/services.tsx`)                    | Search bar with smooth focus outline, rounded category filter pills, elevated service cards with category badges.                                                                                                    | Aligned in Slice 2 (`56d5ac7`): Streamlined local preview badge, 50px modern search input with clear action, rounded horizontal category filter pills with active tint, elevated service cards with category badges, and preserved 8 canonical services. | Completed in Slice 2 (`56d5ac7`). Streamlined notice banner into a subtle, non-intrusive badge; aligned filter pills to rounded radius; added card elevation and icon accents; implemented modern 50px search input with clear action.                                                                                                                                                                                                   |
| **Service Detail** (`app/services/[id].tsx`)                        | Clear typography hierarchy, pill group tag, subtle checklist card with theme-aware checkmarks, primary book action.                                                                                                  | Aligned in Slice 2 (`56d5ac7`): 48x48 back button, clean typography hierarchy, soft card container for task examples with theme-aware checkmarks, and primary CTA using `ctaFill: #F7803C` / `ctaText: #001A41` (>= 48dp). | Completed in Slice 2 (`56d5ac7`). Refined back button geometry (48x48), introduced soft card container for task examples, harmonized amber and green accents, and implemented navy-on-coral primary CTA.                                                                                                                                                                                                                                |
| **Booking Prep** (`app/book.tsx` & `form-kit.tsx`)                  | Multi-step flow: clean step indicator, pill choice chips, subtle input borders with amber focus glow.                                                                                                                | Blocky form cards, monospace section labels, dense error banners, square choice chips.                                                                                                         | Upgrade `form-kit.tsx` primitives: rounded choice chips, refined input focus states, balanced summary rows, softened step headers. Target for Slice 3.                                                                                                                                                                                                                                                                                    |
| **Job Posting** (`app/post-job.tsx`)                                | Step-by-step progress tracker, polished character counters, category selection chips.                                                                                                                                | Monospace step headers, dense warning cards, blocky text inputs.                                                                                                                               | Leverage upgraded `form-kit.tsx` primitives, align chip geometry, soften card surfaces and helper text. Target for Slice 3.                                                                                                                                                                                                                                                                                                              |
| **Customer Activity & Lifecycle** (`app/(tabs)/jobs.tsx`)           | Segmented tab controls and milestone progression cards; web defines `.telemetry-beacon` in `globals.css` (animated green status pulse used in `TradesRequisitionBoard.tsx`).                                           | Flat segmented bar with basic underline, stark milestone timeline with hard vertical lines.                                                                                                    | Implement refined segmented pill tabs; propose adapting an active milestone status pulse (inspired by web `.telemetry-beacon`, but clearly designated as a proposed native adaptation needing `/architect` design comparison and delegated PM approval before implementation); polish card surfaces. Target for Slice 4.                                                                                                                     |
| **BrainWorker Workspace** (`app/brainworker/workspace-preview.tsx`) | Lead cards with clear price tags, distance badges, and bottom-sheet confirmation modals.                                                                                                                             | Dense, flat alert box, monospace metadata labels, standard centered alert modals.                                                                                                               | Elevate lead alert card with badge styling; polish Accept/Decline action modals with rounded geometry and clean taxonomy rows. Target for Slice 5.                                                                                                                                                                                                                                                                                         |

---

## 3. Design System & Token Alignment

### 3.1 Strict Adherence to THEME-001

- **Dark Mode is Default**: Unchanged. First launch resolves to dark mode (`bbj_theme_mode`).
- **Light Mode is Fully Supported**: Light mode must remain completely legible with compliant contrast.
- **Single Toggle Placement**: The theme toggle remains exclusively in the home screen header (`app/index.tsx`). It must not be duplicated into every sub-screen or tab header.
- **Persistence**: Preference is persisted using `@react-native-async-storage/async-storage` under key `bbj_theme_mode`.

### 3.2 Token Reconciliation (Approved Web CSS vs Mobile)

Mobile tokens in `apps/mobile/lib/theme.ts` must be harmonized with actual CSS variable values declared in `apps/web/app/globals.css`.

Crucially, semantic amber tokens and filled primary CTA tokens serve distinct roles and must not be conflated:

- Semantic `--amber` is `#F7803C` in dark mode and deepened to `#C2410C` in light mode (with `--amber-hover` `#FF8D4D` dark and `#9A3412` light). Deep light amber (`#C2410C`) is optimized for legible text, badges, and accents on light backgrounds.
- The approved Outlier primary pill (`.outlier-pill-button`, `globals.css` lines 517-519 and 562-568) uses coral `--outlier-coral: #F7803C` fill with high-contrast brand navy `text-[#001A41]` in light mode (and `--outlier-coral-hover: #FF8D4D` on hover/active).
- Therefore, mobile must NOT use semantic light `amber: #C2410C` as a filled primary CTA background with white text. Doing so would fail contrast and diverge from the committed web design rule. Instead, mobile retains semantic `amber: #C2410C` for readable text/accent roles and introduces separate semantic tokens for filled primary CTAs (`ctaFill: #F7803C`, `ctaText: #001A41`, `ctaPressed: #FF8D4D`) across both dark and light modes.
- On the persistent navy navigation strip (`--strip-bg: #001A41` in light mode), web declares `--nav-accent: #ABEEC8` (`globals.css` line 501). Mobile's `getStripAccentColor(tokens, tokens.amber)` resolves dark active tab tint to `#F7803C` (dark amber) and light active tab tint to `tokens.stripAccent`, which matches `--nav-accent: #ABEEC8` (`tradesColorTokens.light.stripAccent`). The light active tab tint must not be mapped to semantic amber `#C2410C`.

| Token Role                      | Actual Web CSS Variable (`globals.css`)         | Web Dark Value | Proposed Mobile Dark Token | Web Light Value | Proposed Mobile Light Token | Token Rationale & Notes                                                                                                                                                                                                                                                                                                         |
| ------------------------------- | ----------------------------------------------- | -------------- | -------------------------- | --------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Canvas Background               | `--bg`                                          | `#0B0E13`      | `#0B0E13`                  | `#F7F9FC`       | `#F7F9FC`                   | Identical canvas foundation                                                                                                                                                                                                                                                                                                     |
| Card Background                 | `--card-bg`                                     | `#13171E`      | `#13171E`                  | `#FFFFFF`       | `#FFFFFF`                   | Standard card surface                                                                                                                                                                                                                                                                                                           |
| Card Border / Divider           | `--card-border` / `--lead`                      | `#202734`      | `#202734`                  | `#E2E8F0`       | `#E2E8F0`                   | Replaces mobile light `#E5E9F0` with web `--lead` `#E2E8F0`                                                                                                                                                                                                                                                                     |
| Subordinate Rule                | `--rule`                                        | `#2D3748`      | `#2D3748`                  | `#CBD5E1`       | `#CBD5E1`                   | Exact match to web `--rule`                                                                                                                                                                                                                                                                                                     |
| Main Text                       | `--text-main`                                   | `#F0F4F9`      | `#F0F4F9`                  | `#001A41`       | `#001A41`                   | High-contrast body & titles                                                                                                                                                                                                                                                                                                     |
| Muted Text                      | `--text-muted`                                  | `#8897AB`      | `#8897AB`                  | `#53647A`       | `#53647A`                   | Replaces mobile light `#475569` with web `--text-muted` `#53647A`                                                                                                                                                                                                                                                               |
| Semantic Amber (Text / Accents) | `--amber`                                       | `#F7803C`      | `#F7803C`                  | `#C2410C`       | `#C2410C`                   | Reconciles to web `--amber`. Used strictly for readable text, badges, and accents; never used as a filled primary CTA background with white text.                                                                                                                                                                               |
| Semantic Amber Hover / Pressed  | `--amber-hover`                                 | `#FF8D4D`      | `#FF8D4D`                  | `#9A3412`       | `#9A3412`                   | Exact match to web `--amber-hover` for interactive states on semantic amber text or outlines                                                                                                                                                                                                                                    |
| Primary CTA Fill                | `--outlier-coral` (`.outlier-pill-button` rule) | `#F7803C`      | `#F7803C`                  | `#F7803C`       | `#F7803C`                   | Dedicated semantic primary CTA background token (`ctaFill` / `primaryCtaBg`). Coral fill in both dark and light modes, matching committed Outlier web rule.                                                                                                                                                                     |
| Primary CTA Text / Icon         | `.outlier-pill-button` rule / `--brand-navy`    | `#001A41`      | `#001A41`                  | `#001A41`       | `#001A41`                   | Dedicated semantic primary CTA text token (`ctaText` / `primaryCtaText`). Brand navy on coral delivers 6.62:1 contrast (WCAG AA compliant).                                                                                                                                                                                     |
| Primary CTA Pressed             | `--outlier-coral-hover`                         | `#FF8D4D`      | `#FF8D4D`                  | `#FF8D4D`       | `#FF8D4D`                   | Dedicated semantic primary CTA pressed token (`ctaPressed` / `primaryCtaPressed`). Brand navy on pressed coral delivers 7.49:1 contrast.                                                                                                                                                                                        |
| Brand Green Status              | `--brand-green`                                 | `#2FE896`      | `#2FE896`                  | `#296A4B`       | `#296A4B`                   | Exact match to web `--brand-green`                                                                                                                                                                                                                                                                                              |
| Navigation Strip Background     | `--strip-bg`                                    | `#07090D`      | `#07090D`                  | `#001A41`       | `#001A41`                   | Header and tab bar strip                                                                                                                                                                                                                                                                                                        |
| Strip Text                      | `--strip-text`                                  | `#9FB2C8`      | `#9FB2C8`                  | `#D6E4F5`       | `#D6E4F5`                   | Reconciles mobile light strip text to web `--strip-text`                                                                                                                                                                                                                                                                        |
| Navigation Strip Accent         | `--nav-accent`                                  | `#ABEEC8`      | `#2FE896`                  | `#ABEEC8`       | `#ABEEC8`                   | Grounded in `globals.css` line 501 (`--nav-accent: #ABEEC8`) and mobile `obsidianLightTokens.stripAccent`. The tab bar helper `getStripAccentColor(tokens, tokens.amber)` resolves dark active tint to `#F7803C` and light active tint to `#ABEEC8` on the persistent navy strip. Distinct from semantic light amber `#C2410C`. |

### 3.3 Geometry, Radii & Styling Proposals

To maintain clear boundaries between established web rules and mobile adaptations, native styling targets are categorized as follows:

1. **Established Web Rules (from `globals.css` & Outlier skill)**:
   - Primary marketing buttons use fully rounded pill geometry (`.outlier-pill-button`, `border-radius: 9999px`).
   - Operational cards on web use `--radius-lg: 0.5rem` (8px), with responsive mobile card radius `--outlier-radius-card: 16px` at `<= 809.98px`.
2. **Proposed Mobile Adaptations (needing `/architect` design comparison and delegated PM approval before implementation; owner-approved THEME-001 remains fixed)**:
   - _Pill Buttons_: `borderRadius: 9999` with `minHeight: 48` for primary marketing and hero CTA buttons.
   - _Content Cards_: `borderRadius: 12` to `16` proposed for mobile card surfaces to align with touch ergonomics and Outlier card feel.
   - _Choice Chips & Badges_: `borderRadius: 20` with 10px vertical and 14px horizontal padding (`minHeight: 48` for interactive touch targets).
   - _Form Inputs_: `borderRadius: 10` with subtle 1px border.
   - _Active Milestone Indicator_: Adapting an active milestone status pulse inspired by web `.telemetry-beacon` (defined in `globals.css` and used in `TradesRequisitionBoard.tsx`) is proposed as a native mobile visual treatment, subject to `/architect` design comparison and delegated PM approval before implementation rather than being an established mobile standard.

### 3.4 Typography Standard

- Eliminate uppercase monospace labels for user-facing actions (e.g., replace `FIND A BRAINWORKER` with title case `Find a BrainWorker`).
- Reserve monospace (`Platform.select({ ios: 'Menlo', default: 'monospace' })`) strictly for technical codes, dates, timestamps, reference IDs, and financial amounts.
- Set title letter-spacing between `-0.4` and `-0.6` to achieve the Outlier grotesque feel without requiring external font bundle dependencies.

---

## 4. Status of the Uncommitted Homepage Candidate & Local Evidence

### 4.1 Resolution of Slice 1 CTA Contrast & Status of Separate Web Candidate

During early evaluation of the mobile homepage candidate, an independent accessibility review identified a critical contrast blocker on primary CTAs:

- The old candidate dark mode hero CTA used legacy trades amber `#FF6B35` with white `#FFFFFF` text. The resulting contrast ratio was only 2.84:1, failing the WCAG AA minimum threshold of 4.5:1.
- That contrast blocker applied strictly to the old candidate CTA styling and has now been fully resolved in the committed Slice 1 implementation.
- Slice 1 was accepted, committed, and pushed at `b82a365`, adopting dedicated semantic tokens `ctaFill: #F7803C` with `ctaText: #001A41` (achieving 6.62:1 contrast in dark and light modes, and 7.49:1 against pressed coral `#FF8D4D`), alongside Outlier pill button geometry (`borderRadius: 9999`), title-case labels, and the exact owner-approved native-home headline (`Book a skilled local or remote worker in minutes or find flexible work that pays what you are worth only on BukieBrainJobs`).
- The separate web homepage candidate at `apps/web/components/HeroSection.tsx` and `apps/web/app/page.test.tsx` remains uncommitted and separately unaccepted. It is not merged, approved, or accepted.

### 4.2 Preserved Uncommitted QA Evidence

- The specific locally modified QA evidence files in the working tree (the 4 screenshot files `docs/screenshots/expo-mob001-01-homepage-portrait.png`, `docs/screenshots/expo-mob001-02-homepage-landscape.png`, `docs/screenshots/expo-mob001-04-services-catalog-search-ac.png`, and `docs/screenshots/expo-mob001-07-service-detail-generator.png`, alongside `docs/screenshots/videos/expo-mob001-discovery-verification.webm`) are preserved, uncommitted QA evidence from an earlier verification pass.
- `docs/check-log.md` is similarly preserved unmodified in the working tree.
- These files are excluded from this specification change and remain uncommitted and unmodified.

---

## 5. Stepwise Implementation Sequence

To avoid sprawling changes and ensure regression-free execution, visual alignment is broken down into five sequential, bite-sized slices:

```text
[Slice 1: Tokens, Shell & Home] (COMPLETED & PUSHED - b82a365)
       │
       ▼
[Slice 2: Discovery & Services Catalog] (COMPLETED & PUSHED - 56d5ac7)
       │
       ▼
[Slice 3: Form Kit, Booking Prep & Job Posting] (NEXT ACTIVE SLICE)
       │
       ▼
[Slice 4: Customer Activity Hub & Lifecycle]
       │
       ▼
[Slice 5: BrainWorker Workspace & Modals]
```

### Slice Breakdown

| Slice       | Name                                       | Status                             | Scope & Key Files                                                                                                                                                                                                                       | Primary Focus                                                                                                                                                                                                                                                                                                                      |
| ----------- | ------------------------------------------ | ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Slice 1** | **Foundation Tokens, Shell & Home Screen** | **Completed & Pushed** (`b82a365`) | `apps/mobile/lib/theme.ts`<br/>`apps/mobile/app/(tabs)/_layout.tsx`<br/>`apps/mobile/app/index.tsx`<br/>`apps/mobile/app/tabs.test.ts`<br/>`apps/mobile/app/services-discovery.test.ts`<br/>`apps/mobile/app/job-posting-entry.test.ts` | Align Outlier color tokens, pill button geometry, tab bar styling (dark active tint `#F7803C`, light active tint `#ABEEC8`), title-case labels, exact owner-approved native-home headline, polished home header theme toggle against approved baseline, and align existing home source-contract tests to title-case and `ctaFill`. |
| **Slice 2** | **Discovery & Service Detail**             | **Completed & Pushed** (`56d5ac7`) | `apps/mobile/app/(tabs)/services.tsx`<br/>`apps/mobile/app/services/[id].tsx`<br/>`apps/mobile/app/services-discovery.test.ts`                                                                                                          | Refined services catalog and detail screens preserving 8 canonical services, routes, and mock behavior: 50px search input, rounded filter pills, card elevation, streamlined local preview badge, refined task list, 48px CTA/back button, and navy-on-coral primary CTA.                                                          |
| **Slice 3** | **Shared Form Kit, Booking & Job Posting** | **Next Active Slice**              | `apps/mobile/components/form-kit.tsx`<br/>`apps/mobile/app/book.tsx`<br/>`apps/mobile/app/post-job.tsx`<br/>`apps/mobile/app/book.test.tsx`<br/>`apps/mobile/app/post-job-native-focus.test.ts`                                         | Form primitives upgrade, rounded choice chips, input focus states, step indicator polish, review card layout. Strictly UI-only preview; no backend, auth, network APIs, or state persistence.                                                                                                                                      |
| **Slice 4** | **Customer Activity & Booking Lifecycle**  | Pending                            | `apps/mobile/app/(tabs)/jobs.tsx`<br/>`apps/mobile/lib/lifecycle-preview.ts`<br/>`apps/mobile/app/jobs.test.ts`                                                                                                                         | Segmented control styling, milestone cards with proposed active indicator (adapted from web `.telemetry-beacon`), status chip colors, cancel state treatment.                                                                                                                                                                      |
| **Slice 5** | **BrainWorker Workspace & Action Modals**  | Pending                            | `apps/mobile/app/brainworker/workspace-preview.tsx`<br/>`apps/mobile/lib/worker-workspace-preview.ts`<br/>`apps/mobile/app/worker-workspace.test.ts`                                                                                    | Lead card visual hierarchy, price badge, bottom-sheet style confirmation modals, decline taxonomy list polish.                                                                                                                                                                                                                     |

---

## 6. Implementation Deep Dive & Acceptance Records

### 6.1 Slice 1 Completion & Acceptance Record (Committed & Pushed at `b82a365`)

Slice 1 aligned foundation tokens, shell navigation, and the home screen with the Outlier visual system:

- Target files modified and committed: `apps/mobile/lib/theme.ts`, `apps/mobile/app/(tabs)/_layout.tsx`, `apps/mobile/app/index.tsx`, `apps/mobile/app/tabs.test.ts`, `apps/mobile/app/services-discovery.test.ts`, `apps/mobile/app/job-posting-entry.test.ts`, `apps/mobile/app/content-guardrails.test.ts`, and `apps/mobile/assets/images/hero-mobile-1080.jpg`.
- Resolved CTA contrast: Adopted dedicated semantic tokens `ctaFill: #F7803C` with `ctaText: #001A41` (6.62:1 contrast in both dark and light modes, 7.49:1 pressed `#FF8D4D`), eliminating the old candidate dark mode 2.84:1 contrast blocker.
- Tab bar navigation: Active tab tint resolves to `#F7803C` (dark) and `#ABEEC8` (light) via `getStripAccentColor(tokens, tokens.amber)` on persistent navy strip.
- Owner-approved headline: Incorporated verbatim `Book a skilled local or remote worker in minutes or find flexible work that pays what you are worth only on BukieBrainJobs`.
- Outlier pill buttons: Primary CTAs use `borderRadius: 9999` with title-case labels ("Find a BrainWorker", "Become a BrainWorker", "Post a Job").

#### Slice 1 Acceptance Criteria

- [x] **Dual-Theme Verification**:
  - Dark mode renders canvas `#0B0E13`, card `#13171E`, semantic amber `#F7803C`, and primary CTA fill `#F7803C` with brand navy text `#001A41`.
  - Light mode renders canvas `#F7F9FC`, card `#FFFFFF`, semantic amber `#C2410C` (for readable text and accents only), and primary CTA fill `#F7803C` with brand navy text `#001A41` (pressed `#FF8D4D`).
  - Mobile spec strictly avoids using semantic light `amber: #C2410C` as a filled primary CTA background with white text.
  - Active tab bar tint in `app/(tabs)/_layout.tsx` resolves to dark active tint `#F7803C` and light active tint `#ABEEC8` (via `getStripAccentColor(tokens, tokens.amber)`, grounded in web `--nav-accent: #ABEEC8` on persistent navy strip), strictly avoiding semantic light amber `#C2410C`.
  - Tapping theme toggle flips mode immediately, updates AsyncStorage, and maintains high legibility.
- [ ] **Full-Surface Contrast Audit (Open / Future Target)**:
  - Text-to-background contrast >= 4.5:1 across every text/background pair in both dark and light modes was not comprehensively measured across all surfaces and remains open as a future full-surface contrast audit still to be done.
- [x] **Verified CTA Contrast & Touch Targets**:
  - Primary CTA button pair confirmed at 6.62:1 contrast (brand navy `#001A41` on coral fill `#F7803C`) and 7.49:1 pressed (`#001A41` on `#FF8D4D`), resolving the dark mode 2.84:1 contrast blocker of legacy `#FF6B35` with white text.
  - Interactive touch targets (CTA buttons, theme toggle, service links, tab items) meet minimum 48x48dp touch targets.
  - Active accessibility roles (`button`, `link`, `tab`, `header`) preserved.
  - Native-device runtime execution, screen-reader (VoiceOver/TalkBack), and hardware-dependent QA remain explicitly unverified.
- [x] **Native Home Content & Headline**:
  - Native home screen incorporates the exact owner-approved mobile headline: `Book a skilled local or remote worker in minutes or find flexible work that pays what you are worth only on BukieBrainJobs` preserved verbatim without adding punctuation.
  - Separate web homepage candidate remains uncommitted and separately unaccepted.
- [x] **Typography & Labels**:
  - Hero and action buttons use title-case typography without uppercase monospace labels.
  - Monospace is preserved only where relevant for technical metadata.
- [x] **Test & Type Integrity**:
  - All mobile unit and integration tests (`pnpm test` in `apps/mobile`) pass 100%.
  - Existing source-contract assertions in `apps/mobile/app/services-discovery.test.ts` and `apps/mobile/app/job-posting-entry.test.ts` are updated to match approved title-case `Find a BrainWorker` and `backgroundColor: c.ctaFill` contracts without introducing new behavior.
  - Mobile TypeScript check (`tsc --noEmit` / `pnpm type-check`) exits 0.

---

### 6.2 Slice 2 Completion & Acceptance Record (Committed & Pushed at `56d5ac7`)

Slice 2 refined the public discovery and service detail experience:

- **Target Files Changed**: Changed exactly and only `apps/mobile/app/(tabs)/services.tsx`, `apps/mobile/app/services/[id].tsx`, and `apps/mobile/app/services-discovery.test.ts`.
- **Architectural Preservation**: Preserved all 8 canonical services, existing routes (`/(tabs)/services`, `/services/[id]`, `/book`), and deterministic in-memory mock data behavior.
- **Visual & Component Refinement**:
  - Services Catalog (`services.tsx`): 50px search input with clear action, horizontal category filter pills with active tint, elevated service cards with category badges, streamlined local preview banner.
  - Service Detail (`services/[id].tsx`): 48x48 back button, clean typography hierarchy, soft card container for task examples, primary CTA using `ctaFill: #F7803C` with `ctaText: #001A41` meeting 48px height minimum.
- **Verification Evidence**:
  - Full mobile test suite: 229 passed across 19 files.
  - TypeScript check: `pnpm type-check` exited 0.
  - Production Android static export: `expo export --platform android` bundled cleanly with 1,430 modules.
  - Compiled Expo browser emulation: Checked catalog and detail in dark and light modes at 390x844 (standard mobile) and 375x812 (compact mobile). Report at `/tmp/bbj-mobile-slice2-qa/browser-emulation-report.json` confirms:
    - 8 service cards rendered across all viewports/modes.
    - Zero page-level horizontal overflow.
    - 50px search input height.
    - 48px CTA height and 48x48 back button touch targets.
    - CTA fill `#F7803C` with text `#001A41` in all 4 theme/viewport combinations (measures the CTA color and dimensions, not every text/background pair; full-surface contrast audit remains open).
  - Playwright interactions: Verified search filtering, search clear, category filter selection, filter reset, service detail routing, and booking navigation.
  - Verification boundary note: These are compiled browser-emulation checks, not physical native-device QA. Native-device runtime execution, screen-reader (VoiceOver/TalkBack), and hardware-dependent QA remain explicitly unverified.
  - Deployment note: Vercel canceled exact-SHA deployment `dpl_CrHz1QvqeQsoGkUWpQiSbm77TSZY` solely because mobile changes do not affect the Next.js app (skip unaffected project), not because of a failed build.

#### Slice 2 Acceptance Criteria

- [x] **Services Catalog Polish**: Modern 50px search input, rounded category pills, elevated service cards, streamlined local preview badge.
- [x] **Service Detail Polish**: 48x48 back button, structured task checklist card, navy-on-coral primary CTA.
- [x] **Contract Preservation**: 8 canonical services, routes, and mock behavior preserved without regression.
- [x] **Emulation Verification**: Zero horizontal overflow, compliant touch targets (>= 48dp), primary CTA color and dimensions verified (`#F7803C` fill with `#001A41` text, 6.62:1 contrast) across dark and light modes at 390x844 and 375x812 viewports (full-surface text contrast audit across all non-CTA pairs remains open).
- [x] **Test & Build Integrity**: 229 tests passed across 19 suites; `tsc --noEmit` exit 0; Android export 1,430 modules bundled.

---

### 6.3 Slice 3 Specification: Shared Form Kit, Booking Prep & Job Posting (Next Active Slice)

Slice 3 addresses form controls and multi-step customer input screens to align them with the Outlier design language:

- **Target Files**:
  - `apps/mobile/components/form-kit.tsx`
  - `apps/mobile/app/book.tsx`
  - `apps/mobile/app/post-job.tsx`
  - `apps/mobile/app/book.test.tsx` (and `apps/mobile/app/book.test.ts`)
  - `apps/mobile/app/post-job-native-focus.test.ts`
- **Primary Focus**:
  - Upgrade `form-kit.tsx` primitives: rounded choice chips (`borderRadius: 20`, 48dp touch target), refined input borders with amber focus ring, softened summary cards, and clean step progress indicator.
  - Refine Booking Preparation (`book.tsx`): integrate upgraded form primitives, streamline step transitions, format pricing summary rows cleanly.
  - Refine Job Posting (`post-job.tsx`): category selection chips, step progress tracker, character counter styling, review card layout.
  - Touch target compliance: all interactive form chips, counter buttons, back navigation, and submit actions meet minimum 48x48dp.
  - Color & contrast alignment: form inputs and CTA buttons follow dual-theme tokens (`ctaFill: #F7803C`, `ctaText: #001A41`, `card: #13171E` dark / `#FFFFFF` light).
- **Functional Boundaries & Explicit Exclusions**:
  - Strictly UI-only preview.
  - Preserves all mock data boundaries, sample fixtures, validation rules, and in-memory submission flows.
  - Zero backend, database, authentication, or network APIs.
  - Zero state persistence.
  - No claims of native iOS/Android runtime verification, VoiceOver/TalkBack screen reader verification, physical device safe-area insets, or physical hardware keyboard handling (these criteria remain explicitly open until real device verification is possible).

#### Slice 3 Acceptance Criteria (Target)

- [ ] **Form Primitives**: `form-kit.tsx` components support Outlier geometry, focus states, and dual-theme tokens.
- [ ] **Booking Screen Alignment**: `/book` flow renders polished step headers, rounded choice chips, and high-contrast summary cards.
- [ ] **Job Posting Screen Alignment**: `/post-job` flow renders clean category chips, progress tracker, and review cards.
- [ ] **Touch Target & Accessibility**: All interactive elements >= 48dp; contrast >= 4.5:1 in dark and light modes.
- [ ] **Test & Type Integrity**: Existing test suites pass 100%; `tsc --noEmit` exits 0; static export bundles cleanly.

---

## 7. Verification & Visual QA Protocol

Because the development environment operates in cloud/container sandboxes without attached physical iOS or Android phones, QA must follow an honest and verifiable protocol:

1. **Automated Regression Suite**:
   - Run full mobile Vitest suite (currently 229 passing tests across 19 suites).
   - Run type check (`tsc --noEmit` in `apps/mobile`).
2. **Static Production Export**:
   - Run Android static export (`expo export --platform android`) to confirm clean bundle generation and zero bundling regressions (1,430 modules bundled in Slice 2).
3. **Compiled Expo Browser Emulation**:
   - Serve compiled Expo app at 390x844 as the primary mobile viewport (modern standard phone geometry), and retain 375x812 as a narrower responsive viewport check in Playwright or headless browser.
   - Capture side-by-side screenshots in Dark Mode and Light Mode.
   - Verify visual hierarchy, typography, contrast, and spacing against web reference.
   - Automated interaction tests verify search, clear, filter selection, filter reset, and route navigation.
4. **Expo Go Verification**:
   - Verify Expo tunnel responsiveness.
   - For each current check, record the actual verification date, active Expo SDK/manifest version, and live tunnel HTTP status result. Never misrepresent compiled emulation as physical native device testing. Native-device runtime execution, screen-reader (VoiceOver/TalkBack), and hardware-dependent QA remain explicitly unverified.

---

## 8. Explicit Non-Goals & Boundaries

- **Zero Backend / Database**: No PostgreSQL, Prisma, Supabase, or API endpoint changes.
- **Zero Live Network Calls**: Retain all existing mock data boundaries, sample fixtures, and in-memory preview state.
- **Zero Routing Changes**: Route paths (`/`, `/(tabs)/services`, `/(tabs)/jobs`, `/book`, `/post-job`, `/brainworker/workspace-preview`) remain identical.
- **Zero Destructive Refactoring**: Existing unit tests and accessibility selectors must remain green.
- **No Discarding of Local Work**: Preserves all existing uncommitted candidate files for independent review.
