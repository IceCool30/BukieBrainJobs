import { describe, it, expect } from 'vitest';
import { formatNigerianPhone, maskPhoneNumber, formatStars, formatNumberWithCommas } from './formatting';

describe('Formatting Utilities', () => {
  it('formats large numbers with commas', () => {
    expect(formatNumberWithCommas(25000)).toBe('25,000');
  });

  it('formats Nigerian phone numbers properly', () => {
    expect(formatNigerianPhone('08012345678')).toBe('0801 234 5678');
    expect(formatNigerianPhone('+2348012345678')).toBe('801 234 5678');
  });

  it('masks phone numbers for privacy', () => {
    expect(maskPhoneNumber('+2348012345678')).toBe('+234**********5678');
  });

  it('formats review star ratings', () => {
    expect(formatStars(5)).toBe('★★★★★');
  });
});
