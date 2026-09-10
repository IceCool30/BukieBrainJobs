/** @vitest-environment jsdom */
import { beforeEach, describe, expect, it } from 'vitest';
import {
  ROLE_DISPLAY_LABELS,
  getRoleDisplayLabel,
  normalizeUserRole,
  mapJobStatusToPresentation,
  UserRole,
  JobStatus,
  CreateJobRequest,
} from '@bukiebrainjobs/types';
import {
  deriveStateFromCity,
  isValidCoordinate,
  resolveJobLocation,
  formatCurrency,
  koboToNaira,
} from '@bukiebrainjobs/utils';
import {
  MockCustomerActivityRepository,
  getCustomerActivityRepository,
  resetCustomerActivityRepository,
} from './repository';
import { resolveJobsContext } from './index';
import { resolveDashboardContext } from '../dashboard';

describe('ARCH-002: Production-First Contract Alignment Suite', () => {
  beforeEach(() => {
    resetCustomerActivityRepository();
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 1 & 2: Canonical Role Vocabulary & Safe Display Mapping
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('Canonical UserRole & Display Mapping', () => {
    it('maps all 4 canonical production roles to authoritative display labels', () => {
      expect(getRoleDisplayLabel('CLIENT')).toBe('Customer');
      expect(getRoleDisplayLabel('TASKER')).toBe('BrainWorker');
      expect(getRoleDisplayLabel('ADMIN')).toBe('Administrator');
      expect(getRoleDisplayLabel('CORPORATE_CLIENT')).toBe('Corporate Partner');
    });

    it('strictly fails on unknown or corrupted roles without silent fallback', () => {
      expect(() => getRoleDisplayLabel('UNKNOWN_ROLE' as unknown as UserRole)).toThrow(
        /Unknown or corrupted user role encountered/
      );
      expect(() => getRoleDisplayLabel('' as unknown as UserRole)).toThrow(
        /Unknown or corrupted user role encountered/
      );
    });

    it('normalizes legacy role strings to canonical domain roles', () => {
      expect(normalizeUserRole('customer')).toBe('CLIENT');
      expect(normalizeUserRole('client')).toBe('CLIENT');
      expect(normalizeUserRole('brainworker')).toBe('TASKER');
      expect(normalizeUserRole('artisan')).toBe('TASKER');
      expect(normalizeUserRole('admin')).toBe('ADMIN');
      expect(normalizeUserRole('corporate')).toBe('CORPORATE_CLIENT');
    });

    it('fails normalizeUserRole on invalid input', () => {
      expect(() => normalizeUserRole('invalid_role')).toThrow(/Unknown or corrupted user role/);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 3 & 4: Production Lifecycle Adapter (Exhaustive JobStatus)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('Unidirectional Lifecycle Presentation Adapter', () => {
    const allProductionStatuses: JobStatus[] = [
      'OPEN',
      'PENDING_ACCEPTANCE',
      'CONFIRMED',
      'IN_PROGRESS',
      'PENDING_COMPLETION',
      'COMPLETED',
      'PAID',
      'CANCELLED',
      'EXPIRED',
      'DISPUTED',
      'RESOLVED',
    ];

    it('exhaustively maps all 11 production JobStatus values to valid presentation models', () => {
      for (const status of allProductionStatuses) {
        const presentation = mapJobStatusToPresentation(status);
        expect(presentation).toBeDefined();
        expect(presentation.status).toBeDefined();
        expect(presentation.label).toBeDefined();
        expect(presentation.badgeVariant).toBeDefined();
      }
    });

    it('maps OPEN status based on assignment context', () => {
      const unassigned = mapJobStatusToPresentation('OPEN');
      expect(unassigned.status).toBe('request_received');
      expect(unassigned.label).toBe('Request Received');

      const assigned = mapJobStatusToPresentation('OPEN', { hasAssignedTasker: true });
      expect(assigned.status).toBe('awaiting_progress');
      expect(assigned.label).toBe('Awaiting Acceptance');

      const directBooking = mapJobStatusToPresentation('OPEN', { isDirectBooking: true });
      expect(directBooking.status).toBe('awaiting_progress');
    });

    it('maps PENDING_COMPLETION to in_progress with clear review label', () => {
      const presentation = mapJobStatusToPresentation('PENDING_COMPLETION');
      expect(presentation.status).toBe('in_progress');
      expect(presentation.label).toBe('Pending Completion Review');
      expect(presentation.badgeVariant).toBe('warning');
    });

    it('maps DISPUTED to an open dispute state', () => {
      const presentation = mapJobStatusToPresentation('DISPUTED');
      expect(presentation.status).toBe('awaiting_progress');
      expect(presentation.label).toBe('Dispute Open');
      expect(presentation.badgeVariant).toBe('destructive');
    });

    it('maps RESOLVED neutrally to Dispute Resolved without unconfirmed settlement claims', () => {
      const presentation = mapJobStatusToPresentation('RESOLVED');
      expect(presentation.status).toBe('awaiting_progress');
      expect(presentation.label).toBe('Dispute Resolved');
      expect(presentation.badgeVariant).toBe('info');
      // Must not contain premature "Pending Settlement" assumption
      expect(presentation.label).not.toContain('Settlement');
    });

    it('maps PAID to completed with confirmation label', () => {
      const presentation = mapJobStatusToPresentation('PAID');
      expect(presentation.status).toBe('completed');
      expect(presentation.label).toBe('Completed & Paid');
    });

    it('throws on unknown JobStatus', () => {
      expect(() => mapJobStatusToPresentation('INVALID_STATUS' as unknown as JobStatus)).toThrow(
        /Unhandled JobStatus encountered/
      );
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 5 & 6: Customer Activity Repository Boundary & Continuity
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('Customer Activity Repository Abstraction', () => {
    it('creates a job via CreateJobRequest and retrieves it via repository read model', async () => {
      const repo = new MockCustomerActivityRepository([]);

      const newJobPayload: CreateJobRequest = {
        title: 'Emergency Generator Carburetor Overhaul',
        description: 'Lister generator stalling under load.',
        jobType: 'TASK',
        address: '14 Admiralty Way',
        city: 'Lekki',
        state: 'Lagos',
        latitude: 6.4474,
        longitude: 3.4723,
        scheduledStartAt: '2026-09-12T10:00:00Z',
        taskerRateKobo: 0,
        estimatedTotalKobo: 4500000, // ₦45,000 in kobo
        skillIds: ['generator-servicing'],
      };

      const created = await repo.createJob('usr-123', newJobPayload);
      expect(created).toBeDefined();
      expect(created.id).toMatch(/^REQ-\d{5}$/);
      expect(created.title).toBe(newJobPayload.title);
      expect(created.status).toBe('request_received');
      expect(created.budgetKobo).toBe(4500000);
      expect(created.budgetOrPrice).toBe('₦45,000');
      expect(created.jobStatus).toBe('OPEN');

      // Verify retrieval in activities list
      const activities = await repo.getActivities('usr-123');
      expect(activities.length).toBe(1);
      expect(activities[0]?.id).toBe(created.id);

      // Verify retrieval by ID and reference
      const byId = await repo.getActivityById('usr-123', created.id);
      expect(byId).toEqual(created);
    });

    it('mutates job status following canonical canTransition state machine', async () => {
      const repo = new MockCustomerActivityRepository([]);
      const created = await repo.createJob('usr-123', {
        title: 'Air Conditioner Coil Cleaning',
        description: 'Deep servicing for master bedroom.',
        address: '22 Isaac John St',
        city: 'Ikeja',
        state: 'Lagos',
        latitude: 6.5925,
        longitude: 3.3558,
        scheduledStartAt: '2026-09-15T09:00:00Z',
        taskerRateKobo: 0,
        estimatedTotalKobo: 2000000,
        skillIds: ['ac-repair'],
      });

      // Valid transition: OPEN -> CANCELLED
      const cancelled = await repo.mutateJobStatus('usr-123', created.id, {
        type: 'CANCEL',
        reason: 'Changed plans',
      });
      expect(cancelled.jobStatus).toBe('CANCELLED');
      expect(cancelled.status).toBe('cancelled');
      expect(cancelled.statusLabel).toBe('Cancelled');

      // Invalid transition: CANCELLED -> COMPLETED should fail via InvalidTransitionError
      await expect(
        repo.mutateJobStatus('usr-123', created.id, {
          type: 'CONFIRM_COMPLETION',
        })
      ).rejects.toThrow(/Invalid state transition: CANCELLED -> COMPLETED/);
    });

    it('preserves continuity across normal page simulation', async () => {
      const repo = getCustomerActivityRepository();
      const job = await repo.createJob('usr-client-1', {
        title: 'Plumbing Valve Replacement',
        description: 'Stopcock leak under sink.',
        address: '5 Glover Road',
        city: 'Ikoyi',
        state: 'Lagos',
        latitude: 6.45,
        longitude: 3.43,
        scheduledStartAt: '2026-09-11T12:00:00Z',
        taskerRateKobo: 0,
        estimatedTotalKobo: 1500000,
        skillIds: ['plumbing'],
      });

      const found = await repo.getActivityById('usr-client-1', job.id);
      expect(found).not.toBeNull();
      expect(found?.title).toBe('Plumbing Valve Replacement');
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 7: Monetary Precision (Kobo standard)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('Kobo Monetary Standard', () => {
    it('accurately converts and formats kobo integers without loss of precision', () => {
      const amountKobo = 3500000; // ₦35,000
      expect(koboToNaira(amountKobo)).toBe(35000);
      expect(formatCurrency(amountKobo, false)).toBe('₦35,000');
    });

    it('formats small and fractional amounts correctly', () => {
      expect(formatCurrency(5050, true)).toBe('₦50.50');
      expect(formatCurrency(100, false)).toBe('₦1');
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 8: Location Resolution & Anti-Fabrication Rule
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('Location Resolution & Anti-Fabrication Rule', () => {
    it('derives state from recognized Nigerian cities', () => {
      expect(deriveStateFromCity('Lekki')).toBe('Lagos');
      expect(deriveStateFromCity('Ikeja')).toBe('Lagos');
      expect(deriveStateFromCity('Garki')).toBe('Federal Capital Territory');
      expect(deriveStateFromCity('Port Harcourt')).toBe('Rivers');
      expect(deriveStateFromCity('UnknownTown')).toBeNull();
    });

    it('validates genuine coordinates and strictly rejects (0, 0) dummy values', () => {
      expect(isValidCoordinate(6.5244, 3.3792)).toBe(true); // Lagos coordinates
      expect(isValidCoordinate(0, 0)).toBe(false); // Gulf of Guinea / Null Island rejected
      expect(isValidCoordinate(NaN, 3.3792)).toBe(false);
      expect(isValidCoordinate(100, 3.3792)).toBe(false); // Out of latitude bounds
    });

    it('requires valid coordinates for a resolved production location', () => {
      const input = {
        streetAddress: '10 Marina Road',
        city: 'Lagos',
        landmark: 'Near Cathedral',
      };

      // Missing coordinates -> unresolved
      const unresolved = resolveJobLocation(input, null);
      expect(unresolved.resolved).toBe(false);
      expect(unresolved.error).toContain('Geographic coordinates unresolved');

      // Dummy (0, 0) coordinates -> strictly rejected
      const fakeCoords = resolveJobLocation(input, { latitude: 0, longitude: 0 });
      expect(fakeCoords.resolved).toBe(false);

      // Verified coordinates -> successfully resolved
      const verified = resolveJobLocation(input, { latitude: 6.4531, longitude: 3.3958 });
      expect(verified.resolved).toBe(true);
      expect(verified.location?.address).toBe('10 Marina Road');
      expect(verified.location?.state).toBe('Lagos');
      expect(verified.location?.latitude).toBe(6.4531);
      expect(verified.location?.landmark).toBe('Near Cathedral');
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 9 & 10: Dashboard and Jobs Context Integration
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('Dashboard and Jobs Surface Integration', () => {
    it('resolves jobs context with normalized canonical CLIENT role', () => {
      const context = resolveJobsContext(
        { get: () => null },
        {
          id: 'usr-1',
          name: 'Chief Customer',
          email: 'customer@test.ng',
          role: 'customer',
          provider: 'email',
          isBrainWorkerApproved: false,
        },
        null
      );

      expect(context.customer.role).toBe('CLIENT');
      expect(context.customer.name).toBe('Chief Customer');
    });

    it('resolves dashboard context with normalized canonical CLIENT role', () => {
      const context = resolveDashboardContext(
        {},
        {
          id: 'usr-1',
          name: 'Chief Customer',
          email: 'customer@test.ng',
          role: 'customer',
          provider: 'email',
          isBrainWorkerApproved: false,
        },
        null
      );

      expect(context.customer.role).toBe('CLIENT');
    });
  });
});
