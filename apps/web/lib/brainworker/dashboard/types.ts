// apps/web/lib/brainworker/dashboard/types.ts
// BrainWorker Operating Dashboard: Types and Contracts
// Item 2.2 in master checklist

export interface BrainWorkerDashboardMetrics {
  todayBookingsCount: number;
  nextScheduledStartAt: string | null;
  activeJobsCount: number;
  activeJobId: string | null;
  pendingQuotesCount: number;
  completedJobsCount: number;
  clientRating: number | null;
}

export interface UrgentLeadTickerItem {
  id: string;
  title: string;
  tradeCategory: string;
  locationArea: string;
  urgency: 'EMERGENCY' | 'SAME_DAY' | 'SCHEDULED' | 'FLEXIBLE';
  postedAt: string;
}

export interface DashboardFeedAggregate {
  metrics: BrainWorkerDashboardMetrics;
  urgentLeads: UrgentLeadTickerItem[];
  lastEvaluatedAt: string;
}

export interface BrainWorkerDashboardFeed {
  metrics: BrainWorkerDashboardMetrics;
  urgentLeads: UrgentLeadTickerItem[];
  operationalStatus: {
    isComplete: boolean;
    isAvailable: boolean;
    isEmergencyAvailable: boolean;
    primaryTradeName: string | null;
  };
  lastRefreshedAt: string;
}

export interface BrainWorkerDashboardServiceOptions {
  now?: Date;
  urgentLeadsLimit?: number;
}

export interface BrainWorkerDashboardService {
  getDashboardFeed(
    brainWorkerId: string,
    options?: BrainWorkerDashboardServiceOptions
  ): Promise<BrainWorkerDashboardFeed>;
}
