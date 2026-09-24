// apps/web/components/brainworker/onboarding/CredentialsStepForm.tsx
// Phase 6 RED Stub: Step 3 Credentials & Evidence Form Component
// Authoritative References:
// - docs/specs/BW-001-architecture-contract.md (Section 2.3)
// - docs/specs/BW-001-ux-design-specification.md (Section 3.2.4)
// - docs/specs/BW-001-test-first-implementation-plan.md (Suite 7: CRD-001 to CRD-004)

import React from 'react';
import type {
  OnboardingCredentialsData,
  StagedDocument,
} from '../../../lib/brainworker/types';

export interface CredentialsStepFormProps {
  initialData?: Partial<OnboardingCredentialsData> | null | undefined;
  onSave: (data: OnboardingCredentialsData) => void | Promise<void>;
  onBack: () => void;
  onStageDocument?: ((doc: StagedDocument) => void) | undefined;
  onRemoveDocument?: ((id: string) => void) | undefined;
  isSubmitting?: boolean | undefined;
  className?: string | undefined;
}

export function CredentialsStepForm(_props: CredentialsStepFormProps): React.ReactElement {
  void _props;
  return (
    <div data-testid="credentials-step-form-stub">
      <span>Unimplemented CredentialsStepForm</span>
    </div>
  );
}
