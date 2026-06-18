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
        
        <div className="space-y-8 text-gray-700 leading-relaxed text-lg">
          <p>
            Welcome to BukieBrainJobs. By using our platform, you agree to these terms. Our service connects verified Nigerian artisans with businesses and individuals.
          </p>

          <section>
            <h2 className="text-2xl font-bold text-[#0A192F] mb-4">Protected Funds and Payments</h2>
            <p>
              All task payments are held securely as Protected Funds. Funds are only released when the employer approves the completed work or a dispute resolution concludes in the artisan's favor.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#0A192F] mb-4">User Conduct</h2>
            <p>
              Users must provide accurate identity information. Any attempt to bypass platform communication before an inspection fee is paid will result in account suspension.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#0A192F] mb-4">Liability</h2>
            <p>
              BukieBrainJobs acts as a matching and Protected Funds facilitator. We do not guarantee the physical outcome of any artisan's work, but we enforce financial protection for both parties.
            </p>
          </section>
        </div>
      </main>
      
      <SiteFooter />
    </div>
  );
}
