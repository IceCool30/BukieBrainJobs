import { describe, expect, it } from 'vitest';
import {
  validateBookingDraft,
  validateBrainWorkerDraft,
  validatePostJobDraft,
  getPrototypeSubmissionOutcome,
  normalizeNigerianPhone,
  validatePhoneOtp,
  validateEmailAddress,
  validatePassword,
  validateReturnDestination,
  validateRoleSelection,
} from './prototypeFormValidation';

describe('getPrototypeSubmissionOutcome', () => {
  it('uses an explicit mock-error flag or offline state to produce a deterministic recoverable failure', () => {
    expect(getPrototypeSubmissionOutcome({ mockError: true, online: true })).toBe('error');
    expect(getPrototypeSubmissionOutcome({ mockError: false, online: false })).toBe('error');
    expect(getPrototypeSubmissionOutcome({ mockError: false, online: true })).toBe('success');
  });
});

describe('validateBookingDraft', () => {
  it('returns actionable errors for missing booking details', () => {
    expect(validateBookingDraft({ address: '12', notes: 'Fix it', city: '' })).toEqual({
      address: 'Enter a complete street address.',
      city: 'Choose a location for the job.',
      notes: 'Add a few details about the work you need done.',
    });
  });

  it('accepts complete booking details', () => {
    expect(validateBookingDraft({
      address: '14 Admiralty Way, Lekki Phase 1',
      city: 'Lagos',
      notes: 'The generator needs servicing before the weekend.',
    })).toEqual({});
  });

  it('rejects whitespace-only address and notes', () => {
    expect(validateBookingDraft({
      address: '     ',
      city: 'Lagos',
      notes: '                   ',
    })).toEqual({
      address: 'Enter a complete street address.',
      notes: 'Add a few details about the work you need done.',
    });
  });

  it('validates date, arrivalWindow, and paymentPreference when provided in WEB-007 draft', () => {
    expect(validateBookingDraft({
      address: '14 Admiralty Way, Lekki Phase 1',
      city: 'Lagos',
      notes: 'The generator needs servicing before the weekend.',
      date: '',
      arrivalWindow: '',
      paymentPreference: '',
    })).toEqual({
      date: 'Choose a preferred service date.',
      arrivalWindow: 'Choose a preferred arrival window.',
      paymentPreference: 'Choose a preferred payment method.',
    });
  });

  it('rejects past dates for scheduled bookings', () => {
    expect(validateBookingDraft({
      address: '14 Admiralty Way, Lekki Phase 1',
      city: 'Lagos',
      notes: 'The generator needs servicing before the weekend.',
      date: '2020-01-01',
    })).toEqual({
      date: 'Choose a date that is today or in the future.',
    });
  });

  it('accepts valid schedule and payment preference in WEB-007 draft', () => {
    expect(validateBookingDraft({
      address: '14 Admiralty Way, Lekki Phase 1',
      city: 'Lagos',
      notes: 'The generator needs servicing before the weekend.',
      date: 'Tomorrow',
      arrivalWindow: 'Morning (9:00 AM - 12:00 PM)',
      paymentPreference: 'card',
      landmark: 'Near Ebeano Supermarket',
    })).toEqual({});
  });
});

describe('validatePostJobDraft', () => {
  it('returns actionable errors for an incomplete job post', () => {
    expect(validatePostJobDraft({ budget: '', city: '', description: 'Need help', title: 'AC' })).toEqual({
      budget: 'Add the budget range you have in mind.',
      city: 'Choose the job location.',
      description: 'Add enough detail for a BrainWorker to understand the job.',
      title: 'Use at least 10 characters to describe the job.',
    });
  });

  it('accepts a complete job post', () => {
    expect(validatePostJobDraft({
      budget: '₦15,000 to ₦25,000',
      city: 'Lagos',
      description: 'The split-unit AC is not cooling and needs a gas refill before Friday.',
      title: 'AC repair and gas refill',
    })).toEqual({});
  });
});

describe('validateBrainWorkerDraft', () => {
  it('returns actionable errors for incomplete onboarding details', () => {
    expect(validateBrainWorkerDraft({ city: '', fullName: 'A', phone: '08012345678', service: '' })).toEqual({
      city: 'Choose the city where you work.',
      fullName: 'Enter your full name.',
      phone: 'Enter a valid Nigerian phone number, such as +234 801 234 5678.',
      service: 'Choose the service you offer.',
    });
  });

  it('accepts a complete BrainWorker onboarding draft', () => {
    expect(validateBrainWorkerDraft({
      city: 'Enugu',
      fullName: 'Babatunde Adebayo',
      phone: '+234 801 234 5678',
      service: 'Generator Servicing & Repair',
    })).toEqual({});
  });
});

describe('normalizeNigerianPhone', () => {
  it('normalizes local 080... Nigerian numbers', () => {
    const result = normalizeNigerianPhone('08012345678');
    expect(result.valid).toBe(true);
    expect(result.normalized).toBe('+2348012345678');
    expect(result.formatted).toBe('+234 801 234 5678');
    expect(result.masked).toBe('+234 801 ••• ••78');
  });

  it('normalizes 234... format without plus', () => {
    const result = normalizeNigerianPhone('2348012345678');
    expect(result.valid).toBe(true);
    expect(result.normalized).toBe('+2348012345678');
  });

  it('normalizes +234... international format with spaces or hyphens', () => {
    const result = normalizeNigerianPhone('+234 801-234-5678');
    expect(result.valid).toBe(true);
    expect(result.normalized).toBe('+2348012345678');
  });

  it('supports 070, 081, 090, 091 prefixes', () => {
    expect(normalizeNigerianPhone('07012345678').valid).toBe(true);
    expect(normalizeNigerianPhone('08112345678').valid).toBe(true);
    expect(normalizeNigerianPhone('09012345678').valid).toBe(true);
    expect(normalizeNigerianPhone('09112345678').valid).toBe(true);
  });

  it('rejects invalid or non-Nigerian numbers', () => {
    expect(normalizeNigerianPhone('').valid).toBe(false);
    expect(normalizeNigerianPhone('12345').valid).toBe(false);
    expect(normalizeNigerianPhone('01234567890').valid).toBe(false);
    expect(normalizeNigerianPhone('+14155552671').valid).toBe(false);
  });
});

describe('validatePhoneOtp', () => {
  it('accepts valid 6-digit numeric OTP', () => {
    expect(validatePhoneOtp('123456')).toEqual({ valid: true });
    expect(validatePhoneOtp('  654321  ')).toEqual({ valid: true });
  });

  it('rejects invalid, short, or non-numeric OTP', () => {
    expect(validatePhoneOtp('').valid).toBe(false);
    expect(validatePhoneOtp('123').valid).toBe(false);
    expect(validatePhoneOtp('12345a').valid).toBe(false);
    expect(validatePhoneOtp('1234567').valid).toBe(false);
  });
});

describe('validateEmailAddress', () => {
  it('accepts valid email addresses', () => {
    expect(validateEmailAddress('ada@example.com')).toEqual({ valid: true });
    expect(validateEmailAddress('emeka.nwosu@bukiebrainjobs.com')).toEqual({ valid: true });
  });

  it('rejects empty or invalid email addresses', () => {
    expect(validateEmailAddress('').valid).toBe(false);
    expect(validateEmailAddress('not-an-email').valid).toBe(false);
    expect(validateEmailAddress('missing@domain').valid).toBe(false);
  });
});

describe('validatePassword', () => {
  it('accepts passwords with 8 or more characters', () => {
    expect(validatePassword('SuperSecure123')).toEqual({ valid: true });
  });

  it('rejects empty or short passwords', () => {
    expect(validatePassword('').valid).toBe(false);
    expect(validatePassword('short').valid).toBe(false);
  });
});

describe('validateReturnDestination', () => {
  it('accepts valid relative internal application paths', () => {
    expect(validateReturnDestination('/book')).toBe('/book');
    expect(validateReturnDestination('/services?category=generator')).toBe('/services?category=generator');
    expect(validateReturnDestination('/brainworkers/emeka')).toBe('/brainworkers/emeka');
  });

  it('safely neutralizes open redirect and malformed destination attempts', () => {
    expect(validateReturnDestination('//evil.com')).toBe('/');
    expect(validateReturnDestination('https://evil.com')).toBe('/');
    expect(validateReturnDestination('javascript:alert(1)')).toBe('/');
    expect(validateReturnDestination('/\\evil.com')).toBe('/');
    expect(validateReturnDestination('')).toBe('/');
    expect(validateReturnDestination(null)).toBe('/');
    expect(validateReturnDestination(undefined)).toBe('/');
  });
});

describe('validateRoleSelection', () => {
  it('accepts customer and brainworker roles', () => {
    expect(validateRoleSelection('customer')).toEqual({ valid: true, role: 'customer' });
    expect(validateRoleSelection('brainworker')).toEqual({ valid: true, role: 'brainworker' });
  });

  it('rejects invalid or missing role selection', () => {
    expect(validateRoleSelection(null).valid).toBe(false);
    expect(validateRoleSelection('admin').valid).toBe(false);
  });
});
