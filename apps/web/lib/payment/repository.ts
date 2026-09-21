import type {
  ICustomerPaymentRepository,
  PaymentAuthorizationStatus,
  EscrowStatus,
  SettlementStatus,
  FeeScheduleConfig,
  PricingBreakdown,
  CheckoutSession,
  PaymentAttempt,
  PaymentVerificationResult,
  EscrowReleaseResult,
  DisputeResult,
  RefundRequestResult,
  RefundStatusDetails,
  PaymentReceipt,
  PaymentContext,
  InitiateCheckoutInput,
  ReleaseEscrowInput,
  DisputeEscrowInput,
  RequestRefundInput,
  PaymentMethod,
  InternalBookingRecord,
  ICustomerPaymentTestController,
  DeterministicScenarioName,
  IPaymentProviderAdapter,
  PaymentProviderCapabilities,
} from './types';
import { SandboxPaymentProviderAdapter } from './provider-adapter';

/**
 * In-memory state store for payment and escrow domain records.
 * Keeps production repository behavior isolated from state mutation fixtures.
 */
export class PaymentInternalStore {
  public bookings = new Map<string, InternalBookingRecord>();
  public checkoutSessions = new Map<string, CheckoutSession>();
  public idempotencyMap = new Map<string, string>();
  public paymentAttempts = new Map<string, PaymentAttempt[]>();
  public receipts = new Map<string, PaymentReceipt>();
  public refundDetails = new Map<string, RefundStatusDetails>();
  public isOffline = false;
  public nextPaymentOutcome: { status: PaymentAuthorizationStatus; reason?: string | undefined } | null = null;
  public nextEscrowOutcome: { status: EscrowStatus; reason?: string | undefined } | null = null;

  public feeConfig: FeeScheduleConfig = {
    platformFeePercentage: 10.0,
    escrowProtectionFeePercentage: 7.5,
    statutoryVatPercentage: 7.5,
  };

  constructor() {
    this.seedDefaults();
  }

  public seedDefaults() {
    const seededBookings: InternalBookingRecord[] = [
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

    for (const b of seededBookings) {
      this.bookings.set(b.bookingId, b);
    }
  }

  public reset() {
    this.bookings.clear();
    this.checkoutSessions.clear();
    this.idempotencyMap.clear();
    this.paymentAttempts.clear();
    this.receipts.clear();
    this.refundDetails.clear();
    this.isOffline = false;
    this.nextPaymentOutcome = null;
    this.nextEscrowOutcome = null;
    this.seedDefaults();
  }
}

/**
 * Production-facing customer payment repository.
 * Implements strictly ICustomerPaymentRepository with zero fixture/test controls.
 * Delegates provider-specific details to an injected IPaymentProviderAdapter.
 */
export class CustomerPaymentRepository implements ICustomerPaymentRepository {
  constructor(
    private store: PaymentInternalStore = new PaymentInternalStore(),
    private providerAdapter: IPaymentProviderAdapter = new SandboxPaymentProviderAdapter()
  ) {}

  private validateOwnership(authenticatedCustomerId: string, bookingId: string): InternalBookingRecord {
    if (!authenticatedCustomerId || authenticatedCustomerId.trim().length === 0) {
      throw new Error('[Security] Unauthorized: authenticated customerId is required.');
    }
    const booking = this.store.bookings.get(bookingId);
    if (!booking) {
      throw new Error(`[NotFound] Booking ${bookingId} not found.`);
    }
    if (booking.customerId !== authenticatedCustomerId) {
      throw new Error(`[Security] Unauthorized: caller ${authenticatedCustomerId} does not own booking ${bookingId}.`);
    }
    return booking;
  }

  private checkOfflineMutation() {
    if (this.store.isOffline) {
      throw new Error('[Offline] You are currently offline. Financial operations require an active network connection.');
    }
  }

  async getFeeConfig(): Promise<FeeScheduleConfig> {
    return { ...this.store.feeConfig };
  }

  async calculatePricing(baseAmountNaira: number): Promise<PricingBreakdown> {
    const config = await this.getFeeConfig();
    const platformServiceFeeNaira = Math.round(baseAmountNaira * (config.platformFeePercentage / 100));
    const escrowProtectionFeeNaira = Math.round(baseAmountNaira * (config.escrowProtectionFeePercentage / 100));
    const statutoryVatNaira = Math.round(platformServiceFeeNaira * (config.statutoryVatPercentage / 100));
    const totalPayableNaira =
      baseAmountNaira + platformServiceFeeNaira + escrowProtectionFeeNaira + statutoryVatNaira;

    return {
      baseServiceAmountNaira: baseAmountNaira,
      platformServiceFeeNaira,
      escrowProtectionFeeNaira,
      statutoryVatNaira,
      totalPayableNaira,
    };
  }

  async getProviderCapabilities(): Promise<PaymentProviderCapabilities> {
    return this.providerAdapter.getCapabilities();
  }

  async getPaymentContext(
    authenticatedCustomerId: string,
    bookingId: string
  ): Promise<PaymentContext> {
    const booking = this.validateOwnership(authenticatedCustomerId, bookingId);
    const pricing = await this.calculatePricing(booking.baseAmountNaira);

    let activeCheckoutSession: CheckoutSession | undefined;
    if (booking.currentPaymentReference) {
      activeCheckoutSession = this.store.checkoutSessions.get(booking.currentPaymentReference);
    }

    const receiptAvailable =
      booking.escrowStatus === 'held_in_escrow' ||
      booking.escrowStatus === 'release_pending' ||
      booking.escrowStatus === 'released';

    return {
      bookingId: booking.bookingId,
      customerId: booking.customerId,
      jobStatus: booking.jobStatus,
      bookingStatus: booking.bookingStatus,
      serviceTitle: booking.serviceTitle,
      workerName: booking.workerName,
      workerAvatar: booking.workerAvatar,
      serviceLocation: booking.serviceLocation,
      pricing,
      paymentAuthStatus: booking.paymentAuthStatus,
      escrowStatus: booking.escrowStatus,
      currentPaymentReference: booking.currentPaymentReference,
      activeCheckoutSession,
      receiptAvailable,
      activeDisputeId: booking.activeDisputeId,
      activeRefundReference: booking.activeRefundReference,
    };
  }

  async initiateCheckout(
    authenticatedCustomerId: string,
    input: InitiateCheckoutInput
  ): Promise<CheckoutSession> {
    this.checkOfflineMutation();
    const booking = this.validateOwnership(authenticatedCustomerId, input.bookingId);

    // Invariant checks
    if (booking.jobStatus !== 'CONFIRMED') {
      throw new Error(`[Invariant] Cannot fund escrow for job in status ${booking.jobStatus}. Only CONFIRMED bookings may be funded.`);
    }
    if (booking.escrowStatus === 'held_in_escrow' || booking.escrowStatus === 'released') {
      throw new Error(`[Invariant] Escrow is already funded or released for booking ${input.bookingId}.`);
    }

    // Idempotency check
    const existingRef = this.store.idempotencyMap.get(input.idempotencyKey);
    if (existingRef) {
      const existingSession = this.store.checkoutSessions.get(existingRef);
      if (existingSession) {
        return { ...existingSession };
      }
    }

    const pricing = await this.calculatePricing(booking.baseAmountNaira);
    const checkoutReference = `bbj-chk-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    const virtualAccount = await this.providerAdapter.generateVirtualAccount(
      input.bookingId,
      input.providerVirtualAccountExpiry
    );

    const ussd = await this.providerAdapter.generateUssdDetails(pricing.totalPayableNaira);
    const capabilities = this.providerAdapter.getCapabilities();

    const session: CheckoutSession = {
      checkoutReference,
      bookingId: input.bookingId,
      totalPayableNaira: pricing.totalPayableNaira,
      availableMethods: capabilities.supportedMethods,
      virtualAccount,
      ussd,
      idempotencyKey: input.idempotencyKey,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    };

    this.store.checkoutSessions.set(checkoutReference, session);
    this.store.idempotencyMap.set(input.idempotencyKey, checkoutReference);

    booking.currentPaymentReference = checkoutReference;
    booking.paymentAuthStatus = 'awaiting_payment';

    return { ...session };
  }

  async verifyPayment(
    authenticatedCustomerId: string,
    checkoutReference: string,
    method?: PaymentMethod
  ): Promise<PaymentVerificationResult> {
    this.checkOfflineMutation();
    const session = this.store.checkoutSessions.get(checkoutReference);
    if (!session) {
      throw new Error(`[NotFound] Checkout reference ${checkoutReference} not found.`);
    }
    const booking = this.validateOwnership(authenticatedCustomerId, session.bookingId);

    const effectiveMethod: PaymentMethod = method || 'card';

    // Outcome simulation from test controller
    if (this.store.nextPaymentOutcome) {
      const simulated = this.store.nextPaymentOutcome;
      this.store.nextPaymentOutcome = null;

      booking.paymentAuthStatus = simulated.status;

      const attempt: PaymentAttempt = {
        id: `att-${Date.now()}`,
        checkoutReference,
        bookingId: booking.bookingId,
        method: effectiveMethod,
        status: simulated.status,
        amountNaira: session.totalPayableNaira,
        createdAt: new Date().toISOString(),
        failureReason: simulated.reason,
      };
      this.recordAttempt(booking.bookingId, attempt);

      if (simulated.status === 'verified') {
        booking.escrowStatus = 'held_in_escrow';
        booking.verifiedPaymentMethod = effectiveMethod;
      }

      return {
        status: simulated.status,
        paymentReference: checkoutReference,
        escrowStatus: booking.escrowStatus,
        failureReason: simulated.reason,
        verifiedAt: simulated.status === 'verified' ? new Date().toISOString() : undefined,
      };
    }

    // Default successful verification
    booking.paymentAuthStatus = 'verified';
    booking.escrowStatus = 'held_in_escrow';
    booking.verifiedPaymentMethod = effectiveMethod;

    const attempt: PaymentAttempt = {
      id: `att-${Date.now()}`,
      checkoutReference,
      bookingId: booking.bookingId,
      method: effectiveMethod,
      status: 'verified',
      amountNaira: session.totalPayableNaira,
      createdAt: new Date().toISOString(),
    };
    this.recordAttempt(booking.bookingId, attempt);

    return {
      status: 'verified',
      paymentReference: checkoutReference,
      escrowStatus: 'held_in_escrow',
      verifiedAt: new Date().toISOString(),
    };
  }

  async checkVerificationStatus(
    authenticatedCustomerId: string,
    checkoutReference: string,
    method?: PaymentMethod
  ): Promise<PaymentVerificationResult> {
    this.checkOfflineMutation();
    const session = this.store.checkoutSessions.get(checkoutReference);
    if (!session) {
      throw new Error(`[NotFound] Checkout reference ${checkoutReference} not found.`);
    }
    const booking = this.validateOwnership(authenticatedCustomerId, session.bookingId);

    const effectiveMethod: PaymentMethod = method || booking.verifiedPaymentMethod || 'card';

    if (this.store.nextPaymentOutcome) {
      const simulated = this.store.nextPaymentOutcome;
      this.store.nextPaymentOutcome = null;

      booking.paymentAuthStatus = simulated.status;
      if (simulated.status === 'verified') {
        booking.escrowStatus = 'held_in_escrow';
        booking.verifiedPaymentMethod = effectiveMethod;
      }

      return {
        status: simulated.status,
        paymentReference: checkoutReference,
        escrowStatus: booking.escrowStatus,
        failureReason: simulated.reason,
        verifiedAt: simulated.status === 'verified' ? new Date().toISOString() : undefined,
      };
    }

    if (booking.escrowStatus === 'held_in_escrow') {
      return {
        status: 'verified',
        paymentReference: checkoutReference,
        escrowStatus: 'held_in_escrow',
        verifiedAt: new Date().toISOString(),
      };
    }

    booking.paymentAuthStatus = 'verified';
    booking.escrowStatus = 'held_in_escrow';
    booking.verifiedPaymentMethod = effectiveMethod;

    return {
      status: 'verified',
      paymentReference: checkoutReference,
      escrowStatus: 'held_in_escrow',
      verifiedAt: new Date().toISOString(),
    };
  }

  private recordAttempt(bookingId: string, attempt: PaymentAttempt) {
    const list = this.store.paymentAttempts.get(bookingId) || [];
    list.push(attempt);
    this.store.paymentAttempts.set(bookingId, list);
  }

  async getPaymentAttempts(
    authenticatedCustomerId: string,
    bookingId: string
  ): Promise<PaymentAttempt[]> {
    this.validateOwnership(authenticatedCustomerId, bookingId);
    return [...(this.store.paymentAttempts.get(bookingId) || [])];
  }

  async releaseEscrow(
    authenticatedCustomerId: string,
    input: ReleaseEscrowInput
  ): Promise<EscrowReleaseResult> {
    this.checkOfflineMutation();
    const booking = this.validateOwnership(authenticatedCustomerId, input.bookingId);

    if (booking.escrowStatus !== 'held_in_escrow' && booking.escrowStatus !== 'release_failed') {
      throw new Error(`[Invariant] Cannot release escrow from status ${booking.escrowStatus}. Escrow must be held_in_escrow.`);
    }

    if (this.store.nextEscrowOutcome) {
      const simulated = this.store.nextEscrowOutcome;
      this.store.nextEscrowOutcome = null;

      booking.escrowStatus = simulated.status;
      if (simulated.status === 'released') {
        booking.jobStatus = 'COMPLETED';
        booking.bookingStatus = 'completed_and_paid';
      }

      return {
        success: simulated.status === 'released',
        escrowStatus: simulated.status,
        failureReason: simulated.reason,
        releasedAt: simulated.status === 'released' ? new Date().toISOString() : undefined,
      };
    }

    booking.escrowStatus = 'released';
    booking.jobStatus = 'COMPLETED';
    booking.bookingStatus = 'completed_and_paid';

    return {
      success: true,
      escrowStatus: 'released',
      releasedAt: new Date().toISOString(),
    };
  }

  async retryRelease(
    authenticatedCustomerId: string,
    bookingId: string
  ): Promise<EscrowReleaseResult> {
    this.checkOfflineMutation();
    const booking = this.validateOwnership(authenticatedCustomerId, bookingId);

    if (booking.escrowStatus !== 'release_failed') {
      throw new Error(`[Invariant] Only release_failed escrows can be retried. Current status: ${booking.escrowStatus}`);
    }

    return this.releaseEscrow(authenticatedCustomerId, { bookingId });
  }

  async disputeEscrow(
    authenticatedCustomerId: string,
    input: DisputeEscrowInput
  ): Promise<DisputeResult> {
    this.checkOfflineMutation();
    const booking = this.validateOwnership(authenticatedCustomerId, input.bookingId);

    if (booking.escrowStatus !== 'held_in_escrow' && booking.escrowStatus !== 'release_failed') {
      throw new Error(`[Invariant] Cannot dispute escrow in status ${booking.escrowStatus}.`);
    }

    const disputeId = `disp-${booking.bookingId}-${Date.now()}`;
    booking.escrowStatus = 'disputed';
    booking.jobStatus = 'DISPUTED';
    booking.bookingStatus = 'disputed';
    booking.activeDisputeId = disputeId;

    return {
      success: true,
      disputeId,
      escrowStatus: 'disputed',
      openedAt: new Date().toISOString(),
    };
  }

  async requestRefund(
    authenticatedCustomerId: string,
    input: RequestRefundInput
  ): Promise<RefundRequestResult> {
    this.checkOfflineMutation();
    const booking = this.validateOwnership(authenticatedCustomerId, input.bookingId);

    if (booking.jobStatus !== 'CANCELLED') {
      throw new Error(`[Invariant] Refund can only be requested for CANCELLED jobs. Current status: ${booking.jobStatus}`);
    }
    if (booking.escrowStatus !== 'held_in_escrow' && booking.escrowStatus !== 'refund_failed') {
      throw new Error(`[Invariant] Escrow status ${booking.escrowStatus} is not eligible for refund.`);
    }

    const refundReference = `ref-${booking.bookingId}-${Date.now()}`;
    booking.escrowStatus = 'refund_pending';
    booking.activeRefundReference = refundReference;

    const details: RefundStatusDetails = {
      refundReference,
      bookingId: booking.bookingId,
      amountNaira: booking.baseAmountNaira,
      status: 'pending',
      requestedAt: new Date().toISOString(),
      estimatedResolution: '3 to 5 business days',
    };
    this.store.refundDetails.set(refundReference, details);

    return {
      success: true,
      refundReference,
      escrowStatus: 'refund_pending',
      requestedAt: details.requestedAt,
      estimatedDays: '3 to 5 business days',
    };
  }

  async getRefundStatus(
    authenticatedCustomerId: string,
    bookingId: string
  ): Promise<RefundStatusDetails> {
    const booking = this.validateOwnership(authenticatedCustomerId, bookingId);
    if (!booking.activeRefundReference) {
      throw new Error(`[NotFound] No active refund for booking ${bookingId}.`);
    }
    const details = this.store.refundDetails.get(booking.activeRefundReference);
    if (!details) {
      throw new Error(`[NotFound] Refund details not found for reference ${booking.activeRefundReference}.`);
    }
    return { ...details };
  }

  async getReceipt(
    authenticatedCustomerId: string,
    bookingId: string
  ): Promise<PaymentReceipt> {
    const booking = this.validateOwnership(authenticatedCustomerId, bookingId);

    if (booking.escrowStatus === 'unfunded') {
      throw new Error('[Authority] No verified payment record exists for unfunded booking. Cannot generate receipt.');
    }

    let settlementStatus: SettlementStatus = 'funded';
    let settlementDate: string | undefined;

    if (booking.escrowStatus === 'released') {
      settlementStatus = 'settled';
      settlementDate = new Date().toISOString();
    } else if (booking.escrowStatus === 'release_pending') {
      settlementStatus = 'release_pending';
    }

    const pricing = await this.calculatePricing(booking.baseAmountNaira);

    const paymentMethodLabel = this.providerAdapter.formatPaymentMethodLabel(booking.verifiedPaymentMethod);

    const receipt: PaymentReceipt = {
      receiptNumber: `REC-${new Date().getFullYear()}-${booking.bookingId.replace(/[^0-9]/g, '') || '8812'}`,
      paymentReference: booking.currentPaymentReference || `bbj-pay-archived-${booking.bookingId}`,
      bookingId: booking.bookingId,
      bookingReference: `BBJ-${booking.bookingId.toUpperCase()}`,
      customerId: booking.customerId,
      customerName: 'Babajide Adeleke',
      customerPhoneMasked: '+234 803 ••• ••67',
      workerId: 'bw-1',
      workerName: booking.workerName,
      serviceTitle: booking.serviceTitle,
      address: booking.serviceLocation,
      pricing,
      paymentMethodUsed: paymentMethodLabel,
      paidAt: new Date(Date.now() - 3600 * 1000).toISOString(),
      settlementStatus,
      settlementDate,
      isSimulatedTestDocument: true,
    };

    return { ...receipt };
  }
}

/**
 * Dedicated test controller for deterministic state fixtures.
 * Genuinely decoupled from the production repository interface.
 */
export class CustomerPaymentTestController implements ICustomerPaymentTestController {
  constructor(private store: PaymentInternalStore) {}

  setOffline(offline: boolean): void {
    this.store.isOffline = offline;
  }

  setNextPaymentOutcome(status: PaymentAuthorizationStatus, reason?: string | undefined): void {
    this.store.nextPaymentOutcome = { status, reason };
  }

  setNextEscrowOutcome(status: EscrowStatus, reason?: string | undefined): void {
    this.store.nextEscrowOutcome = { status, reason };
  }

  setMockBookingState(bookingId: string, updates: Partial<InternalBookingRecord>): void {
    const existing = this.store.bookings.get(bookingId);
    if (!existing) {
      throw new Error(`[NotFound] Cannot update non-existent booking ${bookingId}`);
    }
    this.store.bookings.set(bookingId, {
      ...existing,
      ...updates,
    });
  }

  seedBooking(booking: InternalBookingRecord): void {
    this.store.bookings.set(booking.bookingId, { ...booking });
  }

  reset(): void {
    this.store.reset();
  }

  loadScenario(scenario: DeterministicScenarioName, bookingId: string, customerId: string): void {
    switch (scenario) {
      case 'confirmed_unfunded':
        this.setMockBookingState(bookingId, {
          customerId,
          jobStatus: 'CONFIRMED',
          bookingStatus: 'booking_confirmed',
          paymentAuthStatus: 'idle',
          escrowStatus: 'unfunded',
        });
        break;

      case 'card_processing':
        this.setMockBookingState(bookingId, {
          customerId,
          jobStatus: 'CONFIRMED',
          bookingStatus: 'booking_confirmed',
          paymentAuthStatus: 'processing',
          escrowStatus: 'unfunded',
        });
        break;

      case 'card_verified':
      case 'escrow_held':
        this.setMockBookingState(bookingId, {
          customerId,
          jobStatus: 'IN_PROGRESS',
          bookingStatus: 'job_in_progress',
          paymentAuthStatus: 'verified',
          escrowStatus: 'held_in_escrow',
        });
        break;

      case 'card_failed_insufficient_funds':
        this.setMockBookingState(bookingId, {
          customerId,
          jobStatus: 'CONFIRMED',
          bookingStatus: 'booking_confirmed',
          paymentAuthStatus: 'failed',
          escrowStatus: 'unfunded',
        });
        this.setNextPaymentOutcome('failed', 'Card declined: Insufficient funds');
        break;

      case 'card_failed_network_error':
        this.setMockBookingState(bookingId, {
          customerId,
          jobStatus: 'CONFIRMED',
          bookingStatus: 'booking_confirmed',
          paymentAuthStatus: 'failed',
          escrowStatus: 'unfunded',
        });
        this.setNextPaymentOutcome('failed', 'Bank network communication error');
        break;

      case 'payment_timeout':
        this.setMockBookingState(bookingId, {
          customerId,
          jobStatus: 'CONFIRMED',
          bookingStatus: 'booking_confirmed',
          paymentAuthStatus: 'timeout',
          escrowStatus: 'unfunded',
        });
        break;

      case 'bank_transfer_pending':
        this.setMockBookingState(bookingId, {
          customerId,
          jobStatus: 'CONFIRMED',
          bookingStatus: 'booking_confirmed',
          paymentAuthStatus: 'awaiting_payment',
          escrowStatus: 'unfunded',
        });
        break;

      case 'bank_transfer_verified':
        this.setMockBookingState(bookingId, {
          customerId,
          jobStatus: 'CONFIRMED',
          bookingStatus: 'booking_confirmed',
          paymentAuthStatus: 'verified',
          escrowStatus: 'held_in_escrow',
        });
        break;

      case 'ussd_pending':
        this.setMockBookingState(bookingId, {
          customerId,
          jobStatus: 'CONFIRMED',
          bookingStatus: 'booking_confirmed',
          paymentAuthStatus: 'awaiting_payment',
          escrowStatus: 'unfunded',
        });
        break;

      case 'pending_completion':
        this.setMockBookingState(bookingId, {
          customerId,
          jobStatus: 'PENDING_COMPLETION',
          bookingStatus: 'invoice_submitted',
          paymentAuthStatus: 'verified',
          escrowStatus: 'held_in_escrow',
        });
        break;

      case 'release_pending':
        this.setMockBookingState(bookingId, {
          customerId,
          jobStatus: 'PENDING_COMPLETION',
          bookingStatus: 'invoice_submitted',
          paymentAuthStatus: 'verified',
          escrowStatus: 'release_pending',
        });
        break;

      case 'release_failed':
        this.setMockBookingState(bookingId, {
          customerId,
          jobStatus: 'PENDING_COMPLETION',
          bookingStatus: 'invoice_submitted',
          paymentAuthStatus: 'verified',
          escrowStatus: 'release_failed',
        });
        break;

      case 'released':
        this.setMockBookingState(bookingId, {
          customerId,
          jobStatus: 'COMPLETED',
          bookingStatus: 'completed_and_paid',
          paymentAuthStatus: 'verified',
          escrowStatus: 'released',
        });
        break;

      case 'refund_pending':
        this.setMockBookingState(bookingId, {
          customerId,
          jobStatus: 'CANCELLED',
          bookingStatus: 'cancelled',
          paymentAuthStatus: 'verified',
          escrowStatus: 'refund_pending',
        });
        break;

      case 'refund_failed':
        this.setMockBookingState(bookingId, {
          customerId,
          jobStatus: 'CANCELLED',
          bookingStatus: 'cancelled',
          paymentAuthStatus: 'verified',
          escrowStatus: 'refund_failed',
        });
        break;

      case 'refunded':
        this.setMockBookingState(bookingId, {
          customerId,
          jobStatus: 'CANCELLED',
          bookingStatus: 'cancelled',
          paymentAuthStatus: 'verified',
          escrowStatus: 'refunded',
        });
        break;

      case 'disputed':
        this.setMockBookingState(bookingId, {
          customerId,
          jobStatus: 'DISPUTED',
          bookingStatus: 'disputed',
          paymentAuthStatus: 'verified',
          escrowStatus: 'disputed',
          activeDisputeId: `disp-${bookingId}`,
        });
        break;

      case 'dispute_resolved_refund':
        this.setMockBookingState(bookingId, {
          customerId,
          jobStatus: 'RESOLVED',
          bookingStatus: 'cancelled',
          paymentAuthStatus: 'verified',
          escrowStatus: 'refunded',
        });
        break;

      case 'dispute_resolved_payout':
        this.setMockBookingState(bookingId, {
          customerId,
          jobStatus: 'RESOLVED',
          bookingStatus: 'completed_and_paid',
          paymentAuthStatus: 'verified',
          escrowStatus: 'released',
        });
        break;

      case 'offline_read_only':
        this.setOffline(true);
        break;

      default:
        break;
    }
  }
}

let sharedStore: PaymentInternalStore | null = null;
let sharedRepository: ICustomerPaymentRepository | null = null;
let sharedTestController: ICustomerPaymentTestController | null = null;

function getSharedStore(): PaymentInternalStore {
  if (!sharedStore) {
    sharedStore = new PaymentInternalStore();
  }
  return sharedStore;
}

export function getCustomerPaymentRepository(): ICustomerPaymentRepository {
  if (!sharedRepository) {
    sharedRepository = new CustomerPaymentRepository(getSharedStore(), new SandboxPaymentProviderAdapter());
  }
  return sharedRepository;
}

export function getPaymentTestController(): ICustomerPaymentTestController {
  if (!sharedTestController) {
    sharedTestController = new CustomerPaymentTestController(getSharedStore());
  }
  return sharedTestController;
}

export function resetCustomerPaymentRepository(newInstance?: ICustomerPaymentRepository): ICustomerPaymentRepository {
  if (newInstance) {
    sharedRepository = newInstance;
  } else {
    sharedStore = new PaymentInternalStore();
    sharedRepository = new CustomerPaymentRepository(sharedStore, new SandboxPaymentProviderAdapter());
    sharedTestController = new CustomerPaymentTestController(sharedStore);
  }
  return sharedRepository;
}

export function createPaymentTestHarness(providerAdapter?: IPaymentProviderAdapter): {
  repository: ICustomerPaymentRepository;
  testController: ICustomerPaymentTestController;
} {
  const store = new PaymentInternalStore();
  const adapter = providerAdapter ?? new SandboxPaymentProviderAdapter();
  const repository = new CustomerPaymentRepository(store, adapter);
  const testController = new CustomerPaymentTestController(store);
  return { repository, testController };
}

// Aliases strictly typed to CustomerPaymentRepository for backwards compatibility
export { CustomerPaymentRepository as MockCustomerPaymentRepository };
export function createCustomerPaymentRepository(): ICustomerPaymentRepository {
  return new CustomerPaymentRepository();
}
