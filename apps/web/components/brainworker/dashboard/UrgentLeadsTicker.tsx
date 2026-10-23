// apps/web/components/brainworker/dashboard/UrgentLeadsTicker.tsx
// BrainWorker Operating Dashboard: Urgent Leads Ticker Sub-Component
// Item 2.2 in master checklist (COMP-009 to COMP-011)

import React, { type JSX } from 'react';
import type { UrgentLeadsTickerProps } from './types';

export function UrgentLeadsTicker({
  urgentLeads,
  onQuoteLead,
  onViewAllLeads,
}: UrgentLeadsTickerProps): JSX.Element {
  // COMP-010: Empty state card when urgentLeads is empty
  if (urgentLeads.length === 0) {
    return (
      <div
        data-testid="urgent-leads-empty"
        className="rounded-xl border border-dashed border-[var(--rule)] bg-[var(--bg)] p-6 text-center"
      >
        <p className="text-sm font-medium text-[var(--text-muted)]">
          No urgent leads in your area
        </p>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          New emergency and same-day requests will appear here as customers post them.
        </p>
      </div>
    );
  }

  // COMP-009 & COMP-011: Active urgent leads grid (zero raw addresses or phone numbers)
  return (
    <div className="space-y-3" data-testid="urgent-leads-ticker">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          Urgent Opportunities
        </h3>
        {onViewAllLeads && (
          <button
            type="button"
            onClick={onViewAllLeads}
            className="text-xs font-medium text-[var(--amber)] hover:text-[var(--amber-hover)]"
          >
            View All
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {urgentLeads.map((lead) => (
          <div
            key={lead.id}
            data-testid={`urgent-lead-card-${lead.id}`}
            className="flex flex-col justify-between rounded-xl border border-[var(--lead)] bg-[var(--card-bg)] p-4 shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${
                    lead.urgency === 'EMERGENCY'
                      ? 'bg-[var(--danger-dim)] text-[var(--danger)]'
                      : 'bg-[var(--amber-dim)] text-[var(--amber)]'
                  }`}
                >
                  {lead.urgency}
                </span>
                <span className="text-xs text-[var(--text-muted)]">
                  {lead.tradeCategory}
                </span>
              </div>
              <h4 className="mt-2 text-sm font-semibold text-[var(--text-main)]">
                {lead.title}
              </h4>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                {lead.locationArea}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[var(--lead)]">
              <button
                type="button"
                onClick={() => onQuoteLead?.(lead.id)}
                className="w-full rounded-lg bg-[var(--amber)] px-3 py-1.5 text-xs font-bold text-[#001A41] hover:bg-[var(--amber-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--card-bg)]"
              >
                Send Quote
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
