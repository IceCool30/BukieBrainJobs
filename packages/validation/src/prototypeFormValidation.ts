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
export type JobType = 'specific_service' | 'broader_project';
export type JobScheduleUrgency = 'urgent' | 'tomorrow' | 'flexible' | 'specific_date';
export type JobArrivalWindow = 'morning' | 'afternoon' | 'evening' | 'anytime' | string;
export type JobBudgetType = 'fixed' | 'negotiable' | 'unspecified';

export interface CustomerJobDraft {
  jobType?: JobType | undefined;
  category?: string | undefined;
  title?: string | undefined;
  description?: string | undefined;
  city?: string | undefined;
  streetAddress?: string | undefined;
  landmark?: string | undefined;
  urgency?: JobScheduleUrgency | undefined;
  preferredDate?: string | undefined;
  arrivalWindow?: JobArrivalWindow | undefined;
  budget?: string | undefined;
  budgetType?: JobBudgetType | undefined;
  preferredWorkerId?: string | undefined;
  preferredWorkerName?: string | undefined;
}

export const ACTIVE_MARKETPLACE_CITIES = [
  'lagos',
  'abuja',
  'abuja (fct)',
  'port harcourt',
  'ibadan',
  'enugu',
  'kano',
  'benin city',
  'benin',
] as const;

export function isActiveMarketplaceCity(city: string): boolean {
  if (!city || typeof city !== 'string') return false;
  const normalized = city.trim().toLowerCase();
  return ACTIVE_MARKETPLACE_CITIES.some(
    (c) => c === normalized || normalized.includes(c) || c.includes(normalized),
  );
}

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

export function validateCustomerJobDraft(draft: CustomerJobDraft): FormErrors {
  const errors: FormErrors = {};

  if (!draft.jobType || (draft.jobType !== 'specific_service' && draft.jobType !== 'broader_project')) {
    errors.jobType = 'Select a job type (specific service or broader project).';
  }

  const title = draft.title ?? '';
  if (!hasText(title)) {
    errors.title = 'Enter a title for your job request.';
  } else if (title.trim().length < 10) {
    errors.title = 'Use at least 10 characters to describe the job.';
  } else if (title.trim().length > 100) {
    errors.title = 'Job title must be 100 characters or less.';
  }

  const description = draft.description ?? '';
  if (!hasText(description)) {
    errors.description = 'Describe the work you need done.';
  } else if (description.trim().length < 20) {
    errors.description = 'Add enough detail for BrainWorkers to understand the job (at least 20 characters).';
  } else if (description.trim().length > 1000) {
    errors.description = 'Description must be 1,000 characters or less.';
  }

  const city = draft.city ?? '';
  if (!hasText(city)) {
    errors.city = 'Choose a city for your job.';
  } else if (!isActiveMarketplaceCity(city)) {
    errors.city = 'Please select an active marketplace city (e.g. Lagos, Abuja, Port Harcourt, Ibadan, Enugu, Kano, Benin City).';
  }

  const streetAddress = draft.streetAddress ?? '';
  if (!hasText(streetAddress, 5)) {
    errors.streetAddress = 'Enter a complete street address.';
  }

  if (draft.landmark && draft.landmark.trim().length > 100) {
    errors.landmark = 'Landmark must be 100 characters or less.';
  }

  const urgency = draft.urgency;
  if (!urgency || !['urgent', 'tomorrow', 'flexible', 'specific_date'].includes(urgency)) {
    errors.urgency = 'Choose a schedule preference.';
  } else if (urgency === 'specific_date') {
    const preferredDate = draft.preferredDate ?? '';
    if (!hasText(preferredDate)) {
      errors.preferredDate = 'Choose a preferred service date.';
    } else {
      const trimmedDate = preferredDate.trim();
      if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmedDate)) {
        errors.preferredDate = 'Choose a valid date.';
      } else {
        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        if (trimmedDate < todayStr) {
          errors.preferredDate = 'Choose a date that is today or in the future.';
        }
      }
    }
  }

  return errors;
}

export const validateJobDraft = validateCustomerJobDraft;

export function validateBrainWorkerDraft(draft: BrainWorkerDraft): FormErrors {
  const errors: FormErrors = {};
  if (!hasText(draft.city)) errors.city = 'Choose the city where you work.';
  if (draft.fullName.trim().split(/\s+/).length < 2) errors.fullName = 'Enter your full name.';
  if (!/^\+234[789]\d{9}$/.test(draft.phone.replace(/\s/g, ''))) errors.phone = 'Enter a valid Nigerian phone number, such as +234 801 234 5678.';
  if (!hasText(draft.service)) errors.service = 'Choose the service you offer.';
  return errors;
}

export interface NormalizedPhoneResult {
  valid: boolean;
  normalized: string;
  formatted: string;
  masked: string;
  error?: string | undefined;
}

export function normalizeNigerianPhone(input: string): NormalizedPhoneResult {
  if (!input || typeof input !== 'string') {
    return {
      valid: false,
      normalized: '',
      formatted: '',
      masked: '',
      error: 'Enter your phone number.',
    };
  }

  const cleaned = input.trim().replace(/[\s\-().]/g, '');
  let national10 = '';

  if (cleaned.startsWith('+234')) {
    national10 = cleaned.slice(4);
  } else if (cleaned.startsWith('234')) {
    national10 = cleaned.slice(3);
  } else if (cleaned.startsWith('0')) {
    national10 = cleaned.slice(1);
  } else if (cleaned.length === 10 && /^[789]\d{9}$/.test(cleaned)) {
    national10 = cleaned;
  }

  if (!/^[789]\d{9}$/.test(national10)) {
    return {
      valid: false,
      normalized: '',
      formatted: '',
      masked: '',
      error: 'Enter a valid Nigerian phone number (e.g. 08012345678 or +2348012345678).',
    };
  }

  const normalized = `+234${national10}`;
  const prefix = national10.slice(0, 3);
  const mid = national10.slice(3, 6);
  const end = national10.slice(6);
  const formatted = `+234 ${prefix} ${mid} ${end}`;
  const masked = `+234 ${prefix} ••• ••${end.slice(2)}`;

  return {
    valid: true,
    normalized,
    formatted,
    masked,
  };
}

export function validatePhoneOtp(otp: string): { valid: boolean; error?: string | undefined } {
  if (!otp || typeof otp !== 'string') {
    return { valid: false, error: 'Enter the 6-digit code sent to your phone.' };
  }
  const trimmed = otp.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: 'Enter the 6-digit code sent to your phone.' };
  }
  if (!/^\d+$/.test(trimmed)) {
    return { valid: false, error: 'The verification code must contain 6 numbers.' };
  }
  if (trimmed.length !== 6) {
    return { valid: false, error: 'Enter the 6-digit code sent to your phone.' };
  }
  return { valid: true };
}

export function validateEmailAddress(email: string): { valid: boolean; error?: string | undefined } {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Enter your email address.' };
  }
  const trimmed = email.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: 'Enter your email address.' };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return { valid: false, error: 'Enter a valid email address.' };
  }
  return { valid: true };
}

export function validatePassword(password: string): { valid: boolean; error?: string | undefined } {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Enter your password.' };
  }
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters long.' };
  }
  return { valid: true };
}

export function validateReturnDestination(url?: string | null | undefined): string {
  if (!url || typeof url !== 'string') {
    return '/';
  }
  const trimmed = url.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.includes('\\')) {
    return '/';
  }
  return trimmed;
}

export function validateRoleSelection(role?: string | null | undefined): {
  valid: boolean;
  role?: 'customer' | 'brainworker' | undefined;
  error?: string | undefined;
} {
  if (role === 'customer' || role === 'brainworker') {
    return { valid: true, role };
  }
  return {
    valid: false,
    error: 'Please select whether you are a Customer or BrainWorker.',
  };
}

