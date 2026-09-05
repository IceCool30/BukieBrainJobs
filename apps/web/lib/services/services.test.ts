import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  buildServiceDetailUrl,
  buildServicesUrl,
  createDebouncedScheduler,
  filterServices,
  matchesService,
  normalizeCategory,
  validateCategory,
  validateCity,
} from './index';
import { SERVICE_CATEGORIES } from '../mock/homepage-data';

describe('validateCity', () => {
  it('accepts valid active cities with case-insensitive matching', () => {
    expect(validateCity('Lagos')).toBe('Lagos');
    expect(validateCity('lagos')).toBe('Lagos');
    expect(validateCity('Abuja (FCT)')).toBe('Abuja (FCT)');
    expect(validateCity('abuja (fct)')).toBe('Abuja (FCT)');
    expect(validateCity('Port Harcourt')).toBe('Port Harcourt');
    expect(validateCity('Benin City')).toBe('Benin City');
  });

  it('rejects unlisted or inactive cities', () => {
    expect(validateCity('London')).toBeUndefined();
    expect(validateCity('Atlantis')).toBeUndefined();
    expect(validateCity('New York')).toBeUndefined();
  });

  it('rejects empty, null, or non-string inputs', () => {
    expect(validateCity('')).toBeUndefined();
    expect(validateCity('   ')).toBeUndefined();
    expect(validateCity(null)).toBeUndefined();
    expect(validateCity(undefined)).toBeUndefined();
  });
});

describe('validateCategory', () => {
  it('accepts valid canonical category identifiers', () => {
    expect(validateCategory('generator')).toBe('generator');
    expect(validateCategory('ac')).toBe('ac');
    expect(validateCategory('plumbing')).toBe('plumbing');
    expect(validateCategory('electrical')).toBe('electrical');
    expect(validateCategory('cleaning')).toBe('cleaning');
    expect(validateCategory('carpentry')).toBe('carpentry');
    expect(validateCategory('tv-mounting')).toBe('tv-mounting');
    expect(validateCategory('moving')).toBe('moving');
  });

  it('rejects invalid or unknown category identifiers', () => {
    expect(validateCategory('spaceship')).toBeUndefined();
    expect(validateCategory('fake-trade')).toBeUndefined();
    expect(validateCategory('')).toBeUndefined();
    expect(validateCategory(null)).toBeUndefined();
    expect(validateCategory(undefined)).toBeUndefined();
  });
});

describe('normalizeCategory', () => {
  it('normalizes "all", "All", and "ALL" to "All" unconstrained category state', () => {
    expect(normalizeCategory('all')).toBe('All');
    expect(normalizeCategory('All')).toBe('All');
    expect(normalizeCategory('ALL')).toBe('All');
    expect(normalizeCategory('  all  ')).toBe('All');
  });

  it('preserves canonical category IDs unchanged', () => {
    expect(normalizeCategory('generator')).toBe('generator');
    expect(normalizeCategory('ac')).toBe('ac');
    expect(normalizeCategory('plumbing')).toBe('plumbing');
    expect(normalizeCategory('electrical')).toBe('electrical');
    expect(normalizeCategory('cleaning')).toBe('cleaning');
    expect(normalizeCategory('carpentry')).toBe('carpentry');
    expect(normalizeCategory('tv-mounting')).toBe('tv-mounting');
    expect(normalizeCategory('moving')).toBe('moving');
  });

  it('returns undefined for invalid or unknown categories', () => {
    expect(normalizeCategory('spaceship')).toBeUndefined();
    expect(normalizeCategory('random')).toBeUndefined();
    expect(normalizeCategory('')).toBeUndefined();
    expect(normalizeCategory(null)).toBeUndefined();
    expect(normalizeCategory(undefined)).toBeUndefined();
  });
});

describe('matchesService', () => {
  const generatorCategory = SERVICE_CATEGORIES.find((c) => c.id === 'generator')!;

  it('matches text in title', () => {
    expect(matchesService(generatorCategory, 'generator')).toBe(true);
    expect(matchesService(generatorCategory, 'Servicing')).toBe(true);
  });

  it('matches text in description', () => {
    expect(matchesService(generatorCategory, 'diesel')).toBe(true);
    expect(matchesService(generatorCategory, 'petrol')).toBe(true);
  });

  it('matches text in popular services bullets', () => {
    expect(matchesService(generatorCategory, 'Sumec')).toBe(true);
    expect(matchesService(generatorCategory, 'Mikano')).toBe(true);
    expect(matchesService(generatorCategory, 'AVR Replacement')).toBe(true);
  });

  it('returns true for empty query', () => {
    expect(matchesService(generatorCategory, '')).toBe(true);
    expect(matchesService(generatorCategory, '   ')).toBe(true);
  });

  it('returns false when query does not match', () => {
    expect(matchesService(generatorCategory, 'unrelated-query-xyz')).toBe(false);
  });
});

describe('filterServices', () => {
  it('returns all categories when category is All and query is empty', () => {
    const results = filterServices(SERVICE_CATEGORIES, { category: 'All', query: '' });
    expect(results).toHaveLength(8);
  });

  it('normalizes lowercase "all" category to unconstrained state', () => {
    const results = filterServices(SERVICE_CATEGORIES, { category: 'all' });
    expect(results).toHaveLength(8);
  });

  it('filters by category ID', () => {
    const results = filterServices(SERVICE_CATEGORIES, { category: 'ac' });
    expect(results).toHaveLength(1);
    expect(results[0]?.id).toBe('ac');
  });

  it('filters by search keyword across categories', () => {
    const results = filterServices(SERVICE_CATEGORIES, { query: 'solar' });
    expect(results).toHaveLength(1);
    expect(results[0]?.id).toBe('electrical');
  });

  it('filters by both category and search query', () => {
    const results = filterServices(SERVICE_CATEGORIES, { category: 'generator', query: 'mikano' });
    expect(results).toHaveLength(1);
    expect(results[0]?.id).toBe('generator');
  });

  it('returns empty array when no services match', () => {
    const results = filterServices(SERVICE_CATEGORIES, { query: 'unobtainium' });
    expect(results).toHaveLength(0);
  });
});

describe('buildServicesUrl', () => {
  it('returns /services when all parameters are empty or default', () => {
    expect(buildServicesUrl({})).toBe('/services');
    expect(buildServicesUrl({ category: 'All', q: '', city: null })).toBe('/services');
    expect(buildServicesUrl({ category: 'all', q: '', city: null })).toBe('/services');
  });

  it('omits category from query string when category is all or All', () => {
    expect(buildServicesUrl({ category: 'all' })).toBe('/services');
    expect(buildServicesUrl({ category: 'All' })).toBe('/services');
    expect(buildServicesUrl({ category: 'all', city: 'Lagos' })).toBe('/services?city=Lagos');
    expect(buildServicesUrl({ category: 'all', q: 'generator' })).toBe('/services?q=generator');
  });

  it('includes only active parameters in query string', () => {
    expect(buildServicesUrl({ category: 'ac' })).toBe('/services?category=ac');
    expect(buildServicesUrl({ city: 'Lagos' })).toBe('/services?city=Lagos');
    expect(buildServicesUrl({ q: 'solar' })).toBe('/services?q=solar');
  });

  it('combines multiple parameters canonically', () => {
    expect(buildServicesUrl({ category: 'electrical', city: 'Abuja (FCT)', q: 'solar' })).toBe(
      '/services?category=electrical&city=Abuja+%28FCT%29&q=solar',
    );
  });
});

describe('buildServiceDetailUrl', () => {
  it('builds detail URL without return context if none provided', () => {
    expect(buildServiceDetailUrl('generator')).toBe('/services/generator');
  });

  it('includes city when provided', () => {
    expect(buildServiceDetailUrl('ac', { city: 'Lagos' })).toBe('/services/ac?city=Lagos');
  });

  it('includes return context parameters', () => {
    expect(
      buildServiceDetailUrl('generator', {
        city: 'Lagos',
        returnCategory: 'generator',
        returnQ: 'diesel',
      }),
    ).toBe('/services/generator?city=Lagos&returnCategory=generator&returnQ=diesel');
  });
});

describe('createDebouncedScheduler', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('executes scheduled action after specified delay', () => {
    const scheduler = createDebouncedScheduler();
    const action = vi.fn();

    scheduler.schedule(action, 300);
    expect(scheduler.isPending()).toBe(true);
    expect(action).not.toHaveBeenCalled();

    vi.advanceTimersByTime(299);
    expect(action).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(action).toHaveBeenCalledTimes(1);
    expect(scheduler.isPending()).toBe(false);
  });

  it('cancels pending action so it never executes', () => {
    const scheduler = createDebouncedScheduler();
    const action = vi.fn();

    scheduler.schedule(action, 300);
    expect(scheduler.isPending()).toBe(true);

    scheduler.cancel();
    expect(scheduler.isPending()).toBe(false);

    vi.advanceTimersByTime(500);
    expect(action).not.toHaveBeenCalled();
  });

  it('resets timer when a new action is scheduled before previous fires', () => {
    const scheduler = createDebouncedScheduler();
    const action1 = vi.fn();
    const action2 = vi.fn();

    scheduler.schedule(action1, 300);
    vi.advanceTimersByTime(200);

    // Reschedule with action2
    scheduler.schedule(action2, 300);
    vi.advanceTimersByTime(200); // 400ms total from start, but 200ms from reschedule
    expect(action1).not.toHaveBeenCalled();
    expect(action2).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100); // 300ms from reschedule
    expect(action1).not.toHaveBeenCalled();
    expect(action2).toHaveBeenCalledTimes(1);
    expect(scheduler.isPending()).toBe(false);
  });
});
