// apps/web/components/scheduling/RescheduleProposalModal.tsx
// BW-007 Phase 3: RescheduleProposalModal Component (RED Stub)

import type React from 'react';
import type { ArrivalWindow, RescheduleReason } from '../../lib/scheduling/types';

export interface RescheduleProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitProposal: (input: {
    proposedWindows: ArrivalWindow[];
    reason: RescheduleReason;
    reasonNote?: string;
  }) => Promise<void> | void;
  currentArrivalWindow?: ArrivalWindow;
  isSubmitting?: boolean;
}

export function RescheduleProposalModal(_props: RescheduleProposalModalProps): React.JSX.Element | null {
  throw new Error('Not implemented: Phase 3 RED');
}
