// apps/web/components/brainworker/catalog/AvailabilityEditor.test.tsx
// Phase 5 RED: Availability & Schedule Editor Contract Tests (SCH-001 through SCH-006, SCH-009, SCH-010)
// Authoritative References:
// - docs/specs/BW-002-architecture-contract.md (v1.2, Sections 3, 6)
// - docs/specs/BW-002-ux-design-specification.md (v1.2, Section 2 availability surface)
// - docs/specs/BW-002-test-first-implementation-plan.md (v1.2, Suite 5: SCH-001 to SCH-006)
// - docs/specs/BW-002-service-catalog-availability.md (v1.2, Section 2.3)
// Scope boundary: schedule editor only. SCH-007 (primary city) and SCH-008 (travel
// radius) are coverage UI and are explicitly excluded from Phase 5. No matching-engine,
// Prisma, API, backend, or isComplete semantic changes in this suite.

import React from 'react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { AvailabilityEditor } from './AvailabilityEditor';
import { useBrainWorkerOperationsStore } from '../../../lib/brainworker/catalog/store';
import {
  FIXTURE_APPROVED_BRAINWORKER_A,
  FIXTURE_AVAILABILITY_A,
  FIXTURE_OPERATIONAL_PROFILE_A,
} from '../../../lib/brainworker/catalog/testing';
import type { IBrainWorkerOperationsRepository } from '../../../lib/brainworker/catalog/types';
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

describe('BW-002 Suite 5 RED: Availability & Schedule Editor Contracts (SCH-001 to SCH-006, SCH-009, SCH-010)', () => {
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
      getAvailability: vi.fn().mockResolvedValue(FIXTURE_AVAILABILITY_A),
      saveAvailability: vi.fn().mockImplementation(
        async (
          _id: string,
          availability: {
            isAvailable: boolean;
            isEmergencyAvailable: boolean;
            weeklySchedule: Record<
              string,
              { day: string; isActive: boolean; startHour: number; endHour: number }
            >;
          }
        ) => ({
          brainWorkerId: _id,
          isAvailable: availability.isAvailable,
          isEmergencyAvailable: availability.isEmergencyAvailable,
          weeklySchedule: availability.weeklySchedule,
          updatedAt: new Date().toISOString(),
        })
      ),
      getCoverage: vi.fn(),
      saveCoverage: vi.fn(),
      getMatchingHydrationProfile: vi.fn(),
    } as unknown as MockOperationsRepository & IBrainWorkerOperationsRepository;
  });

  it('SCH-001: renders global dispatch duty toggle (On-Duty vs Off-Duty) with eligibility description', () => {
    render(
      <AvailabilityEditor
        brainWorkerId={FIXTURE_APPROVED_BRAINWORKER_A}
        repository={mockRepository}
      />
    );
    expect(
      screen.getByRole('switch', { name: /on-duty|off-duty|dispatch duty/i })
    ).toBeDefined();
    expect(screen.getByText(/dispatch eligibility|available for matching/i)).toBeDefined();
  });

  it('SCH-002: renders 7-day schedule grid with per-day active toggles', () => {
    render(
      <AvailabilityEditor
        brainWorkerId={FIXTURE_APPROVED_BRAINWORKER_A}
        repository={mockRepository}
      />
    );
    for (const day of [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ]) {
      expect(screen.getByText(new RegExp(day, 'i'))).toBeDefined();
    }
    const switches = screen.getAllByRole('switch');
    expect(switches.length).toBeGreaterThanOrEqual(8);
  });

  it('SCH-003: changing a day start/end time updates the draft window and preserves other days', async () => {
    render(
      <AvailabilityEditor
        brainWorkerId={FIXTURE_APPROVED_BRAINWORKER_A}
        repository={mockRepository}
      />
    );
    const mondayRow = screen.getByTestId('day-row-monday');
    const startInput = within(mondayRow as HTMLElement).getByLabelText(/start/i);
    fireEvent.change(startInput, { target: { value: '9' } });
    await waitFor(() => {
      expect(
        useBrainWorkerOperationsStore.getState().availability.weeklySchedule.monday
          .startHour
      ).toBe(9);
    });
    expect(
      useBrainWorkerOperationsStore.getState().availability.weeklySchedule.tuesday.startHour
    ).toBe(FIXTURE_AVAILABILITY_A.weeklySchedule.tuesday.startHour);
    expect(
      useBrainWorkerOperationsStore.getState().availability.weeklySchedule.sunday.isActive
    ).toBe(FIXTURE_AVAILABILITY_A.weeklySchedule.sunday.isActive);
  });

  it('SCH-004a: shows inline error when end hour is not strictly greater than start hour', async () => {
    render(
      <AvailabilityEditor
        brainWorkerId={FIXTURE_APPROVED_BRAINWORKER_A}
        repository={mockRepository}
      />
    );
    const mondayRow = screen.getByTestId('day-row-monday');
    fireEvent.change(within(mondayRow as HTMLElement).getByLabelText(/start/i), {
      target: { value: '14' },
    });
    fireEvent.change(within(mondayRow as HTMLElement).getByLabelText(/end/i), {
      target: { value: '12' },
    });
    expect(await screen.findByText(/strictly greater than start hour/i)).toBeDefined();
    expect(mockRepository.saveAvailability).not.toHaveBeenCalled();
  });

  it('SCH-004b: shows inline error when the daily window is under 2 hours', async () => {
    render(
      <AvailabilityEditor
        brainWorkerId={FIXTURE_APPROVED_BRAINWORKER_A}
        repository={mockRepository}
      />
    );
    const tuesdayRow = screen.getByTestId('day-row-tuesday');
    fireEvent.change(within(tuesdayRow as HTMLElement).getByLabelText(/start/i), {
      target: { value: '10' },
    });
    fireEvent.change(within(tuesdayRow as HTMLElement).getByLabelText(/end/i), {
      target: { value: '11' },
    });
    expect(await screen.findByText(/at least 2 hours/i)).toBeDefined();
    expect(mockRepository.saveAvailability).not.toHaveBeenCalled();
  });

  it('SCH-004c: shows inline error for hours outside the 06:00 to 22:00 operating bounds', async () => {
    render(
      <AvailabilityEditor
        brainWorkerId={FIXTURE_APPROVED_BRAINWORKER_A}
        repository={mockRepository}
      />
    );
    const wednesdayRow = screen.getByTestId('day-row-wednesday');
    fireEvent.change(within(wednesdayRow as HTMLElement).getByLabelText(/start/i), {
      target: { value: '5' },
    });
    expect(await screen.findByText(/06:00|operating window/i)).toBeDefined();
    fireEvent.change(within(wednesdayRow as HTMLElement).getByLabelText(/start/i), {
      target: { value: '8' },
    });
    fireEvent.change(within(wednesdayRow as HTMLElement).getByLabelText(/end/i), {
      target: { value: '23' },
    });
    expect(await screen.findByText(/22:00|operating window/i)).toBeDefined();
  });

  it('SCH-005: Copy Monday to Weekdays updates Tuesday through Friday and leaves weekend untouched', async () => {
    render(
      <AvailabilityEditor
        brainWorkerId={FIXTURE_APPROVED_BRAINWORKER_A}
        repository={mockRepository}
      />
    );
    const mondayRow = screen.getByTestId('day-row-monday');
    fireEvent.change(within(mondayRow as HTMLElement).getByLabelText(/start/i), {
      target: { value: '7' },
    });
    fireEvent.change(within(mondayRow as HTMLElement).getByLabelText(/end/i), {
      target: { value: '17' },
    });
    fireEvent.click(screen.getByRole('button', { name: /copy monday to weekdays/i }));
    await waitFor(() => {
      const schedule =
        useBrainWorkerOperationsStore.getState().availability.weeklySchedule;
      for (const day of ['tuesday', 'wednesday', 'thursday', 'friday'] as const) {
        expect(schedule[day].startHour).toBe(7);
        expect(schedule[day].endHour).toBe(17);
      }
      expect(schedule.saturday.startHour).toBe(
        FIXTURE_AVAILABILITY_A.weeklySchedule.saturday.startHour
      );
      expect(schedule.sunday.startHour).toBe(
        FIXTURE_AVAILABILITY_A.weeklySchedule.sunday.startHour
      );
    });
  });

  it('SCH-006: emergency dispatch readiness toggle updates isEmergencyAvailable', async () => {
    render(
      <AvailabilityEditor
        brainWorkerId={FIXTURE_APPROVED_BRAINWORKER_A}
        repository={mockRepository}
      />
    );
    expect(screen.getByText(/< ?2 ?hr|2-hour|urgent dispatch/i)).toBeDefined();
    fireEvent.click(screen.getByRole('switch', { name: /emergency/i }));
    await waitFor(() => {
      expect(
        useBrainWorkerOperationsStore.getState().availability.isEmergencyAvailable
      ).toBe(!FIXTURE_AVAILABILITY_A.isEmergencyAvailable);
    });
  });

  it('SCH-009: save persists the full 7-day schedule losslessly with no fabricated global window', async () => {
    render(
      <AvailabilityEditor
        brainWorkerId={FIXTURE_APPROVED_BRAINWORKER_A}
        repository={mockRepository}
      />
    );
    expect(screen.queryByLabelText(/workingHoursStart/i)).toBeNull();
    expect(screen.queryByLabelText(/workingHoursEnd/i)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /save changes|save schedule/i }));
    await waitFor(() => {
      expect(mockRepository.saveAvailability).toHaveBeenCalledTimes(1);
    });
    const savedSchedule = (mockRepository.saveAvailability as Mock).mock.calls[0][1]
      .weeklySchedule as Record<string, { day: string }>;
    expect(Object.keys(savedSchedule).sort()).toEqual(
      ['friday', 'monday', 'saturday', 'sunday', 'thursday', 'tuesday', 'wednesday'].sort()
    );
  });

  it('SCH-010: schedule controls are keyboard reachable with switch roles and associated error messaging', async () => {
    render(
      <AvailabilityEditor
        brainWorkerId={FIXTURE_APPROVED_BRAINWORKER_A}
        repository={mockRepository}
      />
    );
    const mondayToggle = screen.getByTestId('day-toggle-monday');
    mondayToggle.focus();
    expect(document.activeElement).toBe(mondayToggle);
    expect(mondayToggle.getAttribute('role')).toBe('switch');
    const mondayRow = screen.getByTestId('day-row-monday');
    fireEvent.change(within(mondayRow as HTMLElement).getByLabelText(/end/i), {
      target: { value: '8' },
    });
    fireEvent.change(within(mondayRow as HTMLElement).getByLabelText(/start/i), {
      target: { value: '14' },
    });
    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toMatch(/strictly greater|2 hours/i);
  });

  it('SCH-011: production component keeps the physical testing boundary (zero testing imports)', () => {
    const source = fs.readFileSync(
      path.join(__dirname, 'AvailabilityEditor.tsx'),
      'utf8'
    );
    expect(source).not.toMatch(/from ['"][^'"]*testing[^'"]*['"]/);
    expect(source).not.toMatch(/test fixtures/i);
  });
});
