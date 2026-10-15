// apps/web/components/brainworker/dashboard/types.ts
// BrainWorker Operating Dashboard: Component Types & Props
// Item 2.2 in master checklist

import type {
  BrainWorkerDashboardFeed,
  BrainWorkerDashboardMetrics,
  UrgentLeadTickerItem,
} from '../../../lib/brainworker/dashboard/types';

export interface DashboardMetricsCardsProps {
  metrics: BrainWorkerDashboardMetrics;
  onSelectActiveJob?: ((bookingId: string) => void) | undefined;
  onNavigateToBookings?: (() => void) | undefined;
  onNavigateToLeads?: (() => void) | undefined;
}

export interface UrgentLeadsTickerProps {
  urgentLeads: UrgentLeadTickerItem[];
  onQuoteLead?: ((leadId: string) => void) | undefined;
  onViewAllLeads?: (() => void) | undefined;
}

export interface DashboardLiveViewProps {
  feed: BrainWorkerDashboardFeed | null;
  isLoading?: boolean | undefined;
  error?: string | null | undefined;
  onRefresh?: (() => void) | undefined;
  onToggleAvailability?: ((isAvailable: boolean) => void) | undefined;
  onNavigate?: ((path: string) => void) | undefined;
}
