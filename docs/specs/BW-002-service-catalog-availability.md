# Spec: BW-002 BrainWorker Service Catalog & Availability Management (v1.2)

| Field | Value |
|---|---|
| **Document ID** | BW-002-SCOPE |
| **Feature** | BrainWorker Service Catalog & Availability Management |
| **Status** | 🟡 Proposed for Scope Approval (v1.2 - Reconciled) |
| **Version** | 1.2 |
| **Workstream** | Phase 2: BrainWorker (Service Provider) Web Platform |
| **Governing Loop** | Mr. Solomon 9-Command Engineering Loop (`/scope`) |
| **Target Surfaces** | `/brainworker/services`, `/brainworker/availability`, `/brainworker/dashboard` (Setup Card) |
| **Prerequisites** | BW-001 BrainWorker Onboarding & Identity Verification (Complete on `main` at `36b8385` / `c2dd0d9`) |
| **Date** | 2026-09-25 |

---

## 1. Executive Summary & Core Doctrine

BW-002 establishes the commercial, operational, and geographic profile for verified BrainWorkers on BukieBrainJobs. While BW-001 authoritatively answered **who the provider is** (identity, legal verification, trade competency, verified coverage cities, and platform approval), BW-002 establishes **what specific services the provider offers, how much they charge, when they work, and where they operate**.

Without this operational configuration, the marketplace matching engine (`packages/utils/src/matching.ts`) cannot evaluate candidate suitability against customer jobs. Candidate ranking depends directly on service capabilities, hourly rates, geographic radius, and operating schedule windows.

BW-002 enables approved BrainWorkers to configure their service offerings from an authoritative service definition registry, set transparent hourly rates and diagnostic call-out fees, manage a weekly availability schedule, declare emergency dispatch readiness, and define their operational zones and travel radius within their verified onboarding cities.

### 1.1 Core Doctrine: Operational Transparency & Dispatch Readiness

> **Clear pricing and honest availability build platform liquidity.**
>
> In the Nigerian informal services sector, pricing ambiguity and unpredictable arrival times are the primary sources of customer friction and dispute. Providers on BukieBrainJobs must specify clear hourly labor rates and upfront diagnostic call-out fees before receiving leads.
>
> Operational completeness (`isComplete`) establishes that a provider is fully configured. Real-time dispatch duty (`isAvailable`) and schedule adherence establish whether they are eligible for immediate job dispatch.

---

## 2. Product Scope & Business Boundaries

### 2.1 Canonical Service Taxonomy & Authoritative Definition Registry
BW-002 consumes the **canonical 8 trade categories** established in BW-001 ([`apps/web/lib/brainworker/types.ts`](file:///data/data/com.termux/files/home/BukieBrainJobs/apps/web/lib/brainworker/types.ts#L101)):
1. **Generator Repair & Maintenance** (`generator`)
2. **Air Conditioning & Refrigeration** (`ac`)
3. **Plumbing & Pipe Fitting** (`plumbing`)
4. **Electrical Installation & Inverters** (`electrical`)
5. **Carpentry & Furniture Making** (`carpentry`)
6. **Painting & Wall Finishing** (`painting`)
7. **Masonry, Tiling & Bricklaying** (`masonry`)
8. **Welding & Metal Fabrication** (`welding`)

#### Authoritative Service Definition Registry
To ensure strict identity matching with customer jobs (`JobSkill.skillId`), all configured services must strictly reference a pre-defined canonical service definition from the **Canonical Service Registry**. Providers **cannot** invent arbitrary or free-text `serviceId` values. Each service has an immutable `serviceId`, canonical category, authoritative display name, and mapped `skillId`.

### 2.2 Pricing Boundaries & Invariants
- **Hourly Labor Rates**: Configured per active service item.
  - Platform Minimum: `₦2,000 / hr`
  - Platform Maximum: `₦50,000 / hr`
  - Step Increment: `₦500`
- **Diagnostic Inspection / Call-Out Fee**: A mandatory baseline flat fee charged for initial site visit, inspection, and fault diagnosis.
  - Platform Minimum: `₦2,000`
  - Platform Maximum: `₦20,000`
  - Default Recommended: `₦5,000`
  - **Boundary Rule**: The diagnostic fee is strictly an upfront inspection fee. Any downstream settlement rules (such as crediting the fee toward major labor) belong to Phase 3 booking lifecycle and escrow contracts (`WEB-013`/`WEB-015`), and are **not** decided or mutated in this provider configuration surface.
- **Service Item Lifecycle**:
  - `ACTIVE`: Service is eligible for customer matching and lead routing.
  - `PAUSED`: Service is temporarily suspended by the provider; rates remain saved but excluded from matching.

### 2.3 Schedule & Dispatch Availability
- **Weekly Schedule**: 7 days (Monday through Sunday).
  - Daily Start/End Range: `06:00` to `22:00` (24-hour format).
  - Minimum Daily Window: 2 hours (`endHour - startHour >= 2`).
  - Sequence Rule: `endHour` must be strictly greater than `startHour`.
  - Individual day toggle: Provider can designate rest days (e.g., Sundays off).
- **Global Dispatch Duty Toggle (`isAvailable`)**:
  - `On-Duty` (`isAvailable: true`): Provider is available for incoming matching during active working hours.
  - `Off-Duty` (`isAvailable: false`): Provider is paused from incoming matching; availability score in matching engine defaults to `0`.
  - *Terminology Boundary*: This toggle controls **dispatch eligibility**, not public directory profile visibility (which is governed by `WEB-005` / `BW-006`).
- **Emergency Dispatch Readiness (`isEmergencyAvailable`)**:
  - Denotes the provider's operational readiness to accept urgent dispatch requests with an arrival window of `< 2 hours` (targeting 60 to 90-minute on-site arrival).
  - Stored as a provider operational attribute. *(Note: Applying an active scoring boost within `packages/utils/src/matching.ts` is a future matching engine enhancement; BW-002 establishes the provider-side contract and data model).*

### 2.4 Geographic Coverage Refinement (Relationship to BW-001)
- **Coverage Refinement Principle**:
  - In BW-001, the provider registered one or more verified broad coverage cities (from the 7 canonical Nigerian cities: `Lagos`, `Abuja`, `Port Harcourt`, `Ibadan`, `Benin City`, `Enugu`, `Kano`).
  - In BW-002, the provider **refines** this coverage by selecting their **Primary Operating City** (`primaryCityId`), which **must be chosen from their verified BW-001 `coverageCities`**.
  - Within that primary city, the provider selects specific **Operational Zones / LGAs** (e.g., for Lagos: `Ikeja`, `Eti-Osa`, `Surulere`, `Alimosho`, `Kosofe`, `Lagos Island`, `Lagos Mainland`) with recognizable neighbourhood benchmarks.
  - Providers cannot configure an operational city that was not approved during onboarding; expanding city coverage requires an onboarding verification amendment.
- **Maximum Travel Radius (`travelRadiusKm`)**:
  - Provider specifies the maximum distance they are willing to travel from their operational base: `5 km`, `10 km`, `15 km`, `25 km`, or `50 km`. Default is `15 km`.

### 2.5 Operational Completeness (`isComplete`) vs. Current Dispatch Eligibility (`isDispatchEligibleNow`)
The specification strictly separates profile completeness from real-time operational availability:

1. **Operational Profile Completeness (`isComplete`)**:
   Evaluates whether the provider has completed their operational configuration. A profile is **Setup Complete** (`isComplete: true`) if and only if **all 6** of the following criteria are satisfied:
   - **Active Services**: At least one configured service item has `status === 'ACTIVE'`.
   - **Valid Diagnostic Fee**: `diagnosticFeeNgn` is between ₦2,000 and ₦20,000.
   - **Active Operating Schedule**: At least one day in `weeklySchedule` has `isActive === true` with a valid window (`endHour - startHour >= 2`).
   - **Valid Primary City**: `primaryCityId` is set to one of the provider's verified BW-001 coverage cities.
   - **Operational Zones**: At least one LGA / operational zone is selected in `coverageNeighbourhoods`.
   - **Travel Radius**: `travelRadiusKm` is one of `[5, 10, 15, 25, 50]`.

2. **Current Dispatch Eligibility (`isDispatchEligibleNow`)**:
   A provider with `isComplete === true` who has set `isAvailable === false` is **Off-Duty**, not dispatch-eligible.
   Conceptually:
   $$\text{isDispatchEligibleNow} = \text{isComplete} \land \text{isAvailable} \land \text{isWithinScheduledHours(currentDate, weeklySchedule)}$$
   `isComplete: true` alone **does not** mean the provider is currently accepting jobs or dispatchable.

### 2.6 Persistence & Offline Semantics (`ARCH-002`)
- In accordance with `ARCH-002` production-first mock architecture, configuration is persisted locally in browser `localStorage` under tenant-scoped keys.
- **Offline Copy Rule**: The UI must not claim an imaginary background cloud sync mechanism. Offline status is presented transparently: *"Changes are saved locally on this device. (Offline Mode)"*.

---

## 3. Explicit Exclusions (What BW-002 Does NOT Do)

| Capability | Owning Phase / Slice | Reason for Exclusion |
|---|---|---|
| **Incoming Leads Feed & Dispatch Inbox** | Milestone 2.3 (`BW-003` / Leads Inbox) | Lead presentation, job cards, and invitation accept/decline actions belong to Section 2.3. |
| **Direct Quote Negotiation** | Milestone 2.3 (`BW-003`) | Real-time negotiation and itemized parts/labor breakdown belong to the quotation drawer. |
| **Bank Account Setup & Payout Wallet** | Milestone 2.5 (`BW-005` / Wallet & Payouts) | Payout setup (NUBAN resolution, bank code, Paystack subaccount) belongs to the financial operations slice. |
| **Customer-Facing Booking Form Changes** | Milestone 4 (`WEB-007` / `WEB-013`) | Customer booking preparation (`/book`) and activity lifecycle are already completed and live. |
| **Identity Re-Verification & NIN Checks** | Milestone 2.1 (`BW-001`) | Identity and government document checks belong authoritatively to BW-001. |
| **Public Profile Presentation of Rates** | Milestone 2.6 (`BW-006` / Profile & Portfolio) | Displaying these rates on the public profile (`/brainworkers/[id]`) will be linked in the worker portfolio slice. |
| **Matching Algorithm Engine Scoring Overhaul** | Core Marketplace Platform (`packages/utils/src/matching.ts`) | BW-002 provides the data contract; modifying matching weights or implementing emergency boost algorithms belongs to matching platform releases. |

---

## 4. Functional Requirements

### 4.1 Service Catalog Management
- **FR-001 (Canonical Service Registry Selection):** Provider can select services strictly from the pre-defined canonical service definition registry. Rejects arbitrary or un-registered service IDs.
- **FR-002 (Rate Setting & Bounds):** For each selected service, provider sets an hourly labor rate between ₦2,000 and ₦50,000 (step ₦500).
- **FR-003 (Diagnostic Call-Out Fee):** Provider sets a flat diagnostic call-out fee between ₦2,000 and ₦20,000 (recommended default ₦5,000).
- **FR-004 (Active State Toggle):** Provider can toggle individual services between `ACTIVE` and `PAUSED` without losing previously configured rates.
- **FR-005 (At Least One Service):** At least one active service is required for operational completeness.

### 4.2 Availability & Schedule Management
- **FR-006 (Weekly Schedule):** Provider configures working hours across all 7 days of the week.
- **FR-007 (Daily Operating Window):** For each active day, start and end hours must satisfy `06:00 <= startHour < endHour <= 22:00` and `endHour - startHour >= 2`.
- **FR-008 (Dispatch Duty Toggle):** A top-level toggle controls `isAvailable` (On-Duty / Off-Duty).
- **FR-008b (Eligibility Separation):** The system distinguishes `isComplete` from `isAvailable`. An off-duty provider remains complete without being dispatchable.
- **FR-009 (Emergency Dispatch Readiness):** Provider can declare emergency readiness (`isEmergencyAvailable: boolean`) for arrival requests within `< 2 hours`.

### 4.3 Geographic Coverage & Radius
- **FR-010 (Primary Operating City):** Provider selects their primary city strictly from their verified BW-001 onboarding `coverageCities`.
- **FR-011 (Operational Zones Selection):** Provider selects specific LGAs / operational zones within their primary city.
- **FR-012 (Maximum Travel Radius):** Provider selects a maximum travel radius from discrete values: `[5, 10, 15, 25, 50]` km. Default is `15 km`.

### 4.4 Dashboard Integration
- **FR-013 (Setup Status Prompt):** If `isComplete === false`, `/brainworker/dashboard` renders an actionable banner:
  - "Configure Services & Rates" (links to `/brainworker/services`)
  - "Set Working Hours & Coverage" (links to `/brainworker/availability`)
- **FR-014 (Readiness Signal):** When `isComplete === true`, the dashboard banner displays "Setup Complete" along with current dispatch duty status ("On-Duty" or "Off-Duty").

---

## 5. Non-Functional Requirements & Security Invariants

1. **Authentication & Operating Gate**:
   - Access to `/brainworker/services` and `/brainworker/availability` strictly requires `role === 'brainworker'` and `isBrainWorkerApproved === true`.
   - Unauthenticated visitors redirect to `/login?redirect=...`.
   - Customer accounts fail closed with boundary notice cards.
   - Unapproved providers redirect to `/brainworker/verification-status`.
2. **Tenant Isolation**:
   - Repository queries and mutations verify that the authenticated session matches the target `brainWorkerId`. Cross-tenant mutations throw `FORBIDDEN_TENANT_ACCESS`.
3. **Data Integrity**:
   - Rates cannot be negative, fractional, or non-numeric.
   - Service IDs must be registered in the canonical registry.
   - Pausing a service preserves its rate for future reactivation.
   - De-activating an operating day preserves its configured hours.
4. **Prerender & Static Safety**:
   - All browser storage calls are guarded by `typeof window !== 'undefined'`, ensuring clean Next.js 15 static generation (`○ (Static)`).
5. **Physical Boundary Separation**:
   - Production routes and components contain zero imports from `testing/`.

---

## 6. Acceptance Criteria

- [ ] Approved provider can navigate to `/brainworker/services`, select canonical services, and save valid hourly rates and diagnostic fee.
- [ ] Arbitrary or un-registered service IDs are rejected during validation.
- [ ] Approved provider can navigate to `/brainworker/availability`, configure a 7-day schedule, set primary city refined from verified onboarding cities, select operational LGAs, and set travel radius.
- [ ] Validation rejects rates outside ₦2,000–₦50,000 and diagnostic fees outside ₦2,000–₦20,000.
- [ ] Schedule validation rejects daily windows where `endHour <= startHour` or `endHour - startHour < 2`.
- [ ] `isComplete` evaluates to `true` only when all 6 readiness criteria are satisfied.
- [ ] Setting `isAvailable === false` when `isComplete === true` marks the provider Off-Duty without invalidating setup completeness.
- [ ] `/brainworker/dashboard` renders the setup prompt banner when incomplete, and ready signal when complete.
- [ ] All tests pass with 0 type errors, 0 lint errors, and 0 monorepo regressions.
