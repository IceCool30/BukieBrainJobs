import { describe, expect, it } from 'vitest';
import {
  CANONICAL_SERVICES,
  SERVICE_GROUPS,
  filterServices,
  getServiceById,
  normalizeSearchQuery,
} from './services';

describe('4.2.1 Mobile Services Catalog & Discovery Domain', () => {
  it('contains exactly the 8 canonical source-backed services', () => {
    expect(CANONICAL_SERVICES).toHaveLength(8);
    const ids = CANONICAL_SERVICES.map((s) => s.id);
    expect(ids).toEqual([
      'generator',
      'ac',
      'plumbing',
      'electrical',
      'cleaning',
      'carpentry',
      'tv-mounting',
      'moving',
    ]);
  });

  it('contains the 3 canonical category groups with valid icons', () => {
    expect(SERVICE_GROUPS).toHaveLength(3);
    const groupTitles = SERVICE_GROUPS.map((g) => g.title);
    expect(groupTitles).toEqual([
      'Power & Cooling',
      'Utilities & Structure',
      'Home & Lifestyle',
    ]);
    for (const group of SERVICE_GROUPS) {
      expect(group.icon).toBeTruthy();
    }
  });

  it('ensures every canonical service has complete required attributes', () => {
    for (const service of CANONICAL_SERVICES) {
      expect(service.id).toBeTruthy();
      expect(service.title).toBeTruthy();
      expect(service.description).toBeTruthy();
      expect(service.group).toBeTruthy();
      expect(service.popularServices.length).toBeGreaterThan(0);
      expect(service.icon).toBeTruthy();
    }
  });

  it('retrieves services by valid ID and returns undefined for unknown ID', () => {
    const generator = getServiceById('generator');
    expect(generator?.title).toBe('Generator Servicing & Repair');
    expect(generator?.group).toBe('Power & Cooling');

    const unknown = getServiceById('non-existent-service');
    expect(unknown).toBeUndefined();
  });

  it('filters services by category group', () => {
    const powerServices = filterServices(CANONICAL_SERVICES, {
      group: 'Power & Cooling',
    });
    expect(powerServices).toHaveLength(2);
    expect(powerServices.map((s) => s.id)).toEqual(['generator', 'ac']);

    const utilityServices = filterServices(CANONICAL_SERVICES, {
      group: 'Utilities & Structure',
    });
    expect(utilityServices).toHaveLength(2);
    expect(utilityServices.map((s) => s.id)).toEqual(['plumbing', 'electrical']);

    const lifestyleServices = filterServices(CANONICAL_SERVICES, {
      group: 'Home & Lifestyle',
    });
    expect(lifestyleServices).toHaveLength(4);
    expect(lifestyleServices.map((s) => s.id)).toEqual([
      'cleaning',
      'carpentry',
      'tv-mounting',
      'moving',
    ]);
  });

  it('filters services by case-insensitive keyword search', () => {
    const acResults = filterServices(CANONICAL_SERVICES, { query: 'split-unit' });
    expect(acResults).toHaveLength(1);
    expect(acResults[0].id).toBe('ac');

    const tankResults = filterServices(CANONICAL_SERVICES, { query: 'tank' });
    expect(tankResults).toHaveLength(1);
    expect(tankResults[0].id).toBe('plumbing');

    const emptyResults = filterServices(CANONICAL_SERVICES, { query: 'xyznotfound' });
    expect(emptyResults).toHaveLength(0);
  });

  it('combines category group and query filters deterministically', () => {
    const filtered = filterServices(CANONICAL_SERVICES, {
      group: 'Power & Cooling',
      query: 'generator',
    });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('generator');

    const mismatched = filterServices(CANONICAL_SERVICES, {
      group: 'Home & Lifestyle',
      query: 'generator',
    });
    expect(mismatched).toHaveLength(0);
  });

  it('normalizes search queries with whitespace trimming', () => {
    expect(normalizeSearchQuery('   generator   ')).toBe('generator');
    expect(normalizeSearchQuery(null)).toBe('');
    expect(normalizeSearchQuery(undefined)).toBe('');

    const longQuery = 'a'.repeat(150);
    expect(normalizeSearchQuery(longQuery)).toBe(longQuery);
  });
});
