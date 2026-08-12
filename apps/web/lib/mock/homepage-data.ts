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
  { id: 'ibadan', name: 'Ibadan', state: 'Oyo State', status: 'soon', popularArea: 'Bodija / Oluyole' },
  { id: 'enugu', name: 'Enugu', state: 'Enugu State', status: 'soon', popularArea: 'Independence Layout' },
  { id: 'kano', name: 'Kano', state: 'Kano State', status: 'soon', popularArea: 'Nassarawa GRA' },
  { id: 'benin', name: 'Benin City', state: 'Edo State', status: 'soon', popularArea: 'GRA Benin' },
];

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: 'generator',
    title: 'Generator Servicing & Repair',
    description: 'Diagnose diesel and petrol generators, AVR replacements, oil changes, and heavy rewinding.',
    iconName: 'Zap',
    photoUrl: '/images/service-generator.jpg',
    startingPrice: '₦10,000',
    popularServices: ['Sumec Firman Repair', 'Mikano Diesel Service', 'AVR Replacement'],
    group: 'Power & Cooling',
  },
  {
    id: 'ac',
    title: 'AC Repair & Gas Refill',
    description: 'Split unit installation, R22/R410 gas refilling, compressor diagnostics, and coil cleaning.',
    iconName: 'Wind',
    photoUrl: '/images/service-ac.jpg',
    startingPrice: '₦12,000',
    popularServices: ['Gas Top-Up', 'AC Uninstallation & Reinstall', 'Compressor Replacement'],
    group: 'Power & Cooling',
  },
  {
    id: 'plumbing',
    title: 'Plumbing & Pipe Fitting',
    description: 'Fix water tank overflows, leak repairs, pressure pump setup, and bathroom fitting.',
    iconName: 'Wrench',
    photoUrl: '/images/service-plumbing.jpg',
    startingPrice: '₦8,000',
    popularServices: ['Overhead Tank Setup', 'Pipe Leak Repair', 'Water Heater Installation'],
    group: 'Utilities & Structure',
  },
  {
    id: 'electrical',
    title: 'Electrical & Solar Inverter',
    description: 'Solar panel mounting, inverter battery setup, circuit breaker troubleshooting, and conduit wiring.',
    iconName: 'Sun',
    photoUrl: '/images/service-electrical.jpg',
    startingPrice: '₦15,000',
    popularServices: ['Solar Inverter Setup', 'Prepaid Meter Installation', 'Distribution Board Repair'],
    group: 'Utilities & Structure',
  },
  {
    id: 'cleaning',
    title: 'Deep Cleaning & Post-Construction',
    description: 'Residential deep cleaning, post-tenant renovation scrubbing, sofa and carpet extraction.',
    iconName: 'Sparkles',
    photoUrl: '/images/service-cleaning.jpg',
    startingPrice: '₦15,000',
    popularServices: ['Post-Construction Clean', 'Move-In Deep Cleaning', 'Sofa Washing'],
    group: 'Home & Lifestyle',
  },
  {
    id: 'carpentry',
    title: 'Furniture & Carpentry Work',
    description: 'Kitchen cabinet building, wardrobe repair, door lock installation, and bed frame assembly.',
    iconName: 'Hammer',
    photoUrl: '/images/service-carpentry.jpg',
    startingPrice: '₦10,000',
    popularServices: ['Kitchen Cabinet Setup', 'Door Lock Replacement', 'Wardrobe Fitting'],
    group: 'Home & Lifestyle',
  },
  {
    id: 'tv-mounting',
    title: 'DSTV & TV Wall Mounting',
    description: 'Full HD TV wall mounting, concealed trunking, DSTV dish alignment, and surround sound cabling.',
    iconName: 'Tv',
    photoUrl: '/images/service-tv-mounting.jpg',
    startingPrice: '₦7,500',
    popularServices: ['TV Wall Mount 32"-75"', 'DSTV Dish Realignment', 'Concealed Cable Trunking'],
    group: 'Home & Lifestyle',
  },
  {
    id: 'moving',
    title: 'Haulage & Home Relocation',
    description: 'Covered truck hire, careful furniture packing, loading, and interstate relocation support.',
    iconName: 'Truck',
    photoUrl: '/images/service-moving.jpg',
    startingPrice: '₦25,000',
    popularServices: ['2-Bedroom Relocation', 'Interstate Trucking', 'Office Furniture Moving'],
    group: 'Home & Lifestyle',
  },
];

export const MOCK_BRAINWORKERS: BrainWorker[] = [
  {
    id: 'bw-1',
    name: 'Engr. Emeka Nwosu',
    title: 'Senior Generator & Power Specialist',
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
    title: 'Certified HVAC & AC Specialist',
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
    title: 'Master Plumber & Pipe Fitter',
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
    title: 'Clean Energy & Solar Engineer',
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

export const MOCK_TESTIMONIALS: CustomerTestimonial[] = [
  {
    id: 't-1',
    author: 'Dr. (Mrs) Funke Balogun',
    role: 'Homeowner & Medical Practitioner',
    location: 'Victoria Island, Lagos',
    service: 'AC Repair & Inverter Solar Setup',
    rating: 5,
    quote: "We've been burned before by technicians who promised and disappeared. This time the engineer showed up at 10am exactly, showed his ID before touching anything, and I could see my payment sitting in escrow the whole time. When the AC finally blew cold air, I approved it myself.",
    verifiedBooking: true,
  },
  {
    id: 't-2',
    author: 'Alhaji Usman Bello',
    role: 'Facility Manager, Apex Heights',
    location: 'Maitama, Abuja',
    service: 'Commercial Plumbing & Tank Maintenance',
    rating: 5,
    quote: "As facility manager I spend most of my week chasing artisans who don't show. BukieBrainJobs sent two verified plumbers who fixed our water pressure issue in under three hours. I released payment from the app once I checked the work. Simple.",
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
    question: 'How does BukieBrainJobs protect my money when I book a service?',
    answer: 'You pay into an escrow account, not directly to the worker. The money sits protected while the job is done, and is only released once you inspect the work and confirm you are happy with it.',
    category: 'Payments & Escrow',
  },
  {
    id: 'faq-2',
    question: 'What is BukiePassport and how are BrainWorkers verified?',
    answer: 'BukiePassport is our verification system. Tier 1 requires valid government photo ID and BVN confirmation. Tier 2 adds biometric NIN verification, physical residential address verification, and trade skill assessment.',
    category: 'Verification & Trust',
  },
  {
    id: 'faq-3',
    question: 'What is the BukieGuarantee job protection?',
    answer: 'The BukieGuarantee is platform coverage available on qualifying bookings (up to ₦500,000) that protects homeowners against property damage or unsatisfactory work, subject to clear terms and dispute resolution.',
    category: 'Verification & Trust',
  },
  {
    id: 'faq-4',
    question: 'Can I request quotes by posting a job instead of booking directly?',
    answer: 'Yes. For custom tasks or bigger projects, use "Post a Job". Describe what you need, where, and your budget range, and qualified verified BrainWorkers in your area will come back to you with quotes.',
    category: 'General',
  },
  {
    id: 'faq-5',
    question: 'Which Nigerian cities are currently active for bookings?',
    answer: 'Full live bookings are available in Lagos, Abuja, and Port Harcourt. We are opening 34 more state capitals, including Ibadan, Enugu, Kano, and Benin City. You can register your interest for those cities now.',
    category: 'General',
  },
  {
    id: 'faq-6',
    question: 'How do I join as a skilled artisan or technician?',
    answer: 'Click "Become a BrainWorker" at the top of the page. You will build your profile, submit your ID and trade documents for BukiePassport vetting, and start receiving job requests once you are approved.',
    category: 'General',
  },
];
