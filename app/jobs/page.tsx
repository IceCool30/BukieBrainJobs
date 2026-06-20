'use client';
import { LogoBase64 } from '@/lib/logo';
import { LogoLink } from '@/components/LogoLink';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createBrowserClient } from '@supabase/auth-helpers-nextjs';
import {
  Search, 
  MapPin, 
  Briefcase, 
  Tag, 
  ArrowLeft,
  Flame,
  AlertCircle,
  Share2,
  ChevronDown,
  Heart,
  CheckCircle
} from 'lucide-react';
import { FadeUp } from '@/components/FadeUp';
import { SmartSuggestInput } from '@/components/SmartSuggestInput';

function getRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    if (diffInMs < 0) return 'Just now'; 
    
    const diffInSecs = Math.floor(diffInMs / 1000);
    const diffInMins = Math.floor(diffInSecs / 60);
    const diffInHours = Math.floor(diffInMins / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInSecs < 60) return 'Just now';
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 30) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString('en-XG', { month: 'short', day: 'numeric' });
  } catch (err) {
    return 'Recently';
  }
}

export default function JobsPage() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Selection state for Indeed-style layout
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());

  // Search & Sort states
  const [whatQuery, setWhatQuery] = useState('');
  const [whereQuery, setWhereQuery] = useState('');
  const [sortBy, setSortBy] = useState('urgency');

  // Interactive filters (Indeed style capsules)
  const [filterJobType, setFilterJobType] = useState('all');
  const [filterUrgency, setFilterUrgency] = useState('all');
  const [userProfile, setUserProfile] = useState<any | null>(null);

  // Sync state with URL search params on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const what = urlParams.get('what');
      const where = urlParams.get('where');
      if (what) setWhatQuery(what);
      if (where) setWhereQuery(where);
    }
  }, []);

  // Fetch loggged-in profile to present real-time Match Insights
  useEffect(() => {
    async function loadUserProfile() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();
          if (data) {
            setUserProfile(data);
          }
        }
      } catch (err) {
        console.error('Failed to pre-load candidate profile indices:', err);
      }
    }
    loadUserProfile();
  }, [supabase]);

  // Interactive suggestions collections
  const [listedTitlesAndCats, setListedTitlesAndCats] = useState<string[]>([
    "Plumbing", "Electrical", "Carpentry", "Painting", "Screeding", "Welding", "HVAC / Air Conditioning", "Tiling", "Catering", "Tailoring", "Hair & Beauty Services", "Cleaning Services", "Driving", "Gardening", "Laundry", "Web Development", "Mobile App Development", "Graphic Design", "Accounting", "Tutoring / Teaching", "Photography", "Video Editing", "Content Writing", "Social Media Management", "Kitchen plumbing pipe repair", "House wall screeding and painting", "Electrical wiring installation", "Traditional native wear sewing", "Custom responsive Next.js website dev", "E-commerce mobile app development", "High precision metal welding", "Traditional catering service for weddings"
  ]);
  const [listedLocations, setListedLocations] = useState<string[]>([
    "Lagos", "Ikeja", "Lekki", "Victoria Island", "Surulere", "Yaba", "Abuja", "Gwarinpa", "Wuse", "Port Harcourt", "Remote", "Kano", "Ipadan", "Enugu", "Benin City", "Kaduna"
  ]);

  useEffect(() => {
    async function fetchSearchSuggestions() {
      try {
        const { data } = await supabase.from('jobs').select('title, category, location_state, location_lga').limit(200);
        
        const firstSet = new Set<string>([
          "Plumbing", "Electrical", "Carpentry", "Painting", "Screeding", "Welding", "HVAC / Air Conditioning", "Tiling", "Catering", "Tailoring", "Hair & Beauty Services", "Cleaning Services", "Driving", "Gardening", "Laundry", "Web Development", "Mobile App Development", "Graphic Design", "Accounting", "Tutoring / Teaching", "Photography", "Video Editing", "Content Writing", "Social Media Management", "Kitchen plumbing pipe repair", "House wall screeding and painting", "Electrical wiring installation", "Traditional native wear sewing", "Custom responsive Next.js website dev", "E-commerce mobile app development", "High precision metal welding", "Traditional catering service for weddings"
        ]);
        const spotSet = new Set<string>([
          "Lagos", "Ikeja", "Lekki", "Victoria Island", "Surulere", "Yaba", "Abuja", "Gwarinpa", "Wuse", "Port Harcourt", "Remote", "Kano", "Ipadan", "Enugu", "Benin City", "Kaduna"
        ]);

        if (data) {
          data.forEach((j: any) => {
            if (j.title) {
              const t = j.title.replace('[TEST]', '').replace('[test]', '').trim();
              if (t) firstSet.add(t);
            }
            if (j.category) {
              const c = j.category.trim();
              if (c) firstSet.add(c);
            }
            if (j.location_state) {
              const s = j.location_state.trim();
              if (s) spotSet.add(s);
            }
            if (j.location_lga) {
              const l = j.location_lga.trim();
              if (l) spotSet.add(l);
            }
          });
        }

        setListedTitlesAndCats(Array.from(firstSet));
        setListedLocations(Array.from(spotSet));
      } catch (err) {
        console.error('Failed to pre-fetch search autocomplete list:', err);
      }
    }
    fetchSearchSuggestions();
  }, [supabase]);

  // Fetch jobs
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
        setErrorMsg('Failed to fetch jobs. Please try again.');
      } else {
        setJobs(data || []);
        // Optional: auto-select first job on desktop load
        // if (data && data.length > 0 && window.innerWidth >= 768) setSelectedJob(data[0]);
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

  // Filter & Sort logic based on What, Where, and Capsule configuration
  const filteredJobs = [...jobs].filter((job) => {
    // 1. Text search filter
    if (whatQuery.trim() !== '') {
      const q = whatQuery.toLowerCase();
      const matchTitle = job.title?.toLowerCase().includes(q);
      const matchDesc = job.description?.toLowerCase().includes(q);
      const matchCat = job.category?.toLowerCase().includes(q);
      const matchWorkMode = job.work_mode?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchCat && !matchWorkMode) return false;
    }
    // 2. Location search filter
    if (whereQuery.trim() !== '') {
      const q = whereQuery.toLowerCase();
      const matchState = job.location_state?.toLowerCase().includes(q);
      const matchLga = job.location_lga?.toLowerCase().includes(q);
      const matchWorkMode = job.work_mode?.toLowerCase().includes(q);
      if (!matchState && !matchLga && !matchWorkMode) return false;
    }
    // 3. Job Type (Indeed-style capsule filter)
    if (filterJobType !== 'all') {
      if (job.job_type !== filterJobType) return false;
    }
    // 4. Urgency Spotlight (Indeed-style capsule filter)
    if (filterUrgency !== 'all') {
      if (filterUrgency === 'urgent' && !job.is_urgent) return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    if (sortBy === 'budget') {
      return (b.budget || 0) - (a.budget || 0);
    }
    // Urgent Spotlight or relevance sorting
    if (a.is_urgent && !b.is_urgent) return -1;
    if (!a.is_urgent && b.is_urgent) return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const displayJobType = (job_type: string) => {
    switch (job_type) {
      case 'task': return 'One-time job';
      case 'contract': return 'Project / Contract';
      case 'full_time': return 'Ongoing work';
      default: return 'Quick job';
    }
  };

  const handleShare = async (jobId: string) => {
    const url = `${window.location.origin}/p/${jobId}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Job from BukieBrainJobs',
          text: 'Check out this job posting',
          url: url,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      navigator.clipboard.writeText(url)
        .then(() => alert('Link copied to clipboard!'))
        .catch(err => console.error('Failed to copy', err));
    }
  };

  return (
    <main className="min-h-screen bg-white text-[#0A192F] flex flex-col font-sans">
      
      {/* Top Navbar & Search Header */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40" id="jobs-navbar">
        {/* Brand & Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-1.5 text-sm text-[#0A192F] hover:bg-gray-50 font-bold px-3 py-2 rounded-lg transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="h-5 w-[1px] bg-gray-300 hidden sm:block"></div>
            <LogoLink />
          </div>
          <div>
            <button
              onClick={() => router.push('/dashboard/post-job')}
              className="text-sm font-semibold text-[#0A192F] hover:underline"
            >
              Employers: Post a Job
            </button>
          </div>
        </div>

        {/* What & Where Sticky Search Banner */}
        <div className="max-w-5xl mx-auto px-4 py-4 sm:py-6">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              fetchJobs();
            }}
            className="flex flex-col md:flex-row gap-0 rounded-2xl border-2 border-[#0A192F] bg-white shadow-sm overflow-hidden focus-within:ring-4 focus-within:ring-[#0A192F]/10 transition-shadow"
          >
            <div className="flex-1 flex items-center px-4 py-2 border-b md:border-b-0 md:border-r border-gray-200">
              <span className="text-[#0A192F] font-bold mr-3 whitespace-nowrap text-sm">What</span>
              <SmartSuggestInput
                value={whatQuery}
                onChange={setWhatQuery}
                placeholder="Job title, keywords, or category"
                suggestions={listedTitlesAndCats}
                flat
                className="w-full"
              />
              <Search className="w-5 h-5 text-gray-500 ml-2 shrink-0" />
            </div>

            <div className="flex-1 flex items-center px-4 py-2">
              <span className="text-[#0A192F] font-bold mr-3 whitespace-nowrap text-sm">Where</span>
              <SmartSuggestInput
                value={whereQuery}
                onChange={setWhereQuery}
                placeholder="City, state, Area, or Remote"
                suggestions={listedLocations}
                flat
                className="w-full"
              />
              <MapPin className="w-5 h-5 text-gray-500 ml-2 shrink-0" />
            </div>

            <button 
              type="submit"
              className="bg-[#0A192F] hover:bg-[#112a4f] text-white px-8 py-3 md:py-0 font-bold text-lg md:w-auto w-full transition-colors cursor-pointer"
            >
              Search
            </button>
          </form>
        </div>

        {/* Indeed-style Filters Sub-header Capsules/Dropdowns */}
        <div className="border-t border-gray-150 bg-gray-50 py-3">
          <div className="max-w-5xl mx-auto px-4 flex flex-wrap gap-2.5 items-center text-sm">
            <span className="text-gray-500 font-bold text-xs uppercase tracking-wider mr-1">Filter by:</span>

            {/* Job Type Filter Capsule */}
            <div className="relative inline-block">
              <select
                value={filterJobType}
                onChange={(e) => setFilterJobType(e.target.value)}
                className={`text-xs font-bold py-1.5 pl-3.5 pr-8 rounded-full border transition-all cursor-pointer outline-none appearance-none bg-white ${
                  filterJobType !== 'all'
                    ? 'border-[#0A192F] bg-[#0A192F]/5 text-[#0A192F] ring-1 ring-[#0A192F]'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                <option value="all">Job Type: All</option>
                <option value="task">One-time standard</option>
                <option value="contract">Project / Contract</option>
                <option value="full_time">Ongoing / Full-time</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-500 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>

            {/* Urgency Filter Capsule */}
            <div className="relative inline-block">
              <select
                value={filterUrgency}
                onChange={(e) => setFilterUrgency(e.target.value)}
                className={`text-xs font-bold py-1.5 pl-3.5 pr-8 rounded-full border transition-all cursor-pointer outline-none appearance-none bg-white ${
                  filterUrgency !== 'all'
                    ? 'border-[#0A192F] bg-[#0A192F]/5 text-[#0A192F] ring-1 ring-[#0A192F]'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                <option value="all">Urgency: All</option>
                <option value="urgent">Urgent Spotlight only</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-500 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>

            {/* Quick Clear Button */}
            {(filterJobType !== 'all' || filterUrgency !== 'all' || whatQuery || whereQuery) && (
              <button
                type="button"
                onClick={() => {
                  setFilterJobType('all');
                  setFilterUrgency('all');
                  setWhatQuery('');
                  setWhereQuery('');
                  router.push('/jobs');
                }}
                className="text-xs text-blue-600 hover:text-blue-800 font-bold underline px-1 cursor-pointer"
              >
                Reset tags
              </button>
            )}
          </div>
        </div>
      </nav>

      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl flex gap-3 text-sm font-medium">
            <AlertCircle className="w-5 h-5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Master Detail Split View */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start flex-1" id="indeed-split-layout">
          
          {/* LEFT COLUMN: Job List */}
          <div className={`md:col-span-5 flex flex-col gap-4 ${selectedJob ? 'hidden md:flex' : 'flex'}`}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-gray-600 font-medium text-sm">{filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'} found</span>
              <div className="flex items-center gap-2">
                <label htmlFor="sort-by" className="text-sm font-medium text-gray-500">Sort by:</label>
                <select 
                  id="sort-by"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-gray-50 border border-gray-200 text-[#0A192F] text-sm rounded-lg focus:ring-[#0A192F] focus:border-[#0A192F] block p-2 outline-none font-medium"
                >
                  <option value="urgency">Urgency</option>
                  <option value="date">Date Posted</option>
                  <option value="budget">Budget</option>
                </select>
              </div>
            </div>
            
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded-md w-3/4 mb-4"></div>
                  <div className="flex gap-2 mb-4">
                     <div className="h-6 bg-gray-200 rounded-md w-20"></div>
                     <div className="h-6 bg-gray-200 rounded-md w-24"></div>
                  </div>
                  <div className="space-y-2 mb-4">
                     <div className="h-4 bg-gray-100 rounded-md w-1/2"></div>
                     <div className="h-4 bg-gray-100 rounded-md w-1/3"></div>
                  </div>
                  <div className="h-4 bg-gray-100 rounded-md w-full mb-2"></div>
                  <div className="h-4 bg-gray-100 rounded-md w-full"></div>
                </div>
              ))
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-200">
                <h3 className="text-[#0A192F] font-bold text-lg">No jobs found matching your criteria.</h3>
                <p className="text-gray-500 mt-2 text-sm">Try broadening your search.</p>
              </div>
            ) : (
              filteredJobs.map((job, index) => {
                const isSelected = selectedJob?.id === job.id;
                // Check if user profile matches the category of the job post
                const profileMatch = userProfile && userProfile.role === 'worker' && 
                  userProfile.category && job.category && 
                  userProfile.category.toLowerCase().trim() === job.category.toLowerCase().trim();

                return (
                  <FadeUp 
                    key={job.id} 
                    delay={index * 0.05}
                    onClick={() => setSelectedJob(job)}
                    className={`bg-white rounded-xl border relative cursor-pointer shadow-sm transition-all duration-250 ease-in-out active:scale-[0.99] select-none flex flex-col ${
                      isSelected 
                        ? 'border-gray-400 bg-slate-50/40 ring-1 ring-[#0A192F]/30 pl-7' 
                        : 'border-gray-200 hover:border-gray-350 hover:shadow-md hover:bg-slate-50/10 pl-6'
                    } pr-6 py-5`}
                  >
                    {/* Indeed Selection Left Indicator Bar */}
                    {isSelected && (
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#0A192F] rounded-l-xl" />
                    )}

                    <div className="flex justify-between items-start gap-2">
                      <div>
                        {job.is_urgent && (
                          <div className="mb-2">
                            <span className="bg-[#0A192F] text-white text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                              <Flame className="w-3 h-3 fill-amber-400 text-amber-400 animate-pulse" />
                              Urgent Spotlight
                            </span>
                          </div>
                        )}
                        <h2 className="text-base md:text-lg font-bold text-[#0A192F] leading-snug hover:underline tracking-tight mb-1">
                          {job.title}
                        </h2>
                      </div>
                      
                      {/* Heart Save Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const newSaved = new Set(savedJobs);
                          if (newSaved.has(job.id)) {
                            newSaved.delete(job.id);
                          } else {
                            newSaved.add(job.id);
                          }
                          setSavedJobs(newSaved);
                        }}
                        className={`p-1.5 rounded-full hover:bg-gray-100 transition-colors ${
                          savedJobs.has(job.id) ? 'text-red-500' : 'text-gray-400 hover:text-gray-600'
                        }`}
                        aria-label="Save Job"
                      >
                        <Heart className={`w-4 h-4 ${savedJobs.has(job.id) ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    {/* Indeed-style employer details */}
                    <div className="text-xs text-gray-500 font-semibold mb-2 flex items-center gap-1.5 flex-wrap">
                      <span>Bukie Partner {job.id.split('-')[0].substring(0,4)}</span>
                      <span className="text-gray-300">•</span>
                      <span className="inline-flex items-center text-amber-600 font-bold gap-0.5">
                        4.8 ★
                      </span>
                      <span className="text-gray-300">•</span>
                      <span className="text-green-700 bg-green-50 px-1.5 py-0.5 rounded border border-green-100 text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1">
                        ⚡ Quick Contact Ready
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 mb-3">
                      <span className="bg-blue-50 border border-blue-100 text-[#0A192F] font-bold text-xs px-2.5 py-0.5 rounded-md">
                        ₦{job.budget?.toLocaleString()}
                      </span>
                      {job.category && (
                        <span className="text-[11px] text-gray-600 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Tag className="w-3 h-3 text-gray-400" />
                          {job.category}
                        </span>
                      )}
                      
                      {/* Custom User Match Indicator Tag */}
                      {profileMatch && (
                        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 bg-blue-600 text-white border border-blue-700 rounded-md inline-flex items-center gap-1">
                          ✨ Match
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 mb-4 text-xs font-medium text-gray-500">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>
                          {job.work_mode === 'remote' ? 'Remote' : `${job.location_lga}, ${job.location_state}`}
                          {job.work_mode === 'hybrid' ? ' (Hybrid)' : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Briefcase className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>{displayJobType(job.job_type)}</span>
                      </div>
                    </div>

                    {job.description && (
                      <div className="text-xs text-gray-600 line-clamp-2 leading-relaxed bg-gray-50/60 border border-gray-100 p-2.5 rounded-lg mb-2">
                        {job.description}
                      </div>
                    )}

                    <div className="mt-2 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400 font-bold">
                      <span className="flex items-center gap-1">
                        Active Recruiter • {getRelativeTime(job.created_at)}
                      </span>
                      {selectedJob?.id !== job.id ? (
                        <span className="text-[#0A192F] hover:underline font-extrabold flex items-center gap-0.5">
                          Review now &rarr;
                        </span>
                      ) : (
                        <span className="text-blue-600 font-black flex items-center gap-0.5">
                          Viewing details
                        </span>
                      )}
                    </div>
                  </FadeUp>
                );
              })
            )}
          </div>

          {/* RIGHT COLUMN: Detail View Sticky Pane */}
          <FadeUp delay={0.1} direction="down" className={`md:col-span-12 lg:col-span-7 bg-white rounded-2xl border border-gray-200 shadow-sm md:sticky md:top-28 md:max-h-[calc(100vh-8rem)] overflow-y-auto ${selectedJob ? 'block' : 'hidden lg:block lg:invisible'}`}>
            {selectedJob ? (
              <div className="p-6 md:p-8">
                {/* Mobile back button */}
                <button 
                  onClick={() => setSelectedJob(null)}
                  className="lg:hidden flex items-center gap-2 text-[#0A192F] font-bold text-sm mb-6 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to listings
                </button>

                <div className="space-y-6">
                  {/* Indeed Header Info */}
                  <div className="border-b border-gray-100 pb-5">
                    {selectedJob.is_urgent && (
                      <span className="bg-red-50 text-red-700 text-xs uppercase tracking-wider font-extrabold px-3 py-1 rounded-md inline-flex items-center gap-1.5 mb-3 border border-red-100">
                        <Flame className="w-4 h-4 fill-current" />
                        Urgent Spotlight Active
                      </span>
                    )}
                    <h1 className="text-xl md:text-2xl font-black text-[#0A192F] tracking-tight leading-snug mb-2">
                      {selectedJob.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mb-4">
                      <span className="font-bold text-[#0A192F] hover:underline cursor-pointer">
                        Bukie Partner {selectedJob.id.split('-')[0].substring(0,4)}
                      </span>
                      <span className="text-gray-300">•</span>
                      <span className="inline-flex items-center text-amber-600 font-bold gap-0.5" title="Verified rating based on contractor milestones">
                        4.8 ★★★★★
                      </span>
                      <span className="text-gray-400 text-xs font-semibold hover:underline cursor-pointer">(84 reviews)</span>
                      <span className="text-gray-300">•</span>
                      <span className="text-gray-500 font-medium">{selectedJob.work_mode === 'remote' ? 'Remote' : `${selectedJob.location_lga}, ${selectedJob.location_state}`}</span>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex items-center justify-between flex-wrap gap-3">
                      <div>
                        <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block">Estimated Compensation Range</span>
                        <div className="text-lg md:text-xl font-black text-green-700 mt-0.5">
                          ₦{selectedJob.budget?.toLocaleString()} — ₦{Math.round(selectedJob.budget * 1.15).toLocaleString()}
                        </div>
                        <span className="text-[10px] text-gray-400 font-bold mt-0.5 block">Estimated based on local artisanal rates and complexity.</span>
                      </div>
                      <div className="bg-white border border-slate-200 py-1.5 px-3 rounded-lg text-xs font-bold text-[#0A192F]">
                        ₦ / Job Complete
                      </div>
                    </div>
                  </div>

                  {/* Profile Insights Premium Section */}
                  <div className="bg-[#0A192F]/5 border border-[#0A192F]/10 rounded-xl p-4">
                    <h3 className="text-xs font-black text-[#0A192F] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                      Candidate Profile Match Insights
                    </h3>
                    
                    {userProfile ? (
                      <div>
                        {userProfile.role === 'worker' ? (
                          <div className="text-sm text-gray-700 leading-relaxed font-medium">
                            {userProfile.category && selectedJob.category && userProfile.category.toLowerCase().trim() === selectedJob.category.toLowerCase().trim() ? (
                              <p className="text-gray-700">
                                <strong className="text-emerald-700">✓ Strong Match:</strong> Your verified category is <strong className="underline">{userProfile.category}</strong>, which aligns perfectly with this listing! We have highlighted your application indices for immediate recruiter review.
                              </p>
                            ) : (
                              <p className="text-gray-600 text-xs">
                                Your current BukiePassport represents <strong className="text-[#0A192F]">{userProfile.category || "General Work"}</strong>. You may apply for any job; however, updating your specialty category on your dashboard will improve visibility for appropriate matches!
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-500 leading-normal font-medium">
                            You are logged in with an <strong className="text-[#0A192F]">Employer profile</strong>. Switch to a Provider/Worker account to submit bids and apply for this job.
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500 leading-normal font-medium">
                        Log in or complete your onboarding to analyze matches and submit direct, verified bids.
                      </p>
                    )}
                  </div>

                  {/* Job Specs Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block">Work Setting / Location</span>
                      <div className="flex items-center gap-2 text-[#0A192F] font-bold text-sm">
                        <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                        <span>
                          {selectedJob.work_mode === 'remote' ? '100% Remote work' : `${selectedJob.location_lga}, ${selectedJob.location_state}`}
                          {selectedJob.work_mode === 'hybrid' ? ' (Hybrid setting)' : ''}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block">Engagement Schedule</span>
                      <div className="flex items-center gap-2 text-[#0A192F] font-bold text-sm">
                        <Briefcase className="w-4 h-4 text-gray-400 shrink-0" />
                        <span>{displayJobType(selectedJob.job_type)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Core Description Segment */}
                  <div className="space-y-4">
                    <h3 className="text-base font-extrabold text-[#0A192F] border-b border-gray-100 pb-2">Full Job Description</h3>
                    <div className="bg-white text-gray-700 text-sm md:text-base leading-relaxed whitespace-pre-wrap whitespace-normal space-y-3 font-medium">
                      {selectedJob.description || "No specific detailed description was entered by the poster. The requirements are captured within the title, Area, and selected work specialty category."}
                    </div>
                  </div>

                  {/* Action Bar (Apply & Save) */}
                  <div className="pt-6 pb-2 flex flex-wrap items-center gap-3 border-t border-gray-100">
                    <button 
                      onClick={() => {
                        const newSet = new Set(appliedJobs);
                        newSet.add(selectedJob.id);
                        setAppliedJobs(newSet);
                      }}
                      disabled={appliedJobs.has(selectedJob.id)}
                      className={`flex-1 min-w-[160px] font-bold text-sm md:text-base px-8 py-3.5 rounded-xl transition-all shadow-sm cursor-pointer active:scale-[0.98] ${
                        appliedJobs.has(selectedJob.id)
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 cursor-not-allowed'
                          : 'bg-[#0A192F] hover:bg-[#112a4f] text-white active:bg-slate-900 shadow-md'
                      }`}
                    >
                      {appliedJobs.has(selectedJob.id) ? '✓ Application Submitted' : 'Apply on Bukie'}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const newSaved = new Set(savedJobs);
                        if (newSaved.has(selectedJob.id)) {
                          newSaved.delete(selectedJob.id);
                        } else {
                          newSaved.add(selectedJob.id);
                        }
                        setSavedJobs(newSaved);
                      }}
                      className={`flex-shrink-0 flex items-center justify-center border w-[48px] h-[48px] md:w-[50px] md:h-[50px] rounded-xl transition-all cursor-pointer active:scale-[0.98] ${
                        savedJobs.has(selectedJob.id)
                          ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                          : 'bg-gray-50 border-gray-200 text-[#0A192F] hover:bg-gray-100'
                      }`}
                      aria-label="Save Job description"
                    >
                      <Heart className={`w-5 h-5 ${savedJobs.has(selectedJob.id) ? 'fill-current' : ''}`} />
                    </button>

                    <button
                      onClick={() => handleShare(selectedJob.id)}
                      className="flex-shrink-0 flex items-center justify-center bg-gray-50 hover:bg-gray-100 border border-gray-200 text-[#0A192F] w-[48px] h-[48px] md:w-[50px] md:h-[50px] rounded-xl transition-all cursor-pointer active:scale-[0.98]"
                      aria-label="Share Job post"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {/* Security/Indeed footprint */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-[11px] text-gray-500 leading-relaxed font-medium space-y-1">
                    <p className="font-bold text-[#0A192F]">Security Advisory & Guidelines</p>
                    <p>Do not submit deposits, processing fees, or identity tokens directly to clients. The Bukie Escrow and BukiePassport verification protects your interests continuously. All transactions must run through our platform to stay monitored.</p>
                  </div>

                  <div className="text-xs text-gray-400 font-bold pt-4 border-t border-gray-100 flex justify-between">
                    <span>Listed: {getRelativeTime(selectedJob.created_at)}</span>
                    <span className="uppercase tracking-widest font-mono">ID: {selectedJob.id.split('-')[0]}</span>
                  </div>
                </div>
              </div>
            ) : (
              // Empty state when nothing is selected
              <div className="hidden lg:flex flex-col items-center justify-center min-h-[480px] h-full p-12 text-center bg-slate-50/40 rounded-2xl border-2 border-dashed border-gray-200">
                <div className="w-32 h-32 mb-4 bg-white p-4 rounded-full shadow-sm flex items-center justify-center border border-gray-100">
                  <Image src={LogoBase64} alt="Select Job" width={96} height={96} className="opacity-20 grayscale bg-white p-[2px]" />
                </div>
                <h2 className="text-[#0A192F] font-bold text-lg mb-1">Select a listing to view detailed specs</h2>
                <p className="text-gray-500 max-w-sm text-xs font-semibold leading-normal">Click on any of the active job cards on the left panel to display full descriptions, ratings, compensation metrics, and submit instant applications.</p>
              </div>
            )}
          </FadeUp>

        </div>
      </div>
    </main>
  );
}

