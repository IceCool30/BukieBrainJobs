import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BadgeCheck } from 'lucide-react';
import { getPublicBrainWorkers, PublicBrainWorker } from '../lib/mock/homepage-data';

interface FeaturedBrainWorkersProps {
  profileCity?: string;
}

const featuredWorkers = getPublicBrainWorkers();

function WorkerCard({ worker, profileCity }: { worker: PublicBrainWorker; profileCity?: string }) {
  const href = profileCity
    ? `/brainworkers/${worker.id}?city=${encodeURIComponent(profileCity)}`
    : `/brainworkers/${worker.id}`;

  return (
    <Link
      href={href}
      className="service-card-motion motion-press group block overflow-hidden rounded-2xl border border-slate-200/90 bg-white text-left shadow-[0_2px_10px_-6px_rgba(0,26,65,0.18)] transition-[transform,box-shadow,border-color] duration-[180ms] ease-[var(--ease-ui-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#296A4B] focus-visible:ring-offset-2"
      aria-label={`View ${worker.name}'s profile`}
    >
      <div className="relative aspect-[5/4] overflow-hidden bg-slate-100">
        <Image
          src={worker.avatarUrl}
          alt={`Portrait of ${worker.name}`}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="service-card-image object-cover"
        />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-[#001A41] shadow-sm">
          <BadgeCheck className="h-3.5 w-3.5 text-[#296A4B]" aria-hidden="true" />
          Featured
        </span>
        <span className="service-card-arrow absolute right-3 top-3 flex h-8 w-8 translate-x-1 items-center justify-center rounded-full bg-[#001A41] text-white opacity-0 shadow-sm transition-[opacity,transform] duration-[180ms] ease-[var(--ease-ui-out)]" aria-hidden="true">
          <ArrowRight className="h-4 w-4" />
        </span>
      </div>
      <div className="space-y-2 p-4">
        <div>
          <p className="text-xs font-semibold text-[#296A4B]">{worker.category}</p>
          <h3 className="mt-1 text-[15px] font-semibold leading-snug text-[#001A41] transition-colors group-hover:text-[#296A4B]">{worker.name}</h3>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{worker.title}</p>
        </div>
        <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
          <span>{worker.location}</span>
          <span className="shrink-0 font-bold text-[#296A4B]">From {worker.startingRate}</span>
        </div>
      </div>
    </Link>
  );
}

export default function FeaturedBrainWorkers({ profileCity }: FeaturedBrainWorkersProps) {
  return (
    <section id="workers" className="border-b border-slate-200 bg-[#F8F9FF] py-12 sm:py-16">
      <div className="mx-auto max-w-[1280px] space-y-6 px-4 sm:space-y-8 sm:px-6 lg:px-8">
        <div>
          <h2 className="font-display text-2xl font-bold text-[#001A41] sm:text-3xl">Meet the featured BrainWorkers</h2>
          <p className="mt-1 text-sm text-slate-500">Take a closer look at the services and profile details shown for each BrainWorker.</p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
          {featuredWorkers.map((worker) => (
            <WorkerCard key={worker.id} worker={worker} {...(profileCity ? { profileCity } : {})} />
          ))}
        </div>
      </div>
    </section>
  );
}
