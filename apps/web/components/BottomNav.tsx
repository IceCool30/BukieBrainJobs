'use client';

import React from 'react';
import { Search, Briefcase, ShieldCheck, Menu } from 'lucide-react';

interface BottomNavProps {
  activeTab?: 'explore' | 'jobs' | 'verify' | 'menu';
  onExploreClick: () => void;
  onJobsClick: () => void;
  onVerifyClick: () => void;
  onMenuClick: () => void;
}

export default function BottomNav({
  activeTab = 'explore',
  onExploreClick,
  onJobsClick,
  onVerifyClick,
  onMenuClick,
}: BottomNavProps) {
  return (
    <nav
      aria-label="Mobile Navigation Bar"
      className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,26,65,0.06)] md:hidden transition-transform duration-200"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 8px), 8px)' }}
    >
      <div className="flex items-center justify-around h-14 max-w-md mx-auto px-2">
        {/* Tab 1: Explore */}
        <button
          type="button"
          onClick={onExploreClick}
          className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-colors ${
            activeTab === 'explore'
              ? 'text-[#296A4B] font-semibold'
              : 'text-slate-500 hover:text-slate-900 font-medium'
          }`}
        >
          <Search className={`w-5 h-5 mb-0.5 ${activeTab === 'explore' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
          <span className="text-[11px] tracking-tight">Explore</span>
        </button>

        {/* Tab 2: Post / My Jobs */}
        <button
          type="button"
          onClick={onJobsClick}
          className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-colors ${
            activeTab === 'jobs'
              ? 'text-[#296A4B] font-semibold'
              : 'text-slate-500 hover:text-slate-900 font-medium'
          }`}
        >
          <Briefcase className={`w-5 h-5 mb-0.5 ${activeTab === 'jobs' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
          <span className="text-[11px] tracking-tight">Post a Job</span>
        </button>

        {/* Tab 3: BukiePassport Verification */}
        <button
          type="button"
          onClick={onVerifyClick}
          className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-colors ${
            activeTab === 'verify'
              ? 'text-[#296A4B] font-semibold'
              : 'text-slate-500 hover:text-slate-900 font-medium'
          }`}
        >
          <ShieldCheck className={`w-5 h-5 mb-0.5 ${activeTab === 'verify' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
          <span className="text-[11px] tracking-tight">Passport</span>
        </button>

        {/* Tab 4: Menu Drawer */}
        <button
          type="button"
          onClick={onMenuClick}
          className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-colors ${
            activeTab === 'menu'
              ? 'text-[#296A4B] font-semibold'
              : 'text-slate-500 hover:text-slate-900 font-medium'
          }`}
        >
          <Menu className={`w-5 h-5 mb-0.5 ${activeTab === 'menu' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
          <span className="text-[11px] tracking-tight">Menu</span>
        </button>
      </div>
    </nav>
  );
}
