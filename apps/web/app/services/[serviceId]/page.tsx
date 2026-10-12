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
  searchParams: Promise<{
    city?: string | string[];
    returnCategory?: string | string[];
    returnQ?: string | string[];
    category?: string | string[];
    q?: string | string[];
  }>;
}

export function generateStaticParams() {
  return SERVICE_CATEGORIES.map(({ id }) => ({ serviceId: id }));
}

function getSingleQueryValue(value: string | string[] | undefined) {
  return typeof value === 'string' ? value : undefined;
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
  const returnCategory = getSingleQueryValue(query.returnCategory) || getSingleQueryValue(query.category);
  const returnQ = getSingleQueryValue(query.returnQ) || getSingleQueryValue(query.q);

  const backParams = new URLSearchParams();
  if (returnCategory && returnCategory !== 'All') backParams.set('category', returnCategory);
  if (city) backParams.set('city', city);
  if (returnQ && returnQ.trim()) backParams.set('q', returnQ.trim());
  const backQuery = backParams.toString();
  const backToServicesHref = backQuery ? `/services?${backQuery}` : '/services';

  const booking = new URLSearchParams({ service: service.title, price: service.startingPrice });
  if (city) booking.set('city', city);
  const locations = NIGERIAN_LOCATIONS.filter((location) => location.status === 'active');

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text-main)] transition-colors duration-200">
      <section className="relative isolate overflow-hidden bg-[var(--strip-bg)] text-white">
        <div className="absolute inset-y-0 right-0 w-full sm:w-[62%]">
          <Image
            src={service.photoUrl}
            alt={`Service context for ${service.title}`}
            fill
            priority
            sizes="(min-width: 1024px) 62vw, 100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--strip-bg)] via-[var(--strip-bg)]/90 to-[var(--strip-bg)]/30" />
        </div>

        <div className="relative mx-auto max-w-[1280px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
          <Link
            href={backToServicesHref}
            className="inline-flex min-h-11 items-center gap-2 text-xs font-semibold text-[var(--strip-text)] transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--amber)] rounded-lg"
          >
            <ArrowLeft className="h-4 w-4 text-[var(--amber)]" aria-hidden="true" />
            Back to services
          </Link>

          <div className="mt-10 max-w-2xl pb-8 sm:mt-14 sm:pb-12">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand-green)]">{service.group}</p>
            <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">
              {service.title}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[var(--strip-text)] sm:text-lg">
              {service.description}
            </p>
            <div className="mt-7 inline-flex rounded-lg border border-white/15 bg-white/5 backdrop-blur-xs px-4 py-3">
              <div>
                <span className="block font-mono text-[10px] font-semibold uppercase tracking-wider text-[var(--strip-text)]">Starting price</span>
                <strong className="mt-1 block font-mono text-2xl font-bold text-[var(--brand-green)]">{service.startingPrice}</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1280px] gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10 lg:px-8">
        <div className="space-y-8">
          <section className="rounded-lg border border-[var(--lead)] bg-[var(--card-bg)] p-5 shadow-xs sm:p-7">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand-green)]">What this service can cover</p>
            <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-[var(--text-main)]">
              Common jobs to discuss before you book.
            </h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {service.popularServices.map((job) => (
                <li key={job} className="flex gap-3 rounded-lg border border-[var(--lead)] bg-[var(--tag-bg)] p-4 text-sm font-semibold leading-6 text-[var(--text-main)]">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand-green)]" aria-hidden="true" />
                  {job}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-lg border border-[var(--lead)] bg-[var(--card-bg)] p-5 shadow-xs sm:p-7">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--brand-green-border)] bg-[var(--brand-green-dim)] text-[var(--brand-green)]">
                <MapPin className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand-green)]">Locations shown</p>
                <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-[var(--text-main)]">Choose the location for your job.</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-muted)]">
                  You can confirm the job location when you continue to booking preparation.
                </p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-2" aria-label="Available locations">
              {locations.map((location) => (
                <span key={location.id} className="rounded-md border border-[var(--tag-border)] bg-[var(--tag-bg)] px-3 py-1.5 font-mono text-xs font-semibold text-[var(--text-main)]">
                  {location.name}
                </span>
              ))}
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-lg border border-[var(--lead)] bg-[var(--card-bg)] p-5 shadow-xs sm:p-6 lg:sticky lg:top-6">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand-green)]">Next step</p>
          <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-[var(--text-main)]">Prepare the details for your booking.</h2>
          <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
            Add the job location, timing, and details so you can review what you need before you continue.
          </p>
          <Link
            href={`/book?${booking.toString()}`}
            className="motion-press mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[var(--amber)] px-5 text-sm font-bold text-white transition-colors hover:bg-[var(--amber-hover)] shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)] focus-visible:ring-offset-2"
          >
            Continue to booking
            <ArrowRight className="h-4 w-4 text-white" aria-hidden="true" />
          </Link>
          <Link
            href="/services"
            className="motion-press mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-[var(--lead)] bg-[var(--card-bg)] px-4 text-sm font-bold text-[var(--text-main)] transition-colors hover:bg-[var(--card-hover)] hover:border-[var(--rule)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)] focus-visible:ring-offset-2"
          >
            Browse all services
          </Link>
        </aside>
      </section>
    </main>
  );
}
