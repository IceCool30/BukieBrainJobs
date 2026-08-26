export type FormErrors = Record<string, string>;

type BookingDraft = { address: string; city: string; notes: string };
type PostJobDraft = { budget: string; city: string; description: string; title: string };
type BrainWorkerDraft = { city: string; fullName: string; phone: string; service: string };

const hasText = (value: string, minimum = 1) => value.trim().length >= minimum;

export function getPrototypeSubmissionOutcome({ mockError, online }: { mockError: boolean; online: boolean }) {
  return mockError || !online ? 'error' : 'success';
}

export function validateBookingDraft(draft: BookingDraft): FormErrors {
  const errors: FormErrors = {};
  if (!hasText(draft.address, 5)) errors.address = 'Enter a complete street address.';
  if (!hasText(draft.city)) errors.city = 'Choose a location for the job.';
  if (!hasText(draft.notes, 20)) errors.notes = 'Add a few details about the work you need done.';
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
