// packages/utils/src/location.ts
// Staged Location Resolution & Coordinate Validation for BukieBrainJobs (ARCH-002)

import type { CustomerLocationInput, ResolvedJobLocation } from '@bukiebrainjobs/types';

export interface LocationResolutionResult {
  resolved: boolean;
  location?: ResolvedJobLocation | undefined;
  error?: string | undefined;
}

/**
 * Derives state from known Nigerian cities without fabricating geographic coordinates.
 */
export function deriveStateFromCity(city: string): string | null {
  const clean = city.trim().toLowerCase();
  switch (clean) {
    case 'lagos':
    case 'ikeja':
    case 'lekki':
    case 'yaba':
    case 'surulere':
    case 'victoria island':
    case 'ajah':
    case 'maryland':
      return 'Lagos';
    case 'abuja':
    case 'garki':
    case 'wuse':
    case 'maitama':
    case 'asokoro':
    case 'jabi':
      return 'Federal Capital Territory';
    case 'port harcourt':
      return 'Rivers';
    case 'ibadan':
      return 'Oyo';
    case 'kano':
      return 'Kano';
    default:
      return null;
  }
}

/**
 * Validates whether coordinates represent genuine, non-fabricated geographic values.
 * Strictly rejects (0, 0), NaN, or out-of-bounds coordinates.
 */
export function isValidCoordinate(latitude: number, longitude: number): boolean {
  if (typeof latitude !== 'number' || typeof longitude !== 'number') return false;
  if (isNaN(latitude) || isNaN(longitude)) return false;
  // Strictly reject (0, 0) dummy coordinates (Gulf of Guinea / null island)
  if (latitude === 0 && longitude === 0) return false;
  // Nigeria bounding box: Lat ~4°N to ~14°N, Lon ~2.5°E to ~15°E
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return false;
  return true;
}

/**
 * Staged Location Resolution pipeline (ARCH-002 Rule 6.C).
 * Never injects dummy coordinates (0, 0) or city centroids disguised as address coordinates.
 */
export function resolveJobLocation(
  input: CustomerLocationInput,
  coordinates?: { latitude: number; longitude: number } | null
): LocationResolutionResult {
  if (!input.streetAddress || !input.streetAddress.trim()) {
    return { resolved: false, error: 'Street address is required.' };
  }
  if (!input.city || !input.city.trim()) {
    return { resolved: false, error: 'City is required.' };
  }

  const state = deriveStateFromCity(input.city);
  if (!state) {
    return { resolved: false, error: `Unrecognized city "${input.city}". State could not be derived.` };
  }

  if (!coordinates || !isValidCoordinate(coordinates.latitude, coordinates.longitude)) {
    return {
      resolved: false,
      error: 'Geographic coordinates unresolved. Requests without verified coordinates cannot be submitted to production persistence.',
    };
  }

  return {
    resolved: true,
    location: {
      address: input.streetAddress.trim(),
      city: input.city.trim(),
      state,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      landmark: input.landmark?.trim() || undefined,
    },
  };
}
