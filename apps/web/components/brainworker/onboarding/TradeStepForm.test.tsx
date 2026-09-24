// apps/web/components/brainworker/onboarding/TradeStepForm.test.tsx
// Phase 5 RED: Step 2 Trade & Coverage Form Contract Tests
// Authoritative References:
// - docs/specs/BW-001-architecture-contract.md (Section 2.3)
// - docs/specs/BW-001-ux-design-specification.md (Section 3.2.3)
// - docs/specs/BW-001-test-first-implementation-plan.md (Suite 6: TRD-001 to TRD-008)

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TradeStepForm } from './TradeStepForm';
import type { OnboardingTradeData } from '../../../lib/brainworker/types';
import * as fs from 'fs';
import * as path from 'path';

describe('BW-001 Suite 6: Trade & Coverage Form Contracts (TRD-001 through TRD-009)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const defaultProps = {
    onSave: vi.fn(),
    onBack: vi.fn(),
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TRD-001: Canonical 8 Trade Categories Grid
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('TRD-001: Canonical 8 Trade Categories Grid', () => {
    it('renders all 8 canonical trade categories with radio semantics', () => {
      render(<TradeStepForm {...defaultProps} />);

      expect(
        screen.getByRole('radio', { name: /Generator Repair & Maintenance/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('radio', { name: /Air Conditioning & Refrigeration/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('radio', { name: /Plumbing & Pipe Fitting/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('radio', { name: /Electrical Installation & Inverters/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('radio', { name: /Carpentry & Furniture Making/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('radio', { name: /Painting & Wall Finishing/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('radio', { name: /Masonry, Tiling & Bricklaying/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('radio', { name: /Welding & Metal Fabrication/i })
      ).toBeInTheDocument();
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TRD-002: Single Primary Category Selection
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('TRD-002: Single Primary Category Selection', () => {
    it('allows selection of exactly one primary trade category at a time', () => {
      render(<TradeStepForm {...defaultProps} />);

      const generatorRadio = screen.getByRole('radio', {
        name: /Generator Repair & Maintenance/i,
      });
      const acRadio = screen.getByRole('radio', {
        name: /Air Conditioning & Refrigeration/i,
      });

      expect(generatorRadio).toHaveAttribute('aria-checked', 'false');
      expect(acRadio).toHaveAttribute('aria-checked', 'false');

      fireEvent.click(generatorRadio);
      expect(generatorRadio).toHaveAttribute('aria-checked', 'true');
      expect(acRadio).toHaveAttribute('aria-checked', 'false');

      fireEvent.click(acRadio);
      expect(acRadio).toHaveAttribute('aria-checked', 'true');
      expect(generatorRadio).toHaveAttribute('aria-checked', 'false');
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TRD-003: Sub-Specialties (Tags) Management
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('TRD-003: Sub-Specialties Tags Management', () => {
    it('allows adding and removing sub-specialty tags with a maximum of 5 tags', () => {
      render(<TradeStepForm {...defaultProps} />);

      const tagInput = screen.getByLabelText(/Sub-Specialties/i);
      const addBtn = screen.getByRole('button', { name: /Add Tag|Add/i });

      // Add 2 tags
      fireEvent.change(tagInput, { target: { value: 'Diesel Generators' } });
      fireEvent.click(addBtn);

      fireEvent.change(tagInput, { target: { value: 'Changeover Switches' } });
      fireEvent.click(addBtn);

      expect(screen.getByText('Diesel Generators')).toBeInTheDocument();
      expect(screen.getByText('Changeover Switches')).toBeInTheDocument();

      // Remove 1 tag
      const removeDieselBtn = screen.getByRole('button', {
        name: /Remove Diesel Generators/i,
      });
      fireEvent.click(removeDieselBtn);

      expect(screen.queryByText('Diesel Generators')).not.toBeInTheDocument();
      expect(screen.getByText('Changeover Switches')).toBeInTheDocument();

      // Add remaining tags up to 5
      fireEvent.change(tagInput, { target: { value: 'Tag 2' } });
      fireEvent.click(addBtn);
      fireEvent.change(tagInput, { target: { value: 'Tag 3' } });
      fireEvent.click(addBtn);
      fireEvent.change(tagInput, { target: { value: 'Tag 4' } });
      fireEvent.click(addBtn);
      fireEvent.change(tagInput, { target: { value: 'Tag 5' } });
      fireEvent.click(addBtn);

      // Now at 5 tags: Add button should be disabled or capped
      expect(screen.getByText('Tag 5')).toBeInTheDocument();
      expect(addBtn).toBeDisabled();
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TRD-004: Three Experience Tier Cards
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('TRD-004: Three Experience Tier Cards', () => {
    it('renders 3 experience tier selector cards and allows selecting one', () => {
      render(<TradeStepForm {...defaultProps} />);

      const apprenticeRadio = screen.getByRole('radio', {
        name: /Apprentice \/ Intermediate/i,
      });
      const journeymanRadio = screen.getByRole('radio', {
        name: /Journeyman \/ Experienced/i,
      });
      const masterRadio = screen.getByRole('radio', {
        name: /Master Craftsman/i,
      });

      expect(apprenticeRadio).toBeInTheDocument();
      expect(journeymanRadio).toBeInTheDocument();
      expect(masterRadio).toBeInTheDocument();

      fireEvent.click(journeymanRadio);
      expect(journeymanRadio).toHaveAttribute('aria-checked', 'true');
      expect(masterRadio).toHaveAttribute('aria-checked', 'false');
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TRD-005: Years in Trade Integer Validation (1 to 50)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('TRD-005: Years in Trade Validation', () => {
    it('validates years in trade as a positive integer between 1 and 50', async () => {
      render(<TradeStepForm {...defaultProps} />);

      const yearsInput = screen.getByLabelText(/Years in Trade/i);

      // Invalid: 0
      fireEvent.change(yearsInput, { target: { value: '0' } });
      fireEvent.blur(yearsInput);
      expect(
        await screen.findByText(/Years in trade must be between 1 and 50/i)
      ).toBeInTheDocument();

      // Invalid: 51
      fireEvent.change(yearsInput, { target: { value: '51' } });
      fireEvent.blur(yearsInput);
      expect(
        await screen.findByText(/Years in trade must be between 1 and 50/i)
      ).toBeInTheDocument();

      // Valid: 7
      fireEvent.change(yearsInput, { target: { value: '7' } });
      fireEvent.blur(yearsInput);
      expect(
        screen.queryByText(/Years in trade must be between 1 and 50/i)
      ).not.toBeInTheDocument();
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TRD-006: Canonical 7 Nigerian Coverage Cities Selection
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('TRD-006: Canonical 7 Nigerian Coverage Cities', () => {
    it('renders all 7 canonical Nigerian coverage cities and supports multi-select', () => {
      render(<TradeStepForm {...defaultProps} />);

      expect(
        screen.getByRole('checkbox', { name: /Lagos/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('checkbox', { name: /Abuja \(FCT\)|Abuja/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('checkbox', { name: /Port Harcourt/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('checkbox', { name: /Ibadan/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('checkbox', { name: /Benin City/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('checkbox', { name: /Enugu/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('checkbox', { name: /Kano/i })
      ).toBeInTheDocument();
    });

    it('supports Select All and Clear All city utilities', () => {
      render(<TradeStepForm {...defaultProps} />);

      const selectAllBtn = screen.getByRole('button', { name: /Select All/i });
      const clearBtn = screen.getByRole('button', { name: /Clear All|Clear/i });

      fireEvent.click(selectAllBtn);
      expect(screen.getByRole('checkbox', { name: /Lagos/i })).toBeChecked();
      expect(screen.getByRole('checkbox', { name: /Kano/i })).toBeChecked();

      fireEvent.click(clearBtn);
      expect(screen.getByRole('checkbox', { name: /Lagos/i })).not.toBeChecked();
      expect(screen.getByRole('checkbox', { name: /Kano/i })).not.toBeChecked();
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TRD-007: Minimum One Coverage City Enforcement
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('TRD-007: Minimum One Coverage City Enforcement', () => {
    it('displays validation message when zero coverage cities are selected', async () => {
      render(<TradeStepForm {...defaultProps} />);

      const lagosCheckbox = screen.getByRole('checkbox', { name: /Lagos/i });
      // Toggle on and off
      fireEvent.click(lagosCheckbox);
      fireEvent.click(lagosCheckbox);

      expect(
        await screen.findByText(/At least one coverage city is required/i)
      ).toBeInTheDocument();
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TRD-008: Step Navigation & Structured Submission
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('TRD-008: Step Navigation & Structured Submission', () => {
    it('calls onBack when Back to Identity is clicked', () => {
      const onBack = vi.fn();
      render(<TradeStepForm {...defaultProps} onBack={onBack} />);

      const backBtn = screen.getByRole('button', {
        name: /Back to Identity/i,
      });
      fireEvent.click(backBtn);

      expect(onBack).toHaveBeenCalledTimes(1);
    });

    it('disables Save button until all fields are valid and invokes onSave with structured data', () => {
      const onSave = vi.fn();
      render(<TradeStepForm {...defaultProps} onSave={onSave} />);

      const saveBtn = screen.getByRole('button', {
        name: /Save & Continue to Credentials/i,
      });
      expect(saveBtn).toBeDisabled();

      // 1. Select Primary Category
      fireEvent.click(
        screen.getByRole('radio', { name: /Generator Repair & Maintenance/i })
      );

      // 2. Select Experience Tier
      fireEvent.click(
        screen.getByRole('radio', { name: /Journeyman \/ Experienced/i })
      );

      // 3. Enter Years in Trade
      fireEvent.change(screen.getByLabelText(/Years in Trade/i), {
        target: { value: '6' },
      });

      // 4. Select Coverage Cities
      fireEvent.click(screen.getByRole('checkbox', { name: /Lagos/i }));
      fireEvent.click(screen.getByRole('checkbox', { name: /Abuja/i }));

      // 5. Add Sub-Specialty Tag (Optional)
      const tagInput = screen.getByLabelText(/Sub-Specialties/i);
      const addBtn = screen.getByRole('button', { name: /Add Tag|Add/i });
      fireEvent.change(tagInput, { target: { value: 'Soundproof Enclosures' } });
      fireEvent.click(addBtn);

      expect(saveBtn).toBeEnabled();

      fireEvent.click(saveBtn);

      expect(onSave).toHaveBeenCalledTimes(1);
      expect(onSave).toHaveBeenCalledWith<[OnboardingTradeData]>({
        primaryCategory: 'generator',
        subSpecialties: ['Soundproof Enclosures'],
        experienceLevel: 'JOURNEYMAN_EXPERIENCED',
        yearsInTrade: 6,
        coverageCities: ['Lagos', 'Abuja (FCT)'],
      });
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TRD-009: Physical Boundary & Security Invariant
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('TRD-009: Physical Boundary & Architecture Invariants', () => {
    it('production components do not import from testing/', () => {
      const formPath = path.resolve(__dirname, './TradeStepForm.tsx');
      const formContent = fs.readFileSync(formPath, 'utf-8');

      expect(formContent).not.toMatch(/from ['"].*\/testing['"]/);
      expect(formContent).not.toMatch(/from ['"].*\/testing\/.*['"]/);
    });
  });
});
