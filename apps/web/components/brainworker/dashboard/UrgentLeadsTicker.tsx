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
        className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center dark:border-slate-800 dark:bg-slate-900/50"
      >
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
          No urgent leads in your area
        </p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
          New emergency and same-day requests will appear here as customers post them.
        </p>
      </div>
    );
  }

  // COMP-009 & COMP-011: Active urgent leads grid (zero raw addresses or phone numbers)
  return (
    <div className="space-y-3" data-testid="urgent-leads-ticker">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Urgent Opportunities
        </h3>
        {onViewAllLeads && (
          <button
            type="button"
            onClick={onViewAllLeads}
            className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
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
            className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${
                    lead.urgency === 'EMERGENCY'
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                  }`}
                >
                  {lead.urgency}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {lead.tradeCategory}
                </span>
              </div>
              <h4 className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                {lead.title}
              </h4>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {lead.locationArea}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => onQuoteLead?.(lead.id)}
                className="w-full rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
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
