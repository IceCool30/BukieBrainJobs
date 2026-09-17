import type {
  UserRole as CanonicalUserRole,
  JobStatus,
  CreateJobRequest,
  CustomerJobCreationInput,
  Job,
} from '@bukiebrainjobs/api-types';

export type UserRole = CanonicalUserRole;
export type { JobStatus, CreateJobRequest, CustomerJobCreationInput, Job };

export const ROLE_DISPLAY_LABELS: Record<UserRole, string> = {
  CLIENT: 'Customer',
  TASKER: 'BrainWorker',
  ADMIN: 'Administrator',
  CORPORATE_CLIENT: 'Corporate Partner',
};

export function getRoleDisplayLabel(role: UserRole): string {
  const label = ROLE_DISPLAY_LABELS[role];
  if (!label) {
    throw new Error(
      `[Security/Auth] Unknown or corrupted user role encountered: "${role as string}". Silent fallback prohibited.`
    );
  }
  return label;
}

export function normalizeUserRole(input: string): UserRole {
  const upper = input.toUpperCase().trim();
  if (upper === 'CLIENT' || upper === 'CUSTOMER') return 'CLIENT';
  if (upper === 'TASKER' || upper === 'BRAINWORKER' || upper === 'ARTISAN') return 'TASKER';
  if (upper === 'ADMIN') return 'ADMIN';
  if (upper === 'CORPORATE_CLIENT' || upper === 'CORPORATE') return 'CORPORATE_CLIENT';
  throw new Error(
    `[Security/Auth] Unknown or corrupted user role encountered: "${input}". Silent fallback prohibited.`
  );
}

export type TaskCategorySlug = 
  | 'ac-repair'
  | 'tv-mounting'
  | 'plumbing'
  | 'electrical'
  | 'handyman'
  | 'furniture-assembly'
  | 'cleaning'
  | 'moving'
  | 'painting'
  | 'generator-servicing';

export interface TaskCategory {
  id: string;
  slug: TaskCategorySlug;
  name: string;
  description: string;
  iconName: string;
  averageRateNaira: number;
  isBinary: boolean;
  popularIn: string[];
}

export interface ArtisanProfile {
  id: string;
  name: string;
  avatarUrl: string;
  phone: string;
  city: 'Lagos' | 'Abuja' | 'Port Harcourt' | 'Ibadan' | 'Kano';
  area: string;
  categories: TaskCategorySlug[];
  hourlyRateNaira: number;
  rating: number; // e.g. 4.9
  reviewCount: number;
  completedTasksCount: number;
  responseTimeMinutes: number; // e.g. 15
  acceptanceRatePercent: number; // e.g. 96
  completionRatePercent: number; // e.g. 99
  isBukieStar: boolean; // Top 15% Elite badge
  isSameHourAvailable: boolean;
  passportTier: 'Lite' | 'Pro'; // BukiePassport level
  bvnVerified: boolean;
  ninVerified: boolean;
  smartSelfieVerified: boolean;
  bio: string;
}

export type TaskStatus = 
  | 'draft'
  | 'booking_confirmed'
  | 'artisan_en_route'
  | 'job_in_progress'
  | 'invoice_submitted'
  | 'completed_and_paid'
  | 'disputed'
  | 'cancelled';

export interface TaskBooking {
  id: string;
  categorySlug: TaskCategorySlug;
  categoryName: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  artisanId: string;
  artisanName: string;
  artisanAvatar: string;
  artisanPhoneMasked: string;
  city: string;
  address: string;
  scheduledDate: string;
  scheduledTime: string;
  description: string;
  photoUrls: string[];
  status: TaskStatus;
  urgency: 'Normal' | 'Same-Day' | 'Same-Hour Emergency';
  
  // Pricing & Financial Breakdown
  artisanRateNaira: number;
  estimatedHours: number;
  subtotalNaira: number;
  platformServiceFeeNaira: number; // 10% (TECHNICAL_SPEC.md Section 11)
  trustGuaranteeFeeNaira: number; // 7.5%
  totalNaira: number;
  preAuthPaymentMethod: 'Paystack Card' | 'Paystack Transfer' | 'Flutterwave USSD';
  preAuthStatus: 'Pre-Authorized' | 'Captured' | 'Refunded';

  // Invoicing & Escrow
  invoiceHours?: number | undefined;
  additionalExpensesNaira?: number | undefined;
  expenseReceiptUrl?: string | undefined;
  finalInvoiceTotalNaira?: number | undefined;
  
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  bookingId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  text: string;
  voiceNoteUrl?: string | undefined;
  imageUrl?: string | undefined;
  timestamp: string;
  isFlaggedForBypass?: boolean | undefined; // Anti-disintermediation
  flaggedReason?: string | undefined;
}

export interface ArtisanWallet {
  artisanId: string;
  availableBalanceNaira: number;
  pendingEscrowNaira: number;
  lifetimeEarningsNaira: number;
  payoutBankName: string;
  payoutAccountNumber: string;
  payoutAccountName: string;
  recentTransactions: Array<{
    id: string;
    bookingId: string;
    description: string;
    amountNaira: number;
    type: 'earning' | 'payout' | 'fee';
    status: 'completed' | 'pending';
    date: string;
  }>;
}

export interface AdminDispute {
  id: string;
  bookingId: string;
  clientName: string;
  artisanName: string;
  issueType: 'Quality Complaint' | 'Property Damage' | 'No-Show' | 'Off-Platform Solicitation';
  description: string;
  claimAmountNaira?: number;
  status: 'Open Review' | 'Under Investigation' | 'Resolved Refund' | 'Resolved Pay Artisan' | 'BukieGuarantee Paid';
  createdAt: string;
}

// WEB-010: Customer Dashboard Contracts
export type DashboardStateMode =
  | 'first_run'
  | 'active'
  | 'upcoming'
  | 'recent'
  | 'mixed'
  | 'loading'
  | 'partial_failure'
  | 'offline'
  | 'auth_failure';

export interface DashboardCustomer {
  id: string;
  name: string;
  email?: string | undefined;
  phone?: string | undefined;
  role: UserRole;
}

export interface DashboardActiveWorkItem {
  id: string;
  type: 'job_request' | 'booking';
  title: string;
  category?: string | undefined;
  status: 'reviewing_proposals' | 'artisan_responding' | 'awaiting_confirmation';
  statusLabel: string;
  location: string;
  scheduleContext: string;
  createdAt: string;
  budget?: string | undefined;
  preferredWorkerName?: string | undefined;
  actionUrl: string;
  actionLabel: string;
}

export interface DashboardUpcomingWorkItem {
  id: string;
  serviceTitle: string;
  workerName: string;
  workerAvatar?: string | undefined;
  workerVerified: boolean;
  date: string;
  arrivalWindow: string;
  location: string;
  status: 'confirmed' | 'scheduled';
  preparationTip?: string | undefined;
  actionUrl: string;
  actionLabel: string;
}

export interface DashboardRecentActivityItem {
  id: string;
  title: string;
  workerName: string;
  completedDate: string;
  status: 'completed' | 'cancelled';
  amount?: string | undefined;
  location: string;
  actionUrl: string;
  actionLabel: string;
}

export interface DashboardMarketplaceItem {
  id: string;
  title: string;
  description: string;
  startingPrice: string;
  categorySlug: string;
  href: string;
  iconName?: string | undefined;
}

export interface DashboardViewModel {
  customer: DashboardCustomer;
  stateMode: DashboardStateMode;
  activeWork: DashboardActiveWorkItem[];
  upcomingWork: DashboardUpcomingWorkItem[];
  recentActivity: DashboardRecentActivityItem[];
  marketplaceContinuation: DashboardMarketplaceItem[];
  newJobNotice?: {
    reference: string;
    title: string;
  } | undefined;
  isOffline?: boolean | undefined;
  hasPartialFailure?: boolean | undefined;
  failedSection?: string | undefined;
}

// WEB-011: Customer Jobs & Bookings Contracts
export type CustomerActivityType = 'job_request' | 'booking';

export type CustomerActivityStatus =
  | 'request_received'
  | 'awaiting_progress'
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface StatusPresentationModel {
  status: CustomerActivityStatus;
  label: string;
  badgeVariant: 'neutral' | 'info' | 'success' | 'warning' | 'destructive';
}

/**
 * Deterministic presentation adapter from canonical production JobStatus to customer-facing presentation model.
 * Directional: UI must not directly mutate presentation statuses; mutations must invoke canonical transition rules.
 */
export function mapJobStatusToPresentation(
  status: JobStatus,
  options?: { isDirectBooking?: boolean; hasAssignedTasker?: boolean }
): StatusPresentationModel {
  switch (status) {
    case 'OPEN':
      return options?.hasAssignedTasker || options?.isDirectBooking
        ? { status: 'awaiting_progress', label: 'Awaiting Acceptance', badgeVariant: 'info' }
        : { status: 'request_received', label: 'Request Received', badgeVariant: 'neutral' };

    case 'PENDING_ACCEPTANCE':
      return { status: 'awaiting_progress', label: 'BrainWorker Responding', badgeVariant: 'info' };

    case 'CONFIRMED':
      return { status: 'scheduled', label: 'Scheduled', badgeVariant: 'info' };

    case 'IN_PROGRESS':
      return { status: 'in_progress', label: 'In Progress', badgeVariant: 'warning' };

    case 'PENDING_COMPLETION':
      return { status: 'in_progress', label: 'Pending Completion Review', badgeVariant: 'warning' };

    case 'COMPLETED':
      return { status: 'completed', label: 'Completed', badgeVariant: 'success' };

    case 'PAID':
      return { status: 'completed', label: 'Completed & Paid', badgeVariant: 'success' };

    case 'CANCELLED':
      return { status: 'cancelled', label: 'Cancelled', badgeVariant: 'destructive' };

    case 'EXPIRED':
      return { status: 'cancelled', label: 'Expired', badgeVariant: 'destructive' };

    case 'DISPUTED':
      return { status: 'awaiting_progress', label: 'Dispute Open', badgeVariant: 'destructive' };

    case 'RESOLVED':
      // Distinct customer presentation semantics:
      // Neutral label without unconfirmed assumptions regarding pending settlement or payouts.
      return { status: 'awaiting_progress', label: 'Dispute Resolved', badgeVariant: 'info' };

    default: {
      const _exhaustiveCheck: never = status;
      throw new Error(`[Lifecycle] Unhandled JobStatus encountered: ${_exhaustiveCheck}`);
    }
  }
}

export type ActivityFilterView = 'all' | 'active' | 'upcoming' | 'past';

export interface CustomerActivityPreferredWorker {
  name: string;
  avatar?: string | undefined;
  verified?: boolean | undefined;
}

export interface CustomerActivityNextAction {
  label: string;
  url: string;
  primary?: boolean | undefined;
}

export interface CustomerActivityItem {
  id: string;
  type: CustomerActivityType;
  title: string;
  status: CustomerActivityStatus;
  statusLabel: string;
  service?: string | undefined;
  category?: string | undefined;
  location: string;
  schedule: string;
  budgetOrPrice?: string | undefined;
  budgetKobo?: number | undefined;
  priceKobo?: number | undefined;
  jobStatus?: JobStatus | undefined;
  description?: string | undefined;
  preferredWorker?: CustomerActivityPreferredWorker | undefined;
  referenceCode?: string | undefined;
  nextAction?: CustomerActivityNextAction | undefined;
  createdAt: string;
}

export interface CustomerActivityCustomer {
  id: string;
  name: string;
  email?: string | undefined;
  phone?: string | undefined;
  role: UserRole;
}

export interface CustomerActivityViewModel {
  customer: CustomerActivityCustomer;
  activities: CustomerActivityItem[];
  allActivities: CustomerActivityItem[];
  activeActivities: CustomerActivityItem[];
  upcomingActivities: CustomerActivityItem[];
  pastActivities: CustomerActivityItem[];
  totalCount: number;
  availableFilters: ActivityFilterView[];
  currentFilter: ActivityFilterView;
  selectedActivityId?: string | undefined;
  selectedActivity?: CustomerActivityItem | undefined;
  stateMode:
    | 'first_run'
    | 'active'
    | 'upcoming'
    | 'recent'
    | 'mixed'
    | 'loading'
    | 'partial_failure'
    | 'offline'
    | 'auth_failure';
  newJobNotice?: {
    reference: string;
    title: string;
  } | undefined;
  isOffline?: boolean | undefined;
  hasPartialFailure?: boolean | undefined;
  failedSection?: string | undefined;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Location Resolution Contracts (ARCH-002 Staged Resolution)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface CustomerLocationInput {
  streetAddress: string;
  city: string;
  landmark?: string | undefined;
}

export interface ResolvedJobLocation {
  address: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  landmark?: string | undefined;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Customer Activity Repository Boundary (ARCH-002 Replaceable Data Layer)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type JobLifecycleAction =
  | { type: 'CANCEL'; reason: string }
  | { type: 'CONFIRM_COMPLETION' }
  | { type: 'OPEN_DISPUTE'; reason: string };

export interface CustomerActivityFilter {
  view?: ActivityFilterView | undefined;
  status?: JobStatus | undefined;
  limit?: number | undefined;
}

export interface ICustomerActivityRepository {
  /** Retrieves customer activity presentation items for the authenticated customer */
  getActivities(customerId: string, filter?: CustomerActivityFilter): Promise<CustomerActivityItem[]>;

  /** Retrieves a single activity presentation item by ID or human-facing reference */
  getActivityById(customerId: string, identifier: string): Promise<CustomerActivityItem | null>;

  /** Submits a validated CustomerJobCreationInput or CreateJobRequest and returns the resulting customer activity presentation item */
  createJob(customerId: string, payload: CustomerJobCreationInput | CreateJobRequest): Promise<CustomerActivityItem>;

  /** Generic production-aligned lifecycle mutation boundary validated against canonical state machine */
  mutateJobStatus(customerId: string, jobId: string, action: JobLifecycleAction): Promise<CustomerActivityItem>;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// WEB-012: Customer Job Matching Domain Contracts
// Production-first interface boundary. Replace MockMatchingRepository
// with ApiMatchingRepository in production without UI redesign.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Operational matching state from the customer's perspective.
 * Distinct from HTTP errors and job lifecycle state.
 */
export type MatchingState =
  | 'in_progress'        // Matching operation is still running
  | 'matches_available'  // At least one eligible candidate exists
  | 'no_matches'         // Completed; zero eligible results
  | 'constraint_limited' // A specific constraint is blocking results
  | 'partial_results'    // Some candidates available; some data unavailable
  | 'failed'             // Matching operation could not complete technically
  | 'offline'            // Client cannot reach the matching service
  | 'invalid_context'    // Job context cannot be safely resolved
  | 'auth_required';     // Session expired mid-flow

/**
 * Customer-safe explanation tag for why a BrainWorker matches.
 * Never expose internal ranking weights or risk signals.
 */
export type MatchExplanationTag =
  | 'service_match'       // Matches the requested service category
  | 'schedule_available'  // Available for the requested time window
  | 'location_match'      // Serves the requested area
  | 'budget_compatible'   // Fits the customer's stated budget
  | 'strong_track_record' // Solid completed-work history
  | 'highly_rated'        // Strong public rating where supported
  | 'verified_identity';  // Identity verification supported publicly

/** Eligibility result for a candidate: pass/fail only, no internal signals */
export type MatchEligibilityOutcome = 'eligible' | 'ineligible' | 'pending';

/**
 * Public BrainWorker information safe to display in a match context.
 * Mirrors approved WEB-005 public profile fields only, no private data.
 */
export interface MatchCandidateProfile {
  /** Durable BrainWorker identifier */
  brainWorkerId: string;
  displayName: string;
  avatarUrl?: string | undefined;
  /** Public service-area description, not precise coordinates */
  serviceAreaLabel?: string | undefined;
  /** Supported public services / skills summary */
  servicesLabel?: string | undefined;
  /** Rating is omitted entirely when unavailable, never fabricated */
  publicRating?: number | undefined;
  completedJobCount?: number | undefined;
  /** Human-readable pricing context e.g. "₦8,000 to ₦15,000 / visit" */
  rateLabel?: string | undefined;
  /** Whether identity verification is publicly supported */
  identityVerified?: boolean | undefined;
  /** Availability context where supported, never fabricated */
  availabilityLabel?: string | undefined;
}

/**
 * A single ranked BrainWorker candidate within a match result.
 * Rank is supplied by the matching domain; the UI must not reorder.
 */
export interface MatchCandidate {
  /** Stable candidate ID within this result set */
  candidateId: string;
  rank: number;
  eligibility: MatchEligibilityOutcome;
  profile: MatchCandidateProfile;
  /** Customer-readable reasons for the match, omit if none available */
  explanations?: MatchExplanationTag[] | undefined;
  /** Whether the customer has expressed interest in this candidate */
  selectionState?: 'none' | 'interest_expressed' | 'pending' | undefined;
}

/**
 * The full result delivered to the customer for a matching request.
 * Carries matching state, ranked candidates, and recovery information.
 */
export interface RankedMatchResult {
  /** Durable job reference code: human-facing, not raw UUID */
  jobReferenceCode: string;
  /** Job title displayed for context */
  jobTitle: string;
  jobServiceLabel?: string | undefined;
  /** Customer's submitted location string */
  jobLocation?: string | undefined;
  /** Customer's submitted schedule string */
  jobSchedule?: string | undefined;
  /** Customer's budget display or undefined if not specified */
  jobBudgetLabel?: string | undefined;
  /** Customer description: safely rendered, never treated as markup */
  jobDescription?: string | undefined;
  state: MatchingState;
  candidates: MatchCandidate[];
  /** Constraint description when state is 'constraint_limited': category only */
  constraintLabel?: string | undefined;
  /** ISO timestamp when result was generated, omit if not reliable */
  resultGeneratedAt?: string | undefined;
  totalCandidateCount?: number | undefined;
}

/** Customer action on a match candidate: selection is not booking confirmation */
export type MatchSelectionActionType = 'EXPRESS_INTEREST' | 'WITHDRAW_INTEREST';

export interface MatchSelectionAction {
  type: MatchSelectionActionType;
  candidateId: string;
  jobReferenceCode: string;
}

export interface MatchSelectionResult {
  candidateId: string;
  newSelectionState: 'interest_expressed' | 'none' | 'pending';
  /** Honest label: never claims booking, acceptance, payment, or dispatch */
  confirmationLabel: string;
}

/**
 * Stable repository interface for matching.
 * MockMatchingRepository → ApiMatchingRepository in production
 * without changing the customer-facing information architecture.
 */
export interface IMatchingRepository {
  /**
   * Fetch ranked match results for a customer's job request.
   * Always returns a RankedMatchResult, never throws for domain conditions.
   * Throws only for programming errors (missing required parameters etc.).
   */
  getMatchesForJob(
    customerId: string,
    jobReferenceCode: string
  ): Promise<RankedMatchResult>;

  /**
   * Record customer interest in a specific match candidate.
   * Must not claim BrainWorker has accepted or that a booking was created.
   */
  recordSelection(
    customerId: string,
    action: MatchSelectionAction
  ): Promise<MatchSelectionResult>;
}

