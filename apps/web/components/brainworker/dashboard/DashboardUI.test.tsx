// apps/web/components/brainworker/dashboard/DashboardUI.test.tsx
// BrainWorker Operating Dashboard: Phase 3 RED UI Contracts (COMP-001 to COMP-012)

import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { DashboardLiveView } from './DashboardLiveView';
import { DashboardMetricsCards } from './DashboardMetricsCards';
import { UrgentLeadsTicker } from './UrgentLeadsTicker';
import type { BrainWorkerDashboardFeed } from '../../../lib/brainworker/dashboard/types';

describe('BrainWorker Operating Dashboard UI Contracts (COMP-001 to COMP-012)', () => {
  const baseFeed: BrainWorkerDashboardFeed = {
    metrics: {
      todayBookingsCount: 3,
      nextScheduledStartAt: '2026-10-15T12:00:00.000Z',
      activeJobsCount: 1,
      activeJobId: 'bk-active-1',
      pendingQuotesCount: 4,
      completedJobsCount: 12,
      clientRating: 4.85,
    },
    urgentLeads: [
      {
        id: 'lead-urg-1',
        title: 'Emergency Generator Troubleshooting',
        tradeCategory: 'Generator Maintenance',
        locationArea: 'Lekki Phase 1',
        urgency: 'EMERGENCY',
        postedAt: '2026-10-15T09:30:00.000Z',
      },
    ],
    operationalStatus: {
      isComplete: true,
      isAvailable: true,
      isEmergencyAvailable: true,
      primaryTradeName: 'Generator Maintenance',
    },
    lastRefreshedAt: '2026-10-15T10:00:00.000Z',
  };

  it('COMP-001: renders loading skeleton when isLoading is true', () => {
    render(<DashboardLiveView feed={null} isLoading={true} />);
    expect(screen.getByTestId('dashboard-loading-skeleton')).toBeInTheDocument();
  });

  it('COMP-002: renders resilient error alert when error prop is supplied with retry trigger', () => {
    const handleRefresh = vi.fn();
    render(
      <DashboardLiveView
        feed={null}
        error="Failed to load dashboard data"
        onRefresh={handleRefresh}
      />
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/Failed to load dashboard data/i)).toBeInTheDocument();

    const retryBtn = screen.getByRole('button', { name: /retry|refresh/i });
    fireEvent.click(retryBtn);
    expect(handleRefresh).toHaveBeenCalledTimes(1);
  });

  it('COMP-003: displays todayBookingsCount card with accessible label and value', () => {
    render(<DashboardMetricsCards metrics={baseFeed.metrics} />);
    const card = screen.getByTestId('metric-today-bookings');
    expect(card).toBeInTheDocument();
    expect(card).toHaveTextContent('3');
  });

  it('COMP-004: displays next scheduled booking start time or empty state badge if none today', () => {
    const { rerender } = render(
      <DashboardMetricsCards metrics={baseFeed.metrics} />
    );
    expect(screen.getByTestId('metric-next-start')).toHaveTextContent(/12:00/);

    rerender(
      <DashboardMetricsCards
        metrics={{
          ...baseFeed.metrics,
          nextScheduledStartAt: null,
        }}
      />
    );
    expect(screen.getByTestId('metric-next-start')).toHaveTextContent(
      /no more jobs today|none scheduled/i
    );
  });

  it('COMP-005: highlights active jobs count with one-click CTA deep-linking to active booking', () => {
    const handleSelectActiveJob = vi.fn();
    render(
      <DashboardMetricsCards
        metrics={baseFeed.metrics}
        onSelectActiveJob={handleSelectActiveJob}
      />
    );

    const activeCard = screen.getByTestId('metric-active-jobs');
    expect(activeCard).toHaveTextContent('1');

    const ctaButton = screen.getByRole('button', {
      name: /view active job|open active job/i,
    });
    fireEvent.click(ctaButton);
    expect(handleSelectActiveJob).toHaveBeenCalledWith('bk-active-1');
  });

  it('COMP-006: displays pendingQuotesCount with one-click navigation to leads list', () => {
    const handleNavigateLeads = vi.fn();
    render(
      <DashboardMetricsCards
        metrics={baseFeed.metrics}
        onNavigateToLeads={handleNavigateLeads}
      />
    );

    const pendingCard = screen.getByTestId('metric-pending-quotes');
    expect(pendingCard).toHaveTextContent('4');

    const leadsBtn = screen.getByRole('button', {
      name: /review leads|view pending quotes/i,
    });
    fireEvent.click(leadsBtn);
    expect(handleNavigateLeads).toHaveBeenCalledTimes(1);
  });

  it('COMP-007: displays completedJobsCount historical counter', () => {
    render(<DashboardMetricsCards metrics={baseFeed.metrics} />);
    const completedCard = screen.getByTestId('metric-completed-jobs');
    expect(completedCard).toHaveTextContent('12');
  });

  it('COMP-008: renders client rating display or unreviewed badge when clientRating is null', () => {
    const { rerender } = render(
      <DashboardMetricsCards metrics={baseFeed.metrics} />
    );
    expect(screen.getByTestId('metric-client-rating')).toHaveTextContent(/4.85|4.9/);

    rerender(
      <DashboardMetricsCards
        metrics={{
          ...baseFeed.metrics,
          clientRating: null,
        }}
      />
    );
    expect(screen.getByTestId('metric-client-rating')).toHaveTextContent(
      /no reviews yet|unreviewed/i
    );
  });

  it('COMP-009: urgent leads ticker renders emergency and same-day leads with badges and area', () => {
    render(<UrgentLeadsTicker urgentLeads={baseFeed.urgentLeads} />);
    expect(
      screen.getByText('Emergency Generator Troubleshooting')
    ).toBeInTheDocument();
    expect(screen.getByText('Lekki Phase 1')).toBeInTheDocument();
    expect(screen.getByText('EMERGENCY')).toBeInTheDocument();
  });

  it('COMP-010: urgent leads ticker renders empty state card when urgentLeads is empty', () => {
    render(<UrgentLeadsTicker urgentLeads={[]} />);
    expect(
      screen.getByText(/no urgent leads in your area/i)
    ).toBeInTheDocument();
  });

  it('COMP-011: privacy boundary: guarantees zero customer phone numbers or raw addresses appear', () => {
    const { container } = render(
      <UrgentLeadsTicker urgentLeads={baseFeed.urgentLeads} />
    );
    const text = container.textContent || '';
    expect(text).not.toMatch(/\+234[0-9]+/);
    expect(text).not.toMatch(/080[0-9]{8}/);
    expect(text).not.toMatch(/Plot|Street|Close|Avenue/i);
  });

  it('COMP-012: financial boundary: guarantees zero wallet, escrow, NGN, or payout elements rendered', () => {
    const { container } = render(
      <DashboardLiveView feed={baseFeed} isLoading={false} />
    );
    const text = container.textContent || '';
    expect(text).not.toMatch(/wallet balance/i);
    expect(text).not.toMatch(/escrow/i);
    expect(text).not.toMatch(/payout/i);
    expect(text).not.toMatch(/₦[0-9]+/);
  });
});
