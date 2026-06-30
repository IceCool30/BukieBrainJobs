'use client';
import { useState, useEffect } from 'react';
import React from 'react';
import { X, ChevronDown, ArrowRight, Flame, Users, Briefcase, ShieldCheck, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent scroll when sidebar is open
  useEffect(() => {
    if (!mounted) return;
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, mounted]);

  const handleNavigation = (path: string) => {
    onClose();
    router.push(path);
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  if (!mounted) {
    return null;
  }

  const menuSections = [
    {
      id: 'explore',
      title: 'Explore',
      icon: <Users className="w-5 h-5 text-brand-green" />,
      links: [
        { label: 'Browse Jobs Near Me', path: '/dashboard/jobs' },
        { label: 'Verified Artisans', path: '/about' },
        { label: 'How BukieBrain Works', path: '/about' },
      ],
    },
    {
      id: 'hire',
      title: 'Hire Talent',
      icon: <Briefcase className="w-5 h-5 text-[#0A192F]" />,
      links: [
        { label: 'Post a New Job', path: '/dashboard/post-job' },
        { label: 'My Posted Projects', path: '/dashboard/jobs' },
        { label: 'Safe Protected Payments', path: '/about' },
      ],
    },
    {
      id: 'hired',
      title: 'Get Hired',
      icon: <Flame className="w-5 h-5 text-amber-500" />,
      links: [
        { label: 'Find Gig Opportunities', path: '/dashboard/jobs' },
        { label: 'Setup BukiePassport', path: '/dashboard/passport-setup' },
        { label: 'Withdraw Earnings', path: '/dashboard/wallet' },
      ],
    },
    {
      id: 'community',
      title: 'Community',
      icon: <ShieldCheck className="w-5 h-5 text-blue-600" />,
      links: [
        { label: 'Help Center & Support', path: '/legal/terms' },
        { label: 'Trust & Safety Guidelines', path: '/legal/privacy' },
        { label: 'BukieBrain About Us', path: '/about' },
      ],
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 z-50 lg:hidden flex flex-col justify-start cursor-pointer"
        >
          {/* Backdrop with spring fade - covers full screen absolute behind panel */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#0A192F]/40 backdrop-blur-md cursor-pointer"
          />

          {/* Drawer Dropdown Panel (floating from top, rounded at the bottom, stops propagation) */}
          <motion.div
            initial={{ y: '-100%', opacity: 0.8 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '-100%', opacity: 0.8 }}
            transition={{ type: 'spring', damping: 26, stiffness: 210, mass: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full bg-white shadow-2xl z-10 flex flex-col border-b border-gray-100 rounded-b-[2rem] overflow-hidden max-h-[88vh] cursor-default"
          >
            {/* Header with clear branding to perfectly match user request */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100/60 bg-gray-50/40">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#0A192F] flex items-center justify-center text-white text-xs font-black">
                    B
                  </div>
                  <span className="font-display font-extrabold text-[15px] text-[#0A192F] tracking-tight">
                    BukieBrain Hub
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-brand-green bg-brand-green/10 px-2.5 py-1 rounded-full">
                  Menu
                </span>
              </div>
            </div>

            {/* Interactive Spring Navigation Stack */}
            <nav className="px-5 py-4 overflow-y-auto space-y-2 max-h-[50vh] scrollbar-none">
              {menuSections.map((section, idx) => {
                const isExpanded = expandedSection === section.id;
                return (
                  <motion.div 
                    key={section.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 320, damping: 24, delay: idx * 0.04 }}
                    className="border border-gray-100 rounded-2xl overflow-hidden bg-white hover:border-gray-200/80 transition-all duration-300"
                  >
                    {/* Trigger Button */}
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full flex items-center justify-between p-3.5 text-left font-display font-bold text-base text-[#0A192F] hover:bg-gray-50/60 transition-colors cursor-pointer outline-none group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-lg bg-gray-100/50 group-hover:bg-white group-hover:shadow-sm transition-all">
                          {section.icon}
                        </div>
                        <span className="group-hover:translate-x-0.5 transition-transform">{section.title}</span>
                      </div>
                      <motion.span
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 14 }}
                        className="text-gray-400 group-hover:text-[#0A192F]"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </motion.span>
                    </button>

                    {/* Accordion Expansion containing Links */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ type: "spring", stiffness: 280, damping: 25 }}
                          className="overflow-hidden bg-gray-50/50 border-t border-gray-100/50"
                        >
                          <div className="p-2 space-y-1">
                            {section.links.map((link, linkIdx) => (
                              <motion.button
                                key={linkIdx}
                                whileHover={{ x: 6, scale: 1.01, backgroundColor: "rgba(255,255,255,0.9)" }}
                                whileTap={{ scale: 0.99 }}
                                onClick={() => handleNavigation(link.path)}
                                className="w-full text-left text-[14px] font-semibold text-brand-navy/80 hover:text-brand-green py-2.5 px-4 rounded-xl transition-all flex items-center justify-between cursor-pointer group/item border border-transparent hover:border-gray-200/40 hover:shadow-sm"
                              >
                                <span className="relative flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-brand-green/40 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                                  {link.label}
                                </span>
                                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover/item:opacity-100 -translate-x-2 group-hover/item:translate-x-0 transition-all text-brand-green" />
                              </motion.button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </nav>

            {/* Premium CTA Block inspired by "Start Project Brief" */}
            <div className="p-5 border-t border-gray-100 bg-gray-50/60 flex flex-col gap-3 rounded-b-[2rem]">
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
                whileHover={{ scale: 1.02, y: -1, boxShadow: "0 8px 20px rgba(0, 135, 90, 0.15)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleNavigation('/dashboard/post-job')}
                className="w-full bg-brand-green hover:bg-brand-green/95 text-white py-3.5 px-5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_16px_rgba(0, 135, 90, 0.12)] border border-brand-green transition-colors"
              >
                <Flame className="w-4 h-4 text-white animate-pulse" />
                <span>Post a Job Brief</span>
                <motion.div
                  animate={{ x: [0, 4, 0] }}
                  transition={{ repeat: Infinity, duration: 1.2 }}
                >
                  <ArrowRight className="w-4 h-4" />
                </motion.div>
              </motion.button>

              <div className="grid grid-cols-2 gap-2 mt-1">
                <motion.button
                  whileHover={{ scale: 1.02, backgroundColor: "#0A192F", color: "#fff" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    onClose();
                    window.location.href = '/api/auth/workos-login';
                  }}
                  className="py-2.5 px-3 rounded-xl border border-gray-200 text-xs font-bold text-brand-navy bg-white hover:border-[#0A192F] transition-all cursor-pointer text-center"
                >
                  My Account
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02, backgroundColor: "#0A192F", color: "#fff" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleNavigation('/about')}
                  className="py-2.5 px-3 rounded-xl border border-gray-200 text-xs font-bold text-brand-navy bg-white hover:border-[#0A192F] transition-all cursor-pointer text-center"
                >
                  About Trust
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

