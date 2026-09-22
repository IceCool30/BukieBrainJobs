// apps/web/lib/messaging/testing/fixtures.ts
// Deterministic test fixtures for WEB-017 repository and queue contract tests.
// Strictly isolated: never imported by production messaging code.
// Authoritative Reference: WEB-017 Architecture Contract v1.0

import type {
  ChatMessageRecord,
  ConversationSummary,
  LocationPayload,
  OfflineQueuedMessage,
} from '../types';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Canonical Participant IDs
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const FIXTURE_CUSTOMER_ID_A = 'usr-customer-msg-001';
export const FIXTURE_CUSTOMER_ID_B = 'usr-customer-msg-002';
export const FIXTURE_BRAINWORKER_ID_A = 'usr-brainworker-msg-001';
export const FIXTURE_BRAINWORKER_ID_B = 'usr-brainworker-msg-002';
export const FIXTURE_NON_PARTICIPANT_ID = 'usr-non-participant-999';
export const FIXTURE_UNAUTHENTICATED_ID = '';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Internal Booking Record Schema (Test Harness Only)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type MessagingBookingStatus =
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DISPUTED';

export interface MessagingBookingRecord {
  jobId: string;
  referenceCode: string;
  serviceTitle: string;
  customerId: string;
  customerName: string;
  brainWorkerId: string;
  brainWorkerName: string;
  brainWorkerAvatarUrl?: string | undefined;
  brainWorkerIsVerified: boolean;
  bookingStatus: MessagingBookingStatus;
  createdAt: string; // ISO 8601 — used as default lastMessageAt when no messages exist
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Booking Fixture Definitions (One Per Lifecycle State)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const FIXTURE_BOOKING_CONFIRMED: MessagingBookingRecord = {
  jobId: 'job-msg-confirmed-001',
  referenceCode: 'BBJ-LAG-2026-0101',
  serviceTitle: 'Generator Servicing & Repair',
  customerId: FIXTURE_CUSTOMER_ID_A,
  customerName: 'Adaeze Okafor',
  brainWorkerId: FIXTURE_BRAINWORKER_ID_A,
  brainWorkerName: 'Emeka Okafor',
  brainWorkerAvatarUrl: '/images/workers/emeka.jpg',
  brainWorkerIsVerified: true,
  bookingStatus: 'CONFIRMED',
  createdAt: '2026-09-20T08:00:00.000Z',
};

export const FIXTURE_BOOKING_IN_PROGRESS: MessagingBookingRecord = {
  jobId: 'job-msg-in-progress-002',
  referenceCode: 'BBJ-LAG-2026-0202',
  serviceTitle: 'Plumbing Drainage Pressure Test',
  customerId: FIXTURE_CUSTOMER_ID_A,
  customerName: 'Adaeze Okafor',
  brainWorkerId: FIXTURE_BRAINWORKER_ID_A,
  brainWorkerName: 'Emeka Okafor',
  brainWorkerAvatarUrl: '/images/workers/emeka.jpg',
  brainWorkerIsVerified: true,
  bookingStatus: 'IN_PROGRESS',
  createdAt: '2026-09-21T09:00:00.000Z',
};

export const FIXTURE_BOOKING_COMPLETED: MessagingBookingRecord = {
  jobId: 'job-msg-completed-003',
  referenceCode: 'BBJ-LAG-2026-0303',
  serviceTitle: 'AC Deep Chemical Cleaning',
  customerId: FIXTURE_CUSTOMER_ID_A,
  customerName: 'Adaeze Okafor',
  brainWorkerId: FIXTURE_BRAINWORKER_ID_A,
  brainWorkerName: 'Emeka Okafor',
  brainWorkerIsVerified: true,
  bookingStatus: 'COMPLETED',
  createdAt: '2026-09-15T10:00:00.000Z',
};

export const FIXTURE_BOOKING_CANCELLED: MessagingBookingRecord = {
  jobId: 'job-msg-cancelled-004',
  referenceCode: 'BBJ-LAG-2026-0404',
  serviceTitle: 'Electrical Wiring Inspection',
  customerId: FIXTURE_CUSTOMER_ID_A,
  customerName: 'Adaeze Okafor',
  brainWorkerId: FIXTURE_BRAINWORKER_ID_A,
  brainWorkerName: 'Emeka Okafor',
  brainWorkerIsVerified: false,
  bookingStatus: 'CANCELLED',
  createdAt: '2026-09-10T11:00:00.000Z',
};

export const FIXTURE_BOOKING_DISPUTED: MessagingBookingRecord = {
  jobId: 'job-msg-disputed-005',
  referenceCode: 'BBJ-LAG-2026-0505',
  serviceTitle: 'Roof Waterproofing',
  customerId: FIXTURE_CUSTOMER_ID_A,
  customerName: 'Adaeze Okafor',
  brainWorkerId: FIXTURE_BRAINWORKER_ID_A,
  brainWorkerName: 'Emeka Okafor',
  brainWorkerIsVerified: true,
  bookingStatus: 'DISPUTED',
  createdAt: '2026-09-18T12:00:00.000Z',
};

/** Booking belonging to a different customer (Customer B owns this one). */
export const FIXTURE_BOOKING_OTHER_CUSTOMER: MessagingBookingRecord = {
  jobId: 'job-msg-other-customer-006',
  referenceCode: 'BBJ-ABJ-2026-0606',
  serviceTitle: 'Solar Panel Installation',
  customerId: FIXTURE_CUSTOMER_ID_B,
  customerName: 'Babajide Adewale',
  brainWorkerId: FIXTURE_BRAINWORKER_ID_B,
  brainWorkerName: 'Chukwudi Obi',
  brainWorkerIsVerified: true,
  bookingStatus: 'CONFIRMED',
  createdAt: '2026-09-19T14:00:00.000Z',
};

/** Booking where BrainWorker B is the assigned worker (Customer A booked them). */
export const FIXTURE_BOOKING_BRAINWORKER_B: MessagingBookingRecord = {
  jobId: 'job-msg-bw-b-007',
  referenceCode: 'BBJ-PHC-2026-0707',
  serviceTitle: 'CCTV Security Installation',
  customerId: FIXTURE_CUSTOMER_ID_A,
  customerName: 'Adaeze Okafor',
  brainWorkerId: FIXTURE_BRAINWORKER_ID_B,
  brainWorkerName: 'Chukwudi Obi',
  brainWorkerIsVerified: true,
  bookingStatus: 'CONFIRMED',
  createdAt: '2026-09-17T13:00:00.000Z',
};

export const ALL_WRITABLE_BOOKINGS = [
  FIXTURE_BOOKING_CONFIRMED,
  FIXTURE_BOOKING_IN_PROGRESS,
  FIXTURE_BOOKING_DISPUTED,
] as const;

export const ALL_READONLY_BOOKINGS = [
  FIXTURE_BOOKING_COMPLETED,
  FIXTURE_BOOKING_CANCELLED,
] as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Message Fixtures
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function buildChatMessage(
  overrides: Partial<ChatMessageRecord> & { id: string; jobId: string }
): ChatMessageRecord {
  return {
    senderId: FIXTURE_CUSTOMER_ID_A,
    senderRole: 'customer',
    senderName: 'Adaeze Okafor',
    content: 'Good afternoon. Please confirm the arrival time.',
    contentType: 'text',
    isRead: false,
    createdAt: '2026-09-22T10:00:00.000Z',
    ...overrides,
  };
}

export const FIXTURE_MESSAGE_FROM_CUSTOMER: ChatMessageRecord = buildChatMessage({
  id: 'msg-fixture-001',
  jobId: FIXTURE_BOOKING_CONFIRMED.jobId,
  senderId: FIXTURE_CUSTOMER_ID_A,
  senderRole: 'customer',
  senderName: 'Adaeze Okafor',
  content: 'Good afternoon. Please confirm you are on the way.',
  createdAt: '2026-09-22T10:00:00.000Z',
  isRead: false,
});

export const FIXTURE_MESSAGE_FROM_BRAINWORKER: ChatMessageRecord = buildChatMessage({
  id: 'msg-fixture-002',
  jobId: FIXTURE_BOOKING_CONFIRMED.jobId,
  senderId: FIXTURE_BRAINWORKER_ID_A,
  senderRole: 'brainworker',
  senderName: 'Emeka Okafor',
  content: 'Hello Adaeze. I am 10 minutes away. Please ensure the generator is accessible.',
  createdAt: '2026-09-22T10:05:00.000Z',
  isRead: false,
});

export const FIXTURE_MESSAGE_IMAGE: ChatMessageRecord = buildChatMessage({
  id: 'msg-fixture-003',
  jobId: FIXTURE_BOOKING_CONFIRMED.jobId,
  senderId: FIXTURE_BRAINWORKER_ID_A,
  senderRole: 'brainworker',
  senderName: 'Emeka Okafor',
  content: '',
  contentType: 'image',
  mediaUrl: 'https://cdn.bukiebrainjobs.com/media/msg-fixture-003.jpg',
  createdAt: '2026-09-22T10:10:00.000Z',
  isRead: false,
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Pagination Fixture: Builds 35 deterministic messages for a conversation
// Used by REP-007, REP-008, REP-009, REP-010
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const FIXTURE_PAGINATION_JOB_ID = 'job-msg-pagination-100';

export const FIXTURE_PAGINATION_BOOKING: MessagingBookingRecord = {
  jobId: FIXTURE_PAGINATION_JOB_ID,
  referenceCode: 'BBJ-LAG-2026-0100',
  serviceTitle: 'Deep Cleaning Service',
  customerId: FIXTURE_CUSTOMER_ID_A,
  customerName: 'Adaeze Okafor',
  brainWorkerId: FIXTURE_BRAINWORKER_ID_A,
  brainWorkerName: 'Emeka Okafor',
  brainWorkerIsVerified: true,
  bookingStatus: 'CONFIRMED',
  createdAt: '2026-09-01T08:00:00.000Z',
};

export function buildPaginationMessages(count: number = 35): ChatMessageRecord[] {
  const messages: ChatMessageRecord[] = [];
  const baseDate = new Date('2026-09-22T06:00:00.000Z');

  for (let i = 0; i < count; i++) {
    const ts = new Date(baseDate.getTime() + i * 60_000).toISOString();
    messages.push(
      buildChatMessage({
        id: `msg-paginate-${String(i + 1).padStart(3, '0')}`,
        jobId: FIXTURE_PAGINATION_JOB_ID,
        senderId: i % 2 === 0 ? FIXTURE_CUSTOMER_ID_A : FIXTURE_BRAINWORKER_ID_A,
        senderRole: i % 2 === 0 ? 'customer' : 'brainworker',
        senderName: i % 2 === 0 ? 'Adaeze Okafor' : 'Emeka Okafor',
        content: `Message ${i + 1}: coordination detail ${i + 1}`,
        createdAt: ts,
        isRead: true,
      })
    );
  }
  return messages;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Location Payload Fixture
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const FIXTURE_LOCATION_PAYLOAD: LocationPayload = {
  latitude: 6.5244,
  longitude: 3.3792,
  addressText: '12 Admiralty Way, Lekki Phase 1, Lagos',
  landmark: 'Opposite Ebeano Supermarket',
  sharedAt: '2026-09-22T10:30:00.000Z',
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Media File Fixtures
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const FIXTURE_VALID_JPEG_FILE = {
  size: 1_048_576, // 1MB
  mimeType: 'image/jpeg' as const,
};

export const FIXTURE_VALID_PNG_FILE = {
  size: 2_097_152, // 2MB
  mimeType: 'image/png' as const,
};

export const FIXTURE_VALID_WEBP_FILE = {
  size: 512_000, // 500KB
  mimeType: 'image/webp' as const,
};

export const FIXTURE_OVERSIZED_FILE = {
  size: 5_242_881, // 5MB + 1 byte — exceeds limit
  mimeType: 'image/jpeg' as const,
};

export const FIXTURE_INVALID_MIME_FILE = {
  size: 102_400, // 100KB
  mimeType: 'application/pdf' as const,
};

/** Builds a minimal Blob-like test double for uploadAttachment calls. */
export function buildTestBlob(size: number): Blob {
  const content = new Uint8Array(Math.min(size, 64)).fill(0xff);
  return new Blob([content]);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Queue Fixture Data
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const FIXTURE_OFFLINE_MESSAGE_A: OfflineQueuedMessage = {
  tempId: 'temp-offline-msg-001',
  jobId: FIXTURE_BOOKING_CONFIRMED.jobId,
  userId: FIXTURE_CUSTOMER_ID_A,
  content: 'Are you still coming today?',
  contentType: 'text',
  queuedAt: '2026-09-22T09:00:00.000Z',
  retryCount: 0,
};

export const FIXTURE_OFFLINE_MESSAGE_B: OfflineQueuedMessage = {
  tempId: 'temp-offline-msg-002',
  jobId: FIXTURE_BOOKING_CONFIRMED.jobId,
  userId: FIXTURE_CUSTOMER_ID_A,
  content: 'Please confirm the materials are ready.',
  contentType: 'text',
  queuedAt: '2026-09-22T09:05:00.000Z',
  retryCount: 0,
};

export const FIXTURE_OFFLINE_MESSAGE_C: OfflineQueuedMessage = {
  tempId: 'temp-offline-msg-003',
  jobId: FIXTURE_BOOKING_CONFIRMED.jobId,
  userId: FIXTURE_CUSTOMER_ID_A,
  content: 'I will be home by 2pm.',
  contentType: 'text',
  queuedAt: '2026-09-22T09:10:00.000Z',
  retryCount: 0,
};

/** Message belonging to a different user (User B) — for session isolation tests. */
export const FIXTURE_OFFLINE_MESSAGE_USER_B: OfflineQueuedMessage = {
  tempId: 'temp-offline-msg-b-001',
  jobId: FIXTURE_BOOKING_OTHER_CUSTOMER.jobId,
  userId: FIXTURE_CUSTOMER_ID_B,
  content: 'Message from User B that must not reach User A.',
  contentType: 'text',
  queuedAt: '2026-09-22T09:00:00.000Z',
  retryCount: 0,
};
