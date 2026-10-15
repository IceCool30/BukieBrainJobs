// apps/web/components/brainworker/dashboard/DashboardLiveView.tsx
// BrainWorker Operating Dashboard: Main Live View Component
// Item 2.2 in master checklist (COMP-001, COMP-002, COMP-012)

import React, { type JSX } from 'react';
import type { DashboardLiveViewProps } from './types';
import { DashboardMetricsCards } from './DashboardMetricsCards';
import { UrgentLeadsTicker } from './UrgentLeadsTicker';

export function DashboardLiveView({
  feed,
  isLoading,
  error,
  onRefresh,
  onToggleAvailability,
  onNavigate,
}: DashboardLiveViewProps): JSX.Element {
  // COMP-001: Loading Skeleton State
  if (isLoading) {
    return (
      <div
        data-testid="dashboard-loading-skeleton"
        className="space-y-6 animate-pulse p-4 sm:p-6"
      >
        <div className="h-12 w-1/3 rounded-xl bg-slate-200 dark:bg-slate-800" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-32 rounded-xl bg-slate-200 dark:bg-slate-800"
            />
          ))}
        </div>
        <div className="h-48 rounded-xl bg-slate-200 dark:bg-slate-800" />
      </div>
    );
  }

  // COMP-002: Resilient Error Alert State
  if (error) {
    return (
      <div className="p-4 sm:p-6">
        <div
          role="alert"
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/50 dark:text-rose-200"
        >
          <div>
            <h3 className="text-sm font-semibold">Dashboard Notice</h3>
            <p className="mt-1 text-sm">{error}</p>
          </div>
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 dark:bg-rose-500 dark:hover:bg-rose-600"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!feed) {
    return (
      <div className="p-4 sm:p-6 text-center text-slate-500 dark:text-slate-400">
        No operational data available.
      </div>
    );
  }

  const { metrics, urgentLeads, operationalStatus } = feed;

  return (
    <div className="space-y-6 p-4 sm:p-6" data-testid="dashboard-live-view">
      {/* Operational Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Operations Command Center
            </h1>
            {operationalStatus.isEmergencyAvailable && (
              <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                Emergency On-Call
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {operationalStatus.primaryTradeName || 'General Trade'}{' '}
            {operationalStatus.isComplete ? '• Verified Specialist' : '• Profile Incomplete'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {onToggleAvailability && (
            <button
              type="button"
              onClick={() => onToggleAvailability(!operationalStatus.isAvailable)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                operationalStatus.isAvailable
                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:hover:bg-emerald-900'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              Duty: {operationalStatus.isAvailable ? 'On-Duty' : 'Off-Duty'}
            </button>
          )}

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Refresh
            </button>
          )}
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onNavigate?.('/brainworker/bookings')}
          className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 dark:hover:bg-slate-800/50"
        >
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Dispatch Sheet & Bookings
            </h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Manage arrival, check-in, on-site diagnostics, and job progression
            </p>
          </div>
          <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
            Open Sheet →
          </span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate?.('/brainworker/leads')}
          className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 dark:hover:bg-slate-800/50"
        >
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Leads & Quote Requests
            </h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Review customer invitations, respond with quotes, or decline conflicts
            </p>
          </div>
          <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
            View Inbox →
          </span>
        </button>
      </div>

      {/* Primary Metrics Grid */}
      <DashboardMetricsCards
        metrics={metrics}
        onSelectActiveJob={(id) => onNavigate?.(`/brainworker/bookings/${id}`)}
        onNavigateToBookings={() => onNavigate?.('/brainworker/bookings')}
        onNavigateToLeads={() => onNavigate?.('/brainworker/leads')}
      />

      {/* Urgent Leads Ticker Section */}
      <UrgentLeadsTicker
        urgentLeads={urgentLeads}
        onQuoteLead={(id) => onNavigate?.(`/brainworker/leads?quote=${id}`)}
        onViewAllLeads={() => onNavigate?.('/brainworker/leads')}
      />
    </div>
  );
}
