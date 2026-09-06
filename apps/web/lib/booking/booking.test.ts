import { describe, expect, it } from 'vitest';
import {
  DATE_OPTIONS,
  TIME_OPTIONS,
  PAYMENT_PREFERENCES,
  resolveBookingContext,
  buildBookingReturnUrl,
  isValidBookingDate,
} from './index';

describe('resolveBookingContext', () => {
  it('resolves canonical service by category ID', () => {
    const params = new URLSearchParams({ service: 'generator' });
    const context = resolveBookingContext(params);
    expect(context.serviceStatus).toBe('valid');
    expect(context.service?.id).toBe('generator');
    expect(context.service?.title).toBe('Generator Servicing & Repair');
    expect(context.price).toBe('₦10,000');
  });

  it('resolves canonical service by full title', () => {
    const params = new URLSearchParams({ service: 'AC Repair & Gas Refill' });
    const context = resolveBookingContext(params);
    expect(context.serviceStatus).toBe('valid');
    expect(context.service?.id).toBe('ac');
    expect(context.service?.title).toBe('AC Repair & Gas Refill');
  });

  it('resolves canonical service case-insensitively', () => {
    const params = new URLSearchParams({ service: 'plumbing & pipe fitting' });
    const context = resolveBookingContext(params);
    expect(context.serviceStatus).toBe('valid');
    expect(context.service?.id).toBe('plumbing');
  });

  it('marks unrecognized service as invalid without inventing data', () => {
    const params = new URLSearchParams({ service: 'Unknown Space Repair' });
    const context = resolveBookingContext(params);
    expect(context.serviceStatus).toBe('invalid');
    expect(context.service).toBeUndefined();
    expect(context.rawService).toBe('Unknown Space Repair');
  });

  it('marks missing service as missing without crashing', () => {
    const params = new URLSearchParams({});
    const context = resolveBookingContext(params);
    expect(context.serviceStatus).toBe('missing');
    expect(context.service).toBeUndefined();
  });

  it('resolves active Nigerian city', () => {
    const params = new URLSearchParams({ service: 'generator', city: 'Lagos' });
    const context = resolveBookingContext(params);
    expect(context.cityStatus).toBe('valid');
    expect(context.city).toBe('Lagos');
  });

  it('detects invalid city and does NOT silently default to Lagos', () => {
    const params = new URLSearchParams({ service: 'generator', city: 'London' });
    const context = resolveBookingContext(params);
    expect(context.cityStatus).toBe('invalid');
    expect(context.city).toBeUndefined();
    expect(context.requestedCity).toBe('London');
  });

  it('detects missing city without redirecting', () => {
    const params = new URLSearchParams({ service: 'generator' });
    const context = resolveBookingContext(params);
    expect(context.cityStatus).toBe('missing');
    expect(context.city).toBeUndefined();
  });

  it('hydrates preferred worker context without assignment', () => {
    const params = new URLSearchParams({ service: 'generator', worker: 'Engr. Emeka Nwosu' });
    const context = resolveBookingContext(params);
    expect(context.worker).toBe('Engr. Emeka Nwosu');
  });

  it('sanitizes incoming price context', () => {
    const params = new URLSearchParams({ service: 'generator', price: '₦15,000' });
    const context = resolveBookingContext(params);
    expect(context.price).toBe('₦15,000');
  });

  it('detects mockError=1 test trigger', () => {
    const params = new URLSearchParams({ service: 'generator', mockError: '1' });
    const context = resolveBookingContext(params);
    expect(context.mockError).toBe(true);
  });

  it('extracts pre-populated note from query parameter', () => {
    const params = new URLSearchParams({ service: 'generator', note: 'Generator won’t start' });
    const context = resolveBookingContext(params);
    expect(context.note).toBe('Generator won’t start');
  });
});

describe('buildBookingReturnUrl', () => {
  it('returns services url with category and city when available', () => {
    const service = { id: 'generator', title: 'Generator Servicing & Repair' } as unknown as import('../../lib/mock/homepage-data').ServiceCategory;
    expect(buildBookingReturnUrl({ service, city: 'Lagos' })).toBe('/services?category=generator&city=Lagos');
  });

  it('returns default /services when no context is provided', () => {
    expect(buildBookingReturnUrl({})).toBe('/services');
  });
});

describe('isValidBookingDate', () => {
  it('accepts Today, Tomorrow, and This Weekend', () => {
    expect(isValidBookingDate('Today')).toBe(true);
    expect(isValidBookingDate('Tomorrow')).toBe(true);
    expect(isValidBookingDate('This Weekend')).toBe(true);
  });

  it('accepts valid future ISO date', () => {
    const future = new Date();
    future.setDate(future.getDate() + 7);
    const dateStr = future.toISOString().split('T')[0]!;
    expect(isValidBookingDate(dateStr)).toBe(true);
  });

  it('rejects past dates', () => {
    expect(isValidBookingDate('2020-01-01')).toBe(false);
  });
});

describe('Constants', () => {
  it('defines DATE_OPTIONS including Today, Tomorrow, This Weekend, and Specific Date', () => {
    expect(DATE_OPTIONS).toContain('Today');
    expect(DATE_OPTIONS).toContain('Tomorrow');
    expect(DATE_OPTIONS).toContain('This Weekend');
    expect(DATE_OPTIONS).toContain('Specific Date');
  });

  it('defines 3 time arrival windows', () => {
    expect(TIME_OPTIONS.length).toBe(3);
  });

  it('defines supported payment preferences', () => {
    expect(PAYMENT_PREFERENCES).toEqual(['card', 'transfer', 'ussd']);
  });
});
