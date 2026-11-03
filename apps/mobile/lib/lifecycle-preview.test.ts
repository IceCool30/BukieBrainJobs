import { describe, expect, it } from 'vitest';
import {
  LIFECYCLE_MILESTONES,
  LIFECYCLE_SAMPLE_DISCLAIMER,
  getSampleCanonicalStatus,
  getSampleLifecycleHeading,
  getSampleLifecycleNarrative,
  getSampleMilestoneProgression,
  isSampleCancelled,
} from './lifecycle-preview';

describe('MOB-LIFE-001 native booking lifecycle preview helper', () => {
  it('maps the six approved samples to authoritative canonical JobStatus', () => {
    expect(getSampleCanonicalStatus(0)).toBe('OPEN');
    expect(getSampleCanonicalStatus(1)).toBe('PENDING_ACCEPTANCE');
    expect(getSampleCanonicalStatus(2)).toBe('IN_PROGRESS');
    expect(getSampleCanonicalStatus(3)).toBe('CONFIRMED');
    expect(getSampleCanonicalStatus(4)).toBe('COMPLETED');
    expect(getSampleCanonicalStatus(5)).toBe('CANCELLED');
  });

  it('provides exact lifecycle presentation headings for each sample', () => {
    expect(getSampleLifecycleHeading(0)).toBe('Request Received');
    expect(getSampleLifecycleHeading(1)).toBe('Awaiting BrainWorker response');
    expect(getSampleLifecycleHeading(2)).toBe('Work in Progress');
    expect(getSampleLifecycleHeading(3)).toBe('Booking Confirmed');
    expect(getSampleLifecycleHeading(4)).toBe('Work Completed');
    expect(getSampleLifecycleHeading(5)).toBe('Request Cancelled');
  });

  it('provides exact truthful lifecycle narratives for each sample', () => {
    expect(getSampleLifecycleNarrative(0)).toBe(
      'This sample represents a service request received and awaiting provider matching.',
    );
    expect(getSampleLifecycleNarrative(1)).toBe(
      'This sample represents a booking awaiting a BrainWorker response.',
    );
    expect(getSampleLifecycleNarrative(2)).toBe(
      'This sample represents work that is in progress.',
    );
    expect(getSampleLifecycleNarrative(3)).toBe('Your booking is confirmed.');
    expect(getSampleLifecycleNarrative(4)).toBe(
      'This sample represents work marked complete.',
    );
    expect(getSampleLifecycleNarrative(5)).toBe(
      'This sample represents a cancelled request.',
    );
  });

  it('defines the exact local demonstration disclaimer', () => {
    expect(LIFECYCLE_SAMPLE_DISCLAIMER).toBe(
      'This is a local demonstration of the booking lifecycle. No live service record or provider assignment exists.',
    );
  });

  it('defines the six generic timeline milestones with canonical statuses in WEB-013 order', () => {
    expect(LIFECYCLE_MILESTONES).toEqual([
      { id: 'step_open', label: 'Request Submitted', canonicalStatus: 'OPEN' },
      { id: 'step_pending_acceptance', label: 'Worker Response Pending', canonicalStatus: 'PENDING_ACCEPTANCE' },
      { id: 'step_confirmed', label: 'Confirmed', canonicalStatus: 'CONFIRMED' },
      { id: 'step_in_progress', label: 'In Progress', canonicalStatus: 'IN_PROGRESS' },
      { id: 'step_pending_completion', label: 'Awaiting Completion', canonicalStatus: 'PENDING_COMPLETION' },
      { id: 'step_completed', label: 'Completed', canonicalStatus: 'COMPLETED' },
    ]);
  });

  it('correctly resolves milestone progression for sample 0 (OPEN)', () => {
    const progression = getSampleMilestoneProgression(0);
    expect(progression).not.toBeNull();
    expect(progression?.map((m) => m.state)).toEqual([
      'active',
      'upcoming',
      'upcoming',
      'upcoming',
      'upcoming',
      'upcoming',
    ]);
  });

  it('correctly resolves milestone progression for sample 1 (PENDING_ACCEPTANCE)', () => {
    const progression = getSampleMilestoneProgression(1);
    expect(progression).not.toBeNull();
    expect(progression?.map((m) => m.state)).toEqual([
      'completed',
      'active',
      'upcoming',
      'upcoming',
      'upcoming',
      'upcoming',
    ]);
  });

  it('correctly resolves milestone progression for sample 3 (CONFIRMED)', () => {
    const progression = getSampleMilestoneProgression(3);
    expect(progression).not.toBeNull();
    expect(progression?.map((m) => m.state)).toEqual([
      'completed',
      'completed',
      'active',
      'upcoming',
      'upcoming',
      'upcoming',
    ]);
  });

  it('correctly resolves milestone progression for sample 2 (IN_PROGRESS)', () => {
    const progression = getSampleMilestoneProgression(2);
    expect(progression).not.toBeNull();
    expect(progression?.map((m) => m.state)).toEqual([
      'completed',
      'completed',
      'completed',
      'active',
      'upcoming',
      'upcoming',
    ]);
  });

  it('correctly resolves milestone progression for sample 4 (COMPLETED)', () => {
    const progression = getSampleMilestoneProgression(4);
    expect(progression).not.toBeNull();
    expect(progression?.map((m) => m.state)).toEqual([
      'completed',
      'completed',
      'completed',
      'completed',
      'completed',
      'active',
    ]);
  });

  it('identifies cancelled sample and returns null for progression', () => {
    expect(isSampleCancelled(5)).toBe(true);
    expect(isSampleCancelled(0)).toBe(false);
    expect(getSampleMilestoneProgression(5)).toBeNull();
  });
});
