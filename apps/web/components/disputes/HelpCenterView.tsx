// apps/web/components/disputes/HelpCenterView.tsx
// BW-010: Dispute Handling & Support Interface
// Phase 3 RED: Help Center View Stub

'use client';

import React from 'react';

export interface HelpCenterViewProps {
  searchQuery?: string;
  onSelectCategory?: (category: string) => void;
}

export function HelpCenterView(
  _props: HelpCenterViewProps
): React.ReactElement {
  return (
    <div data-testid="help-center-view">
      <p>Help Center View Stub</p>
    </div>
  );
}
