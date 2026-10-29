'use client';

import React from 'react';
import { MapPin, Calendar, ArrowRight } from 'lucide-react';
import { CustomerActivityItem } from '@bukiebrainjobs/types';
import { TypeBadge, StatusBadge } from './JobsBadges';

interface ActivityCardProps {
  activity: CustomerActivityItem;
  isSelected: boolean;
  onSelect: () => void;
}

export function ActivityCard({ activity, isSelected, onSelect }: ActivityCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      role="button"
      aria-pressed={isSelected}
      aria-label={`Select ${activity.title}, ${activity.statusLabel}`}
      className={`w-full text-left p-4 sm:p-5 rounded-2xl border transition group cursor-pointer ${
        isSelected
          ? 'bg-[var(--amber)]/10 border-[var(--amber)] ring-1 ring-[var(--amber)] shadow-xs'
          : 'bg-[var(--card-bg)] border-[var(--lead)] hover:border-[var(--lead)]/80 hover:shadow-xs'
      }`}
    >
      {/* Header: Type & Status Badges */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <TypeBadge type={activity.type} />
          <StatusBadge status={activity.status} label={activity.statusLabel} />
        </div>
        <span className="text-[11px] font-mono text-[var(--text-muted)] shrink-0">
          {activity.createdAt}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-bold text-sm sm:text-base text-[var(--text-main)] group-hover:text-[var(--amber)] transition line-clamp-1">
        {activity.title}
      </h3>

      {/* Sub-meta: Location & Schedule */}
      <div className="mt-2.5 space-y-1 text-xs text-[var(--text-muted)]">
        <div className="flex items-center gap-1.5 truncate">
          <MapPin className="h-3.5 w-3.5 text-[var(--text-muted)] shrink-0" />
          <span className="truncate">{activity.location}</span>
        </div>
        <div className="flex items-center gap-1.5 truncate">
          <Calendar className="h-3.5 w-3.5 text-[var(--text-muted)] shrink-0" />
          <span className="truncate">{activity.schedule}</span>
        </div>
      </div>

      {/* Footer info: Budget & Action */}
      <div className="mt-3 pt-3 border-t border-[var(--lead)] flex items-center justify-between text-xs">
        {activity.budgetOrPrice ? (
          <span className="font-semibold text-[var(--text-main)] truncate">
            {activity.budgetOrPrice}
          </span>
        ) : (
          <span className="text-[var(--text-muted)]">Ref: {activity.referenceCode}</span>
        )}
        <span className="text-[var(--amber)] font-bold inline-flex items-center gap-1">
          Details <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </button>
  );
}
