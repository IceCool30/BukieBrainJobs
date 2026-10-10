'use client';

import ServiceTaskIcon from './ServiceTaskIcon';
import { SERVICE_CATEGORIES, ServiceCategory } from '../lib/mock/homepage-data';

interface Props {
  onSelectCategory?: ((category: ServiceCategory) => void) | undefined;
}

const HOME_CATEGORY_LABELS: Record<string, string> = {
  generator: 'Generator',
  ac: 'AC repair',
  plumbing: 'Plumbing',
  electrical: 'Electrical',
  cleaning: 'Cleaning',
  carpentry: 'Carpentry',
  'tv-mounting': 'TV mounting',
  moving: 'Moving',
};

function CategoryButton({
  category,
  onSelect,
}: {
  category: ServiceCategory;
  onSelect?: ((category: ServiceCategory) => void) | undefined;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(category)}
      aria-label={category.title}
      className="group relative flex h-[88px] w-[76px] sm:h-[108px] sm:w-full shrink-0 flex-col items-center justify-center gap-1.5 rounded-2xl p-2 transition-all duration-200 border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] backdrop-blur-md hover:bg-white dark:hover:bg-white/[0.08] hover:border-[var(--amber)]/70 shadow-xs hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)] active:scale-95"
    >
      <span className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-slate-100/90 dark:bg-white/[0.06] transition-transform duration-200 group-hover:scale-105">
        <ServiceTaskIcon categoryId={category.id} className="h-7 w-7 sm:h-8 sm:w-8" />
      </span>
      <span className="w-full truncate text-[11px] sm:text-xs font-semibold leading-tight text-[var(--text-main)] group-hover:text-[var(--amber)] transition-colors text-center px-0.5">
        {HOME_CATEGORY_LABELS[category.id] ?? category.title}
      </span>
    </button>
  );
}

export default function ServiceCategoryRail({ onSelectCategory }: Props) {
  return (
    <nav
      aria-label="Browse service categories"
      className="-mx-1 flex gap-2.5 overflow-x-auto px-1 pb-2 scrollbar-none sm:mx-0 sm:grid sm:grid-cols-8 sm:gap-3 sm:overflow-visible sm:px-0"
    >
      {SERVICE_CATEGORIES.map((category) => (
        <CategoryButton key={category.id} category={category} onSelect={onSelectCategory} />
      ))}
    </nav>
  );
}
