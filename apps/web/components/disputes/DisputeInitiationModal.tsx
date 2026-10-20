// apps/web/components/disputes/DisputeInitiationModal.tsx
// BW-010: Dispute Handling & Support Interface
// Phase 3 RED: Dispute Initiation Modal Stub

'use client';

import React from 'react';
import type { DisputeCategory, DisputeEvidence } from '../../lib/disputes/types';

export interface DisputeInitiationModalProps {
  isOpen: boolean;
  bookingId: string;
  initiatorRole: 'CUSTOMER' | 'BRAINWORKER' | 'customer' | 'brainworker';
  eligible?: boolean;
  onClose: () => void;
  onSubmit: (data: {
    category: DisputeCategory;
    reason?: DisputeCategory;
    description: string;
    evidence: DisputeEvidence[];
  }) => Promise<void> | void;
  isSubmitting?: boolean;
}

export function DisputeInitiationModal({
  isOpen,
}: DisputeInitiationModalProps): React.ReactElement | null {
  if (!isOpen) return null;
  return (
    <div data-testid="dispute-initiation-modal">
      <p>Dispute Initiation Modal Stub</p>
    </div>
  );
}
