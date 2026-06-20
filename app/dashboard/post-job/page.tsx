'use client';
import { LogoBase64 } from '@/lib/logo';
import { LogoLink } from '@/components/LogoLink';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Briefcase, 
  Sparkles, 
  AlertTriangle, 
  Loader2, 
  CheckCircle,
  HelpCircle,
  Zap,
  X,
  ShieldCheck,
  CreditCard,
  TrendingUp
} from 'lucide-react';
import { createBrowserClient } from '@supabase/auth-helpers-nextjs';
import { postJobAction } from '@/app/actions';
import dynamic from 'next/dynamic';
import { SmoothCollapse } from '@/components/SmoothCollapse';
import { LocationSelector } from '@/components/LocationSelector';
import { SmartSuggestInput } from '@/components/SmartSuggestInput';

const PaystackButton = dynamic(() => import('@/components/PaystackButton'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-12 bg-gray-100 rounded-xl animate-pulse flex items-center justify-center text-xs font-mono text-gray-400 uppercase font-extrabold">
      Loading checkout...
    </div>
  ),
});

const AVAILABLE_CATEGORIES = [
  { value: 'Plumbing', label: 'Plumbing' },
  { value: 'Electrical', label: 'Electrical' },
  { value: 'Carpentry', label: 'Carpentry' },
  { value: 'Painting', label: 'Painting' },
  { value: 'Masonry', label: 'Masonry / Bricklaying' },
  { value: 'Welding', label: 'Welding' },
  { value: 'HVAC', label: 'HVAC / Air Conditioning' },
  { value: 'Roofing', label: 'Roofing' },
  { value: 'Tiling', label: 'Tiling / Flooring' },
  { value: 'Handyman', label: 'General Maintenance / Handyman' },
  { value: 'Cleaning', label: 'Cleaning Services' },
  { value: 'Driving', label: 'Driving / Chauffeur' },
  { value: 'Security', label: 'Security Guard' },
  { value: 'Catering', label: 'Catering / Cooking' },
  { value: 'Tailoring', label: 'Tailoring / Fashion Design' },
  { value: 'Beauty', label: 'Hair & Beauty Services' },
  { value: 'Gardening', label: 'Gardening / Landscaping' },
  { value: 'Moving', label: 'Moving / Haulage' },
  { value: 'Laundry', label: 'Laundry / Dry Cleaning' },
  { value: 'PestControl', label: 'Pest Control' },
  { value: 'WebDev', label: 'Web Development' },
  { value: 'AppDev', label: 'Mobile App Development' },
  { value: 'SoftwareDev', label: 'Software Development' },
  { value: 'UIDesign', label: 'UI/UX Design' },
  { value: 'GraphicDesign', label: 'Graphic Design' },
  { value: 'BrandIdentity', label: 'Brand Identity / Logo Design' },
  { value: 'VideoEditing', label: 'Video Editing' },
  { value: 'Animation', label: 'Animation / Motion Graphics' },
  { value: 'Photography', label: 'Photography' },
  { value: 'ContentWriting', label: 'Content Writing' },
  { value: 'Copywriting', label: 'Copywriting' },
  { value: 'BlogWriting', label: 'Blog Writing' },
  { value: 'TechWriting', label: 'Technical Writing' },
  { value: 'Translation', label: 'Translation' },
  { value: 'Transcription', label: 'Transcription' },
  { value: 'VirtualAssistant', label: 'Virtual Assistant' },
  { value: 'DataEntry', label: 'Data Entry' },
  { value: 'CustomerSupport', label: 'Customer Support' },
  { value: 'SocialMedia', label: 'Social Media Management' },
  { value: 'DigitalMarketing', label: 'Digital Marketing' },
  { value: 'SEO', label: 'SEO Services' },
  { value: 'EmailMarketing', label: 'Email Marketing' },
  { value: 'Accounting', label: 'Accounting / Bookkeeping' },
  { value: 'FinancialConsulting', label: 'Financial Consulting' },
  { value: 'LegalConsulting', label: 'Legal Consulting' },
  { value: 'BusinessConsulting', label: 'Business Consulting' },
  { value: 'ProjectManagement', label: 'Project Management' },
  { value: 'Tutoring', label: 'Tutoring / Teaching' },
  { value: 'VoiceOver', label: 'Voice Over' },
  { value: 'MusicProduction', label: 'Music Production' },
  { value: '3DModeling', label: '3D Modeling / CAD' },
  { value: 'DataAnalysis', label: 'Data Analysis' },
  { value: 'Cybersecurity', label: 'Cybersecurity Consulting' },
  { value: 'NetworkAdmin', text: 'Network Admin', label: 'Network Administration' },
  { value: 'ITSupport', label: 'IT Support' },
  { value: 'CloudDevOps', label: 'Cloud Services / DevOps' },
  { value: 'EventPlanning', label: 'Event Planning' },
  { value: 'EventPhotography', label: 'Event Photography' },
  { value: 'EventVideography', label: 'Event Videography' },
  { value: 'RealEstate', label: 'Real Estate Agent Services' },
  { value: 'PersonalTraining', label: 'Personal Training / Fitness' },
  { value: 'InteriorDesign', label: 'Interior Design' },
  { value: 'Architecture', label: 'Architecture Services' },
  { value: 'Surveying', label: 'Surveying' }
];

const SUGGESTED_JOB_TITLES = [
  "Kitchen plumbing pipe repair",
  "House wall screeding and painting",
  "Electrical wiring installation",
  "Traditional native wear sewing",
  "Custom responsive Next.js website dev",
  "E-commerce mobile app development",
  "High precision metal welding",
  "Traditional catering service for weddings",
  "AC servicing and split unit installation",
  "Bilingual book translation from French",
  "Commercial shop CCTV camera setup",
  "Deep house cleaning & post-construction wash",
  "Custom company logo & branding",
  "Social media design & content management",
  "Academic private lesson mathematics tutor",
  "Professional event video editing",
  "Real Estate agent property listing",
  "Personal fitness coach body workout sessions"
];

interface MarketRate {
  min: number;
  max: number;
  label: string;
}

function getMarketRateRange(cat: string, type: 'task' | 'contract' | 'full_time'): MarketRate {
  // Map friendly typed category labels to standard database keys for rate calculation
  const mappedObj = AVAILABLE_CATEGORIES.find(
    c => c.label.toLowerCase() === cat.toLowerCase() || c.value.toLowerCase() === cat.toLowerCase()
  );
  const code = mappedObj ? mappedObj.value : cat;

  const isTradeSpecial = ['HVAC', 'Roofing', 'Welding', 'Masonry', 'Electrical', 'Plumbing', 'Carpentry'].includes(code);
  const isTradeSimple = ['Handyman', 'Cleaning', 'Laundry', 'Gardening', 'Moving', 'PestControl'].includes(code);
  const isDigitalHigh = ['WebDev', 'AppDev', 'SoftwareDev', 'Cybersecurity', 'CloudDevOps'].includes(code);
  const isDigitalMid = ['UIDesign', 'GraphicDesign', 'BrandIdentity', 'VideoEditing', 'Animation', 'Translation', 'Accounting', 'FinancialConsulting', 'LegalConsulting', 'BusinessConsulting', 'ProjectManagement', 'DataAnalysis', 'NetworkAdmin', 'ITSupport', 'MusicProduction', '3DModeling'].includes(code);
  const isDigitalSimple = ['VirtualAssistant', 'DataEntry', 'CustomerSupport', 'Transcription', 'Tutoring', 'VoiceOver', 'ContentWriting', 'Copywriting', 'BlogWriting', 'TechWriting'].includes(code);
  const isEventHigh = ['EventPlanning', 'EventPhotography', 'EventVideography', 'Architecture', 'InteriorDesign', 'Surveying', 'RealEstate'].includes(code);
  
  if (type === 'task') {
    if (isDigitalHigh) return { min: 25000, max: 70000, label: 'per task' };
    if (isDigitalMid) return { min: 15000, max: 40000, label: 'per milestone' };
    if (isDigitalSimple) return { min: 5000, max: 15000, label: 'per task/job' };
    if (isTradeSpecial) return { min: 10000, max: 25000, label: 'per visit' };
    if (isTradeSimple) return { min: 3000, max: 10000, label: 'per clean/visit' };
    if (isEventHigh) return { min: 15000, max: 45000, label: 'per session' };
    return { min: 5000, max: 15000, label: 'per task' };
  } else if (type === 'contract') {
    if (isDigitalHigh) return { min: 150000, max: 450000, label: 'project fee' };
    if (isDigitalMid) return { min: 60000, max: 180000, label: 'project fee' };
    if (isDigitalSimple) return { min: 25005, max: 80000, label: 'project fee' };
    if (isTradeSpecial) return { min: 40000, max: 120000, label: 'contract sum' };
    if (isTradeSimple) return { min: 15000, max: 45000, label: 'contract sum' };
    if (isEventHigh) return { min: 80000, max: 250000, label: 'project fee' };
    return { min: 30000, max: 100000, label: 'contract sum' };
  } else {
    // full_time/ongoing
    if (isDigitalHigh) return { min: 250000, max: 600000, label: 'per month' };
    if (isDigitalMid) return { min: 140000, max: 320000, label: 'per month' };
    if (isDigitalSimple) return { min: 80000, max: 160000, label: 'per month' };
    if (isTradeSpecial) return { min: 100000, max: 220000, label: 'per month' };
    if (isTradeSimple) return { min: 45000, max: 85000, label: 'per month' };
    if (isEventHigh) return { min: 150000, max: 350000, label: 'per month' };
    return { min: 75000, max: 180000, label: 'per month' };
  }
}

export default function PostJobPage() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [loading, setLoading] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState('');

  // Suggestions dynamic states
  const [listedTitles, setListedTitles] = useState<string[]>([]);
  const [listedCategories, setListedCategories] = useState<string[]>([]);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [category, setCategory] = useState('Plumbing');
  const [selectedState, setSelectedState] = useState('Lagos');
  const [selectedLga, setSelectedLga] = useState('Ikeja');
  const [jobType, setJobType] = useState<'task' | 'contract' | 'full_time'>('task');
  const [isUrgent, setIsUrgent] = useState(false);
  const [workMode, setWorkMode] = useState<'on-site' | 'remote' | 'hybrid'>('on-site');
  const [customCategory, setCustomCategory] = useState('');

  // Paystack Urgent payment modal trigger
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Auth check on mount
  useEffect(() => {
    async function checkUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      } else {
        setUserEmail(session.user.email || '');
        setUserId(session.user.id || '');
        setAuthChecking(false);
      }
    }
    checkUser();
  }, [supabase, router]);

  // Fetch dynamic listed job titles & categories from active data for smart recommendations
  useEffect(() => {
    async function fetchDatabaseSuggestions() {
      try {
        const { data } = await supabase
          .from('jobs')
          .select('title, category')
          .limit(150);
          
        if (data) {
          const titlesSet = new Set<string>();
          const catsSet = new Set<string>();
          data.forEach((j: any) => {
            if (j.title) {
              const t = j.title.replace('[TEST]', '').replace('[test]', '').trim();
              if (t) titlesSet.add(t);
            }
            if (j.category) {
              const c = j.category.trim();
              if (c) catsSet.add(c);
            }
          });
          setListedTitles(Array.from(titlesSet));
          setListedCategories(Array.from(catsSet));
        }
      } catch (e) {
        console.error('Error prefetching dynamic user choices:', e);
      }
    }
    fetchDatabaseSuggestions();
  }, [supabase]);

  // Merge default presets + dynamic listed databases
  const jobTitleSuggestions = Array.from(new Set([
    ...SUGGESTED_JOB_TITLES,
    ...listedTitles
  ]));

  const categorySuggestions = Array.from(new Set([
    ...AVAILABLE_CATEGORIES.map(c => c.label),
    ...listedCategories
  ]));

  // Unified submission caller
  const handleJobPostSubmit = async (paymentRef?: string) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const budgetNum = parseFloat(budget);
      const result = await postJobAction({
        title,
        description,
        budget: budgetNum,
        category: category,
        location_state: workMode === 'remote' ? 'Remote' : selectedState,
        location_lga: workMode === 'remote' ? 'Remote' : selectedLga,
        job_type: jobType,
        is_urgent: isUrgent,
        work_mode: workMode
      }, paymentRef);

      if (result.success) {
        setSuccess(true);
        setShowPaymentModal(false);
        setTimeout(() => {
          router.push('/dashboard');
        }, 2200);
      } else {
        setErrorMsg(result.error || 'Failed to submit the job. Try again.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !budget.trim()) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    if (!category.trim()) {
      setErrorMsg('Please specify or pick a category.');
      return;
    }

    if (workMode !== 'remote' && (!selectedState || !selectedLga)) {
      setErrorMsg('Please select a valid location for on-site or hybrid work.');
      return;
    }

    const budgetNum = parseFloat(budget);
    if (isNaN(budgetNum) || budgetNum <= 0) {
      setErrorMsg('Budget must be a positive number.');
      return;
    }

    if (isUrgent) {
      // Prevent immediate submission and present payment gateway
      setShowPaymentModal(true);
      return;
    }

    // Standard free/organic post submission
    await handleJobPostSubmit();
  };

  const handlePaystackSuccess = async (response: { reference: string; status: string }) => {
    await handleJobPostSubmit(response.reference);
  };

  const showInspectionWarning = category === 'Plumbing' || category === 'Electrical';

  if (authChecking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white text-[#0A192F]">
        <div className="flex flex-col items-center gap-3">
          <LogoLink
            className="bg-white rounded-[1.5rem] shadow-sm border border-gray-100 flex items-center gap-1.5 p-1 w-fit mb-3 animate-pulse cursor-pointer hover:opacity-80 transition-opacity"
          />
          <span className="text-xs font-mono text-gray-500 font-bold uppercase tracking-wide">
            Checking permission...
          </span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-[#0A192F] py-8 px-4 flex flex-col justify-center items-center relative">
      <div className="w-full max-w-2xl" id="post-job-container">
        
        {/* Back Link */}
        <button
          onClick={() => router.push('/dashboard')}
          className="group mb-6 inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-900 uppercase tracking-wider transition-all cursor-pointer"
          id="back-to-dashboard-btn"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Dashboard</span>
        </button>

        {/* Success Modal/Banner overlay */}
        <AnimatePresence>
          {success && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-8 shadow-xl border border-blue-100 text-center mb-8 flex flex-col items-center justify-center relative overflow-hidden"
              id="submit-success-state"
            >
              <div className="absolute right-0 top-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl"></div>
              <CheckCircle className="w-16 h-16 text-blue-600 mb-4 animate-bounce" />
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                Job Posted Successfully!
              </h2>
              <p className="text-sm text-gray-500 mt-2 max-w-sm">
                Your job description is now online. Workers in {selectedLga}, {selectedState} have been notified.
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs font-mono font-semibold uppercase text-[#0A192F] bg-[#0A192F]/5 px-3 py-1.5 rounded-lg active:scale-95 transition-all">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Redirecting back...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!success && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden"
            id="post-job-form-card"
          >
            {/* Header branding */}
            <div className="bg-[#0A192F] text-white p-6 md:p-8 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>
              <div className="flex items-center gap-3">
                <LogoLink />
                <div>
                  <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">
                    Post a New Job
                  </h1>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-blue-400 font-semibold">
                    BukieBrain Marketplace
                  </span>
                </div>
              </div>
            </div>

            {/* Error Message */}
            <SmoothCollapse isOpen={!!errorMsg}>
              <div className="m-6 md:mx-8 mb-0 p-4 bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl font-medium" id="post-job-error">
                {errorMsg}
              </div>
            </SmoothCollapse>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
              
              {/* Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Job Title *
                </label>
                <SmartSuggestInput
                  value={title}
                  onChange={setTitle}
                  placeholder="e.g. Broken Pipes in Kitchen / Academic Private Tutor"
                  suggestions={jobTitleSuggestions}
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Job Description *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe the nature of the work, expected results, specific tools if any, or general instructions..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 focus:border-[#0A192F] focus:bg-white text-sm px-4 py-3 rounded-xl transition-all outline-none text-gray-900 placeholder-gray-400 font-medium resize-none"
                />
              </div>

              {/* Grid 1: Budget and Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                    Budget (₦ Naira) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">
                      ₦
                    </span>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 15000"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 focus:border-[#0A192F] focus:bg-white text-sm pl-9 pr-4 py-3 rounded-xl transition-all outline-none text-gray-900 placeholder-gray-400 font-mono font-semibold"
                    />
                  </div>
                  
                  {/* Dynamic Market Rate Suggestion Widget */}
                  {(() => {
                    const rate = getMarketRateRange(category, jobType);
                    const median = Math.round((rate.min + rate.max) / 2);
                    const isCustom = category.startsWith('Other');
                    return (
                      <div className="mt-2 bg-blue-50 border border-blue-100 rounded-xl p-2.5 transition-all text-xs text-gray-700">
                        <div className="flex flex-wrap items-center justify-between gap-1.5">
                          <div className="flex items-center gap-1.5 font-semibold text-gray-800">
                            <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                            <span>Competitive Market Rate:</span>
                            <span className="text-blue-600 font-extrabold text-sm font-mono">
                              ₦{rate.min.toLocaleString()} - ₦{rate.max.toLocaleString()}
                            </span>
                            <span className="text-[10px] font-normal text-gray-400 lowercase">
                              {rate.label}
                            </span>
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => setBudget(median.toString())}
                            className="text-[10px] bg-[#0A192F] hover:bg-[#112a4f] text-white font-bold px-2.5 py-1 rounded-lg transition-transform active:scale-[0.96] shadow-sm cursor-pointer whitespace-nowrap inline-flex items-center gap-1"
                            title="Auto-fill with recommended median rate"
                          >
                            <Sparkles className="w-3 h-3 text-amber-400 fill-amber-400" />
                            Apply Suggested (₦{median.toLocaleString()})
                          </button>
                        </div>
                        {isCustom && (
                          <p className="text-[9px] text-gray-400 mt-1">
                            * Custom category rate suggestion is estimated. Adjust according to your specific task scope.
                          </p>
                        )}
                      </div>
                    );
                  })()}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                    Category *
                  </label>
                  <SmartSuggestInput
                    value={category}
                    onChange={setCategory}
                    placeholder="Type or select category"
                    suggestions={categorySuggestions}
                    required
                  />
                </div>
              </div>

              {/* Category-Specific Warning Notification */}
              <AnimatePresence>
                {showInspectionWarning && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-3 text-amber-800" id="inspection-warning-alert">
                      <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                      <div>
                        <span className="block text-xs font-bold uppercase tracking-wide mb-1">
                          Inspection Fee Trigger
                        </span>
                        <p className="text-xs font-medium leading-relaxed">
                          Note: This {category} category requires an initial Inspection Fee of <strong>₦2,000</strong> to be paid to the artisan during the hiring process.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Grid 2: State and LGA */}
              {workMode !== 'remote' && (
                <div className="w-full">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                    Location (State & LGA) *
                  </label>
                  <LocationSelector
                    selectedState={selectedState}
                    selectedLga={selectedLga}
                    onStateChange={setSelectedState}
                    onLgaChange={setSelectedLga}
                  />
                </div>
              )}

              {/* Job Type Dropdown matching DB enum values */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Job Type / Arrangement
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {(['task', 'contract', 'full_time'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setJobType(type)}
                      className={`p-3 text-left rounded-xl border-2 transition-all ${
                        jobType === type
                          ? 'border-[#0A192F] bg-[#0A192F]/5'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <span className={`block text-sm font-semibold ${jobType === type ? 'text-[#0A192F]' : 'text-gray-500'}`}>
                        {type === 'task' ? 'One-time task' : type === 'contract' ? 'Project / Contract' : 'Ongoing work'}
                      </span>
                      <span className="block text-[10px] font-normal leading-relaxed text-gray-400 mt-1.5">
                        {type === 'task'
                          ? 'This is a one-off single task that will be completed and signed out.'
                          : type === 'contract'
                          ? 'The work is packaged in a scope with specific deliverables, time-range or phases.'
                          : 'This position is for a recurring or indefinite ongoing business engagement.'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Work Mode
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['on-site', 'remote', 'hybrid'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => {
                        setWorkMode(mode);
                        // When remote is selected, location can be cleared
                        if (mode === 'remote') {
                          setSelectedState('');
                          setSelectedLga('');
                        }
                      }}
                      className={`p-3 rounded-xl border-2 text-sm text-left font-semibold transition-all ${
                        workMode === mode
                          ? 'border-[#0A192F] bg-[#0A192F]/5 text-[#0A192F]'
                          : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      <span className="block text-sm">
                        {mode === 'on-site' ? 'On-site' : mode === 'remote' ? 'Remote' : 'Hybrid'}
                      </span>
                      <span className="block text-[10px] font-normal text-gray-400 mt-0.5 leading-tight gap-0">
                        {mode === 'on-site' ? 'Worker must be there' : mode === 'remote' ? 'Work from anywhere' : 'Mix of both'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-100 my-6"></div>

              {/* Urgent Toggle and Telegram Blast Badge */}
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold uppercase text-gray-800 tracking-wide">
                      Urgent Boost (Monetization Upgrade)
                    </span>
                    <AnimatePresence>
                      {isUrgent && (
                        <motion.span 
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          className="bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shrink-0"
                          id="telegram-blast-badge"
                        >
                          <Zap className="w-3 h-3 fill-amber-500 stroke-none" />
                          <span>Includes Telegram Blast</span>
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                    Flag this job with a fire badge, pinned at the top of the worker feed + trigger immediate Telegram notification to local verified channels for <strong>₦1,000</strong>.
                  </p>
                </div>

                <div className="relative flex items-center select-none shrink-0" id="urgent-toggle-switch">
                  <label htmlFor="isUrgentToggle" className="flex items-center cursor-pointer gap-2">
                    <span className="text-xs font-bold text-gray-500">Promote (₦1,000)</span>
                    <div className="relative">
                      <input
                        type="checkbox"
                        id="isUrgentToggle"
                        checked={isUrgent}
                        onChange={() => setIsUrgent(!isUrgent)}
                        className="sr-only"
                      />
                      <div className={`w-11 h-6 rounded-full transition-colors duration-200 outline-none ${isUrgent ? 'bg-amber-500' : 'bg-gray-200'}`}></div>
                      <div className={`absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full shadow-md transition-transform duration-200 ${isUrgent ? 'transform translate-x-5' : ''}`}></div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row justify-end items-center gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="w-full sm:w-auto text-xs text-gray-500 hover:text-gray-900 font-bold uppercase tracking-wider py-3.5 px-6 rounded-xl transition-all cursor-pointer bg-gray-50 hover:bg-gray-100 text-center"
                  id="cancel-post-btn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto min-w-[180px] flex items-center justify-center gap-2 bg-[#0A192F] hover:bg-[#112a4f] text-white text-xs font-extrabold uppercase tracking-wider py-3.5 px-6 rounded-xl transition-all shadow-md shadow-blue-950/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
                  id="submit-job-post-btn"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Posting...</span>
                    </>
                  ) : (
                    <>
                      <Briefcase className="w-4 h-4" />
                      <span>{isUrgent ? 'Promote & Post (₦1,000)' : 'Post Job Standard'}</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </motion.div>
        )}

      </div>

      {/* Paystack Urgent Checkout Slide-Up Drawer Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPaymentModal(false)}
              className="fixed inset-0 bg-black z-50 pointer-events-auto"
            />
            
            {/* Payment Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed inset-x-4 bottom-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl z-50 space-y-6"
              id="payment-gateway-modal"
            >
              <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <span className="font-extrabold text-sm text-gray-900 uppercase tracking-wide">
                    Want your job seen faster?
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-amber-50/50 rounded-2xl p-4 border border-amber-100 flex gap-3 text-amber-900">
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-500" />
                  <div className="text-xs text-amber-800 leading-normal">
                    Urgent jobs get sent directly to workers in your area via Telegram. More eyes, faster responses.
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex justify-between items-center">
                  <div>
                    <span className="text-xs font-extrabold text-gray-900 block">
                      Urgent listing fee
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">
                      Your job will be sent to workers near you instantly.
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-[#0A192F] font-mono">
                      ₦1,000
                    </span>
                  </div>
                </div>

                <div className="text-[10px] text-gray-400 leading-relaxed text-center">
                  After payment, your job goes live immediately and is shared with verified workers in your location.
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="text-xs text-gray-500 hover:text-gray-900 font-bold uppercase tracking-wider py-3 px-4 rounded-xl transition-all cursor-pointer bg-gray-100 hover:bg-gray-200 text-center"
                >
                  Go back
                </button>
                <PaystackButton
                  amount={1000}
                  email={userEmail}
                  metadata={{
                    type: 'urgent_boost',
                    user_id: userId
                  }}
                  text="Confirm & Pay ₦1,000"
                  onSuccess={handlePaystackSuccess}
                />
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[9px] text-gray-400 font-bold uppercase tracking-widest pt-2">
                <ShieldCheck className="w-4.5 h-4.5 text-blue-600" />
                <span>Paystack Network Secured</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </main>
  );
}
