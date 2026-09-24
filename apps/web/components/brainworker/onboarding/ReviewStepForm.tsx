// apps/web/components/brainworker/onboarding/ReviewStepForm.tsx
// Phase 6 RED Stub: Step 4 Review & Submit Form Component
// Authoritative References:
// - docs/specs/BW-001-architecture-contract.md (Section 2.3 & 2.4)
// - docs/specs/BW-001-ux-design-specification.md (Section 3.2.5)
// - docs/specs/BW-001-test-first-implementation-plan.md (Suite 7: REV-001 to REV-005)

import React from 'react';
import type {
  OnboardingIdentityData,
  OnboardingTradeData,
  OnboardingCredentialsData,
  OnboardingStep,
} from '../../../lib/brainworker/types';

export interface ReviewStepFormProps {
  identityData: OnboardingIdentityData;
  tradeData: OnboardingTradeData;
  credentialsData: OnboardingCredentialsData;
  onEditStep: (step: OnboardingStep) => void;
  onBack: () => void;
  onSubmit: (declaration: {
    truthfulnessAcknowledged: boolean;
    termsAccepted: boolean;
    declaredAt: string;
  }) => void | Promise<void>;
  isSubmitting?: boolean | undefined;
  className?: string | undefined;
}

export function ReviewStepForm(_props: ReviewStepFormProps): React.ReactElement {
  void _props;
  return (
    <div data-testid="review-step-form-stub">
      <span>Unimplemented ReviewStepForm</span>
    </div>
  );
}
