# MOB-VIS-001: Mobile UI-Only Visual Alignment Specification & Roadmap

**Document ID:** MOB-VIS-001

**Status:** In Progress (All 5 Planned Slices, Mobile Contrast Patch, and Post-Contrast Alignment Patches Completed & Pushed; Full-Surface Contrast Audit and Proposal-Only 12 to 16dp Card Radii Retained as Open Work)

**Governing Authority:** [THEME-001](../../docs/specs/THEME-001-light-dark-toggle.md), [.agents/skills/bukiebrainjobs-outlier-design-system](../../.agents/skills/bukiebrainjobs-outlier-design-system/SKILL.md), [docs/02-design-system/LIVE-EXPERIENCE-STANDARD.md](../../docs/02-design-system/LIVE-EXPERIENCE-STANDARD.md)

**Date:** 2026-11-11

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
| **Booking Prep** (`app/book.tsx` & `form-kit.tsx`)                  | Multi-step flow: clean step indicator, pill choice chips, subtle input borders with amber focus glow.                                                                                                                | Aligned in Slice 3 (`42e6ab7`): Upgraded form kit primitives with rounded choice chips (16 booking chips), refined input focus states, balanced summary rows, softened step headers, and compliant touch targets (>= 48px). | Completed in Slice 3 (`42e6ab7`). Upgraded `form-kit.tsx` primitives: rounded choice chips, refined input focus states, balanced summary rows, softened step headers, all tested controls >= 48px, zero horizontal overflow. |
| **Job Posting** (`app/post-job.tsx`)                                | Step-by-step progress tracker, polished character counters, category selection chips.                                                                                                                                | Aligned in Slice 3 (`42e6ab7`): Leveraged upgraded form kit primitives, rounded category chips (11 post-job chips), step progress tracker, character counter styling, review card layout, all tested controls >= 48px. | Completed in Slice 3 (`42e6ab7`). Leveraged upgraded `form-kit.tsx` primitives, aligned chip geometry, softened card surfaces and helper text, all tested controls >= 48px, zero horizontal overflow. |
| **Customer Activity & Lifecycle** (`app/(tabs)/jobs.tsx`)           | Segmented tab controls and milestone progression cards; web defines `.telemetry-beacon` in `globals.css` (animated green status pulse used in `TradesRequisitionBoard.tsx`).                                           | Aligned in Slice 4 (`f930358`): Refined segmented pill tabs for All/Active/Upcoming/Past, card elevation, static theme-aware Current step marker (dark #F7803C on #07090D; light #ABEEC8 on #001A41), and read-only cancelled sample notice with exact text "Preview record: read only". | Completed in Slice 4 (`f930358`). Refined segmented pill tabs for All/Active/Upcoming/Past, card elevation, static theme-aware Current step marker (dark #F7803C on #07090D; light #ABEEC8 on #001A41), and read-only cancelled sample notice with exact text "Preview record: read only" while maintaining existing routes and in-memory sample fixtures. |
| **BrainWorker Workspace** (`app/brainworker/workspace-preview.tsx`) | Lead cards with clear price tags, distance badges, and bottom-sheet confirmation modals.                                                                                                                             | Aligned in Slice 5 (`ed106f6`): Sample budget range label, portrait bottom sheet and centered landscape action dialogs, accessible selectable decline rows, local preview acceptance/decline notices (`No response sent, saved, or transmitted`), simulated check-in with zero GPS/mutation. | Completed in Slice 5 (`ed106f6`). Lead card visual hierarchy elevated, existing budget values labelled as sample range, action dialogs use portrait bottom sheet and centered landscape layout, decline choices formatted as accessible selectable rows, accept and decline outcomes explicitly state no response is sent, saved, or transmitted, check-in simulated with zero GPS or mutation. |

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
   - _Content Cards_: Card radius remains at the existing approved 8dp baseline. The `borderRadius: 12` to `16` entry remains strictly proposal-only and deferred, not an approved requirement or license to alter card geometry.
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
[Slice 3: Form Kit, Booking Prep & Job Posting] (COMPLETED & PUSHED - 42e6ab7)
       │
       ▼
[Slice 4: Customer Activity Hub & Lifecycle] (COMPLETED & PUSHED - f930358)
       │
       ▼
[Slice 5: BrainWorker Workspace & Modals] (COMPLETED & PUSHED - ed106f6)
       │
       ▼
[Mobile Contrast Patch: Active-Label Contrast Alignment] (COMPLETED & PUSHED - e8582d6)
       │
       ▼
[Post-Contrast Alignment Patches: Touch Targets, See All, Accessibility, Typography] (COMPLETED & PUSHED - d1c86a8)
```

### Slice Breakdown

| Slice                 | Name                                                               | Status                             | Scope & Key Files                                                                                                                                                                                                                                                                                                                                                            | Primary Focus                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| --------------------- | ------------------------------------------------------------------ | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Slice 1**           | **Foundation Tokens, Shell & Home Screen**                         | **Completed & Pushed** (`b82a365`) | `apps/mobile/lib/theme.ts`<br/>`apps/mobile/app/(tabs)/_layout.tsx`<br/>`apps/mobile/app/index.tsx`<br/>`apps/mobile/app/tabs.test.ts`<br/>`apps/mobile/app/services-discovery.test.ts`<br/>`apps/mobile/app/job-posting-entry.test.ts`                                                                                                                                   | Align Outlier color tokens, pill button geometry, tab bar styling (dark active tint `#F7803C`, light active tint `#ABEEC8`), title-case labels, exact owner-approved native-home headline, polished home header theme toggle against approved baseline, and align existing home source-contract tests to title-case and `ctaFill`.                                                                                                                                                                                                                                                                    |
| **Slice 2**           | **Discovery & Service Detail**                                     | **Completed & Pushed** (`56d5ac7`) | `apps/mobile/app/(tabs)/services.tsx`<br/>`apps/mobile/app/services/[id].tsx`<br/>`apps/mobile/app/services-discovery.test.ts`                                                                                                                                                                                                                                             | Refined services catalog and detail screens preserving 8 canonical services, routes, and mock behavior: 50px search input, rounded filter pills, card elevation, streamlined local preview badge, refined task list, 48px CTA/back button, and navy-on-coral primary CTA.                                                                                                                                                                                                                                                                                                                               |
| **Slice 3**           | **Shared Form Kit, Booking & Job Posting**                         | **Completed & Pushed** (`42e6ab7`) | `apps/mobile/components/form-kit.tsx`<br/>`apps/mobile/app/book.tsx`<br/>`apps/mobile/app/post-job.tsx`<br/>`apps/mobile/app/book.test.ts`<br/>`apps/mobile/app/post-job-native-focus.test.ts`                                                                                                                                                                              | Form primitives upgrade (`form-kit.tsx`), rounded choice chips (16 booking chips, 11 post-job chips), input focus states, step indicator polish, review card layout, touch targets >= 48px, zero horizontal overflow, disabled label contrast 10.855:1 dark and 11.555:1 light. Strictly UI-only preview; no backend, auth, network APIs, or state persistence.                                                                                                                                                                                                                                  |
| **Slice 4**           | **Customer Activity & Booking Lifecycle**                          | **Completed & Pushed** (`f930358`) | `apps/mobile/app/(tabs)/jobs.tsx`<br/>`apps/mobile/lib/lifecycle-preview.ts`<br/>`apps/mobile/app/jobs.test.ts`                                                                                                                                                                                                                                                            | Refined segmented control for All/Active/Upcoming/Past, card elevation, static theme-aware Current step marker (dark #F7803C on #07090D; light #ABEEC8 on #001A41), and read-only cancelled sample notice with exact text "Preview record: read only". Preserved in-memory samples and existing routes without backend, database, auth, network, or mutating cancellation.                                                                                                                                                                                                                          |
| **Slice 5**           | **BrainWorker Workspace & Action Modals**                          | **Completed & Pushed** (`ed106f6`) | `apps/mobile/app/brainworker/workspace-preview.tsx`<br/>`apps/mobile/lib/worker-workspace-preview.ts`<br/>`apps/mobile/app/worker-workspace.test.ts`                                                                                                                                                                                                                       | Existing budget values labelled as sample range, portrait bottom sheet and centered landscape action dialogs, accessible selectable decline rows, local preview acceptance/decline notices, simulated check-in with zero GPS/mutation. UI-only preview.                                                                                                                                                                                                                                                                                                                                              |
| **Patch**             | **Screen-Wide Contrast Patch**                                     | **Completed & Pushed** (`e8582d6`) | `apps/mobile/app/(tabs)/jobs.tsx`<br/>`apps/mobile/app/(tabs)/services.tsx`<br/>`apps/mobile/app/book.tsx`<br/>`apps/mobile/app/brainworker/register.tsx`<br/>`apps/mobile/app/brainworker/workspace-preview.tsx`<br/>`apps/mobile/app/post-job.tsx`<br/>`apps/mobile/app/services/[id].tsx`<br/>`apps/mobile/components/form-kit.tsx`<br/>Focused tests                | Improve contrast across native screens: active-label contrast light default 4.6584:1, light pressed 5.4202:1, dark default 6.4535:1, dark pressed 5.4717:1. Verified: booking focused 12/12, 3-file focused 45/45, 5-file focused 103/103, full mobile suite 263/263, type-check passed, Android export passed (1,430 modules), skill gate passed, git diff --check passed, Vercel lookup returned CANCELED for mobile-only change (no manual deployment performed). Full-surface contrast audit retained as open work.                                                               |
| **Alignment Patches** | **Touch Targets, Regression Binding, Accessibility & Typography** | **Completed & Pushed** (`d1c86a8`) | `apps/mobile/app/brainworker/register.tsx`<br/>`apps/mobile/app/worker-workspace.test.ts`<br/>`apps/mobile/app/index.tsx`<br/>`apps/mobile/app/tabs.test.ts`<br/>`apps/mobile/app/(tabs)/services.tsx`<br/>`apps/mobile/app/services/[id].tsx`<br/>`apps/mobile/app/(tabs)/jobs.tsx`<br/>`apps/mobile/app/(tabs)/profile.tsx`                                           | Accepted sequence and meanings: `fea0e3a` and `1540f2e` for 48dp touch targets (register back button and home See all); `db8f2ec` for source-bound See all regression test; `2039d34` for mobile accessibility (added headings, accessible labels on relevant controls/profile rows, and set decorative icons to accessible={false}); `d1c86a8` for Registration action typography (title case "Continue to Onboarding", removed `fontFamily: mono` from `submitLabel` and `previewLinkLabel`). Verified: full mobile test suite 268/268 passing across 19 files, mobile type-check passed, Android Expo bundle export passed with 1,430 modules (explicitly bundle-only, not APK/AAB), skill gate passed, `git diff --check` passed. Source review and export are distinguished from native-device QA: source-level contrast review found no further confirmed defects and static accessibility was reviewed, while native VoiceOver, TalkBack, and device rendering remain unverified. Full-surface rendered/native contrast audit and proposal-only 12 to 16dp card radii remain explicitly open. |

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

### 6.3 Slice 3 Completion & Acceptance Record (Committed & Pushed at `42e6ab7`)

Slice 3 aligned shared form controls, booking preparation, and job posting with the Outlier visual system:

- **Target Files Committed**: `apps/mobile/components/form-kit.tsx`, `apps/mobile/app/book.tsx`, `apps/mobile/app/post-job.tsx`, `apps/mobile/app/book.test.ts`, and `apps/mobile/app/post-job-native-focus.test.ts` committed and pushed at `42e6ab77829fa603f6115ec975cafa7605c4bf00`.
- **Accepted Scope**: Shared mobile form kit, booking prep, job-posting UI.
- **Visual & Component Refinement**:
  - Upgraded `form-kit.tsx` primitives: rounded choice chips (`borderRadius: 20`), refined input focus states with theme-aware borders, balanced summary rows, and softened step headers.
  - Booking Prep (`app/book.tsx`): integrated upgraded form primitives, 16 booking choice chips, clean step transitions, and clear pricing summary rows.
  - Job Posting (`app/post-job.tsx`): 11 category selection chips, step progress tracker, character counter styling, and review card layout.
  - Touch target compliance: all tested controls meet minimum 48px touch targets.
  - Horizontal overflow: zero horizontal overflow across all tested screens and viewports.
  - Contrast compliance: disabled label contrast confirmed at 10.855:1 in dark mode and 11.555:1 in light mode.
- **Verification Evidence**:
  - Full mobile test suite: 232 mobile tests passing across 19 files.
  - TypeScript check: `pnpm --filter @bukiebrainjobs/mobile type-check` (`tsc --noEmit`) exited 0.
  - Android Expo bundle export: `expo export --platform android` bundled cleanly (bundle export, not an APK/AAB).
  - Git hygiene: `git diff --check` exited clean with zero whitespace errors.
  - Compiled Expo browser emulation: verified at 390x844 (standard mobile) and 375x812 (compact mobile) viewports in both dark and light modes.
  - Chip counts: verified 16 booking chips and 11 post-job chips.
- **Explicit Verification Boundaries & Non-Goals**:
  - Browser-emulation/local-preview checks are not native iOS/Android proof.
  - Physical safe-area and keyboard behavior, VoiceOver/TalkBack, and full-surface contrast audit remain unverified.
  - Strictly UI-only preview: preserves all mock data boundaries, sample fixtures, validation rules, and in-memory submission flows.
  - Backend/database integration explicitly deferred (zero PostgreSQL, Prisma, JWT auth, or network APIs).
  - Vercel deployment outcome: deployment for exact commit `42e6ab77829fa603f6115ec975cafa7605c4bf00` was canceled because the monorepo skipped the unaffected Next.js project; no build failed and no manual deployment was started.

#### Slice 3 Acceptance Criteria

- [x] **Form Primitives**: `form-kit.tsx` components upgraded with Outlier geometry, focus states, rounded choice chips, and dual-theme tokens.
- [x] **Booking Screen Alignment**: `/book` flow renders polished step headers, 16 rounded choice chips, high-contrast summary rows, and touch targets >= 48px.
- [x] **Job Posting Screen Alignment**: `/post-job` flow renders 11 category selection chips, progress tracker, character counters, review cards, and touch targets >= 48px.
- [x] **Touch Target & Geometry Verification**: All tested controls meet minimum 48px touch target; zero page-level horizontal overflow across 390x844 and 375x812 viewports in dark and light modes.
- [x] **Contrast Verification**: Disabled label contrast measured at 10.855:1 dark and 11.555:1 light (browser-emulation checks; full-surface contrast audit across all surfaces remains unverified).
- [x] **Test & Build Integrity**: 232 mobile tests passing across 19 files; `tsc --noEmit` exit 0; Android Expo bundle export clean; `git diff --check` clean.

---

### 6.4 Slice 4 Completion & Acceptance Record (Committed & Pushed at `f9303584e90d16144ff78ff4dcc0ddbd86344514`)

Slice 4 completed customer activity, job tracking, and booking lifecycle presentation alignment with the Outlier design language:

- **Target Files Modified and Committed**: Changed exactly and only `apps/mobile/app/(tabs)/jobs.tsx`, `apps/mobile/lib/lifecycle-preview.ts`, and `apps/mobile/app/jobs.test.ts` committed and pushed at exact SHA `f9303584e90d16144ff78ff4dcc0ddbd86344514`.
- **Accepted Scope & Architectural Preservation**:
  - Maintained All, Active, Upcoming, and Past activity tabs.
  - Maintained in-memory samples and existing routes without alteration.
  - Added a static theme-aware Current step marker (dark #F7803C on #07090D; light #ABEEC8 on #001A41).
  - Added a read-only cancelled sample notice with exact text: `Preview record: read only`.
  - Strictly UI-only preview: zero backend, database, auth, network APIs, or mutating cancellation.
- **Verification Evidence**:
  - Focused test suite: 19/19 passed (`pnpm --filter @bukiebrainjobs/mobile test jobs.test.ts`).
  - Full mobile test suite: 237/237 passed across 19 files.
  - Mobile TypeScript check: `pnpm --filter @bukiebrainjobs/mobile type-check` (`tsc --noEmit`) passed.
  - Android Expo bundle export: `expo export --platform android` passed with 1,430 modules (bundle export, not an APK/AAB).
  - Web export: `expo export --platform web` passed with 941 modules.
  - Git hygiene: `git diff --check` passed clean.
  - Compiled Expo browser emulation: Passed at 390x844 (standard mobile) and 375x812 (compact mobile) in dark and light modes, with no horizontal overflow, and themes were restored afterward.
  - Contrast ratios verified:
    - active marker `#ABEEC8` on `#001A41` at 12.904:1 light
    - `#F7803C` on `#07090D` at 7.693:1 dark
    - cancelled light label `#DC2626` on `#FFFFFF` at 4.829:1 in normal and pressed states
    - cancelled dark label `#FF6B6B` on `#13171E` at 6.473:1
- **Explicit Verification Boundaries & Non-Goals**:
  - Native simulator/device behavior, physical safe area/keyboard, and VoiceOver/TalkBack remain explicitly unverified.
  - Full-surface contrast audit across all non-tested surfaces remains unverified.
  - Vercel deployment outcome: The exact-SHA Vercel deployment was CANCELED because the monorepo skipped the unaffected Next.js project; no build failed and no manual deployment was started.

#### Slice 4 Acceptance Criteria

- [x] **Segmented Tab Controls**: Refined segmented control with Outlier pill styling for All, Active, Upcoming, and Past.
- [x] **Milestone Progression & Current Step Marker**: Polished lifecycle milestone cards with static theme-aware Current step marker (dark #F7803C on #07090D; light #ABEEC8 on #001A41).
- [x] **Status Badge & Cancelled Notice Contrast**: High-contrast status badges and read-only cancelled sample notice with exact text `Preview record: read only` (active marker `#ABEEC8` on `#001A41` at 12.904:1 light; `#F7803C` on `#07090D` at 7.693:1 dark; cancelled light label `#DC2626` on `#FFFFFF` at 4.829:1 in normal and pressed states; cancelled dark label `#FF6B6B` on `#13171E` at 6.473:1).
- [x] **Touch Target Compliance & Layout**: Zero horizontal overflow across 390x844 and 375x812 viewports in dark and light modes, themes restored afterward.
- [x] **Test & Build Integrity**: Focused test 19/19; full suite 237/237 across 19 files; mobile type-check passed; Android Expo bundle export passed with 1,430 modules (bundle, not APK/AAB); web export passed with 941 modules; `git diff --check` passed.

---

### 6.5 Slice 5 Completion & Acceptance Record (Committed & Pushed at `ed106f6258f2ea6ca0b71940ea308b9eec6f2f3c`)

Slice 5 completed the BrainWorker workspace preview, lead alert card hierarchy, and action dialog layout alignment with the Outlier design language:

- **Target Files Modified and Committed**: Changed exactly and only `apps/mobile/app/brainworker/workspace-preview.tsx` and `apps/mobile/app/worker-workspace.test.ts` (committed and pushed at exact SHA `ed106f6258f2ea6ca0b71940ea308b9eec6f2f3c`). `apps/mobile/lib/worker-workspace-preview.ts` was not changed.
- **Accepted Scope & Architectural Preservation**:
  - Existing budget values are labelled as a sample range.
  - Action dialogs use a portrait bottom sheet and a centered landscape layout.
  - Decline choices are accessible selectable rows.
  - Accept and decline outcomes remain local preview states and explicitly state that no response is sent, saved, or transmitted.
  - Check-in remains simulated with no GPS use or check-in mutation.
  - Strictly UI-only preview: zero backend, database, auth, network, storage, payment, upload, or location API was added.
- **Verification Evidence**:
  - Focused test suite: 40/40 passed (`pnpm --filter @bukiebrainjobs/mobile test worker-workspace.test.ts`).
  - Full mobile test suite: 243/243 passed across 19 files.
  - Mobile TypeScript check: `pnpm --filter @bukiebrainjobs/mobile type-check` (`tsc --noEmit`) passed.
  - Android Expo bundle export: `expo export --platform android` passed with 1,430 modules (bundle export only, not an APK/AAB).
  - Web export: `expo export --platform web` passed with 941 modules.
  - Git hygiene: `git diff --check` passed clean.
  - Compiled Expo browser emulation: Passed at 390x844 (standard portrait), 375x812 (compact portrait), and 844x390 (landscape) in dark and light modes, with no horizontal overflow, proper modal bounds, and touch-target checks.
- **Explicit Verification Boundaries & Non-Goals**:
  - Native device, physical safe area and keyboard behavior, and screen-reader behavior (VoiceOver/TalkBack) remain unverified.
  - Full-surface contrast audit across all non-tested surfaces explicitly retained as open work.
  - Vercel deployment outcome: The exact-SHA Vercel deployment was CANCELED because the monorepo skipped the unaffected Next.js project; no build failed and no manual deployment was started.

#### Slice 5 Acceptance Criteria

- [x] **Sample Range Budget Labels**: Existing budget values clearly labelled as sample range within lead alert card.
- [x] **Responsive Action Dialog Layouts**: Action dialogs render as bottom sheet in portrait and centered layout in landscape with proper bounds.
- [x] **Accessible Decline Choice Rows**: Decline reason taxonomy rendered as accessible selectable rows with clear active states.
- [x] **Local Preview Boundaries**: Accept and decline outcomes clearly state no response is sent, saved, or transmitted; check-in remains simulated with zero GPS or mutation.
- [x] **Zero Architecture Leak**: Zero backend, database, auth, network, storage, payment, upload, or location API added.
- [x] **Test & Build Integrity**: Focused test 40/40; full mobile suite 243/243 across 19 files; mobile type-check passed; Android Expo export passed with 1,430 modules (bundle only, not APK/AAB); web export passed with 941 modules; `git diff --check` passed clean.

---

### 6.6 Mobile Contrast Patch Completion & Acceptance Record (Committed & Pushed at `e8582d605cc6ebd1c4fc2a54b08f3ecbc08fd121`)

The mobile contrast patch resolved contrast issues across native application screens and components without changing application logic or introducing backend dependencies:

- **Target Files Modified and Committed**: Changed `apps/mobile/app/(tabs)/jobs.tsx`, `apps/mobile/app/(tabs)/services.tsx`, `apps/mobile/app/book.tsx`, `apps/mobile/app/brainworker/register.tsx`, `apps/mobile/app/brainworker/workspace-preview.tsx`, `apps/mobile/app/post-job.tsx`, `apps/mobile/app/services/[id].tsx`, `apps/mobile/components/form-kit.tsx`, and updated focused test suites (`apps/mobile/app/book.test.ts`, `apps/mobile/app/jobs.test.ts`, `apps/mobile/app/post-job-native-focus.test.ts`, `apps/mobile/app/services-discovery.test.ts`, `apps/mobile/app/worker-workspace.test.ts`) committed and pushed at exact SHA `e8582d605cc6ebd1c4fc2a54b08f3ecbc08fd121` on branch `feature/mobile-accepted-slices`.
- **Accepted Scope & Architectural Preservation**:
  - Improved contrast across native screens and components.
  - Active-label contrast ratios verified:
    - Light default: 4.6584:1
    - Light pressed: 5.4202:1
    - Dark default: 6.4535:1
    - Dark pressed: 5.4717:1
  - Preserved all existing mobile routes, screens, and in-memory mock data boundaries.
  - Strictly UI-only preview: zero backend, database, auth, or network APIs added.
- **Verification Completed for the Patch**:
  - Booking focused suite: 12/12 passed.
  - Three-file focused suite: 45/45 passed.
  - Five-file focused suite: 103/103 passed.
  - Full mobile suite: 263/263 passed across 19 suites.
  - TypeScript check: type-check passed cleanly.
  - Android Expo export: passed cleanly with 1,430 modules bundled.
  - Skill gate: passed.
  - Git diff check: `git diff --check` passed cleanly.
- **Explicit Verification Boundaries & Coverage Limits**:
  - The listed verification does not itself establish browser runtime coverage or native-device/simulator visual coverage.
  - Full-surface contrast audit across all screens, states, and non-tested surfaces remains explicitly open.
  - Vercel deployment outcome: The exact-SHA Vercel lookup for commit `e8582d605cc6ebd1c4fc2a54b08f3ecbc08fd121` returned CANCELED for the mobile-only change (monorepo skipped unaffected Next.js project); no build failed and no manual deployment was performed.
  - Recorded as a completed slice, not completion of MOB-VIS-001 or the whole project.

#### Mobile Contrast Patch Acceptance Criteria

- [x] **Active-Label Contrast Compliance**: Active-label contrast meets WCAG AA standards (light default 4.6584:1, light pressed 5.4202:1, dark default 6.4535:1, dark pressed 5.4717:1).
- [x] **Native Screen Polish**: Contrast improvements applied across native screens without regression.
- [x] **Zero Architecture Leak**: Zero backend, database, auth, network, storage, payment, or upload API added.
- [x] **Test & Build Integrity**: Booking focused 12/12, 3-file focused 45/45, 5-file focused 103/103, full mobile suite 263/263 across 19 suites, type-check passed, Android Expo export passed with 1,430 modules, skill gate passed, `git diff --check` passed.
- [ ] **Full-Surface Contrast Audit (Retained Open Work)**: Comprehensive contrast audit across every surface, text pair, and state remains open.

---

### 6.7 Post-Contrast Alignment Patches Completion & Acceptance Record (Committed & Pushed at `d1c86a836df8c2de468cf2da953d2ae052b0b3b1`)

Following the screen-wide contrast patch, a sequence of focused visual and accessibility alignment patches was accepted, committed, and pushed on branch `feature/mobile-accepted-slices`:

- **Accepted Sequence and Meanings**:
  - `fea0e3a` and `1540f2e` for 48dp touch targets: standardized the register back button and home "See all" touch targets to meet the minimum 48dp accessible tap dimension.
  - `db8f2ec` for source-bound See all regression: bound regression assertions directly to the 48dp touch target and pressed state style for the home "See all" control.
  - `2039d34` for mobile accessibility: added headings, accessible labels on relevant controls/profile rows, and set decorative icons to accessible={false} across secondary tab surfaces.
  - `d1c86a8` for Registration action typography: changed visible action CTA to title case "Continue to Onboarding" and removed `fontFamily: mono` from `submitLabel` and `previewLinkLabel`, bringing registration actions into alignment with Outlier interface typography standards.
- **Target Files Modified across Patches**: `apps/mobile/app/brainworker/register.tsx`, `apps/mobile/app/worker-workspace.test.ts`, `apps/mobile/app/index.tsx`, `apps/mobile/app/tabs.test.ts`, `apps/mobile/app/(tabs)/services.tsx`, `apps/mobile/app/services/[id].tsx`, `apps/mobile/app/(tabs)/jobs.tsx`, and `apps/mobile/app/(tabs)/profile.tsx`.
- **Architectural Preservation**:
  - Preserved all existing mobile routes, screens, and in-memory mock data boundaries.
  - Preserved existing accessibility labels and interaction states.
  - Zero backend, database, auth, or network APIs added.
- **Verification Completed**:
  - Full mobile test suite: 268/268 passed across 19 files (`pnpm --filter @bukiebrainjobs/mobile test`).
  - Mobile TypeScript check: `pnpm --filter @bukiebrainjobs/mobile type-check` passed cleanly (`tsc --noEmit` exit 0).
  - Android Expo bundle export: `pnpm exec expo export --platform android` passed with 1,430 modules bundled (explicitly bundle-only, not an APK or AAB binary).
  - Skill gate: passed.
  - Git hygiene: `git diff --check` passed clean with zero whitespace errors.
- **Explicit Verification Boundaries & Coverage Limits**:
  - Source review and static export are distinguished from native-device QA.
  - Source-level contrast review found no further confirmed defects and static accessibility was reviewed, while native VoiceOver, TalkBack, and physical device rendering remain unverified.
  - The full-surface rendered/native contrast audit and all unapproved design proposals (such as 12 to 16dp card radii) remain explicitly open.
  - Card radius remains at the existing approved 8dp baseline; the 12 to 16dp card radius item remains proposal-only.
  - Recorded as completed alignment patches. MOB-VIS-001 and the overall project remain in progress; no claim is made that the full UI or project is complete.

#### Post-Contrast Alignment Patches Acceptance Criteria

- [x] **Touch Target Compliance**: Register back button and home See all controls meet minimum 48dp dimensions (`fea0e3a`, `1540f2e`).
- [x] **Source-Bound Regression**: Home See all touch target and pressed state style pinned with dedicated source test (`db8f2ec`).
- [x] **Mobile Accessibility Polish**: Added headings, accessible labels on relevant controls/profile rows, and set decorative icons to accessible={false} on secondary screens (`2039d34`).
- [x] **Registration Action Typography**: Visible CTA rendered in title case ("Continue to Onboarding") and monospace family removed from registration action labels (`d1c86a8`).
- [x] **Test & Build Integrity**: Full mobile suite 268/268 passing across 19 files, mobile type-check passed, Android Expo bundle export passed with 1,430 modules (bundle only, not APK/AAB), `git diff --check` passed.
- [ ] **Full-Surface Contrast Audit (Retained Open Work)**: Comprehensive rendered/native contrast audit across every surface, text pair, and state remains open.
- [ ] **Card Radius Adaptation (Proposal-Only / Retained Open)**: 12 to 16dp card radius remains a proposal-only roadmap item; approved baseline remains 8dp.

---

### 6.8 Program Status & Next Steps

All five planned `MOB-VIS-001` slices, the mobile contrast patch, and the post-contrast alignment patches are complete and pushed on branch `feature/mobile-accepted-slices`:
- Slice 1: Tokens, Shell & Home Screen (`b82a365`)
- Slice 2: Discovery & Service Detail (`56d5ac7`)
- Slice 3: Shared Form Kit, Booking Prep & Job Posting (`42e6ab7`)
- Slice 4: Customer Activity Hub & Lifecycle (`f930358`)
- Slice 5: BrainWorker Workspace & Modals (`ed106f6`)
- Mobile Contrast Patch: Screen-Wide Active-Label Contrast Alignment (`e8582d605cc6ebd1c4fc2a54b08f3ecbc08fd121`)
- Post-Contrast Alignment Patches: Touch Targets, See All Regression, Accessibility & Registration Typography (`d1c86a836df8c2de468cf2da953d2ae052b0b3b1`)

The overall project and `MOB-VIS-001` remain in progress. Completing these slices and alignment patches does not claim that `MOB-VIS-001` or the mobile app UI is complete.
- **Open Work**: Full-surface rendered/native contrast audit across all screens and states remains explicitly retained as open work.
- **Card Geometry**: Card radius remains at the existing approved 8dp baseline. The 12 to 16dp card radius entry is proposal-only and deferred.
- **Coverage Boundaries**: Recorded verification (source tests, type-check, and bundle export) does not establish native VoiceOver, TalkBack, or physical device visual coverage.
- **Next Scope Step**: The read-only remaining-UI audit is complete. Remaining open UI work is the full-surface rendered/native contrast audit and review of unapproved design proposals. Native device rendering and VoiceOver/TalkBack screen-reader coverage remain unverified. Continue UI-only work until the backend/database boundary; do not mark the full UI complete.
- **Stopping Boundary**: Backend and database work (Phase 5) remains explicitly deferred.

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
