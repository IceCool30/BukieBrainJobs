import { expect, it, vi } from 'vitest';
import {
  ARRIVAL_WINDOW_OPTIONS,
  BUDGET_TYPE_OPTIONS,
  CANONICAL_CITIES,
  JOB_STEPS,
  JOB_STEP_TITLES,
  JOB_TYPE_OPTIONS,
  NOT_SURE_CATEGORY,
  PREFERRED_WORKERS,
  URGENCY_OPTIONS,
  createEmptyJobDraft,
  formatBudgetDisplay,
  getCategoryTitle,
  getFirstInvalidStep,
  getNextStep,
  getPreferredWorkerName,
  getPreviousStep,
  normalizeCategoryId,
  shouldSimulatePostJobFailure,
  submitJobPostingRequest,
  validateJobPosting,
  validateJobStep,
  type JobPostingDraft,
} from './job-posting';

function futureDate(daysAhead = 10): string {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function pastDate(): string {
  const date = new Date();
  date.setDate(date.getDate() - 2);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function todayString(): string {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function validDraft(overrides: Partial<JobPostingDraft> = {}): JobPostingDraft {
  return {
    ...createEmptyJobDraft(),
    jobType: 'specific_service',
    categoryId: 'generator',
    title: 'Service a 5kVA generator',
    description: 'The generator needs an oil change and an AVR check before the weekend.',
    city: 'Lagos',
    streetAddress: '14 Admiralty Way, Lekki Phase 1',
    landmark: 'Gate 2',
    urgency: 'flexible',
    preferredDate: '',
    arrivalWindow: '',
    budget: '25000',
    budgetType: 'fixed',
    ...overrides,
  };
}

function semanticallyEquivalentOmittedDrafts(): [JobPostingDraft, JobPostingDraft] {
  const common = {
    urgency: 'flexible' as const,
    budget: '',
    budgetType: 'unspecified' as const,
    arrivalWindow: '',
    preferredWorkerId: '',
  };
  return [
    validDraft({ ...common, landmark: '   ', preferredDate: pastDate() }),
    validDraft({ ...common, landmark: '', preferredDate: '' }),
  ];
}

  it('defines exact five step keys and headings', () => {
    expect(JOB_STEPS).toEqual([
      'job_requirement',
      'location',
      'schedule',
      'budget_preference',
      'review',
    ]);
    expect(JOB_STEP_TITLES).toEqual({
      job_requirement: 'Job Requirement',
      location: 'Location',
      schedule: 'Schedule',
      budget_preference: 'Budget and Optional Worker Preference',
      review: 'Review',
    });
  });

  it('creates a draft with all optional fields blank and unspecified budget type', () => {
    const draft = createEmptyJobDraft();
    expect(draft.jobType).toBe('');
    expect(draft.categoryId).toBe('');
    expect(draft.title).toBe('');
    expect(draft.description).toBe('');
    expect(draft.city).toBe('');
    expect(draft.streetAddress).toBe('');
    expect(draft.landmark).toBe('');
    expect(draft.urgency).toBe('');
    expect(draft.preferredDate).toBe('');
    expect(draft.arrivalWindow).toBe('');
    expect(draft.budget).toBe('');
    expect(draft.budgetType).toBe('unspecified');
    expect(draft.preferredWorkerId).toBe('');
  });

  it('exposes approved job type values and exact labels', () => {
    expect(JOB_TYPE_OPTIONS.map((option) => option.value)).toEqual([
      'specific_service',
      'broader_project',
    ]);
    expect(JOB_TYPE_OPTIONS.map((option) => option.label)).toEqual([
      'A specific service',
      'A broader project',
    ]);
  });

  it('exposes exact urgency labels', () => {
    expect(URGENCY_OPTIONS.map((o) => o.label)).toEqual([
      'Urgent / Today',
      'Tomorrow',
      'Flexible / Within a week',
      'Specific Date',
    ]);
  });

  it('exposes exact arrival window choices', () => {
    expect(ARRIVAL_WINDOW_OPTIONS).toEqual([
      'Morning (9:00 AM - 12:00 PM)',
      'Afternoon (1:00 PM - 4:00 PM)',
      'Evening (4:00 PM - 7:00 PM)',
      'Any time',
    ]);
  });

  it('exposes only Fixed and Negotiable budget types', () => {
    expect(BUDGET_TYPE_OPTIONS.map((o) => o.value)).toEqual(['fixed', 'negotiable']);
    expect(BUDGET_TYPE_OPTIONS.map((o) => o.label)).toEqual(['Fixed', 'Negotiable']);
  });

  it('exposes exact full seven-city canonical list', () => {
    expect(CANONICAL_CITIES).toEqual([
      'Lagos',
      'Abuja (FCT)',
      'Port Harcourt',
      'Ibadan',
      'Enugu',
      'Kano',
      'Benin City',
    ]);
  });

  it('exposes exact worker ID and name whitelist', () => {
    expect(PREFERRED_WORKERS).toHaveLength(4);
    expect(PREFERRED_WORKERS.map((w) => w.id)).toEqual(['bw-1', 'bw-2', 'bw-3', 'bw-4']);
    expect(PREFERRED_WORKERS.map((w) => w.name)).toEqual([
      'Engr. Emeka Nwosu',
      'Babatunde Adebayo',
      'Chinedu Eze',
      'Tariq Olanrewaju',
    ]);
  });

  it('derives worker name from ID only', () => {
    expect(getPreferredWorkerName('bw-1')).toBe('Engr. Emeka Nwosu');
    expect(getPreferredWorkerName('unknown')).toBe('');
  });

  it('accepts only known category identifiers or not-sure path', () => {
    expect(normalizeCategoryId('ac')).toBe('ac');
    expect(normalizeCategoryId(NOT_SURE_CATEGORY)).toBe(NOT_SURE_CATEGORY);
    expect(normalizeCategoryId('')).toBe('');
    expect(normalizeCategoryId('made-up')).toBe('');
    expect(normalizeCategoryId(undefined)).toBe('');
  });

  it('resolves honest category titles', () => {
    expect(getCategoryTitle('generator')).toBe('Generator Servicing & Repair');
    expect(getCategoryTitle(NOT_SURE_CATEGORY)).toBe("I'm not sure");
    expect(getCategoryTitle('')).toBe('General service request');
    expect(getCategoryTitle('unknown')).toBe('General service request');
  });

  it('requires job type on job_requirement step and allows not-sure category', () => {
    expect(validateJobStep('job_requirement', createEmptyJobDraft()).jobType).toBeTruthy();
    expect(
      validateJobStep('job_requirement', validDraft({ categoryId: NOT_SURE_CATEGORY })),
    ).toEqual({});
  });

  it('rejects unknown category on job_requirement step', () => {
    const errors = validateJobStep(
      'job_requirement',
      validDraft({ categoryId: 'unknown-cat' }),
    );
    expect(errors.categoryId).toBeTruthy();
  });

  it('rejects unknown city', () => {
    const draft = validDraft({ city: 'Calabar' });
    const errors = validateJobPosting(draft);
    expect(errors.city).toBeTruthy();
  });

  it('rejects unknown worker ID', () => {
    const draft = validDraft({ preferredWorkerId: 'bw-99' });
    const errors = validateJobPosting(draft);
    expect(errors.preferredWorkerId).toBeTruthy();
  });

  it('rejects unknown jobType', () => {
    const draft = validDraft({ jobType: 'invalid' as JobPostingDraft['jobType'] });
    const errors = validateJobPosting(draft);
    expect(errors.jobType).toBeTruthy();
  });

  it('rejects unknown urgency', () => {
    const draft = validDraft({ urgency: 'invalid' as JobPostingDraft['urgency'] });
    const errors = validateJobPosting(draft);
    expect(errors.urgency).toBeTruthy();
  });

  it('rejects unknown arrival window', () => {
    const draft = validDraft({ arrivalWindow: 'Midnight' });
    const errors = validateJobPosting(draft);
    expect(errors.arrivalWindow).toBeTruthy();
  });

  it('rejects unknown budget type', () => {
    const draft = validDraft({ budget: '100', budgetType: 'unspecified' });
    const errors = validateJobPosting(draft);
    expect(errors.budgetType).toBeTruthy();
  });

  it('rejects an unknown nonempty budget type even when the budget is blank', () => {
    const draft = validDraft({ budget: '', budgetType: 'mystery' as JobPostingDraft['budgetType'] });
    const errors = validateJobPosting(draft);
    expect(errors.budgetType).toBeTruthy();
  });

  it('validates trimmed title boundaries at min and max', () => {
    const tooShort = validDraft({ title: 'Short' });
    expect(validateJobPosting(tooShort).title).toBeTruthy();
    const minValid = validDraft({ title: 'A'.repeat(10) });
    expect(validateJobPosting(minValid).title).toBeUndefined();
    const maxValid = validDraft({ title: 'A'.repeat(100) });
    expect(validateJobPosting(maxValid).title).toBeUndefined();
    const tooLong = validDraft({ title: 'A'.repeat(101) });
    expect(validateJobPosting(tooLong).title).toBeTruthy();
  });

  it('validates trimmed description boundaries at min and max', () => {
    const tooShort = validDraft({ description: 'Short desc' });
    expect(validateJobPosting(tooShort).description).toBeTruthy();
    const minValid = validDraft({ description: 'A'.repeat(20) });
    expect(validateJobPosting(minValid).description).toBeUndefined();
    const maxValid = validDraft({ description: 'A'.repeat(1000) });
    expect(validateJobPosting(maxValid).description).toBeUndefined();
    const tooLong = validDraft({ description: 'A'.repeat(1001) });
    expect(validateJobPosting(tooLong).description).toBeTruthy();
    const wsTitle = validDraft({ title: '   ' });
    expect(validateJobPosting(wsTitle).title).toBeTruthy();
    const wsDesc = validDraft({ description: '   ' });
    expect(validateJobPosting(wsDesc).description).toBeTruthy();
    const trimmedValid = validDraft({ title: '  ' + 'A'.repeat(10) + '  ', description: '  ' + 'B'.repeat(20) + '  ' });
    expect(validateJobPosting(trimmedValid).title).toBeUndefined();
    expect(validateJobPosting(trimmedValid).description).toBeUndefined();
  });

  it('validates city, address, and landmark limits', () => {
    const badCity = validDraft({ city: 'Calabar' });
    expect(validateJobPosting(badCity).city).toBeTruthy();
    const shortAddr = validDraft({ streetAddress: '12' });
    expect(validateJobPosting(shortAddr).streetAddress).toBeTruthy();
    const longLandmark = validDraft({ landmark: 'A'.repeat(101) });
    expect(validateJobPosting(longLandmark).landmark).toBeTruthy();
    const okLandmark = validDraft({ landmark: 'A'.repeat(100) });
    expect(validateJobPosting(okLandmark).landmark).toBeUndefined();
  });

  it('rejects malformed budgets', () => {
    expect(validateJobPosting(validDraft({ budget: '1,000' })).budget).toBeTruthy();
    expect(validateJobPosting(validDraft({ budget: '1e5' })).budget).toBeTruthy();
    expect(validateJobPosting(validDraft({ budget: '12.345' })).budget).toBeTruthy();
    expect(validateJobPosting(validDraft({ budget: '0' })).budget).toBeTruthy();
    expect(validateJobPosting(validDraft({ budget: '-5' })).budget).toBeTruthy();
    expect(validateJobPosting(validDraft({ budget: 'abc' })).budget).toBeTruthy();
    expect(validateJobPosting(validDraft({ budget: '1-2' })).budget).toBeTruthy();
    expect(validateJobPosting(validDraft({ budget: '$50' })).budget).toBeTruthy();
    expect(validateJobPosting(validDraft({ budget: '50 NGN' })).budget).toBeTruthy();
  });

  it('accepts valid budgets with up to 2 decimals', () => {
    expect(validateJobPosting(validDraft({ budget: '25000' })).budget).toBeUndefined();
    expect(validateJobPosting(validDraft({ budget: '25000.50' })).budget).toBeUndefined();
    expect(validateJobPosting(validDraft({ budget: '0.01' })).budget).toBeUndefined();
  });

  it('accepts a large finite plain decimal budget without arbitrary cap', () => {
    expect(validateJobPosting(validDraft({ budget: '9'.repeat(100) })).budget).toBeUndefined();
  });

  it('rejects a 400-digit budget that parses to Infinity', () => {
    expect(validateJobPosting(validDraft({ budget: '9'.repeat(400) })).budget).toBeTruthy();
  });

  it('rejects rollover dates', () => {
    const draft = validDraft({ urgency: 'specific_date', preferredDate: '2026-02-30' });
    const errors = validateJobPosting(draft);
    expect(errors.preferredDate).toBeTruthy();
  });

  it('rejects non-leap-year Feb 29', () => {
    const draft = validDraft({ urgency: 'specific_date', preferredDate: '2025-02-29' });
    const errors = validateJobPosting(draft);
    expect(errors.preferredDate).toBeTruthy();
  });

  it('accepts leap-year Feb 29', () => {
    const draft = validDraft({ urgency: 'specific_date', preferredDate: '2028-02-29' });
    const errors = validateJobPosting(draft);
    expect(errors.preferredDate).toBeUndefined();
  });

  it('rejects non-ISO date format', () => {
    const draft = validDraft({ urgency: 'specific_date', preferredDate: '2028-2-29' });
    const errors = validateJobPosting(draft);
    expect(errors.preferredDate).toBeTruthy();
  });

  it('rejects past dates', () => {
    const draft = validDraft({ urgency: 'specific_date', preferredDate: pastDate() });
    const errors = validateJobPosting(draft);
    expect(errors.preferredDate).toBeTruthy();
  });

  it('accepts today and future dates', () => {
    const draft = validDraft({ urgency: 'specific_date', preferredDate: todayString() });
    const errors = validateJobPosting(draft);
    expect(errors.preferredDate).toBeUndefined();
    const future = validDraft({ urgency: 'specific_date', preferredDate: futureDate() });
    expect(validateJobPosting(future).preferredDate).toBeUndefined();
  });

  it('inactive date does not block other urgency values', () => {
    const draft = validDraft({ urgency: 'tomorrow', preferredDate: pastDate() });
    const errors = validateJobPosting(draft);
    expect(errors.urgency).toBeUndefined();
    expect(errors.preferredDate).toBeUndefined();
    const result = submitJobPostingRequest(draft);
    expect(result.ok).toBe(true);
  });

  it('revalidates after simulated local-midnight rollover', () => {
    vi.useFakeTimers();
    try {
      const fixedDate = new Date(2026, 5, 15, 23, 59, 0);
      vi.setSystemTime(fixedDate);
      const dateStr = '2026-06-15';
      const draft = validDraft({ urgency: 'specific_date', preferredDate: dateStr });
      expect(validateJobPosting(draft).preferredDate).toBeUndefined();
      // Advance past midnight
      vi.setSystemTime(new Date(2026, 5, 16, 0, 1, 0));
      expect(validateJobPosting(draft).preferredDate).toBeTruthy();
    } finally {
      vi.useRealTimers();
    }
  });

  it('validates whole draft for review', () => {
    expect(validateJobPosting(validDraft())).toEqual({});
    const errors = validateJobPosting(createEmptyJobDraft());
    expect(Object.keys(errors).length).toBeGreaterThan(3);
  });

  it('maps first invalid step correctly', () => {
    expect(getFirstInvalidStep({ title: 'Required' })).toBe('job_requirement');
    expect(getFirstInvalidStep({ city: 'Required' })).toBe('location');
    expect(getFirstInvalidStep({ budget: 'Required' })).toBe('budget_preference');
    expect(getFirstInvalidStep({ urgency: 'Required' })).toBe('schedule');
    expect(getFirstInvalidStep({ jobType: 'Required' })).toBe('job_requirement');
    expect(getFirstInvalidStep({})).toBe('review');
  });

  it('walks steps forward and backward with hard boundaries', () => {
    expect(getNextStep('job_requirement')).toBe('location');
    expect(getNextStep('schedule')).toBe('budget_preference');
    expect(getNextStep('review')).toBeNull();
    expect(getPreviousStep('job_requirement')).toBeNull();
    expect(getPreviousStep('review')).toBe('budget_preference');
  });

  it('produces a deterministic REQ reference without LOCAL prefix', () => {
    const draft = validDraft();
    const first = submitJobPostingRequest(draft);
    const second = submitJobPostingRequest(draft);
    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
    if (first.ok && second.ok) {
      expect(first.reference).toMatch(/^REQ-\d{5}$/);
      expect(first.reference).toBe(second.reference);
    }
  });

  it('semantically equivalent trimmed drafts produce same reference', () => {
    const a = validDraft({ title: '  Service a 5kVA generator  ', description: '  The generator needs an oil change.  ' });
    const b = validDraft({ title: 'Service a 5kVA generator', description: 'The generator needs an oil change.' });
    const refA = submitJobPostingRequest(a);
    const refB = submitJobPostingRequest(b);
    expect(refA.ok).toBe(true);
    expect(refB.ok).toBe(true);
    if (refA.ok && refB.ok) {
      expect(refA.reference).toBe(refB.reference);
    }
  });

  it('semantically equivalent omitted optional values produce same reference', () => {
    const [a, b] = semanticallyEquivalentOmittedDrafts();
    const refA = submitJobPostingRequest(a);
    const refB = submitJobPostingRequest(b);
    expect(refA.ok).toBe(true);
    expect(refB.ok).toBe(true);
    if (refA.ok && refB.ok) {
      expect(refA.reference).toBe(refB.reference);
    }
  });

  it('active value changes produce different reference', () => {
    const a = validDraft({ title: 'Service a 5kVA generator' });
    const b = validDraft({ title: 'Service a 10kVA generator' });
    const refA = submitJobPostingRequest(a);
    const refB = submitJobPostingRequest(b);
    expect(refA.ok).toBe(true);
    expect(refB.ok).toBe(true);
    if (refA.ok && refB.ok) {
      expect(refA.reference).not.toBe(refB.reference);
    }
  });

  it('simulated failure returns local error without mutating draft', () => {
    const draft = validDraft();
    const originalDraft = { ...draft };
    const failure = submitJobPostingRequest(draft, { mockError: true });
    expect(failure.ok).toBe(false);
    if (!failure.ok) {
      expect(failure.message).toBeTruthy();
    }
    expect(draft).toEqual(originalDraft);
  });

  it('refuses to submit an incomplete draft', () => {
    const result = submitJobPostingRequest(createEmptyJobDraft());
    expect(result.ok).toBe(false);
  });

function expectNonStringDraftFieldRejected(field: keyof ReturnType<typeof validDraft>, unsafe: unknown) {
  const draft = validDraft();
  (draft as unknown as Record<string, unknown>)[field] = unsafe;
  const beforeValidation = { ...draft };

  let errors: ReturnType<typeof validateJobPosting> | undefined;
  expect(() => {
    errors = validateJobPosting(draft);
  }).not.toThrow();
  expect(errors).toBeDefined();
  expect(errors![field]).toBeTruthy();

  const beforeSubmit = { ...draft };
  const result = submitJobPostingRequest(draft);
  expect(result.ok).toBe(false);
  expect('reference' in result).toBe(false);
  expect(draft).toEqual(beforeValidation);
  expect(draft).toEqual(beforeSubmit);
}

it('rejects non-string draft fields', () => {
  const fields = [
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
  const unsafeValues = [null, 42, { foo: 'bar' }];

  for (const field of fields) {
    for (const unsafe of unsafeValues) {
      expectNonStringDraftFieldRejected(field, unsafe);
    }
  }
});

it('simulated local preview failure returns the exact local error copy', () => {
  const result = submitJobPostingRequest(validDraft(), { mockError: true });
  expect(result.ok).toBe(false);
  if (!result.ok) {
    expect(result.message).toBe(
      'We could not create the local preview. Check your details and try again.',
    );
  }
});

it('strictly forbids simulated failures in production even with mockError query param', () => {
  expect(shouldSimulatePostJobFailure(false, '1')).toBe(false);
  expect(shouldSimulatePostJobFailure(false, ['1'])).toBe(false);
  expect(shouldSimulatePostJobFailure(false, undefined)).toBe(false);
  expect(shouldSimulatePostJobFailure(false, '0')).toBe(false);
});

it('permits simulated failure only in development environment with exact mockError=1 param', () => {
  expect(shouldSimulatePostJobFailure(true, '1')).toBe(true);
  expect(shouldSimulatePostJobFailure(true, '0')).toBe(false);
  expect(shouldSimulatePostJobFailure(true, 'true')).toBe(false);
  expect(shouldSimulatePostJobFailure(true, undefined)).toBe(false);
  expect(shouldSimulatePostJobFailure(true, ['1'])).toBe(false);
});

it('formats a fixed amount of 25000 as ₦25,000 while preserving numeric value and Negotiable behavior', () => {
  const fixedDraft = validDraft({ budget: '25000', budgetType: 'fixed' });
  expect(fixedDraft.budget).toBe('25000');
  expect(formatBudgetDisplay(fixedDraft.budget, fixedDraft.budgetType)).toBe('₦25,000 (Fixed)');

  const negotiableDraft = validDraft({ budget: '25000', budgetType: 'negotiable' });
  expect(negotiableDraft.budget).toBe('25000');
  expect(formatBudgetDisplay(negotiableDraft.budget, negotiableDraft.budgetType)).toBe('₦25,000 (Negotiable)');
});

it('does not label a numeric amount when budget type is unspecified', () => {
  const unspecifiedDraft = validDraft({ budget: '25000', budgetType: 'unspecified' });
  expect(unspecifiedDraft.budget).toBe('25000');
  expect(formatBudgetDisplay(unspecifiedDraft.budget, unspecifiedDraft.budgetType)).toBe('₦25,000');
  expect(formatBudgetDisplay(unspecifiedDraft.budget)).toBe('₦25,000');
});
