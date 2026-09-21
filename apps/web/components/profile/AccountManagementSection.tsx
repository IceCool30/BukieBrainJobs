'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Download,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
} from 'lucide-react';

interface AccountManagementSectionProps {
  customerId: string;
  isOffline: boolean;
  onExportData: () => Promise<void>;
  onDeleteAccount: (reason?: string) => Promise<void>;
}

export function AccountManagementSection({
  customerId,
  isOffline,
  onExportData,
  onDeleteAccount,
}: AccountManagementSectionProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [deleteReason, setDeleteReason] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const deleteButtonTriggerRef = useRef<HTMLButtonElement>(null);
  const deleteInputRef = useRef<HTMLInputElement>(null);

  const openDeleteModal = () => {
    setDeleteConfirmationText('');
    setDeleteReason('');
    setDeleteError(null);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    if (deleteButtonTriggerRef.current) {
      deleteButtonTriggerRef.current.focus();
    }
  };

  useEffect(() => {
    if (deleteModalOpen && deleteInputRef.current) {
      deleteInputRef.current.focus();
    }
  }, [deleteModalOpen]);

  const handleExport = async () => {
    if (isOffline) return;
    try {
      setIsExporting(true);
      await onExportData();
      setExportSuccess('Account data export generated successfully.');
      setTimeout(() => setExportSuccess(null), 4000);
    } catch {
      // Handled
    } finally {
      setIsExporting(false);
    }
  };

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (deleteConfirmationText.trim().toUpperCase() !== 'DELETE') {
      setDeleteError('Please type DELETE to confirm account deactivation.');
      return;
    }

    try {
      setIsDeleting(true);
      await onDeleteAccount(deleteReason);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete account.';
      setDeleteError(msg);
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Export Account Data Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="pb-4 border-b border-slate-100">
          <h2 className="text-xl font-bold font-display text-[#001A41]">
            Account Data & Privacy
          </h2>
          <p className="text-xs text-slate-500">
            Request an export of your personal information, saved service addresses, and preferences.
          </p>
        </div>

        {exportSuccess && (
          <div
            role="status"
            className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{exportSuccess}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div>
            <p className="text-xs font-bold text-slate-900">Export Customer Archive</p>
            <p className="text-[11px] text-slate-500">
              Download a machine-readable JSON copy of your marketplace customer record.
            </p>
          </div>

          <button
            type="button"
            disabled={isExporting || isOffline}
            onClick={handleExport}
            className="min-h-[48px] px-4 py-2 bg-[#001A41] text-white text-xs font-semibold rounded-xl hover:bg-[#002661] transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shrink-0"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Generating Export...</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span>Export My Data</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Danger Zone: Account Deletion Card */}
      <div className="bg-white rounded-2xl p-6 border border-red-200 shadow-xs space-y-4">
        <div className="pb-4 border-b border-red-100">
          <h3 className="text-sm font-bold font-display text-red-700 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span>Danger Zone: Account Deletion</span>
          </h3>
          <p className="text-xs text-slate-500">
            Permanently close your BukieBrainJobs customer account.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-xs text-slate-600 max-w-md">
            Closing your account removes saved addresses and credentials. If you have active in-progress bookings, they must be resolved or cancelled first.
          </p>

          <button
            ref={deleteButtonTriggerRef}
            type="button"
            disabled={isOffline}
            onClick={openDeleteModal}
            className="min-h-[48px] px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shrink-0"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete Account</span>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-account-title"
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 relative space-y-4"
          >
            <button
              type="button"
              onClick={closeDeleteModal}
              aria-label="Close dialog"
              className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <h3 id="delete-account-title" className="text-lg font-bold font-display text-slate-900">
              Confirm Account Deletion
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed">
              This action cannot be undone. All saved service locations, contact details, and account credentials will be permanently removed.
            </p>

            {deleteError && (
              <div
                role="alert"
                className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            <form onSubmit={handleDelete} className="space-y-4">
              <div>
                <label htmlFor="delete-reason" className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason for leaving (optional)
                </label>
                <input
                  id="delete-reason"
                  type="text"
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder="e.g. Relocating, no longer need services"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-red-500 focus:bg-white transition"
                />
              </div>

              <div>
                <label htmlFor="delete-confirm" className="block text-xs font-semibold text-slate-700 mb-1">
                  Type <span className="text-red-600 font-bold">DELETE</span> to confirm
                </label>
                <input
                  ref={deleteInputRef}
                  id="delete-confirm"
                  type="text"
                  value={deleteConfirmationText}
                  onChange={(e) => setDeleteConfirmationText(e.target.value)}
                  placeholder="DELETE"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-red-500 focus:bg-white transition"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  className="min-h-[48px] flex-1 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDeleting || deleteConfirmationText.trim().toUpperCase() !== 'DELETE'}
                  className="min-h-[48px] flex-1 py-2 bg-red-600 text-white text-xs font-semibold rounded-xl hover:bg-red-700 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <span>Permanently Delete</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
