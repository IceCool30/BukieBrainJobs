'use client';

import React, { useState } from 'react';
import { SiteFooter } from '@/components/SiteFooter';
import { LogoLink } from '@/components/LogoLink';
import { Sidebar } from '@/components/Sidebar';
import { Menu } from 'lucide-react';

export default function CookiesPage() {
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
          Cookie Policy
        </h1>
        
        <div className="space-y-8 text-gray-700 leading-relaxed text-lg">
          <p>
            BukieBrainJobs uses cookies to keep our platform secure and ensure you stay logged in.
          </p>

          <section>
            <h2 className="text-2xl font-bold text-[#0A192F] mb-4">Essential Cookies</h2>
            <p>
              These are strictly necessary for our security gates, Supabase authentication, and payment tracking. You cannot opt out of these if you wish to use the platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#0A192F] mb-4">Analytics</h2>
            <p>
              We use basic, anonymous tracking to see which LGAs have the highest job demand so we can improve our marketing. You can clear your browser cookies at any time to reset your preferences.
            </p>
          </section>
        </div>
      </main>
      
      <SiteFooter />
    </div>
  );
}
