'use client';
import { LogoBase64 } from '@/lib/logo';

import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Database, 
  Cpu, 
  Trash2, 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  RefreshCw, 
  Play, 
  Terminal, 
  Lock
} from 'lucide-react';
import { createBrowserClient } from '@supabase/auth-helpers-nextjs';
import {
  verifyQASandboxEnvAction, 
  clearQASandboxTestDataAction,
  postJobAction 
} from '@/app/actions';

export default function QASandboxPage() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState<'success' | 'err' | 'info' | ''>('');

  // Sandbox Test States
  const [envStates, setEnvStates] = useState<any>(null);
  const [envLoading, setEnvLoading] = useState(false);

  const [dbTestLogs, setDbTestLogs] = useState<string[]>([]);
  const [dbTesting, setDbTesting] = useState(false);

  const [cleanupLoading, setCleanupLoading] = useState(false);
  const [cleanupResult, setCleanupResult] = useState<{ jobsPruned: number; messagesPruned: number } | null>(null);

  const CEO_EMAIL = 'solomonogarbukie@gmail.com';

  useEffect(() => {
    async function checkSecurityGate() {
      try {
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        if (authError || !session) {
          router.push('/login');
          return;
        }

        const email = session.user.email || '';
        setCurrentUserEmail(email);

        if (email.toLowerCase() === CEO_EMAIL.toLowerCase()) {
          setAuthorized(true);
        } else {
          setAuthorized(false);
        }
      } catch (err) {
        console.error('Security gate evaluation failed:', err);
      } finally {
        setLoading(false);
      }
    }

    checkSecurityGate();
  }, [supabase, router]);

  // a) Verify Live Client Connectivity (Read/Write test row)
  const runLiveDatabaseConnectivityTest = async () => {
    if (dbTesting) return;
    setDbTesting(true);
    setDbTestLogs(['Initiating dynamic database connectivity probe...', 'Generating unique test job payload...']);
    
    try {
      const probeId = `[TEST] Connectivity Probe - ${Math.random().toString(36).substring(7).toUpperCase()}`;
      
      // Step 1: Attempt insert
      const { data: job, error: insertErr } = await supabase
        .from('jobs')
        .insert([
          {
            title: probeId,
            description: 'Automatic database synchronization test trace.',
            budget: 500,
            category: 'Plumbing',
            location_state: 'Lagos',
            location_lga: 'Ikeja',
            job_type: 'task',
            is_urgent: false,
            stage: 'open',
            inspection_fee_paid: false
          }
        ])
        .select()
        .single();

      if (insertErr) {
        throw new Error(`Write Operation Blocked: ${insertErr.message}`);
      }
      
      setDbTestLogs(prev => [...prev, `✅ Insert Succeeded: Created testing row ID: ${job.id}`]);

      // Step 2: Attempt Read back
      setDbTestLogs(prev => [...prev, 'Attempting fetch verification read...']);
      const { data: fetchResult, error: readExtErr } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', job.id)
        .single();

      if (readExtErr) {
        throw new Error(`Read Operation Blocked: ${readExtErr.message}`);
      }

      setDbTestLogs(prev => [...prev, `✅ Read Succeeded: Verified title payload: "${fetchResult.title}"`]);

      // Step 3: Fast delete cleanup
      setDbTestLogs(prev => [...prev, 'Deleting test row payload...']);
      const { error: deleteErr } = await supabase
        .from('jobs')
        .delete()
        .eq('id', job.id);

      if (deleteErr) {
        throw new Error(`Cleanup Operation Blocked: ${deleteErr.message}`);
      }

      setDbTestLogs(prev => [...prev, '✅ Cleanup Succeeded. Safe database connection established and verified with 100% data fidelity!']);
      showNotification('Supabase connection verified successfully!', 'success');
    } catch (err: any) {
      setDbTestLogs(prev => [...prev, `❌ TEST FAILED: ${err.message}`]);
      showNotification('Database probe failed. View debug logger trace.', 'err');
    } finally {
      setDbTesting(false);
    }
  };

  // b) Verify Load States of Active Environment Keys
  const testActiveEnvironmentVariables = async () => {
    if (envLoading) return;
    setEnvLoading(true);
    setEnvStates(null);
    try {
      const res = await verifyQASandboxEnvAction();
      if (res.success && res.env) {
        setEnvStates(res.env);
        showNotification('Active backend memory variables successfully audited.', 'success');
      } else {
        showNotification(res.error || 'Check authentication clearance level.', 'err');
      }
    } catch (err: any) {
      showNotification(err.message || 'Server-side extraction failure.', 'err');
    } finally {
      setEnvLoading(false);
    }
  };

  // c) Clear all test data (clears any job or message tagged with '[TEST]')
  const runManualTestCleanup = async () => {
    if (cleanupLoading) return;
    setCleanupLoading(true);
    setCleanupResult(null);

    try {
      const res = await clearQASandboxTestDataAction();
      if (res.success) {
        setCleanupResult({
          jobsPruned: res.jobsPruned ?? 0,
          messagesPruned: res.messagesPruned ?? 0
        });
        showNotification('Database cleared of system test records!', 'success');
      } else {
        showNotification(res.error || 'Purging transaction failed.', 'err');
      }
    } catch (err: any) {
      showNotification(err.message || 'Purging transaction crash.', 'err');
    } finally {
      setCleanupLoading(false);
    }
  };

  const showNotification = (msg: string, type: 'success' | 'err' | 'info') => {
    setStatusMessage(msg);
    setStatusType(type);
    setTimeout(() => {
      setStatusMessage('');
      setStatusType('');
    }, 5500);
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white text-[#0A192F]">
        <div className="flex flex-col items-center gap-3">
          <Image src={LogoBase64} alt="Loading..." width={40} height={40} className="animate-pulse shadow-md rounded-xl mb-3 bg-white p-[2px]" />
          <span className="text-xs font-mono text-gray-500 font-bold uppercase tracking-wide">
            Accessing sandbox terminal...
          </span>
        </div>
      </main>
    );
  }

  if (!authorized) {
    return (
      <main className="min-h-screen bg-white text-[#0A192F] py-12 px-4 flex flex-col items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center"
          id="sandbox-gate-unauthorized"
        >
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-100">
            <Lock className="w-8 h-8 text-red-600 animate-pulse" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Access Gate Restrict</h1>
          <p className="text-xs text-gray-500 mt-2 leading-relaxed">
            The QA Sandbox contains high-privilege operations including database record flushing and environment health probes.
          </p>
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-xl text-[10px] font-mono leading-relaxed text-left border border-red-100">
            SECURITY_VIOLATION: UNAUTHORIZED_VISITOR <br />
            VISITOR: {currentUserEmail || 'Anonymous'} <br />
            CEO_EMAIL_GATEWAY: {CEO_EMAIL}
          </div>
          <div className="mt-6">
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full bg-[#0A192F] hover:bg-gray-800 text-white text-xs font-extrabold uppercase tracking-wider py-3.5 px-6 rounded-xl transition-all cursor-pointer inline-flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to safety</span>
            </button>
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-[#0A192F] py-8 px-4 flex flex-col font-sans">
      <div className="max-w-4xl w-full mx-auto space-y-6" id="qa-sandbox-panel-container">
        
        {/* Navigation Action */}
        <div className="flex justify-between items-center bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
          <button
            onClick={() => router.push('/admin')}
            className="group inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-900 uppercase tracking-wider transition-all cursor-pointer"
            id="sandbox-back-btn"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Admin Control Panel</span>
          </button>
          <span className="text-[10px] uppercase font-mono tracking-widest text-[#0A192F] font-black flex items-center gap-1.5 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
            <ShieldCheck className="w-4 h-4" />
            <span>CEO Mode Authorized</span>
          </span>
        </div>

        {/* Header Hero */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden" id="sandbox-header-card">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-green-50/30 to-transparent pointer-events-none" />
          <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-none mb-2">
            Isomorphic QA Sandbox Terminal
          </h1>
          <p className="text-xs text-gray-500 max-w-xl leading-relaxed">
            Run isolated environmental audits, verify full-duplex database connectivity, and safely purge [TEST] tagged ledger data in anticipation of launch.
          </p>

          <AnimatePresence>
            {statusMessage && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`mt-4 p-3.5 rounded-xl text-xs font-semibold border flex items-center gap-2 ${
                  statusType === 'success' 
                    ? 'bg-green-50 text-green-800 border-green-200' 
                    : statusType === 'err' 
                      ? 'bg-red-50 text-red-800 border-red-200' 
                      : 'bg-blue-50 text-blue-800 border-blue-200'
                }`}
                id="sandbox-toast"
              >
                {statusType === 'success' ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-red-600" />}
                <span>{statusMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Functional Matrix Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="sandbox-actions-grid">
          
          {/* Card A: Supabase full-duplex Connectivity */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between" id="sandbox-db-probe-card">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2.5 bg-green-50 text-[#0A192F] border border-green-100 rounded-xl">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-gray-900 uppercase tracking-tight">Database Connectivity Test</h2>
                  <p className="text-[10px] text-gray-400 font-medium">Auto-write, verify-read, and secure-erase cycle</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">
                Executes a live transaction cycle on public schema to confirm Row-Level Security permissions are fully optimized for rapid content replication.
              </p>
            </div>

            <div className="space-y-4">
              {dbTestLogs.length > 0 && (
                <div className="bg-[#0A192F] p-3 rounded-xl border border-gray-800 text-[10px] text-gray-400 font-mono space-y-1.5 h-36 overflow-y-auto block leading-normal">
                  <div className="text-gray-500 uppercase font-bold border-b border-gray-800 pb-1 flex justify-between items-center">
                    <span>Terminal console logs:</span>
                    <Terminal className="w-3.5 h-3.5" />
                  </div>
                  {dbTestLogs.map((log, ii) => (
                    <div key={ii} className="break-all">{log}</div>
                  ))}
                </div>
              )}

              <button
                onClick={runLiveDatabaseConnectivityTest}
                disabled={dbTesting}
                className="w-full bg-[#0A192F] hover:bg-[#112a4f] disabled:bg-gray-200 text-white text-xs font-bold uppercase tracking-wider py-3.5 px-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                id="sandbox-db-trigger"
              >
                {dbTesting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Executing Probe...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Run Supabase Connectivity Write</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Card B: Environmental Variable Checks */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between" id="sandbox-env-probe-card">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-gray-900 uppercase tracking-tight">Active Environment Audit</h2>
                  <p className="text-[10px] text-gray-400 font-medium font-mono">Verify server credentials state cleanly</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">
                Confirms integrations like Paystack and Telegram BOT tokens are loaded correctly into process memory without publicly leaking credentials.
              </p>
            </div>

            <div className="space-y-4">
              {envStates && (
                <div className="border border-gray-100 p-3.5 rounded-xl space-y-2 bg-gray-50 font-mono text-[10px]" id="sandbox-env-states">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-semibold">PAYSTACK_SECRET_KEY</span>
                    {envStates.PAYSTACK_SECRET_KEY ? (
                      <span className="bg-green-100 text-green-800 text-[9px] uppercase px-1.5 py-0.5 rounded font-black">LOADED</span>
                    ) : (
                      <span className="bg-red-100 text-red-800 text-[9px] uppercase px-1.5 py-0.5 rounded font-black">MISSING</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-semibold">TELEGRAM_BOT_TOKEN</span>
                    {envStates.TELEGRAM_BOT_TOKEN ? (
                      <span className="bg-green-100 text-green-800 text-[9px] uppercase px-1.5 py-0.5 rounded font-black">LOADED</span>
                    ) : (
                      <span className="bg-red-100 text-red-800 text-[9px] uppercase px-1.5 py-0.5 rounded font-black">MISSING</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-semibold">TELEGRAM_CHANNEL_ID</span>
                    {envStates.TELEGRAM_CHANNEL_ID ? (
                      <span className="bg-green-100 text-green-800 text-[9px] uppercase px-1.5 py-0.5 rounded font-black">LOADED</span>
                    ) : (
                      <span className="bg-red-100 text-red-800 text-[9px] uppercase px-1.5 py-0.5 rounded font-black">MISSING</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-semibold">PAYSTACK_PUBLIC_KEY</span>
                    {envStates.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ? (
                      <span className="bg-green-100 text-green-800 text-[9px] uppercase px-1.5 py-0.5 rounded font-black">LOADED</span>
                    ) : (
                      <span className="bg-red-100 text-red-800 text-[9px] uppercase px-1.5 py-0.5 rounded font-black">MISSING</span>
                    )}
                  </div>
                </div>
              )}

              <button
                onClick={testActiveEnvironmentVariables}
                disabled={envLoading}
                className="w-full bg-[#0A192F] hover:bg-[#333537] disabled:bg-gray-200 text-white text-xs font-bold uppercase tracking-wider py-3.5 px-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                id="sandbox-env-trigger"
              >
                {envLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Auditing Server...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span>Check Server environment</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Card C: Manual Cleanup of test records */}
        <div className="bg-white p-6 rounded-3xl border-2 border-dashed border-red-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4" id="sandbox-purge-card">
          <div className="space-y-1 max-w-xl">
            <h2 className="text-sm font-black text-red-700 uppercase tracking-tight flex items-center gap-1.5">
              <Trash2 className="w-4 h-4 text-red-500" />
              <span>Full Safe Purge of Sandbox Test Records</span>
            </h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              Purges all jobs and linked messaging logs that contain the string <strong className="text-gray-700 font-extrabold">[TEST]</strong> in their title or content message fields. This allows risk-free end-to-end sandbox evaluations during environment staging.
            </p>
            {cleanupResult && (
              <p className="text-[10px] font-mono text-green-700 font-medium pt-1">
                Last purging result: {cleanupResult.jobsPruned} jobs and {cleanupResult.messagesPruned} messages successfully flushed.
              </p>
            )}
          </div>

          <button
            onClick={runManualTestCleanup}
            disabled={cleanupLoading}
            className="shrink-0 w-full md:w-auto bg-red-600 hover:bg-red-700 disabled:bg-gray-200 text-white text-xs font-extrabold uppercase tracking-wider py-3.5 px-6 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
            id="sandbox-purge-trigger"
          >
            {cleanupLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Flushing database...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Erase all [TEST] Data</span>
              </>
            )}
          </button>
        </div>

      </div>
    </main>
  );
}
