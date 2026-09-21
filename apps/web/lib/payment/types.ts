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

export interface CheckoutSession {
  checkoutReference: string;
  bookingId: string;
  totalPayableNaira: number;
  availableMethods: PaymentMethod[];
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
  verifyPayment(authenticatedCustomerId: string, paymentReference: string): Promise<PaymentVerificationResult>;
  checkVerificationStatus(authenticatedCustomerId: string, paymentReference: string): Promise<PaymentVerificationResult>;
  getPaymentAttempts(authenticatedCustomerId: string, bookingId: string): Promise<PaymentAttempt[]>;
  
  // Escrow Lifecycle
  releaseEscrow(authenticatedCustomerId: string, input: ReleaseEscrowInput): Promise<EscrowReleaseResult>;
  retryRelease(authenticatedCustomerId: string, bookingId: string): Promise<EscrowReleaseResult>;
  disputeEscrow(authenticatedCustomerId: string, input: DisputeEscrowInput): Promise<DisputeResult>;
  
  // Refunds and Receipts
  requestRefund(authenticatedCustomerId: string, input: RequestRefundInput): Promise<RefundRequestResult>;
  getRefundStatus(authenticatedCustomerId: string, bookingId: string): Promise<RefundStatusDetails>;
  getReceipt(authenticatedCustomerId: string, bookingId: string): Promise<PaymentReceipt>;
}
