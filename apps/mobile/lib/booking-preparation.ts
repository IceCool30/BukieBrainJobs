import {
  getPrototypeSubmissionOutcome,
  isActiveMarketplaceCity,
  validateBookingDraft,
  type FormErrors,
} from '@bukiebrainjobs/validation';
import { getServiceById } from './services';
import {
  buildLocalPreviewReference,
  isValidDateString,
  todayDateString,
} from './local-preview';

export const ARRIVAL_WINDOWS = ['Morning', 'Afternoon', 'Evening'] as const;

export type ArrivalWindow = (typeof ARRIVAL_WINDOWS)[number];

export const PAYMENT_PREFERENCES = ['Card', 'Bank transfer', 'USSD'] as const;

export type PaymentPreference = (typeof PAYMENT_PREFERENCES)[number];

export type BookingPreparationDraft = {
  serviceId: string;
  city: string;
  streetAddress: string;
  landmark: string;
  preferredDate: string;
  arrivalWindow: string;
  jobDescription: string;
  paymentPreference: string;
};

export type BookingPreparationErrors = FormErrors;

export type BookingSubmissionResult =
  | { ok: true; reference: string; serviceTitle: string }
  | { ok: false; message: string };

export function createEmptyBookingDraft(serviceId = ''): BookingPreparationDraft {
  return {
    serviceId: normalizeServiceId(serviceId),
    city: '',
    streetAddress: '',
    landmark: '',
    preferredDate: '',
    arrivalWindow: '',
    jobDescription: '',
    paymentPreference: '',
  };
}

/**
 * Route parameters are untrusted. Anything that does not match a catalog id is
 * discarded so an invalid link cannot preselect an invented service.
 */
export function normalizeServiceId(value: unknown): string {
  if (typeof value !== 'string') {
    return '';
  }
  const candidate = value.trim();
  return getServiceById(candidate) ? candidate : '';
}

function isArrivalWindow(value: string): value is ArrivalWindow {
  return (ARRIVAL_WINDOWS as readonly string[]).includes(value);
}

function isPaymentPreference(value: string): value is PaymentPreference {
  return (PAYMENT_PREFERENCES as readonly string[]).includes(value);
}

export function validateBookingPreparation(
  draft: BookingPreparationDraft
): BookingPreparationErrors {
  const shared = validateBookingDraft({
    city: draft.city,
    streetAddress: draft.streetAddress,
    landmark: draft.landmark,
    jobDescription: draft.jobDescription,
    date: draft.preferredDate,
    arrivalWindow: draft.arrivalWindow,
    paymentPreference: draft.paymentPreference,
  });

  const errors: BookingPreparationErrors = { ...shared };

  if (!normalizeServiceId(draft.serviceId)) {
    errors.serviceId = 'Choose the service you need.';
  }

  if (draft.city.trim() && !isActiveMarketplaceCity(draft.city)) {
    errors.city = 'Choose an active marketplace city.';
  }

  if (draft.preferredDate.trim() && !isValidDateString(draft.preferredDate)) {
    errors.date = 'Choose a valid date.';
  } else if (
    draft.preferredDate.trim() &&
    draft.preferredDate.trim() < todayDateString()
  ) {
    errors.date = 'Choose a date that is today or in the future.';
  }

  if (!isArrivalWindow(draft.arrivalWindow)) {
    errors.arrivalWindow = 'Choose a preferred arrival window.';
  }

  if (!isPaymentPreference(draft.paymentPreference)) {
    errors.paymentPreference = 'Choose a preferred payment method.';
  }

  return errors;
}

export function submitBookingPreparationRequest(
  draft: BookingPreparationDraft,
  options: { mockError?: boolean } = {}
): BookingSubmissionResult {
  if (Object.keys(validateBookingPreparation(draft)).length > 0) {
    return {
      ok: false,
      message: 'Some booking details still need attention. Review the form and try again.',
    };
  }

  const service = getServiceById(normalizeServiceId(draft.serviceId));
  if (!service) {
    return {
      ok: false,
      message: 'Some booking details still need attention. Review the form and try again.',
    };
  }

  const outcome = getPrototypeSubmissionOutcome({
    mockError: options.mockError === true,
    online: true,
  });

  if (outcome === 'error') {
    return {
      ok: false,
      message:
        'The booking request could not be prepared on this device. Check your details and try again.',
    };
  }

  const normalized = {
    serviceId: service.id,
    city: draft.city.trim(),
    streetAddress: draft.streetAddress.trim(),
    landmark: draft.landmark.trim(),
    preferredDate: draft.preferredDate.trim(),
    arrivalWindow: draft.arrivalWindow,
    jobDescription: draft.jobDescription.trim(),
    paymentPreference: draft.paymentPreference,
  };

  return {
    ok: true,
    reference: buildLocalPreviewReference('BKG', normalized),
    serviceTitle: service.title,
  };
}
