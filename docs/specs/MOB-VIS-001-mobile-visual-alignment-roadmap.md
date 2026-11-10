# MOB-VIS-001: Mobile UI-Only Visual Alignment Specification & Roadmap

**Document ID:** MOB-VIS-001

**Status:** Architecture Decision Recorded (Homepage Candidate Blocked on Contrast; Next Gate: Candidate Focused Fix & Slice 1 Plan)

**Governing Authority:** [THEME-001](../../docs/specs/THEME-001-light-dark-toggle.md), [.agents/skills/bukiebrainjobs-outlier-design-system](../../.agents/skills/bukiebrainjobs-outlier-design-system/SKILL.md), [docs/02-design-system/LIVE-EXPERIENCE-STANDARD.md](../../docs/02-design-system/LIVE-EXPERIENCE-STANDARD.md)

**Date:** 2026-11-10

**Target Package:** `apps/mobile`

---

## 1. Executive Summary & Objective

The product owner has assessed that the mobile application (`apps/mobile`) currently lacks visual polish and does not match the aesthetic quality, surface refinement, and brand fidelity of the approved website and PWA.

The objective of `MOB-VIS-001` is to establish a focused, stepwise, UI-only visual alignment program. This specification defines how the mobile application will adopt the visual tokens, typography hierarchy, elevation, geometry, and button language established by the Outlier design system on web/PWA, while strictly preserving:

- All existing mobile routes, screens, and navigation architectures.
- All mock data boundaries and in-memory test fixtures.
- Dual-theme functionality under `THEME-001` (dark default, light support, single toggle in home header, saved in `AsyncStorage`).
- Zero changes to backend, database, network APIs, or authentication.

---

## 2. Read-Only Screen Inventory: Source-Level Web/PWA Reference vs. Mobile

This inventory represents a source-level structural and stylistic code comparison between the approved web/PWA codebase (`apps/web`) and the current Expo mobile codebase (`apps/mobile`). It is not a recorded browser viewport test or native device runtime test.

| Screen / Flow                                                       | Web/PWA Reference Source (`apps/web`)                                                                                                                                        | Current Mobile Source (`apps/mobile`)                                                                                                           | Visual Gap & Proposed Alignment Target                                                                                                                                                                                                                                                               |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Marketing Home** (`app/index.tsx`)                                | Refined Outlier hero with rounded pill CTA (`.outlier-pill-button`), subtle dark navy backdrop, balanced typography, and responsive service list.                            | Square box buttons (`borderRadius: 8`), uppercase monospace labels (`FIND A BRAINWORKER`), raw 48dp toggle box floating between logo and title; lacks owner-approved headline. | Adopt Outlier rounded-pill CTAs (`borderRadius: 9999`), title-case labels, harmonious brand header with integrated theme toggle pill, subtle card elevation, and exact owner-approved headline (`Book a skilled local or remote worker in minutes or find flexible work that pays what you are worth only on BukieBrainJobs`). |
| **App Shell & Tabs** (`app/(tabs)/_layout.tsx`)                     | Sticky strip navigation (`--strip-bg`), subtle borders (`--lead` / `--rule`), clean tab icons with active state indicators (`--nav-accent: #ABEEC8`).                         | Flat bottom bar with hard 1px divider, monospace tab headers (`fontFamily: mono`), stark text contrast.                                         | Refine tab bar geometry with subtle active indicator (dark active tint `#F7803C`, light active tint `#ABEEC8` on persistent navy strip, not semantic amber `#C2410C`), polished header styling matching web title typography, and correct theme strip colors. |
| **Services Catalog** (`app/(tabs)/services.tsx`)                    | Search bar with smooth focus outline, rounded category filter pills, elevated service cards with category badges.                                                            | Bulky "LOCAL PREVIEW" notice banner dominating viewport, blocky search box, flat list rows with hairline borders.                               | Streamline notice banner into a subtle, non-intrusive badge; align filter pills to rounded radius; add card elevation and icon accents.                                                                                                                                                              |
| **Service Detail** (`app/services/[id].tsx`)                        | Clear typography hierarchy, pill group tag, subtle checklist card with theme-aware checkmarks, primary book action.                                                          | Heavy rectangular back button, flat checkmark list with stark monochrome styling, abrupt local preview disclaimers.                             | Refine back button geometry, introduce soft card container for task examples, harmonize amber and green accents.                                                                                                                                                                                     |
| **Booking Prep** (`app/book.tsx` & `form-kit.tsx`)                  | Multi-step flow: clean step indicator, pill choice chips, subtle input borders with amber focus glow.                                                                        | Blocky form cards, monospace section labels, dense error banners, square choice chips.                                                          | Upgrade `form-kit.tsx` primitives: rounded choice chips, refined input focus states, balanced summary rows, softened step headers.                                                                                                                                                                   |
| **Job Posting** (`app/post-job.tsx`)                                | Step-by-step progress tracker, polished character counters, category selection chips.                                                                                        | Monospace step headers, dense warning cards, blocky text inputs.                                                                                | Leverage upgraded `form-kit.tsx` primitives, align chip geometry, soften card surfaces and helper text.                                                                                                                                                                                              |
| **Customer Activity & Lifecycle** (`app/(tabs)/jobs.tsx`)           | Segmented tab controls and milestone progression cards; web defines `.telemetry-beacon` in `globals.css` (animated green status pulse used in `TradesRequisitionBoard.tsx`). | Flat segmented bar with basic underline, stark milestone timeline with hard vertical lines.                                                     | Implement refined segmented pill tabs; propose adapting an active milestone status pulse (inspired by web `.telemetry-beacon`, but clearly designated as a proposed native adaptation needing `/architect` design comparison and delegated PM approval before implementation); polish card surfaces. |
| **BrainWorker Workspace** (`app/brainworker/workspace-preview.tsx`) | Lead cards with clear price tags, distance badges, and bottom-sheet confirmation modals.                                                                                     | Dense, flat alert box, monospace metadata labels, standard centered alert modals.                                                               | Elevate lead alert card with badge styling; polish Accept/Decline action modals with rounded geometry and clean taxonomy rows.                                                                                                                                                                       |

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

| Token Role                      | Actual Web CSS Variable (`globals.css`)         | Web Dark Value | Proposed Mobile Dark Token | Web Light Value | Proposed Mobile Light Token | Token Rationale & Notes                                                                                                                                     |
| ------------------------------- | ----------------------------------------------- | -------------- | -------------------------- | --------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Canvas Background               | `--bg`                                          | `#0B0E13`      | `#0B0E13`                  | `#F7F9FC`       | `#F7F9FC`                   | Identical canvas foundation                                                                                                                                 |
| Card Background                 | `--card-bg`                                     | `#13171E`      | `#13171E`                  | `#FFFFFF`       | `#FFFFFF`                   | Standard card surface                                                                                                                                       |
| Card Border / Divider           | `--card-border` / `--lead`                      | `#202734`      | `#202734`                  | `#E2E8F0`       | `#E2E8F0`                   | Replaces mobile light `#E5E9F0` with web `--lead` `#E2E8F0`                                                                                                 |
| Subordinate Rule                | `--rule`                                        | `#2D3748`      | `#2D3748`                  | `#CBD5E1`       | `#CBD5E1`                   | Exact match to web `--rule`                                                                                                                                 |
| Main Text                       | `--text-main`                                   | `#F0F4F9`      | `#F0F4F9`                  | `#001A41`       | `#001A41`                   | High-contrast body & titles                                                                                                                                 |
| Muted Text                      | `--text-muted`                                  | `#8897AB`      | `#8897AB`                  | `#53647A`       | `#53647A`                   | Replaces mobile light `#475569` with web `--text-muted` `#53647A`                                                                                           |
| Semantic Amber (Text / Accents) | `--amber`                                       | `#F7803C`      | `#F7803C`                  | `#C2410C`       | `#C2410C`                   | Reconciles to web `--amber`. Used strictly for readable text, badges, and accents; never used as a filled primary CTA background with white text.           |
| Semantic Amber Hover / Pressed  | `--amber-hover`                                 | `#FF8D4D`      | `#FF8D4D`                  | `#9A3412`       | `#9A3412`                   | Exact match to web `--amber-hover` for interactive states on semantic amber text or outlines                                                                |
| Primary CTA Fill                | `--outlier-coral` (`.outlier-pill-button` rule) | `#F7803C`      | `#F7803C`                  | `#F7803C`       | `#F7803C`                   | Dedicated semantic primary CTA background token (`ctaFill` / `primaryCtaBg`). Coral fill in both dark and light modes, matching committed Outlier web rule. |
| Primary CTA Text / Icon         | `.outlier-pill-button` rule / `--brand-navy`    | `#001A41`      | `#001A41`                  | `#001A41`       | `#001A41`                   | Dedicated semantic primary CTA text token (`ctaText` / `primaryCtaText`). Brand navy on coral delivers 6.62:1 contrast (WCAG AA compliant).                 |
| Primary CTA Pressed             | `--outlier-coral-hover`                         | `#FF8D4D`      | `#FF8D4D`                  | `#FF8D4D`       | `#FF8D4D`                   | Dedicated semantic primary CTA pressed token (`ctaPressed` / `primaryCtaPressed`). Brand navy on pressed coral delivers 7.49:1 contrast.                    |
| Brand Green Status              | `--brand-green`                                 | `#2FE896`      | `#2FE896`                  | `#296A4B`       | `#296A4B`                   | Exact match to web `--brand-green`                                                                                                                          |
| Navigation Strip Background     | `--strip-bg`                                    | `#07090D`      | `#07090D`                  | `#001A41`       | `#001A41`                   | Header and tab bar strip                                                                                                                                    |
| Strip Text                      | `--strip-text`                                  | `#9FB2C8`      | `#9FB2C8`                  | `#D6E4F5`       | `#D6E4F5`                   | Reconciles mobile light strip text to web `--strip-text`                                                                                                    |
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

### 4.1 Uncommitted Homepage Candidate & Independent Contrast Audit

The working tree currently contains an uncommitted photo-led homepage candidate:

- Web: `apps/web/components/HeroSection.tsx`, `apps/web/app/page.test.tsx`
- Mobile: `apps/mobile/app/index.tsx`, `apps/mobile/app/content-guardrails.test.ts`, and untracked asset `apps/mobile/assets/images/hero-mobile-1080.jpg`

**Independent Review Finding (Accessibility Contrast Blocker)**:
An independent review of the mobile homepage candidate revealed a critical contrast blocker on primary CTAs:

- Current dark mode hero CTA uses legacy trades amber `#FF6B35` with white `#FFFFFF` text. The resulting contrast ratio is only 2.84:1, failing the WCAG AA minimum threshold of 4.5:1.
- Current light mode hero CTA uses deepened amber `#CC4A14` with white `#FFFFFF` text, achieving 4.61:1 contrast, but diverges from the web Outlier pill rule.
- In comparison, the approved web Outlier rule pairs brand navy text (`#001A41`) with coral fill (`#F7803C`), achieving a robust 6.62:1 contrast ratio, and 7.49:1 against pressed coral (`#FF8D4D`).

**Candidate Status (NOT YET ACCEPTED)**:

- The homepage candidate is recorded as **not yet accepted**.
- It is blocked pending a focused fix that transitions primary CTA styling to the navy-on-coral semantic tokens (`#001A41` text on `#F7803C` fill, `#FF8D4D` pressed) and completes contrast verification.
- This candidate remains strictly decoupled from the committed repository baseline (`cd9d8ee`). If the candidate is subsequently fixed and approved, it will be integrated; if rejected or altered, mobile home styling will apply to the approved committed baseline.
- **Owner-Approved Native-Home Headline**: The exact owner-approved mobile headline is `Book a skilled local or remote worker in minutes or find flexible work that pays what you are worth only on BukieBrainJobs` (preserved verbatim without adding punctuation). The committed mobile home baseline currently lacks this headline. The local photo-led candidate remains separately unaccepted until its CTA contrast blocker is fixed; do not imply it is accepted or treat its image asset as a prerequisite for adopting the approved copy. This headline is an explicit requirement for Slice 1 scope.

### 4.2 Preserved Uncommitted QA Evidence

- The specific locally modified QA evidence files in the working tree (the 4 screenshot files `docs/screenshots/expo-mob001-01-homepage-portrait.png`, `docs/screenshots/expo-mob001-02-homepage-landscape.png`, `docs/screenshots/expo-mob001-04-services-catalog-search-ac.png`, and `docs/screenshots/expo-mob001-07-service-detail-generator.png`, alongside `docs/screenshots/videos/expo-mob001-discovery-verification.webm`) are preserved, uncommitted QA evidence from an earlier verification pass.
- They are excluded from this specification change, are not part of this new spec, and are neither accepted nor discarded by this work.

---

## 5. Stepwise Implementation Sequence

To avoid sprawling changes and ensure regression-free execution, visual alignment is broken down into five sequential, bite-sized slices:

```text
[Slice 1: Tokens, Shell & Home]
       │
       ▼
[Slice 2: Discovery & Services Catalog]
       │
       ▼
[Slice 3: Form Kit, Booking Prep & Job Posting]
       │
       ▼
[Slice 4: Customer Activity Hub & Lifecycle]
       │
       ▼
[Slice 5: BrainWorker Workspace & Modals]
```

### Slice Breakdown

| Slice       | Name                                       | Scope & Key Files                                                                                                                                                                              | Primary Focus                                                                                                                                                 |
| ----------- | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Slice 1** | **Foundation Tokens, Shell & Home Screen** | `apps/mobile/lib/theme.ts`<br/>`apps/mobile/app/(tabs)/_layout.tsx`<br/>`apps/mobile/app/index.tsx`<br/>`apps/mobile/app/tabs.test.ts`<br/>`apps/mobile/app/services-discovery.test.ts`<br/>`apps/mobile/app/job-posting-entry.test.ts` | Align Outlier color tokens, pill button geometry, tab bar styling (dark active tint `#F7803C`, light active tint `#ABEEC8`), title-case labels, exact owner-approved native-home headline, polished home header theme toggle against approved baseline, and align existing home source-contract tests to title-case and `ctaFill`. |
| **Slice 2** | **Discovery & Service Detail**             | `apps/mobile/app/(tabs)/services.tsx`<br/>`apps/mobile/app/services/[id].tsx`<br/>`apps/mobile/app/services-discovery.test.ts`                                                                 | Modern search input, rounded filter pills, card elevation, streamlined local preview badge, refined task list.                                                |
| **Slice 3** | **Shared Form Kit, Booking & Job Posting** | `apps/mobile/components/form-kit.tsx`<br/>`apps/mobile/app/book.tsx`<br/>`apps/mobile/app/post-job.tsx`<br/>`apps/mobile/app/book.test.ts`<br/>`apps/mobile/app/post-job-native-focus.test.ts` | Form primitives upgrade, rounded choice chips, input focus states, step indicator polish, review card layout.                                                 |
| **Slice 4** | **Customer Activity & Booking Lifecycle**  | `apps/mobile/app/(tabs)/jobs.tsx`<br/>`apps/mobile/lib/lifecycle-preview.ts`<br/>`apps/mobile/app/jobs.test.ts`                                                                                | Segmented control styling, milestone cards with proposed active indicator (adapted from web `.telemetry-beacon`), status chip colors, cancel state treatment. |
| **Slice 5** | **BrainWorker Workspace & Action Modals**  | `apps/mobile/app/brainworker/workspace-preview.tsx`<br/>`apps/mobile/lib/worker-workspace-preview.ts`<br/>`apps/mobile/app/worker-workspace.test.ts`                                           | Lead card visual hierarchy, price badge, bottom-sheet style confirmation modals, decline taxonomy list polish.                                                |

---

## 6. Deep Dive: Slice 1 Specification (Highest Impact First Slice)

### 6.1 Target Files

- `apps/mobile/lib/theme.ts`:
  - Reconcile semantic amber tokens (`amber: #F7803C` in dark, `#C2410C` in light for readable text, badges, and accents; `amberHover: #FF8D4D` in dark, `#9A3412` in light).
  - Introduce dedicated semantic primary CTA tokens (`ctaFill: #F7803C`, `ctaText: #001A41`, `ctaPressed: #FF8D4D` in both dark and light modes, or `primaryCtaBg` / `primaryCtaText` / `primaryCtaPressed`), matching web Outlier `.outlier-pill-button` rules without large helper abstractions.
  - Reconcile surface and border tokens (`divider` mapped to web `--lead` `#E2E8F0` in light; `mutedText: #53647A` in light; `stripText: #D6E4F5` in light; preserve `stripAccent: #ABEEC8` in light grounded in web `--nav-accent: #ABEEC8`).
- `apps/mobile/app/(tabs)/_layout.tsx`: Upgrade tab bar styling (dark active tint `#F7803C`, light active tint `#ABEEC8` via `getStripAccentColor(tokens, tokens.amber)`, grounded in web `--nav-accent: #ABEEC8` on persistent navy strip, never semantic light amber `#C2410C`), title typography (standard headline font, -0.4 letter spacing), polished border.
- `apps/mobile/app/index.tsx`:
  - Add required owner-approved native-home headline: `Book a skilled local or remote worker in minutes or find flexible work that pays what you are worth only on BukieBrainJobs` preserved verbatim without adding punctuation. (The committed mobile home baseline currently lacks this headline; the local photo-led candidate remains separately unaccepted until its CTA contrast blocker is fixed, and its hero image is not a prerequisite for the approved copy).
  - Outlier pill button CTAs (`borderRadius: 9999`), title-case labels ("Find a BrainWorker", "Become a BrainWorker", "Post a Job"), primary CTAs styled using dedicated semantic tokens (`ctaFill: #F7803C` with `ctaText: #001A41`), polished theme toggle button (pill shaped with clean icon contrast), elevated service rows.
- `apps/mobile/app/tabs.test.ts`: Update navigation and shell test expectations to align with tab bar styling and active tint contracts.
- `apps/mobile/app/services-discovery.test.ts`: Update its existing source assertions for the home primary CTA from the obsolete uppercase `FIND A BRAINWORKER` and `backgroundColor: c.amber` to the approved title-case `Find a BrainWorker` and dedicated `backgroundColor: c.ctaFill` contract. Preserve all test coverage and other assertions.
- `apps/mobile/app/job-posting-entry.test.ts`: Update only its stale homepage visible-text assertion from uppercase `FIND A BRAINWORKER` to title-case `Find a BrainWorker`. Preserve the unrelated existing local `post-job view enforces __DEV__ guard` test exactly and do not include that unrelated hunk in a later commit automatically.

> [!NOTE] Legacy Source-Contract Boundary Note
> The updates to `apps/mobile/app/services-discovery.test.ts` and `apps/mobile/app/job-posting-entry.test.ts` represent legacy source-text expectation updates only, ensuring that tests tracking the home screen primary action match approved Slice 1 title-case and `ctaFill` contracts. They introduce no new behavior, no new application logic, and no runtime changes.

### 6.2 Acceptance Criteria (Slice 1)

- [ ] **Dual-Theme Verification**:
  - Dark mode renders canvas `#0B0E13`, card `#13171E`, semantic amber `#F7803C`, and primary CTA fill `#F7803C` with brand navy text `#001A41`.
  - Light mode renders canvas `#F7F9FC`, card `#FFFFFF`, semantic amber `#C2410C` (for readable text and accents only), and primary CTA fill `#F7803C` with brand navy text `#001A41` (pressed `#FF8D4D`).
  - Mobile spec strictly avoids using semantic light `amber: #C2410C` as a filled primary CTA background with white text.
  - Active tab bar tint in `app/(tabs)/_layout.tsx` resolves to dark active tint `#F7803C` and light active tint `#ABEEC8` (via `getStripAccentColor(tokens, tokens.amber)`, grounded in web `--nav-accent: #ABEEC8` on persistent navy strip), strictly avoiding semantic light amber `#C2410C`.
  - Tapping theme toggle flips mode immediately, updates AsyncStorage, and maintains high legibility.
- [ ] **Accessibility & Contrast**:
  - Text-to-background contrast >= 4.5:1 across both dark and light modes.
  - Primary CTA button achieves 6.62:1 contrast (brand navy `#001A41` on coral fill `#F7803C`) and 7.49:1 pressed (`#001A41` on `#FF8D4D`), resolving the dark mode 2.84:1 contrast blocker of `#FF6B35` with white text.
  - All interactive elements (CTA buttons, theme toggle, service links, tab items) meet minimum 48x48dp touch targets.
  - Active accessibility roles (`button`, `link`, `tab`, `header`) preserved.
- [ ] **Native Home Content & Headline**:
  - Native home screen incorporates the exact owner-approved mobile headline: `Book a skilled local or remote worker in minutes or find flexible work that pays what you are worth only on BukieBrainJobs` preserved verbatim without adding punctuation.
  - The committed mobile home baseline currently lacks this headline; its adoption in Slice 1 is required regardless of candidate status.
  - The uncommitted photo-led candidate remains separately unaccepted until its primary CTA contrast blocker is fixed; its hero image is not a prerequisite for the approved copy.
- [ ] **Typography & Labels**:
  - Hero and action buttons use title-case typography without uppercase monospace labels.
  - Monospace is preserved only where relevant for technical metadata.
- [ ] **Test & Type Integrity**:
  - All mobile unit and integration tests (`pnpm test` in `apps/mobile`) pass 100%.
  - Existing source-contract assertions in `apps/mobile/app/services-discovery.test.ts` and `apps/mobile/app/job-posting-entry.test.ts` are updated to match approved title-case `Find a BrainWorker` and `backgroundColor: c.ctaFill` contracts without introducing new behavior.
  - Mobile TypeScript check (`tsc --noEmit` / `pnpm type-check`) exits 0.

---

## 7. Verification & Visual QA Protocol

Because the development environment operates in cloud/container sandboxes without attached physical iOS or Android phones, QA must follow an honest and verifiable protocol:

1. **Automated Regression Suite**:
   - Run full mobile Vitest suite (currently 222 passing tests across 19 suites).
   - Run type check (`tsc --noEmit` in `apps/mobile`).
2. **Static Production Export**:
   - Run Android static export (`expo export --platform android`) to confirm clean bundle generation and zero bundling regressions.
3. **Compiled Expo Browser Emulation**:
   - Serve compiled Expo app at 390x844 as the primary mobile viewport (modern standard phone geometry), and retain 375x812 as a narrower responsive viewport check in Playwright or headless browser.
   - Capture side-by-side screenshots in Dark Mode and Light Mode.
   - Verify visual hierarchy, typography, contrast, and spacing against web reference.
4. **Expo Go Verification**:
   - Verify Expo tunnel responsiveness.
   - For each current check, record the actual verification date, active Expo SDK/manifest version, and live tunnel HTTP status result. Never misrepresent compiled emulation as physical native device testing.

---

## 8. Explicit Non-Goals & Boundaries

- **Zero Backend / Database**: No PostgreSQL, Prisma, Supabase, or API endpoint changes.
- **Zero Live Network Calls**: Retain all existing mock data boundaries, sample fixtures, and in-memory preview state.
- **Zero Routing Changes**: Route paths (`/`, `/(tabs)/services`, `/(tabs)/jobs`, `/book`, `/post-job`, `/brainworker/workspace-preview`) remain identical.
- **Zero Destructive Refactoring**: Existing unit tests and accessibility selectors must remain green.
- **No Discarding of Local Work**: Preserves all existing uncommitted candidate files for independent review.
