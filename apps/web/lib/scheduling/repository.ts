// apps/web/lib/scheduling/repository.ts
// BW-007 Phase 2: Collaborative Scheduling and Dispatch Repository Implementation

import {
  deriveDispatchTrackingView,
  evaluateRescheduleResponse,
  validateRescheduleProposal,
} from './domain';
import type {
  ArrivalWindow,
  DispatchStatus,
  DispatchTrackingView,
  JobStatus,
  ProposeRescheduleInput,
  RescheduleRequest,
  RespondRescheduleInput,
} from './types';

export interface BookingScheduleRecord {
  bookingId: string;
  jobStatus: JobStatus;
  agreedArrivalWindow: ArrivalWindow;
  dispatchStatus: DispatchStatus;
  dispatchUpdatedAt?: string;
}

export interface ISchedulingRepository {
  seedBookingSchedule(record: {
    bookingId: string;
    jobStatus: JobStatus;
    agreedArrivalWindow: ArrivalWindow;
    dispatchStatus?: DispatchStatus;
    dispatchUpdatedAt?: string;
  }): Promise<BookingScheduleRecord>;

  getBookingSchedule(bookingId: string): Promise<BookingScheduleRecord | null>;

  proposeReschedule(input: ProposeRescheduleInput): Promise<RescheduleRequest>;

  getPendingRescheduleRequest(bookingId: string): Promise<RescheduleRequest | null>;

  getRescheduleRequests(bookingId: string): Promise<RescheduleRequest[]>;

  respondReschedule(
    requestId: string,
    input: RespondRescheduleInput
  ): Promise<{ request: RescheduleRequest; updatedSchedule: BookingScheduleRecord }>;

  updateDispatchStatus(
    bookingId: string,
    nextStatus: DispatchStatus
  ): Promise<BookingScheduleRecord>;

  deriveCustomerDispatchView(bookingId: string): Promise<DispatchTrackingView>;
}

export class SchedulingRepository implements ISchedulingRepository {
  private readonly schedules = new Map<string, BookingScheduleRecord>();
  private readonly requests = new Map<string, RescheduleRequest>();
  private idCounter = 0;

  private generateId(prefix: string): string {
    this.idCounter += 1;
    return `${prefix}-${Date.now()}-${this.idCounter}`;
  }

  private generateTimestamp(): string {
    return new Date().toISOString();
  }

  async seedBookingSchedule(record: {
    bookingId: string;
    jobStatus: JobStatus;
    agreedArrivalWindow: ArrivalWindow;
    dispatchStatus?: DispatchStatus;
    dispatchUpdatedAt?: string;
  }): Promise<BookingScheduleRecord> {
    const schedule: BookingScheduleRecord = {
      bookingId: record.bookingId,
      jobStatus: record.jobStatus,
      agreedArrivalWindow: { ...record.agreedArrivalWindow },
      dispatchStatus: record.dispatchStatus ?? 'NOT_STARTED',
      ...(record.dispatchUpdatedAt != null ? { dispatchUpdatedAt: record.dispatchUpdatedAt } : {}),
    };
    this.schedules.set(record.bookingId, schedule);
    return { ...schedule };
  }

  async getBookingSchedule(bookingId: string): Promise<BookingScheduleRecord | null> {
    const schedule = this.schedules.get(bookingId);
    if (!schedule) {
      return null;
    }
    return { ...schedule };
  }

  async proposeReschedule(input: ProposeRescheduleInput): Promise<RescheduleRequest> {
    const schedule = this.schedules.get(input.bookingId);
    if (!schedule) {
      throw new Error('Booking schedule not found');
    }

    const existingPending = Array.from(this.requests.values()).find(
      (r) => r.bookingId === input.bookingId && r.status === 'PENDING'
    );
    if (existingPending) {
      throw new Error('A reschedule request is already pending for this booking');
    }

    const validation = validateRescheduleProposal(
      input,
      schedule.jobStatus,
      schedule.dispatchStatus
    );
    if (!validation.valid) {
      throw new Error(validation.error ?? 'Invalid reschedule proposal');
    }

    const id = this.generateId('resched');
    const createdAt = this.generateTimestamp();
    const request: RescheduleRequest = {
      id,
      bookingId: input.bookingId,
      requesterRole: input.requesterRole,
      requesterId: input.requesterId,
      proposedWindows: input.proposedWindows.map((w) => ({ ...w })),
      reason: input.reason,
      ...(input.reasonNote != null ? { reasonNote: input.reasonNote } : {}),
      status: 'PENDING',
      createdAt,
    };

    this.requests.set(id, request);
    return { ...request };
  }

  async getPendingRescheduleRequest(bookingId: string): Promise<RescheduleRequest | null> {
    const request = Array.from(this.requests.values()).find(
      (r) => r.bookingId === bookingId && r.status === 'PENDING'
    );
    if (!request) {
      return null;
    }
    return { ...request };
  }

  async getRescheduleRequests(bookingId: string): Promise<RescheduleRequest[]> {
    const requests = Array.from(this.requests.values())
      .filter((r) => r.bookingId === bookingId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return requests.map((r) => ({ ...r }));
  }

  async respondReschedule(
    requestId: string,
    input: RespondRescheduleInput
  ): Promise<{ request: RescheduleRequest; updatedSchedule: BookingScheduleRecord }> {
    const request = this.requests.get(requestId);
    if (!request) {
      throw new Error('Reschedule request not found');
    }

    const schedule = this.schedules.get(request.bookingId);
    if (!schedule) {
      throw new Error('Booking schedule not found');
    }

    const evaluation = evaluateRescheduleResponse(request, input);
    if (!evaluation.ok) {
      throw new Error(evaluation.error ?? 'Failed to evaluate reschedule response');
    }

    request.status = evaluation.nextStatus;
    request.respondedAt = this.generateTimestamp();

    if (evaluation.nextStatus === 'ACCEPTED' && evaluation.newAgreedWindow) {
      schedule.agreedArrivalWindow = { ...evaluation.newAgreedWindow };
    }

    this.requests.set(requestId, request);
    this.schedules.set(schedule.bookingId, schedule);

    return {
      request: { ...request },
      updatedSchedule: { ...schedule },
    };
  }

  async updateDispatchStatus(
    bookingId: string,
    nextStatus: DispatchStatus
  ): Promise<BookingScheduleRecord> {
    const schedule = this.schedules.get(bookingId);
    if (!schedule) {
      throw new Error('Booking schedule not found');
    }

    const allowedTransitions: Record<DispatchStatus, DispatchStatus[]> = {
      NOT_STARTED: ['EN_ROUTE', 'ARRIVED'],
      EN_ROUTE: ['ARRIVED'],
      ARRIVED: [],
    };

    if (!allowedTransitions[schedule.dispatchStatus].includes(nextStatus)) {
      throw new Error(
        `Invalid dispatch transition: forward-only progression required (cannot move from ${schedule.dispatchStatus} to ${nextStatus})`
      );
    }

    schedule.dispatchStatus = nextStatus;
    schedule.dispatchUpdatedAt = this.generateTimestamp();
    this.schedules.set(bookingId, schedule);

    return { ...schedule };
  }

  async deriveCustomerDispatchView(bookingId: string): Promise<DispatchTrackingView> {
    const schedule = this.schedules.get(bookingId);
    if (!schedule) {
      throw new Error('Booking schedule not found');
    }

    return deriveDispatchTrackingView({
      bookingId: schedule.bookingId,
      jobStatus: schedule.jobStatus,
      dispatchStatus: schedule.dispatchStatus,
      ...(schedule.dispatchUpdatedAt != null ? { dispatchUpdatedAt: schedule.dispatchUpdatedAt } : {}),
      arrivalWindow: schedule.agreedArrivalWindow,
    });
  }
}

let activeRepository: ISchedulingRepository | null = null;

export function createSchedulingRepository(): ISchedulingRepository {
  return new SchedulingRepository();
}

export function getSchedulingRepository(): ISchedulingRepository {
  if (!activeRepository) {
    activeRepository = createSchedulingRepository();
  }
  return activeRepository;
}

export function resetSchedulingRepository(): void {
  activeRepository = null;
}
