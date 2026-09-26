// apps/web/components/brainworker/catalog/CoverageEditor.tsx
// Phase 6 GREEN: Coverage Area & Location Editor Component
// Governed by: BW-002 Architecture Contract v1.2 & Test-First Implementation Plan v1.2 (Suite 6: COV-001 to COV-010)

'use client';

import React, { useEffect, useLayoutEffect, useState, useRef } from 'react';
import {
  type BrainWorkerCoverage,
  type IBrainWorkerOperationsRepository,
  VALID_TRAVEL_RADII_KM,
} from '../../../lib/brainworker/catalog/types';
import { useBrainWorkerOperationsStore } from '../../../lib/brainworker/catalog/store';
import { getBrainWorkerOperationsRepository } from '../../../lib/brainworker/catalog/repository';
import { validateTravelRadius } from '../../../lib/brainworker/catalog/validation';

export interface CoverageEditorProps {
  brainWorkerId?: string | undefined;
  verifiedCities?: string[] | readonly string[] | undefined;
  initialCoverage?: BrainWorkerCoverage | undefined;
  repository?: IBrainWorkerOperationsRepository | undefined;
  onSaveSuccess?: ((saved: BrainWorkerCoverage) => void) | undefined;
  onSaveError?: ((error: Error) => void) | undefined;
  className?: string | undefined;
}

const DEFAULT_CITY_ZONES: Record<string, string[]> = {
  Lagos: [
    'Ikeja',
    'Yaba',
    'Surulere',
    'Lekki',
    'Victoria Island',
    'Ikoyi',
    'Alimosho',
    'Kosofe',
    'Lagos Island',
    'Gbagada',
    'Maryland',
    'Ajah',
  ],
  Ibadan: [
    'Bodija',
    'Ring Road',
    'Dugbe',
    'Iyana Church',
    'Samonda',
    'Oluyole',
    'Mokola',
    'Agodi',
  ],
  'Abuja (FCT)': [
    'Garki',
    'Wuse',
    'Maitama',
    'Asokoro',
    'Jabi',
    'Utako',
    'Gwarinpa',
    'Kubwa',
  ],
  Abuja: [
    'Garki',
    'Wuse',
    'Maitama',
    'Asokoro',
    'Jabi',
    'Utako',
    'Gwarinpa',
    'Kubwa',
  ],
  'Port Harcourt': [
    'Port Harcourt GRA',
    'Rumuokoro',
    'Rumuogba',
    'D-Line',
    'Trans-Amadi',
    'Diobu',
    'Ada George',
  ],
  'Benin City': [
    'GRA Benin',
    'Uselu',
    'Ring Road',
    'Ikpoba Hill',
    'Ugbowo',
    'Ekenwan',
  ],
  Enugu: [
    'Independence Layout',
    'New Haven',
    'Ogui',
    'Achara Layout',
    'Abakpa Nike',
    'GRA Enugu',
  ],
  Kano: [
    'Nasarawa',
    'Fagge',
    'Dala',
    'Tarauni',
    'Gwale',
    'Kano Municipal',
  ],
};

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function CoverageEditor({
  brainWorkerId,
  verifiedCities,
  initialCoverage,
  repository,
  onSaveSuccess,
  onSaveError,
  className,
}: CoverageEditorProps): React.ReactElement {
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const coverage = useBrainWorkerOperationsStore((s) => s.coverage);
  const isSaving = useBrainWorkerOperationsStore((s) => s.isSaving);
  const saveError = useBrainWorkerOperationsStore((s) => s.saveError);

  const setPrimaryCity = useBrainWorkerOperationsStore((s) => s.setPrimaryCity);
  const setCoverageNeighbourhoods = useBrainWorkerOperationsStore(
    (s) => s.setCoverageNeighbourhoods
  );
  const setTravelRadius = useBrainWorkerOperationsStore((s) => s.setTravelRadius);
  const setIsSaving = useBrainWorkerOperationsStore((s) => s.setIsSaving);
  const setSaveError = useBrainWorkerOperationsStore((s) => s.setSaveError);
  const setDirty = useBrainWorkerOperationsStore((s) => s.setDirty);

  // Sync initialCoverage into store if provided
  useIsomorphicLayoutEffect(() => {
    if (!initialCoverage) {
      return;
    }
    const state = useBrainWorkerOperationsStore.getState();
    if (state.isDirty) {
      return;
    }
    if (
      state.coverage.brainWorkerId === initialCoverage.brainWorkerId &&
      state.coverage.primaryCityId === initialCoverage.primaryCityId &&
      state.coverage.travelRadiusKm === initialCoverage.travelRadiusKm &&
      JSON.stringify(state.coverage.coverageNeighbourhoods) ===
        JSON.stringify(initialCoverage.coverageNeighbourhoods)
    ) {
      return;
    }
    useBrainWorkerOperationsStore.setState({
      coverage: {
        ...initialCoverage,
        coverageNeighbourhoods: [...(initialCoverage.coverageNeighbourhoods || [])],
      },
      isDirty: false,
      saveError: null,
      validationErrors: {},
    });
  }, [initialCoverage]);

  // Fetch coverage if store is not populated and initialCoverage is omitted
  useEffect(() => {
    if (initialCoverage || !brainWorkerId) {
      return;
    }
    const state = useBrainWorkerOperationsStore.getState();
    if (state.isDirty) {
      return;
    }
    if (state.coverage.brainWorkerId === brainWorkerId && state.coverage.primaryCityId) {
      return;
    }
    let isSubscribed = true;
    const repo = repository ?? getBrainWorkerOperationsRepository();
    repo
      .getCoverage(brainWorkerId)
      .then((fetched) => {
        if (!isSubscribed || !fetched) {
          return;
        }
        const current = useBrainWorkerOperationsStore.getState();
        if (current.isDirty) {
          return;
        }
        useBrainWorkerOperationsStore.setState({
          coverage: {
            ...fetched,
            coverageNeighbourhoods: [...(fetched.coverageNeighbourhoods || [])],
          },
          isDirty: false,
          saveError: null,
        });
      })
      .catch((error: unknown) => {
        if (!isSubscribed) {
          return;
        }
        const message =
          error instanceof Error ? error.message : 'Failed to load coverage';
        setSaveError(message);
        setLocalError(message);
      });
    return () => {
      isSubscribed = false;
    };
  }, [initialCoverage, brainWorkerId, repository, setSaveError]);

  const verifiedList = Array.isArray(verifiedCities)
    ? verifiedCities
    : verifiedCities
      ? Array.from(verifiedCities)
      : [];

  const availableCities =
    verifiedList.length > 0
      ? verifiedList
      : coverage.primaryCityId
        ? [coverage.primaryCityId]
        : [];

  const currentCityKey =
    coverage.primaryCityName || coverage.primaryCityId || availableCities[0] || 'Lagos';
  const baseCityZones =
    DEFAULT_CITY_ZONES[currentCityKey] ?? DEFAULT_CITY_ZONES['Lagos'] ?? [];
  const renderedZones = Array.from(
    new Set([...baseCityZones, ...(coverage.coverageNeighbourhoods || [])])
  );

  const handleSave = async () => {
    const currentState = useBrainWorkerOperationsStore.getState();
    if (currentState.isSaving) {
      return;
    }

    if (
      !currentState.coverage.coverageNeighbourhoods ||
      currentState.coverage.coverageNeighbourhoods.length === 0
    ) {
      const msg = 'At least one operational zone is required.';
      setLocalError(msg);
      setSaveError(msg);
      return;
    }

    if (!currentState.coverage.primaryCityId || !currentState.coverage.primaryCityId.trim()) {
      const msg = 'Primary city is required.';
      setLocalError(msg);
      setSaveError(msg);
      return;
    }

    const radiusResult = validateTravelRadius(currentState.coverage.travelRadiusKm);
    if (!radiusResult.valid) {
      const msg = radiusResult.error ?? 'Valid travel radius is required.';
      setLocalError(msg);
      setSaveError(msg);
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    setLocalError(null);
    setSuccessToast(null);

    const workerId = brainWorkerId ?? currentState.coverage.brainWorkerId;
    const payload = {
      primaryCityId: currentState.coverage.primaryCityId,
      primaryCityName:
        currentState.coverage.primaryCityName || currentState.coverage.primaryCityId,
      coverageNeighbourhoods: [...currentState.coverage.coverageNeighbourhoods],
      travelRadiusKm: currentState.coverage.travelRadiusKm,
    };

    try {
      const repo = repository ?? getBrainWorkerOperationsRepository();
      const saved = await repo.saveCoverage(workerId, payload);
      setDirty(false);
      if (isMountedRef.current) {
        setSuccessToast('Coverage area saved successfully.');
      }
      onSaveSuccess?.(saved);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to save coverage area';
      setSaveError(message);
      setLocalError(message);
      setDirty(true);
      onSaveError?.(err instanceof Error ? err : new Error(message));
    } finally {
      if (isMountedRef.current) {
        setIsSaving(false);
      } else {
        useBrainWorkerOperationsStore.setState({ isSaving: false });
      }
    }
  };

  const displayAlertError = localError ?? saveError;

  return (
    <div
      role="region"
      aria-label="Coverage Area and Location"
      className={className ? `space-y-8 ${className}` : 'space-y-8'}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Coverage Area and Operational Base
          </h2>
          <p className="mt-1 text-sm text-slate-600 max-w-2xl leading-relaxed">
            Choose your primary operating city, operational zones, and travel
            radius. Keep this accurate to receive nearby job dispatches.
          </p>
        </div>
        <div>
          <button
            type="button"
            aria-label="Save changes"
            disabled={isSaving}
            onClick={handleSave}
            className={
              isSaving
                ? 'px-5 py-2.5 rounded-lg text-sm font-semibold bg-slate-200 text-slate-400 cursor-not-allowed transition-colors'
                : 'px-5 py-2.5 rounded-lg text-sm font-semibold bg-[#001A41] text-white hover:bg-[#002866] transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[#001A41] focus:ring-offset-2'
            }
          >
            {isSaving ? 'Saving changes...' : 'Save changes'}
          </button>
        </div>
      </div>

      {displayAlertError && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800 font-medium"
        >
          {displayAlertError}
        </div>
      )}

      {successToast && (
        <div
          role="status"
          aria-live="polite"
          className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-800 font-medium"
        >
          {successToast}
        </div>
      )}

      {/* Primary City */}
      <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Primary operating city</h3>
          <p className="mt-1 text-sm text-slate-600 leading-relaxed">
            Only cities approved during your onboarding verification can be selected
            as your operational base.
          </p>
        </div>
        <div>
          <label
            htmlFor="primary-city"
            className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2"
          >
            Primary city
          </label>
          <select
            id="primary-city"
            aria-label="Primary city"
            value={coverage.primaryCityId || ''}
            onChange={(e) => {
              setSuccessToast(null);
              setLocalError(null);
              setSaveError(null);
              const selected = e.target.value;
              setPrimaryCity(selected, selected);
            }}
            className="block w-full max-w-md rounded-lg border border-slate-300 px-3.5 py-2.5 text-slate-900 font-medium focus:border-[#001A41] focus:ring-2 focus:ring-[#001A41] focus:outline-none sm:text-sm bg-white"
          >
            {availableCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Operational Zones / LGAs */}
      <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Operational zones</h3>
          <p className="mt-1 text-sm text-slate-600 leading-relaxed">
            Pick the local government areas and neighbourhoods where you accept work.
          </p>
        </div>
        <div
          role="group"
          aria-label="Operational zones"
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
        >
          {renderedZones.map((zone) => {
            const isChecked = coverage.coverageNeighbourhoods.includes(zone);
            const inputId = `zone-${zone.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
            return (
              <label
                key={zone}
                htmlFor={inputId}
                className={
                  isChecked
                    ? 'flex items-center gap-3 p-3 rounded-xl border-2 border-[#001A41] bg-[#001A41]/5 cursor-pointer font-semibold text-[#001A41] transition-colors'
                    : 'flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer font-medium text-slate-700 transition-colors'
                }
              >
                <input
                  type="checkbox"
                  id={inputId}
                  aria-label={zone}
                  checked={isChecked}
                  onChange={(e) => {
                    setSuccessToast(null);
                    setLocalError(null);
                    setSaveError(null);
                    const checked = e.target.checked;
                    let next: string[];
                    if (checked) {
                      next = Array.from(new Set([...coverage.coverageNeighbourhoods, zone]));
                    } else {
                      next = coverage.coverageNeighbourhoods.filter((z) => z !== zone);
                    }
                    setCoverageNeighbourhoods(next);
                  }}
                  className="h-4 w-4 rounded border-slate-300 text-[#001A41] focus:ring-[#001A41]"
                />
                <span className="text-sm select-none">{zone}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Travel Radius */}
      <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Travel radius</h3>
          <p className="mt-1 text-sm text-slate-600 leading-relaxed">
            Maximum travel distance from your primary base for standard customer dispatches.
          </p>
        </div>
        <div
          role="radiogroup"
          aria-label="Travel radius"
          className="grid grid-cols-2 sm:grid-cols-5 gap-3"
        >
          {VALID_TRAVEL_RADII_KM.map((radius) => {
            const isSelected = coverage.travelRadiusKm === radius;
            return (
              <label
                key={radius}
                className={
                  isSelected
                    ? 'flex items-center justify-between p-3.5 rounded-xl border-2 border-[#001A41] bg-[#001A41]/5 cursor-pointer font-semibold text-[#001A41] transition-colors'
                    : 'flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer font-medium text-slate-700 transition-colors'
                }
              >
                <span className="text-sm">{radius} km</span>
                <input
                  type="radio"
                  name="travelRadiusKm"
                  aria-label={`${radius} km`}
                  value={String(radius)}
                  checked={isSelected}
                  onChange={() => {
                    setSuccessToast(null);
                    setLocalError(null);
                    setSaveError(null);
                    setTravelRadius(radius);
                  }}
                  className="h-4 w-4 border-slate-300 text-[#001A41] focus:ring-[#001A41]"
                />
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
