// apps/web/lib/scheduling/types.ts
// BW-007 Phase 1: Collaborative Scheduling and Dispatch Types

import type { JobStatus } from '@bukiebrainjobs/api-types';

export type { JobStatus };

export type DispatchStatus = 'NOT_STARTED' | 'EN_ROUTE' | 'ARRIVED';

export interface ArrivalWindow {
  date: string; // ISO date string YYYY-MM-DD
  startHour: number; // 0 to 23
  endHour: number; // 1 to 24
  display: string; // Formatted WAT display string (e.g. 'Tuesday, Oct 20, 2026, 9:00 AM - 12:00 PM WAT')
}

export type RescheduleReason =
  | 'TRAFFIC_DELAY'
  | 'PARTS_PROCUREMENT'
  | 'CUSTOMER_UNAVAILABLE'
  | 'WEATHER'
  | 'EMERGENCY'
  | 'OTHER';

export type RescheduleStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'COUNTERED';

export interface RescheduleRequest {
  id: string;
  bookingId: string;
  requesterRole: 'CLIENT' | 'TASKER';
  requesterId: string;
  proposedWindows: ArrivalWindow[];
  reason: RescheduleReason;
  reasonNote?: string;
  status: RescheduleStatus;
  createdAt: string;
  respondedAt?: string;
}

export interface ProposeRescheduleInput {
  bookingId: string;
  requesterRole: 'CLIENT' | 'TASKER';
  requesterId: string;
  proposedWindows: ArrivalWindow[];
  reason: RescheduleReason;
  reasonNote?: string;
}

export interface RespondRescheduleInput {
  action: 'ACCEPT' | 'DECLINE' | 'COUNTER';
  selectedWindow?: ArrivalWindow;
  counterWindows?: ArrivalWindow[];
  counterReason?: RescheduleReason;
  counterNote?: string;
  respondedBy?: string;
}

export interface DispatchTrackingView {
  bookingId: string;
  jobStatus: JobStatus;
  dispatchStatus: DispatchStatus;
  dispatchUpdatedAt?: string;
  arrivalWindow: ArrivalWindow;
  safetyNotice: string;
  actionRequired?: string;
}
