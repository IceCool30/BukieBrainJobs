'use client';

import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
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
import ServiceTaskIcon from '../../components/ServiceTaskIcon';

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

function ServiceCard({
  category,
  onReview,
}: {
  category: ServiceCategory;
  onReview: () => void;
}) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_30px_rgba(0,26,65,0.06)] transition-all hover:shadow-[0_16px_36px_rgba(0,26,65,0.12)]">
      <div className="relative aspect-[5/3] overflow-hidden bg-slate-100">
        <Image
          src={category.photoUrl}
          alt={`Service photo for ${category.title}`}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#001A41]/60 via-transparent to-transparent" />
        <span className="absolute left-4 top-4 rounded-lg bg-white px-2.5 py-1 text-[11px] font-bold text-[#001A41] shadow-sm">
          From {category.startingPrice}
        </span>
        <span className="absolute right-4 top-4 rounded-md bg-[#001A41]/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#ABEEC8] backdrop-blur-sm">
          {category.group}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div>
          <h2 className="font-display text-lg font-bold tracking-tight text-[#001A41]">
            {category.title}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600 line-clamp-2">
            {category.description}
          </p>
        </div>

        <ul className="mt-5 space-y-2" aria-label={`Common ${category.title.toLowerCase()} jobs`}>
          {category.popularServices.map((service) => (
            <li key={service} className="flex items-center gap-2 text-xs font-medium text-slate-700">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#296A4B]" aria-hidden="true" />
              {service}
            </li>
          ))}
        </ul>

        <div className="mt-6 flex items-end justify-between gap-4 border-t border-slate-100 pt-4">
          <div>
            <span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Starting from
            </span>
            <span className="font-display text-lg font-extrabold text-[#001A41]">
              {category.startingPrice}
            </span>
          </div>
          <button
            type="button"
            onClick={onReview}
            className="motion-press inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#001A41] px-4 text-xs font-bold text-white transition-colors hover:bg-[#000F2D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ABEEC8] focus-visible:ring-offset-2"
          >
            Review details
            <ArrowRight className="h-4 w-4 text-[#ABEEC8]" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
}

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

  const activeCities = NIGERIAN_LOCATIONS.filter((loc) => loc.status === "active");
  const showInvalidCityNotice = Boolean(rawCity && !validCity && !dismissedCityNotice);
  const showInvalidCategoryNotice = Boolean(
    rawCategory && !normalizedCategory && !dismissedCategoryNotice,
  );

  return (
    <main className="min-h-screen bg-[#F8F9FF]">
      {/* Hero Section */}
      <section className="relative isolate min-h-[390px] overflow-hidden bg-[#001A41] text-white sm:min-h-[420px] lg:min-h-[432px]">
        <div className="absolute inset-y-0 right-0 w-full sm:w-[64%] lg:w-[58%]">
          <Image
            src="/images/service-electrical.jpg"
            alt=""
            fill
            priority
            sizes="(min-width: 1024px) 58vw, (min-width: 640px) 64vw, 100vw"
            className="object-cover object-[62%_center] lg:object-[56%_26%]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#001A41] via-[#001A41]/88 to-[#001A41]/20" />
        </div>
        <div className="relative mx-auto flex min-h-[390px] max-w-[1280px] flex-col justify-center px-4 py-12 sm:min-h-[420px] sm:px-6 sm:py-14 lg:min-h-[432px] lg:px-8">
          <Link
            href="/"
            className="inline-flex self-start min-h-11 items-center gap-2 text-xs font-semibold text-slate-200 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#ABEEC8]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to home
          </Link>
          <div className="mt-6 max-w-2xl">
            <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-5xl">
              Find the right service for the job.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-200 sm:text-base">
              Explore common services, review the starting price, and prepare the details you need
              before you continue.
              {selectedCity ? ` Showing services in ${selectedCity}.` : ""}
            </p>
          </div>
          <form className="mt-7 max-w-xl" onSubmit={(event) => event.preventDefault()}>
            <label htmlFor="service-directory-search" className="sr-only">
              Search services
            </label>
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
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
                className="h-12 w-full rounded-xl border border-white/20 bg-white pl-11 pr-12 text-sm font-medium text-slate-900 shadow-[0_12px_30px_rgba(0,0,0,0.15)] outline-none transition focus:ring-2 focus:ring-[#ABEEC8]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  aria-label="Clear search"
                  className="absolute right-1 top-1/2 -translate-y-1/2 inline-flex h-11 w-11 items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#ABEEC8]"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>
          </form>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
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
              className="inline-flex h-11 w-11 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-blue-100 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#296A4B]"
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
              className="inline-flex h-11 w-11 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-blue-100 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#296A4B]"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Controls & Filter Bar */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_12px_30px_rgba(0,26,65,0.05)] sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-lg font-bold text-[#001A41]">Browse by category</h2>
              <p className="mt-1 text-sm text-slate-600" role="status" aria-live="polite">
                {resultLabel}
              </p>
            </div>

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
                className={`motion-press inline-flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#296A4B] ${
                  selectedCity
                    ? "border-[#296A4B] bg-[#EAF7EF] text-[#296A4B]"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                }`}
              >
                <MapPin className="h-3.5 w-3.5 shrink-0 text-[#296A4B]" aria-hidden="true" />
                <span>{selectedCity ? selectedCity : "All cities"}</span>
                <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
              </button>

              {cityDropdownOpen && (
                <div
                  role="listbox"
                  aria-label="Active Nigerian cities"
                  className="absolute left-0 sm:left-auto sm:right-0 top-full z-40 mt-2 w-64 rounded-xl border border-slate-200 bg-white py-2 shadow-[0_16px_32px_rgba(0,26,65,0.14)]"
                >
                  <button
                    type="button"
                    role="option"
                    aria-selected={!selectedCity}
                    onClick={() => handleSelectCity(undefined)}
                    className={`flex min-h-11 min-h-[44px] w-full items-center justify-between px-4 py-2.5 text-left text-xs font-semibold transition-colors hover:bg-slate-50 ${
                      !selectedCity ? "bg-[#EAF7EF] text-[#296A4B]" : "text-slate-700"
                    }`}
                  >
                    <span>All cities (Nationwide)</span>
                    {!selectedCity && <Check className="h-4 w-4 text-[#296A4B]" aria-hidden="true" />}
                  </button>

                  <div className="my-1 border-t border-slate-100" />

                  {activeCities.map((city) => {
                    const isSelected = selectedCity === city.name;
                    return (
                      <button
                        key={city.id}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => handleSelectCity(city.name)}
                        className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-xs font-semibold transition-colors hover:bg-slate-50 ${
                          isSelected ? "bg-[#EAF7EF] text-[#296A4B]" : "text-slate-700"
                        }`}
                      >
                        <div>
                          <div>{city.name}</div>
                          <div className="text-[10px] font-normal text-slate-400">{city.state}</div>
                        </div>
                        {isSelected && <Check className="h-4 w-4 text-[#296A4B]" aria-hidden="true" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Horizontal Category Rail */}
          <div
            className="mt-4 -mx-1 flex items-start gap-1 overflow-x-auto px-1 pb-1 sm:gap-2"
            role="group"
            aria-label="Filter service categories"
          >
            <button
              type="button"
              onClick={() => handleSelectCategory("All")}
              aria-pressed={selectedCategory === "All"}
              className={`motion-press flex w-15 flex-none flex-col items-center gap-1 border-b-2 px-0.5 py-1.5 text-center text-[10px] font-bold leading-tight whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#296A4B] sm:w-20 sm:gap-1.5 sm:py-2 sm:text-[11px] ${
                selectedCategory === "All"
                  ? "border-[#296A4B] text-[#001A41]"
                  : "border-transparent text-slate-700 hover:border-slate-200 hover:text-[#001A41]"
              }`}
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors sm:h-11 sm:w-11 ${
                  selectedCategory === "All" ? "bg-[#E5F6EB]" : "bg-slate-50"
                }`}
              >
                <ServiceTaskIcon categoryId="all" className="h-8 w-8 sm:h-9 sm:w-9" />
              </span>
              All services
            </button>

            {SERVICE_CATEGORIES.map((category) => {
              const isSelected = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleSelectCategory(category.id)}
                  aria-pressed={isSelected}
                  className={`motion-press flex w-15 flex-none flex-col items-center gap-1 border-b-2 px-0.5 py-1.5 text-center text-[10px] font-bold leading-tight whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#296A4B] sm:w-20 sm:gap-1.5 sm:py-2 sm:text-[11px] ${
                    isSelected
                      ? "border-[#296A4B] text-[#001A41]"
                      : "border-transparent text-slate-700 hover:border-slate-200 hover:text-[#001A41]"
                  }`}
                >
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors sm:h-11 sm:w-11 ${
                      isSelected ? "bg-[#E5F6EB]" : "bg-slate-50"
                    }`}
                  >
                    <ServiceTaskIcon categoryId={category.id} className="h-8 w-8 sm:h-9 sm:w-9" />
                  </span>
                  {TASK_LABELS[category.id] ?? category.title}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Grid or Empty State */}
        {filteredCategories.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
            <h2 className="font-display text-xl font-bold text-[#001A41]">
              No services match that search
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
              Try a broader service name, or reset the filters to browse every category.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="motion-press mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#001A41] px-5 text-sm font-bold text-white transition-colors hover:bg-[#000F2D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ABEEC8] focus-visible:ring-offset-2"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {filteredCategories.map((category) => (
              <ServiceCard
                key={category.id}
                category={category}
                onReview={() => reviewCategory(category)}
              />
            ))}
          </div>
        )}

        {/* Trust Notice Aside */}
        <aside className="mt-10 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(0,26,65,0.05)] sm:mt-14 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#296A4B]">
              Before you continue
            </p>
            <h2 className="mt-2 font-display text-xl font-bold tracking-tight text-[#001A41]">
              Get clear on the job details.
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Use the service details to prepare the scope, location, and budget for your booking review.
            </p>
          </div>
          <Link
            href="/guarantee"
            className="motion-press inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-[#001A41] px-4 text-sm font-bold text-[#001A41] transition-colors hover:bg-[#001A41] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ABEEC8] focus-visible:ring-offset-2"
          >
            Read BukieGuarantee
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </aside>
      </section>
    </main>
  );
}

export default function ServicesPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#F8F9FF]" />}>
      <ServicesDirectory />
    </Suspense>
  );
}
