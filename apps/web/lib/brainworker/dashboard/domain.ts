// apps/web/lib/brainworker/dashboard/domain.ts
// BrainWorker Operating Dashboard: Domain Aggregation Stub
// Phase 1 RED: Fails closed with intentional RED error

import type {
  BrainWorkerDashboardMetrics,
  UrgentLeadTickerItem,
} from './types';

export function computeDashboardMetrics(_params: {
  bookings: Array<{
    bookingId: string;
    scheduledStartAt: string;
    jobStatus: string;
    dispatchStatus?: string;
  }>;
  leads: Array<{
    id: string;
    invitationState?: string;
    urgency?: string;
  }>;
  now?: Date;
  clientRating?: number | null;
}): BrainWorkerDashboardMetrics {
  throw new Error('RED: not implemented');
}

export function projectUrgentLeadTicker(_params: {
  leads: Array<{
    id: string;
    title: string;
    categoryName?: string;
    locationArea: string;
    urgency: string;
    invitationState?: string;
    createdAt: string;
  }>;
  maxItems?: number;
}): UrgentLeadTickerItem[] {
  throw new Error('RED: not implemented');
}
