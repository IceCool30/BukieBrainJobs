// apps/web/components/brainworker/catalog/ServiceCatalogEditor.tsx
// Phase 4 GREEN: Service Catalog & Rates Editor Component
// Governed by: BW-002 Architecture Contract v1.2 & Test-First Implementation Plan v1.2 (Suite 4: CMP-001 to CMP-009)

'use client';

import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  CANONICAL_SERVICES_REGISTRY,
  MIN_HOURLY_RATE_NGN,
  MAX_HOURLY_RATE_NGN,
  MIN_DIAGNOSTIC_FEE_NGN,
  MAX_DIAGNOSTIC_FEE_NGN,
  RATE_STEP_NGN,
  type CanonicalTradeCategoryId,
  type IBrainWorkerOperationsRepository,
  type BrainWorkerServiceCatalog,
} from '../../../lib/brainworker/catalog/types';
import { useBrainWorkerOperationsStore } from '../../../lib/brainworker/catalog/store';
import { getBrainWorkerOperationsRepository } from '../../../lib/brainworker/catalog/repository';

export const TRADE_CATEGORIES: ReadonlyArray<{
  id: CanonicalTradeCategoryId;
  name: string;
}> = [
  { id: 'generator', name: 'Generator Repair & Maintenance' },
  { id: 'ac', name: 'Air Conditioning & Refrigeration' },
  { id: 'plumbing', name: 'Plumbing & Pipe Fitting' },
  { id: 'electrical', name: 'Electrical Installation & Inverters' },
  { id: 'carpentry', name: 'Carpentry & Furniture Making' },
  { id: 'painting', name: 'Painting & Wall Finishing' },
  { id: 'masonry', name: 'Masonry, Tiling & Bricklaying' },
  { id: 'welding', name: 'Welding & Metal Fabrication' },
];

export interface ServiceCatalogEditorProps {
  brainWorkerId?: string | undefined;
  initialCatalog?: BrainWorkerServiceCatalog | undefined;
  repository?: IBrainWorkerOperationsRepository | undefined;
  onSaveSuccess?: ((savedCatalog: BrainWorkerServiceCatalog) => void) | undefined;
  onSaveError?: ((error: Error) => void) | undefined;
  className?: string | undefined;
}

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function ServiceCatalogEditor({
  brainWorkerId,
  initialCatalog,
  repository,
  onSaveSuccess,
  onSaveError,
  className,
}: ServiceCatalogEditorProps): React.ReactElement {
  const [activeCategoryId, setActiveCategoryId] =
    useState<CanonicalTradeCategoryId>('generator');
  const [confirmRemoveServiceId, setConfirmRemoveServiceId] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const isMountedRef = React.useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const catalog = useBrainWorkerOperationsStore((s) => s.catalog);
  const isSaving = useBrainWorkerOperationsStore((s) => s.isSaving);
  const saveError = useBrainWorkerOperationsStore((s) => s.saveError);
  const validationErrors = useBrainWorkerOperationsStore((s) => s.validationErrors);

  const initializeCatalog = useBrainWorkerOperationsStore((s) => s.initializeCatalog);
  const updateDiagnosticFee = useBrainWorkerOperationsStore((s) => s.updateDiagnosticFee);
  const addService = useBrainWorkerOperationsStore((s) => s.addService);
  const removeService = useBrainWorkerOperationsStore((s) => s.removeService);
  const toggleServiceStatus = useBrainWorkerOperationsStore((s) => s.toggleServiceStatus);
  const updateServiceRate = useBrainWorkerOperationsStore((s) => s.updateServiceRate);
  const setIsSaving = useBrainWorkerOperationsStore((s) => s.setIsSaving);
  const setSaveError = useBrainWorkerOperationsStore((s) => s.setSaveError);

  // Synchronously hydrate initialCatalog into store on mount or prop update
  useIsomorphicLayoutEffect(() => {
    if (initialCatalog) {
      initializeCatalog(initialCatalog);
    } else if (
      brainWorkerId &&
      useBrainWorkerOperationsStore.getState().catalog.brainWorkerId !== brainWorkerId
    ) {
      initializeCatalog({
        ...useBrainWorkerOperationsStore.getState().catalog,
        brainWorkerId,
      });
    }
  }, [initialCatalog, brainWorkerId, initializeCatalog]);

  // Asynchronously hydrate from repository when initialCatalog is omitted
  useEffect(() => {
    if (!initialCatalog && brainWorkerId) {
      let isSubscribed = true;
      const repo = repository ?? getBrainWorkerOperationsRepository();
      repo
        .getServiceCatalog(brainWorkerId)
        .then((fetchedCatalog) => {
          if (isSubscribed && fetchedCatalog) {
            const currentCatalog = useBrainWorkerOperationsStore.getState().catalog;
            const isCurrentlyDirty = useBrainWorkerOperationsStore.getState().isDirty;
            if (!isCurrentlyDirty) {
              const isDifferent =
                currentCatalog.brainWorkerId !== fetchedCatalog.brainWorkerId ||
                currentCatalog.diagnosticFeeNgn !== fetchedCatalog.diagnosticFeeNgn ||
                currentCatalog.services.length !== fetchedCatalog.services.length ||
                JSON.stringify(currentCatalog.services) !==
                  JSON.stringify(fetchedCatalog.services);

              if (isDifferent) {
                initializeCatalog(fetchedCatalog);
              }
            }
          }
        })
        .catch((error: unknown) => {
          if (isSubscribed) {
            const message =
              error instanceof Error ? error.message : 'Failed to load service catalog';
            setSaveError(message);
          }
        });
      return () => {
        isSubscribed = false;
      };
    }
  }, [initialCatalog, repository, brainWorkerId, initializeCatalog, setSaveError]);

  const handleUpdateDiagnosticFee = (val: number) => {
    setSuccessToast(null);
    updateDiagnosticFee(val);
  };

  const handleAddService = (serviceId: string) => {
    setSuccessToast(null);
    addService(serviceId);
  };

  const handleRemoveService = (serviceId: string) => {
    setSuccessToast(null);
    removeService(serviceId);
  };

  const handleToggleServiceStatus = (serviceId: string) => {
    setSuccessToast(null);
    toggleServiceStatus(serviceId);
  };

  const handleUpdateServiceRate = (serviceId: string, val: number) => {
    setSuccessToast(null);
    updateServiceRate(serviceId, val);
  };

  const handleTabKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    currentIndex: number
  ) => {
    let nextIndex: number | null = null;
    if (e.key === 'ArrowRight') {
      nextIndex = (currentIndex + 1) % TRADE_CATEGORIES.length;
    } else if (e.key === 'ArrowLeft') {
      nextIndex =
        (currentIndex - 1 + TRADE_CATEGORIES.length) % TRADE_CATEGORIES.length;
    } else if (e.key === 'Home') {
      nextIndex = 0;
    } else if (e.key === 'End') {
      nextIndex = TRADE_CATEGORIES.length - 1;
    }

    if (nextIndex !== null) {
      e.preventDefault();
      const targetCategory = TRADE_CATEGORIES[nextIndex];
      if (targetCategory) {
        setActiveCategoryId(targetCategory.id);
        const nextTab = document.getElementById(`tab-${targetCategory.id}`);
        nextTab?.focus();
      }
    }
  };

  const handleSave = async () => {
    const currentState = useBrainWorkerOperationsStore.getState();
    if (currentState.isSaving || Object.keys(currentState.validationErrors).length > 0) {
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    setSuccessToast(null);

    try {
      const repo = repository ?? getBrainWorkerOperationsRepository();
      const workerId = brainWorkerId || catalog.brainWorkerId;
      const payload = {
        diagnosticFeeNgn: catalog.diagnosticFeeNgn,
        services: catalog.services.map((s) => ({
          serviceId: s.serviceId,
          hourlyRateNgn: s.hourlyRateNgn,
          status: s.status,
        })),
      };

      const savedCatalog = await repo.saveServiceCatalog(workerId, payload);
      initializeCatalog(savedCatalog);
      if (isMountedRef.current) {
        setSuccessToast('Service catalog saved successfully.');
      }
      onSaveSuccess?.(savedCatalog);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to save service catalog';
      setSaveError(message);
      onSaveError?.(err instanceof Error ? err : new Error(message));
    } finally {
      setIsSaving(false);
    }
  };

  const isSaveDisabled = isSaving || Object.keys(validationErrors).length > 0;
  const currentCategoryServices = CANONICAL_SERVICES_REGISTRY.filter(
    (s) => s.categoryId === activeCategoryId
  );

  return (
    <div
      role="region"
      aria-label="Service Catalog & Pricing"
      className={className ? `space-y-8 ${className}` : 'space-y-8'}
    >
      {/* Header and Save CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[var(--lead)]">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-main)] tracking-tight">
            Service Catalog & Pricing
          </h1>
          <p className="mt-1 text-sm text-[var(--text-muted)] max-w-2xl leading-relaxed">
            Select the specific trade services you offer and set your standard hourly labor rates. Clear, transparent pricing helps match you with serious customer requests.
          </p>
        </div>
        <div>
          <button
            type="button"
            aria-label="Save Changes"
            disabled={isSaveDisabled}
            onClick={handleSave}
            className={
              isSaveDisabled
                ? 'px-5 py-2.5 rounded-full text-sm font-semibold bg-[var(--tag-bg)] text-[var(--text-muted)] cursor-not-allowed transition-colors'
                : 'outlier-pill-button px-5 py-2.5 rounded-full text-sm font-bold bg-[var(--amber)] text-[#001A41] hover:bg-[var(--amber-hover)] transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--amber)]'
            }
          >
            {isSaving ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {saveError && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-[var(--danger-dim)] border border-[var(--danger-border)] text-sm text-[var(--danger)] font-medium"
        >
          {saveError}
        </div>
      )}

      {successToast && (
        <div
          role="status"
          aria-live="polite"
          className="p-4 rounded-xl bg-[var(--brand-green-dim)] border border-[var(--brand-green-border)] text-sm text-[var(--brand-green)] font-medium"
        >
          {successToast}
        </div>
      )}

      {/* Surface 1.1: Diagnostic Call-Out Fee Card */}
      <div className="p-6 rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-sm space-y-4 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <div className="text-lg font-bold text-[var(--text-main)]">
              Diagnostic Inspection / Call-Out Fee
            </div>
            <p className="mt-1 text-sm text-[var(--text-muted)] leading-relaxed">
              A flat fee charged for your initial on-site visit, inspection, and fault diagnosis.
            </p>
          </div>
          <span className="inline-flex items-center rounded-full bg-[var(--tag-bg)] border border-[var(--card-border)] px-3 py-1 text-xs font-semibold text-[var(--text-muted)]">
            ₦5,000 (Recommended standard)
          </span>
        </div>

        <div className="pt-2">
          <label
            htmlFor="diagnosticFeeInput"
            className="block text-sm font-semibold text-[var(--text-main)]"
          >
            Diagnostic Call-Out Fee
          </label>
          <div className="relative mt-2 rounded-lg shadow-sm max-w-xs">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-[var(--text-muted)] font-medium sm:text-sm">₦</span>
            </div>
            <input
              type="number"
              name="diagnosticFee"
              id="diagnosticFeeInput"
              min={MIN_DIAGNOSTIC_FEE_NGN}
              max={MAX_DIAGNOSTIC_FEE_NGN}
              step={RATE_STEP_NGN}
              value={catalog.diagnosticFeeNgn || ''}
              onChange={(e) => {
                const val = e.target.value === '' ? 0 : Number(e.target.value);
                handleUpdateDiagnosticFee(val);
              }}
              className="block w-full rounded-lg border border-[var(--card-border)] bg-[var(--bg)] pl-8 pr-4 py-2.5 text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:border-[var(--amber)] focus:ring-2 focus:ring-[var(--amber)] focus:outline-none sm:text-sm font-medium"
              aria-invalid={validationErrors.diagnosticFee ? 'true' : 'false'}
              aria-describedby={
                validationErrors.diagnosticFee ? 'diagnostic-fee-error' : undefined
              }
            />
          </div>
          {validationErrors.diagnosticFee && (
            <p
              id="diagnostic-fee-error"
              role="alert"
              className="mt-2 text-xs text-[var(--danger)] font-medium"
            >
              {validationErrors.diagnosticFee}
            </p>
          )}
        </div>
      </div>

      {/* Surface 1.2: Category Filter Tabs */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-[var(--text-main)]">
            Add Services from Canonical Trade Registry
          </h3>
          <p className="mt-0.5 text-sm text-[var(--text-muted)]">
            Choose your trade category to browse and add standard services to your profile.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Canonical Trade Categories"
          className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[var(--lead)]"
        >
          {TRADE_CATEGORIES.map((cat, index) => {
            const isSelected = activeCategoryId === cat.id;
            return (
              <button
                key={cat.id}
                role="tab"
                id={`tab-${cat.id}`}
                aria-selected={isSelected}
                aria-controls={`tabpanel-${cat.id}`}
                tabIndex={isSelected ? 0 : -1}
                onClick={() => setActiveCategoryId(cat.id)}
                onKeyDown={(e) => handleTabKeyDown(e, index)}
                className={
                  isSelected
                    ? 'whitespace-nowrap px-4 py-2 text-sm font-semibold rounded-full bg-[var(--text-main)] text-[var(--bg)] transition-colors'
                    : 'whitespace-nowrap px-4 py-2 text-sm font-medium rounded-full text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--card-hover)] transition-colors'
                }
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Canonical Service Offerings for Active Category */}
        <div
          role="tabpanel"
          id={`tabpanel-${activeCategoryId}`}
          aria-labelledby={`tab-${activeCategoryId}`}
          className="pt-2"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentCategoryServices.map((service) => {
              const isAdded = catalog.services.some(
                (s) => s.serviceId === service.serviceId
              );
              return (
                <div
                  key={service.serviceId}
                  className="p-5 rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] flex flex-col justify-between shadow-sm transition-all"
                >
                  <div>
                    <h4 className="text-sm font-semibold text-[var(--text-main)]">
                      {service.serviceName}
                    </h4>
                    <p className="mt-1 text-xs text-[var(--text-muted)] font-medium">
                      Baseline: ₦{service.defaultRateNgn.toLocaleString()} / hr
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[var(--card-border)] flex items-center justify-between">
                    <button
                      type="button"
                      disabled={isAdded}
                      aria-label={
                        isAdded
                          ? `Added ${service.serviceName}`
                          : `Add ${service.serviceName}`
                      }
                      onClick={() => handleAddService(service.serviceId)}
                      className={
                        isAdded
                          ? 'px-3.5 py-1.5 text-xs font-semibold rounded-full bg-[var(--tag-bg)] text-[var(--text-muted)] cursor-not-allowed'
                          : 'outlier-pill-button px-3.5 py-1.5 text-xs font-bold rounded-full bg-[var(--amber)] text-[#001A41] hover:bg-[var(--amber-hover)] transition-all shadow-xs'
                      }
                    >
                      {isAdded ? 'Added' : `Add ${service.serviceName}`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Surface 1.3: Configured Service Cards & Rates */}
      <div className="space-y-4 pt-4">
        <div>
          <h3 className="text-lg font-bold text-[var(--text-main)]">
            Configured Services & Labor Rates
          </h3>
          <p className="mt-0.5 text-sm text-[var(--text-muted)]">
            Manage your hourly labor rates and service statuses.
          </p>
        </div>

        {catalog.services.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-dashed border-[var(--card-border)] bg-[var(--bg)]">
            <h4 className="text-base font-semibold text-[var(--text-main)]">
              No services configured yet
            </h4>
            <p className="mt-1 text-sm text-[var(--text-muted)] max-w-md mx-auto">
              Select at least one trade service above to make your BrainWorker profile eligible for customer jobs.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {catalog.services.map((item) => (
              <div
                key={item.serviceId}
                data-testid={`configured-service-card-${item.serviceId}`}
                className="p-5 rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-sm space-y-4 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h4 className="text-base font-semibold text-[var(--text-main)]">
                      {item.serviceName}
                    </h4>
                    <span className="text-xs text-[var(--text-muted)] font-medium">
                      {TRADE_CATEGORIES.find((c) => c.id === item.categoryId)?.name ??
                        item.categoryId}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={
                        item.status === 'ACTIVE'
                          ? 'inline-flex items-center rounded-full bg-[var(--brand-green-dim)] border border-[var(--brand-green-border)] px-2.5 py-0.5 text-xs font-semibold text-[var(--brand-green)]'
                          : 'inline-flex items-center rounded-full bg-[var(--tag-bg)] border border-[var(--card-border)] px-2.5 py-0.5 text-xs font-semibold text-[var(--text-muted)]'
                      }
                    >
                      {item.status}
                    </span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={item.status === 'ACTIVE'}
                      aria-label={`Toggle status for ${item.serviceName}`}
                      onClick={() => handleToggleServiceStatus(item.serviceId)}
                      className={
                        item.status === 'ACTIVE'
                          ? 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-[var(--amber)] transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--amber)] focus:ring-offset-2'
                          : 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-[var(--rule)] transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--amber)] focus:ring-offset-2'
                      }
                    >
                      <span
                        className={
                          item.status === 'ACTIVE'
                            ? 'translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[var(--card-bg)] shadow ring-0 transition duration-200 ease-in-out'
                            : 'translate-x-0 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[var(--card-bg)] shadow ring-0 transition duration-200 ease-in-out'
                        }
                      />
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-[var(--card-border)] flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div className="flex-1 max-w-xs">
                    <label
                      htmlFor={`rate-input-${item.serviceId}`}
                      className="block text-xs font-medium text-[var(--text-muted)]"
                    >
                      Hourly rate for {item.serviceName}
                    </label>
                    <div className="relative mt-1 rounded-md shadow-sm">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-[var(--text-muted)] font-medium sm:text-sm">₦</span>
                      </div>
                      <input
                        type="number"
                        id={`rate-input-${item.serviceId}`}
                        min={MIN_HOURLY_RATE_NGN}
                        max={MAX_HOURLY_RATE_NGN}
                        step={RATE_STEP_NGN}
                        value={item.hourlyRateNgn || ''}
                        onChange={(e) => {
                          const val =
                            e.target.value === '' ? 0 : Number(e.target.value);
                          handleUpdateServiceRate(item.serviceId, val);
                        }}
                        className="block w-full rounded-lg border border-[var(--card-border)] bg-[var(--bg)] pl-8 pr-4 py-2 text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:border-[var(--amber)] focus:ring-2 focus:ring-[var(--amber)] focus:outline-none sm:text-sm font-medium"
                        aria-invalid={
                          validationErrors[`service_rate_${item.serviceId}`]
                            ? 'true'
                            : 'false'
                        }
                        aria-describedby={
                          validationErrors[`service_rate_${item.serviceId}`]
                            ? `rate-error-${item.serviceId}`
                            : undefined
                        }
                      />
                    </div>
                    {validationErrors[`service_rate_${item.serviceId}`] && (
                      <p
                        id={`rate-error-${item.serviceId}`}
                        role="alert"
                        className="mt-1 text-xs text-[var(--danger)] font-medium"
                      >
                        {validationErrors[`service_rate_${item.serviceId}`]}
                      </p>
                    )}
                  </div>

                  <div>
                    {confirmRemoveServiceId === item.serviceId ? (
                      <div
                        role="alert"
                        aria-live="polite"
                        className="flex items-center gap-2 bg-[var(--danger-dim)] p-2.5 rounded-xl border border-[var(--danger-border)] shadow-sm"
                      >
                        <span className="text-xs font-semibold text-[var(--danger)]">
                          Remove this service?
                        </span>
                        <button
                          type="button"
                          onClick={() => setConfirmRemoveServiceId(null)}
                          className="px-3 py-1.5 text-xs font-medium rounded-md bg-[var(--card-bg)] text-[var(--text-muted)] border border-[var(--card-border)] hover:bg-[var(--bg)] transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handleRemoveService(item.serviceId);
                            setConfirmRemoveServiceId(null);
                          }}
                          className="px-3 py-1.5 text-xs font-semibold rounded-md bg-[var(--danger)] text-white hover:opacity-90 transition-colors shadow-sm"
                        >
                          Confirm Remove
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        aria-label={`Remove ${item.serviceName}`}
                        onClick={() => setConfirmRemoveServiceId(item.serviceId)}
                        className="text-xs font-semibold text-[var(--danger)] hover:text-[var(--danger)] px-3 py-1.5 rounded-md hover:bg-[var(--danger-dim)] transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
