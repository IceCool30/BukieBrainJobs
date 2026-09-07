import {
  NIGERIAN_LOCATIONS,
  SERVICE_CATEGORIES,
  MOCK_BRAINWORKERS,
  ServiceCategory,
  BrainWorker,
} from '../mock/homepage-data';

export const JOB_TYPES = ['specific_service', 'broader_project'] as const;
export type JobType = (typeof JOB_TYPES)[number];

export const SCHEDULE_OPTIONS = [
  'Urgent / Today',
  'Tomorrow',
  'Flexible / Within a week',
  'Specific Date',
] as const;
export type ScheduleOption = (typeof SCHEDULE_OPTIONS)[number];

export const ARRIVAL_WINDOWS = [
  'Morning (9:00 AM - 12:00 PM)',
  'Afternoon (1:00 PM - 4:00 PM)',
  'Evening (4:00 PM - 7:00 PM)',
  'Any time',
] as const;
export type ArrivalWindow = (typeof ARRIVAL_WINDOWS)[number];

export const BUDGET_TYPES = ['fixed', 'negotiable'] as const;
export type BudgetType = (typeof BUDGET_TYPES)[number];

export interface JobPostingContext {
  category?: ServiceCategory | undefined;
  categoryId?: string | undefined;
  rawCategory?: string | undefined;
  city?: string | undefined;
  rawCity?: string | undefined;
  isCityActive: boolean;
  worker?: BrainWorker | undefined;
  workerId?: string | undefined;
  jobType: JobType;
  title?: string | undefined;
  description?: string | undefined;
  mockError: boolean;
}

export function isValidSpecificDate(dateStr: string): boolean {
  if (!dateStr || typeof dateStr !== 'string') return false;
  const trimmed = dateStr.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    return trimmed >= todayStr;
  }
  return false;
}

export function generateJobReference(): string {
  const code = Math.floor(10000 + Math.random() * 90000);
  return `REQ-${code}`;
}

type QuerySource =
  | URLSearchParams
  | { get: (key: string) => string | null }
  | Record<string, string | string[] | undefined>;

function getParam(source: QuerySource, key: string): string | undefined {
  if ('get' in source && typeof source.get === 'function') {
    const val = source.get(key);
    return typeof val === 'string' && val.trim() ? val.trim() : undefined;
  }
  const obj = source as Record<string, string | string[] | undefined>;
  const raw = obj[key];
  if (Array.isArray(raw)) {
    return raw[0]?.trim() || undefined;
  }
  return typeof raw === 'string' && raw.trim() ? raw.trim() : undefined;
}

/**
 * Resolves context safely from query parameters for /post-job.
 * Treats all query parameters as untrusted input.
 */
export function resolveJobPostingContext(query: QuerySource): JobPostingContext {
  const rawCategory = getParam(query, 'category') || getParam(query, 'service') || getParam(query, 'serviceId');
  const rawCity = getParam(query, 'city');
  const rawWorker = getParam(query, 'worker') || getParam(query, 'workerId');
  const rawJobType = getParam(query, 'jobType') || getParam(query, 'type');
  const rawTitle = getParam(query, 'title');
  const rawDescription = getParam(query, 'description') || getParam(query, 'desc');
  const rawMockError = getParam(query, 'mockError');

  // Job Type resolution
  let jobType: JobType = 'specific_service';
  if (rawJobType === 'broader_project') {
    jobType = 'broader_project';
  }

  // Category resolution
  let category: ServiceCategory | undefined;
  let categoryId: string | undefined;

  if (rawCategory) {
    const normalized = rawCategory.toLowerCase();
    if (normalized === 'not_sure' || normalized === "i'm not sure" || normalized === 'im_not_sure') {
      categoryId = 'not_sure';
    } else {
      category = SERVICE_CATEGORIES.find(
        (cat) =>
          cat.id.toLowerCase() === normalized ||
          cat.title.toLowerCase() === normalized,
      );
      if (category) {
        categoryId = category.id;
      }
    }
  }

  // City resolution
  let city: string | undefined;
  let isCityActive = true;

  if (rawCity) {
    const normalizedCity = rawCity.toLowerCase();
    const matched = NIGERIAN_LOCATIONS.find(
      (loc) =>
        loc.name.toLowerCase() === normalizedCity ||
        loc.id.toLowerCase() === normalizedCity,
    );

    if (matched) {
      city = matched.name;
      isCityActive = matched.status === 'active';
    } else {
      city = rawCity;
      isCityActive = false;
    }
  }

  // Worker resolution (optional preference)
  let worker: BrainWorker | undefined;
  let workerId: string | undefined;

  if (rawWorker) {
    const normalizedWorker = rawWorker.toLowerCase();
    worker = MOCK_BRAINWORKERS.find(
      (w) =>
        w.id.toLowerCase() === normalizedWorker ||
        w.name.toLowerCase().includes(normalizedWorker),
    );
    if (worker) {
      workerId = worker.id;
    }
  }

  return {
    category,
    categoryId,
    rawCategory,
    city,
    rawCity,
    isCityActive,
    worker,
    workerId,
    jobType,
    title: rawTitle,
    description: rawDescription,
    mockError: rawMockError === '1' || rawMockError === 'true',
  };
}

export function buildPostJobReturnUrl(params: {
  category?: string | undefined;
  city?: string | undefined;
  worker?: string | undefined;
  jobContinuation?: boolean | undefined;
}): string {
  const search = new URLSearchParams();
  if (params.category) search.set('category', params.category);
  if (params.city) search.set('city', params.city);
  if (params.worker) search.set('worker', params.worker);
  if (params.jobContinuation) search.set('jobContinuation', '1');

  const query = search.toString();
  return query ? `/post-job?${query}` : '/post-job';
}
