// apps/web/app/disputes/[bookingId]/dev-harness.tsx
// BW-010: Attaches development test harness to window only when process.env.NODE_ENV !== 'production'
// Kept strictly outside DisputeBookingPageView production component.
// Strictly zero em dashes in comments, identifiers, or UI text.

'use client';

import React, { useEffect } from 'react';
import { attachDisputeDevHarness } from '../../../lib/disputes/testing/dev-harness';

export function DisputeDevHarness(): React.ReactElement | null {
  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
      return attachDisputeDevHarness();
    }
  }, []);

  return null;
}

export default DisputeDevHarness;
