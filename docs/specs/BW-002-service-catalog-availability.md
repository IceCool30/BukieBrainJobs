# Spec: BW-002 BrainWorker Service Catalog & Availability Management (v1.0)

| Field | Value |
|---|---|
| **Document ID** | BW-002-SCOPE |
| **Feature** | BrainWorker Service Catalog & Availability Management |
| **Status** | 🟡 Proposed for Scope Approval (v1.0) |
| **Version** | 1.0 |
| **Workstream** | Phase 2: BrainWorker (Service Provider) Web Platform |
| **Governing Loop** | Mr. Solomon 9-Command Engineering Loop (`/scope`) |
| **Target Surfaces** | `/brainworker/services`, `/brainworker/availability`, `/brainworker/dashboard` (Setup Card) |
| **Prerequisites** | BW-001 BrainWorker Onboarding & Identity Verification (Complete on `main` at `36b8385` / `c2dd0d9`) |
| **Date** | 2026-09-25 |

---

## 1. Executive Summary & Core Doctrine

BW-002 establishes the commercial and operational profile for verified BrainWorkers on BukieBrainJobs. While BW-001 answered **who the provider is** (identity, legal verification, trade competency, and platform standing), BW-002 defines **what services the provider offers, how much they charge, when they work, and where they operate**.

Without this operational foundation, the marketplace cannot calculate proximity, evaluate skill compatibility, or dispatch invitations to qualified artisans. The matching engine (`packages/utils/src/matching.ts`) strictly requires location coordinates, travel radius, hourly rates, service catalog items, and operating schedule windows to rank candidates.

BW-002 enables approved and onboarding BrainWorkers to configure their service offerings, transparent pricing, weekly availability calendar, emergency dispatch readiness, and geographic service zones.

### 1.1 Core Doctrine: The Operational Transparency Invariant

> **Clear pricing and honest availability build platform liquidity.**
>
> In the Nigerian informal services sector, pricing ambiguity and unpredictable arrival times are the primary sources of customer friction and dispute. Providers on BukieBrainJobs must specify clear hourly labor rates and upfront diagnostic call-out fees before receiving leads.
>
> A provider marked as "Available" must reflect an active commitment to receive dispatch requests within their designated working hours. Availability is an operational contract with the customer, not a vanity toggle.

---

## 2. Product Scope & Business Boundaries

### 2.1 What BW-002 Owns
1. **Service Catalog Configuration**:
   - Provider adds or removes individual services from the 8 canonical categories (`generator`, `ac`, `plumbing`, `electrical`, `cleaning`, `carpentry`, `painting`, `appliance`).
   - Provider sets an individual hourly labor rate in Nigerian Naira (₦) for each activated service.
   - Provider configures a mandatory baseline **Diagnostic Inspection / Call-Out Fee** (flat fee in ₦) covering initial site visit and fault diagnosis.
   - Provider can activate or pause individual services without deleting their configured rates.
2. **Weekly Working Hours Availability Scheduler**:
   - Provider configures an active schedule across all 7 days of the week (Monday through Sunday).
   - Each active day specifies an operational time window in 24-hour format (e.g., `08:00` to `18:00`).
   - Provider can toggle individual days off (e.g., Sundays off).
   - Global availability toggle (`isAvailable: true | false`) allowing instant on-duty / off-duty status switching without losing scheduled hours.
   - Emergency / Same-hour dispatch toggle (`isEmergencyAvailable: true | false`) signaling readiness for urgent priority call-outs within 60 minutes.
3. **Geographic Coverage & Dispatch Radius**:
   - Primary operating city selection from supported Nigerian cities (`Lagos`, `Abuja`, `Ibadan`, `Port Harcourt`, `Enugu`, `Kano`, `Benin City`).
   - Selected operational neighbourhoods / Local Government Areas (LGAs) within the primary city.
   - Maximum travel radius selector in kilometers (e.g., 5 km, 10 km, 15 km, 25 km, 50 km) bounding the provider's willingness to travel from their operational base.
4. **Dashboard Workspace Onboarding Integration**:
   - Enhances [`/brainworker/dashboard`](/brainworker/dashboard) with a state-honest "Setup Checklist" card prompting newly approved providers to configure their catalog and working hours before leads can be dispatched.

---

## 3. Explicit Exclusions (What BW-002 Does NOT Do)

To preserve strict phase boundaries and avoid scope creep, the following capabilities are explicitly excluded from BW-002:

| Capability | Owning Phase / Slice | Reason for Exclusion |
|---|---|---|
| **Incoming Leads Feed & Dispatch Inbox** | Milestone 2.3 (`BW-003` / Leads Inbox) | Requires catalog and availability to exist first; lead presentation and invitation response belongs to Section 2.3. |
| **Direct Quote Submission / Negotiation** | Milestone 2.3 (`BW-003`) | Real-time negotiation against customer job specifications belongs to the quotation drawer. |
| **Bank Account Setup & Payout Wallet** | Milestone 2.5 (`BW-005` / Wallet & Payouts) | Payout setup (NUBAN resolution, bank code, Paystack subaccount) belongs to the financial operations slice. |
| **Customer-Facing Booking Form Changes** | Milestone 4 (`WEB-007` / `WEB-013`) | Customer booking preparation (`/book`) and activity lifecycle are already completed and live. |
| **Identity Re-Verification & NIN Checks** | Milestone 2.1 (`BW-001`) | Identity and government document checks belong authoritatively to BW-001. |
| **Public Profile Presentation of Rates** | Milestone 2.6 (`BW-006` / Profile & Portfolio) | Displaying these rates on the public profile (`/brainworkers/[id]`) will be linked in the worker portfolio slice. |

---

## 4. Functional Requirements

### 4.1 Service Catalog Management
- **FR-001 (Service Selection):** Provider can browse and select services categorized under the 8 platform categories.
- **FR-002 (Rate Setting):** For each selected service, provider must specify an hourly labor rate with minimum and maximum platform bounds:
  - Minimum hourly rate: ₦2,000 / hour.
  - Maximum hourly rate: ₦50,000 / hour.
  - Increment: ₦500 steps.
- **FR-003 (Diagnostic Call-Out Fee):** Provider must set a default diagnostic inspection fee:
  - Minimum call-out fee: ₦2,000.
  - Maximum call-out fee: ₦20,000.
  - Default recommended fee: ₦5,000.
- **FR-004 (Active State Toggle):** Provider can toggle a service between `ACTIVE` and `PAUSED`. Paused services are excluded from customer matching without deleting configured rates.
- **FR-005 (At Least One Service):** Provider must have at least one active service configured for their profile to be marked "Ready for Dispatch".

### 4.2 Availability & Schedule Management
- **FR-006 (Weekly Schedule):** Provider configures working hours for each day of the week (Monday through Sunday).
- **FR-007 (Working Hours Window):** For each active day, provider specifies start time and end time:
  - Minimum daily window: 2 hours.
  - Valid range: 06:00 to 22:00.
  - End time must be strictly after start time.
- **FR-008 (Global Availability Toggle):** A top-level switch allows providers to toggle `isAvailable` (On-Duty / Off-Duty). When Off-Duty, the matching engine assigns `0` availability score regardless of schedule.
- **FR-009 (Emergency Dispatch):** Provider can toggle `isEmergencyAvailable`. When true, matching engine boosts candidate score for urgent customer jobs posted with `< 2 hours` arrival window.

### 4.3 Coverage & Dispatch Radius
- **FR-010 (Primary Operating City):** Provider designates their primary Nigerian operational city (must match or be updated from their BW-001 onboarding city).
- **FR-011 (Neighbourhood Coverage):** Provider selects specific service areas/LGAs within their primary city (e.g., Lekki Phase 1, Ikeja, Victoria Island for Lagos).
- **FR-012 (Maximum Travel Radius):** Provider sets maximum travel distance in kilometers (5 km, 10 km, 15 km, 25 km, or 50 km). Default is 15 km.

### 4.4 Dashboard Integration
- **FR-013 (Setup Status Prompt):** If an approved BrainWorker has not configured their service catalog or availability, `/brainworker/dashboard` renders an actionable setup banner:
  - "Configure Services & Rates" (links to `/brainworker/services`)
  - "Set Working Hours & Coverage" (links to `/brainworker/availability`)
- **FR-014 (Readiness Signal):** Once both catalog and schedule are configured, the banner transitions to "Ready for Customer Dispatch" with an active duty indicator.

---

## 5. Non-Functional Requirements & Security Invariants

1. **Authentication & Role Guard**:
   - Access to `/brainworker/services` and `/brainworker/availability` strictly requires `role === 'brainworker'` and `isBrainWorkerApproved === true`.
   - Unauthenticated users redirect to `/login?redirect=...`.
   - Customer accounts fail closed with boundary notice cards.
   - Unapproved providers redirect to `/brainworker/verification-status`.
2. **Tenant Isolation**:
   - Providers can only view and mutate their own service catalog and availability settings.
   - Requests targeting another provider ID fail closed with an authorization error.
3. **Deterministic Mock Persistence (`ARCH-002`)**:
   - Follows the production-first repository pattern with browser storage caching and reactive observer subscriptions.
   - Seeded with realistic Nigerian provider defaults for existing mock taskers (`bw-1` through `bw-4`).
4. **Static Prerender Safety**:
   - Safe for Next.js 15 App Router static generation (`○ (Static)`); zero reference errors during prerendering.
5. **Physical Import Separation**:
   - Production routes and components contain zero imports from `testing/`.

---

## 6. Acceptance Criteria

- [ ] Approved provider can navigate to `/brainworker/services`, select services, and save custom hourly rates and a diagnostic call-out fee.
- [ ] Approved provider can navigate to `/brainworker/availability`, set a weekly 7-day schedule, toggle emergency dispatch, and define travel radius.
- [ ] Provider cannot enter rates below ₦2,000 or above ₦50,000.
- [ ] Schedule validation rejects end times earlier than or equal to start times.
- [ ] `/brainworker/dashboard` correctly detects unconfigured vs configured catalog and schedule states.
- [ ] Matching engine inputs (`TaskerSkill`, `TaskerProfile.workingHoursStart`, `TaskerProfile.workingHoursEnd`, `TaskerProfile.availabilityRadius`, `TaskerProfile.isAvailable`) can be hydrated directly from this repository without translation mismatch.
- [ ] All automated tests pass with 0 lint errors, 0 type errors, and 0 monorepo regressions.
