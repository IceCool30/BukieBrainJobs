import { describe, expect, it } from 'vitest';
import type { CustomerJobCreationInput } from '@bukiebrainjobs/types';
import { MockCustomerActivityRepository } from './repository';

describe('MockCustomerActivityRepository.createJob', () => {
  it('rejects a job payload that violates the shared customer-intake schema before persisting it', async () => {
    const repository = new MockCustomerActivityRepository([]);
    const invalidPayload = {
      title: 'Short',
      description: 'A sufficiently detailed repair request.',
      jobType: 'TASK',
      address: '12 Example Road',
      city: 'Lagos',
      scheduledStartAt: '2026-10-01T09:00:00.000Z',
      selectedSkillIds: [],
    } as CustomerJobCreationInput;

    await expect(repository.createJob('customer-1', invalidPayload)).rejects.toThrow();
    await expect(repository.getActivities('customer-1')).resolves.toEqual([]);
  });
});
