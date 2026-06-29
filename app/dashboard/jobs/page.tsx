import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { applyToJob } from './actions';
import JobCard from './JobCard';
import JobFilterBar from './JobFilterBar';
import { LogoLink } from '@/components/LogoLink';
import { ArrowLeft, Wallet, Briefcase, HelpCircle, AlertCircle, Sparkles } from 'lucide-react';

interface JobsDashboardProps {
  searchParams: {
    q?: string;
    state?: string;
    minBudget?: string;
  };
}

export default async function JobsDashboard({ searchParams }: JobsDashboardProps) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    (process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'),
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'),
    {
      cookies: {
        getAll() { return cookieStore.getAll().map((c) => ({ name: c.name, value: c.value })) },
        setAll(cookiesToSet: any[]) { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Verify profile and worker role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'worker') {
    redirect('/dashboard'); // Only artisans see job feed
  }

  // Fetch wallet for bidding and balance details
  const { data: wallet } = await supabase
    .from('wallets')
    .select('balance, free_bids_remaining')
    .eq('profile_id', user.id)
    .maybeSingle();

  // Construct dynamic query
  let query = supabase
    .from('jobs')
    .select('id, title, description, budget, location_state, location_lga, created_at, employer:profiles(full_name)')
    .eq('stage', 'open');

  const q = searchParams?.q || '';
  const state = searchParams?.state || '';
  const minBudget = searchParams?.minBudget || '';

  if (q) {
    query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
  }
  if (state) {
    query = query.eq('location_state', state);
  }
  if (minBudget) {
    const minBudgetNum = parseInt(minBudget, 10);
    if (!isNaN(minBudgetNum)) {
      query = query.gte('budget', minBudgetNum);
    }
  }

  const { data: jobs } = await query.order('created_at', { ascending: false });

  return (
    <main className="min-h-screen bg-brand-bg text-brand-navy flex flex-col font-sans">
      
      {/* Premium Sub-Navigation Navbar */}
      <nav className="bg-brand-bg border-b border-brand-border/40 sticky top-0 z-40 shadow-sm" id="jobs-explorer-navbar">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <LogoLink />
            <span className="text-brand-border/60">•</span>
            <Link 
              href="/dashboard"
              className="flex items-center gap-1.5 text-xs font-bold text-brand-navy/60 hover:text-brand-navy transition-all duration-150 bg-brand-surface border border-brand-border/40 px-3 py-1.5 rounded-xl"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Dashboard</span>
            </Link>
          </div>

          {/* Quick Metrics (Wallet and Bids remaining) */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5 bg-brand-surface border border-brand-border/50 px-4 py-2 rounded-xl">
              <Wallet className="w-4.5 h-4.5 text-brand-green" />
              <div>
                <span className="block text-[8px] uppercase font-bold text-brand-navy/40 tracking-wider leading-none">
                  Balance
                </span>
                <span className="text-xs font-extrabold text-brand-navy font-mono leading-none">
                  ₦{(wallet?.balance || 0).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 bg-brand-surface border border-brand-border/50 px-4 py-2 rounded-xl">
              <div className="text-right">
                <span className="block text-[8px] uppercase font-bold text-brand-navy/40 tracking-wider leading-none">
                  Free Bids
                </span>
                <span className="text-xs font-extrabold text-brand-navy font-mono leading-none">
                  {wallet?.free_bids_remaining ?? 3} remaining
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <div className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8" id="jobs-explorer-content">
        
        {/* Welcome & Title Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-brand-border/30 pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-brand-green/10 text-brand-green border border-brand-green/20 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                Artisan Job Feed
              </span>
              <span className="text-xs text-brand-navy/40 font-semibold">• Real-Time Matches</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-brand-navy tracking-tight">
              Jobs Explorer
            </h1>
            <p className="text-xs sm:text-sm text-brand-navy/60 font-medium max-w-xl">
              Submit highly-competitive proposals with real-time payment protection. Your payments are fully secured using BukiePassport protection.
            </p>
          </div>
          
          {/* Quick Notice Card */}
          <div className="bg-brand-surface/80 border border-brand-border/60 p-4 rounded-xl max-w-xs flex gap-3 items-start">
            <Sparkles className="w-5 h-5 text-brand-green shrink-0 mt-0.5 animate-pulse" />
            <div className="space-y-1">
              <span className="block text-[10px] font-bold text-brand-navy uppercase tracking-wider">
                Verified Advantage
              </span>
              <p className="text-[11px] text-brand-navy/65 leading-relaxed font-semibold">
                Verified Blue Check artisans receive priority feedback and are 3x more likely to be selected by employers.
              </p>
            </div>
          </div>
        </div>

        {/* Advanced Filters Layout Pill surface bar */}
        <JobFilterBar />

        {/* Jobs Feed List Grid */}
        <div className="space-y-6" id="jobs-grid-container">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-display font-bold text-brand-navy tracking-tight flex items-center gap-2">
              <Briefcase className="w-4.5 h-4.5 text-brand-green" />
              <span>Available Opportunities ({jobs?.length || 0})</span>
            </h2>
            
            {/* Quick Helper Text */}
            <span className="text-[11px] text-brand-navy/40 font-semibold hidden sm:inline-flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5" />
              Bids consume 1 free bid or ₦100
            </span>
          </div>

          {jobs && jobs.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} applyAction={applyToJob} />
              ))}
            </div>
          ) : (
            /* High-Fidelity Empty State Card */
            <div className="border-2 border-dashed border-brand-border/60 rounded-2xl p-12 text-center flex flex-col items-center justify-center bg-brand-surface/10" id="jobs-empty-state">
              <div className="w-12 h-12 rounded-full bg-brand-surface flex items-center justify-center border border-brand-border/40 text-brand-navy/45 mb-4 shadow-sm">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-brand-navy text-lg">
                No Jobs Match Your Filter Criteria
              </h3>
              <p className="text-xs sm:text-sm text-brand-navy/60 mt-1.5 max-w-md mx-auto leading-relaxed">
                We couldn&apos;t find any open job briefs matching your search queries or budget specifications. Try clearing your filters or setting a lower minimum budget limit.
              </p>
              
              <div className="mt-6 flex gap-3">
                <Link
                  href="/dashboard/jobs"
                  className="bg-brand-green text-white text-xs font-bold uppercase tracking-wider py-2.5 px-5 rounded-xl hover:bg-brand-green/90 transition-all shadow-sm cursor-pointer"
                >
                  Clear All Filters
                </Link>
                <Link
                  href="/dashboard"
                  className="bg-brand-surface text-brand-navy/75 border border-brand-border/60 text-xs font-bold uppercase tracking-wider py-2.5 px-5 rounded-xl hover:bg-brand-surface/80 transition-all cursor-pointer"
                >
                  Return to Dashboard
                </Link>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Footer */}
      <footer className="mt-auto py-8 text-center text-xs text-brand-navy/40 font-medium border-t border-brand-border/20 bg-brand-surface/10">
        <p className="mb-1">© {new Date().getFullYear()} BukieBrainJobs</p>
        <p className="text-[10px] text-brand-navy/30">Secured Payments & Artisan Protected Funds</p>
      </footer>

    </main>
  );
}
