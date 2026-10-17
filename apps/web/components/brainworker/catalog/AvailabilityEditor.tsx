// apps/web/components/brainworker/catalog/AvailabilityEditor.tsx
// Phase 5 GREEN: Availability and Schedule Editor Component
// Governed by: BW-002 Architecture Contract v1.2 & Test-First Implementation Plan v1.2 (Suite 5: SCH-001 to SCH-006, SCH-009, SCH-010)

'use client';

import React, { useEffect, useLayoutEffect, useState } from 'react';
import {
  type BrainWorkerAvailability,
  type DayOfWeek,
  type IBrainWorkerOperationsRepository,
} from '../../../lib/brainworker/catalog/types';
import { useBrainWorkerOperationsStore } from '../../../lib/brainworker/catalog/store';
import { getBrainWorkerOperationsRepository } from '../../../lib/brainworker/catalog/repository';
import { validateDaySchedule } from '../../../lib/brainworker/catalog/validation';

export interface AvailabilityEditorProps {
  brainWorkerId?: string | undefined;
  initialAvailability?: BrainWorkerAvailability | undefined;
  repository?: IBrainWorkerOperationsRepository | undefined;
  onSaveSuccess?: ((saved: BrainWorkerAvailability) => void) | undefined;
  onSaveError?: ((error: Error) => void) | undefined;
  className?: string | undefined;
}

const ORDERED_DAYS: readonly DayOfWeek[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

function cloneAvailability(
  availability: BrainWorkerAvailability
): BrainWorkerAvailability {
  return {
    ...availability,
    weeklySchedule: {
      monday: { ...availability.weeklySchedule.monday },
      tuesday: { ...availability.weeklySchedule.tuesday },
      wednesday: { ...availability.weeklySchedule.wednesday },
      thursday: { ...availability.weeklySchedule.thursday },
      friday: { ...availability.weeklySchedule.friday },
      saturday: { ...availability.weeklySchedule.saturday },
      sunday: { ...availability.weeklySchedule.sunday },
    },
  };
}

export function AvailabilityEditor({
  brainWorkerId,
  initialAvailability,
  repository,
  onSaveSuccess,
  onSaveError,
  className,
}: AvailabilityEditorProps): React.ReactElement {
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const isMountedRef = React.useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const availability = useBrainWorkerOperationsStore((s) => s.availability);
  const isSaving = useBrainWorkerOperationsStore((s) => s.isSaving);
  const saveError = useBrainWorkerOperationsStore((s) => s.saveError);
  const validationErrors = useBrainWorkerOperationsStore((s) => s.validationErrors);

  const updateDaySchedule = useBrainWorkerOperationsStore((s) => s.updateDaySchedule);
  const copyMondayHoursToWeekdays = useBrainWorkerOperationsStore(
    (s) => s.copyMondayHoursToWeekdays
  );
  const setIsAvailable = useBrainWorkerOperationsStore((s) => s.setIsAvailable);
  const setIsEmergencyAvailable = useBrainWorkerOperationsStore(
    (s) => s.setIsEmergencyAvailable
  );
  const setIsSaving = useBrainWorkerOperationsStore((s) => s.setIsSaving);
  const setSaveError = useBrainWorkerOperationsStore((s) => s.setSaveError);
  const setDirty = useBrainWorkerOperationsStore((s) => s.setDirty);

  useIsomorphicLayoutEffect(() => {
    if (!initialAvailability) {
      return;
    }
    const state = useBrainWorkerOperationsStore.getState();
    if (state.isDirty) {
      return;
    }
    if (state.availability.brainWorkerId === initialAvailability.brainWorkerId) {
      return;
    }
    useBrainWorkerOperationsStore.setState({
      availability: cloneAvailability(initialAvailability),
      isDirty: false,
      saveError: null,
      validationErrors: {},
    });
  }, [initialAvailability]);

  useEffect(() => {
    if (initialAvailability || !brainWorkerId) {
      return;
    }
    const state = useBrainWorkerOperationsStore.getState();
    if (state.isDirty) {
      return;
    }
    if (state.availability.brainWorkerId === brainWorkerId) {
      return;
    }
    let isSubscribed = true;
    const repo = repository ?? getBrainWorkerOperationsRepository();
    repo
      .getAvailability(brainWorkerId)
      .then((fetched) => {
        if (!isSubscribed || !fetched) {
          return;
        }
        const current = useBrainWorkerOperationsStore.getState();
        if (current.isDirty) {
          return;
        }
        if (current.availability.brainWorkerId === fetched.brainWorkerId) {
          return;
        }
        useBrainWorkerOperationsStore.setState({
          availability: cloneAvailability(fetched),
          isDirty: false,
          saveError: null,
          validationErrors: {},
        });
      })
      .catch((error: unknown) => {
        if (!isSubscribed) {
          return;
        }
        const message =
          error instanceof Error ? error.message : 'Failed to load availability';
        setSaveError(message);
      });
    return () => {
      isSubscribed = false;
    };
  }, [initialAvailability, brainWorkerId, repository, setSaveError]);

  const handleSave = async () => {
    const currentState = useBrainWorkerOperationsStore.getState();
    if (currentState.isSaving) {
      return;
    }
    const hasStoredScheduleError = Object.keys(currentState.validationErrors).some(
      (key) => key.startsWith('schedule_')
    );
    const hasLiveScheduleError = ORDERED_DAYS.some((day) => {
      const schedule = currentState.availability.weeklySchedule[day];
      return schedule ? !validateDaySchedule(schedule).valid : true;
    });
    if (hasStoredScheduleError || hasLiveScheduleError) {
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    setSuccessToast(null);

    try {
      const repo = repository ?? getBrainWorkerOperationsRepository();
      const workerId = brainWorkerId ?? currentState.availability.brainWorkerId;
      const payload = {
        isAvailable: currentState.availability.isAvailable,
        isEmergencyAvailable: currentState.availability.isEmergencyAvailable,
        weeklySchedule: cloneAvailability(currentState.availability).weeklySchedule,
      };
      const saved = await repo.saveAvailability(workerId, payload);
      setDirty(false);
      if (isMountedRef.current) {
        setSuccessToast('Availability saved successfully.');
      }
      onSaveSuccess?.(saved);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save availability';
      setSaveError(message);
      onSaveError?.(err instanceof Error ? err : new Error(message));
    } finally {
      if (isMountedRef.current) {
        setIsSaving(false);
      } else {
        useBrainWorkerOperationsStore.setState({ isSaving: false });
      }
    }
  };

  const hasScheduleErrors =
    Object.keys(validationErrors).some((key) => key.startsWith('schedule_')) ||
    ORDERED_DAYS.some((day) => {
      const schedule = availability.weeklySchedule[day];
      return schedule ? !validateDaySchedule(schedule).valid : false;
    });
  const isSaveDisabled = isSaving || hasScheduleErrors;

  return (
    <div
      role="region"
      aria-label="Availability and Schedule"
      className={className ? `space-y-8 ${className}` : 'space-y-8'}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[var(--lead)]">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-main)] tracking-tight">
            Availability and Weekly Schedule
          </h2>
          <p className="mt-1 text-sm text-[var(--text-muted)] max-w-2xl leading-relaxed">
            Set the days and hours you are open for jobs. Keep this honest so every
            request matches what you can deliver.
          </p>
        </div>
        <div>
          <button
            type="button"
            aria-label="Save changes"
            disabled={isSaveDisabled}
            onClick={handleSave}
            className={
              isSaveDisabled
                ? 'px-5 py-2.5 rounded-lg text-sm font-semibold bg-[var(--tag-bg)] text-[var(--text-muted)] cursor-not-allowed transition-colors'
                : 'px-5 py-2.5 rounded-lg text-sm font-semibold bg-[var(--amber)] text-white hover:bg-[var(--amber-hover)] transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--amber)]'
            }
          >
            {isSaving ? 'Saving Changes...' : 'Save changes'}
          </button>
        </div>
      </div>

      {saveError && (
        <div
          role="alert"
          className="p-4 rounded-lg bg-[var(--danger-dim)] border border-[var(--danger-border)] text-sm text-[var(--danger)] font-medium"
        >
          {saveError}
        </div>
      )}

      {successToast && (
        <div
          role="status"
          aria-live="polite"
          className="p-4 rounded-lg bg-[var(--brand-green-dim)] border border-[var(--brand-green-border)] text-sm text-[var(--brand-green)] font-medium"
        >
          {successToast}
        </div>
      )}

      <div className="p-6 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] shadow-xs space-y-3 transition-colors">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-[var(--text-main)]">Dispatch duty</h3>
            <p className="mt-1 text-sm text-[var(--text-muted)] leading-relaxed">
              Controls your dispatch eligibility. When on duty you are available for
              matching against new customer jobs.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={availability.isAvailable}
            aria-label={availability.isAvailable ? 'Dispatch duty On-Duty' : 'Dispatch duty Off-Duty'}
            onClick={() => {
              setSuccessToast(null);
              setIsAvailable(!availability.isAvailable);
            }}
            className={
              availability.isAvailable
                ? 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-[var(--amber)] transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--amber)] focus:ring-offset-2'
                : 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-[var(--rule)] transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--amber)] focus:ring-offset-2'
            }
          >
            <span
              className={
                availability.isAvailable
                  ? 'translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[var(--card-bg)] shadow ring-0 transition duration-200 ease-in-out'
                  : 'translate-x-0 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[var(--card-bg)] shadow ring-0 transition duration-200 ease-in-out'
              }
            />
          </button>
        </div>
        <p className="text-xs font-semibold text-[var(--text-muted)]">
          {availability.isAvailable ? 'Currently On-Duty' : 'Currently Off-Duty'}
        </p>
      </div>

      <div className="p-6 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] shadow-xs space-y-4 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-[var(--text-main)]">Weekly schedule</h3>
            <p className="mt-0.5 text-sm text-[var(--text-muted)]">
              Set the hours you are open each day, between 6am and 10pm. Every
              open day needs a two-hour minimum or more.
            </p>
          </div>
          <button
            type="button"
            aria-label="Copy Monday to weekdays"
            onClick={() => {
              setSuccessToast(null);
              copyMondayHoursToWeekdays();
            }}
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-[var(--card-bg)] text-[var(--text-main)] border border-[var(--card-border)] hover:bg-[var(--bg)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--amber)]"
          >
            Copy to weekdays
          </button>
        </div>

        <div className="space-y-3">
          {ORDERED_DAYS.map((day) => {
            const schedule = availability.weeklySchedule[day];
            if (!schedule) {
              return null;
            }
            const storedError = validationErrors[`schedule_${day}`];
            const liveResult = validateDaySchedule(schedule);
            const errorMessage =
              storedError ?? (!liveResult.valid ? liveResult.error : undefined);
            const showError = Boolean(schedule.isActive && errorMessage);
            return (
              <div
                key={day}
                data-testid={`day-row-${day}`}
                className="p-4 rounded-lg border border-[var(--card-border)] bg-[var(--bg)] flex flex-col sm:flex-row sm:items-center gap-3 transition-colors"
              >
                <div className="flex items-center justify-between gap-3 sm:w-48">
                  <span className="text-sm font-semibold text-[var(--text-main)]">
                    {DAY_LABELS[day]}
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={schedule.isActive}
                    aria-label={`${DAY_LABELS[day]} available`}
                    data-testid={`day-toggle-${day}`}
                    onClick={() => {
                      setSuccessToast(null);
                      updateDaySchedule(day, { isActive: !schedule.isActive });
                    }}
                    className={
                      schedule.isActive
                        ? 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-[var(--amber)] transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--amber)] focus:ring-offset-2'
                        : 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-[var(--rule)] transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--amber)] focus:ring-offset-2'
                    }
                  >
                    <span
                      className={
                        schedule.isActive
                          ? 'translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[var(--card-bg)] shadow ring-0 transition duration-200 ease-in-out'
                          : 'translate-x-0 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[var(--card-bg)] shadow ring-0 transition duration-200 ease-in-out'
                      }
                    />
                  </button>
                </div>
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex-1">
                    <label
                      htmlFor={`start-${day}`}
                      className="block text-xs font-medium text-[var(--text-muted)]"
                    >
                      Start hour
                    </label>
                    <input
                      type="number"
                      id={`start-${day}`}
                      min={6}
                      max={22}
                      step={1}
                      value={schedule.startHour}
                      onChange={(e) => {
                        setSuccessToast(null);
                        const val =
                          e.target.value === '' ? 0 : Number(e.target.value);
                        updateDaySchedule(day, { startHour: val });
                      }}
                      className="mt-1 block w-full rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] px-3 py-2 text-[var(--text-main)] focus:border-[var(--amber)] focus:ring-2 focus:ring-[var(--amber)] focus:outline-none sm:text-sm font-medium"
                      aria-invalid={showError ? 'true' : 'false'}
                      aria-describedby={showError ? `${day}-schedule-error` : undefined}
                    />
                  </div>
                  <div className="flex-1">
                    <label
                      htmlFor={`end-${day}`}
                      className="block text-xs font-medium text-[var(--text-muted)]"
                    >
                      End hour
                    </label>
                    <input
                      type="number"
                      id={`end-${day}`}
                      min={6}
                      max={22}
                      step={1}
                      value={schedule.endHour}
                      onChange={(e) => {
                        setSuccessToast(null);
                        const val =
                          e.target.value === '' ? 0 : Number(e.target.value);
                        updateDaySchedule(day, { endHour: val });
                      }}
                      className="mt-1 block w-full rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] px-3 py-2 text-[var(--text-main)] focus:border-[var(--amber)] focus:ring-2 focus:ring-[var(--amber)] focus:outline-none sm:text-sm font-medium"
                      aria-invalid={showError ? 'true' : 'false'}
                      aria-describedby={showError ? `${day}-schedule-error` : undefined}
                    />
                  </div>
                </div>
                {showError && (
                  <p
                    id={`${day}-schedule-error`}
                    role="alert"
                    className="text-xs text-[var(--danger)] font-medium sm:basis-full"
                  >
                    {errorMessage}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-6 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] shadow-xs space-y-3 transition-colors">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-[var(--text-main)]">Emergency jobs</h3>
            <p className="mt-1 text-sm text-[var(--text-muted)] leading-relaxed">
              Urgent dispatch readiness for jobs that need arrival inside a 2-hour
              window. Turn this on only when you can move at short notice.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={availability.isEmergencyAvailable}
            aria-label="Emergency availability"
            onClick={() => {
              setSuccessToast(null);
              setIsEmergencyAvailable(!availability.isEmergencyAvailable);
            }}
            className={
              availability.isEmergencyAvailable
                ? 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-[var(--amber)] transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--amber)] focus:ring-offset-2'
                : 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-[var(--rule)] transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--amber)] focus:ring-offset-2'
            }
          >
            <span
              className={
                availability.isEmergencyAvailable
                  ? 'translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[var(--card-bg)] shadow ring-0 transition duration-200 ease-in-out'
                  : 'translate-x-0 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[var(--card-bg)] shadow ring-0 transition duration-200 ease-in-out'
              }
            />
          </button>
        </div>
      </div>
    </div>
  );
}
