// apps/web/components/onsite/OnSiteStatusBanner.tsx
// BW-008: On-Site Work & In-Progress Verification
// Phase 3 RED Component Stub

'use client';

import React from 'react';
import type { JobStatus } from '@bukiebrainjobs/api-types';
import type { OnSiteEscrowStatus } from '../../lib/onsite/types';

export interface OnSiteStatusBannerProps {
  jobStatus: JobStatus;
  checkedInAt?: string | undefined;
  escrowStatus: OnSiteEscrowStatus;
}

export function OnSiteStatusBanner(
  _props: OnSiteStatusBannerProps
): React.ReactElement {
  throw new Error('Not implemented: Phase 3 RED stub');
}
