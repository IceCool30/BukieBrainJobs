'use client';

import React, { useState } from 'react';
import { SiteFooter } from '@/components/SiteFooter';
import { LogoLink } from '@/components/LogoLink';
import { Sidebar } from '@/components/Sidebar';
import { Menu } from 'lucide-react';

export default function TermsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-[#0A192F] font-sans flex flex-col relative">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <header className="flex justify-between items-center px-4 py-3 border-b border-gray-100 max-w-6xl mx-auto w-full shrink-0">
        <LogoLink />
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="text-[#0A192F] ml-1 p-1 hover:bg-gray-100 rounded-full active:scale-95 transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#0A192F]">
          <Menu className="w-6 h-6" />
        </button>
      </header>
      
      <main className="flex-1 max-w-4xl mx-auto px-4 py-12 w-full">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#0A192F] mb-12">
          Terms of Service
        </h1>
        
        <div className="space-y-8 text-gray-700 leading-relaxed text-lg font-medium">
          <p>
            By using BukieBrainJobs, you agree to these simple rules.
          </p>

          <section>
            <h2 className="text-2xl font-bold text-[#0A192F] mb-4">For employers:</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Be honest in your job posts. Describe the work clearly and set a fair budget.</li>
              <li>Pay for completed work. Funds are held securely and released when you confirm the job is done.</li>
              <li>Treat workers with respect.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#0A192F] mb-4">For workers:</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Be honest about your skills and experience. Do not claim to know what you cannot do.</li>
              <li>Show up on time and do the work you agreed to.</li>
              <li>Keep conversations and payments on the platform. Taking things off-platform puts you at risk and breaks our terms.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#0A192F] mb-4">For everyone:</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>No harassment, no discrimination, no fraud.</li>
              <li>BukieBrainJobs takes a small fee on completed jobs to keep the platform running.</li>
              <li>We can suspend accounts that break these rules.</li>
            </ul>
          </section>
          
          <p className="pt-4 font-bold text-[#0A192F]">
            Simple, fair, and built on trust.
          </p>
        </div>
      </main>
      
      <SiteFooter />
    </div>
  );
}
