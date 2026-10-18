// apps/web/lib/scheduling/repository.ts
// BW-007 Phase 2: Collaborative Scheduling and Dispatch Repository Contracts (RED Stubs)

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
  async seedBookingSchedule(
    _record: {
      bookingId: string;
      jobStatus: JobStatus;
      agreedArrivalWindow: ArrivalWindow;
      dispatchStatus?: DispatchStatus;
      dispatchUpdatedAt?: string;
    }
  ): Promise<BookingScheduleRecord> {
    throw new Error('Not implemented: Phase 2 RED');
  }

  async getBookingSchedule(_bookingId: string): Promise<BookingScheduleRecord | null> {
    throw new Error('Not implemented: Phase 2 RED');
  }

  async proposeReschedule(_input: ProposeRescheduleInput): Promise<RescheduleRequest> {
    throw new Error('Not implemented: Phase 2 RED');
  }

  async getPendingRescheduleRequest(_bookingId: string): Promise<RescheduleRequest | null> {
    throw new Error('Not implemented: Phase 2 RED');
  }

  async getRescheduleRequests(_bookingId: string): Promise<RescheduleRequest[]> {
    throw new Error('Not implemented: Phase 2 RED');
  }

  async respondReschedule(
    _requestId: string,
    _input: RespondRescheduleInput
  ): Promise<{ request: RescheduleRequest; updatedSchedule: BookingScheduleRecord }> {
    throw new Error('Not implemented: Phase 2 RED');
  }

  async updateDispatchStatus(
    _bookingId: string,
    _nextStatus: DispatchStatus
  ): Promise<BookingScheduleRecord> {
    throw new Error('Not implemented: Phase 2 RED');
  }

  async deriveCustomerDispatchView(_bookingId: string): Promise<DispatchTrackingView> {
    throw new Error('Not implemented: Phase 2 RED');
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
