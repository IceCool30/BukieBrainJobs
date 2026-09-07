import {
  CustomerActivityItem,
  CustomerActivityViewModel,
  ActivityFilterView,
  CustomerActivityCustomer,
} from '@bukiebrainjobs/types';
import { AuthUser, PreservedJobDraft } from '../auth/types';

export const DEFAULT_JOBS_CUSTOMER: CustomerActivityCustomer = {
  id: 'usr-customer-default',
  name: 'Valued Customer',
  role: 'customer',
};

export const MOCK_CUSTOMER_ACTIVITIES: CustomerActivityItem[] = [
  {
    id: 'REQ-84920',
    type: 'job_request',
    title: 'Inverter Backup & Battery Inspection',
    service: 'Inverter & Solar Installation',
    category: 'inverter-solar',
    status: 'awaiting_progress',
    statusLabel: 'Awaiting Progress',
    location: 'Lekki Phase 1, Lagos',
    schedule: 'Urgent / Today',
    budgetOrPrice: '₦35,000 (Open to discussion)',
    description:
      'Solar inverter requires complete system health check and deep-cycle battery bank load testing following frequent trip switch issues.',
    preferredWorker: {
      name: 'Tunde Bakare (Preference)',
    },
    referenceCode: 'REQ-84920',
    nextAction: {
      label: 'View Request Details',
      url: '/post-job?reference=REQ-84920',
      primary: true,
    },
    createdAt: 'Today, 10:30 AM',
  },
  {
    id: 'REQ-51829',
    type: 'job_request',
    title: 'Kitchen Cabinet Hinge & Track Realignment',
    service: 'Carpentry & Woodwork',
    category: 'carpentry',
    status: 'request_received',
    statusLabel: 'Request Received',
    location: 'Ikeja, Lagos',
    schedule: 'Flexible / Within a week',
    budgetOrPrice: 'Negotiable',
    description:
      'Realign four soft-close cabinet doors in the pantry and replace worn drawer ball-bearing slides.',
    referenceCode: 'REQ-51829',
    nextAction: {
      label: 'Review Request',
      url: '/post-job?reference=REQ-51829',
      primary: true,
    },
    createdAt: 'Yesterday, 3:15 PM',
  },
  {
    id: 'BKG-77210',
    type: 'booking',
    title: 'Split-Unit AC Deep Servicing',
    service: 'AC Repair & Installation',
    category: 'ac-repair',
    status: 'in_progress',
    statusLabel: 'In Progress',
    location: 'Victoria Island, Lagos',
    schedule: 'Today / Scheduled Window (9:00 AM - 12:00 PM)',
    budgetOrPrice: '₦18,000',
    description:
      'Full chemical coil flush, condensation drain line clearance, and refrigerant gas top-up for 2 indoor wall units.',
    preferredWorker: {
      name: 'Chidi Okonkwo',
      avatar: '/images/workers/chidi.jpg',
      verified: true,
    },
    referenceCode: 'BKG-77210',
    nextAction: {
      label: 'View Booking Details',
      url: '/services/ac-repair',
      primary: true,
    },
    createdAt: 'Sep 6, 2026',
  },
  {
    id: 'BKG-63102',
    type: 'booking',
    title: 'Plumbing Drainage Pressure Test',
    service: 'Plumbing & Pipefitting',
    category: 'plumbing',
    status: 'scheduled',
    statusLabel: 'Scheduled',
    location: 'Ikeja GRA, Lagos',
    schedule: 'Thursday, Sep 10, 2026 (1:00 PM - 4:00 PM)',
    budgetOrPrice: '₦25,000',
    description:
      'Conduct static and dynamic water pressure tests on underground drain pipes to diagnose persistent drainage backup.',
    preferredWorker: {
      name: 'Emeka Obi',
      avatar: '/images/workers/emeka.jpg',
      verified: true,
    },
    referenceCode: 'BKG-63102',
    nextAction: {
      label: 'View Booking Schedule',
      url: '/services/plumbing',
      primary: true,
    },
    createdAt: 'Sep 5, 2026',
  },
  {
    id: 'BKG-44109',
    type: 'booking',
    title: 'Bathroom Pipe & Trap Replacement',
    service: 'Plumbing & Pipefitting',
    category: 'plumbing',
    status: 'completed',
    statusLabel: 'Completed',
    location: 'Surulere, Lagos',
    schedule: 'Aug 29, 2026',
    budgetOrPrice: '₦22,000',
    description:
      'Replaced fractured PVC waste pipes and installed new anti-siphon bottle P-trap under master bath vanity.',
    preferredWorker: {
      name: 'Emeka Obi',
      verified: true,
    },
    referenceCode: 'BKG-44109',
    nextAction: {
      label: 'Book Again',
      url: '/services/plumbing',
      primary: false,
    },
    createdAt: 'Aug 29, 2026',
  },
  {
    id: 'REQ-31092',
    type: 'job_request',
    title: 'Ceiling Fan & Chandelier Wiring',
    service: 'Electrical Services',
    category: 'electrical',
    status: 'completed',
    statusLabel: 'Completed',
    location: 'Yaba, Lagos',
    schedule: 'Aug 15, 2026',
    budgetOrPrice: '₦18,500',
    description:
      'Installed reinforced ceiling anchor bracket and dedicated dimmer circuit wiring for high-ceiling living room chandelier.',
    preferredWorker: {
      name: 'Adeyemi Johnson',
      verified: true,
    },
    referenceCode: 'REQ-31092',
    nextAction: {
      label: 'Post Similar Job',
      url: '/post-job',
      primary: false,
    },
    createdAt: 'Aug 15, 2026',
  },
  {
    id: 'REQ-19024',
    type: 'job_request',
    title: 'Generator Carburetor Rebuild',
    service: 'Generator Maintenance',
    category: 'generator-repair',
    status: 'cancelled',
    statusLabel: 'Cancelled',
    location: 'Gbagada, Lagos',
    schedule: 'Aug 02, 2026',
    budgetOrPrice: '₦12,000',
    description:
      'Cancelled by customer prior to technician dispatch. No service fees assessed.',
    referenceCode: 'REQ-19024',
    nextAction: {
      label: 'Post a New Job',
      url: '/post-job',
      primary: false,
    },
    createdAt: 'Aug 02, 2026',
  },
];

const VALID_FILTERS: ActivityFilterView[] = ['all', 'active', 'upcoming', 'past'];

function sanitizeSafeString(input: unknown, fallback: string): string {
  if (typeof input !== 'string') return fallback;
  const cleaned = input.replace(/[<>'"]/g, '').trim();
  return cleaned.length > 0 ? cleaned : fallback;
}

export function normalizeFilterView(viewParam: string | null | undefined): ActivityFilterView {
  if (!viewParam || typeof viewParam !== 'string') {
    return 'all';
  }
  const clean = viewParam.trim().toLowerCase();
  if (VALID_FILTERS.includes(clean as ActivityFilterView)) {
    return clean as ActivityFilterView;
  }
  return 'all';
}

export function normalizeActivityId(idParam: string | null | undefined): string | null {
  if (!idParam || typeof idParam !== 'string') {
    return null;
  }
  const trimmed = idParam.trim();
  if (/^[A-Za-z0-9_-]{3,30}$/.test(trimmed)) {
    return trimmed;
  }
  return null;
}

export function resolveJobsContext(
  searchParams: { get: (key: string) => string | null },
  user: AuthUser | null,
  preservedDraft: PreservedJobDraft | null
): CustomerActivityViewModel {
  const customer: CustomerActivityCustomer = user
    ? {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      }
    : DEFAULT_JOBS_CUSTOMER;

  const rawState = searchParams.get('state')?.toLowerCase() ?? '';
  const rawJobCreated = searchParams.get('jobCreated');
  const rawJobTitle = searchParams.get('jobTitle');

  const stateMode: CustomerActivityViewModel['stateMode'] =
    rawState === 'first_run' ||
    rawState === 'active' ||
    rawState === 'upcoming' ||
    rawState === 'recent' ||
    rawState === 'loading' ||
    rawState === 'partial_failure' ||
    rawState === 'offline' ||
    rawState === 'auth_failure'
      ? (rawState as CustomerActivityViewModel['stateMode'])
      : 'mixed';

  // Base list
  let baseActivities = [...MOCK_CUSTOMER_ACTIVITIES];
  let newJobNotice: CustomerActivityViewModel['newJobNotice'] = undefined;

  // Check URL handoff from /post-job
  if (rawJobCreated && typeof rawJobCreated === 'string') {
    const safeRef = sanitizeSafeString(rawJobCreated, 'REQ-NEW');
    const safeTitle = sanitizeSafeString(rawJobTitle, 'Custom Job Request');
    newJobNotice = {
      reference: safeRef,
      title: safeTitle,
    };
    const newActiveItem: CustomerActivityItem = {
      id: safeRef,
      type: 'job_request',
      title: safeTitle,
      category: 'general',
      service: 'General Service Request',
      status: 'request_received',
      statusLabel: 'Request Received',
      location: 'Active Request • Nigeria',
      schedule: 'Recently Posted',
      createdAt: 'Just now',
      budgetOrPrice: 'Estimate Provided',
      referenceCode: safeRef,
      nextAction: {
        label: 'View Request Details',
        url: `/post-job?reference=${encodeURIComponent(safeRef)}`,
        primary: true,
      },
    };
    baseActivities = [newActiveItem, ...baseActivities];
  } else if (preservedDraft && preservedDraft.title) {
    // If a draft exists in session storage
    const safeTitle = sanitizeSafeString(preservedDraft.title, 'Preserved Job Draft');
    const safeRef = 'REQ-DRAFT';
    newJobNotice = {
      reference: safeRef,
      title: safeTitle,
    };
    const draftItem: CustomerActivityItem = {
      id: safeRef,
      type: 'job_request',
      title: safeTitle,
      category: preservedDraft.category ?? 'general',
      service: preservedDraft.category ?? 'General Service Request',
      status: 'request_received',
      statusLabel: 'Request Received',
      location: `${sanitizeSafeString(preservedDraft.streetAddress, 'Local Address')}, ${sanitizeSafeString(preservedDraft.city, 'Lagos')}`,
      schedule: sanitizeSafeString(preservedDraft.urgency, 'Flexible / As scheduled'),
      budgetOrPrice: sanitizeSafeString(preservedDraft.budget, 'Open to discussion'),
      description: preservedDraft.description,
      preferredWorker: preservedDraft.preferredWorkerName
        ? { name: `${preservedDraft.preferredWorkerName} (Preference)` }
        : undefined,
      referenceCode: safeRef,
      nextAction: {
        label: 'View Request Details',
        url: '/post-job?jobContinuation=1',
        primary: true,
      },
      createdAt: 'Just now',
    };
    baseActivities = [draftItem, ...baseActivities];
  }

  // Active items: in_progress, awaiting_progress, request_received
  let activeActivities = baseActivities.filter(
    (act) =>
      act.status === 'in_progress' ||
      act.status === 'awaiting_progress' ||
      act.status === 'request_received'
  );

  // Upcoming items: scheduled
  let upcomingActivities = baseActivities.filter((act) => act.status === 'scheduled');

  // Past items: completed, cancelled
  let pastActivities = baseActivities.filter(
    (act) => act.status === 'completed' || act.status === 'cancelled'
  );

  // Apply deterministic scenario state overrides
  if (stateMode === 'first_run') {
    baseActivities = [];
    activeActivities = [];
    upcomingActivities = [];
    pastActivities = [];
  } else if (stateMode === 'active') {
    upcomingActivities = [];
    pastActivities = [];
    baseActivities = [...activeActivities];
  } else if (stateMode === 'upcoming') {
    activeActivities = [];
    pastActivities = [];
    baseActivities = [...upcomingActivities];
  } else if (stateMode === 'recent') {
    activeActivities = [];
    upcomingActivities = [];
    baseActivities = [...pastActivities];
  } else if (stateMode === 'loading') {
    baseActivities = [];
    activeActivities = [];
    upcomingActivities = [];
    pastActivities = [];
  } else if (stateMode === 'partial_failure') {
    activeActivities = [];
  }

  const currentFilter = normalizeFilterView(searchParams.get('view'));

  // Activities presented based on currentFilter
  let presentedActivities: CustomerActivityItem[] = [];
  if (currentFilter === 'active') {
    presentedActivities = activeActivities;
  } else if (currentFilter === 'upcoming') {
    presentedActivities = upcomingActivities;
  } else if (currentFilter === 'past') {
    presentedActivities = pastActivities;
  } else {
    // 'all': prioritize Active -> Upcoming -> Past
    presentedActivities = [...activeActivities, ...upcomingActivities, ...pastActivities];
  }

  // Selected Activity Deep Link resolution
  const selectedActivityId = normalizeActivityId(searchParams.get('id')) ?? undefined;
  const selectedActivity = selectedActivityId
    ? baseActivities.find((act) => act.id === selectedActivityId)
    : undefined;

  return {
    customer,
    activities: presentedActivities,
    activeActivities,
    upcomingActivities,
    pastActivities,
    availableFilters: VALID_FILTERS,
    currentFilter,
    selectedActivityId,
    selectedActivity,
    stateMode,
    newJobNotice,
    isOffline: stateMode === 'offline',
    hasPartialFailure: stateMode === 'partial_failure',
    failedSection: stateMode === 'partial_failure' ? 'activeActivities' : undefined,
  };
}
