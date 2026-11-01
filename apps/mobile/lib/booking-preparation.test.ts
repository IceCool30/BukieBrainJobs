import { describe, expect, it } from 'vitest';
import {
  ARRIVAL_WINDOWS,
  PAYMENT_PREFERENCES,
  createEmptyBookingDraft,
  normalizeServiceId,
  submitBookingPreparationRequest,
  validateBookingPreparation,
  type BookingPreparationDraft,
} from './booking-preparation';

function futureDate(daysAhead = 14): string {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function pastDate(): string {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function validDraft(overrides: Partial<BookingPreparationDraft> = {}): BookingPreparationDraft {
  return {
    ...createEmptyBookingDraft('generator'),
    city: 'Lagos',
    streetAddress: '14 Admiralty Way, Lekki Phase 1',
    landmark: 'Opposite the estate gate',
    preferredDate: futureDate(),
    arrivalWindow: ARRIVAL_WINDOWS[0],
    jobDescription: 'The generator starts roughly once a week and needs a full service.',
    paymentPreference: PAYMENT_PREFERENCES[0],
    ...overrides,
  };
}

describe('MOB-BOOK-001 native booking preparation domain', () => {
  it('creates an empty draft with the requested catalog service preselected', () => {
    const draft = createEmptyBookingDraft('plumbing');

    expect(draft.serviceId).toBe('plumbing');
    expect(draft.city).toBe('');
    expect(draft.streetAddress).toBe('');
    expect(draft.preferredDate).toBe('');
    expect(draft.jobDescription).toBe('');
  });

  it('accepts only known catalog service identifiers', () => {
    expect(normalizeServiceId('generator')).toBe('generator');
    expect(normalizeServiceId('  ac  ')).toBe('ac');
    expect(normalizeServiceId('unknown-service')).toBe('');
    expect(normalizeServiceId('../etc/passwd')).toBe('');
    expect(normalizeServiceId(42)).toBe('');
    expect(normalizeServiceId(null)).toBe('');
  });

  it('reports every required field on an empty draft', () => {
    const errors = validateBookingPreparation(createEmptyBookingDraft());

    expect(errors.serviceId).toBe('Choose the service you need.');
    expect(errors.city).toBeTruthy();
    expect(errors.streetAddress).toBeTruthy();
    expect(errors.date).toBeTruthy();
    expect(errors.arrivalWindow).toBeTruthy();
    expect(errors.paymentPreference).toBeTruthy();
    expect(errors.jobDescription).toBeTruthy();
    expect(Object.keys(errors)).toHaveLength(7);
  });

  it('accepts a complete draft with an active service and future date', () => {
    expect(validateBookingPreparation(validDraft())).toEqual({});
  });

  it('uses only WEB-007 arrival windows', () => {
    expect(ARRIVAL_WINDOWS).toEqual(['Morning', 'Afternoon', 'Evening']);
  });

  it('rejects a city outside the active marketplace list', () => {
    expect(validateBookingPreparation(validDraft({ city: 'Springfield' })).city).toBeTruthy();
  });

  it('rejects a service date in the past', () => {
    const errors = validateBookingPreparation(validDraft({ preferredDate: pastDate() }));

    expect(errors.date).toBe('Choose a date that is today or in the future.');
  });

  it('rejects a short street address and a short description', () => {
    const errors = validateBookingPreparation(
      validDraft({ streetAddress: '12', jobDescription: 'Too short' }),
    );

    expect(errors.streetAddress).toBe('Enter a complete street address.');
    expect(errors.jobDescription).toBe('Add a few details about the work you need done.');
  });

  it('rejects arrival windows and payment choices outside the approved options', () => {
    const errors = validateBookingPreparation(
      validDraft({ arrivalWindow: 'Midnight', paymentPreference: 'Cash on delivery' }),
    );

    expect(errors.arrivalWindow).toBeTruthy();
    expect(errors.paymentPreference).toBeTruthy();
  });

  it('builds a deterministic local preview reference for the same draft', () => {
    const draft = validDraft();
    const first = submitBookingPreparationRequest(draft);
    const second = submitBookingPreparationRequest(draft);

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
    if (first.ok && second.ok) {
      expect(first.reference).toMatch(/^BKG-\d{5}$/);
      expect(first.reference).toBe(second.reference);
      expect(first.serviceTitle).toBe('Generator Servicing & Repair');
    }
  });

  it('changes the reference when the draft changes', () => {
    const first = submitBookingPreparationRequest(validDraft());
    const second = submitBookingPreparationRequest(validDraft({ city: 'Abuja' }));

    expect(first.ok && second.ok).toBe(true);
    if (first.ok && second.ok) {
      expect(first.reference).not.toBe(second.reference);
    }
  });

  it('returns a failure outcome when the preview error trigger is set', () => {
    const result = submitBookingPreparationRequest(validDraft(), { mockError: true });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toContain('could not be prepared');
    }
  });

  it('refuses to submit an invalid draft', () => {
    const result = submitBookingPreparationRequest(createEmptyBookingDraft());

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toContain('need attention');
    }
  });
});
