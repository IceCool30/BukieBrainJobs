// apps/web/components/brainworker/onboarding/TradeStepForm.tsx
// Phase 5 RED Stub: Step 2 Trade & Coverage Form Component
// Authoritative References:
// - docs/specs/BW-001-architecture-contract.md (Section 2.3)
// - docs/specs/BW-001-ux-design-specification.md (Section 3.2.3)
// - docs/specs/BW-001-test-first-implementation-plan.md (Suite 6: TRD-001 to TRD-008)

import React from 'react';
import type { OnboardingTradeData } from '../../../lib/brainworker/types';

export interface TradeStepFormProps {
  initialData?: Partial<OnboardingTradeData> | null | undefined;
  onSave: (data: OnboardingTradeData) => void | Promise<void>;
  onBack: () => void;
  isSubmitting?: boolean | undefined;
  className?: string | undefined;
}

export function TradeStepForm(_props: TradeStepFormProps): React.ReactElement {
  void _props;
  return (
    <div data-testid="trade-step-form-stub">
      <span>Unimplemented TradeStepForm</span>
    </div>
  );
}
