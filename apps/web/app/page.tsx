'use client';

import { useMemo, useState } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  BriefcaseBusiness,
  Check,
  ChevronDown,
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

const services = [
  { name: 'Generator repair', meta: 'Power & electrical', icon: Zap, price: 'from ₦8,000' },
  { name: 'AC servicing', meta: 'Cooling & appliances', icon: Sparkles, price: 'from ₦6,500' },
  { name: 'Plumbing', meta: 'Water & fittings', icon: Wrench, price: 'from ₦5,000' },
  { name: 'Home cleaning', meta: 'Home care', icon: Sparkles, price: 'from ₦7,500' },
  { name: 'TV mounting', meta: 'Home installation', icon: BriefcaseBusiness, price: 'from ₦6,000' },
  { name: 'Moving help', meta: 'Moving & hauling', icon: ArrowRight, price: 'from ₦12,000' },
];

const workers = [
  { name: 'Emeka Okoro', role: 'Generator technician', place: 'Ikeja, Lagos', rating: '4.9', jobs: 184, tier: 'Tier 2', initials: 'EO' },
  { name: 'Blessing Adeyemi', role: 'AC & refrigeration', place: 'Wuse, Abuja', rating: '5.0', jobs: 127, tier: 'Tier 2', initials: 'BA' },
  { name: 'Tunde Afolabi', role: 'Plumbing specialist', place: 'Ibadan, Oyo', rating: '4.8', jobs: 96, tier: 'Tier 1', initials: 'TA' },
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
  const [location, setLocation] = useState('Lagos');

  const suggestions = useMemo(
    () => services.filter((service) => service.name.toLowerCase().includes(query.toLowerCase())).slice(0, 4),
    [query],
  );

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f8f9ff] text-[#0b1c30]">
      <header className="border-b border-[#dfe5ef] bg-[#f8f9ff]/95 backdrop-blur-xl">
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
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <button className="rounded-full px-4 py-2.5 text-sm font-semibold text-[#001a41] hover:bg-[#e5eeff]">Sign in</button>
            <button className="rounded-full bg-[#001a41] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#000f2d]">Get started</button>
          </div>

          <button className="grid h-11 w-11 place-items-center rounded-xl border border-[#c5c6cf] lg:hidden" onClick={() => setMenuOpen((value) => !value)} aria-expanded={menuOpen} aria-label="Open menu">
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
        {menuOpen && (
          <div className="border-t border-[#dfe5ef] bg-white px-5 py-5 lg:hidden">
            <div className="mx-auto flex max-w-[1280px] flex-col gap-1 text-sm font-semibold">
              {['Services', 'How it works', 'BrainWorkers', 'Trust & safety'].map((item) => (
                <a key={item} href={`#${item.toLowerCase().replaceAll(' ', '-')}`} className="rounded-xl px-3 py-3 hover:bg-[#eff4ff]" onClick={() => setMenuOpen(false)}>{item}</a>
              ))}
              <button className="mt-2 rounded-xl bg-[#001a41] px-4 py-3 text-left text-white">Get started</button>
            </div>
          </div>
        )}
      </header>

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
                    <div className="absolute left-0 right-0 top-[62px] z-20 border border-[#c5c6cf] bg-white p-2 shadow-xl">
                      {suggestions.map(({ name, meta, icon: Icon }) => (
                        <button key={name} onClick={() => setQuery(name)} className="flex w-full items-center gap-3 px-3 py-3 text-left hover:bg-[#eff4ff]">
                          <Icon size={18} className="text-[#296a4b]" />
                          <span><span className="block text-sm font-semibold text-[#0b1c30]">{name}</span><span className="text-xs text-[#75777f]">{meta}</span></span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex h-14 items-center border-t border-[#dfe5ef] px-4 md:border-l md:border-t-0">
                  <MapPin size={18} className="mr-3 text-[#44474e]" />
                  <select value={location} onChange={(event) => setLocation(event.target.value)} className="w-full bg-transparent text-sm font-medium outline-none">
                    <option>Lagos</option><option>Abuja</option><option>Port Harcourt</option><option>Ibadan</option><option>Enugu</option>
                  </select>
                </div>
                <button className="h-14 bg-[#296a4b] px-7 text-sm font-bold text-white transition hover:bg-[#205139]">Search</button>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#44474e]">
              <span className="flex items-center gap-2"><Check size={14} className="text-[#296a4b]" /> Verified professionals</span>
              <span className="flex items-center gap-2"><Check size={14} className="text-[#296a4b]" /> Secure payments</span>
              <span className="flex items-center gap-2"><Check size={14} className="text-[#296a4b]" /> Transparent pricing</span>
            </div>
          </div>

          <div className="relative hidden min-h-[520px] lg:block">
            <div className="absolute right-0 top-0 h-[440px] w-[440px] rounded-[44%_56%_58%_42%/44%_42%_58%_56%] bg-[#e5eeff]" />
            <div className="absolute bottom-4 left-8 h-52 w-52 rounded-[48%_52%_40%_60%/54%_46%_54%_46%] bg-[#d4f5e2]" />
            <div className="absolute left-10 top-16 w-[390px] border border-[#c5c6cf] bg-white p-7 shadow-[0_24px_60px_rgba(0,26,65,0.12)]">
              <div className="flex items-center justify-between border-b border-[#dfe5ef] pb-5">
                <div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#75777f]">Your local network</p><p className="mt-1 font-display text-2xl font-semibold text-[#001a41]">Verified help, nearby.</p></div>
                <div className="grid h-11 w-11 place-items-center rounded-full bg-[#eff4ff]"><MapPin size={20} className="text-[#001a41]" /></div>
              </div>
              <div className="py-5">
                {workers.slice(0, 2).map((worker, index) => (
                  <div key={worker.name} className={`flex items-center gap-4 py-4 ${index ? 'border-t border-[#dfe5ef]' : ''}`}>
                    <div className="grid h-12 w-12 place-items-center rounded-full bg-[#001a41] font-display text-sm font-bold text-white">{worker.initials}</div>
                    <div className="min-w-0 flex-1"><p className="font-semibold text-[#0b1c30]">{worker.name}</p><p className="text-xs text-[#75777f]">{worker.role} · {worker.place}</p></div>
                    <div className="text-right"><p className="flex items-center gap-1 text-sm font-bold"><Star size={13} fill="currentColor" /> {worker.rating}</p><p className="text-[11px] text-[#75777f]">{worker.jobs} jobs</p></div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3 border-t border-[#dfe5ef] pt-5 text-xs text-[#44474e]"><BadgeCheck size={18} className="text-[#296a4b]" /> Identity checks and work history are visible before you hire.</div>
            </div>
            <div className="absolute bottom-7 right-0 w-60 border border-[#c5c6cf] bg-[#001a41] p-5 text-white shadow-[0_20px_50px_rgba(0,26,65,0.18)]">
              <p className="text-xs uppercase tracking-[0.12em] text-[#b2c6f7]">BukieGuarantee</p>
              <p className="mt-2 font-display text-3xl font-bold">Up to ₦500k</p>
              <p className="mt-2 text-xs leading-5 text-[#d8e2ff]">Protection for eligible jobs, with clear terms before you pay.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#dfe5ef] bg-[#001a41] text-white">
        <div className="mx-auto grid max-w-[1280px] divide-y divide-white/15 px-5 py-0 md:grid-cols-3 md:divide-x md:divide-y-0 lg:px-8">
          {[
            ['Identity checked', 'NIN & BVN verification through BukiePassport'],
            ['Money protected', 'Escrow keeps eligible payments secure'],
            ['Work accountable', 'Ratings, job history and guarantee coverage'],
          ].map(([title, body]) => <div key={title} className="px-0 py-7 md:px-8 first:pl-0 last:pr-0"><p className="font-display text-lg font-semibold">{title}</p><p className="mt-1 text-sm leading-6 text-[#d8e2ff]">{body}</p></div>)}
        </div>
      </section>

      <section id="services" className="mx-auto max-w-[1280px] px-5 py-20 lg:px-8 lg:py-28">
        <div className="flex flex-col justify-between gap-6 border-b border-[#c5c6cf] pb-8 md:flex-row md:items-end">
          <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#296a4b]">Popular services</p><h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.025em] text-[#001a41]">Start with what you need.</h2></div>
          <a href="#services" className="flex items-center gap-2 text-sm font-semibold text-[#001a41]">Browse all services <ArrowRight size={17} /></a>
        </div>
        <div className="mt-8 grid gap-px border border-[#c5c6cf] bg-[#c5c6cf] sm:grid-cols-2 lg:grid-cols-3">
          {services.map(({ name, meta, icon: Icon, price }) => (
            <button key={name} className="group bg-white p-7 text-left transition hover:bg-[#eff4ff]">
              <div className="flex items-start justify-between"><span className="grid h-11 w-11 place-items-center bg-[#eff4ff] text-[#001a41] transition group-hover:bg-white"><Icon size={20} /></span><ArrowRight size={18} className="text-[#75777f] transition group-hover:translate-x-1 group-hover:text-[#001a41]" /></div>
              <p className="mt-8 font-display text-xl font-semibold text-[#001a41]">{name}</p><p className="mt-1 text-sm text-[#75777f]">{meta}</p><p className="mt-5 text-xs font-semibold uppercase tracking-[0.08em] text-[#296a4b]">{price}</p>
            </button>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="border-y border-[#dfe5ef] bg-[#eff4ff]">
        <div className="mx-auto max-w-[1280px] px-5 py-20 lg:px-8 lg:py-28">
          <div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#296a4b]">Simple by design</p><h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.025em] text-[#001a41]">From "I need help" to "job done".</h2><p className="mt-4 text-lg leading-7 text-[#44474e]">The marketplace should remove uncertainty, not add more steps.</p></div>
          <div className="mt-12 grid border-l border-t border-[#c5c6cf] md:grid-cols-2 lg:grid-cols-4">
            {steps.map(([number, title, body]) => <div key={number} className="min-h-[250px] border-b border-r border-[#c5c6cf] bg-white p-7"><p className="font-mono text-xs font-bold text-[#296a4b]">{number}</p><h3 className="mt-16 font-display text-xl font-semibold text-[#001a41]">{title}</h3><p className="mt-3 text-sm leading-6 text-[#44474e]">{body}</p></div>)}
          </div>
        </div>
      </section>

      <section id="brainworkers" className="mx-auto max-w-[1280px] px-5 py-20 lg:px-8 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
          <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#296a4b]">Meet the BrainWorkers</p><h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.025em] text-[#001a41]">People you can hire with confidence.</h2><p className="mt-5 text-base leading-7 text-[#44474e]">Every profile gives you the information you need to make a better decision before the first message or payment.</p></div>
          <div className="grid gap-4 md:grid-cols-3">
            {workers.map((worker) => <article key={worker.name} className="border border-[#c5c6cf] bg-white p-5 transition hover:border-[#001a41] hover:shadow-[0_16px_40px_rgba(0,26,65,0.08)]"><div className="flex items-center justify-between"><div className="grid h-12 w-12 place-items-center rounded-full bg-[#001a41] font-display text-sm font-bold text-white">{worker.initials}</div><span className="inline-flex items-center gap-1 rounded-full bg-[#d4f5e2] px-2.5 py-1 text-[11px] font-bold text-[#205139]"><BadgeCheck size={13} /> {worker.tier}</span></div><h3 className="mt-6 font-display text-lg font-semibold text-[#001a41]">{worker.name}</h3><p className="mt-1 text-sm text-[#44474e]">{worker.role}</p><p className="mt-3 flex items-center gap-1 text-xs text-[#75777f]"><MapPin size={13} /> {worker.place}</p><div className="mt-5 flex items-center justify-between border-t border-[#dfe5ef] pt-4 text-xs"><span className="flex items-center gap-1 font-semibold"><Star size={13} fill="currentColor" /> {worker.rating}</span><span className="text-[#75777f]">{worker.jobs} jobs completed</span></div></article>)}
          </div>
        </div>
      </section>

      <section id="trust" className="bg-[#001a41] text-white">
        <div className="mx-auto grid max-w-[1280px] gap-14 px-5 py-20 lg:grid-cols-[.9fr_1.1fr] lg:px-8 lg:py-28">
          <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#abeec8]">Trust & safety</p><h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.025em]">Trust should be visible, not assumed.</h2><p className="mt-5 max-w-xl text-base leading-7 text-[#d8e2ff]">BukieBrainJobs is designed around information users can understand before they commit: who is doing the work, what it costs, and how payment is protected.</p><button className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#296a4b] px-5 py-3 text-sm font-bold text-white hover:bg-[#205139]">Learn about BukiePassport <ArrowRight size={16} /></button></div>
          <div className="grid gap-0 border border-white/20 sm:grid-cols-2">
            {[
              ['BukiePassport', 'Verification tiers make identity and professional history easier to assess.', BadgeCheck],
              ['Escrow', 'Eligible payments are protected while the work is being completed.', ShieldCheck],
              ['BukieGuarantee', 'Coverage is available on qualifying jobs, subject to clear terms.', ShieldCheck],
              ['Transparent pricing', 'See starting prices and worker details before choosing who to hire.', Check],
            ].map(([title, body, Icon]) => <div key={title as string} className="border-b border-r border-white/20 p-6 last:border-b-0"><Icon size={22} className="text-[#abeec8]" /><h3 className="mt-7 font-display text-lg font-semibold">{title as string}</h3><p className="mt-2 text-sm leading-6 text-[#d8e2ff]">{body as string}</p></div>)}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-5 py-20 lg:px-8 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#296a4b]">Built around where you live</p><h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.025em] text-[#001a41]">Start local. Grow everywhere.</h2><p className="mt-4 text-base leading-7 text-[#44474e]">Coverage begins with active hubs in major Nigerian cities, then expands as the network grows.</p></div>
          <div className="flex flex-wrap content-start gap-2 border-l border-[#c5c6cf] pl-7">{['Lagos', 'Abuja', 'Port Harcourt', 'Ibadan', 'Benin City', 'Enugu', 'Kano', 'Abeokuta', 'Kaduna', 'Ilorin', 'Jos', 'Uyo'].map((city, index) => <button key={city} className={`rounded-full border px-4 py-2.5 text-sm font-medium transition ${index < 8 ? 'border-[#001a41] bg-[#001a41] text-white hover:bg-[#000f2d]' : 'border-[#c5c6cf] bg-white text-[#44474e] hover:border-[#001a41]'}`}>{city}{index >= 8 && <span className="ml-1.5 text-[10px] uppercase tracking-wide text-[#75777f]">soon</span>}</button>)}</div>
        </div>
      </section>

      <section className="border-y border-[#dfe5ef] bg-white">
        <div className="mx-auto max-w-[1280px] px-5 py-20 lg:px-8 lg:py-24">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#296a4b]">Two ways to use the marketplace</p><h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.025em] text-[#001a41]">Hire help. Or become the help.</h2></div><p className="max-w-md text-sm leading-6 text-[#44474e]">Whether you need a task handled or you have a skill worth paying for, the same trusted infrastructure supports both sides.</p></div>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <div className="border border-[#001a41] bg-[#001a41] p-8 text-white"><BriefcaseBusiness size={24} className="text-[#abeec8]" /><h3 className="mt-12 font-display text-2xl font-semibold">Post a job</h3><p className="mt-3 max-w-md text-sm leading-6 text-[#d8e2ff]">Describe what you need when a standard service does not quite fit. Receive offers from relevant BrainWorkers.</p><button className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-[#001a41]">Post a job <ArrowRight size={16} /></button></div>
            <div className="border border-[#c5c6cf] bg-[#eff4ff] p-8"><BadgeCheck size={24} className="text-[#296a4b]" /><h3 className="mt-12 font-display text-2xl font-semibold text-[#001a41]">Become a BrainWorker</h3><p className="mt-3 max-w-md text-sm leading-6 text-[#44474e]">Put your skills in front of customers looking for reliable local professionals.</p><button className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#296a4b] px-5 py-3 text-sm font-bold text-white">Join the network <ArrowRight size={16} /></button></div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-5 py-20 lg:px-8 lg:py-28">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 border border-[#c5c6cf] bg-[#eff4ff] p-8 lg:p-10"><div className="flex items-center gap-2 text-[#296a4b]"><Star size={17} fill="currentColor" /><Star size={17} fill="currentColor" /><Star size={17} fill="currentColor" /><Star size={17} fill="currentColor" /><Star size={17} fill="currentColor" /></div><blockquote className="mt-8 max-w-3xl font-display text-3xl font-semibold leading-tight tracking-[-0.02em] text-[#001a41]">"I needed a generator technician quickly. I could see the worker's rating, location and history before I chose who to contact."</blockquote><p className="mt-8 text-sm font-semibold text-[#44474e]">Adaeze N. · Ikeja, Lagos</p></div>
          <div className="flex flex-col justify-between border border-[#001a41] bg-[#001a41] p-8 text-white"><div><Clock3 size={24} className="text-[#abeec8]" /><h3 className="mt-10 font-display text-2xl font-semibold">Need something else?</h3><p className="mt-3 text-sm leading-6 text-[#d8e2ff]">Tell us what you need. The marketplace can help you find the right category or create a custom job.</p></div><button className="mt-10 flex items-center justify-between border-t border-white/20 pt-5 text-sm font-bold">Describe a task <ArrowRight size={17} /></button></div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-[#001a41] text-white">
        <div className="mx-auto max-w-[1280px] px-5 py-14 lg:px-8">
          <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-white font-display text-lg font-bold text-[#001a41]">B</span><span className="font-display text-lg font-bold">BukieBrainJobs</span></div><p className="mt-5 max-w-sm text-sm leading-6 text-[#b2c6f7]">A trusted Nigerian marketplace for finding and providing everyday professional services.</p></div>
            <div><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#abeec8]">Marketplace</p><div className="mt-5 space-y-3 text-sm text-[#d8e2ff]"><a href="#services" className="block hover:text-white">Services</a><a href="#brainworkers" className="block hover:text-white">BrainWorkers</a><a href="#how-it-works" className="block hover:text-white">How it works</a></div></div>
            <div><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#abeec8]">Trust</p><div className="mt-5 space-y-3 text-sm text-[#d8e2ff]"><a href="#trust" className="block hover:text-white">BukiePassport</a><a href="#trust" className="block hover:text-white">Escrow</a><a href="#trust" className="block hover:text-white">BukieGuarantee</a></div></div>
            <div><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#abeec8]">Stay informed</p><p className="mt-5 text-sm leading-6 text-[#d8e2ff]">Get marketplace updates and new city coverage announcements.</p><button className="mt-4 inline-flex items-center gap-2 text-sm font-semibold"><Bell size={16} /> Notifications</button></div>
          </div>
          <div className="mt-12 flex flex-col justify-between gap-4 border-t border-white/15 pt-6 text-xs text-[#b2c6f7] sm:flex-row"><span>© 2026 BukieBrainJobs. All rights reserved.</span><span>Built for Nigeria, with room to grow.</span></div>
        </div>
      </footer>
    </main>
  );
}
