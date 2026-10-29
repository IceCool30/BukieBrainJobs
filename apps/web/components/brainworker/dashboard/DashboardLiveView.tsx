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
        <div className="h-12 w-1/3 rounded-xl bg-[var(--tag-bg)]" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-32 rounded-xl bg-[var(--tag-bg)]"
            />
          ))}
        </div>
        <div className="h-48 rounded-xl bg-[var(--tag-bg)]" />
      </div>
    );
  }

  // COMP-002: Resilient Error Alert State
  if (error) {
    return (
      <div className="p-4 sm:p-6">
        <div
          role="alert"
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-[var(--danger-border)] bg-[var(--danger-dim)] p-4 text-[var(--danger)]"
        >
          <div>
            <h3 className="text-sm font-semibold">Dashboard Notice</h3>
            <p className="mt-1 text-sm">{error}</p>
          </div>
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="rounded-md bg-[var(--danger)] px-3.5 py-1.5 text-xs font-medium text-white shadow-xs hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
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
      <div className="p-4 sm:p-6 text-center text-[var(--text-muted)]">
        No operational data available.
      </div>
    );
  }

  const { metrics, urgentLeads, operationalStatus } = feed;

  return (
    <div className="space-y-6 p-4 sm:p-6" data-testid="dashboard-live-view">
      {/* Operational Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-[var(--lead)] bg-[var(--card-bg)] p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[var(--text-main)]">
              Operations Command Center
            </h1>
            {operationalStatus.isEmergencyAvailable && (
              <span className="rounded-full bg-[var(--amber-dim)] px-2.5 py-0.5 text-xs font-semibold text-[var(--amber)]">
                Emergency On-Call
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {operationalStatus.primaryTradeName || 'General Trade'}{' '}
            {operationalStatus.isComplete ? '• Verified Specialist' : '• Profile Incomplete'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {onToggleAvailability && (
            <button
              type="button"
              onClick={() => onToggleAvailability(!operationalStatus.isAvailable)}
              className={`rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors ${
                operationalStatus.isAvailable
                  ? 'bg-[var(--brand-green-dim)] text-[var(--brand-green)] hover:bg-emerald-200'
                  : 'bg-[var(--tag-bg)] text-[var(--text-muted)] hover:bg-[var(--card-hover)]'
              }`}
            >
              Duty: {operationalStatus.isAvailable ? 'On-Duty' : 'Off-Duty'}
            </button>
          )}

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="rounded-md border border-[var(--rule)] bg-[var(--card-bg)] px-3.5 py-1.5 text-xs font-medium text-[var(--text-muted)] shadow-xs hover:bg-[var(--card-hover)]"
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
          className="flex items-center justify-between rounded-2xl border border-[var(--lead)] bg-[var(--card-bg)] p-4 text-left shadow-xs transition-all hover:border-[var(--rule)] hover:bg-[var(--card-hover)]"
        >
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-main)]">
              Dispatch Sheet & Bookings
            </h3>
            <p className="mt-0.5 text-xs text-[var(--text-muted)]">
              Manage arrival, check-in, on-site diagnostics, and job progression
            </p>
          </div>
          <span className="text-xs font-medium text-[var(--amber)]">
            Open Sheet →
          </span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate?.('/brainworker/leads')}
          className="flex items-center justify-between rounded-2xl border border-[var(--lead)] bg-[var(--card-bg)] p-4 text-left shadow-xs transition-all hover:border-[var(--rule)] hover:bg-[var(--card-hover)]"
        >
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-main)]">
              Leads & Quote Requests
            </h3>
            <p className="mt-0.5 text-xs text-[var(--text-muted)]">
              Review customer invitations, respond with quotes, or decline conflicts
            </p>
          </div>
          <span className="text-xs font-medium text-[var(--amber)]">
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
