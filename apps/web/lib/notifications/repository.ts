// apps/web/lib/notifications/repository.ts
// Phase 2 GREEN: Production Notification Repository Implementation
// Authoritative Reference: WEB-018 Architecture Contract v1.0
//
// Invariant Rules:
// 1. Strictly ZERO imports from test harness or fixtures (enforced by REP-015).
// 2. Implements INotificationRepository.
// 3. Fails closed with UnauthorizedError for missing or cross-customer access.
// 4. Transport-agnostic with in-memory persistence and offline snapshot caching.

import type {
  INotificationRepository,
  CustomerNotification,
  NotificationCategory,
  NotificationQueryOptions,
  NotificationQueryResult,
} from './types';
import { UnauthorizedError, NotFoundError } from './types';

export interface NotificationRepositoryStore {
  notifications: Map<string, CustomerNotification>;
  dismissedIds: Set<string>;
  cachedSnapshots: Map<string, NotificationQueryResult>;
  subscribers: Map<string, Set<(notification: CustomerNotification) => void>>;
  isOffline: boolean;
}

export function createNotificationStore(): NotificationRepositoryStore {
  return {
    notifications: new Map(),
    dismissedIds: new Set(),
    cachedSnapshots: new Map(),
    subscribers: new Map(),
    isOffline: false,
  };
}

export class NotificationRepository implements INotificationRepository {
  readonly store: NotificationRepositoryStore;

  constructor(store: NotificationRepositoryStore = createNotificationStore()) {
    this.store = store;
  }

  // ── Authorization & Validation ───────────────────────────────────

  private assertAuthenticated(customerId: string): void {
    if (!customerId || customerId.trim() === '') {
      throw new UnauthorizedError('Authenticated customer identity is required.');
    }
  }

  // ── Query Methods ────────────────────────────────────────────────

  async getNotifications(
    customerId: string,
    options?: NotificationQueryOptions
  ): Promise<NotificationQueryResult> {
    this.assertAuthenticated(customerId);

    const isOffline =
      this.store.isOffline ||
      (typeof navigator !== 'undefined' &&
        typeof navigator.onLine === 'boolean' &&
        !navigator.onLine);

    if (isOffline) {
      const cached = this.store.cachedSnapshots.get(customerId);
      if (cached) {
        return {
          ...cached,
          isCached: true,
        };
      }
    }

    const customerNotifications: CustomerNotification[] = [];
    for (const notif of this.store.notifications.values()) {
      if (notif.recipientId === customerId && !this.store.dismissedIds.has(notif.id)) {
        customerNotifications.push({ ...notif });
      }
    }

    const categoryCounts = {
      all: customerNotifications.length,
      bookings: 0,
      messages_payments: 0,
      account: 0,
    };

    let unreadCount = 0;
    for (const n of customerNotifications) {
      if (!n.isRead) {
        unreadCount += 1;
      }
      if (n.category === 'bookings') {
        categoryCounts.bookings += 1;
      } else if (n.category === 'messages_payments') {
        categoryCounts.messages_payments += 1;
      } else if (n.category === 'account') {
        categoryCounts.account += 1;
      }
    }

    let filtered = customerNotifications;
    if (options?.category) {
      filtered = filtered.filter((n) => n.category === options.category);
    }
    if (options?.unreadOnly) {
      filtered = filtered.filter((n) => !n.isRead);
    }

    filtered.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    let items = filtered;
    let hasMore = false;
    let nextCursor: string | null = null;
    if (options?.limit && options.limit > 0 && filtered.length > options.limit) {
      items = filtered.slice(0, options.limit);
      hasMore = true;
      const lastItem = items[items.length - 1];
      nextCursor = lastItem?.createdAt ?? null;
    }

    const result: NotificationQueryResult = {
      items,
      unreadCount,
      categoryCounts,
      hasMore,
      nextCursor,
      isCached: false,
    };

    if (!options?.category && !options?.unreadOnly) {
      this.store.cachedSnapshots.set(customerId, result);
    }

    return result;
  }

  async getUnreadCount(customerId: string): Promise<number> {
    this.assertAuthenticated(customerId);

    let count = 0;
    for (const notif of this.store.notifications.values()) {
      if (
        notif.recipientId === customerId &&
        !this.store.dismissedIds.has(notif.id) &&
        !notif.isRead
      ) {
        count += 1;
      }
    }
    return count;
  }

  // ── Mutation Methods ─────────────────────────────────────────────

  async markAsRead(
    customerId: string,
    notificationId: string
  ): Promise<CustomerNotification> {
    this.assertAuthenticated(customerId);

    const record = this.store.notifications.get(notificationId);
    if (!record) {
      throw new NotFoundError(`Notification '${notificationId}' not found.`);
    }

    if (record.recipientId !== customerId) {
      throw new UnauthorizedError(
        'You do not have permission to modify this notification.'
      );
    }

    const updated: CustomerNotification = {
      ...record,
      isRead: true,
      readAt: record.readAt ?? new Date().toISOString(),
    };

    this.store.notifications.set(notificationId, updated);
    this.store.cachedSnapshots.delete(customerId);

    return updated;
  }

  async markAllAsRead(
    customerId: string,
    category?: NotificationCategory
  ): Promise<{ count: number }> {
    this.assertAuthenticated(customerId);

    let count = 0;
    const now = new Date().toISOString();

    for (const notif of this.store.notifications.values()) {
      if (
        notif.recipientId === customerId &&
        !this.store.dismissedIds.has(notif.id) &&
        !notif.isRead
      ) {
        if (!category || notif.category === category) {
          const updated: CustomerNotification = {
            ...notif,
            isRead: true,
            readAt: notif.readAt ?? now,
          };
          this.store.notifications.set(notif.id, updated);
          count += 1;
        }
      }
    }

    this.store.cachedSnapshots.delete(customerId);
    return { count };
  }

  async dismiss(customerId: string, notificationId: string): Promise<void> {
    this.assertAuthenticated(customerId);

    const record = this.store.notifications.get(notificationId);
    if (!record) {
      throw new NotFoundError(`Notification '${notificationId}' not found.`);
    }

    if (record.recipientId !== customerId) {
      throw new UnauthorizedError(
        'You do not have permission to dismiss this notification.'
      );
    }

    this.store.dismissedIds.add(notificationId);
    this.store.cachedSnapshots.delete(customerId);
  }

  // ── Real-Time Subscription ───────────────────────────────────────

  subscribe(
    customerId: string,
    listener: (notification: CustomerNotification) => void
  ): () => void {
    this.assertAuthenticated(customerId);

    let customerSubscribers = this.store.subscribers.get(customerId);
    if (!customerSubscribers) {
      customerSubscribers = new Set();
      this.store.subscribers.set(customerId, customerSubscribers);
    }

    customerSubscribers.add(listener);

    return () => {
      customerSubscribers?.delete(listener);
    };
  }
}

let defaultRepository: INotificationRepository | null = null;

export function createNotificationRepository(
  store?: NotificationRepositoryStore
): INotificationRepository {
  return new NotificationRepository(store);
}

export function getNotificationRepository(): INotificationRepository {
  if (!defaultRepository) {
    defaultRepository = createNotificationRepository();
  }
  return defaultRepository;
}

export function resetDefaultNotificationRepository(): void {
  defaultRepository = null;
}
