// apps/web/components/brainworker/bookings/BookingsListView.tsx
// BW-004 Phase 7 RED: Operational Booking List View (UI-001 to UI-006)
// Governed by:
//   docs/specs/BW-004-architecture-contract.md (sections 5, 6, 7, 14, 15, 16)
//   docs/specs/BW-004-booking-management.md
//   docs/specs/BW-004-test-first-implementation-plan.md (Phase 7: UI-001 to UI-006)
//
// Invariant Rules:
// 1. Zero imports from testing/ (REP-010).
// 2. Operational dispatch sheet style: clean, utilitarian, zero decorative distraction.
// 3. Grouped into Today, Upcoming, Then Later, and Cancelled/Expired.
// 4. Sorted strictly by scheduledStartAt ascending; zero urgency scores.
// 5. Offline disables all mutations with plain-language reasons.
// 6. Zero wallet, payout, or platform fee numbers.

import React from 'react';
import type { IBrainWorkerBookingsRepository } from '../../../lib/brainworker/bookings/types';

export interface BookingsListViewProps {
  brainWorkerId: string;
  repository: IBrainWorkerBookingsRepository;
  isDegraded?: boolean;
  isOffline?: boolean;
  onSelectBooking?: (bookingId: string) => void;
}

/**
 * Operational booking list view component.
 * RED Phase Stub: throws "RED: not implemented".
 */
export function BookingsListView(
  _props: BookingsListViewProps
): React.ReactElement {
  throw new Error('RED: not implemented');
}
