import { describe, expect, it, vi } from 'vitest';
import { focusFirstInvalidBookingControl, type BookingFocusField } from './booking-focus';

type BookingErrors = Partial<Record<BookingFocusField, string>>;

const targets: Record<BookingFocusField, string> = {
  serviceId: 'service-control',
  city: 'city-control',
  streetAddress: 'address-control',
  date: 'date-control',
  arrivalWindow: 'arrival-control',
  jobDescription: 'description-control',
  paymentPreference: 'payment-control',
};

describe('MOB-BOOK-FOCUS booking focus', () => {
  it('focuses the first errored field in rendered form order', () => {
    const cases: Array<{ errors: BookingErrors; field: BookingFocusField }> = [
      { errors: { serviceId: 'required', city: 'required' }, field: 'serviceId' },
      { errors: { city: 'required', streetAddress: 'required' }, field: 'city' },
      { errors: { streetAddress: 'required', date: 'required' }, field: 'streetAddress' },
      { errors: { date: 'required', arrivalWindow: 'required' }, field: 'date' },
      { errors: { arrivalWindow: 'required', jobDescription: 'required' }, field: 'arrivalWindow' },
      { errors: { jobDescription: 'required', paymentPreference: 'required' }, field: 'jobDescription' },
      { errors: { paymentPreference: 'required' }, field: 'paymentPreference' },
    ];

    for (const { errors, field } of cases) {
      const focus = vi.fn();
      expect(focusFirstInvalidBookingControl(errors, targets, focus)).toBe(field);
      expect(focus).toHaveBeenCalledWith(targets[field]);
    }
  });

  it('does not move focus when there are no validation errors', () => {
    const focus = vi.fn();

    expect(focusFirstInvalidBookingControl({}, targets, focus)).toBeUndefined();
    expect(focus).not.toHaveBeenCalled();
  });
});
