import type { JobStatus } from '@bukiebrainjobs/types';

export type MilestoneState = 'completed' | 'active' | 'upcoming';

export type LifecycleMilestone = {
  id: string;
  label: string;
  canonicalStatus: JobStatus;
};

export type MilestoneWithProgress = LifecycleMilestone & {
  state: MilestoneState;
};

export const LIFECYCLE_SAMPLE_DISCLAIMER =
  'This is a local demonstration of the booking lifecycle. No live service record or provider assignment exists.';

export const CANCELLED_PREVIEW_NOTICE = 'Preview record: read only';

export const LIFECYCLE_MILESTONES: ReadonlyArray<LifecycleMilestone> = [
  { id: 'step_open', label: 'Request Submitted', canonicalStatus: 'OPEN' },
  { id: 'step_pending_acceptance', label: 'Worker Response Pending', canonicalStatus: 'PENDING_ACCEPTANCE' },
  { id: 'step_confirmed', label: 'Confirmed', canonicalStatus: 'CONFIRMED' },
  { id: 'step_in_progress', label: 'In Progress', canonicalStatus: 'IN_PROGRESS' },
  { id: 'step_pending_completion', label: 'Awaiting Completion', canonicalStatus: 'PENDING_COMPLETION' },
  { id: 'step_completed', label: 'Completed', canonicalStatus: 'COMPLETED' },
];

type SampleLifecycleConfig = {
  canonicalStatus: JobStatus;
  heading: string;
  narrative: string;
  activeMilestoneIndex: number | null;
};

const SAMPLE_CONFIGS: ReadonlyArray<SampleLifecycleConfig> = [
  {
    canonicalStatus: 'OPEN',
    heading: 'Request Received',
    narrative: 'This sample represents a service request received and awaiting provider matching.',
    activeMilestoneIndex: 0,
  },
  {
    canonicalStatus: 'PENDING_ACCEPTANCE',
    heading: 'Awaiting BrainWorker response',
    narrative: 'This sample represents a booking awaiting a BrainWorker response.',
    activeMilestoneIndex: 1,
  },
  {
    canonicalStatus: 'IN_PROGRESS',
    heading: 'Work in Progress',
    narrative: 'This sample represents work that is in progress.',
    activeMilestoneIndex: 3,
  },
  {
    canonicalStatus: 'CONFIRMED',
    heading: 'Booking Confirmed',
    narrative: 'Your booking is confirmed.',
    activeMilestoneIndex: 2,
  },
  {
    canonicalStatus: 'COMPLETED',
    heading: 'Work Completed',
    narrative: 'This sample represents work marked complete.',
    activeMilestoneIndex: 5,
  },
  {
    canonicalStatus: 'CANCELLED',
    heading: 'Request Cancelled',
    narrative: 'This sample represents a cancelled request.',
    activeMilestoneIndex: null,
  },
];

export function getSampleCanonicalStatus(sampleIndex: number): JobStatus {
  const config = SAMPLE_CONFIGS[sampleIndex];
  if (!config) {
    throw new Error(`Invalid sample index: ${sampleIndex}`);
  }
  return config.canonicalStatus;
}

export function getSampleLifecycleHeading(sampleIndex: number): string {
  const config = SAMPLE_CONFIGS[sampleIndex];
  if (!config) {
    throw new Error(`Invalid sample index: ${sampleIndex}`);
  }
  return config.heading;
}

export function getSampleLifecycleNarrative(sampleIndex: number): string {
  const config = SAMPLE_CONFIGS[sampleIndex];
  if (!config) {
    throw new Error(`Invalid sample index: ${sampleIndex}`);
  }
  return config.narrative;
}

export function isSampleCancelled(sampleIndex: number): boolean {
  return getSampleCanonicalStatus(sampleIndex) === 'CANCELLED';
}

function resolveMilestoneState(index: number, activeIndex: number): MilestoneState {
  if (index < activeIndex) return 'completed';
  if (index === activeIndex) return 'active';
  return 'upcoming';
}

export function getSampleMilestoneProgression(
  sampleIndex: number,
): ReadonlyArray<MilestoneWithProgress> | null {
  const config = SAMPLE_CONFIGS[sampleIndex];
  if (!config || config.activeMilestoneIndex === null) {
    return null;
  }
  const activeIndex = config.activeMilestoneIndex;
  return LIFECYCLE_MILESTONES.map((m, idx) => ({
    ...m,
    state: resolveMilestoneState(idx, activeIndex),
  }));
}
