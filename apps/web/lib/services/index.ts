// apps/web/lib/services/index.ts
// Phase 1 Mock Services (AGENTS.md Phase 1 Mock Boundary)

import {
  NIGERIAN_LOCATIONS,
  SERVICE_CATEGORIES,
  ServiceCategory,
} from '../mock/homepage-data';

export const mockService = {
  isMock: true,
};

/**
 * Validates a city name against active Nigerian locations.
 * Returns the canonical city name if active, otherwise undefined.
 */
export function validateCity(city: string | null | undefined): string | undefined {
  if (!city || typeof city !== 'string') return undefined;
  const trimmed = city.trim();
  return NIGERIAN_LOCATIONS.find(
    (location) => location.name.toLowerCase() === trimmed.toLowerCase() && location.status === 'active',
  )?.name;
}

/**
 * Validates a category ID against canonical SERVICE_CATEGORIES.
 * Returns the category ID if found, otherwise undefined.
 */
export function validateCategory(category: string | null | undefined): string | undefined {
  if (!category || typeof category !== 'string') return undefined;
  const trimmed = category.trim().toLowerCase();
  return SERVICE_CATEGORIES.find((cat) => cat.id.toLowerCase() === trimmed)?.id;
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
  const activeCategoryId = options.category && options.category !== 'All' ? options.category : undefined;
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

  if (options.category && options.category !== 'All') {
    params.set('category', options.category);
  }
  if (options.city) {
    params.set('city', options.city);
  }
  if (options.q && options.q.trim()) {
    params.set('q', options.q.trim());
  }

  const queryString = params.toString();
  return queryString ? `/services?${queryString}` : '/services';
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
  if (options?.returnQ && options.returnQ.trim()) {
    params.set('returnQ', options.returnQ.trim());
  }

  const queryString = params.toString();
  return `/services/${serviceId}${queryString ? `?${queryString}` : ''}`;
}
