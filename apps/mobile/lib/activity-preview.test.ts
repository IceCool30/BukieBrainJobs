import { describe, expect, it } from 'vitest';

import {
  ACTIVITY_SAMPLES,
  ACTIVITY_TYPE_LABELS,
  ACTIVITY_STATUS_LABELS,
  filterActivitySamples,
  ACTIVITY_SAMPLE_NOTICE,
} from './activity-preview';

describe('MOB-ACT-001 activity preview', () => {
  it('ACTIVITY_SAMPLES equals exact six rows in order with type, status, serviceTitle, badge=Sample', () => {
    const expected = [
      { type: 'job_request', status: 'request_received', serviceTitle: 'Generator Servicing & Repair', badge: 'Sample' },
      { type: 'booking', status: 'awaiting_progress', serviceTitle: 'AC Repair & Gas Refill', badge: 'Sample' },
      { type: 'booking', status: 'in_progress', serviceTitle: 'Plumbing & Pipe Fitting', badge: 'Sample' },
      { type: 'booking', status: 'scheduled', serviceTitle: 'Electrical & Solar Inverter', badge: 'Sample' },
      { type: 'booking', status: 'completed', serviceTitle: 'Deep Cleaning & Post-Construction', badge: 'Sample' },
      { type: 'job_request', status: 'cancelled', serviceTitle: 'Furniture & Carpentry Work', badge: 'Sample' },
    ];

    expect(ACTIVITY_SAMPLES).toStrictEqual(expected);
  });

  it('ACTIVITY_TYPE_LABELS equals complete WEB-011 visible-type mappings', () => {
    expect(ACTIVITY_TYPE_LABELS).toEqual({
      job_request: 'Job request',
      booking: 'Booking',
    });
  });

  it('ACTIVITY_STATUS_LABELS equals complete WEB-011 visible-status mappings', () => {
    expect(ACTIVITY_STATUS_LABELS).toEqual({
      request_received: 'Request received',
      awaiting_progress: 'Awaiting progress',
      in_progress: 'In progress',
      scheduled: 'Scheduled',
      completed: 'Completed',
      cancelled: 'Cancelled',
    });
  });

  it('ACTIVITY_SAMPLE_NOTICE equals exact preview-only notice', () => {
    expect(ACTIVITY_SAMPLE_NOTICE).toBe(
      'These sample entries are for preview only. They\'re not saved to your account.',
    );
  });

  it('filterActivitySamples(All) returns all six serviceTitles in spec order', () => {
    const allTitles = filterActivitySamples('All').map((s) => s.serviceTitle);
    expect(allTitles).toStrictEqual([
      'Generator Servicing & Repair',
      'AC Repair & Gas Refill',
      'Plumbing & Pipe Fitting',
      'Electrical & Solar Inverter',
      'Deep Cleaning & Post-Construction',
      'Furniture & Carpentry Work',
    ]);
  });

  it('filterActivitySamples(Active) returns three serviceTitles', () => {
    const activeTitles = filterActivitySamples('Active').map((s) => s.serviceTitle);
    expect(activeTitles).toStrictEqual([
      'Generator Servicing & Repair',
      'AC Repair & Gas Refill',
      'Plumbing & Pipe Fitting',
    ]);
  });

  it('filterActivitySamples(Upcoming) returns one serviceTitle', () => {
    const upcomingTitles = filterActivitySamples('Upcoming').map((s) => s.serviceTitle);
    expect(upcomingTitles).toStrictEqual(['Electrical & Solar Inverter']);
  });

  it('filterActivitySamples(Past) returns two serviceTitles', () => {
    const pastTitles = filterActivitySamples('Past').map((s) => s.serviceTitle);
    expect(pastTitles).toStrictEqual([
      'Deep Cleaning & Post-Construction',
      'Furniture & Carpentry Work',
    ]);
  });
});