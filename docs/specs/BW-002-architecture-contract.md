# Architecture Contract: BW-002 BrainWorker Service Catalog & Availability Management (v1.0)

| Field | Value |
|---|---|
| **Document ID** | BW-002-ARCH |
| **Feature** | BrainWorker Service Catalog & Availability Management |
| **Status** | 🟡 Proposed for Architecture Review (v1.0) |
| **Version** | 1.0 |
| **Governing Loop** | Mr. Solomon 9-Command Engineering Loop (`/architect`) |
| **Implementation Target** | `apps/web/lib/brainworker/operations/` (or `catalog/`), `apps/web/app/brainworker/` |
| **Date** | 2026-09-25 |

---

## 1. Architectural Boundaries & Ownership Separation

To prevent boundary confusion and preserve clean separation of concerns, the table below establishes what BW-002 owns versus adjacent platform components:

| Platform Component | Owned by BW-002? | Owning Authority | Responsibility |
|---|---|---|---|
| **BrainWorker Identity & Verification** | ❌ No | **BW-001** (`lib/brainworker/`) | Legal identity (NIN/BVN), ID docs, trade credentials, `isBrainWorkerApproved` gate. |
| **Service Catalog Offerings & Rates** | ✅ **Yes** | **BW-002** | Selected services, custom hourly rates (₦), diagnostic call-out fee (₦), service active/paused status. |
| **Weekly Schedule & Working Hours** | ✅ **Yes** | **BW-002** | Day-of-week active toggles, daily start/end hours (24h), global `isAvailable`, emergency toggle. |
| **Geographic Coverage & Radius** | ✅ **Yes** | **BW-002** | Operational city, covered LGAs/neighbourhoods, maximum travel radius in km. |
| **Dashboard Setup Prompt Banner** | ✅ **Yes** | **BW-002** | Verification of profile completeness and deep-linking to setup routes. |
| **Leads Feed & Dispatch Inbox** | ❌ No | **BW-003** (Leads Inbox) | Receiving customer job requests, reviewing job cards, accepting/declining invitations. |
| **Direct Quote Negotiation** | ❌ No | **BW-003** (Quotation Drawer) | Providing itemized parts + labor estimates on posted jobs. |
| **Bank Account & Payout Wallet** | ❌ No | **BW-005** (Wallet & Payouts) | Nigerian bank account details, NUBAN resolution, Paystack split account, escrow releases. |
| **Matching Algorithm Calculation** | ❌ No (Consumer) | **`packages/utils/src/matching.ts`** | Calculates `LOCATION_PROXIMITY` (30%), `SKILL_MATCH` (25%), and `AVAILABILITY` (20%) scores using BW-002 data. |

---

## 2. Domain Models & Type Invariants

### 2.1 Currency & Pricing Representation
- In Nigerian Naira (₦), pricing is represented in the frontend domain models as **whole Naira integers** (e.g., `rateNgn: 5000`) for direct UI interaction, with utility conversion to **Kobo** (where 1 Naira = 100 Kobo) to conform with the backend database schema (`hourlyRateKobo: Decimal` in `TaskerSkill`).
- **Platform Rate Invariants**:
  - Minimum hourly rate: `MIN_HOURLY_RATE_NGN = 2_000` (₦2,000 / hr).
  - Maximum hourly rate: `MAX_HOURLY_RATE_NGN = 50_000` (₦50,000 / hr).
  - Minimum diagnostic fee: `MIN_DIAGNOSTIC_FEE_NGN = 2_000` (₦2,000).
  - Maximum diagnostic fee: `MAX_DIAGNOSTIC_FEE_NGN = 20_000` (₦20,000).
  - Rate step increment: `RATE_STEP_NGN = 500` (₦500 increments).

### 2.2 Domain TypeScript Types (`lib/brainworker/catalog/types.ts`)

```typescript
// apps/web/lib/brainworker/catalog/types.ts

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
  startHour: number; // 0-23 (24h format, e.g. 8 for 08:00)
  endHour: number;   // 0-23 (24h format, e.g. 18 for 18:00)
}

export interface ConfiguredServiceItem {
  serviceId: string;       // Unique service ID (e.g. 'gen-repair', 'ac-gas')
  categoryId: string;      // Canonical category (e.g. 'generator', 'ac')
  serviceName: string;     // Display name (e.g. 'Generator Servicing & Repair')
  hourlyRateNgn: number;   // Configured rate in Naira (2,000 to 50,000)
  isActive: boolean;       // Active or paused by provider
  updatedAt: string;       // ISO 8601
}

export interface BrainWorkerServiceCatalog {
  brainWorkerId: string;
  diagnosticFeeNgn: number;       // Base call-out fee (2,000 to 20,000)
  services: ConfiguredServiceItem[];
  updatedAt: string;
}

export interface BrainWorkerAvailability {
  brainWorkerId: string;
  isAvailable: boolean;            // Global on-duty / off-duty toggle
  isEmergencyAvailable: boolean;   // Express/same-hour dispatch readiness (< 2hr)
  weeklySchedule: Record<DayOfWeek, DaySchedule>;
  updatedAt: string;
}

export interface BrainWorkerCoverage {
  brainWorkerId: string;
  primaryCityId: string;           // E.g. 'lagos', 'abuja'
  primaryCityName: string;         // 'Lagos', 'Abuja'
  coverageNeighbourhoods: string[];// Selected LGAs / areas (e.g. ['Ikeja', 'Lekki'])
  travelRadiusKm: number;          // 5, 10, 15, 25, 50 km
  updatedAt: string;
}

export interface BrainWorkerOperationalProfile {
  brainWorkerId: string;
  catalog: BrainWorkerServiceCatalog;
  availability: BrainWorkerAvailability;
  coverage: BrainWorkerCoverage;
  isComplete: boolean;             // True if >=1 active service and >=1 active working day
}
```

### 2.3 Schedule Invariants
1. **Time Sequence**: For any active day, `endHour` must be strictly greater than `startHour` (`endHour > startHour`).
2. **Minimum Window**: `endHour - startHour >= 2` (minimum 2 hours daily operational window).
3. **Valid Operating Range**: `startHour >= 6` and `endHour <= 22` (standard operational window between 06:00 and 22:00 Nigerian time).

---

## 3. Matching Engine Integration Contract

The marketplace matching algorithm ([`packages/utils/src/matching.ts`](file:///data/data/com.termux/files/home/BukieBrainJobs/packages/utils/src/matching.ts#L30-L50)) maps candidate artisans against customer jobs. BW-002 provides the authoritative mapping for these inputs:

```
┌─────────────────────────────────┐
│  BW-002 Operational Profile     │
│  - ConfiguredServiceItem[]      │ ──► TaskerSkill[] ──────────────┐
│  - hourlyRateNgn * 100          │                                 ▼
│                                 │                  ┌──────────────────────────────┐
│  - isAvailable                  │ ──► isAvailable  │ packages/utils/matching.ts   │
│  - weeklySchedule[day].start    │ ──► workHourStart│ - LOCATION_PROXIMITY (30%)   │
│  - weeklySchedule[day].end      │ ──► workHourEnd  │ - SKILL_MATCH (25%)          │
│                                 │                  │ - AVAILABILITY (20%)         │
│  - primaryCity + travelRadiusKm │ ──► availRadius  │                              │
└─────────────────────────────────┘                  └──────────────────────────────┘
```

### Matching Algorithm Hydration Mapping
1. **`TaskerSkill` Hydration**:
   Each `ConfiguredServiceItem` where `isActive === true` maps to:
   ```typescript
   {
     id: `ts_${item.serviceId}`,
     taskerProfileId: brainWorkerId,
     skillId: item.serviceId,
     hourlyRateKobo: item.hourlyRateNgn * 100,
     isActive: true,
   }
   ```
2. **`TaskerProfile` Availability Hydration**:
   - `isAvailable`: Directly equals `availability.isAvailable`.
   - `availabilityRadius`: Directly equals `coverage.travelRadiusKm`.
   - `workingHoursStart`: Derived from active day schedule for the target job date.
   - `workingHoursEnd`: Derived from active day schedule for the target job date.

---

## 4. Repository Interface Contract

All read and write operations must flow through a strongly typed, fail-closed repository interface:

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
        categoryId: string;
        serviceName: string;
        hourlyRateNgn: number;
        isActive: boolean;
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

  // Observer Subscriptions
  subscribe?(
    brainWorkerId: string,
    callback: (profile: BrainWorkerOperationalProfile) => void
  ): () => void;
}
```

---

## 5. Security Invariants & Access Control

1. **Session-Bound Authorization (Fail-Closed)**:
   Every repository mutation and query verifies that the calling authenticated session matches the target `brainWorkerId`. Cross-tenant reads and mutations throw an authorization error (`FORBIDDEN_TENANT_ACCESS`).
2. **Role Gate**:
   Only authenticated users with `role === 'brainworker'` and `isBrainWorkerApproved === true` can access the routes or mutate catalog/schedule records. Customers attempting to access these routes fail closed immediately.
3. **Data Immutability & Safety**:
   - Rates cannot be set to negative or non-integer values.
   - Pausing a service does not delete its historical hourly rate.
   - De-activating an operational day preserves its previously configured start and end hours for quick reactivation.

---

## 6. Persistence & Physical Testing Boundary

1. **Client Storage Scheme (`ARCH-002`)**:
   In the mock repository layer, operational profiles are persisted to browser `localStorage` keyed deterministically by tenant ID:
   - Key: `bukie_bw_operations_${brainWorkerId}`
   - Pre-seeded with realistic profiles for default mock taskers (`bw-1` through `bw-4`).
2. **SSR / Prerendering Safety**:
   All storage access is guarded by `typeof window !== 'undefined'`. Server-side rendering renders safe initial state without throwing `ReferenceError`.
3. **Physical Testing Separation**:
   In strict adherence to the project boundary rules:
   - All test fixtures and mock harnesses live exclusively in `lib/brainworker/catalog/testing/`.
   - Production modules contain **zero** imports from `testing/`.
