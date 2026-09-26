// apps/web/lib/brainworker/catalog/store.test.ts
// BW-002: BrainWorker Operations Store Contracts (Suite 3: STO-001 through STO-006)
// Authoritative References:
// - docs/specs/BW-002-architecture-contract.md (v1.2, Sections 3 & 6)
// - docs/specs/BW-002-test-first-implementation-plan.md (v1.2, Suite 3: STO-001 to STO-006)
// - docs/specs/BW-002-service-catalog-availability.md (v1.2, FR-001 to FR-012, FR-008b)

import { describe, it, expect, beforeEach } from 'vitest';
import { useBrainWorkerOperationsStore } from './store';
import { FIXTURE_OPERATIONAL_PROFILE_A } from './testing';
import type { ValidTravelRadiusKm } from './types';

describe('BW-002 Client Store Contracts (Suite 3: STO-001 to STO-006)', () => {
  beforeEach(() => {
    useBrainWorkerOperationsStore.getState().resetStore();
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STO-001: Initializes Default Draft State Matching Profile & Lifecycle
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('STO-001: Initializes Default Draft State Matching Profile & Lifecycle', () => {
    it('initializes store with clean default draft values and isComplete false', () => {
      const state = useBrainWorkerOperationsStore.getState();

      expect(state.catalog.diagnosticFeeNgn).toBe(5000);
      expect(state.catalog.services).toEqual([]);
      expect(state.availability.isAvailable).toBe(false);
      expect(state.availability.isEmergencyAvailable).toBe(false);
      expect(Object.keys(state.availability.weeklySchedule)).toHaveLength(7);
      expect(state.coverage.primaryCityId).toBe('');
      expect(state.coverage.primaryCityName).toBe('');
      expect(state.coverage.coverageNeighbourhoods).toEqual([]);
      expect(state.coverage.travelRadiusKm).toBe(15);
      expect(state.isDirty).toBe(false);
      expect(state.isSaving).toBe(false);
      expect(state.saveError).toBeNull();
      expect(state.validationErrors).toEqual({});
      expect(state.isComplete).toBe(false);
    });

    it('hydrates operational profile draft accurately and resets dirty flag', () => {
      useBrainWorkerOperationsStore
        .getState()
        .initializeFromProfile(FIXTURE_OPERATIONAL_PROFILE_A);

      const state = useBrainWorkerOperationsStore.getState();
      expect(state.catalog.diagnosticFeeNgn).toBe(5000);
      expect(state.catalog.services).toHaveLength(2);
      expect(state.catalog.services[0]?.serviceId).toBe('gen-diesel-servicing');
      expect(state.availability.isAvailable).toBe(true);
      expect(state.coverage.primaryCityId).toBe('Lagos');
      expect(state.coverage.coverageNeighbourhoods).toContain('Ikeja');
      expect(state.coverage.travelRadiusKm).toBe(25);
      expect(state.isComplete).toBe(true);
      expect(state.isDirty).toBe(false);
    });

    it('resets store back to initial clean state across all slices and errors', () => {
      useBrainWorkerOperationsStore
        .getState()
        .initializeFromProfile(FIXTURE_OPERATIONAL_PROFILE_A);
      useBrainWorkerOperationsStore.getState().setDirty(true);
      useBrainWorkerOperationsStore.getState().setIsSaving(true);
      useBrainWorkerOperationsStore.getState().setSaveError('Network failure');

      useBrainWorkerOperationsStore.getState().resetStore();
      const state = useBrainWorkerOperationsStore.getState();

      expect(state.catalog.services).toEqual([]);
      expect(state.catalog.diagnosticFeeNgn).toBe(5000);
      expect(state.availability.isAvailable).toBe(false);
      expect(state.availability.isEmergencyAvailable).toBe(false);
      expect(state.coverage.primaryCityId).toBe('');
      expect(state.coverage.primaryCityName).toBe('');
      expect(state.coverage.coverageNeighbourhoods).toEqual([]);
      expect(state.coverage.travelRadiusKm).toBe(15);
      expect(state.isDirty).toBe(false);
      expect(state.isSaving).toBe(false);
      expect(state.saveError).toBeNull();
      expect(state.validationErrors).toEqual({});
      expect(state.isComplete).toBe(false);
    });

    it('updates dirty flag independently with setDirty', () => {
      useBrainWorkerOperationsStore.getState().setDirty(true);
      expect(useBrainWorkerOperationsStore.getState().isDirty).toBe(true);

      useBrainWorkerOperationsStore.getState().setDirty(false);
      expect(useBrainWorkerOperationsStore.getState().isDirty).toBe(false);
    });

    it('updates saving flag and save error with setIsSaving and setSaveError', () => {
      useBrainWorkerOperationsStore.getState().setIsSaving(true);
      expect(useBrainWorkerOperationsStore.getState().isSaving).toBe(true);

      useBrainWorkerOperationsStore.getState().setSaveError('Failed to persist');
      expect(useBrainWorkerOperationsStore.getState().saveError).toBe('Failed to persist');

      useBrainWorkerOperationsStore.getState().setSaveError(null);
      expect(useBrainWorkerOperationsStore.getState().saveError).toBeNull();

      useBrainWorkerOperationsStore.getState().setIsSaving(false);
      expect(useBrainWorkerOperationsStore.getState().isSaving).toBe(false);
    });

    it('allows clearing a validation error with clearValidationError', () => {
      useBrainWorkerOperationsStore.getState().updateDiagnosticFee(1000);
      expect(useBrainWorkerOperationsStore.getState().validationErrors.diagnosticFee).toBeDefined();

      useBrainWorkerOperationsStore.getState().clearValidationError('diagnosticFee');
      expect(useBrainWorkerOperationsStore.getState().validationErrors.diagnosticFee).toBeUndefined();
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STO-002: Optimistically Adds and Removes Services from Catalog Draft
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('STO-002: Optimistically Adds and Removes Services', () => {
    it('adds service from canonical registry with default rate and active status', () => {
      useBrainWorkerOperationsStore.getState().addService('gen-diesel-servicing');

      const state = useBrainWorkerOperationsStore.getState();
      expect(state.catalog.services).toHaveLength(1);

      const service = state.catalog.services[0];
      expect(service?.serviceId).toBe('gen-diesel-servicing');
      expect(service?.categoryId).toBe('generator');
      expect(service?.serviceName).toBe('Diesel Generator Servicing & Overhaul');
      expect(service?.hourlyRateNgn).toBe(7500);
      expect(service?.status).toBe('ACTIVE');
      expect(state.isDirty).toBe(true);
    });

    it('adds service with custom initial rate when provided', () => {
      useBrainWorkerOperationsStore.getState().addService('ac-gas-recharge', 9000);

      const state = useBrainWorkerOperationsStore.getState();
      expect(state.catalog.services).toHaveLength(1);
      expect(state.catalog.services[0]?.serviceId).toBe('ac-gas-recharge');
      expect(state.catalog.services[0]?.hourlyRateNgn).toBe(9000);
    });

    it('rejects adding unregistered or arbitrary service IDs not in canonical registry', () => {
      useBrainWorkerOperationsStore.getState().addService('non-existent-arbitrary-service');

      const state = useBrainWorkerOperationsStore.getState();
      expect(state.catalog.services).toHaveLength(0);
    });

    it('does not duplicate an already added service', () => {
      useBrainWorkerOperationsStore.getState().addService('gen-diesel-servicing');
      useBrainWorkerOperationsStore.getState().addService('gen-diesel-servicing');

      const state = useBrainWorkerOperationsStore.getState();
      expect(state.catalog.services).toHaveLength(1);
    });

    it('toggles service status between ACTIVE and PAUSED', () => {
      useBrainWorkerOperationsStore.getState().addService('gen-diesel-servicing');
      expect(useBrainWorkerOperationsStore.getState().catalog.services[0]?.status).toBe('ACTIVE');

      useBrainWorkerOperationsStore.getState().toggleServiceStatus('gen-diesel-servicing');
      expect(useBrainWorkerOperationsStore.getState().catalog.services[0]?.status).toBe('PAUSED');
      expect(useBrainWorkerOperationsStore.getState().isDirty).toBe(true);

      useBrainWorkerOperationsStore.getState().toggleServiceStatus('gen-diesel-servicing');
      expect(useBrainWorkerOperationsStore.getState().catalog.services[0]?.status).toBe('ACTIVE');
    });

    it('removes service from catalog draft and marks store dirty', () => {
      useBrainWorkerOperationsStore.getState().addService('gen-diesel-servicing');
      useBrainWorkerOperationsStore.getState().addService('ac-gas-recharge');
      expect(useBrainWorkerOperationsStore.getState().catalog.services).toHaveLength(2);

      useBrainWorkerOperationsStore.getState().removeService('gen-diesel-servicing');
      const state = useBrainWorkerOperationsStore.getState();
      expect(state.catalog.services).toHaveLength(1);
      expect(state.catalog.services[0]?.serviceId).toBe('ac-gas-recharge');
      expect(state.isDirty).toBe(true);
    });

    it('purges service rate validation errors when service is removed', () => {
      useBrainWorkerOperationsStore.getState().addService('gen-diesel-servicing');
      useBrainWorkerOperationsStore
        .getState()
        .updateServiceRate('gen-diesel-servicing', 1500);
      expect(
        useBrainWorkerOperationsStore.getState().validationErrors['service_rate_gen-diesel-servicing']
      ).toBeDefined();

      useBrainWorkerOperationsStore.getState().removeService('gen-diesel-servicing');
      expect(
        useBrainWorkerOperationsStore.getState().validationErrors['service_rate_gen-diesel-servicing']
      ).toBeUndefined();
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STO-003: Updates Hourly Rate with Live Validation Feedback
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('STO-003: Updates Hourly Rate with Live Validation Feedback', () => {
    it('updates rate with valid value and clears validation error', () => {
      useBrainWorkerOperationsStore.getState().addService('gen-diesel-servicing');
      useBrainWorkerOperationsStore
        .getState()
        .updateServiceRate('gen-diesel-servicing', 8500);

      const state = useBrainWorkerOperationsStore.getState();
      expect(state.catalog.services[0]?.hourlyRateNgn).toBe(8500);
      expect(state.validationErrors['service_rate_gen-diesel-servicing']).toBeUndefined();
      expect(state.isDirty).toBe(true);
    });

    it('records validation error when hourly rate is below minimum 2,000 Naira', () => {
      useBrainWorkerOperationsStore.getState().addService('gen-diesel-servicing');
      useBrainWorkerOperationsStore
        .getState()
        .updateServiceRate('gen-diesel-servicing', 1500);

      const state = useBrainWorkerOperationsStore.getState();
      expect(state.catalog.services[0]?.hourlyRateNgn).toBe(1500);
      expect(state.validationErrors['service_rate_gen-diesel-servicing']).toBeDefined();
      expect(state.validationErrors['service_rate_gen-diesel-servicing']).toContain('2,000');
    });

    it('records validation error when hourly rate exceeds maximum 50,000 Naira', () => {
      useBrainWorkerOperationsStore.getState().addService('gen-diesel-servicing');
      useBrainWorkerOperationsStore
        .getState()
        .updateServiceRate('gen-diesel-servicing', 60000);

      const state = useBrainWorkerOperationsStore.getState();
      expect(state.catalog.services[0]?.hourlyRateNgn).toBe(60000);
      expect(state.validationErrors['service_rate_gen-diesel-servicing']).toBeDefined();
      expect(state.validationErrors['service_rate_gen-diesel-servicing']).toContain('50,000');
    });

    it('records validation error when hourly rate is not a whole integer', () => {
      useBrainWorkerOperationsStore.getState().addService('gen-diesel-servicing');
      useBrainWorkerOperationsStore
        .getState()
        .updateServiceRate('gen-diesel-servicing', 3500.75);

      const state = useBrainWorkerOperationsStore.getState();
      expect(state.validationErrors['service_rate_gen-diesel-servicing']).toBeDefined();
      expect(state.validationErrors['service_rate_gen-diesel-servicing']).toContain('integer');
    });

    it('clears error when rate is corrected back into valid range', () => {
      useBrainWorkerOperationsStore.getState().addService('gen-diesel-servicing');
      useBrainWorkerOperationsStore
        .getState()
        .updateServiceRate('gen-diesel-servicing', 1500);
      expect(
        useBrainWorkerOperationsStore.getState().validationErrors['service_rate_gen-diesel-servicing']
      ).toBeDefined();

      useBrainWorkerOperationsStore
        .getState()
        .updateServiceRate('gen-diesel-servicing', 5000);
      expect(
        useBrainWorkerOperationsStore.getState().validationErrors['service_rate_gen-diesel-servicing']
      ).toBeUndefined();
    });

    it('validates diagnostic fee bounds between 2,000 and 20,000 Naira', () => {
      useBrainWorkerOperationsStore.getState().updateDiagnosticFee(1000);
      let state = useBrainWorkerOperationsStore.getState();
      expect(state.catalog.diagnosticFeeNgn).toBe(1000);
      expect(state.validationErrors.diagnosticFee).toBeDefined();

      useBrainWorkerOperationsStore.getState().updateDiagnosticFee(25000);
      state = useBrainWorkerOperationsStore.getState();
      expect(state.validationErrors.diagnosticFee).toBeDefined();

      useBrainWorkerOperationsStore.getState().updateDiagnosticFee(6000);
      state = useBrainWorkerOperationsStore.getState();
      expect(state.catalog.diagnosticFeeNgn).toBe(6000);
      expect(state.validationErrors.diagnosticFee).toBeUndefined();
      expect(state.isDirty).toBe(true);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STO-004: Updates Day Schedule Row and Detects Time Sequence Errors
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('STO-004: Updates Day Schedule Row and Detects Errors', () => {
    it('updates start and end hours for valid schedule window', () => {
      useBrainWorkerOperationsStore
        .getState()
        .updateDaySchedule('monday', { startHour: 9, endHour: 17 });

      const state = useBrainWorkerOperationsStore.getState();
      const monday = state.availability.weeklySchedule.monday;
      expect(monday.startHour).toBe(9);
      expect(monday.endHour).toBe(17);
      expect(state.validationErrors.schedule_monday).toBeUndefined();
      expect(state.isDirty).toBe(true);
    });

    it('merges partial day schedule updates and detects window under 2 hours', () => {
      useBrainWorkerOperationsStore
        .getState()
        .updateDaySchedule('monday', { startHour: 8, endHour: 18 });

      // Update only startHour to 17, resulting in 17..18 (1 hour window)
      useBrainWorkerOperationsStore
        .getState()
        .updateDaySchedule('monday', { startHour: 17 });

      let state = useBrainWorkerOperationsStore.getState();
      expect(state.availability.weeklySchedule.monday.startHour).toBe(17);
      expect(state.availability.weeklySchedule.monday.endHour).toBe(18);
      expect(state.validationErrors.schedule_monday).toBeDefined();
      expect(state.validationErrors.schedule_monday).toContain('at least 2 hours');

      // Expand endHour to 20, resulting in 17..20 (3 hour window)
      useBrainWorkerOperationsStore
        .getState()
        .updateDaySchedule('monday', { endHour: 20 });

      state = useBrainWorkerOperationsStore.getState();
      expect(state.validationErrors.schedule_monday).toBeUndefined();
    });

    it('detects sequence error when endHour is earlier than or equal to startHour', () => {
      useBrainWorkerOperationsStore
        .getState()
        .updateDaySchedule('monday', { startHour: 14, endHour: 10 });

      const state = useBrainWorkerOperationsStore.getState();
      expect(state.validationErrors.schedule_monday).toBeDefined();
      expect(state.validationErrors.schedule_monday).toContain('greater than start hour');
    });

    it('detects error when hours are outside 06:00 to 22:00 operating window', () => {
      useBrainWorkerOperationsStore
        .getState()
        .updateDaySchedule('monday', { startHour: 5, endHour: 12 });

      const state = useBrainWorkerOperationsStore.getState();
      expect(state.validationErrors.schedule_monday).toBeDefined();
    });

    it('clears active-window error when day is toggled inactive', () => {
      useBrainWorkerOperationsStore
        .getState()
        .updateDaySchedule('monday', { startHour: 14, endHour: 10 });
      expect(useBrainWorkerOperationsStore.getState().validationErrors.schedule_monday).toBeDefined();

      useBrainWorkerOperationsStore
        .getState()
        .updateDaySchedule('monday', { isActive: false });
      expect(useBrainWorkerOperationsStore.getState().validationErrors.schedule_monday).toBeUndefined();
    });

    it('preserves configured hours when day is toggled inactive', () => {
      useBrainWorkerOperationsStore
        .getState()
        .updateDaySchedule('monday', { startHour: 10, endHour: 18 });

      useBrainWorkerOperationsStore
        .getState()
        .updateDaySchedule('monday', { isActive: false });

      const monday = useBrainWorkerOperationsStore.getState().availability.weeklySchedule.monday;
      expect(monday.isActive).toBe(false);
      expect(monday.startHour).toBe(10);
      expect(monday.endHour).toBe(18);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STO-005: Copies Monday Hours to All Weekdays
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('STO-005: Copies Monday Hours to All Weekdays', () => {
    it('replicates Monday hours and active state across Tuesday to Friday', () => {
      useBrainWorkerOperationsStore.getState().updateDaySchedule('monday', {
        isActive: true,
        startHour: 7,
        endHour: 19,
      });

      useBrainWorkerOperationsStore.getState().copyMondayHoursToWeekdays();

      const schedule = useBrainWorkerOperationsStore.getState().availability.weeklySchedule;
      expect(schedule.tuesday).toEqual({ day: 'tuesday', isActive: true, startHour: 7, endHour: 19 });
      expect(schedule.wednesday).toEqual({ day: 'wednesday', isActive: true, startHour: 7, endHour: 19 });
      expect(schedule.thursday).toEqual({ day: 'thursday', isActive: true, startHour: 7, endHour: 19 });
      expect(schedule.friday).toEqual({ day: 'friday', isActive: true, startHour: 7, endHour: 19 });
      expect(useBrainWorkerOperationsStore.getState().isDirty).toBe(true);
    });

    it('preserves Saturday and Sunday schedule unchanged when copying Monday', () => {
      const initialSchedule =
        useBrainWorkerOperationsStore.getState().availability.weeklySchedule;
      const initialSaturday = { ...initialSchedule.saturday };
      const initialSunday = { ...initialSchedule.sunday };

      useBrainWorkerOperationsStore.getState().updateDaySchedule('monday', {
        isActive: true,
        startHour: 8,
        endHour: 20,
      });
      useBrainWorkerOperationsStore.getState().copyMondayHoursToWeekdays();

      const finalSchedule =
        useBrainWorkerOperationsStore.getState().availability.weeklySchedule;
      expect(finalSchedule.saturday).toEqual(initialSaturday);
      expect(finalSchedule.sunday).toEqual(initialSunday);
    });

    it('purges weekday schedule validation errors when valid Monday schedule is copied', () => {
      useBrainWorkerOperationsStore
        .getState()
        .updateDaySchedule('tuesday', { startHour: 14, endHour: 10 });
      expect(useBrainWorkerOperationsStore.getState().validationErrors.schedule_tuesday).toBeDefined();

      useBrainWorkerOperationsStore.getState().updateDaySchedule('monday', {
        isActive: true,
        startHour: 8,
        endHour: 18,
      });
      useBrainWorkerOperationsStore.getState().copyMondayHoursToWeekdays();

      expect(useBrainWorkerOperationsStore.getState().validationErrors.schedule_tuesday).toBeUndefined();
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STO-006: Computes Operational Readiness Completeness Flag & Invariants
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('STO-006: Computes Operational Readiness Completeness Flag & Invariants', () => {
    it('asserts that 1 active service and 1 active day alone returns false', () => {
      useBrainWorkerOperationsStore.getState().addService('gen-diesel-servicing');
      useBrainWorkerOperationsStore.getState().updateDaySchedule('monday', {
        isActive: true,
        startHour: 8,
        endHour: 18,
      });

      // City, neighbourhoods, and valid radius are not yet configured
      expect(useBrainWorkerOperationsStore.getState().isComplete).toBe(false);
    });

    it('evaluates isComplete to true when all 6 operational readiness criteria are met', () => {
      const store = useBrainWorkerOperationsStore.getState();

      // 1. Active service
      store.addService('gen-diesel-servicing');
      // 2. Diagnostic fee
      store.updateDiagnosticFee(5000);
      // 3. Weekly schedule active day
      store.updateDaySchedule('monday', { isActive: true, startHour: 8, endHour: 18 });
      // 4. Primary operational city
      store.setPrimaryCity('Lagos', 'Lagos');
      // 5. Coverage neighbourhoods
      store.setCoverageNeighbourhoods(['Ikeja', 'Yaba']);
      // 6. Valid travel radius
      store.setTravelRadius(15 as ValidTravelRadiusKm);

      expect(useBrainWorkerOperationsStore.getState().isComplete).toBe(true);
    });

    it('preserves isComplete true when toggling dispatch duty isAvailable off-duty (FR-008b)', () => {
      useBrainWorkerOperationsStore
        .getState()
        .initializeFromProfile(FIXTURE_OPERATIONAL_PROFILE_A);
      expect(useBrainWorkerOperationsStore.getState().isComplete).toBe(true);

      // Provider goes off-duty: isComplete remains true
      useBrainWorkerOperationsStore.getState().setIsAvailable(false);
      expect(useBrainWorkerOperationsStore.getState().availability.isAvailable).toBe(false);
      expect(useBrainWorkerOperationsStore.getState().isComplete).toBe(true);

      // Provider goes on-duty: isComplete remains true
      useBrainWorkerOperationsStore.getState().setIsAvailable(true);
      expect(useBrainWorkerOperationsStore.getState().availability.isAvailable).toBe(true);
      expect(useBrainWorkerOperationsStore.getState().isComplete).toBe(true);
    });

    it('updates emergency dispatch readiness independently', () => {
      useBrainWorkerOperationsStore.getState().setIsEmergencyAvailable(true);
      expect(useBrainWorkerOperationsStore.getState().availability.isEmergencyAvailable).toBe(true);
      expect(useBrainWorkerOperationsStore.getState().isDirty).toBe(true);

      useBrainWorkerOperationsStore.getState().setIsEmergencyAvailable(false);
      expect(useBrainWorkerOperationsStore.getState().availability.isEmergencyAvailable).toBe(false);
    });

    it('re-evaluates isComplete to false when all services are paused', () => {
      useBrainWorkerOperationsStore
        .getState()
        .initializeFromProfile(FIXTURE_OPERATIONAL_PROFILE_A);
      expect(useBrainWorkerOperationsStore.getState().isComplete).toBe(true);

      // In fixture A, only gen-diesel-servicing is ACTIVE. Pausing it should break readiness.
      useBrainWorkerOperationsStore
        .getState()
        .toggleServiceStatus('gen-diesel-servicing');
      expect(useBrainWorkerOperationsStore.getState().isComplete).toBe(false);

      // Reactivating restores readiness
      useBrainWorkerOperationsStore
        .getState()
        .toggleServiceStatus('gen-diesel-servicing');
      expect(useBrainWorkerOperationsStore.getState().isComplete).toBe(true);
    });

    it('re-evaluates isComplete to false when diagnostic fee is invalid', () => {
      useBrainWorkerOperationsStore
        .getState()
        .initializeFromProfile(FIXTURE_OPERATIONAL_PROFILE_A);
      expect(useBrainWorkerOperationsStore.getState().isComplete).toBe(true);

      useBrainWorkerOperationsStore.getState().updateDiagnosticFee(1000);
      expect(useBrainWorkerOperationsStore.getState().isComplete).toBe(false);

      useBrainWorkerOperationsStore.getState().updateDiagnosticFee(5000);
      expect(useBrainWorkerOperationsStore.getState().isComplete).toBe(true);
    });

    it('re-evaluates isComplete to false when all working days are disabled', () => {
      useBrainWorkerOperationsStore
        .getState()
        .initializeFromProfile(FIXTURE_OPERATIONAL_PROFILE_A);
      expect(useBrainWorkerOperationsStore.getState().isComplete).toBe(true);

      const days = [
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
        'sunday',
      ] as const;
      days.forEach((day) => {
        useBrainWorkerOperationsStore
          .getState()
          .updateDaySchedule(day, { isActive: false });
      });

      expect(useBrainWorkerOperationsStore.getState().isComplete).toBe(false);
    });

    it('re-evaluates isComplete to false when an active working day has an invalid window', () => {
      useBrainWorkerOperationsStore
        .getState()
        .initializeFromProfile(FIXTURE_OPERATIONAL_PROFILE_A);
      expect(useBrainWorkerOperationsStore.getState().isComplete).toBe(true);

      // Monday is valid, but setting tuesday to invalid active window invalidates schedule
      useBrainWorkerOperationsStore
        .getState()
        .updateDaySchedule('tuesday', { startHour: 15, endHour: 10 });
      expect(useBrainWorkerOperationsStore.getState().isComplete).toBe(false);
    });

    it('re-evaluates isComplete to false when primary city is cleared', () => {
      useBrainWorkerOperationsStore
        .getState()
        .initializeFromProfile(FIXTURE_OPERATIONAL_PROFILE_A);
      expect(useBrainWorkerOperationsStore.getState().isComplete).toBe(true);

      useBrainWorkerOperationsStore.getState().setPrimaryCity('', '');
      expect(useBrainWorkerOperationsStore.getState().isComplete).toBe(false);
    });

    it('re-evaluates isComplete to false when coverage neighbourhoods are cleared', () => {
      useBrainWorkerOperationsStore
        .getState()
        .initializeFromProfile(FIXTURE_OPERATIONAL_PROFILE_A);
      expect(useBrainWorkerOperationsStore.getState().isComplete).toBe(true);

      useBrainWorkerOperationsStore.getState().setCoverageNeighbourhoods([]);
      expect(useBrainWorkerOperationsStore.getState().isComplete).toBe(false);
    });

    it('updates primary city, neighbourhoods, and travel radius via isolated actions', () => {
      useBrainWorkerOperationsStore.getState().setPrimaryCity('Abuja', 'Abuja');
      let state = useBrainWorkerOperationsStore.getState();
      expect(state.coverage.primaryCityId).toBe('Abuja');
      expect(state.coverage.primaryCityName).toBe('Abuja');
      expect(state.isDirty).toBe(true);

      useBrainWorkerOperationsStore.getState().setCoverageNeighbourhoods(['Garki', 'Wuse']);
      state = useBrainWorkerOperationsStore.getState();
      expect(state.coverage.coverageNeighbourhoods).toEqual(['Garki', 'Wuse']);

      useBrainWorkerOperationsStore.getState().setTravelRadius(50 as ValidTravelRadiusKm);
      state = useBrainWorkerOperationsStore.getState();
      expect(state.coverage.travelRadiusKm).toBe(50);
    });
  });
});
