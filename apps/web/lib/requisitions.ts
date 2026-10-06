/**
 * Requisition Index mapping (Trades Design System, DESIGN.md v2.0).
 *
 * Discovery rows are derived deterministically from the canonical service
 * catalog. Reference codes, stack tags, locations, and milestone figures
 * always trace back to `SERVICE_CATEGORIES` entries. Nothing here invents
 * rates, workshops, or verification outcomes.
 */
import type { ServiceCategory } from './mock/homepage-data';

export interface RequisitionDiscipline {
  id: string;
  label: string;
}

export const REQUISITION_DISCIPLINES: RequisitionDiscipline[] = [
  { id: 'power', label: 'Power & Generators' },
  { id: 'solar', label: 'Solar & Inverters' },
  { id: 'industrial', label: 'Plant Automation' },
  { id: 'cooling', label: 'Commercial HVAC' },
];

/**
 * Nearest technical discipline for each catalog category. Categories
 * without an industrial-discipline equivalent map to `null` and appear
 * under the unfiltered "All Dispatches" view only.
 */
export const CATEGORY_DISCIPLINE: Record<string, string | null> = {
  generator: 'power',
  electrical: 'solar',
  ac: 'cooling',
  plumbing: 'industrial',
  cleaning: null,
  carpentry: null,
  'tv-mounting': null,
  moving: null,
};

export interface RequisitionEntry {
  refId: string;
  categoryId: string;
  roleTitle: string;
  stackTags: string[];
  group: string;
  description: string;
  milestone: string;
  disciplineId: string | null;
}

const REF_ID_BASE = 8801;

export function toRequisitionEntry(
  category: ServiceCategory,
  canonicalIndex: number,
): RequisitionEntry {
  return {
    refId: `REQ-${REF_ID_BASE + canonicalIndex}`,
    categoryId: category.id,
    roleTitle: category.title,
    stackTags: category.popularServices,
    group: category.group,
    description: category.description,
    milestone: category.startingPrice,
    disciplineId: CATEGORY_DISCIPLINE[category.id] ?? null,
  };
}

export function toRequisitionIndex(
  categories: ServiceCategory[],
  canonicalOrder: ServiceCategory[],
): RequisitionEntry[] {
  return categories.map((category) => {
    const canonicalIndex = canonicalOrder.findIndex((item) => item.id === category.id);
    return toRequisitionEntry(category, canonicalIndex < 0 ? 0 : canonicalIndex);
  });
}

export function filterByDiscipline(
  entries: RequisitionEntry[],
  discipline: string,
): RequisitionEntry[] {
  if (discipline === 'all') return entries;
  return entries.filter((entry) => entry.disciplineId === discipline);
}

export function formatRequisitionLocation(city: string | undefined, group: string): string {
  return `${city ?? 'Nationwide'} // ${group}`;
}

export function buildRequisitionBookUrl(entry: RequisitionEntry, city?: string): string {
  const params = new URLSearchParams({
    service: entry.roleTitle,
    price: entry.milestone,
  });
  if (city) params.set('city', city);
  return `/book?${params.toString()}`;
}
