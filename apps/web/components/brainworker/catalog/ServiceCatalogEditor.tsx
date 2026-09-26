// apps/web/components/brainworker/catalog/ServiceCatalogEditor.tsx
// Phase 4 RED Stub: Service Catalog & Rates Editor Component
// Governed by: BW-002 Architecture Contract v1.2 & Test-First Implementation Plan v1.2 (Suite 4: CMP-001 to CMP-008)

'use client';

import React from 'react';
import type {
  IBrainWorkerOperationsRepository,
  BrainWorkerServiceCatalog,
} from '../../../lib/brainworker/catalog/types';

export interface ServiceCatalogEditorProps {
  brainWorkerId?: string | undefined;
  initialCatalog?: BrainWorkerServiceCatalog | undefined;
  repository?: IBrainWorkerOperationsRepository | undefined;
  onSaveSuccess?: ((savedCatalog: BrainWorkerServiceCatalog) => void) | undefined;
  onSaveError?: ((error: Error) => void) | undefined;
  className?: string | undefined;
}

export function ServiceCatalogEditor(_props: ServiceCatalogEditorProps): React.ReactElement {
  void _props;

  // RED stub - returns minimal element to establish failing contract
  return (
    <div
      data-testid="service-catalog-editor-stub"
      role="region"
      aria-label="Service Catalog & Pricing"
    >
      <span>Service Catalog Editor Stub (Unimplemented)</span>
    </div>
  );
}
