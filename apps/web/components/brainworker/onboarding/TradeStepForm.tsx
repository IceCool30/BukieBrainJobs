// apps/web/components/brainworker/onboarding/TradeStepForm.tsx
// Phase 5 GREEN: Step 2 Trade & Coverage Form Component
// Authoritative References:
// - docs/specs/BW-001-architecture-contract.md (Section 2.3)
// - docs/specs/BW-001-ux-design-specification.md (Section 3.2.3)
// - docs/specs/BW-001-test-first-implementation-plan.md (Suite 6: TRD-001 to TRD-008)

'use client';

import React, { useState, useId, useMemo } from 'react';
import {
  Wrench,
  Flame,
  Droplets,
  Zap,
  Hammer,
  Paintbrush,
  Layers,
  Sparkles,
  Plus,
  X,
  ArrowLeft,
  Check,
} from 'lucide-react';
import type {
  OnboardingTradeData,
  TradeExperienceLevel,
} from '../../../lib/brainworker/types';

export interface TradeStepFormProps {
  initialData?: Partial<OnboardingTradeData> | null | undefined;
  onSave: (data: OnboardingTradeData) => void | Promise<void>;
  onBack: () => void;
  isSubmitting?: boolean | undefined;
  className?: string | undefined;
}

interface TradeCategoryOption {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const CANONICAL_TRADE_CATEGORIES: TradeCategoryOption[] = [
  {
    key: 'generator',
    label: 'Generator Repair & Maintenance',
    icon: Zap,
    description: 'Diesel & petrol generators, servicing, AVR, ATS panels',
  },
  {
    key: 'ac',
    label: 'Air Conditioning & Refrigeration',
    icon: Sparkles,
    description: 'Inverter ACs, split units, gas recharging, chillers',
  },
  {
    key: 'plumbing',
    label: 'Plumbing & Pipe Fitting',
    icon: Droplets,
    description: 'PPR pipe installation, boreholes, water tanks, drainage',
  },
  {
    key: 'electrical',
    label: 'Electrical Installation & Inverters',
    icon: Flame,
    description: 'Solar power, inverters, domestic wiring, DB boards',
  },
  {
    key: 'carpentry',
    label: 'Carpentry & Furniture Making',
    icon: Hammer,
    description: 'Roofing, kitchen cabinets, doors, furniture restoration',
  },
  {
    key: 'painting',
    label: 'Painting & Wall Finishing',
    icon: Paintbrush,
    description: 'Screeding, interior & exterior emulsion, POP detailing',
  },
  {
    key: 'masonry',
    label: 'Masonry, Tiling & Bricklaying',
    icon: Layers,
    description: 'Porcelain tiling, block work, interlocking, structural plaster',
  },
  {
    key: 'welding',
    label: 'Welding & Metal Fabrication',
    icon: Wrench,
    description: 'Burglaries, iron gates, structural steel, stainless rails',
  },
];

interface ExperienceTierOption {
  key: TradeExperienceLevel;
  title: string;
  range: string;
  description: string;
}

const EXPERIENCE_TIERS: ExperienceTierOption[] = [
  {
    key: 'APPRENTICE_INTERMEDIATE',
    title: 'Apprentice / Intermediate',
    range: '1–3 years',
    description: 'Practical training complete; works under light supervision on basic repairs',
  },
  {
    key: 'JOURNEYMAN_EXPERIENCED',
    title: 'Journeyman / Experienced',
    range: '4–7 years',
    description: 'Independent field practitioner; diagnoses complex faults and completes installs',
  },
  {
    key: 'MASTER_CRAFTSMAN',
    title: 'Master Craftsman',
    range: '8+ years',
    description: 'Foreman or shop owner; leads teams, signs off on safety, trains apprentices',
  },
];

const CANONICAL_COVERAGE_CITIES = [
  'Lagos',
  'Abuja (FCT)',
  'Port Harcourt',
  'Ibadan',
  'Benin City',
  'Enugu',
  'Kano',
] as const;

export function TradeStepForm({
  initialData,
  onSave,
  onBack,
  isSubmitting = false,
  className = '',
}: TradeStepFormProps): React.ReactElement {
  const formId = useId();

  // State
  const [primaryCategory, setPrimaryCategory] = useState<string>(
    initialData?.primaryCategory || ''
  );
  const [subSpecialties, setSubSpecialties] = useState<string[]>(
    initialData?.subSpecialties || []
  );
  const [tagInput, setTagInput] = useState<string>('');
  const [experienceLevel, setExperienceLevel] =
    useState<TradeExperienceLevel | null>(
      initialData?.experienceLevel || null
    );
  const [yearsInTrade, setYearsInTrade] = useState<string>(
    initialData?.yearsInTrade ? String(initialData.yearsInTrade) : ''
  );
  const [coverageCities, setCoverageCities] = useState<string[]>(
    initialData?.coverageCities || []
  );

  // Field Touched Tracking
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const markTouched = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Validation
  const yearsNumber = Number(yearsInTrade);
  const isYearsValid =
    Boolean(yearsInTrade.trim()) &&
    Number.isInteger(yearsNumber) &&
    yearsNumber >= 1 &&
    yearsNumber <= 50;

  const yearsError = useMemo(() => {
    if (!touched.yearsInTrade) return null;
    if (!yearsInTrade.trim()) return 'Years in trade is required';
    if (!isYearsValid) return 'Years in trade must be between 1 and 50';
    return null;
  }, [yearsInTrade, isYearsValid, touched.yearsInTrade]);

  const isCitiesValid = coverageCities.length >= 1;
  const citiesError =
    touched.coverageCities && !isCitiesValid
      ? 'At least one coverage city is required'
      : null;

  const isFormValid = useMemo(() => {
    return (
      Boolean(primaryCategory) &&
      Boolean(experienceLevel) &&
      isYearsValid &&
      isCitiesValid
    );
  }, [primaryCategory, experienceLevel, isYearsValid, isCitiesValid]);

  // Handlers
  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (!trimmed || subSpecialties.length >= 5) return;
    if (!subSpecialties.includes(trimmed)) {
      setSubSpecialties((prev) => [...prev, trimmed]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setSubSpecialties((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const handleCityToggle = (cityName: string) => {
    markTouched('coverageCities');
    setCoverageCities((prev) =>
      prev.includes(cityName)
        ? prev.filter((c) => c !== cityName)
        : [...prev, cityName]
    );
  };

  const handleSelectAllCities = () => {
    markTouched('coverageCities');
    setCoverageCities([...CANONICAL_COVERAGE_CITIES]);
  };

  const handleClearCities = () => {
    markTouched('coverageCities');
    setCoverageCities([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || !experienceLevel || isSubmitting) return;

    const data: OnboardingTradeData = {
      primaryCategory,
      subSpecialties,
      experienceLevel,
      yearsInTrade: yearsNumber,
      coverageCities,
    };

    onSave(data);
  };

  return (
    <form
      id={formId}
      onSubmit={handleSubmit}
      noValidate
      className={`w-full max-w-4xl mx-auto space-y-10 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 sm:p-10 shadow-xs transition-colors ${className}`}
    >
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-main)]">
          Step 2: Trade & Coverage Profile
        </h1>
        <p className="mt-2 text-sm text-[var(--text-muted)] leading-relaxed">
          Configure your primary trade specialty, practical experience tier, and the Nigerian cities where you accept jobs.
        </p>
      </div>

      {/* 1. Primary Trade Category Grid */}
      <div className="space-y-4">
        <div>
          <span className="block text-sm font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Primary Trade Category <span className="text-[var(--danger)]">*</span>
          </span>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Select the one core trade you are certified or experienced in.
          </p>
        </div>

        <div
          role="radiogroup"
          aria-label="Primary Trade Category"
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          {CANONICAL_TRADE_CATEGORIES.map((cat) => {
            const isSelected = primaryCategory === cat.key;
            const IconComponent = cat.icon;

            return (
              <div
                key={cat.key}
                role="radio"
                aria-checked={isSelected ? 'true' : 'false'}
                aria-label={cat.label}
                tabIndex={0}
                onClick={() => setPrimaryCategory(cat.key)}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    setPrimaryCategory(cat.key);
                  }
                }}
                className={`flex items-start gap-3.5 p-4 rounded-xl border text-left cursor-pointer transition focus:outline-none focus:ring-2 focus:ring-[var(--amber-dim)] ${
                  isSelected
                    ? 'border-[var(--text-main)] bg-[var(--tag-bg)] ring-1 ring-[var(--text-main)]'
                    : 'border-[var(--card-border)] bg-[var(--card-bg)] hover:bg-[var(--bg)]'
                }`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
                    isSelected
                      ? 'bg-[var(--text-main)] text-[var(--bg)]'
                      : 'bg-[var(--tag-bg)] text-[var(--text-muted)]'
                  }`}
                >
                  <IconComponent className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-[var(--text-main)] leading-snug">
                    {cat.label}
                  </p>
                  <p className="mt-1 text-xs text-[var(--text-muted)] line-clamp-2">
                    {cat.description}
                  </p>
                </div>
                <div
                  className={`h-5 w-5 shrink-0 rounded-full border flex items-center justify-center transition mt-0.5 ${
                    isSelected
                      ? 'border-[var(--text-main)] bg-[var(--text-main)]'
                      : 'border-[var(--card-border)] bg-[var(--card-bg)]'
                  }`}
                >
                  {isSelected && <div className="h-2 w-2 rounded-full bg-[var(--card-bg)]" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Sub-Specialties (Tags) Section */}
      <div className="space-y-4 pt-2 border-t border-[var(--lead)]">
        <div>
          <label
            htmlFor={`${formId}-sub-specialties`}
            className="block text-sm font-bold uppercase tracking-wider text-[var(--text-muted)]"
          >
            Sub-Specialties
          </label>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Add up to 5 specific skills or equipment specialties (e.g. Diesel Generators, AVR, Soundproof Enclosures).
          </p>
        </div>

        <div className="flex items-center gap-2 max-w-lg">
          <input
            id={`${formId}-sub-specialties`}
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag();
              }
            }}
            placeholder="e.g. Diesel Generators"
            disabled={subSpecialties.length >= 5}
            className="flex-1 rounded-lg border border-[var(--card-border)] bg-[var(--bg)] px-3.5 py-2.5 text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)] transition focus:outline-none focus:ring-2 focus:ring-[var(--amber-dim)] disabled:bg-[var(--tag-bg)] disabled:cursor-not-allowed"
          />
          <button
            type="button"
            onClick={handleAddTag}
            disabled={!tagInput.trim() || subSpecialties.length >= 5}
            aria-label="Add Tag"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--amber)] px-4 py-2 text-xs font-bold text-[#001A41] shadow-xs transition-colors hover:bg-[var(--amber-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4" />
            <span>Add</span>
          </button>
        </div>

        {/* Rendered Tag Chips */}
        {subSpecialties.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {subSpecialties.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 rounded-full bg-[var(--tag-bg)] px-3.5 py-1.5 text-xs font-medium text-[var(--text-main)] border border-[var(--card-border)]"
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  aria-label={`Remove ${tag}`}
                  className="rounded-md p-0.5 text-[var(--text-muted)] hover:bg-[var(--card-hover)] hover:text-[var(--text-main)] focus:outline-none"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 3. Experience Tier Cards */}
      <div className="space-y-4 pt-2 border-t border-[var(--card-border)]">
        <div>
          <span className="block text-sm font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Experience Tier <span className="text-[var(--danger)]">*</span>
          </span>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Select the tier that best matches your hands-on field experience.
          </p>
        </div>

        <div
          role="radiogroup"
          aria-label="Experience Tier"
          className="grid grid-cols-1 sm:grid-cols-3 gap-3"
        >
          {EXPERIENCE_TIERS.map((tier) => {
            const isSelected = experienceLevel === tier.key;

            return (
              <div
                key={tier.key}
                role="radio"
                aria-checked={isSelected ? 'true' : 'false'}
                aria-label={tier.title}
                tabIndex={0}
                onClick={() => setExperienceLevel(tier.key)}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    setExperienceLevel(tier.key);
                  }
                }}
                className={`p-4 rounded-xl border text-left cursor-pointer transition focus:outline-none focus:ring-2 focus:ring-[var(--amber-dim)] ${
                  isSelected
                    ? 'border-[var(--text-main)] bg-[var(--tag-bg)] ring-1 ring-[var(--text-main)]'
                    : 'border-[var(--card-border)] bg-[var(--card-bg)] hover:bg-[var(--bg)]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[var(--text-main)] bg-[var(--tag-bg)] rounded-full px-2.5 py-0.5">
                    {tier.range}
                  </span>
                  <div
                    className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                      isSelected
                        ? 'border-[var(--text-main)] bg-[var(--text-main)]'
                        : 'border-[var(--card-border)] bg-[var(--card-bg)]'
                    }`}
                  >
                    {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-[var(--card-bg)]" />}
                  </div>
                </div>
                <p className="text-sm font-bold text-[var(--text-main)] leading-snug">
                  {tier.title}
                </p>
                <p className="mt-1 text-xs text-[var(--text-muted)] leading-relaxed">
                  {tier.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Years in Trade Section */}
      <div className="space-y-4 pt-2 border-t border-[var(--lead)]">
        <div className="max-w-xs">
          <label
            htmlFor={`${formId}-years-in-trade`}
            className="block text-xs font-semibold text-[var(--text-muted)] mb-1"
          >
            Years in Trade <span className="text-[var(--danger)]">*</span>
          </label>
          <input
            id={`${formId}-years-in-trade`}
            type="number"
            min={1}
            max={50}
            value={yearsInTrade}
            onChange={(e) => setYearsInTrade(e.target.value)}
            onFocus={() => markTouched('yearsInTrade')}
            onBlur={() => markTouched('yearsInTrade')}
            placeholder="e.g. 5"
            className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-[var(--text-main)] bg-[var(--bg)] placeholder:text-[var(--text-muted)] transition focus:outline-none focus:ring-2 ${
              yearsError
                ? 'border-[var(--danger-border)] focus:ring-red-400 bg-[var(--danger-dim)]'
                : 'border-[var(--card-border)] focus:border-[var(--amber)] focus:ring-[var(--amber-dim)]'
            }`}
          />
          {yearsError && (
            <p role="alert" className="mt-1 text-xs text-[var(--danger)] font-medium">
              {yearsError}
            </p>
          )}
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Total verified practical working years (1 to 50).
          </p>
        </div>
      </div>

      {/* 5. Active Coverage Cities Section */}
      <div className="space-y-4 pt-2 border-t border-[var(--card-border)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="block text-sm font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Active Coverage Cities <span className="text-[var(--danger)]">*</span>
            </span>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Select all Nigerian metropolitan areas where you are available to take jobs.
            </p>
          </div>

          {/* Quick Select All / Clear All utilities */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSelectAllCities}
              className="text-xs font-semibold text-[var(--text-main)] hover:underline px-2 py-1"
            >
              Select All
            </button>
            <span className="text-[var(--card-border)]">|</span>
            <button
              type="button"
              onClick={handleClearCities}
              className="text-xs font-semibold text-[var(--text-muted)] hover:underline px-2 py-1"
            >
              Clear All
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {CANONICAL_COVERAGE_CITIES.map((cityName) => {
            const isChecked = coverageCities.includes(cityName);

            return (
              <label
                key={cityName}
                className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-full border text-xs font-semibold cursor-pointer transition select-none ${
                  isChecked
                    ? 'border-[var(--text-main)] bg-[var(--text-main)] text-[var(--bg)] shadow-xs'
                    : 'border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--text-main)] hover:bg-[var(--card-hover)]'
                }`}
              >
                <input
                  type="checkbox"
                  name="coverageCities"
                  value={cityName}
                  checked={isChecked}
                  onChange={() => handleCityToggle(cityName)}
                  className="sr-only"
                />
                <div
                  className={`h-4 w-4 rounded-full flex items-center justify-center transition ${
                    isChecked
                      ? 'bg-[var(--card-bg)] text-[var(--text-main)]'
                      : 'border border-[var(--card-border)] bg-[var(--card-bg)]'
                  }`}
                >
                  {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                </div>
                <span>{cityName}</span>
              </label>
            );
          })}
        </div>

        {citiesError && (
          <p role="alert" className="mt-1 text-xs text-[var(--danger)] font-medium">
            {citiesError}
          </p>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-6 border-t border-[var(--card-border)] flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] px-5 py-2.5 text-sm font-semibold text-[var(--text-main)] shadow-xs transition hover:bg-[var(--card-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)]"
        >
          <ArrowLeft className="h-4 w-4 text-[var(--text-muted)]" />
          <span>Back to Identity</span>
        </button>

        <button
          type="submit"
          disabled={!isFormValid || isSubmitting}
          className={`outlier-pill-button inline-flex items-center justify-center rounded-full bg-[var(--amber)] px-6 py-3 text-sm font-bold text-[#001A41] shadow-xs transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] hover:bg-[var(--amber-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)] focus-visible:ring-offset-2 ${
            !isFormValid || isSubmitting
              ? 'opacity-50 cursor-not-allowed'
              : 'cursor-pointer'
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#001A41] border-t-transparent" />
              <span>Saving...</span>
            </span>
          ) : (
            <span>Save & Continue to Credentials</span>
          )}
        </button>
      </div>
    </form>
  );
}
