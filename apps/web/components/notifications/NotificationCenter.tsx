// apps/web/components/notifications/NotificationCenter.tsx
// Phase 4 GREEN: Notification Center Feed & Category Tabs Implementation
// Authoritative Reference: WEB-018 UX Design Specification v1.0 & Architecture Contract v1.0
//
// Invariant Rules:
// 1. Strictly ZERO imports from test harness or fixtures.
// 2. Customer-scoped data loaded strictly via INotificationRepository.
// 3. Accessible WAI-ARIA tablist with ArrowLeft / ArrowRight keyboard navigation.
// 4. Polite screen-reader announcements on read status mutations.

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import type {
  INotificationRepository,
  CustomerNotification,
  NotificationCategory,
} from '../../lib/notifications/types';
import { getNotificationRepository } from '../../lib/notifications/repository';

export interface NotificationCenterProps {
  customerId: string;
  repository?: INotificationRepository;
  onNavigate?: (url: string) => void;
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
  onNavigate: _onNavigate,
}) => {
  const repo = useMemo(() => repository ?? getNotificationRepository(), [repository]);

  const [activeTab, setActiveTab] = useState<NotificationCategory>('all');
  const [allNotifications, setAllNotifications] = useState<CustomerNotification[]>([]);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isMutating, setIsMutating] = useState<boolean>(false);

  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const loadNotifications = useCallback(async () => {
    if (!customerId || customerId.trim() === '') return;
    try {
      const result = await repo.getNotifications(customerId);
      setAllNotifications(result.items);
    } catch {
      // Degraded/error states handled in Phase 5
    }
  }, [customerId, repo]);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

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
          <h1 className="text-2xl font-bold text-[#001A41]">Notifications</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Operational alerts and updates for your bookings
          </p>
        </div>

        <button
          type="button"
          onClick={() => void handleMarkAllAsRead()}
          disabled={unreadCounts.all === 0 || isMutating}
          className="text-sm font-medium text-[#296A4B] hover:text-[#001A41] disabled:text-slate-400 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#001A41] focus-visible:ring-offset-2 rounded px-2 py-1"
        >
          Mark all as read
        </button>
      </div>

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
        {displayedNotifications.map((item) => (
          <div
            key={item.id}
            data-testid={`notification-card-${item.id}`}
            className={`p-4 rounded-xl border transition-colors ${
              item.isRead ? 'bg-white border-slate-200' : 'bg-[#EFF4FF] border-blue-200'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3
                  className={`text-sm ${
                    item.isRead ? 'font-medium text-slate-900' : 'font-semibold text-[#001A41]'
                  }`}
                >
                  {item.title}
                </h3>
                <p className="mt-1 text-sm text-slate-600">{item.message}</p>
                {item.referenceCode && (
                  <span className="mt-2 inline-block text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {item.referenceCode}
                  </span>
                )}
              </div>
              {!item.isRead && (
                <span
                  className="w-2.5 h-2.5 rounded-full bg-[#296A4B] mt-1 shrink-0 ml-3"
                  aria-label="Unread"
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
