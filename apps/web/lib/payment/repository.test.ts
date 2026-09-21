import { describe, it, expect, beforeEach } from 'vitest';
import * as ProductionModule from './index';
import * as RepositoryModule from './repository';
import {
  CustomerPaymentRepository,
  getCustomerPaymentRepository,
} from './repository';
import { createPaymentTestHarness } from './testing';
import type {
  InitiateCheckoutInput,
  ReleaseEscrowInput,
  DisputeEscrowInput,
  RequestRefundInput,
  ICustomerPaymentRepository,
  ICustomerPaymentTestController,
} from './types';

describe('WEB-015 CustomerPaymentRepository (TDD)', () => {
  let repo: ICustomerPaymentRepository;
  let testController: ICustomerPaymentTestController;
  const validCustomer = 'usr-customer-88';
  const otherCustomer = 'usr-customer-99';
  const bookingId = 'book-ac-001';

  beforeEach(() => {
    const harness = createPaymentTestHarness();
    repo = harness.repository;
    testController = harness.testController;
  });

  describe('Pricing Calculation', () => {
    it('calculates pricing breakdown correctly using active fee schedule config', async () => {
      const pricing = await repo.calculatePricing(20000);
      // base: 20,000
      // platform (10%): 2,000
      // escrow (7.5%): 1,500
      // vat (7.5% of platform 2,000): 150
      // total: 23,650
      expect(pricing.baseServiceAmountNaira).toBe(20000);
      expect(pricing.platformServiceFeeNaira).toBe(2000);
      expect(pricing.escrowProtectionFeeNaira).toBe(1500);
      expect(pricing.statutoryVatNaira).toBe(150);
      expect(pricing.totalPayableNaira).toBe(23650);
    });
  });

  describe('Authorization and Customer Isolation', () => {
    it('fails closed when an unauthenticated caller attempts to retrieve payment context', async () => {
      await expect(repo.getPaymentContext('', bookingId)).rejects.toThrow(/unauthorized/i);
    });

    it('fails closed when caller customerId does not match the booking customer', async () => {
      await expect(repo.getPaymentContext(otherCustomer, bookingId)).rejects.toThrow(/unauthorized/i);
    });

    it('fails closed when caller attempts to initiate checkout for another customer booking', async () => {
      const input: InitiateCheckoutInput = {
        bookingId,
        idempotencyKey: 'idem-key-1',
      };
      await expect(repo.initiateCheckout(otherCustomer, input)).rejects.toThrow(/unauthorized/i);
    });
  });

  describe('Checkout Initiation and Idempotency', () => {
    it('initiates a checkout session with available payment methods, virtual account, and ussd details', async () => {
      const input: InitiateCheckoutInput = {
        bookingId,
        idempotencyKey: 'idem-key-1',
      };
      const session = await repo.initiateCheckout(validCustomer, input);

      expect(session.bookingId).toBe(bookingId);
      expect(session.checkoutReference).toMatch(/^bbj-chk-/);
      expect(session.totalPayableNaira).toBeGreaterThan(0);
      expect(session.availableMethods).toContain('card');
      expect(session.availableMethods).toContain('bank_transfer');
      expect(session.availableMethods).toContain('ussd');
      expect(session.virtualAccount).toBeDefined();
      expect(session.virtualAccount?.accountNumber).toBeDefined();
      expect(session.ussd).toBeDefined();
    });

    it('returns existing session idempotently when called with duplicate idempotency key', async () => {
      const input: InitiateCheckoutInput = {
        bookingId,
        idempotencyKey: 'idem-duplicate-test',
      };
      const session1 = await repo.initiateCheckout(validCustomer, input);
      const session2 = await repo.initiateCheckout(validCustomer, input);

      expect(session1.checkoutReference).toBe(session2.checkoutReference);
    });

    it('fails closed if checkout is attempted on an unfundable job status (e.g. OPEN)', async () => {
      testController.setMockBookingState(bookingId, { jobStatus: 'OPEN', escrowStatus: 'unfunded' });
      const input: InitiateCheckoutInput = {
        bookingId,
        idempotencyKey: 'idem-open-job',
      };
      await expect(repo.initiateCheckout(validCustomer, input)).rejects.toThrow(/cannot fund/i);
    });
  });

  describe('Payment Verification and State Transitions', () => {
    it('verifies payment successfully and transitions escrow to held_in_escrow', async () => {
      const checkout = await repo.initiateCheckout(validCustomer, {
        bookingId,
        idempotencyKey: 'idem-verify-1',
        preferredMethod: 'card',
      });

      const result = await repo.verifyPayment(validCustomer, checkout.checkoutReference, 'card');
      expect(result.status).toBe('verified');
      expect(result.escrowStatus).toBe('held_in_escrow');

      const context = await repo.getPaymentContext(validCustomer, bookingId);
      expect(context.paymentAuthStatus).toBe('verified');
      expect(context.escrowStatus).toBe('held_in_escrow');
    });

    it('handles declined card payment with actionable failure reason', async () => {
      testController.setNextPaymentOutcome('failed', 'Card declined: Insufficient funds');
      const checkout = await repo.initiateCheckout(validCustomer, {
        bookingId,
        idempotencyKey: 'idem-fail-test',
        preferredMethod: 'card',
      });

      const result = await repo.verifyPayment(validCustomer, checkout.checkoutReference, 'card');
      expect(result.status).toBe('failed');
      expect(result.failureReason).toContain('Insufficient funds');
      expect(result.escrowStatus).toBe('unfunded');
    });

    it('handles payment gateway timeout and resolves via reconciliation check', async () => {
      testController.setNextPaymentOutcome('timeout', 'Gateway response timeout');
      const checkout = await repo.initiateCheckout(validCustomer, {
        bookingId,
        idempotencyKey: 'idem-timeout-test',
        preferredMethod: 'card',
      });

      const result = await repo.verifyPayment(validCustomer, checkout.checkoutReference, 'card');
      expect(result.status).toBe('timeout');

      // Reconcile status
      testController.setNextPaymentOutcome('verified');
      const reconciliation = await repo.checkVerificationStatus(validCustomer, checkout.checkoutReference, 'card');
      expect(reconciliation.status).toBe('verified');
      expect(reconciliation.escrowStatus).toBe('held_in_escrow');
    });

    it('fails closed when payment method cannot be authoritatively established', async () => {
      const checkout = await repo.initiateCheckout(validCustomer, {
        bookingId,
        idempotencyKey: 'idem-no-method-test',
      });

      await expect(
        repo.verifyPayment(validCustomer, checkout.checkoutReference)
      ).rejects.toThrow(/could not be authoritatively established/i);

      await expect(
        repo.checkVerificationStatus(validCustomer, checkout.checkoutReference)
      ).rejects.toThrow(/could not be authoritatively established/i);
    });
  });

  describe('Escrow Release and Settlement', () => {
    beforeEach(async () => {
      // Setup funded booking in PENDING_COMPLETION
      testController.setMockBookingState(bookingId, {
        jobStatus: 'PENDING_COMPLETION',
        escrowStatus: 'held_in_escrow',
        paymentAuthStatus: 'verified',
      });
    });

    it('releases escrow successfully when customer approves completed work', async () => {
      const input: ReleaseEscrowInput = {
        bookingId,
        customerFeedback: 'Excellent generator repair service',
        customerRating: 5,
      };

      const result = await repo.releaseEscrow(validCustomer, input);
      expect(result.success).toBe(true);
      expect(result.escrowStatus).toBe('released');

      const context = await repo.getPaymentContext(validCustomer, bookingId);
      expect(context.escrowStatus).toBe('released');
      expect(context.jobStatus).toBe('COMPLETED');
    });

    it('fails closed when release is attempted on unfunded or already released escrow', async () => {
      testController.setMockBookingState(bookingId, { escrowStatus: 'unfunded' });
      await expect(
        repo.releaseEscrow(validCustomer, { bookingId })
      ).rejects.toThrow(/cannot release escrow/i);
    });

    it('handles settlement failure and allows recovery via retryRelease', async () => {
      testController.setNextEscrowOutcome('release_failed', 'Payout network timeout');
      const result = await repo.releaseEscrow(validCustomer, { bookingId });
      expect(result.success).toBe(false);
      expect(result.escrowStatus).toBe('release_failed');

      // Retry release
      testController.setNextEscrowOutcome('released');
      const retryResult = await repo.retryRelease(validCustomer, bookingId);
      expect(retryResult.success).toBe(true);
      expect(retryResult.escrowStatus).toBe('released');
    });
  });

  describe('Disputes and Resolutions', () => {
    beforeEach(() => {
      testController.setMockBookingState(bookingId, {
        jobStatus: 'IN_PROGRESS',
        escrowStatus: 'held_in_escrow',
        paymentAuthStatus: 'verified',
      });
    });

    it('freezes escrow and transitions job to DISPUTED when dispute is filed', async () => {
      const input: DisputeEscrowInput = {
        bookingId,
        reason: 'Technician left before testing completed work',
        description: 'The AC is still leaking water and making noise.',
      };

      const result = await repo.disputeEscrow(validCustomer, input);
      expect(result.success).toBe(true);
      expect(result.escrowStatus).toBe('disputed');
      expect(result.disputeId).toMatch(/^disp-/);

      const context = await repo.getPaymentContext(validCustomer, bookingId);
      expect(context.jobStatus).toBe('DISPUTED');
      expect(context.escrowStatus).toBe('disputed');
    });

    it('prevents fund release while a dispute is active', async () => {
      testController.setMockBookingState(bookingId, {
        jobStatus: 'DISPUTED',
        escrowStatus: 'disputed',
      });

      await expect(repo.releaseEscrow(validCustomer, { bookingId })).rejects.toThrow(
        /cannot release escrow/i
      );
    });
  });

  describe('Refund Requests and Boundaries', () => {
    it('initiates refund for a funded cancelled booking and provides indicative timeline', async () => {
      testController.setMockBookingState(bookingId, {
        jobStatus: 'CANCELLED',
        escrowStatus: 'held_in_escrow',
        paymentAuthStatus: 'verified',
      });

      const input: RequestRefundInput = {
        bookingId,
        reason: 'Technician unable to attend',
      };

      const result = await repo.requestRefund(validCustomer, input);
      expect(result.success).toBe(true);
      expect(result.escrowStatus).toBe('refund_pending');
      expect(result.estimatedDays).toContain('business days');

      const refundStatus = await repo.getRefundStatus(validCustomer, bookingId);
      expect(refundStatus.status).toBe('pending');
      expect(refundStatus.amountNaira).toBeGreaterThan(0);
    });

    it('fails closed when refund is requested on an unfunded booking', async () => {
      testController.setMockBookingState(bookingId, {
        jobStatus: 'CANCELLED',
        escrowStatus: 'unfunded',
      });

      await expect(
        repo.requestRefund(validCustomer, { bookingId, reason: 'Cancellation' })
      ).rejects.toThrow(/not eligible for refund/i);
    });
  });

  describe('Receipt Generation and Document Authority', () => {
    it('fails closed when receipt is requested for an unfunded booking', async () => {
      testController.setMockBookingState(bookingId, { escrowStatus: 'unfunded' });
      await expect(repo.getReceipt(validCustomer, bookingId)).rejects.toThrow(/no verified payment/i);
    });

    it('generates receipt with funded settlementStatus when escrow is held', async () => {
      testController.setMockBookingState(bookingId, {
        escrowStatus: 'held_in_escrow',
        paymentAuthStatus: 'verified',
      });

      const receipt = await repo.getReceipt(validCustomer, bookingId);
      expect(receipt.receiptNumber).toMatch(/^REC-/);
      expect(receipt.settlementStatus).toBe('funded');
      expect(receipt.isSimulatedTestDocument).toBe(true);
      expect(receipt.pricing.totalPayableNaira).toBeGreaterThan(0);
    });

    it('distinguishes release_pending from settled in receipt settlement status', async () => {
      testController.setMockBookingState(bookingId, {
        escrowStatus: 'release_pending',
        paymentAuthStatus: 'verified',
      });

      const receipt = await repo.getReceipt(validCustomer, bookingId);
      expect(receipt.settlementStatus).toBe('release_pending');

      testController.setMockBookingState(bookingId, {
        escrowStatus: 'released',
        jobStatus: 'COMPLETED',
      });

      const settledReceipt = await repo.getReceipt(validCustomer, bookingId);
      expect(settledReceipt.settlementStatus).toBe('settled');
      expect(settledReceipt.settlementDate).toBeDefined();
    });
  });

  describe('Offline Read-Only Protection', () => {
    it('disables all financial mutation operations when offline', async () => {
      testController.setOffline(true);

      await expect(
        repo.initiateCheckout(validCustomer, { bookingId, idempotencyKey: 'key-off' })
      ).rejects.toThrow(/offline/i);

      await expect(
        repo.verifyPayment(validCustomer, 'bbj-pay-123', 'card')
      ).rejects.toThrow(/offline/i);

      await expect(
        repo.releaseEscrow(validCustomer, { bookingId })
      ).rejects.toThrow(/offline/i);

      await expect(
        repo.disputeEscrow(validCustomer, { bookingId, reason: 'x', description: 'y' })
      ).rejects.toThrow(/offline/i);

      await expect(
        repo.requestRefund(validCustomer, { bookingId, reason: 'x' })
      ).rejects.toThrow(/offline/i);
    });

    it('allows read-only queries when offline', async () => {
      testController.setMockBookingState(bookingId, {
        escrowStatus: 'held_in_escrow',
        paymentAuthStatus: 'verified',
      });
      testController.setOffline(true);

      const context = await repo.getPaymentContext(validCustomer, bookingId);
      expect(context.bookingId).toBe(bookingId);

      const receipt = await repo.getReceipt(validCustomer, bookingId);
      expect(receipt.receiptNumber).toBeDefined();
    });
  });

  describe('Deterministic Scenario Fixtures (21 Scenarios)', () => {
    it('loads confirmed_unfunded scenario deterministically', async () => {
      testController.loadScenario('confirmed_unfunded', bookingId, validCustomer);
      const context = await repo.getPaymentContext(validCustomer, bookingId);
      expect(context.jobStatus).toBe('CONFIRMED');
      expect(context.escrowStatus).toBe('unfunded');
      expect(context.paymentAuthStatus).toBe('idle');
    });

    it('loads card_failed_insufficient_funds scenario deterministically', async () => {
      testController.loadScenario('card_failed_insufficient_funds', bookingId, validCustomer);
      const context = await repo.getPaymentContext(validCustomer, bookingId);
      expect(context.paymentAuthStatus).toBe('failed');
      expect(context.escrowStatus).toBe('unfunded');
    });

    it('loads disputed scenario deterministically', async () => {
      testController.loadScenario('disputed', bookingId, validCustomer);
      const context = await repo.getPaymentContext(validCustomer, bookingId);
      expect(context.jobStatus).toBe('DISPUTED');
      expect(context.escrowStatus).toBe('disputed');
      expect(context.activeDisputeId).toBeDefined();
    });
  });

  describe('Architectural Boundary & Regression Proving', () => {
    it('proves virtual-account expiry is provider-supplied and optional', async () => {
      // Without provider-supplied expiry, expiresAt is undefined (no fixed 30-minute promise)
      const sessionWithoutExpiry = await repo.initiateCheckout(validCustomer, {
        bookingId,
        idempotencyKey: 'idem-no-expiry',
      });
      expect(sessionWithoutExpiry.virtualAccount?.expiresAt).toBeUndefined();

      // With provider-supplied expiry, expiresAt reflects the provider timestamp
      const customExpiry = '2026-09-22T15:30:00.000Z';
      const sessionWithExpiry = await repo.initiateCheckout(validCustomer, {
        bookingId,
        idempotencyKey: 'idem-with-expiry',
        providerVirtualAccountExpiry: customExpiry,
      });
      expect(sessionWithExpiry.virtualAccount?.expiresAt).toBe(customExpiry);
    });

    it('proves bank transfer retains accurate payment method attribution on attempts and receipt', async () => {
      const checkout = await repo.initiateCheckout(validCustomer, {
        bookingId,
        idempotencyKey: 'idem-transfer-attrib',
      });

      await repo.verifyPayment(validCustomer, checkout.checkoutReference, 'bank_transfer');

      const attempts = await repo.getPaymentAttempts(validCustomer, bookingId);
      const lastAttempt = attempts[attempts.length - 1];
      expect(lastAttempt).toBeDefined();
      expect(lastAttempt!.method).toBe('bank_transfer');

      const receipt = await repo.getReceipt(validCustomer, bookingId);
      expect(receipt.paymentMethodUsed).toBe('Bank Transfer (Dedicated Virtual Account)');
    });

    it('proves ussd retains accurate payment method attribution on attempts and receipt', async () => {
      const checkout = await repo.initiateCheckout(validCustomer, {
        bookingId,
        idempotencyKey: 'idem-ussd-attrib',
      });

      await repo.verifyPayment(validCustomer, checkout.checkoutReference, 'ussd');

      const attempts = await repo.getPaymentAttempts(validCustomer, bookingId);
      const lastAttempt = attempts[attempts.length - 1];
      expect(lastAttempt).toBeDefined();
      expect(lastAttempt!.method).toBe('ussd');

      const receipt = await repo.getReceipt(validCustomer, bookingId);
      expect(receipt.paymentMethodUsed).toBe('USSD Payment');
    });

    it('proves application components cannot manufacture authoritative payment or escrow state', async () => {
      const unseededBookingId = 'unseeded-booking-999';

      // Calling getPaymentContext for an unseeded booking throws NotFound
      await expect(
        repo.getPaymentContext(validCustomer, unseededBookingId)
      ).rejects.toThrow(/not found/i);

      // Calling initiateCheckout for an unseeded booking throws NotFound
      await expect(
        repo.initiateCheckout(validCustomer, {
          bookingId: unseededBookingId,
          idempotencyKey: 'idem-unseeded',
        })
      ).rejects.toThrow(/not found/i);
    });
  });

  describe('Production Repository Boundary & Anti-Tampering Defense', () => {
    it('proves a production repository consumer cannot access or invoke fixture state controls', () => {
      const productionRepo = getCustomerPaymentRepository();
      const directRepo = new CustomerPaymentRepository();

      const forbiddenMethods = [
        'setOffline',
        'setNextPaymentOutcome',
        'setNextEscrowOutcome',
        'setMockBookingState',
        'loadScenario',
        'seedBooking',
        'getTestController',
        'reset',
      ];

      for (const method of forbiddenMethods) {
        expect((productionRepo as unknown as Record<string, unknown>)[method]).toBeUndefined();
        expect((directRepo as unknown as Record<string, unknown>)[method]).toBeUndefined();
      }

      // Proves that production repository only exposes authoritative ICustomerPaymentRepository operations
      expect(typeof productionRepo.getPaymentContext).toBe('function');
      expect(typeof productionRepo.initiateCheckout).toBe('function');
      expect(typeof productionRepo.verifyPayment).toBe('function');
      expect(typeof productionRepo.releaseEscrow).toBe('function');
      expect(typeof productionRepo.disputeEscrow).toBe('function');
      expect(typeof productionRepo.requestRefund).toBe('function');
      expect(typeof productionRepo.getReceipt).toBe('function');
      expect(typeof productionRepo.getProviderCapabilities).toBe('function');
    });

    it('proves production import surface does not export test store or fixture machinery', () => {
      const forbiddenExports = [
        'PaymentInternalStore',
        'CustomerPaymentTestController',
        'getPaymentTestController',
        'createPaymentTestHarness',
        'resetCustomerPaymentRepository',
      ];

      for (const exp of forbiddenExports) {
        expect((ProductionModule as Record<string, unknown>)[exp]).toBeUndefined();
        expect((RepositoryModule as Record<string, unknown>)[exp]).toBeUndefined();
      }
    });
  });
});
