// apps/web/app/onsite/[bookingId]/page.tsx
// BW-008: On-Site Work & In-Progress Verification
// Phase 4 RED Route Page Stub

'use client';

import React from 'react';

export interface OnSitePageProps {
  params: Promise<{ bookingId: string }>;
}

export default function OnSitePage(
  _props: OnSitePageProps
): React.ReactElement | null {
  throw new Error('Not implemented: Phase 4 RED stub');
}
