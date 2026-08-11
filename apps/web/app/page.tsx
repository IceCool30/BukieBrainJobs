'use client';

import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9ff]">
      <Navbar />

      <main className="flex-grow flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h1 className="font-display font-bold text-2xl text-[#0b1c30] mb-3">
            Homepage UI Awaiting Design
          </h1>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            The previous BukieBrainJobs homepage design has been rejected. The active development branch has been reset to a clean slate, ready for a completely new WEB-001 design prompt.
          </p>
          <div className="inline-block text-[11px] font-mono bg-slate-100 text-slate-600 px-3 py-1.5 rounded-md uppercase tracking-wider font-semibold">
            Status: Clean Slate Shell
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
