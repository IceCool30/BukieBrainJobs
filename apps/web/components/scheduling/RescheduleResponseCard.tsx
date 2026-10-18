// apps/web/components/scheduling/RescheduleResponseCard.tsx
// BW-007 Phase 3: RescheduleResponseCard Component (RED Stub)

import type React from 'react';
import type { ArrivalWindow, RescheduleReason, RescheduleRequest } from '../../lib/scheduling/types';

export interface RescheduleResponseCardProps {
  request: RescheduleRequest;
  currentUserRole: 'CLIENT' | 'TASKER';
  onAccept?: (selectedWindow: ArrivalWindow) => Promise<void> | void;
  onDecline?: () => Promise<void> | void;
  onCounter?: (
    counterWindows: ArrivalWindow[],
    counterReason?: RescheduleReason,
    counterNote?: string
  ) => Promise<void> | void;
  isSubmitting?: boolean;
}

export function RescheduleResponseCard(_props: RescheduleResponseCardProps): React.JSX.Element {
  throw new Error('Not implemented: Phase 3 RED');
}
