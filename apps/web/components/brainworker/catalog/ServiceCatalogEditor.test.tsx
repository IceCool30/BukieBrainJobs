// apps/web/components/brainworker/catalog/ServiceCatalogEditor.test.tsx
// Phase 4 RED: Service Catalog & Rates Component Contract Tests (CMP-001 through CMP-009)
// Authoritative References:
// - docs/specs/BW-002-architecture-contract.md (v1.2, Sections 2, 3, 6, 7)
// - docs/specs/BW-002-ux-design-specification.md (v1.2, Section 3)
// - docs/specs/BW-002-test-first-implementation-plan.md (v1.2, Suite 4: CMP-001 to CMP-008, Section 3 INT-010)
// - docs/specs/BW-002-service-catalog-availability.md (v1.2, Section 2.1, 2.2, 2.6)

import React from 'react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { ServiceCatalogEditor } from './ServiceCatalogEditor';
import { useBrainWorkerOperationsStore } from '../../../lib/brainworker/catalog/store';
import {
  FIXTURE_APPROVED_BRAINWORKER_A,
  FIXTURE_SERVICE_CATALOG_A,
} from '../../../lib/brainworker/catalog/testing';
import type {
  IBrainWorkerOperationsRepository,
  ServiceItemStatus,
  BrainWorkerServiceCatalog,
} from '../../../lib/brainworker/catalog/types';
import { getBrainWorkerOperationsRepository } from '../../../lib/brainworker/catalog/repository';
import * as fs from 'fs';
import * as path from 'path';

const FIXTURE_EMPTY_CATALOG: BrainWorkerServiceCatalog = {
  brainWorkerId: FIXTURE_APPROVED_BRAINWORKER_A,
  diagnosticFeeNgn: 5000,
  services: [],
  updatedAt: '2026-09-25T10:00:00.000Z',
};

type MockOperationsRepository = {
  getOperationalProfile: Mock;
  getServiceCatalog: Mock;
  saveServiceCatalog: Mock;
  getAvailability: Mock;
  saveAvailability: Mock;
  getCoverage: Mock;
  saveCoverage: Mock;
  getMatchingHydrationProfile: Mock;
};

describe('BW-002 Suite 4: Service Catalog Component Contracts (CMP-001 through CMP-009)', () => {
  let mockRepository: MockOperationsRepository & IBrainWorkerOperationsRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    useBrainWorkerOperationsStore.getState().resetStore();
    mockRepository = {
      getOperationalProfile: vi.fn(),
      getServiceCatalog: vi.fn().mockResolvedValue(FIXTURE_EMPTY_CATALOG),
      saveServiceCatalog: vi.fn().mockImplementation(
        async (
          _id: string,
          catalog: {
            diagnosticFeeNgn: number;
            services: Array<{
              serviceId: string;
              hourlyRateNgn: number;
              status: ServiceItemStatus;
            }>;
          }
        ) => ({
          brainWorkerId: _id,
          diagnosticFeeNgn: catalog.diagnosticFeeNgn,
          services: catalog.services.map((s) => ({
            ...s,
            categoryId: 'generator' as const,
            serviceName: 'Test Service',
            updatedAt: new Date().toISOString(),
          })),
          updatedAt: new Date().toISOString(),
        })
      ),
      getAvailability: vi.fn(),
      saveAvailability: vi.fn(),
      getCoverage: vi.fn(),
      saveCoverage: vi.fn(),
      getMatchingHydrationProfile: vi.fn(),
    };
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CMP-001: Diagnostic Inspection / Call-Out Fee Input & Boundary Policy
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('CMP-001: Diagnostic Inspection / Call-Out Fee Input & Boundary Policy', () => {
    it('renders diagnostic call-out fee card with recommended badge and currency symbol', () => {
      render(
        <ServiceCatalogEditor
          brainWorkerId={FIXTURE_APPROVED_BRAINWORKER_A}
          repository={mockRepository}
        />
      );

      // Card Title & explanation
      expect(
        screen.getByText(/Diagnostic Inspection \/ Call-Out Fee/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          /A flat fee charged for your initial on-site visit, inspection, and fault diagnosis/i
        )
      ).toBeInTheDocument();

      // Recommended standard badge
      expect(
        screen.getByText(/5,000 \(Recommended standard\)/i)
      ).toBeInTheDocument();

      // Diagnostic fee numeric input with currency symbol
      const feeInput = screen.getByLabelText(/Diagnostic Call-Out Fee/i);
      expect(feeInput).toBeInTheDocument();
      expect(feeInput).toHaveValue(5000);
    });

    it('strictly satisfies boundary invariant: zero mention of credit settlement or refund against major repairs', () => {
      const { container } = render(
        <ServiceCatalogEditor
          brainWorkerId={FIXTURE_APPROVED_BRAINWORKER_A}
          repository={mockRepository}
        />
      );

      const content = container.textContent?.toLowerCase() ?? '';
      // Downstream escrow and booking settlement rules belong strictly to WEB-013/WEB-015
      expect(content).not.toContain('credited toward');
      expect(content).not.toContain('credited against');
      expect(content).not.toContain('deducted from major');
      expect(content).not.toContain('escrow settlement');
      expect(content).not.toContain('labor rebate');
    });

    it('updates diagnostic fee within allowed bounds (₦2,000 to ₦20,000) and displays validation error when out of bounds', async () => {
      render(
        <ServiceCatalogEditor
          brainWorkerId={FIXTURE_APPROVED_BRAINWORKER_A}
          repository={mockRepository}
        />
      );

      const feeInput = screen.getByLabelText(/Diagnostic Call-Out Fee/i);
      const saveBtn = screen.getByRole('button', { name: /Save Changes/i });

      // Valid update
      fireEvent.change(feeInput, { target: { value: '7500' } });
      expect(useBrainWorkerOperationsStore.getState().catalog.diagnosticFeeNgn).toBe(7500);

      // Invalid low update (< 2000)
      fireEvent.change(feeInput, { target: { value: '1500' } });
      expect(
        await screen.findByText(/(?:Diagnostic (?:call-out )?fee|fee) must be between ₦2,000 and ₦20,000/i)
      ).toBeInTheDocument();
      expect(saveBtn).toBeDisabled();

      // Invalid high update (> 20000)
      fireEvent.change(feeInput, { target: { value: '25000' } });
      expect(
        await screen.findByText(/(?:Diagnostic (?:call-out )?fee|fee) must be between ₦2,000 and ₦20,000/i)
      ).toBeInTheDocument();
      expect(saveBtn).toBeDisabled();

      // Valid reset clears error and enables save button
      fireEvent.change(feeInput, { target: { value: '5000' } });
      await waitFor(() => {
        expect(
          screen.queryByText(/(?:Diagnostic (?:call-out )?fee|fee) must be between ₦2,000 and ₦20,000/i)
        ).not.toBeInTheDocument();
      });
      expect(saveBtn).toBeEnabled();
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CMP-002: Category Filter Tabs for All 8 Canonical Categories
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('CMP-002: Category Filter Tabs for All 8 Canonical Categories', () => {
    it('renders filter tabs for all 8 canonical categories', () => {
      render(
        <ServiceCatalogEditor
          brainWorkerId={FIXTURE_APPROVED_BRAINWORKER_A}
          repository={mockRepository}
        />
      );

      expect(
        screen.getByRole('tab', { name: /Generator Repair & Maintenance/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('tab', { name: /Air Conditioning & Refrigeration/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('tab', { name: /Plumbing & Pipe Fitting/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('tab', { name: /Electrical Installation & Inverters/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('tab', { name: /Carpentry & Furniture Making/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('tab', { name: /Painting & Wall Finishing/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('tab', { name: /Masonry, Tiling & Bricklaying/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('tab', { name: /Welding & Metal Fabrication/i })
      ).toBeInTheDocument();
    });

    it('switches active tab and displays corresponding canonical services from registry', () => {
      render(
        <ServiceCatalogEditor
          brainWorkerId={FIXTURE_APPROVED_BRAINWORKER_A}
          repository={mockRepository}
        />
      );

      // Default active category is generator
      expect(
        screen.getByText('Diesel Generator Servicing & Overhaul')
      ).toBeInTheDocument();

      // Click AC tab
      const acTab = screen.getByRole('tab', {
        name: /Air Conditioning & Refrigeration/i,
      });
      fireEvent.click(acTab);

      // Should now display AC canonical offerings
      expect(
        screen.getByText('AC Refrigerant Gas Top-Up & Leak Sealing')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Split-Unit AC Installation & Uninstallation')
      ).toBeInTheDocument();
      expect(
        screen.queryByText('Diesel Generator Servicing & Overhaul')
      ).not.toBeInTheDocument();
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CMP-003: Adding Service from Canonical Registry
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('CMP-003: Adding Service from Canonical Registry', () => {
    it('creates a configured service card with authoritative registry default rate and ACTIVE status', () => {
      render(
        <ServiceCatalogEditor
          brainWorkerId={FIXTURE_APPROVED_BRAINWORKER_A}
          repository={mockRepository}
        />
      );

      // Initially unconfigured
      expect(
        screen.queryByTestId('configured-service-card-gen-diesel-servicing')
      ).not.toBeInTheDocument();

      // Add service button for diesel generator servicing
      const addBtn = screen.getByRole('button', {
        name: /Add Diesel Generator Servicing & Overhaul/i,
      });
      fireEvent.click(addBtn);

      // Configured service card now rendered
      const card = screen.getByTestId(
        'configured-service-card-gen-diesel-servicing'
      );
      expect(card).toBeInTheDocument();
      expect(
        within(card).getByText('Diesel Generator Servicing & Overhaul')
      ).toBeInTheDocument();

      // Rate defaults to canonical registry rate (₦7,500)
      const rateInput = within(card).getByLabelText(
        /Hourly rate for Diesel Generator Servicing & Overhaul/i
      );
      expect(rateInput).toHaveValue(7500);

      // Status badge defaults to ACTIVE
      expect(within(card).getByText('ACTIVE')).toBeInTheDocument();
    });

    it('prevents adding the same canonical service twice and marks it as added', () => {
      render(
        <ServiceCatalogEditor
          brainWorkerId={FIXTURE_APPROVED_BRAINWORKER_A}
          repository={mockRepository}
        />
      );

      const addBtn = screen.getByRole('button', {
        name: /Add Diesel Generator Servicing & Overhaul/i,
      });
      fireEvent.click(addBtn);

      // Button is now disabled or shows Added
      expect(addBtn).toBeDisabled();
      expect(addBtn).toHaveTextContent(/Added/i);
    });

    it('hydrates and renders pre-existing configured services when initialCatalog is provided', () => {
      render(
        <ServiceCatalogEditor
          brainWorkerId={FIXTURE_APPROVED_BRAINWORKER_A}
          initialCatalog={FIXTURE_SERVICE_CATALOG_A}
          repository={mockRepository}
        />
      );

      // Pre-configured services are rendered
      expect(
        screen.getByTestId('configured-service-card-gen-diesel-servicing')
      ).toBeInTheDocument();
      expect(
        screen.getByTestId('configured-service-card-ac-gas-recharge')
      ).toBeInTheDocument();

      // Rates are populated
      expect(
        screen.getByLabelText(/Hourly rate for Diesel Generator Servicing & Overhaul/i)
      ).toHaveValue(7500);
      expect(
        screen.getByLabelText(/Hourly rate for AC Refrigerant Gas Top-Up & Leak Sealing/i)
      ).toHaveValue(6000);

      // Status badges
      expect(screen.getByText('ACTIVE')).toBeInTheDocument();
      expect(screen.getByText('PAUSED')).toBeInTheDocument();

      // Empty state is not rendered
      expect(screen.queryByText(/No services configured yet/i)).not.toBeInTheDocument();
    });

    it('asynchronously hydrates catalog from repository when initialCatalog is omitted', async () => {
      mockRepository.getServiceCatalog.mockResolvedValueOnce(FIXTURE_SERVICE_CATALOG_A);

      render(
        <ServiceCatalogEditor
          brainWorkerId={FIXTURE_APPROVED_BRAINWORKER_A}
          repository={mockRepository}
        />
      );

      await waitFor(() => {
        expect(mockRepository.getServiceCatalog).toHaveBeenCalledWith(
          FIXTURE_APPROVED_BRAINWORKER_A
        );
      });

      expect(
        await screen.findByTestId('configured-service-card-gen-diesel-servicing')
      ).toBeInTheDocument();
      expect(
        screen.getByTestId('configured-service-card-ac-gas-recharge')
      ).toBeInTheDocument();
    });

    it('asynchronously hydrates catalog using default repository when repository prop is omitted', async () => {
      const defaultRepo = getBrainWorkerOperationsRepository();
      const getSpy = vi
        .spyOn(defaultRepo, 'getServiceCatalog')
        .mockResolvedValueOnce(FIXTURE_SERVICE_CATALOG_A);

      render(
        <ServiceCatalogEditor
          brainWorkerId={FIXTURE_APPROVED_BRAINWORKER_A}
        />
      );

      await waitFor(() => {
        expect(getSpy).toHaveBeenCalledWith(FIXTURE_APPROVED_BRAINWORKER_A);
      });

      expect(
        await screen.findByTestId('configured-service-card-gen-diesel-servicing')
      ).toBeInTheDocument();
      getSpy.mockRestore();
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CMP-004: Updating Hourly Rate Displays Live Validation Feedback
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('CMP-004: Hourly Rate Updates & Live Validation Feedback', () => {
    it('updates hourly rate and displays live validation feedback on bounds violation', async () => {
      render(
        <ServiceCatalogEditor
          brainWorkerId={FIXTURE_APPROVED_BRAINWORKER_A}
          repository={mockRepository}
        />
      );

      // Add a service
      fireEvent.click(
        screen.getByRole('button', {
          name: /Add Diesel Generator Servicing & Overhaul/i,
        })
      );
      const card = screen.getByTestId(
        'configured-service-card-gen-diesel-servicing'
      );
      const rateInput = within(card).getByLabelText(
        /Hourly rate for Diesel Generator Servicing & Overhaul/i
      );

      // Valid update
      fireEvent.change(rateInput, { target: { value: '8500' } });
      expect(rateInput).toHaveValue(8500);
      expect(
        useBrainWorkerOperationsStore
          .getState()
          .catalog.services.find((s) => s.serviceId === 'gen-diesel-servicing')
          ?.hourlyRateNgn
      ).toBe(8500);

      // Invalid low rate (< 2000)
      fireEvent.change(rateInput, { target: { value: '1500' } });
      expect(
        await screen.findByText(
          /Hourly rate must be between ₦2,000 and ₦50,000/i
        )
      ).toBeInTheDocument();

      // Save button is disabled when validation errors exist
      const saveBtn = screen.getByRole('button', { name: /Save Changes/i });
      expect(saveBtn).toBeDisabled();

      // Return to valid rate clears error and enables save
      fireEvent.change(rateInput, { target: { value: '5000' } });
      await waitFor(() => {
        expect(
          screen.queryByText(
            /Hourly rate must be between ₦2,000 and ₦50,000/i
          )
        ).not.toBeInTheDocument();
      });
      expect(saveBtn).toBeEnabled();
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CMP-005: Toggling Service Switch (ACTIVE vs PAUSED)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('CMP-005: Service Status Toggle & Rate Preservation', () => {
    it('toggles service status between ACTIVE (Emerald) and PAUSED (Slate)', () => {
      render(
        <ServiceCatalogEditor
          brainWorkerId={FIXTURE_APPROVED_BRAINWORKER_A}
          repository={mockRepository}
        />
      );

      fireEvent.click(
        screen.getByRole('button', {
          name: /Add Diesel Generator Servicing & Overhaul/i,
        })
      );
      const card = screen.getByTestId(
        'configured-service-card-gen-diesel-servicing'
      );

      const statusSwitch = within(card).getByRole('switch', {
        name: /Toggle status for Diesel Generator Servicing & Overhaul/i,
      });
      expect(statusSwitch).toHaveAttribute('aria-checked', 'true');
      expect(within(card).getByText('ACTIVE')).toBeInTheDocument();

      // Toggle to PAUSED
      fireEvent.click(statusSwitch);
      expect(statusSwitch).toHaveAttribute('aria-checked', 'false');
      expect(within(card).getByText('PAUSED')).toBeInTheDocument();

      // Toggle back to ACTIVE
      fireEvent.click(statusSwitch);
      expect(statusSwitch).toHaveAttribute('aria-checked', 'true');
      expect(within(card).getByText('ACTIVE')).toBeInTheDocument();
    });

    it('preserves configured custom hourly rate across status toggles', () => {
      render(
        <ServiceCatalogEditor
          brainWorkerId={FIXTURE_APPROVED_BRAINWORKER_A}
          repository={mockRepository}
        />
      );

      fireEvent.click(
        screen.getByRole('button', {
          name: /Add Diesel Generator Servicing & Overhaul/i,
        })
      );
      const card = screen.getByTestId(
        'configured-service-card-gen-diesel-servicing'
      );
      const rateInput = within(card).getByLabelText(
        /Hourly rate for Diesel Generator Servicing & Overhaul/i
      );

      // Custom rate
      fireEvent.change(rateInput, { target: { value: '12000' } });
      expect(rateInput).toHaveValue(12000);

      // Toggle to PAUSED and back
      const statusSwitch = within(card).getByRole('switch', {
        name: /Toggle status for Diesel Generator Servicing & Overhaul/i,
      });
      fireEvent.click(statusSwitch);
      expect(rateInput).toHaveValue(12000);

      fireEvent.click(statusSwitch);
      expect(rateInput).toHaveValue(12000);
      expect(
        useBrainWorkerOperationsStore
          .getState()
          .catalog.services.find((s) => s.serviceId === 'gen-diesel-servicing')
          ?.hourlyRateNgn
      ).toBe(12000);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CMP-006: Removing Service Card After Confirmation & Empty State
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('CMP-006: Service Removal with Confirmation & Empty State', () => {
    it('shows inline confirmation prompt when remove button is clicked and cancels removal if dismissed', () => {
      render(
        <ServiceCatalogEditor
          brainWorkerId={FIXTURE_APPROVED_BRAINWORKER_A}
          repository={mockRepository}
        />
      );

      fireEvent.click(
        screen.getByRole('button', {
          name: /Add Diesel Generator Servicing & Overhaul/i,
        })
      );
      const card = screen.getByTestId(
        'configured-service-card-gen-diesel-servicing'
      );

      const removeBtn = within(card).getByRole('button', {
        name: /Remove Diesel Generator Servicing & Overhaul/i,
      });
      fireEvent.click(removeBtn);

      // Confirmation prompt appears
      expect(screen.getByText(/Remove this service\?/i)).toBeInTheDocument();
      const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
      fireEvent.click(cancelBtn);

      // Card remains
      expect(
        screen.getByTestId('configured-service-card-gen-diesel-servicing')
      ).toBeInTheDocument();
    });

    it('removes service card when confirmed and displays empty state when no services remain', () => {
      render(
        <ServiceCatalogEditor
          brainWorkerId={FIXTURE_APPROVED_BRAINWORKER_A}
          repository={mockRepository}
        />
      );

      // Empty state initially
      expect(
        screen.getByText(/No services configured yet/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          /Select at least one trade service above to make your BrainWorker profile eligible for customer jobs/i
        )
      ).toBeInTheDocument();

      // Add service
      fireEvent.click(
        screen.getByRole('button', {
          name: /Add Diesel Generator Servicing & Overhaul/i,
        })
      );
      expect(
        screen.queryByText(/No services configured yet/i)
      ).not.toBeInTheDocument();

      // Remove and confirm
      const card = screen.getByTestId(
        'configured-service-card-gen-diesel-servicing'
      );
      fireEvent.click(
        within(card).getByRole('button', {
          name: /Remove Diesel Generator Servicing & Overhaul/i,
        })
      );
      const confirmBtn = screen.getByRole('button', {
        name: /Confirm Remove/i,
      });
      fireEvent.click(confirmBtn);

      // Empty state returns
      expect(
        screen.queryByTestId('configured-service-card-gen-diesel-servicing')
      ).not.toBeInTheDocument();
      expect(
        screen.getByText(/No services configured yet/i)
      ).toBeInTheDocument();
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CMP-007: Saving Catalog Triggers Repository Save and Success Toast
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('CMP-007: Catalog Persistence & Success Feedback', () => {
    it('triggers repository save and renders success toast when save button is clicked', async () => {
      const onSaveSuccess = vi.fn();
      render(
        <ServiceCatalogEditor
          brainWorkerId={FIXTURE_APPROVED_BRAINWORKER_A}
          repository={mockRepository}
          onSaveSuccess={onSaveSuccess}
        />
      );

      // Add a service
      fireEvent.click(
        screen.getByRole('button', {
          name: /Add Diesel Generator Servicing & Overhaul/i,
        })
      );

      const saveBtn = screen.getByRole('button', { name: /Save Changes/i });
      expect(saveBtn).toBeEnabled();

      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(mockRepository.saveServiceCatalog).toHaveBeenCalledTimes(1);
      });
      expect(mockRepository.saveServiceCatalog).toHaveBeenCalledWith(
        FIXTURE_APPROVED_BRAINWORKER_A,
        expect.objectContaining({
          diagnosticFeeNgn: 5000,
          services: expect.arrayContaining([
            expect.objectContaining({
              serviceId: 'gen-diesel-servicing',
              hourlyRateNgn: 7500,
              status: 'ACTIVE',
            }),
          ]),
        })
      );

      // Success toast appears
      expect(
        await screen.findByText(/Service catalog saved successfully/i)
      ).toBeInTheDocument();
      expect(onSaveSuccess).toHaveBeenCalledTimes(1);
    });

    it('disables save button while repository save is in flight', async () => {
      let resolveSave: ((val: unknown) => void) | null = null;
      mockRepository.saveServiceCatalog.mockImplementationOnce(
        () => new Promise((resolve) => { resolveSave = resolve; })
      );

      render(
        <ServiceCatalogEditor
          brainWorkerId={FIXTURE_APPROVED_BRAINWORKER_A}
          repository={mockRepository}
        />
      );

      fireEvent.click(
        screen.getByRole('button', {
          name: /Add Diesel Generator Servicing & Overhaul/i,
        })
      );

      const saveBtn = screen.getByRole('button', { name: /Save Changes/i });
      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(saveBtn).toBeDisabled();
      });

      resolveSave!({
        brainWorkerId: FIXTURE_APPROVED_BRAINWORKER_A,
        diagnosticFeeNgn: 5000,
        services: [],
        updatedAt: new Date().toISOString(),
      });

      await waitFor(() => {
        expect(screen.getByText(/Service catalog saved successfully/i)).toBeInTheDocument();
      });
    });

    it('displays error message and re-enables save button when repository save fails', async () => {
      const onSaveError = vi.fn();
      mockRepository.saveServiceCatalog.mockRejectedValueOnce(
        new Error('Failed to persist catalog changes')
      );

      render(
        <ServiceCatalogEditor
          brainWorkerId={FIXTURE_APPROVED_BRAINWORKER_A}
          repository={mockRepository}
          onSaveError={onSaveError}
        />
      );

      fireEvent.click(
        screen.getByRole('button', {
          name: /Add Diesel Generator Servicing & Overhaul/i,
        })
      );

      const saveBtn = screen.getByRole('button', { name: /Save Changes/i });
      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(mockRepository.saveServiceCatalog).toHaveBeenCalledTimes(1);
      });

      expect(
        await screen.findByText(/Failed to persist catalog changes|Failed to save service catalog/i)
      ).toBeInTheDocument();
      expect(saveBtn).toBeEnabled();
      expect(onSaveError).toHaveBeenCalledTimes(1);
    });

    it('dismisses success toast immediately upon any subsequent user modification', async () => {
      render(
        <ServiceCatalogEditor
          brainWorkerId={FIXTURE_APPROVED_BRAINWORKER_A}
          repository={mockRepository}
        />
      );

      fireEvent.click(
        screen.getByRole('button', {
          name: /Add Diesel Generator Servicing & Overhaul/i,
        })
      );

      const saveBtn = screen.getByRole('button', { name: /Save Changes/i });
      fireEvent.click(saveBtn);

      expect(
        await screen.findByText(/Service catalog saved successfully/i)
      ).toBeInTheDocument();

      // Mutate diagnostic fee
      const feeInput = screen.getByLabelText(/Diagnostic Call-Out Fee/i);
      fireEvent.change(feeInput, { target: { value: '6500' } });

      // Stale toast should be immediately dismissed
      expect(
        screen.queryByText(/Service catalog saved successfully/i)
      ).not.toBeInTheDocument();
    });

    it('prevents concurrent duplicate saves when rapid save clicks occur', async () => {
      let resolveSave: ((val: unknown) => void) | null = null;
      mockRepository.saveServiceCatalog.mockImplementationOnce(
        () => new Promise((resolve) => { resolveSave = resolve; })
      );

      render(
        <ServiceCatalogEditor
          brainWorkerId={FIXTURE_APPROVED_BRAINWORKER_A}
          repository={mockRepository}
        />
      );

      fireEvent.click(
        screen.getByRole('button', {
          name: /Add Diesel Generator Servicing & Overhaul/i,
        })
      );

      const saveBtn = screen.getByRole('button', { name: /Save Changes/i });
      // Rapid multiple clicks
      fireEvent.click(saveBtn);
      fireEvent.click(saveBtn);
      fireEvent.click(saveBtn);

      expect(mockRepository.saveServiceCatalog).toHaveBeenCalledTimes(1);

      resolveSave!({
        brainWorkerId: FIXTURE_APPROVED_BRAINWORKER_A,
        diagnosticFeeNgn: 5000,
        services: [],
        updatedAt: new Date().toISOString(),
      });

      await waitFor(() => {
        expect(screen.getByText(/Service catalog saved successfully/i)).toBeInTheDocument();
      });
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CMP-008: Accessible Keyboard Navigation & ARIA Labels
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('CMP-008: Accessible Keyboard Navigation & ARIA Labels', () => {
    it('provides accessible role attributes, aria-labels, and focusable elements across all interactive controls', () => {
      render(
        <ServiceCatalogEditor
          brainWorkerId={FIXTURE_APPROVED_BRAINWORKER_A}
          repository={mockRepository}
        />
      );

      // Tablist container semantics
      expect(screen.getByRole('tablist')).toBeInTheDocument();

      // Tabs have role tab and aria-selected
      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(8);
      expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
      expect(tabs[1]).toHaveAttribute('aria-selected', 'false');

      // Diagnostic fee has accessible label
      const feeInput = screen.getByLabelText(/Diagnostic Call-Out Fee/i);
      expect(feeInput).toHaveAttribute('type', 'number');

      // Add service button
      const addBtn = screen.getByRole('button', {
        name: /Add Diesel Generator Servicing & Overhaul/i,
      });
      expect(addBtn).toBeInTheDocument();

      // Add and inspect card accessibility
      fireEvent.click(addBtn);
      const card = screen.getByTestId(
        'configured-service-card-gen-diesel-servicing'
      );
      expect(
        within(card).getByRole('switch', {
          name: /Toggle status for Diesel Generator Servicing & Overhaul/i,
        })
      ).toBeInTheDocument();
      expect(
        within(card).getByRole('button', {
          name: /Remove Diesel Generator Servicing & Overhaul/i,
        })
      ).toBeInTheDocument();
    });

    it('supports keyboard arrow navigation across category filter tabs', () => {
      render(
        <ServiceCatalogEditor
          brainWorkerId={FIXTURE_APPROVED_BRAINWORKER_A}
          repository={mockRepository}
        />
      );

      const genTab = screen.getByRole('tab', { name: /Generator Repair & Maintenance/i });
      const acTab = screen.getByRole('tab', { name: /Air Conditioning & Refrigeration/i });
      const weldTab = screen.getByRole('tab', { name: /Welding & Metal Fabrication/i });

      // ArrowRight from generator moves to ac
      fireEvent.keyDown(genTab, { key: 'ArrowRight' });
      expect(acTab).toHaveAttribute('aria-selected', 'true');
      expect(genTab).toHaveAttribute('aria-selected', 'false');

      // ArrowLeft wraps around to welding (last tab)
      fireEvent.keyDown(genTab, { key: 'ArrowLeft' });
      // When at acTab (currently active):
      fireEvent.keyDown(acTab, { key: 'ArrowLeft' });
      expect(genTab).toHaveAttribute('aria-selected', 'true');

      // End key moves to last tab
      fireEvent.keyDown(genTab, { key: 'End' });
      expect(weldTab).toHaveAttribute('aria-selected', 'true');

      // Home key moves to first tab
      fireEvent.keyDown(weldTab, { key: 'Home' });
      expect(genTab).toHaveAttribute('aria-selected', 'true');
    });

    it('sets aria-invalid="true" when diagnostic fee or hourly rate has validation errors', async () => {
      render(
        <ServiceCatalogEditor
          brainWorkerId={FIXTURE_APPROVED_BRAINWORKER_A}
          repository={mockRepository}
        />
      );

      const feeInput = screen.getByLabelText(/Diagnostic Call-Out Fee/i);
      expect(feeInput).toHaveAttribute('aria-invalid', 'false');

      // Set invalid fee (< 2000)
      fireEvent.change(feeInput, { target: { value: '1000' } });
      expect(feeInput).toHaveAttribute('aria-invalid', 'true');

      // Reset to valid
      fireEvent.change(feeInput, { target: { value: '5000' } });
      expect(feeInput).toHaveAttribute('aria-invalid', 'false');

      // Add service and test rate aria-invalid
      fireEvent.click(
        screen.getByRole('button', {
          name: /Add Diesel Generator Servicing & Overhaul/i,
        })
      );
      const card = screen.getByTestId(
        'configured-service-card-gen-diesel-servicing'
      );
      const rateInput = within(card).getByLabelText(
        /Hourly rate for Diesel Generator Servicing & Overhaul/i
      );
      expect(rateInput).toHaveAttribute('aria-invalid', 'false');

      fireEvent.change(rateInput, { target: { value: '1000' } });
      expect(rateInput).toHaveAttribute('aria-invalid', 'true');

      fireEvent.change(rateInput, { target: { value: '5000' } });
      expect(rateInput).toHaveAttribute('aria-invalid', 'false');
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CMP-009: Physical Boundary & Architectural Invariants (INT-010)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('CMP-009: Physical Boundary & Architecture Invariants', () => {
    it('production component does not import from testing/', () => {
      const componentPath = path.resolve(__dirname, './ServiceCatalogEditor.tsx');
      const componentContent = fs.readFileSync(componentPath, 'utf-8');

      expect(componentContent).not.toMatch(/from ['"].*\/testing['"]/);
      expect(componentContent).not.toMatch(/from ['"].*\/testing\/.*['"]/);
    });
  });
});
