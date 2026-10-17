// apps/web/components/notifications/NotificationCard.tsx
// Phase 5 GREEN: Notification Card Anatomy & Interaction (CRD-001 through CRD-009)
// Authoritative References:
// - docs/specs/WEB-018-test-first-implementation-plan.md (Suite 6: CRD-001 to CRD-009)
// - docs/specs/WEB-018-ux-design-specification.md (Section 6)
// - docs/specs/WEB-018-architecture-contract.md (Section 2 & 3)

import React from 'react';
import {
  Calendar,
  MessageSquare,
  Shield,
  Bell,
  ChevronRight,
} from 'lucide-react';
import type { CustomerNotification, NotificationCategory } from '../../lib/notifications/types';
import { resolveNotificationDeepLink } from '../../lib/notifications/deep-link';

export interface NotificationCardProps {
  notification: CustomerNotification;
  onNavigate?: ((targetUrl: string) => void) | undefined;
  onMarkAsRead?: ((notificationId: string) => Promise<void> | void) | undefined;
}

function formatRelativeTimestamp(isoDate: string, now: number = Date.now()): string {
  const timestamp = new Date(isoDate).getTime();
  if (Number.isNaN(timestamp)) return '';

  const diffMs = Math.max(0, now - timestamp);
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay === 1) return 'Yesterday';
  if (diffDay < 7) return `${diffDay}d ago`;

  const d = new Date(timestamp);
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function CategoryIcon({ category }: { category: NotificationCategory }) {
  switch (category) {
    case 'bookings':
      return (
        <div
          data-testid="category-icon-bookings"
          className="w-10 h-10 rounded-lg bg-[var(--amber-dim)] text-[var(--amber)] border border-[var(--amber)]/30 flex items-center justify-center shrink-0"
        >
          <Calendar className="w-5 h-5" aria-hidden="true" />
        </div>
      );
    case 'messages_payments':
      return (
        <div
          data-testid="category-icon-messages_payments"
          className="w-10 h-10 rounded-lg bg-[var(--brand-green-dim)] text-[var(--brand-green)] border border-[var(--brand-green-border)] flex items-center justify-center shrink-0"
        >
          <MessageSquare className="w-5 h-5" aria-hidden="true" />
        </div>
      );
    case 'account':
      return (
        <div
          data-testid="category-icon-account"
          className="w-10 h-10 rounded-lg bg-[var(--tag-bg)] text-[var(--text-main)] border border-[var(--lead)] flex items-center justify-center shrink-0"
        >
          <Shield className="w-5 h-5" aria-hidden="true" />
        </div>
      );
    default:
      return (
        <div
          data-testid="category-icon-default"
          className="w-10 h-10 rounded-lg bg-[var(--tag-bg)] text-[var(--amber)] border border-[var(--lead)] flex items-center justify-center shrink-0"
        >
          <Bell className="w-5 h-5" aria-hidden="true" />
        </div>
      );
  }
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onNavigate,
  onMarkAsRead,
}) => {
  const handleClick = () => {
    onMarkAsRead?.(notification.id);
    const targetUrl = resolveNotificationDeepLink(notification);
    onNavigate?.(targetUrl);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  const relativeTime = formatRelativeTimestamp(notification.createdAt);

  return (
    <div
      role="button"
      tabIndex={0}
      data-testid={`notification-card-${notification.id}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`group relative flex items-start gap-4 p-4 rounded-lg border transition-all cursor-pointer min-h-[44px] sm:min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)] focus-visible:ring-offset-2 ${
        notification.isRead
          ? 'bg-[var(--card-bg)] border-[var(--lead)] hover:border-[var(--rule)] hover:shadow-xs'
          : 'bg-[var(--tag-bg)] border-[var(--lead)] shadow-[inset_3px_0_0_var(--amber)] hover:border-[var(--amber)]/40'
      }`}
    >
      {/* Category Icon Container */}
      <CategoryIcon category={notification.category} />

      {/* Card Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3
            className={`text-sm tracking-tight truncate ${
              notification.isRead
                ? 'font-medium text-[var(--text-main)]'
                : 'font-bold text-[var(--text-main)]'
            }`}
          >
            {notification.title}
          </h3>

          <div className="flex items-center gap-2 shrink-0">
            {!notification.isRead && (
              <span
                data-testid="unread-indicator"
                className="w-2.5 h-2.5 rounded-full bg-[var(--amber)] shadow-xs"
                aria-label="Unread"
              />
            )}
            <time
              data-testid="notification-timestamp"
              dateTime={notification.createdAt}
              className="text-xs text-[var(--text-muted)] whitespace-nowrap"
            >
              {relativeTime}
            </time>
          </div>
        </div>

        <p className="mt-1 text-sm text-[var(--text-muted)] line-clamp-2 leading-relaxed">
          {notification.message}
        </p>

        {Boolean(notification.referenceCode) && (
          <div className="mt-2 flex items-center gap-2">
            <span
              data-testid="reference-code-badge"
              className="inline-flex items-center text-xs font-mono font-medium text-[var(--text-muted)] dark:text-[var(--text-main)] bg-[var(--tag-bg)] px-2 py-0.5 rounded-md border border-[var(--lead)]"
            >
              {notification.referenceCode}
            </span>
          </div>
        )}
      </div>

      {/* Trailing Chevron indicator */}
      <div className="hidden sm:flex items-center self-center text-[var(--text-muted)] group-hover:text-slate-500 dark:group-hover:text-[var(--amber)] transition-colors">
        <ChevronRight className="w-4 h-4" aria-hidden="true" />
      </div>
    </div>
  );
};
