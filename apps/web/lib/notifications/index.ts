// apps/web/lib/notifications/index.ts
// Public production surface for WEB-018 Notification Center module.
// Only production types, validation, and repository are exported here.
// Test infrastructure lives strictly in ./testing/ and must never be imported from this file.

export * from './types';
export * from './deep-link';
export {
  NotificationRepository,
  createNotificationRepository,
  getNotificationRepository,
  createNotificationStore,
} from './repository';
export type { NotificationRepositoryStore } from './repository';
