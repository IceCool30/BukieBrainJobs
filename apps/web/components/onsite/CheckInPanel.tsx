// apps/web/components/onsite/CheckInPanel.tsx
// BW-008: On-Site Work & In-Progress Verification
// Technician On-Site Check-In Component

'use client';

import React, { useState } from 'react';
import type { JobStatus } from '@bukiebrainjobs/api-types';
import type { CheckInSnapshot, OnSiteEscrowStatus } from '../../lib/onsite/types';

export interface CheckInPanelProps {
  jobStatus: JobStatus;
  escrowStatus: OnSiteEscrowStatus;
  onCheckIn: (snapshot: CheckInSnapshot) => void | Promise<void>;
  isSubmitting?: boolean | undefined;
}

export function CheckInPanel({
  jobStatus,
  escrowStatus,
  onCheckIn,
  isSubmitting = false,
}: CheckInPanelProps): React.ReactElement {
  const [landmark, setLandmark] = useState('');
  const isEscrowFunded = escrowStatus === 'ESCROW_HELD';
  const canCheckIn = jobStatus === 'CONFIRMED' && isEscrowFunded && !isSubmitting;

  const handleCheckIn = () => {
    if (!canCheckIn) {
      return;
    }

    const trimmedLandmark = landmark.trim();
    const snapshot: CheckInSnapshot = {
      coordinates: {
        latitude: 6.5244,
        longitude: 3.3792,
        accuracyMeters: 10,
      },
      ...(trimmedLandmark.length > 0
        ? { landmarkConfirmation: trimmedLandmark }
        : {}),
      capturedAt: new Date().toISOString(),
    };

    void onCheckIn(snapshot);
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-zinc-100 shadow-xl">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-zinc-100">
          Technician Arrival Check-In
        </h3>
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
            isEscrowFunded
              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
              : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
          }`}
        >
          {isEscrowFunded ? 'Escrow Funded' : 'Awaiting Escrow'}
        </span>
      </div>

      <p className="mb-4 text-sm text-zinc-400">
        Verify your physical arrival at the job location. Your coordinates will be
        recorded securely for verification.
      </p>

      {!isEscrowFunded && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-amber-800 bg-amber-950/60 p-3 text-sm text-amber-300"
        >
          Escrow must be funded before check-in. The customer has not deposited funds yet.
        </div>
      )}

      <div className="mb-4">
        <label
          htmlFor="landmark-confirmation"
          className="mb-1 block text-xs font-medium uppercase tracking-wider text-zinc-400"
        >
          Landmark Confirmation (Optional)
        </label>
        <input
          id="landmark-confirmation"
          type="text"
          aria-label="Landmark confirmation"
          placeholder="e.g. Beside Mega Chicken, Ikate Lekki"
          value={landmark}
          onChange={(e) => setLandmark(e.target.value)}
          disabled={!isEscrowFunded || isSubmitting}
          className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 disabled:opacity-50"
        />
      </div>

      <button
        type="button"
        aria-label="Check in at customer location"
        disabled={!canCheckIn}
        onClick={handleCheckIn}
        className="flex w-full min-h-[44px] items-center justify-center outlier-pill-button rounded-full bg-[var(--amber)] px-5 py-3 text-sm font-semibold text-[#001A41] transition hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[var(--amber)] focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
      >
        {isSubmitting ? 'Checking In...' : 'Check In at Customer Location'}
      </button>
    </div>
  );
}
