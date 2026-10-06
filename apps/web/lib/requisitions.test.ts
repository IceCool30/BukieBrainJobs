// @vitest-environment node
/**
 * Requisition mapping unit tests (Trades Design System).
 * Proves rows derive deterministically from the canonical catalog:
 * stable REQ codes, real stack tags and milestone figures, and
 * discipline filtering that never invents data.
 */
import { describe, expect, it } from 'vitest';
import { SERVICE_CATEGORIES } from './mock/homepage-data';
import {
  REQUISITION_DISCIPLINES,
  buildRequisitionBookUrl,
  filterByDiscipline,
  formatRequisitionLocation,
  toRequisitionEntry,
  toRequisitionIndex,
} from './requisitions';

describe('requisition mapping', () => {
  it('exposes the four approved discipline pills', () => {
    expect(REQUISITION_DISCIPLINES.map((item) => item.id)).toEqual([
      'power',
      'solar',
      'industrial',
      'cooling',
    ]);
  });

  it('assigns stable deterministic reference codes by canonical order', () => {
    const first = toRequisitionEntry(SERVICE_CATEGORIES[0]!, 0);
    const last = toRequisitionEntry(SERVICE_CATEGORIES[7]!, 7);
    expect(first.refId).toBe('REQ-8801');
    expect(last.refId).toBe('REQ-8808');
    expect(toRequisitionEntry(SERVICE_CATEGORIES[0]!, 0).refId).toBe(first.refId);
  });

  it('carries real catalog data into each row (no invented rates or stacks)', () => {
    const generator = SERVICE_CATEGORIES.find((item) => item.id === 'generator')!;
    const entry = toRequisitionEntry(generator, 0);
    expect(entry.roleTitle).toBe(generator.title);
    expect(entry.stackTags).toEqual(generator.popularServices);
    expect(entry.milestone).toBe(generator.startingPrice);
    expect(entry.description).toBe(generator.description);
  });

  it('maps generator, electrical, ac, and plumbing to their disciplines', () => {
    const entries = toRequisitionIndex(SERVICE_CATEGORIES, SERVICE_CATEGORIES);
    const byId = Object.fromEntries(entries.map((entry) => [entry.categoryId, entry]));
    expect(byId['generator']?.disciplineId).toBe('power');
    expect(byId['electrical']?.disciplineId).toBe('solar');
    expect(byId['ac']?.disciplineId).toBe('cooling');
    expect(byId['plumbing']?.disciplineId).toBe('industrial');
  });

  it('filters rows by discipline and restores all rows on "all"', () => {
    const entries = toRequisitionIndex(SERVICE_CATEGORIES, SERVICE_CATEGORIES);
    expect(filterByDiscipline(entries, 'all')).toHaveLength(8);
    expect(filterByDiscipline(entries, 'power').map((entry) => entry.categoryId)).toEqual([
      'generator',
    ]);
    expect(filterByDiscipline(entries, 'solar').map((entry) => entry.categoryId)).toEqual([
      'electrical',
    ]);
  });

  it('formats locations from the selected city and catalog group', () => {
    expect(formatRequisitionLocation('Lagos', 'Power & Cooling')).toBe('Lagos // Power & Cooling');
    expect(formatRequisitionLocation(undefined, 'Power & Cooling')).toBe(
      'Nationwide // Power & Cooling',
    );
  });

  it('builds booking URLs that preserve service, price, and city', () => {
    const entry = toRequisitionEntry(SERVICE_CATEGORIES[0]!, 0);
    const url = buildRequisitionBookUrl(entry, 'Lagos');
    expect(url.startsWith('/book?')).toBe(true);
    expect(url).toContain('city=Lagos');
    expect(url).toContain('price=');
    expect(url).toContain('service=');
  });
});
