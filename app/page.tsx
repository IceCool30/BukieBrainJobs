'use client';
import { LogoBase64 } from '@/lib/logo';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Menu, Search, MapPin, X, ChevronDown, ChevronRight, ArrowRight, Briefcase, Hammer } from 'lucide-react';
import { FadeUp } from '@/components/FadeUp';
import { SmoothCollapse } from '@/components/SmoothCollapse';
import { nigeriaLocations, nigerianStates } from '@/lib/nigeria-locations';

import { SiteFooter } from '@/components/SiteFooter';
import { Sidebar } from '@/components/Sidebar';
import { LogoLink } from '@/components/LogoLink';

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
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-[#0A192F] font-sans">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      {/* Navigation Bar */}
      <header className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
        <LogoLink />
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
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="text-[#0A192F] ml-1 p-1 hover:bg-gray-100 rounded-full active:scale-95 transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#0A192F]">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      <main className="px-4 py-6 max-w-2xl mx-auto w-full">
        {/* Search Container */}
        <FadeUp delay={0.1} className="flex flex-col sm:flex-row items-center w-full bg-white border border-gray-300 rounded-2xl sm:rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.04)] px-4 py-3 sm:py-2 mb-10 focus-within:ring-2 focus-within:ring-[#0A192F]/60 focus-within:border-[#0A192F] focus-within:shadow-[0_0_15px_rgba(10,25,47,0.2)] transition-all hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] gap-2 sm:gap-0 relative z-10">
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

        {/* Hero Area - Dual Audience */}
        <div className="max-w-2xl mx-auto text-center mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-[#0A192F] tracking-tight mb-2">
            Whatever you need, we have got you.
          </h2>
          <p className="text-sm text-gray-500 mb-8">
            Find trusted workers or find work near you. One platform, no stress.
          </p>
        </div>

        <FadeUp delay={0.2} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {/* Employer Card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:border-gray-300 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#0A192F]/10 flex items-center justify-center mb-4">
              <Briefcase className="w-6 h-6 text-[#0A192F]" />
            </div>
            <h3 className="text-lg font-black text-[#0A192F] mb-2">I need a worker</h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-5">
              Post a task. Get matched with verified workers in your area. Pay only when the job is done.
            </p>
            <button
              onClick={() => router.push('/dashboard/post-job')}
              className="w-full bg-[#0A192F] hover:bg-[#112a4f] text-white font-bold text-sm py-3 rounded-xl transition-all active:scale-[0.98]"
            >
              Post a Task
            </button>
          </div>

          {/* Worker Card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:border-gray-300 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#004D2C]/10 flex items-center justify-center mb-4">
              <Hammer className="w-6 h-6 text-[#004D2C]" />
            </div>
            <h3 className="text-lg font-black text-[#0A192F] mb-2">I need work</h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-5">
              Browse tasks in your LGA. Apply, get hired, and get paid straight to your wallet.
            </p>
            <button
              onClick={() => router.push('/jobs')}
              className="w-full bg-[#004D2C] hover:bg-[#00663a] text-white font-bold text-sm py-3 rounded-xl transition-all active:scale-[0.98]"
            >
              Browse Jobs
            </button>
          </div>
        </FadeUp>

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
                <div 
                  tabIndex={0} 
                  onClick={() => router.push('/jobs')}
                  className="flex justify-between items-center cursor-pointer hover:bg-gray-100 active:bg-gray-200 active:scale-[0.99] transition-all px-3 py-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[#0A192F]"
                >
                  <span className="font-medium text-[#0A192F] text-[15px]">Trending Searches</span>
                  <ChevronRight className="w-[22px] h-[22px] stroke-[2.5] text-[#0A192F]" />
                </div>
                <div 
                  tabIndex={0} 
                  onClick={() => router.push('/jobs')}
                  className="flex justify-between items-center cursor-pointer hover:bg-gray-100 active:bg-gray-200 active:scale-[0.99] transition-all px-3 py-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[#0A192F]"
                >
                  <span className="font-medium text-[#0A192F] text-[15px]">Trending Jobs</span>
                  <ChevronRight className="w-[22px] h-[22px] stroke-[2.5] text-[#0A192F]" />
                </div>
                <div 
                  tabIndex={0} 
                  onClick={() => router.push('/jobs')}
                  className="flex justify-between items-center cursor-pointer hover:bg-gray-100 active:bg-gray-200 active:scale-[0.99] transition-all px-3 py-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[#0A192F]"
                >
                  <span className="font-medium text-[#0A192F] text-[15px]">Trending Locations</span>
                  <ChevronRight className="w-[22px] h-[22px] stroke-[2.5] text-[#0A192F]" />
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
              <span className="font-black text-[#0A192F] text-[18px] group-hover:text-black transition-colors">Looking for work? Start here.</span>
              <ChevronDown className={`w-6 h-6 text-[#0A192F] transition-transform ${openArtisans ? 'rotate-180' : ''}`} />
            </button>
            <SmoothCollapse isOpen={openArtisans}>
              <div className="mt-6 space-y-2 px-2 pb-2">
                <div
                  tabIndex={0}
                  onClick={() => router.push('/jobs')}
                  className="flex justify-between items-center cursor-pointer hover:bg-gray-100 active:bg-gray-200 active:scale-[0.99] transition-all px-3 py-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[#0A192F]"
                >
                  <span className="font-medium text-[#0A192F] text-[15px]">Browse available jobs near you</span>
                  <ChevronRight className="w-[22px] h-[22px] stroke-[2.5] text-[#0A192F]" />
                </div>
                <div
                  tabIndex={0}
                  onClick={() => router.push('/login')}
                  className="flex justify-between items-center cursor-pointer hover:bg-gray-100 active:bg-gray-200 active:scale-[0.99] transition-all px-3 py-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[#0A192F]"
                >
                  <span className="font-medium text-[#0A192F] text-[15px]">Set up your BukiePassport</span>
                  <ChevronRight className="w-[22px] h-[22px] stroke-[2.5] text-[#0A192F]" />
                </div>
                <div
                  tabIndex={0}
                  onClick={() => {
                    setOpenFaq(2);
                    document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex justify-between items-center cursor-pointer hover:bg-gray-100 active:bg-gray-200 active:scale-[0.99] transition-all px-3 py-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[#0A192F]"
                >
                  <span className="font-medium text-[#0A192F] text-[15px]">How payments work for workers</span>
                  <ChevronDown className="w-[22px] h-[22px] text-[#0A192F]" />
                </div>
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
                <span 
                  tabIndex={0} 
                  onClick={() => router.push('/dashboard/post-job')}
                  className="cursor-pointer hover:bg-gray-100 hover:text-[#0A192F] transition-colors text-[15px] px-3 py-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[#0A192F] active:scale-[0.99]"
                >
                  Post a task
                </span>
                <span 
                  tabIndex={0} 
                  onClick={() => router.push('/legal/terms')}
                  className="cursor-pointer hover:bg-gray-100 hover:text-[#0A192F] transition-colors text-[15px] px-3 py-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[#0A192F] active:scale-[0.99]"
                >
                  Help Center
                </span>
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
                <span 
                  tabIndex={0} 
                  onClick={() => router.push('/about')}
                  className="cursor-pointer hover:bg-gray-100 hover:text-[#0A192F] transition-colors text-[15px] px-3 py-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[#0A192F] active:scale-[0.99]"
                >
                  About us
                </span>
                <span 
                  tabIndex={0} 
                  onClick={() => router.push('/legal/privacy')}
                  className="cursor-pointer hover:bg-gray-100 hover:text-[#0A192F] transition-colors text-[15px] px-3 py-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[#0A192F] active:scale-[0.99]"
                >
                  Trust & Safety
                </span>
              </div>
            </SmoothCollapse>
          </div>
        </FadeUp>

        {/* FAQ Section */}
        <FadeUp id="faq-section" delay={0.3} className="mb-16">
          <h2 className="text-2xl font-black text-[#0A192F] mb-6 tracking-tight px-2">Frequently Asked Questions</h2>
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            {/* FAQ Item 1 */}
            <div className="border-b border-gray-100 last:border-b-0">
              <button
                onClick={() => setOpenFaq(openFaq === 1 ? null : 1)}
                className="w-full py-4 px-5 flex items-center justify-between gap-1.5 font-bold text-[#0A192F] text-base outline-none hover:bg-gray-50 transition-colors focus-visible:bg-gray-50"
              >
                What is BukieBrainJobs?
                <span className={`shrink-0 transition-transform duration-300 ${openFaq === 1 ? '-rotate-180' : ''}`}>
                  <ChevronDown className="h-5 w-5" />
                </span>
              </button>
              <SmoothCollapse isOpen={openFaq === 1}>
                <div className="px-5 pb-4 leading-relaxed text-gray-500 text-sm font-medium">
                  BukieBrainJobs helps you find and hire trusted local workers: plumbers, electricians, drivers, and more. Every worker is verified, and your payment is protected until the job is done.
                </div>
              </SmoothCollapse>
            </div>
            
            {/* FAQ Item 2 */}
            <div className="border-b border-gray-100 last:border-b-0">
              <button
                onClick={() => setOpenFaq(openFaq === 2 ? null : 2)}
                className="w-full py-4 px-5 flex items-center justify-between gap-1.5 font-bold text-[#0A192F] text-base outline-none hover:bg-gray-50 transition-colors focus-visible:bg-gray-50"
              >
                How do I get paid as an artisan?
                <span className={`shrink-0 transition-transform duration-300 ${openFaq === 2 ? '-rotate-180' : ''}`}>
                  <ChevronDown className="h-5 w-5" />
                </span>
              </button>
              <SmoothCollapse isOpen={openFaq === 2}>
                <div className="px-5 pb-4 leading-relaxed text-gray-500 text-sm font-medium">
                  Simple. Do the job, the employer confirms it is done, and the money moves to your wallet. From there, withdraw straight to your bank account. No stress.
                </div>
              </SmoothCollapse>
            </div>

            {/* FAQ Item 3 */}
            <div className="border-b border-gray-100 last:border-b-0">
              <button
                onClick={() => setOpenFaq(openFaq === 3 ? null : 3)}
                className="w-full py-4 px-5 flex items-center justify-between gap-1.5 font-bold text-[#0A192F] text-base outline-none hover:bg-gray-50 transition-colors focus-visible:bg-gray-50"
              >
                Is it free to join?
                <span className={`shrink-0 transition-transform duration-300 ${openFaq === 3 ? '-rotate-180' : ''}`}>
                  <ChevronDown className="h-5 w-5" />
                </span>
              </button>
              <SmoothCollapse isOpen={openFaq === 3}>
                <div className="px-5 pb-4 leading-relaxed text-gray-500 text-sm font-medium">
                  Yes. Signing up costs nothing. We only take a small fee when a job is completed and paid. No hidden charges.
                </div>
              </SmoothCollapse>
            </div>

            {/* FAQ Item 4 */}
            <div className="border-b border-gray-100 last:border-b-0">
              <button
                onClick={() => setOpenFaq(openFaq === 4 ? null : 4)}
                className="w-full py-4 px-5 flex items-center justify-between gap-1.5 font-bold text-[#0A192F] text-base outline-none hover:bg-gray-50 transition-colors focus-visible:bg-gray-50"
              >
                I am a worker. How do I get started?
                <span className={`shrink-0 transition-transform duration-300 ${openFaq === 4 ? '-rotate-180' : ''}`}>
                  <ChevronDown className="h-5 w-5" />
                </span>
              </button>
              <SmoothCollapse isOpen={openFaq === 4}>
                <div className="px-5 pb-4 leading-relaxed text-gray-500 text-sm font-medium">
                  Create a free account, choose &apos;I want to find work&apos; during onboarding, fill in your skills and location, then browse jobs near you. When an employer hires you, chat with them on the platform. Once the job is confirmed, payment goes straight to your BukieBrain wallet and you can withdraw to your bank.
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
