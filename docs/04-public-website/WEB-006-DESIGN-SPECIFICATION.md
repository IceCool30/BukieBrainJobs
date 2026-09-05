# WEB-006: Public Services Discovery — Design Specification

**Document ID:** WEB-006-DS  
**Status:** Approved Design Specification (Ready for Engineering)  
**Scope:** Frontend-only, mock-data-driven public website route  
**Route:** `/services`  
**Governing Authority:** `docs/04-public-website/WEB-006-SERVICES-DISCOVERY.md`, `DESIGN.md`, `docs/02-design-system/DESIGN-CANONICALIZATION.md`, and `docs/02-design-system/LIVE-EXPERIENCE-STANDARD.md`  

---

## 1. Executive Summary & Design Principles

WEB-006 defines the complete visual, interactive, responsive, and accessible experience for the public Services Discovery catalog (`/services`). 

### Core Design Principles
1. **Photo-Led Marketplace Quality:** High-contrast, authentic photography of skilled professionals in work contexts governs visual interest. No generic vector illustrations, placeholder blobs, or abstract icons as primary visuals.
2. **Restrained Color Architecture:** 
   - Deep Navy (`#001A41`) anchors headings, card frames, structural surfaces, and primary buttons.
   - Quiet Off-white (`#F8F9FF`) forms the breathable canvas surface.
   - Clean White (`#FFFFFF`) isolates cards and content containers.
   - Green (`#296A4B`) signals active category states, links, and checkmarks.
   - Mint (`#ABEEC8`) provides high-visibility focus indicators, subtle highlights, and button icons.
3. **Predictable Query & State Flow:** The URL is the single deterministic source of truth for discovery filters (`q`, `category`, `city`). Every user filter action reflects immediately in the address bar without disrupting scroll or causing page reloads.
4. **Focused Discovery Boundary:** Discovery is dedicated strictly to trade categories and job scoping. BrainWorker listings, ratings, reviews, matching algorithms, and booking submission forms are strictly prohibited from this view.

---

## 2. Visual Foundation & Design Tokens

### 2.1 Color System
| Semantic Role | Token / Hex | Tailwind Class | Contrast against Canvas / White | Usage |
|---|---|---|---|---|
| **Canvas Background** | `#F8F9FF` | `bg-[#F8F9FF]` | N/A | Base page surface |
| **Surface Card** | `#FFFFFF` | `bg-white` | N/A | Elevated card & filter bar surface |
| **Primary Brand / Text** | `#001A41` | `text-[#001A41]`, `bg-[#001A41]` | 15.2:1 (AAA) | Headings, hero background, primary CTAs, card titles |
| **Primary Hover** | `#000F2D` | `hover:bg-[#000F2D]` | 17.5:1 (AAA) | Primary button hover state |
| **Secondary Brand** | `#296A4B` | `text-[#296A4B]`, `bg-[#296A4B]` | 5.8:1 (AA) | Active tab borders, checkmark bullets, trade group badges |
| **Secondary Tint** | `#E5F6EB` | `bg-[#E5F6EB]` | N/A | Active category tab icon circle background |
| **Mint Highlight** | `#ABEEC8` | `text-[#ABEEC8]`, `bg-[#ABEEC8]` | N/A | Focus rings (`focus:ring-[#ABEEC8]`), hero accents, CTA arrow |
| **Neutral Border** | `#E2E8F0` | `border-slate-200` | 1.3:1 (UI edge) | Card borders, divider lines, filter bar outlines |
| **Subdued Text** | `#475569` | `text-slate-600` | 5.3:1 (AA) | Body copy, descriptions, common job lists |
| **Muted Text** | `#64748B` | `text-slate-500` | 3.8:1 (Large UI) | "Starting from" label, search placeholder |

### 2.2 Typography Hierarchy
- **Display Headings:** Hanken Grotesk (`font-display`, sans-serif)
  - Hero Title: `text-3xl sm:text-5xl font-extrabold tracking-tight`
  - Section / Filter Heading: `text-lg sm:text-xl font-bold tracking-tight`
  - Service Card Title: `text-lg font-bold tracking-tight text-[#001A41]`
  - Starting Price Value: `font-display text-lg sm:text-xl font-extrabold text-[#001A41]`
- **Body & Interface:** Inter (`font-sans`, sans-serif)
  - Body Copy: `text-sm sm:text-base leading-6 text-slate-600`
  - Common Job Bullets: `text-xs font-medium text-slate-700`
  - Badges & Pills: `text-[10px] sm:text-[11px] font-bold uppercase tracking-wide`
  - Button Text: `text-xs sm:text-sm font-bold`

### 2.3 Geometry, Elevation & Shadows
- **Card Radius:** `rounded-2xl` (16px) for service cards, filter bars, and modal containers.
- **Control Radius:** `rounded-xl` (12px) for search inputs, buttons, and city selector.
- **Pill Radius:** `rounded-full` (9999px) for status indicators, group chips, and location tags.
- **Elevation Shadows:**
  - Card Default: `shadow-[0_12px_30px_rgba(0,26,65,0.06)]`
  - Card Hover: `hover:shadow-[0_16px_36px_rgba(0,26,65,0.12)] hover:-translate-y-0.5`
  - Search Input: `shadow-[0_12px_30px_rgba(0,0,0,0.15)]`
  - Dropdown Menu: `shadow-[0_16px_32px_rgba(0,26,65,0.14)]`

---

## 3. Screen Layout & Component Anatomy

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ Navbar (Global Header)                                                       │
├──────────────────────────────────────────────────────────────────────────────┤
│ ServicesHero                                                                 │
│  ├── "Back to home" link                                                     │
│  ├── Heading: "Find the right service for the job."                          │
│  ├── Subtitle: "Explore common services, review starting price..."           │
│  └── Search Input with Clear Button [Search by service, trade, or job     ⌕] │
├──────────────────────────────────────────────────────────────────────────────┤
│ FilterControlBar                                                             │
│  ├── CategoryFilterRail: [All] [Generator] [AC] [Plumbing] [Electrical] ... │
│  ├── CityFilterDropdown: [All cities ▾] (Lagos, Abuja, PH, Ibadan, etc.)     │
│  └── ResultsAnnouncer: "8 service categories shown"                          │
├──────────────────────────────────────────────────────────────────────────────┤
│ ServiceGrid                                                                  │
│  ┌─────────────────────────┐ ┌─────────────────────────┐ ┌─────────────────┐ │
│  │ ServiceCard             │ │ ServiceCard             │ │ ServiceCard     │ │
│  │ ├── 5:3 Photo + Price   │ │ ├── 5:3 Photo + Price   │ │ ├── 5:3 Photo   │ │
│  │ ├── Group Chip          │ │ ├── Group Chip          │ │ ├── Group Chip  │ │
│  │ ├── Title & Description │ │ ├── Title & Description │ │ ├── Title & Desc│ │
│  │ ├── Common Jobs (3)     │ │ ├── Common Jobs (3)     │ │ ├── Common Jobs │ │
│  │ └── Price & Review CTA  │ │ └── Price & Review CTA  │ │ └── Price & CTA │ │
│  └─────────────────────────┘ └─────────────────────────┘ └─────────────────┘ │
├──────────────────────────────────────────────────────────────────────────────┤
│ BukieGuaranteeNotice (Footer trust banner)                                   │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 3.1 Component 1: `ServicesHero`
- **Container:** Minimum height 390px (mobile) to 432px (desktop). Background Deep Navy `#001A41`.
- **Background Media:** Full-bleed image `/images/service-electrical.jpg` positioned at right (58% width on desktop, 100% on mobile) with linear gradient from Deep Navy `#001A41` (100% left) to transparent overlay (right).
- **Back Navigation:** Accessible inline text link with `ArrowLeft` icon (16px), text "Back to home", text-slate-200 hover:text-white. Minimum touch height 44px.
- **Headings:**
  - `<h1>`: "Find the right service for the job."
  - `<p>`: "Explore common services, review the starting price, and prepare the details you need before you continue." If a valid city filter is active (e.g. Lagos), appends: " Showing services in Lagos."
- **Search Input Bar:**
  - Max width 576px (2xl).
  - Background White `#FFFFFF`, border-white/20, height 48px (12 units), radius `rounded-xl`.
  - Left icon: `Search` icon (16px) in text-slate-400.
  - Text input: `type="search"`, placeholder "Search by service, trade, or job", font-medium text-slate-900.
  - Clear button: Appears when query is non-empty; `X` icon (16px) with accessible label "Clear search".

### 3.2 Component 2: `FilterControlBar`
- **Surface:** White `#FFFFFF`, 1px solid border `border-slate-200`, radius `rounded-2xl`, internal padding 16px to 20px.
- **Top Row (Flex Container):**
  - Left: Section title "Browse by category" (`text-lg font-bold text-[#001A41]`) and dynamic result count badge (`role="status"`, `text-sm text-slate-600`).
  - Right: `CityFilterDropdown` trigger button.
- **Category Filter Rail:**
  - Horizontal scrollable row with `-mx-1 px-1` overflow protection and fade masks on mobile edges.
  - Buttons: 9 total (1 "All services" + 8 canonical trade categories).
  - Button states:
    - **Inactive:** Transparent border, text-slate-700, icon container `bg-slate-50`. Hover: text-[#001A41] and border-slate-200.
    - **Active:** Bottom border 2px `#296A4B`, text `#001A41`, icon container `bg-[#E5F6EB]`. `aria-pressed="true"`.
  - Icon & Label: `ServiceTaskIcon` (32px to 36px) wrapped in circular background (40px to 44px), with label underneath (`text-[10px] sm:text-[11px] font-bold`).

### 3.3 Component 3: `CityFilterDropdown`
- **Trigger Button:** Compact pill or rounded-xl button with `MapPin` icon (14px), active city label (e.g. "Lagos" or "All cities"), and `ChevronDown` icon (14px).
  - Normal state: `border border-slate-200 bg-white text-slate-700 hover:border-slate-300`.
  - Filter active state: `border-[#296A4B] bg-[#EAF7EF] text-[#296A4B] font-bold`.
- **Dropdown Menu:**
  - Absolute positioning, z-index 40, top full + 8px, right-aligned, width 240px.
  - White surface, `rounded-xl border border-slate-200 shadow-[0_16px_32px_rgba(0,26,65,0.14)]`.
  - Options list:
    1. "All active cities" (clears city filter)
    2. Lagos (State: Lagos State)
    3. Abuja (FCT) (State: Federal Capital Territory)
    4. Port Harcourt (State: Rivers State)
    5. Ibadan (State: Oyo State)
    6. Enugu (State: Enugu State)
    7. Kano (State: Kano State)
    8. Benin City (State: Edo State)
  - Active checkmark indicator (`Check` icon in text-[#296A4B]) next to the currently selected city.

### 3.4 Component 4: `ServiceCard`
- **Dimensions & Structure:** Flexible column card with fixed 5:3 photo aspect ratio on top, flexible content body, and sticky-bottom action bar.
- **Media Header:**
  - 5:3 aspect ratio photo container with `overflow-hidden`.
  - Photo rendered with `object-cover object-center`.
  - Bottom vignette: subtle dark gradient overlay `from-[#001A41]/55 to-transparent` to ensure contrast for the starting price tag.
  - Top-Left Tag: White pill badge `bg-white px-2.5 py-1 text-[11px] font-bold text-[#001A41] shadow-sm rounded-lg` displaying: "From {startingPrice}".
  - Top-Right Chip: Trade group chip `bg-[#001A41]/80 backdrop-blur-sm text-[#ABEEC8] px-2 py-0.5 text-[10px] font-bold uppercase rounded-md tracking-wider` displaying: `Power & Cooling`, `Utilities & Structure`, or `Home & Lifestyle`.
- **Card Body:**
  - Title: `h2` heading with `font-display text-lg font-bold text-[#001A41] tracking-tight`.
  - Description: `text-sm text-slate-600 leading-6 mt-2 line-clamp-2`.
  - Common Jobs List: `ul` with `aria-label="Common jobs covered"`, displaying up to 3 bullets:
    - Bullet bullet dot: `h-1.5 w-1.5 rounded-full bg-[#296A4B]`.
    - Text: `text-xs font-medium text-slate-700`.
- **Action Footer:**
  - Divider: 1px top border `border-slate-100 mt-6 pt-4`.
  - Left price callout: "Starting from" (11px uppercase slate-500) and starting price amount (`text-lg font-extrabold text-[#001A41]`).
  - Right Action Button: "Review details" button with `ArrowRight` icon (16px text-[#ABEEC8]).
    - Min touch height: 44px (`min-h-11`).
    - Base style: `bg-[#001A41] text-white px-4 text-xs font-bold rounded-xl hover:bg-[#000F2D]`.
    - Focus style: `focus-visible:ring-2 focus-visible:ring-[#ABEEC8] focus-visible:ring-offset-2`.

### 3.5 Component 5: `ServiceEmptyState`
- **Container:** Centered card in grid area. White background, `rounded-2xl border border-slate-200 p-8 sm:p-12 text-center shadow-sm`.
- **Visual:** Circular icon container (56px) `bg-slate-100 text-slate-400 mx-auto flex items-center justify-center rounded-full` with `SearchX` icon (28px).
- **Title:** `font-display text-xl sm:text-2xl font-bold text-[#001A41]` — "No services match that search".
- **Description:** `text-sm text-slate-600 max-w-md mx-auto mt-2 leading-6` — "We could not find any service matching \"{query}\". Try a broader trade name, or reset the filters to browse all categories."
- **Action CTA:** Button `bg-[#001A41] text-white text-sm font-bold min-h-11 px-5 rounded-xl hover:bg-[#000F2D]` — "Reset filters". Clicking clears search query and resets category to "All".

### 3.6 Component 6: `InformationalNoticeBanner`
- **Visual Style:** Light blue/emerald neutral banner `bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl p-4 flex items-start gap-3 text-slate-800`.
- **Icon:** `Info` icon (20px) in `#1D4ED8` or `#296A4B`.
- **Copy for Invalid City:** "We currently operate in 7 active Nigerian cities. Location \"{input}\" is not active yet, so we're displaying services available nationwide."
- **Copy for Invalid Category:** "The requested category was not recognized. Showing all available service categories."

---

## 4. State Matrix & Interactive Behaviors

### 4.1 State 1: Default State (`/services`)
- **URL:** `/services` (no search parameters).
- **Active Elements:** "All services" category pill active. City filter set to "All cities". Search input empty.
- **Results Count:** "8 service categories shown".
- **Grid:** All 8 canonical cards displayed in 3-column desktop grid.

### 4.2 State 2: 8 Canonical Categories Presentation
The 8 canonical categories are displayed with their authentic assets, pricing, and groupings:

| Category ID | Title | Group | Price | Photo Path | Key Common Jobs |
|---|---|---|---|---|---|
| `generator` | Generator Servicing & Repair | Power & Cooling | From ₦10,000 | `/images/service-generator.jpg` | Sumec Firman Repair, Mikano Diesel Service, AVR Replacement |
| `ac` | AC Repair & Gas Refill | Power & Cooling | From ₦12,000 | `/images/service-ac.jpg` | Gas Top-Up, AC Uninstallation & Reinstall, Compressor Replacement |
| `plumbing` | Plumbing & Pipe Fitting | Utilities & Structure | From ₦8,000 | `/images/service-plumbing.jpg` | Overhead Tank Setup, Pipe Leak Repair, Water Heater Installation |
| `electrical` | Electrical & Solar Inverter | Utilities & Structure | From ₦15,000 | `/images/service-electrical.jpg` | Solar Inverter Setup, Prepaid Meter Installation, Distribution Board Repair |
| `cleaning` | Deep Cleaning & Post-Construction | Home & Lifestyle | From ₦15,000 | `/images/service-cleaning.jpg` | Post-Construction Clean, Move-In Deep Cleaning, Sofa Washing |
| `carpentry` | Furniture & Carpentry Work | Home & Lifestyle | From ₦10,000 | `/images/service-carpentry.jpg` | Kitchen Cabinet Setup, Door Lock Replacement, Wardrobe Fitting |
| `tv-mounting` | DSTV & TV Wall Mounting | Home & Lifestyle | From ₦7,500 | `/images/service-tv-mounting.jpg` | TV Wall Mount 32"-75", DSTV Dish Realignment, Concealed Cable Trunking |
| `moving` | Haulage & Home Relocation | Home & Lifestyle | From ₦25,000 | `/images/service-moving.jpg` | 2-Bedroom Relocation, Interstate Trucking, Office Furniture Moving |

### 4.3 State 3: Search State (`/services?q=solar`)
- **Trigger:** User types "solar" into the hero search input.
- **Interaction:** Input updates immediately on keystroke; URL updates with `?q=solar` after a 300ms debounce via `router.replace(..., { scroll: false })`.
- **Card Filtering:** Matches `electrical` ("Electrical & Solar Inverter").
- **Results Count:** "1 service category shown".
- **Clear Action:** Clicking the "X" button clears the input, resets results to 8, and removes `q` from the URL.

### 4.4 State 4: Category-Filtered State (`/services?category=ac`)
- **Trigger:** User clicks the "AC repair" pill in the category rail.
- **Interaction:** Category pill activates immediately with green underline border; URL updates immediately with `?category=ac`.
- **Card Filtering:** Shows only `ac` ("AC Repair & Gas Refill").
- **Results Count:** "1 service category shown".
- **Reset Action:** Clicking "All services" pill resets category to All and deletes `category` from URL.

### 4.5 State 5: City-Filtered State (`/services?city=Lagos`)
- **Trigger:** User selects "Lagos" from the City Filter dropdown.
- **Interaction:** Dropdown closes; trigger displays "Lagos" with green badge; URL updates to `?city=Lagos`.
- **Hero Subtitle:** Displays: "...Showing services in Lagos."
- **Detail Handoff:** Clicking "Review details" on any card passes `?city=Lagos` forward to `/services/[serviceId]?city=Lagos`.

### 4.6 State 6: Combined Filter State (`/services?category=power&city=Abuja+%28FCT%29&q=diesel`)
- **Trigger:** Category set to `generator`, city set to `Abuja (FCT)`, search term set to `diesel`.
- **Evaluation:** Evaluates intersection of active filters. Shows `generator` card matching "Mikano Diesel Service".
- **Results Count:** "1 service category shown".

### 4.7 State 7: Zero-Result State (`/services?q=unobtainium`)
- **Trigger:** Search term or filter combination matches 0 service categories.
- **Grid Replacement:** Grid renders `ServiceEmptyState`.
- **Results Count:** "0 service categories shown".
- **CTA:** "Reset filters" button restores all filters and cleans URL.

### 4.8 State 8: Invalid / Inactive City State (`/services?city=Atlantis`)
- **Trigger:** User loads URL with an unrecognized or non-active city parameter.
- **Sanitization:** `validateCity('Atlantis')` returns `undefined`.
- **UI Behavior:** Does NOT crash or redirect. Displays `InformationalNoticeBanner`: "We currently operate in 7 active Nigerian cities. Location 'Atlantis' is not active yet, so we're displaying services available nationwide."
- **Grid:** All services shown under nationwide scope. URL cleaned on subsequent user filter change.

### 4.9 State 9: Invalid Category State (`/services?category=spaceship`)
- **Trigger:** User loads URL with an invalid category parameter.
- **Sanitization:** Category ID is checked against `SERVICE_CATEGORIES.some(c => c.id === id)`. Fails validation.
- **UI Behavior:** Category tab falls back to "All services". Displays `InformationalNoticeBanner`: "The requested category was not recognized. Showing all available service categories."
- **Grid:** All 8 services rendered.

### 4.10 State 10: Unknown Service State (`/services/invalid-id`)
- **Trigger:** User navigates to a non-existent service detail page.
- **Handling:** Governed by `WEB-004`. Next.js triggers `notFound()`, rendering the branded 404 page with a primary link "Back to services".

---

## 5. Responsive Design & Breakpoint Specifications

| Breakpoint | Width Range | Grid Columns | Hero Layout | Category Rail | Bottom Nav |
|---|---|---|---|---|---|
| **Desktop Wide** | `>= 1440px` | 3 Columns (`grid-cols-3`, gap 24px) | Max 1280px container, 58% photo overlay at right, left text content | Full width, all 9 items visible | None |
| **Desktop Standard** | `1024px – 1439px`| 3 Columns (`grid-cols-3`, gap 20px) | Max 1280px container, photo overlay at right | Horizontal scrollable with soft fade | None |
| **Tablet** | `768px – 1023px` | 2 Columns (`grid-cols-2`, gap 20px) | 64% photo overlay, compact hero padding (py-12) | Horizontal swipe rail, touch-friendly | None |
| **Mobile Standard** | `390px – 767px` | 1 Column (`grid-cols-1`, gap 16px) | Full bleed photo background with 88% navy overlay, py-10 | Horizontal scroll with visible right edge peek | **None** (per `PLAT-002`) |
| **Mobile Small** | `375px` (iPhone SE)| 1 Column (`grid-cols-1`, gap 16px) | Compact hero (min 390px height), single column text | 44px min touch buttons, zero horizontal overflow | **None** (per `PLAT-002`) |

---

## 6. Two-Way Navigation & Return-Path Contract

### 6.1 Forward Transition: Directory to Service Detail
When a customer clicks "Review details" on a service card:
```typescript
const handleReviewDetails = (serviceId: string) => {
  const params = new URLSearchParams();
  if (city) params.set('city', city);
  // Optional return context preservation
  if (selectedCategory && selectedCategory !== 'All') params.set('returnCategory', selectedCategory);
  if (searchQuery.trim()) params.set('returnQ', searchQuery.trim());
  
  const query = params.toString();
  router.push(`/services/${serviceId}${query ? `?${query}` : ''}`);
};
```

### 6.2 Backward Transition: Detail back to Directory (`WEB-004` Back Link)
The "Back to services" link on `/services/[serviceId]` parses return context:
- If `returnCategory` or `returnQ` are present: `/services?category=${returnCategory}&q=${returnQ}&city=${city}`.
- If only `city` is present: `/services?city=${city}`.
- If no query: `/services`.

### 6.3 Backward Transition: BrainWorker Profile back to Directory (`WEB-005` Return Contract)
When returning from `/brainworkers/[brainworkerId]` via `buildPublicBrainWorkerServicesUrl`:
- URL format: `/services?category=${service.id}&q=${encodeURIComponent(service.title)}&city=${encodeURIComponent(city)}`.
- The directory page initializes:
  - `selectedCategory` = `service.id`
  - `searchQuery` = `service.title`
  - `city` = `city`
- Results view: Immediately displays the exact matching service card, pre-filtered for the customer.

---

## 7. Accessibility Specification (WCAG 2.1 AA)

### 7.1 Heading Structure
- `<h1>`: "Find the right service for the job." (Hero section)
- `<h2>`: "Browse by category" (Controls section)
- `<h2>`: "{Category Title}" (Inside each `ServiceCard`)
- `<h2>`: "Get clear on the job details." (BukieGuarantee section)

### 7.2 ARIA Semantics & Live Regions
- **Results Count:** `<p role="status" aria-live="polite" className="mt-1 text-sm text-slate-600">8 service categories shown</p>`
- **Category Filter Tabs:**
  ```tsx
  <div role="group" aria-label="Filter service categories">
    <button type="button" aria-pressed={isActive} ...>
  ```
- **City Dropdown:**
  ```tsx
  <button type="button" aria-haspopup="listbox" aria-expanded={isOpen} aria-label="Filter by city: currently {city}">
  <ul role="listbox" aria-label="Active Nigerian cities">
    <li role="option" aria-selected={isSelected}>
  ```
- **Decorative Media:** All decorative icons (`Search`, `MapPin`, `ArrowRight`, `ChevronDown`, `CheckCircle2`) explicitly marked with `aria-hidden="true"`.

### 7.3 Keyboard Navigation & Focus Rings
- All interactive controls (buttons, links, search input, dropdown items) are reachable via sequential `Tab` navigation.
- Focus rings are styled with high-contrast Mint `#ABEEC8`:
  `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ABEEC8] focus-visible:ring-offset-2`
- Touch targets strictly respect minimum 44x44 CSS pixels across mobile and desktop.
- Reduced motion: Wrapped with Tailwind motion utilities respecting `prefers-reduced-motion: reduce`.

---

## 8. Customer-Facing Terminology & Copy Standards

| Context | Exact Approved Copy | Prohibited Variations |
|---|---|---|
| **Page Title** | Find the right service for the job. | Explore Our Gigs, Find Workers |
| **Subtitle** | Explore common services, review the starting price, and prepare the details you need before you continue. | Hire artisans fast, Best freelancers in Nigeria |
| **Search Placeholder** | Search by service, trade, or job | Search tasks, Search workers |
| **Price Prefix** | Starting from / From ₦X,XXX | Fixed rate, Guaranteed price |
| **CTA Button** | Review details | Book now, Hire worker, Instant book |
| **Empty State Title** | No services match that search | Zero results found, Nothing here |
| **Empty State Action** | Reset filters | Clear, Start over |
| **Trust Card Title** | Get clear on the job details. | Safe Escrow Guarantee, Hire with confidence |
| **Trust Card CTA** | Read BukieGuarantee | Escrow details, Terms |

---

## 9. Engineering Handoff Notes & Guardrails

1. **State Management:** Implement via Next.js client component (`'use client'`) wrapped in `<Suspense fallback={<ServicesDirectorySkeleton />}>`.
2. **Debounce Implementation:** Use a custom hook or timer ref for the 300ms search input debounce to prevent rapid router pushes.
3. **Shallow Replacement:** Use `router.replace(url, { scroll: false })` to avoid scrolling the user to top while typing or filtering.
4. **Data Isolation:** Strictly consume data from `apps/web/lib/mock/homepage-data.ts`. Do not introduce new data files or connect to Prisma/APIs.
