/** @vitest-environment jsdom */
import { beforeEach, describe, expect, it } from 'vitest';
import {
  ROLE_DISPLAY_LABELS,
  getRoleDisplayLabel,
  normalizeUserRole,
  mapJobStatusToPresentation,
  UserRole,
  JobStatus,
  CustomerJobCreationInput,
} from '@bukiebrainjobs/types';
import {
  deriveStateFromCity,
  isValidCoordinate,
  resolveJobLocation,
  formatNairaFromKobo,
  parseNairaToKobo,
  generateJobReferenceCode,
  isValidJobReferenceCode,
  resolveCustomerJobToProductionRequest,
} from '@bukiebrainjobs/utils';
import { CustomerJobCreationSchema } from '@bukiebrainjobs/validation';
import {
  MockCustomerActivityRepository,
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
      expect(ROLE_DISPLAY_LABELS.CLIENT).toBe('Customer');
      expect(ROLE_DISPLAY_LABELS.TASKER).toBe('BrainWorker');
      expect(ROLE_DISPLAY_LABELS.ADMIN).toBe('Administrator');
      expect(ROLE_DISPLAY_LABELS.CORPORATE_CLIENT).toBe('Corporate Partner');

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
    });

    it('maps RESOLVED neutrally to Dispute Resolved without unconfirmed settlement assumptions', () => {
      const presentation = mapJobStatusToPresentation('RESOLVED');
      expect(presentation.status).toBe('awaiting_progress');
      expect(presentation.label).toBe('Dispute Resolved');
      expect(presentation.badgeVariant).toBe('info');
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Decision A: Customer Budget vs Worker Rate
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('Decision A: Customer Budget vs Worker Rate', () => {
    it('creates a customer job with optional budget without requiring taskerRateKobo', async () => {
      const repo = new MockCustomerActivityRepository([]);

      const customerInput: CustomerJobCreationInput = {
        title: 'Generator Maintenance & Spark Plug Check',
        description: 'Lister generator engine sputtering under high load at home.',
        address: '14 Admiralty Way',
        city: 'Lekki',
        landmark: 'Beside Filmhouse',
        scheduledStartAt: '2026-09-12T10:00:00Z',
        customerBudgetKobo: 3500000, // ₦35,000 customer budget
        selectedSkillIds: [],
      };

      const created = await repo.createJob('usr-client-1', customerInput);
      expect(created).toBeDefined();
      expect(created.budgetKobo).toBe(3500000);
      expect(created.budgetOrPrice).toBe('₦35,000');
      expect(created.location).toContain('Beside Filmhouse');
      expect(created.title).toBe(customerInput.title);
      expect(created.jobStatus).toBe('OPEN');
    });

    it('transforms customer input into production CreateJobRequest with marketplace rate', () => {
      const customerInput: CustomerJobCreationInput = {
        title: 'Emergency Generator Alternator Repair',
        description: 'Generator produces zero voltage after sudden surge.',
        address: '22 Marina Road',
        city: 'Lagos',
        scheduledStartAt: '2026-09-12T10:00:00Z',
        estimatedHours: 2,
        customerBudgetKobo: 5000000,
        selectedSkillIds: [],
      };

      const location = {
        address: customerInput.address,
        city: customerInput.city,
        state: 'Lagos',
        latitude: 6.4531,
        longitude: 3.3958,
      };

      const productionRequest = resolveCustomerJobToProductionRequest(customerInput, location, {
        taskerRateKobo: 2000000, // ₦20,000/hr marketplace rate
        resolvedSkillIds: ['gen-elec-skill-uuid'],
      });

      expect(productionRequest.title).toBe(customerInput.title);
      expect(productionRequest.taskerRateKobo).toBe(2000000);
      expect(productionRequest.estimatedTotalKobo).toBe(4000000); // 2 hrs * ₦20,000
      expect(productionRequest.skillIds).toEqual(['gen-elec-skill-uuid']);
      expect(productionRequest.referenceCode).toMatch(/^REQ-\d{5,}$/);
    });

    it('rejects invalid or zero marketplace worker rate during domain resolution', () => {
      const customerInput: CustomerJobCreationInput = {
        title: 'Valid Job Title Needs Service',
        description: 'Valid description with sufficient details.',
        address: '10 Glover Road',
        city: 'Ikoyi',
        scheduledStartAt: '2026-09-12T10:00:00Z',
      };

      const location = {
        address: customerInput.address,
        city: customerInput.city,
        state: 'Lagos',
        latitude: 6.45,
        longitude: 3.43,
      };

      expect(() =>
        resolveCustomerJobToProductionRequest(customerInput, location, {
          taskerRateKobo: 0, // Zero rate prohibited (no fake zero rates)
        })
      ).toThrow(/taskerRateKobo must be a positive integer kobo value/);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Decision B: "I'm Not Sure" Skills
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('Decision B: "I\'m Not Sure" Skills', () => {
    it('accepts empty selectedSkillIds without fabricating generic skill IDs', () => {
      const validJob = CustomerJobCreationSchema.safeParse({
        title: 'Mystery Noise in Electrical DB Box',
        description: 'Hearing buzzing sound and burning smell near the main breaker.',
        address: '5 Glover Road',
        city: 'Ikoyi',
        scheduledStartAt: new Date().toISOString(),
        selectedSkillIds: [], // Customer selected "I'm not sure"
      });

      expect(validJob.success).toBe(true);
      if (validJob.success) {
        expect(validJob.data.selectedSkillIds).toEqual([]);
      }
    });

    it('preserves customer selected skills when explicitly chosen', () => {
      const skillUuid = '550e8400-e29b-41d4-a716-446655440000';
      const validJob = CustomerJobCreationSchema.safeParse({
        title: 'AC Gas Refill and Coil Cleaning',
        description: 'Complete servicing for two split AC units in sitting room.',
        address: '18 Isaac John St',
        city: 'Ikeja',
        scheduledStartAt: new Date().toISOString(),
        selectedSkillIds: [skillUuid],
      });

      expect(validJob.success).toBe(true);
      if (validJob.success) {
        expect(validJob.data.selectedSkillIds).toEqual([skillUuid]);
      }
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Decision C: Durable Job Reference Code
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('Decision C: Durable Job Reference Code', () => {
    it('generates durable, unique reference codes matching REQ-XXXXX pattern', () => {
      const code1 = generateJobReferenceCode();
      const code2 = generateJobReferenceCode();

      expect(isValidJobReferenceCode(code1)).toBe(true);
      expect(isValidJobReferenceCode(code2)).toBe(true);
      expect(code1).toMatch(/^REQ-\d{5,}$/);
      expect(code2).toMatch(/^REQ-\d{5,}$/);
    });

    it('assigns technical UUID as primary key while preserving human-readable referenceCode', async () => {
      const repo = new MockCustomerActivityRepository([]);

      const customerInput: CustomerJobCreationInput = {
        title: 'Water Pipe Leak Under Kitchen Counter',
        description: 'PVC pipe cracked and dripping continuously into cabinet.',
        address: '10 Queens Drive',
        city: 'Ikoyi',
        scheduledStartAt: '2026-09-12T10:00:00Z',
        customerBudgetKobo: 2000000,
        selectedSkillIds: [],
      };

      const created = await repo.createJob('usr-1', customerInput);

      // Technical UUID primary key format
      expect(created.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );

      // Durable reference code format
      expect(created.referenceCode).toBeDefined();
      expect(created.referenceCode).toMatch(/^REQ-\d{5,}$/);
      expect(created.id).not.toBe(created.referenceCode);

      // Deep link action URL targets referenceCode for clean human-facing URLs
      expect(created.nextAction?.url).toBe(`/jobs?id=${created.referenceCode}`);

      // Retrieval by technical UUID
      const byUuid = await repo.getActivityById('usr-1', created.id);
      expect(byUuid).toEqual(created);

      // Retrieval by durable reference code
      const byRef = await repo.getActivityById('usr-1', created.referenceCode!);
      expect(byRef).toEqual(created);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Money: Integer Kobo Representation & Presentation Formatting
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('Money: Integer Kobo Representation', () => {
    it('formats and parses kobo amounts without floating point errors', () => {
      expect(formatNairaFromKobo(3500000)).toBe('₦35,000');
      expect(formatNairaFromKobo(3500050, true)).toBe('₦35,000.50');
      expect(formatNairaFromKobo(100)).toBe('₦1');

      expect(parseNairaToKobo('₦35,000')).toBe(3500000);
      expect(parseNairaToKobo('35000')).toBe(3500000);
      expect(parseNairaToKobo('₦35,000.50')).toBe(3500050);
      expect(parseNairaToKobo(35000)).toBe(3500000);
    });

    it('handles zero, empty, or undefined money inputs safely', () => {
      expect(formatNairaFromKobo(0)).toBe('₦0');
      expect(parseNairaToKobo('')).toBe(0);
      expect(parseNairaToKobo(null)).toBe(0);
      expect(parseNairaToKobo(undefined)).toBe(0);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Staged Location Resolution & Anti-Fabrication Rule
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
      expect(isValidCoordinate(6.5244, 3.3792)).toBe(true);
      expect(isValidCoordinate(0, 0)).toBe(false);
      expect(isValidCoordinate(NaN, 3.3792)).toBe(false);
      expect(isValidCoordinate(100, 3.3792)).toBe(false);
    });

    it('requires valid coordinates for a resolved production location', () => {
      const input = {
        streetAddress: '10 Marina Road',
        city: 'Lagos',
        landmark: 'Near Cathedral',
      };

      const unresolved = resolveJobLocation(input, null);
      expect(unresolved.resolved).toBe(false);
      expect(unresolved.error).toContain('Geographic coordinates unresolved');

      const fakeCoords = resolveJobLocation(input, { latitude: 0, longitude: 0 });
      expect(fakeCoords.resolved).toBe(false);

      const verified = resolveJobLocation(input, { latitude: 6.4531, longitude: 3.3958 });
      expect(verified.resolved).toBe(true);
      expect(verified.location?.address).toBe('10 Marina Road');
      expect(verified.location?.state).toBe('Lagos');
      expect(verified.location?.latitude).toBe(6.4531);
      expect(verified.location?.landmark).toBe('Near Cathedral');
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Repository Lifecycle Mutations & State Machine
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('Repository Lifecycle Mutations & State Machine', () => {
    it('mutates job status following canonical canTransition state machine', async () => {
      const repo = new MockCustomerActivityRepository([]);
      const created = await repo.createJob('usr-123', {
        title: 'Air Conditioner Coil Cleaning',
        description: 'Deep servicing for master bedroom.',
        address: '22 Isaac John St',
        city: 'Ikeja',
        scheduledStartAt: '2026-09-15T09:00:00Z',
        customerBudgetKobo: 2000000,
        selectedSkillIds: [],
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
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Dashboard and Jobs Surface Integration
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
