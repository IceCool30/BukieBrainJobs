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
        
        <div className="space-y-8 text-gray-700 leading-relaxed text-lg font-medium">
          <p>
            We use cookies to make the site work properly. Here is the short version.
          </p>

          <section>
            <h2 className="text-2xl font-bold text-[#0A192F] mb-4">What cookies do:</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Keep you signed in so you do not have to log in every time.</li>
              <li>Remember your preferences like your location.</li>
              <li>Help us understand how people use the site so we can make it better.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#0A192F] mb-4">What cookies do not do:</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Track you across other websites.</li>
              <li>Collect personal information you have not given us.</li>
              <li>Slow down your phone or browser.</li>
            </ul>
          </section>
          
          <p className="pt-4">
            You can turn off cookies in your browser settings, but some parts of the site may not work as expected.
          </p>
        </div>
      </main>
      
      <SiteFooter />
    </div>
  );
}
