# WEB-006: Public Services Discovery

**Document ID:** WEB-006  
**Status:** Approved Product & UX Specification (Ready for Design)  
**Scope:** Frontend-only, mock-data-driven public website route  
**Route:** `/services`  
**Depends on:** Current approved live experience, `WEB-001`, `WEB-003`, `WEB-004`, `WEB-005`, `PLAT-002`, and `apps/web/lib/mock/homepage-data.ts`  

---

## 1. Product Brief

### 1.1 Purpose
WEB-006 formalizes the customer discovery journey on `/services` by establishing a deterministic, responsive, and accessible Services Discovery catalog. It bridges public exploration (from the homepage search, category rail, and footer links) with dedicated service-detail reviews (`WEB-004`) and eventual booking preparation (`/book`).

### 1.2 User and Primary Job
- **Primary user:** A customer looking to explore available home, commercial, and lifestyle trade services, verify starting prices, inspect common jobs covered, and select a service to review in detail.
- **Primary user job:** "Find the right service for my job, understand what it covers and costs in my city, and move forward to review details."
- **Primary call-to-action (CTA):** "Review details" on individual service cards, leading directly to `/services/[serviceId]`.
- **Secondary actions:** Filter by trade category, search by trade/job keyword, filter by active Nigerian city, or return to home.

### 1.3 Marketplace Role & Boundary
- **Role:** Category-level exploration and preliminary job scoping.
- **Explicit Boundary:** `/services` is strictly **service category discovery**, not BrainWorker matching or directory listing. It does not list individual BrainWorkers, does not rank or score workers, does not evaluate worker availability, and does not accept booking submissions or payments. Matching occurs exclusively post-booking in Milestone 4 and Milestone 6.

---

## 2. UX Specification

### 2.1 Information Architecture & User Flow

```text
[ Homepage Search / Category Rail / PWA Home ]
                      │
                      ▼
        [ /services (WEB-006 Discovery) ]
        ├── Search Keyword (q)
        ├── Category Filter (category)
        └── Active City Filter (city)
                      │
            ("Review details" CTA)
                      │
                      ▼
      [ /services/[serviceId] (WEB-004 Detail) ]
                      │
             ("Continue to booking")
                      │
                      ▼
         [ /book (Booking Preparation) ]
```

### 2.2 Canonical URL and Query-State Synchronization

The route must maintain bidirectional synchronization between React component state and browser URL search parameters:

| Parameter | Type | Validation & Canonical Rule | Default / Omitted Value |
|---|---|---|---|
| `q` | `string` | Trimmed, URL-decoded string. Case-insensitive text match against `category.title`, `category.description`, and `category.popularServices`. | If empty or whitespace-only, omitted from URL query string. |
| `category` | `string` | Must strictly match one of the 8 canonical `id`s in `SERVICE_CATEGORIES` (`generator`, `ac`, `plumbing`, `electrical`, `cleaning`, `carpentry`, `tv-mounting`, `moving`), or `'all'`. | If `'all'` (case-insensitive) or absent, omitted from URL (treated as unconstrained 'All' state; does not display invalid notice). If unrecognized, falls back to 'All' with a non-blocking recovery notice. |
| `city` | `string` | Must strictly match one of the 7 active cities in `NIGERIAN_LOCATIONS` (`status: 'active'`). | If absent or invalid, omitted from URL (treated as nationwide/all active cities). |

#### Synchronization Rules:
1. **Initial Load / Deep Link:** Component state is seeded directly from the incoming URL search parameters.
2. **User Interaction:**
   - **Search input:** Updates local input immediately; updates URL search parameters via debounced router replacement (`300ms`) using `router.replace` with `scroll: false` so browser history remains clean.
   - **Debounce cancellation:** Any pending search debounce timer must be cancelled immediately prior to competing filter mutations (category selection, city selection, filter reset), navigation away (clicking "Review details"), and component unmount.
   - **Category selection:** Updates immediately upon clicking a category tab/pill; updates URL with `category=<id>`. Clicking "All services" deletes the `category` parameter from the URL.
   - **City selection:** Updates immediately upon selecting an active city; updates URL with `city=<active-city>`. Selecting "All cities" deletes `city` from the URL.
3. **Browser Navigation:** Popstate events (Browser Back / Forward) re-synchronize local React state with updated URL parameters without infinite re-render loops.
4. **Clean URLs:** When all parameters are at defaults (`q=""`, `category="all"`, `city=undefined`), the URL is normalized cleanly to `/services`.


### 2.3 Directory-to-Service-Detail Return Context

To maintain continuity when moving between discovery and detail:
1. **Forward Navigation to Detail:**
   - Clicking "Review details" navigates to `/services/[serviceId]?city=${encodeURIComponent(city)}` (preserving active city).
   - Return state (`from=services`, `returnCategory`, `returnQ`) is supported so the customer can return to their exact filtered view.
2. **Return from Service Detail (`WEB-004` Back Link):**
   - The "Back to services" link on `/services/[serviceId]` returns to `/services?city=${encodeURIComponent(city)}` (or full return parameters when present), preserving the customer's exploration context.
3. **Return from BrainWorker Profile (`WEB-005` Return Contract):**
   - `WEB-005` profile links back via `buildPublicBrainWorkerServicesUrl`:  
     `/services?category=${context.service.id}&q=${encodeURIComponent(context.service.title)}&city=${encodeURIComponent(context.city)}`
   - WEB-006 must seamlessly parse this incoming query, activate the category tab, populate the search field, and display the matching service card without error.

---

## 3. Screen and State Specification

### 3.1 Primary Directory Layout
- **Hero Section:**
  - Navy background (`#001A41`) with subtle service photography overlay (`/images/service-electrical.jpg`) with an editorial navy-to-transparent gradient.
  - "Back to home" link (`/`) with left arrow icon.
  - Headline: "Find the right service for the job."
  - Subtitle: "Explore common services, review the starting price, and prepare the details you need before you continue." If a valid city is active, append: "Showing services in {city}."
  - Central search bar with clear icon, search icon, and accessible label.
- **Controls & Filter Bar:**
  - White surface with thin neutral border (`border-slate-200`) and soft navy shadow.
  - Category horizontal tab rail with iconic visual indicators (`ServiceTaskIcon`) and concise labels.
  - Active City Selector dropdown or pill list displaying the 7 active cities plus "All cities".
  - Results counter: Dynamic live-region text: `"{count} service categories shown"`.
- **Service Cards Grid:**
  - Responsive grid displaying filtered results.

### 3.2 Canonical Eight-Category Inventory & Group Presentation

The catalog consists of exactly 8 canonical services organized across 3 trade groups:

| Group | Category ID | Canonical Title | Starting Price | Key Common Jobs |
|---|---|---|---|---|
| **Power & Cooling** | `generator` | Generator Servicing & Repair | ₦10,000 | Sumec Firman Repair, Mikano Diesel Service, AVR Replacement |
| **Power & Cooling** | `ac` | AC Repair & Gas Refill | ₦12,000 | Gas Top-Up, AC Uninstallation & Reinstall, Compressor Replacement |
| **Utilities & Structure** | `plumbing` | Plumbing & Pipe Fitting | ₦8,000 | Overhead Tank Setup, Pipe Leak Repair, Water Heater Installation |
| **Utilities & Structure** | `electrical` | Electrical & Solar Inverter | ₦15,000 | Solar Inverter Setup, Prepaid Meter Installation, Distribution Board Repair |
| **Home & Lifestyle** | `cleaning` | Deep Cleaning & Post-Construction | ₦15,000 | Post-Construction Clean, Move-In Deep Cleaning, Sofa Washing |
| **Home & Lifestyle** | `carpentry` | Furniture & Carpentry Work | ₦10,000 | Kitchen Cabinet Setup, Door Lock Replacement, Wardrobe Fitting |
| **Home & Lifestyle** | `tv-mounting` | DSTV & TV Wall Mounting | ₦7,500 | TV Wall Mount 32"-75", DSTV Dish Realignment, Concealed Cable Trunking |
| **Home & Lifestyle** | `moving` | Haulage & Home Relocation | ₦25,000 | 2-Bedroom Relocation, Interstate Trucking, Office Furniture Moving |

#### Grouping Behavior:
- When "All services" is selected, cards can be displayed in a unified grid with visible group badges (`text-[#296A4B] bg-[#EAF7EF]`) or structured sections by group.
- When an individual category pill is selected, only the selected category is displayed.

### 3.3 Active City Data
The 7 active locations in `NIGERIAN_LOCATIONS` (`status: 'active'`):
1. **Lagos** (Lagos State - Ikeja / Lekki / VI)
2. **Abuja (FCT)** (Federal Capital Territory - Maitama / Wuse 2)
3. **Port Harcourt** (Rivers State - GRA Phase 2 / Trans-Amadi)
4. **Ibadan** (Oyo State - Bodija / Oluyole)
5. **Enugu** (Enugu State - Independence Layout)
6. **Kano** (Kano State - Nassarawa GRA)
7. **Benin City** (Edo State - GRA Benin)

### 3.4 State Matrix & Fallback Behaviors

| State | Trigger Condition | Visual & Functional Behavior |
|---|---|---|
| **Default / All Services** | `/services` (no params) | Renders all 8 categories. "All services" tab active. All-cities scope. Results count: "8 service categories shown". |
| **Filtered Category** | `?category=generator` | Filters grid to the single matching category. "Generator" tab active. Results count: "1 service category shown". |
| **Filtered Search** | `?q=solar` | Matches categories with "solar" in title, description, or common jobs. Renders matching cards. |
| **Empty Search Results** | `?q=unobtainium` (0 matches) | Displays dedicated `EmptyState` card: "No services match that search", helpful copy, and "Reset filters" button that clears `q` and resets category to "All". |
| **Invalid Category** | `?category=invalid-xyz` | Fallback to "All services". Display non-blocking dismissible banner or status: "Category not recognized. Showing all services." URL cleaned on next filter change. |
| **Invalid or Inactive City** | `?city=Atlantis` or unlisted | Fallback to All Cities / nationwide scope. Displays gentle note: "Location '[Name]' is not currently served. Showing services across our 7 active cities." Does not crash or redirect. |
| **Combined Filters** | `?category=ac&city=Lagos&q=gas` | Evaluates intersection: category matches `ac`, text matches "gas", city badge shows Lagos. |
| **Service Detail 404** | `/services/unknown-id` | Handled by `WEB-004` via Next.js `notFound()`. |

---

## 4. Design Requirements & References

### 4.1 Design Authority
Governed by `DESIGN.md`, `docs/02-design-system/DESIGN-CANONICALIZATION.md`, and `docs/02-design-system/LIVE-EXPERIENCE-STANDARD.md`.

### 4.2 Visual Tokens & Surfaces
- **Page Canvas:** Quiet off-white base `#F8F9FF`.
- **Primary Brand Navy:** `#001A41` for hero background, titles, primary buttons, and card text.
- **Supporting Green:** `#296A4B` for active state accents, category pill borders, and checkmark icons.
- **Mint Accent:** `#ABEEC8` for focus rings, button arrow icons, and hero highlights.
- **Card Surfaces:** White `#FFFFFF`, 1px solid border `#E2E8F0` (slate-200), subtle navy elevation shadow `shadow-[0_12px_30px_rgba(0,26,65,0.06)]`, compact border radius `rounded-2xl`.
- **Typography:**
  - Headings: Hanken Grotesk (`font-display`), bold/extrabold, tight tracking.
  - Body & UI: Inter (`font-sans`), regular/medium/bold.
- **Photography:** Real service photographs with 5:3 or 5:4 aspect ratio, purposeful object framing, no artificial color distortion, no stock icon placeholders.

### 4.3 Responsive Viewports & Density
- **Desktop (>= 1024px):** 1280px max-width container, 24px gutters, 3-column service grid (`lg:grid-cols-3`), horizontal category scroll/rail.
- **Tablet (768px – 1023px):** 2-column service grid (`md:grid-cols-2`), compact hero padding.
- **Mobile (< 768px):** 1-column card stack (`grid-cols-1`), touch-friendly horizontal swipe category rail with edge fade indicators, 16px to 20px padding.
- **No Bottom Navigation:** Per `PLAT-002` and live experience rules, public discovery routes do not mount a mobile bottom navigation bar.

---

## 5. Engineering Requirements & Handoff Specifications

### 5.1 Architecture & Component Hierarchy
```text
apps/web/app/services/
├── page.tsx                       # Server/client boundary with Suspense
└── components/
    ├── ServicesDirectory.tsx      # Main state coordinator & layout
    ├── ServicesHero.tsx           # Photo-led hero & search bar
    ├── CategoryFilterRail.tsx     # Horizontal category icon tabs
    ├── CityFilterSelect.tsx       # Active city selector
    ├── ServiceGrid.tsx            # Grid container & results announcer
    ├── ServiceCard.tsx            # Image-led service card with starting price
    ├── ServiceEmptyState.tsx      # Zero-result recovery view
    └── ServicesTrustNotice.tsx    # BukieGuarantee footer banner
```

### 5.2 Helper Contracts (`apps/web/lib/services/` or `homepage-data.ts`)
1. `validateCity(cityParam: string | null): string | undefined`: Validates city against active `NIGERIAN_LOCATIONS`.
2. `filterServices(query: string, categoryId: string, city?: string): ServiceCategory[]`: Pure deterministic filtering function.
3. `buildServiceDetailUrl(serviceId: string, city?: string, returnContext?: object): string`: Constructs canonical detail links.
4. `buildServicesUrl(params: { q?: string; category?: string; city?: string }): string`: Generates canonical clean URLs.

### 5.3 Public Data Boundaries
- Must read ONLY from `apps/web/lib/mock/homepage-data.ts`:
  - `SERVICE_CATEGORIES`
  - `NIGERIAN_LOCATIONS` (filtered to `status === 'active'`)
- Strictly prohibited from importing or rendering:
  - `MOCK_BRAINWORKERS`
  - `MOCK_TESTIMONIALS`
  - Trust tiers, BukiePassport, ratings, review counts, completed jobs
  - Escrow amounts, payment providers, dispute states
  - Prisma models, PostgreSQL databases, server APIs

---

## 6. Customer-Facing Terminology & Copy Rules

Governed by `docs/02-design-system/skills/bukiebrainjobs-experience-standards/references/BUKIEBRAINJOBS-CONTENT-GUIDE.md`.

| Entity | Required Term | Prohibited Terms |
|---|---|---|
| Person hiring | **Customer** | Client, Employer, User |
| Service provider | **BrainWorker** (or **Professional**) | Worker, Artisan, Talent, Freelancer |
| Work request | **Job** | Gig, Task, Assignment |
| Service offering | **Service** | Gig, Package |
| Price indication | **Starting price** / **From ₦X,XXX** | Fixed price, Guaranteed rate |
| Next step | **Review details** | Book now, Hire immediately |

### Copy Standards:
- Confident, active, plain language.
- Never state that professionals are guaranteed, pre-assigned, or instantly booked.
- Always clarify that the starting price is a starting baseline to be discussed during scoping.

---

## 7. Security Considerations

1. **Query Parameter Sanitization:** All incoming URL strings (`q`, `category`, `city`) must be treated as untrusted user input. Strings must be sanitized, trimmed, and length-limited (e.g. `q` max 100 chars).
2. **No XSS Injection:** Do not render raw query strings via `dangerouslySetInnerHTML`. React's standard JSX text interpolation must be used.
3. **Open Redirect Prevention:** Navigation targets must use relative path strings (`/services/...`, `/book...`) with validated query parameters. External URLs in parameters must be discarded.
4. **No Sensitive Data Leakage:** Ensure no internal identifiers, dev flags, or unapproved mock fields appear in URL parameters or DOM attributes.

---

## 8. Accessibility Requirements (WCAG 2.1 AA)

1. **Landmarks & Structure:**
   - Single `<main>` element with semantic `<section>` and `<article>` tags.
   - Sequential heading hierarchy: `<h1>` (hero headline), `<h2>` (section headings, card titles).
2. **Search Input:**
   - Associated accessible label via `<label htmlFor="...">` (can be visually hidden with `sr-only` if placeholder and icon are present).
   - Clear focus ring (`focus-visible:ring-2 focus-visible:ring-[#ABEEC8] focus-visible:ring-offset-2`).
   - `type="search"` with accessible clear functionality.
3. **Category Tabs / Buttons:**
   - Filter buttons must include `aria-pressed="true|false"` to indicate active selection.
   - Container has `role="group"` or `aria-label="Filter service categories"`.
4. **Live Region Status:**
   - Results count (`"{count} service categories shown"`) marked with `role="status"` or `aria-live="polite"` so assistive technologies announce filtered results dynamically.
5. **Interactive Controls:**
   - Minimum target size of 44x44 CSS pixels for all touch targets.
   - Keyboard accessible via `Tab`, `Enter`, and `Space`.
6. **Images & Icons:**
   - Service card photos include descriptive `alt` text or empty `alt=""` when the adjacent card heading provides full semantic meaning.
   - Decorative icons (`Lucide` icons) marked with `aria-hidden="true"`.

---

## 9. Acceptance Criteria

### 9.1 Functional & Navigation
- [ ] Navigating to `/services` renders all 8 canonical categories.
- [ ] Selecting a category pill filters the displayed services and immediately sets `?category=<id>` in the URL without page reload.
- [ ] Selecting "All services" removes `category` from the URL and displays all 8 categories.
- [ ] Entering text in the search input filters categories by title, description, and common jobs, updating `?q=<term>` in the URL (debounced).
- [ ] Entering a query with no matches displays the `EmptyState` with a functional "Reset filters" button.
- [ ] Clicking "Reset filters" clears `q`, sets `category` to "all", and restores all 8 service cards.
- [ ] An invalid `?category=...` parameter falls back gracefully to "All services" without throwing an error.
- [ ] An invalid `?city=...` parameter falls back gracefully to nationwide/all active cities with a polite notice.
- [ ] An incoming `WEB-005` return URL (`/services?category=generator&q=Generator+Servicing+%26+Repair&city=Lagos`) loads correctly with matching filters active.
- [ ] Clicking "Review details" on any service card navigates to `/services/[serviceId]` with the active city preserved.
- [ ] Browser Back and Forward buttons correctly restore previous filter states.

### 9.2 Content & Design System Alignment
- [ ] Visual styling matches the approved live experience: Deep Navy (`#001A41`), Green (`#296A4B`), Mint (`#ABEEC8`), and Off-white canvas (`#F8F9FF`).
- [ ] Real service photography is rendered at 5:3 / 5:4 aspect ratio with starting price tags.
- [ ] Terminology strictly follows the Content Guide (Customer, BrainWorker, Job, Service, Starting price).
- [ ] No ratings, reviews, worker avatars, Escrow widgets, or booking forms appear on `/services`.

### 9.3 Responsive & Accessibility
- [ ] Layout renders cleanly with zero horizontal overflow across 375px, 390px, 430px, 768px, 1024px, 1280px, and 1440px.
- [ ] No mobile bottom navigation bar is displayed.
- [ ] All interactive controls pass 44x44px touch-target requirements.
- [ ] Keyboard navigation and visible focus rings operate on all links, buttons, and inputs.
- [ ] Results count is announced politely via screen readers.

---

## 10. QA Checklist & Verification Matrix

| Test ID | Scenario | Input / Action | Expected Result |
|---|---|---|---|
| **QA-01** | Initial Default Load | Open `/services` | 8 categories rendered; URL remains clean `/services`; "All services" active; results count "8 service categories shown". |
| **QA-02** | Category Filter | Click "AC repair" | 1 category rendered; URL is `/services?category=ac`; results count "1 service category shown". |
| **QA-03** | Keyword Search | Enter "solar" | Matches "Electrical & Solar Inverter"; URL is `/services?q=solar`. |
| **QA-04** | Combined Filter | Select "Power & Cooling" / `generator` and search "diesel" | Matches "Generator Servicing & Repair" (popular service "Mikano Diesel Service"); URL reflects both. |
| **QA-05** | Empty Search State | Search "xyzqwerty" | Zero cards; EmptyState displayed; "Reset filters" button present. |
| **QA-06** | Reset Filters Action | Click "Reset filters" | Search input cleared; category set to All; 8 cards restored; URL normalized. |
| **QA-07** | Invalid Category URL | Open `/services?category=invalid-name` | Gracefully renders All categories; URL cleaned on next action. |
| **QA-08** | Inactive City URL | Open `/services?city=London` | Inactive city ignored/notified; nationwide services displayed; no crash. |
| **QA-09** | Valid City URL | Open `/services?city=Abuja+%28FCT%29` | Active city recognized; subtitle displays "Showing services in Abuja (FCT)". |
| **QA-10** | WEB-005 Return Contract | Open URL generated by `buildPublicBrainWorkerServicesUrl` | Initializes category, search, and city correctly. |
| **QA-11** | Handoff to Detail | Click "Review details" on AC card with city=Lagos | Navigates to `/services/ac?city=Lagos`. |
| **QA-12** | Keyboard Navigation | Navigate entire page with `Tab` & `Enter` | All controls reachable; visible mint/navy focus indicators; no trapped focus. |
| **QA-13** | Viewport Testing | Test on 375px (iPhone SE), 390px (iPhone 14), 768px (iPad), 1280px (Desktop) | No overflow; clean wrapping; touch targets >= 44px; no bottom nav. |

---

## 11. Explicit Non-Goals & Out-of-Scope Items

The following are strictly out of scope for WEB-006:
- **Backend APIs & Database:** No server endpoints, API handlers, Prisma schema changes, migrations, or database queries.
- **BrainWorker Directory:** No directory of individual BrainWorkers, worker search, worker card grids, or worker filtering.
- **Matching & Ranking:** No algorithmic matching, distance calculation, skill ranking, or worker recommendation.
- **Booking & Payments:** No booking submission, date/time scheduling forms, address entry, Escrow processing, or payment gateways.
- **Trust & Reviews:** No user reviews, star ratings, review counts, completion metrics, or BukiePassport badges.
- **Accounts & Auth:** No login, registration, role selection, session handling, or user profile management.
- **Location Expansion:** No "Notify Me" modals, waitlists, or expansion into non-active Nigerian cities.
- **Platform Infrastructure:** No mobile/native app code changes, lockfile modifications, or dependency updates.
