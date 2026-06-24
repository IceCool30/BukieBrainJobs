'use client';

import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function PushNotificationManager() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        setPermission(Notification.permission);
        
        // If we haven't asked yet, show the prompt after a short delay
        if (Notification.permission === 'default') {
          const timer = setTimeout(() => setShowPrompt(true), 5000);
          return () => clearTimeout(timer);
        }
      } catch (err) {
        console.error('Notification API not allowed in this context:', err);
      }
    }
  }, []);

  const handleRequestPermission = async () => {
    if (!('Notification' in window)) return;
    
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      setShowPrompt(false);
      
      if (result === 'granted') {
        // Here we could subscribe to the push manager if VAPID keys were provided
        if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
          try {
            const registration = await navigator.serviceWorker.ready;
            console.log('Service worker is ready for push notifications', registration);
          } catch (swErr) {
            console.warn('Service worker not ready:', swErr);
          }
        }
        
        // Show a local success notification
        try {
          if ('Notification' in window) {
            new Notification('Alerts Enabled!', {
              body: 'You will now receive job alerts and updates.',
              icon: '/icon-192x192.png'
            });
          }
        } catch (notifyErr) {
          console.warn('Local Notification display not allowed or failed:', notifyErr);
        }
      }
    } catch (err) {
      console.error('Error requesting notification permission:', err);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  return (
    <AnimatePresence>
      {showPrompt && permission === 'default' && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 bg-white rounded-2xl shadow-xl border border-blue-100 p-4 z-[60] flex flex-col gap-3"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-[#0A192F] font-bold text-sm">Enable Web Push Alerts</h3>
              <p className="text-gray-500 text-xs mt-1 leading-relaxed">
                Get real-time notifications when local employers post jobs or workers bid on your request.
              </p>
            </div>
          </div>
          
          <div className="flex gap-2 w-full mt-2">
            <button
              onClick={handleDismiss}
              className="flex-1 py-2 px-3 rounded-xl font-semibold text-gray-500 bg-gray-50 hover:bg-gray-100 transition-colors text-xs"
            >
              Skip
            </button>
            <button
              onClick={handleRequestPermission}
              className="flex-1 py-2 px-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all active:scale-95 text-xs flex justify-center items-center"
            >
              Enable Alerts
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
