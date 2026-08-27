import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, CheckCircle2, MapPin } from 'lucide-react';
import BrainWorkerProfileBookingContext from '../../../components/BrainWorkerProfileBookingContext';
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

  return (
    <main className="min-h-screen bg-[#F8F9FF] text-[#0B1C30]">
      <section className="relative isolate overflow-hidden bg-[#001A41] text-white">
        <div className="absolute inset-0 sm:left-[42%]">
          <Image
            src={profile.avatarUrl}
            alt={`Portrait of ${profile.name}`}
            fill
            priority
            sizes="(min-width: 640px) 58vw, 100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#001A41] via-[#001A41]/85 to-[#001A41]/20" />
        </div>

        <div className="relative mx-auto max-w-[1280px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
          <Link
            href={servicesUrl ?? '/#workers'}
            className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-slate-200 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#ABEEC8]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {servicesUrl ? 'Back to services' : 'Back to featured BrainWorkers'}
          </Link>

          <div className="mt-12 max-w-2xl pb-8 sm:mt-16 sm:pb-14">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#ABEEC8]">BrainWorker profile</p>
            <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">{profile.name}</h1>
            <p className="mt-4 text-lg font-semibold text-slate-100 sm:text-xl">{profile.title}</p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold text-slate-200">
              <span className="rounded-xl border border-white/15 bg-white/10 px-3 py-2">{profile.category}</span>
              <span className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2">
                <MapPin className="h-4 w-4 text-[#ABEEC8]" aria-hidden="true" />
                {profile.location}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1280px] gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10 lg:px-8">
        <div className="space-y-8">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(0,26,65,0.05)] sm:p-7">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#296A4B]">Service focus</p>
            <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-[#001A41]">What this BrainWorker lists.</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">Review the listed skills and choose the service that matches the work you need.</p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {profile.skills.map((skill) => (
                <li key={skill} className="flex gap-3 rounded-xl border border-slate-200 bg-[#F8F9FF] p-4 text-sm font-semibold leading-6 text-slate-700">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#296A4B]" aria-hidden="true" />
                  {skill}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(0,26,65,0.05)] sm:p-7">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#296A4B]">Location context</p>
            <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-[#001A41]">Choose an active city for your job.</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">The city you confirm will be carried into booking preparation.</p>
            <div className="mt-5 flex flex-wrap gap-2" aria-label="Active cities">
              {activeLocations.map((location) => (
                <span key={location.id} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-[#001A41]">{location.name}</span>
              ))}
            </div>
          </section>
        </div>

        <BrainWorkerProfileBookingContext profile={profile} initialContext={context} />
      </section>
    </main>
  );
}
