'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowLeft, FileText } from 'lucide-react';
import { CustomerActivityItem } from '@bukiebrainjobs/types';
import { LifecycleStateSurface } from './LifecycleStateSurface';

interface ActivityDetailProps {
  activity: CustomerActivityItem | undefined;
  requestedId?: string | null | undefined;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onResetSelected?: (() => void) | undefined;
  onCancel?: ((activityId: string, reason: string) => Promise<void>) | undefined;
  isMutating?: boolean | undefined;
  mutationError?: string | null | undefined;
  onClearMutationError?: (() => void) | undefined;
  className?: string | undefined;
}

export function ActivityDetail({
  activity,
  requestedId,
  isMobileOpen,
  onCloseMobile,
  onResetSelected,
  onCancel,
  isMutating,
  mutationError,
  onClearMutationError,
  className,
}: ActivityDetailProps) {
  const colSpanClass = className || 'lg:col-span-7';

  if (!activity) {
    if (requestedId) {
      return (
        <div
          className={`${colSpanClass} ${
            isMobileOpen
              ? 'fixed inset-0 z-50 bg-[var(--bg)] p-4 sm:p-6 overflow-y-auto lg:static lg:p-0 lg:z-auto'
              : 'hidden lg:block'
          }`}
          role="region"
          aria-label="Activity Detail"
        >
          <div className="bg-[var(--card-bg)] rounded-2xl p-8 border border-[var(--lead)] text-center shadow-xs max-w-xl mx-auto text-[var(--text-main)]">
            <div className="mx-auto w-12 h-12 rounded-lg bg-[var(--tag-bg)] border border-[var(--lead)] text-[var(--amber)] flex items-center justify-center mb-3">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold font-display text-[var(--text-main)] mb-1">
              Activity not found
            </h3>
            <p className="text-xs text-[var(--text-muted)] max-w-xs mx-auto mb-5">
              The requested activity identifier ({requestedId}) was not found in your account history.
            </p>
            <button
              type="button"
              onClick={onResetSelected}
              className="outlier-pill-button inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[var(--amber)] text-[#001A41] text-xs font-bold hover:bg-[var(--amber-hover)] transition cursor-pointer shadow-xs"
            >
              View all activity
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="hidden lg:flex flex-col items-center justify-center p-12 bg-[var(--card-bg)] rounded-2xl border border-[var(--lead)] text-center text-[var(--text-muted)] min-h-[400px]">
        <FileText className="h-10 w-10 text-[var(--lead)] mb-3" />
        <p className="text-sm font-semibold text-[var(--text-main)]">No activity selected</p>
        <p className="text-xs text-[var(--text-muted)] mt-1 max-w-xs">
          Select a service request or booking from the list to view its complete progress and details.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`${colSpanClass} ${
        isMobileOpen
          ? 'fixed inset-0 z-50 bg-[var(--bg)] p-4 sm:p-6 overflow-y-auto lg:static lg:p-0 lg:z-auto'
          : 'hidden lg:block'
      }`}
      role="region"
      aria-label="Activity Detail"
    >
      <div className="relative bg-[var(--card-bg)] text-[var(--text-main)] rounded-2xl p-6 sm:p-8 border border-[var(--lead)] shadow-xs overflow-hidden">
        {/* Decorative Watermark: Subtle brand signature at 3.5% opacity */}
        <Image
          src="/images/logo-watermark.png"
          alt=""
          aria-hidden="true"
          width={280}
          height={280}
          className="pointer-events-none select-none absolute right-2 bottom-2 opacity-[0.035] -z-0"
        />

        {/* Mobile Sticky Back Header with >=48px Touch Target */}
        <div className="lg:hidden flex items-center justify-between pb-4 mb-4 border-b border-[var(--lead)]">
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Back to activity list"
            className="min-h-[48px] min-w-[48px] -ml-2 px-3 py-2 inline-flex items-center gap-2 rounded-lg text-[var(--text-main)] bg-[var(--tag-bg)] border border-[var(--lead)] hover:bg-[var(--card-hover)] font-semibold text-xs transition cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to list</span>
          </button>
          <span className="text-xs font-mono text-[var(--text-muted)]">
            {activity.referenceCode}
          </span>
        </div>

        {/* Lifecycle State Surface */}
        <div className="relative z-10">
          <LifecycleStateSurface
            activity={activity}
            onCancel={onCancel}
            isMutating={isMutating}
            mutationError={mutationError}
            onClearMutationError={onClearMutationError}
          />
        </div>
      </div>
    </div>
  );
}
