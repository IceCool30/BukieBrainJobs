// apps/web/lib/services/index.ts
// Phase 1 Mock Services (AGENTS.md Phase 1 Mock Boundary)

import {
  NIGERIAN_LOCATIONS,
  SERVICE_CATEGORIES,
  ServiceCategory,
} from '../mock/homepage-data';

/**
 * Maximum accepted search query length.
 * Enforced at the input boundary before state/URL synchronization.
 */
export const MAX_SEARCH_QUERY_LENGTH = 100;

/**
 * Caps a search query to MAX_SEARCH_QUERY_LENGTH characters.
 * Returns the deterministically truncated string.
 */
export function capSearchQuery(query: string): string {
  return query.slice(0, MAX_SEARCH_QUERY_LENGTH);
}

/**
 * Normalizes a search query at the input or deep-link boundary.
 * Trims leading/trailing whitespace, returns empty string for whitespace-only
 * inputs, and caps length at MAX_SEARCH_QUERY_LENGTH.
 */
export function normalizeSearchQuery(query: string | null | undefined): string {
  if (!query || typeof query !== 'string') return '';
  const trimmed = query.trim();
  return trimmed ? capSearchQuery(trimmed) : '';
}

export const mockService = {
  isMock: true,
};

/**
 * Validates a city name against active Nigerian locations.
 * Returns the canonical city name if active, otherwise undefined.
 * Canonical city names must match exactly (case-sensitive).
 * Non-canonical casing (e.g. "lagos", "LAGOS") is rejected.
 */
export function validateCity(city: string | null | undefined): string | undefined {
  if (!city || typeof city !== 'string') return undefined;
  const trimmed = city.trim();
  return NIGERIAN_LOCATIONS.find(
    (location) => location.name === trimmed && location.status === 'active',
  )?.name;
}

/**
 * Validates a category ID against canonical SERVICE_CATEGORIES.
 * Canonical category IDs must match exactly (case-sensitive).
 * "all" is handled separately by normalizeCategory (case-insensitive).
 * Non-canonical casing (e.g. "AC", "Ac") is rejected.
 */
export function validateCategory(category: string | null | undefined): string | undefined {
  if (!category || typeof category !== 'string') return undefined;
  const trimmed = category.trim();
  return SERVICE_CATEGORIES.find((cat) => cat.id === trimmed)?.id;
}

/**
 * Normalizes a category query parameter.
 * - 'all' (case-insensitive) resolves to 'All' (unconstrained default state).
 * - Canonical service category IDs resolve to their canonical ID.
 * - Unrecognized categories resolve to undefined.
 */
export function normalizeCategory(category: string | null | undefined): string | undefined {
  if (!category || typeof category !== 'string') return undefined;
  const trimmed = category.trim();
  if (trimmed.toLowerCase() === 'all') {
    return 'All';
  }
  return validateCategory(trimmed);
}

/**
 * Matches a service category against a search query across title, description, and common jobs.
 */
export function matchesService(category: ServiceCategory, query: string): boolean {
  const term = query.trim().toLowerCase();
  if (!term) return true;
  return (
    category.title.toLowerCase().includes(term) ||
    category.description.toLowerCase().includes(term) ||
    category.popularServices.some((service) => service.toLowerCase().includes(term))
  );
}

/**
 * Pure filter function for service categories by category ID and search query.
 */
export function filterServices(
  categories: ServiceCategory[],
  options: { category?: string; query?: string },
): ServiceCategory[] {
  const normalized = normalizeCategory(options.category);
  const activeCategoryId = normalized && normalized !== 'All' ? normalized : undefined;
  const query = options.query?.trim() || '';

  return categories.filter((cat) => {
    if (activeCategoryId && cat.id !== activeCategoryId) {
      return false;
    }
    if (query && !matchesService(cat, query)) {
      return false;
    }
    return true;
  });
}

/**
 * Constructs the canonical /services URL query string.
 * Omits empty or default parameters to maintain clean URLs.
 */
export function buildServicesUrl(options: {
  q?: string | null | undefined;
  category?: string | null | undefined;
  city?: string | null | undefined;
}): string {
  const params = new URLSearchParams();
  const normalizedCategory = normalizeCategory(options.category);

  if (normalizedCategory && normalizedCategory !== 'All') {
    params.set('category', normalizedCategory);
  }
  if (options.city) {
    params.set('city', options.city);
  }
  const normalizedQ = normalizeSearchQuery(options.q);
  if (normalizedQ) {
    params.set('q', normalizedQ);
  }

  const queryString = params.toString();
  return queryString ? `/services?${queryString}` : '/services';
}

export interface DebouncedScheduler {
  schedule: (fn: () => void, delayMs?: number) => void;
  cancel: () => void;
  isPending: () => boolean;
}

/**
 * Creates a cancellable debounced action scheduler.
 * Used to ensure search debounces can be cleanly cancelled on unmount,
 * navigation, or competing filter actions.
 */
export function createDebouncedScheduler(): DebouncedScheduler {
  let timer: ReturnType<typeof setTimeout> | null = null;

  return {
    schedule(fn: () => void, delayMs: number = 300) {
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        timer = null;
        fn();
      }, delayMs);
    },
    cancel() {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    },
    isPending() {
      return timer !== null;
    },
  };
}


/**
 * Constructs the service detail URL with active city and optional return context.
 */
export function buildServiceDetailUrl(
  serviceId: string,
  options?: {
    city?: string | null | undefined;
    returnCategory?: string | null | undefined;
    returnQ?: string | null | undefined;
  },
): string {
  const params = new URLSearchParams();
  if (options?.city) {
    params.set('city', options.city);
  }
  if (options?.returnCategory && options.returnCategory !== 'All') {
    params.set('returnCategory', options.returnCategory);
  }
  const normalizedReturnQ = normalizeSearchQuery(options?.returnQ);
  if (normalizedReturnQ) {
    params.set('returnQ', normalizedReturnQ);
  }

  const queryString = params.toString();
  return `/services/${serviceId}${queryString ? `?${queryString}` : ''}`;
}
