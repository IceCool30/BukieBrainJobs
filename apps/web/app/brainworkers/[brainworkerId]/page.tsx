import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, MapPin } from 'lucide-react';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import BrainWorkerProfileBookingContext from '../../../components/BrainWorkerProfileBookingContext';
import { PublicReviewFeed } from '../../../components/review';
import {
  getPublicBrainWorker,
  buildPublicBrainWorkerServicesUrl,
  NIGERIAN_LOCATIONS,
  PUBLIC_BRAINWORKER_IDS,
  resolvePublicBrainWorkerContext,
} from '../../../lib/mock/homepage-data';

interface PageProps {
  params: Promise<{ brainworkerId: string }>;
  searchParams: Promise<{
    serviceId?: string | string[];
    city?: string | string[];
    service?: string | string[];
    tab?: string | string[];
  }>;
}

export function generateStaticParams() {
  return PUBLIC_BRAINWORKER_IDS.map((brainworkerId) => ({ brainworkerId }));
}

export default async function PublicBrainWorkerProfilePage({ params, searchParams }: PageProps) {
  const [{ brainworkerId }, query] = await Promise.all([params, searchParams]);
  const profile = getPublicBrainWorker(brainworkerId);
  if (!profile) notFound();

  const context = resolvePublicBrainWorkerContext(query);
  const servicesUrl = buildPublicBrainWorkerServicesUrl(context);
  const activeLocations = NIGERIAN_LOCATIONS.filter((location) => location.status === 'active');

  const rawTab = Array.isArray(query.tab) ? query.tab[0] : query.tab;
  const initialTab = rawTab === 'reviews' ? 'reviews' : 'service';

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[var(--bg)] text-[var(--text-main)] pt-[var(--header-height)] transition-colors duration-200">
        <section className="relative isolate overflow-hidden bg-[#001A41] dark:bg-[#0B0F17] text-white">
        <div className="absolute inset-0 sm:left-[42%]">
          <Image
            src={profile.avatarUrl}
            alt={`Portrait of ${profile.name}`}
            fill
            priority
            sizes="(min-width: 640px) 58vw, 100vw"
            className="object-cover object-center opacity-75 dark:opacity-55"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#001A41] via-[#001A41]/85 to-[#001A41]/20 dark:from-[#0B0F17] dark:via-[#0B0F17]/90 dark:to-[#0B0F17]/30" />
        </div>

        <div className="relative mx-auto max-w-[1280px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
          <Link
            href={servicesUrl ?? '/#workers'}
            className="motion-press inline-flex min-h-11 items-center gap-2 rounded-lg text-xs sm:text-sm font-semibold text-slate-200 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--amber)]"
          >
            <ArrowLeft className="h-4 w-4 text-[var(--amber)]" aria-hidden="true" />
            {servicesUrl ? 'Back to services' : 'Back to featured BrainWorkers'}
          </Link>

          <div className="mt-12 max-w-2xl pb-8 sm:mt-16 sm:pb-14">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand-green)]">BrainWorker profile</p>
            <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">{profile.name}</h1>
            <p className="mt-4 text-lg font-semibold text-slate-100 sm:text-xl">{profile.title}</p>
            <div className="mt-6 flex flex-wrap gap-2.5 text-xs font-semibold text-slate-200">
              <span className="rounded-md border border-white/20 bg-white/10 px-3 py-1.5 font-mono">{profile.category}</span>
              <span className="inline-flex items-center gap-1.5 rounded-md border border-white/20 bg-white/10 px-3 py-1.5">
                <MapPin className="h-3.5 w-3.5 text-[var(--brand-green)]" aria-hidden="true" />
                {profile.location}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1280px] gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10 lg:px-8">
        <div className="space-y-8" id="reviews">
          {/* Surface 3: Public BrainWorker Profile Review Experience (WEB-016) */}
          <PublicReviewFeed
            brainWorkerId={brainworkerId}
            initialTab={initialTab}
            skills={profile.skills}
            serviceCategories={[profile.category]}
          />

          <section className="rounded-lg border border-[var(--lead)] bg-[var(--card-bg)] p-5 sm:p-7 shadow-xs">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand-green)]">Location context</p>
            <h2 className="mt-2 font-display text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-main)]">Choose an active city for your job</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">The city you confirm will be carried into booking preparation.</p>
            <div className="mt-5 flex flex-wrap gap-2" aria-label="Active cities">
              {activeLocations.map((location) => (
                <span key={location.id} className="rounded-md border border-[var(--lead)] bg-[var(--tag-bg)] px-3 py-1.5 font-mono text-xs font-semibold text-[var(--text-main)]">{location.name}</span>
              ))}
            </div>
          </section>
        </div>

        <BrainWorkerProfileBookingContext profile={profile} initialContext={context} />
      </section>
    </main>
    <Footer />
    </>
  );
}
