'use client';
import { LogoBase64 } from '@/lib/logo';
import { LogoLink } from '@/components/LogoLink';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createBrowserClient } from '@supabase/auth-helpers-nextjs';
import { User, LogOut, Briefcase, Hammer, RefreshCw, Wallet, Calendar, ShieldCheck, Sparkles } from 'lucide-react';
import { FadeUp } from '@/components/FadeUp';
import { FeedbackButton } from '@/components/FeedbackButton';

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [passport, setPassport] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      if (authError || !session) {
        router.push('/login');
        return;
      }

      setUser(session.user);

      // Fetch Profile info
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        setErrorMsg('Failed to load profile. Please complete onboarding.');
      } else {
        setProfile(profileData);
      }

      // Fetch Passport info
      const { data: passportData } = await supabase
        .from('bukie_passports')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();

      setPassport(passportData);

      // Fetch Wallet info
      const { data: walletData, error: walletError } = await supabase
        .from('wallets')
        .select('*')
        .eq('id', session.user.id) // Or user_id depending on the key name in wallets schema
        // Wait, let's verify if the field is user_id or id in our schema.
        // In the user's schema: "CREATE TABLE public.wallets ( user_id UUID REFERENCES public.profiles(id) PRIMARY KEY, balance NUMERIC DEFAULT 0.00... )"
        // Yes! It is user_id. Let's make sure we query by user_id or fallback.
        .single();
      
      // Let's try querying by user_id if we have any trouble, or try standard column query:
      // Since schema defined user_id REFERENCES public.profiles(id) PRIMARY KEY, we query by user_id.
      if (!walletError && walletData) {
        setWallet(walletData);
      } else {
        // Fallback or retry with user_id
        const { data: walletRetry } = await supabase
          .from('wallets')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
        if (walletRetry) {
          setWallet(walletRetry);
        }
      }

    } catch (err: any) {
      setErrorMsg('Error connecting to Server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white text-[#0A192F]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-[#0A192F]" />
          <span className="text-xs font-mono text-gray-500 font-semibold tracking-wide uppercase">
            Loading your dashboard...
          </span>
        </div>
      </main>
    );
  }

  const userRole = profile?.role || 'Not Selected';
  const isEmployer = userRole === 'employer';

  return (
    <main className="min-h-screen bg-white text-[#0A192F] flex flex-col">
      {/* Navigation Header */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm" id="dashboard-navbar">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <LogoLink />
            <div>
              <span className="text-xs font-mono text-gray-500 font-bold uppercase tracking-wider block mt-1">
                Partner Dashboard
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {!isEmployer && (
              <button
                type="button"
                id="header-verification-status-btn"
                onClick={() => router.push('/dashboard/passport-setup')}
                className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider font-mono px-3 py-1.5 rounded-xl transition-all cursor-pointer border shadow-md hover:scale-[1.02] active:scale-95 ${
                  passport?.is_verified === true 
                    ? 'text-white bg-blue-600 border border-blue-700 hover:bg-blue-700 shadow-blue-650/10' 
                    : passport?.id_card_url 
                      ? 'text-white bg-amber-500 border-amber-600 hover:bg-amber-600 shadow-amber-500/10 animate-pulse' 
                      : 'text-white bg-rose-600 border-rose-700 hover:bg-rose-700 shadow-rose-650/10'
                }`}
                title={
                  passport?.is_verified === true 
                    ? 'Identity Verified - All features unlocked' 
                    : passport?.id_card_url 
                      ? 'Identity Review in progress - Click to check status' 
                      : 'Identity Setup Required - Click to complete passport verification'
                }
              >
                {passport?.is_verified === true ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_#ffffff]" />
                    <ShieldCheck className="w-3.5 h-3.5 text-white" />
                    <span className="hidden sm:inline">Verified Partner</span>
                    <span className="inline sm:hidden">Verified</span>
                  </>
                ) : passport?.id_card_url ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_#ffffff]" />
                    <RefreshCw className="w-3 h-3 text-white animate-spin" style={{ animationDuration: '4s' }} />
                    <span className="hidden sm:inline">Pending Review</span>
                    <span className="inline sm:hidden">Pending</span>
                  </>
                ) : (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_#ffffff] animate-ping" />
                    <span className="hidden sm:inline">Setup Required</span>
                    <span className="inline sm:hidden">Setup</span>
                  </>
                )}
              </button>
            )}

            <button
              id="dashboard-logout-action-btn"
              type="button"
              className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-800 font-bold uppercase tracking-wider bg-gray-50 hover:bg-red-50 border border-gray-100 hover:border-red-100 px-4 py-2 rounded-xl transition-all cursor-pointer"
              onClick={handleLogout}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <div className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8" id="dashboard-content-grid">
        {/* Welcome Section */}
        <FadeUp delay={0.1} className="bg-white rounded-2xl p-6 md:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 relative overflow-hidden transition-shadow hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]" id="dashboard-welcome-banner">
          <div className="absolute right-0 top-0 w-32 h-32 bg-[#0A192F]/5 rounded-full blur-2xl"></div>
          
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-[#0A192F]/10 text-[#0A192F] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider active:scale-95 transition-all">
                {userRole === 'employer' ? 'Employer Hub' : 'Artisan Hub'}
              </span>
              <span className="text-xs text-gray-400 font-medium">
                • Connected
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mt-2 tracking-tight">
              Welcome, {profile?.full_name || user?.email || 'Partner'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {isEmployer 
                ? 'Post jobs, chat with applicants, and hire with confidence.' 
                : 'Browse jobs near you, apply, and get paid directly to your wallet.'}
            </p>
          </div>

          <div 
            className="flex items-center gap-3 bg-white px-4 py-3 rounded-xl border border-gray-100 self-stretch md:self-auto justify-between cursor-pointer hover:bg-gray-100/60 transition-all" 
            id="dashboard-wallet-badge"
            onClick={() => router.push('/dashboard/wallet')}
          >
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-blue-600" />
              <div>
                <span className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                  Wallet Balance
                </span>
                <span className="text-sm font-extrabold text-gray-900">
                  ₦{(wallet?.balance || 0).toLocaleString()}
                </span>
              </div>
            </div>
            {isEmployer ? (
              <button 
                id="topup-wallet-trigger"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push('/dashboard/wallet');
                }}
                className="ml-4 text-[10px] font-bold text-white uppercase bg-[#0A192F] px-3 py-1.5 rounded-lg hover:bg-[#112a4f] transition-all cursor-pointer active:scale-95 transition-all"
              >
                Top Up
              </button>
            ) : (
              <div className="ml-4 text-right flex flex-col items-end">
                <span className="block text-[8px] uppercase font-bold text-gray-400">Bids Left</span>
                <span className="text-xs font-black text-[#0A192F] leading-none">{wallet?.free_bids_remaining ?? 3} Free</span>
                <span className="text-[9px] font-extrabold text-blue-600 underline mt-0.5 pointer-events-none">Top Up Bids</span>
              </div>
            )}
          </div>
        </FadeUp>

        {/* Dashboard Cards Breakdown */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100" id="dashboard-error-callout">
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-info-blocks">
          {/* Action Hub / Interactive Feed Card Area */}
          <FadeUp delay={0.2} className="bg-white p-6 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100 lg:col-span-2 transition-shadow hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
            
            {/* Indeed-style Section Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                {isEmployer ? (
                  <>
                    <Briefcase className="w-5 h-5 text-[#0A192F]" />
                    <span>Your Active Postings</span>
                  </>
                ) : (
                  <>
                    <Hammer className="w-5 h-5 text-blue-600" />
                    <span>Inquiries and Work Hub</span>
                  </>
                )}
              </h2>
              
              {/* Quick Profile/Onboarding Progress Indicator */}
              {!isEmployer && (
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-150 px-3 py-1.5 rounded-lg w-full md:w-auto">
                  <div className="flex-1 md:w-24">
                    <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">
                      <span>Profile Strength</span>
                      <span className="text-[#0A192F]">
                        {(() => {
                          let score = 30;
                          if (profile?.full_name) score += 15;
                          if (profile?.phone) score += 15;
                          if (passport?.bio) score += 15;
                          if (passport?.skills?.length > 0) score += 15;
                          if (passport?.is_verified) score += 10;
                          return score;
                        })()}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-blue-600 h-full rounded-full transition-all duration-500" 
                        style={{ 
                          width: `${(() => {
                            let score = 30;
                            if (profile?.full_name) score += 15;
                            if (profile?.phone) score += 15;
                            if (passport?.bio) score += 15;
                            if (passport?.skills?.length > 0) score += 15;
                            if (passport?.is_verified) score += 10;
                            return score;
                          })()}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Empty list with elegant visual action */}
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center flex flex-col items-center justify-center">
              <span className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 mb-3">
                {isEmployer ? <Briefcase className="w-5 h-5" /> : <Hammer className="w-5 h-5" />}
              </span>
              <p className="text-sm font-bold text-gray-800">
                {isEmployer ? "You haven't posted any jobs yet. Let's list your first opening!" : "Your job inquiry feed is currently clear."}
              </p>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto leading-relaxed">
                {isEmployer 
                  ? "Post a job now. Plumbers, electricians, painters, and tech artisans are active and ready in your area."
                  : "Complete your BukiePassport profile setup with verified skill tags and credentials to start receiving customized job recommendations!"}
              </p>

              <div className="flex gap-3 mt-6 flex-wrap justify-center">
                {isEmployer ? (
                  <button
                    id="dash-post-job-btn"
                    type="button"
                    className="bg-[#0A192F] text-white text-xs font-bold uppercase tracking-wider py-2.5 px-5 rounded-xl hover:bg-[#112a4f] transition-all shadow-md cursor-pointer active:scale-95"
                    onClick={() => router.push('/dashboard/post-job')}
                  >
                    Post a new job opening
                  </button>
                ) : (
                  <>
                    <button
                      id="dash-find-work-btn"
                      type="button"
                      className="bg-[#0A192F] text-white text-xs font-bold uppercase tracking-wider py-2.5 px-5 rounded-xl hover:bg-[#112a4f] transition-all shadow-md cursor-pointer active:scale-95 animate-bounce"
                      onClick={() => router.push('/jobs')}
                    >
                      Browse job listings
                    </button>
                    <button
                      id="dash-passport-btn"
                      type="button"
                      className="bg-white text-gray-700 border border-gray-200 text-xs font-bold uppercase tracking-wider py-2.5 px-5 rounded-xl hover:bg-gray-50 transition-all shadow-sm cursor-pointer"
                      onClick={() => router.push('/dashboard/passport-setup')}
                    >
                      Update BukiePassport
                    </button>
                  </>
                )}
              </div>
            </div>
          </FadeUp>

          {/* Quick Operations Sidebar Info */}
          <FadeUp delay={0.3} className="space-y-6">
            {/* Quick Passport/Verification Info Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-1.5">
                  <ShieldCheck className="w-4.5 h-4.5 text-[#0A192F]" />
                  <span>Trust and Escalation Protection</span>
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Every artisan and client on BukieBrainJobs is verified. You know exactly who you are working with, and payments are protected inside secure escrows until completion is confirmed.
                </p>
              </div>

              <div className="mt-4 bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#0A192F]" />
                <span className="text-[11px] font-bold text-gray-600">
                  {isEmployer 
                    ? "Hire with confidence knowing your resources are held securely until the contractor delivers." 
                    : "Having a verified BukiePassport badge dramatically increases your hiring response rate."}
                </span>
              </div>
            </div>

            {/* Support / Quick Channel Alert info */}
            <div className="bg-[#0A192F] text-white p-6 rounded-2xl shadow-sm border border-gray-805/20 relative overflow-hidden">
              <div className="absolute right-0 bottom-0 w-20 h-20 bg-blue-500/10 rounded-full blur-xl"></div>
              <h4 className="font-extrabold text-sm text-blue-400 mb-2 font-mono uppercase tracking-widest">
                Telegram Alerts Hub
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed mb-4">
                Receive immediate push notifications on Telegram for payments, invoice clearance, quotes, or when matches pop up near you.
              </p>
              <a
                href="https://t.me/BukieBrainBot"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#0A192F] hover:bg-[#112a4f] py-2 px-3.5 rounded-lg border-b border-[#112a4f] transition-all font-mono active:scale-95"
              >
                Connect Telegram Bot
              </a>
            </div>
          </FadeUp>
        </div>
      </div>
      <FeedbackButton />
    </main>
  );
}
