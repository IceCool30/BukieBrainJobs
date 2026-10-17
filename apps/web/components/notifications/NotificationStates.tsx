// apps/web/components/notifications/NotificationStates.tsx
// Phase 5 GREEN: Deterministic UI States & Push UX Components (STA-001 through STA-013)
// Authoritative References:
// - docs/specs/WEB-018-test-first-implementation-plan.md (Suite 7: STA-001 to STA-013)
// - docs/specs/WEB-018-ux-design-specification.md (Section 7 & 8)
// - docs/specs/WEB-018-architecture-contract.md (Section 2 & 3)

import React from 'react';
import {
  Bell,
  WifiOff,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import type { NotificationCategory } from '../../lib/notifications/types';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STA-005 & STA-013: Loading Skeleton
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const NotificationSkeleton: React.FC = () => {
  return (
    <div
      data-testid="notification-skeleton"
      className="space-y-3"
      aria-busy="true"
      aria-label="Loading notifications"
    >
      {[1, 2, 3, 4].map((idx) => (
        <div
          key={idx}
          data-testid="skeleton-card"
          className="p-4 rounded-lg border border-[var(--lead)] bg-[var(--card-bg)] min-h-[44px] sm:min-h-[48px] flex items-start gap-4 animate-pulse motion-reduce:animate-none"
        >
          <div className="w-10 h-10 rounded-lg bg-[var(--tag-bg)] shrink-0" />
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 bg-[var(--tag-bg)] rounded w-1/3" />
            <div className="h-3 bg-[var(--tag-bg)]/60 rounded w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STA-006: Offline Alert Banner
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const OfflineBanner: React.FC = () => {
  return (
    <div
      role="alert"
      data-testid="offline-banner"
      className="mb-6 p-4 rounded-lg bg-[var(--amber-dim)] border border-[var(--amber)]/30 text-[var(--amber)] flex items-center gap-3 text-sm font-medium"
    >
      <WifiOff className="w-5 h-5 text-[var(--amber)] shrink-0" aria-hidden="true" />
      <div>
        <p className="font-medium">
          You are currently offline. Showing cached notifications. Actions will sync when connection returns.
        </p>
      </div>
    </div>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STA-007: Error State & Retry Card
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface NotificationErrorCardProps {
  onRetry: () => void;
}

export const NotificationErrorCard: React.FC<NotificationErrorCardProps> = ({ onRetry }) => {
  return (
    <div
      data-testid="notification-error"
      role="alert"
      className="p-6 rounded-lg border border-[var(--danger-border)] bg-[var(--danger-dim)] text-center flex flex-col items-center justify-center my-4"
    >
      <div className="w-12 h-12 rounded-lg bg-[var(--danger-dim)] text-[var(--danger)] flex items-center justify-center mb-3">
        <AlertCircle className="w-6 h-6" aria-hidden="true" />
      </div>
      <h3 className="text-base font-bold font-display text-[var(--danger)]">Unable to load notifications</h3>
      <p className="text-sm text-red-500/80 mt-1 max-w-md">
        There was a problem reaching the notification service. Please check your connection and try again.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-[var(--danger)] text-white hover:opacity-90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 min-h-[44px] cursor-pointer"
      >
        <RefreshCw className="w-4 h-4" aria-hidden="true" />
        Retry
      </button>
    </div>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STA-001 & STA-002: First-Run Empty State
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface FirstRunEmptyStateProps {
  onBrowseServices?: (() => void) | undefined;
}

export const FirstRunEmptyState: React.FC<FirstRunEmptyStateProps> = ({ onBrowseServices }) => {
  return (
    <div
      data-testid="empty-state-first-run"
      className="p-10 rounded-lg border border-dashed border-[var(--lead)] bg-[var(--card-bg)] text-center flex flex-col items-center justify-center my-6"
    >
      <div className="w-14 h-14 rounded-lg bg-[var(--tag-bg)] text-[var(--amber)] border border-[var(--lead)] flex items-center justify-center mb-4">
        <Bell className="w-7 h-7" aria-hidden="true" />
      </div>
      <h2 className="text-lg font-bold font-display text-[var(--text-main)]">No notifications yet</h2>
      <p className="text-sm text-[var(--text-muted)] mt-1 max-w-sm">
        When you book a service, real-time updates on artisan arrival, job milestones, messages, and payments will appear here.
      </p>
      <button
        type="button"
        onClick={onBrowseServices}
        className="mt-6 px-5 py-2.5 text-sm font-semibold rounded-lg bg-[var(--amber)] hover:bg-[var(--amber-hover)] text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)] focus-visible:ring-offset-2 min-h-[44px] cursor-pointer"
      >
        Browse Services
      </button>
    </div>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STA-003 & STA-004: Filtered Category Empty State
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const CATEGORY_NAMES: Record<NotificationCategory, string> = {
  all: 'All',
  bookings: 'Bookings',
  messages_payments: 'Messages & Payments',
  account: 'Account',
};

export interface FilteredEmptyStateProps {
  category: NotificationCategory;
  onResetTab: () => void;
}

export const FilteredEmptyState: React.FC<FilteredEmptyStateProps> = ({ category, onResetTab }) => {
  const categoryName = CATEGORY_NAMES[category] ?? category;

  return (
    <div
      data-testid="empty-state-filtered"
      className="p-8 rounded-lg border border-dashed border-[var(--lead)] bg-[var(--card-bg)] text-center flex flex-col items-center justify-center my-6"
    >
      <div className="w-12 h-12 rounded-lg bg-[var(--tag-bg)] text-[var(--text-muted)] flex items-center justify-center mb-3">
        <Bell className="w-6 h-6" aria-hidden="true" />
      </div>
      <h3 className="text-base font-bold font-display text-[var(--text-main)]">
        No {categoryName} notifications
      </h3>
      <p className="text-sm text-[var(--text-muted)] mt-1 max-w-xs">
        You do not have any notifications in this section.
      </p>
      <button
        type="button"
        onClick={onResetTab}
        className="mt-4 px-4 py-2 text-sm font-semibold rounded-lg border border-[var(--lead)] text-[var(--text-main)] bg-[var(--card-bg)] hover:bg-[var(--card-hover)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)] focus-visible:ring-offset-2 min-h-[44px] cursor-pointer"
      >
        View All Notifications
      </button>
    </div>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STA-008 & STA-009: Push Opt-In Banner
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface PushOptInBannerProps {
  onEnable: () => void;
}

export const PushOptInBanner: React.FC<PushOptInBannerProps> = ({ onEnable }) => {
  return (
    <div
      data-testid="push-banner-opt-in"
      className="mb-6 p-4 rounded-lg bg-[var(--brand-green-dim)] border border-[var(--brand-green-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-[var(--brand-green-dim)] text-[var(--brand-green)] flex items-center justify-center shrink-0 mt-0.5">
          <Bell className="w-5 h-5" aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-sm font-bold font-display text-[var(--text-main)]">
            Get instant alerts on your phone or computer
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Turn on browser notifications so you know the moment an artisan arrives or sends a message.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
        <button
          type="button"
          onClick={onEnable}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-[var(--amber)] text-white hover:bg-[var(--amber-hover)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)] focus-visible:ring-offset-2 min-h-[44px] cursor-pointer"
        >
          Enable Notifications
        </button>
      </div>
    </div>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STA-010: Push Status Granted Pill
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const PushStatusGranted: React.FC = () => {
  return (
    <div
      data-testid="push-status-granted"
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[var(--brand-green-dim)] border border-[var(--brand-green-border)] text-[var(--brand-green)] text-xs font-semibold"
    >
      <CheckCircle2 className="w-3.5 h-3.5 text-[var(--brand-green)]" aria-hidden="true" />
      <span>Browser alerts active</span>
    </div>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STA-011: Push Status Denied Callout
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const PushStatusDenied: React.FC = () => {
  return (
    <div
      data-testid="push-status-denied"
      className="mb-6 p-3.5 rounded-lg bg-[var(--tag-bg)] border border-[var(--lead)] text-xs text-[var(--text-muted)] flex items-start gap-2.5"
    >
      <Lock className="w-4 h-4 text-[var(--text-muted)] shrink-0 mt-0.5" aria-hidden="true" />
      <div>
        Browser push notifications are currently blocked. To receive real-time alerts, click the lock icon in your browser address bar and set Notifications to Allow.
      </div>
    </div>
  );
};
