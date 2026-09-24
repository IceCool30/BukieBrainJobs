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
      className={`w-full max-w-4xl mx-auto space-y-10 bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm ${className}`}
    >
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#001A41]">
          Step 2: Trade & Coverage Profile
        </h2>
        <p className="mt-2 text-sm text-slate-500 leading-relaxed">
          Configure your primary trade specialty, practical experience tier, and the Nigerian cities where you accept jobs.
        </p>
      </div>

      {/* 1. Primary Trade Category Grid */}
      <div className="space-y-4">
        <div>
          <span className="block text-sm font-bold uppercase tracking-wider text-slate-700">
            Primary Trade Category <span className="text-red-500">*</span>
          </span>
          <p className="mt-1 text-xs text-slate-500">
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
                className={`flex items-start gap-3.5 p-4 rounded-2xl border text-left cursor-pointer transition focus:outline-none focus:ring-2 focus:ring-[#001A41] ${
                  isSelected
                    ? 'border-[#001A41] bg-blue-50/40 ring-1 ring-[#001A41]'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
                    isSelected
                      ? 'bg-[#001A41] text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <IconComponent className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900 leading-snug">
                    {cat.label}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                    {cat.description}
                  </p>
                </div>
                <div
                  className={`h-5 w-5 shrink-0 rounded-full border flex items-center justify-center transition mt-0.5 ${
                    isSelected
                      ? 'border-[#001A41] bg-[#001A41]'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Sub-Specialties (Tags) Section */}
      <div className="space-y-4 pt-2 border-t border-slate-100">
        <div>
          <label
            htmlFor={`${formId}-sub-specialties`}
            className="block text-sm font-bold uppercase tracking-wider text-slate-700"
          >
            Sub-Specialties
          </label>
          <p className="mt-1 text-xs text-slate-500">
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
            className="flex-1 rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 transition focus:outline-none focus:ring-2 focus:ring-[#001A41] disabled:bg-slate-50 disabled:cursor-not-allowed"
          />
          <button
            type="button"
            onClick={handleAddTag}
            disabled={!tagInput.trim() || subSpecialties.length >= 5}
            aria-label="Add Tag"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#001A41] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#002661] disabled:opacity-50 disabled:cursor-not-allowed"
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
                className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-800 border border-slate-200"
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  aria-label={`Remove ${tag}`}
                  className="rounded-full p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600 focus:outline-none"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 3. Experience Tier Cards */}
      <div className="space-y-4 pt-2 border-t border-slate-100">
        <div>
          <span className="block text-sm font-bold uppercase tracking-wider text-slate-700">
            Experience Tier <span className="text-red-500">*</span>
          </span>
          <p className="mt-1 text-xs text-slate-500">
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
                className={`p-4 rounded-2xl border text-left cursor-pointer transition focus:outline-none focus:ring-2 focus:ring-[#001A41] ${
                  isSelected
                    ? 'border-[#001A41] bg-blue-50/40 ring-1 ring-[#001A41]'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#001A41] bg-blue-100/60 rounded-md px-2 py-0.5">
                    {tier.range}
                  </span>
                  <div
                    className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                      isSelected
                        ? 'border-[#001A41] bg-[#001A41]'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </div>
                </div>
                <p className="text-sm font-bold text-slate-900 leading-snug">
                  {tier.title}
                </p>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                  {tier.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Years in Trade Section */}
      <div className="space-y-4 pt-2 border-t border-slate-100">
        <div className="max-w-xs">
          <label
            htmlFor={`${formId}-years-in-trade`}
            className="block text-xs font-semibold text-slate-700 mb-1"
          >
            Years in Trade <span className="text-red-500">*</span>
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
            className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-900 transition focus:outline-none focus:ring-2 ${
              yearsError
                ? 'border-red-300 focus:ring-red-400 bg-red-50/20'
                : 'border-slate-300 focus:ring-[#001A41]'
            }`}
          />
          {yearsError && (
            <p role="alert" className="mt-1 text-xs text-red-600 font-medium">
              {yearsError}
            </p>
          )}
          <p className="mt-1 text-xs text-slate-500">
            Total verified practical working years (1 to 50).
          </p>
        </div>
      </div>

      {/* 5. Active Coverage Cities Section */}
      <div className="space-y-4 pt-2 border-t border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="block text-sm font-bold uppercase tracking-wider text-slate-700">
              Active Coverage Cities <span className="text-red-500">*</span>
            </span>
            <p className="mt-1 text-xs text-slate-500">
              Select all Nigerian metropolitan areas where you are available to take jobs.
            </p>
          </div>

          {/* Quick Select All / Clear All utilities */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSelectAllCities}
              className="text-xs font-semibold text-[#001A41] hover:underline px-2 py-1"
            >
              Select All
            </button>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={handleClearCities}
              className="text-xs font-semibold text-slate-500 hover:underline px-2 py-1"
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
                className={`inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition select-none ${
                  isChecked
                    ? 'border-[#001A41] bg-[#001A41] text-white shadow-sm'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
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
                  className={`h-4 w-4 rounded flex items-center justify-center transition ${
                    isChecked
                      ? 'bg-white text-[#001A41]'
                      : 'border border-slate-300 bg-white'
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
          <p role="alert" className="mt-1 text-xs text-red-600 font-medium">
            {citiesError}
          </p>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#001A41]"
        >
          <ArrowLeft className="h-4 w-4 text-slate-500" />
          <span>Back to Identity</span>
        </button>

        <button
          type="submit"
          disabled={!isFormValid || isSubmitting}
          className={`inline-flex items-center justify-center rounded-xl bg-[#001A41] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#002661] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#001A41] focus-visible:ring-offset-2 ${
            !isFormValid || isSubmitting
              ? 'opacity-50 cursor-not-allowed'
              : 'cursor-pointer'
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
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
