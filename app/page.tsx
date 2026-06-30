'use client';
import { LogoBase64 } from '@/lib/logo';
import React, { useState, useEffect } from 'react';
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase-client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Menu, Search, MapPin, X, ChevronDown, ChevronRight, ArrowRight, Briefcase, Hammer, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FadeUp } from '@/components/FadeUp';
import { SmoothCollapse } from '@/components/SmoothCollapse';
import { nigeriaLocations, nigerianStates } from '@/lib/nigeria-locations';
import { SmartSuggestInput } from '@/components/SmartSuggestInput';

import { SiteFooter } from '@/components/SiteFooter';
import { Sidebar } from '@/components/Sidebar';
import { LogoLink } from '@/components/LogoLink';

export default function Home() {
  const router = useRouter();
  const [showEmployerBanner, setShowEmployerBanner] = useState(true);
  const [oauthError, setOauthError] = useState<{ code: string; message: string } | null>(null);
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  
  const [selectedState, setSelectedState] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [whatQuery, setWhatQuery] = useState('');
  
  // Dynamic rotating categories matching the high-impact editorial/Behance hero layout
  const rotatingPhrases = [
    "Artisans",
    "Plumbers",
    "Electricians",
    "Carpenters",
    "Painters",
    "Tilers",
    "Developers",
    "Designers",
    "Writers",
    "Caterers",
    "Tailors",
    "Cleaners"
  ];
  const [rotatingIndex, setRotatingIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotatingIndex((prev) => (prev + 1) % rotatingPhrases.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [rotatingPhrases.length]);

  
  // High-quality defaults available instantly on focus
  const [listedTitlesAndCats, setListedTitlesAndCats] = useState<string[]>([
    "Plumbing", "Electrical", "Carpentry", "Painting", "Screeding", "Welding", "HVAC / Air Conditioning", "Tiling", "Catering", "Tailoring", "Hair & Beauty Services", "Cleaning Services", "Driving", "Gardening", "Laundry", "Web Development", "Mobile App Development", "Graphic Design", "Accounting", "Tutoring / Teaching", "Photography", "Video Editing", "Content Writing", "Social Media Management", "Kitchen plumbing pipe repair", "House wall screeding and painting", "Electrical wiring installation", "Traditional native wear sewing", "Custom responsive Next.js website dev", "E-commerce mobile app development", "High precision metal welding", "Traditional catering service for weddings"
  ]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      const search = window.location.search;
      
      const searchParams = new URLSearchParams(search);
      const queryError = searchParams.get('error');
      const queryErrorDesc = searchParams.get('error_description') || searchParams.get('error_msg');
      
      let hashError = '';
      let hashErrorDesc = '';
      if (hash && hash.startsWith('#')) {
        const hashParams = new URLSearchParams(hash.substring(1));
        hashError = hashParams.get('error') || '';
        hashErrorDesc = hashParams.get('error_description') || hashParams.get('error_msg') || '';
      }
      
      const activeError = hashError || queryError;
      const activeDesc = hashErrorDesc || queryErrorDesc;
      
      if (activeError) {
        let userMessage = activeDesc || 'An authentication error occurred.';
        if (activeError === 'unsupported_provider') {
          userMessage = 'Google OAuth login provider is not enabled or fully configured in your Supabase project settings. Please make sure Google is enabled under Authentication -> Providers -> Google inside your Supabase Dashboard.';
        } else if (activeError === 'redirect_uri_mismatch' || activeError === 'invalid_redirect_uri') {
          userMessage = 'The redirect URI does not match the registered redirect URIs in your Supabase project settings. Please make sure to add your production URL (including "/api/auth/callback") to your allowed Redirect URLs inside your Supabase Dashboard (under Authentication -> URL Configuration).';
        } else if (activeError === 'auth_failed') {
          userMessage = 'Google authentication failed or was cancelled. Please check your credentials and try again.';
        }
        
        setOauthError({
          code: activeError,
          message: userMessage
        });
        
        // Clean URL so the error isn't sticky on page refreshes
        window.history.replaceState(null, '', window.location.pathname);
      }
    }

    async function checkActiveSession() {
      if (!isSupabaseConfigured()) {
        setHasSession(true); // Treat as logged in/mock mode when Supabase is offline
        return;
      }
      try {
        const supabase = getSupabaseBrowserClient();
        const { data: { session } } = await supabase.auth.getSession();
        setHasSession(!!session);
      } catch (err) {
        setHasSession(false);
      }
    }

    async function fetchLandingSuggestions() {
      if (!isSupabaseConfigured()) {
        console.warn('Supabase is not configured yet. Landing page is running with high-quality default suggestions.');
        return;
      }
      try {
        const supabase = getSupabaseBrowserClient();
        const { data } = await supabase.from('jobs').select('title, category').limit(100);
        
        const suggestionsSet = new Set<string>([
          "Plumbing", "Electrical", "Carpentry", "Painting", "Screeding", "Welding", "HVAC / Air Conditioning", "Tiling", "Catering", "Tailoring", "Hair & Beauty Services", "Cleaning Services", "Driving", "Gardening", "Laundry", "Web Development", "Mobile App Development", "Graphic Design", "Accounting", "Tutoring / Teaching", "Photography", "Video Editing", "Content Writing", "Social Media Management", "Kitchen plumbing pipe repair", "House wall screeding and painting", "Electrical wiring installation", "Traditional native wear sewing", "Custom responsive Next.js website dev", "E-commerce mobile app development", "High precision metal welding", "Traditional catering service for weddings"
        ]);

        if (data) {
          data.forEach((j: any) => {
            if (j.title) {
              const t = (j.title || '').replace('[TEST]', '').replace('[test]', '').trim();
              if (t) suggestionsSet.add(t);
            }
            if (j.category) {
              const c = j.category.trim();
              if (c) suggestionsSet.add(c);
            }
          });
        }
        
        setListedTitlesAndCats(Array.from(suggestionsSet));
      } catch (err) {
        console.error('Failed to pre-fetch landing page search queries:', err);
      }
    }
    checkActiveSession();
    fetchLandingSuggestions();
  }, []);

  const handlePostJobClick = () => {
    if (hasSession === false) {
      router.push('/login?next=/dashboard/post-job');
    } else {
      router.push('/dashboard/post-job');
    }
  };

  // Accordion states
  const [openTrending, setOpenTrending] = useState(true);
  const [openArtisans, setOpenArtisans] = useState(false);
  const [openEmployers, setOpenEmployers] = useState(false);
  const [openAbout, setOpenAbout] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-brand-bg text-brand-navy font-sans flex flex-col justify-between">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      {/* Navigation Bar */}
      <header className="flex justify-between items-center px-4 sm:px-6 py-4 bg-brand-bg border-b border-brand-border/40 sticky top-0 z-50 shadow-[0_1px_3px_rgba(10,25,47,0.01)] backdrop-blur-md">
        <LogoLink />
        <div className="flex items-center gap-3 sm:gap-4">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/login')}
            className="text-sm font-semibold text-brand-navy/80 hover:text-brand-navy transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-brand-green rounded-lg px-2.5 py-1.5 cursor-pointer"
          >
            Sign in
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            onClick={handlePostJobClick}
            className="bg-brand-green hover:bg-brand-green/90 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl whitespace-nowrap transition-all outline-none focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-2 shadow-sm cursor-pointer" 
          >
            Post a Job
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setIsSidebarOpen(true)}
            className="text-brand-navy p-2 hover:bg-brand-surface rounded-xl transition-all outline-none focus-visible:ring-2 focus-visible:ring-brand-green cursor-pointer"
          >
            <Menu className="w-5.5 h-5.5" />
          </motion.button>
        </div>
      </header>

      <main className="px-4 sm:px-6 py-12 max-w-5xl mx-auto w-full flex-grow space-y-16">
        {oauthError && (
          <div className="p-4 bg-red-50/70 border border-red-200/60 rounded-2xl flex gap-3 text-sm text-red-800 relative shadow-sm max-w-3xl mx-auto" id="landing-oauth-error">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-display font-bold text-red-900 mb-1">Google Sign-In Configuration Required</h3>
              <p className="leading-relaxed font-sans text-red-800/90">{oauthError.message}</p>
              <div className="mt-2 text-xs text-red-600 font-semibold font-mono">
                Error: {oauthError.code}
              </div>
            </div>
            <button 
              onClick={() => setOauthError(null)} 
              className="absolute top-3 right-3 text-red-400 hover:text-red-700 p-1 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Hero Area - Bold, editorial Behance-inspired title structure adapted to BukieBrain's identity */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 15 }}
          className="text-center w-full max-w-4xl mx-auto py-4 px-2 flex flex-col items-center justify-center"
        >
          <h1 className="text-3xl sm:text-6xl md:text-7xl font-display font-black text-brand-navy tracking-tight leading-[1.05] text-center max-w-4xl mx-auto">
            Nigeria&apos;s <br className="sm:hidden" />
            <span className="relative inline-block text-brand-green min-w-[280px] sm:min-w-[340px] md:min-w-[400px] text-center h-[1.15em] overflow-hidden align-bottom">
              <AnimatePresence mode="wait">
                <motion.span
                  key={rotatingIndex}
                  initial={{ y: '70%', opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: '-70%', opacity: 0 }}
                  transition={{ type: "spring", stiffness: 220, damping: 18 }}
                  className="absolute left-0 right-0 whitespace-nowrap"
                >
                  Best {rotatingPhrases[rotatingIndex]}
                </motion.span>
              </AnimatePresence>
            </span>
            <br /> Are on BukieBrainJobs
          </h1>
          
          <p className="text-sm sm:text-base md:text-lg text-brand-navy/60 font-sans font-medium mt-6 max-w-2xl mx-auto leading-relaxed">
            The all in one marketplace to post jobs or find freelance and service workers across Nigeria. Hirers can easily source verified talent, while professionals can securely browse gigs, communicate directly, and get paid safely via secure wallets.
          </p>

          {/* Centered Pill Call-To-Actions (Behance-Style) */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8 w-full max-w-md mx-auto">
            <motion.button
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={handlePostJobClick}
              className="w-full sm:w-auto bg-brand-green text-white hover:bg-brand-green/95 font-bold text-base px-8 py-3.5 rounded-full shadow-md cursor-pointer text-center whitespace-nowrap"
            >
              Hire Artisans/Freelancers
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push('/dashboard/jobs')}
              className="w-full sm:w-auto bg-brand-surface hover:bg-brand-border/30 text-brand-navy border border-brand-border/60 font-bold text-base px-8 py-3.5 rounded-full shadow-sm cursor-pointer text-center whitespace-nowrap"
            >
              Browse Gig Jobs
            </motion.button>
          </div>
        </motion.div>


        {/* Search & Categories Cluster */}
        <div className="space-y-6 max-w-3xl mx-auto w-full">
          {/* Search Container */}
          <FadeUp delay={0.1} className="relative z-20">
            <motion.form 
              whileHover={{ y: -2, boxShadow: "0 12px 30px rgba(10, 25, 47, 0.05)" }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              onSubmit={(e) => {
                e.preventDefault();
                let whereParam = '';
                if (selectedState && selectedArea) {
                  whereParam = `${selectedArea}, ${selectedState}`;
                } else {
                  whereParam = selectedState || selectedArea || '';
                }
                router.push(`/dashboard/jobs?what=${encodeURIComponent(whatQuery)}&where=${encodeURIComponent(whereParam)}`);
              }}
              className="flex flex-col md:flex-row items-center w-full bg-white border border-brand-border/70 rounded-[2rem] md:rounded-full shadow-[0_4px_20px_rgba(10,25,47,0.03)] px-5 py-4 md:py-2.5 focus-within:ring-2 focus-within:ring-brand-green/20 focus-within:border-brand-green transition-all duration-300 gap-4 md:gap-0"
            >
              <div className="flex items-center flex-1 w-full min-w-0">
                <Search className="w-5 h-5 text-brand-navy/40 mr-3 flex-shrink-0" />
                <SmartSuggestInput
                  value={whatQuery}
                  onChange={setWhatQuery}
                  placeholder="Search jobs, categories, keywords..."
                  suggestions={listedTitlesAndCats}
                  flat
                  className="w-full font-sans font-medium placeholder:text-brand-navy/35 text-brand-navy text-sm sm:text-base bg-transparent border-0 focus:outline-none focus:ring-0"
                />
              </div>
              
              <div className="hidden md:block w-[1.5px] h-7 bg-brand-navy/10 mx-5 flex-shrink-0"></div>
              
              <div className="flex items-center flex-1 w-full min-w-0 gap-2 border-t border-brand-border/30 pt-3 md:border-0 md:pt-0">
                <MapPin className="w-5 h-5 text-brand-navy/40 flex-shrink-0 hidden md:block" />
                <div className="flex-1 min-w-0 flex items-center gap-1.5">
                  <SmartSuggestInput
                    value={selectedState}
                    onChange={(val) => {
                      setSelectedState(val);
                      setSelectedArea('');
                    }}
                    placeholder="State..."
                    suggestions={nigerianStates}
                    flat
                    className="w-1/2 font-sans font-medium placeholder:text-brand-navy/35 text-brand-navy text-sm bg-transparent border-0 focus:outline-none focus:ring-0"
                  />
                  <span className="text-brand-navy/20 font-bold">/</span>
                  <SmartSuggestInput
                    value={selectedArea}
                    onChange={setSelectedArea}
                    placeholder={selectedState ? "Area..." : "Pick State"}
                    suggestions={selectedState ? (nigeriaLocations[selectedState] || []) : []}
                    disabled={!selectedState}
                    flat
                    className="w-1/2 font-sans font-medium placeholder:text-brand-navy/35 text-brand-navy text-sm bg-transparent border-0 focus:outline-none focus:ring-0"
                  />
                </div>
              </div>

              <motion.button 
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                className="bg-brand-green hover:bg-brand-green/95 text-white text-sm font-bold px-7 py-3 rounded-full whitespace-nowrap transition-all outline-none md:ml-3 md:w-auto w-full cursor-pointer shadow-sm"
              >
                Search
              </motion.button>
            </motion.form>
          </FadeUp>

          {/* Horizontal Category Chips */}
          <FadeUp delay={0.15} className="w-full">
            <div className="flex items-center gap-2 overflow-x-auto pb-3 pt-1 px-1 custom-scrollbar scrollbar-none snap-x">
              <span className="text-xs font-bold text-brand-navy/45 uppercase tracking-wider whitespace-nowrap mr-2 select-none self-center">Popular:</span>
              {[
                { label: "🔨 Carpentry", query: "Carpentry" },
                { label: "🚰 Plumbing", query: "Plumbing" },
                { label: "⚡ Electrical", query: "Electrical" },
                { label: "🎨 Painting", query: "Painting" },
                { label: "🧱 Screeding", query: "Screeding" },
                { label: "💻 Web Dev", query: "Web Development" },
                { label: "📱 Mobile Apps", query: "Mobile App Development" },
                { label: "💅 Beauty & Hair", query: "Hair & Beauty Services" },
                { label: "👗 Tailoring", query: "Tailoring" },
                { label: "🧼 Cleaning", query: "Cleaning Services" }
              ].map((chip, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.04, backgroundColor: "rgba(0, 135, 90, 0.08)", borderColor: "rgba(0, 135, 90, 0.3)" }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    setWhatQuery(chip.query);
                    router.push(`/dashboard/jobs?what=${encodeURIComponent(chip.query)}`);
                  }}
                  className="snap-start flex-shrink-0 bg-brand-surface border border-brand-border/60 hover:border-brand-green/30 text-brand-navy/80 hover:text-brand-green font-sans font-semibold text-xs sm:text-sm px-4 py-2 rounded-full transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-brand-green"
                >
                  {chip.label}
                </motion.button>
              ))}
            </div>
          </FadeUp>
        </div>

        {/* Target Audience Cards */}
        <FadeUp delay={0.2} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Employer Card */}
          <motion.div 
            whileHover={{ y: -6, scale: 1.015, borderColor: "rgba(10, 25, 47, 0.18)", boxShadow: "0 12px 30px rgba(10, 25, 47, 0.04)" }}
            whileTap={{ scale: 0.995 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="bg-brand-bg border border-brand-border/75 rounded-2xl p-6 shadow-[0_4px_16px_rgba(10, 25, 47, 0.02)] flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-brand-surface flex items-center justify-center mb-4">
                <Briefcase className="w-6 h-6 text-brand-navy" />
              </div>
              <h3 className="text-xl font-display font-bold text-brand-navy mb-2">Hire Talent</h3>
              <p className="text-sm text-brand-navy/60 leading-relaxed mb-6 font-sans">
                Post a job. Get matched with verified workers in your area. Pay only when the job is done.
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePostJobClick}
              className="w-full bg-brand-navy hover:bg-brand-navy/95 text-white font-semibold text-sm py-3 rounded-xl transition-all shadow-sm cursor-pointer"
            >
              Post a Job
            </motion.button>
          </motion.div>

          {/* Worker Card */}
          <motion.div 
            whileHover={{ y: -6, scale: 1.015, borderColor: "rgba(10, 25, 47, 0.18)", boxShadow: "0 12px 30px rgba(10, 25, 47, 0.04)" }}
            whileTap={{ scale: 0.995 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="bg-brand-bg border border-brand-border/75 rounded-2xl p-6 shadow-[0_4px_16px_rgba(10, 25, 47, 0.02)] flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-brand-surface flex items-center justify-center mb-4">
                <Hammer className="w-6 h-6 text-brand-green" />
              </div>
              <h3 className="text-xl font-display font-bold text-brand-navy mb-2">Get Hired</h3>
              <p className="text-sm text-brand-navy/60 leading-relaxed mb-6 font-sans">
                Browse jobs in your area. Apply, get hired, and get paid straight to your wallet.
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/dashboard/jobs')}
              className="w-full bg-brand-green hover:bg-brand-green/90 text-white font-semibold text-sm py-3 rounded-xl transition-all shadow-sm cursor-pointer"
            >
              Browse Jobs
            </motion.button>
          </motion.div>
        </FadeUp>

        {/* Accordion Navigation List */}
        <FadeUp delay={0.4} className="space-y-4 pt-4 border-t border-brand-border/40">
          {/* Item 1 */}
          <motion.div 
            whileHover={{ scale: 1.015, y: -2, borderColor: "rgba(10, 25, 47, 0.15)" }}
            transition={{ type: "spring", stiffness: 350, damping: 18 }}
            className="bg-brand-bg border border-brand-border/60 rounded-2xl p-5 shadow-[0_2px_12px_rgba(10,25,47,0.01)] transition-all duration-300"
          >
            <button 
              onClick={() => setOpenTrending(!openTrending)}
              className="w-full flex justify-between items-center text-left group outline-none cursor-pointer"
            >
              <div className="flex flex-col">
                <span className="font-display font-bold text-lg text-brand-navy group-hover:text-brand-green transition-colors">What&apos;s trending on BukieBrain</span>
                <span className="text-brand-navy/55 text-xs sm:text-sm mt-0.5 font-sans">
                  See what&apos;s happening to further your job search.
                </span>
              </div>
              <motion.span
                animate={{ rotate: openTrending ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="text-brand-navy/50"
              >
                <ChevronDown className="w-5 h-5" />
              </motion.span>
            </button>
            <SmoothCollapse isOpen={openTrending}>
               <div className="mt-4 pt-4 border-t border-brand-border/40 space-y-1">
                 {[
                   { text: "Trending Searches", path: "/dashboard/jobs" },
                   { text: "Trending Jobs", path: "/dashboard/jobs" },
                   { text: "Trending Locations", path: "/dashboard/jobs" }
                 ].map((item, idx) => (
                  <motion.div 
                    key={idx}
                    whileHover={{ scale: 1.01, x: 6, backgroundColor: "rgba(10, 25, 47, 0.02)" }}
                    whileTap={{ scale: 0.99 }}
                    tabIndex={0} 
                    onClick={() => router.push(item.path)}
                    className="flex justify-between items-center cursor-pointer hover:bg-brand-surface active:bg-brand-surface/80 transition-all px-4 py-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-brand-green"
                  >
                    <span className="font-sans font-medium text-brand-navy text-sm sm:text-base">{item.text}</span>
                    <ChevronRight className="w-5 h-5 text-brand-navy/45" />
                  </motion.div>
                ))}
              </div>
            </SmoothCollapse>
          </motion.div>

          {/* Item 2 - Sign In Card */}
          <motion.div 
            whileHover={{ scale: 1.015, y: -2, borderColor: "rgba(10, 25, 47, 0.15)" }}
            whileTap={{ scale: 0.995 }}
            transition={{ type: "spring", stiffness: 350, damping: 18 }}
            className="bg-brand-bg border border-brand-border/60 rounded-2xl p-5 shadow-[0_2px_12px_rgba(10,25,47,0.01)] transition-all duration-300"
          >
            <button 
              onClick={() => router.push('/login')}
              className="w-full flex justify-between items-center group outline-none text-left cursor-pointer"
            >
              <div className="flex flex-col">
                <span className="font-display font-bold text-lg text-brand-navy group-hover:text-brand-green transition-colors">Sign in to your account</span>
                <span className="text-brand-navy/55 text-xs sm:text-sm mt-0.5 font-sans">Access your profile, messages, and wallet.</span>
              </div>
              <motion.span
                whileHover={{ x: 4 }}
                transition={{ type: "spring", stiffness: 300, damping: 10 }}
              >
                <ChevronRight className="w-5 h-5 text-brand-navy/50 group-hover:translate-x-1 transition-transform" />
              </motion.span>
            </button>
          </motion.div>

          {/* Item 3 */}
          <motion.div 
            whileHover={{ scale: 1.015, y: -2, borderColor: "rgba(10, 25, 47, 0.15)" }}
            transition={{ type: "spring", stiffness: 350, damping: 18 }}
            className="bg-brand-bg border border-brand-border/60 rounded-2xl p-5 shadow-[0_2px_12px_rgba(10,25,47,0.01)] transition-all duration-300"
          >
            <button 
              onClick={() => setOpenArtisans(!openArtisans)}
              className="w-full flex justify-between items-center text-left group outline-none cursor-pointer"
            >
              <div className="flex flex-col">
                <span className="font-display font-bold text-lg text-brand-navy group-hover:text-brand-green transition-colors">Looking to Get Hired? Start here.</span>
                <span className="text-brand-navy/55 text-xs sm:text-sm mt-0.5 font-sans">Browse opportunities, setup passport, and manage payments.</span>
              </div>
              <motion.span
                animate={{ rotate: openArtisans ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="text-brand-navy/50"
              >
                <ChevronDown className="w-5 h-5" />
              </motion.span>
            </button>
            <SmoothCollapse isOpen={openArtisans}>
              <div className="mt-4 pt-4 border-t border-brand-border/40 space-y-1">
                <motion.div
                  whileHover={{ scale: 1.01, x: 4, backgroundColor: "rgba(10, 25, 47, 0.02)" }}
                  whileTap={{ scale: 0.99 }}
                  tabIndex={0}
                  onClick={() => router.push('/dashboard/jobs')}
                  className="flex justify-between items-center cursor-pointer hover:bg-brand-surface transition-all px-4 py-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-brand-green"
                >
                  <span className="font-sans font-medium text-brand-navy text-sm sm:text-base">Browse available jobs near you</span>
                  <ChevronRight className="w-5 h-5 text-brand-navy/45" />
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.01, x: 4, backgroundColor: "rgba(10, 25, 47, 0.02)" }}
                  whileTap={{ scale: 0.99 }}
                  tabIndex={0}
                  onClick={() => router.push('/login')}
                  className="flex justify-between items-center cursor-pointer hover:bg-brand-surface transition-all px-4 py-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-brand-green"
                >
                  <span className="font-sans font-medium text-brand-navy text-sm sm:text-base">Set up your BukiePassport</span>
                  <ChevronRight className="w-5 h-5 text-brand-navy/45" />
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.01, x: 4, backgroundColor: "rgba(10, 25, 47, 0.02)" }}
                  whileTap={{ scale: 0.99 }}
                  tabIndex={0}
                  onClick={() => {
                    setOpenFaq(2);
                    document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex justify-between items-center cursor-pointer hover:bg-brand-surface transition-all px-4 py-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-brand-green"
                >
                  <span className="font-sans font-medium text-brand-navy text-sm sm:text-base">How payments work to Get Hired</span>
                  <ChevronDown className="w-5 h-5 text-brand-navy/45" />
                </motion.div>
              </div>
            </SmoothCollapse>
          </motion.div>

          {/* Item 4 */}
          <motion.div 
            whileHover={{ scale: 1.015, y: -2, borderColor: "rgba(10, 25, 47, 0.15)" }}
            transition={{ type: "spring", stiffness: 350, damping: 18 }}
            className="bg-brand-bg border border-brand-border/60 rounded-2xl p-5 shadow-[0_2px_12px_rgba(10,25,47,0.01)] transition-all duration-300"
          >
            <button 
              onClick={() => setOpenEmployers(!openEmployers)}
              className="w-full flex justify-between items-center text-left group outline-none cursor-pointer"
            >
              <div className="flex flex-col">
                <span className="font-display font-bold text-lg text-brand-navy group-hover:text-brand-green transition-colors">Hire Talent</span>
                <span className="text-brand-navy/55 text-xs sm:text-sm mt-0.5 font-sans">Find trusted local service providers and post jobs.</span>
              </div>
              <motion.span
                animate={{ rotate: openEmployers ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="text-brand-navy/50"
              >
                <ChevronDown className="w-5 h-5" />
              </motion.span>
            </button>
            <SmoothCollapse isOpen={openEmployers}>
              <div className="mt-4 pt-4 border-t border-brand-border/40 grid grid-cols-2 gap-3">
                <motion.button 
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handlePostJobClick}
                  className="text-center font-semibold bg-brand-surface hover:bg-brand-surface/80 text-brand-navy transition-all text-sm px-4 py-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-brand-green border border-brand-border/30 cursor-pointer"
                >
                  Post a Job
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => router.push('/legal/terms')}
                  className="text-center font-semibold bg-brand-surface hover:bg-brand-surface/80 text-brand-navy transition-all text-sm px-4 py-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-brand-green border border-brand-border/30 cursor-pointer"
                >
                  Help Center
                </motion.button>
              </div>
            </SmoothCollapse>
          </motion.div>

          {/* Item 5 */}
          <motion.div 
            whileHover={{ scale: 1.015, y: -2, borderColor: "rgba(10, 25, 47, 0.15)" }}
            transition={{ type: "spring", stiffness: 350, damping: 18 }}
            className="bg-brand-bg border border-brand-border/60 rounded-2xl p-5 shadow-[0_2px_12px_rgba(10,25,47,0.01)] transition-all duration-300"
          >
            <button 
              onClick={() => setOpenAbout(!openAbout)}
              className="w-full flex justify-between items-center text-left group outline-none cursor-pointer"
            >
              <div className="flex flex-col">
                <span className="font-display font-bold text-lg text-brand-navy group-hover:text-brand-green transition-colors">About & Trust</span>
                <span className="text-brand-navy/55 text-xs sm:text-sm mt-0.5 font-sans">Learn about BukieBrain, policies, and platform safety.</span>
              </div>
              <motion.span
                animate={{ rotate: openAbout ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="text-brand-navy/50"
              >
                <ChevronDown className="w-5 h-5" />
              </motion.span>
            </button>
            <SmoothCollapse isOpen={openAbout}>
              <div className="mt-4 pt-4 border-t border-brand-border/40 grid grid-cols-2 gap-3">
                <motion.button 
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => router.push('/about')}
                  className="text-center font-semibold bg-brand-surface hover:bg-brand-surface/80 text-brand-navy transition-all text-sm px-4 py-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-brand-green border border-brand-border/30 cursor-pointer"
                >
                  About us
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => router.push('/legal/privacy')}
                  className="text-center font-semibold bg-brand-surface hover:bg-brand-surface/80 text-brand-navy transition-all text-sm px-4 py-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-brand-green border border-brand-border/30 cursor-pointer"
                >
                  Trust & Safety
                </motion.button>
              </div>
            </SmoothCollapse>
          </motion.div>
        </FadeUp>

        {/* FAQ Section */}
        <FadeUp id="faq-section" delay={0.3} className="space-y-6">
          <h2 className="text-2xl font-display font-bold text-brand-navy tracking-tight px-1">Frequently Asked Questions</h2>
          <div className="bg-brand-bg rounded-2xl border border-brand-border/80 overflow-hidden shadow-[0_4px_16px_rgba(10,25,47,0.015)]">
            {/* FAQ Item 1 */}
            <div className="border-b border-brand-border/50 last:border-b-0">
              <button
                onClick={() => setOpenFaq(openFaq === 1 ? null : 1)}
                className="w-full py-4.5 px-5 flex items-center justify-between gap-2.5 font-sans font-bold text-brand-navy text-base outline-none hover:bg-brand-surface transition-colors focus-visible:bg-brand-surface text-left"
              >
                What is BukieBrainJobs?
                <span className={`shrink-0 transition-transform duration-300 ${openFaq === 1 ? '-rotate-180' : ''} text-brand-navy/55`}>
                  <ChevronDown className="h-5 w-5" />
                </span>
              </button>
              <SmoothCollapse isOpen={openFaq === 1}>
                <div className="px-5 pb-5 leading-relaxed text-brand-navy/65 text-sm font-medium font-sans">
                  BukieBrainJobs helps you find and hire trusted local workers: plumbers, electricians, drivers, and more. Every worker is verified, and your payment is protected until the job is done.
                </div>
              </SmoothCollapse>
            </div>
            
            {/* FAQ Item 2 */}
            <div className="border-b border-brand-border/50 last:border-b-0">
              <button
                onClick={() => setOpenFaq(openFaq === 2 ? null : 2)}
                className="w-full py-4.5 px-5 flex items-center justify-between gap-2.5 font-sans font-bold text-brand-navy text-base outline-none hover:bg-brand-surface transition-colors focus-visible:bg-brand-surface text-left"
              >
                How do I get paid as an artisan?
                <span className={`shrink-0 transition-transform duration-300 ${openFaq === 2 ? '-rotate-180' : ''} text-brand-navy/55`}>
                  <ChevronDown className="h-5 w-5" />
                </span>
              </button>
              <SmoothCollapse isOpen={openFaq === 2}>
                <div className="px-5 pb-5 leading-relaxed text-brand-navy/65 text-sm font-medium font-sans">
                  Simple. Do the job, the employer confirms it is done, and the money moves to your wallet. From there, withdraw straight to your bank account. No stress.
                </div>
              </SmoothCollapse>
            </div>

            {/* FAQ Item 3 */}
            <div className="border-b border-brand-border/50 last:border-b-0">
              <button
                onClick={() => setOpenFaq(openFaq === 3 ? null : 3)}
                className="w-full py-4.5 px-5 flex items-center justify-between gap-2.5 font-sans font-bold text-brand-navy text-base outline-none hover:bg-brand-surface transition-colors focus-visible:bg-brand-surface text-left"
              >
                Is it free to join?
                <span className={`shrink-0 transition-transform duration-300 ${openFaq === 3 ? '-rotate-180' : ''} text-brand-navy/55`}>
                  <ChevronDown className="h-5 w-5" />
                </span>
              </button>
              <SmoothCollapse isOpen={openFaq === 3}>
                <div className="px-5 pb-5 leading-relaxed text-brand-navy/65 text-sm font-medium font-sans">
                  Yes. Signing up costs nothing. We only take a small fee when a job is completed and paid. No hidden charges.
                </div>
              </SmoothCollapse>
            </div>

            {/* FAQ Item 4 */}
            <div className="border-b border-brand-border/50 last:border-b-0">
              <button
                onClick={() => setOpenFaq(openFaq === 4 ? null : 4)}
                className="w-full py-4.5 px-5 flex items-center justify-between gap-2.5 font-sans font-bold text-brand-navy text-base outline-none hover:bg-brand-surface transition-colors focus-visible:bg-brand-surface text-left"
              >
                I want to get hired. How do I get started?
                <span className={`shrink-0 transition-transform duration-300 ${openFaq === 4 ? '-rotate-180' : ''} text-brand-navy/55`}>
                  <ChevronDown className="h-5 w-5" />
                </span>
              </button>
              <SmoothCollapse isOpen={openFaq === 4}>
                <div className="px-5 pb-5 leading-relaxed text-brand-navy/65 text-sm font-medium font-sans">
                  Create a free account, choose &apos;Get Hired&apos; during onboarding, fill in your skills and location, then browse jobs near you. When an employer hires you, chat with them on the platform. Once the job is confirmed, payment goes straight to your BukieBrain wallet and you can withdraw to your bank.
                </div>
              </SmoothCollapse>
            </div>
          </div>
        </FadeUp>
      </main>
      
      <SiteFooter />
    </div>
  );
}
