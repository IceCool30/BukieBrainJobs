'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  BriefcaseBusiness,
  Check,
  Clock3,
  MapPin,
  Menu,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Wrench,
  X,
  Zap,
} from 'lucide-react';

// Imports of migrated mock data & modals
import {
  NIGERIAN_LOCATIONS,
  MOCK_BRAINWORKERS,
  NigerianLocation,
  BrainWorker,
} from '../lib/mock/homepage-data';
import PostJobModal from '../components/modals/PostJobModal';
import BecomeWorkerModal from '../components/modals/BecomeWorkerModal';
import BrainWorkerModal from '../components/modals/BrainWorkerModal';
import LocationNoticeModal from '../components/modals/LocationNoticeModal';
import FAQSection from '../components/FAQSection';

const services = [
  { id: 'cat-1', name: 'Generator repair', meta: 'Power & electrical', icon: Zap, price: 'from ₦8,000' },
  { id: 'cat-2', name: 'AC servicing', meta: 'Cooling & appliances', icon: Sparkles, price: 'from ₦6,500' },
  { id: 'cat-3', name: 'Plumbing', meta: 'Water & fittings', icon: Wrench, price: 'from ₦5,000' },
  { id: 'cat-4', name: 'Home cleaning', meta: 'Home care', icon: Sparkles, price: 'from ₦7,500' },
  { id: 'cat-5', name: 'TV mounting', meta: 'Home installation', icon: BriefcaseBusiness, price: 'from ₦6,000' },
  { id: 'cat-6', name: 'Moving help', meta: 'Moving & hauling', icon: ArrowRight, price: 'from ₦12,000' },
];

const steps = [
  ['01', 'Tell us what you need', 'Search a service or describe the job in plain language.'],
  ['02', 'Compare verified BrainWorkers', 'See ratings, completed jobs, location and BukiePassport status.'],
  ['03', 'Pay securely', 'Your payment stays protected until the work is completed and approved.'],
  ['04', 'Get the job done', 'Review the result, release payment and use BukieGuarantee when eligible.'],
];

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeLocation, setActiveLocation] = useState('Lagos');

  // Modals state
  const [isPostJobOpen, setIsPostJobOpen] = useState(false);
  const [isBecomeWorkerOpen, setIsBecomeWorkerOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<BrainWorker | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<NigerianLocation | null>(null);

  const suggestions = useMemo(
    () => services.filter((service) => service.name.toLowerCase().includes(query.toLowerCase())).slice(0, 4),
    [query],
  );

  const handleCityClick = (cityName: string) => {
    const foundLoc = NIGERIAN_LOCATIONS.find(
      (loc) => loc.city.toLowerCase() === cityName.toLowerCase() ||
               loc.city.toLowerCase().startsWith(cityName.toLowerCase())
    );
    if (foundLoc) {
      setSelectedLocation(foundLoc);
    } else {
      // Fallback placeholder location
      setSelectedLocation({
        city: cityName,
        state: 'Nigeria',
        status: 'coming_soon',
        popularHubs: []
      });
    }
  };

  const handleBookWorker = (worker: BrainWorker) => {
    console.log('Initiating direct request booking flow for BrainWorker:', worker.name);
    setIsPostJobOpen(true);
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f8f9ff] text-[#0b1c30]">
      {/* Header */}
      <header className="border-b border-[#dfe5ef] bg-[#f8f9ff]/95 backdrop-blur-xl sticky top-0 z-40">
        <div className="mx-auto flex h-[76px] max-w-[1280px] items-center justify-between px-5 lg:px-8">
          <a href="#top" className="flex items-center gap-3" aria-label="BukieBrainJobs home">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#001a41] text-white font-display text-lg font-bold">B</span>
            <span className="font-display text-[19px] font-bold tracking-[-0.02em] text-[#001a41]">BukieBrainJobs</span>
          </a>

          <nav className="hidden items-center gap-8 text-sm font-medium text-[#44474e] lg:flex" aria-label="Primary navigation">
            <a className="transition hover:text-[#001a41]" href="#services">Services</a>
            <a className="transition hover:text-[#001a41]" href="#how-it-works">How it works</a>
            <a className="transition hover:text-[#001a41]" href="#brainworkers">BrainWorkers</a>
            <a className="transition hover:text-[#001a41]" href="#trust">Trust & safety</a>
            <a className="transition hover:text-[#001a41]" href="#faqs">FAQs</a>
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <button 
              onClick={() => setIsBecomeWorkerOpen(true)}
              className="rounded-full px-4 py-2.5 text-sm font-semibold text-[#001a41] hover:bg-[#e5eeff]"
            >
              Sign in
            </button>
            <button 
              onClick={() => setIsPostJobOpen(true)}
              className="rounded-full bg-[#001a41] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#000f2d]"
            >
              Post a Job
            </button>
          </div>

          <button className="grid h-11 w-11 place-items-center rounded-xl border border-[#c5c6cf] lg:hidden" onClick={() => setMenuOpen((value) => !value)} aria-expanded={menuOpen} aria-label="Open menu">
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
        {menuOpen && (
          <div className="border-t border-[#dfe5ef] bg-white px-5 py-5 lg:hidden">
            <div className="mx-auto flex max-w-[1280px] flex-col gap-1 text-sm font-semibold">
              {['Services', 'How it works', 'BrainWorkers', 'Trust & safety', 'FAQs'].map((item) => (
                <a key={item} href={`#${item.toLowerCase().replaceAll(' ', '-').replaceAll('&', 'and')}`} className="rounded-xl px-3 py-3 hover:bg-[#eff4ff]" onClick={() => setMenuOpen(false)}>{item}</a>
              ))}
              <button 
                onClick={() => { setMenuOpen(false); setIsPostJobOpen(true); }}
                className="mt-2 rounded-xl bg-[#001a41] px-4 py-3 text-left text-white"
              >
                Post a Job
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section id="top" className="relative border-b border-[#dfe5ef] bg-white">
        <div className="mx-auto grid max-w-[1280px] gap-12 px-5 py-16 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:px-8 lg:py-24">
          <div className="max-w-[680px]">
            <div className="mb-7 inline-flex items-center gap-2 border border-[#c5c6cf] bg-[#f8f9ff] px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#44474e]">
              <span className="h-2 w-2 rounded-full bg-[#296a4b]" /> Built for Nigeria
            </div>
            <h1 className="font-display text-[44px] font-bold leading-[1.05] tracking-[-0.035em] text-[#001a41] sm:text-[58px] lg:text-[68px]">
              Get the right person for the job.
            </h1>
            <p className="mt-6 max-w-[590px] text-lg leading-8 text-[#44474e] sm:text-xl">
              Find trusted local professionals for the work that keeps your home, business and everyday life moving.
            </p>

            <div className="mt-9 max-w-[680px] border border-[#aeb8c8] bg-white p-2 shadow-[0_16px_40px_rgba(0,26,65,0.10)]">
              <div className="grid gap-2 md:grid-cols-[1fr_180px_auto]">
                <div className="relative">
                  <label htmlFor="service-search" className="sr-only">What do you need?</label>
                  <div className="flex h-14 items-center gap-3 px-4">
                    <Search size={20} className="text-[#44474e]" />
                    <input id="service-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="What do you need help with?" className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#75777f]" />
                  </div>
                  {query && suggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-[62px] z-20 border border-[#c5c6cf] bg-white p-2 shadow-xl rounded-b-xl">
                      {suggestions.map(({ name, id, icon: Icon }) => (
                        <button 
                          key={id} 
                          onClick={() => {
                            setQuery(name);
                            setIsPostJobOpen(true);
                          }} 
                          className="flex w-full items-center gap-3 px-3 py-3 text-left hover:bg-[#eff4ff] transition-colors"
                        >
                          <Icon size={18} className="text-[#296a4b]" />
                          <span className="text-sm font-semibold text-[#0b1c30]">{name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex h-14 items-center border-t border-[#dfe5ef] px-4 md:border-l md:border-t-0 md:border-[#c5c6cf]">
                  <MapPin size={18} className="text-[#44474e] mr-2" />
                  <span className="text-sm font-medium text-[#0b1c30]">{activeLocation}</span>
                </div>
                <button 
                  onClick={() => setIsPostJobOpen(true)}
                  className="flex h-14 items-center justify-center bg-[#001a41] px-6 text-sm font-bold text-white transition hover:bg-[#000f2d] md:h-auto py-3 md:py-0"
                >
                  Search
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="relative aspect-[4/3] w-full max-w-[500px] overflow-hidden rounded-[2.5rem] border border-[#dfe5ef] bg-slate-100 shadow-lg">
              <Image
                src="/images/logo-hero.png"
                alt="BukieBrainJobs Visual Representation"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services grid */}
      <section id="services" className="mx-auto max-w-[1280px] px-5 py-20 lg:px-8 lg:py-28">
        <h2 className="font-display text-3xl font-bold tracking-[-0.03em] text-[#001a41] sm:text-4xl">Popular services in your area</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map(({ name, meta, icon: Icon, price, id }) => (
            <div 
              key={id} 
              onClick={() => setIsPostJobOpen(true)}
              className="group cursor-pointer border border-[#dfe5ef] bg-white p-6 shadow-sm transition hover:border-[#001a41] hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <Icon size={24} className="text-[#296a4b] transition-transform group-hover:scale-110" />
                <span className="text-xs font-bold text-[#296a4b] bg-[#effbef] px-2.5 py-1 rounded-full">{price}</span>
              </div>
              <h3 className="mt-6 font-display text-lg font-bold text-[#001a41]">{name}</h3>
              <p className="mt-1 text-sm text-[#75777f]">{meta}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-[#dfe5ef] bg-[#eff4ff]">
        <div className="mx-auto max-w-[1280px] px-5 py-20 lg:px-8 lg:py-28">
          <h2 className="font-display text-3xl font-bold tracking-[-0.03em] text-[#001a41] sm:text-4xl">How BukieBrainJobs works</h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(([num, title, desc]) => (
              <div key={num} className="relative">
                <div className="font-display text-[44px] font-extrabold text-[#296a4b]/20 leading-none">{num}</div>
                <h3 className="mt-4 font-display text-lg font-bold text-[#001a41]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#44474e]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BrainWorkers Grid */}
      <section id="brainworkers" className="mx-auto max-w-[1280px] px-5 py-20 lg:px-8 lg:py-28">
        <h2 className="font-display text-3xl font-bold tracking-[-0.03em] text-[#001a41] sm:text-4xl">Verified BrainWorkers</h2>
        <p className="mt-2 text-sm text-[#44474e]">Browse top-rated professionals with audited credentials on BukiePassport.</p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {MOCK_BRAINWORKERS.map((worker) => (
            <div 
              key={worker.id}
              onClick={() => setSelectedWorker(worker)}
              className="group cursor-pointer border border-[#dfe5ef] bg-white rounded-2xl overflow-hidden shadow-sm transition hover:border-[#001a41] hover:shadow-md p-6"
            >
              <div className="flex items-start gap-4">
                <div className="relative w-16 h-16 rounded-full overflow-hidden border border-slate-100 flex-shrink-0 bg-slate-50">
                  <Image
                    src={worker.avatarUrl}
                    alt={worker.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-[#001a41] flex items-center gap-1.5">
                    {worker.name}
                    {worker.verifiedBadge && <ShieldCheck size={16} className="text-[#296a4b]" />}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">{worker.title}</p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-slate-600">
                    <span className="flex items-center gap-1">
                      <Star size={12} className="text-amber-500 fill-amber-500" />
                      <strong>{worker.rating}</strong>
                    </span>
                    <span>{worker.completedJobs} Jobs</span>
                    <span className="text-[#296a4b] font-semibold">{worker.passportTier}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust Section */}
      <section id="trust" className="bg-[#001a41] text-white">
        <div className="mx-auto grid max-w-[1280px] gap-12 px-5 py-20 lg:grid-cols-[1.1fr_1.3fr] lg:items-center lg:px-8 lg:py-28">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#abeec8]">Trust & safety</p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.025em]">Trust should be visible, not assumed.</h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#d8e2ff]">
              BukieBrainJobs is designed around information users can understand before they commit: who is doing the work, what it costs, and how payment is protected.
            </p>
            <button 
              onClick={() => setIsBecomeWorkerOpen(true)}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#296a4b] px-5 py-3 text-sm font-bold text-white hover:bg-[#205139] transition-colors"
            >
              Learn about BukiePassport <ArrowRight size={16} />
            </button>
          </div>
          <div className="grid gap-0 border border-white/20 sm:grid-cols-2">
            {[
              ['BukiePassport', 'Verification tiers make identity and professional history easier to assess.', BadgeCheck],
              ['Escrow', 'Eligible payments are protected while the work is being completed.', ShieldCheck],
              ['BukieGuarantee', 'Coverage is available on qualifying jobs, subject to clear terms.', ShieldCheck],
              ['Transparent pricing', 'See starting prices and worker details before choosing who to hire.', Check],
            ].map(([title, body, Icon]) => {
              const IconComponent = Icon as React.ComponentType<{ size: number; className?: string }>;
              return (
                <div key={title as string} className="border-b border-r border-white/20 p-6 last:border-b-0">
                  <IconComponent size={22} className="text-[#abeec8]" />
                  <h3 className="mt-7 font-display text-lg font-semibold">{title as string}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#d8e2ff]">{body as string}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Cities Coverage Section */}
      <section className="mx-auto max-w-[1280px] px-5 py-20 lg:px-8 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#296a4b]">Built around where you live</p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.025em] text-[#001a41]">Start local. Grow everywhere.</h2>
            <p className="mt-4 text-base leading-7 text-[#44474e]">
              Coverage begins with active hubs in major Nigerian cities, then expands as the network grows.
            </p>
          </div>
          <div className="flex flex-wrap content-start gap-2 border-l border-[#c5c6cf] pl-7">
            {['Lagos', 'Abuja', 'Port Harcourt', 'Ibadan', 'Benin City', 'Enugu', 'Kano', 'Abeokuta', 'Kaduna', 'Ilorin', 'Jos', 'Uyo'].map((city, index) => (
              <button 
                key={city} 
                onClick={() => {
                  handleCityClick(city);
                  if (index < 8) {
                    setActiveLocation(city);
                  }
                }}
                className={`rounded-full border px-4 py-2.5 text-sm font-medium transition ${index < 8 ? 'border-[#001a41] bg-[#001a41] text-white hover:bg-[#000f2d]' : 'border-[#c5c6cf] bg-white text-[#44474e] hover:border-[#001a41]'}`}
              >
                {city}
                {index >= 8 && <span className="ml-1.5 text-[10px] uppercase tracking-wide text-[#75777f]">soon</span>}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Two ways Section */}
      <section className="border-y border-[#dfe5ef] bg-white">
        <div className="mx-auto max-w-[1280px] px-5 py-20 lg:px-8 lg:py-24">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#296a4b]">Two ways to use the marketplace</p>
              <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.025em] text-[#001a41]">Hire help. Or become the help.</h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-[#44474e]">
              Whether you need a task handled or you have a skill worth paying for, the same trusted infrastructure supports both sides.
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <div className="border border-[#001a41] bg-[#001a41] p-8 text-white">
              <BriefcaseBusiness size={24} className="text-[#abeec8]" />
              <h3 className="mt-12 font-display text-2xl font-semibold">Post a job</h3>
              <p className="mt-3 max-w-md text-sm leading-6 text-[#d8e2ff]">
                Describe what you need when a standard service does not quite fit. Receive offers from relevant BrainWorkers.
              </p>
              <button 
                onClick={() => setIsPostJobOpen(true)}
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-[#001a41] hover:bg-slate-100 transition-colors"
              >
                Post a job <ArrowRight size={16} />
              </button>
            </div>
            <div className="border border-[#c5c6cf] bg-[#eff4ff] p-8">
              <BadgeCheck size={24} className="text-[#296a4b]" />
              <h3 className="mt-12 font-display text-2xl font-semibold text-[#001a41]">Become a BrainWorker</h3>
              <p className="mt-3 max-w-md text-sm leading-6 text-[#44474e]">
                Put your skills in front of customers looking for reliable local professionals.
              </p>
              <button 
                onClick={() => setIsBecomeWorkerOpen(true)}
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#296a4b] px-5 py-3 text-sm font-bold text-white hover:bg-[#205139] transition-colors"
              >
                Join the network <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-[1280px] px-5 py-20 lg:px-8 lg:py-28">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 border border-[#c5c6cf] bg-[#eff4ff] p-8 lg:p-10">
            <div className="flex items-center gap-2 text-[#296a4b]">
              <Star size={17} fill="currentColor" />
              <Star size={17} fill="currentColor" />
              <Star size={17} fill="currentColor" />
              <Star size={17} fill="currentColor" />
              <Star size={17} fill="currentColor" />
            </div>
            <blockquote className="mt-8 max-w-3xl font-display text-3xl font-semibold leading-tight tracking-[-0.02em] text-[#001a41]">
              &quot;I needed a generator technician quickly. I could see the worker&apos;s rating, location and history before I chose who to contact.&quot;
            </blockquote>
            <p className="mt-8 text-sm font-semibold text-[#44474e]">Adaeze N. · Ikeja, Lagos</p>
          </div>
          <div className="flex flex-col justify-between border border-[#001a41] bg-[#001a41] p-8 text-white">
            <div>
              <Clock3 size={24} className="text-[#abeec8]" />
              <h3 className="mt-10 font-display text-2xl font-semibold">Need something else?</h3>
              <p className="mt-3 text-sm leading-6 text-[#d8e2ff]">
                Tell us what you need. The marketplace can help you find the right category or create a custom job.
              </p>
            </div>
            <button 
              onClick={() => setIsPostJobOpen(true)}
              className="mt-10 flex items-center justify-between border-t border-white/20 pt-5 text-sm font-bold hover:text-[#abeec8] transition-colors"
            >
              Describe a task <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </section>

      {/* Dynamic FAQ Accordion Section */}
      <FAQSection />

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#001a41] text-white">
        <div className="mx-auto max-w-[1280px] px-5 py-14 lg:px-8">
          <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div>
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-white font-display text-lg font-bold text-[#001a41]">B</span>
                <span className="font-display text-lg font-bold">BukieBrainJobs</span>
              </div>
              <p className="mt-5 max-w-sm text-sm leading-6 text-[#b2c6f7]">
                A trusted Nigerian marketplace for finding and providing everyday professional services.
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#abeec8]">Marketplace</p>
              <div className="mt-5 space-y-3 text-sm text-[#d8e2ff]">
                <a href="#services" className="block hover:text-white">Services</a>
                <a href="#brainworkers" className="block hover:text-white">BrainWorkers</a>
                <a href="#how-it-works" className="block hover:text-white">How it works</a>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#abeec8]">Trust</p>
              <div className="mt-5 space-y-3 text-sm text-[#d8e2ff]">
                <a href="#trust" className="block hover:text-white">BukiePassport</a>
                <a href="#trust" className="block hover:text-white">Escrow</a>
                <a href="#trust" className="block hover:text-white">BukieGuarantee</a>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#abeec8]">Stay informed</p>
              <p className="mt-5 text-sm leading-6 text-[#d8e2ff]">Get marketplace updates and new city coverage announcements.</p>
              <button 
                onClick={() => handleCityClick('Jos')}
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold hover:text-[#abeec8] transition-colors"
              >
                <Bell size={16} /> Notifications
              </button>
            </div>
          </div>
          <div className="mt-12 flex flex-col justify-between gap-4 border-t border-white/15 pt-6 text-xs text-[#b2c6f7] sm:flex-row">
            <span>© 2026 BukieBrainJobs. All rights reserved.</span>
            <span>Built for Nigeria, with room to grow.</span>
          </div>
        </div>
      </footer>

      {/* Dynamic Modals */}
      <PostJobModal 
        isOpen={isPostJobOpen} 
        onClose={() => setIsPostJobOpen(false)} 
      />
      <BecomeWorkerModal 
        isOpen={isBecomeWorkerOpen} 
        onClose={() => setIsBecomeWorkerOpen(false)} 
      />
      <BrainWorkerModal 
        worker={selectedWorker} 
        isOpen={!!selectedWorker} 
        onClose={() => setSelectedWorker(null)} 
        onBookClick={handleBookWorker}
      />
      <LocationNoticeModal 
        location={selectedLocation} 
        isOpen={!!selectedLocation} 
        onClose={() => setSelectedLocation(null)} 
      />
    </main>
  );
}
