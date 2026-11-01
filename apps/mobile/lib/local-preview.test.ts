import { describe, expect, it } from 'vitest';
import { getBookingDateShortcut } from './local-preview';

describe('WEB-007 booking date shortcuts', () => {
  it('uses the current local date for Today', () => {
    expect(getBookingDateShortcut('today', new Date(2026, 9, 30, 12))).toBe('2026-10-30');
  });

  it('uses the next local calendar day for Tomorrow', () => {
    expect(getBookingDateShortcut('tomorrow', new Date(2026, 9, 30, 12))).toBe('2026-10-31');
  });

  it('selects the upcoming Saturday for Weekend, including Saturday itself', () => {
    expect(getBookingDateShortcut('weekend', new Date(2026, 9, 30, 12))).toBe('2026-10-31');
    expect(getBookingDateShortcut('weekend', new Date(2026, 9, 31, 12))).toBe('2026-10-31');
  });
});
