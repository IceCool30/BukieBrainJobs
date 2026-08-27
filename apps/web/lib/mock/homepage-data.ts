export interface NigerianLocation {
  id: string;
  name: string;
  state: string;
  status: 'active' | 'soon';
  popularArea?: string;
}

export interface ServiceCategory {
  id: string;
  title: string;
  description: string;
  iconName: string;
  photoUrl: string;
  startingPrice: string;
  popularServices: string[];
  group: 'Power & Cooling' | 'Utilities & Structure' | 'Home & Lifestyle';
}

export interface BrainWorker {
  id: string;
  name: string;
  title: string;
  category: string;
  location: string;
  rating: number;
  reviewCount: number;
  completedJobs: number;
  passportTier: 'Tier 1' | 'Tier 2';
  startingRate: string;
  avatarUrl: string;
  skills: string[];
}

export interface PublicBrainWorker {
  id: string;
  name: string;
  title: string;
  category: string;
  location: string;
  startingRate: string;
  avatarUrl: string;
  skills: string[];
}

export interface PublicBrainWorkerContext {
  service?: ServiceCategory;
  city?: string;
}

export interface PublicBrainWorkerContextQuery {
  serviceId?: string | string[];
  city?: string | string[];
  service?: string | string[];
}

export interface CustomerTestimonial {
  id: string;
  author: string;
  role: string;
  location: string;
  service: string;
  rating: number;
  quote: string;
  verifiedBooking: boolean;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'General' | 'Payments & Escrow' | 'Verification & Trust';
}

export const NIGERIAN_LOCATIONS: NigerianLocation[] = [
  { id: 'lagos', name: 'Lagos', state: 'Lagos State', status: 'active', popularArea: 'Ikeja / Lekki / VI' },
  { id: 'abuja', name: 'Abuja (FCT)', state: 'Federal Capital Territory', status: 'active', popularArea: 'Maitama / Wuse 2' },
  { id: 'ph', name: 'Port Harcourt', state: 'Rivers State', status: 'active', popularArea: 'GRA Phase 2 / Trans-Amadi' },
  { id: 'ibadan', name: 'Ibadan', state: 'Oyo State', status: 'active', popularArea: 'Bodija / Oluyole' },
  { id: 'enugu', name: 'Enugu', state: 'Enugu State', status: 'active', popularArea: 'Independence Layout' },
  { id: 'kano', name: 'Kano', state: 'Kano State', status: 'active', popularArea: 'Nassarawa GRA' },
  { id: 'benin', name: 'Benin City', state: 'Edo State', status: 'active', popularArea: 'GRA Benin' },
];

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: 'generator',
    title: 'Generator Servicing & Repair',
    description: 'Servicing, repairs, AVR replacement, oil changes, and rewinding for petrol and diesel generators.',
    iconName: 'Zap',
    photoUrl: '/images/service-generator.jpg',
    startingPrice: '₦10,000',
    popularServices: ['Sumec Firman Repair', 'Mikano Diesel Service', 'AVR Replacement'],
    group: 'Power & Cooling',
  },
  {
    id: 'ac',
    title: 'AC Repair & Gas Refill',
    description: 'Installation, repairs, gas refills, compressor checks, and coil cleaning for split-unit ACs.',
    iconName: 'Wind',
    photoUrl: '/images/service-ac.jpg',
    startingPrice: '₦12,000',
    popularServices: ['Gas Top-Up', 'AC Uninstallation & Reinstall', 'Compressor Replacement'],
    group: 'Power & Cooling',
  },
  {
    id: 'plumbing',
    title: 'Plumbing & Pipe Fitting',
    description: 'Leak repairs, water tank work, pressure-pump setup, and bathroom fittings.',
    iconName: 'Wrench',
    photoUrl: '/images/service-plumbing.jpg',
    startingPrice: '₦8,000',
    popularServices: ['Overhead Tank Setup', 'Pipe Leak Repair', 'Water Heater Installation'],
    group: 'Utilities & Structure',
  },
  {
    id: 'electrical',
    title: 'Electrical & Solar Inverter',
    description: 'Solar mounting, inverter and battery setup, circuit-breaker checks, and conduit wiring.',
    iconName: 'Sun',
    photoUrl: '/images/service-electrical.jpg',
    startingPrice: '₦15,000',
    popularServices: ['Solar Inverter Setup', 'Prepaid Meter Installation', 'Distribution Board Repair'],
    group: 'Utilities & Structure',
  },
  {
    id: 'cleaning',
    title: 'Deep Cleaning & Post-Construction',
    description: 'Deep cleaning for homes, move-ins, post-construction spaces, sofas, and carpets.',
    iconName: 'Sparkles',
    photoUrl: '/images/service-cleaning.jpg',
    startingPrice: '₦15,000',
    popularServices: ['Post-Construction Clean', 'Move-In Deep Cleaning', 'Sofa Washing'],
    group: 'Home & Lifestyle',
  },
  {
    id: 'carpentry',
    title: 'Furniture & Carpentry Work',
    description: 'Cabinet building, wardrobe repairs, door-lock fitting, and bed-frame assembly.',
    iconName: 'Hammer',
    photoUrl: '/images/service-carpentry.jpg',
    startingPrice: '₦10,000',
    popularServices: ['Kitchen Cabinet Setup', 'Door Lock Replacement', 'Wardrobe Fitting'],
    group: 'Home & Lifestyle',
  },
  {
    id: 'tv-mounting',
    title: 'DSTV & TV Wall Mounting',
    description: 'TV mounting, concealed cable trunking, DSTV dish alignment, and surround-sound cabling.',
    iconName: 'Tv',
    photoUrl: '/images/service-tv-mounting.jpg',
    startingPrice: '₦7,500',
    popularServices: ['TV Wall Mount 32"-75"', 'DSTV Dish Realignment', 'Concealed Cable Trunking'],
    group: 'Home & Lifestyle',
  },
  {
    id: 'moving',
    title: 'Haulage & Home Relocation',
    description: 'Covered trucks, careful furniture packing, loading, and relocation support.',
    iconName: 'Truck',
    photoUrl: '/images/service-moving.jpg',
    startingPrice: '₦25,000',
    popularServices: ['2-Bedroom Relocation', 'Interstate Trucking', 'Office Furniture Moving'],
    group: 'Home & Lifestyle',
  },
];

export function getServiceCategory(serviceId: string) {
  return SERVICE_CATEGORIES.find((category) => category.id === serviceId);
}

export const PUBLIC_BRAINWORKER_IDS = ['bw-1', 'bw-2', 'bw-3', 'bw-4'] as const;

function getSingleQueryValue(value: string | string[] | undefined) {
  return typeof value === 'string' ? value : undefined;
}

export function resolvePublicBrainWorkerContext(
  query: PublicBrainWorkerContextQuery,
): PublicBrainWorkerContext {
  const serviceId = getSingleQueryValue(query.serviceId);
  const city = getSingleQueryValue(query.city);

  const context: PublicBrainWorkerContext = {};
  const service = serviceId ? getServiceCategory(serviceId) : undefined;
  if (service) context.service = service;
  if (city && NIGERIAN_LOCATIONS.some((location) => location.name === city && location.status === 'active')) context.city = city;
  return context;
}

export const MOCK_BRAINWORKERS: BrainWorker[] = [
  {
    id: 'bw-1',
    name: 'Engr. Emeka Nwosu',
    title: 'Generator and Power Services',
    category: 'Generator Repair',
    location: 'Lekki Phase 1, Lagos',
    rating: 4.9,
    reviewCount: 142,
    completedJobs: 188,
    passportTier: 'Tier 2',
    startingRate: '₦12,000',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400&h=400&crop=faces&fp-x=0.5&fp-y=0.2',
    skills: ['Mikano & Perkins Diesel', 'Sumec / Marapco AVR', 'Automatic Transfer Switch (ATS)'],
  },
  {
    id: 'bw-2',
    name: 'Babatunde Adebayo',
    title: 'AC Service and Repair',
    category: 'AC Repair',
    location: 'Ikeja GRA, Lagos',
    rating: 4.95,
    reviewCount: 98,
    completedJobs: 134,
    passportTier: 'Tier 2',
    startingRate: '₦10,000',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400&h=400&crop=faces&fp-x=0.5&fp-y=0.2',
    skills: ['Inverter AC Repair', 'R410 Gas Pressure Top-Up', 'Commercial Chiller Units'],
  },
  {
    id: 'bw-3',
    name: 'Chinedu Eze',
    title: 'Plumbing and Pipe Fitting',
    category: 'Plumbing',
    location: 'Wuse Zone 4, Abuja',
    rating: 4.88,
    reviewCount: 86,
    completedJobs: 112,
    passportTier: 'Tier 2',
    startingRate: '₦8,500',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400&h=400&crop=faces&fp-x=0.5&fp-y=0.2',
    skills: ['PPR & Copper Piping', 'Pressure Pump Setup', 'Overhead Tank Plumbing'],
  },
  {
    id: 'bw-4',
    name: 'Tariq Olanrewaju',
    title: 'Solar and Electrical Services',
    category: 'Solar & Electrical',
    location: 'GRA Phase 2, Port Harcourt',
    rating: 4.92,
    reviewCount: 74,
    completedJobs: 95,
    passportTier: 'Tier 2',
    startingRate: '₦18,000',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400&h=400&crop=faces&fp-x=0.5&fp-y=0.2',
    skills: ['Lithium Battery Bank Design', 'Felicity & Must Inverters', 'Smart Prepaid Meters'],
  },
];

export function getPublicBrainWorker(id: string): PublicBrainWorker | undefined {
  if (!PUBLIC_BRAINWORKER_IDS.includes(id as (typeof PUBLIC_BRAINWORKER_IDS)[number])) return undefined;
  const worker = MOCK_BRAINWORKERS.find((candidate) => candidate.id === id);
  if (!worker) return undefined;

  return {
    id: worker.id,
    name: worker.name,
    title: worker.title,
    category: worker.category,
    location: worker.location,
    startingRate: worker.startingRate,
    avatarUrl: worker.avatarUrl,
    skills: worker.skills,
  };
}

export function getPublicBrainWorkers() {
  return PUBLIC_BRAINWORKER_IDS.flatMap((id) => {
    const worker = getPublicBrainWorker(id);
    return worker ? [worker] : [];
  });
}

export function buildPublicBrainWorkerServicesUrl(context: PublicBrainWorkerContext) {
  if (!context.service || !context.city) return undefined;
  return `/services?${new URLSearchParams({
    category: context.service.id,
    q: context.service.title,
    city: context.city,
  }).toString()}`;
}

export function buildPublicBrainWorkerBookingUrl(
  profile: PublicBrainWorker,
  context: PublicBrainWorkerContext,
) {
  if (!context.service || !context.city) return undefined;
  return `/book?${new URLSearchParams({
    service: context.service.title,
    price: profile.startingRate,
    city: context.city,
    worker: profile.name,
  }).toString()}`;
}

export const MOCK_TESTIMONIALS: CustomerTestimonial[] = [
  {
    id: 't-1',
    author: 'Dr. (Mrs) Funke Balogun',
    role: 'Homeowner & Medical Practitioner',
    location: 'Victoria Island, Lagos',
    service: 'AC Repair & Inverter Solar Setup',
    rating: 5,
    quote: "We had been let down before. This time, the BrainWorker arrived at 10am, showed their ID before touching anything, and I could see my payment sitting in escrow. When the AC finally blew cold air, I approved it myself.",
    verifiedBooking: true,
  },
  {
    id: 't-2',
    author: 'Alhaji Usman Bello',
    role: 'Facility Manager, Apex Heights',
    location: 'Maitama, Abuja',
    service: 'Commercial Plumbing & Tank Maintenance',
    rating: 5,
    quote: "As a facility manager, I spend most of my week chasing people who do not show. BukieBrainJobs sent two verified BrainWorkers who fixed our water-pressure issue in under three hours. I released payment from the app once I checked the work. Simple.",
    verifiedBooking: true,
  },
  {
    id: 't-3',
    author: 'Kelechi Amadi',
    role: 'Tech Startup Co-Founder',
    location: 'GRA Phase 2, Port Harcourt',
    service: 'Office Relocation & Solar Power Setup',
    rating: 5,
    quote: "We moved our office and needed power and cabling done fast. Quotes came in the same day, prices were exactly what was agreed, and nothing extra appeared on the final invoice. That alone is worth the platform.",
    verifiedBooking: true,
  },
  {
    id: 't-4',
    author: 'Ngozi Okoro',
    role: 'Working Mother',
    location: 'Lekki Phase 1, Lagos',
    service: 'Generator Servicing & Repair',
    rating: 5,
    quote: "Emeka serviced our Mikano generator in the morning and explained every step as he worked. My payment stayed in escrow until I tested the changeover myself. That is the first time a generator man has ever shown up and stayed.",
    verifiedBooking: true,
  },
  {
    id: 't-5',
    author: 'Chidi Mbanefo',
    role: 'Real Estate Agent',
    location: 'Wuse 2, Abuja',
    service: 'TV & DSTV Wall Mounting',
    rating: 5,
    quote: "My client moved into a new flat in Maitama and needed the TV mounted and DSTV realigned same week. Tariq did both in one visit, concealed all the trunking, and the final bill matched the quote to the naira.",
    verifiedBooking: true,
  },
  {
    id: 't-6',
    author: 'Adaeze Uche',
    role: 'Interior Designer',
    location: 'GRA Phase 2, Port Harcourt',
    service: 'Deep Cleaning & Post-Construction',
    rating: 5,
    quote: "I had booked cleaners before who cut corners and vanished before I could complain. This time the team stayed until I walked through every room, and the platform held my payment the entire time. The sofa came out looking new.",
    verifiedBooking: true,
  },
];

export const MOCK_FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'What should I check before I book?',
    answer: 'Take a moment to check the service, the work you need done, the starting price, location, and timing.',
    category: 'Payments & Escrow',
  },
  {
    id: 'faq-2',
    question: 'What can I check on a BrainWorker profile?',
    answer: 'Open the profile to look at the service focus and the details listed there before you decide.',
    category: 'Verification & Trust',
  },
  {
    id: 'faq-3',
    question: 'What is BukieGuarantee?',
    answer: 'BukieGuarantee explains the details to review before you move ahead. Read the terms for the current information.',
    category: 'Verification & Trust',
  },
  {
    id: 'faq-4',
    question: 'Can I prepare a custom job?',
    answer: 'Yes. Write down the work you need, your location, your budget range, and any useful details before the job-posting step.',
    category: 'General',
  },
  {
    id: 'faq-5',
    question: 'Where is BukieBrainJobs available?',
    answer: 'Choose a location when you search to see the services currently shown there.',
    category: 'General',
  },
  {
    id: 'faq-6',
    question: 'How can I become a BrainWorker?',
    answer: 'Create your profile, add your service and location, then complete verification to start receiving relevant jobs.',
    category: 'General',
  },
];
