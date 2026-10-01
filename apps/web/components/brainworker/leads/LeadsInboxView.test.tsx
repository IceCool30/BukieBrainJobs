// apps/web/components/brainworker/leads/LeadsInboxView.test.tsx
// Phase 5 RED: Lead Feed & Inspection UI Component Contract Tests (UI-001 through UI-012)
// Authoritative References:
// - docs/specs/BW-003-ux-design-specification.md (v1.0, Sections 1 to 14)
// - docs/specs/BW-003-architecture-contract.md (v1.0, Sections 1, 2, 3, 5, 8, 9)
// - docs/specs/BW-003-test-first-implementation-plan.md (v1.0, Phase 5: UI-001 to UI-012)
// - docs/specs/BW-003-leads-inbox.md (v1.0, Sections 4 to 11)

import React from 'react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LeadsInboxView } from './LeadsInboxView';
import {
  FIXTURE_APPROVED_BRAINWORKER_A,
  leadOwnedByA,
  CANONICAL_DECLINE_REASONS,
} from '../../../lib/brainworker/leads/testing';
import {
  createLeadsTestHarness,
  type LeadsTestHarness,
} from '../../../lib/brainworker/leads/testing/harness';
import type {
  IBrainWorkerLeadsRepository,
  LeadPage,
} from '../../../lib/brainworker/leads/types';
import * as fs from 'fs';
import * as path from 'path';

describe('BW-003 Phase 5 RED: Lead Feed & Inspection UI Contracts (UI-001 through UI-012)', () => {
  let harness: LeadsTestHarness;

  beforeEach(() => {
    vi.clearAllMocks();
    harness = createLeadsTestHarness();
  });

  it('UI-001: displays loading skeleton while feed query is unresolved and does not flash empty state', async () => {
    let resolveLeads: (page: LeadPage) => void = () => {};
    const pendingPromise = new Promise<LeadPage>((resolve) => {
      resolveLeads = resolve;
    });

    const pendingRepository: IBrainWorkerLeadsRepository = {
      ...harness.repository,
      getLeads: vi.fn().mockReturnValue(pendingPromise),
    };

    render(
      <LeadsInboxView
        brainWorkerId={FIXTURE_APPROVED_BRAINWORKER_A}
        repository={pendingRepository}
      />
    );

    expect(screen.getByTestId('leads-loading-skeleton')).toBeInTheDocument();
    expect(screen.queryByTestId('leads-empty-state')).not.toBeInTheDocument();

    resolveLeads({ items: [] });
  });

  it('UI-002: renders populated feed cards with title, service, location, urgency, and pricing mode', async () => {
    const testLead = leadOwnedByA({
      id: 'lead-001',
      title: 'Emergency Generator Troubleshooting',
      description: 'Generator stalls under load and leaks diesel fuel.',
      serviceId: 'generator-repair',
      categoryId: 'generator',
      cityId: 'abuja',
      neighbourhoodOrZone: 'Gwarinpa',
      urgency: 'EMERGENCY',
      pricingMode: 'CUSTOMER_POSTED_RATE',
      customerBudgetKobo: 2500000,
      sentAt: '2026-10-01T10:00:00.000Z',
    });
    harness.seedLead(FIXTURE_APPROVED_BRAINWORKER_A, testLead);

    render(
      <LeadsInboxView
        brainWorkerId={FIXTURE_APPROVED_BRAINWORKER_A}
        repository={harness.repository}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Emergency Generator Troubleshooting')).toBeInTheDocument();
    });

    expect(screen.getByText(/Gwarinpa/i)).toBeInTheDocument();
    expect(screen.getByText(/EMERGENCY/i)).toBeInTheDocument();
    expect(screen.getByText(/₦25,000/i)).toBeInTheDocument();
  });

  it('UI-003: renders empty state when no matching opportunities are returned without fabricating fake leads', async () => {
    render(
      <LeadsInboxView
        brainWorkerId={FIXTURE_APPROVED_BRAINWORKER_A}
        repository={harness.repository}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('leads-empty-state')).toBeInTheDocument();
    });

    expect(screen.queryAllByTestId('lead-card')).toHaveLength(0);
    expect(screen.getByText(/no job requests available/i)).toBeInTheDocument();
  });

  it('UI-004: renders degraded state notice while preserving last authorized opportunities', async () => {
    const testLead = leadOwnedByA({
      id: 'lead-004',
      title: 'Air Conditioner Coil Inspection',
    });
    harness.seedLead(FIXTURE_APPROVED_BRAINWORKER_A, testLead);

    render(
      <LeadsInboxView
        brainWorkerId={FIXTURE_APPROVED_BRAINWORKER_A}
        repository={harness.repository}
        isDegraded={true}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('leads-degraded-notice')).toBeInTheDocument();
    });

    expect(screen.getByText('Air Conditioner Coil Inspection')).toBeInTheDocument();
    expect(screen.getByText(/fresh data may be delayed/i)).toBeInTheDocument();
  });

  it('UI-005: renders offline read-only banner and disables response mutation actions', async () => {
    const testLead = leadOwnedByA({
      id: 'lead-005',
      title: 'Circuit Breaker Replacement',
    });
    harness.seedLead(FIXTURE_APPROVED_BRAINWORKER_A, testLead);

    render(
      <LeadsInboxView
        brainWorkerId={FIXTURE_APPROVED_BRAINWORKER_A}
        repository={harness.repository}
        isOffline={true}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('leads-offline-banner')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Circuit Breaker Replacement'));

    const acceptButton = screen.getByRole('button', { name: /accept/i });
    const declineButton = screen.getByRole('button', { name: /decline/i });

    expect(acceptButton).toBeDisabled();
    expect(declineButton).toBeDisabled();
  });

  it('UI-006: renders failure state with actionable retry button when repository query fails', async () => {
    const failingRepo: IBrainWorkerLeadsRepository = {
      ...harness.repository,
      getLeads: vi.fn().mockRejectedValue(new Error('Storage unavailable')),
    };

    render(
      <LeadsInboxView
        brainWorkerId={FIXTURE_APPROVED_BRAINWORKER_A}
        repository={failingRepo}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('leads-error-state')).toBeInTheDocument();
    });

    const retryButton = screen.getByRole('button', { name: /retry/i });
    expect(retryButton).toBeInTheDocument();

    (failingRepo.getLeads as Mock).mockResolvedValueOnce({ items: [] });
    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(failingRepo.getLeads).toHaveBeenCalledTimes(2);
    });
  });

  it('UI-007: enforces customer privacy projection in inspection surface without leaking private credentials', async () => {
    const testLead = leadOwnedByA({
      id: 'lead-007',
      title: 'Water Pipe Burst in Kitchen',
      landmark: 'Opposite Federal High Court',
      exactAddress: 'Block 4 Flat 12, Gwarinpa Estate, Abuja',
      customerPhone: '+2348039998877',
      customerEmail: 'private-customer@example.com',
    });
    harness.seedLead(FIXTURE_APPROVED_BRAINWORKER_A, testLead);

    render(
      <LeadsInboxView
        brainWorkerId={FIXTURE_APPROVED_BRAINWORKER_A}
        repository={harness.repository}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Water Pipe Burst in Kitchen')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Water Pipe Burst in Kitchen'));

    expect(screen.getByTestId('lead-inspection-drawer')).toBeInTheDocument();
    expect(screen.getByText(/Opposite Federal High Court/i)).toBeInTheDocument();

    // Verify strict customer privacy invariants
    expect(screen.queryByText(/Block 4 Flat 12/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/\+2348039998877/)).not.toBeInTheDocument();
    expect(screen.queryByText(/private-customer@example\.com/i)).not.toBeInTheDocument();
  });

  it('UI-008: presents authorized customer media attachments and handles empty state cleanly', async () => {
    const testLead = leadOwnedByA({
      id: 'lead-008',
      title: 'Defective Generator Armature',
      attachmentRefs: [
        'https://cdn.example.com/generator-leak.jpg',
        'https://cdn.example.com/panel-damage.jpg',
      ],
    });
    harness.seedLead(FIXTURE_APPROVED_BRAINWORKER_A, testLead);

    render(
      <LeadsInboxView
        brainWorkerId={FIXTURE_APPROVED_BRAINWORKER_A}
        repository={harness.repository}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Defective Generator Armature')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Defective Generator Armature'));

    expect(screen.getByTestId('lead-attachments-gallery')).toBeInTheDocument();
    const images = screen.getAllByRole('img');
    expect(images.length).toBeGreaterThanOrEqual(2);
  });

  it('UI-009: handles accept and decline controls with canonical decline taxonomy', async () => {
    const testLead = leadOwnedByA({
      id: 'lead-009',
      invitationId: 'inv-lead-009',
      title: 'Commercial Rewiring Job',
    });
    harness.seedLead(FIXTURE_APPROVED_BRAINWORKER_A, testLead);

    const declineSpy = vi.spyOn(harness.repository, 'declineInvitation');

    render(
      <LeadsInboxView
        brainWorkerId={FIXTURE_APPROVED_BRAINWORKER_A}
        repository={harness.repository}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Commercial Rewiring Job')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Commercial Rewiring Job'));

    const declineButton = screen.getByRole('button', { name: /^decline$/i });
    fireEvent.click(declineButton);

    expect(screen.getByTestId('decline-reason-dialog')).toBeInTheDocument();

    // Verify canonical decline taxonomy
    CANONICAL_DECLINE_REASONS.forEach((reason) => {
      expect(screen.getByTestId(`decline-reason-${reason}`)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('decline-reason-SCHEDULE_CONFLICT'));
    fireEvent.click(screen.getByRole('button', { name: /confirm decline/i }));

    await waitFor(() => {
      expect(declineSpy).toHaveBeenCalledWith(
        FIXTURE_APPROVED_BRAINWORKER_A,
        'inv-lead-009',
        'SCHEDULE_CONFLICT'
      );
    });
  });

  it('UI-010: adapts inspection detail surface between desktop drawer and mobile full-screen view', async () => {
    const testLead = leadOwnedByA({
      id: 'lead-010',
      title: 'Roof Leak Repair',
    });
    harness.seedLead(FIXTURE_APPROVED_BRAINWORKER_A, testLead);

    render(
      <LeadsInboxView
        brainWorkerId={FIXTURE_APPROVED_BRAINWORKER_A}
        repository={harness.repository}
        isMobile={true}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Roof Leak Repair')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Roof Leak Repair'));

    expect(screen.getByTestId('lead-mobile-detail-view')).toBeInTheDocument();
    const backButton = screen.getByRole('button', { name: /back to job requests|back/i });
    expect(backButton).toBeInTheDocument();

    fireEvent.click(backButton);

    expect(screen.queryByTestId('lead-mobile-detail-view')).not.toBeInTheDocument();
    expect(screen.getByText('Roof Leak Repair')).toBeInTheDocument();
  });

  it('UI-011: manages keyboard accessibility and closes inspection drawer on Escape key', async () => {
    const testLead = leadOwnedByA({
      id: 'lead-011',
      title: 'Distribution Board Tripping',
    });
    harness.seedLead(FIXTURE_APPROVED_BRAINWORKER_A, testLead);

    render(
      <LeadsInboxView
        brainWorkerId={FIXTURE_APPROVED_BRAINWORKER_A}
        repository={harness.repository}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Distribution Board Tripping')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Distribution Board Tripping'));

    expect(screen.getByTestId('lead-inspection-drawer')).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });

    expect(screen.queryByTestId('lead-inspection-drawer')).not.toBeInTheDocument();
  });

  it('UI-012: respects prefers-reduced-motion configuration on animated layout elements', async () => {
    render(
      <LeadsInboxView
        brainWorkerId={FIXTURE_APPROVED_BRAINWORKER_A}
        repository={harness.repository}
      />
    );

    const rootContainer = screen.getByRole('region', { name: /job requests and leads/i });
    expect(rootContainer.className).toMatch(/motion-reduce:transition-none/);
  });

  it('BOUND-001: ensures production LeadsInboxView does not import from testing utilities', () => {
    const componentPath = path.resolve(__dirname, 'LeadsInboxView.tsx');
    const content = fs.readFileSync(componentPath, 'utf8');

    expect(content).not.toMatch(/from\s+['"].*\/testing(\/.*)?['"]/);
    expect(content).not.toMatch(/from\s+['"].*fixtures.*['"]/);
  });
});
