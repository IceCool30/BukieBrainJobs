'use client';

import React, { useState, useRef } from 'react';
import Navbar from '../components/Navbar';
import PwaHome from '../components/PwaHome';
import { useIsPwa } from '../hooks/useIsPwa';
import Footer from '../components/Footer';
import HeroSection from '../components/HeroSection';
import PopularServices from '../components/PopularServices';
import PriceEstimator from '../components/PriceEstimator';
import HowItWorks from '../components/HowItWorks';
import FeaturedBrainWorkers from '../components/FeaturedBrainWorkers';
import MarketplacePaths from '../components/MarketplacePaths';
import TestimonialsSection from '../components/TestimonialsSection';
import FAQSection from '../components/FAQSection';
import PartnerBar from '../components/PartnerBar';
import BottomNav from '../components/BottomNav';
import PwaInstallBanner from '../components/PwaInstallBanner';
import PostJobModal from '../components/modals/PostJobModal';
import BecomeWorkerModal from '../components/modals/BecomeWorkerModal';
import BukiePassportModal from '../components/modals/BukiePassportModal';
import BrainWorkerProfileModal from '../components/modals/BrainWorkerProfileModal';
import DirectBookingModal from '../components/modals/DirectBookingModal';
import { BrainWorker, ServiceCategory, SERVICE_CATEGORIES } from '../lib/mock/homepage-data';

export default function CustomerHomepage() {
  const [postJobOpen, setPostJobOpen] = useState(false);
  const [becomeWorkerOpen, setBecomeWorkerOpen] = useState(false);
  const [passportModalOpen, setPassportModalOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<BrainWorker | null>(null);
  const [directBookingOpen, setDirectBookingOpen] = useState(false);
  const [bookingWorker, setBookingWorker] = useState<BrainWorker | null>(null);
  const [bookingCategory, setBookingCategory] = useState<ServiceCategory | null>(null);
  const [bookingInitialDetails, setBookingInitialDetails] = useState<{
    title?: string;
    startingPrice?: string;
    city?: string;
    scopeNote?: string;
  } | null>(null);

  const isPwa = useIsPwa();
  const drawerRef = useRef<(() => void) | null>(null);

  const handleSearchSubmit = (serviceQuery: string) => {
    const matched = SERVICE_CATEGORIES.find((c) =>
      c.title.toLowerCase().includes(serviceQuery.toLowerCase())
    );
    if (matched) {
      setBookingCategory(matched);
      setBookingWorker(null);
      setBookingInitialDetails(null);
      setDirectBookingOpen(true);
      return;
    }
    const element = document.getElementById('services');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const openSearch = () => {
    const input = document.getElementById('hero-service-input') as HTMLInputElement | null;
    input?.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategory = (category: ServiceCategory) => {
    setBookingCategory(category);
    setBookingWorker(null);
    setBookingInitialDetails(null);
    setDirectBookingOpen(true);
  };

  const handleSelectWorker = (worker: BrainWorker) => {
    setSelectedWorker(worker);
  };

  const handleBookWorker = (worker: BrainWorker) => {
    setBookingWorker(worker);
    setBookingCategory(null);
    setBookingInitialDetails(null);
    setDirectBookingOpen(true);
  };

  const handleBookEstimate = (
    serviceName: string,
    details?: {
      scopeName: string;
      city: string;
      priceRange: string;
      scopeNote: string;
    }
  ) => {
    const matched = SERVICE_CATEGORIES.find((c) =>
      c.title.toLowerCase().includes(serviceName.toLowerCase())
    );
    setBookingCategory(matched || null);
    setBookingWorker(null);
    if (details) {
      setBookingInitialDetails({
        title: `${serviceName} (${details.scopeName})`,
        startingPrice: details.priceRange,
        city: details.city,
        scopeNote: details.scopeNote,
      });
    } else {
      setBookingInitialDetails(null);
    }
    setDirectBookingOpen(true);
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
      <main className="flex-grow pb-16 md:pb-0">
        {isPwa ? (
          <PwaHome onOpenDrawer={() => drawerRef.current?.()} onOpenSearch={openSearch} />
        ) : (
          <>
            {/* Hero & Discovery Search (LOCKED LEVEL 1 CTA) */}
            <HeroSection onSearchSubmit={handleSearchSubmit} />

            {/* Muted partner credibility bar */}
            <PartnerBar />

            {/* Popular Service Categories */}
            <PopularServices onSelectCategory={handleSelectCategory} />

            {/* Instant Price Estimator Benchmark */}
            <PriceEstimator onBookEstimate={handleBookEstimate} />

            {/* Featured BrainWorkers (Vetted Nigerian Artisans) */}
            <FeaturedBrainWorkers onSelectWorker={handleSelectWorker} />

            {/* How BukieBrainJobs Works */}
            <HowItWorks />

            {/* Verified Customer Testimonials */}
            <TestimonialsSection />

            {/* Secondary Marketplace Pathways */}
            <MarketplacePaths
              onPostJobClick={() => setPostJobOpen(true)}
              onBecomeWorkerClick={() => setBecomeWorkerOpen(true)}
            />

            {/* Frequently Asked Questions */}
            <FAQSection />
          </>
        )}
      </main>

      {/* Corporate Footer */}
      <Footer />

      {/* Persistent Ergonomic Mobile Bottom Nav, absent on the home landing page */}
      {!isPwa && (
      <BottomNav
        onExploreClick={openSearch}
        onJobsClick={() => setPostJobOpen(true)}
        onVerifyClick={() => setPassportModalOpen(true)}
        onMenuClick={() => drawerRef.current?.()}
      />
      )}

      {/* PWA Install Banner */}
      <PwaInstallBanner />

      {/* Modals & Drawers */}
      <PostJobModal isOpen={postJobOpen} onClose={() => setPostJobOpen(false)} />
      <BecomeWorkerModal isOpen={becomeWorkerOpen} onClose={() => setBecomeWorkerOpen(false)} />
      <BukiePassportModal isOpen={passportModalOpen} onClose={() => setPassportModalOpen(false)} />
      <BrainWorkerProfileModal
        worker={selectedWorker}
        isOpen={!!selectedWorker}
        onClose={() => setSelectedWorker(null)}
        onBookWorker={handleBookWorker}
      />
      <DirectBookingModal
        isOpen={directBookingOpen}
        onClose={() => {
          setDirectBookingOpen(false);
          setBookingWorker(null);
          setBookingCategory(null);
          setBookingInitialDetails(null);
        }}
        worker={bookingWorker}
        serviceCategory={bookingCategory}
        initialDetails={bookingInitialDetails}
      />
    </div>
  );
}
