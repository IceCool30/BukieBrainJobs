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
import MarketplacePaths from '../components/MarketplacePaths';
import TestimonialsSection from '../components/TestimonialsSection';
import FAQSection from '../components/FAQSection';
import PartnerBar from '../components/PartnerBar';
import PostJobModal from '../components/modals/PostJobModal';
import BecomeWorkerModal from '../components/modals/BecomeWorkerModal';
import BrainWorkerProfileModal from '../components/modals/BrainWorkerProfileModal';
import LocationNoticeModal from '../components/modals/LocationNoticeModal';
import {
  BrainWorker,
  ServiceCategory,
  SERVICE_CATEGORIES,
  NigerianLocation,
} from '../lib/mock/homepage-data';

export default function CustomerHomepage() {
  const [postJobOpen, setPostJobOpen] = useState(false);
  const [becomeWorkerOpen, setBecomeWorkerOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<BrainWorker | null>(null);
  const [comingSoonLocation, setComingSoonLocation] = useState<NigerianLocation | null>(null);

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

  const startBooking = (details: { service: string; price?: string; city?: string; note?: string; worker?: string }) => {
    const params = new URLSearchParams({ service: details.service, price: details.price || '₦10,000' });
    if (details.city) params.set('city', details.city);
    if (details.note) params.set('note', details.note);
    if (details.worker) params.set('worker', details.worker);
    router.push(`/book?${params.toString()}`);
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

  const handleSelectWorker = (worker: BrainWorker) => {
    setSelectedWorker(worker);
  };

  const handleBookWorker = (worker: BrainWorker) => {
    startBooking({
      service: worker.category,
      price: worker.startingRate,
      city: worker.location.includes('Abuja')
        ? 'Abuja'
        : worker.location.includes('Port Harcourt')
          ? 'Port Harcourt'
          : 'Lagos',
      worker: worker.name,
    });
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
            onSelectWorker={handleSelectWorker}
            onSearchSubmit={handleSearchSubmit}
            onPostJobClick={() => setPostJobOpen(true)}
            onBecomeWorkerClick={() => setBecomeWorkerOpen(true)}
            onSelectComingSoonLocation={(loc) => setComingSoonLocation(loc)}
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

      {/* Homepage has no bottom navigation bar (live experience standard). */}

      {/* Modals & Drawers */}
      <PostJobModal isOpen={postJobOpen} onClose={() => setPostJobOpen(false)} />
      <BecomeWorkerModal isOpen={becomeWorkerOpen} onClose={() => setBecomeWorkerOpen(false)} />
      <LocationNoticeModal
        location={comingSoonLocation}
        onClose={() => setComingSoonLocation(null)}
      />
      <BrainWorkerProfileModal
        worker={selectedWorker}
        isOpen={!!selectedWorker}
        onClose={() => setSelectedWorker(null)}
        onBookWorker={handleBookWorker}
      />
    </div>
  );
}
