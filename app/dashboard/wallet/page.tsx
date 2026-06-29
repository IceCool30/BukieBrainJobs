'use client';
import { LogoBase64 } from '@/lib/logo';
import { LogoLink } from '@/components/LogoLink';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
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
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase-client';
import { buyBidsAction } from '@/app/actions';
import dynamic from 'next/dynamic';
import { FadeUp } from '@/components/FadeUp';


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
  const supabase = getSupabaseBrowserClient();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [userEmail, setUserEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const [showFundModal, setShowFundModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [fundAmount, setFundAmount] = useState('5000');
  const [withdrawAmount, setWithdrawAmount] = useState('5000');
  const [bankName, setBankName] = useState('Access Bank');
  const [accountNum, setAccountNum] = useState('');

  const fetchWalletDetails = async () => {
    setLoading(true);
    if (!isSupabaseConfigured()) {
      setUserEmail('preview-user@example.com');
      setProfile({ id: 'mock-user-id', full_name: 'Solomon Ogar', role: 'worker', location_state: 'Lagos', location_lga: 'Ikeja' });
      setWallet({ balance: 15000, bid_credits: 10 });
      setTransactions([
        {
          id: 'tx-1',
          reference: 'tx-mock-123456',
          amount: 5000,
          type: 'deposit',
          status: 'success',
          created_at: new Date().toISOString()
        }
      ]);
      setLoading(false);
      return;
    }
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
        .eq('profile_id', session.user.id)
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
        .eq('profile_id', session.user.id)
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
  }, []);

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
      <main className="flex min-h-screen items-center justify-center bg-brand-bg text-brand-navy">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-brand-green" />
          <span className="text-xs font-mono text-brand-navy/60 font-semibold tracking-wide uppercase">
            Opening your fintech portal...
          </span>
        </div>
      </main>
    );
  }

  const freeBids = wallet?.free_bids_remaining ?? 3;

  return (
    <main className="min-h-screen bg-brand-bg text-brand-navy flex flex-col font-sans">
      {/* Navbar area */}
      <nav className="bg-brand-surface border-b border-brand-border/60 sticky top-0 z-40 shadow-xs" id="wallet-navbar">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-1.5 text-xs text-brand-navy/60 hover:text-brand-navy font-bold uppercase tracking-wider bg-brand-bg hover:bg-brand-surface px-3 py-2 rounded-xl transition-all border border-brand-border/60 cursor-pointer"
              id="wallet-back-btn"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <div className="h-4 w-[1px] bg-brand-border/60"></div>
            <LogoLink />
            <div>
              <span className="text-[9px] font-mono text-brand-navy/60 font-bold uppercase tracking-wider block mt-1">
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
          <div className="p-4 bg-brand-green/10 text-brand-green border border-brand-green/30 rounded-xl flex gap-3 text-sm font-medium animate-fadeIn">
            <ShieldCheck className="w-5 h-5 shrink-0 text-brand-green" />
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
        <FadeUp delay={0.1} className="grid grid-cols-1 md:grid-cols-3 gap-6" id="wallet-financials-hud">
          {/* Withdrawable Balance Card */}
          <div className="bg-brand-green text-white rounded-2xl p-6 relative overflow-hidden shadow-xs flex flex-col justify-between h-44 border border-brand-green/20">
            <div className="absolute right-0 top-0 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase tracking-widest font-bold text-white/80 font-mono">
                Withdrawable Balance
              </span>
              <Wallet className="w-5 h-5 text-white/80" />
            </div>
            <div>
              <span className="block text-3xl font-black tracking-tight font-mono">
                ₦{(wallet?.balance ?? 0).toLocaleString()}
              </span>
              <span className="text-[10px] text-white/60 mt-1 block">
                Funds available for immediate payout
              </span>
            </div>
          </div>

          {/* Protected Funds Card */}
          <div className="bg-brand-surface text-brand-navy rounded-2xl p-6 relative overflow-hidden border border-brand-border/60 shadow-xs flex flex-col justify-between h-44">
            <div className="absolute right-0 top-0 w-24 h-24 bg-brand-green/5 rounded-full blur-xl"></div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase tracking-widest font-bold text-brand-navy/60 font-mono">
                Protected Funds
              </span>
              <ShieldCheck className="w-5 h-5 text-brand-green" />
            </div>
            <div>
              <span className="block text-3xl font-black tracking-tight text-brand-navy font-mono">
                ₦0.00
              </span>
              <span className="text-[10px] text-brand-navy/40 mt-1 block">
                Secured on active milestone contracts
              </span>
            </div>
          </div>

          {/* Bid Capacity Card */}
          <div className="bg-brand-surface text-brand-navy rounded-2xl p-6 relative overflow-hidden border border-brand-border/60 shadow-xs flex flex-col justify-between h-44">
            <div className="absolute right-0 top-0 w-24 h-24 bg-brand-navy/5 rounded-full blur-xl"></div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase tracking-widest font-bold text-brand-navy/60 font-mono">
                Bid Capacity
              </span>
              <Coins className="w-5 h-5 text-brand-green" />
            </div>
            <div>
              <span className="block text-3xl font-black tracking-tight text-brand-navy font-mono">
                {freeBids}
              </span>
              <span className="text-[10px] text-brand-navy/40 mt-1 block">
                Proposals left for custom client pitching
              </span>
            </div>
          </div>
        </FadeUp>

        {/* Quick Actions Console */}
        <FadeUp delay={0.15} className="bg-brand-surface rounded-2xl p-6 sm:p-8 border border-brand-border/60 shadow-xs" id="wallet-quick-actions">
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-brand-navy tracking-tight font-display">
                Fintech Operations
              </h2>
              <p className="text-xs text-brand-navy/60 mt-1">
                Fund your secure protected balance, initiate withdraws to local commercial bank accounts, or execute prompt milestone payouts.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Fund Wallet Button */}
              <button 
                onClick={() => setShowFundModal(true)}
                className="bg-brand-green hover:bg-brand-green/90 text-white text-xs font-bold uppercase tracking-wider py-3.5 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer font-display"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Fund Wallet (Paystack)</span>
              </button>

              {/* Withdraw Funds Button */}
              <button 
                onClick={() => setShowWithdrawModal(true)}
                className="bg-brand-green hover:bg-brand-green/90 text-white text-xs font-bold uppercase tracking-wider py-3.5 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer font-display"
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Withdraw Funds</span>
              </button>

              {/* Release Protected Funds Button */}
              <button 
                onClick={() => {
                  setErrorMsg('');
                  setSuccessMsg('Milestone protection system is active. Navigate to your active chat thread to trigger specific job milestone releases.');
                }}
                className="bg-brand-green hover:bg-brand-green/90 text-white text-xs font-bold uppercase tracking-wider py-3.5 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer font-display"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Release Protected Funds</span>
              </button>
            </div>
          </div>
        </FadeUp>

        {/* Buy Bids CTA */}
        <FadeUp delay={0.2} className="bg-brand-bg rounded-2xl p-6 sm:p-8 border border-brand-border/60 shadow-xs" id="bid-bundle-actions">
          <div className="max-w-md mx-auto text-center space-y-6">
            <div className="inline-flex p-3 bg-brand-surface rounded-full border border-brand-border/60 text-brand-green mb-2 leading-none">
              <Sparkles className="w-6 h-6 stroke-2 text-brand-green" />
            </div>
            
            <div>
              <h2 className="text-lg font-bold text-brand-navy tracking-tight font-display">
                Top Up Bids
              </h2>
              <p className="text-xs text-brand-navy/60 mt-1 leading-relaxed">
                Connect with local employers and secure jobs today. Buy premium bid bundles to propose tailored rates directly on incoming job requests.
              </p>
            </div>

            {/* Standard Bundle Card */}
            <div className="bg-brand-surface rounded-xl p-6 border border-brand-border/60 text-left space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-extrabold text-sm text-brand-navy font-display">
                    Standard Bundle
                  </h3>
                  <p className="text-xs text-brand-navy/60 mt-0.5">
                    Get 10 Job Bids
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-brand-navy font-mono">
                    ₦500
                  </span>
                  <span className="block text-[8px] text-brand-navy/40 uppercase font-black font-mono">
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
                  profile_id: profile?.id
                }}
                id="topup-bids-trigger"
              />
            </div>
          </div>
        </FadeUp>

        {/* Secure Warning badge */}
        <FadeUp delay={0.3} className="bg-brand-surface border border-brand-border/60 p-4 rounded-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-brand-green shrink-0" />
            <div className="text-xs text-brand-navy/80 leading-normal">
              System uses secure CBN-regulated payment routing through Paystack, keeping credentials safe.
            </div>
          </div>
        </FadeUp>

        {/* Transactions ledger history table */}
        <FadeUp delay={0.4} className="bg-brand-bg rounded-2xl p-6 border border-brand-border/60 shadow-xs" id="bid-bundle-ledger">
          <h3 className="text-xs font-bold uppercase tracking-wider text-brand-navy/50 mb-4 font-display">
            Recent Transactions
          </h3>

          {transactions.length === 0 ? (
            <div className="text-center py-10 text-brand-navy/40 text-xs">
              No financial records. Secure deposits will appear listed here automatically.
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div key={tx.id} className="p-4 bg-brand-surface rounded-xl border border-brand-border/40 flex justify-between items-center text-xs shadow-2xs">
                  <div>
                    <span className="font-extrabold text-brand-navy block uppercase tracking-wide font-display">
                      {tx.type === 'bid_bundle' ? 'Bid Topup (10 Bids)' : tx.type === 'deposit' ? 'Wallet Deposit' : tx.type === 'withdrawal' ? 'Balance Payout' : tx.type === 'urgent_boost' ? 'Urgent Promotion' : 'System Fee'}
                    </span>
                    <span className="text-[10px] text-brand-navy/45 font-mono tracking-tighter mt-0.5 block">
                      Ref: {tx.reference}
                    </span>
                  </div>

                  <div className="text-right flex flex-col gap-1">
                    <span className={`font-black font-mono text-xs ${tx.amount < 0 ? 'text-red-600' : 'text-brand-green'}`}>
                      {tx.amount < 0 ? '-' : '+'}₦{Math.abs(tx.amount)?.toLocaleString()}
                    </span>
                    <span className="text-[9px] font-bold text-brand-green uppercase">
                      ● Complete
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </FadeUp>

        {/* Fund Wallet Modal */}
        {showFundModal && (
          <div className="fixed inset-0 bg-brand-navy/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-brand-bg rounded-2xl border border-brand-border p-6 max-w-md w-full space-y-6 shadow-xl"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-brand-navy font-display">Fund Protected Wallet</h3>
                <button onClick={() => setShowFundModal(false)} className="text-brand-navy/40 hover:text-brand-navy font-bold text-sm cursor-pointer">✕</button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-brand-navy/60 mb-1.5 font-display">Amount to Fund (₦)</label>
                  <input 
                    type="number" 
                    value={fundAmount} 
                    onChange={(e) => setFundAmount(e.target.value)}
                    className="w-full bg-brand-surface border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-navy font-mono outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
                  />
                </div>

                <PaystackButton
                  amount={Number(fundAmount) || 5000}
                  email={userEmail}
                  text={`Authorize Funding - ₦${Number(fundAmount || 0).toLocaleString()}`}
                  onSuccess={async (response) => {
                    setShowFundModal(false);
                    setIsProcessing(true);
                    if (isSupabaseConfigured()) {
                      try {
                        const { data: { session } } = await supabase.auth.getSession();
                        if (session) {
                          await supabase.from('transactions').insert({
                            profile_id: session.user.id,
                            reference: response.reference,
                            amount: Number(fundAmount),
                            type: 'deposit',
                            status: 'success'
                          });
                          const currentBal = wallet?.balance ?? 0;
                          await supabase.from('wallets').update({
                            balance: currentBal + Number(fundAmount)
                          }).eq('profile_id', session.user.id);
                        }
                      } catch (e) {
                        console.error(e);
                      }
                    } else {
                      setWallet((prev: any) => ({ ...prev, balance: (prev?.balance ?? 0) + Number(fundAmount) }));
                      setTransactions(prev => [
                        {
                          id: `tx-${Date.now()}`,
                          reference: response.reference,
                          amount: Number(fundAmount),
                          type: 'deposit',
                          status: 'success',
                          created_at: new Date().toISOString()
                        },
                        ...prev
                      ]);
                    }
                    setSuccessMsg(`Successfully funded ₦${Number(fundAmount).toLocaleString()} via Paystack!`);
                    await fetchWalletDetails();
                    setIsProcessing(false);
                  }}
                  metadata={{
                    type: 'wallet_funding',
                    profile_id: profile?.id
                  }}
                  id="wallet-funding-trigger"
                />
              </div>
            </motion.div>
          </div>
        )}

        {/* Withdraw Funds Modal */}
        {showWithdrawModal && (
          <div className="fixed inset-0 bg-brand-navy/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-brand-bg rounded-2xl border border-brand-border p-6 max-w-md w-full space-y-6 shadow-xl"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-brand-navy font-display">Withdraw Balances</h3>
                <button onClick={() => setShowWithdrawModal(false)} className="text-brand-navy/40 hover:text-brand-navy font-bold text-sm cursor-pointer">✕</button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-brand-navy/60 mb-1.5 font-display">Commercial Bank</label>
                  <select 
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full bg-brand-surface border border-brand-border rounded-xl px-4 py-3 text-xs text-brand-navy outline-none focus:ring-2 focus:ring-brand-green"
                  >
                    <option>Access Bank</option>
                    <option>GTBank</option>
                    <option>Zenith Bank</option>
                    <option>UBA</option>
                    <option>Fidelity Bank</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-brand-navy/60 mb-1.5 font-display">Account Number</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 0123456789"
                    value={accountNum}
                    onChange={(e) => setAccountNum(e.target.value)}
                    className="w-full bg-brand-surface border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-navy font-mono outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-brand-navy/60 mb-1.5 font-display">Withdrawal Amount (₦)</label>
                  <input 
                    type="number" 
                    value={withdrawAmount} 
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full bg-brand-surface border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-navy font-mono outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
                  />
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    const amt = Number(withdrawAmount);
                    const currentBal = wallet?.balance ?? 0;
                    if (amt > currentBal) {
                      setErrorMsg('Insufficient balances to complete this transaction.');
                      setShowWithdrawModal(false);
                      return;
                    }
                    if (!accountNum || accountNum.length < 10) {
                      setErrorMsg('Please specify a valid 10-digit NUBAN account number.');
                      setShowWithdrawModal(false);
                      return;
                    }

                    setShowWithdrawModal(false);
                    setIsProcessing(true);

                    if (isSupabaseConfigured()) {
                      try {
                        const { data: { session } } = await supabase.auth.getSession();
                        if (session) {
                          await supabase.from('transactions').insert({
                            profile_id: session.user.id,
                            reference: `wd-${Date.now()}`,
                            amount: -amt,
                            type: 'withdrawal',
                            status: 'success'
                          });
                          await supabase.from('wallets').update({
                            balance: currentBal - amt
                          }).eq('profile_id', session.user.id);
                        }
                      } catch (e) {
                        console.error(e);
                      }
                    } else {
                      setWallet((prev: any) => ({ ...prev, balance: (prev?.balance ?? 0) - amt }));
                      setTransactions(prev => [
                        {
                          id: `tx-${Date.now()}`,
                          reference: `wd-${Date.now()}`,
                          amount: -amt,
                          type: 'withdrawal',
                          status: 'success',
                          created_at: new Date().toISOString()
                        },
                        ...prev
                      ]);
                    }
                    setSuccessMsg(`Withdrawal of ₦${amt.toLocaleString()} to ${bankName} (${accountNum}) initiated successfully!`);
                    await fetchWalletDetails();
                    setIsProcessing(false);
                  }}
                  className="w-full bg-brand-green hover:bg-brand-green/90 text-white text-xs font-extrabold uppercase tracking-wider py-3.5 px-6 rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 font-display"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Execute Withdrawal</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}

      </div>
    </main>
  );
}
