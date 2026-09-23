// apps/web/lib/notifications/types.ts
// Authoritative Domain Models and Type Contracts for WEB-018
// Governed by: WEB-018 Architecture Contract v1.0 & Test-First Implementation Plan v1.0

export type NotificationCategory = 'all' | 'bookings' | 'messages_payments' | 'account';

export type NotificationType =
  | 'JOB_CONFIRMED'
  | 'JOB_STARTED'
  | 'JOB_COMPLETED'
  | 'JOB_CANCELLED'
  | 'MESSAGE_RECEIVED'
  | 'PAYMENT_CONFIRMED'
  | 'PAYMENT_RELEASED'
  | 'PAYMENT_REFUNDED'
  | 'REVIEW_REQUESTED'
  | 'SECURITY_ALERT'
  | 'VERIFICATION_COMPLETE'
  | 'SYSTEM';

export type PushPermissionState = 'default' | 'granted' | 'denied' | 'unsupported';

export const NOTIFICATION_CATEGORIES: readonly NotificationCategory[] = [
  'all',
  'bookings',
  'messages_payments',
  'account',
] as const;

export const NOTIFICATION_TYPES: readonly NotificationType[] = [
  'JOB_CONFIRMED',
  'JOB_STARTED',
  'JOB_COMPLETED',
  'JOB_CANCELLED',
  'MESSAGE_RECEIVED',
  'PAYMENT_CONFIRMED',
  'PAYMENT_RELEASED',
  'PAYMENT_REFUNDED',
  'REVIEW_REQUESTED',
  'SECURITY_ALERT',
  'VERIFICATION_COMPLETE',
  'SYSTEM',
] as const;

/**
 * Authoritative Customer Notification Record.
 * Represents an event persisted by the server or domain repository.
 * Invariant: Does not contain client-derived presentation properties.
 */
export interface CustomerNotification {
  id: string;
  recipientId: string;
  type: NotificationType;
  category: 'bookings' | 'messages_payments' | 'account';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;       // ISO 8601
  readAt?: string | null | undefined;  // ISO 8601
  targetUrl?: string | null | undefined;
  referenceCode?: string | null | undefined;
  metadata?: Record<string, unknown> | null | undefined;
}

/**
 * Client-Derived Presentation Notification.
 * Augments the authoritative record with transient UI state.
 */
export interface ClientNotificationPresentation extends CustomerNotification {
  resolvedDeepLink: string;
  isOptimisticRead?: boolean;
}

export interface NotificationQueryOptions {
  category?: NotificationCategory;
  unreadOnly?: boolean;
  limit?: number;
  cursor?: string;
}

export interface NotificationQueryResult {
  items: CustomerNotification[];
  unreadCount: number;
  categoryCounts: {
    all: number;
    bookings: number;
    messages_payments: number;
    account: number;
  };
  hasMore: boolean;
  nextCursor?: string | null;
  isCached?: boolean;
}

export function getNotificationCategory(type: NotificationType): NotificationCategory {
  switch (type) {
    case 'JOB_CONFIRMED':
    case 'JOB_STARTED':
    case 'JOB_COMPLETED':
    case 'JOB_CANCELLED':
      return 'bookings';

    case 'MESSAGE_RECEIVED':
    case 'PAYMENT_CONFIRMED':
    case 'PAYMENT_RELEASED':
    case 'PAYMENT_REFUNDED':
      return 'messages_payments';

    case 'REVIEW_REQUESTED':
    case 'SECURITY_ALERT':
    case 'VERIFICATION_COMPLETE':
    case 'SYSTEM':
      return 'account';

    default: {
      const _exhaustiveCheck: never = type;
      throw new Error(`Unhandled notification type: ${String(_exhaustiveCheck)}`);
    }
  }
}

export function isValidNotificationType(type: unknown): type is NotificationType {
  return typeof type === 'string' && NOTIFICATION_TYPES.includes(type as NotificationType);
}

export function isValidNotificationCategory(category: unknown): category is NotificationCategory {
  return typeof category === 'string' && NOTIFICATION_CATEGORIES.includes(category as NotificationCategory);
}

