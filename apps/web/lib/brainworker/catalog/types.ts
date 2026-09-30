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
];

export type ServiceComplexityTier = 'standard' | 'complex' | 'commercial';

export interface CanonicalServiceDefinition {
  serviceId: string;
  categoryId: CanonicalTradeCategoryId;
  skillId: string;
  title: string;
  description: string;
  defaultHourlyRateNgn: number;
  minHourlyRateNgn: number;
  maxHourlyRateNgn: number;
  complexityTier: ServiceComplexityTier;
  requiresSpecializationBadge: boolean;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Constants & Allowed Bounds
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const DIAGNOSTIC_FEE_BOUNDS = {
  MIN_NGN: 2000,
  MAX_NGN: 20000,
} as const;

export const HOURLY_RATE_BOUNDS = {
  MIN_NGN: 2000,
  MAX_NGN: 50000,
} as const;

export const DEFAULT_DIAGNOSTIC_FEE_NGN = 5000;

export const VALID_TRAVEL_RADII_KM = [5, 10, 15, 25, 50] as const;
export type ValidTravelRadiusKm = (typeof VALID_TRAVEL_RADII_KM)[number];

export const VALID_WORKING_HOURS = {
  MIN_HOUR: 6,
  MAX_HOUR: 22,
  MIN_WINDOW_HOURS: 2,
} as const;

export const ORDERED_DAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

export type DayOfWeek = (typeof ORDERED_DAYS)[number];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Schedule & Catalog Domain Models
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface DaySchedule {
  day: DayOfWeek;
  isActive: boolean;
  startHour: number; // 0-23 (24h format, valid: 6 to 20)
  endHour: number;   // 0-23 (24h format, valid: 8 to 22)
}

export type ServiceItemStatus = 'ACTIVE' | 'PAUSED';

export interface ConfiguredServiceItem {
  serviceId: string;
  hourlyRateNgn: number; // within [2000, 50000]
  status: ServiceItemStatus;
}

export interface BrainWorkerServiceCatalog {
  brainWorkerId: string;
  diagnosticFeeNgn: number; // within [2000, 20000]
  services: ConfiguredServiceItem[];
  updatedAt: string;
}

export interface BrainWorkerAvailability {
  brainWorkerId: string;
  isAvailable: boolean;
  isEmergencyAvailable: boolean;
  weeklySchedule: Record<DayOfWeek, DaySchedule>;
  updatedAt: string;
}

export interface BrainWorkerCoverage {
  brainWorkerId: string;
  primaryCityId: string;
  primaryCityName: string;
  coverageNeighbourhoods: string[];
  travelRadiusKm: ValidTravelRadiusKm;
  updatedAt: string;
}

export interface BrainWorkerOperationalProfile {
  brainWorkerId: string;
  catalog: BrainWorkerServiceCatalog;
  availability: BrainWorkerAvailability;
  coverage: BrainWorkerCoverage;
  isComplete: boolean;
  updatedAt: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Operations Repository Interface Contract
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface IBrainWorkerOperationsRepository {
  getOperationalProfile(brainWorkerId: string): Promise<BrainWorkerOperationalProfile | null>;

  getConfiguredCatalog(brainWorkerId: string): Promise<BrainWorkerServiceCatalog | null>;

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

  subscribeToOperationalProfile(
    brainWorkerId: string,
    callback: (profile: BrainWorkerOperationalProfile) => void
  ): () => void;
}

export interface MatchingHydrationProfile {
  skills: Array<{
    skillId: string;
    hourlyRateKobo: number;
    isActive: boolean;
  }>;
  isAvailable: boolean;
  isEmergencyAvailable: boolean;
  weeklySchedule: Record<DayOfWeek, DaySchedule>;
  travelRadiusKm: number;
  coverageNeighbourhoods: string[];
  primaryCityId: string;
  isOperationalReady: boolean;
}
