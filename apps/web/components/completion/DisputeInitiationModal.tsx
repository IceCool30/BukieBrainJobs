// apps/web/components/completion/DisputeInitiationModal.tsx
// BW-009: Post-Job Completion & Escrow Release
// Phase 3 RED Component Stub

'use client';

import React from 'react';

export interface DisputeInitiationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitDispute: (reason: string, details: string) => void | Promise<void>;
  isSubmitting?: boolean;
}

export function DisputeInitiationModal(
  _props: DisputeInitiationModalProps
): React.ReactElement | null {
  if (!_props.isOpen) return null;
  return <div data-testid="dispute-initiation-modal" />;
}
