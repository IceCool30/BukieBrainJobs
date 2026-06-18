'use client';

import React from 'react';
import { SiteFooter } from '@/components/SiteFooter';
import { LogoLink } from '@/components/LogoLink';
import { Sidebar } from '@/components/Sidebar';
import { Menu } from 'lucide-react';

export default function AboutPage() {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

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
      
      <main className="flex-1 max-w-4xl mx-auto px-4 py-16 w-full">
        <section className="text-center mb-16 px-4">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-[#0A192F] mb-6">
            About BukieBrainJobs
          </h1>
          <p className="text-xl md:text-2xl font-bold text-[#0A192F] max-w-2xl mx-auto">
            Building trust in the Nigerian local economy.
          </p>
        </section>

        <section className="mb-20 px-4">
          <p className="text-gray-700 leading-relaxed text-lg text-center max-w-3xl mx-auto font-medium">
            Finding reliable local artisans and freelancers shouldn't be a gamble. BukieBrainJobs was built to eliminate the uncertainty of hiring in Nigeria. We provide a transparent, secure platform where businesses and individuals can connect with verified professionals instantly.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-8 hover:shadow-lg transition-shadow">
            <h3 className="text-2xl font-bold text-[#0A192F] mb-4">The BukiePassport</h3>
            <p className="text-gray-700 leading-relaxed font-medium">
              Every professional on our platform builds an official digital passport, showcasing their verified skills and work history to win client trust.
            </p>
          </div>
          
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-8 hover:shadow-lg transition-shadow">
            <h3 className="text-2xl font-bold text-[#0A192F] mb-4">Protected Funds</h3>
            <p className="text-gray-700 leading-relaxed font-medium">
              We protect both parties. Payments are held securely as Protected Funds and are only released when the employer is completely satisfied with the work done.
            </p>
          </div>
          
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-8 hover:shadow-lg transition-shadow md:col-span-2 md:max-w-xl md:mx-auto w-full">
            <h3 className="text-2xl font-bold text-[#0A192F] mb-4">Pay-As-You-Go Pricing</h3>
            <p className="text-gray-700 leading-relaxed font-medium">
              No expensive monthly subscriptions. Our Pay-As-You-Go model allows employers to unlock contacts and artisans to bid on jobs for as low as ₦200.
            </p>
          </div>
        </section>
      </main>
      
      <SiteFooter />
    </div>
  );
}
