// apps/web/components/brainworker/onboarding/FunnelProgressBar.tsx
// Phase 4 RED Stub: Funnel Stepper & Progress Component
// Authoritative References:
// - docs/specs/BW-001-architecture-contract.md (Section 2.1)
// - docs/specs/BW-001-ux-design-specification.md (Section 3.2.1)
// - docs/specs/BW-001-test-first-implementation-plan.md (Suite 5: STP-001 to STP-002)

import React from 'react';
import type { OnboardingStep } from '../../../lib/brainworker/types';

export interface FunnelProgressBarProps {
  currentStep: OnboardingStep;
  completedSteps?: OnboardingStep[] | undefined;
  onStepClick?: ((step: OnboardingStep) => void) | undefined;
  className?: string | undefined;
}

export function FunnelProgressBar(_props: FunnelProgressBarProps): React.ReactElement {
  void _props;
  return (
    <div data-testid="funnel-progress-bar-stub">
      <span>Unimplemented FunnelProgressBar</span>
    </div>
  );
}
