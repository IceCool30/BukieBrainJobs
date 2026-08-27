'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import PwaHome from '../components/PwaHome';
import { useIsPwa } from '../hooks/useIsPwa';
import Footer from '../components/Footer';
import HeroSection from '../components/HeroSection';
import PopularServices from '../components/PopularServices';
import HowItWorks from '../components/HowItWorks';
import FeaturedBrainWorkers from '../components/FeaturedBrainWorkers';
import FAQSection from '../components/FAQSection';
import PartnerBar from '../components/PartnerBar';
import PostJobModal from '../components/modals/PostJobModal';
import BecomeWorkerModal from '../components/modals/BecomeWorkerModal';
import {
  ServiceCategory,
  SERVICE_CATEGORIES,
} from '../lib/mock/homepage-data';

export default function CustomerHomepage() {
  const [postJobOpen, setPostJobOpen] = useState(false);
  const [becomeWorkerOpen, setBecomeWorkerOpen] = useState(false);

  const isPwa = useIsPwa();
  const router = useRouter();
  const drawerRef = useRef<(() => void) | null>(null);

  const goToDiscovery = (details: { service?: string; city?: string; categoryId?: string }) => {
    const params = new URLSearchParams();
    if (details.service) params.set('q', details.service);
    if (details.city) params.set('city', details.city);
    if (details.categoryId) params.set('category', details.categoryId);
    const query = params.toString();
    router.push(query ? `/services?${query}` : '/services');
  };


  const handleSearchSubmit = (serviceQuery: string, location?: string) => {
    const city = location || 'Lagos';
    const matched = SERVICE_CATEGORIES.find((category) =>
      category.title.toLowerCase().includes(serviceQuery.toLowerCase()),
    );
    const details: { service?: string; city: string; categoryId?: string } = { city };
    if (serviceQuery) details.service = serviceQuery;
    if (matched) details.categoryId = matched.id;
    goToDiscovery(details);
  };

  const handleSelectCategory = (category: ServiceCategory) => {
    goToDiscovery({ service: category.title, categoryId: category.id });
  };


  return (
    <div className="min-h-screen bg-[#F8F9FF] text-[#0B1C30] flex flex-col font-sans selection:bg-[#ABEEC8] selection:text-[#001A41]">
      {/* Navigation Header */}
      <Navbar
        onPostJobClick={() => setPostJobOpen(true)}
        onBecomeWorkerClick={() => setBecomeWorkerOpen(true)}
        drawerOpenRef={drawerRef}
        hideOnPwa={isPwa}
      />
      {/* Main Homepage Flow */}
      <main className="flex-grow">
        {isPwa ? (
          <PwaHome
            onOpenDrawer={() => drawerRef.current?.()}
            onSelectCategory={handleSelectCategory}
            onSearchSubmit={handleSearchSubmit}
          />
        ) : (
          <>
            {/* Hero & Discovery Search (LOCKED LEVEL 1 CTA) */}
            <HeroSection
              onSearchSubmit={handleSearchSubmit}
              onSelectCategory={handleSelectCategory}
            />

            {/* Muted partner credibility bar */}
            <PartnerBar />

            {/* Popular Service Categories */}
            <PopularServices onSelectCategory={handleSelectCategory} />

            {/* Featured BrainWorkers (Vetted Nigerian Artisans) */}
            <FeaturedBrainWorkers />

            {/* How BukieBrainJobs Works */}
            <HowItWorks />

            {/* Frequently Asked Questions */}
            <FAQSection />
          </>
        )}
      </main>

      {/* Corporate Footer */}
      <Footer />

      {/* Homepage has no bottom navigation bar (live experience standard). */}

      {/* Modals & Drawers */}
      <PostJobModal isOpen={postJobOpen} onClose={() => setPostJobOpen(false)} />
      <BecomeWorkerModal isOpen={becomeWorkerOpen} onClose={() => setBecomeWorkerOpen(false)} />
    </div>
  );
}
