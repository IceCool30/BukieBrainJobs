import React from 'react';

interface TelemetryStripProps {
  activeCount?: number;
  latencyLabel?: string;
}

/**
 * Top telemetry utility bar. Navy structural anchor with a green pulsing
 * live beacon. Counts are only shown when supplied by the caller so the
 * strip never renders fabricated marketplace figures.
 */
export default function TelemetryStrip({ activeCount, latencyLabel }: TelemetryStripProps) {
  return (
    <aside className="telemetry-strip" aria-label="Marketplace status">
      <span className="telemetry-item">
        <span className="live-indicator" aria-hidden="true" />
        BukieBrainJobs Stream{latencyLabel ? ` // ${latencyLabel}` : ''}
      </span>
      <span className="telemetry-item telemetry-hide-mobile">
        {typeof activeCount === 'number'
          ? `Active Verified Requisitions: ${activeCount}`
          : 'Verified Requisition Index Live'}
      </span>
      <span className="telemetry-item">Escrow Security: BukieGuarantee™</span>
    </aside>
  );
}
