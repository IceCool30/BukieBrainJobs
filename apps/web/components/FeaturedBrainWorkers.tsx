import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Users, Briefcase, Star, Plus } from 'lucide-react';
import {
  getPublicBrainWorkers,
  MOCK_BRAINWORKERS,
  PublicBrainWorker,
  BrainWorker,
} from '../lib/mock/homepage-data';

interface FeaturedBrainWorkersProps {
  profileCity?: string;
}

const WORKER_BIOS: Record<string, string> = {
  'bw-1': 'Specialized in Perkins & Mikano diesel power plants, soundproofing, and ATS synchronization.',
  'bw-2': 'Precision HVAC installations, inverter split diagnostics, and commercial chiller recovery.',
  'bw-3': 'PPR pressure pipe lines, multi-level borehole integration, and certified leak resolution.',
  'bw-4': 'High-capacity lithium battery bank integration, solar arrays, and certified distribution boards.',
};

const featuredWorkers = getPublicBrainWorkers();

// Map mock authoritative metrics to public view
const workerMetricsMap = new Map<string, BrainWorker>(
  MOCK_BRAINWORKERS.map((w) => [w.id, w]),
);

function WorkerCard({
  worker,
  profileCity,
}: {
  worker: PublicBrainWorker;
  profileCity?: string;
}) {
  const href = profileCity
    ? `/brainworkers/${worker.id}?city=${encodeURIComponent(profileCity)}`
    : `/brainworkers/${worker.id}`;

  const fullRecord = workerMetricsMap.get(worker.id);
  const completedJobs = fullRecord?.completedJobs ?? 120;
  const rating = fullRecord?.rating ?? 4.9;
  const skillsCount = worker.skills?.length ?? 3;
  const bio = WORKER_BIOS[worker.id] ?? `${worker.category} specialist with verified Nigerian trade expertise.`;

  return (
    <Link
      href={href}
      className="group block outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)] focus-visible:ring-offset-2 rounded-[32px] sm:rounded-[36px]"
      aria-label={`View ${worker.name}'s profile`}
    >
      {/* Outer Double-Layer Frosted Glass Bezel */}
      <div className="relative h-full rounded-[32px] sm:rounded-[36px] p-2.5 sm:p-3 transition-all duration-300 bg-white/70 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 backdrop-blur-xl shadow-[0_12px_36px_rgba(0,26,65,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] group-hover:border-[var(--amber)]/60 group-hover:shadow-xl">
        {/* Inner Card Body */}
        <div className="flex h-full flex-col justify-between rounded-[24px] sm:rounded-[28px] border border-black/[0.04] dark:border-white/[0.05] bg-[#F8F9FC] dark:bg-[#13171F] p-3 sm:p-3.5 transition-colors duration-200">
          <div>
            {/* Floating Portrait Photo */}
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[20px] bg-slate-200/60 dark:bg-zinc-800">
              <Image
                src={worker.avatarUrl}
                alt={`Portrait of ${worker.name}`}
                fill
                sizes="(max-width: 640px) 85vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
              />
            </div>

            {/* Identity & Verified Badge Header */}
            <div className="mt-3.5">
              <div className="flex items-center justify-between gap-1.5">
                <h3 className="font-bold text-base sm:text-lg text-[var(--text-main)] tracking-tight leading-tight truncate">
                  {worker.name}
                </h3>
                {/* Authentic Blue Verified Checkmark Badge matching reference mockup */}
                <span
                  className="shrink-0 inline-flex items-center justify-center text-sky-500 dark:text-sky-400"
                  title="Verified BrainWorker"
                  aria-label="Verified BrainWorker"
                >
                  <svg
                    className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-current"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.7 14.3l-3.6-3.6 1.4-1.4 2.2 2.2 5.6-5.6 1.4 1.4-7 7z" />
                  </svg>
                </span>
              </div>
              <p className="mt-0.5 truncate text-xs font-medium text-[var(--text-muted)]">
                {worker.title}
              </p>
              <div className="mt-1 flex items-center gap-1 text-xs text-[var(--text-muted)]">
                <MapPin className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden="true" />
                <span className="truncate">{worker.location}</span>
              </div>
            </div>

            {/* Craft / Scope Statement */}
            <p className="mt-2.5 line-clamp-2 min-h-[2.5rem] text-xs leading-relaxed text-[var(--text-muted)]">
              {bio}
            </p>

            {/* Three Tactile / Neumorphic Stat Chips */}
            <div className="mt-3 grid grid-cols-3 gap-1.5">
              <div
                className="flex items-center justify-center gap-1 rounded-full py-1.5 px-2 text-xs font-semibold bg-black/[0.03] border border-black/[0.05] text-[var(--text-main)] dark:bg-white/[0.05] dark:border-white/[0.08] dark:text-zinc-200 shadow-inner"
                title={`${completedJobs} Completed Jobs`}
              >
                <Users className="h-3.5 w-3.5 text-[var(--text-muted)] shrink-0" aria-hidden="true" />
                <span>{completedJobs}</span>
              </div>
              <div
                className="flex items-center justify-center gap-1 rounded-full py-1.5 px-2 text-xs font-semibold bg-black/[0.03] border border-black/[0.05] text-[var(--text-main)] dark:bg-white/[0.05] dark:border-white/[0.08] dark:text-zinc-200 shadow-inner"
                title={`${skillsCount} Specialized Disciplines`}
              >
                <Briefcase className="h-3.5 w-3.5 text-[var(--text-muted)] shrink-0" aria-hidden="true" />
                <span>{skillsCount}</span>
              </div>
              <div
                className="flex items-center justify-center gap-1 rounded-full py-1.5 px-2 text-xs font-semibold bg-black/[0.03] border border-black/[0.05] text-[var(--text-main)] dark:bg-white/[0.05] dark:border-white/[0.08] dark:text-zinc-200 shadow-inner"
                title={`Rating: ${rating.toFixed(1)} / 5`}
              >
                <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500 shrink-0" aria-hidden="true" />
                <span>{rating.toFixed(1)}</span>
              </div>
            </div>
          </div>

          {/* Tactile Full-Width Pill CTA Button */}
          <div className="mt-4 pt-1">
            <span className="flex w-full items-center justify-center gap-1.5 rounded-full py-2.5 px-4 text-xs sm:text-sm font-semibold transition-all duration-150 bg-[#E5E8F0] hover:bg-[#DCE0EA] text-[#001A41] border border-black/[0.06] shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] dark:bg-[#1E232E] dark:hover:bg-[#262D3B] dark:text-white dark:border-white/10 dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] active:scale-[0.98]">
              <span>Book BrainWorker</span>
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
            <div className="mt-1.5 text-center">
              <span className="text-[11px] font-semibold text-[var(--brand-green)]">
                From {worker.startingRate}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function FeaturedBrainWorkers({ profileCity }: FeaturedBrainWorkersProps) {
  return (
    <section
      id="workers"
      className="border-b border-[var(--lead)] bg-[var(--bg)] text-[var(--text-main)] py-12 sm:py-16 transition-colors duration-200"
    >
      <div className="mx-auto max-w-[1280px] space-y-6 px-4 sm:space-y-8 sm:px-6 lg:px-8">
        <div>
          <h2 className="font-display tracking-trades text-2xl font-bold text-[var(--text-main)] sm:text-3xl">
            Meet the featured BrainWorkers
          </h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Take a closer look at the services and profile details shown for each BrainWorker.
          </p>
        </div>

        {/* Responsive layout: smooth horizontal snap carousel on mobile, 4-column grid on desktop */}
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-4 px-4 scrollbar-none sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0">
          {featuredWorkers.map((worker) => (
            <div
              key={worker.id}
              className="w-[82vw] max-w-[310px] shrink-0 snap-center sm:w-auto sm:max-w-none"
            >
              <WorkerCard worker={worker} {...(profileCity ? { profileCity } : {})} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
