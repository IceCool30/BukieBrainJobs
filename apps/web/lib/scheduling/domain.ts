// apps/web/lib/scheduling/domain.ts
// BW-007 Phase 1: Collaborative Scheduling and Dispatch Pure Domain Logic (RED Stubs)

import type {
  ArrivalWindow,
  DispatchStatus,
  DispatchTrackingView,
  JobStatus,
  ProposeRescheduleInput,
  RescheduleRequest,
  RescheduleStatus,
  RespondRescheduleInput,
} from './types';

export function formatArrivalWindow(
  _date: string,
  _startHour: number,
  _endHour: number
): ArrivalWindow {
  throw new Error('Not implemented: Phase 1 RED');
}

export function validateRescheduleProposal(
  _input: ProposeRescheduleInput,
  _currentJobStatus: JobStatus,
  _currentDispatchStatus: DispatchStatus,
  _now?: Date
): { valid: boolean; error?: string } {
  throw new Error('Not implemented: Phase 1 RED');
}

export function evaluateRescheduleResponse(
  _current: RescheduleRequest,
  _response: RespondRescheduleInput,
  _now?: Date
): {
  ok: boolean;
  nextStatus: RescheduleStatus;
  newAgreedWindow?: ArrivalWindow;
  error?: string;
} {
  throw new Error('Not implemented: Phase 1 RED');
}

export function deriveDispatchTrackingView(_booking: {
  bookingId: string;
  jobStatus: JobStatus;
  dispatchStatus: DispatchStatus;
  dispatchUpdatedAt?: string;
  arrivalWindow: ArrivalWindow;
}): DispatchTrackingView {
  throw new Error('Not implemented: Phase 1 RED');
}
