// apps/web/components/brainworker/leads/LeadsInboxView.tsx
// Phase 5 GREEN: Lead Feed & Inspection UI Component
// Governed by: BW-003 UX Design Specification v1.0 & Test-First Implementation Plan v1.0 (Suite 5: UI-001 to UI-012)

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type {
  IBrainWorkerLeadsRepository,
  DeclineReason,
} from '../../../lib/brainworker/leads/types';
import type { ProviderProjectedLead } from '../../../lib/brainworker/leads/domain';
import { getBrainWorkerLeadsRepository } from '../../../lib/brainworker/leads/repository';

export interface LeadsInboxViewProps {
  brainWorkerId: string;
  repository?: IBrainWorkerLeadsRepository | undefined;
  isOffline?: boolean | undefined;
  isDegraded?: boolean | undefined;
  isMobile?: boolean | undefined;
  className?: string | undefined;
}

const DECLINE_REASON_OPTIONS: ReadonlyArray<{
  reason: DeclineReason;
  label: string;
  description: string;
}> = [
  {
    reason: 'SCHEDULE_CONFLICT',
    label: 'Schedule Conflict',
    description: 'Requested timing conflicts with existing commitments.',
  },
  {
    reason: 'OUTSIDE_COVERAGE_AREA',
    label: 'Outside Coverage Area',
    description: 'Job location is outside my operating zones or travel radius.',
  },
  {
    reason: 'SKILL_TOOL_MISMATCH',
    label: 'Skill or Tool Mismatch',
    description: 'Task requires specialized equipment outside my active catalog.',
  },
  {
    reason: 'RATE_BUDGET_MISMATCH',
    label: 'Rate or Budget Mismatch',
    description: 'Customer budget does not align with standard labor rates.',
  },
  {
    reason: 'TEMPORARILY_UNAVAILABLE',
    label: 'Temporarily Unavailable',
    description: 'Currently handling emergency jobs or temporarily off-duty.',
  },
  {
    reason: 'OTHER',
    label: 'Other Reason',
    description: 'Other operational or logistical reason.',
  },
];

export function LeadsInboxView({
  brainWorkerId,
  repository,
  isOffline = false,
  isDegraded = false,
  isMobile = false,
  className = '',
}: LeadsInboxViewProps): React.ReactElement {
  const activeRepo = useMemo(
    () => repository ?? getBrainWorkerLeadsRepository(),
    [repository]
  );

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [leads, setLeads] = useState<ProviderProjectedLead[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [isDeclineModalOpen, setIsDeclineModalOpen] = useState<boolean>(false);
  const [selectedDeclineReason, setSelectedDeclineReason] = useState<DeclineReason | null>(null);
  const [isSubmittingMutation, setIsSubmittingMutation] = useState<boolean>(false);

  const fetchLeads = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const page = await activeRepo.getLeads(brainWorkerId);
      setLeads(page.items);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not load job requests';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }, [activeRepo, brainWorkerId]);

  useEffect(() => {
    void fetchLeads();
  }, [fetchLeads]);

  const selectedLead = useMemo(() => {
    if (!selectedLeadId) return null;
    return leads.find((l) => l.id === selectedLeadId) ?? null;
  }, [leads, selectedLeadId]);

  // Keyboard accessibility: handle Escape key to close modal or inspection
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isDeclineModalOpen) {
          setIsDeclineModalOpen(false);
          setSelectedDeclineReason(null);
        } else if (selectedLeadId) {
          setSelectedLeadId(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDeclineModalOpen, selectedLeadId]);

  const handleAccept = async () => {
    if (!selectedLead || isOffline || isSubmittingMutation) return;
    setIsSubmittingMutation(true);
    try {
      const result = await activeRepo.acceptInvitation(
        brainWorkerId,
        selectedLead.invitationId
      );
      if (result.ok) {
        setLeads((prev) =>
          prev.map((item) =>
            item.id === selectedLead.id
              ? { ...item, invitationState: 'ACCEPTED' }
              : item
          )
        );
      }
    } finally {
      setIsSubmittingMutation(false);
    }
  };

  const handleConfirmDecline = async () => {
    if (!selectedLead || !selectedDeclineReason || isOffline || isSubmittingMutation) {
      return;
    }
    setIsSubmittingMutation(true);
    try {
      const result = await activeRepo.declineInvitation(
        brainWorkerId,
        selectedLead.invitationId,
        selectedDeclineReason
      );
      if (result.ok) {
        setLeads((prev) =>
          prev.map((item) =>
            item.id === selectedLead.id
              ? {
                  ...item,
                  invitationState: 'DECLINED',
                  declineReason: selectedDeclineReason,
                }
              : item
          )
        );
        setIsDeclineModalOpen(false);
        setSelectedDeclineReason(null);
      }
    } finally {
      setIsSubmittingMutation(false);
    }
  };

  const formatBudget = (kobo?: number): string | null => {
    if (typeof kobo !== 'number' || !Number.isFinite(kobo)) return null;
    const naira = Math.floor(kobo / 100);
    return `₦${naira.toLocaleString()}`;
  };

  const formatSchedule = (isoString?: string): string => {
    if (!isoString) return 'Flexible schedule';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-NG', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const renderInspectionContent = (lead: ProviderProjectedLead) => {
    const isPending = lead.invitationState === 'PENDING';
    const budgetDisplay = formatBudget(lead.customerBudgetKobo);

    return (
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded bg-emerald-100 text-emerald-800">
              {lead.urgency.toUpperCase()}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {lead.pricingMode === 'CUSTOMER_POSTED_RATE'
                ? 'Customer Posted Rate'
                : 'Worker Quote Request'}
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">{lead.title}</h2>
          <p className="mt-1 text-sm text-slate-500">
            {lead.neighbourhoodOrZone}, {lead.cityId}
          </p>
        </div>

        {budgetDisplay && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-xs font-medium text-slate-500">Customer Budget</span>
            <p className="text-lg font-bold text-slate-900">{budgetDisplay}</p>
          </div>
        )}

        <div>
          <h3 className="text-sm font-semibold text-slate-900">Job Description</h3>
          <p className="mt-1 text-sm text-slate-700 whitespace-pre-line leading-relaxed">
            {lead.description}
          </p>
        </div>

        {lead.landmark && (
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Landmark & Location Guide</h3>
            <p className="mt-1 text-sm text-slate-700">{lead.landmark}</p>
          </div>
        )}

        <div>
          <h3 className="text-sm font-semibold text-slate-900">Requested Schedule</h3>
          <p className="mt-1 text-sm text-slate-700">{formatSchedule(lead.scheduledStartAt)}</p>
        </div>

        {lead.attachmentRefs && lead.attachmentRefs.length > 0 && (
          <div data-testid="lead-attachments-gallery" className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-900">Customer Photos & Media</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {lead.attachmentRefs.map((ref, idx) => (
                <div
                  key={`${ref}-${idx}`}
                  className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 bg-slate-100"
                >
                  <img
                    src={ref}
                    alt={`Attachment preview ${idx + 1}`}
                    role="img"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-slate-200 flex items-center gap-3">
          <button
            type="button"
            onClick={handleAccept}
            disabled={isOffline || isSubmittingMutation || !isPending}
            className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isSubmittingMutation ? 'Submitting...' : 'Accept'}
          </button>
          <button
            type="button"
            onClick={() => setIsDeclineModalOpen(true)}
            disabled={isOffline || isSubmittingMutation || !isPending}
            className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Decline
          </button>
        </div>

        {!isPending && (
          <div className="p-3 bg-slate-100 rounded-lg text-sm text-slate-700">
            Status: <span className="font-semibold">{lead.invitationState}</span>
            {lead.declineReason && (
              <span className="block mt-1 text-xs text-slate-500">
                Reason: {lead.declineReason}
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      role="region"
      aria-label="Job Requests and Leads"
      className={`w-full max-w-7xl mx-auto px-4 py-6 motion-reduce:transition-none ${className}`}
    >
      {/* Degraded State Notice */}
      {isDegraded && (
        <div
          data-testid="leads-degraded-notice"
          role="alert"
          className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-sm flex items-center gap-2"
        >
          <span>Network connection is degraded. Fresh data may be delayed. Showing saved opportunities.</span>
        </div>
      )}

      {/* Offline State Banner */}
      {isOffline && (
        <div
          data-testid="leads-offline-banner"
          role="alert"
          className="mb-4 p-3 rounded-lg bg-slate-800 text-slate-100 text-sm flex items-center gap-2"
        >
          <span>Offline mode: You are viewing saved job requests in read-only mode. Actions are disabled.</span>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Job Requests & Leads</h1>
          <p className="mt-1 text-sm text-slate-600">
            Review incoming customer opportunities matching your configured services and coverage.
          </p>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div
          data-testid="leads-loading-skeleton"
          role="status"
          aria-label="Loading job requests"
          className="space-y-4 animate-pulse"
        >
          <div className="h-24 bg-slate-200 rounded-xl" />
          <div className="h-24 bg-slate-200 rounded-xl" />
          <div className="h-24 bg-slate-200 rounded-xl" />
        </div>
      )}

      {/* Error State with Retry */}
      {!isLoading && errorMessage && (
        <div
          data-testid="leads-error-state"
          role="alert"
          className="p-6 rounded-xl bg-red-50 border border-red-200 text-red-900"
        >
          <h2 className="text-base font-semibold">Could not load job requests</h2>
          <p className="mt-1 text-sm text-red-700">{errorMessage}</p>
          <button
            type="button"
            onClick={fetchLeads}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg shadow-sm transition"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !errorMessage && leads.length === 0 && (
        <div
          data-testid="leads-empty-state"
          className="p-12 text-center bg-slate-50 border border-slate-200 rounded-2xl"
        >
          <h2 className="text-lg font-semibold text-slate-800">
            No job requests available right now
          </h2>
          <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
            New customer opportunities within your configured cities, zones, and trade services will appear here automatically.
          </p>
        </div>
      )}

      {/* Populated Feed */}
      {!isLoading && !errorMessage && leads.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Feed List */}
          <div
            role="feed"
            aria-label="Incoming job requests feed"
            className={selectedLead && !isMobile ? 'lg:col-span-7 space-y-4' : 'lg:col-span-12 space-y-4'}
          >
            {leads.map((lead) => {
              const isSelected = lead.id === selectedLeadId;
              const budgetDisplay = formatBudget(lead.customerBudgetKobo);

              return (
                <div
                  key={lead.id}
                  data-testid="lead-card"
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedLeadId(lead.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedLeadId(lead.id);
                    }
                  }}
                  className={`p-5 rounded-xl border transition cursor-pointer text-left ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-600'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 text-xs font-semibold rounded bg-slate-100 text-slate-700">
                          {lead.categoryId}
                        </span>
                        <span className="px-2 py-0.5 text-xs font-semibold rounded bg-amber-100 text-amber-800">
                          {lead.urgency.toUpperCase()}
                        </span>
                      </div>
                      <h3 className="text-base font-semibold text-slate-900">{lead.title}</h3>
                      <p className="text-sm text-slate-600 line-clamp-2">{lead.description}</p>
                    </div>

                    {budgetDisplay && (
                      <div className="text-right shrink-0">
                        <span className="text-xs text-slate-500">Budget</span>
                        <p className="text-sm font-bold text-slate-900">{budgetDisplay}</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>
                      {lead.neighbourhoodOrZone}, {lead.cityId}
                    </span>
                    <span>{formatSchedule(lead.scheduledStartAt)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Inspection Drawer */}
          {selectedLead && !isMobile && (
            <aside
              data-testid="lead-inspection-drawer"
              role="complementary"
              aria-label="Lead details"
              className="lg:col-span-5 p-6 bg-white border border-slate-200 rounded-xl shadow-sm sticky top-6"
            >
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Opportunity Details
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedLeadId(null)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-medium"
                >
                  Close
                </button>
              </div>
              {renderInspectionContent(selectedLead)}
            </aside>
          )}
        </div>
      )}

      {/* Mobile Full-Screen Detail View (UI-010) */}
      {selectedLead && isMobile && (
        <div
          data-testid="lead-mobile-detail-view"
          className="fixed inset-0 z-50 bg-white overflow-y-auto p-4 flex flex-col"
        >
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
            <button
              type="button"
              onClick={() => setSelectedLeadId(null)}
              className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition"
            >
              Back to job requests
            </button>
          </div>
          <div className="flex-1 pb-8">{renderInspectionContent(selectedLead)}</div>
        </div>
      )}

      {/* Decline Reason Modal (UI-009) */}
      {isDeclineModalOpen && (
        <div
          data-testid="decline-reason-dialog"
          role="dialog"
          aria-modal="true"
          aria-label="Decline Opportunity"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        >
          <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-xl space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Decline Opportunity</h3>
              <p className="mt-1 text-sm text-slate-600">
                Select a reason for declining. This helps the matching engine route relevant requests in the future.
              </p>
            </div>

            <div className="space-y-2">
              {DECLINE_REASON_OPTIONS.map((opt) => {
                const isSelected = selectedDeclineReason === opt.reason;
                return (
                  <button
                    key={opt.reason}
                    type="button"
                    data-testid={`decline-reason-${opt.reason}`}
                    onClick={() => setSelectedDeclineReason(opt.reason)}
                    className={`w-full p-3 text-left rounded-xl border transition flex flex-col ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-sm font-semibold text-slate-900">{opt.label}</span>
                    <span className="text-xs text-slate-500 mt-0.5">{opt.description}</span>
                  </button>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsDeclineModalOpen(false);
                  setSelectedDeclineReason(null);
                }}
                disabled={isSubmittingMutation}
                className="px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDecline}
                disabled={!selectedDeclineReason || isSubmittingMutation}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {isSubmittingMutation ? 'Declining...' : 'Confirm Decline'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
