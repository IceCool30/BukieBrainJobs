// apps/web/components/disputes/DisputeEvidenceUploader.tsx
// BW-010: Dispute Handling & Support Interface
// Phase 3 RED: Dispute Evidence Uploader Stub

'use client';

import React from 'react';
import type { DisputeEvidence } from '../../lib/disputes/types';

export interface DisputeEvidenceUploaderProps {
  evidenceList: DisputeEvidence[];
  onChange: (items: DisputeEvidence[]) => void;
  maxItems?: number;
  disabled?: boolean;
}

export function DisputeEvidenceUploader(
  _props: DisputeEvidenceUploaderProps
): React.ReactElement {
  return (
    <div data-testid="dispute-evidence-uploader">
      <p>Dispute Evidence Uploader Stub</p>
    </div>
  );
}
