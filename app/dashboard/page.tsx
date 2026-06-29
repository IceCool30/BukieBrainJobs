'use client';

import { LogoLink } from '@/components/LogoLink';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase-client';
import { 
  User, 
  LogOut, 
  Briefcase, 
  Hammer, 
  RefreshCw, 
  Wallet, 
  ShieldCheck, 
  Sparkles, 
  MessageSquare, 
  MapPin, 
  Plus, 
  ArrowRight,
  Clock,
  ExternalLink,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { FadeUp } from '@/components/FadeUp';
import { FeedbackButton } from '@/components/FeedbackButton';

export default function DashboardPage() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [passport, setPassport] = useState<any>(null);
  const [employerJobs, setEmployerJobs] = useState<any[]>([]);
  const [incomingBids, setIncomingBids] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchUserData = async () => {
    setLoading(true);
    if (!isSupabaseConfigured()) {
      // Provide mock user/profile/wallet/passport so the preview works seamlessly
      setUser({ id: 'mock-user-id', email: 'solomonogarbukie@gmail.com' });
      setProfile({ id: 'mock-user-id', full_name: 'Solomon Ogar', role: 'employer', location_state: 'Lagos', location_lga: 'Ikeja' });
      setWallet({ balance: 150000, free_bids_remaining: 3 });
      setPassport({
        id: 'mock-passport-id',
        skills: ['Plumbing', 'Electrical Wiring', 'Inverter Installation'],
        years_experience: 5,
        bio: 'Professional certified local service provider specializing in domestic and commercial electrical services.',
        is_verified: true,
        verification_grade: 'A',
        nin_verified: true,
        face_verified: true
      });
      setEmployerJobs([
        { id: 'job-1', title: 'Emergency kitchen piping and leak repair', stage: 'open', budget: 25000, bids: [{ count: 2 }], created_at: new Date().toISOString() },
        { id: 'job-2', title: 'Need certified solar inverter installation engineer', stage: 'in_progress', budget: 85000, bids: [{ count: 1 }], created_at: new Date().toISOString() }
      ]);
      setIncomingBids([
        {
          id: 'bid-1',
          job_id: 'job-1',
          proposed_budget: 22000,
          cover_letter: 'Hello Solomon, I am an experienced plumber with 6+ years working in Ikeja. I can start immediately with my own professional tools and source high-quality leakproof piping.',
          status: 'pending',
          created_at: new Date().toISOString(),
          job: { title: 'Emergency kitchen piping and leak repair' },
          profile: { full_name: 'Musa Ibrahim', location_state: 'Lagos', location_lga: 'Ikeja' }
        },
        {
          id: 'bid-2',
          job_id: 'job-1',
          proposed_budget: 25000,
          cover_letter: 'Certified plumber here. I will inspect, trace the source of the leak, and repair everything under 3 hours. Let’s connect to finalize the terms.',
          status: 'pending',
          created_at: new Date().toISOString(),
          job: { title: 'Emergency kitchen piping and leak repair' },
          profile: { full_name: 'Chinedu Okafor', location_state: 'Lagos', location_lga: 'Surulere' }
        }
      ]);
      setLoading(false);
      return;
    }
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
        
        if (profileData.role === 'employer') {
          const { data: jobsData } = await supabase
            .from('jobs')
            .select('*, bids(count)')
            .eq('employer_id', session.user.id)
            .order('created_at', { ascending: false });
            
          if (jobsData) {
            setEmployerJobs(jobsData);

            // Fetch actual incoming bids for these jobs
            const jobIds = jobsData.map((j: any) => j.id);
            if (jobIds.length > 0) {
              const { data: bidsData } = await supabase
                .from('bids')
                .select('*, job:jobs(title), profile:profiles(full_name, location_state, location_lga)')
                .in('job_id', jobIds)
                .order('created_at', { ascending: false });
              
              if (bidsData) {
                setIncomingBids(bidsData);
              }
            }
          }
        }
      }

      // Fetch Passport info
      const { data: passportData } = await supabase
        .from('bukie_passports')
        .select('*')
        .eq('profile_id', session.user.id)
        .maybeSingle();

      setPassport(passportData);

      // Fetch Wallet info
      const { data: walletData, error: walletError } = await supabase
        .from('wallets')
        .select('*')
        .eq('profile_id', session.user.id)
        .single();
      
      if (!walletError && walletData) {
        setWallet(walletData);
      } else {
        // Fallback or retry with ID depending on DB schema setup
        const { data: walletRetry } = await supabase
          .from('wallets')
          .select('*')
          .eq('id', session.user.id)
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
  }, [router]);

  const handleLogout = async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    router.push('/login');
  };

  // Helper toggle to simulate Employer vs Artisan dashboard in Offline Preview Mode
  const toggleMockRole = () => {
    if (profile) {
      const newRole = profile.role === 'employer' ? 'worker' : 'employer';
      setProfile({
        ...profile,
        role: newRole,
        full_name: newRole === 'employer' ? 'Solomon Ogar (Employer)' : 'Solomon Ogar (Artisan)'
      });
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-brand-bg text-brand-navy">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-brand-green" />
          <span className="text-xs font-mono text-brand-navy/50 font-bold tracking-wider uppercase">
            Loading your dashboard...
          </span>
        </div>
      </main>
    );
  }

  const userRole = profile?.role || 'Not Selected';
  const isEmployer = userRole === 'employer';

  // Employer Overview Metrics Calculation
  const activeJobsCount = employerJobs.filter((j: any) => j.stage === 'open' || j.stage === 'in_progress').length;
  const totalBidsCount = employerJobs.reduce((acc: number, job: any) => acc + (job.bids?.[0]?.count || 0), 0);
  const protectedFundsLocked = employerJobs.filter((j: any) => j.stage === 'in_progress').reduce((acc: number, job: any) => acc + (job.budget || 0), 0);

  return (
    <main className="min-h-screen bg-brand-bg text-brand-navy flex flex-col font-sans">
      
      {/* Navigation Header */}
      <nav className="bg-brand-bg border-b border-brand-border/40 sticky top-0 z-40 shadow-sm" id="dashboard-navbar">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <LogoLink />
            <span className="text-brand-border/60">•</span>
            <div>
              <span className="text-[10px] font-mono text-brand-navy/40 font-bold uppercase tracking-wider block mt-0.5">
                {isEmployer ? 'Hire Talent' : 'Get Hired'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Mock role switcher for offline mode only */}
            {!isSupabaseConfigured() && (
              <button
                type="button"
                onClick={toggleMockRole}
                className="text-[10px] font-bold bg-brand-green/10 text-brand-green border border-brand-green/20 hover:bg-brand-green/15 px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                title="Click to toggle between Hire Talent and Get Hired views"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Switch to {isEmployer ? 'Get Hired' : 'Hire Talent'}</span>
              </button>
            )}

            {!isEmployer && (
              <button
                type="button"
                id="header-verification-status-btn"
                onClick={() => router.push('/dashboard/passport-setup')}
                className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider font-mono px-3 py-1.5 rounded-xl transition-all cursor-pointer border shadow-sm hover:scale-[1.02] active:scale-95 ${
                  passport?.is_verified === true 
                    ? 'text-white bg-brand-green border-brand-green/10 hover:bg-brand-green/90 shadow-brand-green/10' 
                    : passport?.id_card_url 
                      ? 'text-brand-navy bg-amber-50 border-amber-200 hover:bg-amber-100 shadow-amber-500/10 animate-pulse' 
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
                    <ShieldCheck className="w-3.5 h-3.5 text-white" />
                    <span>Verified Partner</span>
                  </>
                ) : passport?.id_card_url ? (
                  <>
                    <RefreshCw className="w-3 h-3 text-brand-navy animate-spin" style={{ animationDuration: '4s' }} />
                    <span>Pending Review</span>
                  </>
                ) : (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    <span>Setup Required</span>
                  </>
                )}
              </button>
            )}

            <button
              id="dashboard-logout-action-btn"
              type="button"
              className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 font-bold uppercase tracking-wider bg-brand-surface border border-brand-border/40 hover:bg-rose-50 hover:border-rose-100 px-4 py-2 rounded-xl transition-all cursor-pointer"
              onClick={handleLogout}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Log Out</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <div className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8" id="dashboard-content-grid">
        
        {/* Welcome Section */}
        <FadeUp delay={0.1} className="bg-brand-surface rounded-2xl p-6 md:p-8 border border-brand-border/40 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden shadow-sm" id="dashboard-welcome-banner">
          <div className="absolute right-0 top-0 w-32 h-32 bg-brand-green/5 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-brand-green/10 text-brand-green border border-brand-green/20 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                {isEmployer ? 'Hire Talent Hub' : 'Get Hired Hub'}
              </span>
              <span className="text-xs text-brand-navy/40 font-semibold">• Real-Time System Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-brand-navy tracking-tight">
              Welcome back, {profile?.full_name || user?.email?.split('@')[0] || 'Partner'}
            </h1>
            <p className="text-xs sm:text-sm text-brand-navy/60 font-medium max-w-xl">
              {isEmployer 
                ? 'Review competitive bids from blue-check artisans, lock Protected Funds, and approve milestone deliveries.' 
                : 'Browse verified opportunities, build your digital reputation, and withdraw earned payouts instantly.'}
            </p>
          </div>

          <div 
            className="flex items-center justify-between gap-4 bg-brand-bg border border-brand-border/40 p-4 rounded-xl self-stretch md:self-auto min-w-[260px] cursor-pointer hover:border-brand-border transition-all shadow-[0_2px_8px_rgba(10,25,47,0.01)]" 
            id="dashboard-wallet-badge"
            onClick={() => router.push('/dashboard/wallet')}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-green/10 flex items-center justify-center text-brand-green border border-brand-green/15">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-[9px] uppercase font-bold text-brand-navy/40 tracking-wider mb-0.5">
                  Wallet Balance
                </span>
                <span className="text-base font-extrabold text-brand-navy font-mono">
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
                className="text-[10px] font-bold text-white uppercase bg-brand-green hover:bg-brand-green/90 px-3 py-2 rounded-lg transition-all cursor-pointer shadow-sm active:scale-95"
              >
                Top Up
              </button>
            ) : (
              <div className="text-right flex flex-col items-end">
                <span className="block text-[8px] uppercase font-bold text-brand-navy/40">Free Bids</span>
                <span className="text-xs font-black text-brand-navy leading-none mt-0.5">{wallet?.free_bids_remaining ?? 3} Free</span>
                <span className="text-[9px] font-bold text-brand-green underline mt-1.5">Top Up Bids</span>
              </div>
            )}
          </div>
        </FadeUp>

        {/* Global Error Display */}
        {errorMsg && (
          <div className="p-4 bg-rose-50 text-rose-700 rounded-xl text-xs sm:text-sm border border-rose-100/50 flex items-center gap-2" id="dashboard-error-callout">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 2. Key Metric Cards: Group employer overview stats into distinct white cards */}
        <FadeUp delay={0.15}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="dashboard-metrics-grid">
            {isEmployer ? (
              <>
                {/* Metric 1: Active Jobs */}
                <div className="bg-brand-bg border border-brand-border/40 rounded-2xl p-5 shadow-[0_4px_16px_rgba(10,25,47,0.02)] hover:shadow-[0_6px_24px_rgba(10,25,47,0.04)] transition-all duration-200 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-brand-green/10 text-brand-green border border-brand-green/15 flex items-center justify-center shrink-0">
                    <Briefcase className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <span className="text-2xl font-bold font-display text-brand-navy leading-none tracking-tight block">
                      {activeJobsCount}
                    </span>
                    <span className="text-xs font-bold text-brand-navy/50 tracking-wide block mt-1 uppercase">
                      Active Jobs
                    </span>
                    <span className="text-[10px] text-brand-navy/40 font-medium block mt-0.5">
                      Open or in-progress listings
                    </span>
                  </div>
                </div>

                {/* Metric 2: Total Bids Received */}
                <div className="bg-brand-bg border border-brand-border/40 rounded-2xl p-5 shadow-[0_4px_16px_rgba(10,25,47,0.02)] hover:shadow-[0_6px_24px_rgba(10,25,47,0.04)] transition-all duration-200 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-brand-navy/5 text-brand-navy border border-brand-navy/10 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-5.5 h-5.5 text-brand-navy/70" />
                  </div>
                  <div>
                    <span className="text-2xl font-bold font-display text-brand-navy leading-none tracking-tight block">
                      {totalBidsCount}
                    </span>
                    <span className="text-xs font-bold text-brand-navy/50 tracking-wide block mt-1 uppercase">
                      Bids Received
                    </span>
                    <span className="text-[10px] text-brand-navy/40 font-medium block mt-0.5">
                      Artisan proposals submitted
                    </span>
                  </div>
                </div>

                {/* Metric 3: Protected Funds Locked */}
                <div className="bg-brand-bg border border-brand-border/40 rounded-2xl p-5 shadow-[0_4px_16px_rgba(10,25,47,0.02)] hover:shadow-[0_6px_24px_rgba(10,25,47,0.04)] transition-all duration-200 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-brand-green/10 text-brand-green border border-brand-green/15 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <span className="text-2xl font-bold font-display font-mono text-brand-green leading-none tracking-tight block">
                      ₦{protectedFundsLocked.toLocaleString()}
                    </span>
                    <span className="text-xs font-bold text-brand-navy/50 tracking-wide block mt-1 uppercase">
                      Protected Funds
                    </span>
                    <span className="text-[10px] text-brand-navy/40 font-medium block mt-0.5">
                      Funds fully secured
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Metric 1: Open Opportunities */}
                <div className="bg-brand-bg border border-brand-border/40 rounded-2xl p-5 shadow-[0_4px_16px_rgba(10,25,47,0.02)] hover:shadow-[0_6px_24px_rgba(10,25,47,0.04)] transition-all duration-200 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-brand-green/10 text-brand-green border border-brand-green/15 flex items-center justify-center shrink-0">
                    <Briefcase className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <span className="text-2xl font-bold font-display text-brand-navy leading-none tracking-tight block">
                      Direct Match
                    </span>
                    <span className="text-xs font-bold text-brand-navy/50 tracking-wide block mt-1 uppercase">
                      Open Opportunities
                    </span>
                    <span className="text-[10px] text-brand-navy/40 font-medium block mt-0.5">
                      Based on passport tags
                    </span>
                  </div>
                </div>

                {/* Metric 2: Free Bids */}
                <div className="bg-brand-bg border border-brand-border/40 rounded-2xl p-5 shadow-[0_4px_16px_rgba(10,25,47,0.02)] hover:shadow-[0_6px_24px_rgba(10,25,47,0.04)] transition-all duration-200 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-brand-navy/5 text-brand-navy border border-brand-navy/10 flex items-center justify-center shrink-0">
                    <Hammer className="w-5.5 h-5.5 text-brand-navy/70" />
                  </div>
                  <div>
                    <span className="text-2xl font-bold font-display text-brand-navy leading-none tracking-tight block">
                      {wallet?.free_bids_remaining ?? 3} Left
                    </span>
                    <span className="text-xs font-bold text-brand-navy/50 tracking-wide block mt-1 uppercase">
                      Free Bids Remaining
                    </span>
                    <span className="text-[10px] text-brand-navy/40 font-medium block mt-0.5">
                      Replenishes periodically
                    </span>
                  </div>
                </div>

                {/* Metric 3: Protected Balance */}
                <div className="bg-brand-bg border border-brand-border/40 rounded-2xl p-5 shadow-[0_4px_16px_rgba(10,25,47,0.02)] hover:shadow-[0_6px_24px_rgba(10,25,47,0.04)] transition-all duration-200 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-brand-green/10 text-brand-green border border-brand-green/15 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <span className="text-2xl font-bold font-display font-mono text-brand-green leading-none tracking-tight block">
                      ₦{(wallet?.balance || 0).toLocaleString()}
                    </span>
                    <span className="text-xs font-bold text-brand-navy/50 tracking-wide block mt-1 uppercase">
                      Protected Earnings
                    </span>
                    <span className="text-[10px] text-brand-navy/40 font-medium block mt-0.5">
                      Instantly withdrawable
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </FadeUp>

        {/* Dashboard Cards Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-info-blocks">
          
          {/* Action Hub / Interactive Feed Card Area */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Active Jobs postings component block */}
            <FadeUp delay={0.2} className="bg-brand-bg p-6 sm:p-8 rounded-2xl border border-brand-border/40 shadow-[0_4px_20px_rgba(10,25,47,0.02)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-brand-border/30">
                <h2 className="text-lg font-display font-bold text-brand-navy flex items-center gap-2">
                  {isEmployer ? (
                    <>
                      <Briefcase className="w-5 h-5 text-brand-green" />
                      <span>Your Active Postings</span>
                    </>
                  ) : (
                    <>
                      <Hammer className="w-5 h-5 text-brand-green" />
                      <span>Inquiries and Work Hub</span>
                    </>
                  )}
                </h2>

                {/* Onboarding progress bar for artisans only */}
                {!isEmployer && (
                  <div className="flex items-center gap-2 bg-brand-surface border border-brand-border/40 px-3 py-1.5 rounded-lg w-full sm:w-auto">
                    <div className="flex-1 sm:w-28">
                      <div className="flex justify-between text-[9px] font-bold text-brand-navy/50 uppercase tracking-wider mb-0.5">
                        <span>Profile Strength</span>
                        <span className="text-brand-green font-mono">
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
                      <div className="w-full bg-brand-border/50 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-brand-green h-full rounded-full transition-all duration-500" 
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

              {/* Active list or empty states */}
              {isEmployer && employerJobs.length > 0 ? (
                <div className="space-y-4">
                  {employerJobs.map(job => (
                    <div 
                      key={job.id} 
                      className="border border-brand-border/40 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:shadow-md transition-all bg-brand-surface/40 hover:bg-brand-surface/60"
                      id={`job-post-${job.id}`}
                    >
                      <div className="space-y-1.5">
                        <h3 className="font-display font-bold text-brand-navy text-sm sm:text-base leading-tight">
                          {job.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-lg border flex items-center ${
                            job.stage === 'open' 
                              ? 'bg-brand-green/10 text-brand-green border-brand-green/20' 
                              : job.stage === 'in_progress' 
                                ? 'bg-amber-500/10 text-amber-700 border-amber-500/20' 
                                : 'bg-brand-navy/5 text-brand-navy/60 border-brand-border/60'
                          }`}>
                            {job.stage ? job.stage.replace('_', ' ') : 'open'}
                          </span>
                          <span className="text-xs text-brand-navy/50 font-bold font-mono">
                            ₦{job.budget?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-brand-border/20 pt-3 sm:pt-0">
                        <div className="text-left sm:text-right">
                          <span className="block text-lg font-black text-brand-navy leading-none font-mono">
                            {job.bids?.[0]?.count || 0}
                          </span>
                          <span className="text-[9px] font-bold text-brand-navy/40 uppercase tracking-wider">
                            Bids Received
                          </span>
                        </div>
                        {/* Style Manage button using primary action token (bg-brand-green) */}
                        <button 
                          onClick={() => router.push(`/dashboard/chat/${job.id}`)}
                          className="bg-brand-green hover:bg-brand-green/90 text-white text-[11px] font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer flex items-center gap-1"
                        >
                          <span>Manage</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* 4. Call-to-Actions: Style critical buttons like "Post a New Job" using our primary action token */}
                  <button
                    onClick={() => router.push('/dashboard/post-job')}
                    className="w-full mt-4 bg-brand-green/5 border border-dashed border-brand-green/20 text-brand-green hover:bg-brand-green hover:text-white text-xs font-bold uppercase tracking-wider py-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Post a New Job</span>
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-brand-border/60 rounded-xl p-8 text-center flex flex-col items-center justify-center bg-brand-surface/20">
                  <div className="w-12 h-12 rounded-full bg-brand-bg border border-brand-border/40 flex items-center justify-center text-brand-navy/40 mb-4 shadow-sm">
                    {isEmployer ? <Briefcase className="w-5 h-5" /> : <Hammer className="w-5 h-5" />}
                  </div>
                  <p className="text-sm font-bold text-brand-navy">
                    {isEmployer ? "You haven't posted any jobs yet. Let's list your first opening!" : "Your job inquiry feed is currently clear."}
                  </p>
                  <p className="text-xs text-brand-navy/50 mt-1.5 max-w-sm mx-auto leading-relaxed font-medium">
                    {isEmployer 
                      ? "Post a job now. Plumbers, electricians, painters, and tech artisans are active and ready in your area."
                      : "Complete your BukiePassport profile setup with verified skill tags and credentials to start receiving customized job recommendations!"}
                  </p>
    
                  <div className="flex gap-3 mt-6 flex-wrap justify-center">
                    {isEmployer ? (
                      <button
                        id="dash-post-job-btn"
                        type="button"
                        className="bg-brand-green text-white text-xs font-bold uppercase tracking-wider py-3 px-6 rounded-xl hover:bg-brand-green/90 transition-all shadow-md cursor-pointer active:scale-95"
                        onClick={() => router.push('/dashboard/post-job')}
                      >
                        Post a new job opening
                      </button>
                    ) : (
                      <>
                        <button
                          id="dash-find-work-btn"
                          type="button"
                          className="bg-brand-green text-white text-xs font-bold uppercase tracking-wider py-3 px-6 rounded-xl hover:bg-brand-green/90 transition-all shadow-md cursor-pointer active:scale-95"
                          onClick={() => router.push('/dashboard/jobs')}
                        >
                          Browse job listings
                        </button>
                        <button
                          id="dash-passport-btn"
                          type="button"
                          className="bg-brand-bg text-brand-navy border border-brand-border/60 text-xs font-bold uppercase tracking-wider py-3 px-6 rounded-xl hover:bg-brand-surface transition-all shadow-sm cursor-pointer"
                          onClick={() => router.push('/dashboard/passport-setup')}
                        >
                          Update BukiePassport
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </FadeUp>

            {/* 3. Incoming Bids List: Re-style the list of incoming artisan bids as light gray cards */}
            {isEmployer && incomingBids.length > 0 && (
              <FadeUp delay={0.25} className="bg-brand-bg p-6 sm:p-8 rounded-2xl border border-brand-border/40 shadow-[0_4px_20px_rgba(10,25,47,0.02)] space-y-6">
                <div>
                  <h2 className="text-lg font-display font-bold text-brand-navy flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-brand-green" />
                    <span>Incoming Artisan Bids ({incomingBids.length})</span>
                  </h2>
                  <p className="text-xs text-brand-navy/50 font-medium mt-1">
                    Direct proposals received from local verified providers. Compare budgets and start negotiations.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4" id="incoming-bids-list">
                  {incomingBids.map(bid => (
                    <div 
                      key={bid.id} 
                      className="bg-brand-surface border border-brand-border/50 rounded-2xl p-5 space-y-4 hover:shadow-sm transition-all relative overflow-hidden"
                      id={`bid-card-${bid.id}`}
                    >
                      {/* Top Row: Applicant name and bid budget */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-border/20 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green font-bold text-sm border border-brand-green/20 shrink-0">
                            {bid.profile?.full_name?.charAt(0) || <User className="w-4.5 h-4.5" />}
                          </div>
                          <div>
                            <span className="font-bold text-brand-navy text-sm sm:text-base block leading-none">
                              {bid.profile?.full_name || 'Anonymous Artisan'}
                            </span>
                            <span className="text-[10px] text-brand-navy/40 font-bold block mt-1 uppercase tracking-wider">
                              Artisan Applicant
                            </span>
                          </div>
                        </div>

                        {/* Proposed Budget Badge */}
                        <div className="bg-brand-green/10 border border-brand-green/20 px-3 py-1.5 rounded-xl flex items-center gap-1.5 self-start sm:self-auto">
                          <span className="text-[9px] font-bold text-brand-green uppercase tracking-wider">Proposed:</span>
                          <span className="text-sm font-black text-brand-green font-mono leading-none">
                            ₦{bid.proposed_budget?.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Job Title and cover letter description */}
                      <div className="space-y-2">
                        <span className="text-[10px] uppercase font-bold text-brand-navy/40 tracking-wider block">
                          Bid On: <span className="text-brand-navy font-bold normal-case font-display">{bid.job?.title}</span>
                        </span>
                        
                        <div className="bg-brand-bg border border-brand-border/30 rounded-xl p-3 sm:p-4 text-xs sm:text-sm text-brand-navy/70 italic leading-relaxed font-medium">
                          &ldquo;{bid.cover_letter}&rdquo;
                        </div>
                      </div>

                      {/* Footer Row: location and quick actions */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-brand-navy/60">
                          <MapPin className="w-3.5 h-3.5 text-brand-green" />
                          <span>{bid.profile?.location_lga || 'Ikeja'}, {bid.profile?.location_state || 'Lagos'}</span>
                        </div>

                        {/* Open Chat and Negotiate */}
                        <button
                          onClick={() => router.push(`/dashboard/chat/${bid.job_id}`)}
                          className="bg-brand-navy hover:bg-brand-navy/90 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm self-stretch sm:self-auto"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-brand-green" />
                          <span>Chat & Negotiate</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </FadeUp>
            )}

          </div>

          {/* Quick Operations Sidebar Info */}
          <div className="space-y-6">
            
            {/* Quick Passport/Verification Info Card */}
            <FadeUp delay={0.25} className="bg-brand-bg p-6 rounded-2xl border border-brand-border/40 shadow-[0_4px_20px_rgba(10,25,47,0.01)] flex flex-col justify-between space-y-4">
              <div>
                <h3 className="font-display font-bold text-brand-navy text-sm sm:text-base mb-3 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-brand-green" />
                  <span>Trust & Payment Protection</span>
                </h3>
                <p className="text-xs text-brand-navy/60 leading-relaxed font-medium font-sans">
                  Every artisan and client on BukieBrainJobs is identity-verified. You know exactly who you are working with, and payments are protected as Protected Funds until completion is confirmed.
                </p>
              </div>

              <div className="bg-brand-surface p-4 rounded-xl border border-brand-border/40 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
                <span className="text-[11px] font-bold text-brand-navy/70 leading-relaxed font-sans">
                  {isEmployer 
                    ? "Hire with confidence knowing your resources are held securely until the contractor delivers." 
                    : "Having a verified BukiePassport badge dramatically increases your hiring response rate."}
                </span>
              </div>
            </FadeUp>

            {/* Telegram Alerts bot integration layout */}
            <FadeUp delay={0.3} className="bg-brand-navy text-white p-6 rounded-2xl border border-brand-border/20 relative overflow-hidden shadow-sm space-y-4">
              <div className="absolute right-0 bottom-0 w-24 h-24 bg-brand-green/10 rounded-full blur-xl pointer-events-none"></div>
              
              <div className="space-y-1.5">
                <span className="text-[9px] font-bold text-brand-green uppercase tracking-widest font-mono block">
                  Telegram Push Node
                </span>
                <h4 className="font-display font-bold text-sm sm:text-base text-white">
                  Immediate Alerts Hub
                </h4>
                <p className="text-xs text-white/70 leading-relaxed font-medium">
                  Receive immediate push notifications on Telegram for payments, invoice clearance, quotes, or when matches pop up near you.
                </p>
              </div>

              <a
                href="https://t.me/BukieBrainBot"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-brand-green hover:bg-brand-green/90 py-2.5 px-4 rounded-xl transition-all shadow-sm cursor-pointer self-start"
              >
                <span>Connect Telegram Bot</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </FadeUp>

          </div>

        </div>

      </div>

      <FeedbackButton />

      {/* Footer */}
      <footer className="mt-auto py-8 text-center text-xs text-brand-navy/40 font-medium border-t border-brand-border/20 bg-brand-surface/10">
        <p className="mb-1">© {new Date().getFullYear()} BukieBrainJobs</p>
        <p className="text-[10px] text-brand-navy/30">Secured Payments & Artisan Protected Funds</p>
      </footer>

    </main>
  );
}
