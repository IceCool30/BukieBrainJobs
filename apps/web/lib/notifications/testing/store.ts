// apps/web/lib/notifications/testing/store.ts
// In-memory store shape for WEB-018 notification testing infrastructure.
// Strictly for test use. Must never be imported by production notification code.

import type { CustomerNotification, NotificationQueryResult } from '../types';

export interface NotificationInternalStore {
  notifications: Map<string, CustomerNotification>;
  dismissedIds: Set<string>;
  cachedSnapshots: Map<string, NotificationQueryResult>;
  subscribers: Map<string, Set<(notification: CustomerNotification) => void>>;
  isOffline: boolean;
}

export function createNotificationInternalStore(): NotificationInternalStore {
  return {
    notifications: new Map(),
    dismissedIds: new Set(),
    cachedSnapshots: new Map(),
    subscribers: new Map(),
    isOffline: false,
  };
}
