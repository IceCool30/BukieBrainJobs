import type {
  PaymentAuthorizationStatus,
  EscrowStatus,
  FeeScheduleConfig,
  CheckoutSession,
  PaymentAttempt,
  PaymentReceipt,
  RefundStatusDetails,
  InternalBookingRecord,
} from '../types';

/**
 * In-memory state store for payment and escrow domain fixtures.
 * Strictly test-isolated and inaccessible from production application surfaces.
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

let sharedStore: PaymentInternalStore | null = null;

export function getSharedPaymentStore(): PaymentInternalStore {
  if (!sharedStore) {
    sharedStore = new PaymentInternalStore();
  }
  return sharedStore;
}

export function resetSharedPaymentStore(): PaymentInternalStore {
  if (!sharedStore) {
    sharedStore = new PaymentInternalStore();
  } else {
    sharedStore.reset();
  }
  return sharedStore;
}
