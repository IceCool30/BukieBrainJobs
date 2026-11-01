# MOB-001: Native Public Discovery Specification

**Document ID:** MOB-001  
**Status:** Approved for Implementation  
**Checklist Item:** 4.2.1 Native public discovery: Homepage, category list, service detail screens  
**Governing Authority:** `docs/master-checklist.md`, `docs/04-public-website/WEB-001-HOMEPAGE.md`, `docs/04-public-website/WEB-006-SERVICES-DISCOVERY.md`, `docs/04-public-website/WEB-004-SERVICE-DETAIL.md`, `docs/03-information-architecture/SCREEN-CATALOG.md` (IA-001), `.agents/skills/bukiebrainjobs-outlier-design-system/SKILL.md`, and `.agents/skills/bukiebrainjobs-content-style/SKILL.md`

---

## 1. Executive Summary & /scope Boundary

### 1.1 Objective
Establish the native public discovery journey in `apps/mobile` across three surfaces:
1. **Standalone Public Homepage (`app/index.tsx`)**: The root stack marketing entry point without bottom tabs, preserving its existing copy, styling, and navigation behavior.
2. **Native Category Directory & Service Catalog (`app/(tabs)/services.tsx`)**: The public catalog and category filter surface within bottom tab navigation.
3. **Native Service Detail (`app/services/[id].tsx`)**: The dedicated full-screen stack view displaying an individual service category.

Existing tab screens (`app/(tabs)/home.tsx`, `app/(tabs)/jobs.tsx`, `app/(tabs)/messages.tsx`, and `app/(tabs)/profile.tsx`) remain unchanged and out of scope for item 4.2.1.

This discovery journey enables prospective customers to browse marketplace service offerings, search by trade keyword, filter by category group with text-only pills, inspect illustrative example tasks, and review service descriptions using verified, source-backed data only.

### 1.2 Route Architecture & Screen Hierarchy

The route relationships are explicit and enforce a clear boundary between the standalone marketing homepage, the in-app bottom tabs, and root stack detail screens:

```text
app/
├── _layout.tsx                     [Root Stack Navigator]
├── index.tsx                       [Standalone Public Homepage: no bottom tabs, preserved copy]
├── brainworker/
│   └── register.tsx                [Root Stack: Worker registration, preserved]
├── services/
│   └── [id].tsx                    [Root Stack: Service Detail screen]
└── (tabs)/
    ├── _layout.tsx                 [Bottom Tab Navigator: 5 tabs]
    ├── home.tsx                    [Tab 1: In-app home - UNCHANGED / OUT OF 4.2.1 SCOPE]
    ├── services.tsx                [Tab 2: Public Service Directory & Catalog - ACTIVE 4.2.1]
    ├── jobs.tsx                    [Tab 3: Customer Activity / Jobs - UNCHANGED / OUT OF 4.2.1 SCOPE]
    ├── messages.tsx                [Tab 4: In-app Messages - UNCHANGED / OUT OF 4.2.1 SCOPE]
    └── profile.tsx                 [Tab 5: Account & Settings - UNCHANGED / OUT OF 4.2.1 SCOPE]
```

Navigation pathways:
- **`app/index.tsx` (Root Stack `/`)**:
  - Preserves approved copy, layout, and behavior as accepted in 4.1.1 and 4.1.2.
  - "FIND A BRAINWORKER" button, "View all services" link, and homepage service rows navigate directly to `/(tabs)/services`.
  - Does NOT render bottom tabs; it is the dedicated standalone public landing experience.
  - Interactive elements enforce touch targets of at least 44pt on iOS and 48dp on Android.
- **`app/(tabs)/home.tsx`, `jobs.tsx`, `messages.tsx`, `profile.tsx`**:
  - Completely unchanged and strictly out of scope for item 4.2.1.
  - Zero dashboard or activity card changes.
- **`app/(tabs)/services.tsx` (Tab 2: Service Directory)**:
  - The primary public catalog screen within the bottom tab navigation.
  - Contains trade search (standard trimmed query without arbitrary character cap), text-only category group filter pills, factual local-preview notice to prevent live-availability claims, and canonical service cards.
  - Pressing any catalog service card pushes `/services/[id]` on the root stack.
  - All touch targets are at least 44pt on iOS and 48dp on Android.
- **`app/services/[id].tsx` (Root Stack `/services/[id]`)**:
  - Full-screen stack detail screen with safe-area protection and a back button returning to the caller via `router.back()`.
  - Displays service title, group badge, factual description, illustrative example tasks in the local catalog, and a clear local-preview notice preventing live-availability claims.
  - All touch targets are at least 44pt on iOS and 48dp on Android.

### 1.3 Explicit Non-Goals & Exclusions
- **Unchanged Tab Screens**: `app/(tabs)/home.tsx`, `app/(tabs)/jobs.tsx`, `app/(tabs)/messages.tsx`, and `app/(tabs)/profile.tsx` remain untouched. No dashboard, feed, or activity card work.
- **No Arbitrary Search Query Caps**: Search input performs standard string trimming (`query.trim()`) without an arbitrary 100-character cap or truncation.
- **No Booking Preparation (Item 4.2.2)**: No job posting forms, step flows, quote requests, date/time pickers, or pricing inputs.
- **No Roadmap Promises or Dummy Buttons**: No buttons promising future booking availability, no "scheduled for subsequent phase" copy, and no delivery timelines.
- **No Customer Activity Hub (Item 4.2.3)**: No active/upcoming booking cards or activity hub widgets in public discovery.
- **No Lifecycle Tracking or Offline Sync (Item 4.2.4)**: No dispatch tracking, worker locations, or check-in timelines.
- **No Geographic Coverage Statements**: `NIGERIAN_LOCATIONS` and `CANONICAL_CITIES` are strictly excluded. Active status in mock data does not prove actual geographic availability. No city lists, badges, or location filters.
- **No Price Display**: No starting prices, estimated fees, or rates (omitted to preserve strict factual neutrality and anti-slop guardrails).
- **No Star Ratings or Worker Directories**: No review scores, artisan profiles, completion percentages, or testimonials.
- **Zero Backend / Data Mutations**: Zero API endpoints, database connections, Prisma, SQL, SQLite, or network mutations.
- **Zero Push Credentials or Deployment Changes**: No push notification tokens, secrets, or CI/CD modifications.

---

## 2. /audit: Canonical Source Crosswalk

The mobile discovery experience derives strictly from existing approved sources:

| Discovery Surface | Approved Source Contract | Canonical Data Attributes Used |
|---|---|---|
| **Service Categories** | `apps/web/lib/mock/homepage-data.ts` (`SERVICE_CATEGORIES`) | `id`, `title`, `description`, `group`, `popularServices` |
| **Category Groups** | `SERVICE_CATEGORIES[].group` | Power & Cooling, Utilities & Structure, Home & Lifestyle |
| **Visual Tokens** | `apps/mobile/lib/theme.ts` (`obsidianDarkTokens`) | Canvas `#0B0E13`, Strip `#07090D`, Card `#13171E`, Divider `#202734`, Rule `#2D3748`, Main Text `#F0F4F9`, Muted Text `#8897AB`, Amber `#FF6B35`, Green `#2FE896` |
| **Navigation IA** | `docs/03-information-architecture/SCREEN-CATALOG.md` (IA-001) | Standalone root index, 5 bottom tabs, stack transition to `/services/[id]` |
| **Content Standards** | `.agents/skills/bukiebrainjobs-content-style/SKILL.md` | Direct human voice, truthful local-preview state, zero em dashes |

### 2.1 The Canonical 8 Services

All 8 services defined in `SERVICE_CATEGORIES` are represented identically:

1. **`generator`**: Generator Servicing & Repair (Group: Power & Cooling)  
   *Description:* Servicing, repairs, AVR replacement, oil changes, and rewinding for petrol and diesel generators.  
   *Example Tasks:* Sumec Firman Repair, Mikano Diesel Service, AVR Replacement.
2. **`ac`**: AC Repair & Gas Refill (Group: Power & Cooling)  
   *Description:* Installation, repairs, gas refills, compressor checks, and coil cleaning for split-unit ACs.  
   *Example Tasks:* Gas Top-Up, AC Uninstallation & Reinstall, Compressor Replacement.
3. **`plumbing`**: Plumbing & Pipe Fitting (Group: Utilities & Structure)  
   *Description:* Leak repairs, water tank work, pressure-pump setup, and bathroom fittings.  
   *Example Tasks:* Overhead Tank Setup, Pipe Leak Repair, Water Heater Installation.
4. **`electrical`**: Electrical & Solar Inverter (Group: Utilities & Structure)  
   *Description:* Solar mounting, inverter and battery setup, circuit-breaker checks, and conduit wiring.  
   *Example Tasks:* Solar Inverter Setup, Prepaid Meter Installation, Distribution Board Repair.
5. **`cleaning`**: Deep Cleaning & Post-Construction (Group: Home & Lifestyle)  
   *Description:* Deep cleaning for homes, move-ins, post-construction spaces, sofas, and carpets.  
   *Example Tasks:* Post-Construction Clean, Move-In Deep Cleaning, Sofa Washing.
6. **`carpentry`**: Furniture & Carpentry Work (Group: Home & Lifestyle)  
   *Description:* Cabinet building, wardrobe repairs, door-lock fitting, and bed-frame assembly.  
   *Example Tasks:* Kitchen Cabinet Setup, Door Lock Replacement, Wardrobe Fitting.
7. **`tv-mounting`**: DSTV & TV Wall Mounting (Group: Home & Lifestyle)  
   *Description:* TV mounting, concealed cable trunking, DSTV dish alignment, and surround-sound cabling.  
   *Example Tasks:* TV Wall Mount 32"-75", DSTV Dish Realignment, Concealed Cable Trunking.
8. **`moving`**: Haulage & Home Relocation (Group: Home & Lifestyle)  
   *Description:* Covered trucks, careful furniture packing, loading, and relocation support.  
   *Example Tasks:* 2-Bedroom Relocation, Interstate Trucking, Office Furniture Moving.

### 2.2 Explicit Omission of Geographic Locations
Mock data entries such as `NIGERIAN_LOCATIONS` with `status: 'active'` indicate planned or simulated seed locations on the web mock, not verified live coverage. Listing cities in mobile discovery implies active geographic availability that the local mobile app cannot substantiate. Therefore, city badges and coverage sections are entirely omitted from mobile discovery.

---

## 3. /architect: Technical Design & Screen Contracts

### 3.1 Shared Discovery Domain (`apps/mobile/lib/services.ts`)

A pure TypeScript domain module providing canonical data and simple query helpers:
- `CANONICAL_SERVICES`: Immutable array of the 8 canonical services.
- `SERVICE_GROUPS`: The 3 canonical category group names (`'Power & Cooling'`, `'Utilities & Structure'`, `'Home & Lifestyle'`).
- `getServiceById(id: string)`: Simple array `.find()` lookup over the 8 static services (no artificial map or dictionary optimization).
- `filterServices(services, options)`: Pure deterministic function filtering by category group and trimmed search query (case-insensitive substring match against title, description, and example tasks; no arbitrary length cap).

### 3.2 Standalone Public Homepage (`app/index.tsx`)

- **Role**: Root marketing entry point without bottom tabs.
- **Scope Status**: Preserved copy and structure as accepted in 4.1.1 and 4.1.2.
- **Safe Area**: Full inset protection (`edges={['top', 'left', 'right', 'bottom']}`).
- **Brand & Hero**: Wordmark, logo icon, approved hero title, and action buttons.
- **Featured Services**: Service rows route to `/(tabs)/services`. Touch targets are at least 44pt on iOS and 48dp on Android.
- **Directory Link**: "View all services" action navigating to `/(tabs)/services`.
- **Worker Link**: "BECOME A BRAINWORKER" action navigating to `/brainworker/register`.

### 3.3 Services Directory Screen (`app/(tabs)/services.tsx`)

- **Role**: Primary category catalog inside the bottom tab navigation.
- **Safe Area**: Tab layout manages vertical insets; screen protects horizontal edges (`edges={['left', 'right']}`).
- **Header**: The existing tab navigator title "Services" acts as the single screen heading. Do not add a duplicate title or subtitle in the scroll content.
- **Local Preview Banner**: Truthful notice: "This preview does not include live service listings or booking actions." Kept strictly to prevent live-availability claims.
- **Search Input**:
  - Accessible TextInput with search icon and clear button.
  - Standard string trimming without arbitrary character limits.
  - Live filtering against service title, description, and example tasks.
  - Touch targets for interactive elements (such as clear button) are at least 44pt on iOS and 48dp on Android.
- **Category Filter Pills**:
  - Horizontal scroll of text-only filter pills: `All`, `Power & Cooling`, `Utilities & Structure`, `Home & Lifestyle` (no icons).
  - Active pill highlighted with amber token; inactive pills in dark strip token.
  - Pill touch targets are at least 44pt on iOS and 48dp on Android.
- **Service Cards**:
  - Amber mono group tag.
  - High-contrast service title and factual two-line description.
  - Touch targets are at least 44pt on iOS and 48dp on Android, navigating to `/services/[id]`.
- **Empty State**:
  - Rendered when search and filter return zero results.
  - Displays "No matching services found" and a "Reset filters" button (at least 44pt on iOS / 48dp on Android).

### 3.4 Service Detail Stack Screen (`app/services/[id].tsx`)

- **Role**: Dedicated detail screen for an individual service category.
- **Safe Area**: Full inset protection (`edges={['top', 'left', 'right', 'bottom']}`).
- **Header**: Back button (`router.back()`) with touch target at least 44pt on iOS and 48dp on Android, and category group badge.
- **Valid Service Content**:
  - Large headline title.
  - Complete factual description.
  - "Examples in this local catalog" section: Bulleted list of canonical tasks explicitly labelled as catalog examples so as not to claim live availability.
  - Local Preview Card: Truthful notice stating "This preview does not include live service booking or worker dispatch actions." Kept strictly to prevent live-availability claims.
  - Prohibitions: No dummy booking buttons, no roadmap commitments, and no geographic coverage lists.
- **Not Found View**:
  - Rendered when `id` does not match any canonical service.
  - Alert icon, "Service Not Found" heading, and back navigation button (touch target at least 44pt on iOS and 48dp on Android).

---

## 4. Anti-Generic & Guardrail Requirements

1. **Zero Invented Metrics**: No fabricated artisan counts (e.g. 142, 98, 115), response times, or ratings.
2. **Zero Price Fabrication**: Prices are omitted from the native discovery UI to strictly adhere to content guardrails.
3. **Zero Geographic Claims**: No coverage badges, city chips, or unverified claims of service across specific cities.
4. **Zero Roadmap Slop in User Copy**: User copy must not contain "scheduled for", "subsequent phase", "upcoming", or delivery promises.
5. **Pure Dark Mode**: Strict adherence to Obsidian Titanium Gunmetal Dark tokens. Zero light mode toggles or CSS gradient strings.
6. **Platform Touch Targets**: All interactive elements (buttons, pressable cards, links, clear triggers) must provide touch targets of at least 44pt on iOS and 48dp on Android (`minHeight: 48, minWidth: 48` or platform-adaptive minimums).
7. **Code Hygiene**:
   - Each newly added function must remain strictly 25 lines or fewer.
   - Zero obvious section comments.
   - Strictly zero em dashes in code, comments, tests, and user-facing copy.

---

## 5. Test-First Implementation Plan (TDD)

1. **Domain Unit Tests (`apps/mobile/lib/services.test.ts`)**:
   - Verify array lookup for all 8 canonical services.
   - Verify group filtering across the 3 category groups.
   - Verify search query normalization (trimming without arbitrary length cap).
   - Verify query matching on title, description, and example tasks.
   - Verify unknown ID returns `undefined`.
   - Verify absence of geographic coverage lists or city data.

2. **Integration Tests (`apps/mobile/app/services-discovery.test.ts`)**:
   - Verify `_layout.tsx` registers `services/[id]`.
   - Verify `app/index.tsx` preserves current copy and routes service rows to `/(tabs)/services`.
   - Verify `app/(tabs)/services.tsx` renders search, text-only filter pills, 8 canonical services, empty state, and routes cards to `/services/[id]`.
   - Verify touch targets meet at least 44pt on iOS and 48dp on Android.
   - Verify `app/services/[id].tsx` protects safe areas, renders "Examples in this local catalog", renders local-preview notice, and handles not-found states.
   - Verify zero prices, star ratings, or invented counts across all discovery screens.

3. **Content & Guardrail Tests (`apps/mobile/app/content-guardrails.test.ts`)**:
   - Add `app/services/[id].tsx` to guardrail file checks.
   - Assert all functions remain 25 lines or fewer.
   - Assert zero section comments.
   - Assert prohibition of roadmap language (`scheduled for`, `subsequent phase`, etc.).
   - Assert prohibition of unverified claims (`across Nigeria`, `POPULAR SERVICES`, etc.).

4. **Scope & Diff Review Gates (Static Verification)**:
   - Verify via `git status` and `git diff` that `app/(tabs)/home.tsx`, `app/(tabs)/jobs.tsx`, `app/(tabs)/messages.tsx`, and `app/(tabs)/profile.tsx` remain completely untouched and out of scope for item 4.2.1.
   - No backend, database, or migration changes.
   - Allow a dependency or package upgrade only when needed for MOB-001 implementation or QA, scoped strictly to the necessary package or packages, with a short reason, Expo SDK 52 and peer-compatibility check, lockfile integrity, `expo install --check`, and relevant tests. No unrelated or bulk upgrades.
   - Verify zero em dashes across code, comments, documentation, and user-facing copy.

---

## 6. Architectural Decisions & Scope Clarifications for PM Review

| Decision Item | Resolution in Revised Spec | Status |
|---|---|---|
| **Public Homepage vs In-App Home** | `app/index.tsx` is the standalone public marketing homepage (no bottom tabs), preserving its approved copy. `app/(tabs)/home.tsx` and tabs 3 to 5 are completely unchanged and out of 4.2.1 scope. | Resolved |
| **Homepage Routing vs Catalog Routing** | `app/index.tsx` service rows route to `/(tabs)/services`. Catalog cards in `app/(tabs)/services.tsx` route to `/services/[id]`. | Resolved |
| **Touch Target Platform Standards** | Touch targets must be at least 44pt on iOS and 48dp on Android (standardizing on `minHeight: 48, minWidth: 48` or platform conditional). Replaced all 44px references. | Resolved |
| **Search Query Filtering** | Removed arbitrary 100-character cap and truncation. Standard whitespace trimming and case-insensitive substring matching used. | Resolved |
| **Category Group Filter Format** | Text-only filter pills (`All`, `Power & Cooling`, `Utilities & Structure`, `Home & Lifestyle`) without icons. | Resolved |
| **Geographic Coverage** | Completely removed `NIGERIAN_LOCATIONS`, `CANONICAL_CITIES`, and the coverage locations section. No location claims are made. | Resolved |
| **Example Tasks Terminology** | Section renamed from "Common Tasks Covered" to "Examples in this local catalog" to ensure it does not imply live service availability. | Resolved |
| **Activity Card Scope** | Empty activity card removed from discovery scope. Activity hub belongs strictly to checklist item 4.2.3. | Resolved |
| **Booking Preparation & Roadmap Copy** | Removed all booking preparation buttons, dummy buttons, and roadmap copy. Kept a clean local-preview notice: "This preview does not include live service booking or worker dispatch actions" strictly to prevent live availability claims. | Resolved |
| **Service Lookup Architecture** | Specified a straightforward `.find()` array lookup over the 8 static services rather than an O(1) map. | Resolved |
| **Catalog Header** | Existing tab navigator title "Services" acts as the single screen heading; duplicate in-page title or subtitle prohibited. | Resolved |
| **Mobile QA Gate** | Future simulator/emulator testing with screen-by-screen video recording deferred until implementation is complete. | Resolved |

---

## 7. Future Mobile QA Gate (Post-Implementation Execution)

> [!IMPORTANT]
> Do not attempt QA until implementation is complete and verified with unit and integration tests.

When executing this gate:
1. **Simulator and Emulator Environment Audit**:
   - Check native iOS simulator and Android emulator support in the active execution environment.
   - Install and configure supported simulators or Expo-compatible device emulators where the environment allows.
   - Explicitly report unavailable OS or device types, and do not claim testing on them.
2. **Screen-by-Screen and Feature-by-Feature Execution Matrix**:
   - For each available platform/OS, systematically test:
     1. Root homepage (`app/index.tsx`)
     2. Service list (`app/(tabs)/services.tsx`)
     3. Search input and live matching
     4. Text-only category group filters
     5. Empty search/filter state and reset flow
     6. Service detail screen (`app/services/[id].tsx`)
     7. Invalid service ID fallback
     8. Back navigation stack transitions
     9. Safe area handling (portrait, landscape, status bar, and home indicator)
     10. Touch targets (at least 44pt on iOS and 48dp on Android)
3. **Video Evidence Recording**:
   - Record the actual test run on video and save the evidence.
   - Accompany the recording with step-by-step verification logs.
