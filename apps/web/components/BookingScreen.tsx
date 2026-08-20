'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FormEvent, useState } from 'react';
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  CreditCard,
  Lock,
  MapPin,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';

const DATE_OPTIONS = ['Today (Urgent)', 'Tomorrow', 'This Weekend', 'Pick a Date'];
const TIME_OPTIONS = [
  'Morning (9:00 AM - 12:00 PM)',
  'Afternoon (1:00 PM - 4:00 PM)',
  'Evening (4:00 PM - 7:00 PM)',
];

function BookingHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-[1180px] items-center px-4 sm:px-6 lg:px-8">
        <Link
          href="/services"
          className="motion-press inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#001A41] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#296A4B]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to services
        </Link>
      </div>
    </header>
  );
}

function DetailCard({ service, price, worker }: { service: string; price: string; worker: string | null }) {
  return (
    <section className="rounded-2xl bg-[#001A41] p-5 text-white shadow-[0_16px_32px_rgba(0,26,65,0.14)] sm:p-6">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#ABEEC8]">Your booking</p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">{service}</h1>
          {worker && <p className="mt-1 text-sm text-slate-200">Preferred BrainWorker: {worker}</p>}
        </div>
        <p className="text-right text-sm text-slate-300">
          Starting from
          <span className="mt-1 block font-display text-xl font-extrabold text-[#ABEEC8]">{price}</span>
        </p>
      </div>
    </section>
  );
}

function ScheduleCard({ date, notes, time, onDate, onNotes, onTime }: {
  date: string;
  notes: string;
  time: string;
  onDate: (value: string) => void;
  onNotes: (value: string) => void;
  onTime: (value: string) => void;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(0,26,65,0.05)] sm:p-6">
      <div className="flex items-center gap-2 text-[#001A41]"><Calendar className="h-4 w-4 text-[#296A4B]" /><h2 className="font-display text-lg font-bold">When should we come?</h2></div>
      <div className="mt-5 grid grid-cols-2 gap-2">
        {DATE_OPTIONS.map((option) => <DateOption key={option} option={option} active={date === option} onClick={onDate} />)}
      </div>
      <label className="mt-5 block text-xs font-bold text-slate-700" htmlFor="booking-arrival-time">Arrival time window</label>
      <select id="booking-arrival-time" value={time} onChange={(event) => onTime(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-[#ABEEC8]">
        {TIME_OPTIONS.map((option) => <option key={option}>{option}</option>)}
      </select>
      <label className="mt-5 block text-xs font-bold text-slate-700" htmlFor="booking-notes">Job notes</label>
      <textarea id="booking-notes" value={notes} onChange={(event) => onNotes(event.target.value)} rows={4} placeholder="Describe the issue, requirements, or anything the BrainWorker should know." className="mt-2 w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-[#ABEEC8]" />
    </section>
  );
}

function DateOption({ option, active, onClick }: { option: string; active: boolean; onClick: (value: string) => void }) {
  return <button type="button" onClick={() => onClick(option)} aria-pressed={active} className={`min-h-12 rounded-xl border px-3 text-left text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ABEEC8] ${active ? 'border-[#001A41] bg-[#001A41] text-white' : 'border-slate-200 text-slate-700 hover:border-slate-300'}`}>{option}</button>;
}

function AddressCard({ city, onCity }: { city: string; onCity: (value: string) => void }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(0,26,65,0.05)] sm:p-6">
      <div className="flex items-center gap-2 text-[#001A41]"><MapPin className="h-4 w-4 text-[#296A4B]" /><h2 className="font-display text-lg font-bold">Where should we come?</h2></div>
      <label className="mt-5 block text-xs font-bold text-slate-700" htmlFor="booking-city">City</label>
      <select id="booking-city" value={city} onChange={(event) => onCity(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-[#ABEEC8]">
        <option>Lagos</option><option>Abuja</option><option>Port Harcourt</option>
      </select>
      <label className="mt-5 block text-xs font-bold text-slate-700" htmlFor="booking-address">Street address and house number</label>
      <input id="booking-address" required placeholder="e.g. 14 Admiralty Way, Lekki Phase 1" className="mt-2 h-12 w-full rounded-xl border border-slate-300 px-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-[#ABEEC8]" />
      <label className="mt-5 block text-xs font-bold text-slate-700" htmlFor="booking-landmark">Closest landmark or estate gate</label>
      <input id="booking-landmark" placeholder="e.g. Near Ebeano Supermarket" className="mt-2 h-12 w-full rounded-xl border border-slate-300 px-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-[#ABEEC8]" />
      <p className="mt-5 flex gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-600"><MapPin className="h-4 w-4 shrink-0 text-[#296A4B]" />Your exact address is shared only when a BrainWorker is assigned to the job.</p>
    </section>
  );
}

function PaymentCard({ price, method, onMethod }: { price: string; method: string; onMethod: (value: string) => void }) {
  return (
    <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(0,26,65,0.05)] sm:p-6 lg:sticky lg:top-6">
      <h2 className="font-display text-lg font-bold text-[#001A41]">Review and book</h2>
      <div className="mt-5 space-y-3 rounded-xl bg-[#F8F9FF] p-4 text-sm"><div className="flex justify-between text-slate-600"><span>Starting service quote</span><span className="font-bold text-[#001A41]">{price}</span></div><div className="flex justify-between border-t border-slate-200 pt-3 font-bold text-[#001A41]"><span>Amount held in escrow</span><span>{price}</span></div></div>
      <p className="mt-4 flex gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs leading-5 text-emerald-950"><ShieldCheck className="h-4 w-4 shrink-0 text-[#296A4B]" />Your payment is held while you review the completed job.</p>
      <p className="mt-5 text-xs font-bold text-slate-700">Payment method</p>
      <div className="mt-2 grid grid-cols-3 gap-2"><PaymentMethod icon={CreditCard} label="Card" active={method === 'card'} onClick={() => onMethod('card')} /><PaymentMethod icon={Building2} label="Transfer" active={method === 'transfer'} onClick={() => onMethod('transfer')} /><PaymentMethod icon={Smartphone} label="USSD" active={method === 'ussd'} onClick={() => onMethod('ussd')} /></div>
      <button type="submit" className="motion-press mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#001A41] px-5 text-sm font-bold text-white transition-colors hover:bg-[#000F2D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ABEEC8] focus-visible:ring-offset-2"><Lock className="h-4 w-4 text-[#ABEEC8]" />Authorize escrow and book</button>
    </aside>
  );
}

function PaymentMethod({ icon: Icon, label, active, onClick }: { icon: typeof CreditCard; label: string; active: boolean; onClick: () => void }) {
  return <button type="button" onClick={onClick} aria-pressed={active} className={`min-h-17 rounded-xl border px-2 py-3 text-[11px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ABEEC8] ${active ? 'border-[#001A41] bg-[#001A41] text-white' : 'border-slate-200 text-slate-700 hover:border-slate-300'}`}><Icon className="mx-auto mb-1 h-4 w-4" />{label}</button>;
}

function Confirmation({ service, city, date, time }: { service: string; city: string; date: string; time: string }) {
  return <section className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-[0_16px_32px_rgba(0,26,65,0.08)]"><span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#ABEEC8]/40 text-[#296A4B]"><CheckCircle2 className="h-8 w-8" /></span><h1 className="mt-5 font-display text-2xl font-extrabold text-[#001A41]">Your booking details are ready</h1><p className="mt-3 text-sm leading-6 text-slate-600">Your request for <strong>{service}</strong> is prepared for <strong>{date}</strong> during {time.toLowerCase()} in {city}.</p><Link href="/services" className="motion-press mt-7 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#001A41] px-5 text-sm font-bold text-white">Return to services</Link></section>;
}

export default function BookingScreen() {
  const params = useSearchParams();
  const [date, setDate] = useState('Tomorrow');
  const [time, setTime] = useState(TIME_OPTIONS[0] ?? 'Morning (9:00 AM - 12:00 PM)');
  const [city, setCity] = useState(params.get('city') || 'Lagos');
  const [notes, setNotes] = useState(params.get('note') || '');
  const [method, setMethod] = useState('card');
  const [complete, setComplete] = useState(false);
  const service = params.get('service') || 'Service booking';
  const price = params.get('price') || '₦10,000';
  const worker = params.get('worker');
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setComplete(true); };

  return <main className="min-h-screen bg-[#F8F9FF] text-[#0B1C30]"><BookingHeader /><div className="mx-auto max-w-[1180px] px-4 py-8 sm:px-6 sm:py-12 lg:px-8">{complete ? <Confirmation service={service} city={city} date={date} time={time} /> : <form onSubmit={submit} className="space-y-6"><DetailCard service={service} price={price} worker={worker} /><div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]"><div className="space-y-6"><ScheduleCard date={date} time={time} notes={notes} onDate={setDate} onTime={setTime} onNotes={setNotes} /><AddressCard city={city} onCity={setCity} /></div><PaymentCard price={price} method={method} onMethod={setMethod} /></div></form>}</div></main>;
}
