import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import {
  EscrowProtectionTracker,
  CheckoutModal,
  CompletionInspectionCard,
  ReceiptModal,
  RefundRequestModal,
  DisputeModal,
} from '../../components/payment';
import { LifecycleStateSurface } from '../../components/jobs/LifecycleStateSurface';
import * as authStorage from '../../lib/auth/storage';
import { resetCustomerPaymentRepository, getCustomerPaymentRepository } from '../../lib/payment/repository';
import type { CustomerActivityItem } from '@bukiebrainjobs/types';
import type { PaymentReceipt, PricingBreakdown, CheckoutSession } from '../../lib/payment/types';

// Mock Next.js navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useParams: () => ({ bookingId: 'book-escrow-001' }),
}));

describe('WEB-015 Customer Payments & Escrow UX (Component Integration)', () => {
  const mockUser = {
    id: 'usr-customer-test',
    name: 'Babajide Adeleke',
    email: 'babajide@example.com',
    phone: '+2348031234567',
    provider: 'google' as const,
    role: 'customer' as const,
    isBrainWorkerApproved: false,
  };

  const samplePricing: PricingBreakdown = {
    baseServiceAmountNaira: 20000,
    platformServiceFeeNaira: 2000,
    escrowProtectionFeeNaira: 1500,
    statutoryVatNaira: 150,
    totalPayableNaira: 23650,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    resetCustomerPaymentRepository();
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockUser);
  });

  describe('1. EscrowProtectionTracker Component', () => {
    it('renders 4-milestone timeline structure', () => {
      render(<EscrowProtectionTracker escrowStatus="unfunded" />);

      expect(screen.getByRole('region', { name: /Escrow Protection Tracker/i })).toBeInTheDocument();
      expect(screen.getByText(/Safe Payment Milestone Timeline/i)).toBeInTheDocument();
      expect(screen.getByText('Booking')).toBeInTheDocument();
      expect(screen.getByText('Confirmed')).toBeInTheDocument();
      expect(screen.getByText('Escrow')).toBeInTheDocument();
      expect(screen.getByText('Inspection')).toBeInTheDocument();
      expect(screen.getByText('Settlement')).toBeInTheDocument();
    });

    it('shows awaiting funding badge when status is unfunded', () => {
      render(<EscrowProtectionTracker escrowStatus="unfunded" />);
      expect(screen.getByText('Awaiting Escrow Funding')).toBeInTheDocument();
      expect(screen.getByText(/Fund escrow to protect your payment and authorize work/i)).toBeInTheDocument();
    });

    it('shows funds protected badge when status is held_in_escrow', () => {
      render(<EscrowProtectionTracker escrowStatus="held_in_escrow" />);
      expect(screen.getByText('Funds Protected in Escrow')).toBeInTheDocument();
      expect(screen.getByText(/Your payment is safely held under BukieGuarantee/i)).toBeInTheDocument();
    });

    it('shows release pending badge when status is release_pending', () => {
      render(<EscrowProtectionTracker escrowStatus="release_pending" />);
      expect(screen.getByText('Release Pending Verification')).toBeInTheDocument();
      expect(screen.getByText(/Payout transfer to BrainWorker is undergoing banking settlement/i)).toBeInTheDocument();
    });

    it('shows release transfer failed banner with retry button when status is release_failed', () => {
      const handleRetry = vi.fn();
      render(
        <EscrowProtectionTracker
          escrowStatus="release_failed"
          onRetryRelease={handleRetry}
        />
      );

      expect(screen.getByText('Release Transfer Failed')).toBeInTheDocument();
      const retryBtn = screen.getByRole('button', { name: /Retry Release Settlement/i });
      expect(retryBtn).toBeInTheDocument();

      fireEvent.click(retryBtn);
      expect(handleRetry).toHaveBeenCalledTimes(1);
    });

    it('shows payment settled and released badge when status is released and settled', () => {
      render(
        <EscrowProtectionTracker
          escrowStatus="released"
          settlementStatus="settled"
        />
      );
      expect(screen.getByText('Payment Settled & Released')).toBeInTheDocument();
      expect(screen.getByText(/Escrow settlement is complete/i)).toBeInTheDocument();
    });

    it('shows escrow frozen badge when status is disputed', () => {
      render(<EscrowProtectionTracker escrowStatus="disputed" />);
      expect(screen.getByText('Escrow Frozen (Dispute Open)')).toBeInTheDocument();
      expect(screen.getByText(/Escrow funds are locked and cannot be released/i)).toBeInTheDocument();
    });
  });

  describe('2. CheckoutModal Component', () => {
    it('renders transparent fee schedule breakdown and payment methods', () => {
      render(
        <CheckoutModal
          isOpen={true}
          onClose={vi.fn()}
          bookingId="book-001"
          serviceTitle="Air Conditioner Servicing"
          workerName="Emeka Okafor"
          pricing={samplePricing}
          session={null}
          onVerifyPayment={vi.fn()}
          onCheckStatus={vi.fn()}
          onSuccess={vi.fn()}
        />
      );

      expect(screen.getByRole('dialog', { name: /Fund Escrow/i })).toBeInTheDocument();
      expect(screen.getByText('₦20,000')).toBeInTheDocument();
      expect(screen.getByText('₦2,000')).toBeInTheDocument();
      expect(screen.getByText('₦1,500')).toBeInTheDocument();
      expect(screen.getByText('₦150')).toBeInTheDocument();
      expect(screen.getByText('₦23,650')).toBeInTheDocument();

      // Check payment method tabs
      expect(screen.getByRole('tab', { name: /Card/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Transfer/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /USSD/i })).toBeInTheDocument();
    });

    it('switches between payment method tabs smoothly', () => {
      render(
        <CheckoutModal
          isOpen={true}
          onClose={vi.fn()}
          bookingId="book-001"
          serviceTitle="Air Conditioner Servicing"
          workerName="Emeka Okafor"
          pricing={samplePricing}
          session={null}
          onVerifyPayment={vi.fn()}
          onCheckStatus={vi.fn()}
          onSuccess={vi.fn()}
        />
      );

      // Default is card
      expect(screen.getByText(/Sandbox Simulated Payment/i)).toBeInTheDocument();

      // Switch to Bank Transfer
      fireEvent.click(screen.getByRole('tab', { name: /Transfer/i }));
      expect(screen.getByText(/Bank Name/i)).toBeInTheDocument();
      expect(screen.getByText(/Account Number/i)).toBeInTheDocument();

      // Switch to USSD
      fireEvent.click(screen.getByRole('tab', { name: /USSD/i }));
      expect(screen.getByText(/Choose Your Bank/i)).toBeInTheDocument();
      expect(screen.getByText(/Dial the code below/i)).toBeInTheDocument();
    });

    it('populates test card using quick fill sandbox button and handles verification', async () => {
      const mockVerify = vi.fn().mockResolvedValue({ status: 'verified' });
      const mockSuccess = vi.fn();

      const mockSession: CheckoutSession = {
        bookingId: 'book-001',
        checkoutReference: 'bbj-chk-001',
        totalPayableNaira: 23650,
        availableMethods: ['card', 'bank_transfer', 'ussd'],
        idempotencyKey: 'idem-test-001',
        expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
      };

      render(
        <CheckoutModal
          isOpen={true}
          onClose={vi.fn()}
          bookingId="book-001"
          serviceTitle="Air Conditioner Servicing"
          workerName="Emeka Okafor"
          pricing={samplePricing}
          session={mockSession}
          onVerifyPayment={mockVerify}
          onCheckStatus={vi.fn()}
          onSuccess={mockSuccess}
        />
      );

      // Fill test card
      const fillBtn = screen.getByRole('button', { name: /Auto-Fill Test Card/i });
      fireEvent.click(fillBtn);

      const payBtn = screen.getByRole('button', { name: /Pay ₦23,650 & Fund Escrow/i });
      fireEvent.click(payBtn);

      await waitFor(() => {
        expect(mockVerify).toHaveBeenCalled();
      });

      expect(screen.getByText(/Escrow Funded Successfully/i)).toBeInTheDocument();
    });

    it('disables payment actions and renders offline warning when isOffline is true', () => {
      render(
        <CheckoutModal
          isOpen={true}
          onClose={vi.fn()}
          bookingId="book-001"
          serviceTitle="Air Conditioner Servicing"
          workerName="Emeka Okafor"
          pricing={samplePricing}
          session={null}
          isOffline={true}
          onVerifyPayment={vi.fn()}
          onCheckStatus={vi.fn()}
          onSuccess={vi.fn()}
        />
      );

      expect(screen.getByText(/You are currently offline/i)).toBeInTheDocument();
      const payBtn = screen.getByRole('button', { name: /Pay ₦23,650 & Fund Escrow/i });
      expect(payBtn).toBeDisabled();
    });
  });

  describe('3. CompletionInspectionCard Component', () => {
    it('renders inspection card with confirmation checklist', () => {
      render(
        <CompletionInspectionCard
          bookingId="book-001"
          workerName="Emeka Okafor"
          serviceTitle="Air Conditioner Servicing"
          amountNaira={23650}
          onReleaseEscrow={vi.fn()}
          onOpenDisputeModal={vi.fn()}
        />
      );

      expect(screen.getByRole('region', { name: /Work Completion Inspection/i })).toBeInTheDocument();
      expect(screen.getByText(/Emeka Okafor Marked This Job as Complete/i)).toBeInTheDocument();
      expect(screen.getByText(/Funds of ₦23,650 remain locked in escrow until your approval/i)).toBeInTheDocument();
      expect(screen.getByText(/All requested work items have been fully executed/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Inspect & Release Funds/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Open Dispute/i })).toBeInTheDocument();
    });

    it('opens release confirmation modal with feedback and rating inputs', async () => {
      const handleRelease = vi.fn().mockResolvedValue(undefined);

      render(
        <CompletionInspectionCard
          bookingId="book-001"
          workerName="Emeka Okafor"
          serviceTitle="Air Conditioner Servicing"
          amountNaira={23650}
          onReleaseEscrow={handleRelease}
          onOpenDisputeModal={vi.fn()}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /Inspect & Release Funds/i }));

      expect(screen.getByRole('heading', { level: 4, name: /Authorize Escrow Release/i })).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Share details about the quality of service/i)).toBeInTheDocument();

      const confirmBtn = screen.getByRole('button', { name: /Approve & Release/i });
      fireEvent.click(confirmBtn);

      await waitFor(() => {
        expect(handleRelease).toHaveBeenCalled();
      });
    });

    it('calls onOpenDisputeModal when customer clicks Report Issue', () => {
      const handleDispute = vi.fn();
      render(
        <CompletionInspectionCard
          bookingId="book-001"
          workerName="Emeka Okafor"
          serviceTitle="Air Conditioner Servicing"
          amountNaira={23650}
          onReleaseEscrow={vi.fn()}
          onOpenDisputeModal={handleDispute}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /Open Dispute/i }));
      expect(handleDispute).toHaveBeenCalledTimes(1);
    });

    it('disables release button when offline', () => {
      render(
        <CompletionInspectionCard
          bookingId="book-001"
          workerName="Emeka Okafor"
          serviceTitle="Air Conditioner Servicing"
          amountNaira={23650}
          isOffline={true}
          onReleaseEscrow={vi.fn()}
          onOpenDisputeModal={vi.fn()}
        />
      );

      const releaseBtn = screen.getByRole('button', { name: /Inspect & Release Funds/i });
      expect(releaseBtn).toBeDisabled();
    });
  });

  describe('4. DisputeModal Component', () => {
    it('validates required description and submits dispute', async () => {
      const handleSubmitDispute = vi.fn().mockResolvedValue(undefined);
      const handleClose = vi.fn();

      render(
        <DisputeModal
          isOpen={true}
          onClose={handleClose}
          bookingId="book-001"
          onSubmitDispute={handleSubmitDispute}
        />
      );

      expect(screen.getByRole('dialog', { name: /Open BukieGuarantee Dispute/i })).toBeInTheDocument();
      expect(screen.getByText(/Opening a dispute freezes payout/i)).toBeInTheDocument();

      const submitBtn = screen.getByRole('button', { name: /Submit Dispute & Freeze Escrow/i });

      // First try without description: shows validation error
      fireEvent.click(submitBtn);
      expect(screen.getByText(/Please provide a brief description of the issue/i)).toBeInTheDocument();
      expect(handleSubmitDispute).not.toHaveBeenCalled();

      // Fill in description
      const descInput = screen.getByPlaceholderText(/Explain what went wrong/i);
      fireEvent.change(descInput, { target: { value: 'Work was only partially done and tools were left behind.' } });

      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(handleSubmitDispute).toHaveBeenCalledWith(
          'Work incomplete or abandoned',
          'Work was only partially done and tools were left behind.'
        );
      });
      expect(handleClose).toHaveBeenCalled();
    });
  });

  describe('5. RefundRequestModal Component', () => {
    it('renders banking timeline notice and submits refund request', async () => {
      const handleSubmitRefund = vi.fn().mockResolvedValue(undefined);
      const handleClose = vi.fn();

      render(
        <RefundRequestModal
          isOpen={true}
          onClose={handleClose}
          bookingId="book-001"
          amountNaira={23650}
          onSubmitRefund={handleSubmitRefund}
        />
      );

      expect(screen.getByRole('dialog', { name: /Request Escrow Refund/i })).toBeInTheDocument();
      expect(screen.getByText(/3 to 5 business days/i)).toBeInTheDocument();

      const submitBtn = screen.getByRole('button', { name: /Submit Refund Request/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(handleSubmitRefund).toHaveBeenCalledWith(
          'BrainWorker unable to attend',
          ''
        );
      });
      expect(handleClose).toHaveBeenCalled();
    });
  });

  describe('6. ReceiptModal Component', () => {
    const mockReceipt: PaymentReceipt = {
      receiptNumber: 'REC-2026-0921-9988',
      bookingId: 'book-001',
      bookingReference: 'BKG-77210',
      customerId: 'usr-customer-test',
      customerName: 'Babajide Adeleke',
      customerPhoneMasked: '+234 803 ••• ••67',
      workerId: 'bw-1',
      workerName: 'Chidi Okonkwo',
      serviceTitle: 'Inverter Backup & Battery Inspection',
      address: 'Lekki Phase 1, Lagos',
      pricing: samplePricing,
      paymentMethodUsed: 'card',
      paymentReference: 'bbj-pay-card-001',
      paidAt: '2026-09-21T10:00:00.000Z',
      settlementStatus: 'settled',
      settlementDate: '2026-09-21T14:30:00.000Z',
      isSimulatedTestDocument: true,
    };

    it('renders official receipt header, watermark, breakdown, and settlement badge', () => {
      render(
        <ReceiptModal
          isOpen={true}
          onClose={vi.fn()}
          receipt={mockReceipt}
        />
      );

      expect(screen.getByRole('dialog', { name: /Payment & Escrow Receipt/i })).toBeInTheDocument();
      expect(screen.getByText('REC-2026-0921-9988')).toBeInTheDocument();
      expect(screen.getByText('Babajide Adeleke')).toBeInTheDocument();
      expect(screen.getByText('Chidi Okonkwo')).toBeInTheDocument();
      expect(screen.getByText('Inverter Backup & Battery Inspection')).toBeInTheDocument();
      expect(screen.getByText('bbj-pay-card-001')).toBeInTheDocument();
      expect(screen.getByText('₦23,650')).toBeInTheDocument();

      // Distinct settlement status badge
      expect(screen.getByText('Payment Settled & Released')).toBeInTheDocument();

      // Simulated watermark
      expect(screen.getByText('SIMULATED TEST RECEIPT (PHASE 1 MOCK BOUNDARY)')).toBeInTheDocument();
    });

    it('distinguishes release_pending settlement status on receipt', () => {
      const pendingReceipt: PaymentReceipt = {
        ...mockReceipt,
        settlementStatus: 'release_pending',
        settlementDate: undefined,
      };

      render(
        <ReceiptModal
          isOpen={true}
          onClose={vi.fn()}
          receipt={pendingReceipt}
        />
      );

      expect(screen.getByText('Release Pending Verification')).toBeInTheDocument();
      expect(screen.getByText(/Payout transfer undergoing banking settlement/i)).toBeInTheDocument();
    });
  });

  describe('7. LifecycleStateSurface Integration', () => {
    const mockConfirmedActivity: CustomerActivityItem = {
      id: 'act-confirmed-001',
      title: 'Plumbing Valve Replacement',
      referenceCode: 'BKG-11223',
      category: 'Plumbing',
      type: 'booking',
      status: 'scheduled',
      statusLabel: 'Scheduled',
      jobStatus: 'CONFIRMED',
      schedule: 'Tomorrow, 10:00 AM',
      location: 'Ikeja, Lagos',
      createdAt: '2026-09-21T10:00:00.000Z',
      preferredWorker: {
        name: 'Tunde Bakare',
      },
    };

    it('displays Fund Escrow banner and button when jobStatus is CONFIRMED and escrow is unfunded', async () => {
      const repo = getCustomerPaymentRepository();
      repo.setMockBookingState('act-confirmed-001', {
        jobStatus: 'CONFIRMED',
        escrowStatus: 'unfunded',
        customerId: mockUser.id,
      });

      render(<LifecycleStateSurface activity={mockConfirmedActivity} />);

      await waitFor(() => {
        expect(
          screen.getByText(/Deposit agreed fee into secure BukieGuarantee escrow/i)
        ).toBeInTheDocument();
      });

      const fundBtn = screen.getByRole('button', { name: /Fund Escrow/i });
      expect(fundBtn).toBeInTheDocument();

      // Clicking Fund Escrow opens the CheckoutModal
      fireEvent.click(fundBtn);

      await waitFor(() => {
        expect(screen.getByRole('dialog', { name: /Fund Escrow/i })).toBeInTheDocument();
      });
    });

    it('displays CompletionInspectionCard when jobStatus is PENDING_COMPLETION and escrow is held_in_escrow', async () => {
      const mockPendingCompletion: CustomerActivityItem = {
        ...mockConfirmedActivity,
        id: 'act-inspect-001',
        jobStatus: 'PENDING_COMPLETION',
      };

      const repo = getCustomerPaymentRepository();
      repo.setMockBookingState('act-inspect-001', {
        jobStatus: 'PENDING_COMPLETION',
        escrowStatus: 'held_in_escrow',
        customerId: mockUser.id,
      });

      render(<LifecycleStateSurface activity={mockPendingCompletion} />);

      await waitFor(() => {
        expect(screen.getByRole('region', { name: /Work Completion Inspection/i })).toBeInTheDocument();
      });
      expect(screen.getByText(/Tunde Bakare Marked This Job as Complete/i)).toBeInTheDocument();
    });

    it('displays dispute banner when jobStatus is DISPUTED', async () => {
      const mockDisputedActivity: CustomerActivityItem = {
        ...mockConfirmedActivity,
        id: 'act-disputed-001',
        jobStatus: 'DISPUTED',
      };

      const repo = getCustomerPaymentRepository();
      repo.setMockBookingState('act-disputed-001', {
        jobStatus: 'DISPUTED',
        escrowStatus: 'disputed',
        customerId: mockUser.id,
      });

      render(<LifecycleStateSurface activity={mockDisputedActivity} />);

      await waitFor(() => {
        expect(screen.getByText('BukieGuarantee Dispute In Progress')).toBeInTheDocument();
      });
      expect(screen.getByText(/Payouts for this job are frozen under escrow/i)).toBeInTheDocument();
    });

    it('displays Request Refund button when jobStatus is CANCELLED and escrow is held_in_escrow', async () => {
      const mockCancelledActivity: CustomerActivityItem = {
        ...mockConfirmedActivity,
        id: 'act-cancelled-001',
        jobStatus: 'CANCELLED',
      };

      const repo = getCustomerPaymentRepository();
      repo.setMockBookingState('act-cancelled-001', {
        jobStatus: 'CANCELLED',
        escrowStatus: 'held_in_escrow',
        customerId: mockUser.id,
      });

      render(<LifecycleStateSurface activity={mockCancelledActivity} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Request Refund/i })).toBeInTheDocument();
      });
    });

    it('displays View Receipt button when receipt is available and opens ReceiptModal', async () => {
      const mockCompletedActivity: CustomerActivityItem = {
        ...mockConfirmedActivity,
        id: 'act-receipt-001',
        jobStatus: 'COMPLETED',
      };

      const repo = getCustomerPaymentRepository();
      repo.setMockBookingState('act-receipt-001', {
        jobStatus: 'COMPLETED',
        escrowStatus: 'released',
        customerId: mockUser.id,
      });

      render(<LifecycleStateSurface activity={mockCompletedActivity} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /View Receipt/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /View Receipt/i }));

      await waitFor(() => {
        expect(screen.getByRole('dialog', { name: /Payment & Escrow Receipt/i })).toBeInTheDocument();
      });
    });
  });
});
