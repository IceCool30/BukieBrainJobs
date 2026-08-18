import { describe, it, expect } from 'vitest';
import { calculatePricing, formatCurrency, koboToNaira, nairaToKobo } from './pricing';

describe('Pricing Utilities', () => {
  it('converts between Naira and Kobo correctly', () => {
    expect(nairaToKobo(1500)).toBe(150000);
    expect(koboToNaira(150000)).toBe(1500);
  });

  it('formats currency in Naira with symbol', () => {
    const formatted = formatCurrency(2500000); // 25,000 NGN in kobo
    expect(formatted).toContain('25,000');
  });

  it('calculates full platform fee breakdown properly', () => {
    const result = calculatePricing(500000, 2); // N5,000/hr (500,000 kobo) * 2 hrs = N10,000 subtotal
    expect(result.jobSubtotalKobo).toBe(1000000);
    expect(result.serviceFeeKobo).toBe(100000); // 10%
    expect(result.trustFeeKobo).toBe(75000);   // 7.5%
    expect(result.clientTotalKobo).toBe(1175000); // Subtotal + fees
    expect(result.taskerTotalKobo).toBe(1000000);
  });
});
