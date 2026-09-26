// apps/web/lib/brainworker/catalog/store.ts
// Phase 3 GREEN: BrainWorker Operations & Catalog Client Store
// Governed by: BW-002 Architecture Contract v1.2 & Test-First Implementation Plan v1.2 (Suite 3: STO-001 to STO-006)

import { create } from 'zustand';
import {
  CANONICAL_SERVICES_REGISTRY,
  type BrainWorkerOperationalProfile,
  type BrainWorkerServiceCatalog,
  type BrainWorkerAvailability,
  type BrainWorkerCoverage,
  type DayOfWeek,
  type DaySchedule,
  type ConfiguredServiceItem,
  type ServiceItemStatus,
  type ValidTravelRadiusKm,
} from './types';
import {
  isOperationalProfileComplete,
  validateHourlyRate,
  validateDiagnosticFee,
  validateDaySchedule,
} from './validation';

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
  initializeCatalog: (catalog: BrainWorkerServiceCatalog) => void;
  resetStore: () => void;
  setDirty: (isDirty: boolean) => void;
  setIsSaving: (isSaving: boolean) => void;
  setSaveError: (error: string | null) => void;
  clearValidationError: (key: string) => void;

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

const createInitialState = () => ({
  catalog: {
    ...INITIAL_OPERATIONS_CATALOG,
    services: [],
  },
  availability: {
    ...INITIAL_OPERATIONS_AVAILABILITY,
    weeklySchedule: {
      monday: { ...INITIAL_OPERATIONS_WEEKLY_SCHEDULE.monday },
      tuesday: { ...INITIAL_OPERATIONS_WEEKLY_SCHEDULE.tuesday },
      wednesday: { ...INITIAL_OPERATIONS_WEEKLY_SCHEDULE.wednesday },
      thursday: { ...INITIAL_OPERATIONS_WEEKLY_SCHEDULE.thursday },
      friday: { ...INITIAL_OPERATIONS_WEEKLY_SCHEDULE.friday },
      saturday: { ...INITIAL_OPERATIONS_WEEKLY_SCHEDULE.saturday },
      sunday: { ...INITIAL_OPERATIONS_WEEKLY_SCHEDULE.sunday },
    },
  },
  coverage: {
    ...INITIAL_OPERATIONS_COVERAGE,
    coverageNeighbourhoods: [],
  },
  isDirty: false,
  isSaving: false,
  saveError: null,
  validationErrors: {} as Record<string, string>,
  isComplete: false,
});

export const useBrainWorkerOperationsStore = create<BrainWorkerOperationsStoreState>((set) => {
  return {
    ...createInitialState(),

    initializeFromProfile: (profile) => {
      const catalog: BrainWorkerServiceCatalog = {
        ...profile.catalog,
        services: Array.isArray(profile.catalog?.services)
          ? profile.catalog.services.map((s) => ({ ...s }))
          : [],
      };
      const weeklySchedule = {
        ...(profile.availability?.weeklySchedule ?? INITIAL_OPERATIONS_WEEKLY_SCHEDULE),
      };
      for (const day of Object.keys(weeklySchedule) as DayOfWeek[]) {
        if (weeklySchedule[day]) {
          weeklySchedule[day] = { ...weeklySchedule[day] };
        }
      }
      const availability: BrainWorkerAvailability = {
        ...profile.availability,
        weeklySchedule,
      };
      const coverage: BrainWorkerCoverage = {
        ...profile.coverage,
        coverageNeighbourhoods: Array.isArray(profile.coverage?.coverageNeighbourhoods)
          ? [...profile.coverage.coverageNeighbourhoods]
          : [],
      };

      const isComplete = isOperationalProfileComplete({
        catalog,
        availability,
        coverage,
      });

      set({
        catalog,
        availability,
        coverage,
        isDirty: false,
        isSaving: false,
        saveError: null,
        validationErrors: {},
        isComplete,
      });
    },

    initializeCatalog: (catalog) => {
      set((state) => {
        const nextCatalog: BrainWorkerServiceCatalog = {
          brainWorkerId: catalog?.brainWorkerId ?? state.catalog.brainWorkerId,
          diagnosticFeeNgn:
            typeof catalog?.diagnosticFeeNgn === 'number'
              ? catalog.diagnosticFeeNgn
              : state.catalog.diagnosticFeeNgn,
          services: Array.isArray(catalog?.services)
            ? catalog.services.map((s) => ({ ...s }))
            : [],
          updatedAt: catalog?.updatedAt ?? new Date().toISOString(),
        };

        const nextValidationErrors = { ...state.validationErrors };
        delete nextValidationErrors.diagnosticFee;
        for (const key of Object.keys(nextValidationErrors)) {
          if (key.startsWith('service_rate_')) {
            delete nextValidationErrors[key];
          }
        }

        const feeValidation = validateDiagnosticFee(nextCatalog.diagnosticFeeNgn);
        if (!feeValidation.valid && feeValidation.error) {
          nextValidationErrors.diagnosticFee = feeValidation.error;
        }

        for (const s of nextCatalog.services) {
          const rateValidation = validateHourlyRate(s.hourlyRateNgn);
          if (!rateValidation.valid && rateValidation.error) {
            nextValidationErrors[`service_rate_${s.serviceId}`] = rateValidation.error;
          }
        }

        const nextComplete = isOperationalProfileComplete({
          catalog: nextCatalog,
          availability: state.availability,
          coverage: state.coverage,
        });

        return {
          catalog: nextCatalog,
          validationErrors: nextValidationErrors,
          isDirty: false,
          isSaving: false,
          saveError: null,
          isComplete: nextComplete,
        };
      });
    },

    resetStore: () => {
      set(() => createInitialState());
    },

    setDirty: (isDirty) => {
      set({ isDirty });
    },

    setIsSaving: (isSaving) => {
      set({ isSaving });
    },

    setSaveError: (saveError) => {
      set({ saveError });
    },

    clearValidationError: (key) => {
      set((state) => {
        if (!(key in state.validationErrors)) {
          return state;
        }
        const nextValidationErrors = { ...state.validationErrors };
        delete nextValidationErrors[key];
        return { validationErrors: nextValidationErrors };
      });
    },

    addService: (serviceId, initialRateNgn) => {
      set((state) => {
        const canonical = CANONICAL_SERVICES_REGISTRY.find((s) => s.serviceId === serviceId);
        if (!canonical) {
          return state;
        }

        const alreadyExists = state.catalog.services.some((s) => s.serviceId === serviceId);
        if (alreadyExists) {
          return state;
        }

        const hourlyRateNgn = initialRateNgn ?? canonical.defaultRateNgn;
        const newService: ConfiguredServiceItem = {
          serviceId: canonical.serviceId,
          categoryId: canonical.categoryId,
          serviceName: canonical.serviceName,
          hourlyRateNgn,
          status: 'ACTIVE',
          updatedAt: new Date().toISOString(),
        };

        const nextServices = [...state.catalog.services, newService];
        const nextCatalog: BrainWorkerServiceCatalog = {
          ...state.catalog,
          services: nextServices,
          updatedAt: new Date().toISOString(),
        };

        const nextValidationErrors = { ...state.validationErrors };
        const rateValidation = validateHourlyRate(hourlyRateNgn);
        const errorKey = `service_rate_${serviceId}`;
        if (!rateValidation.valid && rateValidation.error) {
          nextValidationErrors[errorKey] = rateValidation.error;
        } else {
          delete nextValidationErrors[errorKey];
        }

        const nextComplete = isOperationalProfileComplete({
          catalog: nextCatalog,
          availability: state.availability,
          coverage: state.coverage,
        });

        return {
          catalog: nextCatalog,
          validationErrors: nextValidationErrors,
          isDirty: true,
          isComplete: nextComplete,
        };
      });
    },

    removeService: (serviceId) => {
      set((state) => {
        const serviceExists = state.catalog.services.some((s) => s.serviceId === serviceId);
        const errorKey = `service_rate_${serviceId}`;
        const hasError = errorKey in state.validationErrors;

        if (!serviceExists && !hasError) {
          return state;
        }

        const nextServices = state.catalog.services.filter((s) => s.serviceId !== serviceId);
        const nextCatalog: BrainWorkerServiceCatalog = {
          ...state.catalog,
          services: nextServices,
          updatedAt: new Date().toISOString(),
        };

        const nextValidationErrors = { ...state.validationErrors };
        delete nextValidationErrors[errorKey];

        const nextComplete = isOperationalProfileComplete({
          catalog: nextCatalog,
          availability: state.availability,
          coverage: state.coverage,
        });

        return {
          catalog: nextCatalog,
          validationErrors: nextValidationErrors,
          isDirty: true,
          isComplete: nextComplete,
        };
      });
    },

    toggleServiceStatus: (serviceId) => {
      set((state) => {
        const serviceIndex = state.catalog.services.findIndex((s) => s.serviceId === serviceId);
        if (serviceIndex === -1) {
          return state;
        }

        const currentService = state.catalog.services[serviceIndex]!;
        const nextStatus: ServiceItemStatus =
          currentService.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';

        const updatedService: ConfiguredServiceItem = {
          ...currentService,
          status: nextStatus,
          updatedAt: new Date().toISOString(),
        };

        const nextServices = [...state.catalog.services];
        nextServices[serviceIndex] = updatedService;

        const nextCatalog: BrainWorkerServiceCatalog = {
          ...state.catalog,
          services: nextServices,
          updatedAt: new Date().toISOString(),
        };

        const nextComplete = isOperationalProfileComplete({
          catalog: nextCatalog,
          availability: state.availability,
          coverage: state.coverage,
        });

        return {
          catalog: nextCatalog,
          isDirty: true,
          isComplete: nextComplete,
        };
      });
    },

    updateServiceRate: (serviceId, hourlyRateNgn) => {
      set((state) => {
        const serviceIndex = state.catalog.services.findIndex((s) => s.serviceId === serviceId);
        if (serviceIndex === -1) {
          return state;
        }

        const currentService = state.catalog.services[serviceIndex]!;
        const updatedService: ConfiguredServiceItem = {
          ...currentService,
          hourlyRateNgn,
          updatedAt: new Date().toISOString(),
        };

        const nextServices = [...state.catalog.services];
        nextServices[serviceIndex] = updatedService;

        const nextCatalog: BrainWorkerServiceCatalog = {
          ...state.catalog,
          services: nextServices,
          updatedAt: new Date().toISOString(),
        };

        const nextValidationErrors = { ...state.validationErrors };
        const validation = validateHourlyRate(hourlyRateNgn);
        const errorKey = `service_rate_${serviceId}`;
        if (!validation.valid && validation.error) {
          nextValidationErrors[errorKey] = validation.error;
        } else {
          delete nextValidationErrors[errorKey];
        }

        const nextComplete = isOperationalProfileComplete({
          catalog: nextCatalog,
          availability: state.availability,
          coverage: state.coverage,
        });

        return {
          catalog: nextCatalog,
          validationErrors: nextValidationErrors,
          isDirty: true,
          isComplete: nextComplete,
        };
      });
    },

    updateDiagnosticFee: (diagnosticFeeNgn) => {
      set((state) => {
        const nextCatalog: BrainWorkerServiceCatalog = {
          ...state.catalog,
          diagnosticFeeNgn,
          updatedAt: new Date().toISOString(),
        };

        const nextValidationErrors = { ...state.validationErrors };
        const validation = validateDiagnosticFee(diagnosticFeeNgn);
        if (!validation.valid && validation.error) {
          nextValidationErrors.diagnosticFee = validation.error;
        } else {
          delete nextValidationErrors.diagnosticFee;
        }

        const nextComplete = isOperationalProfileComplete({
          catalog: nextCatalog,
          availability: state.availability,
          coverage: state.coverage,
        });

        return {
          catalog: nextCatalog,
          validationErrors: nextValidationErrors,
          isDirty: true,
          isComplete: nextComplete,
        };
      });
    },

    updateDaySchedule: (day, update) => {
      set((state) => {
        const currentSchedule = state.availability.weeklySchedule[day];
        if (!currentSchedule) {
          return state;
        }
        const updatedDaySchedule: DaySchedule = {
          ...currentSchedule,
          ...update,
          day,
        };

        const nextWeeklySchedule = {
          ...state.availability.weeklySchedule,
          [day]: updatedDaySchedule,
        };

        const nextAvailability: BrainWorkerAvailability = {
          ...state.availability,
          weeklySchedule: nextWeeklySchedule,
          updatedAt: new Date().toISOString(),
        };

        const nextValidationErrors = { ...state.validationErrors };
        const errorKey = `schedule_${day}`;

        const validation = validateDaySchedule(updatedDaySchedule);
        if (!validation.valid && validation.error) {
          nextValidationErrors[errorKey] = validation.error;
        } else {
          delete nextValidationErrors[errorKey];
        }

        const nextComplete = isOperationalProfileComplete({
          catalog: state.catalog,
          availability: nextAvailability,
          coverage: state.coverage,
        });

        return {
          availability: nextAvailability,
          validationErrors: nextValidationErrors,
          isDirty: true,
          isComplete: nextComplete,
        };
      });
    },

    copyMondayHoursToWeekdays: () => {
      set((state) => {
        const monday = state.availability.weeklySchedule?.monday;
        if (!monday) {
          return state;
        }
        const weekdays: DayOfWeek[] = ['tuesday', 'wednesday', 'thursday', 'friday'];

        const nextWeeklySchedule = { ...state.availability.weeklySchedule };
        const nextValidationErrors = { ...state.validationErrors };

        for (const day of weekdays) {
          const copiedSchedule: DaySchedule = {
            day,
            isActive: monday.isActive,
            startHour: monday.startHour,
            endHour: monday.endHour,
          };
          nextWeeklySchedule[day] = copiedSchedule;

          const validation = validateDaySchedule(copiedSchedule);
          const errorKey = `schedule_${day}`;
          if (!validation.valid && validation.error) {
            nextValidationErrors[errorKey] = validation.error;
          } else {
            delete nextValidationErrors[errorKey];
          }
        }

        const nextAvailability: BrainWorkerAvailability = {
          ...state.availability,
          weeklySchedule: nextWeeklySchedule,
          updatedAt: new Date().toISOString(),
        };

        const nextComplete = isOperationalProfileComplete({
          catalog: state.catalog,
          availability: nextAvailability,
          coverage: state.coverage,
        });

        return {
          availability: nextAvailability,
          validationErrors: nextValidationErrors,
          isDirty: true,
          isComplete: nextComplete,
        };
      });
    },

    setIsAvailable: (isAvailable) => {
      set((state) => {
        const nextAvailability: BrainWorkerAvailability = {
          ...state.availability,
          isAvailable,
          updatedAt: new Date().toISOString(),
        };

        const nextComplete = isOperationalProfileComplete({
          catalog: state.catalog,
          availability: nextAvailability,
          coverage: state.coverage,
        });

        return {
          availability: nextAvailability,
          isDirty: true,
          isComplete: nextComplete,
        };
      });
    },

    setIsEmergencyAvailable: (isEmergencyAvailable) => {
      set((state) => {
        const nextAvailability: BrainWorkerAvailability = {
          ...state.availability,
          isEmergencyAvailable,
          updatedAt: new Date().toISOString(),
        };

        const nextComplete = isOperationalProfileComplete({
          catalog: state.catalog,
          availability: nextAvailability,
          coverage: state.coverage,
        });

        return {
          availability: nextAvailability,
          isDirty: true,
          isComplete: nextComplete,
        };
      });
    },

    setPrimaryCity: (cityId, cityName) => {
      set((state) => {
        const nextCoverage: BrainWorkerCoverage = {
          ...state.coverage,
          primaryCityId: cityId,
          primaryCityName: cityName,
          updatedAt: new Date().toISOString(),
        };

        const nextComplete = isOperationalProfileComplete({
          catalog: state.catalog,
          availability: state.availability,
          coverage: nextCoverage,
        });

        return {
          coverage: nextCoverage,
          isDirty: true,
          isComplete: nextComplete,
        };
      });
    },

    setCoverageNeighbourhoods: (neighbourhoods) => {
      set((state) => {
        const nextCoverage: BrainWorkerCoverage = {
          ...state.coverage,
          coverageNeighbourhoods: Array.isArray(neighbourhoods) ? [...neighbourhoods] : [],
          updatedAt: new Date().toISOString(),
        };

        const nextComplete = isOperationalProfileComplete({
          catalog: state.catalog,
          availability: state.availability,
          coverage: nextCoverage,
        });

        return {
          coverage: nextCoverage,
          isDirty: true,
          isComplete: nextComplete,
        };
      });
    },

    setTravelRadius: (travelRadiusKm) => {
      set((state) => {
        const nextCoverage: BrainWorkerCoverage = {
          ...state.coverage,
          travelRadiusKm,
          updatedAt: new Date().toISOString(),
        };

        const nextComplete = isOperationalProfileComplete({
          catalog: state.catalog,
          availability: state.availability,
          coverage: nextCoverage,
        });

        return {
          coverage: nextCoverage,
          isDirty: true,
          isComplete: nextComplete,
        };
      });
    },
  };
});

export const useBrainWorkerCatalogStore = useBrainWorkerOperationsStore;
