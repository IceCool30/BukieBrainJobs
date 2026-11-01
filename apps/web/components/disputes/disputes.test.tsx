// apps/web/components/disputes/disputes.test.tsx
// BW-010: Dispute Handling & Support Interface
// Phase 3: UI Component Contracts UI-001 to UI-010 and Product Review Regression Contracts

import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import {
  BrainWorkerDisputeBanner,
  DisputeEvidenceUploader,
  DisputeInitiationModal,
  DisputeTimelineView,
  DisputeCounterEvidenceModal,
  HelpCenterView,
  SupportTicketForm,
} from './index';
import type { DisputeEvidence, DisputeRecord } from '../../lib/disputes/types';
import { evidenceStore } from '../../lib/disputes/evidence-store';

describe('BW-010 Phase 3: Dispute UI Component Contracts (UI-001 to UI-010 & Review Regressions)', () => {
  beforeEach(() => {
    if (typeof URL.createObjectURL === 'undefined') {
      URL.createObjectURL = vi.fn((obj: Blob | MediaSource) => `blob:mock-url-${(obj as File).name || 'file'}`);
    } else {
      vi.spyOn(URL, 'createObjectURL').mockImplementation((obj: Blob | MediaSource) => `blob:mock-url-${(obj as File).name || 'file'}`);
    }
    if (typeof URL.revokeObjectURL === 'undefined') {
      URL.revokeObjectURL = vi.fn();
    } else {
      vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    }
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // UI-001: Description minimum length and category selection
  it('UI-001: DisputeInitiationModal renders reason categories and description input; submit button is disabled when description is under 10 chars', () => {
    const handleSubmit = vi.fn();
    const handleClose = vi.fn();

    render(
      <DisputeInitiationModal
        isOpen={true}
        bookingId="booking-101"
        initiatorRole="CUSTOMER"
        initiatorId="cust-1"
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

    // Under 20 characters: must remain disabled (test 19 characters)
    fireEvent.change(descriptionInput, { target: { value: '1234567890123456789' } });
    expect(submitBtn).toBeDisabled();
    expect(screen.getByText(/at least 20 characters required/i)).toBeInTheDocument();

    // 20 or more characters: becomes enabled (test 20 characters)
    fireEvent.change(descriptionInput, { target: { value: '12345678901234567890' } });
    expect(submitBtn).toBeEnabled();
  });

  // UI-002: Form submission payload structure
  it('UI-001b: DisputeInitiationModal identifies the local preview and says it does not handle real funds', () => {
    render(
      <DisputeInitiationModal
        isOpen={true}
        bookingId="booking-101"
        initiatorRole="CUSTOMER"
        initiatorId="cust-1"
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    expect(screen.getByText(/This local preview records your dispute and pauses its simulated completion timer/i)).toBeInTheDocument();
    expect(screen.getByText(/It does not hold, move, or release real funds/i)).toBeInTheDocument();
  });

  // UI-002: Form submission payload structure
  it('UI-002: DisputeInitiationModal calls onSubmit with { category, reason, description, evidence } when valid form is submitted', () => {
    const handleSubmit = vi.fn();
    const handleClose = vi.fn();

    render(
      <DisputeInitiationModal
        isOpen={true}
        bookingId="booking-101"
        initiatorRole="CUSTOMER"
        initiatorId="cust-1"
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
        category: 'WORKMANSHIP_DEFECT',
        reason: 'WORKMANSHIP_DEFECT',
        description: expect.stringContaining('leakage'),
        evidence: expect.any(Array),
      })
    );
  });

  // UI-002b: DisputeInitiationModal respects eligible prop and accessible focus trap/scroll lock
  it('UI-002b: DisputeInitiationModal renders ineligibility notice and omits submission form when eligible=false', () => {
    render(
      <DisputeInitiationModal
        isOpen={true}
        bookingId="booking-101"
        initiatorRole="CUSTOMER"
        initiatorId="cust-1"
        eligible={false}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    expect(screen.getByText(/not eligible/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/description/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /submit dispute/i })).not.toBeInTheDocument();
  });

  // UI-002c: DisputeInitiationModal handles async submission rejection with accessible alert and permits retry
  it('UI-002c: DisputeInitiationModal handles async submission rejection with accessible error alert and permits retry', async () => {
    const handleSubmit = vi.fn().mockRejectedValueOnce(new Error('Network error filing dispute'));

    render(
      <DisputeInitiationModal
        isOpen={true}
        bookingId="booking-101"
        initiatorRole="CUSTOMER"
        initiatorId="cust-1"
        onClose={vi.fn()}
        onSubmit={handleSubmit}
      />
    );

    const descriptionInput = screen.getByLabelText(/description/i);
    fireEvent.change(descriptionInput, {
      target: { value: 'Detailed defect description exceeding ten characters.' },
    });

    const submitBtn = screen.getByRole('button', { name: /submit dispute/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent(/network error filing dispute/i);
    });

    // Form inputs must be preserved and button enabled for retry
    expect(descriptionInput).toHaveValue('Detailed defect description exceeding ten characters.');
    expect(submitBtn).toBeEnabled();
  });

  // UI-003: Exact boundary file size checks
  it('UI-003: DisputeEvidenceUploader accepts exact 5 MiB file and rejects 5 MiB + 1 byte file with an accessible error message', () => {
    const handleChange = vi.fn();

    render(
      <DisputeEvidenceUploader
        evidenceList={[]}
        onChange={handleChange}
        uploaderId="usr-123"
        uploaderRole="customer"
      />
    );

    const fileInput = screen.getByLabelText(/upload evidence|attach photo/i);

    // Exact boundary: 5,242,880 bytes (5 MiB) must be accepted
    const exactBoundaryFile = new File(['a'], 'exact-5mb.png', { type: 'image/png' });
    Object.defineProperty(exactBoundaryFile, 'size', { value: 5242880 });

    fireEvent.change(fileInput, { target: { files: [exactBoundaryFile] } });
    expect(handleChange).toHaveBeenCalledTimes(1);

    // Boundary + 1 byte: 5,242,881 bytes must be rejected
    handleChange.mockClear();
    const oversizedFile = new File(['b'], 'oversized.png', { type: 'image/png' });
    Object.defineProperty(oversizedFile, 'size', { value: 5242881 });

    fireEvent.change(fileInput, { target: { files: [oversizedFile] } });
    expect(screen.getByRole('alert')).toHaveTextContent(/exceeds 5\s*mb|smaller/i);
    expect(handleChange).not.toHaveBeenCalled();
  });

  // UI-003b: DisputeEvidenceUploader fails closed when caller authentication props are missing
  it('UI-003b: DisputeEvidenceUploader fails closed when caller authentication props are missing', () => {
    render(
      <DisputeEvidenceUploader
        evidenceList={[]}
        onChange={vi.fn()}
        uploaderId=""
        uploaderRole="customer"
      />
    );

    const fileInput = screen.getByLabelText(/upload evidence|attach photo/i);
    expect(fileInput).toBeDisabled();
    expect(screen.getByText(/authentication required|caller context/i)).toBeInTheDocument();
  });

  // UI-003c: DisputeEvidenceUploader filters MIME types and rejects unsupported formats
  it('UI-003c: DisputeEvidenceUploader rejects unsupported MIME types like text/plain', () => {
    const handleChange = vi.fn();

    render(
      <DisputeEvidenceUploader
        evidenceList={[]}
        onChange={handleChange}
        uploaderId="usr-123"
        uploaderRole="customer"
      />
    );

    const textFile = new File(['log text'], 'error.txt', { type: 'text/plain' });
    Object.defineProperty(textFile, 'size', { value: 1024 });

    const fileInput = screen.getByLabelText(/upload evidence|attach photo/i);
    fireEvent.change(fileInput, { target: { files: [textFile] } });

    expect(screen.getByRole('alert')).toHaveTextContent(/unsupported file format/i);
    expect(handleChange).not.toHaveBeenCalled();
  });

  // UI-003e: DisputeEvidenceUploader accepts image/webp files
  it('UI-003e: DisputeEvidenceUploader accepts image/webp files and exposes webp in accept attribute', () => {
    const handleChange = vi.fn();
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-webp');

    render(
      <DisputeEvidenceUploader
        evidenceList={[]}
        onChange={handleChange}
        uploaderId="usr-123"
        uploaderRole="customer"
      />
    );

    const fileInput = screen.getByLabelText(/upload evidence|attach photo/i) as HTMLInputElement;
    expect(fileInput.accept).toContain('image/webp');

    const webpFile = new File(['webp bytes'], 'sample.webp', { type: 'image/webp' });
    Object.defineProperty(webpFile, 'size', { value: 1024 });

    fireEvent.change(fileInput, { target: { files: [webpFile] } });

    expect(handleChange).toHaveBeenCalledWith([
      expect.objectContaining({
        fileType: 'image/webp',
        caption: 'sample.webp',
      }),
    ]);
  });

  // UI-003d: DisputeEvidenceUploader revokes object URLs on removal and unmount
  it('UI-003d: DisputeEvidenceUploader revokes object URLs on item removal and unmount', () => {
    const handleChange = vi.fn();
    const testFile = new File(['mock content'], 'photo.jpg', { type: 'image/jpeg' });
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url-photo.jpg');
    evidenceStore.registerDraftBlob(testFile, 'test-uploader-session');

    const mockEvidenceList: DisputeEvidence[] = [
      {
        id: 'ev-1',
        uploaderId: 'usr-123',
        uploaderRole: 'customer',
        fileType: 'image/jpeg',
        previewUrl: 'blob:mock-url-photo.jpg',
        caption: 'photo.jpg',
        uploadedAt: '2026-10-20T10:00:00Z',
        sizeBytes: 1024,
      },
    ];

    const { unmount } = render(
      <DisputeEvidenceUploader
        sessionId="test-uploader-session"
        evidenceList={mockEvidenceList}
        onChange={handleChange}
        uploaderId="usr-123"
        uploaderRole="customer"
      />
    );

    const removeBtn = screen.getByRole('button', { name: /remove proof 1/i });
    fireEvent.click(removeBtn);

    expect(handleChange).toHaveBeenCalledWith([]);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url-photo.jpg');

    unmount();
  });

  // UI-004: Evidence upload item limit
  it('UI-004: DisputeEvidenceUploader blocks file addition once maxItems limit is reached', () => {
    const mockEvidenceList: DisputeEvidence[] = Array.from(
      { length: 3 },
      (_, idx) => ({
        id: `ev-${idx + 1}`,
        uploaderId: 'usr-customer-1',
        uploaderRole: 'customer' as const,
        fileType: 'image/jpeg' as const,
        previewUrl: `blob:mock-url-proof-${idx + 1}.jpg`,
        caption: `proof-${idx + 1}.jpg`,
        uploadedAt: '2026-10-20T10:00:00Z',
        sizeBytes: 1024 * 500,
      })
    );

    render(
      <DisputeEvidenceUploader
        evidenceList={mockEvidenceList}
        onChange={vi.fn()}
        uploaderId="usr-customer-1"
        uploaderRole="customer"
        maxItems={3}
      />
    );

    expect(
      screen.getByText(/maximum of 3 evidence attachments/i)
    ).toBeInTheDocument();

    const fileInput = screen.getByLabelText(/upload evidence|attach photo/i);
    expect(fileInput).toBeDisabled();
  });

  // UI-005: DisputeTimelineView chronological sorting and <time> tags
  it('UI-005: DisputeTimelineView sorts timeline events chronologically and renders semantic <time> elements', () => {
    // Intentionally pass timeline events in reverse order
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
          id: 'evt-2',
          eventType: 'ACTION_REQUIRED',
          actorId: 'med-1',
          actorRole: 'mediator',
          note: 'Mediator requested close-up photos of grouting',
          timestamp: '2026-10-20T11:00:00Z',
        },
        {
          id: 'evt-1',
          eventType: 'DISPUTE_FILED',
          actorId: 'cust-1',
          actorRole: 'customer',
          note: 'Customer filed dispute for defective workmanship',
          timestamp: '2026-10-20T09:00:00Z',
        },
      ],
      createdAt: '2026-10-20T09:00:00Z',
      updatedAt: '2026-10-20T11:00:00Z',
    };

    render(<DisputeTimelineView record={mockRecord} />);

    expect(screen.getByText(/local dispute record/i)).toBeInTheDocument();

    // Verify both notes are rendered
    expect(
      screen.getByText(/Customer: Customer filed dispute for defective workmanship/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Mediator: Mediator requested close-up photos of grouting/i)
    ).toBeInTheDocument();

    // Verify chronological order in DOM: evt-1 (09:00) must appear before evt-2 (11:00)
    const timeElements = screen.getAllByRole('time');
    expect(timeElements.length).toBe(2);
    expect(timeElements[0]).toHaveAttribute('dateTime', '2026-10-20T09:00:00Z');
    expect(timeElements[1]).toHaveAttribute('dateTime', '2026-10-20T11:00:00Z');
  });

  // UI-006: Settlement breakdown card
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

    expect(screen.getByText(/settlement preview only/i)).toBeInTheDocument();
    expect(screen.getByText(/₦50,000/)).toBeInTheDocument();
    expect(screen.getByText(/₦32,500/)).toBeInTheDocument();
    expect(screen.getByText(/₦17,500/)).toBeInTheDocument();
  });

  // UI-007: BrainWorkerDisputeBanner lifecycle states
  it('UI-007: BrainWorkerDisputeBanner renders active dispute alert with reason and action button when status is FILED or UNDER_REVIEW', () => {
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
      screen.getByText(/dispute under review/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/workmanship defect/i)).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent(/local preview pauses its simulated completion timer/i);
    expect(screen.getByRole('alert')).toHaveTextContent(/does not change real escrow or payment status/i);

    const respondBtn = screen.getByRole('button', {
      name: /submit counter-evidence/i,
    });
    expect(respondBtn).toBeInTheDocument();
    fireEvent.click(respondBtn);
    expect(handleRespond).toHaveBeenCalledTimes(1);
  });

  // UI-007b: BrainWorkerDisputeBanner handles all declared lifecycle states
  it('UI-007b: BrainWorkerDisputeBanner renders appropriate banners across ACTION_REQUIRED, PROPOSAL_PENDING, and CANCELLED states', () => {
    const baseDispute: DisputeRecord = {
      id: 'disp-states',
      bookingId: 'book-states',
      customerId: 'cust-1',
      brainWorkerId: 'worker-1',
      initiatedByRole: 'customer',
      category: 'BILLING_SCOPE_DISAGREEMENT',
      description: 'Scope and billing dispute.',
      status: 'ACTION_REQUIRED',
      evidence: [],
      timeline: [],
      createdAt: '2026-10-20T09:00:00Z',
      updatedAt: '2026-10-20T10:00:00Z',
    };

    const { rerender } = render(<BrainWorkerDisputeBanner dispute={baseDispute} />);
    expect(screen.getByText(/action required/i)).toBeInTheDocument();

    rerender(<BrainWorkerDisputeBanner dispute={{ ...baseDispute, status: 'PROPOSAL_PENDING' }} />);
    expect(screen.getByText(/mediation proposal/i)).toBeInTheDocument();

    rerender(<BrainWorkerDisputeBanner dispute={{ ...baseDispute, status: 'CANCELLED' }} />);
    expect(screen.getByText(/dispute cancelled/i)).toBeInTheDocument();
  });

  // UI-008: BrainWorkerDisputeBanner resolution summary
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
      screen.getByText(/dispute resolved: resolution summary/i)
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

  // UI-009: HelpCenterView topic accordion and canonical language
  it('UI-009: HelpCenterView renders support topic categories, allows toggling category details, and uses canonical terminology', () => {
    render(<HelpCenterView />);

    expect(screen.getByText(/Billing & Escrow/i)).toBeInTheDocument();
    expect(screen.getByText(/On-Site Safety/i)).toBeInTheDocument();
    expect(screen.getByText(/Disputes & Mediation/i)).toBeInTheDocument();
    expect(screen.getByText(/Scope Adjustments/i)).toBeInTheDocument();

    // Verify NO forbidden terminology (tasker, technician)
    expect(screen.queryByText(/tasker/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/technician/i)).not.toBeInTheDocument();

    const disputeTopicBtn = screen.getByRole('button', {
      name: /Disputes & Mediation/i,
    });
    expect(disputeTopicBtn).toHaveAttribute('aria-expanded', 'false');

    // Click to expand
    fireEvent.click(disputeTopicBtn);
    expect(disputeTopicBtn).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText(/how does our dispute resolution process work\?/i)).toBeInTheDocument();

    // Click again to collapse
    fireEvent.click(disputeTopicBtn);
    expect(disputeTopicBtn).toHaveAttribute('aria-expanded', 'false');
  });

  // UI-009c: HelpCenterView makes support, verification, and mediation limits explicit
  it('UI-009c: HelpCenterView makes support, verification, and mediation limits explicit', () => {
    render(<HelpCenterView />);

    fireEvent.click(screen.getByRole('button', { name: /On-Site Safety/i }));
    expect(screen.getByText(/This local preview does not dispatch support tickets or contact emergency services/i)).toBeInTheDocument();
    expect(screen.getByText(/This local preview does not verify identities or run background checks/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Disputes & Mediation/i }));
    expect(screen.getByText(/This local preview stores dispute notes and evidence locally\. It does not contact a platform mediator/i)).toBeInTheDocument();

    const search = screen.getByRole('searchbox', { name: /Search help topics/i });
    fireEvent.change(search, { target: { value: 'no matching topic' } });
    expect(screen.getByText(/No matching topics found/i)).toBeInTheDocument();
    expect(screen.queryByText(/contact support directly/i)).not.toBeInTheDocument();
  });

  // UI-010: SupportTicketForm renders in an explicitly read-only, unavailable state with all fields and submit disabled
  it('UI-010: SupportTicketForm renders in an explicitly read-only, unavailable state with all fields and submit disabled', () => {
    render(<SupportTicketForm />);

    const categorySelect = screen.getByLabelText(/category \/ topic/i);
    expect(categorySelect).toBeDisabled();

    const emailInput = screen.getByLabelText(/email \/ contact/i);
    expect(emailInput).toBeDisabled();

    const bookingIdInput = screen.getByLabelText(/booking reference/i);
    expect(bookingIdInput).toBeDisabled();

    const messageInput = screen.getByLabelText(/message \/ inquiry/i);
    expect(messageInput).toBeDisabled();

    const submitBtn = screen.getByRole('button', { name: /submit ticket/i });
    expect(submitBtn).toBeDisabled();

    // Verify unavailable copy and absence of fake draft simulation wording
    expect(screen.getByText(/ticket submission is currently unavailable/i)).toBeInTheDocument();
    expect(screen.queryByText(/submit a ticket draft for simulated review/i)).not.toBeInTheDocument();
  });

  // UI-010b: SupportTicketForm prevents form submission and simulated success state even if onSubmit is provided
  it('UI-010b: SupportTicketForm prevents form submission and simulated success state even if onSubmit is provided', async () => {
    const handleSubmit = vi.fn();
    render(<SupportTicketForm onSubmit={handleSubmit} />);

    const submitBtn = screen.getByRole('button', { name: /submit ticket/i });
    expect(submitBtn).toBeDisabled();

    // Attempt form submission directly
    const form = screen.getByTestId('support-ticket-form');
    fireEvent.submit(form);

    expect(handleSubmit).not.toHaveBeenCalled();
    expect(screen.queryByText(/simulated locally/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/your support ticket inquiry has been simulated/i)).not.toBeInTheDocument();
  });

  // UI-010c: SupportTicketForm populates initialBookingId in disabled booking reference input
  it('UI-010c: SupportTicketForm populates initialBookingId in disabled booking reference input', () => {
    render(<SupportTicketForm initialBookingId="book-101" />);

    const bookingIdInput = screen.getByLabelText(/booking reference/i);
    expect(bookingIdInput).toHaveValue('book-101');
    expect(bookingIdInput).toBeDisabled();
  });

  // UI-002d: DisputeInitiationModal prevents same-tick duplicate submissions
  it('UI-002d: DisputeInitiationModal prevents same-tick duplicate submissions with exactly one callback', async () => {
    let resolveSubmit: () => void = () => {};
    const submitPromise = new Promise<void>((resolve) => {
      resolveSubmit = resolve;
    });
    const handleSubmit = vi.fn().mockReturnValue(submitPromise);

    render(
      <DisputeInitiationModal
        isOpen={true}
        bookingId="booking-101"
        initiatorRole="CUSTOMER"
        initiatorId="cust-101"
        onClose={vi.fn()}
        onSubmit={handleSubmit}
      />
    );

    const descriptionInput = screen.getByLabelText(/description/i);
    fireEvent.change(descriptionInput, {
      target: { value: 'Valid dispute problem description exceeding ten characters.' },
    });

    const submitBtn = screen.getByRole('button', { name: /submit dispute/i });

    // Rapid double click in same tick
    fireEvent.click(submitBtn);
    fireEvent.click(submitBtn);

    expect(handleSubmit).toHaveBeenCalledTimes(1);

    resolveSubmit();
  });

  // UI-002e: DisputeInitiationModal fails closed when initiatorId is missing
  it('UI-002e: DisputeInitiationModal fails closed and does not synthesize an identity when initiatorId is missing', () => {
    render(
      <DisputeInitiationModal
        isOpen={true}
        bookingId="booking-101"
        initiatorRole="CUSTOMER"
        initiatorId=""
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    expect(screen.getByText(/authenticated initiator identity missing|initiator context missing/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /submit dispute/i })).not.toBeInTheDocument();
  });

  // UI-002f: DisputeInitiationModal resets drafts cleanly on bookingId or initiatorId change
  it('UI-002f: DisputeInitiationModal resets drafts cleanly on bookingId or initiatorId change without leaking evidence', () => {
    const { rerender } = render(
      <DisputeInitiationModal
        isOpen={true}
        bookingId="booking-101"
        initiatorRole="CUSTOMER"
        initiatorId="cust-1"
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    const descriptionInput = screen.getByLabelText(/description/i);
    fireEvent.change(descriptionInput, {
      target: { value: 'Draft for booking 101 with ten plus characters.' },
    });
    expect(descriptionInput).toHaveValue('Draft for booking 101 with ten plus characters.');

    // Rerender with different bookingId
    rerender(
      <DisputeInitiationModal
        isOpen={true}
        bookingId="booking-102"
        initiatorRole="CUSTOMER"
        initiatorId="cust-1"
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    const newDescriptionInput = screen.getByLabelText(/description/i);
    expect(newDescriptionInput).toHaveValue('');
  });

  // UI-003e: Attachment continuity through successful submission vs cancelled draft
  it('UI-003e: DisputeEvidenceUploader preserves submitted evidence for DisputeTimelineView while cancelling uncommitted drafts', async () => {
    let submittedEvidenceList: DisputeEvidence[] = [];
    const handleSubmit = vi.fn().mockImplementation((data) => {
      submittedEvidenceList = data.evidence;
    });

    const { unmount } = render(
      <DisputeInitiationModal
        isOpen={true}
        bookingId="booking-101"
        initiatorRole="CUSTOMER"
        initiatorId="cust-1"
        onClose={vi.fn()}
        onSubmit={handleSubmit}
      />
    );

    const file = new File(['evidence image content'], 'inspection-photo.png', { type: 'image/png' });
    Object.defineProperty(file, 'size', { value: 1024 * 50 });

    const fileInput = screen.getByLabelText(/upload evidence/i);
    fireEvent.change(fileInput, { target: { files: [file] } });

    const descriptionInput = screen.getByLabelText(/description/i);
    fireEvent.change(descriptionInput, { target: { value: 'Bathroom grouting defective with cracks.' } });

    const submitBtn = screen.getByRole('button', { name: /submit dispute/i });
    fireEvent.click(submitBtn);

    expect(handleSubmit).toHaveBeenCalledTimes(1);
    expect(submittedEvidenceList.length).toBe(1);
    const activeBlobUrl = submittedEvidenceList[0]?.previewUrl;
    expect(activeBlobUrl).toBeDefined();

    // Close/unmount modal
    unmount();

    // Verify submitted blob URL was NOT revoked upon modal unmount
    expect(URL.revokeObjectURL).not.toHaveBeenCalledWith(activeBlobUrl);

    // Render DisputeTimelineView with the dispute record containing this evidence
    const mockRecord: DisputeRecord = {
      id: 'disp-real-1',
      bookingId: 'booking-101',
      customerId: 'cust-1',
      brainWorkerId: 'worker-1',
      initiatedByRole: 'customer',
      category: 'WORKMANSHIP_DEFECT',
      description: 'Bathroom grouting defective with cracks.',
      status: 'UNDER_REVIEW',
      evidence: submittedEvidenceList,
      timeline: [
        {
          id: 'evt-1',
          eventType: 'DISPUTE_FILED',
          actorId: 'cust-1',
          actorRole: 'customer',
          note: 'Filed dispute with evidence',
          timestamp: '2026-10-20T10:00:00Z',
        },
      ],
      createdAt: '2026-10-20T10:00:00Z',
      updatedAt: '2026-10-20T10:00:00Z',
    };

    render(<DisputeTimelineView record={mockRecord} />);
    expect(screen.getByText(/Filed dispute with evidence/i)).toBeInTheDocument();

    // Now test a cancelled draft in a new modal
    const handleCancel = vi.fn();
    render(
      <DisputeInitiationModal
        isOpen={true}
        bookingId="booking-202"
        initiatorRole="CUSTOMER"
        initiatorId="cust-1"
        onClose={handleCancel}
        onSubmit={vi.fn()}
      />
    );

    const draftFile = new File(['cancel draft'], 'discard.png', { type: 'image/png' });
    Object.defineProperty(draftFile, 'size', { value: 1024 * 20 });
    const draftFileInput = screen.getAllByLabelText(/upload evidence/i)[0];
    if (draftFileInput) {
      fireEvent.change(draftFileInput, { target: { files: [draftFile] } });
    }

    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelBtn);
    expect(handleCancel).toHaveBeenCalledTimes(1);
  });

  // UI-010d: SupportTicketForm fields remain permanently disabled against user interactions
  it('UI-010d: SupportTicketForm fields remain permanently disabled against user interactions', () => {
    render(<SupportTicketForm />);

    const categorySelect = screen.getByLabelText(/category \/ topic/i);
    const emailInput = screen.getByLabelText(/email \/ contact/i);
    const bookingIdInput = screen.getByLabelText(/booking reference/i);
    const messageInput = screen.getByLabelText(/message \/ inquiry/i);
    const submitBtn = screen.getByRole('button', { name: /submit ticket/i });

    expect(categorySelect).toBeDisabled();
    expect(emailInput).toBeDisabled();
    expect(bookingIdInput).toBeDisabled();
    expect(messageInput).toBeDisabled();
    expect(submitBtn).toBeDisabled();
  });

  // UI-005b: DisputeTimelineView renders submitted evidence attachments with preview and links
  it('UI-005b: DisputeTimelineView renders submitted evidence attachments with thumbnail, role, and open link', () => {
    const mockRecord: DisputeRecord = {
      id: 'disp-with-ev',
      bookingId: 'book-101',
      customerId: 'cust-1',
      brainWorkerId: 'worker-1',
      initiatedByRole: 'customer',
      category: 'WORKMANSHIP_DEFECT',
      description: 'Photos attached of leaking pipe.',
      status: 'UNDER_REVIEW',
      evidence: [
        {
          id: 'ev-img-1',
          uploaderId: 'cust-1',
          uploaderRole: 'customer',
          fileType: 'image/jpeg',
          previewUrl: 'blob:mock-url-leak.jpg',
          caption: 'Pipe connection crack',
          uploadedAt: '2026-10-20T09:00:00Z',
          sizeBytes: 1024 * 100,
        },
        {
          id: 'ev-pdf-1',
          uploaderId: 'worker-1',
          uploaderRole: 'brainworker',
          fileType: 'application/pdf',
          previewUrl: 'blob:mock-url-report.pdf',
          caption: 'Pressure test report',
          uploadedAt: '2026-10-20T10:00:00Z',
          sizeBytes: 1024 * 250,
        },
      ],
      timeline: [],
      createdAt: '2026-10-20T09:00:00Z',
      updatedAt: '2026-10-20T10:00:00Z',
    };

    render(<DisputeTimelineView record={mockRecord} />);

    expect(screen.getByText(/Submitted Evidence|Evidence Attachments/i)).toBeInTheDocument();
    expect(screen.getByText(/Pipe connection crack/i)).toBeInTheDocument();
    expect(screen.getByText(/Pressure test report/i)).toBeInTheDocument();

    const viewLinks = screen.getAllByRole('link', { name: /view attachment|open attachment/i });
    expect(viewLinks.length).toBe(2);
    expect(viewLinks[0]).toHaveAttribute('href', 'blob:mock-url-leak.jpg');
    expect(viewLinks[1]).toHaveAttribute('href', 'blob:mock-url-report.pdf');

    // Image thumbnail rendered for jpeg
    const imgThumbnail = screen.getByRole('img', { name: /Pipe connection crack|Evidence thumbnail/i });
    expect(imgThumbnail).toHaveAttribute('src', 'blob:mock-url-leak.jpg');
  });

  // UI-007c: DisputeCounterEvidenceModal allows BrainWorker counter-evidence upload and submission
  it('UI-007c: DisputeCounterEvidenceModal uploads and submits counter-evidence to existing dispute', async () => {
    const handleSubmit = vi.fn().mockResolvedValue(undefined);
    const handleClose = vi.fn();

    render(
      <DisputeCounterEvidenceModal
        isOpen={true}
        disputeId="disp-101"
        bookingId="book-101"
        callerId="worker-1"
        callerRole="brainworker"
        onClose={handleClose}
        onSubmit={handleSubmit}
      />
    );

    expect(screen.getByRole('heading', { name: /Submit Counter-Evidence/i })).toBeInTheDocument();

    const file = new File(['counter proof image'], 'repaired-joint.png', { type: 'image/png' });
    Object.defineProperty(file, 'size', { value: 1024 * 80 });

    const fileInput = screen.getByLabelText(/upload evidence/i);
    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(screen.getByText(/repaired-joint.png/i)).toBeInTheDocument();

    const submitBtn = screen.getByRole('button', { name: /submit counter-evidence/i });
    expect(submitBtn).toBeEnabled();

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledTimes(1);
    });
    expect(handleSubmit).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          uploaderId: 'worker-1',
          uploaderRole: 'brainworker',
          caption: 'repaired-joint.png',
        }),
      ])
    );
  });

  // UI-007d: Counter-evidence upload enforces single attachment per response to prevent partial failure loops
  it('UI-007d: DisputeCounterEvidenceModal restricts upload to single attachment per submission, preventing partial failure or duplicate writes', async () => {
    const handleClose = vi.fn();
    const handleSubmit = vi.fn().mockRejectedValue(new Error('Network error on counter-evidence submit'));

    render(
      <DisputeCounterEvidenceModal
        isOpen={true}
        disputeId="disp-101"
        bookingId="book-101"
        callerId="worker-1"
        callerRole="brainworker"
        onClose={handleClose}
        onSubmit={handleSubmit}
      />
    );

    const file = new File(['proof buffer'], 'invoice-receipt.pdf', { type: 'application/pdf' });
    Object.defineProperty(file, 'size', { value: 1024 * 40 });

    const fileInput = screen.getByLabelText(/upload evidence/i);
    fireEvent.change(fileInput, { target: { files: [file] } });

    const submitBtn = screen.getByRole('button', { name: /submit counter-evidence/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/network error on counter-evidence submit/i);
    });

    // Modal stays open with the failed item retained for retry
    expect(screen.getByText(/invoice-receipt.pdf/i)).toBeInTheDocument();
  });

  // UI-003f: Session isolation in DisputeEvidenceUploader
  it('UI-003f: Multi-session draft isolation ensures unmounting uploader A does not revoke uploader B draft blobs', () => {
    let listA: DisputeEvidence[] = [];
    let listB: DisputeEvidence[] = [];

    const { unmount: unmountA } = render(
      <DisputeEvidenceUploader
        evidenceList={listA}
        onChange={(items) => { listA = items; }}
        uploaderId="usr-a"
        uploaderRole="customer"
        sessionId="session-a"
      />
    );

    const { unmount: unmountB } = render(
      <DisputeEvidenceUploader
        evidenceList={listB}
        onChange={(items) => { listB = items; }}
        uploaderId="usr-b"
        uploaderRole="brainworker"
        sessionId="session-b"
      />
    );

    const fileA = new File(['a'], 'session-a.png', { type: 'image/png' });
    const fileB = new File(['b'], 'session-b.png', { type: 'image/png' });

    const inputs = screen.getAllByLabelText(/upload evidence/i);
    if (inputs[0]) fireEvent.change(inputs[0], { target: { files: [fileA] } });
    if (inputs[1]) fireEvent.change(inputs[1], { target: { files: [fileB] } });

    expect(listA.length).toBe(1);
    expect(listB.length).toBe(1);
    const urlA = listA[0]?.previewUrl as string;
    const urlB = listB[0]?.previewUrl as string;

    expect(evidenceStore.isBlobActive(urlA)).toBe(true);
    expect(evidenceStore.isBlobActive(urlB)).toBe(true);

    // Unmount uploader A
    unmountA();

    // Session A blob revoked
    expect(evidenceStore.isBlobActive(urlA)).toBe(false);

    // Session B blob must still be active!
    expect(evidenceStore.isBlobActive(urlB)).toBe(true);
    expect(URL.revokeObjectURL).not.toHaveBeenCalledWith(urlB);

    unmountB();
    expect(evidenceStore.isBlobActive(urlB)).toBe(false);
  });

  // UI-007d: Two DisputeEvidenceUploader instances with omitted sessionId have isolated default owners
  it('UI-007d: two DisputeEvidenceUploader instances with omitted sessionId have isolated default owners and unmounting one does not clear the other', () => {
    let listA: DisputeEvidence[] = [];
    let listB: DisputeEvidence[] = [];

    const { unmount: unmountA } = render(
      <DisputeEvidenceUploader
        evidenceList={listA}
        onChange={(items) => { listA = items; }}
        uploaderId="caller-1"
        uploaderRole="customer"
      />
    );

    const { unmount: unmountB } = render(
      <DisputeEvidenceUploader
        evidenceList={listB}
        onChange={(items) => { listB = items; }}
        uploaderId="caller-2"
        uploaderRole="brainworker"
      />
    );

    const fileA = new File(['alpha'], 'default-a.png', { type: 'image/png' });
    const fileB = new File(['beta'], 'default-b.png', { type: 'image/png' });

    const inputs = screen.getAllByLabelText(/upload evidence/i);
    if (inputs[0]) fireEvent.change(inputs[0], { target: { files: [fileA] } });
    if (inputs[1]) fireEvent.change(inputs[1], { target: { files: [fileB] } });

    expect(listA.length).toBe(1);
    expect(listB.length).toBe(1);
    const urlA = listA[0]?.previewUrl as string;
    const urlB = listB[0]?.previewUrl as string;

    expect(evidenceStore.isBlobActive(urlA)).toBe(true);
    expect(evidenceStore.isBlobActive(urlB)).toBe(true);

    // Unmount uploader A (which had omitted sessionId)
    unmountA();

    // Session A blob revoked
    expect(evidenceStore.isBlobActive(urlA)).toBe(false);

    // Instance B (also with omitted sessionId) must NOT be revoked!
    expect(evidenceStore.isBlobActive(urlB)).toBe(true);
    expect(URL.revokeObjectURL).not.toHaveBeenCalledWith(urlB);

    unmountB();
    expect(evidenceStore.isBlobActive(urlB)).toBe(false);
  });

  // UI-005c: DisputeCounterEvidenceModal resets staged evidence when disputeId or callerId changes while open
  it('UI-005c: resets staged evidence when disputeId or callerId changes while open', async () => {
    const { rerender } = render(
      <DisputeCounterEvidenceModal
        isOpen={true}
        disputeId="disp-1"
        bookingId="book-1"
        callerId="worker-1"
        callerRole="brainworker"
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    const fileInput = screen.getByLabelText(/upload evidence/i);
    const file = new File(['proof'], 'proof-worker1.png', { type: 'image/png' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/proof-worker1\.png/i)).toBeInTheDocument();
    });

    // Rerender with different disputeId while modal remains open
    rerender(
      <DisputeCounterEvidenceModal
        isOpen={true}
        disputeId="disp-2"
        bookingId="book-2"
        callerId="worker-2"
        callerRole="brainworker"
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    // Must have cleared the previous draft evidence
    expect(screen.queryByText(/proof-worker1\.png/i)).not.toBeInTheDocument();
  });

  // UI-006b: DisputeTimelineView renders fallback on image error
  it('UI-006b: DisputeTimelineView renders image fallback when thumbnail fails to load', async () => {
    const recordWithEvidence: DisputeRecord = {
      id: 'disp-img-test',
      bookingId: 'book-img',
      customerId: 'cust-1',
      brainWorkerId: 'worker-1',
      initiatedByRole: 'customer',
      category: 'WORKMANSHIP_DEFECT',
      description: 'Image fallback test claim',
      evidence: [
        {
          id: 'ev-corrupt',
          uploaderId: 'cust-1',
          uploaderRole: 'customer',
          fileType: 'image/png',
          caption: 'corrupt.png',
          sizeBytes: 1024,
          previewUrl: 'blob:invalid-image-url',
          uploadedAt: '2026-10-21T09:00:00Z',
        },
      ],
      status: 'UNDER_REVIEW',
      timeline: [],
      createdAt: '2026-10-21T09:00:00Z',
      updatedAt: '2026-10-21T09:00:00Z',
    };

    render(<DisputeTimelineView record={recordWithEvidence} />);

    const img = screen.getByRole('img');
    fireEvent.error(img);

    await waitFor(() => {
      const fallback = screen.getByRole('img', { name: 'Image Preview (Unavailable)' });
      expect(fallback).toBeInTheDocument();
      expect(screen.getByText(/Image Preview/i)).toBeInTheDocument();
      expect(screen.getByText(/\(Unavailable\)/i)).toBeInTheDocument();
    });
  });

  // UI-009b: HelpCenterView search input includes visible focus ring styling
  it('UI-009b: HelpCenterView search input includes visible focus ring class', () => {
    render(<HelpCenterView />);
    const searchInput = screen.getByPlaceholderText(/search by topic/i);
    expect(searchInput.className).toContain('focus:ring-2');
    expect(searchInput.className).toContain('focus:ring-[var(--amber)]');
  });

  // UI-009d: HelpCenterView qualifies billing, escrow, and scope adjustments within local preview boundary
  it('UI-009d: HelpCenterView qualifies billing, escrow, and scope adjustments within local preview boundary', () => {
    render(<HelpCenterView />);

    expect(screen.queryByText(/Browse guidance on platform policies, escrow protection/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Browse local preview guidance on dispute workflows, simulated completion milestones/i)).toBeInTheDocument();
    expect(screen.queryByText(/milestone escrow holds funds/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Review how simulated milestone records model completion verification in this local preview/i)).toBeInTheDocument();

    const scopeTopicBtn = screen.getByRole('button', { name: /Scope Adjustments/i });
    fireEvent.click(scopeTopicBtn);
    expect(screen.getByText(/In this local prototype, BrainWorkers submit simulated extra parts and labor requests/i)).toBeInTheDocument();
  });

  // UI-005d: DisputeCounterEvidenceModal clarifies that counter-evidence attachments are recorded on the local preview timeline
  it('UI-005d: DisputeCounterEvidenceModal clarifies that counter-evidence attachments are recorded on the local preview timeline', () => {
    render(
      <DisputeCounterEvidenceModal
        isOpen={true}
        disputeId="disp-101"
        bookingId="book-101"
        callerId="worker-1"
        callerRole="brainworker"
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    expect(screen.getByText(/All submitted attachments are recorded on the local preview timeline/i)).toBeInTheDocument();
  });
});
