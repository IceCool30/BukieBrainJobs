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

function CategoryButton({ category, onSelect }: { category: ServiceCategory; onSelect?: ((category: ServiceCategory) => void) | undefined }) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(category)}
      aria-label={category.title}
      className="motion-press flex h-20 w-[68px] shrink-0 flex-col items-center justify-center gap-1 rounded-xl px-1 text-center transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#296A4B] focus-visible:ring-offset-2 sm:h-[104px] sm:w-full sm:gap-2"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F2F8F4] sm:h-12 sm:w-12">
        <ServiceTaskIcon categoryId={category.id} className="h-7 w-7 sm:h-9 sm:w-9" />
      </span>
      <span className="w-full truncate text-[10px] font-semibold leading-tight text-[#001A41] sm:overflow-visible sm:text-clip sm:text-xs sm:whitespace-normal">
        {HOME_CATEGORY_LABELS[category.id] ?? category.title}
      </span>
    </button>
  );
}

export default function ServiceCategoryRail({ onSelectCategory }: Props) {
  return (
    <nav aria-label="Browse service categories" className="-mx-1 flex gap-2.5 overflow-x-auto px-1 pb-1 scrollbar-none sm:mx-0 sm:grid sm:grid-cols-8 sm:gap-3 sm:overflow-visible sm:px-0">
      {SERVICE_CATEGORIES.map((category) => (
        <CategoryButton key={category.id} category={category} onSelect={onSelectCategory} />
      ))}
    </nav>
  );
}
