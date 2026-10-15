// apps/web/lib/brainworker/dashboard/service.ts
// BrainWorker Operating Dashboard: Service Aggregation Stub
// Phase 2 RED: Fails closed with intentional RED error

import type {
  BrainWorkerDashboardFeed,
  BrainWorkerDashboardService,
  BrainWorkerDashboardServiceOptions,
} from './types';
import type { IBrainWorkerBookingsRepository } from '../bookings/types';
import type { IBrainWorkerLeadsRepository } from '../leads/types';
import type { IBrainWorkerOperationsRepository } from '../catalog/types';

export interface BrainWorkerDashboardServiceDependencies {
  bookingsRepo?: IBrainWorkerBookingsRepository | undefined;
  leadsRepo?: IBrainWorkerLeadsRepository | undefined;
  operationsRepo?: IBrainWorkerOperationsRepository | undefined;
}

export function createBrainWorkerDashboardService(
  _dependencies: BrainWorkerDashboardServiceDependencies = {}
): BrainWorkerDashboardService {
  return {
    async getDashboardFeed(
      _brainWorkerId: string,
      _options?: BrainWorkerDashboardServiceOptions
    ): Promise<BrainWorkerDashboardFeed> {
      throw new Error('RED: not implemented');
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
