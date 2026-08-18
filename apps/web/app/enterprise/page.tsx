import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  FileCheck,
  Layers,
  ShieldCheck,
  Building2,
  Clock,
  Users,
  Mail,
} from 'lucide-react';

const FEATURES = [
  {
    icon: <FileCheck className="w-5 h-5 text-slate-600" />,
    title: 'Centralized Billing and VAT-Compliant Invoicing',
    desc: 'One consolidated monthly invoice across every completed job, formatted for your accounting and tax team.',
  },
  {
    icon: <Layers className="w-5 h-5 text-slate-600" />,
    title: 'Dedicated Account Management',
    desc: 'A named account manager who knows your properties, your history, and your priorities before you pick up the phone.',
  },
  {
    icon: <ShieldCheck className="w-5 h-5 text-slate-600" />,
    title: 'Custom Service Level Agreements',
    desc: 'Define response times, priority tiers, and escalation rules per estate or facility. We build the SLA around how you operate.',
  },
  {
    icon: <Building2 className="w-5 h-5 text-slate-600" />,
    title: 'Seamless API Integration',
    desc: 'Connect job requests and completion data to your property management or ERP systems through a documented API.',
  },
  {
    icon: <Clock className="w-5 h-5 text-slate-600" />,
    title: 'Predictable Response Windows',
    desc: 'Agreed response windows on every request class, from emergency plumbing to routine preventive maintenance.',
  },
  {
    icon: <Users className="w-5 h-5 text-slate-600" />,
    title: 'One Verified Workforce',
    desc: 'Professionals on your account complete profile verification and identity checks. Terms for guarantee coverage are agreed per booking.',
  },
];

export default function EnterprisePage() {
  return (
    <main className="min-h-screen bg-[#F8F9FF]">
      {/* Header */}
      <div className="bg-[#001A41] text-white border-b border-[#1E3A60]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-14 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#001A41]/95 to-[#001A41]/60" />
          <div className="relative z-10 space-y-4 max-w-3xl">
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to home
            </Link>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#06152B] border border-[#1E3A60] text-xs font-semibold text-slate-300">
              <Building2 className="w-3.5 h-3.5" />
              For Enterprises
            </div>
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl tracking-tight">
              Enterprise Maintenance, Run Like One Business
            </h1>
            <p className="text-base text-slate-300 leading-relaxed">
              Estate managers, facility teams, and business owners centralize every maintenance
              operation on one platform. Tenants and employees raise requests, verified
              professionals complete them, and you keep full visibility of cost and completion.
            </p>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="bg-white rounded-xl border border-slate-200 shadow-[0_2px_8px_-4px_rgba(0,26,65,0.10)] p-7 space-y-3"
            >
              <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center">
                {f.icon}
              </div>
              <h2 className="font-display font-bold text-base text-[#0B1C30]">{f.title}</h2>
              <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="border-t border-slate-200 bg-white">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-14 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-xl">
            <h2 className="font-display font-bold text-xl text-[#0B1C30]">
              Talk to the corporate team
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Tell us about your portfolio and we will come back with a structure, SLA options,
              and pricing within two working days.
            </p>
          </div>
          <div className="space-y-3 shrink-0">
            <Link
              href="mailto:corporate@bukiebrainjobs.ng"
              className="w-full sm:w-auto px-6 py-3.5 bg-[#001A41] hover:bg-[#000F2D] text-white text-sm font-bold rounded-full transition-all flex items-center justify-center gap-2 shadow-md"
            >
              <Mail className="w-4 h-4" />
              corporate@bukiebrainjobs.ng
            </Link>
            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-3.5 bg-white border border-slate-300 text-[#0B1C30] text-sm font-bold rounded-full transition-all flex items-center justify-center gap-2 hover:border-slate-400"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to home
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 bg-white">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center">
          <Image
            src="/images/wordmark-banner-tight.png?v=3"
            alt="BukieBrainJobs"
            width={150}
            height={44}
            priority={false}
            className="opacity-70"
          />
        </div>
      </div>
    </main>
  );
}
