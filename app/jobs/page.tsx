'use client';
import { LogoBase64 } from '@/lib/logo';

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
  AlertCircle
} from 'lucide-react';

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

  // Search states
  const [whatQuery, setWhatQuery] = useState('');
  const [whereQuery, setWhereQuery] = useState('');

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

  // Filter logic based on What & Where
  const filteredJobs = jobs.filter((job) => {
    if (whatQuery.trim() !== '') {
      const q = whatQuery.toLowerCase();
      const matchTitle = job.title?.toLowerCase().includes(q);
      const matchDesc = job.description?.toLowerCase().includes(q);
      const matchCat = job.category?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchCat) return false;
    }
    if (whereQuery.trim() !== '') {
      const q = whereQuery.toLowerCase();
      const matchState = job.location_state?.toLowerCase().includes(q);
      const matchLga = job.location_lga?.toLowerCase().includes(q);
      if (!matchState && !matchLga) return false;
    }
    return true;
  });

  const displayJobType = (job_type: string) => {
    switch (job_type) {
      case 'task': return 'One-time Task';
      case 'contract': return 'Freelance/Contract';
      case 'full_time': return 'Full-time Help';
      default: return 'Quick Task';
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
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-1.5 text-sm text-[#0A192F] hover:bg-gray-50 font-bold px-3 py-2 rounded-lg transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="h-5 w-[1px] bg-gray-300 hidden sm:block"></div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center gap-2 p-1.5 shrink-0">
              <Image src={LogoBase64} alt="BukieBrainJobs Logo" width={32} height={32} className="rounded-xl shadow-sm border border-gray-200 bg-white p-[2px]" />
              <span className="font-extrabold text-xl tracking-tight text-[#0A192F] hidden sm:block pr-2">BukieBrainJobs</span>
            </div>
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
          <div className="flex flex-col md:flex-row gap-0 rounded-2xl border-2 border-[#0A192F] bg-white shadow-sm overflow-hidden focus-within:ring-4 focus-within:ring-[#0A192F]/10 transition-shadow">
            
            <div className="flex-1 flex items-center px-4 py-3 md:py-4 border-b md:border-b-0 md:border-r border-gray-200">
              <span className="text-[#0A192F] font-bold mr-3 whitespace-nowrap text-sm">What</span>
              <input 
                type="text" 
                placeholder="Job title, keywords, or category" 
                value={whatQuery}
                onChange={(e) => setWhatQuery(e.target.value)}
                className="w-full bg-transparent outline-none text-[#0A192F] placeholder-gray-500 font-medium text-base"
              />
              <Search className="w-5 h-5 text-gray-500 ml-2 shrink-0" />
            </div>

            <div className="flex-1 flex items-center px-4 py-3 md:py-4">
              <span className="text-[#0A192F] font-bold mr-3 whitespace-nowrap text-sm">Where</span>
              <input 
                type="text" 
                placeholder="City, state, or LGA" 
                value={whereQuery}
                onChange={(e) => setWhereQuery(e.target.value)}
                className="w-full bg-transparent outline-none text-[#0A192F] placeholder-gray-500 font-medium text-base"
              />
              <MapPin className="w-5 h-5 text-gray-500 ml-2 shrink-0" />
            </div>

            <button 
              className="bg-[#0A192F] hover:bg-[#112a4f] text-white px-8 py-3 md:py-0 font-bold text-lg md:w-auto w-full transition-colors cursor-pointer"
            >
              Search
            </button>
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
            
            {loading ? (
              <div className="text-center py-12">
                <span className="text-gray-500 font-medium">Loading jobs...</span>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-200">
                <h3 className="text-[#0A192F] font-bold text-lg">No jobs found matching your criteria.</h3>
                <p className="text-gray-500 mt-2 text-sm">Try broadening your search.</p>
              </div>
            ) : (
              filteredJobs.map((job) => (
                <div 
                  key={job.id} 
                  onClick={() => setSelectedJob(job)}
                  className={`bg-white rounded-xl border p-5 cursor-pointer transition-all ${
                    selectedJob?.id === job.id 
                      ? 'border-[#0A192F] shadow-sm ring-1 ring-[#0A192F]' 
                      : 'border-gray-200 hover:shadow-md hover:border-gray-300'
                  }`}
                >
                  {job.is_urgent && (
                    <div className="mb-3">
                      <span className="bg-[#004D2C] text-white text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-md inline-flex items-center gap-1">
                        <Flame className="w-3 h-3 fill-amber-400 text-amber-400" />
                        Urgent Spotlight
                      </span>
                    </div>
                  )}
                  <h2 className="text-lg font-extrabold text-[#0A192F] leading-tight mb-2">
                    {job.title}
                  </h2>
                  
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="bg-[#004D2C]/10 text-[#004D2C] font-bold text-xs px-2.5 py-1 rounded-md">
                      ₦{job.budget?.toLocaleString()}
                    </span>
                    {job.category && (
                      <span className="text-xs text-gray-600 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {job.category}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                      <span>{job.location_lga}, {job.location_state}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Briefcase className="w-4 h-4 text-gray-400 shrink-0" />
                      <span>{displayJobType(job.job_type)}</span>
                    </div>
                  </div>

                  {job.description && (
                    <div className="text-sm text-gray-600 line-clamp-2 leading-relaxed bg-gray-50 border border-gray-100 p-3 rounded-lg">
                      {job.description}
                    </div>
                  )}

                  <div className="mt-4 pt-3 flex items-center justify-between text-xs text-gray-500 font-medium">
                    <span>{getRelativeTime(job.created_at)}</span>
                    {selectedJob?.id !== job.id && (
                      <span className="text-[#0A192F] font-bold">View details &rarr;</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* RIGHT COLUMN: Detail View Sticky Pane */}
          <div className={`md:col-span-7 bg-white rounded-2xl border border-gray-200 shadow-sm md:sticky md:top-28 md:max-h-[calc(100vh-8rem)] overflow-y-auto ${selectedJob ? 'block' : 'hidden md:block md:invisible'}`}>
            {selectedJob ? (
              <div className="p-6 md:p-8">
                {/* Mobile back button */}
                <button 
                  onClick={() => setSelectedJob(null)}
                  className="md:hidden flex items-center gap-2 text-[#0A192F] font-bold text-sm mb-6 border border-gray-200 px-4 py-2 rounded-lg"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to jobs
                </button>

                <div className="space-y-6">
                  <div>
                    {selectedJob.is_urgent && (
                      <span className="bg-[#004D2C] text-white text-xs uppercase tracking-wider font-extrabold px-3 py-1.5 rounded-md inline-flex items-center gap-1.5 mb-4">
                        <Flame className="w-4 h-4 fill-amber-400 text-amber-400" />
                        Urgent Spotlight
                      </span>
                    )}
                    <h1 className="text-2xl md:text-3xl font-black text-[#0A192F] tracking-tight leading-tight mb-4">
                      {selectedJob.title}
                    </h1>
                    
                    <div className="flex flex-wrap gap-3 mb-6">
                      {selectedJob.category && (
                        <div className="bg-gray-100 text-[#0A192F] font-semibold text-sm px-3 py-1.5 rounded-lg border border-gray-200 flex items-center gap-1.5">
                          <Tag className="w-4 h-4" />
                          {selectedJob.category}
                        </div>
                      )}
                      <div className="bg-[#004D2C]/10 border border-[#004D2C]/20 text-[#004D2C] font-bold text-sm px-3 py-1.5 rounded-lg">
                        ₦{selectedJob.budget?.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-y border-gray-200 py-6">
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Location</span>
                      <div className="flex items-center gap-2 text-[#0A192F] font-medium text-sm">
                        <MapPin className="w-5 h-5 text-gray-400 shrink-0" />
                        {selectedJob.location_lga}, {selectedJob.location_state}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Job Type</span>
                      <div className="flex items-center gap-2 text-[#0A192F] font-medium text-sm">
                        <Briefcase className="w-5 h-5 text-gray-400 shrink-0" />
                        {displayJobType(selectedJob.job_type)}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <h3 className="text-lg font-extrabold text-[#0A192F] mb-4">Full Job Description</h3>
                    <div className="bg-white text-gray-700 text-base leading-relaxed whitespace-pre-wrap whitespace-normal">
                      {selectedJob.description || "No full description provided. The title contains the primary requirements."}
                    </div>
                  </div>

                  <div className="pt-8 pb-4">
                    <button 
                      onClick={() => router.push(`/p/${selectedJob.id}`)}
                      className="w-full sm:w-auto bg-[#0A192F] hover:bg-[#112a4f] text-white font-bold text-base px-10 py-4 rounded-xl transition-colors shadow-md cursor-pointer"
                    >
                      Apply Now
                    </button>
                  </div>
                  
                  <div className="text-xs text-gray-400 font-medium pt-4 border-t border-gray-100 flex justify-between">
                    <span>Posted: {getRelativeTime(selectedJob.created_at)}</span>
                    <span className="uppercase tracking-widest font-mono">ID: {selectedJob.id.split('-')[0]}</span>
                  </div>
                </div>
              </div>
            ) : (
              // Empty state when nothing is selected
              <div className="hidden md:flex flex-col items-center justify-center h-full p-12 text-center">
                <div className="w-32 h-32 mb-6">
                  <Image src={LogoBase64} alt="Select Job" width={128} height={128} className="opacity-10 grayscale bg-white p-[2px]" />
                </div>
                <h2 className="text-[#0A192F] font-bold text-xl mb-2">Select a job to view details</h2>
                <p className="text-gray-500 max-w-sm">Click on any job card from the list on the left to see the full description, requirements, and apply.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}

