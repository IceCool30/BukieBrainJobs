import { describe, expect, it } from 'vitest';
import {
  validateBookingDraft,
  validateBrainWorkerDraft,
  validatePostJobDraft,
  validateCustomerJobDraft,
  validateJobDraft,
  isActiveMarketplaceCity,
  CustomerJobDraft,
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

describe('isActiveMarketplaceCity', () => {
  it('recognizes active Nigerian marketplace cities', () => {
    expect(isActiveMarketplaceCity('Lagos')).toBe(true);
    expect(isActiveMarketplaceCity('Abuja')).toBe(true);
    expect(isActiveMarketplaceCity('Abuja (FCT)')).toBe(true);
    expect(isActiveMarketplaceCity('Port Harcourt')).toBe(true);
    expect(isActiveMarketplaceCity('Ibadan')).toBe(true);
    expect(isActiveMarketplaceCity('Enugu')).toBe(true);
    expect(isActiveMarketplaceCity('Kano')).toBe(true);
    expect(isActiveMarketplaceCity('Benin City')).toBe(true);
  });

  it('rejects inactive or unrecognized cities', () => {
    expect(isActiveMarketplaceCity('London')).toBe(false);
    expect(isActiveMarketplaceCity('New York')).toBe(false);
    expect(isActiveMarketplaceCity('')).toBe(false);
    expect(isActiveMarketplaceCity('Accra')).toBe(false);
  });
});

describe('validateCustomerJobDraft (WEB-009 / WEB-009A)', () => {
  const validDraft: CustomerJobDraft = {
    jobType: 'specific_service',
    category: 'generator',
    title: 'Mikano 20kVA Diesel Generator Annual Service',
    description: 'The generator needs a full oil filter change and electrical diagnostic before the rainy season.',
    city: 'Lagos',
    streetAddress: '15 Adeola Odeku Street, Victoria Island',
    landmark: 'Opposite Ebeano Supermarket',
    urgency: 'tomorrow',
    budget: '₦45,000',
    budgetType: 'negotiable',
  };

  it('passes completely for valid customer job posting draft', () => {
    expect(validateCustomerJobDraft(validDraft)).toEqual({});
    expect(validateJobDraft(validDraft)).toEqual({});
  });

  it('supports both specific_service and broader_project job types', () => {
    const projectDraft: CustomerJobDraft = {
      ...validDraft,
      jobType: 'broader_project',
      category: 'not_sure',
      title: 'Full 3-Bedroom Apartment Renovation and Rewiring',
      description: 'Need electrical rewiring, bathroom plumbing replacement, and complete interior wall repainting.',
    };
    expect(validateCustomerJobDraft(projectDraft)).toEqual({});
  });

  it('allows category to be empty or "not_sure" or "unspecified"', () => {
    expect(validateCustomerJobDraft({ ...validDraft, category: undefined })).toEqual({});
    expect(validateCustomerJobDraft({ ...validDraft, category: 'not_sure' })).toEqual({});
    expect(validateCustomerJobDraft({ ...validDraft, category: '' })).toEqual({});
  });

  it('allows budget to be omitted, empty, or flexible without validation errors', () => {
    expect(validateCustomerJobDraft({ ...validDraft, budget: undefined, budgetType: undefined })).toEqual({});
    expect(validateCustomerJobDraft({ ...validDraft, budget: '', budgetType: 'unspecified' })).toEqual({});
  });

  it('allows optional preferredBrainWorker without validation errors', () => {
    expect(validateCustomerJobDraft({
      ...validDraft,
      preferredWorkerId: 'bw-1',
      preferredWorkerName: 'Engr. Emeka Nwosu',
    })).toEqual({});
  });

  it('returns actionable errors for missing required fields', () => {
    const emptyDraft: CustomerJobDraft = {
      title: '',
      description: '',
      city: '',
      streetAddress: '',
      urgency: undefined as unknown as 'urgent',
    };
    const errors = validateCustomerJobDraft(emptyDraft);
    expect(errors.jobType).toBe('Select a job type (specific service or broader project).');
    expect(errors.title).toBe('Enter a title for your job request.');
    expect(errors.description).toBe('Describe the work you need done.');
    expect(errors.city).toBe('Choose a city for your job.');
    expect(errors.streetAddress).toBe('Enter a complete street address.');
    expect(errors.urgency).toBe('Choose a schedule preference.');
  });

  it('enforces minimum length and non-whitespace on title and description', () => {
    const shortDraft: CustomerJobDraft = {
      ...validDraft,
      title: '   Fix   ',
      description: '   Too short   ',
    };
    const errors = validateCustomerJobDraft(shortDraft);
    expect(errors.title).toBe('Use at least 10 characters to describe the job.');
    expect(errors.description).toBe('Add enough detail for BrainWorkers to understand the job (at least 20 characters).');
  });

  it('enforces maximum length bounds on title, description, and landmark', () => {
    const excessiveDraft: CustomerJobDraft = {
      ...validDraft,
      title: 'A'.repeat(101),
      description: 'D'.repeat(1001),
      landmark: 'L'.repeat(101),
    };
    const errors = validateCustomerJobDraft(excessiveDraft);
    expect(errors.title).toBe('Job title must be 100 characters or less.');
    expect(errors.description).toBe('Description must be 1,000 characters or less.');
    expect(errors.landmark).toBe('Landmark must be 100 characters or less.');
  });

  it('rejects inactive or unverified cities', () => {
    const inactiveCityDraft: CustomerJobDraft = {
      ...validDraft,
      city: 'Calabar',
    };
    const errors = validateCustomerJobDraft(inactiveCityDraft);
    expect(errors.city).toContain('Please select an active marketplace city');
  });

  it('validates specific_date schedule selection', () => {
    const noDateDraft: CustomerJobDraft = {
      ...validDraft,
      urgency: 'specific_date',
      preferredDate: '',
    };
    expect(validateCustomerJobDraft(noDateDraft).preferredDate).toBe('Choose a preferred service date.');

    const invalidDateDraft: CustomerJobDraft = {
      ...validDraft,
      urgency: 'specific_date',
      preferredDate: 'not-a-date',
    };
    expect(validateCustomerJobDraft(invalidDateDraft).preferredDate).toBe('Choose a valid date.');

    const pastDateDraft: CustomerJobDraft = {
      ...validDraft,
      urgency: 'specific_date',
      preferredDate: '2020-01-01',
    };
    expect(validateCustomerJobDraft(pastDateDraft).preferredDate).toBe('Choose a date that is today or in the future.');

    // Future date passes
    const futureDateDraft: CustomerJobDraft = {
      ...validDraft,
      urgency: 'specific_date',
      preferredDate: '2099-12-31',
    };
    expect(validateCustomerJobDraft(futureDateDraft).preferredDate).toBeUndefined();
  });
});
