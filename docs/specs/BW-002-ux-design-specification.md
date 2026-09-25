# UX Design Specification: BW-002 BrainWorker Service Catalog & Availability (v1.2)

| Field | Value |
|---|---|
| **Document ID** | BW-002-UX |
| **Feature** | BrainWorker Service Catalog & Availability Management |
| **Status** | 🟡 Proposed for UX Design Review (v1.2 - Reconciled) |
| **Version** | 1.2 |
| **Governing Loop** | Mr. Solomon 9-Command Engineering Loop (`/architect`) |
| **Design Standards** | Deep Navy (`#001A41`), Emerald (`#059669`), `mr-solomon-natural-voice`, `bukiebrainjobs-experience-standards` |
| **Date** | 2026-09-25 |

---

## 1. Design System & Visual Foundation

The BW-002 visual experience strictly follows the approved BukieBrainJobs design system and Mr. Solomon natural voice standards:

- **Primary Brand Navy**: `#001A41` (Headers, active toggles, primary CTA buttons, step indicators).
- **Verified Emerald**: `#059669` / `#10B981` (On-Duty indicators, active service badges, setup complete status).
- **Warning / Alert Amber**: `#D97706` / `#F59E0B` (Setup incomplete prompt, paused service badges, offline indicator).
- **Neutral Palette**: Slate-50 background (`#F8FAFC`), Slate-100 borders (`#F1F5F9`), Slate-200 dividers, Slate-700 body copy, Slate-900 high-emphasis text.
- **Touch & Accessibility Standards**:
  - Minimum touch target: 44x44px for all inputs, stepper controls, select dropdowns, and toggles.
  - Interactive focus rings: `focus:ring-2 focus:ring-[#001A41] focus:ring-offset-2 outline-none`.
  - Zero generic icons or marketing filler. Natural Nigerian operational language (Naira `₦`, Diagnostic Call-Out Fee, LGAs, Artisans).

---

## 2. Information Architecture & Navigation

BW-002 introduces two dedicated configuration surfaces, accessible to verified BrainWorkers from the operating dashboard:

```
/brainworker/dashboard
  │
  ├─► [Profile Setup Banner] (Renders if isComplete === false)
  │     ├─► Link: "Configure Services & Rates" ──► /brainworker/services
  │     └─► Link: "Set Hours & Coverage"      ──► /brainworker/availability
  │
  ├─► Quick Toggle: "On-Duty / Available for Dispatch" (Instant dispatch status switch)
  │
  ├─► /brainworker/services
  │     ├─ Diagnostic Call-Out Fee Section
  │     ├─ Category Filter Tabs (8 canonical trade categories)
  │     └─ Canonical Service Selector & Rates List (Hourly rates, ACTIVE/PAUSED toggles)
  │
  └─► /brainworker/availability
        ├─ Global Dispatch Duty Status Card (On-Duty / Off-Duty)
        ├─ Weekly 7-Day Operating Hours Scheduler (Per-day windows)
        ├─ Emergency Dispatch Readiness Toggle (< 2hr arrival window)
        └─ Primary City Refinement & Travel Radius Slider
```

---

## 3. Surface 1: Service Catalog & Rates (`/brainworker/services`)

### 3.1 Header & Context
- **Title**: `Service Catalog & Pricing`
- **Subtitle**: `Select the specific trade services you offer and set your standard hourly labor rates. Clear, transparent pricing helps match you with serious customer requests.`
- **Action**: Floating or top-right `Save Changes` CTA with saving spinner and success feedback.

### 3.2 Diagnostic Call-Out Fee Section
- **Card Title**: `Diagnostic Inspection / Call-Out Fee`
- **Explanation**: `A flat fee charged for your initial on-site visit, inspection, and fault diagnosis.`
- **Input Control**:
  - Currency Prefix: `₦`
  - Numeric Input: Value between `₦2,000` and `₦20,000` (step `₦500`).
  - Helper Badge: `₦5,000 (Recommended standard)`.
  - *Boundary Rule*: Zero mention of downstream credit settlement rules. It is presented strictly as a diagnostic visit fee.

### 3.3 Canonical Service Selection & Rate Configuration
- **Category Filter Tabs**: 8 canonical BW-001 categories:
  1. `Generator Repair & Maintenance` (`generator`)
  2. `Air Conditioning & Refrigeration` (`ac`)
  3. `Plumbing & Pipe Fitting` (`plumbing`)
  4. `Electrical Installation & Inverters` (`electrical`)
  5. `Carpentry & Furniture Making` (`carpentry`)
  6. `Painting & Wall Finishing` (`painting`)
  7. `Masonry, Tiling & Bricklaying` (`masonry`)
  8. `Welding & Metal Fabrication` (`welding`)
- **Canonical Service Checkboxes**: Checkbox list populated strictly from `CANONICAL_SERVICES_REGISTRY`. Providers select pre-defined services; arbitrary freeform service names are not permitted.
- **Configured Service Card**:
  Each added service renders as an interactive card:
  1. Service Name (from registry, e.g., `Diesel Generator Servicing & Overhaul`)
  2. Category Badge (e.g., `Generator Repair`)
  3. Hourly Rate Input: `₦` prefix, bounded between `₦2,000` and `₦50,000` (step `₦500`).
  4. Status Toggle Switch: `ACTIVE` (Emerald badge) vs `PAUSED` (Slate badge).
  5. Remove Action: `Remove` button with inline confirmation.
- **Empty State**:
  - Heading: `No services configured yet`
  - Body: `Select at least one trade service above to make your BrainWorker profile eligible for customer jobs.`

---

## 4. Surface 2: Availability & Coverage (`/brainworker/availability`)

### 4.1 Global Dispatch Duty Status Card
- **Toggle**: `Dispatch Duty Status` (`isAvailable`)
- **States**:
  - `On-Duty (Eligible for Dispatch)`: Emerald dot, `You are available to receive customer job matches and dispatch invitations during your scheduled working hours.`
  - `Off-Duty (Paused)`: Slate dot, `You are currently taking a break. No new job leads or matches will be routed to your account.`
  - *Distinction*: Clearly states this governs **matching and dispatch eligibility**, not public directory visibility.

### 4.2 Weekly 7-Day Schedule Editor
- **Grid Layout**: 7 rows (Monday through Sunday).
- **Day Row Structure**:
  - Day Name: `Monday`, `Tuesday`, etc.
  - Active Switch: `Working Day` vs `Day Off`.
  - Start Hour Select: `06:00` to `20:00` (1-hour increments).
  - End Hour Select: `08:00` to `22:00` (1-hour increments).
  - Validation: If `endHour <= startHour` or `endHour - startHour < 2`, displays an inline red notice: `Operating window must be at least 2 hours and end after start time.`
- **Quick Action**: `Copy Monday hours to all weekdays` button.

### 4.3 Emergency Dispatch Readiness Card
- **Toggle**: `Emergency & Same-Day Dispatch Readiness` (`isEmergencyAvailable`)
- **Badge**: `Urgent Jobs (< 2 Hours)`
- **Description**: `Declare readiness to accept emergency call-outs requiring arrival within 60 to 90 minutes. Requires maintaining active mobile phone contact.`

### 4.4 Coverage Refinement & Travel Radius Slider
- **Primary Operating City**:
  - Dropdown options strictly limited to the provider's **verified onboarding `coverageCities`** (e.g. `Lagos`).
  - Helper note: `Only cities approved during your onboarding verification can be selected as your operational base.`
- **Operational Zones / LGAs Selector**:
  - Multi-select pill selector for major Local Government Areas (LGAs) within the selected city (e.g., for Lagos: `Ikeja (GRA, Allen, Maryland)`, `Eti-Osa (Lekki Phase 1, VI, Ikoyi)`, `Surulere`, `Alimosho`, `Kosofe (Magodo, Ogudu)`, `Lagos Island`, `Lagos Mainland (Yaba)`).
- **Travel Radius Slider**:
  - Discrete snap selector: `5 km`, `10 km`, `15 km`, `25 km`, `50 km`. Default is `15 km`.
  - Display: `Operating within 15 km of your primary base`.

---

## 5. Dashboard Integration: Setup Checklist Banner

In [`apps/web/app/brainworker/dashboard/page.tsx`](file:///data/data/com.termux/files/home/BukieBrainJobs/apps/web/app/brainworker/dashboard/page.tsx):

### 1. Incomplete Setup (`isComplete === false`)
Rendered when any of the 6 readiness criteria are unmet:
```
┌────────────────────────────────────────────────────────────────────────┐
│ ⚠️ Complete Your Provider Setup to Receive Leads                       │
│ Before customers can match with your profile or dispatch job leads,     │
│ please complete your service pricing and operational schedule.         │
│                                                                        │
│ [1] Configure Services & Rates ────────► [Configure Rates]             │
│ [2] Set Working Hours & Coverage ──────► [Configure Availability]      │
└────────────────────────────────────────────────────────────────────────┘
```

### 2. Complete Setup & On-Duty (`isComplete === true && isAvailable === true`)
```
┌────────────────────────────────────────────────────────────────────────┐
│ 🟢 Ready for Customer Dispatch                                         │
│ Status: On-Duty • 3 Services Active • Operating in Lagos (15 km radius) │
│ [Edit Catalog]                    [Edit Schedule & Coverage]           │
└────────────────────────────────────────────────────────────────────────┘
```

### 3. Complete Setup & Off-Duty (`isComplete === true && isAvailable === false`)
```
┌────────────────────────────────────────────────────────────────────────┐
│ ⏸️ Setup Complete • Status: Off-Duty (Paused)                           │
│ You are taking a break. Toggle On-Duty when ready to receive matches.  │
│ [Switch to On-Duty]                [Edit Schedule & Coverage]          │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Deterministic States: Loading, Error, Offline

1. **Loading State**: Accessible skeleton cards showing placeholder layout for schedule rows and service lists.
2. **Offline Mode**:
   - Status Notice: `Changes are saved locally on this device. (Offline Mode)`
   - Form inputs remain editable and commit to browser storage under `ARCH-002`. Zero false promises of background cloud synchronization.
3. **Validation Errors**:
   - Inline feedback directly below the offending input in `text-xs text-red-600 font-medium`.
   - Save button disabled while any active day violates `endHour - startHour >= 2`.
4. **Toast Feedback**:
   - `Service catalog saved successfully.`
   - `Working hours and coverage updated.`
