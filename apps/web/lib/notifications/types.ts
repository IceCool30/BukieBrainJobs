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
  nextCursor?: string | null | undefined;
  isCached?: boolean | undefined;
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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Repository Contract
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface INotificationRepository {
  /**
   * Fetches notifications for the authenticated customer.
   * Fails closed if customerId is missing or does not match caller session.
   */
  getNotifications(
    customerId: string,
    options?: NotificationQueryOptions
  ): Promise<NotificationQueryResult>;

  /**
   * Returns total unread notification count for the authenticated customer.
   */
  getUnreadCount(customerId: string): Promise<number>;

  /**
   * Marks a single notification as read.
   * Fails closed if notification does not exist or does not belong to customerId.
   */
  markAsRead(customerId: string, notificationId: string): Promise<CustomerNotification>;

  /**
   * Marks all unread notifications (optionally filtered by category) as read.
   * Returns the count of mutated records.
   */
  markAllAsRead(customerId: string, category?: NotificationCategory): Promise<{ count: number }>;

  /**
   * Soft-dismisses a notification for the active customer.
   */
  dismiss(customerId: string, notificationId: string): Promise<void>;

  /**
   * Subscribes to real-time notification push events for the authenticated customer.
   * Returns an unsubscribe cleanup function.
   */
  subscribe(
    customerId: string,
    listener: (notification: CustomerNotification) => void
  ): () => void;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Domain Error Hierarchy
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class NotificationError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'NotificationError';
    Object.setPrototypeOf(this, NotificationError.prototype);
  }
}

export class UnauthorizedError extends NotificationError {
  constructor(message = 'You do not have permission to access these notifications.') {
    super(message, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

export class NotFoundError extends NotificationError {
  constructor(message = 'Notification not found.') {
    super(message, 'NOT_FOUND');
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Push Capability Adapter Contract
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface IPushNotificationAdapter {
  isSupported(): boolean;
  getPermission(): PushPermissionState;
  requestPermission(): Promise<PushPermissionState>;
  sendTestAlert?(title: string, body: string): Promise<boolean>;
}



