// apps/web/lib/notifications/repository.ts
// Phase 2 RED: Production Notification Repository Stub
// Authoritative Reference: WEB-018 Architecture Contract v1.0
//
// Invariant Rules:
// 1. Strictly ZERO imports from test harness or fixtures (enforced by REP-015).
// 2. Implements INotificationRepository.
// 3. Methods throw 'Not implemented' during Phase 2 RED.

import type {
  INotificationRepository,
  CustomerNotification,
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
  /** Internal store reserved for Phase 2 GREEN in-memory state. */
  readonly store: NotificationRepositoryStore;

  constructor(store: NotificationRepositoryStore = createNotificationStore()) {
    this.store = store;
  }

  async getNotifications(): Promise<NotificationQueryResult> {
    throw new Error('Not implemented');
  }

  async getUnreadCount(): Promise<number> {
    throw new Error('Not implemented');
  }

  async markAsRead(): Promise<CustomerNotification> {
    throw new Error('Not implemented');
  }

  async markAllAsRead(): Promise<{ count: number }> {
    throw new Error('Not implemented');
  }

  async dismiss(): Promise<void> {
    throw new Error('Not implemented');
  }

  subscribe(): () => void {
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
