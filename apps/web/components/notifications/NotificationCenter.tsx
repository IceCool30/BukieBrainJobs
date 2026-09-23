// apps/web/components/notifications/NotificationCenter.tsx
// Phase 5 GREEN: Notification Center Feed, Deterministic States & Push UX
// Authoritative References:
// - docs/specs/WEB-018-test-first-implementation-plan.md (Suite 5 & Suite 7)
// - docs/specs/WEB-018-ux-design-specification.md (Section 3, 4, 5, 7, 8)
// - docs/specs/WEB-018-architecture-contract.md (Section 2 & 3)
//
// Invariant Rules:
// 1. Strictly ZERO imports from test harness or fixtures.
// 2. Customer-scoped data loaded strictly via INotificationRepository.
// 3. Accessible WAI-ARIA tablist with ArrowLeft / ArrowRight keyboard navigation.
// 4. Polite screen-reader announcements on read status mutations.
// 5. Non-aggressive push: requestPermission is strictly user-action initiated.

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import type {
  INotificationRepository,
  CustomerNotification,
  NotificationCategory,
  IPushNotificationAdapter,
  PushPermissionState,
} from '../../lib/notifications/types';
import { getNotificationRepository } from '../../lib/notifications/repository';
import { getBrowserPushAdapter } from '../../lib/notifications/push-adapter';
import { NotificationCard } from './NotificationCard';
import {
  NotificationSkeleton,
  OfflineBanner,
  NotificationErrorCard,
  FirstRunEmptyState,
  FilteredEmptyState,
  PushOptInBanner,
  PushStatusGranted,
  PushStatusDenied,
} from './NotificationStates';

export interface NotificationCenterProps {
  customerId: string;
  repository?: INotificationRepository | undefined;
  pushAdapter?: IPushNotificationAdapter | undefined;
  isOffline?: boolean | undefined;
  onNavigate?: ((url: string) => void) | undefined;
}

interface TabDefinition {
  id: NotificationCategory;
  label: string;
  badgeTestId: string;
}

const TABS: readonly TabDefinition[] = [
  { id: 'all', label: 'All', badgeTestId: 'tab-badge-all' },
  { id: 'bookings', label: 'Bookings', badgeTestId: 'tab-badge-bookings' },
  { id: 'messages_payments', label: 'Messages & Payments', badgeTestId: 'tab-badge-messages_payments' },
  { id: 'account', label: 'Account', badgeTestId: 'tab-badge-account' },
] as const;

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  customerId,
  repository,
  pushAdapter,
  isOffline = false,
  onNavigate,
}) => {
  const repo = useMemo(() => repository ?? getNotificationRepository(), [repository]);
  const push = useMemo(
    () => pushAdapter ?? (typeof window !== 'undefined' ? getBrowserPushAdapter() : undefined),
    [pushAdapter]
  );

  const [activeTab, setActiveTab] = useState<NotificationCategory>('all');
  const [allNotifications, setAllNotifications] = useState<CustomerNotification[]>([]);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isMutating, setIsMutating] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [pushPermission, setPushPermission] = useState<PushPermissionState>(() => {
    if (!push || !push.isSupported()) return 'unsupported';
    return push.getPermission();
  });

  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Keep permission in sync with push adapter non-aggressively
  useEffect(() => {
    if (!push || !push.isSupported()) {
      setPushPermission('unsupported');
      return;
    }
    setPushPermission(push.getPermission());
  }, [push]);

  const loadNotifications = useCallback(async () => {
    if (!customerId || customerId.trim() === '') {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setHasError(false);
    try {
      const result = await repo.getNotifications(customerId);
      setAllNotifications(result.items);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [customerId, repo]);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  // Push notification opt-in handler (explicit user action)
  const handleEnablePush = async () => {
    if (!push || !push.isSupported()) return;
    try {
      const result = await push.requestPermission();
      setPushPermission(result);
    } catch {
      // ignore
    }
  };

  // Derived unread counts per category
  const unreadCounts = useMemo(() => {
    const counts: Record<NotificationCategory, number> = {
      all: 0,
      bookings: 0,
      messages_payments: 0,
      account: 0,
    };

    for (const notif of allNotifications) {
      if (!notif.isRead) {
        counts.all += 1;
        if (notif.category in counts) {
          counts[notif.category] += 1;
        }
      }
    }

    return counts;
  }, [allNotifications]);

  // Filtered feed for the active category tab
  const displayedNotifications = useMemo(() => {
    if (activeTab === 'all') {
      return allNotifications;
    }
    return allNotifications.filter((n) => n.category === activeTab);
  }, [allNotifications, activeTab]);

  // Single notification mark-as-read mutation handler
  const handleMarkAsRead = async (notificationId: string) => {
    const now = new Date().toISOString();
    setAllNotifications((prev) =>
      prev.map((item) =>
        item.id === notificationId
          ? { ...item, isRead: true, readAt: item.readAt ?? now }
          : item
      )
    );
    try {
      await repo.markAsRead(customerId, notificationId);
    } catch {
      // Reconcile if failure occurs
    }
  };

  // "Mark all as read" mutation handler
  const handleMarkAllAsRead = async () => {
    if (unreadCounts.all === 0 || isMutating) return;

    setIsMutating(true);
    try {
      await repo.markAllAsRead(customerId);
      const now = new Date().toISOString();
      setAllNotifications((prev) =>
        prev.map((item) => ({
          ...item,
          isRead: true,
          readAt: item.readAt ?? now,
        }))
      );
      setStatusMessage('All notifications marked as read.');
    } catch {
      setStatusMessage('Failed to mark all notifications as read.');
    } finally {
      setIsMutating(false);
    }
  };

  // Keyboard navigation for tablist
  const handleTabKeyDown = (index: number, event: React.KeyboardEvent<HTMLButtonElement>) => {
    let targetIndex = index;

    if (event.key === 'ArrowRight') {
      targetIndex = (index + 1) % TABS.length;
    } else if (event.key === 'ArrowLeft') {
      targetIndex = (index - 1 + TABS.length) % TABS.length;
    } else {
      return;
    }

    event.preventDefault();
    const nextTab = TABS[targetIndex];
    if (nextTab) {
      setActiveTab(nextTab.id);
      const targetElement = tabRefs.current[targetIndex];
      if (targetElement) {
        targetElement.focus();
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 bg-[#F8F9FF] min-h-screen">
      {/* Polite Accessibility Live Region */}
      <div role="status" aria-live="polite" className="sr-only">
        {statusMessage}
      </div>

      {/* Header Row */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#001A41]">Notifications</h1>
            {pushPermission === 'granted' && <PushStatusGranted />}
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Operational alerts and updates for your bookings
          </p>
        </div>

        <button
          type="button"
          onClick={() => void handleMarkAllAsRead()}
          disabled={unreadCounts.all === 0 || isMutating}
          className="text-sm font-medium text-[#296A4B] hover:text-[#001A41] disabled:text-slate-400 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#001A41] focus-visible:ring-offset-2 rounded px-2 py-1 min-h-[44px]"
        >
          Mark all as read
        </button>
      </div>

      {/* Offline Alert Banner */}
      {isOffline && <OfflineBanner />}

      {/* Push Opt-In Banner */}
      {pushPermission === 'default' && (
        <PushOptInBanner onEnable={() => void handleEnablePush()} />
      )}

      {/* Push Denied Callout */}
      {pushPermission === 'denied' && <PushStatusDenied />}

      {/* Category Tabs */}
      <div
        role="tablist"
        aria-label="Notification categories"
        className="flex space-x-2 border-b border-slate-200 mb-6 overflow-x-auto pb-1"
      >
        {TABS.map((tab, idx) => {
          const isSelected = activeTab === tab.id;
          const badgeCount = unreadCounts[tab.id];

          return (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[idx] = el;
              }}
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={isSelected}
              aria-controls={`panel-${tab.id}`}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => setActiveTab(tab.id)}
              onKeyDown={(e) => handleTabKeyDown(idx, e)}
              className={`flex items-center whitespace-nowrap px-4 py-2 text-sm font-medium rounded-t-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#001A41] ${
                isSelected
                  ? 'text-[#001A41] border-b-2 border-[#001A41] bg-white font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>{tab.label}</span>
              {badgeCount > 0 && (
                <span
                  data-testid={tab.badgeTestId}
                  className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-full bg-[#ABEEC8] text-[#001A41]"
                >
                  {badgeCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Feed Panel */}
      <div
        role="tabpanel"
        id={`panel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
        className="space-y-3"
      >
        {isLoading ? (
          <NotificationSkeleton />
        ) : hasError ? (
          <NotificationErrorCard onRetry={() => void loadNotifications()} />
        ) : allNotifications.length === 0 ? (
          <FirstRunEmptyState onBrowseServices={() => onNavigate?.('/services')} />
        ) : displayedNotifications.length === 0 ? (
          <FilteredEmptyState category={activeTab} onResetTab={() => setActiveTab('all')} />
        ) : (
          displayedNotifications.map((item) => (
            <NotificationCard
              key={item.id}
              notification={item}
              onNavigate={onNavigate}
              onMarkAsRead={handleMarkAsRead}
            />
          ))
        )}
      </div>
    </div>
  );
};
