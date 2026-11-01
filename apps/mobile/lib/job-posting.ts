import {
  validateCustomerJobDraft,
  type FormErrors,
  type JobBudgetType,
  type JobScheduleUrgency,
  type JobType,
} from '@bukiebrainjobs/validation';
import { getServiceById } from './services';
import {
  buildLocalPreviewReference,
  isValidDateString,
  todayDateString,
} from './local-preview';

export const JOB_STEPS = [
  'job_requirement',
  'location',
  'schedule',
  'budget_preference',
  'review',
] as const;

export type JobStep = (typeof JOB_STEPS)[number];

export const JOB_STEP_TITLES: Record<JobStep, string> = {
  job_requirement: 'Job Requirement',
  location: 'Location',
  schedule: 'Schedule',
  budget_preference: 'Budget and Optional Worker Preference',
  review: 'Review',
};

export const NOT_SURE_CATEGORY = 'not-sure';

export const JOB_TYPE_OPTIONS: readonly { value: JobType; label: string }[] = [
  { value: 'specific_service', label: 'A specific service' },
  { value: 'broader_project', label: 'A broader project' },
];

export const URGENCY_OPTIONS: readonly {
  value: JobScheduleUrgency;
  label: string;
}[] = [
  { value: 'urgent', label: 'Urgent / Today' },
  { value: 'tomorrow', label: 'Tomorrow' },
  { value: 'flexible', label: 'Flexible / Within a week' },
  { value: 'specific_date', label: 'Specific Date' },
];

export const BUDGET_TYPE_OPTIONS: readonly {
  value: 'fixed' | 'negotiable';
  label: string;
}[] = [
  { value: 'fixed', label: 'Fixed' },
  { value: 'negotiable', label: 'Negotiable' },
];

export const ARRIVAL_WINDOW_OPTIONS = [
  'Morning (9:00 AM - 12:00 PM)',
  'Afternoon (1:00 PM - 4:00 PM)',
  'Evening (4:00 PM - 7:00 PM)',
  'Any time',
] as const;

export const CANONICAL_CITIES = [
  'Lagos',
  'Abuja (FCT)',
  'Port Harcourt',
  'Ibadan',
  'Enugu',
  'Kano',
  'Benin City',
] as const;

export const PREFERRED_WORKERS = [
  { id: 'bw-1', name: 'Engr. Emeka Nwosu' },
  { id: 'bw-2', name: 'Babatunde Adebayo' },
  { id: 'bw-3', name: 'Chinedu Eze' },
  { id: 'bw-4', name: 'Tariq Olanrewaju' },
] as const;

const JOB_TYPE_VALUES = JOB_TYPE_OPTIONS.map((option) => option.value);
const URGENCY_VALUES = URGENCY_OPTIONS.map((option) => option.value);


export type JobPostingDraft = {
  jobType: JobType | '';
  categoryId: string;
  title: string;
  description: string;
  city: string;
  streetAddress: string;
  landmark: string;
  urgency: JobScheduleUrgency | '';
  preferredDate: string;
  arrivalWindow: string;
  budget: string;
  budgetType: JobBudgetType;
  preferredWorkerId: string;
};

export type JobSubmissionResult =
  | { ok: true; reference: string; categoryTitle: string }
  | { ok: false; message: string };

export function createEmptyJobDraft(): JobPostingDraft {
  return {
    jobType: '',
    categoryId: '',
    title: '',
    description: '',
    city: '',
    streetAddress: '',
    landmark: '',
    urgency: '',
    preferredDate: '',
    arrivalWindow: '',
    budget: '',
    budgetType: 'unspecified',
    preferredWorkerId: '',
  };
}

export function normalizeCategoryId(value: unknown): string {
  if (typeof value !== 'string') {
    return '';
  }
  const candidate = value.trim();
  if (candidate === NOT_SURE_CATEGORY) {
    return NOT_SURE_CATEGORY;
  }
  return getServiceById(candidate) ? candidate : '';
}

export function getCategoryTitle(categoryId: string): string {
  const normalized = normalizeCategoryId(categoryId);
  if (normalized === NOT_SURE_CATEGORY) {
    return "I'm not sure";
  }
  if (normalized === '') {
    return 'General service request';
  }
  return getServiceById(normalized)?.title ?? 'General service request';
}

export function getPreferredWorkerName(workerId: string): string {
  return PREFERRED_WORKERS.find((worker) => worker.id === workerId)?.name ?? '';
}

function validateBudget(budget: string): string | undefined {
  const trimmed = budget.trim();
  if (!trimmed) {
    return undefined;
  }
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed) || !Number.isFinite(Number(trimmed)) || Number(trimmed) <= 0) {
    return 'Enter a valid budget amount, or leave it blank.';
  }
  return undefined;
}

export function validateJobStep(step: JobStep, draft: JobPostingDraft): FormErrors {
  const allErrors = validateJobPosting(draft);
  const stepKeys: Record<JobStep, string[]> = {
    job_requirement: ['jobType', 'categoryId', 'title', 'description'],
    location: ['city', 'streetAddress', 'landmark'],
    schedule: ['urgency', 'preferredDate', 'arrivalWindow'],
    budget_preference: ['budget', 'budgetType', 'preferredWorkerId'],
    review: [],
  };
  const allowed = new Set(stepKeys[step]);
  const filtered: FormErrors = {};
  for (const [key, value] of Object.entries(allErrors)) {
    if (allowed.has(key)) {
      filtered[key] = value;
    }
  }
  return filtered;
}

function categoryError(draft: JobPostingDraft): string | undefined {
  if (
    draft.categoryId.trim() !== '' &&
    draft.categoryId.trim() !== NOT_SURE_CATEGORY &&
    !getServiceById(draft.categoryId.trim())
  ) {
    return "Choose a service from the list, or choose I'm not sure.";
  }
  return undefined;
}

function cityError(draft: JobPostingDraft): string | undefined {
  if (draft.city.trim() !== '' && !(CANONICAL_CITIES as readonly string[]).includes(draft.city.trim())) {
    return 'Choose an active marketplace city.';
  }
  return undefined;
}

function arrivalError(draft: JobPostingDraft): string | undefined {
  if (
    draft.arrivalWindow.trim() !== '' &&
    !(ARRIVAL_WINDOW_OPTIONS as readonly string[]).includes(draft.arrivalWindow.trim())
  ) {
    return 'Choose a valid arrival window.';
  }
  return undefined;
}

function workerError(draft: JobPostingDraft): string | undefined {
  if (
    draft.preferredWorkerId.trim() !== '' &&
    !PREFERRED_WORKERS.some((worker) => worker.id === draft.preferredWorkerId.trim())
  ) {
    return 'Choose a valid preferred BrainWorker.';
  }
  return undefined;
}

function budgetTypeError(draft: JobPostingDraft): string | undefined {
  if (
    draft.budgetType !== 'fixed' &&
    draft.budgetType !== 'negotiable' &&
    draft.budgetType !== 'unspecified'
  ) {
    return 'Choose a budget type.';
  }
  if (draft.budget.trim() !== '' && draft.budgetType === 'unspecified') {
    return 'Choose a budget type.';
  }
  return undefined;
}

function nativeErrors(draft: JobPostingDraft): FormErrors {
  const errors: FormErrors = {};
  const categoryId = categoryError(draft);
  if (categoryId) errors.categoryId = categoryId;
  const city = cityError(draft);
  if (city) errors.city = city;
  const arrival = arrivalError(draft);
  if (arrival) errors.arrivalWindow = arrival;
  const worker = workerError(draft);
  if (worker) errors.preferredWorkerId = worker;
  const budget = validateBudget(draft.budget);
  if (budget) errors.budget = budget;
  const budgetType = budgetTypeError(draft);
  if (budgetType) errors.budgetType = budgetType;
  return errors;
}

function applyEnumChecks(errors: FormErrors, draft: JobPostingDraft): void {
  if (draft.jobType !== '' && !JOB_TYPE_VALUES.includes(draft.jobType as JobType)) {
    errors.jobType = 'Select a valid job type.';
  }
  if (draft.urgency !== '' && !URGENCY_VALUES.includes(draft.urgency as JobScheduleUrgency)) {
    errors.urgency = 'Choose a valid schedule preference.';
  }
}

function applyDateValidation(errors: FormErrors, draft: JobPostingDraft): void {
  if (draft.urgency === 'specific_date') {
    const preferredDate = draft.preferredDate.trim();
    if (preferredDate === '') {
      errors.preferredDate = 'Choose a preferred service date.';
    } else if (!isValidDateString(preferredDate)) {
      errors.preferredDate = 'Choose a valid date.';
    } else if (preferredDate < todayDateString()) {
      errors.preferredDate = 'Choose a date that is today or in the future.';
    }
  } else {
    delete errors.preferredDate;
  }
}

function buildSharedJobValidation(draft: JobPostingDraft) {
  return validateCustomerJobDraft({
    jobType: JOB_TYPE_VALUES.includes(draft.jobType as JobType)
      ? (draft.jobType as JobType)
      : undefined,
    category: draft.categoryId || undefined,
    title: draft.title,
    description: draft.description,
    city: draft.city,
    streetAddress: draft.streetAddress,
    landmark: draft.landmark,
    urgency: URGENCY_VALUES.includes(draft.urgency as JobScheduleUrgency)
      ? (draft.urgency as JobScheduleUrgency)
      : undefined,
    preferredDate: draft.preferredDate,
    arrivalWindow: draft.arrivalWindow,
    budget: draft.budget,
    budgetType: draft.budgetType,
    preferredWorkerId: draft.preferredWorkerId,
  });
}

const STRING_DRAFT_FIELDS = [
  'jobType',
  'categoryId',
  'title',
  'description',
  'city',
  'streetAddress',
  'landmark',
  'urgency',
  'preferredDate',
  'arrivalWindow',
  'budget',
  'budgetType',
  'preferredWorkerId',
] as const;

function runtimeTypeErrors(draft: JobPostingDraft): FormErrors {
  const errors: FormErrors = {};
  for (const field of STRING_DRAFT_FIELDS) {
    if (typeof (draft as Record<string, unknown>)[field] !== 'string') {
      errors[field] = 'Enter a valid value.';
    }
  }
  return errors;
}

export function validateJobPosting(draft: JobPostingDraft): FormErrors {
  const typeErrors = runtimeTypeErrors(draft);
  if (Object.keys(typeErrors).length > 0) {
    return typeErrors;
  }
  const errors: FormErrors = {};
  Object.assign(errors, buildSharedJobValidation(draft));
  Object.assign(errors, nativeErrors(draft));
  applyEnumChecks(errors, draft);
  if (draft.categoryId.trim() === NOT_SURE_CATEGORY) {
    delete errors.categoryId;
  }
  applyDateValidation(errors, draft);
  return errors;
}

const STEP_ERROR_KEYS: Record<JobStep, string[]> = {
  job_requirement: ['jobType', 'categoryId', 'title', 'description'],
  location: ['city', 'streetAddress', 'landmark'],
  schedule: ['urgency', 'preferredDate', 'arrivalWindow'],
  budget_preference: ['budget', 'budgetType', 'preferredWorkerId'],
  review: [],
};

export function getFirstInvalidStep(errors: FormErrors): JobStep {
  for (const step of JOB_STEPS) {
    if (STEP_ERROR_KEYS[step].some((key) => Boolean(errors[key]))) {
      return step;
    }
  }
  return 'review';
}

export function getNextStep(step: JobStep): JobStep | null {
  const index = JOB_STEPS.indexOf(step);
  return index >= 0 && index < JOB_STEPS.length - 1 ? JOB_STEPS[index + 1] : null;
}

export function getPreviousStep(step: JobStep): JobStep | null {
  const index = JOB_STEPS.indexOf(step);
  return index > 0 ? JOB_STEPS[index - 1] : null;
}

export function getStepNumber(step: JobStep): number {
  return JOB_STEPS.indexOf(step) + 1;
}

function buildRequiredDraft(draft: JobPostingDraft) {
  return {
    jobType: draft.jobType,
    categoryId: normalizeCategoryId(draft.categoryId),
    title: draft.title.trim(),
    description: draft.description.trim(),
    city: draft.city.trim(),
    streetAddress: draft.streetAddress.trim(),
    urgency: draft.urgency,
  };
}

function buildOptionalDraft(draft: JobPostingDraft) {
  return {
    ...(draft.landmark.trim() !== '' ? { landmark: draft.landmark.trim() } : {}),
    ...(draft.urgency === 'specific_date' && draft.preferredDate.trim() !== ''
      ? { preferredDate: draft.preferredDate.trim() }
      : {}),
    ...(draft.arrivalWindow.trim() !== '' ? { arrivalWindow: draft.arrivalWindow.trim() } : {}),
    ...(draft.budget.trim() !== ''
      ? { budget: draft.budget.trim(), budgetType: draft.budgetType }
      : {}),
    ...(draft.preferredWorkerId.trim() !== ''
      ? { preferredWorkerId: draft.preferredWorkerId.trim() }
      : {}),
  };
}

function buildNormalizedDraft(draft: JobPostingDraft) {
  return { ...buildRequiredDraft(draft), ...buildOptionalDraft(draft) };
}

function invalidSubmissionResult(): JobSubmissionResult {
  return {
    ok: false,
    message: 'Some job details still need attention. Review the form and try again.',
  };
}

function failedSubmissionResult(): JobSubmissionResult {
  return {
    ok: false,
    message: 'We could not create the local preview. Check your details and try again.',
  };
}

function createSubmissionResult(draft: JobPostingDraft, normalized: ReturnType<typeof buildNormalizedDraft>): JobSubmissionResult {
  return {
    ok: true,
    reference: buildLocalPreviewReference('REQ', normalized),
    categoryTitle: getCategoryTitle(normalizeCategoryId(draft.categoryId)),
  };
}

export function submitJobPostingRequest(
  draft: JobPostingDraft,
  options: { mockError?: boolean } = {},
): JobSubmissionResult {
  if (Object.keys(validateJobPosting(draft)).length > 0) {
    return invalidSubmissionResult();
  }
  if (options.mockError === true) {
    return failedSubmissionResult();
  }
  const normalized = buildNormalizedDraft(draft);
  return createSubmissionResult(draft, normalized);
}
