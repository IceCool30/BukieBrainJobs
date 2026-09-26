// apps/web/components/brainworker/catalog/CoverageEditor.test.tsx
// Phase 6 RED: Coverage Area & Location Editor Contract Tests (COV-001 through COV-010)
// Authoritative References:
// - docs/specs/BW-002-architecture-contract.md (v1.2, Sections 3, 5)
// - docs/specs/BW-002-ux-design-specification.md (v1.2, Section 4.4 coverage surface)
// - docs/specs/BW-002-test-first-implementation-plan.md (v1.2, REP-005, CAT-007, CAT-008, CAT-010)
// - docs/specs/BW-002-service-catalog-availability.md (v1.2, Sections 2.4, 4.3 FR-010 to FR-012)
// Scope boundary: coverage editor only (primary city, operational zones, travel
// radius). No matching-engine, Prisma, API, backend, dispatch-score, or
// isComplete reinterpretation changes in this suite.

import React from 'react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { CoverageEditor } from './CoverageEditor';
import { useBrainWorkerOperationsStore } from '../../../lib/brainworker/catalog/store';
import {
  FIXTURE_APPROVED_BRAINWORKER_A,
  FIXTURE_APPROVED_BRAINWORKER_B,
  FIXTURE_COVERAGE_A,
  FIXTURE_ONBOARDING_RECORD_A,
  FIXTURE_OPERATIONAL_PROFILE_A,
} from '../../../lib/brainworker/catalog/testing';
import type { IBrainWorkerOperationsRepository } from '../../../lib/brainworker/catalog/types';
import {
  ForbiddenTenantAccessError,
  OperationsValidationError,
} from '../../../lib/brainworker/catalog/types';
import * as fs from 'fs';
import * as path from 'path';

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

const VERIFIED_CITIES: string[] =
  FIXTURE_ONBOARDING_RECORD_A.trade.coverageCities;

describe('BW-002 Suite 6 RED: Coverage Area & Location Editor Contracts (COV-001 to COV-010)', () => {
  let mockRepository: MockOperationsRepository & IBrainWorkerOperationsRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    useBrainWorkerOperationsStore.getState().resetStore();
    useBrainWorkerOperationsStore
      .getState()
      .initializeFromProfile(FIXTURE_OPERATIONAL_PROFILE_A);
    mockRepository = {
      getOperationalProfile: vi.fn(),
      getServiceCatalog: vi.fn(),
      saveServiceCatalog: vi.fn(),
      getAvailability: vi.fn(),
      saveAvailability: vi.fn(),
      getCoverage: vi.fn().mockResolvedValue(FIXTURE_COVERAGE_A),
      saveCoverage: vi.fn().mockImplementation(
        async (
          _id: string,
          coverage: {
            primaryCityId: string;
            primaryCityName: string;
            coverageNeighbourhoods: string[];
            travelRadiusKm: number;
          }
        ) => ({
          brainWorkerId: _id,
          primaryCityId: coverage.primaryCityId,
          primaryCityName: coverage.primaryCityName,
          coverageNeighbourhoods: [...coverage.coverageNeighbourhoods],
          travelRadiusKm: coverage.travelRadiusKm,
          updatedAt: new Date().toISOString(),
        })
      ),
      getMatchingHydrationProfile: vi.fn(),
    } as unknown as MockOperationsRepository & IBrainWorkerOperationsRepository;
  });

  it('COV-001: renders primary city selector restricted to verified onboarding cities', () => {
    render(
      <CoverageEditor
        brainWorkerId={FIXTURE_APPROVED_BRAINWORKER_A}
        verifiedCities={VERIFIED_CITIES}
        repository={mockRepository}
      />
    );
    const citySelect = screen.getByLabelText(/primary city/i);
    expect(citySelect).toBeDefined();
    const options = within(citySelect as HTMLElement)
      .getAllByRole('option')
      .map((o) => (o as HTMLOptionElement).value)
      .filter((v) => v !== '');
    expect(options.sort()).toEqual([...VERIFIED_CITIES].sort());
  });

  it('COV-002: unverified city persistence fails closed with inline error and preserved draft', async () => {
    mockRepository.saveCoverage = vi.fn().mockRejectedValueOnce(
      new OperationsValidationError(
        "Primary city 'Kano' is not among verified onboarding coverage cities (Lagos, Ibadan)."
      )
    );
    render(
      <CoverageEditor
        brainWorkerId={FIXTURE_APPROVED_BRAINWORKER_A}
        verifiedCities={VERIFIED_CITIES}
        repository={mockRepository}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /save changes|save coverage/i }));
    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toMatch(/not among verified|verified onboarding/i);
    expect(
      useBrainWorkerOperationsStore.getState().coverage.primaryCityId
    ).toBe(FIXTURE_COVERAGE_A.primaryCityId);
  });

  it('COV-003: operational zones selector requires at least one zone before save', async () => {
    render(
      <CoverageEditor
        brainWorkerId={FIXTURE_APPROVED_BRAINWORKER_A}
        verifiedCities={VERIFIED_CITIES}
        repository={mockRepository}
      />
    );
    const firstZone = screen.getByRole('checkbox', {
      name: new RegExp(FIXTURE_COVERAGE_A.coverageNeighbourhoods[0] as string, 'i'),
    });
    for (const zone of FIXTURE_COVERAGE_A.coverageNeighbourhoods) {
      const checkbox = screen.getByRole('checkbox', { name: new RegExp(zone, 'i') });
      if ((checkbox as HTMLInputElement).checked) {
        fireEvent.click(checkbox);
      }
    }
    expect(firstZone).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: /save changes|save coverage/i }));
    expect(await screen.findByText(/at least one.*zone|one operational zone/i)).toBeDefined();
    expect(mockRepository.saveCoverage).not.toHaveBeenCalled();
  });

  it('COV-004: travel radius is restricted to the 5/10/15/25/50 km whitelist and updates the draft', async () => {
    render(
      <CoverageEditor
        brainWorkerId={FIXTURE_APPROVED_BRAINWORKER_A}
        verifiedCities={VERIFIED_CITIES}
        repository={mockRepository}
      />
    );
    const radiusGroup = screen.getByRole('radiogroup', { name: /travel radius/i });
    const radiusOptions = within(radiusGroup as HTMLElement)
      .getAllByRole('radio')
      .map((r) => (r as HTMLInputElement).value);
    expect(radiusOptions.map(Number).sort((a, b) => a - b)).toEqual([5, 10, 15, 25, 50]);
    fireEvent.click(screen.getByRole('radio', { name: /15\s?km/i }));
    await waitFor(() => {
      expect(useBrainWorkerOperationsStore.getState().coverage.travelRadiusKm).toBe(15);
    });
    expect(
      useBrainWorkerOperationsStore.getState().coverage.primaryCityId
    ).toBe(FIXTURE_COVERAGE_A.primaryCityId);
  });

  it('COV-005: cross-worker coverage save fails closed with tenant isolation error and preserved draft', async () => {
    mockRepository.saveCoverage = vi.fn().mockRejectedValueOnce(
      new ForbiddenTenantAccessError(
        `FORBIDDEN_TENANT_ACCESS: Session '${FIXTURE_APPROVED_BRAINWORKER_A}' cannot access profile for '${FIXTURE_APPROVED_BRAINWORKER_B}'.`
      )
    );
    render(
      <CoverageEditor
        brainWorkerId={FIXTURE_APPROVED_BRAINWORKER_B}
        verifiedCities={VERIFIED_CITIES}
        repository={mockRepository}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /save changes|save coverage/i }));
    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toMatch(/FORBIDDEN_TENANT_ACCESS/i);
    expect(useBrainWorkerOperationsStore.getState().isDirty).toBe(true);
  });

  it('COV-006: save persists the full coverage payload losslessly through saveCoverage only', async () => {
    render(
      <CoverageEditor
        brainWorkerId={FIXTURE_APPROVED_BRAINWORKER_A}
        verifiedCities={VERIFIED_CITIES}
        repository={mockRepository}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /save changes|save coverage/i }));
    await waitFor(() => {
      expect(mockRepository.saveCoverage).toHaveBeenCalledTimes(1);
    });
    const saveCalls = (mockRepository.saveCoverage as Mock).mock.calls;
    const firstSaveCall = saveCalls[0];
    expect(firstSaveCall).toBeDefined();
    if (firstSaveCall === undefined) {
      throw new Error('Expected saveCoverage to have been called once.');
    }
    expect(firstSaveCall[0]).toBe(FIXTURE_APPROVED_BRAINWORKER_A);
    const payload = firstSaveCall[1] as {
      primaryCityId: string;
      primaryCityName: string;
      coverageNeighbourhoods: string[];
      travelRadiusKm: number;
    };
    expect(payload.primaryCityId).toBe(FIXTURE_COVERAGE_A.primaryCityId);
    expect(payload.primaryCityName).toBe(FIXTURE_COVERAGE_A.primaryCityName);
    expect(payload.coverageNeighbourhoods).toEqual(
      FIXTURE_COVERAGE_A.coverageNeighbourhoods
    );
    expect(payload.travelRadiusKm).toBe(FIXTURE_COVERAGE_A.travelRadiusKm);
    expect(mockRepository.saveServiceCatalog).not.toHaveBeenCalled();
    expect(mockRepository.saveAvailability).not.toHaveBeenCalled();
  });

  it('COV-007: coverage edits leave dispatch duty status untouched and keep isComplete semantics', async () => {
    const beforeAvailable =
      useBrainWorkerOperationsStore.getState().availability.isAvailable;
    render(
      <CoverageEditor
        brainWorkerId={FIXTURE_APPROVED_BRAINWORKER_A}
        verifiedCities={VERIFIED_CITIES}
        repository={mockRepository}
      />
    );
    fireEvent.click(screen.getByRole('radio', { name: /15\s?km/i }));
    await waitFor(() => {
      expect(useBrainWorkerOperationsStore.getState().coverage.travelRadiusKm).toBe(15);
    });
    expect(useBrainWorkerOperationsStore.getState().availability.isAvailable).toBe(
      beforeAvailable
    );
    expect(
      useBrainWorkerOperationsStore.getState().availability.isEmergencyAvailable
    ).toBe(FIXTURE_OPERATIONAL_PROFILE_A.availability.isEmergencyAvailable);
  });

  it('COV-008: coverage editing never touches the matching hydration profile', async () => {
    render(
      <CoverageEditor
        brainWorkerId={FIXTURE_APPROVED_BRAINWORKER_A}
        verifiedCities={VERIFIED_CITIES}
        repository={mockRepository}
      />
    );
    fireEvent.click(screen.getByRole('radio', { name: /15\s?km/i }));
    fireEvent.click(screen.getByRole('button', { name: /save changes|save coverage/i }));
    await waitFor(() => {
      expect(mockRepository.saveCoverage).toHaveBeenCalledTimes(1);
    });
    expect(mockRepository.getMatchingHydrationProfile).not.toHaveBeenCalled();
  });

  it('COV-009: coverage controls are keyboard reachable with associated error messaging', async () => {
    render(
      <CoverageEditor
        brainWorkerId={FIXTURE_APPROVED_BRAINWORKER_A}
        verifiedCities={VERIFIED_CITIES}
        repository={mockRepository}
      />
    );
    const citySelect = screen.getByLabelText(/primary city/i);
    (citySelect as HTMLElement).focus();
    expect(document.activeElement).toBe(citySelect);
    for (const zone of FIXTURE_COVERAGE_A.coverageNeighbourhoods) {
      const checkbox = screen.getByRole('checkbox', { name: new RegExp(zone, 'i') });
      if ((checkbox as HTMLInputElement).checked) {
        fireEvent.click(checkbox);
      }
    }
    fireEvent.click(screen.getByRole('button', { name: /save changes|save coverage/i }));
    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toMatch(/at least one.*zone|one operational zone/i);
  });

  it('COV-010: production component keeps the physical testing boundary (zero testing imports)', () => {
    const source = fs.readFileSync(path.join(__dirname, 'CoverageEditor.tsx'), 'utf8');
    expect(source).not.toMatch(/from ['"][^'"]*testing[^'"]*['"]/);
    expect(source).not.toMatch(/test fixtures/i);
  });
});
