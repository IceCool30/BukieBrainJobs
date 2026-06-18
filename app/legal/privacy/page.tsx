'use client';

import React, { useState } from 'react';
import { SiteFooter } from '@/components/SiteFooter';
import { LogoLink } from '@/components/LogoLink';
import { Sidebar } from '@/components/Sidebar';
import { Menu } from 'lucide-react';

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>
        
        <div className="space-y-8 text-gray-700 leading-relaxed text-lg">
          <p>
            Your privacy is our priority. This policy outlines how we handle your data in compliance with Nigerian data protection standards.
          </p>

          <section>
            <h2 className="text-2xl font-bold text-[#0A192F] mb-4">Information Collection</h2>
            <p>
              We collect phone numbers, email addresses, and location data (State and LGA) to accurately match you with local jobs.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#0A192F] mb-4">Data Usage</h2>
            <p>
              Your contact information is strictly masked from the public. It is only revealed to authorized employers who have paid the required contact unlock fee.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#0A192F] mb-4">Third Parties</h2>
            <p>
              We do not sell your data. Payment processing is handled securely by Paystack, and we do not store your raw credit card or bank PIN details on our servers.
            </p>
          </section>
        </div>
      </main>
      
      <SiteFooter />
    </div>
  );
}
