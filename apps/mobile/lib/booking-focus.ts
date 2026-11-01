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

export function focusFirstInvalidBookingControl<Target>(
  errors: Partial<Record<BookingFocusField, string | undefined>>,
  targets: Record<BookingFocusField, Target>,
  focus: (target: Target) => void,
): BookingFocusField | undefined {
  for (const field of FIELD_ORDER) {
    if (errors[field]) {
      focus(targets[field]);
      return field;
    }
  }
  return undefined;
}
