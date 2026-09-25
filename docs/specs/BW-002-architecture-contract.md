# Architecture Contract: BW-002 BrainWorker Service Catalog & Availability Management (v1.1)

| Field | Value |
|---|---|
| **Document ID** | BW-002-ARCH |
| **Feature** | BrainWorker Service Catalog & Availability Management |
| **Status** | 🟡 Proposed for Architecture Review (v1.1 - Reconciled) |
| **Version** | 1.1 |
| **Governing Loop** | Mr. Solomon 9-Command Engineering Loop (`/architect`) |
| **Implementation Target** | `apps/web/lib/brainworker/catalog/`, `apps/web/app/brainworker/` |
| **Date** | 2026-09-25 |

---

## 1. Architectural Boundaries & Ownership Separation

To prevent boundary confusion and preserve clean separation of concerns, the table below establishes what BW-002 owns versus adjacent platform components:

| Platform Component | Owned by BW-002? | Owning Authority | Responsibility |
|---|---|---|---|
| **BrainWorker Identity & Verification** | ❌ No | **BW-001** (`lib/brainworker/`) | Legal identity (NIN/BVN), ID docs, trade credentials, verified `coverageCities`, `isBrainWorkerApproved` gate. |
| **Service Catalog Offerings & Rates** | ✅ **Yes** | **BW-002** | Selected services from 8 canonical categories, custom hourly rates (₦), diagnostic call-out fee (₦), service active/paused status. |
| **Weekly Schedule & Working Hours** | ✅ **Yes** | **BW-002** | Day-of-week active toggles, daily start/end hours (24h), global `isAvailable` (On-Duty/Off-Duty), emergency toggle. |
| **Geographic Coverage Refinement** | ✅ **Yes** | **BW-002** | Primary operational city (refined from BW-001 verified cities), covered LGAs/operational zones, maximum travel radius in km. |
| **Dashboard Setup Prompt Banner** | ✅ **Yes** | **BW-002** | Multi-criteria operational readiness check (`isComplete`) and deep-linking to `/brainworker/services` and `/brainworker/availability`. |
| **Leads Feed & Dispatch Inbox** | ❌ No | **BW-003** (Leads Inbox) | Receiving customer job requests, reviewing job cards, accepting/declining invitations. |
| **Direct Quote Negotiation** | ❌ No | **BW-003** (Quotation Drawer) | Providing itemized parts + labor estimates on posted jobs. |
| **Diagnostic Fee Settlement Policy** | ❌ No | **WEB-013** / **WEB-015** (Booking & Escrow) | Downstream rules regarding whether diagnostic fees are credited against major repairs belong to booking settlement. |
| **Bank Account & Payout Wallet** | ❌ No | **BW-005** (Wallet & Payouts) | Nigerian bank account details, NUBAN resolution, Paystack split account, escrow releases. |
| **Public Directory Profile Presentation** | ❌ No | **WEB-005** / **BW-006** (Profile & Portfolio) | Public directory display, verified badges, bio, and portfolio photos on `/brainworkers/[id]`. |
| **Matching Algorithm Calculation** | ❌ No (Consumer) | **`packages/utils/src/matching.ts`** | Calculates `LOCATION_PROXIMITY` (30%), `SKILL_MATCH` (25%), and `AVAILABILITY` (20%) scores using provider data. |

---

## 2. Canonical Domain Models & Invariants

### 2.1 Canonical 8 Trade Categories
BW-002 strictly adopts the 8 canonical categories defined in BW-001 ([`apps/web/lib/brainworker/types.ts`](file:///data/data/com.termux/files/home/BukieBrainJobs/apps/web/lib/brainworker/types.ts#L101)):
1. `generator` — Generator Repair & Maintenance
2. `ac` — Air Conditioning & Refrigeration
3. `plumbing` — Plumbing & Pipe Fitting
4. `electrical` — Electrical Installation & Inverters
5. `carpentry` — Carpentry & Furniture Making
6. `painting` — Painting & Wall Finishing
7. `masonry` — Masonry, Tiling & Bricklaying
8. `welding` — Welding & Metal Fabrication

### 2.2 Currency & Pricing Representation
- In the domain layer, rates are represented as **whole Naira integers** (e.g., `hourlyRateNgn: 5000`) for direct UI editing, with conversion to **Kobo** (where 1 Naira = 100 Kobo) when interfacing with backend database contracts (`hourlyRateKobo: Decimal` in `TaskerSkill`).
- **Platform Invariants**:
  - Minimum hourly rate: `MIN_HOURLY_RATE_NGN = 2_000` (₦2,000 / hr).
  - Maximum hourly rate: `MAX_HOURLY_RATE_NGN = 50_000` (₦50,000 / hr).
  - Minimum diagnostic fee: `MIN_DIAGNOSTIC_FEE_NGN = 2_000` (₦2,000).
  - Maximum diagnostic fee: `MAX_DIAGNOSTIC_FEE_NGN = 20_000` (₦20,000).
  - Default recommended diagnostic fee: `DEFAULT_DIAGNOSTIC_FEE_NGN = 5_000` (₦5,000).
  - Rate step increment: `RATE_STEP_NGN = 500` (₦500 steps).

### 2.3 Domain TypeScript Types (`lib/brainworker/catalog/types.ts`)

```typescript
// apps/web/lib/brainworker/catalog/types.ts

export type CanonicalTradeCategoryId =
  | 'generator'
  | 'ac'
  | 'plumbing'
  | 'electrical'
  | 'carpentry'
  | 'painting'
  | 'masonry'
  | 'welding';

export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export interface DaySchedule {
  day: DayOfWeek;
  isActive: boolean;
  startHour: number; // 0-23 (24h format, valid: 6 to 20)
  endHour: number;   // 0-23 (24h format, valid: 8 to 22)
}

export type ServiceItemStatus = 'ACTIVE' | 'PAUSED';

export interface ConfiguredServiceItem {
  serviceId: string;               // Unique service identifier (e.g. 'gen-repair', 'ac-gas')
  categoryId: CanonicalTradeCategoryId; // Must be one of the 8 canonical categories
  serviceName: string;             // Display name (e.g. 'Generator Servicing & Repair')
  hourlyRateNgn: number;           // Configured rate in Naira (2,000 to 50,000)
  status: ServiceItemStatus;       // 'ACTIVE' or 'PAUSED'
  updatedAt: string;               // ISO 8601
}

export interface BrainWorkerServiceCatalog {
  brainWorkerId: string;
  diagnosticFeeNgn: number;       // Base call-out fee (2,000 to 20,000)
  services: ConfiguredServiceItem[];
  updatedAt: string;
}

export interface BrainWorkerAvailability {
  brainWorkerId: string;
  isAvailable: boolean;            // Global dispatch duty toggle: true (On-Duty) | false (Off-Duty)
  isEmergencyAvailable: boolean;   // Readiness for urgent dispatch (< 2hr arrival window, target 60-90m)
  weeklySchedule: Record<DayOfWeek, DaySchedule>;
  updatedAt: string;
}

export interface BrainWorkerCoverage {
  brainWorkerId: string;
  primaryCityId: string;           // Must be one of the provider's verified BW-001 coverageCities
  primaryCityName: string;         // E.g. 'Lagos', 'Abuja'
  coverageNeighbourhoods: string[];// Selected LGAs / operational zones within primaryCity
  travelRadiusKm: number;          // One of: 5, 10, 15, 25, 50 km
  updatedAt: string;
}

export interface BrainWorkerOperationalProfile {
  brainWorkerId: string;
  catalog: BrainWorkerServiceCatalog;
  availability: BrainWorkerAvailability;
  coverage: BrainWorkerCoverage;
  isComplete: boolean;             // Authoritative operational readiness invariant
}
```

### 2.4 Authoritative Operational Readiness Invariant (`isComplete`)
A BrainWorker profile is defined as **Ready for Dispatch** (`isComplete: true`) if and only if **all 6** of the following conditions evaluate to `true`:
1. `catalog.services.some(s => s.status === 'ACTIVE')`: At least one configured service item has `ACTIVE` status.
2. `catalog.diagnosticFeeNgn >= 2000 && catalog.diagnosticFeeNgn <= 20000`: A valid diagnostic call-out fee is configured.
3. `Object.values(availability.weeklySchedule).some(d => d.isActive && d.endHour > d.startHour && (d.endHour - d.startHour) >= 2)`: At least one day in the weekly schedule is active with a valid operating window of at least 2 hours.
4. `Boolean(coverage.primaryCityId)`: A primary operational city is designated and matches one of the provider's verified onboarding cities.
5. `coverage.coverageNeighbourhoods.length > 0`: At least one LGA / operational zone within that city is selected.
6. `[5, 10, 15, 25, 50].includes(coverage.travelRadiusKm)`: A valid travel radius is selected.

If any single condition is not met, `isComplete` is `false`.

---

## 3. Matching Engine Integration Contract: Actual vs. Future

To prevent false claims or architectural confusion, this section distinguishes **current matching engine behavior** from **future planned matching integrations**:

### 3.1 Current Matching Behavior in `packages/utils/src/matching.ts`
The existing implementation of the matching algorithm consumes:
- **`SKILL_MATCH` (25% weight)**: Compares required `JobSkill.skillId` against provider `TaskerSkill.skillId`. BW-002 provides the direct source for these skills via `ConfiguredServiceItem` (`hourlyRateKobo = hourlyRateNgn * 100`).
- **`AVAILABILITY` (20% weight)**: Checks `TaskerProfile.isAvailable` (boolean) and evaluates whether `job.scheduledStartAt.getHours()` falls within `workingHoursStart` and `workingHoursEnd` (scaled: 100 for within hours, 70 for 1-2hr outside, 40 for 3-4hr outside, 0 if `!isAvailable`).
- **`LOCATION_PROXIMITY` (30% weight)**: Calculates distance using Haversine formula from customer and provider coordinates against a global `maxDistanceKm` threshold (default 100 km).

### 3.2 What the Current Matching Engine Does NOT Yet Do
The current engine:
- Does **not** consume per-provider `travelRadiusKm` as an individual filtering boundary (uses global threshold).
- Does **not** filter by `primaryCity` or `coverageNeighbourhoods` (relies purely on coordinate proximity).
- Does **not** inspect `isEmergencyAvailable` and does **not** provide an emergency dispatch scoring boost.

### 3.3 Future Matching Integration Contract
BW-002 establishes the authoritative provider-side data model for these future matching extensions:
1. `travelRadiusKm` will serve as a per-candidate distance ceiling: candidate is filtered out if `distanceKm > tasker.travelRadiusKm`.
2. `isEmergencyAvailable` will supply an additional priority multiplier or tag when `job.isUrgent === true` (arrival requested within `< 2 hours`).
3. `primaryCityId` and `coverageNeighbourhoods` will provide coarse pre-filtering before coordinate distance calculations.

BW-002 contract tests will verify that BW-002 correctly produces and stores these parameters, without falsely asserting that the existing matching engine already executes the future logic.

---

## 4. Coverage Ownership: Relationship Between BW-001 and BW-002

- **BW-001 Verification Authority**:
  During onboarding, the applicant declared and verified their broad operational cities (`coverageCities`, e.g. `['Lagos', 'Abuja']`). This represents the legal and vetted boundary of where the artisan is authorized to operate.
- **BW-002 Operational Refinement**:
  BW-002 does **not** replace the onboarding verification boundary; it **refines** it.
  - The provider designates their **Primary Operating City** (`primaryCityId`), which **must** be selected from their verified `coverageCities`.
  - Within that primary city, the provider selects their specific operational zones (LGAs) and travel radius.
  - Providers cannot bypass verification by configuring a city outside their verified onboarding cities. Adding a new city requires an onboarding profile amendment.

---

## 5. Repository Interface Contract

All operations flow through `IBrainWorkerOperationsRepository`:

```typescript
// apps/web/lib/brainworker/catalog/repository.ts

export interface IBrainWorkerOperationsRepository {
  // Operational Profile Summary
  getOperationalProfile(brainWorkerId: string): Promise<BrainWorkerOperationalProfile | null>;

  // Service Catalog
  getServiceCatalog(brainWorkerId: string): Promise<BrainWorkerServiceCatalog>;
  saveServiceCatalog(
    brainWorkerId: string,
    catalog: {
      diagnosticFeeNgn: number;
      services: Array<{
        serviceId: string;
        categoryId: CanonicalTradeCategoryId;
        serviceName: string;
        hourlyRateNgn: number;
        status: ServiceItemStatus;
      }>;
    }
  ): Promise<BrainWorkerServiceCatalog>;

  // Availability & Schedule
  getAvailability(brainWorkerId: string): Promise<BrainWorkerAvailability>;
  saveAvailability(
    brainWorkerId: string,
    availability: {
      isAvailable: boolean;
      isEmergencyAvailable: boolean;
      weeklySchedule: Record<DayOfWeek, DaySchedule>;
    }
  ): Promise<BrainWorkerAvailability>;

  // Coverage Area & Radius
  getCoverage(brainWorkerId: string): Promise<BrainWorkerCoverage>;
  saveCoverage(
    brainWorkerId: string,
    coverage: {
      primaryCityId: string;
      primaryCityName: string;
      coverageNeighbourhoods: string[];
      travelRadiusKm: number;
    }
  ): Promise<BrainWorkerCoverage>;

  // Matching Adapter Hydration
  getMatchingHydrationProfile(brainWorkerId: string): Promise<{
    skills: Array<{ skillId: string; hourlyRateKobo: number; isActive: boolean }>;
    isAvailable: boolean;
    isEmergencyAvailable: boolean;
    workingHoursStart: number;
    workingHoursEnd: number;
    travelRadiusKm: number;
    primaryCityId: string;
  }>;

  // Reactive Observer Subscriptions
  subscribe?(
    brainWorkerId: string,
    callback: (profile: BrainWorkerOperationalProfile) => void
  ): () => void;
}
```

---

## 6. Security, Tenant Isolation & Storage Boundaries

1. **Session-Bound Authorization (Fail-Closed)**:
   Every repository query and mutation inspects the authenticated session (`getMockAuthenticatedUser()`). If the caller's ID does not match the target `brainWorkerId`, the call fails closed throwing `FORBIDDEN_TENANT_ACCESS`.
2. **Operating Gate (`isBrainWorkerApproved`)**:
   Only users with `role === 'brainworker'` and `isBrainWorkerApproved === true` are permitted access to `/brainworker/services` and `/brainworker/availability`. Customers and unapproved providers are blocked.
3. **Storage & SSR Boundary (`ARCH-002`)**:
   - In browser environments, data is persisted to `localStorage` under tenant-scoped keys: `bukie_bw_operations_${brainWorkerId}`.
   - All browser storage accesses are wrapped with `typeof window !== 'undefined'`.
   - The UI does not imply background server synchronization. Unsynchronized local state is marked transparently as local persistence.
4. **Physical Testing Boundary**:
   Test fixtures and mock harness factories reside strictly in `apps/web/lib/brainworker/catalog/testing/`. Production code contains zero imports from `testing/`.
