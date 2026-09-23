// apps/web/lib/notifications/testing/controller.ts
// Deterministic test controller for WEB-018 notification repository testing.
// Provides seeding, simulated push domain event dispatching, and offline toggling.
// Strictly for test use. Must never be imported by production notification code.

import type { CustomerNotification } from '../types';
import type { NotificationInternalStore } from './store';

export interface INotificationTestController {
  seed(notifications: CustomerNotification[]): void;
  seedOne(notification: CustomerNotification): void;
  dispatchDomainEvent(notification: CustomerNotification): void;
  setOffline(offline: boolean): void;
  isOffline(): boolean;
  clear(): void;
  getStore(): NotificationInternalStore;
}

export class NotificationTestController implements INotificationTestController {
  constructor(private readonly store: NotificationInternalStore) {}

  seed(notifications: CustomerNotification[]): void {
    for (const notif of notifications) {
      this.seedOne(notif);
    }
  }

  seedOne(notification: CustomerNotification): void {
    this.store.notifications.set(notification.id, { ...notification });
  }

  dispatchDomainEvent(notification: CustomerNotification): void {
    // 1. Persist notification into store
    this.store.notifications.set(notification.id, { ...notification });

    // 2. Notify subscribers registered for this recipient
    const recipientListeners = this.store.subscribers.get(notification.recipientId);
    if (recipientListeners) {
      for (const listener of recipientListeners) {
        try {
          listener({ ...notification });
        } catch {
          // Swallow test subscriber exceptions to prevent unhandled rejections
        }
      }
    }
  }

  setOffline(offline: boolean): void {
    this.store.isOffline = offline;
  }

  isOffline(): boolean {
    return this.store.isOffline;
  }

  clear(): void {
    this.store.notifications.clear();
    this.store.dismissedIds.clear();
    this.store.cachedSnapshots.clear();
    this.store.subscribers.clear();
    this.store.isOffline = false;
  }

  getStore(): NotificationInternalStore {
    return this.store;
  }
}
