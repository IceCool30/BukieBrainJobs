'use client';

import { getPrototypeSubmissionOutcome, validateBookingDraft } from '@bukiebrainjobs/validation';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Building2, Calendar, CheckCircle2, CreditCard, Lock, MapPin, ShieldCheck, Smartphone, WifiOff } from 'lucide-react';
import { NIGERIAN_LOCATIONS } from '../lib/mock/homepage-data';

const DATE_OPTIONS = ['Today (Urgent)', 'Tomorrow', 'This Weekend', 'Pick a Date'];
const TIME_OPTIONS = ['Morning (9:00 AM - 12:00 PM)', 'Afternoon (1:00 PM - 4:00 PM)', 'Evening (4:00 PM - 7:00 PM)'] as const;
type SubmitStatus = 'idle' | 'pending' | 'error' | 'success';
type BookingDraft = { address: string; city: string; landmark: string; notes: string };

function BookingHeader() {
  return <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex h-16 max-w-[1180px] items-center px-4 sm:px-6 lg:px-8"><Link href="/services" className="motion-press inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#001A41] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#296A4B]"><ArrowLeft className="h-4 w-4" />Back to services</Link></div></header>;
}

function DetailCard({ service, price, worker }: { service: string; price: string; worker: string | null }) {
  return <section className="rounded-2xl bg-[#001A41] p-5 text-white shadow-[0_16px_32px_rgba(0,26,65,0.14)] sm:p-6"><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#ABEEC8]">Booking details</p><div className="mt-3 flex flex-wrap items-end justify-between gap-4"><div><h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">{service}</h1>{worker && <p className="mt-1 text-sm text-slate-200">Preferred BrainWorker: {worker}</p>}</div><p className="text-right text-sm text-slate-300">Starting from<span className="mt-1 block font-display text-xl font-extrabold text-[#ABEEC8]">{price}</span></p></div></section>;
}

function FieldError({ id, message }: { id: string; message: string | undefined }) {
  return message ? <p id={id} className="mt-1 text-xs font-medium text-red-700">{message}</p> : null;
}

function DateOption({ active, option, onClick }: { active: boolean; option: string; onClick: (value: string) => void }) {
  return <button type="button" onClick={() => onClick(option)} aria-pressed={active} className={`min-h-12 rounded-xl border px-3 text-left text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ABEEC8] ${active ? 'border-[#001A41] bg-[#001A41] text-white' : 'border-slate-200 text-slate-700 hover:border-slate-300'}`}>{option}</button>;
}

function ScheduleCard({ date, errors, notes, time, onDate, onNotes, onTime }: { date: string; errors: Record<string, string>; notes: string; time: string; onDate: (value: string) => void; onNotes: (value: string) => void; onTime: (value: string) => void }) {
  return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(0,26,65,0.05)] sm:p-6"><div className="flex items-center gap-2 text-[#001A41]"><Calendar className="h-4 w-4 text-[#296A4B]" /><h2 className="font-display text-lg font-bold">When do you need it?</h2></div><div className="mt-5 grid grid-cols-2 gap-2">{DATE_OPTIONS.map((option) => <DateOption key={option} option={option} active={date === option} onClick={onDate} />)}</div><label className="mt-5 block text-xs font-bold text-slate-700" htmlFor="booking-arrival-time">Preferred time window</label><select id="booking-arrival-time" value={time} onChange={(event) => onTime(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-[#ABEEC8]">{TIME_OPTIONS.map((option) => <option key={option}>{option}</option>)}</select><label className="mt-5 block text-xs font-bold text-slate-700" htmlFor="booking-notes">Job details</label><textarea id="booking-notes" value={notes} onChange={(event) => onNotes(event.target.value)} aria-invalid={Boolean(errors.notes)} aria-describedby={errors.notes ? 'booking-notes-error' : undefined} rows={4} placeholder="Describe the issue, requirements, or anything the BrainWorker should know." className="mt-2 w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-[#ABEEC8] aria-[invalid=true]:border-red-500" /><FieldError id="booking-notes-error" message={errors.notes} /></section>;
}

function AddressCard({ draft, errors, onChange }: { draft: BookingDraft; errors: Record<string, string>; onChange: (field: keyof BookingDraft, value: string) => void }) {
  return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(0,26,65,0.05)] sm:p-6"><div className="flex items-center gap-2 text-[#001A41]"><MapPin className="h-4 w-4 text-[#296A4B]" /><h2 className="font-display text-lg font-bold">Where is the job?</h2></div><label className="mt-5 block text-xs font-bold text-slate-700" htmlFor="booking-city">City</label><select id="booking-city" value={draft.city} onChange={(event) => onChange('city', event.target.value)} aria-invalid={Boolean(errors.city)} aria-describedby={errors.city ? 'booking-city-error' : undefined} className="mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-[#ABEEC8] aria-[invalid=true]:border-red-500">{NIGERIAN_LOCATIONS.map((location) => <option key={location.id} value={location.name}>{location.name}</option>)}</select><FieldError id="booking-city-error" message={errors.city} /><label className="mt-5 block text-xs font-bold text-slate-700" htmlFor="booking-address">Street address and house number</label><input id="booking-address" value={draft.address} onChange={(event) => onChange('address', event.target.value)} aria-invalid={Boolean(errors.address)} aria-describedby={errors.address ? 'booking-address-error' : undefined} placeholder="e.g. 14 Admiralty Way, Lekki Phase 1" className="mt-2 h-12 w-full rounded-xl border border-slate-300 px-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-[#ABEEC8] aria-[invalid=true]:border-red-500" /><FieldError id="booking-address-error" message={errors.address} /><label className="mt-5 block text-xs font-bold text-slate-700" htmlFor="booking-landmark">Closest landmark or estate gate</label><input id="booking-landmark" value={draft.landmark} onChange={(event) => onChange('landmark', event.target.value)} placeholder="e.g. Near Ebeano Supermarket" className="mt-2 h-12 w-full rounded-xl border border-slate-300 px-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-[#ABEEC8]" /><p className="mt-5 flex gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-600"><MapPin className="h-4 w-4 shrink-0 text-[#296A4B]" />Your address helps your BrainWorker find the job location.</p></section>;
}

function PaymentMethod({ active, icon: Icon, label, onClick }: { active: boolean; icon: typeof CreditCard; label: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} aria-pressed={active} className={`min-h-16 rounded-xl border px-2 py-3 text-[11px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ABEEC8] ${active ? 'border-[#001A41] bg-[#001A41] text-white' : 'border-slate-200 text-slate-700 hover:border-slate-300'}`}><Icon className="mx-auto mb-1 h-4 w-4" />{label}</button>;
}

function PaymentCard({ price, method, pending, onMethod }: { price: string; method: string; pending: boolean; onMethod: (value: string) => void }) {
  return <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(0,26,65,0.05)] sm:p-6 lg:sticky lg:top-6"><h2 className="font-display text-lg font-bold text-[#001A41]">Review booking details</h2><div className="mt-5 space-y-3 rounded-xl bg-[#F8F9FF] p-4 text-sm"><div className="flex justify-between text-slate-600"><span>Starting price</span><span className="font-bold text-[#001A41]">{price}</span></div><div className="flex justify-between border-t border-slate-200 pt-3 font-bold text-[#001A41]"><span>Price shown</span><span>{price}</span></div></div><p className="mt-4 flex gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs leading-5 text-emerald-950"><ShieldCheck className="h-4 w-4 shrink-0 text-[#296A4B]" />Use this as a starting point. Review the scope before you agree on a final amount.</p><p className="mt-5 text-xs font-bold text-slate-700">Payment preference</p><div className="mt-2 grid grid-cols-3 gap-2"><PaymentMethod icon={CreditCard} label="Card" active={method === 'card'} onClick={() => onMethod('card')} /><PaymentMethod icon={Building2} label="Transfer" active={method === 'transfer'} onClick={() => onMethod('transfer')} /><PaymentMethod icon={Smartphone} label="USSD" active={method === 'ussd'} onClick={() => onMethod('ussd')} /></div><button type="submit" disabled={pending} className="motion-press mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#001A41] px-5 text-sm font-bold text-white transition-colors hover:bg-[#000F2D] disabled:cursor-wait disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ABEEC8] focus-visible:ring-offset-2"><Lock className="h-4 w-4 text-[#ABEEC8]" />{pending ? 'Confirming booking...' : 'Confirm booking'}</button></aside>;
}

function Confirmation({ city, date, service, time }: { city: string; date: string; service: string; time: string }) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => titleRef.current?.focus(), []);
  return <section className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-[0_16px_32px_rgba(0,26,65,0.08)]"><span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#ABEEC8]/40 text-[#296A4B]"><CheckCircle2 className="h-8 w-8" /></span><h1 ref={titleRef} tabIndex={-1} className="mt-5 font-display text-2xl font-extrabold text-[#001A41] focus:outline-none">Your booking is confirmed</h1><p className="mt-3 text-sm leading-6 text-slate-600">Your booking for <strong>{service}</strong> is scheduled for <strong>{date}</strong> during {time.toLowerCase()} in {city}.</p><Link href="/services" className="motion-press mt-7 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#001A41] px-5 text-sm font-bold text-white">Return to services</Link></section>;
}

export default function BookingScreen() {
  const params = useSearchParams();
  const requestedCity = params.get('city');
  const initialCity = NIGERIAN_LOCATIONS.some((location) => location.name === requestedCity) ? requestedCity! : 'Lagos';
  const [date, setDate] = useState('Tomorrow');
  const [time, setTime] = useState<string>(TIME_OPTIONS[0]);
  const [method, setMethod] = useState('card');
  const [draft, setDraft] = useState<BookingDraft>({ address: '', city: initialCity, landmark: '', notes: params.get('note') || '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const service = params.get('service') || 'Service booking';
  const price = params.get('price') || '₦10,000';
  const worker = params.get('worker');

  const update = (field: keyof BookingDraft, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
    if (status === 'error') setStatus('idle');
  };

  const finishSubmission = () => {
    const mockError = params.get('mockError') === '1';
    window.setTimeout(() => setStatus(getPrototypeSubmissionOutcome({ mockError, online: navigator.onLine })), 500);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateBookingDraft(draft);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      requestAnimationFrame(() => document.getElementById(`booking-${Object.keys(nextErrors)[0]}`)?.focus());
      return;
    }
    setStatus('pending');
    finishSubmission();
  };

  return <main className="min-h-screen bg-[#F8F9FF] text-[#0B1C30]"><BookingHeader /><div className="mx-auto max-w-[1180px] px-4 py-8 sm:px-6 sm:py-12 lg:px-8">{status === 'success' ? <Confirmation service={service} city={draft.city} date={date} time={time} /> : <form onSubmit={submit} className="space-y-6" noValidate><DetailCard service={service} price={price} worker={worker} />{status === 'error' && <div className="flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm leading-5 text-red-900" role="alert"><WifiOff className="h-5 w-5 shrink-0" />We could not confirm your booking. Check your connection, then try again.</div>}<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]"><div className="space-y-6"><ScheduleCard date={date} time={time} notes={draft.notes} errors={errors} onDate={setDate} onTime={setTime} onNotes={(value) => update('notes', value)} /><AddressCard draft={draft} errors={errors} onChange={update} /></div><div className="space-y-3"><PaymentCard price={price} method={method} pending={status === 'pending'} onMethod={setMethod} />{status === 'error' && <button type="button" onClick={finishSubmission} className="min-h-11 w-full rounded-xl border border-[#001A41] px-4 text-sm font-bold text-[#001A41] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ABEEC8]">Try again</button>}</div></div></form>}</div></main>;
}
