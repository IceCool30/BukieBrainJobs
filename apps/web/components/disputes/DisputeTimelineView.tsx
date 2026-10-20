// apps/web/components/disputes/DisputeTimelineView.tsx
// BW-010: Dispute Handling & Support Interface
// Phase 3 RED: Dispute Timeline View Stub

'use client';

import React from 'react';
import type { DisputeRecord } from '../../lib/disputes/types';

export interface DisputeTimelineViewProps {
  record: DisputeRecord;
}

export function DisputeTimelineView(
  _props: DisputeTimelineViewProps
): React.ReactElement {
  return (
    <div data-testid="dispute-timeline-view">
      <p>Dispute Timeline View Stub</p>
    </div>
  );
}
