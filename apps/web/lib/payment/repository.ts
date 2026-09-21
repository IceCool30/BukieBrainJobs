import type { JobStatus } from '@bukiebrainjobs/api-types';
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
  VirtualAccountDetails,
  UssdDetails,
  PaymentMethod,
  InternalBookingRecord,
  ICustomerPaymentTestController,
  DeterministicScenarioName,
} from './types';

export class MockCustomerPaymentRepository implements ICustomerPaymentRepository {
  private isOffline = false;
  private nextPaymentOutcome: { status: PaymentAuthorizationStatus; reason?: string | undefined } | null = null;
  private nextEscrowOutcome: { status: EscrowStatus; reason?: string | undefined } | null = null;

  private feeConfig: FeeScheduleConfig = {
    platformFeePercentage: 10.0,
    escrowProtectionFeePercentage: 7.5,
    statutoryVatPercentage: 7.5,
  };

  private bookings = new Map<string, InternalBookingRecord>();
  private checkoutSessions = new Map<string, CheckoutSession>();
  private idempotencyMap = new Map<string, string>(); // idempotencyKey -> checkoutReference
  private paymentAttempts = new Map<string, PaymentAttempt[]>(); // bookingId -> attempts
  private receipts = new Map<string, PaymentReceipt>(); // bookingId -> receipt
  private refundDetails = new Map<string, RefundStatusDetails>(); // refundReference -> details

  constructor() {
    this.seedDefaults();
  }

  private seedDefaults() {
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
        serviceLocation: 'Ikeja GRA, Lagos',
        baseAmountNaira: 25000,
        paymentAuthStatus: 'idle',
        escrowStatus: 'unfunded',
      },
      {
        bookingId: 'BKG-44109',
        customerId: 'usr-customer-default',
        jobStatus: 'COMPLETED',
        bookingStatus: 'completed_and_paid',
        serviceTitle: 'Bathroom Pipe & Trap Replacement',
        workerName: 'Emeka Obi',
        serviceLocation: 'Surulere, Lagos',
        baseAmountNaira: 22000,
        paymentAuthStatus: 'verified',
        escrowStatus: 'released',
        verifiedPaymentMethod: 'card',
      },
      {
        bookingId: 'act-confirmed-001',
        customerId: 'usr-customer-88',
        jobStatus: 'CONFIRMED',
        bookingStatus: 'booking_confirmed',
        serviceTitle: 'Plumbing Valve Replacement',
        workerName: 'Tunde Bakare',
        serviceLocation: 'Ikeja, Lagos',
        baseAmountNaira: 20000,
        paymentAuthStatus: 'idle',
        escrowStatus: 'unfunded',
      },
    ];

    for (const b of seededBookings) {
      this.bookings.set(b.bookingId, b);
    }
  }

  setOffline(offline: boolean) {
    this.isOffline = offline;
  }

  setNextPaymentOutcome(status: PaymentAuthorizationStatus, reason?: string) {
    this.nextPaymentOutcome = { status, reason };
  }

  setNextEscrowOutcome(status: EscrowStatus, reason?: string) {
    this.nextEscrowOutcome = { status, reason };
  }

  seedBooking(booking: InternalBookingRecord) {
    this.bookings.set(booking.bookingId, { ...booking });
  }

  setMockBookingState(bookingId: string, updates: Partial<InternalBookingRecord>) {
    const existing = this.bookings.get(bookingId);
    if (existing) {
      this.bookings.set(bookingId, { ...existing, ...updates });
    } else {
      this.bookings.set(bookingId, {
        bookingId,
        customerId: updates.customerId || 'usr-customer-88',
        jobStatus: updates.jobStatus || 'CONFIRMED',
        bookingStatus: updates.bookingStatus || 'booking_confirmed',
        serviceTitle: updates.serviceTitle || 'Air Conditioner Deep Cleaning',
        workerName: updates.workerName || 'Emeka Okafor',
        serviceLocation: updates.serviceLocation || 'Lekki Phase 1, Lagos',
        baseAmountNaira: updates.baseAmountNaira || 18500,
        paymentAuthStatus: updates.paymentAuthStatus || 'idle',
        escrowStatus: updates.escrowStatus || 'unfunded',
        ...updates,
      });
    }
  }

  private validateOwnership(
    authenticatedCustomerId: string,
    bookingId: string
  ): InternalBookingRecord {
    if (!authenticatedCustomerId || authenticatedCustomerId.trim().length === 0) {
      throw new Error('[Security] Unauthorized: authenticated customerId is required.');
    }
    const booking = this.bookings.get(bookingId);
    if (!booking) {
      throw new Error(`[NotFound] Booking ${bookingId} not found.`);
    }
    if (booking.customerId !== authenticatedCustomerId) {
      throw new Error(`[Security] Unauthorized: caller ${authenticatedCustomerId} does not own booking ${bookingId}.`);
    }
    return booking;
  }

  private checkOfflineMutation() {
    if (this.isOffline) {
      throw new Error('[Offline] You are currently offline. Financial operations require an active network connection.');
    }
  }

  async getFeeConfig(): Promise<FeeScheduleConfig> {
    return { ...this.feeConfig };
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

  async getPaymentContext(
    authenticatedCustomerId: string,
    bookingId: string
  ): Promise<PaymentContext> {
    const booking = this.validateOwnership(authenticatedCustomerId, bookingId);
    const pricing = await this.calculatePricing(booking.baseAmountNaira);

    let activeCheckoutSession: CheckoutSession | undefined;
    if (booking.currentPaymentReference) {
      activeCheckoutSession = this.checkoutSessions.get(booking.currentPaymentReference);
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
    const existingRef = this.idempotencyMap.get(input.idempotencyKey);
    if (existingRef) {
      const existingSession = this.checkoutSessions.get(existingRef);
      if (existingSession) {
        return { ...existingSession };
      }
    }

    const pricing = await this.calculatePricing(booking.baseAmountNaira);
    const checkoutReference = `bbj-chk-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    const virtualAccount: VirtualAccountDetails = {
      bankName: 'Wema Bank (BukiePay Escrow)',
      accountNumber: `012${Math.floor(1000000 + Math.random() * 9000000)}`,
      accountName: `BukieBrainJobs Escrow (${input.bookingId})`,
      expiresAt: input.providerVirtualAccountExpiry,
      reconciliationNotes: 'Transfer exact amount. Verification reconciles automatically upon settlement.',
    };

    const ussd: UssdDetails = {
      bankName: 'GTBank / Multiple Banks',
      ussdString: `*737*2*${pricing.totalPayableNaira}*012345#`,
      directDialUri: `tel:*737*2*${pricing.totalPayableNaira}*012345%23`,
    };

    const session: CheckoutSession = {
      checkoutReference,
      bookingId: input.bookingId,
      totalPayableNaira: pricing.totalPayableNaira,
      availableMethods: ['card', 'bank_transfer', 'ussd'],
      virtualAccount,
      ussd,
      idempotencyKey: input.idempotencyKey,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    };

    this.checkoutSessions.set(checkoutReference, session);
    this.idempotencyMap.set(input.idempotencyKey, checkoutReference);

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
    const session = this.checkoutSessions.get(checkoutReference);
    if (!session) {
      throw new Error(`[NotFound] Checkout session ${checkoutReference} not found.`);
    }
    const booking = this.validateOwnership(authenticatedCustomerId, session.bookingId);

    const paymentMethod: PaymentMethod = method || 'card';

    // Record attempt with accurate method
    const attempt: PaymentAttempt = {
      id: `att-${Date.now()}`,
      checkoutReference,
      bookingId: session.bookingId,
      method: paymentMethod,
      status: 'processing',
      amountNaira: session.totalPayableNaira,
      createdAt: new Date().toISOString(),
    };
    const attempts = this.paymentAttempts.get(session.bookingId) || [];
    attempts.push(attempt);
    this.paymentAttempts.set(session.bookingId, attempts);

    // Determine outcome
    const outcome = this.nextPaymentOutcome || { status: 'verified' as const };
    this.nextPaymentOutcome = null;

    if (outcome.status === 'verified') {
      booking.paymentAuthStatus = 'verified';
      booking.escrowStatus = 'held_in_escrow';
      booking.verifiedPaymentMethod = paymentMethod;
      attempt.status = 'verified';

      return {
        status: 'verified',
        paymentReference: checkoutReference,
        escrowStatus: 'held_in_escrow',
        verifiedAt: new Date().toISOString(),
      };
    }

    if (outcome.status === 'timeout') {
      booking.paymentAuthStatus = 'timeout';
      attempt.status = 'timeout';
      return {
        status: 'timeout',
        paymentReference: checkoutReference,
        escrowStatus: booking.escrowStatus,
        failureReason: outcome.reason || 'Payment verification timeout',
      };
    }

    // Failed
    booking.paymentAuthStatus = 'failed';
    attempt.status = 'failed';
    attempt.failureReason = outcome.reason || 'Payment declined by issuing bank';

    return {
      status: 'failed',
      paymentReference: checkoutReference,
      escrowStatus: booking.escrowStatus,
      failureReason: attempt.failureReason,
    };
  }

  async checkVerificationStatus(
    authenticatedCustomerId: string,
    checkoutReference: string,
    method?: PaymentMethod
  ): Promise<PaymentVerificationResult> {
    const session = this.checkoutSessions.get(checkoutReference);
    if (!session) {
      throw new Error(`[NotFound] Checkout session ${checkoutReference} not found.`);
    }
    const booking = this.validateOwnership(authenticatedCustomerId, session.bookingId);

    const outcome = this.nextPaymentOutcome || { status: 'verified' as const };
    this.nextPaymentOutcome = null;

    if (outcome.status === 'verified') {
      booking.paymentAuthStatus = 'verified';
      booking.escrowStatus = 'held_in_escrow';
      booking.verifiedPaymentMethod = method || 'bank_transfer';
      return {
        status: 'verified',
        paymentReference: checkoutReference,
        escrowStatus: 'held_in_escrow',
        verifiedAt: new Date().toISOString(),
      };
    }

    return {
      status: outcome.status,
      paymentReference: checkoutReference,
      escrowStatus: booking.escrowStatus,
      failureReason: outcome.reason,
    };
  }

  async getPaymentAttempts(authenticatedCustomerId: string, bookingId: string): Promise<PaymentAttempt[]> {
    this.validateOwnership(authenticatedCustomerId, bookingId);
    const list = this.paymentAttempts.get(bookingId) || [];
    return list.map((a) => ({ ...a }));
  }

  async releaseEscrow(
    authenticatedCustomerId: string,
    input: ReleaseEscrowInput
  ): Promise<EscrowReleaseResult> {
    this.checkOfflineMutation();
    const booking = this.validateOwnership(authenticatedCustomerId, input.bookingId);

    if (booking.escrowStatus === 'disputed') {
      throw new Error('[Security] Cannot release disputed escrow. Mediation must resolve the dispute first.');
    }
    if (booking.escrowStatus !== 'held_in_escrow' && booking.escrowStatus !== 'release_failed') {
      throw new Error(`[Invariant] Invalid escrow transition. Escrow must be in held_in_escrow to release. Current status: ${booking.escrowStatus}.`);
    }

    const outcome = this.nextEscrowOutcome || { status: 'released' as const };
    this.nextEscrowOutcome = null;

    if (outcome.status === 'release_failed') {
      booking.escrowStatus = 'release_failed';
      return {
        success: false,
        escrowStatus: 'release_failed',
        failureReason: outcome.reason || 'Settlement transfer failed on banking network.',
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

  async retryRelease(authenticatedCustomerId: string, bookingId: string): Promise<EscrowReleaseResult> {
    return this.releaseEscrow(authenticatedCustomerId, { bookingId });
  }

  async disputeEscrow(
    authenticatedCustomerId: string,
    input: DisputeEscrowInput
  ): Promise<DisputeResult> {
    this.checkOfflineMutation();
    const booking = this.validateOwnership(authenticatedCustomerId, input.bookingId);

    if (booking.escrowStatus === 'released') {
      throw new Error('[Invariant] Cannot dispute an escrow that has already been released to the service provider.');
    }

    const disputeId = `disp-${Date.now()}`;
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

    if (booking.escrowStatus === 'unfunded') {
      throw new Error('[Invariant] Cannot refund unfunded booking.');
    }
    if (booking.escrowStatus === 'released') {
      throw new Error('[Invariant] Cannot refund escrow that has already been released.');
    }

    const refundReference = `ref-${Date.now()}`;
    booking.escrowStatus = 'refund_pending';
    booking.activeRefundReference = refundReference;

    const pricing = await this.calculatePricing(booking.baseAmountNaira);
    const refundDetails: RefundStatusDetails = {
      refundReference,
      bookingId: input.bookingId,
      amountNaira: pricing.totalPayableNaira,
      status: 'pending',
      requestedAt: new Date().toISOString(),
      estimatedResolution: '3 to 5 business days for card refunds, 24 to 48 hours for bank transfers',
    };
    this.refundDetails.set(refundReference, refundDetails);

    return {
      success: true,
      refundReference,
      escrowStatus: 'refund_pending',
      requestedAt: refundDetails.requestedAt,
      estimatedDays: '3 to 5 business days',
    };
  }

  async getRefundStatus(
    authenticatedCustomerId: string,
    bookingId: string
  ): Promise<RefundStatusDetails> {
    const booking = this.validateOwnership(authenticatedCustomerId, bookingId);
    if (!booking.activeRefundReference) {
      throw new Error(`[NotFound] No active refund found for booking ${bookingId}.`);
    }
    const details = this.refundDetails.get(booking.activeRefundReference);
    if (!details) {
      throw new Error(`[NotFound] Refund details for ${booking.activeRefundReference} not found.`);
    }
    return { ...details };
  }

  async getReceipt(authenticatedCustomerId: string, bookingId: string): Promise<PaymentReceipt> {
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

    let paymentMethodLabel = 'Debit Card (Mastercard •••• 4242)';
    if (booking.verifiedPaymentMethod === 'bank_transfer') {
      paymentMethodLabel = 'Bank Transfer (Dedicated Virtual Account)';
    } else if (booking.verifiedPaymentMethod === 'ussd') {
      paymentMethodLabel = 'USSD Payment';
    }

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

  loadScenario(scenario: DeterministicScenarioName, bookingId: string, customerId: string) {
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

  getTestController(): ICustomerPaymentTestController {
    return {
      setOffline: (offline: boolean) => this.setOffline(offline),
      setNextPaymentOutcome: (status, reason) => this.setNextPaymentOutcome(status, reason),
      setNextEscrowOutcome: (status, reason) => this.setNextEscrowOutcome(status, reason),
      setMockBookingState: (bookingId, updates) => this.setMockBookingState(bookingId, updates),
      loadScenario: (scenario, bookingId, customerId) => this.loadScenario(scenario, bookingId, customerId),
      seedBooking: (booking) => this.seedBooking(booking),
      reset: () => {
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
      },
    };
  }
}

let repositoryInstance: MockCustomerPaymentRepository | null = null;

export function getCustomerPaymentRepository(): ICustomerPaymentRepository {
  if (!repositoryInstance) {
    repositoryInstance = new MockCustomerPaymentRepository();
  }
  return repositoryInstance;
}

export function getPaymentTestController(): ICustomerPaymentTestController {
  if (!repositoryInstance) {
    repositoryInstance = new MockCustomerPaymentRepository();
  }
  return repositoryInstance.getTestController();
}

export function resetCustomerPaymentRepository(newInstance?: MockCustomerPaymentRepository): ICustomerPaymentRepository {
  repositoryInstance = newInstance ?? new MockCustomerPaymentRepository();
  return repositoryInstance;
}

export function createCustomerPaymentRepository(): MockCustomerPaymentRepository {
  return new MockCustomerPaymentRepository();
}

