'use client';

import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Info,
  MapPin,
  Search,
  X,
} from 'lucide-react';
import {
  NIGERIAN_LOCATIONS,
  SERVICE_CATEGORIES,
  ServiceCategory,
} from '../../lib/mock/homepage-data';
import {
  MAX_SEARCH_QUERY_LENGTH,
  buildServiceDetailUrl,
  buildServicesUrl,
  capSearchQuery,
  createDebouncedScheduler,
  filterServices,
  normalizeCategory,
  normalizeSearchQuery,
  validateCity,
} from '../../lib/services';
import Navbar from '../../components/Navbar';
import {
  DispatchBox,
  RequisitionIndex,
  VerificationProtocol,
} from '../../components/RequisitionIndex';
import { toRequisitionIndex } from '../../lib/requisitions';

const TASK_LABELS: Record<string, string> = {
  generator: 'Generator',
  ac: 'AC repair',
  plumbing: 'Plumbing',
  electrical: 'Electrical',
  cleaning: 'Cleaning',
  carpentry: 'Carpentry',
  'tv-mounting': 'TV mounting',
  moving: 'Moving',
};

function ServicesDirectory() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const rawQ = normalizeSearchQuery(searchParams.get("q"));
  const rawCategory = searchParams.get("category");
  const rawCity = searchParams.get("city");

  const normalizedCategory = useMemo(() => normalizeCategory(rawCategory), [rawCategory]);
  const validCity = useMemo(() => validateCity(rawCity), [rawCity]);

  const [searchQuery, setSearchQuery] = useState(rawQ);
  const [selectedCategory, setSelectedCategory] = useState(normalizedCategory || "All");
  const [selectedCity, setSelectedCity] = useState<string | undefined>(validCity);

  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [dismissedCityNotice, setDismissedCityNotice] = useState(false);
  const [dismissedCategoryNotice, setDismissedCategoryNotice] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const cityTriggerRef = useRef<HTMLButtonElement>(null);
  const scheduler = useMemo(() => createDebouncedScheduler(), []);
  const isNavigatingRef = useRef(false);

  // Synchronize state on browser Back / Forward popstate
  useEffect(() => {
    setSearchQuery(rawQ);
  }, [rawQ]);

  useEffect(() => {
    setSelectedCategory(normalizedCategory || "All");
  }, [normalizedCategory]);

  useEffect(() => {
    setSelectedCity(validCity);
  }, [validCity]);

  // Ensure deep-linked search query is normalized (whitespace-only removed, trimmed, capped at 100 chars)
  useEffect(() => {
    const unconstrainedQ = searchParams.get("q");
    if (unconstrainedQ !== null) {
      const trimmedQ = unconstrainedQ.trim();
      if (!trimmedQ) {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("q");
        const newQuery = params.toString();
        router.replace(newQuery ? `/services?${newQuery}` : "/services", { scroll: false });
      } else if (unconstrainedQ !== rawQ) {
        const params = new URLSearchParams(searchParams.toString());
        params.set("q", rawQ);
        router.replace(`/services?${params.toString()}`, { scroll: false });
      }
    }
  }, [searchParams, rawQ, router]);

  // Close city dropdown on Escape key and return focus to trigger button
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && cityDropdownOpen) {
        event.preventDefault();
        setCityDropdownOpen(false);
        cityTriggerRef.current?.focus();
      }
    }
    if (cityDropdownOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [cityDropdownOpen]);

  // Cancel pending search debounce on unmount
  useEffect(() => {
    return () => {
      scheduler.cancel();
    };
  }, [scheduler]);

  // Handle outside click for city dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setCityDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 300ms Debounced URL synchronization for search input
  const handleSearchChange = (value: string) => {
    const capped = capSearchQuery(value);
    setSearchQuery(capped);
    scheduler.schedule(() => {
      if (isNavigatingRef.current) return;
      const url = buildServicesUrl({
        q: capped,
        category: selectedCategory,
        city: selectedCity,
      });
      router.replace(url, { scroll: false });
    }, 300);
  };

  // Immediate clear of search input
  const handleClearSearch = () => {
    scheduler.cancel();
    setSearchQuery("");
    const url = buildServicesUrl({
      q: "",
      category: selectedCategory,
      city: selectedCity,
    });
    router.replace(url, { scroll: false });
  };

  // Blur handler to clean whitespace-only search queries
  const handleSearchBlur = () => {
    if (searchQuery.trim() === "" && searchQuery !== "") {
      setSearchQuery("");
      const url = buildServicesUrl({
        q: "",
        category: selectedCategory,
        city: selectedCity,
      });
      router.replace(url, { scroll: false });
    }
  };

  // Immediate category filter change (preserves discrete filter state in history)
  const handleSelectCategory = (categoryId: string) => {
    if (categoryId === selectedCategory) return;
    scheduler.cancel();
    setSelectedCategory(categoryId);
    const url = buildServicesUrl({
      q: searchQuery,
      category: categoryId,
      city: selectedCity,
    });
    router.push(url, { scroll: false });
  };

  // Immediate city selection change (preserves discrete filter state in history)
  const handleSelectCity = (cityName: string | undefined) => {
    if (cityName === selectedCity) {
      setCityDropdownOpen(false);
      return;
    }
    scheduler.cancel();
    setSelectedCity(cityName);
    setCityDropdownOpen(false);
    const url = buildServicesUrl({
      q: searchQuery,
      category: selectedCategory,
      city: cityName,
    });
    router.push(url, { scroll: false });
  };

  // Reset all filters (preserves reset state in history)
  const handleResetFilters = () => {
    scheduler.cancel();
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedCity(undefined);
    setDismissedCityNotice(true);
    setDismissedCategoryNotice(true);
    router.push("/services", { scroll: false });
  };

  // Filtered categories
  const filteredCategories = useMemo(
    () =>
      filterServices(SERVICE_CATEGORIES, {
        category: selectedCategory,
        query: searchQuery,
      }),
    [selectedCategory, searchQuery],
  );

  // Requisition Index rows derived deterministically from the catalog
  const requisitionEntries = useMemo(
    () => toRequisitionIndex(filteredCategories, SERVICE_CATEGORIES),
    [filteredCategories],
  );

  const resultLabel = `${filteredCategories.length} ${
    filteredCategories.length === 1 ? "service category" : "service categories"
  } shown`;

  // Navigate to service detail with return context
  const reviewCategory = (category: ServiceCategory) => {
    isNavigatingRef.current = true;
    scheduler.cancel();
    const detailUrl = buildServiceDetailUrl(category.id, {
      city: selectedCity,
      returnCategory: selectedCategory,
      returnQ: searchQuery,
    });
    router.push(detailUrl);
  };

  // Spec inspector drawer action: resolve the catalog entry, then reuse detail flow
  const reviewEntry = (categoryId: string) => {
    const category = SERVICE_CATEGORIES.find((item) => item.id === categoryId);
    if (category) reviewCategory(category);
  };

  const activeCities = NIGERIAN_LOCATIONS.filter((loc) => loc.status === "active");
  const showInvalidCityNotice = Boolean(rawCity && !validCity && !dismissedCityNotice);
  const showInvalidCategoryNotice = Boolean(
    rawCategory && !normalizedCategory && !dismissedCategoryNotice,
  );

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[var(--bg)] pt-[var(--header-height)]">
      {/* Main Content Area */}
      <section className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Navigation Breadcrumb / Back link */}
        <div className="mb-4 sm:mb-6">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-2 text-xs font-semibold text-[var(--text-muted)] transition-colors hover:text-[var(--text-main)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#296A4B] rounded-lg"
          >
            <ArrowLeft className="h-4 w-4 text-[var(--brand-green)]" aria-hidden="true" />
            Back to home
          </Link>
        </div>
        {/* Informational Notice: Invalid City */}
        {showInvalidCityNotice && (
          <div
            role="status"
            className="mb-6 flex items-start justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-slate-800"
          >
            <div className="flex items-start gap-3">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-[#296A4B]" aria-hidden="true" />
              <div>
                <p className="font-semibold text-[#001A41]">Location not active</p>
                <p className="mt-1 text-xs leading-5 text-slate-600">
                  We currently operate in 7 active Nigerian cities. Location &quot;{rawCity}&quot; is
                  not active yet, so we&apos;re displaying services available nationwide.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setDismissedCityNotice(true)}
              aria-label="Dismiss notice"
              className="inline-flex h-12 w-12 min-h-[48px] min-w-[48px] shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-blue-100 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#296A4B]"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Informational Notice: Invalid Category */}
        {showInvalidCategoryNotice && (
          <div
            role="status"
            className="mb-6 flex items-start justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-slate-800"
          >
            <div className="flex items-start gap-3">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-[#296A4B]" aria-hidden="true" />
              <div>
                <p className="font-semibold text-[#001A41]">Category not recognized</p>
                <p className="mt-1 text-xs leading-5 text-slate-600">
                  The requested category &quot;{rawCategory}&quot; was not recognized. Showing all
                  available service categories.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setDismissedCategoryNotice(true)}
              aria-label="Dismiss notice"
              className="inline-flex h-12 w-12 min-h-[48px] min-w-[48px] shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-blue-100 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#296A4B]"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Controls & Filter Bar */}
        <div className="rounded-2xl border border-[var(--lead)] bg-[var(--card-bg)] p-4 shadow-[0_12px_30px_rgba(0,26,65,0.05)] sm:p-5">
          <div className="flex flex-col gap-1">
            <h1 className="font-display text-xl font-bold tracking-tight text-[var(--text-main)] sm:text-2xl">
              Browse the requisition index
            </h1>
            <p className="text-xs text-[var(--text-muted)] sm:text-sm" role="status" aria-live="polite">
              {resultLabel}
              {selectedCity ? ` in ${selectedCity}` : ''}
            </p>
          </div>

          {/* Search bar & City toggle group */}
          <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:items-center">
            {/* Search Input */}
            <form className="relative flex-1" onSubmit={(event) => event.preventDefault()}>
              <label htmlFor="service-directory-search" className="sr-only">
                Search services
              </label>
              <div className="relative">
                <Search
                  className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id="service-directory-search"
                  type="search"
                  value={searchQuery}
                  onChange={(event) => handleSearchChange(event.target.value)}
                  onBlur={handleSearchBlur}
                  maxLength={MAX_SEARCH_QUERY_LENGTH}
                  placeholder="Search by service, trade, or job"
                  className="h-11 w-full rounded-xl border border-[var(--lead)] bg-[var(--tag-bg)] pl-10 pr-10 text-xs font-medium text-[var(--text-main)] placeholder:text-[var(--text-muted)] shadow-xs outline-none transition focus:border-[#296A4B] focus:bg-[var(--card-bg)] focus:ring-2 focus:ring-[#ABEEC8] sm:text-sm"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    aria-label="Clear search"
                    className="absolute right-1 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[#ABEEC8]"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}
              </div>
            </form>

            {/* City Dropdown Filter */}
            <div
              className="relative self-start sm:self-auto"
              ref={dropdownRef}
              onKeyDown={(e) => {
                if (e.key === "Escape" && cityDropdownOpen) {
                  e.preventDefault();
                  e.stopPropagation();
                  setCityDropdownOpen(false);
                  cityTriggerRef.current?.focus();
                }
              }}
            >
              <button
                ref={cityTriggerRef}
                type="button"
                onClick={() => setCityDropdownOpen((prev) => !prev)}
                aria-haspopup="listbox"
                aria-expanded={cityDropdownOpen}
                aria-label={`Filter by city: currently ${selectedCity || "All cities"}`}
                className={`motion-press inline-flex min-h-11 items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#296A4B] ${
                  selectedCity
                    ? "border-[#296A4B] bg-[#EAF7EF] text-[#296A4B]"
                    : "border-[var(--lead)] bg-[var(--card-bg)] text-[var(--text-main)] hover:border-[var(--rule)]"
                }`}
              >
                <MapPin className="h-3.5 w-3.5 shrink-0 text-[#296A4B]" aria-hidden="true" />
                <span>{selectedCity ? selectedCity : "All cities"}</span>
                <ChevronDown className="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]" aria-hidden="true" />
              </button>

              {cityDropdownOpen && (
                <div
                  role="listbox"
                  aria-label="Active Nigerian cities"
                  className="absolute left-0 sm:left-auto sm:right-0 top-full z-40 mt-2 w-64 rounded-xl border border-[var(--lead)] bg-[var(--card-bg)] py-2 shadow-[0_16px_32px_rgba(0,26,65,0.14)]"
                >
                  <button
                    type="button"
                    role="option"
                    aria-selected={!selectedCity}
                    onClick={() => handleSelectCity(undefined)}
                    className={`flex min-h-11 min-h-[44px] w-full items-center justify-between px-4 py-2.5 text-left text-xs font-semibold transition-colors hover:bg-[var(--tag-bg)] ${
                      !selectedCity ? "bg-[var(--tag-bg)] text-[var(--text-main)] font-bold" : "text-[var(--text-main)]"
                    }`}
                  >
                    <span>All cities (Nationwide)</span>
                    {!selectedCity && <Check className="h-4 w-4 text-[#296A4B]" aria-hidden="true" />}
                  </button>

                  <div className="my-1 border-t border-[var(--lead)]" />

                  {activeCities.map((city) => {
                    const isSelected = selectedCity === city.name;
                    return (
                      <button
                        key={city.id}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => handleSelectCity(city.name)}
                        className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-xs font-semibold transition-colors hover:bg-[var(--tag-bg)] ${
                          isSelected ? "bg-[var(--tag-bg)] text-[var(--text-main)] font-bold" : "text-[var(--text-main)]"
                        }`}
                      >
                        <div>
                          <div>{city.name}</div>
                          <div className="text-[10px] font-normal text-[var(--text-muted)]">{city.state}</div>
                        </div>
                        {isSelected && <Check className="h-4 w-4 text-[#296A4B]" aria-hidden="true" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Active Filters Bar */}
          {(selectedCategory !== "All" || selectedCity || searchQuery) && (
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[var(--lead)] pt-3 text-xs">
              <span className="font-semibold text-[var(--text-muted)]">Active filters:</span>
              {selectedCategory !== "All" && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E5F6EB] px-3 py-1 font-semibold text-[#296A4B]">
                  {TASK_LABELS[selectedCategory] ?? selectedCategory}
                  <button
                    type="button"
                    onClick={() => handleSelectCategory("All")}
                    aria-label="Remove category filter"
                    className="hover:text-emerald-900 cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {selectedCity && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF7EF] px-3 py-1 font-semibold text-[#296A4B]">
                  <MapPin className="h-3 w-3" />
                  {selectedCity}
                  <button
                    type="button"
                    onClick={() => handleSelectCity(undefined)}
                    aria-label="Remove city filter"
                    className="hover:text-emerald-900 cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--tag-bg)] border border-[var(--lead)] px-3 py-1 font-semibold text-[var(--text-main)]">
                  &quot;{searchQuery}&quot;
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    aria-label="Remove search filter"
                    className="hover:text-[var(--text-main)] cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              <button
                type="button"
                onClick={handleResetFilters}
                className="ml-auto text-xs font-semibold text-[var(--brand-green)] hover:text-[#1F523A] underline cursor-pointer"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Requisition Index or Empty State */}
        {filteredCategories.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-[var(--lead)] bg-[var(--card-bg)] px-6 py-12 text-center shadow-sm">
            <h2 className="font-display text-xl font-bold text-[var(--text-main)]">
              No services match that search
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--text-muted)]">
              Try a broader service name, or reset the filters to browse every category.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="btn-action motion-press mt-5 inline-flex min-h-11 items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-green)] focus-visible:ring-offset-2"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="mt-8">
            <RequisitionIndex
              entries={requisitionEntries}
              city={selectedCity}
              onReviewDetails={reviewEntry}
            />
          </div>
        )}

        {/* Verification Protocol */}
        <div className="mt-10 sm:mt-14">
          <VerificationProtocol />
        </div>

        {/* Dispatch Callout */}
        <div className="mt-10 sm:mt-14">
          <DispatchBox />
        </div>

        {/* Trust Notice Aside */}
        <aside className="mt-10 flex flex-col gap-4 rounded-2xl border border-[var(--lead)] bg-[var(--card-bg)] p-5 shadow-[0_12px_30px_rgba(0,26,65,0.05)] sm:mt-14 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand-green)]">
              Before you continue
            </p>
            <h2 className="mt-2 font-display text-xl font-bold tracking-tight text-[var(--text-main)]">
              Get clear on the job details.
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-muted)]">
              Use the service details to prepare the scope, location, and budget for your booking review.
            </p>
          </div>
          <Link
            href="/guarantee"
            className="motion-press inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-[var(--text-main)] px-4 text-sm font-bold text-[var(--text-main)] transition-colors hover:bg-[var(--text-main)] hover:text-[var(--bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ABEEC8] focus-visible:ring-offset-2"
          >
            Read BukieGuarantee
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </aside>
      </section>
      </main>
    </>
  );
}

export default function ServicesPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[var(--bg)]" />}>
      <ServicesDirectory />
    </Suspense>
  );
}
