import {
  NIGERIAN_LOCATIONS,
  SERVICE_CATEGORIES,
  ServiceCategory,
} from '../mock/homepage-data';

export const DATE_OPTIONS = ['Today', 'Tomorrow', 'This Weekend', 'Specific Date'] as const;
export type DateOption = (typeof DATE_OPTIONS)[number];

export const TIME_OPTIONS = [
  'Morning (9:00 AM - 12:00 PM)',
  'Afternoon (1:00 PM - 4:00 PM)',
  'Evening (4:00 PM - 7:00 PM)',
] as const;
export type TimeOption = (typeof TIME_OPTIONS)[number];

export const PAYMENT_PREFERENCES = ['card', 'transfer', 'ussd'] as const;
export type PaymentPreference = (typeof PAYMENT_PREFERENCES)[number];

export interface BookingContext {
  serviceStatus: 'valid' | 'missing' | 'invalid';
  service?: ServiceCategory | undefined;
  rawService?: string | undefined;
  cityStatus: 'valid' | 'missing' | 'invalid' | 'inactive';
  city?: string | undefined;
  requestedCity?: string | undefined;
  price: string;
  worker: string | null;
  note: string;
  mockError: boolean;
}

/**
 * Validates whether a booking date is non-empty, recognized, and not in the past.
 */
export function isValidBookingDate(dateStr: string): boolean {
  if (!dateStr || typeof dateStr !== 'string') return false;
  const trimmed = dateStr.trim();
  if (trimmed === 'Today' || trimmed === 'Tomorrow' || trimmed === 'This Weekend') {
    return true;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    return trimmed >= todayStr;
  }
  return false;
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
 * Resolves and normalizes booking preparation context from URL query parameters.
 * Guarantees safe fallback without inventing artificial services, workers, or prices.
 */
export function resolveBookingContext(query: QuerySource): BookingContext {
  const rawService = getParam(query, 'service');
  const rawCity = getParam(query, 'city');
  const rawPrice = getParam(query, 'price');
  const rawWorker = getParam(query, 'worker');
  const rawNote = getParam(query, 'note');
  const rawMockError = getParam(query, 'mockError');

  // Service resolution
  let serviceStatus: 'valid' | 'missing' | 'invalid' = 'missing';
  let resolvedService: ServiceCategory | undefined;

  if (rawService) {
    const normalizedQuery = rawService.toLowerCase();
    resolvedService = SERVICE_CATEGORIES.find(
      (cat) =>
        cat.id.toLowerCase() === normalizedQuery ||
        cat.title.toLowerCase() === normalizedQuery,
    );
    serviceStatus = resolvedService ? 'valid' : 'invalid';
  }

  // City resolution
  let cityStatus: 'valid' | 'missing' | 'invalid' | 'inactive' = 'missing';
  let resolvedCity: string | undefined;

  if (rawCity) {
    const normalizedCity = rawCity.toLowerCase();
    const matchedLocation = NIGERIAN_LOCATIONS.find(
      (loc) => loc.name.toLowerCase() === normalizedCity,
    );
    if (matchedLocation) {
      if (matchedLocation.status === 'active') {
        cityStatus = 'valid';
        resolvedCity = matchedLocation.name;
      } else {
        cityStatus = 'inactive';
      }
    } else {
      cityStatus = 'invalid';
    }
  }

  // Price resolution
  const resolvedPrice =
    rawPrice && rawPrice.slice(0, 30)
      ? rawPrice.slice(0, 30)
      : resolvedService?.startingPrice || '₦10,000';

  // Worker context
  const resolvedWorker = rawWorker ? rawWorker.slice(0, 100) : null;

  // Job note context
  const resolvedNote = rawNote ? rawNote.slice(0, 500) : '';

  // Mock error flag
  const mockError = rawMockError === '1';

  return {
    serviceStatus,
    service: resolvedService,
    rawService,
    cityStatus,
    city: resolvedCity,
    requestedCity: rawCity,
    price: resolvedPrice,
    worker: resolvedWorker,
    note: resolvedNote,
    mockError,
  };
}

/**
 * Builds the canonical return-to-services URL, preserving service category and active city if available.
 */
export function buildBookingReturnUrl(options?: {
  service?: ServiceCategory | undefined;
  city?: string | undefined;
}): string {
  const params = new URLSearchParams();
  if (options?.service?.id) {
    params.set('category', options.service.id);
  }
  if (options?.city) {
    params.set('city', options.city);
  }
  const queryString = params.toString();
  return queryString ? `/services?${queryString}` : '/services';
}
