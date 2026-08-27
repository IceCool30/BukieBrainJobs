'use client';

import Link from 'next/link';
import { ArrowRight, MapPin } from 'lucide-react';
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
    <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(0,26,65,0.06)] sm:p-6 lg:sticky lg:top-6">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#296A4B]">Book this BrainWorker</p>
      <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-[#001A41]">Confirm the service and location.</h2>
      <p className="mt-3 text-sm leading-6 text-slate-600">Choose the service you need and the active city for your job.</p>

      <div className="mt-6 space-y-4">
        <label className="block text-sm font-semibold text-[#001A41]">
          Service
          <select
            value={serviceId}
            onChange={(event) => setServiceId(event.target.value)}
            className="mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#296A4B] focus-visible:ring-offset-2"
          >
            <option value="">Choose a service</option>
            {SERVICE_CATEGORIES.map((category) => (
              <option key={category.id} value={category.id}>{category.title}</option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-semibold text-[#001A41]">
          City
          <select
            value={city}
            onChange={(event) => setCity(event.target.value)}
            className="mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#296A4B] focus-visible:ring-offset-2"
          >
            <option value="">Choose a city</option>
            {NIGERIAN_LOCATIONS.filter((location) => location.status === 'active').map((location) => (
              <option key={location.id} value={location.name}>{location.name}</option>
            ))}
          </select>
        </label>
      </div>

      {suggestion && (
        <p className="mt-4 rounded-xl border border-[#ABEEC8]/80 bg-[#F1FBF5] p-3 text-xs leading-5 text-[#296A4B]">
          {suggestion}. Select the service that matches your job before continuing.
        </p>
      )}

      {bookingUrl ? (
        <Link
          href={bookingUrl}
          className="motion-press mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#001A41] px-5 text-sm font-bold text-white transition-colors hover:bg-[#000F2D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ABEEC8] focus-visible:ring-offset-2"
        >
          Continue to booking
          <ArrowRight className="h-4 w-4 text-[#ABEEC8]" aria-hidden="true" />
        </Link>
      ) : (
        <button type="button" disabled className="mt-6 inline-flex min-h-12 w-full cursor-not-allowed items-center justify-center rounded-xl bg-slate-200 px-5 text-sm font-bold text-slate-500">
          Choose a service and city
        </button>
      )}

      <div className="mt-4 flex items-start gap-2 text-xs leading-5 text-slate-500">
        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#296A4B]" aria-hidden="true" />
        <span>Starting rate: {profile.startingRate}. Confirm the final job details during booking.</span>
      </div>
    </aside>
  );
}
