import {
  CustomerActivityItem,
  CustomerActivityFilter,
  ICustomerActivityRepository,
  JobLifecycleAction,
  mapJobStatusToPresentation,
  CreateJobRequest,
  CustomerJobCreationInput,
  JobStatus,
} from '@bukiebrainjobs/types';
import { canTransition, InvalidTransitionError } from '@bukiebrainjobs/api-types';
import { generateJobReferenceCode, formatNairaFromKobo } from '@bukiebrainjobs/utils';
import { MOCK_CUSTOMER_ACTIVITIES } from './index';

const STORAGE_KEY = 'bukiebrainjobs_mock_customer_activities_v1';

/**
 * Mock implementation of ICustomerActivityRepository for Phase 1.
 * Encapsulates browser storage and in-memory fallbacks behind the domain interface.
 * UI components interact strictly with ICustomerActivityRepository, making this
 * adapter structurally replaceable with ApiCustomerActivityRepository in Phase 2.
 */
export class MockCustomerActivityRepository implements ICustomerActivityRepository {
  private inMemoryActivities: CustomerActivityItem[];

  constructor(initialActivities: CustomerActivityItem[] = MOCK_CUSTOMER_ACTIVITIES) {
    this.inMemoryActivities = [...initialActivities];
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge stored activities with base mocks, prioritizing stored items
          const storedIds = new Set(parsed.map((a: CustomerActivityItem) => a.id));
          const baseRemaining = this.inMemoryActivities.filter((a) => !storedIds.has(a.id));
          this.inMemoryActivities = [...parsed, ...baseRemaining];
        }
      }
    } catch {
      // Storage failure falls back gracefully to in-memory state
    }
  }

  private persistToStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.inMemoryActivities));
    } catch {
      // Graceful fallback if storage quota exceeded or disabled
    }
  }

  async getActivities(
    _customerId: string,
    filter?: CustomerActivityFilter
  ): Promise<CustomerActivityItem[]> {
    let items = [...this.inMemoryActivities];

    if (filter?.status) {
      items = items.filter((a) => a.jobStatus === filter.status);
    }

    if (filter?.view && filter.view !== 'all') {
      switch (filter.view) {
        case 'active':
          items = items.filter(
            (a) =>
              a.status === 'request_received' ||
              a.status === 'awaiting_progress' ||
              a.status === 'in_progress'
          );
          break;
        case 'upcoming':
          items = items.filter((a) => a.status === 'scheduled');
          break;
        case 'past':
          items = items.filter((a) => a.status === 'completed' || a.status === 'cancelled');
          break;
      }
    }

    if (filter?.limit && filter.limit > 0) {
      items = items.slice(0, filter.limit);
    }

    return items;
  }

  async getActivityById(
    _customerId: string,
    identifier: string
  ): Promise<CustomerActivityItem | null> {
    const clean = identifier.trim().toLowerCase();
    const match = this.inMemoryActivities.find(
      (a) =>
        a.id.toLowerCase() === clean ||
        (a.referenceCode && a.referenceCode.toLowerCase() === clean)
    );
    return match ? { ...match } : null;
  }

  async createJob(
    _customerId: string,
    payload: CustomerJobCreationInput | CreateJobRequest
  ): Promise<CustomerActivityItem> {
    // Technical UUID primary key
    const id =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : '00000000-0000-4000-8000-' + Math.floor(100000000000 + Math.random() * 900000000000);

    // Authoritative durable human-readable reference code
    const referenceCode =
      'referenceCode' in payload && payload.referenceCode
        ? payload.referenceCode
        : generateJobReferenceCode();

    const presentation = mapJobStatusToPresentation('OPEN');

    // Decision A: Customer budget vs worker rate (integer kobo representation)
    let budgetKobo: number | undefined;
    if ('customerBudgetKobo' in payload && typeof payload.customerBudgetKobo === 'number') {
      budgetKobo = payload.customerBudgetKobo;
    } else if (
      'estimatedTotalKobo' in payload &&
      typeof payload.estimatedTotalKobo === 'number' &&
      payload.estimatedTotalKobo > 0
    ) {
      budgetKobo = payload.estimatedTotalKobo;
    }

    const formattedBudget =
      budgetKobo && budgetKobo > 0
        ? formatNairaFromKobo(budgetKobo)
        : 'Estimate Provided';

    // Staged location: address, optional landmark, city
    const landmarkStr = 'landmark' in payload && payload.landmark ? ` (${payload.landmark})` : '';
    const locationDisplay = `${payload.address}${landmarkStr}, ${payload.city}`;

    const newActivity: CustomerActivityItem = {
      id,
      type: 'job_request',
      title: payload.title,
      description: payload.description,
      status: presentation.status,
      statusLabel: presentation.label,
      service: payload.title,
      category: 'general',
      location: locationDisplay,
      schedule: payload.scheduledStartAt ? 'Scheduled Window' : 'Flexible / Recently Posted',
      budgetOrPrice: formattedBudget,
      budgetKobo,
      jobStatus: 'OPEN',
      referenceCode,
      createdAt: 'Just now',
      nextAction: {
        label: 'View Request Details',
        url: `/jobs?id=${referenceCode}`,
        primary: true,
      },
    };

    this.inMemoryActivities = [newActivity, ...this.inMemoryActivities];
    this.persistToStorage();
    return { ...newActivity };
  }

  async mutateJobStatus(
    _customerId: string,
    jobId: string,
    action: JobLifecycleAction
  ): Promise<CustomerActivityItem> {
    const activityIndex = this.inMemoryActivities.findIndex(
      (a) => a.id === jobId || a.referenceCode === jobId
    );

    if (activityIndex === -1) {
      throw new Error(`[Repository] Activity not found for ID: ${jobId}`);
    }

    const currentActivity = this.inMemoryActivities[activityIndex]!;
    const currentJobStatus: JobStatus = currentActivity.jobStatus ?? 'OPEN';

    let targetJobStatus: JobStatus;
    switch (action.type) {
      case 'CANCEL':
        targetJobStatus = 'CANCELLED';
        break;
      case 'CONFIRM_COMPLETION':
        targetJobStatus = 'COMPLETED';
        break;
      case 'OPEN_DISPUTE':
        targetJobStatus = 'DISPUTED';
        break;
      default: {
        const _exhaustiveCheck: never = action;
        throw new Error(`[Lifecycle] Unknown action type: ${JSON.stringify(_exhaustiveCheck)}`);
      }
    }

    // Validate canonical transition state machine
    if (!canTransition(currentJobStatus, targetJobStatus)) {
      throw new InvalidTransitionError(currentJobStatus, targetJobStatus);
    }

    const presentation = mapJobStatusToPresentation(targetJobStatus);
    const updated: CustomerActivityItem = {
      ...currentActivity,
      jobStatus: targetJobStatus,
      status: presentation.status,
      statusLabel: presentation.label,
    };

    this.inMemoryActivities[activityIndex] = updated;
    this.persistToStorage();
    return { ...updated };
  }

  /** Reset internal storage for testing and session cleanup */
  reset(activities: CustomerActivityItem[] = MOCK_CUSTOMER_ACTIVITIES): void {
    this.inMemoryActivities = [...activities];
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Ignore in testing environments
      }
    }
  }
}

// Singleton repository instance for client application usage
let defaultRepository: ICustomerActivityRepository | null = null;

export function getCustomerActivityRepository(): ICustomerActivityRepository {
  if (!defaultRepository) {
    defaultRepository = new MockCustomerActivityRepository();
  }
  return defaultRepository;
}

export function resetCustomerActivityRepository(
  activities?: CustomerActivityItem[]
): void {
  if (defaultRepository instanceof MockCustomerActivityRepository) {
    defaultRepository.reset(activities);
  } else {
    defaultRepository = new MockCustomerActivityRepository(activities);
  }
}
