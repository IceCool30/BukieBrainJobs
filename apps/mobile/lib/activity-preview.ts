export type ActivityType = 'job_request' | 'booking';

export type ActivityStatus =
  | 'request_received'
  | 'awaiting_progress'
  | 'in_progress'
  | 'scheduled'
  | 'completed'
  | 'cancelled';

export type ActivitySegment = 'All' | 'Active' | 'Upcoming' | 'Past';

export type ActivitySample = {
  type: ActivityType;
  status: ActivityStatus;
  serviceTitle: string;
  badge: 'Sample';
};

export const ACTIVITY_SAMPLES: ReadonlyArray<ActivitySample> = [
  { type: 'job_request', status: 'request_received', serviceTitle: 'Generator Servicing & Repair', badge: 'Sample' },
  { type: 'booking', status: 'awaiting_progress', serviceTitle: 'AC Repair & Gas Refill', badge: 'Sample' },
  { type: 'booking', status: 'in_progress', serviceTitle: 'Plumbing & Pipe Fitting', badge: 'Sample' },
  { type: 'booking', status: 'scheduled', serviceTitle: 'Electrical & Solar Inverter', badge: 'Sample' },
  { type: 'booking', status: 'completed', serviceTitle: 'Deep Cleaning & Post-Construction', badge: 'Sample' },
  { type: 'job_request', status: 'cancelled', serviceTitle: 'Furniture & Carpentry Work', badge: 'Sample' },
];

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  job_request: 'Job request',
  booking: 'Booking',
};

export const ACTIVITY_STATUS_LABELS: Record<ActivityStatus, string> = {
  request_received: 'Request received',
  awaiting_progress: 'Awaiting progress',
  in_progress: 'In progress',
  scheduled: 'Scheduled',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const ACTIVITY_SAMPLE_NOTICE =
  'These sample entries are for preview only. They\'re not saved to your account.';

const segmentStatuses: Record<Exclude<ActivitySegment, 'All'>, ReadonlyArray<ActivityStatus>> = {
  Active: ['request_received', 'awaiting_progress', 'in_progress'],
  Upcoming: ['scheduled'],
  Past: ['completed', 'cancelled'],
};

export function filterActivitySamples(segment: ActivitySegment): ReadonlyArray<ActivitySample> {
  if (segment === 'All') {
    return ACTIVITY_SAMPLES;
  }
  const includedStatuses = segmentStatuses[segment];
  return ACTIVITY_SAMPLES.filter((sample) => includedStatuses.includes(sample.status));
}