/**
 * WEB-012 match explanation utilities.
 * Converts MatchExplanationTag values to customer-friendly copy.
 * Copy follows the content standards from the BukieBrainJobs content guide.
 */

import type { MatchExplanationTag } from '@bukiebrainjobs/types';

const EXPLANATION_COPY: Record<MatchExplanationTag, string> = {
  service_match:       'Matches your requested service',
  schedule_available:  'Available for your requested schedule',
  location_match:      'Serves your location',
  budget_compatible:   'Fits your stated budget',
  strong_track_record: 'Strong experience with this type of work',
  highly_rated:        'Highly rated by previous customers',
  verified_identity:   'Identity verified',
};

export function getExplanationLabel(tag: MatchExplanationTag): string {
  return EXPLANATION_COPY[tag];
}

export function getExplanationLabels(tags: MatchExplanationTag[]): string[] {
  return tags.map(getExplanationLabel);
}
