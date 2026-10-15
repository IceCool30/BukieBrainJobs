// apps/web/lib/brainworker/dashboard/service.ts
// BrainWorker Operating Dashboard: Service Aggregation Layer
// Item 2.2 in master checklist (SVC-001 to SVC-008)

import type {
  BrainWorkerDashboardFeed,
  BrainWorkerDashboardService,
  BrainWorkerDashboardServiceOptions,
} from './types';
import type { IBrainWorkerBookingsRepository } from '../bookings/types';
import type { IBrainWorkerLeadsRepository } from '../leads/types';
import type { IBrainWorkerOperationsRepository } from '../catalog/types';
import { getBrainWorkerBookingsRepository } from '../bookings/repository';
import { getBrainWorkerLeadsRepository } from '../leads/repository';
import { getBrainWorkerOperationsRepository } from '../catalog/repository';
import { computeDashboardMetrics, projectUrgentLeadTicker } from './domain';

interface ExtendedAvailability {
  isAvailable?: boolean | undefined;
  isAcceptingNewJobs?: boolean | undefined;
  isEmergencyAvailable?: boolean | undefined;
  emergencyAvailability?: boolean | undefined;
}

interface ExtendedProfile {
  clientRating?: number | null | undefined;
}

interface ExtendedLead {
  categoryName?: string | undefined;
  categoryId?: string | undefined;
  locationArea?: string | undefined;
  neighbourhoodOrZone?: string | undefined;
  createdAt?: string | undefined;
}

export interface BrainWorkerDashboardServiceDependencies {
  bookingsRepo?: IBrainWorkerBookingsRepository | undefined;
  leadsRepo?: IBrainWorkerLeadsRepository | undefined;
  operationsRepo?: IBrainWorkerOperationsRepository | undefined;
}

export function createBrainWorkerDashboardService(
  dependencies: BrainWorkerDashboardServiceDependencies = {}
): BrainWorkerDashboardService {
  const getBookingsRepo = () =>
    dependencies.bookingsRepo ?? getBrainWorkerBookingsRepository();
  const getLeadsRepo = () =>
    dependencies.leadsRepo ?? getBrainWorkerLeadsRepository();
  const getOperationsRepo = () =>
    dependencies.operationsRepo ?? getBrainWorkerOperationsRepository();

  return {
    async getDashboardFeed(
      brainWorkerId: string,
      options?: BrainWorkerDashboardServiceOptions
    ): Promise<BrainWorkerDashboardFeed> {
      const bookingsRepo = getBookingsRepo();
      const leadsRepo = getLeadsRepo();
      const operationsRepo = getOperationsRepo();

      // SVC-001 & SVC-002: Tenant isolation and concurrent execution
      const [bookingsResult, leadsResult, operationsResult] =
        await Promise.allSettled([
          bookingsRepo.getBookings(brainWorkerId),
          leadsRepo.getLeads(brainWorkerId),
          operationsRepo.getOperationalProfile(brainWorkerId),
        ]);

      // SVC-007: Resilient fallback handling
      const bookings =
        bookingsResult.status === 'fulfilled' && bookingsResult.value?.items
          ? bookingsResult.value.items
          : [];

      const leads =
        leadsResult.status === 'fulfilled' && leadsResult.value?.items
          ? leadsResult.value.items
          : [];

      const profile =
        operationsResult.status === 'fulfilled' ? operationsResult.value : null;

      // SVC-003 & SVC-006: Operational profile mapping
      const firstService = (profile?.catalog?.services?.[0] as
        | { title?: string; serviceName?: string }
        | undefined);

      const primaryTradeName =
        firstService?.title || firstService?.serviceName || null;

      const availabilityExt = profile?.availability as unknown as
        | ExtendedAvailability
        | undefined;

      const isComplete = Boolean(profile?.isComplete);
      const isAvailable = Boolean(
        availabilityExt?.isAvailable ?? availabilityExt?.isAcceptingNewJobs
      );
      const isEmergencyAvailable = Boolean(
        availabilityExt?.isEmergencyAvailable ??
          availabilityExt?.emergencyAvailability
      );

      const profileExt = profile as unknown as ExtendedProfile | null;

      // SVC-004: Live metrics calculation
      const mappedLeadsForMetrics = leads.map((l) => ({
        id: l.id,
        invitationState:
          typeof l.invitationState === 'string' ? l.invitationState : undefined,
        urgency: typeof l.urgency === 'string' ? l.urgency : undefined,
      }));

      const metrics = computeDashboardMetrics({
        bookings,
        leads: mappedLeadsForMetrics,
        now: options?.now,
        clientRating: profileExt?.clientRating ?? null,
      });

      // SVC-005: Urgent lead ticker formatting
      const mappedLeadsForTicker = leads.map((l) => {
        const ext = l as unknown as ExtendedLead;
        return {
          id: l.id,
          title: l.title,
          categoryName: ext.categoryName || ext.categoryId,
          locationArea: ext.locationArea || ext.neighbourhoodOrZone || '',
          urgency: l.urgency,
          invitationState:
            typeof l.invitationState === 'string' ? l.invitationState : undefined,
          createdAt: ext.createdAt ?? l.scheduledStartAt ?? '',
        };
      });

      const urgentLeads = projectUrgentLeadTicker({
        leads: mappedLeadsForTicker,
        maxItems: options?.urgentLeadsLimit,
      });

      const lastRefreshedAt = (options?.now ?? new Date()).toISOString();

      // SVC-008: Strict financial boundary
      return {
        metrics,
        urgentLeads,
        operationalStatus: {
          isComplete,
          isAvailable,
          isEmergencyAvailable,
          primaryTradeName,
        },
        lastRefreshedAt,
      };
    },
  };
}

let defaultService: BrainWorkerDashboardService | null = null;

export function getBrainWorkerDashboardService(): BrainWorkerDashboardService {
  if (!defaultService) {
    defaultService = createBrainWorkerDashboardService();
  }
  return defaultService;
}

export function resetDefaultBrainWorkerDashboardService(): void {
  defaultService = null;
}
