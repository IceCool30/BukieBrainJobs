// apps/web/lib/notifications/testing/harness.ts
// Test harness factory for WEB-018 notification repository contract testing.
// Strictly for test use. Must never be imported by production notification code.

import type { INotificationRepository } from '../types';
import {
  createNotificationRepository,
  resetDefaultNotificationRepository,
} from '../repository';
import { createNotificationInternalStore, type NotificationInternalStore } from './store';
import { NotificationTestController, type INotificationTestController } from './controller';

export interface NotificationTestHarness {
  repository: INotificationRepository;
  testController: INotificationTestController;
  store: NotificationInternalStore;
}

export function createNotificationTestHarness(
  customStore?: NotificationInternalStore
): NotificationTestHarness {
  const store = customStore ?? createNotificationInternalStore();
  const repository = createNotificationRepository(store);
  const testController = new NotificationTestController(store);
  return { repository, testController, store };
}

export function resetNotificationRepository(): void {
  resetDefaultNotificationRepository();
}
