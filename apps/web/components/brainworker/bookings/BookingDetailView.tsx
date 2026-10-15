// apps/web/components/brainworker/bookings/BookingDetailView.tsx
// BW-004 Phase 7 RED: Operational Booking Detail View (UI-007 to UI-024)
// Governed by:
//   docs/specs/BW-004-architecture-contract.md (sections 5, 6, 7, 14, 15, 16)
//   docs/specs/BW-004-booking-management.md
//   docs/specs/BW-004-test-first-implementation-plan.md (Phase 7: UI-007 to UI-024)
//
// Invariant Rules:
// 1. Zero imports from testing/ (REP-010).
// 2. Five-block operational detail layout: State, Position, Context, Action, Recovery.
// 3. Address unlocks only when escrow is held; exact warning when pending.
// 4. Sequential dispatch controls (EN_ROUTE -> ARRIVED); no backwards transition.
// 5. Check-in captures single location snapshot; zero GPS tracking, zero manual bypass.
// 6. Scope adjustment drawer derives total; never labels pending as approved.
// 7. Cancellation modal traps focus, restores focus, requires note for OTHER.
// 8. Zero wallet balances, payout figures, or earnings previews anywhere.

import React from 'react';
import type {
  IBrainWorkerBookingsRepository,
  ProviderBookingDetail,
} from '../../../lib/brainworker/bookings/types';

export interface BookingDetailViewProps {
  brainWorkerId: string;
  bookingId: string;
  repository: IBrainWorkerBookingsRepository;
  initialDetail?: ProviderBookingDetail;
  isOffline?: boolean;
  onBack?: () => void;
}

/**
 * Operational booking detail view component.
 * RED Phase Stub: throws "RED: not implemented".
 */
export function BookingDetailView(
  _props: BookingDetailViewProps
): React.ReactElement {
  throw new Error('RED: not implemented');
}
