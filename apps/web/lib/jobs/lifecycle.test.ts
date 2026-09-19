import { describe, it, expect, beforeEach } from 'vitest';
import { MockCustomerActivityRepository } from './repository';
import { CustomerActivityItem } from '@bukiebrainjobs/types';
import { canTransition, InvalidTransitionError } from '@bukiebrainjobs/api-types';

describe('WEB-013 Customer Booking Acceptance & Lifecycle Repository (TDD)', () => {
  let repository: MockCustomerActivityRepository;

  const mockTestActivities: CustomerActivityItem[] = [
    {
      id: 'REQ-ACCEPT-TEST',
      type: 'job_request',
      title: 'Solar Inverter Repair',
      service: 'Inverter & Solar',
      status: 'awaiting_progress',
      statusLabel: 'BrainWorker Responding',
      jobStatus: 'PENDING_ACCEPTANCE',
      customerId: 'usr-cust-1',
      location: 'Lekki Phase 1, Lagos',
      schedule: 'Tomorrow morning',
      referenceCode: 'REQ-ACCEPT-TEST',
      createdAt: 'Today, 10:00 AM',
      invitation: {
        id: 'inv-solar-1',
        jobId: 'REQ-ACCEPT-TEST',
        taskerProfileId: 'bw-solar-tech',
        sentAt: 'Today, 10:00 AM',
      },
    },
    {
      id: 'REQ-DECLINE-TEST',
      type: 'job_request',
      title: 'Generator Tune-Up',
      service: 'Generator Maintenance',
      status: 'awaiting_progress',
      statusLabel: 'BrainWorker Responding',
      jobStatus: 'PENDING_ACCEPTANCE',
      customerId: 'usr-cust-1',
      location: 'Ikeja, Lagos',
      schedule: 'Friday 2:00 PM',
      referenceCode: 'REQ-DECLINE-TEST',
      createdAt: 'Today, 11:00 AM',
      invitation: {
        id: 'inv-gen-1',
        jobId: 'REQ-DECLINE-TEST',
        taskerProfileId: 'bw-gen-expert',
        sentAt: 'Today, 11:00 AM',
      },
    },
    {
      id: 'BKG-CONFIRMED-TEST',
      type: 'booking',
      title: 'Plumbing Leak Repair',
      service: 'Plumbing',
      status: 'scheduled',
      statusLabel: 'Scheduled',
      jobStatus: 'CONFIRMED',
      customerId: 'usr-cust-1',
      location: 'Surulere, Lagos',
      schedule: 'Thursday 10:00 AM',
      confirmedSchedule: 'Thursday, Sep 10, 2026 (10:00 AM - 1:00 PM)',
      referenceCode: 'BKG-CONFIRMED-TEST',
      createdAt: 'Yesterday',
    },
    {
      id: 'BKG-COMPLETED-TEST',
      type: 'booking',
      title: 'Electrical Rewiring',
      service: 'Electrical',
      status: 'completed',
      statusLabel: 'Completed',
      jobStatus: 'COMPLETED',
      customerId: 'usr-cust-1',
      location: 'Yaba, Lagos',
      schedule: 'Last week',
      referenceCode: 'BKG-COMPLETED-TEST',
      createdAt: 'Last week',
      invitation: {
        id: 'inv-completed-1',
        jobId: 'BKG-COMPLETED-TEST',
        taskerProfileId: 'bw-completed-tech',
        sentAt: 'Last week',
      },
    },
    {
      id: 'REQ-OPEN-TEST',
      type: 'job_request',
      title: 'Painting Service',
      service: 'Painting',
      status: 'request_received',
      statusLabel: 'Request Received',
      jobStatus: 'OPEN',
      customerId: 'usr-cust-1',
      location: 'Victoria Island, Lagos',
      schedule: 'Flexible',
      referenceCode: 'REQ-OPEN-TEST',
      createdAt: 'Today, 8:00 AM',
    },
    {
      id: 'REQ-NO-OWNER',
      type: 'job_request',
      title: 'Unowned Activity',
      status: 'request_received',
      statusLabel: 'Request Received',
      jobStatus: 'OPEN',
      location: 'Lagos',
      schedule: 'Flexible',
      referenceCode: 'REQ-NO-OWNER',
      createdAt: 'Today',
    },
  ];

  beforeEach(() => {
    repository = new MockCustomerActivityRepository(mockTestActivities);
  });

  describe('Section 1: Booking Acceptance Boundary', () => {
    it('successfully transitions from PENDING_ACCEPTANCE to CONFIRMED on valid acceptance', async () => {
      const updated = await repository.mutateJobStatus('usr-cust-1', 'REQ-ACCEPT-TEST', {
        type: 'ACCEPT_INVITATION',
        invitationId: 'inv-solar-1',
        taskerProfileId: 'bw-solar-tech',
      });

      expect(updated.jobStatus).toBe('CONFIRMED');
      expect(updated.status).toBe('scheduled');
      expect(updated.statusLabel).toBe('Scheduled');
      expect(updated.invitation?.accepted).toBe(true);
      expect(updated.invitation?.respondedAt).toBeDefined();
      expect(updated.confirmedSchedule).toBeUndefined();
    });

    it('preserves authoritative confirmedSchedule when provided, without fabricating from requested schedule', async () => {
      const withAuthSchedule: CustomerActivityItem = {
        id: 'REQ-AUTH-SCHED',
        type: 'job_request',
        title: 'Solar Inverter Calibration',
        service: 'Solar Installation',
        status: 'awaiting_progress',
        statusLabel: 'BrainWorker Responding',
        jobStatus: 'PENDING_ACCEPTANCE',
        customerId: 'usr-cust-1',
        location: 'Lekki Phase 1, Lagos',
        schedule: 'Tomorrow morning',
        confirmedSchedule: 'Friday, Sep 25, 2026 (9:00 AM - 12:00 PM)',
        referenceCode: 'REQ-AUTH-SCHED',
        createdAt: 'Today, 9:00 AM',
        invitation: {
          id: 'inv-auth-1',
          jobId: 'REQ-AUTH-SCHED',
          taskerProfileId: 'bw-solar-tech',
          sentAt: 'Today, 9:00 AM',
        },
      };
      repository = new MockCustomerActivityRepository([withAuthSchedule]);

      const updated = await repository.mutateJobStatus('usr-cust-1', 'REQ-AUTH-SCHED', {
        type: 'ACCEPT_INVITATION',
        invitationId: 'inv-auth-1',
        taskerProfileId: 'bw-solar-tech',
      });

      expect(updated.jobStatus).toBe('CONFIRMED');
      expect(updated.confirmedSchedule).toBe('Friday, Sep 25, 2026 (9:00 AM - 12:00 PM)');
    });

    it('rejects acceptance if invitation does not belong to job', async () => {
      await expect(
        repository.mutateJobStatus('usr-cust-1', 'REQ-ACCEPT-TEST', {
          type: 'ACCEPT_INVITATION',
          invitationId: 'wrong-invitation-id',
          taskerProfileId: 'bw-solar-tech',
        })
      ).rejects.toThrow(/does not belong to job/i);
    });

    it('rejects acceptance if no invitation exists on the job (cannot manufacture invitation)', async () => {
      await expect(
        repository.mutateJobStatus('usr-cust-1', 'REQ-OPEN-TEST', {
          type: 'ACCEPT_INVITATION',
          invitationId: 'inv-manufactured',
          taskerProfileId: 'bw-solar-tech',
        })
      ).rejects.toThrow(/no active invitation found/i);
    });

    it('rejects acceptance from a state where transition to CONFIRMED is prohibited', async () => {
      await expect(
        repository.mutateJobStatus('usr-cust-1', 'BKG-COMPLETED-TEST', {
          type: 'ACCEPT_INVITATION',
          invitationId: 'inv-completed-1',
          taskerProfileId: 'bw-completed-tech',
        })
      ).rejects.toThrow(InvalidTransitionError);
    });
  });

  describe('Section 2: BrainWorker Decline Boundary', () => {
    it('records decline response without creating a DECLINED JobStatus or cancelling the job', async () => {
      const updated = await repository.mutateJobStatus('usr-cust-1', 'REQ-DECLINE-TEST', {
        type: 'DECLINE_INVITATION',
        invitationId: 'inv-gen-1',
        taskerProfileId: 'bw-gen-expert',
        declineReason: 'Fully booked on another project.',
      });

      // JobStatus remains PENDING_ACCEPTANCE: decline is an invitation response, NOT a JobStatus
      expect(updated.jobStatus).toBe('PENDING_ACCEPTANCE');
      expect(updated.invitation?.accepted).toBe(false);
      expect(updated.invitation?.declineReason).toBe('Fully booked on another project.');
      expect(updated.invitation?.respondedAt).toBeDefined();
      expect(updated.declineResponse).toEqual({
        respondedAt: updated.invitation!.respondedAt,
        declineReason: 'Fully booked on another project.',
      });
      // The job is NOT cancelled
      expect(updated.status).not.toBe('cancelled');
    });

    it('rejects decline when job is outside the PENDING_ACCEPTANCE response boundary', async () => {
      // Decline attempted when job is OPEN
      await expect(
        repository.mutateJobStatus('usr-cust-1', 'REQ-OPEN-TEST', {
          type: 'DECLINE_INVITATION',
          invitationId: 'inv-any',
          taskerProfileId: 'bw-any',
        })
      ).rejects.toThrow(/is in state 'OPEN', expected 'PENDING_ACCEPTANCE'/i);

      // Decline attempted when job is CONFIRMED
      await expect(
        repository.mutateJobStatus('usr-cust-1', 'BKG-CONFIRMED-TEST', {
          type: 'DECLINE_INVITATION',
          invitationId: 'inv-any',
          taskerProfileId: 'bw-any',
        })
      ).rejects.toThrow(/is in state 'CONFIRMED', expected 'PENDING_ACCEPTANCE'/i);

      // Decline attempted when job is COMPLETED
      await expect(
        repository.mutateJobStatus('usr-cust-1', 'BKG-COMPLETED-TEST', {
          type: 'DECLINE_INVITATION',
          invitationId: 'inv-completed-1',
          taskerProfileId: 'bw-completed-tech',
        })
      ).rejects.toThrow(/is in state 'COMPLETED', expected 'PENDING_ACCEPTANCE'/i);
    });

    it('rejects decline if worker id does not match invitation', async () => {
      await expect(
        repository.mutateJobStatus('usr-cust-1', 'REQ-DECLINE-TEST', {
          type: 'DECLINE_INVITATION',
          invitationId: 'inv-gen-1',
          taskerProfileId: 'unmatched-worker-id',
        })
      ).rejects.toThrow(/does not match invitation/i);
    });

    it('rejects decline if no invitation exists on the job (cannot manufacture invitation)', async () => {
      await expect(
        repository.mutateJobStatus('usr-cust-1', 'REQ-OPEN-TEST', {
          type: 'DECLINE_INVITATION',
          invitationId: 'inv-manufactured',
          taskerProfileId: 'bw-gen-expert',
        })
      ).rejects.toThrow(/no active invitation found/i);
    });
  });

  describe('Section 3: Customer Cancellation Boundary', () => {
    it('allows cancellation from permitted states: OPEN, PENDING_ACCEPTANCE, CONFIRMED', async () => {
      // From OPEN
      const cancelledOpen = await repository.mutateJobStatus('usr-cust-1', 'REQ-OPEN-TEST', {
        type: 'CANCEL',
        reason: 'Customer rescheduled',
      });
      expect(cancelledOpen.jobStatus).toBe('CANCELLED');
      expect(cancelledOpen.cancellationReason).toBe('Customer rescheduled');

      // From PENDING_ACCEPTANCE
      const cancelledPending = await repository.mutateJobStatus('usr-cust-1', 'REQ-ACCEPT-TEST', {
        type: 'CANCEL',
        reason: 'Changed mind',
      });
      expect(cancelledPending.jobStatus).toBe('CANCELLED');

      // From CONFIRMED
      const cancelledConfirmed = await repository.mutateJobStatus('usr-cust-1', 'BKG-CONFIRMED-TEST', {
        type: 'CANCEL',
        reason: 'Emergency conflict',
      });
      expect(cancelledConfirmed.jobStatus).toBe('CANCELLED');
    });

    it('rejects cancellation from non-permitted state: COMPLETED', async () => {
      expect(canTransition('COMPLETED', 'CANCELLED')).toBe(false);
      await expect(
        repository.mutateJobStatus('usr-cust-1', 'BKG-COMPLETED-TEST', {
          type: 'CANCEL',
          reason: 'Attempted cancellation after completion',
        })
      ).rejects.toThrow(InvalidTransitionError);
    });
  });

  describe('Section 4: Ownership and Customer Authorization', () => {
    it('rejects mutation when requested by unauthorized customer', async () => {
      await expect(
        repository.mutateJobStatus('usr-attacker-999', 'REQ-ACCEPT-TEST', {
          type: 'CANCEL',
          reason: 'Unauthorized cancel attempt',
        })
      ).rejects.toThrow(/Unauthorized: customer 'usr-attacker-999' does not own job/i);
    });

    it('rejects mutation with empty customerId', async () => {
      await expect(
        repository.mutateJobStatus('', 'REQ-ACCEPT-TEST', {
          type: 'CANCEL',
          reason: 'No auth',
        })
      ).rejects.toThrow(/Unauthorized: customerId is required/i);
    });

    it('fails closed when attempting to mutate an activity with missing customerId', async () => {
      await expect(
        repository.mutateJobStatus('usr-cust-1', 'REQ-NO-OWNER', {
          type: 'CANCEL',
          reason: 'Attempt cancel on unowned activity',
        })
      ).rejects.toThrow(/Unauthorized: activity 'REQ-NO-OWNER' has no owner/i);
    });
  });

  describe('Section 5: Customer Data Isolation', () => {
    it('strictly isolates getActivities by customer ID', async () => {
      const cust1Activities = await repository.getActivities('usr-cust-1');
      expect(cust1Activities.length).toBe(5);
      expect(cust1Activities.every((a) => a.customerId === 'usr-cust-1')).toBe(true);

      const otherActivities = await repository.getActivities('usr-different-cust');
      expect(otherActivities.length).toBe(0);
    });

    it('strictly isolates getActivityById and returns null for unauthorized customer', async () => {
      const authorized = await repository.getActivityById('usr-cust-1', 'REQ-ACCEPT-TEST');
      expect(authorized).not.toBeNull();
      expect(authorized?.id).toBe('REQ-ACCEPT-TEST');

      const unauthorized = await repository.getActivityById('usr-different-cust', 'REQ-ACCEPT-TEST');
      expect(unauthorized).toBeNull();
    });
  });

  describe('Section 6: Invitation Boundary Hardening and Customer Prevention', () => {
    it('rejects customer attempt to dispatch SEND_INVITATION via mutateJobStatus', async () => {
      await expect(
        repository.mutateJobStatus('usr-cust-1', 'REQ-OPEN-TEST', {
          type: 'SEND_INVITATION',
          taskerProfileId: 'bw-solar-tech',
        } as unknown as Parameters<typeof repository.mutateJobStatus>[2])
      ).rejects.toThrow(/Unauthorized: SEND_INVITATION is an internal domain operation/i);
    });

    it('allows internal domain operation to dispatch invitation and transition OPEN to PENDING_ACCEPTANCE', () => {
      const updated = repository.dispatchInvitationInternal('REQ-OPEN-TEST', {
        id: 'inv-internal-1',
        taskerProfileId: 'bw-solar-tech',
      });

      expect(updated.jobStatus).toBe('PENDING_ACCEPTANCE');
      expect(updated.status).toBe('awaiting_progress');
      expect(updated.invitation?.id).toBe('inv-internal-1');
      expect(updated.invitation?.taskerProfileId).toBe('bw-solar-tech');
    });

    it('rejects internal dispatch when job cannot transition to PENDING_ACCEPTANCE', () => {
      expect(() => {
        repository.dispatchInvitationInternal('BKG-CONFIRMED-TEST', {
          taskerProfileId: 'bw-solar-tech',
        });
      }).toThrow(InvalidTransitionError);
    });
  });
});

