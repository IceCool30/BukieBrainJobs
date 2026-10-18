// apps/web/components/scheduling/DispatchStatusUpdater.tsx
// BW-007 Phase 3: DispatchStatusUpdater Component (RED Stub)

import type React from 'react';
import type { DispatchStatus } from '../../lib/scheduling/types';

export interface DispatchStatusUpdaterProps {
  dispatchStatus: DispatchStatus;
  onUpdateStatus: (nextStatus: DispatchStatus) => Promise<void> | void;
  isUpdating?: boolean;
}

export function DispatchStatusUpdater(_props: DispatchStatusUpdaterProps): React.JSX.Element {
  throw new Error('Not implemented: Phase 3 RED');
}
