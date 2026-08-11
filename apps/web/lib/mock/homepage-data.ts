export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName: string;
  startingPrice: string;
  artisanCount: number;
  popularTasks: string[];
}

export interface NigerianLocation {
  city: string;
  state: string;
  status: 'active' | 'coming_soon' | 'unsupported';
  popularHubs?: string[];
}

export interface BrainWorker {
  id: string;
  name: string;
  title: string;
  avatarUrl: string;
  location: string;
  rating: number;
  reviewCount: number;
  completedJobs: number;
  passportTier: 'Tier 1' | 'Tier 2' | 'Tier 3';
  hourlyRate: string;
  bio: string;
  verifiedBadge: boolean;
  skills: string[];
  responseMinutes: number;
}

export interface Testimonial {
  id: string;
  customerName: string;
  location: string;
  avatarUrl: string;
  rating: number;
  date: string;
  comment: string;
  serviceCategory: string;
  verifiedBooking: boolean;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'booking' | 'payments' | 'safety' | 'artisans';
}

export const MOCK_CATEGORIES: ServiceCategory[] = [
  {
    id: 'cat-1',
    name: 'Generator Servicing & Solar',
    slug: 'generator-solar',
    description: 'Mikano, Perkins, Tiger & Solar Inverter installation & repairs',
    iconName: 'Zap',
    startingPrice: '₦12,000',
    artisanCount: 340,
    popularTasks: ['Heavy Gen Servicing', 'Small Gen Coil Rewind', 'Inverter Battery Setup', 'Automatic Changeover Switch']
  },
  {
    id: 'cat-2',
    name: 'AC Repair & Servicing',
    slug: 'ac-repair',
    description: 'Split unit, standing AC, gas refilling & deep coil washing',
    iconName: 'Wind',
    startingPrice: '₦10,000',
    artisanCount: 420,
    popularTasks: ['R410/R22 Gas Refill', 'AC Outdoor Unit Fix', 'Compressor Replacement', 'Uninstallation & Mounting']
  },
  {
    id: 'cat-3',
    name: 'Plumbing & Water Tanks',
    slug: 'plumbing',
    description: 'Pumping machine, GeePee tank connection, leakages & drainage',
    iconName: 'Droplets',
    startingPrice: '₦8,500',
    artisanCount: 290,
    popularTasks: ['Submersible Pump Fix', 'GeePee Tank Plumbing', 'WC / Sink Unblocking', 'Water Heater Piping']
  },
  {
    id: 'cat-4',
    name: 'Electrical & House Wiring',
    slug: 'electrical',
    description: 'Prepaid meter bypass fix, conduit wiring, DB board & lighting',
    iconName: 'Cpu',
    startingPrice: '₦9,000',
    artisanCount: 380,
    popularTasks: ['Prepaid Meter Setup', 'Distribution Board Wiring', 'Chandeliers & LED Strip', 'Fault Tracing']
  },
  {
    id: 'cat-5',
    name: 'TV & DSTV Wall Mounting',
    slug: 'tv-mounting',
    description: 'Ultra-thin wall brackets, cable trunking & dish signal tracking',
    iconName: 'Tv',
    startingPrice: '₦7,000',
    artisanCount: 210,
    popularTasks: ['75" Curved TV Mount', 'DSTV / StarTimes Dish Alignment', 'Concealed Cable Trunking', 'Soundbar Installation']
  },
  {
    id: 'cat-6',
    name: 'Moving & Heavy Hauling',
    slug: 'moving-hauling',
    description: 'Apartment relocation, office moving & van loading with movers',
    iconName: 'Truck',
    startingPrice: '₦25,000',
    artisanCount: 175,
    popularTasks: ['3-Bedroom Relocation', 'Office Furniture Move', 'Heavy Appliance Transport', 'Packing & Unpacking']
  },
  {
    id: 'cat-7',
    name: 'House Cleaning & Laundry',
    slug: 'cleaning',
    description: 'Deep post-construction cleaning, sofa fumigation & housekeeping',
    iconName: 'Sparkles',
    startingPrice: '₦15,000',
    artisanCount: 510,
    popularTasks: ['Deep Kitchen & Toilet Clean', 'Post-Construction Washing', 'Upholstery & Sofa Shampoo', 'Fumigation']
  },
  {
    id: 'cat-8',
    name: 'Carpentry & Furniture Assembly',
    slug: 'carpentry',
    description: 'Wardrobe fitting, kitchen cabinet repairs, doors & bed frames',
    iconName: 'Hammer',
    startingPrice: '₦10,000',
    artisanCount: 260,
    popularTasks: ['Flatpack Wardrobe Assembly', 'Lock & Hinge Replacement', 'Kitchen Cabinet Polish', 'Door Hanging']
  },
  {
    id: 'cat-9',
    name: 'Painting & POP Ceiling Repair',
    slug: 'painting-pop',
    description: 'Screeding, dampness treatment, POP repair & exterior painting',
    iconName: 'Paintbrush',
    startingPrice: '₦18,000',
    artisanCount: 190,
    popularTasks: ['1-Bedroom Screeding & Paint', 'POP Water Leak Crack Patch', '3D Wall Panel Fixing', 'Exterior Weatherproof Paint']
  },
  {
    id: 'cat-10',
    name: 'Digital & Event Errands',
    slug: 'errands-events',
    description: 'Event canopy setup, videography, home tutoring & local errands',
    iconName: 'ShoppingBag',
    startingPrice: '₦6,000',
    artisanCount: 310,
    popularTasks: ['Market Shopping & Delivery', 'Event Sound System Operator', 'Private Math Tutor', 'Passport Photo & Document Pickup']
  }
];

export const NIGERIAN_LOCATIONS: NigerianLocation[] = [
  { city: 'Ikeja', state: 'Lagos', status: 'active', popularHubs: ['Allen Avenue', 'GRA', 'Computer Village', 'Oregun'] },
  { city: 'Lagos Island / Victoria Island / Lekki', state: 'Lagos', status: 'active', popularHubs: ['Ikoyi', 'Lekki Phase 1', 'Ajah', 'Chevron'] },
  { city: 'Surulere / Yaba', state: 'Lagos', status: 'active', popularHubs: ['Adeniran Ogunsanya', 'Akoka', 'Bode Thomas', 'Ojuelegba'] },
  { city: 'Abuja (FCT)', state: 'Federal Capital Territory', status: 'active', popularHubs: ['Maitama', 'Asokoro', 'Wuse 2', 'Gwarinpa', 'Utako'] },
  { city: 'Port Harcourt', state: 'Rivers', status: 'active', popularHubs: ['GRA Phase 2', 'Trans Amadi', 'Ada George', 'Eliozu'] },
  { city: 'Ibadan', state: 'Oyo', status: 'active', popularHubs: ['Bodija', 'Ring Road', 'Jericho', 'Oluyole'] },
  { city: 'Benin City', state: 'Edo', status: 'active', popularHubs: ['GRA Benin', 'Airport Road', 'Sapele Road'] },
  { city: 'Enugu', state: 'Enugu', status: 'active', popularHubs: ['Independence Layout', 'GRA Enugu', 'New Haven'] },
  { city: 'Abeokuta', state: 'Ogun', status: 'active', popularHubs: ['Ibara', 'Kuto', 'Oke-Mosan'] },
  { city: 'Kano', state: 'Kano', status: 'coming_soon', popularHubs: ['Nassarawa GRA', 'Sabon Gari'] },
  { city: 'Kaduna', state: 'Kaduna', status: 'coming_soon', popularHubs: ['Barnawa', 'Ungwan Rimi'] },
  { city: 'Calabar', state: 'Cross River', status: 'coming_soon', popularHubs: ['State Housing', 'Etta Agbor'] },
  { city: 'Asaba', state: 'Delta', status: 'coming_soon', popularHubs: ['Okpanam Road', 'GRA Asaba'] },
  { city: 'Uyo', state: 'Akwa Ibom', status: 'coming_soon', popularHubs: ['Ewet Housing', 'Udo Udoma'] },
  { city: 'Owerri', state: 'Imo', status: 'coming_soon', popularHubs: ['World Bank', 'Ikenegbu'] },
  { city: 'Akure', state: 'Ondo', status: 'coming_soon', popularHubs: ['Alagbaka', 'Ijapo'] },
  { city: 'Ilorin', state: 'Kwara', status: 'coming_soon', popularHubs: ['Tanke', 'GRA Ilorin'] },
  { city: 'Jos', state: 'Plateau', status: 'coming_soon', popularHubs: ['Rayfield', 'Anglo-Jos'] }
];

export const MOCK_BRAINWORKERS: BrainWorker[] = [
  {
    id: 'bw-101',
    name: 'Emeka Ogunleye',
    title: 'Certified Solar & Inverter Systems Engineer',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    location: 'Ikeja, Lagos',
    rating: 4.95,
    reviewCount: 142,
    completedJobs: 188,
    passportTier: 'Tier 3',
    hourlyRate: '₦12,500 / hr',
    bio: 'COREN registered electrical technician with 8+ years specializing in residential solar installations, automatic changeover switches, and generator synchronization across Lagos & Ogun State.',
    verifiedBadge: true,
    skills: ['Solar Inverters', 'Generator Servicing', 'Prepaid Meters', 'Lithium Batteries'],
    responseMinutes: 12
  },
  {
    id: 'bw-102',
    name: 'Blessing Adebayo',
    title: 'Master HVAC & Air Conditioning Specialist',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    location: 'Lekki Phase 1, Lagos',
    rating: 4.92,
    reviewCount: 98,
    completedJobs: 130,
    passportTier: 'Tier 3',
    hourlyRate: '₦10,000 / hr',
    bio: 'Precision AC technician trained at FG Technical College. Expert in eco-friendly R410 gas refilling, standing unit maintenance, and commercial VRF systems for corporate offices.',
    verifiedBadge: true,
    skills: ['Split AC Servicing', 'Gas Refilling', 'Compressor Repair', 'Duct Washing'],
    responseMinutes: 8
  },
  {
    id: 'bw-103',
    name: 'Ibrahim Danjuma',
    title: 'Master Plumber & Pumping Machine Specialist',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    location: 'Maitama, Abuja',
    rating: 4.88,
    reviewCount: 116,
    completedJobs: 154,
    passportTier: 'Tier 2',
    hourlyRate: '₦9,500 / hr',
    bio: 'Dedicated plumber with deep experience in high-pressure water pumps, GeePee tank float valve setup, and subterranean pipe leak detection in Maitama and Wuse 2.',
    verifiedBadge: true,
    skills: ['Submersible Pumps', 'Piping Leaks', 'Water Heater', 'GeePee Tanks'],
    responseMinutes: 15
  },
  {
    id: 'bw-104',
    name: 'Tunde Bakare',
    title: 'Custom Furniture Craftsman & Installer',
    avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&auto=format&fit=crop&q=80',
    location: 'Bodija, Ibadan',
    rating: 4.97,
    reviewCount: 76,
    completedJobs: 92,
    passportTier: 'Tier 3',
    hourlyRate: '₦8,000 / hr',
    bio: 'Professional woodworker with 10 years experience assembling imported flatpack wardrobes, custom kitchen cabinets, and structural roof trusses.',
    verifiedBadge: true,
    skills: ['Wardrobe Assembly', 'Kitchen Cabinets', 'Door Locks', 'Wood Polish'],
    responseMinutes: 20
  }
];

export const MOCK_TESTIMONIALS: Testimonial[] = [
  {
    id: 'test-1',
    customerName: 'Chief Mrs. Florence Okonjo',
    location: 'Ikoyi, Lagos',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    date: '3 days ago',
    comment: 'BukieBrainJobs saved our Sunday! Our 20KVA generator cut off during a family gathering. Emeka arrived within 45 minutes, diagnosed the injector pump, and got power restored cleanly. Payment via Escrow gave total peace of mind.',
    serviceCategory: 'Generator Servicing',
    verifiedBooking: true
  },
  {
    id: 'test-2',
    customerName: 'Dr. Chidi Nwachukwu',
    location: 'Wuse 2, Abuja',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    date: '1 week ago',
    comment: 'The NIN & BVN verification process gives me immense confidence when letting artisans into my apartment. Blessing installed 4 AC units cleanly with concealed wiring. Highly recommended!',
    serviceCategory: 'AC Repair',
    verifiedBooking: true
  },
  {
    id: 'test-3',
    customerName: 'Amina Bello',
    location: 'GRA, Port Harcourt',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    date: '2 weeks ago',
    comment: 'Moving from Trans Amadi to GRA was completely stress-free. The movers were punctual, handled our marble dining table with extreme care, and left no scratches on the walls.',
    serviceCategory: 'Moving & Hauling',
    verifiedBooking: true
  }
];

export const MOCK_FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'How does BukieBrainJobs verify BrainWorkers?',
    answer: 'Every artisan on BukieBrainJobs undergoes our multi-tier BukiePassport verification system. This includes biometric NIN (National Identification Number) & BVN matching, address physical verification, police clearance checks, and trade trade-test skill assessment before receiving the verified badge.',
    category: 'safety'
  },
  {
    id: 'faq-2',
    question: 'How does payment protection and Escrow work?',
    answer: 'When you book a service or accept a quote, your payment is safely held in BukieEscrow (powered by Paystack & Flutterwave rails). Funds are only released to the BrainWorker after you inspect the completed work and approve payout.',
    category: 'payments'
  },
  {
    id: 'faq-3',
    question: 'What is the BukieGuarantee?',
    answer: 'BukieGuarantee protects your home and project up to ₦500,000 against accidental property damage or incomplete work. If a verified job is unsatisfactory, our resolution team steps in to send a replacement artisan or issue a full refund.',
    category: 'safety'
  },
  {
    id: 'faq-4',
    question: 'Can I request custom quotes or Post a Job?',
    answer: 'Yes! If you have a custom project—such as full house rewiring or 3-bedroom renovation—click "Post a Job", describe your requirements, and receive competitive quotes from verified local BrainWorkers within minutes.',
    category: 'booking'
  },
  {
    id: 'faq-5',
    question: 'How do I become a BrainWorker and earn money?',
    answer: 'Qualified artisans, technicians, and service providers can click "Become a BrainWorker", complete identity submission via BukiePassport, list their skills, set their own rates, and start receiving job requests with instant bank payouts.',
    category: 'artisans'
  }
];
