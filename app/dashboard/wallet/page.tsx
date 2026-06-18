'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Wallet, 
  PlusCircle, 
  Coins, 
  Flame, 
  Sparkles, 
  ArrowUpRight, 
  RefreshCw, 
  ShieldCheck, 
  AlertCircle 
} from 'lucide-react';
import { createBrowserClient } from '@supabase/auth-helpers-nextjs';
import { buyBidsAction } from '@/app/actions';
import dynamic from 'next/dynamic';

const PaystackButton = dynamic(() => import('@/components/PaystackButton'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-12 bg-gray-100 rounded-xl animate-pulse flex items-center justify-center text-xs font-mono text-gray-400 uppercase font-extrabold">
      Loading checkout...
    </div>
  ),
});

export default function WalletPage() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [userEmail, setUserEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchWalletDetails = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      setUserEmail(session.user.email || '');

      // Load Profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      setProfile(profileData);

      // Fetch Wallet
      const { data: walletData, error: walletError } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (walletData) {
        setWallet(walletData);
      } else {
        // Handle fallback structure
        const { data: walletRetry } = await supabase
          .from('wallets')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();
        if (walletRetry) {
          setWallet(walletRetry);
        }
      }

      // Fetch transaction ledger history
      const { data: txData } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
      
      setTransactions(txData || []);

    } catch (err: any) {
      setErrorMsg('Could not fetch financial details from Server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  // Handles successful Paystack response
  const handlePaymentSuccess = async (response: { reference: string; status: string }) => {
    setIsProcessing(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      // Call modern secure Server Action
      const result = await buyBidsAction(response.reference);

      if (result.success) {
        setSuccessMsg('Payment processed! Added 10 Job Bids successfully.');
        // Refresh wallet numbers
        await fetchWalletDetails();
      } else {
        setErrorMsg(result.error || 'Server rejected payment verification.');
      }
    } catch (err: any) {
      setErrorMsg('Verification failed. Please contact standard support with proof of reference.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F4F5F7] text-[#1A1C1E]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-[#006D44]" />
          <span className="text-xs font-mono text-gray-500 font-semibold tracking-wide uppercase">
            Opening your fintech portal...
          </span>
        </div>
      </main>
    );
  }

  const freeBids = wallet?.free_bids_remaining ?? 3;

  return (
    <main className="min-h-screen bg-[#F4F5F7] text-[#1A1C1E] flex flex-col">
      {/* Navbar area */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm" id="wallet-navbar">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-900 font-bold uppercase tracking-wider bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-xl transition-all cursor-pointer"
              id="wallet-back-btn"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <div className="h-4 w-[1px] bg-gray-200"></div>
            <Image src="/logo.png" alt="BukieBrainJobs Logo" width={32} height={32} className="rounded-xl shadow border-b-2 border-[#D4AF37]" />
            <div>
              <span className="text-[9px] font-mono text-gray-500 font-bold uppercase tracking-wider block mt-1">
                Authorized Artisan Ledgers
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Content wrapper */}
      <div className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6" id="wallet-panel">
        
        {/* Status messages */}
        {errorMsg && (
          <div className="p-4 bg-red-50 text-red-700 border border-red-100 rounded-xl flex gap-3 text-sm font-medium animate-fadeIn">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl flex gap-3 text-sm font-medium animate-fadeIn">
            <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {isProcessing && (
          <div className="p-4 bg-amber-50 text-amber-800 border border-amber-100 rounded-xl flex gap-3 text-sm font-medium animate-pulse">
            <RefreshCw className="w-5 h-5 shrink-0 text-amber-600 animate-spin" />
            <span>Verifying with Paystack network and reloading balances...</span>
          </div>
        )}

        {/* Hero Section containing Balance and Counter */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="wallet-financials-hud">
          {/* Funds display card */}
          <div className="bg-[#1A1C1E] text-white rounded-3xl p-6 relative overflow-hidden shadow-sm flex flex-col justify-between h-48 border border-white/5">
            <div className="absolute right-0 top-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full blur-2xl"></div>
            
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#D4AF37]">
                Live Balance
              </span>
              <Wallet className="w-5 h-5 text-gray-400" />
            </div>

            <div>
              <span className="block text-3xl font-black text-white tracking-tight font-mono">
                ₦0.00
              </span>
              <span className="text-[10px] text-gray-400 mt-1 block">
                Standard Wallet Placeholder (Balance Withdrawals Phase)
              </span>
            </div>
          </div>

          {/* Bids display card */}
          <div className="bg-white rounded-3xl p-6 relative overflow-hidden shadow-sm flex flex-col justify-between h-48 border border-gray-100">
            <div className="absolute right-0 top-0 w-32 h-32 bg-[#006D44]/5 rounded-full blur-2xl"></div>
            
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#006D44]">
                Bid Capacity
              </span>
              <Coins className="w-5 h-5 text-[#006D44]" />
            </div>

            <div>
              <span className="block text-3xl font-black text-gray-900 tracking-tight font-mono">
                {freeBids}
              </span>
              <span className="text-[10px] text-gray-500 mt-1 block">
                Free bids left for pitching custom job client proposals
              </span>
            </div>
          </div>
        </div>

        {/* Buy Bids CTA */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm" id="bid-bundle-actions">
          <div className="max-w-md mx-auto text-center space-y-6">
            <div className="inline-flex p-3 bg-amber-50 rounded-full border border-amber-100 text-[#D4AF37] mb-2 leading-none">
              <Sparkles className="w-6 h-6 stroke-2" />
            </div>
            
            <div>
              <h2 className="text-lg font-black text-gray-900 tracking-tight">
                Top Up Bids
              </h2>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Connect with local employers and secure tasks today. Buy premium bid bundles to propose tailored rates directly on incoming job requests.
              </p>
            </div>

            {/* Standard Bundle Card */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 text-left space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-extrabold text-sm text-gray-900">
                    Standard Bundle
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Get 10 Job Bids
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-[#006D44] font-mono">
                    ₦500
                  </span>
                  <span className="block text-[8px] text-gray-400 uppercase font-black">
                    VAT Inclusive
                  </span>
                </div>
              </div>

              <PaystackButton
                amount={500}
                email={userEmail}
                text="Acquire Bundle - ₦500"
                onSuccess={handlePaymentSuccess}
                metadata={{
                  type: 'bid_bundle',
                  user_id: profile?.id
                }}
                id="topup-bids-trigger"
              />
            </div>
          </div>
        </div>

        {/* Secure Warning badge */}
        <div className="bg-emerald-50 border border-emerald-100/60 p-4 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="text-xs text-emerald-800 leading-normal">
              System uses secure CBN-regulated payment routing through Paystack, keeping credentials safe.
            </div>
          </div>
        </div>

        {/* Transactions ledger history table */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm" id="bid-bundle-ledger">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">
            Recent Transactions
          </h3>

          {transactions.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-xs">
              No financial records. Secure deposits will appear listed here automatically.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {transactions.map((tx) => (
                <div key={tx.id} className="py-4 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-extrabold text-gray-900 block uppercase tracking-wide">
                      {tx.type === 'bid_bundle' ? 'Bid Topup (10 Bids)' : tx.type === 'urgent_boost' ? 'Urgent Promotion' : 'System Fee'}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono tracking-tighter mt-0.5 block">
                      Ref: {tx.reference}
                    </span>
                  </div>

                  <div className="text-right flex flex-col gap-1">
                    <span className="font-extrabold font-mono text-gray-900">
                      ₦{tx.amount?.toLocaleString()}
                    </span>
                    <span className="text-[9px] font-bold text-emerald-600 uppercase">
                      ● Complete
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
