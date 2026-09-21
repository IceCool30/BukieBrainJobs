import type {
  ICustomerPaymentRepository,
  ICustomerPaymentTestController,
  PaymentAuthorizationStatus,
  EscrowStatus,
  InternalBookingRecord,
  DeterministicScenarioName,
  IPaymentProviderAdapter,
} from '../types';
import { PaymentInternalStore, getSharedPaymentStore, resetSharedPaymentStore } from './store';
import {
  createIsolatedCustomerPaymentRepository,
  resetSharedRepositoryInstance,
} from '../repository';
import { SandboxPaymentProviderAdapter } from '../provider-adapter';

/**
 * Dedicated test controller for deterministic state fixtures.
 * Genuinely segregated in the testing module, inaccessible to production application code.
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
    if (existing) {
      this.store.bookings.set(bookingId, {
        ...existing,
        ...updates,
      });
    } else {
      this.store.bookings.set(bookingId, {
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

let sharedTestController: ICustomerPaymentTestController | null = null;

export function getPaymentTestController(): ICustomerPaymentTestController {
  if (!sharedTestController) {
    sharedTestController = new CustomerPaymentTestController(getSharedPaymentStore());
  }
  return sharedTestController;
}

export function resetCustomerPaymentRepository(
  newInstance?: ICustomerPaymentRepository
): ICustomerPaymentRepository {
  resetSharedPaymentStore();
  sharedTestController = new CustomerPaymentTestController(getSharedPaymentStore());
  return resetSharedRepositoryInstance(newInstance);
}

export function createPaymentTestHarness(providerAdapter?: IPaymentProviderAdapter): {
  repository: ICustomerPaymentRepository;
  testController: ICustomerPaymentTestController;
} {
  const store = new PaymentInternalStore();
  const adapter = providerAdapter ?? new SandboxPaymentProviderAdapter();
  const repository = createIsolatedCustomerPaymentRepository(store, adapter);
  const testController = new CustomerPaymentTestController(store);
  return { repository, testController };
}
