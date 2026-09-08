'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  MapPin,
  Calendar,
  Clock,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  User,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { CustomerActivityItem } from '@bukiebrainjobs/types';
import { TypeBadge, StatusBadge } from './JobsBadges';

interface ActivityDetailProps {
  activity: CustomerActivityItem | undefined;
  requestedId?: string | null;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onResetSelected?: () => void;
}

export function ActivityDetail({
  activity,
  requestedId,
  isMobileOpen,
  onCloseMobile,
  onResetSelected,
}: ActivityDetailProps) {
  if (!activity) {
    if (requestedId) {
      return (
        <div
          className={`lg:col-span-7 ${
            isMobileOpen
              ? 'fixed inset-0 z-50 bg-[#F8F9FF] p-4 sm:p-6 overflow-y-auto lg:static lg:p-0 lg:z-auto'
              : 'hidden lg:block'
          }`}
          role="region"
          aria-label="Activity Detail"
        >
          <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center shadow-xs">
            <div className="mx-auto w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold font-display text-[#001A41] mb-1">
              Activity not found
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto mb-5">
              The requested activity identifier ({requestedId}) was not found in your account history.
            </p>
            <button
              type="button"
              onClick={onResetSelected}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#001A41] text-white text-xs font-semibold hover:bg-[#002661] transition cursor-pointer"
            >
              View all activity
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="hidden lg:flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-200 text-center text-slate-400 min-h-[400px]">
        <FileText className="h-10 w-10 text-slate-300 mb-3" />
        <p className="text-sm font-medium text-slate-600">No activity selected</p>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">
          Select a service request or booking from the list to view its complete progress and details.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`lg:col-span-7 ${
        isMobileOpen
          ? 'fixed inset-0 z-50 bg-[#F8F9FF] p-4 sm:p-6 overflow-y-auto lg:static lg:p-0 lg:z-auto'
          : 'hidden lg:block'
      }`}
      role="region"
      aria-label="Activity Detail"
    >
      <div className="relative bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs overflow-hidden">
        {/* Decorative Watermark: Subtle brand signature at 3.5% opacity */}
        <Image
          src="/images/logo-badge-512.png"
          alt=""
          aria-hidden="true"
          width={280}
          height={280}
          className="pointer-events-none select-none absolute right-2 bottom-2 opacity-[0.035] -z-0"
        />

        {/* Mobile Sticky Back Header with >=48px Touch Target */}
        <div className="lg:hidden flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Back to activity list"
            className="min-h-[48px] min-w-[48px] -ml-2 px-3 py-2 inline-flex items-center gap-2 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 font-semibold text-xs transition cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to list</span>
          </button>
          <span className="text-xs font-mono text-slate-400">
            {activity.referenceCode}
          </span>
        </div>

        {/* Header info */}
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <TypeBadge type={activity.type} />
              <StatusBadge status={activity.status} label={activity.statusLabel} />
            </div>
            <span className="text-xs font-mono text-slate-400 hidden lg:inline">
              Ref: {activity.referenceCode}
            </span>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-[#001A41]">
              {activity.title}
            </h2>
            {activity.service && (
              <p className="text-xs sm:text-sm font-semibold text-[#296A4B] mt-1">
                {activity.service}
              </p>
            )}
          </div>

          {/* Quick Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 flex items-start gap-3">
              <Calendar className="h-4 w-4 text-[#001A41] shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="block text-slate-400 font-medium">Schedule</span>
                <span className="font-semibold text-slate-900 mt-0.5 block">
                  {activity.schedule}
                </span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 flex items-start gap-3">
              <MapPin className="h-4 w-4 text-[#001A41] shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="block text-slate-400 font-medium">Location</span>
                <span className="font-semibold text-slate-900 mt-0.5 block">
                  {activity.location}
                </span>
              </div>
            </div>

            {activity.budgetOrPrice && (
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 flex items-start gap-3">
                <Clock className="h-4 w-4 text-[#001A41] shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="block text-slate-400 font-medium">
                    {activity.type === 'booking' ? 'Estimated Fee' : 'Budget'}
                  </span>
                  <span className="font-semibold text-slate-900 mt-0.5 block">
                    {activity.budgetOrPrice}
                  </span>
                </div>
              </div>
            )}

            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 flex items-start gap-3">
              <ShieldCheck className="h-4 w-4 text-[#296A4B] shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="block text-slate-400 font-medium">Platform Trust</span>
                <span className="font-semibold text-slate-900 mt-0.5 block">
                  Bukie Escrow & Verification
                </span>
              </div>
            </div>
          </div>

          {/* Customer Description */}
          {activity.description && (
            <div className="pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Job Overview & Requirements
              </h4>
              <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-100 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {activity.description}
              </div>
            </div>
          )}

          {/* Preferred BrainWorker (Preference, NOT live assignment) */}
          {activity.preferredWorker && (
            <div className="pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Preferred Professional
              </h4>
              <div className="bg-blue-50/40 rounded-xl p-4 border border-blue-100/80 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-100 text-[#001A41] flex items-center justify-center font-bold text-xs shrink-0">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-[#001A41]">
                      {activity.preferredWorker.name}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Customer Preference • Not assigned
                    </div>
                  </div>
                </div>
                {activity.preferredWorker.verified && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#296A4B] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                    <ShieldCheck className="h-3 w-3" />
                    Verified
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Progress Timeline / Milestones */}
          <div className="pt-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Activity Progression
            </h4>
            <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 space-y-3">
              <div className="flex items-center gap-3 text-xs">
                <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0" />
                <div className="flex-1 flex items-center justify-between">
                  <span className="font-semibold text-slate-800">Request Recorded</span>
                  <span className="text-slate-400 text-[11px]">{activity.createdAt}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs">
                {activity.status === 'request_received' ? (
                  <div className="h-4 w-4 rounded-full border-2 border-slate-300 shrink-0" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                )}
                <div className="flex-1 flex items-center justify-between">
                  <span
                    className={
                      activity.status === 'request_received'
                        ? 'text-slate-400'
                        : 'font-semibold text-slate-800'
                    }
                  >
                    Booking Preparation
                  </span>
                  {activity.status !== 'request_received' && (
                    <span className="text-slate-400 text-[11px]">Processed</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs">
                {activity.status === 'in_progress' ? (
                  <span className="h-4 w-4 rounded-full bg-amber-500 flex items-center justify-center text-white text-[10px] shrink-0 animate-pulse">
                    ●
                  </span>
                ) : activity.status === 'completed' ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                ) : (
                  <div className="h-4 w-4 rounded-full border-2 border-slate-300 shrink-0" />
                )}
                <div className="flex-1 flex items-center justify-between">
                  <span
                    className={
                      activity.status === 'in_progress'
                        ? 'font-bold text-amber-900'
                        : activity.status === 'completed'
                        ? 'font-semibold text-slate-800'
                        : 'text-slate-400'
                    }
                  >
                    Service Delivery
                  </span>
                  {activity.status === 'in_progress' && (
                    <span className="text-amber-700 text-[11px] font-semibold">Active</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="text-[11px] text-slate-400">
              Reference: <span className="font-mono">{activity.referenceCode}</span>
            </div>

            <div className="flex items-center gap-2">
              {activity.nextAction && (
                <Link
                  href={activity.nextAction.url}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition ${
                    activity.nextAction.primary
                      ? 'bg-[#001A41] text-white hover:bg-[#002661]'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>{activity.nextAction.label}</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
