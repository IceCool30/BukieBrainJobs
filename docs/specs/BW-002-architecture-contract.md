# Architecture Contract: BW-002 BrainWorker Service Catalog & Availability Management (v1.2)

| Field | Value |
|---|---|
| **Document ID** | BW-002-ARCH |
| **Feature** | BrainWorker Service Catalog & Availability Management |
| **Status** | 🟡 Proposed for Architecture Review (v1.2 - Reconciled) |
| **Version** | 1.2 |
| **Governing Loop** | Mr. Solomon 9-Command Engineering Loop (`/architect`) |
| **Implementation Target** | `apps/web/lib/brainworker/catalog/`, `apps/web/app/brainworker/` |
| **Date** | 2026-09-25 |

---

## 1. Architectural Boundaries & Ownership Separation

To prevent boundary confusion and preserve clean separation of concerns, the table below establishes what BW-002 owns versus adjacent platform components:

| Platform Component | Owned by BW-002? | Owning Authority | Responsibility |
|---|---|---|---|
| **BrainWorker Identity & Verification** | ❌ No | **BW-001** (`lib/brainworker/`) | Legal identity (NIN/BVN), ID docs, trade credentials, verified `coverageCities`, `isBrainWorkerApproved` gate. |
| **Service Catalog Offerings & Rates** | ✅ **Yes** | **BW-002** | Selected services from canonical registry, custom hourly rates (₦), diagnostic call-out fee (₦), service active/paused status. |
| **Weekly Schedule & Working Hours** | ✅ **Yes** | **BW-002** | Day-of-week active toggles, daily start/end hours (24h), global `isAvailable` (On-Duty/Off-Duty), emergency toggle. |
| **Geographic Coverage Refinement** | ✅ **Yes** | **BW-002** | Primary operational city (refined from BW-001 verified cities), covered LGAs/operational zones, maximum travel radius in km. |
| **Dashboard Setup Prompt Banner** | ✅ **Yes** | **BW-002** | Operational readiness check (`isComplete`) and deep-linking to `/brainworker/services` and `/brainworker/availability`. |
| **Leads Feed & Dispatch Inbox** | ❌ No | **BW-003** (Leads Inbox) | Receiving customer job requests, reviewing job cards, accepting/declining invitations. |
| **Direct Quote Negotiation** | ❌ No | **BW-003** (Quotation Drawer) | Providing itemized parts + labor estimates on posted jobs. |
| **Diagnostic Fee Settlement Policy** | ❌ No | **WEB-013** / **WEB-015** (Booking & Escrow) | Downstream rules regarding whether diagnostic fees are credited against major repairs belong to booking settlement. |
| **Bank Account & Payout Wallet** | ❌ No | **BW-005** (Wallet & Payouts) | Nigerian bank account details, NUBAN resolution, Paystack split account, escrow releases. |
| **Public Directory Profile Presentation** | ❌ No | **WEB-005** / **BW-006** (Profile & Portfolio) | Public directory display, verified badges, bio, and portfolio photos on `/brainworkers/[id]`. |
| **Matching Algorithm Calculation** | ❌ No (Consumer) | **`packages/utils/src/matching.ts`** | Calculates `LOCATION_PROXIMITY` (30%), `SKILL_MATCH` (25%), and `AVAILABILITY` (20%) scores using provider data. |

---

## 2. Canonical Service Definition Registry

To guarantee deterministic mapping between a BrainWorker's configured offerings, the backend `TaskerSkill.skillId`, and a customer's `JobSkill.skillId`, BW-002 defines a canonical **Service Definition Registry**.

Providers **cannot** create arbitrary or un-registered services. Every configured service must map directly to an entry in this registry.

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

export interface CanonicalServiceDefinition {
  serviceId: string;                    // Immutable unique ID (e.g. 'gen-diesel-servicing')
  categoryId: CanonicalTradeCategoryId; // 1 of the 8 canonical categories
  serviceName: string;                  // Authoritative display name
  skillId: string;                      // Maps 1:1 to TaskerSkill.skillId / JobSkill.skillId
  defaultRateNgn: number;               // Recommended baseline hourly rate
}

export const CANONICAL_SERVICES_REGISTRY: readonly CanonicalServiceDefinition[] = [
  // Generator
  { serviceId: 'gen-diesel-servicing', categoryId: 'generator', serviceName: 'Diesel Generator Servicing & Overhaul', skillId: 'skill_gen_diesel', defaultRateNgn: 7500 },
  { serviceId: 'gen-petrol-repairs', categoryId: 'generator', serviceName: 'Petrol Generator Carburetor & Engine Repair', skillId: 'skill_gen_petrol', defaultRateNgn: 4500 },
  { serviceId: 'gen-avr-rewiring', categoryId: 'generator', serviceName: 'Generator AVR Replacement & Alternator Rewinding', skillId: 'skill_gen_avr', defaultRateNgn: 5000 },
  // Air Conditioning & Refrigeration
  { serviceId: 'ac-gas-recharge', categoryId: 'ac', serviceName: 'AC Refrigerant Gas Top-Up & Leak Sealing', skillId: 'skill_ac_gas', defaultRateNgn: 6000 },
  { serviceId: 'ac-install-unmount', categoryId: 'ac', serviceName: 'Split-Unit AC Installation & Uninstallation', skillId: 'skill_ac_install', defaultRateNgn: 8000 },
  { serviceId: 'ac-compressor-repair', categoryId: 'ac', serviceName: 'AC Compressor Replacement & Coil Cleaning', skillId: 'skill_ac_compressor', defaultRateNgn: 7000 },
  // Plumbing
  { serviceId: 'plumb-leak-repairs', categoryId: 'plumbing', serviceName: 'Pipe Leak Detection & PPR Pressure Repair', skillId: 'skill_plumb_leaks', defaultRateNgn: 4000 },
  { serviceId: 'plumb-water-tank', categoryId: 'plumbing', serviceName: 'Overhead Water Tank & Float Switch Setup', skillId: 'skill_plumb_tank', defaultRateNgn: 6500 },
  { serviceId: 'plumb-drainage-unclog', categoryId: 'plumbing', serviceName: 'Bathroom Fitting & Drainage Unclogging', skillId: 'skill_plumb_drain', defaultRateNgn: 4500 },
  // Electrical & Inverters
  { serviceId: 'elec-inverter-solar', categoryId: 'electrical', serviceName: 'Solar Inverter Installation & Battery Bank Setup', skillId: 'skill_elec_solar', defaultRateNgn: 10000 },
  { serviceId: 'elec-conduit-wiring', categoryId: 'electrical', serviceName: 'Conduit & Surface Domestic Wiring', skillId: 'skill_elec_wiring', defaultRateNgn: 5000 },
  { serviceId: 'elec-db-breaker-repair', categoryId: 'electrical', serviceName: 'Distribution Board (DB) & Breaker Troubleshooting', skillId: 'skill_elec_db', defaultRateNgn: 6000 },
  // Carpentry
  { serviceId: 'carp-furniture-repair', categoryId: 'carpentry', serviceName: 'Furniture Repair & Bedframe Assembly', skillId: 'skill_carp_furniture', defaultRateNgn: 4500 },
  { serviceId: 'carp-kitchen-cabinets', categoryId: 'carpentry', serviceName: 'Kitchen Cabinet Construction & Wardrobe Fitting', skillId: 'skill_carp_cabinets', defaultRateNgn: 8500 },
  { serviceId: 'carp-roof-truss', categoryId: 'carpentry', serviceName: 'Roof Truss Construction & Ceiling Framework', skillId: 'skill_carp_roof', defaultRateNgn: 7000 },
  // Painting
  { serviceId: 'paint-interior-exterior', categoryId: 'painting', serviceName: 'Interior & Exterior Wall Emulsion/Gloss Painting', skillId: 'skill_paint_walls', defaultRateNgn: 4000 },
  { serviceId: 'paint-screeding-pop', categoryId: 'painting', serviceName: 'Wall Screeding & POP Finishing Detailing', skillId: 'skill_paint_screed', defaultRateNgn: 5500 },
  // Masonry & Tiling
  { serviceId: 'mason-tiling-porcelain', categoryId: 'masonry', serviceName: 'Porcelain & Ceramic Floor/Wall Tile Laying', skillId: 'skill_mason_tile', defaultRateNgn: 6000 },
  { serviceId: 'mason-block-plaster', categoryId: 'masonry', serviceName: 'Block Laying, Brickwork & Cement Plastering', skillId: 'skill_mason_block', defaultRateNgn: 5000 },
  // Welding & Fabrication
  { serviceId: 'weld-gate-burglar', categoryId: 'welding', serviceName: 'Iron Gate, Burglar Proof & Steel Window Fabrication', skillId: 'skill_weld_gates', defaultRateNgn: 7000 },
  { serviceId: 'weld-handrail-structural', categoryId: 'welding', serviceName: 'Stainless Steel Handrails & Structural Arc Welding', skillId: 'skill_weld_rails', defaultRateNgn: 8000 },
] as const;
```

---

## 3. Domain Models & Type Invariants

### 3.1 Currency & Pricing Representation
- In the domain layer, rates are represented as **whole Naira integers** (e.g., `hourlyRateNgn: 5000`) for direct UI editing, with utility conversion to **Kobo** (`hourlyRateKobo = hourlyRateNgn * 100`) when interfacing with backend database contracts (`TaskerSkill`).
- **Platform Invariants**:
  - Minimum hourly rate: `MIN_HOURLY_RATE_NGN = 2_000` (₦2,000 / hr).
  - Maximum hourly rate: `MAX_HOURLY_RATE_NGN = 50_000` (₦50,000 / hr).
  - Minimum diagnostic fee: `MIN_DIAGNOSTIC_FEE_NGN = 2_000` (₦2,000).
  - Maximum diagnostic fee: `MAX_DIAGNOSTIC_FEE_NGN = 20_000` (₦20,000).
  - Default recommended diagnostic fee: `DEFAULT_DIAGNOSTIC_FEE_NGN = 5_000` (₦5,000).
  - Rate step increment: `RATE_STEP_NGN = 500` (₦500 steps).

### 3.2 Domain TypeScript Types (`lib/brainworker/catalog/types.ts`)

```typescript
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
  serviceId: string;                    // Must match an entry in CANONICAL_SERVICES_REGISTRY
  categoryId: CanonicalTradeCategoryId; // Must match registry entry category
  serviceName: string;                  // Authoritative display name from registry
  hourlyRateNgn: number;                // Configured rate in Naira (2,000 to 50,000)
  status: ServiceItemStatus;            // 'ACTIVE' or 'PAUSED'
  updatedAt: string;                    // ISO 8601
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
  isComplete: boolean;             // Authoritative operational completeness invariant
}
```

### 3.3 Operational Completeness (`isComplete`) vs. Real-Time Dispatch Eligibility (`isDispatchEligibleNow`)

The contract strictly distinguishes profile completeness from real-time operational availability:

1. **Operational Profile Completeness (`isComplete`)**:
   Evaluates whether the provider has satisfied all setup requirements. Evaluates to `true` if and only if **all 6** conditions pass:
   - `catalog.services.some(s => s.status === 'ACTIVE')`: At least one configured service item is `ACTIVE`.
   - `catalog.diagnosticFeeNgn >= 2000 && catalog.diagnosticFeeNgn <= 20000`: Valid diagnostic fee.
   - `Object.values(availability.weeklySchedule).some(d => d.isActive && d.endHour > d.startHour && (d.endHour - d.startHour) >= 2)`: At least one active day with a valid window.
   - `Boolean(coverage.primaryCityId)`: Primary city set to one of the provider's verified onboarding cities.
   - `coverage.coverageNeighbourhoods.length > 0`: At least one LGA / operational zone selected.
   - `[5, 10, 15, 25, 50].includes(coverage.travelRadiusKm)`: Valid travel radius selected.

2. **Real-Time Dispatch Eligibility (`isDispatchEligibleNow`)**:
   A provider with `isComplete === true` but `isAvailable === false` is **Off-Duty**, meaning they are configured but temporarily paused.
   Conceptually:
   $$\text{isDispatchEligibleNow} = \text{isComplete} \land \text{isAvailable} \land \text{isWithinScheduledHours(currentDate, weeklySchedule)}$$
   **Invariant Rule**: `isComplete: true` alone **does not** imply current dispatch eligibility or willingness to accept leads.

---

## 4. Matching Engine Integration Contract: Actual vs. Future

### 4.1 Current Matching Behavior in `packages/utils/src/matching.ts`
The existing implementation consumes:
- **`SKILL_MATCH` (25% weight)**: Compares required `JobSkill.skillId` against provider `TaskerSkill.skillId`. BW-002 provides the exact mapping from `CANONICAL_SERVICES_REGISTRY[i].skillId` to `TaskerSkill` (`hourlyRateKobo = hourlyRateNgn * 100`).
- **`AVAILABILITY` (20% weight)**: Checks `TaskerProfile.isAvailable` (boolean) and evaluates whether `job.scheduledStartAt.getHours()` falls within working hours.
- **`LOCATION_PROXIMITY` (30% weight)**: Calculates distance using Haversine formula from customer and provider coordinates against a global `maxDistanceKm` threshold (default 100 km).

### 4.2 The Schedule Adapter Contract (Option 2: Lossless Preservation)
Because the current matching engine only accepts a single `workingHoursStart`/`workingHoursEnd` window, **BW-002 strictly rejects collapsing or fabricating the seven-day schedule into an arbitrary global window**.

Instead:
1. **Authoritative Lossless Model**: BW-002's repository stores and returns the full `weeklySchedule: Record<DayOfWeek, DaySchedule>` without distortion.
2. **Deterministic Evaluation by Target Date**: When consumer code or matching evaluates availability for a specific job, it passes the target `jobDate: Date`:
   - Day of week is derived from `jobDate.getDay()` (`0` = Sunday, `1` = Monday, etc.).
   - The specific day's `DaySchedule` is checked: if `isActive === false`, availability score is `0`. If active, `startHour` and `endHour` for that specific date are evaluated.
   - The matching hydration adapter does **not** manufacture a static global start/end window for the provider.
3. **Future Matching Evolution**: The future matching engine update will accept `weeklySchedule` directly, eliminating any single-window legacy adapter.

---

## 5. Coverage Ownership: Relationship Between BW-001 and BW-002

- **BW-001 Verification Authority**:
  During onboarding, the applicant verified broad operational cities (`coverageCities`, e.g. `['Lagos', 'Abuja']`). This represents the legal and vetted boundary of where the artisan is authorized to operate.
- **BW-002 Operational Refinement**:
  BW-002 **refines** this verified boundary:
  - The provider designates their **Primary Operating City** (`primaryCityId`), which **must** be selected from their verified `coverageCities`.
  - Within that primary city, the provider selects their specific operational zones (LGAs) and travel radius.
  - Providers cannot bypass verification by configuring a city outside their verified onboarding cities. Adding a new city requires an onboarding profile amendment.

---

## 6. Repository Interface Contract

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

  // Matching Hydration Profile (Lossless)
  getMatchingHydrationProfile(brainWorkerId: string): Promise<{
    skills: Array<{ skillId: string; hourlyRateKobo: number; isActive: boolean }>;
    isAvailable: boolean;
    isEmergencyAvailable: boolean;
    weeklySchedule: Record<DayOfWeek, DaySchedule>;
    travelRadiusKm: number;
    primaryCityId: string;
  }>;

  // Observer Subscriptions
  subscribe?(
    brainWorkerId: string,
    callback: (profile: BrainWorkerOperationalProfile) => void
  ): () => void;
}
```

---

## 7. Security, Tenant Isolation & Storage Boundaries

1. **Session-Bound Authorization (Fail-Closed)**:
   Every repository query and mutation inspects the authenticated session (`getMockAuthenticatedUser()`). If the caller's ID does not match the target `brainWorkerId`, the call fails closed throwing `FORBIDDEN_TENANT_ACCESS`.
2. **Operating Gate (`isBrainWorkerApproved`)**:
   Only users with `role === 'brainworker'` and `isBrainWorkerApproved === true` are permitted access to `/brainworker/services` and `/brainworker/availability`. Customers and unapproved providers are blocked.
3. **Storage & SSR Boundary (`ARCH-002`)**:
   - In browser environments, data is persisted to `localStorage` under tenant-scoped keys: `bukie_bw_operations_${brainWorkerId}`.
   - All browser storage accesses are wrapped with `typeof window !== 'undefined'`.
   - The UI does not imply background server synchronization. Local state is marked transparently as local persistence.
4. **Physical Testing Boundary**:
   Test fixtures and mock harness factories reside strictly in `apps/web/lib/brainworker/catalog/testing/`. Production code contains zero imports from `testing/`.
