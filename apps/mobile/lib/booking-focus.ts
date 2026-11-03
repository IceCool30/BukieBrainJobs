export type BookingFocusField =
  | 'serviceId'
  | 'city'
  | 'streetAddress'
  | 'date'
  | 'arrivalWindow'
  | 'jobDescription'
  | 'paymentPreference';

const FIELD_ORDER: readonly BookingFocusField[] = [
  'serviceId',
  'city',
  'streetAddress',
  'date',
  'arrivalWindow',
  'jobDescription',
  'paymentPreference',
];

export function focusFirstInvalidBookingControl<T extends Record<BookingFocusField, unknown>>(
  errors: Partial<Record<BookingFocusField, string | undefined>>,
  targets: T,
  focus: (target: T[BookingFocusField]) => void,
): BookingFocusField | undefined {
  for (const field of FIELD_ORDER) {
    if (errors[field]) {
      focus(targets[field]);
      return field;
    }
  }
  return undefined;
}
