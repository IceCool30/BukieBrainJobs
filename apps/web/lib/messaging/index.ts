// apps/web/lib/messaging/index.ts
// Public production surface for the WEB-017 In-App Messaging & Real-Time Chat module.
// Only production types, validation, and repository/queue factories are exported here.
// Test infrastructure lives in ./testing/ and must never be imported from this file.

export * from './types';
export * from './validation';
export { createMessagingRepository } from './repository';
export type { MessagingRepositoryStore } from './repository';
export { createOfflineQueue } from './queue';
export type {
  IOfflineQueue,
  IQueueStorage,
  DrainOptions,
  EnqueueTextInput,
  EnqueueLocationInput,
  CreateOfflineQueueOptions,
} from './queue';
