export type FormErrors = Record<string, string>;

export type BookingDraft = {
  address?: string;
  streetAddress?: string;
  city: string;
  notes?: string;
  jobDescription?: string;
  date?: string;
  arrivalWindow?: string;
  paymentPreference?: string;
  landmark?: string;
  service?: string;
};
type PostJobDraft = { budget: string; city: string; description: string; title: string };
type BrainWorkerDraft = { city: string; fullName: string; phone: string; service: string };

const hasText = (value: string, minimum = 1) => value.trim().length >= minimum;

export function getPrototypeSubmissionOutcome({ mockError, online }: { mockError: boolean; online: boolean }) {
  return mockError || !online ? 'error' : 'success';
}

export function validateBookingDraft(draft: BookingDraft): FormErrors {
  const errors: FormErrors = {};
  const address = draft.streetAddress ?? draft.address ?? '';
  if (!hasText(address, 5)) {
    if (draft.streetAddress !== undefined) {
      errors.streetAddress = 'Enter a complete street address.';
    }
    if (draft.address !== undefined || draft.streetAddress === undefined) {
      errors.address = 'Enter a complete street address.';
    }
  }

  if (!hasText(draft.city)) {
    errors.city = 'Choose a location for the job.';
  }

  const notes = draft.jobDescription ?? draft.notes ?? '';
  if (!hasText(notes, 20)) {
    if (draft.jobDescription !== undefined) {
      errors.jobDescription = 'Add a few details about the work you need done.';
    }
    if (draft.notes !== undefined || draft.jobDescription === undefined) {
      errors.notes = 'Add a few details about the work you need done.';
    }
  }

  if (draft.date !== undefined) {
    if (!hasText(draft.date)) {
      errors.date = 'Choose a preferred service date.';
    } else {
      const trimmedDate = draft.date.trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(trimmedDate)) {
        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        if (trimmedDate < todayStr) {
          errors.date = 'Choose a date that is today or in the future.';
        }
      }
    }
  }

  if (draft.arrivalWindow !== undefined && !hasText(draft.arrivalWindow)) {
    errors.arrivalWindow = 'Choose a preferred arrival window.';
  }

  if (draft.paymentPreference !== undefined && !hasText(draft.paymentPreference)) {
    errors.paymentPreference = 'Choose a preferred payment method.';
  }

  return errors;
}

export function validatePostJobDraft(draft: PostJobDraft): FormErrors {
  const errors: FormErrors = {};
  if (!hasText(draft.budget)) errors.budget = 'Add the budget range you have in mind.';
  if (!hasText(draft.city)) errors.city = 'Choose the job location.';
  if (!hasText(draft.description, 20)) errors.description = 'Add enough detail for a BrainWorker to understand the job.';
  if (!hasText(draft.title, 10)) errors.title = 'Use at least 10 characters to describe the job.';
  return errors;
}

export function validateBrainWorkerDraft(draft: BrainWorkerDraft): FormErrors {
  const errors: FormErrors = {};
  if (!hasText(draft.city)) errors.city = 'Choose the city where you work.';
  if (draft.fullName.trim().split(/\s+/).length < 2) errors.fullName = 'Enter your full name.';
  if (!/^\+234[789]\d{9}$/.test(draft.phone.replace(/\s/g, ''))) errors.phone = 'Enter a valid Nigerian phone number, such as +234 801 234 5678.';
  if (!hasText(draft.service)) errors.service = 'Choose the service you offer.';
  return errors;
}
