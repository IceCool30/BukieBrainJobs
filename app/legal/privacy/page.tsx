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
        
        <div className="space-y-8 text-gray-700 leading-relaxed text-lg font-medium">
          <p>
            Your privacy matters to us. Here is exactly what we do and do not do with your information.
          </p>

          <section>
            <h2 className="text-2xl font-bold text-[#0A192F] mb-4">What we collect:</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Your name, email, and phone number when you sign up.</li>
              <li>Your location (state and LGA) so we can match you with jobs or workers near you.</li>
              <li>Your skills and work history if you are a worker.</li>
              <li>Payment information processed securely through Paystack. We do not store your full card or bank details.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#0A192F] mb-4">What we do with it:</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Show your profile to employers or workers so they can connect with you.</li>
              <li>Process payments safely.</li>
              <li>Send you important updates about your jobs, payments, and account.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#0A192F] mb-4">What we never do:</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Sell your data. Ever.</li>
              <li>Share your contact details with anyone outside a job you have applied for or posted.</li>
              <li>Keep your information longer than we need to.</li>
            </ul>
          </section>
          
          <p className="pt-4">
            If you have questions, reach us through the platform.
          </p>
        </div>
      </main>
      
      <SiteFooter />
    </div>
  );
}
