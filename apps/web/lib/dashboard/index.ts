import {
  DashboardActiveWorkItem,
  DashboardUpcomingWorkItem,
  DashboardRecentActivityItem,
  DashboardMarketplaceItem,
  DashboardViewModel,
  DashboardStateMode,
  DashboardCustomer,
} from '@bukiebrainjobs/types';
import { AuthUser, PreservedJobDraft } from '../auth/types';

export const DEFAULT_DASHBOARD_CUSTOMER: DashboardCustomer = {
  id: 'usr-customer-default',
  name: 'Valued Customer',
  role: 'customer',
};

export const MOCK_ACTIVE_WORK: DashboardActiveWorkItem[] = [
  {
    id: 'REQ-84920',
    type: 'job_request',
    title: 'Inverter Backup & Battery Inspection',
    category: 'inverter-solar',
    status: 'reviewing_proposals',
    statusLabel: 'Reviewing Proposals',
    location: 'Lekki Phase 1, Lagos',
    scheduleContext: 'Urgent / Today',
    createdAt: 'Today, 10:30 AM',
    budget: '₦35,000 (Open to discussion)',
    preferredWorkerName: 'Tunde Bakare (Preference)',
    actionUrl: '/post-job?reference=REQ-84920',
    actionLabel: 'View Details',
  },
  {
    id: 'REQ-51829',
    type: 'job_request',
    title: 'Kitchen Cabinet Hinge & Track Realignment',
    category: 'carpentry',
    status: 'artisan_responding',
    statusLabel: 'Artisan Responding',
    location: 'Ikeja, Lagos',
    scheduleContext: 'Flexible / Within a week',
    createdAt: 'Yesterday, 3:15 PM',
    budget: 'Negotiable',
    actionUrl: '/post-job?reference=REQ-51829',
    actionLabel: 'View Details',
  },
];

export const MOCK_UPCOMING_WORK: DashboardUpcomingWorkItem[] = [
  {
    id: 'BKG-77210',
    serviceTitle: 'Split-Unit AC Deep Servicing',
    workerName: 'Chidi Okonkwo',
    workerAvatar: '/images/workers/chidi.jpg',
    workerVerified: true,
    date: 'Tomorrow, Sep 8, 2026',
    arrivalWindow: 'Morning (9:00 AM - 12:00 PM)',
    location: 'Victoria Island, Lagos',
    status: 'confirmed',
    preparationTip: 'Please ensure the outdoor compressor unit and indoor wall units are accessible.',
    actionUrl: '/services/ac-repair',
    actionLabel: 'View Booking',
  },
  {
    id: 'BKG-63102',
    serviceTitle: 'Plumbing Drainage Pressure Test',
    workerName: 'Emeka Obi',
    workerAvatar: '/images/workers/emeka.jpg',
    workerVerified: true,
    date: 'Thursday, Sep 10, 2026',
    arrivalWindow: 'Afternoon (1:00 PM - 4:00 PM)',
    location: 'Ikeja GRA, Lagos',
    status: 'scheduled',
    preparationTip: 'Locate your primary stopcock valve before the artisan arrives.',
    actionUrl: '/services/plumbing',
    actionLabel: 'View Booking',
  },
];

export const MOCK_RECENT_ACTIVITY: DashboardRecentActivityItem[] = [
  {
    id: 'BKG-44109',
    title: 'Bathroom Pipe & Trap Replacement',
    workerName: 'Emeka Obi',
    completedDate: 'Aug 29, 2026',
    status: 'completed',
    amount: '₦22,000',
    location: 'Surulere, Lagos',
    actionUrl: '/services/plumbing',
    actionLabel: 'Book Again',
  },
  {
    id: 'REQ-31092',
    title: 'Ceiling Fan & Chandelier Wiring',
    workerName: 'Adeyemi Johnson',
    completedDate: 'Aug 15, 2026',
    status: 'completed',
    amount: '₦18,500',
    location: 'Yaba, Lagos',
    actionUrl: '/post-job',
    actionLabel: 'Post Similar',
  },
];

export const MOCK_MARKETPLACE_CONTINUATION: DashboardMarketplaceItem[] = [
  {
    id: 'cat-inverter',
    title: 'Inverter & Solar Systems',
    description: 'Battery installation, solar sizing, and backup maintenance.',
    startingPrice: 'From ₦25,000',
    categorySlug: 'inverter-solar',
    href: '/services/inverter-solar',
    iconName: 'Zap',
  },
  {
    id: 'cat-ac',
    title: 'AC Repair & Servicing',
    description: 'Gas refilling, chemical washing, and fault diagnostics.',
    startingPrice: 'From ₦8,000',
    categorySlug: 'ac-repair',
    href: '/services/ac-repair',
    iconName: 'Wind',
  },
  {
    id: 'cat-plumbing',
    title: 'Plumbing & Leak Resolution',
    description: 'Pipe repair, fixture fitting, and water pump troubleshooting.',
    startingPrice: 'From ₦6,500',
    categorySlug: 'plumbing',
    href: '/services/plumbing',
    iconName: 'Droplet',
  },
  {
    id: 'cat-electrical',
    title: 'Electrical Installation & Wiring',
    description: 'Short-circuit repair, distribution board, and surge protection.',
    startingPrice: 'From ₦7,500',
    categorySlug: 'electrical',
    href: '/services/electrical',
    iconName: 'Cpu',
  },
];

function sanitizeSafeString(input: unknown, fallback: string): string {
  if (typeof input !== 'string') return fallback;
  const cleaned = input.replace(/[<>'"]/g, '').trim();
  return cleaned.length > 0 ? cleaned : fallback;
}

export function resolveDashboardContext(
  searchParams: Record<string, string | string[] | undefined> | URLSearchParams,
  currentUser: AuthUser | null,
  preservedJobDraft?: PreservedJobDraft | null
): DashboardViewModel {
  const getParam = (key: string): string | undefined => {
    if (!searchParams) return undefined;
    if (typeof (searchParams as URLSearchParams).get === 'function') {
      const val = (searchParams as URLSearchParams).get(key);
      return val ?? undefined;
    }
    const val = (searchParams as Record<string, string | string[] | undefined>)[key];
    if (Array.isArray(val)) return val[0];
    return val;
  };

  const rawState = getParam('state') || getParam('view') || '';
  const rawJobCreated = getParam('jobCreated');
  const rawJobTitle = getParam('jobTitle');

  // Customer resolution
  const customer: DashboardCustomer = currentUser
    ? {
        id: currentUser.id,
        name: currentUser.name || 'Valued Customer',
        email: currentUser.email,
        phone: currentUser.phone,
        role: currentUser.role || 'customer',
      }
    : DEFAULT_DASHBOARD_CUSTOMER;

  // Determine state mode
  let stateMode: DashboardStateMode = 'mixed';
  if (rawState === 'first_run' || rawState === 'empty') {
    stateMode = 'first_run';
  } else if (rawState === 'active') {
    stateMode = 'active';
  } else if (rawState === 'upcoming') {
    stateMode = 'upcoming';
  } else if (rawState === 'recent') {
    stateMode = 'recent';
  } else if (rawState === 'loading') {
    stateMode = 'loading';
  } else if (rawState === 'partial_failure') {
    stateMode = 'partial_failure';
  } else if (rawState === 'offline') {
    stateMode = 'offline';
  } else if (rawState === 'auth_failure') {
    stateMode = 'auth_failure';
  }

  // Active work construction
  let activeWork: DashboardActiveWorkItem[] = [];
  let upcomingWork: DashboardUpcomingWorkItem[] = [];
  let recentActivity: DashboardRecentActivityItem[] = [];
  let newJobNotice: { reference: string; title: string } | undefined = undefined;

  // Check for newly created job request handoff (from /post-job)
  if (rawJobCreated && typeof rawJobCreated === 'string') {
    const safeRef = sanitizeSafeString(rawJobCreated, 'REQ-NEW');
    const safeTitle = sanitizeSafeString(rawJobTitle, 'Custom Job Request');
    newJobNotice = {
      reference: safeRef,
      title: safeTitle,
    };
    const newActiveItem: DashboardActiveWorkItem = {
      id: safeRef,
      type: 'job_request',
      title: safeTitle,
      category: 'general',
      status: 'reviewing_proposals',
      statusLabel: 'Request Received',
      location: 'Active Request • Nigeria',
      scheduleContext: 'Recently Posted',
      createdAt: 'Just now',
      budget: 'Estimate Provided',
      actionUrl: `/post-job?reference=${encodeURIComponent(safeRef)}`,
      actionLabel: 'View Details',
    };
    activeWork = [newActiveItem, ...MOCK_ACTIVE_WORK];
  } else if (preservedJobDraft && preservedJobDraft.title) {
    // If a draft exists in session storage
    const draftItem: DashboardActiveWorkItem = {
      id: 'DRAFT-SAVED',
      type: 'job_request',
      title: sanitizeSafeString(preservedJobDraft.title, 'Preserved Job Draft'),
      status: 'awaiting_confirmation',
      statusLabel: 'Draft Saved',
      location: sanitizeSafeString(preservedJobDraft.city, 'Nigeria'),
      scheduleContext: sanitizeSafeString(preservedJobDraft.urgency, 'Flexible'),
      createdAt: 'In Progress',
      budget: sanitizeSafeString(preservedJobDraft.budget, 'Not set'),
      actionUrl: '/post-job?jobContinuation=1',
      actionLabel: 'Resume Draft',
    };
    activeWork = [draftItem, ...MOCK_ACTIVE_WORK];
  } else {
    activeWork = [...MOCK_ACTIVE_WORK];
  }

  upcomingWork = [...MOCK_UPCOMING_WORK];
  recentActivity = [...MOCK_RECENT_ACTIVITY];

  // Adjust datasets by stateMode
  if (stateMode === 'first_run') {
    activeWork = [];
    upcomingWork = [];
    recentActivity = [];
  } else if (stateMode === 'active') {
    upcomingWork = [];
    recentActivity = [];
  } else if (stateMode === 'upcoming') {
    activeWork = [];
    recentActivity = [];
  } else if (stateMode === 'recent') {
    activeWork = [];
    upcomingWork = [];
  } else if (stateMode === 'loading') {
    activeWork = [];
    upcomingWork = [];
    recentActivity = [];
  } else if (stateMode === 'partial_failure') {
    activeWork = [];
  }

  return {
    customer,
    stateMode,
    activeWork,
    upcomingWork,
    recentActivity,
    marketplaceContinuation: MOCK_MARKETPLACE_CONTINUATION,
    newJobNotice,
    isOffline: stateMode === 'offline',
    hasPartialFailure: stateMode === 'partial_failure',
    failedSection: stateMode === 'partial_failure' ? 'activeWork' : undefined,
  };
}
