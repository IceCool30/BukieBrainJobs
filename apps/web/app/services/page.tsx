'use client';

import React, { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, Search } from 'lucide-react';
import { SERVICE_CATEGORIES, ServiceCategory } from '../../lib/mock/homepage-data';
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

function matchesService(category: ServiceCategory, query: string) {
  const term = query.toLowerCase();
  return (
    category.title.toLowerCase().includes(term) ||
    category.description.toLowerCase().includes(term) ||
    category.popularServices.some((service) => service.toLowerCase().includes(term))
  );
}

function initialGroup(category: string | null) {
  if (category && SERVICE_CATEGORIES.some((item) => item.id === category)) {
    return category;
  }
  return 'All';
}

function ServiceCard({ category, onBook }: { category: ServiceCategory; onBook: () => void }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_30px_rgba(0,26,65,0.06)]">
      <div className="relative aspect-[5/3] overflow-hidden bg-slate-100">
        <Image
          src={category.photoUrl}
          alt=""
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#001A41]/55 via-transparent to-transparent" />
        <span className="absolute left-4 top-4 rounded-lg bg-white px-2.5 py-1 text-[11px] font-bold text-[#001A41] shadow-sm">
          From {category.startingPrice}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div>
          <h2 className="font-display text-lg font-bold tracking-tight text-[#001A41]">{category.title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{category.description}</p>
        </div>

        <ul className="mt-5 space-y-2" aria-label={`Common ${category.title.toLowerCase()} jobs`}>
          {category.popularServices.map((service) => (
            <li key={service} className="flex items-center gap-2 text-xs font-medium text-slate-700">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#296A4B]" />
              {service}
            </li>
          ))}
        </ul>

        <div className="mt-6 flex items-end justify-between gap-4 border-t border-slate-100 pt-4">
          <div>
            <span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500">Starting from</span>
            <span className="font-display text-lg font-extrabold text-[#001A41]">{category.startingPrice}</span>
          </div>
          <button
            type="button"
            onClick={onBook}
            className="motion-press inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#001A41] px-4 text-xs font-bold text-white transition-colors hover:bg-[#000F2D] focus:outline-none focus:ring-2 focus:ring-[#ABEEC8] focus:ring-offset-2"
          >
            Review details
            <ArrowRight className="h-4 w-4 text-[#ABEEC8]" />
          </button>
        </div>
      </div>
    </article>
  );
}

function ServicesDirectory() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedGroup, setSelectedGroup] = useState(initialGroup(searchParams.get('category')));
  const city = searchParams.get('city');
  const router = useRouter();
  const filteredCategories = SERVICE_CATEGORIES.filter(
    (category) => (selectedGroup === 'All' || category.id === selectedGroup) && matchesService(category, searchQuery),
  );
  const resultLabel = `${filteredCategories.length} ${filteredCategories.length === 1 ? 'service category' : 'service categories'} shown`;
  const bookCategory = (category: ServiceCategory) => {
    const params = new URLSearchParams({ service: category.title, price: category.startingPrice });
    if (city) params.set('city', city);
    router.push(`/book?${params.toString()}`);
  };

  return (
    <main className="min-h-screen bg-[#F8F9FF]">
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
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
          <div className="mt-6 max-w-2xl">
            <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-5xl">
              Find the right service for the job.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-200 sm:text-base">
              Explore common services, review the starting price, and prepare the details you need before you continue.
              {city ? ` Showing services for ${city}.` : ''}
            </p>
          </div>
          <form className="mt-7 max-w-xl" onSubmit={(event) => event.preventDefault()}>
            <label htmlFor="service-directory-search" className="sr-only">Search services</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                id="service-directory-search"
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by service, trade, or job"
                className="h-12 w-full rounded-xl border border-white/20 bg-white pl-11 pr-4 text-sm font-medium text-slate-900 shadow-[0_12px_30px_rgba(0,0,0,0.15)] outline-none transition focus:ring-2 focus:ring-[#ABEEC8]"
              />
            </div>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_12px_30px_rgba(0,26,65,0.05)] sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-lg font-bold text-[#001A41]">Browse by category</h2>
              <p className="mt-1 text-sm text-slate-600" role="status">{resultLabel}</p>
            </div>
            <div className="-mx-1 flex items-start gap-1 overflow-x-auto px-1 pb-1 sm:gap-2" aria-label="Filter service categories">
              <button
                type="button"
                onClick={() => setSelectedGroup('All')}
                aria-pressed={selectedGroup === 'All'}
                className={`motion-press flex w-15 flex-none flex-col items-center gap-1 border-b-2 px-0.5 py-1.5 text-center text-[10px] font-bold leading-tight whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#296A4B] sm:w-20 sm:gap-1.5 sm:py-2 sm:text-[11px] ${
                  selectedGroup === 'All'
                    ? 'border-[#296A4B] text-[#001A41]'
                    : 'border-transparent text-slate-700 hover:border-slate-200 hover:text-[#001A41]'
                }`}
              >
                <span className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors sm:h-11 sm:w-11 ${selectedGroup === 'All' ? 'bg-[#E5F6EB]' : 'bg-slate-50'}`}>
                  <ServiceTaskIcon categoryId="all" className="h-8 w-8 sm:h-9 sm:w-9" />
                </span>
                All services
              </button>
              {SERVICE_CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedGroup(category.id)}
                  aria-pressed={selectedGroup === category.id}
                  className={`motion-press flex w-15 flex-none flex-col items-center gap-1 border-b-2 px-0.5 py-1.5 text-center text-[10px] font-bold leading-tight whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#296A4B] sm:w-20 sm:gap-1.5 sm:py-2 sm:text-[11px] ${
                    selectedGroup === category.id
                      ? 'border-[#296A4B] text-[#001A41]'
                      : 'border-transparent text-slate-700 hover:border-slate-200 hover:text-[#001A41]'
                  }`}
                >
                  <span className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors sm:h-11 sm:w-11 ${selectedGroup === category.id ? 'bg-[#E5F6EB]' : 'bg-slate-50'}`}>
                    <ServiceTaskIcon categoryId={category.id} className="h-8 w-8 sm:h-9 sm:w-9" />
                  </span>
                  {TASK_LABELS[category.id] ?? category.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filteredCategories.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
            <h2 className="font-display text-xl font-bold text-[#001A41]">No services match that search</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
              Try a broader service name, or reset the filters to browse every category.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedGroup('All');
              }}
              className="motion-press mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#001A41] px-5 text-sm font-bold text-white transition-colors hover:bg-[#000F2D] focus:outline-none focus:ring-2 focus:ring-[#ABEEC8] focus:ring-offset-2"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {filteredCategories.map((category) => (
              <ServiceCard key={category.id} category={category} onBook={() => bookCategory(category)} />
            ))}
          </div>
        )}

        <aside className="mt-10 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(0,26,65,0.05)] sm:mt-14 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#296A4B]">Before you continue</p>
            <h2 className="mt-2 font-display text-xl font-bold tracking-tight text-[#001A41]">Get clear on the job details.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Use the service details to prepare the scope, location, and budget for your booking review.
            </p>
          </div>
          <Link
            href="/guarantee"
            className="motion-press inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-[#001A41] px-4 text-sm font-bold text-[#001A41] transition-colors hover:bg-[#001A41] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#ABEEC8] focus:ring-offset-2"
          >
            Read BukieGuarantee
            <ArrowRight className="h-4 w-4" />
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
