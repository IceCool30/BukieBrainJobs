'use client';

import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import HeroSection from '../components/HeroSection';
import PopularServices from '../components/PopularServices';
import HowItWorks from '../components/HowItWorks';
import TrustSafetySection from '../components/TrustSafetySection';
import FeaturedBrainWorkers from '../components/FeaturedBrainWorkers';
import MarketplacePaths from '../components/MarketplacePaths';
import TestimonialsSection from '../components/TestimonialsSection';
import CorporateSolutions from '../components/CorporateSolutions';
import FAQSection from '../components/FAQSection';
import PostJobModal from '../components/modals/PostJobModal';
import BecomeWorkerModal from '../components/modals/BecomeWorkerModal';
import LocationNoticeModal from '../components/modals/LocationNoticeModal';
import { NigerianLocation, ServiceCategory, BrainWorker } from '../lib/mock/homepage-data';

export default function CustomerHomepage() {
  const [postJobOpen, setPostJobOpen] = useState(false);
  const [becomeWorkerOpen, setBecomeWorkerOpen] = useState(false);
  const [noticeLocation, setNoticeLocation] = useState<NigerianLocation | null>(null);

  const handleSearchSubmit = (service: string, location: NigerianLocation) => {
    if (location.status === 'soon') {
      setNoticeLocation(location);
    } else {
      const element = document.getElementById('services');
      element?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectCategory = (_category: ServiceCategory) => {
    const element = document.getElementById('services');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectWorker = (_worker: BrainWorker) => {
    // Smooth scroll to trust or open booking modal
    const element = document.getElementById('trust');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#F8F9FF] text-[#0B1C30] flex flex-col font-sans selection:bg-[#ABEEC8] selection:text-[#001A41]">
      {/* Navigation Header */}
      <Navbar
        onPostJobClick={() => setPostJobOpen(true)}
        onBecomeWorkerClick={() => setBecomeWorkerOpen(true)}
      />

      {/* Main Homepage Flow */}
      <main className="flex-grow">
        {/* Hero & Discovery Search (LOCKED LEVEL 1 CTA) */}
        <HeroSection
          onSearchSubmit={handleSearchSubmit}
          onLocationNotice={(loc) => setNoticeLocation(loc)}
        />

        {/* Popular Service Categories */}
        <PopularServices onSelectCategory={handleSelectCategory} />

        {/* How BukieBrainJobs Works */}
        <HowItWorks />

        {/* Trust & Safety (BukiePassport & Escrow) */}
        <TrustSafetySection />

        {/* Featured BrainWorkers (Vetted Nigerian Artisans) */}
        <FeaturedBrainWorkers onSelectWorker={handleSelectWorker} />

        {/* Secondary Marketplace Pathways (Level 2 CTAs: Post a Job & Become a BrainWorker) */}
        <MarketplacePaths
          onPostJobClick={() => setPostJobOpen(true)}
          onBecomeWorkerClick={() => setBecomeWorkerOpen(true)}
        />

        {/* Verified Customer Testimonials */}
        <TestimonialsSection />

        {/* Corporate & Estate Solutions */}
        <CorporateSolutions />

        {/* Frequently Asked Questions */}
        <FAQSection />
      </main>

      {/* Corporate Footer */}
      <Footer />

      {/* Modals & Drawers */}
      <PostJobModal isOpen={postJobOpen} onClose={() => setPostJobOpen(false)} />
      <BecomeWorkerModal isOpen={becomeWorkerOpen} onClose={() => setBecomeWorkerOpen(false)} />
      <LocationNoticeModal location={noticeLocation} onClose={() => setNoticeLocation(null)} />
    </div>
  );
}
