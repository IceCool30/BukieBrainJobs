import type { JobStatus } from '@bukiebrainjobs/api-types';

export type PaymentMethod = 'card' | 'bank_transfer' | 'ussd';
export type PaymentRail = 'card_processor' | 'virtual_account' | 'ussd_session';

export type PaymentAuthorizationStatus =
  | 'idle'
  | 'initiating'
  | 'awaiting_payment'
  | 'processing'
  | 'verified'
  | 'failed'
  | 'timeout'
  | 'cancelled';

export type EscrowStatus =
  | 'unfunded'
  | 'held_in_escrow'
  | 'release_pending'
  | 'released'
  | 'release_failed'
  | 'disputed'
  | 'refund_pending'
  | 'refunded'
  | 'refund_failed';

export type DisputeResolutionOutcome =
  | 'customer_refund'
  | 'brainworker_payout'
  | 'split_settlement';

export type SettlementStatus = 'funded' | 'release_pending' | 'settled';

export interface FeeScheduleConfig {
  platformFeePercentage: number;
  escrowProtectionFeePercentage: number;
  statutoryVatPercentage: number;
}

export interface PricingBreakdown {
  baseServiceAmountNaira: number;
  platformServiceFeeNaira: number;
  escrowProtectionFeeNaira: number;
  statutoryVatNaira: number;
  totalPayableNaira: number;
}

export interface VirtualAccountDetails {
  bankName: string;
  accountNumber: string;
  accountName: string;
  expiresAt?: string | undefined;
  reconciliationNotes: string;
}

export interface UssdDetails {
  bankName: string;
  ussdString: string;
  directDialUri: string;
}

export interface PaymentProviderCapabilities {
  providerId: string;
  supportedMethods: PaymentMethod[];
  supportsVirtualAccounts: boolean;
  supportsUssd: boolean;
}

export interface IPaymentProviderAdapter {
  getCapabilities(): PaymentProviderCapabilities;
  generateVirtualAccount(bookingId: string, expiry?: string | undefined): Promise<VirtualAccountDetails>;
  generateUssdDetails(totalPayableNaira: number): Promise<UssdDetails>;
  formatPaymentMethodLabel(method?: PaymentMethod | undefined): string;
}

export interface CheckoutSession {
  checkoutReference: string;
  bookingId: string;
  totalPayableNaira: number;
  availableMethods: PaymentMethod[];
  selectedMethod?: PaymentMethod | undefined;
  virtualAccount?: VirtualAccountDetails | undefined;
  ussd?: UssdDetails | undefined;
  idempotencyKey: string;
  expiresAt: string;
}

export interface PaymentAttempt {
  id: string;
  checkoutReference: string;
  bookingId: string;
  method: PaymentMethod;
  status: PaymentAuthorizationStatus;
  amountNaira: number;
  createdAt: string;
  failureReason?: string | undefined;
}

export interface PaymentVerificationResult {
  status: PaymentAuthorizationStatus;
  paymentReference: string;
  escrowStatus: EscrowStatus;
  verifiedAt?: string | undefined;
  failureReason?: string | undefined;
}

export interface EscrowReleaseResult {
  success: boolean;
  escrowStatus: EscrowStatus;
  releasedAt?: string | undefined;
  failureReason?: string | undefined;
}

export interface DisputeResult {
  success: boolean;
  disputeId: string;
  escrowStatus: EscrowStatus;
  openedAt: string;
}

export interface RefundRequestResult {
  success: boolean;
  refundReference: string;
  escrowStatus: EscrowStatus;
  requestedAt: string;
  estimatedDays: string;
  failureReason?: string | undefined;
}

export interface RefundStatusDetails {
  refundReference: string;
  bookingId: string;
  amountNaira: number;
  status: 'pending' | 'processed' | 'failed';
  requestedAt: string;
  estimatedResolution: string;
  processedAt?: string | undefined;
}

export interface PaymentReceipt {
  receiptNumber: string;
  paymentReference: string;
  bookingId: string;
  bookingReference: string;
  customerId: string;
  customerName: string;
  customerPhoneMasked: string;
  workerId: string;
  workerName: string;
  serviceTitle: string;
  address: string;
  pricing: PricingBreakdown;
  paymentMethodUsed: string;
  paidAt: string;
  settlementStatus: SettlementStatus;
  settlementDate?: string | undefined;
  isSimulatedTestDocument: boolean;
}

export interface PaymentContext {
  bookingId: string;
  customerId: string;
  jobStatus: JobStatus;
  bookingStatus: string;
  serviceTitle: string;
  workerName: string;
  workerAvatar?: string | undefined;
  serviceLocation: string;
  pricing: PricingBreakdown;
  paymentAuthStatus: PaymentAuthorizationStatus;
  escrowStatus: EscrowStatus;
  currentPaymentReference?: string | undefined;
  activeCheckoutSession?: CheckoutSession | undefined;
  receiptAvailable: boolean;
  activeDisputeId?: string | undefined;
  activeRefundReference?: string | undefined;
}

export interface InitiateCheckoutInput {
  bookingId: string;
  idempotencyKey: string;
  preferredMethod?: PaymentMethod | undefined;
  providerVirtualAccountExpiry?: string | undefined;
}

export interface ReleaseEscrowInput {
  bookingId: string;
  customerFeedback?: string | undefined;
  customerRating?: number | undefined;
}

export interface DisputeEscrowInput {
  bookingId: string;
  reason: string;
  description: string;
}

export interface RequestRefundInput {
  bookingId: string;
  reason: string;
  notes?: string | undefined;
}

export interface ICustomerPaymentRepository {
  getPaymentContext(authenticatedCustomerId: string, bookingId: string): Promise<PaymentContext>;
  getFeeConfig(): Promise<FeeScheduleConfig>;
  calculatePricing(baseAmountNaira: number): Promise<PricingBreakdown>;
  
  // Checkout and Authorization
  initiateCheckout(authenticatedCustomerId: string, input: InitiateCheckoutInput): Promise<CheckoutSession>;
  verifyPayment(
    authenticatedCustomerId: string,
    paymentReference: string,
    method?: PaymentMethod
  ): Promise<PaymentVerificationResult>;
  checkVerificationStatus(
    authenticatedCustomerId: string,
    paymentReference: string,
    method?: PaymentMethod
  ): Promise<PaymentVerificationResult>;
  getPaymentAttempts(authenticatedCustomerId: string, bookingId: string): Promise<PaymentAttempt[]>;
  
  // Escrow Lifecycle
  releaseEscrow(authenticatedCustomerId: string, input: ReleaseEscrowInput): Promise<EscrowReleaseResult>;
  retryRelease(authenticatedCustomerId: string, bookingId: string): Promise<EscrowReleaseResult>;
  disputeEscrow(authenticatedCustomerId: string, input: DisputeEscrowInput): Promise<DisputeResult>;
  
  // Refunds and Receipts
  requestRefund(authenticatedCustomerId: string, input: RequestRefundInput): Promise<RefundRequestResult>;
  getRefundStatus(authenticatedCustomerId: string, bookingId: string): Promise<RefundStatusDetails>;
  getReceipt(authenticatedCustomerId: string, bookingId: string): Promise<PaymentReceipt>;

  // Provider Capabilities
  getProviderCapabilities(): Promise<PaymentProviderCapabilities>;
}

export type DeterministicScenarioName =
  | 'confirmed_unfunded'
  | 'card_processing'
  | 'card_verified'
  | 'card_failed_insufficient_funds'
  | 'card_failed_network_error'
  | 'payment_timeout'
  | 'bank_transfer_pending'
  | 'bank_transfer_verified'
  | 'ussd_pending'
  | 'escrow_held'
  | 'pending_completion'
  | 'release_pending'
  | 'release_failed'
  | 'released'
  | 'refund_pending'
  | 'refund_failed'
  | 'refunded'
  | 'disputed'
  | 'dispute_resolved_refund'
  | 'dispute_resolved_payout'
  | 'offline_read_only';

export interface InternalBookingRecord {
  bookingId: string;
  customerId: string;
  jobStatus: JobStatus;
  bookingStatus: string;
  serviceTitle: string;
  workerName: string;
  workerAvatar?: string | undefined;
  serviceLocation: string;
  baseAmountNaira: number;
  paymentAuthStatus: PaymentAuthorizationStatus;
  escrowStatus: EscrowStatus;
  currentPaymentReference?: string | undefined;
  verifiedPaymentMethod?: PaymentMethod | undefined;
  activeDisputeId?: string | undefined;
  activeRefundReference?: string | undefined;
}

export interface PaymentStoreData {
  bookings: Map<string, InternalBookingRecord>;
  checkoutSessions: Map<string, CheckoutSession>;
  idempotencyMap: Map<string, string>;
  paymentAttempts: Map<string, PaymentAttempt[]>;
  receipts: Map<string, PaymentReceipt>;
  refundDetails: Map<string, RefundStatusDetails>;
  feeConfig: FeeScheduleConfig;
  isOffline: boolean;
  nextPaymentOutcome?: { status: PaymentAuthorizationStatus; reason?: string | undefined } | null;
  nextEscrowOutcome?: { status: EscrowStatus; reason?: string | undefined } | null;
}

export const DEFAULT_PAYMENT_BOOKINGS: InternalBookingRecord[] = [
  {
    bookingId: 'book-ac-001',
    customerId: 'usr-customer-88',
    jobStatus: 'CONFIRMED',
    bookingStatus: 'booking_confirmed',
    serviceTitle: 'Inverter Backup & Battery Inspection',
    workerName: 'Tunde Oladipo',
    workerAvatar: '/images/workers/tunde.jpg',
    serviceLocation: 'Block B4, 1004 Estate, Victoria Island, Lagos',
    baseAmountNaira: 20000,
    paymentAuthStatus: 'idle',
    escrowStatus: 'unfunded',
  },
  {
    bookingId: 'book-1',
    customerId: 'usr-customer-88',
    jobStatus: 'COMPLETED',
    bookingStatus: 'completed_and_paid',
    serviceTitle: 'Plumbing Drainage Pressure Test',
    workerName: 'Emeka Obi',
    workerAvatar: '/images/workers/emeka.jpg',
    serviceLocation: 'Ikeja GRA, Lagos',
    baseAmountNaira: 25000,
    paymentAuthStatus: 'verified',
    escrowStatus: 'released',
    verifiedPaymentMethod: 'card',
  },
  {
    bookingId: 'BKG-77210',
    customerId: 'usr-customer-default',
    jobStatus: 'IN_PROGRESS',
    bookingStatus: 'job_in_progress',
    serviceTitle: 'Split-Unit AC Deep Servicing',
    workerName: 'Chidi Okonkwo',
    workerAvatar: '/images/workers/chidi.jpg',
    serviceLocation: 'Victoria Island, Lagos',
    baseAmountNaira: 18000,
    paymentAuthStatus: 'verified',
    escrowStatus: 'held_in_escrow',
    verifiedPaymentMethod: 'card',
  },
  {
    bookingId: 'BKG-63102',
    customerId: 'usr-customer-default',
    jobStatus: 'CONFIRMED',
    bookingStatus: 'booking_confirmed',
    serviceTitle: 'Plumbing Drainage Pressure Test',
    workerName: 'Emeka Obi',
    workerAvatar: '/images/workers/emeka.jpg',
    serviceLocation: 'Surulere, Lagos',
    baseAmountNaira: 22000,
    paymentAuthStatus: 'idle',
    escrowStatus: 'unfunded',
  },
  {
    bookingId: 'BKG-44109',
    customerId: 'usr-customer-default',
    jobStatus: 'CONFIRMED',
    bookingStatus: 'booking_confirmed',
    serviceTitle: 'Electrical Wiring Troubleshooting',
    workerName: 'Tunde Oladipo',
    workerAvatar: '/images/workers/tunde.jpg',
    serviceLocation: 'Yaba, Lagos',
    baseAmountNaira: 35000,
    paymentAuthStatus: 'idle',
    escrowStatus: 'unfunded',
  },
  {
    bookingId: 'act-confirmed-001',
    customerId: 'usr-customer-default',
    jobStatus: 'CONFIRMED',
    bookingStatus: 'booking_confirmed',
    serviceTitle: 'Electrical Fault Diagnosis',
    workerName: 'Babatunde Adeleke',
    workerAvatar: '/images/workers/tunde.jpg',
    serviceLocation: 'Yaba, Lagos',
    baseAmountNaira: 30000,
    paymentAuthStatus: 'idle',
    escrowStatus: 'unfunded',
  },
];

export interface ICustomerPaymentTestController {
  setOffline(offline: boolean): void;
  setNextPaymentOutcome(status: PaymentAuthorizationStatus, reason?: string | undefined): void;
  setNextEscrowOutcome(status: EscrowStatus, reason?: string | undefined): void;
  setMockBookingState(bookingId: string, updates: Partial<InternalBookingRecord>): void;
  loadScenario(scenario: DeterministicScenarioName, bookingId: string, customerId: string): void;
  seedBooking(booking: InternalBookingRecord): void;
  reset(): void;
}

