// apps/web/components/brainworker/onboarding/CredentialsAndReviewForms.test.tsx
// Phase 6 RED: Step 3 Credentials & Step 4 Review Form Contract Tests
// Authoritative References:
// - docs/specs/BW-001-architecture-contract.md (Section 2.3 & 2.4)
// - docs/specs/BW-001-ux-design-specification.md (Section 3.2.4 & 3.2.5)
// - docs/specs/BW-001-test-first-implementation-plan.md (Suite 7: CRD-001 to CRD-004, REV-001 to REV-005)

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CredentialsStepForm } from './CredentialsStepForm';
import { ReviewStepForm } from './ReviewStepForm';
import type {
  OnboardingIdentityData,
  OnboardingTradeData,
  OnboardingCredentialsData,
  StagedDocument,
} from '../../../lib/brainworker/types';
import * as fs from 'fs';
import * as path from 'path';

describe('BW-001 Suite 7: Credentials & Review Forms Contracts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockGovDoc: StagedDocument = {
    id: 'gov-doc-1',
    category: 'GOVERNMENT_ID',
    specificType: 'NATIONAL_EID',
    fileName: 'national-eid.jpg',
    fileSizeBytes: 2_400_000,
    mimeType: 'image/jpeg',
    stagedAt: '2026-09-24T06:00:00.000Z',
    previewUrl: 'blob:https://bukiebrainjobs.com/preview-gov',
  };

  const mockTradeDoc: StagedDocument = {
    id: 'trade-doc-1',
    category: 'TRADE_CREDENTIAL',
    specificType: 'TRADE_TEST_CERTIFICATE',
    fileName: 'trade-test-cert.pdf',
    fileSizeBytes: 1_200_000,
    mimeType: 'application/pdf',
    stagedAt: '2026-09-24T06:00:00.000Z',
  };

  const mockWorkProofDoc: StagedDocument = {
    id: 'work-doc-1',
    category: 'WORK_PROOF',
    specificType: 'WORKSHOP_PHOTO',
    fileName: 'workshop.jpg',
    fileSizeBytes: 3_100_000,
    mimeType: 'image/jpeg',
    stagedAt: '2026-09-24T06:00:00.000Z',
  };

  const mockIdentityData: OnboardingIdentityData = {
    legalFirstName: 'Amina',
    legalMiddleName: 'Bolanle',
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
  };

  const mockTradeData: OnboardingTradeData = {
    primaryCategory: 'generator',
    subSpecialties: ['Diesel Generators', 'Soundproof Enclosures'],
    experienceLevel: 'JOURNEYMAN_EXPERIENCED',
    yearsInTrade: 6,
    coverageCities: ['Lagos', 'Abuja (FCT)'],
  };

  const mockCredentialsData: OnboardingCredentialsData = {
    governmentId: mockGovDoc,
    tradeCredentials: [mockTradeDoc],
    workProofs: [mockWorkProofDoc],
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CredentialsStepForm Tests (CRD-001 through CRD-004)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('CredentialsStepForm Contracts (CRD-001 to CRD-004)', () => {
    it('CRD-001: renders mandatory Government ID section with document type selector', () => {
      render(
        <CredentialsStepForm
          onSave={vi.fn()}
          onBack={vi.fn()}
        />
      );

      expect(
        screen.getByText(/Government Identity Document \(Mandatory\)/i)
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText(/Government Document Type/i)
      ).toBeInTheDocument();
    });

    it('CRD-002: renders mandatory Trade Proof section with credential type selector', () => {
      render(
        <CredentialsStepForm
          onSave={vi.fn()}
          onBack={vi.fn()}
        />
      );

      expect(
        screen.getByText(/Trade Competency Proof \(Mandatory\)/i)
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText(/Trade Credential Type/i)
      ).toBeInTheDocument();
    });

    it('CRD-003: renders optional Workshop & Equipment Proof section with work proof selector', () => {
      render(
        <CredentialsStepForm
          onSave={vi.fn()}
          onBack={vi.fn()}
        />
      );

      expect(
        screen.getByText(/Workshop & Equipment Proof \(Optional\)/i)
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText(/Work Proof Type/i)
      ).toBeInTheDocument();
    });

    it('CRD-004: gates Save & Continue until at least 1 Government ID and 1 Trade Proof are staged', () => {
      const onSave = vi.fn();
      const onBack = vi.fn();

      const { rerender } = render(
        <CredentialsStepForm
          initialData={{ governmentId: null, tradeCredentials: [], workProofs: [] }}
          onSave={onSave}
          onBack={onBack}
        />
      );

      const saveBtn = screen.getByRole('button', {
        name: /Save & Continue to Review/i,
      });
      expect(saveBtn).toBeDisabled();

      // Rerender with staged government ID and trade credential
      rerender(
        <CredentialsStepForm
          initialData={{
            governmentId: mockGovDoc,
            tradeCredentials: [mockTradeDoc],
            workProofs: [],
          }}
          onSave={onSave}
          onBack={onBack}
        />
      );

      expect(saveBtn).toBeEnabled();

      fireEvent.click(saveBtn);
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          governmentId: mockGovDoc,
          tradeCredentials: [mockTradeDoc],
        })
      );

      // Back navigation
      const backBtn = screen.getByRole('button', {
        name: /Back to Trade Profile/i,
      });
      fireEvent.click(backBtn);
      expect(onBack).toHaveBeenCalledTimes(1);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ReviewStepForm Tests (REV-001 through REV-005)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('ReviewStepForm Contracts (REV-001 to REV-005)', () => {
    const defaultReviewProps = {
      identityData: mockIdentityData,
      tradeData: mockTradeData,
      credentialsData: mockCredentialsData,
      onEditStep: vi.fn(),
      onBack: vi.fn(),
      onSubmit: vi.fn(),
    };

    it('REV-001: renders Identity Summary Card with legal name, DOB, and masked NIN/BVN', () => {
      render(<ReviewStepForm {...defaultReviewProps} />);

      expect(screen.getByText(/Identity Information/i)).toBeInTheDocument();
      expect(screen.getByText(/Amina Bolanle Okonkwo/i)).toBeInTheDocument();
      expect(screen.getByText(/1992-04-12/i)).toBeInTheDocument();
      expect(screen.getByText(/•••••••8901/i)).toBeInTheDocument();
      expect(screen.getByText(/14 Commercial Avenue/i)).toBeInTheDocument();
    });

    it('REV-002: renders Trade Summary Card with primary category, experience tier, and cities', () => {
      render(<ReviewStepForm {...defaultReviewProps} />);

      expect(screen.getByText(/Trade & Coverage Profile/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Generator Repair & Maintenance/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Journeyman \/ Experienced/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/6 years/i)).toBeInTheDocument();
      expect(screen.getByText(/Lagos, Abuja \(FCT\)|Lagos/i)).toBeInTheDocument();
    });

    it('REV-003: renders Documents Summary Card with staged file names and categories', () => {
      render(<ReviewStepForm {...defaultReviewProps} />);

      expect(screen.getByText(/Documents & Credentials/i)).toBeInTheDocument();
      expect(screen.getByText('national-eid.jpg')).toBeInTheDocument();
      expect(screen.getByText('trade-test-cert.pdf')).toBeInTheDocument();
    });

    it('REV-004: provides Edit buttons jumping directly back to respective onboarding steps', () => {
      const onEditStep = vi.fn();
      render(<ReviewStepForm {...defaultReviewProps} onEditStep={onEditStep} />);

      const editIdentityBtn = screen.getByRole('button', {
        name: /Edit Identity Information|Edit Identity/i,
      });
      fireEvent.click(editIdentityBtn);
      expect(onEditStep).toHaveBeenCalledWith('identity');

      const editTradeBtn = screen.getByRole('button', {
        name: /Edit Trade Profile|Edit Trade/i,
      });
      fireEvent.click(editTradeBtn);
      expect(onEditStep).toHaveBeenCalledWith('trade');

      const editDocsBtn = screen.getByRole('button', {
        name: /Edit Documents & Credentials|Edit Documents|Edit Credentials/i,
      });
      fireEvent.click(editDocsBtn);
      expect(onEditStep).toHaveBeenCalledWith('credentials');
    });

    it('REV-005: truthfulness and terms checkboxes gate submission; triggers onSubmit with metadata', () => {
      const onSubmit = vi.fn();
      render(<ReviewStepForm {...defaultReviewProps} onSubmit={onSubmit} />);

      const submitBtn = screen.getByRole('button', {
        name: /Submit Verification Application/i,
      });
      expect(submitBtn).toBeDisabled();

      const truthCheckbox = screen.getByRole('checkbox', {
        name: /I solemnly declare that all personal details/i,
      });
      const termsCheckbox = screen.getByRole('checkbox', {
        name: /I agree to the BukieBrainJobs Provider Terms of Service/i,
      });

      // Tick only truthfulness: should still be disabled
      fireEvent.click(truthCheckbox);
      expect(submitBtn).toBeDisabled();

      // Tick terms as well: should now be enabled
      fireEvent.click(termsCheckbox);
      expect(submitBtn).toBeEnabled();

      fireEvent.click(submitBtn);
      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          truthfulnessAcknowledged: true,
          termsAccepted: true,
        })
      );
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CRD-REV-006: Physical Boundary & Security Invariant
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('CRD-REV-006: Physical Boundary & Architecture Invariants', () => {
    it('production components do not import from testing/', () => {
      const credsPath = path.resolve(__dirname, './CredentialsStepForm.tsx');
      const reviewPath = path.resolve(__dirname, './ReviewStepForm.tsx');

      const credsContent = fs.readFileSync(credsPath, 'utf-8');
      const reviewContent = fs.readFileSync(reviewPath, 'utf-8');

      expect(credsContent).not.toMatch(/from ['"].*\/testing['"]/);
      expect(credsContent).not.toMatch(/from ['"].*\/testing\/.*['"]/);

      expect(reviewContent).not.toMatch(/from ['"].*\/testing['"]/);
      expect(reviewContent).not.toMatch(/from ['"].*\/testing\/.*['"]/);
    });
  });
});
