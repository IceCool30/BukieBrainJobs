// apps/web/components/onsite/ScopeAdjustmentModal.tsx
// BW-008: On-Site Work & In-Progress Verification
// Phase 3 RED Component Stub

'use client';

import React from 'react';
import type { ScopeAdjustmentReasonCategory } from '../../lib/onsite/types';

export interface ScopeAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: {
    category: ScopeAdjustmentReasonCategory;
    description: string;
    additionalLaborKobo: number;
    additionalMaterialsKobo: number;
  }) => void | Promise<void>;
  isSubmitting?: boolean | undefined;
}

export function ScopeAdjustmentModal(
  _props: ScopeAdjustmentModalProps
): React.ReactElement | null {
  throw new Error('Not implemented: Phase 3 RED stub');
}
