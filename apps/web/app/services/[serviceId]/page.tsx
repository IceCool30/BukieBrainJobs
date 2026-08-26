import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, CheckCircle2, MapPin } from 'lucide-react';
import {
  getServiceCategory,
  NIGERIAN_LOCATIONS,
  SERVICE_CATEGORIES,
} from '../../../lib/mock/homepage-data';

interface PageProps {
  params: Promise<{ serviceId: string }>;
  searchParams: Promise<{ city?: string | string[] }>;
}

export function generateStaticParams() {
  return SERVICE_CATEGORIES.map(({ id }) => ({ serviceId: id }));
}

function getCity(value: string | string[] | undefined) {
  if (typeof value !== 'string') return undefined;
  return NIGERIAN_LOCATIONS.find((location) => location.name === value && location.status === 'active')?.name;
}

export default async function ServiceDetailPage({ params, searchParams }: PageProps) {
  const [{ serviceId }, query] = await Promise.all([params, searchParams]);
  const service = getServiceCategory(serviceId);

  if (!service) notFound();

  const city = getCity(query.city);
  const booking = new URLSearchParams({ service: service.title, price: service.startingPrice });
  if (city) booking.set('city', city);
  const locations = NIGERIAN_LOCATIONS.filter((location) => location.status === 'active');

  return (
    <main className="min-h-screen bg-[#F8F9FF] text-[#0B1C30]">
      <section className="relative isolate overflow-hidden bg-[#001A41] text-white">
        <div className="absolute inset-y-0 right-0 w-full sm:w-[62%]">
          <Image
            src={service.photoUrl}
            alt={`Service context for ${service.title}`}
            fill
            priority
            sizes="(min-width: 1024px) 62vw, 100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#001A41] via-[#001A41]/88 to-[#001A41]/25" />
        </div>

        <div className="relative mx-auto max-w-[1280px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
          <Link
            href={city ? `/services?city=${encodeURIComponent(city)}` : '/services'}
            className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-slate-200 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#ABEEC8]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to services
          </Link>

          <div className="mt-10 max-w-2xl pb-8 sm:mt-14 sm:pb-12">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#ABEEC8]">{service.group}</p>
            <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              {service.title}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-100 sm:text-lg">
              {service.description}
            </p>
            <div className="mt-7 inline-flex rounded-xl border border-white/15 bg-white/10 px-4 py-3">
              <div>
                <span className="block text-xs font-semibold text-slate-200">Starting price</span>
                <strong className="mt-1 block font-display text-2xl text-[#ABEEC8]">{service.startingPrice}</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1280px] gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10 lg:px-8">
        <div className="space-y-8">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(0,26,65,0.05)] sm:p-7">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#296A4B]">What this service can cover</p>
            <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-[#001A41]">
              Common jobs to discuss before you book.
            </h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {service.popularServices.map((job) => (
                <li key={job} className="flex gap-3 rounded-xl border border-slate-200 bg-[#F8F9FF] p-4 text-sm font-semibold leading-6 text-slate-700">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#296A4B]" aria-hidden="true" />
                  {job}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(0,26,65,0.05)] sm:p-7">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#ABEEC8]/70 bg-[#EAF7EF] text-[#296A4B]">
                <MapPin className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#296A4B]">Locations shown</p>
                <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-[#001A41]">Choose the location for your job.</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  You can confirm the job location when you continue to booking preparation.
                </p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-2" aria-label="Available locations">
              {locations.map((location) => (
                <span key={location.id} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-[#001A41]">
                  {location.name}
                </span>
              ))}
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(0,26,65,0.06)] sm:p-6 lg:sticky lg:top-6">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#296A4B]">Next step</p>
          <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-[#001A41]">Prepare the details for your booking.</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Add the job location, timing, and details so you can review what you need before you continue.
          </p>
          <Link
            href={`/book?${booking.toString()}`}
            className="motion-press mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#001A41] px-5 text-sm font-bold text-white transition-colors hover:bg-[#000F2D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ABEEC8] focus-visible:ring-offset-2"
          >
            Continue to booking
            <ArrowRight className="h-4 w-4 text-[#ABEEC8]" aria-hidden="true" />
          </Link>
          <Link
            href="/services"
            className="motion-press mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-[#001A41] px-4 text-sm font-bold text-[#001A41] transition-colors hover:bg-[#EFF4FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#296A4B] focus-visible:ring-offset-2"
          >
            Browse all services
          </Link>
        </aside>
      </section>
    </main>
  );
}
