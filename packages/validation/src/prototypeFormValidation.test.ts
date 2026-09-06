import { describe, expect, it } from 'vitest';
import {
  validateBookingDraft,
  validateBrainWorkerDraft,
  validatePostJobDraft,
  getPrototypeSubmissionOutcome,
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
