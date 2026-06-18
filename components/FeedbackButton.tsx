'use client';

import React, { useState } from 'react';
import { MessageSquarePlus, X, Send } from 'lucide-react';
import { SmoothCollapse } from './SmoothCollapse';

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
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 bg-[#004D2C] text-white p-3.5 rounded-full shadow-lg hover:bg-[#003820] hover:shadow-xl hover:-translate-y-1 transition-all z-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#004D2C] ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
        aria-label="Give feedback"
      >
        <MessageSquarePlus className="w-6 h-6" />
      </button>

      {/* Feedback Form Modal */}
      <div 
        className={`fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-80 bg-white sm:rounded-2xl shadow-2xl border border-gray-100 z-50 flex flex-col transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}
      >
        <div className="bg-[#0A192F] text-white p-4 sm:rounded-t-2xl flex justify-between items-center">
          <h3 className="font-bold tracking-tight text-sm">Send Feedback</h3>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-gray-300 hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
          <SmoothCollapse isOpen={status === 'success'}>
            <div className="bg-green-50 text-[#004D2C] p-3 rounded-xl text-sm font-medium border border-green-100 text-center">
              Thanks for helping us improve!
            </div>
          </SmoothCollapse>

          <div className={`space-y-4 ${status === 'success' ? 'hidden' : 'block'}`}>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setType('bug')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-colors border ${type === 'bug' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
              >
                Report Bug
              </button>
              <button
                type="button"
                onClick={() => setType('feature')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-colors border ${type === 'feature' ? 'bg-[#0A192F]/10 text-[#0A192F] border-[#0A192F]/20' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
              >
                Suggest Feature
              </button>
            </div>

            <textarea
              required
              rows={4}
              placeholder={type === 'bug' ? "What went wrong?" : "What would you like to see?"}
              className="w-full text-sm p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0A192F] focus:border-transparent resize-none bg-gray-50 text-[#0A192F]"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />

            <button
              type="submit"
              disabled={status === 'submitting' || !message.trim()}
              className="w-full bg-[#0A192F] text-white py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#112a4f] transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {status === 'submitting' ? 'Sending...' : 'Send Feedback'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Overlay for mobile to close when clicking outside */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 sm:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
