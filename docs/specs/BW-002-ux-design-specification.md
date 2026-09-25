# UX Design Specification: BW-002 BrainWorker Service Catalog & Availability Management (v1.0)

| Field | Value |
|---|---|
| **Document ID** | BW-002-UX |
| **Feature** | BrainWorker Service Catalog & Availability Management |
| **Status** | 🟡 Proposed for UX Design Review (v1.0) |
| **Version** | 1.0 |
| **Governing Loop** | Mr. Solomon 9-Command Engineering Loop (`/architect`) |
| **Design Standards** | Deep Navy (`#001A41`), Emerald (`#059669`), `mr-solomon-natural-voice`, `bukiebrainjobs-experience-standards` |
| **Date** | 2026-09-25 |

---

## 1. Design System & Visual Foundation

The BW-002 visual experience adheres strictly to the locked BukieBrainJobs design system and natural voice guidelines:

- **Primary Brand Navy**: `#001A41` (Headers, active toggles, primary CTA buttons, progress indicators).
- **Verified Emerald**: `#059669` / `#10B981` (Active on-duty indicators, success badges, verified status markers).
- **Warning / Alert Amber**: `#D97706` / `#F59E0B` (Unconfigured setup notices, paused services, schedule outside standard hours).
- **Neutral Palette**: Slate-50 background (`#F8FAFC`), Slate-100 borders (`#F1F5F9`), Slate-200 dividers, Slate-700 body copy, Slate-900 high-emphasis text.
- **Touch & Accessibility Standards**:
  - Minimum touch target: 44x44px for all inputs, stepper buttons, and toggles.
  - Interactive focus rings: `focus:ring-2 focus:ring-[#001A41] focus:ring-offset-2`.
  - Zero generic placeholders, icons, or corporate jargon. Clear Nigerian marketplace terminology (Naira `₦`, diagnostic fee, call-out, Artisans).

---

## 2. Information Architecture & Navigation

BW-002 introduces two dedicated configuration surfaces, linked directly from the operating dashboard:

```
/brainworker/dashboard
  │
  ├─► [Complete Profile Setup Banner] (Renders if catalog or availability missing)
  │     ├─► Link: "Configure Services & Rates" ──► /brainworker/services
  │     └─► Link: "Set Hours & Coverage"      ──► /brainworker/availability
  │
  ├─► Quick Toggle: "On-Duty / Available" (Instant global status switch)
  │
  ├─► /brainworker/services
  │     ├─ Diagnostic Call-Out Fee Card
  │     ├─ Category Service Selector (8 categories)
  │     └─ Configured Services List (Hourly rates, active/paused toggles)
  │
  └─► /brainworker/availability
        ├─ Global Duty Status Card
        ├─ Weekly 7-Day Schedule Picker
        ├─ Emergency / Same-Hour Dispatch Toggle
        └─ Primary City & Travel Radius Slider
```

---

## 3. Surface 1: Service Catalog & Rates (`/brainworker/services`)

### 3.1 Header & Context
- **Title**: `Service Catalog & Pricing`
- **Subtitle**: `Set the services you offer and your standard hourly labor rates. Clear pricing helps match you with serious customers.`
- **Action**: Direct `Save Changes` CTA with saving spinner and toast notification.

### 3.2 Diagnostic Call-Out Fee Section
- **Card Title**: `Diagnostic Inspection / Call-Out Fee`
- **Explanation**: `A flat fee charged for your initial site inspection and troubleshooting. If the customer proceeds with the repair, this fee can be credited against the total labor cost.`
- **Input Control**:
  - Currency Prefix: `₦`
  - Stepper / Text Input: Value between `₦2,000` and `₦20,000` (step `₦500`).
  - Recommended Tag: `₦5,000 (Standard Lagos/Abuja average)`.

### 3.3 Service Selection & Rate Configuration
- **Category Filter Tabs**: 8 canonical categories (`Generator`, `AC & Cooling`, `Plumbing`, `Electrical`, `Cleaning`, `Carpentry`, `Painting`, `Appliance`).
- **Available Service Checkboxes**: Checkbox list of services within selected category.
- **Configured Service Card**:
  Each added service renders as an interactive card containing:
  1. Service Name (e.g., `Generator AVR Replacement`)
  2. Category Badge (e.g., `Power & Cooling`)
  3. Hourly Rate Input: `₦` prefix, numeric input bounded between `₦2,000` and `₦50,000`.
  4. Status Toggle Switch: `Active` (Emerald) vs `Paused` (Slate).
  5. Remove Action: Trash icon / `Remove` button with confirmation.
- **Empty State**:
  If no services are selected:
  - Heading: `No services configured yet`
  - Body: `Select at least one service above to make your BrainWorker profile eligible for customer jobs.`

---

## 4. Surface 2: Availability & Coverage (`/brainworker/availability`)

### 4.1 Global Duty Status Card
- **Toggle**: `Active Dispatch Status`
- **States**:
  - `On-Duty (Available for Leads)`: Emerald indicator dot, `Your profile is visible to customers and eligible for incoming dispatch requests.`
  - `Off-Duty (Paused)`: Slate indicator dot, `You are currently taking a break. No new job leads will be routed to your account.`

### 4.2 Weekly 7-Day Schedule Editor
- **Grid Layout**: 7 rows (Monday through Sunday).
- **Day Row Structure**:
  - Day Label: `Monday`, `Tuesday`, etc.
  - Active Switch: `Available` vs `Day Off`.
  - Start Time Dropdown: `06:00` to `20:00` (1-hour increments).
  - End Time Dropdown: `08:00` to `22:00` (1-hour increments).
  - Validation Indicator: If `endHour <= startHour`, inline error: `End time must be after start time (minimum 2 hours).`
- **Quick Action**: `Copy Monday hours to all weekdays` button to reduce repetitive entry.

### 4.3 Emergency / Priority Dispatch Card
- **Toggle**: `Emergency & Same-Hour Dispatch`
- **Badge**: `Priority Matching Boost`
- **Description**: `Opt in to receive urgent call-outs requiring arrival within 60 to 90 minutes. Requires maintaining active phone contact.`

### 4.4 Coverage Area & Travel Radius Slider
- **Primary Operational City**: Dropdown displaying supported cities (`Lagos`, `Abuja`, `Ibadan`, `Port Harcourt`, `Enugu`, `Kano`, `Benin City`).
- **Neighbourhood Selector**: Multi-select pill selector for major local areas / LGAs (e.g., for Lagos: `Ikeja`, `Lekki Phase 1`, `Victoria Island`, `Surulere`, `Yaba`, `Magodo`, `Maryland`).
- **Travel Radius Slider**:
  - Interactive slider with discrete snap points: `5 km`, `10 km`, `15 km`, `25 km`, `50 km`.
  - Current Selection Display: `Within 15 km of your base`.
  - Help text: `Jobs outside this radius will not be routed to your account.`

---

## 5. Dashboard Integration: Setup Checklist Banner

In [`apps/web/app/brainworker/dashboard/page.tsx`](file:///data/data/com.termux/files/home/BukieBrainJobs/apps/web/app/brainworker/dashboard/page.tsx):

### Unconfigured State
When `isComplete === false`:
```
┌────────────────────────────────────────────────────────────────────────┐
│ ⚠️ Complete Your Provider Setup to Receive Leads                       │
│ Before customers can book your services or dispatch job leads, please   │
│ complete your service pricing and working hours.                       │
│                                                                        │
│ [1] Configure Services & Rates (0 services active) ──► [Set Rates]     │
│ [2] Set Working Hours & Coverage (Schedule incomplete) ──► [Set Hours] │
└────────────────────────────────────────────────────────────────────────┘
```

### Configured State
When `isComplete === true`:
```
┌────────────────────────────────────────────────────────────────────────┐
│ 🟢 Ready for Customer Dispatch                                         │
│ Currently On-Duty • 4 Services Active • Operating in Lagos (15 km)     │
│ [Edit Catalog]                    [Edit Schedule]                      │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Deterministic States: Loading, Error, Offline

1. **Loading State**: Accessible skeleton cards mimicking the 7-day schedule and service list.
2. **Offline Mode**:
   - Amber banner: `You are currently offline. Changes are saved locally and will sync when your connection is restored.`
   - Form inputs remain editable and commit to local storage.
3. **Validation Errors**:
   - Inline red feedback below each input (`text-xs text-red-600 font-medium`).
   - Save button disabled until all day rows satisfy `endHour > startHour`.
4. **Toast Feedback**:
   - `Service catalog saved successfully.`
   - `Working hours and coverage updated.`
