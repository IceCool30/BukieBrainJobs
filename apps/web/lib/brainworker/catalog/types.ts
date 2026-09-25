// apps/web/lib/brainworker/catalog/types.ts
// BW-002: BrainWorker Service Catalog & Availability Management Domain Types
// Governed by: BW-002 Architecture Contract v1.2 & Test-First Implementation Plan v1.2

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Canonical Category & Service Registry
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type CanonicalTradeCategoryId =
  | 'generator'
  | 'ac'
  | 'plumbing'
  | 'electrical'
  | 'carpentry'
  | 'painting'
  | 'masonry'
  | 'welding';

export const CANONICAL_TRADE_CATEGORIES: readonly CanonicalTradeCategoryId[] = [
  'generator',
  'ac',
  'plumbing',
  'electrical',
  'carpentry',
  'painting',
  'masonry',
  'welding',
] as const;

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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Constants & Numerical Invariants
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const MIN_HOURLY_RATE_NGN = 2_000;
export const MAX_HOURLY_RATE_NGN = 50_000;
export const MIN_DIAGNOSTIC_FEE_NGN = 2_000;
export const MAX_DIAGNOSTIC_FEE_NGN = 20_000;
export const DEFAULT_DIAGNOSTIC_FEE_NGN = 5_000;
export const RATE_STEP_NGN = 500;

export const VALID_TRAVEL_RADII_KM = [5, 10, 15, 25, 50] as const;
export type ValidTravelRadiusKm = (typeof VALID_TRAVEL_RADII_KM)[number];

export const MIN_SCHEDULE_START_HOUR = 6;
export const MAX_SCHEDULE_END_HOUR = 22;
export const MIN_SCHEDULE_WINDOW_HOURS = 2;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Schedule & Catalog Domain Models
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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
  diagnosticFeeNgn: number;             // Base call-out fee (2,000 to 20,000)
  services: ConfiguredServiceItem[];
  updatedAt: string;                    // ISO 8601
}

export interface BrainWorkerAvailability {
  brainWorkerId: string;
  isAvailable: boolean;                 // Global dispatch duty toggle: true (On-Duty) | false (Off-Duty)
  isEmergencyAvailable: boolean;        // Readiness for urgent dispatch (< 2hr arrival window, target 60-90m)
  weeklySchedule: Record<DayOfWeek, DaySchedule>;
  updatedAt: string;                    // ISO 8601
}

export interface BrainWorkerCoverage {
  brainWorkerId: string;
  primaryCityId: string;                // Must be one of the provider's verified BW-001 coverageCities
  primaryCityName: string;              // E.g. 'Lagos', 'Abuja'
  coverageNeighbourhoods: string[];     // Selected LGAs / operational zones within primaryCity
  travelRadiusKm: ValidTravelRadiusKm;  // One of: 5, 10, 15, 25, 50 km
  updatedAt: string;                    // ISO 8601
}

export interface BrainWorkerOperationalProfile {
  brainWorkerId: string;
  catalog: BrainWorkerServiceCatalog;
  availability: BrainWorkerAvailability;
  coverage: BrainWorkerCoverage;
  isComplete: boolean;                  // Authoritative operational completeness invariant
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Operations Repository Interface Contract
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface IBrainWorkerOperationsRepository {
  getOperationalProfile(brainWorkerId: string): Promise<BrainWorkerOperationalProfile | null>;

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

  getAvailability(brainWorkerId: string): Promise<BrainWorkerAvailability>;
  saveAvailability(
    brainWorkerId: string,
    availability: {
      isAvailable: boolean;
      isEmergencyAvailable: boolean;
      weeklySchedule: Record<DayOfWeek, DaySchedule>;
    }
  ): Promise<BrainWorkerAvailability>;

  getCoverage(brainWorkerId: string): Promise<BrainWorkerCoverage>;
  saveCoverage(
    brainWorkerId: string,
    coverage: {
      primaryCityId: string;
      primaryCityName: string;
      coverageNeighbourhoods: string[];
      travelRadiusKm: ValidTravelRadiusKm;
    }
  ): Promise<BrainWorkerCoverage>;

  getMatchingHydrationProfile(brainWorkerId: string): Promise<MatchingHydrationProfile>;

  subscribe?(
    brainWorkerId: string,
    callback: (profile: BrainWorkerOperationalProfile) => void
  ): () => void;
}

export interface MatchingHydrationProfile {
  skills: Array<{ skillId: string; hourlyRateKobo: number; isActive: boolean }>;
  isAvailable: boolean;
  isEmergencyAvailable: boolean;
  weeklySchedule: Record<DayOfWeek, DaySchedule>;
  travelRadiusKm: number;
  primaryCityId: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Domain Errors
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class ForbiddenTenantAccessError extends Error {
  readonly code = 'FORBIDDEN_TENANT_ACCESS';

  constructor(message = 'FORBIDDEN_TENANT_ACCESS') {
    super(message);
    this.name = 'ForbiddenTenantAccessError';
  }
}

export class OperationsValidationError extends Error {
  readonly code = 'OPERATIONS_VALIDATION_ERROR';

  constructor(message: string) {
    super(message);
    this.name = 'OperationsValidationError';
  }
}

