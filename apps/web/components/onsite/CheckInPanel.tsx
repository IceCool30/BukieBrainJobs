// apps/web/components/onsite/CheckInPanel.tsx
// BW-008: On-Site Work & In-Progress Verification
// Phase 3 RED Component Stub

'use client';

import React from 'react';
import type { JobStatus } from '@bukiebrainjobs/api-types';
import type { CheckInSnapshot, OnSiteEscrowStatus } from '../../lib/onsite/types';

export interface CheckInPanelProps {
  jobStatus: JobStatus;
  escrowStatus: OnSiteEscrowStatus;
  onCheckIn: (snapshot: CheckInSnapshot) => void | Promise<void>;
  isSubmitting?: boolean | undefined;
}

export function CheckInPanel(_props: CheckInPanelProps): React.ReactElement {
  throw new Error('Not implemented: Phase 3 RED stub');
}
