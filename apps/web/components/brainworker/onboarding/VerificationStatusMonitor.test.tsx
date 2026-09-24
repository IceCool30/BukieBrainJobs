// apps/web/components/brainworker/onboarding/VerificationStatusMonitor.test.tsx
// Phase 7 RED: Verification Status Monitor Contract Tests (Suite 8: VFD-001 to VFD-005)
// Authoritative References:
// - docs/specs/BW-001-architecture-contract.md (Section 2.4 & 2.5)
// - docs/specs/BW-001-ux-design-specification.md (Section 3.3)
// - docs/specs/BW-001-test-first-implementation-plan.md (Suite 8: VFD-001 to VFD-005)

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VerificationStatusMonitor } from './VerificationStatusMonitor';
import type {
  BrainWorkerOnboardingRecord,
  BrainWorkerOnboardingStatus,
} from '../../../lib/brainworker/types';
import * as fs from 'fs';
import * as path from 'path';

describe('BW-001 Suite 8: VerificationStatusMonitor Contracts (VFD-001 to VFD-005)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const baseRecord: BrainWorkerOnboardingRecord = {
    id: 'rec-bw-1',
    brainWorkerId: 'bw-user-1',
    status: 'SUBMITTED',
    currentStep: 'review',
    identity: {
      legalFirstName: 'Amina',
      legalLastName: 'Okonkwo',
      dateOfBirth: '1992-04-12',
      identifierType: 'NIN',
      identifierNumber: '12345678901',
      maskedIdentifier: '•••••••8901',
      residentialAddress: {
        street: '14 Commercial Avenue',
        city: 'Yaba',
        lga: 'Yaba',
        state: 'Lagos',
      },
    },
    trade: {
      primaryCategory: 'generator',
      subSpecialties: ['Diesel Generators'],
      experienceLevel: 'JOURNEYMAN_EXPERIENCED',
      yearsInTrade: 6,
      coverageCities: ['Lagos'],
    },
    credentials: {
      governmentId: {
        id: 'doc-1',
        category: 'GOVERNMENT_ID',
        specificType: 'NATIONAL_EID',
        fileName: 'nin-slip.pdf',
        fileSizeBytes: 1_200_000,
        mimeType: 'application/pdf',
        stagedAt: '2026-09-24T06:00:00.000Z',
      },
      tradeCredentials: [
        {
          id: 'doc-2',
          category: 'TRADE_CREDENTIAL',
          specificType: 'TRADE_TEST_CERTIFICATE',
          fileName: 'trade-cert.pdf',
          fileSizeBytes: 950_000,
          mimeType: 'application/pdf',
          stagedAt: '2026-09-24T06:00:00.000Z',
        },
      ],
      workProofs: [],
    },
    declaration: {
      truthfulnessAcknowledged: true,
      termsAccepted: true,
      declaredAt: '2026-09-24T07:00:00.000Z',
    },
    remediationIssues: [],
    rejectionDetails: null,
    submittedAt: '2026-09-24T07:00:00.000Z',
    reviewedAt: null,
    createdAt: '2026-09-24T05:00:00.000Z',
    updatedAt: '2026-09-24T07:00:00.000Z',
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // VFD-001: SUBMITTED (Queue Placement)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  it('VFD-001: renders queue placement card with 24–48h turnaround disclaimers for SUBMITTED state', () => {
    const record: BrainWorkerOnboardingRecord = {
      ...baseRecord,
      status: 'SUBMITTED',
    };
    render(<VerificationStatusMonitor record={record} />);

    expect(screen.getByText(/Application Received/i)).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /Your Verification Application is in Queue/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/We have received your identity and trade credentials/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Expected turnaround: 24 to 48 business hours/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/in-app alert and SMS/i)).toBeInTheDocument();

    // Invariant: no workspace CTA
    expect(
      screen.queryByRole('button', { name: /Enter BrainWorker Workspace/i })
    ).not.toBeInTheDocument();
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // VFD-002: PENDING_REVIEW (Active Review Checklist)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  it('VFD-002: renders active review card with multi-stage checklist for PENDING_REVIEW state', () => {
    const record: BrainWorkerOnboardingRecord = {
      ...baseRecord,
      status: 'PENDING_REVIEW',
    };
    render(<VerificationStatusMonitor record={record} />);

    expect(screen.getByText(/Under Active Review/i)).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /Verification Review in Progress/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Application Submitted & Formats Checked/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Government Identity Document Review/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Trade Credential & Competency Check/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Final Operating Approval/i)
    ).toBeInTheDocument();

    expect(
      screen.queryByRole('button', { name: /Enter BrainWorker Workspace/i })
    ).not.toBeInTheDocument();
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // VFD-003: REMEDIATION_REQUIRED (Actionable Guidance & CTA)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  it('VFD-003: renders actionable issue alert and remediation CTA for REMEDIATION_REQUIRED state', () => {
    const onRemediate = vi.fn();
    const record: BrainWorkerOnboardingRecord = {
      ...baseRecord,
      status: 'REMEDIATION_REQUIRED',
      remediationIssues: [
        {
          targetStep: 'credentials',
          fieldKey: 'governmentId',
          issueCode: 'BLURRY_IMAGE',
          message:
            'The photo of your National e-ID Card was blurry and the NIN number was not readable. Please upload a clear photo.',
          flaggedAt: '2026-09-24T08:00:00.000Z',
        },
      ],
    };
    render(<VerificationStatusMonitor record={record} onRemediate={onRemediate} />);

    expect(
      screen.getByText(/^Action Needed$/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /Action Needed: Document Re-Upload Required/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /The photo of your National e-ID Card was blurry and the NIN number was not readable/i
      )
    ).toBeInTheDocument();

    const fixBtn = screen.getByRole('button', {
      name: /Update Government ID|Fix Flagged Issue|Update Credentials/i,
    });
    fireEvent.click(fixBtn);
    expect(onRemediate).toHaveBeenCalledWith('credentials');
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // VFD-004: REJECTED (Authoritative Explanation & Support)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  it('VFD-004: renders authoritative rejection explanation and support contact for REJECTED state', () => {
    const record: BrainWorkerOnboardingRecord = {
      ...baseRecord,
      status: 'REJECTED',
      rejectionDetails: {
        reasonCode: 'UNVERIFIABLE_CREDENTIALS',
        message:
          'Our verification team was unable to confirm the trade test records with the issuing authority.',
        rejectedAt: '2026-09-24T08:30:00.000Z',
      },
    };
    render(<VerificationStatusMonitor record={record} />);

    expect(screen.getByText(/Application Not Approved/i)).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /Verification Could Not Be Completed/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Our verification team was unable to confirm the trade test records with the issuing authority/i
      )
    ).toBeInTheDocument();
    expect(screen.getByText(/support@bukiebrainjobs\.com/i)).toBeInTheDocument();

    // Must not render workspace or resubmit buttons
    expect(
      screen.queryByRole('button', { name: /Enter BrainWorker Workspace/i })
    ).not.toBeInTheDocument();
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // VFD-005: APPROVED (Verified Provider & Workspace Access)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  it('VFD-005: renders verified banner and workspace navigation CTA for APPROVED state', () => {
    const onEnterWorkspace = vi.fn();
    const record: BrainWorkerOnboardingRecord = {
      ...baseRecord,
      status: 'APPROVED',
    };
    render(
      <VerificationStatusMonitor
        record={record}
        onEnterWorkspace={onEnterWorkspace}
      />
    );

    expect(screen.getByText(/Verified Provider/i)).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        name: /Congratulations! Your BrainWorker Account is Verified/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /You are now an approved service provider on BukieBrainJobs/i
      )
    ).toBeInTheDocument();

    const enterBtn = screen.getByRole('button', {
      name: /Enter BrainWorker Workspace/i,
    });
    expect(enterBtn).toBeInTheDocument();
    fireEvent.click(enterBtn);
    expect(onEnterWorkspace).toHaveBeenCalledTimes(1);
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // VFD-006: Invariant: Workspace CTA is strictly gated to APPROVED state
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  it('VFD-006: workspace button is never rendered for non-APPROVED statuses', () => {
    const nonApprovedStatuses: BrainWorkerOnboardingStatus[] = [
      'DRAFT',
      'SUBMITTED',
      'PENDING_REVIEW',
      'REMEDIATION_REQUIRED',
      'REJECTED',
    ];

    for (const status of nonApprovedStatuses) {
      const { unmount } = render(
        <VerificationStatusMonitor
          record={{
            ...baseRecord,
            status,
            remediationIssues:
              status === 'REMEDIATION_REQUIRED'
                ? [
                    {
                      targetStep: 'identity',
                      issueCode: 'INVALID_DOB',
                      message: 'DOB error',
                      flaggedAt: '2026-09-24T00:00:00Z',
                    },
                  ]
                : [],
            rejectionDetails:
              status === 'REJECTED'
                ? {
                    reasonCode: 'OTHER',
                    message: 'Ineligible',
                    rejectedAt: '2026-09-24T00:00:00Z',
                  }
                : null,
          }}
        />
      );

      expect(
        screen.queryByRole('button', { name: /Enter BrainWorker Workspace/i })
      ).not.toBeInTheDocument();

      unmount();
    }
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // VFD-007: Physical Boundary & Security Invariant
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  it('VFD-007: production component does not import from testing/', () => {
    const componentPath = path.resolve(__dirname, './VerificationStatusMonitor.tsx');
    const content = fs.readFileSync(componentPath, 'utf-8');

    expect(content).not.toMatch(/from ['"].*\/testing['"]/);
    expect(content).not.toMatch(/from ['"].*\/testing\/.*['"]/);
  });
});
