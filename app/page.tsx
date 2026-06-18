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
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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

        {/* FAQ Section */}
        <FadeUp delay={0.3} className="mb-16">
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
                  BukieBrainJobs is a smart marketplace connecting employers with skilled artisans and freelancers in Nigeria. We streamline the hiring process making it fast, transparent, and reliable.
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
                  We use an escrow-like system. Once a job is successfully completed and confirmed by the employer, funds are released directly to your requested bank account via your BukieBrain wallet.
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
                  Yes, creating an account as a job seeker or employer is entirely free. We only charge a small platform capability fee on confirmed successful transactions.
                </div>
              </SmoothCollapse>
            </div>
          </div>
        </FadeUp>

        {/* Footer */}
        <footer className="pt-8 pb-12 text-[#595959] text-[14px]">
          <div className="flex flex-col items-start gap-4 mb-6">
            <p className="mb-0">© {new Date().getFullYear()} BukieBrainJobs</p>
            {/* Social Media Links */}
            <div className="flex items-center gap-4">
              <a href="#" className="text-gray-400 hover:text-[#0A192F] transition-colors" aria-label="Twitter">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-[#0A192F] transition-colors" aria-label="Facebook">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-[#0A192F] transition-colors" aria-label="Instagram">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-[#0A192F] transition-colors" aria-label="LinkedIn">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <span tabIndex={0} className="cursor-pointer hover:text-[#0A192F] hover:underline transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#0A192F] rounded-sm">About us</span>
            <span tabIndex={0} className="cursor-pointer hover:text-[#0A192F] hover:underline transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#0A192F] rounded-sm">Privacy Center</span>
            <span tabIndex={0} className="cursor-pointer hover:text-[#0A192F] hover:underline transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#0A192F] rounded-sm">Terms</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
