'use client';

import React, { useState } from 'react';
import { MessageSquarePlus, X, Send } from 'lucide-react';
import { SmoothCollapse } from './SmoothCollapse';
import { motion, AnimatePresence } from 'framer-motion';

export function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<'bug' | 'feature'>('bug');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setStatus('submitting');
    
    // Simulate an API call
    setTimeout(() => {
      setStatus('success');
      setMessage('');
      setTimeout(() => {
        setIsOpen(false);
        setStatus('idle');
      }, 2000);
    }, 800);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={isOpen ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1, y: -4, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-[#0A192F] text-white p-3.5 rounded-full shadow-lg hover:bg-[#112a4f] hover:shadow-xl transition-all z-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0A192F] cursor-pointer"
        aria-label="Give feedback"
      >
        <MessageSquarePlus className="w-6 h-6" />
      </motion.button>

      {/* Feedback Form Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 50, rotate: 1 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30, rotate: -1 }}
            transition={{ type: "spring", stiffness: 350, damping: 20 }}
            className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-80 bg-white sm:rounded-2xl shadow-2xl border border-gray-100 z-50 flex flex-col origin-bottom-right"
          >
            <div className="bg-[#0A192F] text-white p-4 sm:rounded-t-2xl flex justify-between items-center">
              <h3 className="font-bold tracking-tight text-sm">Send Feedback</h3>
              <motion.button 
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(false)}
                className="text-gray-300 hover:text-white transition-colors p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
              <SmoothCollapse isOpen={status === 'success'}>
                <div className="bg-blue-50 text-blue-800 p-3 rounded-xl text-sm font-medium border border-blue-100 text-center">
                  Thanks for helping us improve!
                </div>
              </SmoothCollapse>

              <div className={`space-y-4 ${status === 'success' ? 'hidden' : 'block'}`}>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setType('bug')}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-colors border cursor-pointer ${type === 'bug' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
                  >
                    Report Bug
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setType('feature')}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-colors border cursor-pointer ${type === 'feature' ? 'bg-[#0A192F]/10 text-[#0A192F] border-[#0A192F]/20' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
                  >
                    Suggest Feature
                  </motion.button>
                </div>

                <textarea
                  required
                  rows={4}
                  placeholder={type === 'bug' ? "What went wrong?" : "What would you like to see?"}
                  className="w-full text-sm p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0A192F] focus:border-transparent resize-none bg-gray-50 text-[#0A192F]"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />

                <motion.button
                  whileHover={message.trim() ? { scale: 1.02 } : {}}
                  whileTap={message.trim() ? { scale: 0.98 } : {}}
                  type="submit"
                  disabled={status === 'submitting' || !message.trim()}
                  className="w-full bg-[#0A192F] text-white py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#112a4f] transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  {status === 'submitting' ? 'Sending...' : 'Send Feedback'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Overlay for mobile to close when clicking outside */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40 sm:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
