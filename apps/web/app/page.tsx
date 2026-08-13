'use client';

import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import HeroSection from '../components/HeroSection';
import PopularServices from '../components/PopularServices';
import HowItWorks from '../components/HowItWorks';
import TrustSafetySection from '../components/TrustSafetySection';
import FeaturedBrainWorkers from '../components/FeaturedBrainWorkers';
import StatsStrip from '../components/StatsStrip';
import MarketplacePaths from '../components/MarketplacePaths';
import TestimonialsSection from '../components/TestimonialsSection';
import CorporateSolutions from '../components/CorporateSolutions';
import FAQSection from '../components/FAQSection';
import PartnerBar from '../components/PartnerBar';
import ClosingCTA from '../components/ClosingCTA';
import PostJobModal from '../components/modals/PostJobModal';
import BecomeWorkerModal from '../components/modals/BecomeWorkerModal';
import { ServiceCategory, BrainWorker } from '../lib/mock/homepage-data';

export default function CustomerHomepage() {
  const [postJobOpen, setPostJobOpen] = useState(false);
  const [becomeWorkerOpen, setBecomeWorkerOpen] = useState(false);

  const handleSearchSubmit = (_service: string, _location: string) => {
    const element = document.getElementById('services');
    element?.scrollIntoView({ behavior: 'smooth' });
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
        <HeroSection onSearchSubmit={handleSearchSubmit} />

        {/* Muted partner credibility bar */}
        <PartnerBar />

        {/* Popular Service Categories */}
        <PopularServices onSelectCategory={handleSelectCategory} />

        {/* How BukieBrainJobs Works */}
        <HowItWorks />

        {/* Trust & Safety (BukiePassport & Escrow) */}
        <TrustSafetySection />

        {/* Featured BrainWorkers (Vetted Nigerian Artisans) */}
        <FeaturedBrainWorkers onSelectWorker={handleSelectWorker} />

        {/* Secondary Marketplace Pathways (Level 2 CTAs: Post a Job & Become a BrainWorker) */}
        <StatsStrip />

        <MarketplacePaths
          onPostJobClick={() => setPostJobOpen(true)}
          onBecomeWorkerClick={() => setBecomeWorkerOpen(true)}
        />

        {/* Verified Customer Testimonials */}
        <TestimonialsSection />

        {/* Corporate & Estate Solutions */}
        <CorporateSolutions />

        {/* Final single CTA band, then FAQ */}
        <ClosingCTA onPostJobClick={() => setPostJobOpen(true)} />

        {/* Frequently Asked Questions */}
        <FAQSection />
      </main>

      {/* Corporate Footer */}
      <Footer />

      {/* Modals & Drawers */}
      <PostJobModal isOpen={postJobOpen} onClose={() => setPostJobOpen(false)} />
      <BecomeWorkerModal isOpen={becomeWorkerOpen} onClose={() => setBecomeWorkerOpen(false)} />
    </div>
  );
}
