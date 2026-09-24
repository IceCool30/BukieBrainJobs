// apps/web/components/brainworker/onboarding/IdentityStepForm.tsx
// Phase 4 RED Stub: Step 1 Identity Verification Form Component
// Authoritative References:
// - docs/specs/BW-001-architecture-contract.md (Section 2.3)
// - docs/specs/BW-001-ux-design-specification.md (Section 3.2.2)
// - docs/specs/BW-001-test-first-implementation-plan.md (Suite 5: IDE-001 to IDE-008)

import React from 'react';
import type { OnboardingIdentityData } from '../../../lib/brainworker/types';

export interface IdentityStepFormProps {
  initialData?: Partial<OnboardingIdentityData> | null | undefined;
  onSave: (data: OnboardingIdentityData) => void | Promise<void>;
  isSubmitting?: boolean | undefined;
  className?: string | undefined;
}

export function IdentityStepForm(_props: IdentityStepFormProps): React.ReactElement {
  void _props;
  return (
    <div data-testid="identity-step-form-stub">
      <span>Unimplemented IdentityStepForm</span>
    </div>
  );
}
