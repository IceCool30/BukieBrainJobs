// apps/web/components/brainworker/onboarding/IdentityStepForm.test.tsx
// Phase 4 RED: Stepper Progress & Step 1 Identity Form Contract Tests
// Authoritative References:
// - docs/specs/BW-001-architecture-contract.md (Section 2.1 & 2.3)
// - docs/specs/BW-001-ux-design-specification.md (Section 3.2.1 & 3.2.2)
// - docs/specs/BW-001-test-first-implementation-plan.md (Suite 5: STP-001, STP-002, IDE-001 to IDE-008)

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FunnelProgressBar } from './FunnelProgressBar';
import { IdentityStepForm } from './IdentityStepForm';
import type { OnboardingIdentityData } from '../../../lib/brainworker/types';
import * as fs from 'fs';
import * as path from 'path';

describe('BW-001 Suite 5: Stepper Progress & Identity Form Contracts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STP-001: FunnelProgressBar - 4-step progress representation & active highlights
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('STP-001: 4-Step Progress Representation', () => {
    it('renders all 4 steps and highlights current active step with aria-current="step"', () => {
      render(<FunnelProgressBar currentStep="identity" />);

      expect(screen.getByText(/Identity/i)).toBeInTheDocument();
      expect(screen.getByText(/Trade/i)).toBeInTheDocument();
      expect(screen.getByText(/Documents|Credentials/i)).toBeInTheDocument();
      expect(screen.getByText(/Review/i)).toBeInTheDocument();

      const activeStep = screen.getByRole('listitem', { name: /Identity/i });
      expect(activeStep).toHaveAttribute('aria-current', 'step');
    });

    it('indicates completed steps with checkmark indicators', () => {
      render(
        <FunnelProgressBar
          currentStep="trade"
          completedSteps={['identity']}
        />
      );

      const identityStep = screen.getByRole('listitem', { name: /Identity/i });
      expect(identityStep).not.toHaveAttribute('aria-current', 'step');
      expect(identityStep).toHaveAttribute('data-completed', 'true');

      const tradeStep = screen.getByRole('listitem', { name: /Trade/i });
      expect(tradeStep).toHaveAttribute('aria-current', 'step');
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STP-002: FunnelProgressBar - Mobile status bar & step ratio
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('STP-002: Compact Mobile Step Ratio', () => {
    it('renders mobile step ratio text (Step X of 4)', () => {
      const { rerender } = render(<FunnelProgressBar currentStep="identity" />);
      expect(screen.getByText(/Step 1 of 4/i)).toBeInTheDocument();

      rerender(<FunnelProgressBar currentStep="trade" />);
      expect(screen.getByText(/Step 2 of 4/i)).toBeInTheDocument();

      rerender(<FunnelProgressBar currentStep="credentials" />);
      expect(screen.getByText(/Step 3 of 4/i)).toBeInTheDocument();

      rerender(<FunnelProgressBar currentStep="review" />);
      expect(screen.getByText(/Step 4 of 4/i)).toBeInTheDocument();
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // IDE-001: Legal Name Fields & Required Validation
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('IDE-001: Legal Name Fields & Validation', () => {
    it('renders legal first, middle (optional), and last name inputs', () => {
      render(<IdentityStepForm onSave={vi.fn()} />);

      expect(screen.getByLabelText(/Legal First Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Middle Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Legal Last Name/i)).toBeInTheDocument();
    });

    it('displays validation error if first or last name is left blank', async () => {
      const onSave = vi.fn();
      render(<IdentityStepForm onSave={onSave} />);

      const firstNameInput = screen.getByLabelText(/Legal First Name/i);
      fireEvent.focus(firstNameInput);
      fireEvent.blur(firstNameInput);

      expect(
        await screen.findByText(/First name is required/i)
      ).toBeInTheDocument();
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // IDE-002: Date of Birth & Exact 18+ Age Validation
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('IDE-002: Date of Birth & 18+ Enforcement', () => {
    it('displays error if applicant is under 18 years old', async () => {
      render(<IdentityStepForm onSave={vi.fn()} />);

      const dobInput = screen.getByLabelText(/Date of Birth/i);

      // Under 18 date (e.g., 10 years ago)
      const minorDate = new Date();
      minorDate.setFullYear(minorDate.getFullYear() - 16);
      const minorDateStr = minorDate.toISOString().split('T')[0];

      fireEvent.change(dobInput, { target: { value: minorDateStr } });
      fireEvent.blur(dobInput);

      expect(
        await screen.findByText(
          /Applicant must be at least 18 years old to register/i
        )
      ).toBeInTheDocument();
    });

    it('displays error if date of birth is in the future', async () => {
      render(<IdentityStepForm onSave={vi.fn()} />);

      const dobInput = screen.getByLabelText(/Date of Birth/i);
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const futureDateStr = futureDate.toISOString().split('T')[0];

      fireEvent.change(dobInput, { target: { value: futureDateStr } });
      fireEvent.blur(dobInput);

      expect(
        await screen.findByText(/Date of birth cannot be in the future/i)
      ).toBeInTheDocument();
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // IDE-003: NIN / BVN Identifier Selector Toggle
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('IDE-003: NIN / BVN Identifier Selector Toggle', () => {
    it('defaults to NIN and allows switching to BVN', () => {
      render(<IdentityStepForm onSave={vi.fn()} />);

      const ninRadio = screen.getByRole('radio', { name: /NIN/i });
      const bvnRadio = screen.getByRole('radio', { name: /BVN/i });

      expect(ninRadio).toBeChecked();
      expect(bvnRadio).not.toBeChecked();

      fireEvent.click(bvnRadio);
      expect(bvnRadio).toBeChecked();
      expect(ninRadio).not.toBeChecked();

      expect(
        screen.getByLabelText(/Bank Verification Number \(BVN\)/i)
      ).toBeInTheDocument();
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // IDE-004: 11-Digit Input Sanitization & Live Counter
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('IDE-004: 11-Digit Sanitization & Live Counter', () => {
    it('sanitizes input to digits only, caps at 11 digits, and updates counter', () => {
      render(<IdentityStepForm onSave={vi.fn()} />);

      const idInput = screen.getByLabelText(/National Identification Number/i);

      fireEvent.change(idInput, { target: { value: '123-abc-456-789-01-extra' } });
      expect(idInput).toHaveValue('12345678901');

      expect(screen.getByText(/11\/11/i)).toBeInTheDocument();
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // IDE-005: 11-Digit Format Validation Feedback vs Verification Safeguard
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('IDE-005: Format Validation Feedback & Safeguard', () => {
    it('displays format valid confirmation and NEVER displays "Verified"', () => {
      render(<IdentityStepForm onSave={vi.fn()} />);

      const idInput = screen.getByLabelText(/National Identification Number/i);
      fireEvent.change(idInput, { target: { value: '12345678901' } });

      expect(
        screen.getByText(/✓ 11-digit format valid/i)
      ).toBeInTheDocument();

      // Crucial safeguard: Format valid is NOT identity verification
      expect(screen.queryByText(/^Verified$/i)).not.toBeInTheDocument();
      expect(
        screen.queryByText(/Identity Verified/i)
      ).not.toBeInTheDocument();
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // IDE-006: Blur Masking to •••••••1234 & Show/Edit Toggle
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('IDE-006: Blur Masking & Show/Edit Toggle', () => {
    it('masks identifier on blur to •••••••last4 and reveals on Edit click', () => {
      render(<IdentityStepForm onSave={vi.fn()} />);

      const idInput = screen.getByLabelText(/National Identification Number/i);
      fireEvent.change(idInput, { target: { value: '12345678901' } });
      fireEvent.blur(idInput);

      expect(screen.getByText('•••••••8901')).toBeInTheDocument();

      const editBtn = screen.getByRole('button', { name: /Show \/ Edit|Edit/i });
      fireEvent.click(editBtn);

      const unmaskedInput = screen.getByLabelText(/National Identification Number/i);
      expect(unmaskedInput).toHaveValue('12345678901');
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // IDE-007: Nigerian Residential Address Fields
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('IDE-007: Nigerian Residential Address Fields', () => {
    it('renders street, state dropdown, and LGA/city fields with validation', () => {
      render(<IdentityStepForm onSave={vi.fn()} />);

      expect(screen.getByLabelText(/Street Address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/State/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/City \/ LGA/i)).toBeInTheDocument();

      // State selector contains canonical Nigerian states
      const stateSelect = screen.getByLabelText(/State/i);
      expect(stateSelect).toContainHTML('Lagos');
      expect(stateSelect).toContainHTML('Abuja');
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // IDE-008: Save & Continue Gating & Form Submission
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('IDE-008: Save & Continue Gating & Form Submission', () => {
    it('disables Save button until all required fields are valid and invokes onSave with structured data', async () => {
      const onSave = vi.fn();
      render(<IdentityStepForm onSave={onSave} />);

      const saveBtn = screen.getByRole('button', {
        name: /Save & Continue to Trade Profile/i,
      });
      expect(saveBtn).toBeDisabled();

      // Fill in all valid fields
      fireEvent.change(screen.getByLabelText(/Legal First Name/i), {
        target: { value: 'Amina' },
      });
      fireEvent.change(screen.getByLabelText(/Middle Name/i), {
        target: { value: 'Bolanle' },
      });
      fireEvent.change(screen.getByLabelText(/Legal Last Name/i), {
        target: { value: 'Okonkwo' },
      });
      fireEvent.change(screen.getByLabelText(/Date of Birth/i), {
        target: { value: '1992-04-12' },
      });
      fireEvent.change(
        screen.getByLabelText(/National Identification Number/i),
        { target: { value: '12345678901' } }
      );
      fireEvent.change(screen.getByLabelText(/Street Address/i), {
        target: { value: '14 Commercial Avenue' },
      });
      fireEvent.change(screen.getByLabelText(/State/i), {
        target: { value: 'Lagos' },
      });
      fireEvent.change(screen.getByLabelText(/City \/ LGA/i), {
        target: { value: 'Yaba' },
      });

      expect(saveBtn).toBeEnabled();

      fireEvent.click(saveBtn);

      expect(onSave).toHaveBeenCalledTimes(1);
      expect(onSave).toHaveBeenCalledWith<[OnboardingIdentityData]>({
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
      });
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // IDE-009: Physical Boundary & Security Invariant
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('IDE-009: Physical Boundary & Architecture Invariants', () => {
    it('production components do not import from testing/', () => {
      const stepperPath = path.resolve(__dirname, './FunnelProgressBar.tsx');
      const formPath = path.resolve(__dirname, './IdentityStepForm.tsx');

      const stepperContent = fs.readFileSync(stepperPath, 'utf-8');
      const formContent = fs.readFileSync(formPath, 'utf-8');

      expect(stepperContent).not.toMatch(/from ['"].*\/testing['"]/);
      expect(stepperContent).not.toMatch(/from ['"].*\/testing\/.*['"]/);

      expect(formContent).not.toMatch(/from ['"].*\/testing['"]/);
      expect(formContent).not.toMatch(/from ['"].*\/testing\/.*['"]/);
    });
  });
});
