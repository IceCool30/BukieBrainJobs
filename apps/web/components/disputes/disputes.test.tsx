// apps/web/components/disputes/disputes.test.tsx
// BW-010: Dispute Handling & Support Interface
// Phase 3 RED: UI Component Contracts UI-001 to UI-010

import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import {
  BrainWorkerDisputeBanner,
  DisputeEvidenceUploader,
  DisputeInitiationModal,
  DisputeTimelineView,
  HelpCenterView,
  SupportTicketForm,
} from './index';
import type { DisputeEvidence, DisputeRecord } from '../../lib/disputes/types';

describe('BW-010 Phase 3 RED: Dispute UI Component Contracts (UI-001 to UI-010)', () => {
  it('UI-001: DisputeInitiationModal renders reason categories and description input; submit button is disabled when description is empty', () => {
    const handleSubmit = vi.fn();
    const handleClose = vi.fn();

    render(
      <DisputeInitiationModal
        isOpen={true}
        bookingId="booking-101"
        initiatorRole="CUSTOMER"
        onClose={handleClose}
        onSubmit={handleSubmit}
      />
    );

    const categorySelect = screen.getByLabelText(/category|reason/i);
    expect(categorySelect).toBeInTheDocument();

    const descriptionInput = screen.getByLabelText(/description/i);
    expect(descriptionInput).toBeInTheDocument();

    const submitBtn = screen.getByRole('button', {
      name: /submit dispute|file dispute/i,
    });
    expect(submitBtn).toBeInTheDocument();
    expect(submitBtn).toBeDisabled();
  });

  it('UI-002: DisputeInitiationModal calls onSubmit with { reason, description, evidence } when valid form is submitted', () => {
    const handleSubmit = vi.fn();
    const handleClose = vi.fn();

    render(
      <DisputeInitiationModal
        isOpen={true}
        bookingId="booking-101"
        initiatorRole="CUSTOMER"
        onClose={handleClose}
        onSubmit={handleSubmit}
      />
    );

    const categorySelect = screen.getByLabelText(/category|reason/i);
    fireEvent.change(categorySelect, {
      target: { value: 'WORKMANSHIP_DEFECT' },
    });

    const descriptionInput = screen.getByLabelText(/description/i);
    fireEvent.change(descriptionInput, {
      target: {
        value: 'Contractor did not seal the bathroom joints causing leakage.',
      },
    });

    const submitBtn = screen.getByRole('button', {
      name: /submit dispute|file dispute/i,
    });
    expect(submitBtn).toBeEnabled();
    fireEvent.click(submitBtn);

    expect(handleSubmit).toHaveBeenCalledTimes(1);
    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        description: expect.stringContaining('leakage'),
        evidence: expect.any(Array),
      })
    );
  });

  it('UI-003: DisputeEvidenceUploader rejects file uploads larger than 5 MiB with an accessible error message', () => {
    const handleChange = vi.fn();

    render(
      <DisputeEvidenceUploader evidenceList={[]} onChange={handleChange} />
    );

    const oversizedFile = new File(['oversized content'], 'large-evidence.png', {
      type: 'image/png',
    });
    Object.defineProperty(oversizedFile, 'size', {
      value: 6 * 1024 * 1024,
    });

    const fileInput = screen.getByLabelText(/upload evidence|attach photo/i);
    fireEvent.change(fileInput, {
      target: { files: [oversizedFile] },
    });

    expect(screen.getByText(/5\s*mb|exceeds/i)).toBeInTheDocument();
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('UI-004: DisputeEvidenceUploader blocks file addition once 5 files are uploaded', () => {
    const mockEvidenceList: DisputeEvidence[] = Array.from(
      { length: 5 },
      (_, idx) => ({
        id: `ev-${idx + 1}`,
        uploaderId: 'usr-customer-1',
        uploaderRole: 'customer',
        fileType: 'image/jpeg',
        previewUrl: `https://example.com/proof-${idx + 1}.jpg`,
        uploadedAt: '2026-10-20T10:00:00Z',
        sizeBytes: 1024 * 500,
      })
    );

    render(
      <DisputeEvidenceUploader
        evidenceList={mockEvidenceList}
        onChange={vi.fn()}
        maxItems={5}
      />
    );

    expect(
      screen.getByText(/maximum.*5|limit reached/i)
    ).toBeInTheDocument();
  });

  it('UI-005: DisputeTimelineView renders all timeline events chronologically with event type and actor label', () => {
    const mockRecord: DisputeRecord = {
      id: 'disp-001',
      bookingId: 'book-101',
      customerId: 'cust-1',
      brainWorkerId: 'worker-1',
      initiatedByRole: 'customer',
      category: 'WORKMANSHIP_DEFECT',
      description: 'Defective tile alignment and cracked grouting.',
      status: 'ACTION_REQUIRED',
      evidence: [],
      timeline: [
        {
          id: 'evt-1',
          eventType: 'DISPUTE_FILED',
          actorId: 'cust-1',
          actorRole: 'customer',
          note: 'Customer filed dispute for defective workmanship',
          timestamp: '2026-10-20T09:00:00Z',
        },
        {
          id: 'evt-2',
          eventType: 'ACTION_REQUIRED',
          actorId: 'med-1',
          actorRole: 'mediator',
          note: 'Mediator requested close-up photos of grouting',
          timestamp: '2026-10-20T11:00:00Z',
        },
      ],
      createdAt: '2026-10-20T09:00:00Z',
      updatedAt: '2026-10-20T11:00:00Z',
    };

    render(<DisputeTimelineView record={mockRecord} />);

    expect(
      screen.getByText(/Customer filed dispute for defective workmanship/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Mediator requested close-up photos of grouting/)
    ).toBeInTheDocument();
    expect(screen.getByText(/Customer/i)).toBeInTheDocument();
    expect(screen.getByText(/Mediator/i)).toBeInTheDocument();
  });

  it('UI-006: DisputeTimelineView renders the settlement breakdown card with correct Kobo-to-Naira amounts when status is RESOLVED', () => {
    const mockResolvedRecord: DisputeRecord = {
      id: 'disp-002',
      bookingId: 'book-102',
      customerId: 'cust-1',
      brainWorkerId: 'worker-1',
      initiatedByRole: 'customer',
      category: 'WORKMANSHIP_DEFECT',
      description: 'Settlement reached after inspection.',
      status: 'RESOLVED',
      evidence: [],
      timeline: [],
      settlement: {
        totalAmountKobo: 10000000,
        customerRefundKobo: 5000000,
        workerPayoutKobo: 3250000,
        platformFeeKobo: 1750000,
        serviceFeeKobo: 1000000,
        trustFeeKobo: 750000,
        resolutionType: 'SPLIT_SETTLEMENT',
      },
      createdAt: '2026-10-20T09:00:00Z',
      updatedAt: '2026-10-20T12:00:00Z',
      resolvedAt: '2026-10-20T12:00:00Z',
    };

    render(<DisputeTimelineView record={mockResolvedRecord} />);

    expect(screen.getByText(/₦50,000/)).toBeInTheDocument();
    expect(screen.getByText(/₦32,500/)).toBeInTheDocument();
    expect(screen.getByText(/₦17,500/)).toBeInTheDocument();
  });

  it('UI-007: BrainWorkerDisputeBanner renders an active dispute alert with reason and action button when status is FILED or UNDER_REVIEW', () => {
    const handleRespond = vi.fn();
    const mockDispute: DisputeRecord = {
      id: 'disp-003',
      bookingId: 'book-103',
      customerId: 'cust-1',
      brainWorkerId: 'worker-1',
      initiatedByRole: 'customer',
      category: 'WORKMANSHIP_DEFECT',
      description: 'Plumbing leak after job marked done.',
      status: 'UNDER_REVIEW',
      evidence: [],
      timeline: [],
      createdAt: '2026-10-20T09:00:00Z',
      updatedAt: '2026-10-20T10:00:00Z',
    };

    render(
      <BrainWorkerDisputeBanner
        dispute={mockDispute}
        onRespond={handleRespond}
      />
    );

    expect(
      screen.getByText(/active dispute|dispute under review/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/workmanship defect/i)).toBeInTheDocument();

    const respondBtn = screen.getByRole('button', {
      name: /respond|submit counter-evidence|view details/i,
    });
    expect(respondBtn).toBeInTheDocument();
    fireEvent.click(respondBtn);
    expect(handleRespond).toHaveBeenCalledTimes(1);
  });

  it('UI-008: BrainWorkerDisputeBanner renders resolution summary when dispute status is RESOLVED', () => {
    const mockDispute: DisputeRecord = {
      id: 'disp-004',
      bookingId: 'book-104',
      customerId: 'cust-1',
      brainWorkerId: 'worker-1',
      initiatedByRole: 'customer',
      category: 'WORKMANSHIP_DEFECT',
      description: 'Dispute concluded with mediated split.',
      status: 'RESOLVED',
      evidence: [],
      timeline: [],
      resolutionNotes: 'Mutual settlement agreed by customer and worker.',
      settlement: {
        totalAmountKobo: 10000000,
        customerRefundKobo: 5000000,
        workerPayoutKobo: 3250000,
        platformFeeKobo: 1750000,
        serviceFeeKobo: 1000000,
        trustFeeKobo: 750000,
        resolutionType: 'SPLIT_SETTLEMENT',
      },
      createdAt: '2026-10-20T09:00:00Z',
      updatedAt: '2026-10-20T12:00:00Z',
      resolvedAt: '2026-10-20T12:00:00Z',
    };

    render(<BrainWorkerDisputeBanner dispute={mockDispute} />);

    expect(
      screen.getByText(/dispute resolved|resolution summary/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Mutual settlement agreed by customer and worker./i)
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', {
        name: /submit counter-evidence/i,
      })
    ).not.toBeInTheDocument();
  });

  it('UI-009: HelpCenterView renders support topic categories and allows toggling category details', () => {
    render(<HelpCenterView />);

    expect(screen.getByText(/Billing & Escrow/i)).toBeInTheDocument();
    expect(screen.getByText(/On-Site Safety/i)).toBeInTheDocument();
    expect(screen.getByText(/Disputes & Mediation/i)).toBeInTheDocument();
    expect(screen.getByText(/Scope Adjustments/i)).toBeInTheDocument();

    const disputeTopicBtn = screen.getByRole('button', {
      name: /Disputes & Mediation/i,
    });
    fireEvent.click(disputeTopicBtn);

    expect(screen.getByText(/mediation/i)).toBeInTheDocument();
  });

  it('UI-010: SupportTicketForm requires category and non-empty message before permitting submission', () => {
    const handleSubmit = vi.fn();

    render(<SupportTicketForm onSubmit={handleSubmit} />);

    const submitBtn = screen.getByRole('button', {
      name: /submit ticket|send message/i,
    });
    expect(submitBtn).toBeDisabled();

    const categorySelect = screen.getByLabelText(/category|inquiry topic/i);
    fireEvent.change(categorySelect, {
      target: { value: 'Disputes & Mediation' },
    });

    const emailInput = screen.getByLabelText(/email|contact/i);
    fireEvent.change(emailInput, {
      target: { value: 'user@example.com' },
    });

    const messageInput = screen.getByLabelText(/message|inquiry/i);
    fireEvent.change(messageInput, {
      target: {
        value: 'Need assistance understanding the dispute timeline.',
      },
    });

    expect(submitBtn).toBeEnabled();
    fireEvent.click(submitBtn);

    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        category: 'Disputes & Mediation',
        email: 'user@example.com',
        message: expect.stringContaining('assistance'),
      })
    );
  });
});
