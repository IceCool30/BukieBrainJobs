// apps/web/lib/review/index.ts
// Public production surface for the WEB-016 Customer Reviews & Reputation module.
// Only production types, interfaces, and the repository factory are exported here.
// Test infrastructure lives in ./testing/ and must never be imported from this file.

export * from './types';
export * from './validation';
export { CustomerReviewRepository, getCustomerReviewRepository } from './repository';
export type { ReviewBookingRecord, ReviewInternalStore } from './repository';
