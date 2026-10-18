// apps/web/lib/scheduling/domain.ts
// BW-007 Phase 1: Collaborative Scheduling and Dispatch Pure Domain Logic

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

// Safety guidance displayed to the customer on all dispatch tracking views
const SAFETY_NOTICE = 'Ensure someone 18+ is home to receive the artisan';

// Days of the week for WAT display formatting
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

// Abbreviated months for WAT display formatting
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

function formatHour(hour: number): string {
  if (hour === 0 || hour === 24) return '12:00 AM';
  if (hour === 12) return '12:00 PM';
  if (hour < 12) return `${hour}:00 AM`;
  return `${hour - 12}:00 PM`;
}

export function formatArrivalWindow(
  date: string,
  startHour: number,
  endHour: number
): ArrivalWindow {
  if (
    !Number.isInteger(startHour) ||
    !Number.isInteger(endHour) ||
    startHour < 0 ||
    startHour > 24 ||
    endHour < 0 ||
    endHour > 24
  ) {
    throw new Error('Hours must be integers between 0 and 24');
  }

  if (startHour >= endHour) {
    throw new Error('startHour must be strictly less than endHour');
  }

  const parsed = new Date(`${date}T12:00:00.000Z`);
  const dayName = DAYS[parsed.getUTCDay()];
  const monthName = MONTHS[parsed.getUTCMonth()];
  const dayOfMonth = parsed.getUTCDate();
  const year = parsed.getUTCFullYear();

  const startDisplay = formatHour(startHour);
  const endDisplay = formatHour(endHour);

  const display = `${dayName}, ${monthName} ${dayOfMonth}, ${year}, ${startDisplay} - ${endDisplay} WAT`;

  return { date, startHour, endHour, display };
}

export function validateRescheduleProposal(
  input: ProposeRescheduleInput,
  currentJobStatus: JobStatus,
  currentDispatchStatus: DispatchStatus,
  now?: Date
): { valid: boolean; error?: string } {
  // Gate 1: Job must be in CONFIRMED status
  if (currentJobStatus !== 'CONFIRMED') {
    return {
      valid: false,
      error: 'Rescheduling is only permitted when job status is CONFIRMED',
    };
  }

  // Gate 2: Dispatch must not be active (artisan already traveling or on-site)
  if (currentDispatchStatus === 'EN_ROUTE') {
    return {
      valid: false,
      error: 'Cannot reschedule while artisan is en route to the location',
    };
  }

  if (currentDispatchStatus === 'ARRIVED') {
    return {
      valid: false,
      error: 'Cannot reschedule while artisan has arrived on-site',
    };
  }

  // Gate 3: Proposed windows count validation (at least 1, at most 3)
  const windowCount = input.proposedWindows.length;
  if (windowCount < 1) {
    return {
      valid: false,
      error: 'Proposal must include at least 1 candidate arrival window',
    };
  }
  if (windowCount > 3) {
    return {
      valid: false,
      error: 'Proposal must include at most 3 candidate arrival windows',
    };
  }

  // Gate 4: All windows must be strictly in the future (minimum 1 hour ahead)
  const referenceTime = now ?? new Date();
  const minimumStartMs = referenceTime.getTime() + 60 * 60 * 1000; // 1 hour ahead

  for (const window of input.proposedWindows) {
    const windowStartMs = new Date(`${window.date}T${String(window.startHour).padStart(2, '0')}:00:00.000Z`).getTime();
    if (windowStartMs < minimumStartMs) {
      return {
        valid: false,
        error: 'All candidate windows must be in the future with a minimum 1 hour ahead of the current time',
      };
    }
  }

  // Gate 5: Non-empty reasonNote required when reason is OTHER
  if (input.reason === 'OTHER') {
    if (!input.reasonNote || input.reasonNote.trim().length === 0) {
      return {
        valid: false,
        error: 'reasonNote is required when reason is OTHER',
      };
    }
  }

  return { valid: true };
}

export function evaluateRescheduleResponse(
  current: RescheduleRequest,
  response: RespondRescheduleInput,
  _now?: Date
): {
  ok: boolean;
  nextStatus: RescheduleStatus;
  newAgreedWindow?: ArrivalWindow;
  error?: string;
} {
  // Only PENDING requests can be responded to
  if (current.status !== 'PENDING') {
    return {
      ok: false,
      nextStatus: current.status,
      error: 'Only requests with PENDING status can receive a response',
    };
  }

  if (response.action === 'ACCEPT') {
    const selectedWindow = response.selectedWindow;
    if (!selectedWindow) {
      return {
        ok: false,
        nextStatus: 'PENDING',
        error: 'A selected arrival window is required when accepting a reschedule',
      };
    }

    return {
      ok: true,
      nextStatus: 'ACCEPTED',
      newAgreedWindow: selectedWindow,
    };
  }

  if (response.action === 'DECLINE') {
    return {
      ok: true,
      nextStatus: 'DECLINED',
    };
  }

  if (response.action === 'COUNTER') {
    const counterWindows = response.counterWindows;
    if (!counterWindows || counterWindows.length < 1) {
      return {
        ok: false,
        nextStatus: 'PENDING',
        error: 'At least 1 counter candidate windows required when countering a reschedule proposal',
      };
    }

    if (counterWindows.length > 3) {
      return {
        ok: false,
        nextStatus: 'PENDING',
        error: 'Counter proposals must include at most 3 candidate arrival windows',
      };
    }

    return {
      ok: true,
      nextStatus: 'COUNTERED',
    };
  }

  return {
    ok: false,
    nextStatus: current.status,
    error: 'Unrecognized response action',
  };
}

export function deriveDispatchTrackingView(booking: {
  bookingId: string;
  jobStatus: JobStatus;
  dispatchStatus: DispatchStatus;
  dispatchUpdatedAt?: string;
  arrivalWindow: ArrivalWindow;
}): DispatchTrackingView {
  let actionRequired: string;

  switch (booking.dispatchStatus) {
    case 'NOT_STARTED':
      actionRequired = 'Awaiting scheduled window. Your artisan is preparing for the job.';
      break;
    case 'EN_ROUTE':
      actionRequired = 'Your artisan is traveling and on the way to your location.';
      break;
    case 'ARRIVED':
      actionRequired = 'Your artisan has arrived. Please admit them to begin the work.';
      break;
    default:
      actionRequired = 'Status update pending.';
  }

  return {
    bookingId: booking.bookingId,
    jobStatus: booking.jobStatus,
    dispatchStatus: booking.dispatchStatus,
    ...(booking.dispatchUpdatedAt != null ? { dispatchUpdatedAt: booking.dispatchUpdatedAt } : {}),
    arrivalWindow: booking.arrivalWindow,
    safetyNotice: SAFETY_NOTICE,
    actionRequired,
  };
}
