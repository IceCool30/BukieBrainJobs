// apps/web/components/brainworker/onboarding/VerificationStatusMonitor.tsx
// Phase 7 RED Stub: Verification Status Monitor Component
// Authoritative References:
// - docs/specs/BW-001-architecture-contract.md (Section 2.4 & 2.5)
// - docs/specs/BW-001-ux-design-specification.md (Section 3.3)
// - docs/specs/BW-001-test-first-implementation-plan.md (Suite 8: VFD-001 to VFD-005)

import React from 'react';
import type {
  BrainWorkerOnboardingRecord,
  OnboardingStep,
} from '../../../lib/brainworker/types';

export interface VerificationStatusMonitorProps {
  record: BrainWorkerOnboardingRecord;
  onRemediate?: ((targetStep: OnboardingStep) => void) | undefined;
  onEnterWorkspace?: (() => void) | undefined;
  className?: string | undefined;
}

export function VerificationStatusMonitor(_props: VerificationStatusMonitorProps): React.ReactElement {
  void _props;
  return (
    <div data-testid="verification-status-monitor-stub">
      <span>Unimplemented VerificationStatusMonitor</span>
    </div>
  );
}
