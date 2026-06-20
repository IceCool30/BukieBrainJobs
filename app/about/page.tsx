'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { LogoLink } from '@/components/LogoLink';
import { FadeUp } from '@/components/FadeUp';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white text-[#0A192F] font-sans flex flex-col relative">
      <header className="flex justify-between items-center px-4 py-3 border-b border-gray-100 max-w-6xl mx-auto w-full shrink-0">
        <LogoLink />
        <button 
          onClick={() => router.push('/')}
          className="text-gray-500 hover:text-[#0A192F] ml-1 p-2 flex items-center gap-2 hover:bg-gray-100 rounded-full active:scale-95 transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#0A192F] font-medium text-sm">
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Back</span>
        </button>
      </header>
      
      <main className="flex-1 max-w-3xl mx-auto px-4 py-16 w-full">
        <FadeUp delay={0.1}>
          <section className="mb-16">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[#0A192F] mb-6">
              What is BukieBrainJobs?
            </h1>
            <div className="space-y-4 text-gray-700 leading-relaxed text-lg font-medium">
              <p>
                BukieBrainJobs connects everyday Nigerians with trusted local workers. Need a plumber in Ikeja? An electrician in Surulere? A driver for the week? We help you find someone reliable, fast.
              </p>
              <p>
                For workers, it is a place to find jobs near you, build your reputation, and get paid without stress. No middleman drama. No waiting weeks for your money.
              </p>
              <p>
                We started because too many people in Nigeria struggle to find good workers they can trust, and too many skilled workers struggle to find steady jobs. We are fixing that, one connection at a time.
              </p>
            </div>
          </section>
        </FadeUp>

        <FadeUp delay={0.2}>
          <section className="mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight text-[#0A192F] mb-8">
              How it works
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Employers */}
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-8 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:border-gray-200 transition-all">
                <h3 className="text-xl font-bold text-[#0A192F] mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-[#0A192F] text-white flex items-center justify-center text-sm">1</span>
                  Employers
                </h3>
                <ol className="space-y-6">
                  <li className="flex gap-4">
                    <span className="font-bold text-[#0A192F] mt-1 shrink-0">1.</span>
                    <p className="text-gray-700 font-medium leading-relaxed">
                      <strong className="text-[#0A192F] block mb-1">Post your task</strong>
                      Tell us what you need, your budget, and your location.
                    </p>
                  </li>
                  <li className="flex gap-4">
                    <span className="font-bold text-[#0A192F] mt-1 shrink-0">2.</span>
                    <p className="text-gray-700 font-medium leading-relaxed">
                      <strong className="text-[#0A192F] block mb-1">Get matched</strong>
                      Verified workers in your area see your job and can apply.
                    </p>
                  </li>
                  <li className="flex gap-4">
                    <span className="font-bold text-[#0A192F] mt-1 shrink-0">3.</span>
                    <p className="text-gray-700 font-medium leading-relaxed">
                      <strong className="text-[#0A192F] block mb-1">Hire and pay safely</strong>
                      Chat with applicants, pick the right person, and your money is protected until you confirm the job is done.
                    </p>
                  </li>
                </ol>
              </div>

              {/* Workers */}
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-8 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:border-gray-200 transition-all">
                <h3 className="text-xl font-bold text-[#0A192F] mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm">2</span>
                  Workers
                </h3>
                <ol className="space-y-6">
                  <li className="flex gap-4">
                    <span className="font-bold text-[#0A192F] mt-1 shrink-0">1.</span>
                    <p className="text-gray-700 font-medium leading-relaxed">
                      <strong className="text-[#0A192F] block mb-1">Create your profile</strong>
                      Tell us your skills, experience, and where you work.
                    </p>
                  </li>
                  <li className="flex gap-4">
                    <span className="font-bold text-[#0A192F] mt-1 shrink-0">2.</span>
                    <p className="text-gray-700 font-medium leading-relaxed">
                      <strong className="text-[#0A192F] block mb-1">Browse jobs near you</strong>
                      See tasks posted by employers in your LGA.
                    </p>
                  </li>
                  <li className="flex gap-4">
                    <span className="font-bold text-[#0A192F] mt-1 shrink-0">3.</span>
                    <p className="text-gray-700 font-medium leading-relaxed">
                      <strong className="text-[#0A192F] block mb-1">Apply, work, get paid</strong>
                      Apply to jobs, chat with employers, do the work, and get paid to your wallet. Withdraw to your bank anytime.
                    </p>
                  </li>
                </ol>
              </div>
            </div>
          </section>
        </FadeUp>

        <FadeUp delay={0.3}>
          <section className="mb-8">
            <h2 className="text-3xl font-extrabold tracking-tight text-[#0A192F] mb-4">
              Our promise
            </h2>
            <p className="text-gray-700 leading-relaxed text-lg font-medium bg-[#0A192F]/5 p-6 rounded-2xl border border-gray-100">
              No hidden fees. No surprises. Just a simple platform that works for both sides. Your money is safe. Your time is respected. Your trust matters.
            </p>
          </section>
        </FadeUp>
      </main>
      
      <footer className="mt-auto py-8 border-t border-gray-100 bg-gray-50 text-center">
        <div className="flex justify-center gap-6 mb-4 text-sm font-medium">
          <Link href="/legal/privacy" className="text-gray-500 hover:text-[#0A192F] transition-colors">Privacy</Link>
          <Link href="/legal/terms" className="text-gray-500 hover:text-[#0A192F] transition-colors">Terms</Link>
          <Link href="/legal/cookies" className="text-gray-500 hover:text-[#0A192F] transition-colors">Cookies</Link>
        </div>
        <p className="text-sm text-gray-400 font-medium">
          &copy; {new Date().getFullYear()} BukieBrainJobs.
        </p>
      </footer>
    </div>
  );
}
