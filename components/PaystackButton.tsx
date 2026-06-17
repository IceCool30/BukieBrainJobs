'use client';

import React from 'react';
import { usePaystackPayment } from 'react-paystack';
import { Loader2, CreditCard } from 'lucide-react';

interface PaystackButtonProps {
  amount: number; // in Naira (e.g., 500 or 1000)
  email: string;
  metadata?: Record<string, any>;
  text: string;
  onSuccess: (response: { reference: string; status: string }) => void;
  className?: string;
  id?: string;
}

export default function PaystackButton({
  amount,
  email,
  metadata = {},
  text,
  onSuccess,
  className = '',
  id
}: PaystackButtonProps) {
  // Paystack expects amount in kobo (1 NGN = 100 kobo)
  const amountInKobo = Math.round(amount * 100);
  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_a8a3013b0c53d9e7ad3fa082a64c489d854cfd31'; // standard sandbox key or env

  const config = {
    reference: `tx-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
    email,
    amount: amountInKobo,
    publicKey,
    metadata,
  };

  const initializePayment = usePaystackPayment(config as any);

  const handlePay = () => {
    if (!email) {
      alert('Email address is required to initialize payment.');
      return;
    }
    try {
      initializePayment({
        onSuccess: (response: any) => {
          // Response will contain reference, trans, status, message etc.
          onSuccess({
            reference: response.reference,
            status: response.status || 'success',
          });
        },
        onClose: () => {
          console.log('Payment modal closed');
        },
      });
    } catch (err) {
      console.error('Paystack initialization failed:', err);
      alert('Could not open payment window. Please check public key configurations.');
    }
  };

  return (
    <button
      type="button"
      id={id || `paystack-trigger-btn`}
      onClick={handlePay}
      className={`w-full bg-[#D4AF37] hover:bg-[#c29f2f] text-gray-950 text-xs font-extrabold uppercase tracking-widest py-3 px-6 rounded-xl transition-all shadow-md shadow-amber-950/20 cursor-pointer flex items-center justify-center gap-2 ${className}`}
    >
      <CreditCard className="w-4 h-4 shrink-0 stroke-2" />
      <span>{text}</span>
    </button>
  );
}
