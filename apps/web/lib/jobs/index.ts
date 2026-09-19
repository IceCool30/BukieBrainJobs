import {
  CustomerActivityItem,
  CustomerActivityViewModel,
  ActivityFilterView,
  CustomerActivityCustomer,
  normalizeUserRole,
} from '@bukiebrainjobs/types';
import { AuthUser, PreservedJobDraft } from '../auth/types';

export * from './repository';

export const DEFAULT_JOBS_CUSTOMER: CustomerActivityCustomer = {
  id: 'usr-customer-default',
  name: 'Valued Customer',
  role: 'CLIENT',
};

export const MOCK_CUSTOMER_ACTIVITIES: CustomerActivityItem[] = [
  {
    id: 'REQ-84920',
    customerId: DEFAULT_JOBS_CUSTOMER.id,
    type: 'job_request',
    title: 'Inverter Backup & Battery Inspection',
    service: 'Inverter & Solar Installation',
    category: 'inverter-solar',
    status: 'awaiting_progress',
    statusLabel: 'Awaiting Progress',
    jobStatus: 'PENDING_ACCEPTANCE',
    location: 'Lekki Phase 1, Lagos',
    schedule: 'Urgent / Today',
    budgetOrPrice: '₦35,000 (Open to discussion)',
    description:
      'Solar inverter requires complete system health check and deep-cycle battery bank load testing following frequent trip switch issues.',
    preferredWorker: {
      name: 'Tunde Bakare',
      verified: true,
    },
    referenceCode: 'REQ-84920',
    invitation: {
      id: 'inv-req-84920-1',
      jobId: 'REQ-84920',
      taskerProfileId: 'bw-tunde-bakare',
      sentAt: 'Today, 10:30 AM',
    },
    nextAction: {
      label: 'View Request Details',
      url: '/jobs?id=REQ-84920',
      primary: true,
    },
    createdAt: 'Today, 10:30 AM',
  },
  {
    id: 'REQ-72941',
    customerId: DEFAULT_JOBS_CUSTOMER.id,
    type: 'job_request',
    title: 'Generator Servicing & Carburetor Clean',
    service: 'Generator Servicing & Repair',
    category: 'generator-repair',
    status: 'awaiting_progress',
    statusLabel: 'BrainWorker Responding',
    jobStatus: 'PENDING_ACCEPTANCE',
    location: 'Surulere, Lagos',
    schedule: 'Tomorrow morning',
    budgetOrPrice: '₦15,000',
    description:
      'Carburetor cleaning and spark plug replacement for 5.5kVA Elepaq generator.',
    preferredWorker: {
      name: 'Folake Adeyemi',
      verified: true,
    },
    referenceCode: 'REQ-72941',
    invitation: {
      id: 'inv-req-72941-1',
      jobId: 'REQ-72941',
      taskerProfileId: 'bw-folake-adeyemi',
      sentAt: 'Yesterday, 2:00 PM',
      respondedAt: 'Yesterday, 3:30 PM',
      accepted: false,
      declineReason: 'Currently fully committed on another service engagement.',
    },
    declineResponse: {
      respondedAt: 'Yesterday, 3:30 PM',
      declineReason: 'Currently fully committed on another service engagement.',
    },
    nextAction: {
      label: 'Review Alternatives',
      url: '/job/REQ-72941/matches',
      primary: true,
    },
    createdAt: 'Yesterday, 2:00 PM',
  },
  {
    id: 'REQ-51829',
    customerId: DEFAULT_JOBS_CUSTOMER.id,
    type: 'job_request',
    title: 'Kitchen Cabinet Hinge & Track Realignment',
    service: 'Carpentry & Woodwork',
    category: 'carpentry',
    status: 'request_received',
    statusLabel: 'Request Received',
    jobStatus: 'OPEN',
    location: 'Ikeja, Lagos',
    schedule: 'Flexible / Within a week',
    budgetOrPrice: 'Negotiable',
    description:
      'Realign four soft-close cabinet doors in the pantry and replace worn drawer ball-bearing slides.',
    referenceCode: 'REQ-51829',
    nextAction: {
      label: 'Review Request',
      url: '/jobs?id=REQ-51829',
      primary: true,
    },
    createdAt: 'Yesterday, 3:15 PM',
  },
  {
    id: 'BKG-77210',
    customerId: DEFAULT_JOBS_CUSTOMER.id,
    type: 'booking',
    title: 'Split-Unit AC Deep Servicing',
    service: 'AC Repair & Installation',
    category: 'ac-repair',
    status: 'in_progress',
    statusLabel: 'In Progress',
    jobStatus: 'IN_PROGRESS',
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
      url: '/jobs?id=BKG-77210',
      primary: true,
    },
    createdAt: 'Sep 6, 2026',
  },
  {
    id: 'BKG-63102',
    customerId: DEFAULT_JOBS_CUSTOMER.id,
    type: 'booking',
    title: 'Plumbing Drainage Pressure Test',
    service: 'Plumbing & Pipefitting',
    category: 'plumbing',
    status: 'scheduled',
    statusLabel: 'Scheduled',
    jobStatus: 'CONFIRMED',
    location: 'Ikeja GRA, Lagos',
    schedule: 'Thursday, Sep 10, 2026 (1:00 PM - 4:00 PM)',
    confirmedSchedule: 'Thursday, Sep 10, 2026 (1:00 PM - 4:00 PM)',
    budgetOrPrice: '₦25,000',
    description:
      'Conduct static and dynamic water pressure tests on underground drain pipes to diagnose persistent drainage backup.',
    preferredWorker: {
      name: 'Emeka Obi',
      avatar: '/images/workers/emeka.jpg',
      verified: true,
    },
    referenceCode: 'BKG-63102',
    invitation: {
      id: 'inv-bkg-63102-1',
      jobId: 'BKG-63102',
      taskerProfileId: 'bw-emeka-obi',
      sentAt: 'Sep 5, 2026',
      respondedAt: 'Sep 5, 2026',
      accepted: true,
    },
    nextAction: {
      label: 'View Booking Schedule',
      url: '/jobs?id=BKG-63102',
      primary: true,
    },
    createdAt: 'Sep 5, 2026',
  },
  {
    id: 'BKG-44109',
    customerId: DEFAULT_JOBS_CUSTOMER.id,
    type: 'booking',
    title: 'Bathroom Pipe & Trap Replacement',
    service: 'Plumbing & Pipefitting',
    category: 'plumbing',
    status: 'completed',
    statusLabel: 'Completed',
    jobStatus: 'COMPLETED',
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
    customerId: DEFAULT_JOBS_CUSTOMER.id,
    type: 'job_request',
    title: 'Ceiling Fan & Chandelier Wiring',
    service: 'Electrical Services',
    category: 'electrical',
    status: 'completed',
    statusLabel: 'Completed',
    jobStatus: 'COMPLETED',
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
    id: 'REQ-22019',
    customerId: DEFAULT_JOBS_CUSTOMER.id,
    type: 'job_request',
    title: 'Deep House Cleaning & Window Washing',
    service: 'Deep House Cleaning',
    category: 'cleaning',
    status: 'cancelled',
    statusLabel: 'Expired',
    jobStatus: 'EXPIRED',
    location: 'Yaba, Lagos',
    schedule: 'Last week',
    budgetOrPrice: '₦20,000',
    description: 'Full house post-renovation dust cleaning.',
    referenceCode: 'REQ-22019',
    nextAction: {
      label: 'Recreate Request',
      url: '/post-job',
      primary: true,
    },
    createdAt: 'Sep 1, 2026',
  },
  {
    id: 'REQ-19024',
    customerId: DEFAULT_JOBS_CUSTOMER.id,
    type: 'job_request',
    title: 'Generator Carburetor Rebuild',
    service: 'Generator Maintenance',
    category: 'generator-repair',
    status: 'cancelled',
    statusLabel: 'Cancelled',
    jobStatus: 'CANCELLED',
    location: 'Gbagada, Lagos',
    schedule: 'Aug 02, 2026',
    budgetOrPrice: '₦12,000',
    description:
      'Cancelled by customer prior to technician dispatch. No service fees assessed.',
    cancellationReason: 'Cancelled by customer prior to technician dispatch. No service fees assessed.',
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
  preservedDraft: PreservedJobDraft | null,
  activitiesOverride?: CustomerActivityItem[]
): CustomerActivityViewModel {
  const customer: CustomerActivityCustomer = user
    ? {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: normalizeUserRole(user.role),
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
  let baseActivities = activitiesOverride && activitiesOverride.length > 0
    ? [...activitiesOverride]
    : [...MOCK_CUSTOMER_ACTIVITIES];
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
      customerId: customer.id,
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
      customerId: customer.id,
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
    ? baseActivities.find(
        (act) => act.id === selectedActivityId || act.referenceCode === selectedActivityId
      )
    : undefined;

  const allActivities = [...activeActivities, ...upcomingActivities, ...pastActivities];

  return {
    customer,
    activities: presentedActivities,
    allActivities,
    activeActivities,
    upcomingActivities,
    pastActivities,
    totalCount: allActivities.length,
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
