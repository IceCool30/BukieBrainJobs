import type {
  PaymentAuthorizationStatus,
  EscrowStatus,
  FeeScheduleConfig,
  CheckoutSession,
  PaymentAttempt,
  PaymentReceipt,
  RefundStatusDetails,
  InternalBookingRecord,
  PaymentStoreData,
} from '../types';
import { DEFAULT_PAYMENT_BOOKINGS } from '../types';

/**
 * In-memory state store for payment and escrow domain fixtures.
 * Strictly test-isolated and inaccessible from production application surfaces.
 */
export class PaymentInternalStore implements PaymentStoreData {
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
    for (const b of DEFAULT_PAYMENT_BOOKINGS) {
      this.bookings.set(b.bookingId, { ...b });
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
