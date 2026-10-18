// apps/web/components/scheduling/ArrivalWindowCard.tsx
// BW-007 Phase 3: ArrivalWindowCard Component (RED Stub)

import type React from 'react';
import type { ArrivalWindow, DispatchStatus, JobStatus } from '../../lib/scheduling/types';

export interface ArrivalWindowCardProps {
  arrivalWindow: ArrivalWindow;
  jobStatus: JobStatus;
  dispatchStatus: DispatchStatus;
  onRequestReschedule?: () => void;
  canReschedule?: boolean;
}

export function ArrivalWindowCard(_props: ArrivalWindowCardProps): React.JSX.Element {
  throw new Error('Not implemented: Phase 3 RED');
}
