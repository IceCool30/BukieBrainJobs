import type {
  IPaymentProviderAdapter,
  PaymentProviderCapabilities,
  VirtualAccountDetails,
  UssdDetails,
  PaymentMethod,
} from './types';

/**
 * Sandbox payment provider adapter for mock and test environments.
 * Encapsulates sandbox-specific provider metadata, virtual account generation,
 * USSD templates, and payment method presentation labels.
 */
export class SandboxPaymentProviderAdapter implements IPaymentProviderAdapter {
  private capabilities: PaymentProviderCapabilities = {
    providerId: 'sandbox_payment_adapter',
    supportedMethods: ['card', 'bank_transfer', 'ussd'],
    supportsVirtualAccounts: true,
    supportsUssd: true,
  };

  getCapabilities(): PaymentProviderCapabilities {
    return { ...this.capabilities };
  }

  async generateVirtualAccount(
    bookingId: string,
    expiry?: string | undefined
  ): Promise<VirtualAccountDetails> {
    return {
      bankName: 'Wema Bank (BukiePay Escrow)',
      accountNumber: `012${Math.floor(1000000 + Math.random() * 9000000)}`,
      accountName: `BukieBrainJobs Escrow (${bookingId})`,
      expiresAt: expiry,
      reconciliationNotes: 'Transfer exact amount. Verification reconciles automatically upon settlement.',
    };
  }

  async generateUssdDetails(totalPayableNaira: number): Promise<UssdDetails> {
    return {
      bankName: 'GTBank / Multiple Banks',
      ussdString: `*737*2*${totalPayableNaira}*012345#`,
      directDialUri: `tel:*737*2*${totalPayableNaira}*012345%23`,
    };
  }

  formatPaymentMethodLabel(method?: PaymentMethod | undefined): string {
    switch (method) {
      case 'bank_transfer':
        return 'Bank Transfer (Dedicated Virtual Account)';
      case 'ussd':
        return 'USSD Payment';
      case 'card':
      default:
        return 'Debit Card (Mastercard •••• 4242)';
    }
  }
}
