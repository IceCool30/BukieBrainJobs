// apps/web/lib/notifications/repository.ts
// Phase 2 RED: Production Notification Repository Stub
// Authoritative Reference: WEB-018 Architecture Contract v1.0
//
// Invariant Rules:
// 1. Strictly ZERO imports from ./testing or /testing (enforced by REP-015).
// 2. Implements INotificationRepository.
// 3. Methods throw 'Not implemented' during Phase 2 RED.

import type {
  INotificationRepository,
  CustomerNotification,
  NotificationCategory,
  NotificationQueryOptions,
  NotificationQueryResult,
} from './types';

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
  constructor(private readonly store: NotificationRepositoryStore = createNotificationStore()) {}

  async getNotifications(
    _customerId: string,
    _options?: NotificationQueryOptions
  ): Promise<NotificationQueryResult> {
    throw new Error('Not implemented');
  }

  async getUnreadCount(_customerId: string): Promise<number> {
    throw new Error('Not implemented');
  }

  async markAsRead(
    _customerId: string,
    _notificationId: string
  ): Promise<CustomerNotification> {
    throw new Error('Not implemented');
  }

  async markAllAsRead(
    _customerId: string,
    _category?: NotificationCategory
  ): Promise<{ count: number }> {
    throw new Error('Not implemented');
  }

  async dismiss(_customerId: string, _notificationId: string): Promise<void> {
    throw new Error('Not implemented');
  }

  subscribe(
    _customerId: string,
    _listener: (notification: CustomerNotification) => void
  ): () => void {
    throw new Error('Not implemented');
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
