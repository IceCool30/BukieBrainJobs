// apps/web/components/notifications/NotificationBell.tsx
// Phase 6 GREEN: Navigation Header Bell & Unread Badge Implementation
// Authoritative References:
// - docs/specs/WEB-018-test-first-implementation-plan.md (Suite 8: INT-003, INT-004)
// - docs/specs/WEB-018-ux-design-specification.md (Section 4)
// - docs/specs/WEB-018-architecture-contract.md (Section 2 & 3)

'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Bell } from 'lucide-react';
import type { INotificationRepository } from '../../lib/notifications/types';
import { getNotificationRepository } from '../../lib/notifications/repository';
import { getMockAuthenticatedUser } from '../../lib/auth/storage';

export interface NotificationBellProps {
  customerId?: string | undefined;
  repository?: INotificationRepository | undefined;
  onClick?: (() => void) | undefined;
  className?: string | undefined;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  customerId,
  repository,
  onClick,
  className,
}) => {
  const router = useRouter();
  const repo = useMemo(() => repository ?? getNotificationRepository(), [repository]);

  const resolvedCustomerId = useMemo(() => {
    if (customerId && customerId.trim().length > 0) {
      return customerId.trim();
    }
    return getMockAuthenticatedUser()?.id ?? '';
  }, [customerId]);

  const [unreadCount, setUnreadCount] = useState<number>(0);

  const fetchCount = useCallback(async () => {
    if (!resolvedCustomerId) {
      setUnreadCount(0);
      return;
    }
    try {
      const count = await repo.getUnreadCount(resolvedCustomerId);
      setUnreadCount(count);
    } catch {
      setUnreadCount(0);
    }
  }, [resolvedCustomerId, repo]);

  useEffect(() => {
    void fetchCount();

    if (resolvedCustomerId && typeof repo.subscribe === 'function') {
      const unsubscribe = repo.subscribe(resolvedCustomerId, () => {
        void fetchCount();
      });
      return () => {
        unsubscribe();
      };
    }
  }, [fetchCount, resolvedCustomerId, repo]);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.push('/notifications');
    }
  };

  const badgeText = unreadCount > 99 ? '99+' : unreadCount.toString();

  return (
    <button
      type="button"
      data-testid="notification-bell"
      onClick={handleClick}
      aria-label={
        unreadCount > 0
          ? `${badgeText} unread notifications`
          : 'Notifications'
      }
      className={
        className ??
        'relative min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-700 hover:text-[#001A41] hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#001A41] focus-visible:ring-offset-2'
      }
    >
      <Bell className="w-5 h-5" aria-hidden="true" />

      {unreadCount > 0 && (
        <span
          data-testid="notification-bell-badge"
          aria-label={`${badgeText} unread notifications`}
          className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-[11px] font-bold leading-none text-white bg-[#296A4B] rounded-full ring-2 ring-white"
        >
          {badgeText}
        </span>
      )}
    </button>
  );
};
