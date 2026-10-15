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
