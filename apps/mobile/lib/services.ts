import { type ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';

export type IconName = ComponentProps<typeof Ionicons>['name'];

export type ServiceGroup =
  | 'Power & Cooling'
  | 'Utilities & Structure'
  | 'Home & Lifestyle';

export interface MobileServiceCategory {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly group: ServiceGroup;
  readonly popularServices: readonly string[];
  readonly icon: IconName;
}

export interface ServiceGroupItem {
  readonly id: string;
  readonly title: ServiceGroup;
  readonly icon: IconName;
}

export const CANONICAL_SERVICES: readonly MobileServiceCategory[] = [
  {
    id: 'generator',
    title: 'Generator Servicing & Repair',
    description:
      'Servicing, repairs, AVR replacement, oil changes, and rewinding for petrol and diesel generators.',
    group: 'Power & Cooling',
    popularServices: [
      'Sumec Firman Repair',
      'Mikano Diesel Service',
      'AVR Replacement',
    ],
    icon: 'flash-outline',
  },
  {
    id: 'ac',
    title: 'AC Repair & Gas Refill',
    description:
      'Installation, repairs, gas refills, compressor checks, and coil cleaning for split-unit ACs.',
    group: 'Power & Cooling',
    popularServices: [
      'Gas Top-Up',
      'AC Uninstallation & Reinstall',
      'Compressor Replacement',
    ],
    icon: 'snow-outline',
  },
  {
    id: 'plumbing',
    title: 'Plumbing & Pipe Fitting',
    description:
      'Leak repairs, water tank work, pressure-pump setup, and bathroom fittings.',
    group: 'Utilities & Structure',
    popularServices: [
      'Overhead Tank Setup',
      'Pipe Leak Repair',
      'Water Heater Installation',
    ],
    icon: 'water-outline',
  },
  {
    id: 'electrical',
    title: 'Electrical & Solar Inverter',
    description:
      'Solar mounting, inverter and battery setup, circuit-breaker checks, and conduit wiring.',
    group: 'Utilities & Structure',
    popularServices: [
      'Solar Inverter Setup',
      'Prepaid Meter Installation',
      'Distribution Board Repair',
    ],
    icon: 'sunny-outline',
  },
  {
    id: 'cleaning',
    title: 'Deep Cleaning & Post-Construction',
    description:
      'Deep cleaning for homes, move-ins, post-construction spaces, sofas, and carpets.',
    group: 'Home & Lifestyle',
    popularServices: [
      'Post-Construction Clean',
      'Move-In Deep Cleaning',
      'Sofa Washing',
    ],
    icon: 'sparkles-outline',
  },
  {
    id: 'carpentry',
    title: 'Furniture & Carpentry Work',
    description:
      'Cabinet building, wardrobe repairs, door-lock fitting, and bed-frame assembly.',
    group: 'Home & Lifestyle',
    popularServices: [
      'Kitchen Cabinet Setup',
      'Door Lock Replacement',
      'Wardrobe Fitting',
    ],
    icon: 'hammer-outline',
  },
  {
    id: 'tv-mounting',
    title: 'DSTV & TV Wall Mounting',
    description:
      'TV mounting, concealed cable trunking, DSTV dish alignment, and surround-sound cabling.',
    group: 'Home & Lifestyle',
    popularServices: [
      'TV Wall Mount 32"-75"',
      'DSTV Dish Realignment',
      'Concealed Cable Trunking',
    ],
    icon: 'tv-outline',
  },
  {
    id: 'moving',
    title: 'Haulage & Home Relocation',
    description:
      'Covered trucks, careful furniture packing, loading, and relocation support.',
    group: 'Home & Lifestyle',
    popularServices: [
      '2-Bedroom Relocation',
      'Interstate Trucking',
      'Office Furniture Moving',
    ],
    icon: 'cube-outline',
  },
] as const;

export const SERVICE_GROUPS: readonly ServiceGroupItem[] = [
  { id: 'power', title: 'Power & Cooling', icon: 'flash-outline' },
  { id: 'utilities', title: 'Utilities & Structure', icon: 'construct-outline' },
  { id: 'lifestyle', title: 'Home & Lifestyle', icon: 'home-outline' },
] as const;

export function normalizeSearchQuery(query: string | null | undefined): string {
  if (!query || typeof query !== 'string') return '';
  return query.trim();
}

export function getServiceById(id: string): MobileServiceCategory | undefined {
  return CANONICAL_SERVICES.find((service) => service.id === id);
}

function matchesSearchTerm(
  service: MobileServiceCategory,
  term: string
): boolean {
  return (
    service.title.toLowerCase().includes(term) ||
    service.description.toLowerCase().includes(term) ||
    service.popularServices.some((task) => task.toLowerCase().includes(term))
  );
}

export function filterServices(
  services: readonly MobileServiceCategory[],
  options: { query?: string; group?: string }
): MobileServiceCategory[] {
  const normalizedQuery = normalizeSearchQuery(options.query).toLowerCase();
  const selectedGroup = options.group && options.group !== 'All' ? options.group : undefined;

  return services.filter((service) => {
    if (selectedGroup && service.group !== selectedGroup) {
      return false;
    }
    if (normalizedQuery && !matchesSearchTerm(service, normalizedQuery)) {
      return false;
    }
    return true;
  });
}
