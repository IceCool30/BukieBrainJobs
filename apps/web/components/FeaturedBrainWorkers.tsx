import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BadgeCheck, MapPin } from 'lucide-react';
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
      className="bbj-card-interactive service-card-motion motion-press group flex flex-col justify-between overflow-hidden rounded-lg border border-[var(--lead)] bg-[var(--card-bg)] text-[var(--text-main)] hover:bg-[var(--card-hover)] hover:border-[var(--rule)] text-left transition-all duration-[180ms] ease-[var(--ease-ui-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)] focus-visible:ring-offset-2"
      aria-label={`View ${worker.name}'s profile`}
    >
      <div>
        <div className="relative aspect-[5/4] overflow-hidden bg-[var(--tag-bg)]">
          <Image
            src={worker.avatarUrl}
            alt={`Portrait of ${worker.name}`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="service-card-image object-cover"
          />
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded border border-[var(--brand-green-border)] bg-[var(--card-bg)]/90 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-[var(--brand-green)] shadow-xs">
            <BadgeCheck className="h-3 w-3 text-[var(--brand-green)]" aria-hidden="true" />
            Featured
          </span>
          <span className="service-card-arrow absolute right-3 top-3 flex h-7 w-7 translate-x-1 items-center justify-center rounded bg-[var(--amber)] text-[#001A41] opacity-0 shadow-sm transition-[opacity,transform] duration-[180ms] ease-[var(--ease-ui-out)]" aria-hidden="true">
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
        <div className="space-y-1 p-3 sm:p-3.5">
          <h3 className="text-[15px] font-semibold leading-snug text-[var(--text-main)] transition-colors group-hover:text-[var(--amber)]">
            {worker.name}
          </h3>
          <p className="line-clamp-1 text-xs text-[var(--text-muted)]">
            {worker.title}
          </p>
          <div className="flex items-center gap-1 text-xs text-[var(--text-muted)] pt-0.5">
            <MapPin className="h-3 w-3 shrink-0 text-[var(--text-muted)]" aria-hidden="true" />
            <span className="truncate">{worker.location}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-[var(--lead)]/70 px-3 sm:px-3.5 py-2 text-xs bg-[var(--tag-bg)]/40">
        <span className="inline-flex items-center gap-1.5 font-mono text-[10px] sm:text-[11px] text-[var(--text-muted)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-green)] animate-pulse" aria-hidden="true" />
          Available today
        </span>
        <span className="shrink-0 font-mono text-xs font-semibold text-[var(--text-main)]">
          From {worker.startingRate}
        </span>
      </div>
    </Link>
  );
}

export default function FeaturedBrainWorkers({ profileCity }: FeaturedBrainWorkersProps) {
  return (
    <section id="workers" className="border-b border-[var(--lead)] bg-[var(--bg)] text-[var(--text-main)] py-12 sm:py-16 transition-colors duration-200">
      <div className="mx-auto max-w-[1280px] space-y-6 px-4 sm:space-y-8 sm:px-6 lg:px-8">
        <div>
          <h2 className="font-display tracking-trades text-2xl font-bold text-[var(--text-main)] sm:text-3xl">Meet the featured BrainWorkers</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Take a closer look at the services and profile details shown for each BrainWorker.</p>
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
