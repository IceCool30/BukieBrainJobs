import { describe, expect, it } from 'vitest';
import type { MessagingBookingStatus } from './types';
import { ConversationClosedError, MessageValidationError } from './types';
import {
  createMessagingRepository,
  type MessagingRepositoryStore,
} from './repository';

function createRepository(bookingStatus: MessagingBookingStatus = 'CONFIRMED') {
  const jobId = 'job-validation-test';
  const store = {
    conversations: new Map([[jobId, {
      jobId,
      referenceCode: 'BBJ-LAG-2026-TEST',
      serviceTitle: 'Generator repair',
      bookingStatus,
      createdAt: '2026-09-20T08:00:00.000Z',
      customer: { id: 'customer-1', name: 'Customer', isVerified: false },
      brainWorker: { id: 'worker-1', name: 'BrainWorker', isVerified: true },
      messageById: new Map(),
      messageOrder: [],
      readTimestamps: new Map(),
    }]]),
    sentTempIds: new Map<string, string>(),
    msgCounter: 0,
  } as unknown as MessagingRepositoryStore;

  return { repository: createMessagingRepository(store), jobId };
}

describe('production messaging repository boundary validation', () => {
  it('rejects whitespace-only text', async () => {
    const { repository, jobId } = createRepository();
    await expect(repository.sendMessage('customer-1', {
      jobId,
      content: '   ',
      contentType: 'text',
      tempId: 'temp-1',
    })).rejects.toThrow(MessageValidationError);
  });

  it('rejects text beyond 2,000 Unicode code points', async () => {
    const { repository, jobId } = createRepository();
    await expect(repository.sendMessage('customer-1', {
      jobId,
      content: '👍'.repeat(2001),
      contentType: 'text',
      tempId: 'temp-2',
    })).rejects.toThrow(MessageValidationError);
  });

  it('rejects invalid structured location payloads', async () => {
    const { repository, jobId } = createRepository();
    await expect(repository.sendMessage('customer-1', {
      jobId,
      content: '',
      contentType: 'location',
      location: {
        latitude: 91,
        longitude: 0,
        addressText: '12 Example Road, Lagos',
        sharedAt: '2026-09-29T02:00:00.000Z',
      },
      tempId: 'temp-3',
    })).rejects.toThrow(MessageValidationError);
  });

  it('stores plain text as escaped text', async () => {
    const { repository, jobId } = createRepository();
    const message = await repository.sendMessage('customer-1', {
      jobId,
      content: '<b>Repair update</b>',
      contentType: 'text',
      tempId: 'temp-4',
    });
    expect(message.content).toBe('&lt;b&gt;Repair update&lt;/b&gt;');
  });

  it.each(['COMPLETED', 'CANCELLED'] as const)(
    'rejects image upload when the job is %s', async (status) => {
      const { repository, jobId } = createRepository(status);
      await expect(repository.uploadAttachment(
        'customer-1',
        jobId,
        new Blob(['photo'], { type: 'image/jpeg' }),
        'image/jpeg',
      )).rejects.toThrow(ConversationClosedError);
    }
  );
});
