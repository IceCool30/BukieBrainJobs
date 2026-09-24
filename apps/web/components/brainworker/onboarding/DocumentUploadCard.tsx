// apps/web/components/brainworker/onboarding/DocumentUploadCard.tsx
// Phase 3 RED Stub: Document Staging & Preview Card Component
// Authoritative References:
// - docs/specs/BW-001-architecture-contract.md (Section 2.2 & 6)
// - docs/specs/BW-001-ux-design-specification.md (Section 3.2.4 & 4)
// - docs/specs/BW-001-test-first-implementation-plan.md (Suite 4: DOC-001 to DOC-009)

import React from 'react';
import type {
  DocumentCategory,
  SpecificDocumentType,
  StagedDocument,
} from '../../../lib/brainworker/types';

export interface DocumentUploadCardProps {
  id?: string | undefined;
  label: string;
  description?: string | undefined;
  category: DocumentCategory;
  specificType: SpecificDocumentType;
  value?: StagedDocument | null | undefined;
  onChange: (file: {
    name: string;
    size: number;
    type: string;
    category: DocumentCategory;
    specificType: SpecificDocumentType;
    previewUrl?: string | undefined;
    file?: File | undefined;
  }) => void | Promise<void>;
  onRemove?: ((documentId: string) => void | Promise<void>) | undefined;
  disabled?: boolean | undefined;
  error?: string | null | undefined;
  required?: boolean | undefined;
  className?: string | undefined;
}

export function DocumentUploadCard(_props: DocumentUploadCardProps): React.ReactElement {
  // RED stub - returns minimal element to establish failing contract
  return (
    <div data-testid="document-upload-card-stub">
      <span>Unimplemented</span>
    </div>
  );
}
