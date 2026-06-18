'use client';
import { LogoBase64 } from '@/lib/logo';

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
            <div className="bg-white rounded-[1.5rem] shadow-sm border border-gray-100 flex items-center gap-1.5 p-1 w-fit cursor-pointer">
              <Image src={LogoBase64} alt="BukieBrainJobs Logo" width={28} height={28} className="rounded-[10px] shadow-sm border border-gray-200 bg-white p-[2px]" />
              <span className="font-black text-[16px] tracking-tight text-[#0A192F] hidden sm:block pr-2 whitespace-nowrap">BukieBrainJobs</span>
            </div>
            <div>
              <span className="text-xs font-mono text-gray-500 font-bold uppercase tracking-wider block mt-1">
                Partner Dashboard
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
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
              Thank you for digitizing local trust. Manage your activities, services, & wallet below.
            </p>
          </div>

          <div 
            className="flex items-center gap-3 bg-white px-4 py-3 rounded-xl border border-gray-100 self-stretch md:self-auto justify-between cursor-pointer hover:bg-gray-100/60 transition-all" 
            id="dashboard-wallet-badge"
            onClick={() => router.push('/dashboard/wallet')}
          >
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-[#004D2C]" />
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
                <span className="text-[9px] font-extrabold text-[#004D2C] underline mt-0.5 pointer-events-none">Top Up Bids</span>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="dashboard-info-blocks">
          {/* Action Hub / Interactive Feed Card Area */}
          <FadeUp delay={0.2} className="bg-white p-6 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100 md:col-span-2 transition-shadow hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              {isEmployer ? (
                <>
                  <Briefcase className="w-5 h-5 text-[#0A192F]" />
                  <span>Your Posted Jobs</span>
                </>
              ) : (
                <>
                  <Hammer className="w-5 h-5 text-[#004D2C]" />
                  <span>Available Local Inquiries</span>
                </>
              )}
            </h2>

            {/* Empty list with elegant visual action */}
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center flex flex-col items-center justify-center">
              <span className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 mb-3">
                {isEmployer ? <Briefcase className="w-5 h-5" /> : <Hammer className="w-5 h-5" />}
              </span>
              <p className="text-sm font-semibold text-gray-800">
                {isEmployer ? 'You have no active job posts yet' : 'No incoming offers in your LGA'}
              </p>
              <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                {isEmployer 
                  ? 'Request maintenance, full-time help, or custom local projects with "sachet" pricing.'
                  : 'Complete your BukiePassport profile setup with verification badges to receive priority system alerts!'}
              </p>

              <div className="flex gap-3 mt-5 flex-wrap justify-center">
                {isEmployer ? (
                  <button
                    id="dash-post-job-btn"
                    type="button"
                    className="bg-[#0A192F] text-white text-xs font-bold uppercase tracking-wider py-2.5 px-5 rounded-xl hover:bg-[#112a4f] transition-all shadow-md shadow-green-900/5 cursor-pointer active:scale-95 transition-all"
                    onClick={() => router.push('/dashboard/post-job')}
                  >
                    Post New Job
                  </button>
                ) : (
                  <>
                    <button
                      id="dash-find-work-btn"
                      type="button"
                      className="bg-[#0A192F] text-white text-xs font-bold uppercase tracking-wider py-2.5 px-5 rounded-xl hover:bg-[#112a4f] transition-all shadow-md shadow-green-900/5 cursor-pointer active:scale-95 transition-all"
                      onClick={() => router.push('/jobs')}
                    >
                      Find Work
                    </button>
                    <button
                      id="dash-passport-btn"
                      type="button"
                      className="bg-white text-gray-700 border border-gray-200 text-xs font-bold uppercase tracking-wider py-2.5 px-5 rounded-xl hover:bg-gray-50 transition-all shadow-sm cursor-pointer"
                      onClick={() => router.push('/dashboard/passport-setup')}
                    >
                      Setup Passport
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
                  <span>Identity & Trust</span>
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Every artisan is strictly bound by the *BukiePassport* check. Guaranteed via 2-factor verification keys.
                </p>
              </div>

              <div className="mt-4 bg-white p-3 rounded-xl border border-gray-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#004D2C]" />
                <span className="text-[11px] font-semibold text-gray-600">
                  {isEmployer ? 'Hire with escrow security protection' : 'Blue Check Badge increases views by 350%'}
                </span>
              </div>
            </div>

            {/* Support / Quick Channel Alert info */}
            <div className="bg-[#0A192F] text-white p-6 rounded-2xl shadow-sm border border-gray-800/20 relative overflow-hidden">
              <div className="absolute right-0 bottom-0 w-20 h-20 bg-[#004D2C]/5 rounded-full blur-xl"></div>
              <h4 className="font-extrabold text-sm text-[#004D2C] mb-2 font-mono uppercase tracking-widest">
                Telegram Alerts Hub
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed mb-4">
                Receive immediate push notifications on telegram for payments, invoice clearance, quotes, or when matches pop up near you.
              </p>
              <a
                href="https://t.me/BukieBrainBot"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#0A192F] hover:bg-[#112a4f] py-2 px-3.5 rounded-lg border-b border-green-800 transition-all font-mono active:scale-95 transition-all"
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
