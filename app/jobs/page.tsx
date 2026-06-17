'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Filter, 
  X, 
  MapPin, 
  Briefcase, 
  Tag, 
  ChevronRight, 
  ArrowLeft,
  RefreshCw,
  SlidersHorizontal,
  PlusSquare,
  AlertCircle
} from 'lucide-react';
import { createBrowserClient } from '@supabase/auth-helpers-nextjs';
import JobCard from '@/components/JobCard';

// State and LGA mapping for robust filtering
const locationData: Record<string, string[]> = {
  'Lagos': ['Ikeja', 'Alimosho', 'Lagos Island', 'Surulere', 'Lekki', 'Yaba', 'Mushin'],
  'Abuja (FCT)': ['Wuse', 'Garki', 'Maitama', 'Asokoro', 'Gwagwalada', 'Bwari'],
  'Rivers': ['Port Harcourt', 'Obio-Akpor', 'Eleme', 'Bonny', 'Oyigbo', 'Okrika']
};

export default function JobsPage() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState<string>('all');
  const [selectedLga, setSelectedLga] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedJobType, setSelectedJobType] = useState<string>('all');
  const [minBudget, setMinBudget] = useState<string>('');

  // Mobile sidebar filter modal state
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Fetch jobs from Supabase sorted: is_urgent DESC, created_at DESC
  const fetchJobs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('is_urgent', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching jobs:', error);
        setErrorMsg('Failed to fetch available tasks. Please refresh.');
      } else {
        setJobs(data || []);
      }
    } catch (err: any) {
      setErrorMsg('Network error. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  // When selected state changes, reset selected LGA to 'all'
  useEffect(() => {
    setSelectedLga('all');
  }, [selectedState]);

  // Client-side Instant Filter logic
  const filteredJobs = jobs.filter((job) => {
    // 1. Keyword search (Title, Description, Category)
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      const matchTitle = job.title?.toLowerCase().includes(query);
      const matchDesc = job.description?.toLowerCase().includes(query);
      const matchCategory = job.category?.toLowerCase().includes(query);
      if (!matchTitle && !matchDesc && !matchCategory) {
        return false;
      }
    }

    // 2. State Filter
    if (selectedState !== 'all' && job.location_state !== selectedState) {
      return false;
    }

    // 3. LGA Filter
    if (selectedLga !== 'all' && job.location_lga !== selectedLga) {
      return false;
    }

    // 4. Category Filter
    if (selectedCategory !== 'all' && job.category !== selectedCategory) {
      return false;
    }

    // 5. Job Type Filter
    if (selectedJobType !== 'all' && job.job_type !== selectedJobType) {
      return false;
    }

    // 6. Minimum Budget
    if (minBudget !== '') {
      const minVal = parseFloat(minBudget);
      if (!isNaN(minVal) && job.budget < minVal) {
        return false;
      }
    }

    return true;
  });

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedState('all');
    setSelectedLga('all');
    setSelectedCategory('all');
    setSelectedJobType('all');
    setMinBudget('');
  };

  const toggleExpand = (jobId: string) => {
    if (expandedJobId === jobId) {
      setExpandedJobId(null);
    } else {
      setExpandedJobId(jobId);
    }
  };

  // Build the Filter Side Panel content (to avoid duplication on desktop / mobile)
  const renderFilterPanel = () => {
    const listLgas = selectedState !== 'all' ? locationData[selectedState] : [];

    return (
      <div className="space-y-6">
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Filters & Criteria
            </h3>
            <button
              onClick={clearAllFilters}
              className="text-[10px] font-black text-[#006D44] hover:underline uppercase tracking-wide cursor-pointer"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* State Dropdown */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
            State
          </label>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 focus:border-[#006D44] focus:bg-white text-xs px-3 py-2.5 rounded-xl outline-none text-gray-900 font-semibold cursor-pointer"
          >
            <option value="all">Any State</option>
            {Object.keys(locationData).map((state) => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>

        {/* LGA Dropdown */}
        {selectedState !== 'all' && (
          <div className="animate-fadeIn">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
              Local Government (LGA)
            </label>
            <select
              value={selectedLga}
              onChange={(e) => setSelectedLga(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 focus:border-[#006D44] focus:bg-white text-xs px-3 py-2.5 rounded-xl outline-none text-gray-900 font-semibold cursor-pointer"
            >
              <option value="all">Any LGA in {selectedState}</option>
              {listLgas.map((lga) => (
                <option key={lga} value={lga}>{lga}</option>
              ))}
            </select>
          </div>
        )}

        {/* Category Dropdown */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
            Job Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 focus:border-[#006D44] focus:bg-white text-xs px-3 py-2.5 rounded-xl outline-none text-gray-900 font-semibold cursor-pointer"
          >
            <option value="all">All Categories</option>
            <option value="Plumbing">Plumbing</option>
            <option value="Electrical">Electrical</option>
            <option value="Driver">Driver Task</option>
            <option value="Other">Other Category</option>
          </select>
        </div>

        {/* Job Type Dropdown */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
            Job Arrangement
          </label>
          <select
            value={selectedJobType}
            onChange={(e) => setSelectedJobType(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 focus:border-[#006D44] focus:bg-white text-xs px-3 py-2.5 rounded-xl outline-none text-gray-900 font-semibold cursor-pointer"
          >
            <option value="all">Any Agreement</option>
            <option value="task">One-time Task</option>
            <option value="contract">Freelance Contract</option>
            <option value="full_time">Full-time Employee</option>
          </select>
        </div>

        {/* Minimum Budget */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
            Min Budget (₦ Naira)
          </label>
          <input
            type="number"
            placeholder="e.g. 5000"
            value={minBudget}
            onChange={(e) => setMinBudget(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 focus:border-[#006D44] focus:bg-white text-xs px-3 py-2.5 rounded-xl outline-none text-gray-900 font-mono font-semibold"
          />
        </div>

        <div className="border-t border-gray-100 my-4"></div>

        {/* Quick Tips Box */}
        <div className="bg-[#006D44]/5 p-4 rounded-2xl border border-[#006D44]/10">
          <h4 className="text-[10px] uppercase tracking-wider font-extrabold text-[#006D44] mb-1">
            Artisan Notice
          </h4>
          <p className="text-[11px] text-gray-500 leading-normal">
            Toggle notifications inside the dashboard to receive direct Telegram webhook blasts for new local opportunities instant-access.
          </p>
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-[#F4F5F7] text-[#1A1C1E] flex flex-col">
      
      {/* Search & Back Header */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm" id="jobs-navbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 font-bold uppercase tracking-wider bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-xl transition-all cursor-pointer"
              id="jobs-back-btn"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>
            <div className="h-4 w-[1px] bg-gray-200 hidden sm:block"></div>
            <div>
              <span className="font-extrabold text-base block leading-none text-gray-900 tracking-tight">
                Bukie<span className="text-[#006D44]">Brain</span> Marketplace
              </span>
              <span className="text-[9px] font-mono text-gray-400 font-bold uppercase tracking-wider">
                Nigeria&apos;s Trust Network
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard/post-job')}
              className="flex items-center gap-1.5 text-xs bg-[#006D44] hover:bg-[#005a37] text-white font-extrabold uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-md shadow-green-900/5 transition-all cursor-pointer"
              id="jobs-post-trigger"
            >
              <PlusSquare className="w-4 h-4" />
              <span>Post a Job</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8 flex flex-col gap-8" id="jobs-feed-container">
        
        {/* Banner header title */}
        <div className="relative bg-[#1A1C1E] text-white p-6 md:p-8 rounded-3xl overflow-hidden shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="absolute right-0 top-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full blur-2xl"></div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
              Looking for work?
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Browse available tasks from vetted employers, customize filters nearby, and propose quotes.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 px-4 py-1.5 rounded-full flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#D4AF37]">
              {jobs.length} Job Inquiries Live
            </span>
          </div>
        </div>

        {/* Global Error Banner */}
        {errorMsg && (
          <div className="p-4 bg-red-50 text-red-700 border border-red-100 rounded-xl flex gap-3 text-sm font-medium" id="jobs-error-banner">
            <AlertCircle className="w-5 h-5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Search Input Bar Area */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full" id="search-filter-controls">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by keywords (e.g., pipe leak, driver, teacher)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-200 focus:border-[#006D44] text-sm pl-11 pr-4 py-3 rounded-2xl transition-all outline-none text-gray-900 placeholder-gray-400 font-semibold shadow-sm"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Mobile Filter Toggle Button */}
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="md:hidden flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 text-xs font-bold uppercase tracking-wider py-3 px-5 rounded-2xl shadow-sm transition-all cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
            </button>

            <button
              onClick={fetchJobs}
              disabled={loading}
              className="bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 p-3 rounded-2xl shadow-sm transition-all cursor-pointer disabled:opacity-50"
              title="Refresh job feed"
              id="refresh-jobs-action"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#006D44]' : ''}`} />
            </button>
          </div>
        </div>

        {/* Content Layout Grid (Sidebar + List) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8" id="jobs-layout-grid">
          
          {/* Desktop Filters Side Panel (Visible only on desktop screens) */}
          <aside className="hidden md:block bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-fit sticky top-24" id="desktop-filters-panel">
            {renderFilterPanel()}
          </aside>

          {/* Core Jobs Feed Card List */}
          <section className="md:col-span-3 space-y-6" id="jobs-list-element">
            
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <RefreshCw className="w-8 h-8 animate-spin text-[#006D44] mb-3" />
                <span className="text-xs font-mono text-gray-400 uppercase font-bold tracking-widest">
                  Fetching marketplace feed...
                </span>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200 p-8 flex flex-col items-center justify-center shadow-sm">
                <span className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-4 border border-gray-100 shadow-sm">
                  <Search className="w-6 h-6" />
                </span>
                <h3 className="text-base font-black text-gray-900 tracking-tight">
                  No match found
                </h3>
                <p className="text-xs text-gray-400 mt-1 max-w-sm leading-relaxed">
                  We couldn&apos;t find any listings matching &quot;{searchQuery}&quot; or chosen filters. Adjust your criteria or clear selections.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="mt-5 bg-gray-950 text-white text-[10px] font-black uppercase tracking-widest py-2.5 px-6 rounded-xl hover:bg-gray-800 transition-all cursor-pointer shadow-sm"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {filteredJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onClickToggle={() => toggleExpand(job.id)}
                    isExpanded={expandedJobId === job.id}
                  />
                ))}
              </div>
            )}

          </section>

        </div>

      </div>

      {/* Slide-In Mobile Filters Sidebar Modal Overlay */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFilterOpen(false)}
              className="fixed inset-0 bg-black z-50 pointer-events-auto"
            />
            
            {/* Drawer Sheet */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed right-0 top-0 bottom-0 max-w-xs w-full bg-white p-6 shadow-2xl z-50 overflow-y-auto"
              id="mobile-filters-drawer"
            >
              <div className="flex justify-between items-center mb-6">
                <span className="font-extrabold text-sm tracking-tight text-gray-900">
                  Refine Search
                </span>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {renderFilterPanel()}

              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="mt-8 w-full bg-[#006D44] hover:bg-[#005a37] text-white text-[10px] font-extrabold uppercase tracking-widest py-3 rounded-xl transition-all cursor-pointer shadow-md shadow-green-900/10 text-center"
              >
                Apply Filters
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </main>
  );
}
