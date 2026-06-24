'use client';

import React, { useState } from 'react';
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
  const [loading, setLoading] = useState(false);

  const handlePay = () => {
    if (!email) {
      console.error('Email address is required to initialize payment.');
      return;
    }
    
    setLoading(true);
    
    // Simulate a payment flow with a delay
    setTimeout(() => {
      setLoading(false);
      onSuccess({
        reference: `tx-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
        status: 'success',
      });
    }, 1500);
  };

  return (
    <button
      type="button"
      id={id || `paystack-trigger-btn`}
      onClick={handlePay}
      disabled={loading}
      className={`w-full bg-[#0A192F] hover:bg-[#152e54] text-white text-xs font-extrabold uppercase tracking-widest py-3 px-6 rounded-xl transition-all shadow-md shadow-blue-950/20 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 ${className}`}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 shrink-0 animate-spin" />
      ) : (
        <CreditCard className="w-4 h-4 shrink-0 stroke-2" />
      )}
      <span>{text}</span>
    </button>
  );
}
