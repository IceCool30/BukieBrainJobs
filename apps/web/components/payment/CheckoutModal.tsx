'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  CreditCard,
  Building2,
  PhoneCall,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  RefreshCw,
  Clock,
  WifiOff,
} from 'lucide-react';
import type {
  CheckoutSession,
  PaymentMethod,
  PaymentAuthorizationStatus,
  PricingBreakdown,
} from '../../lib/payment/types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  referenceCode?: string | undefined;
  serviceTitle: string;
  workerName: string;
  pricing: PricingBreakdown;
  session: CheckoutSession | null;
  isOffline?: boolean | undefined;
  onVerifyPayment: (checkoutReference: string, method?: PaymentMethod) => Promise<{ status: PaymentAuthorizationStatus; failureReason?: string | undefined }>;
  onCheckStatus: (checkoutReference: string, method?: PaymentMethod) => Promise<{ status: PaymentAuthorizationStatus; failureReason?: string | undefined }>;
  onSuccess: () => void;
}

export function CheckoutModal({
  isOpen,
  onClose,
  bookingId,
  referenceCode,
  serviceTitle,
  workerName,
  pricing,
  session,
  isOffline = false,
  onVerifyPayment,
  onCheckStatus,
  onSuccess,
}: CheckoutModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('card');
  const [paymentState, setPaymentState] = useState<PaymentAuthorizationStatus>('awaiting_payment');
  const [failureMessage, setFailureMessage] = useState<string | null>(null);

  // Card form simulation state
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Copy indicator for account number
  const [isCopied, setIsCopied] = useState(false);

  // USSD bank selection
  const [selectedUssdBank, setSelectedUssdBank] = useState<'gtb' | 'access' | 'zenith' | 'uba'>('gtb');

  const modalRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setPaymentState('awaiting_payment');
      setFailureMessage(null);
      setIsCopied(false);
      closeBtnRef.current?.focus();
    }
  }, [isOpen]);

  // Trap escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape' && paymentState !== 'processing') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, paymentState, onClose]);

  if (!isOpen) return null;

  const handleFillSandboxCard = () => {
    setCardNumber('4084 0840 0000 0000');
    setCardExpiry('12/28');
    setCardCvv('123');
  };

  const handleCopyAccount = async (accountNumber: string) => {
    try {
      await navigator.clipboard.writeText(accountNumber);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleExecutePayment = async () => {
    if (isOffline || !session) return;
    setPaymentState('processing');
    setFailureMessage(null);

    try {
      const result = await onVerifyPayment(session.checkoutReference, selectedMethod);
      setPaymentState(result.status);
      if (result.status === 'verified') {
        setTimeout(() => {
          onSuccess();
        }, 1200);
      } else if (result.status === 'failed') {
        setFailureMessage(result.failureReason || 'Payment authorization was declined.');
      } else if (result.status === 'timeout') {
        setFailureMessage('Payment verification latency exceeded.');
      }
    } catch (err: unknown) {
      setPaymentState('failed');
      const msg = err instanceof Error ? err.message : 'Payment authorization failed.';
      setFailureMessage(msg);
    }
  };

  const handleReconcileStatus = async () => {
    if (isOffline || !session) return;
    setPaymentState('processing');

    try {
      const result = await onCheckStatus(session.checkoutReference, selectedMethod);
      setPaymentState(result.status);
      if (result.status === 'verified') {
        setTimeout(() => {
          onSuccess();
        }, 1200);
      } else if (result.status === 'failed') {
        setFailureMessage(result.failureReason || 'Payment verification failed.');
      }
    } catch {
      setPaymentState('failed');
      setFailureMessage('Unable to verify transaction with banking partner.');
    }
  };

  const resolveUssdString = () => {
    const amount = pricing.totalPayableNaira;
    switch (selectedUssdBank) {
      case 'access':
        return `*901*2*${amount}*012345#`;
      case 'zenith':
        return `*966*2*${amount}*012345#`;
      case 'uba':
        return `*919*2*${amount}*012345#`;
      case 'gtb':
      default:
        return `*737*2*${amount}*012345#`;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 sm:p-6 overflow-y-auto backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-modal-title"
      ref={modalRef}
    >
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-50 text-[#296A4B]">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#296A4B]">
                BukieGuarantee Escrow Checkout
              </span>
            </div>
            <h2 id="checkout-modal-title" className="text-lg sm:text-xl font-display font-bold text-[#001A41]">
              Fund Escrow to Authorize Service
            </h2>
            <p className="text-xs text-slate-500">
              {serviceTitle} • {workerName} {referenceCode ? `(${referenceCode})` : `(${bookingId})`}
            </p>
          </div>

          <button
            type="button"
            ref={closeBtnRef}
            onClick={onClose}
            disabled={paymentState === 'processing'}
            aria-label="Close checkout modal"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer disabled:opacity-30"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Offline Notice */}
        {isOffline && (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-amber-900 flex items-start gap-2.5 text-xs"
          >
            <WifiOff className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-bold">You are currently offline</p>
              <p className="text-amber-800 mt-0.5">
                Financial checkout and escrow funding require an active network connection.
              </p>
            </div>
          </div>
        )}

        {/* Pricing Summary Breakdown */}
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-600">
            <span>Base Service Estimate</span>
            <span className="font-mono font-semibold">₦{pricing.baseServiceAmountNaira.toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-between text-slate-600">
            <span>Platform Service Fee</span>
            <span className="font-mono font-semibold">₦{pricing.platformServiceFeeNaira.toLocaleString()}</span>
          </div>

          <div className="flex items-start justify-between text-slate-600">
            <div>
              <span>BukieGuarantee Escrow Fee</span>
              <span className="block text-[10px] text-[#296A4B]">
                Funds held securely in escrow until work inspection
              </span>
            </div>
            <span className="font-mono font-semibold">₦{pricing.escrowProtectionFeeNaira.toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-between text-slate-600">
            <span>VAT (7.5% on service fee)</span>
            <span className="font-mono font-semibold">₦{pricing.statutoryVatNaira.toLocaleString()}</span>
          </div>

          <div className="pt-2 border-t border-slate-200 flex items-center justify-between font-bold text-sm text-[#001A41]">
            <span>Total Amount to Fund</span>
            <span className="text-base font-mono text-[#296A4B]">
              ₦{pricing.totalPayableNaira.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Success View */}
        {paymentState === 'verified' && (
          <div className="mt-6 rounded-2xl bg-emerald-50 border border-emerald-200 p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#296A4B] flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
            </div>
            <h3 className="font-display font-bold text-base text-[#001A41]">
              Escrow Funded Successfully
            </h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
              Your payment of ₦{pricing.totalPayableNaira.toLocaleString()} is now safely locked under BukieGuarantee.
              Your BrainWorker is authorized to proceed with the job.
            </p>
          </div>
        )}

        {/* Timeout Reconciliation View */}
        {paymentState === 'timeout' && (
          <div className="mt-6 rounded-2xl bg-amber-50 border border-amber-200 p-5 space-y-3">
            <div className="flex items-start gap-2.5">
              <Clock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
              <div className="text-xs text-amber-900">
                <p className="font-bold">Payment Verification Latency</p>
                <p className="mt-1 text-amber-800 leading-relaxed">
                  Verification is taking longer than expected. Do not submit payment again to avoid double charges.
                  Click below to reconcile with the banking network.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleReconcileStatus}
              disabled={isOffline}
              className="w-full py-2.5 rounded-xl bg-[#001A41] text-white text-xs font-semibold hover:bg-[#002661] transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Check Verification Status</span>
            </button>
          </div>
        )}

        {/* Failure Notice */}
        {paymentState === 'failed' && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-900 flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="flex-1">
              <p className="font-bold">Payment Authorization Declined</p>
              <p className="text-rose-700 mt-0.5">{failureMessage || 'Please try another payment method.'}</p>
            </div>
          </div>
        )}

        {/* Interactive Payment Flow (when awaiting payment or failed) */}
        {(paymentState === 'awaiting_payment' || paymentState === 'failed' || paymentState === 'processing') && (
          <div className="mt-6 space-y-4">
            {/* Payment Method Selector Tabs */}
            <div
              role="tablist"
              aria-label="Payment Methods"
              className="grid grid-cols-3 gap-2 bg-slate-100 p-1 rounded-xl"
            >
              <button
                type="button"
                role="tab"
                id="method-tab-card"
                aria-selected={selectedMethod === 'card'}
                aria-controls="method-panel-card"
                onClick={() => setSelectedMethod('card')}
                disabled={paymentState === 'processing'}
                className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  selectedMethod === 'card'
                    ? 'bg-white text-[#001A41] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CreditCard className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Card</span>
              </button>

              <button
                type="button"
                role="tab"
                id="method-tab-transfer"
                aria-selected={selectedMethod === 'bank_transfer'}
                aria-controls="method-panel-transfer"
                onClick={() => setSelectedMethod('bank_transfer')}
                disabled={paymentState === 'processing'}
                className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  selectedMethod === 'bank_transfer'
                    ? 'bg-white text-[#001A41] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Transfer</span>
              </button>

              <button
                type="button"
                role="tab"
                id="method-tab-ussd"
                aria-selected={selectedMethod === 'ussd'}
                aria-controls="method-panel-ussd"
                onClick={() => setSelectedMethod('ussd')}
                disabled={paymentState === 'processing'}
                className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  selectedMethod === 'ussd'
                    ? 'bg-white text-[#001A41] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <PhoneCall className="h-3.5 w-3.5" aria-hidden="true" />
                <span>USSD</span>
              </button>
            </div>

            {/* TAB 1: CARD */}
            {selectedMethod === 'card' && (
              <div
                role="tabpanel"
                id="method-panel-card"
                aria-labelledby="method-tab-card"
                className="space-y-3"
              >
                <div className="rounded-xl bg-blue-50/70 border border-blue-100 p-3 text-xs text-blue-900 flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="font-bold block">Sandbox Simulated Payment</span>
                    <span className="text-[11px] text-blue-700">Do not enter real debit card details.</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleFillSandboxCard}
                    className="text-[11px] px-2 py-1 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 cursor-pointer shrink-0"
                  >
                    Auto-Fill Test Card
                  </button>
                </div>

                <div className="space-y-2.5">
                  <div>
                    <label htmlFor="checkout-card-number" className="block text-xs font-semibold text-slate-700 mb-1">
                      Card Number
                    </label>
                    <input
                      id="checkout-card-number"
                      type="text"
                      inputMode="numeric"
                      placeholder="4084 0840 0000 0000"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      disabled={paymentState === 'processing'}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#001A41] disabled:opacity-50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="checkout-card-expiry" className="block text-xs font-semibold text-slate-700 mb-1">
                        Expiry Date
                      </label>
                      <input
                        id="checkout-card-expiry"
                        type="text"
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        disabled={paymentState === 'processing'}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#001A41] disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label htmlFor="checkout-card-cvv" className="block text-xs font-semibold text-slate-700 mb-1">
                        CVV
                      </label>
                      <input
                        id="checkout-card-cvv"
                        type="password"
                        maxLength={4}
                        placeholder="123"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        disabled={paymentState === 'processing'}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#001A41] disabled:opacity-50"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: BANK TRANSFER */}
            {selectedMethod === 'bank_transfer' && (
              <div
                role="tabpanel"
                id="method-panel-transfer"
                aria-labelledby="method-tab-transfer"
                className="space-y-3"
              >
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Bank Name</span>
                    <span className="font-bold text-slate-900">{session?.virtualAccount?.bankName || 'Designated Settlement Bank'}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Account Number</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-[#001A41]">
                        {session?.virtualAccount?.accountNumber || ''}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyAccount(session?.virtualAccount?.accountNumber || '')}
                        aria-label="Copy account number"
                        className="p-1 text-slate-500 hover:text-slate-900 cursor-pointer"
                      >
                        {isCopied ? (
                          <Check className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Beneficiary</span>
                    <span className="font-semibold text-slate-800">{session?.virtualAccount?.accountName || 'BukieBrainJobs Escrow'}</span>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Amount to Transfer</span>
                    <span className="font-mono font-bold text-[#296A4B]">₦{pricing.totalPayableNaira.toLocaleString()}</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Transfer the exact amount above from your banking app. Verification reconciles automatically once funds reflect.
                </p>

                {session?.virtualAccount?.expiresAt && (
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-0.5">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span>Account valid until: {new Date(session.virtualAccount.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: USSD */}
            {selectedMethod === 'ussd' && (
              <div
                role="tabpanel"
                id="method-panel-ussd"
                aria-labelledby="method-tab-ussd"
                className="space-y-3"
              >
                <div className="space-y-1.5">
                  <span className="block text-xs font-semibold text-slate-700">Choose Your Bank</span>
                  <div className="grid grid-cols-4 gap-2">
                    {(['gtb', 'access', 'zenith', 'uba'] as const).map((bank) => (
                      <button
                        key={bank}
                        type="button"
                        onClick={() => setSelectedUssdBank(bank)}
                        className={`py-2 px-1 rounded-lg text-xs font-bold uppercase transition cursor-pointer ${
                          selectedUssdBank === bank
                            ? 'bg-[#001A41] text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {bank}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center space-y-2">
                  <span className="text-xs text-slate-500 block">Dial the code below on your registered phone:</span>
                  <div className="text-base font-mono font-bold text-[#001A41] tracking-wider py-1 bg-white rounded-lg border border-slate-200">
                    {resolveUssdString()}
                  </div>
                  <a
                    href={`tel:${encodeURIComponent(resolveUssdString())}`}
                    className="inline-block text-xs font-semibold text-[#296A4B] hover:underline"
                  >
                    Tap here to dial directly
                  </a>
                </div>
              </div>
            )}

            {/* Action Execution Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleExecutePayment}
                disabled={paymentState === 'processing' || isOffline}
                className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-[#296A4B] hover:bg-[#20543B] text-white font-semibold text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
              >
                {paymentState === 'processing' ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" />
                    <span>Authorizing payment with bank...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                    <span>
                      {selectedMethod === 'card'
                        ? `Pay ₦${pricing.totalPayableNaira.toLocaleString()} & Fund Escrow`
                        : selectedMethod === 'bank_transfer'
                        ? 'I Have Completed This Transfer'
                        : 'Confirm USSD Payment'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
