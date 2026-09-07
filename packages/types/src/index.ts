export type UserRole = 'client' | 'artisan' | 'admin';

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
  role: string;
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

