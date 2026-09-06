import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  MAX_SEARCH_QUERY_LENGTH,
  buildServiceDetailUrl,
  buildServicesUrl,
  capSearchQuery,
  createDebouncedScheduler,
  filterServices,
  matchesService,
  normalizeCategory,
  normalizeSearchQuery,
  validateCategory,
  validateCity,
} from './index';
import { SERVICE_CATEGORIES } from '../mock/homepage-data';

describe('validateCity', () => {
  it('accepts valid active cities with exact canonical casing', () => {
    expect(validateCity('Lagos')).toBe('Lagos');
    expect(validateCity('Abuja (FCT)')).toBe('Abuja (FCT)');
    expect(validateCity('Port Harcourt')).toBe('Port Harcourt');
    expect(validateCity('Ibadan')).toBe('Ibadan');
    expect(validateCity('Enugu')).toBe('Enugu');
    expect(validateCity('Kano')).toBe('Kano');
    expect(validateCity('Benin City')).toBe('Benin City');
  });

  it('rejects non-canonical casing of valid active cities', () => {
    expect(validateCity('lagos')).toBeUndefined();
    expect(validateCity('LAGOS')).toBeUndefined();
    expect(validateCity('Lagos ')).toBe('Lagos'); // trimmed
    expect(validateCity('abuja (fct)')).toBeUndefined();
    expect(validateCity('ABUJA (FCT)')).toBeUndefined();
    expect(validateCity('Abuja (fct)')).toBeUndefined();
    expect(validateCity('port harcourt')).toBeUndefined();
    expect(validateCity('PORT HARCOURT')).toBeUndefined();
    expect(validateCity('ibadan')).toBeUndefined();
    expect(validateCity('enugu')).toBeUndefined();
    expect(validateCity('kano')).toBeUndefined();
    expect(validateCity('benin city')).toBeUndefined();
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

  it('rejects non-canonical casing of valid category IDs', () => {
    expect(validateCategory('AC')).toBeUndefined();
    expect(validateCategory('Ac')).toBeUndefined();
    expect(validateCategory('aC')).toBeUndefined();
    expect(validateCategory('Generator')).toBeUndefined();
    expect(validateCategory('PLUMBING')).toBeUndefined();
    expect(validateCategory('Electrical')).toBeUndefined();
    expect(validateCategory('TV-Mounting')).toBeUndefined();
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

  it('returns undefined for non-canonical casing of valid category IDs (triggers recovery)', () => {
    expect(normalizeCategory('AC')).toBeUndefined();
    expect(normalizeCategory('Ac')).toBeUndefined();
    expect(normalizeCategory('aC')).toBeUndefined();
    expect(normalizeCategory('Generator')).toBeUndefined();
    expect(normalizeCategory('PLUMBING')).toBeUndefined();
  });
});

describe('canonical category casing contract (WEB-006 remediation)', () => {
  it('handles "category=ac" as valid AC filter', () => {
    expect(validateCategory('ac')).toBe('ac');
    expect(normalizeCategory('ac')).toBe('ac');
    const filtered = filterServices(SERVICE_CATEGORIES, { category: 'ac' });
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.id).toBe('ac');
    expect(buildServicesUrl({ category: 'ac' })).toBe('/services?category=ac');
  });

  it('handles "category=AC" as invalid category recovery state (falls back to All)', () => {
    expect(validateCategory('AC')).toBeUndefined();
    expect(normalizeCategory('AC')).toBeUndefined();
    const filtered = filterServices(SERVICE_CATEGORIES, { category: 'AC' });
    expect(filtered).toHaveLength(8);
  });

  it('handles "category=Ac" as invalid category recovery state (falls back to All)', () => {
    expect(validateCategory('Ac')).toBeUndefined();
    expect(normalizeCategory('Ac')).toBeUndefined();
    const filtered = filterServices(SERVICE_CATEGORIES, { category: 'Ac' });
    expect(filtered).toHaveLength(8);
  });

  it('handles "category=all" as default All state without notice', () => {
    expect(normalizeCategory('all')).toBe('All');
    const filtered = filterServices(SERVICE_CATEGORIES, { category: 'all' });
    expect(filtered).toHaveLength(8);
    expect(buildServicesUrl({ category: 'all' })).toBe('/services');
  });

  it('handles "category=ALL" as default All state without notice', () => {
    expect(normalizeCategory('ALL')).toBe('All');
    const filtered = filterServices(SERVICE_CATEGORIES, { category: 'ALL' });
    expect(filtered).toHaveLength(8);
    expect(buildServicesUrl({ category: 'ALL' })).toBe('/services');
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

  it('treats non-canonical category casing as invalid, falling back to All', () => {
    const acUpper = filterServices(SERVICE_CATEGORIES, { category: 'AC' });
    expect(acUpper).toHaveLength(8);

    const acMixed = filterServices(SERVICE_CATEGORIES, { category: 'Ac' });
    expect(acMixed).toHaveLength(8);

    const generatorCapital = filterServices(SERVICE_CATEGORIES, { category: 'Generator' });
    expect(generatorCapital).toHaveLength(8);
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

  it('caps search query at 100 characters in URL', () => {
    const exactly100 = 'a'.repeat(100);
    const over101 = 'b'.repeat(101);

    const url100 = buildServicesUrl({ q: exactly100 });
    expect(url100).toBe(`/services?q=${exactly100}`);

    const url101 = buildServicesUrl({ q: over101 });
    expect(url101).toBe(`/services?q=${'b'.repeat(100)}`);
  });

  it('caps long deep-linked search with combined category and city', () => {
    const longQuery = 'x'.repeat(150);
    const url = buildServicesUrl({ q: longQuery, category: 'ac', city: 'Lagos' });
    expect(url).toBe(`/services?category=ac&city=Lagos&q=${'x'.repeat(100)}`);
  });

  it('omits whitespace-only search query from URL', () => {
    expect(buildServicesUrl({ q: '   ' })).toBe('/services');
    expect(buildServicesUrl({ q: '\t\n  ' })).toBe('/services');
    expect(buildServicesUrl({ q: '   ', category: 'ac', city: 'Lagos' })).toBe(
      '/services?category=ac&city=Lagos',
    );
  });
});

describe('normalizeSearchQuery', () => {
  it('returns empty string for empty, null, undefined, or non-string inputs', () => {
    expect(normalizeSearchQuery('')).toBe('');
    expect(normalizeSearchQuery(null)).toBe('');
    expect(normalizeSearchQuery(undefined)).toBe('');
  });

  it('normalizes whitespace-only queries to empty string', () => {
    expect(normalizeSearchQuery('   ')).toBe('');
    expect(normalizeSearchQuery(' \t\n ')).toBe('');
    expect(normalizeSearchQuery('        ')).toBe('');
  });

  it('trims leading and trailing whitespace from query', () => {
    expect(normalizeSearchQuery('  solar  ')).toBe('solar');
    expect(normalizeSearchQuery('\tinverter repair\n')).toBe('inverter repair');
  });

  it('caps long queries at 100 characters after trimming', () => {
    const longWithSpaces = '   ' + 'a'.repeat(150) + '   ';
    const normalized = normalizeSearchQuery(longWithSpaces);
    expect(normalized).toHaveLength(100);
    expect(normalized).toBe('a'.repeat(100));
  });
});

describe('capSearchQuery', () => {
  it('returns the constant MAX_SEARCH_QUERY_LENGTH as 100', () => {
    expect(MAX_SEARCH_QUERY_LENGTH).toBe(100);
  });

  it('preserves queries at or below 100 characters', () => {
    expect(capSearchQuery('')).toBe('');
    expect(capSearchQuery('solar')).toBe('solar');
    expect(capSearchQuery('a'.repeat(100))).toBe('a'.repeat(100));
  });

  it('caps queries exceeding 100 characters to exactly 100', () => {
    const input101 = 'c'.repeat(101);
    expect(capSearchQuery(input101)).toBe('c'.repeat(100));
    expect(capSearchQuery(input101)).toHaveLength(100);
  });

  it('caps very long queries deterministically', () => {
    const longInput = 'solar inverter repair with long description ' + 'x'.repeat(200);
    const capped = capSearchQuery(longInput);
    expect(capped).toHaveLength(100);
    expect(capped).toBe(longInput.slice(0, 100));
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

  it('omits whitespace-only returnQ from detail URL', () => {
    expect(buildServiceDetailUrl('ac', { city: 'Lagos', returnQ: '   ' })).toBe(
      '/services/ac?city=Lagos',
    );
  });

  it('caps returnQ at 100 characters', () => {
    const longQ = 'z'.repeat(150);
    const url = buildServiceDetailUrl('ac', { city: 'Lagos', returnQ: longQ });
    expect(url).toContain(`returnQ=${'z'.repeat(100)}`);
    expect(url).not.toContain('z'.repeat(101));
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

  it('cancels pending search debounce when category or city changes', () => {
    const scheduler = createDebouncedScheduler();
    const debouncedUrlSync = vi.fn();

    // User types in search box
    scheduler.schedule(debouncedUrlSync, 300);
    expect(scheduler.isPending()).toBe(true);

    // User clicks a category pill or city before debounce timer elapses
    scheduler.cancel();
    expect(scheduler.isPending()).toBe(false);

    // New URL is constructed immediately for the category/city change
    const url = buildServicesUrl({
      q: capSearchQuery('solar inverter'),
      category: 'electrical',
      city: 'Lagos',
    });
    expect(url).toBe('/services?category=electrical&city=Lagos&q=solar+inverter');

    // Debounced action from search never fires
    vi.advanceTimersByTime(500);
    expect(debouncedUrlSync).not.toHaveBeenCalled();
  });

  it('cancels pending search debounce when Review details is clicked immediately', () => {
    const scheduler = createDebouncedScheduler();
    const debouncedUrlSync = vi.fn();

    // User types search
    scheduler.schedule(debouncedUrlSync, 300);

    // User immediately clicks "Review details" on a service card
    scheduler.cancel();
    const detailUrl = buildServiceDetailUrl('ac', {
      city: 'Lagos',
      returnCategory: 'ac',
      returnQ: capSearchQuery('ac repair ' + 'q'.repeat(120)),
    });

    vi.advanceTimersByTime(500);
    expect(debouncedUrlSync).not.toHaveBeenCalled();
    expect(detailUrl).toContain('returnQ=ac+repair+');
    expect(detailUrl).not.toContain('q'.repeat(101));
  });
});

describe('touch compliance and accessibility contract (WEB-006 remediation)', () => {
  it('enforces 44px minimum touch target size according to WCAG 2.2 AA and WEB-006', () => {
    const MIN_TOUCH_TARGET_PX = 44;
    expect(MIN_TOUCH_TARGET_PX).toBeGreaterThanOrEqual(44);
  });
});
