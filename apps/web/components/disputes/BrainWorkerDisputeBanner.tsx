// apps/web/components/disputes/BrainWorkerDisputeBanner.tsx
// BW-010: Dispute Handling & Support Interface
// Phase 3 RED: BrainWorker Dispute Banner Stub

'use client';

import React from 'react';
import type { DisputeRecord } from '../../lib/disputes/types';

export interface BrainWorkerDisputeBannerProps {
  dispute: DisputeRecord;
  onRespond?: () => void;
}

export function BrainWorkerDisputeBanner(
  _props: BrainWorkerDisputeBannerProps
): React.ReactElement {
  return (
    <div data-testid="brainworker-dispute-banner">
      <p>BrainWorker Dispute Banner Stub</p>
    </div>
  );
}
