'use client';

import React from 'react';
import { MapPin, Calendar, DollarSign, Briefcase, Hash } from 'lucide-react';
import type { RankedMatchResult } from '@bukiebrainjobs/types';

interface JobContextPanelProps {
  result: RankedMatchResult;
}

/**
 * Displays the customer's job request context at the top of the match results screen.
 * Lets the customer understand which request is being matched without repeating data entry.
 *
 * ARCH-002: Renders customer-entered text safely, no dangerouslySetInnerHTML.
 * WEB-012 §7: Shows title, service/category, location, schedule, budget, reference code,
 * and description when available. Omits any field that is not supplied.
 */
export function JobContextPanel({ result }: JobContextPanelProps) {
  const {
    jobReferenceCode,
    jobTitle,
    jobServiceLabel,
    jobLocation,
    jobSchedule,
    jobBudgetLabel,
    jobDescription,
  } = result;

  return (
    <section
      aria-labelledby="job-context-heading"
      className="bg-[#001A41] text-white rounded-2xl p-5 sm:p-6 mb-6"
    >
      {/* Reference + title */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <p className="text-[11px] font-mono text-slate-400 mb-1 flex items-center gap-1">
            <Hash className="h-3 w-3" aria-hidden="true" />
            {jobReferenceCode}
          </p>
          <h2
            id="job-context-heading"
            className="font-display font-bold text-lg sm:text-xl text-white leading-snug"
          >
            {jobTitle}
          </h2>
          {jobServiceLabel && (
            <p className="text-[#abeec8] text-sm mt-0.5 font-medium">{jobServiceLabel}</p>
          )}
        </div>
      </div>

      {/* Meta fields */}
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 mt-3 text-sm text-slate-300">
        {jobLocation && (
          <div className="flex items-start gap-1.5">
            <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <dt className="sr-only">Location</dt>
              <dd>{jobLocation}</dd>
            </div>
          </div>
        )}
        {jobSchedule && (
          <div className="flex items-start gap-1.5">
            <Calendar className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <dt className="sr-only">Schedule</dt>
              <dd>{jobSchedule}</dd>
            </div>
          </div>
        )}
        {jobBudgetLabel && (
          <div className="flex items-start gap-1.5">
            <DollarSign className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <dt className="sr-only">Budget</dt>
              <dd>{jobBudgetLabel}</dd>
            </div>
          </div>
        )}
        {jobServiceLabel && !jobLocation && !jobSchedule && (
          <div className="flex items-start gap-1.5">
            <Briefcase className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <dt className="sr-only">Service</dt>
              <dd>{jobServiceLabel}</dd>
            </div>
          </div>
        )}
      </dl>

      {/* Description: safely rendered as text content only */}
      {jobDescription && (
        <p className="mt-4 text-sm text-slate-300 leading-relaxed border-t border-white/10 pt-3 line-clamp-3">
          {jobDescription}
        </p>
      )}
    </section>
  );
}
