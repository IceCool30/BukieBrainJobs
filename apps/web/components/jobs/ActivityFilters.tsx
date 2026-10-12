'use client';

import React from 'react';
import { ActivityFilterView } from '@bukiebrainjobs/types';

interface ActivityFilterCounts {
  all: number;
  active: number;
  upcoming: number;
  past: number;
}

interface ActivityFiltersProps {
  activeFilter: ActivityFilterView;
  onFilterChange: (filter: ActivityFilterView) => void;
  counts: ActivityFilterCounts;
}

const FILTERS: { id: ActivityFilterView; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active & Pending' },
  { id: 'upcoming', label: 'Upcoming Scheduled' },
  { id: 'past', label: 'Past & Completed' },
];

export function ActivityFilters({
  activeFilter,
  onFilterChange,
  counts,
}: ActivityFiltersProps) {
  return (
    <nav
      role="navigation"
      aria-label="Activity Filters"
      className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 border-b border-[var(--lead)] scrollbar-none"
    >
      {FILTERS.map(({ id, label }) => {
        const isActive = activeFilter === id;
        const count = counts[id] ?? 0;

        return (
          <button
            key={id}
            type="button"
            onClick={() => onFilterChange(id)}
            aria-pressed={isActive}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition shrink-0 cursor-pointer ${
              isActive
                ? 'bg-[var(--amber)] text-white shadow-xs font-bold'
                : 'bg-[var(--card-bg)] text-[var(--text-muted)] border border-[var(--lead)] hover:bg-[var(--card-hover)] hover:text-[var(--text-main)]'
            }`}
          >
            <span>{label}</span>
            <span
              className={`text-[11px] px-1.5 py-0.5 rounded-md ${
                isActive ? 'bg-white/20 text-white font-bold' : 'bg-[var(--tag-bg)] text-[var(--text-muted)]'
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
