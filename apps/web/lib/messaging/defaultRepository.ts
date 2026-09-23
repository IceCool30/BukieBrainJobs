// apps/web/lib/messaging/defaultRepository.ts
// Production default messaging repository and synchronous hydration store
// Fail-closed, transport-agnostic, zero imports from testing/

import type {
  IMessagingRepository,
  ChatMessageRecord,
  ConversationSummary,
  MessagingBookingStatus,
} from './types';
import { createMessagingRepository, MessagingRepositoryStore } from './repository';

interface ParticipantRecord {
  id: string;
  name: string;
  avatarUrl?: string | undefined;
  isVerified: boolean;
}

interface ConversationRecord {
  jobId: string;
  referenceCode: string;
  serviceTitle: string;
  bookingStatus: MessagingBookingStatus;
  createdAt: string;
  customer: ParticipantRecord;
  brainWorker: ParticipantRecord;
  messageById: Map<string, ChatMessageRecord>;
  messageOrder: string[];
  readTimestamps: Map<string, string>;
}

function createDefaultStore(): MessagingRepositoryStore {
  const conversations = new Map<string, ConversationRecord>();

  const jobAct001: ConversationRecord = {
    jobId: 'job-act-001',
    referenceCode: 'BBJ-LAG-2026-0891',
    serviceTitle: 'Generator Servicing & Repair',
    bookingStatus: 'IN_PROGRESS',
    createdAt: '2026-09-20T08:00:00.000Z',
    customer: {
      id: 'usr-customer-001',
      name: 'Adaeze Okafor',
      isVerified: true,
    },
    brainWorker: {
      id: 'usr-worker-001',
      name: 'Engr. Emeka Nwosu',
      avatarUrl: '/images/workers/emeka.jpg',
      isVerified: true,
    },
    messageById: new Map([
      [
        'msg-001',
        {
          id: 'msg-001',
          jobId: 'job-act-001',
          senderId: 'usr-worker-001',
          senderRole: 'brainworker',
          senderName: 'Engr. Emeka Nwosu',
          senderAvatar: '/images/workers/emeka.jpg',
          content: 'I have arrived at the estate gate.',
          contentType: 'text',
          isRead: true,
          readAt: '2026-09-22T12:32:00.000Z',
          createdAt: '2026-09-22T12:30:00.000Z',
        },
      ],
      [
        'msg-002',
        {
          id: 'msg-002',
          jobId: 'job-act-001',
          senderId: 'usr-customer-001',
          senderRole: 'customer',
          senderName: 'Adaeze Okafor',
          content: 'Thank you, security has been informed.',
          contentType: 'text',
          isRead: true,
          readAt: '2026-09-22T12:33:00.000Z',
          createdAt: '2026-09-22T12:31:00.000Z',
        },
      ],
    ]),
    messageOrder: ['msg-001', 'msg-002'],
    readTimestamps: new Map([['usr-customer-001', '2026-09-22T12:33:00.000Z']]),
  };

  conversations.set(jobAct001.jobId, jobAct001);

  return {
    conversations,
    sentTempIds: new Map(),
    msgCounter: 2,
  };
}

const defaultStore = createDefaultStore();
export const defaultMessagingRepository: IMessagingRepository = createMessagingRepository(defaultStore);

export function getSynchronousConversations(callerId: string): ConversationSummary[] {
  if (!callerId) return [];
  const results: ConversationSummary[] = [];
  for (const record of defaultStore.conversations.values()) {
    if (callerId !== record.customer.id && callerId !== record.brainWorker.id) continue;
    const isCustomer = callerId === record.customer.id;
    const participant = isCustomer ? record.brainWorker : record.customer;
    const latestMsgId = record.messageOrder[record.messageOrder.length - 1];
    const latestMsg = latestMsgId ? record.messageById.get(latestMsgId) : undefined;
    results.push({
      jobId: record.jobId,
      referenceCode: record.referenceCode,
      serviceTitle: record.serviceTitle,
      bookingStatus: record.bookingStatus,
      participant: {
        id: participant.id,
        name: participant.name,
        role: isCustomer ? 'brainworker' : 'customer',
        avatarUrl: participant.avatarUrl,
        isVerified: participant.isVerified,
      },
      lastMessage: latestMsg
        ? {
            id: latestMsg.id,
            senderId: latestMsg.senderId,
            senderName: latestMsg.senderName,
            content: latestMsg.content,
            contentType: latestMsg.contentType,
            createdAt: latestMsg.createdAt,
          }
        : undefined,
      unreadCount: 0,
      lastMessageAt: latestMsg?.createdAt ?? record.createdAt,
      isReadOnly: record.bookingStatus === 'COMPLETED' || record.bookingStatus === 'CANCELLED',
    });
  }
  return results;
}

export function getSynchronousConversationData(
  callerId: string,
  jobId: string
): { conversation: ConversationSummary; messages: ChatMessageRecord[]; isUnauthorized: false } | { isUnauthorized: true } {
  if (!callerId) return { isUnauthorized: true };
  const record = defaultStore.conversations.get(jobId);
  if (!record) return { isUnauthorized: true };
  if (callerId !== record.customer.id && callerId !== record.brainWorker.id) {
    return { isUnauthorized: true };
  }

  const isCustomer = callerId === record.customer.id;
  const participant = isCustomer ? record.brainWorker : record.customer;
  const latestMsgId = record.messageOrder[record.messageOrder.length - 1];
  const latestMsg = latestMsgId ? record.messageById.get(latestMsgId) : undefined;

  const conversation: ConversationSummary = {
    jobId: record.jobId,
    referenceCode: record.referenceCode,
    serviceTitle: record.serviceTitle,
    bookingStatus: record.bookingStatus,
    participant: {
      id: participant.id,
      name: participant.name,
      role: isCustomer ? 'brainworker' : 'customer',
      avatarUrl: participant.avatarUrl,
      isVerified: participant.isVerified,
    },
    lastMessage: latestMsg
      ? {
          id: latestMsg.id,
          senderId: latestMsg.senderId,
          senderName: latestMsg.senderName,
          content: latestMsg.content,
          contentType: latestMsg.contentType,
          createdAt: latestMsg.createdAt,
        }
      : undefined,
    unreadCount: 0,
    lastMessageAt: latestMsg?.createdAt ?? record.createdAt,
    isReadOnly: record.bookingStatus === 'COMPLETED' || record.bookingStatus === 'CANCELLED',
  };

  const messages = record.messageOrder
    .map((id) => record.messageById.get(id))
    .filter(Boolean) as ChatMessageRecord[];

  return { conversation, messages, isUnauthorized: false };
}
