// apps/web/lib/brainworker/catalog/store.ts
// Phase 3 RED Stub: BrainWorker Operations & Catalog Client Store
// Governed by: BW-002 Architecture Contract v1.2 & Test-First Implementation Plan v1.2 (Suite 3: STO-001 to STO-006)

import { create } from 'zustand';
import type {
  BrainWorkerOperationalProfile,
  BrainWorkerServiceCatalog,
  BrainWorkerAvailability,
  BrainWorkerCoverage,
  DayOfWeek,
  DaySchedule,
  ValidTravelRadiusKm,
} from './types';

export const INITIAL_OPERATIONS_WEEKLY_SCHEDULE: Record<DayOfWeek, DaySchedule> = {
  monday: { day: 'monday', isActive: true, startHour: 8, endHour: 18 },
  tuesday: { day: 'tuesday', isActive: true, startHour: 8, endHour: 18 },
  wednesday: { day: 'wednesday', isActive: true, startHour: 8, endHour: 18 },
  thursday: { day: 'thursday', isActive: true, startHour: 8, endHour: 18 },
  friday: { day: 'friday', isActive: true, startHour: 8, endHour: 18 },
  saturday: { day: 'saturday', isActive: false, startHour: 9, endHour: 17 },
  sunday: { day: 'sunday', isActive: false, startHour: 9, endHour: 17 },
};

export const INITIAL_OPERATIONS_CATALOG: BrainWorkerServiceCatalog = {
  brainWorkerId: '',
  diagnosticFeeNgn: 5000,
  services: [],
  updatedAt: '',
};

export const INITIAL_OPERATIONS_AVAILABILITY: BrainWorkerAvailability = {
  brainWorkerId: '',
  isAvailable: false,
  isEmergencyAvailable: false,
  weeklySchedule: INITIAL_OPERATIONS_WEEKLY_SCHEDULE,
  updatedAt: '',
};

export const INITIAL_OPERATIONS_COVERAGE: BrainWorkerCoverage = {
  brainWorkerId: '',
  primaryCityId: '',
  primaryCityName: '',
  coverageNeighbourhoods: [],
  travelRadiusKm: 15,
  updatedAt: '',
};

export interface BrainWorkerOperationsStoreState {
  // Operational Data Drafts
  catalog: BrainWorkerServiceCatalog;
  availability: BrainWorkerAvailability;
  coverage: BrainWorkerCoverage;

  // UI & Mutation State
  isDirty: boolean;
  isSaving: boolean;
  saveError: string | null;
  validationErrors: Record<string, string>;

  // Derived Completeness
  isComplete: boolean;

  // Actions
  initializeFromProfile: (profile: BrainWorkerOperationalProfile) => void;
  resetStore: () => void;
  setDirty: (isDirty: boolean) => void;
  setIsSaving: (isSaving: boolean) => void;
  setSaveError: (error: string | null) => void;

  // Service Catalog Actions
  addService: (serviceId: string, initialRateNgn?: number) => void;
  removeService: (serviceId: string) => void;
  toggleServiceStatus: (serviceId: string) => void;
  updateServiceRate: (serviceId: string, hourlyRateNgn: number) => void;
  updateDiagnosticFee: (diagnosticFeeNgn: number) => void;

  // Availability Actions
  updateDaySchedule: (day: DayOfWeek, update: Partial<DaySchedule>) => void;
  copyMondayHoursToWeekdays: () => void;
  setIsAvailable: (isAvailable: boolean) => void;
  setIsEmergencyAvailable: (isEmergencyAvailable: boolean) => void;

  // Coverage Actions
  setPrimaryCity: (cityId: string, cityName: string) => void;
  setCoverageNeighbourhoods: (neighbourhoods: string[]) => void;
  setTravelRadius: (travelRadiusKm: ValidTravelRadiusKm) => void;
}

export const useBrainWorkerOperationsStore = create<BrainWorkerOperationsStoreState>((set) => {
  void set;
  return {
    catalog: { ...INITIAL_OPERATIONS_CATALOG, services: [] },
    availability: {
      ...INITIAL_OPERATIONS_AVAILABILITY,
      weeklySchedule: { ...INITIAL_OPERATIONS_WEEKLY_SCHEDULE },
    },
    coverage: { ...INITIAL_OPERATIONS_COVERAGE, coverageNeighbourhoods: [] },
    isDirty: false,
    isSaving: false,
    saveError: null,
    validationErrors: {},
    isComplete: false,

    // RED Stub: intentionally unimplemented actions
    initializeFromProfile: (profile) => {
      void profile;
    },
    resetStore: () => {},
    setDirty: (isDirty) => {
      void isDirty;
    },
    setIsSaving: (isSaving) => {
      void isSaving;
    },
    setSaveError: (error) => {
      void error;
    },

    addService: (serviceId, initialRateNgn) => {
      void serviceId;
      void initialRateNgn;
    },
    removeService: (serviceId) => {
      void serviceId;
    },
    toggleServiceStatus: (serviceId) => {
      void serviceId;
    },
    updateServiceRate: (serviceId, hourlyRateNgn) => {
      void serviceId;
      void hourlyRateNgn;
    },
    updateDiagnosticFee: (diagnosticFeeNgn) => {
      void diagnosticFeeNgn;
    },

    updateDaySchedule: (day, update) => {
      void day;
      void update;
    },
    copyMondayHoursToWeekdays: () => {},
    setIsAvailable: (isAvailable) => {
      void isAvailable;
    },
    setIsEmergencyAvailable: (isEmergencyAvailable) => {
      void isEmergencyAvailable;
    },

    setPrimaryCity: (cityId, cityName) => {
      void cityId;
      void cityName;
    },
    setCoverageNeighbourhoods: (neighbourhoods) => {
      void neighbourhoods;
    },
    setTravelRadius: (travelRadiusKm) => {
      void travelRadiusKm;
    },
  };
});

export const useBrainWorkerCatalogStore = useBrainWorkerOperationsStore;
