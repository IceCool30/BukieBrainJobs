'use client';

import Link from 'next/link';
import { ArrowRight, Clock, MapPin, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import {
  buildPublicBrainWorkerBookingUrl,
  getServiceCategory,
  NIGERIAN_LOCATIONS,
  PublicBrainWorker,
  PublicBrainWorkerContext,
  SERVICE_CATEGORIES,
} from '../lib/mock/homepage-data';

interface BrainWorkerProfileBookingContextProps {
  profile: PublicBrainWorker;
  initialContext: PublicBrainWorkerContext;
}

export default function BrainWorkerProfileBookingContext({ profile, initialContext }: BrainWorkerProfileBookingContextProps) {
  const [serviceId, setServiceId] = useState(initialContext.service?.id ?? '');
  const [city, setCity] = useState(initialContext.city ?? '');
  const service = getServiceCategory(serviceId);
  const bookingContext: PublicBrainWorkerContext = {};
  if (service) bookingContext.service = service;
  if (city) bookingContext.city = city;
  const bookingUrl = buildPublicBrainWorkerBookingUrl(profile, bookingContext);
  const hasInitialService = Boolean(initialContext.service);
  const suggestion = !hasInitialService && profile.category ? `Suggested service focus: ${profile.category}` : undefined;

  return (
    <aside className="bbj-card-interactive h-fit rounded-lg border border-[var(--lead)] bg-[var(--card-bg)] p-5 sm:p-6 lg:sticky lg:top-6 shadow-xs">
      <p className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand-green)]">Book this BrainWorker</p>
      <h2 className="mt-2 font-display text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-main)]">Confirm service & location</h2>
      <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">Choose the service you need and the active city for your job.</p>

      <div className="mt-6 space-y-4">
        <div>
          <label htmlFor="bw-select-service" className="block font-mono text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
            Service
          </label>
          <select
            id="bw-select-service"
            value={serviceId}
            onChange={(event) => setServiceId(event.target.value)}
            className="mt-1.5 h-12 w-full rounded-lg border border-[var(--lead)] bg-[var(--tag-bg)] px-3 text-sm font-medium text-[var(--text-main)] outline-none transition-colors focus:border-[var(--amber)] focus:bg-[var(--card-bg)] focus:ring-1 focus:ring-[var(--amber)]"
          >
            <option value="">Choose a service</option>
            {SERVICE_CATEGORIES.map((category) => (
              <option key={category.id} value={category.id}>{category.title}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="bw-select-city" className="block font-mono text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
            City
          </label>
          <select
            id="bw-select-city"
            value={city}
            onChange={(event) => setCity(event.target.value)}
            className="mt-1.5 h-12 w-full rounded-lg border border-[var(--lead)] bg-[var(--tag-bg)] px-3 text-sm font-medium text-[var(--text-main)] outline-none transition-colors focus:border-[var(--amber)] focus:bg-[var(--card-bg)] focus:ring-1 focus:ring-[var(--amber)]"
          >
            <option value="">Choose a city</option>
            {NIGERIAN_LOCATIONS.filter((location) => location.status === 'active').map((location) => (
              <option key={location.id} value={location.name}>{location.name}</option>
            ))}
          </select>
        </div>
      </div>

      {suggestion && (
        <p className="mt-4 rounded-lg border border-[var(--brand-green-border)] bg-[var(--brand-green-dim)] p-3 text-xs leading-5 text-[var(--text-main)]">
          {suggestion}. Select the service that matches your job before continuing.
        </p>
      )}

      <div className="mt-5 space-y-2 rounded-lg border border-[var(--lead)] bg-[var(--tag-bg)] p-3.5 text-xs text-[var(--text-muted)]">
        <div className="flex items-center gap-2 font-medium">
          <Clock className="h-4 w-4 shrink-0 text-[var(--brand-green)]" aria-hidden="true" />
          <span>Typically completed in 2 to 4 hours</span>
        </div>
        <div className="flex items-center gap-2 font-medium">
          <ShieldCheck className="h-4 w-4 shrink-0 text-[var(--brand-green)]" aria-hidden="true" />
          <span>Protected by BukieGuarantee escrow</span>
        </div>
      </div>

      {bookingUrl ? (
        <Link
          href={bookingUrl}
          className="motion-press mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[var(--amber)] px-5 text-sm font-bold text-[#001A41] transition-colors hover:bg-[var(--amber-hover)] shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)] focus-visible:ring-offset-2"
        >
          <span>Continue to booking</span>
          <ArrowRight className="h-4 w-4 text-[#001A41]" aria-hidden="true" />
        </Link>
      ) : (
        <button
          type="button"
          disabled
          className="mt-6 inline-flex min-h-12 w-full cursor-not-allowed items-center justify-center rounded-lg border border-[var(--lead)] bg-[var(--tag-bg)] px-5 text-sm font-bold text-[var(--text-muted)]"
        >
          Choose a service and city
        </button>
      )}

      <div className="mt-4 flex items-start gap-2 text-xs leading-5 text-[var(--text-muted)]">
        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand-green)]" aria-hidden="true" />
        <span>Starting rate: <strong className="font-mono text-[var(--brand-green)]">{profile.startingRate}</strong>. Confirm the final job details during booking.</span>
      </div>
    </aside>
  );
}
