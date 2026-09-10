// packages/utils/src/jobResolution.ts
// ARCH-002 Staged Resolution: Customer Input -> Location Resolution -> Marketplace Resolution -> Production Request

import type {
  CustomerJobCreationInput,
  CreateJobRequest,
  ResolvedJobLocation,
} from '@bukiebrainjobs/types';
import { generateJobReferenceCode } from './referenceCode';

export interface MarketplaceJobResolutionParams {
  taskerRateKobo: number;
  estimatedTotalKobo?: number;
  resolvedSkillIds?: string[];
  referenceCode?: string;
}

/**
 * Transforms customer-known input into a production CreateJobRequest entity.
 * 
 * Invariants (ARCH-002 Decisions A & B):
 * 1. Customer input NEVER requires taskerRateKobo; rate is provided by marketplace resolution.
 * 2. If customer selected "I'm not sure", selectedSkillIds may be empty, and marketplace
 *    domain resolution provides or defers resolved skills without fabricating fake skill IDs.
 * 3. Durable human-readable reference code is generated authoritatively by domain layer.
 */
export function resolveCustomerJobToProductionRequest(
  input: CustomerJobCreationInput,
  location: ResolvedJobLocation,
  marketplace: MarketplaceJobResolutionParams
): CreateJobRequest {
  if (
    typeof marketplace.taskerRateKobo !== 'number' ||
    isNaN(marketplace.taskerRateKobo) ||
    marketplace.taskerRateKobo <= 0
  ) {
    throw new Error(
      '[ARCH-002] Marketplace resolution error: taskerRateKobo must be a positive integer kobo value.'
    );
  }

  // Calculate estimated total kobo if not explicitly provided
  const hours = input.estimatedHours || 1;
  const estimatedTotalKobo =
    marketplace.estimatedTotalKobo ?? Math.round(marketplace.taskerRateKobo * hours);

  // Skill resolution: customer selected skills take precedence;
  // if empty ("I'm not sure"), resolved marketplace skills are applied
  const finalSkillIds =
    input.selectedSkillIds && input.selectedSkillIds.length > 0
      ? input.selectedSkillIds
      : marketplace.resolvedSkillIds || [];

  const referenceCode = marketplace.referenceCode || generateJobReferenceCode();

  const result: CreateJobRequest = {
    referenceCode,
    title: input.title.trim(),
    description: input.description.trim(),
    jobType: input.jobType || 'TASK',
    address: location.address,
    city: location.city,
    state: location.state,
    latitude: location.latitude,
    longitude: location.longitude,
    scheduledStartAt: input.scheduledStartAt,
    taskerRateKobo: Math.round(marketplace.taskerRateKobo),
    estimatedTotalKobo: Math.round(estimatedTotalKobo),
    skillIds: finalSkillIds,
    isRecurring: input.isRecurring ?? false,
    beforePhotoUrls: input.beforePhotoUrls || [],
  };

  if (input.scheduledEndAt !== undefined) {
    result.scheduledEndAt = input.scheduledEndAt;
  }
  if (input.estimatedHours !== undefined) {
    result.estimatedHours = input.estimatedHours;
  }
  if (input.recurringFrequency !== undefined) {
    result.recurringFrequency = input.recurringFrequency;
  }
  if (input.recurringEndsAt !== undefined) {
    result.recurringEndsAt = input.recurringEndsAt;
  }

  return result;
}
