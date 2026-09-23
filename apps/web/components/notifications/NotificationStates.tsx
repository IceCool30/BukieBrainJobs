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
          className="p-4 rounded-xl border border-slate-200 bg-white min-h-[44px] sm:min-h-[48px] flex items-start gap-4 animate-pulse motion-reduce:animate-none"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-200 shrink-0" />
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 bg-slate-200 rounded w-1/3" />
            <div className="h-3 bg-slate-100 rounded w-3/4" />
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
      className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center gap-3 text-sm"
    >
      <WifiOff className="w-5 h-5 text-amber-700 shrink-0" aria-hidden="true" />
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
      className="p-6 rounded-xl border border-rose-200 bg-rose-50 text-center flex flex-col items-center justify-center my-4"
    >
      <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mb-3">
        <AlertCircle className="w-6 h-6" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-rose-900">Unable to load notifications</h3>
      <p className="text-sm text-rose-700 mt-1 max-w-md">
        There was a problem reaching the notification service. Please check your connection and try again.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-rose-700 text-white hover:bg-rose-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-700 focus-visible:ring-offset-2 min-h-[44px]"
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
  onBrowseServices?: () => void;
}

export const FirstRunEmptyState: React.FC<FirstRunEmptyStateProps> = ({ onBrowseServices }) => {
  return (
    <div
      data-testid="empty-state-first-run"
      className="p-10 rounded-2xl border border-dashed border-slate-200 bg-white text-center flex flex-col items-center justify-center my-6"
    >
      <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center mb-4">
        <Bell className="w-7 h-7" aria-hidden="true" />
      </div>
      <h2 className="text-lg font-bold text-[#001A41]">No notifications yet</h2>
      <p className="text-sm text-slate-500 mt-1 max-w-sm">
        When you book a service, real-time updates on artisan arrival, job milestones, messages, and payments will appear here.
      </p>
      <button
        type="button"
        onClick={onBrowseServices}
        className="mt-6 px-5 py-2.5 text-sm font-semibold rounded-xl bg-[#296A4B] text-white hover:bg-[#20543B] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#296A4B] focus-visible:ring-offset-2 min-h-[44px]"
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
      className="p-8 rounded-2xl border border-dashed border-slate-200 bg-white text-center flex flex-col items-center justify-center my-6"
    >
      <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mb-3">
        <Bell className="w-6 h-6" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-slate-800">
        No {categoryName} notifications
      </h3>
      <p className="text-sm text-slate-500 mt-1 max-w-xs">
        You do not have any notifications in this section.
      </p>
      <button
        type="button"
        onClick={onResetTab}
        className="mt-4 px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#001A41] focus-visible:ring-offset-2 min-h-[44px]"
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
      className="mb-6 p-4 rounded-xl bg-gradient-to-r from-emerald-50/80 to-teal-50/60 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-emerald-100 text-[#296A4B] flex items-center justify-center shrink-0 mt-0.5">
          <Bell className="w-5 h-5" aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-[#001A41]">
            Get instant alerts on your phone or computer
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            Turn on browser notifications so you know the moment an artisan arrives or sends a message.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
        <button
          type="button"
          onClick={onEnable}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#296A4B] text-white hover:bg-[#20543B] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#296A4B] focus-visible:ring-offset-2 min-h-[44px]"
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
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-[#296A4B] text-xs font-medium"
    >
      <CheckCircle2 className="w-3.5 h-3.5 text-[#296A4B]" aria-hidden="true" />
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
      className="mb-6 p-3.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700 flex items-start gap-2.5"
    >
      <Lock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" aria-hidden="true" />
      <div>
        Browser push notifications are currently blocked. To receive real-time alerts, click the lock icon in your browser address bar and set Notifications to Allow.
      </div>
    </div>
  );
};
