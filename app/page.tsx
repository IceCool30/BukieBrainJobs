'use client';
import { LogoBase64 } from '@/lib/logo';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Menu, Search, MapPin, X, ChevronDown, ChevronRight, ArrowRight } from 'lucide-react';
import { FadeUp } from '@/components/FadeUp';
import { SmoothCollapse } from '@/components/SmoothCollapse';
import { nigeriaLocations, nigerianStates } from '@/lib/nigeria-locations';

export default function Home() {
  const router = useRouter();
  const [showEmployerBanner, setShowEmployerBanner] = useState(true);
  
  const [selectedState, setSelectedState] = useState('');
  const [selectedLga, setSelectedLga] = useState('');

  // Accordion states
  const [openTrending, setOpenTrending] = useState(true);
  const [openArtisans, setOpenArtisans] = useState(false);
  const [openEmployers, setOpenEmployers] = useState(false);
  const [openAbout, setOpenAbout] = useState(false);

  return (
    <div className="min-h-screen bg-white text-[#0A192F] font-sans">
      {/* Navigation Bar */}
      <header className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2 cursor-pointer active:scale-[0.98] transition-transform" onClick={() => router.push('/')}>
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-1.5 p-1 w-fit hover:border-gray-200 hover:shadow-md transition-all">
            <Image src={LogoBase64} alt="BukieBrainJobs Logo" width={28} height={28} className="rounded-[10px] shadow-sm border border-gray-200 bg-white p-[2px]" />
            <span className="font-black text-[16px] tracking-tight text-[#0A192F] pr-2 whitespace-nowrap">BukieBrainJobs</span>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <button 
            onClick={() => router.push('/login')}
            className="text-sm font-bold text-[#0A192F] hover:text-black hover:underline active:scale-95 transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#0A192F] rounded-sm"
          >
            Sign in
          </button>
          <button 
            onClick={() => router.push('/dashboard/post-job')}
            className="bg-[#0A192F] hover:bg-[#112a4f] text-white text-[13px] font-bold px-3 py-1.5 sm:px-4 sm:py-2 rounded-full whitespace-nowrap active:scale-95 transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#0A192F] focus-visible:ring-offset-2" 
          >
            Post a Task
          </button>
          <button className="text-[#0A192F] ml-1 p-1 hover:bg-gray-100 rounded-full active:scale-95 transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#0A192F]">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      <main className="px-4 py-6 max-w-2xl mx-auto w-full">
        {/* Search Container */}
        <FadeUp delay={0.1} className="flex flex-col sm:flex-row items-center w-full bg-white border border-gray-300 rounded-2xl sm:rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.04)] px-4 py-3 sm:py-2 mb-10 focus-within:ring-2 focus-within:ring-[#0A192F] focus-within:border-transparent transition-all hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] gap-2 sm:gap-0">
          <div className="flex items-center flex-1 w-full min-w-0">
            <Search className="w-5 h-5 text-gray-600 mr-3 flex-shrink-0 font-bold" />
            <input 
              type="text" 
              placeholder="Search tasks" 
              className="w-full bg-transparent focus:outline-none text-base text-[#0A192F] placeholder-gray-500 font-medium truncate py-1.5"
            />
          </div>
          <div className="hidden sm:block w-[1px] h-6 bg-gray-300 mx-3 flex-shrink-0"></div>
          <div className="flex items-center flex-1 w-full min-w-0 gap-2 border-t border-gray-100 pt-2 sm:border-0 sm:pt-0">
            <MapPin className="w-5 h-5 text-gray-600 flex-shrink-0 font-bold hidden sm:block" />
            
            <div className="flex-1 min-w-0 flex items-center gap-2">
              <select
                value={selectedState}
                onChange={(e) => {
                  setSelectedState(e.target.value);
                  setSelectedLga('');
                }}
                className="w-1/2 bg-transparent focus:outline-none text-base text-[#0A192F] font-medium truncate cursor-pointer appearance-none"
              >
                <option value="">State...</option>
                {nigerianStates.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
              <span className="text-gray-300">/</span>
              <select
                value={selectedLga}
                onChange={(e) => setSelectedLga(e.target.value)}
                disabled={!selectedState}
                className="w-1/2 bg-transparent focus:outline-none text-base text-[#0A192F] font-medium truncate cursor-pointer appearance-none disabled:opacity-50"
              >
                <option value="">LGA...</option>
                {(selectedState ? nigeriaLocations[selectedState] : []).map(lga => (
                  <option key={lga} value={lga}>{lga}</option>
                ))}
              </select>
            </div>
          </div>
        </FadeUp>

        {/* Hero Area */}
        <FadeUp delay={0.2} className="flex flex-col items-center text-center mb-10 w-full">
          <div className="mb-4 flex flex-col items-center justify-center">
             <div className="flex items-center justify-center mb-6">
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 flex items-center gap-3 p-1.5 w-fit">
                   <Image src={LogoBase64} alt="BukieBrainJobs Logo" width={56} height={56} className="rounded-2xl shadow-sm border border-gray-200 bg-white p-[3px]" />
                   <span className="font-black text-3xl sm:text-4xl tracking-tight text-[#0A192F] pr-4">BukieBrainJobs</span>
                </div>
             </div>
             <h1 className="text-[32px] sm:text-4xl font-black tracking-tight text-[#0A192F] mb-3 leading-tight">
              Your next job starts here
            </h1>
          </div>
          <p className="text-[#595959] text-base sm:text-lg mb-8 leading-relaxed max-w-sm px-2">
            Create an account or sign in to see your personalized task recommendations.
          </p>
          <button 
            onClick={() => router.push('/onboarding')}
            className="w-full bg-[#0A192F] hover:bg-[#112a4f] hover:shadow-lg text-white font-bold text-base py-3.5 rounded-xl flex items-center justify-center gap-2 mb-4 active:scale-[0.98] transition-all outline-none focus-visible:ring-4 focus-visible:ring-[#0A192F]/20"
          >
            Get Started <ArrowRight className="w-[18px] h-[18px] stroke-[2.5]" />
          </button>
        </FadeUp>

        {/* Employer Banner */}
        {showEmployerBanner && (
          <FadeUp delay={0.3} className="bg-white border border-gray-200 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-5 relative mb-12 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-shadow">
            <button 
              onClick={() => setShowEmployerBanner(false)}
              className="absolute top-4 right-4 text-[#0A192F] hover:bg-gray-100 rounded-full p-1 active:scale-95 transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#0A192F]"
            >
              <X className="w-[18px] h-[18px] stroke-[2.5]" />
            </button>
            <h2 className="text-[20px] leading-snug font-black text-[#0A192F] mb-4 pr-6">
              Employers, your next hire is here
            </h2>
            <button 
              onClick={() => router.push('/dashboard/post-job')}
              className="text-[#0A192F] font-bold text-[15px] flex items-center gap-1.5 hover:text-black hover:underline active:scale-95 hover:gap-2 transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#0A192F] rounded-sm"
            >
              Post a task <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </FadeUp>
        )}

        {/* Accordion Navigation List */}
        <FadeUp delay={0.4} className="border-t border-gray-200">
          {/* Item 1 */}
          <div className="py-5 border-b border-gray-200">
            <button 
              onClick={() => setOpenTrending(!openTrending)}
              className="w-full flex justify-between items-center text-left group outline-none rounded-md px-2 -mx-2 hover:bg-gray-50 active:scale-[0.99] transition-all focus-visible:ring-2 focus-visible:ring-[#0A192F] py-2"
            >
              <span className="font-black text-[#0A192F] text-[18px] group-hover:text-black transition-colors">What&apos;s trending on BukieBrain</span>
              <ChevronDown className={`w-6 h-6 text-[#0A192F] transition-transform ${openTrending ? 'rotate-180' : ''}`} />
            </button>
            <p className="text-[#595959] mt-2 text-[15px] px-2">
              See what&apos;s happening to further your job search.
            </p>
            <SmoothCollapse isOpen={openTrending}>
              <div className="mt-6 space-y-2 px-2 pb-2">
                <div tabIndex={0} className="flex justify-between items-center cursor-pointer hover:bg-gray-100 active:bg-gray-200 active:scale-[0.99] transition-all px-3 py-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[#0A192F]">
                  <span className="font-medium text-[#0A192F] text-[15px]">Trending Searches</span>
                  <ChevronDown className="w-[22px] h-[22px] text-[#0A192F]" />
                </div>
                <div tabIndex={0} className="flex justify-between items-center cursor-pointer hover:bg-gray-100 active:bg-gray-200 active:scale-[0.99] transition-all px-3 py-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[#0A192F]">
                  <span className="font-medium text-[#0A192F] text-[15px]">Trending Jobs</span>
                  <ChevronDown className="w-[22px] h-[22px] text-[#0A192F]" />
                </div>
                <div tabIndex={0} className="flex justify-between items-center cursor-pointer hover:bg-gray-100 active:bg-gray-200 active:scale-[0.99] transition-all px-3 py-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[#0A192F]">
                  <span className="font-medium text-[#0A192F] text-[15px]">Trending Locations</span>
                  <ChevronDown className="w-[22px] h-[22px] text-[#0A192F]" />
                </div>
              </div>
            </SmoothCollapse>
          </div>

          {/* Item 2 */}
          <div className="py-5 border-b border-gray-200">
            <button 
              onClick={() => router.push('/login')}
              className="w-full flex justify-between items-center group outline-none rounded-md px-2 -mx-2 hover:bg-gray-50 active:scale-[0.99] transition-all focus-visible:ring-2 focus-visible:ring-[#0A192F] py-2"
            >
              <span className="font-black text-[#0A192F] text-[18px] group-hover:text-black transition-colors">Sign in</span>
              <ChevronRight className="w-[22px] h-[22px] stroke-[2.5] text-[#0A192F] group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Item 3 */}
          <div className="py-5 border-b border-gray-200">
            <button 
              onClick={() => setOpenArtisans(!openArtisans)}
              className="w-full flex justify-between items-center group outline-none rounded-md px-2 -mx-2 hover:bg-gray-50 active:scale-[0.99] transition-all focus-visible:ring-2 focus-visible:ring-[#0A192F] py-2"
            >
              <span className="font-black text-[#0A192F] text-[18px] group-hover:text-black transition-colors">Artisans & Freelancers</span>
              <ChevronDown className={`w-6 h-6 text-[#0A192F] transition-transform ${openArtisans ? 'rotate-180' : ''}`} />
            </button>
            <SmoothCollapse isOpen={openArtisans}>
              <div className="mt-4 flex flex-col space-y-1 text-[#595959] px-2 pb-2">
                <span tabIndex={0} className="cursor-pointer hover:bg-gray-100 hover:text-[#0A192F] transition-colors text-[15px] px-3 py-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[#0A192F] active:scale-[0.99]">Help</span>
                <span tabIndex={0} className="cursor-pointer hover:bg-gray-100 hover:text-[#0A192F] transition-colors text-[15px] px-3 py-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[#0A192F] active:scale-[0.99]">Browse categories</span>
                <span tabIndex={0} className="cursor-pointer hover:bg-gray-100 hover:text-[#0A192F] transition-colors text-[15px] px-3 py-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[#0A192F] active:scale-[0.99]">Browse jobs</span>
              </div>
            </SmoothCollapse>
          </div>

          {/* Item 4 */}
          <div className="py-5 border-b border-gray-200">
            <button 
              onClick={() => setOpenEmployers(!openEmployers)}
              className="w-full flex justify-between items-center group outline-none rounded-md px-2 -mx-2 hover:bg-gray-50 active:scale-[0.99] transition-all focus-visible:ring-2 focus-visible:ring-[#0A192F] py-2"
            >
              <span className="font-black text-[#0A192F] text-[18px] group-hover:text-black transition-colors">Employers</span>
              <ChevronDown className={`w-6 h-6 text-[#0A192F] transition-transform ${openEmployers ? 'rotate-180' : ''}`} />
            </button>
            <SmoothCollapse isOpen={openEmployers}>
              <div className="mt-4 flex flex-col space-y-1 text-[#595959] px-2 pb-2">
                <span tabIndex={0} className="cursor-pointer hover:bg-gray-100 hover:text-[#0A192F] transition-colors text-[15px] px-3 py-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[#0A192F] active:scale-[0.99]">Post a task</span>
                <span tabIndex={0} className="cursor-pointer hover:bg-gray-100 hover:text-[#0A192F] transition-colors text-[15px] px-3 py-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[#0A192F] active:scale-[0.99]">Help Center</span>
              </div>
            </SmoothCollapse>
          </div>

          {/* Item 5 */}
          <div className="py-5 border-b border-gray-200">
            <button 
              onClick={() => setOpenAbout(!openAbout)}
              className="w-full flex justify-between items-center group outline-none rounded-md px-2 -mx-2 hover:bg-gray-50 active:scale-[0.99] transition-all focus-visible:ring-2 focus-visible:ring-[#0A192F] py-2"
            >
              <span className="font-black text-[#0A192F] text-[18px] group-hover:text-black transition-colors">About</span>
              <ChevronDown className={`w-6 h-6 text-[#0A192F] transition-transform ${openAbout ? 'rotate-180' : ''}`} />
            </button>
            <SmoothCollapse isOpen={openAbout}>
              <div className="mt-4 flex flex-col space-y-1 text-[#595959] px-2 pb-2">
                <span tabIndex={0} className="cursor-pointer hover:bg-gray-100 hover:text-[#0A192F] transition-colors text-[15px] px-3 py-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[#0A192F] active:scale-[0.99]">About us</span>
                <span tabIndex={0} className="cursor-pointer hover:bg-gray-100 hover:text-[#0A192F] transition-colors text-[15px] px-3 py-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[#0A192F] active:scale-[0.99]">Trust & Safety</span>
              </div>
            </SmoothCollapse>
          </div>
        </FadeUp>

        {/* Footer */}
        <footer className="pt-8 pb-12 text-[#595959] text-[14px]">
          <p className="mb-4">© 2026 BukieBrainJobs</p>
          <div className="flex gap-6">
            <span tabIndex={0} className="cursor-pointer hover:text-[#0A192F] hover:underline transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#0A192F] rounded-sm">Accessibility</span>
            <span tabIndex={0} className="cursor-pointer hover:text-[#0A192F] hover:underline transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#0A192F] rounded-sm">Privacy Center</span>
            <span tabIndex={0} className="cursor-pointer hover:text-[#0A192F] hover:underline transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#0A192F] rounded-sm">Terms</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
