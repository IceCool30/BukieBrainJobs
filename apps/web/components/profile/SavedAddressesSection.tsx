'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  MapPin,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Star,
} from 'lucide-react';
import {
  SavedAddress,
  CreateSavedAddressInput,
  UpdateSavedAddressInput,
  AddressLabel,
} from '../../lib/profile/types';

interface SavedAddressesSectionProps {
  addresses: SavedAddress[];
  isOffline: boolean;
  onAddAddress: (data: CreateSavedAddressInput) => Promise<void>;
  onUpdateAddress: (addressId: string, data: UpdateSavedAddressInput) => Promise<void>;
  onDeleteAddress: (addressId: string) => Promise<void>;
  onSetDefaultAddress: (addressId: string) => Promise<void>;
}

export function SavedAddressesSection({
  addresses,
  isOffline,
  onAddAddress,
  onUpdateAddress,
  onDeleteAddress,
  onSetDefaultAddress,
}: SavedAddressesSectionProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null);
  const [deleteConfirmAddress, setDeleteConfirmAddress] = useState<SavedAddress | null>(null);

  const [label, setLabel] = useState<AddressLabel>('Home');
  const [customLabel, setCustomLabel] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('Lagos');
  const [state, setState] = useState('Lagos State');
  const [landmark, setLandmark] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Trigger button references for focus restoration
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const deleteConfirmButtonRef = useRef<HTMLButtonElement>(null);

  const openAddModal = () => {
    setEditingAddress(null);
    setLabel('Home');
    setCustomLabel('');
    setStreetAddress('');
    setNeighborhood('');
    setCity('Lagos');
    setState('Lagos State');
    setLandmark('');
    setIsDefault(addresses.length === 0);
    setModalError(null);
    setModalOpen(true);
  };

  const openEditModal = (addr: SavedAddress) => {
    setEditingAddress(addr);
    setLabel(addr.label);
    setCustomLabel(addr.customLabel || '');
    setStreetAddress(addr.streetAddress);
    setNeighborhood(addr.neighborhood);
    setCity(addr.city);
    setState(addr.state);
    setLandmark(addr.landmark);
    setIsDefault(addr.isDefault);
    setModalError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingAddress(null);
    setModalError(null);
    if (addButtonRef.current) {
      addButtonRef.current.focus();
    }
  };

  useEffect(() => {
    if (modalOpen && firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, [modalOpen]);

  useEffect(() => {
    if (deleteConfirmAddress && deleteConfirmButtonRef.current) {
      deleteConfirmButtonRef.current.focus();
    }
  }, [deleteConfirmAddress]);

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (isOffline) {
      setModalError('Modifications are disabled in offline mode.');
      return;
    }

    if (!streetAddress.trim()) {
      setModalError('Street address is required.');
      return;
    }
    if (!city.trim()) {
      setModalError('City is required.');
      return;
    }
    if (!landmark.trim()) {
      setModalError('Landmark or arrival instructions are required.');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingAddress) {
        await onUpdateAddress(editingAddress.id, {
          label,
          customLabel: label === 'Other' ? customLabel.trim() : undefined,
          streetAddress: streetAddress.trim(),
          neighborhood: neighborhood.trim(),
          city: city.trim(),
          state: state.trim(),
          landmark: landmark.trim(),
          isDefault,
        });
        setStatusMessage('Address updated successfully.');
      } else {
        await onAddAddress({
          label,
          customLabel: label === 'Other' ? customLabel.trim() : undefined,
          streetAddress: streetAddress.trim(),
          neighborhood: neighborhood.trim(),
          city: city.trim(),
          state: state.trim(),
          landmark: landmark.trim(),
          isDefault,
        });
        setStatusMessage('Address added successfully.');
      }
      closeModal();
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save address.';
      setModalError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmAddress) return;
    try {
      setIsSubmitting(true);
      await onDeleteAddress(deleteConfirmAddress.id);
      setStatusMessage('Address deleted successfully.');
      setDeleteConfirmAddress(null);
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete address.';
      setStatusMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[var(--card-bg)] text-[var(--text-main)] rounded-lg p-6 border border-[var(--lead)] shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--lead)]">
        <div>
          <h2 className="text-xl font-bold font-display text-[var(--text-main)]">
            Saved Service Locations
          </h2>
          <p className="text-xs text-[var(--text-muted)]">
            Addresses where technicians can be dispatched. Accurate landmarks speed up arrival.
          </p>
        </div>

        <button
          ref={addButtonRef}
          type="button"
          disabled={isOffline}
          onClick={openAddModal}
          className="min-h-[48px] px-4 py-2 bg-[var(--amber)] hover:bg-[var(--amber-hover)] text-white text-xs font-semibold rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Address</span>
        </button>
      </div>

      {statusMessage && (
        <div
          role="status"
          className="p-3.5 rounded-lg bg-[var(--brand-green-dim)] border border-[var(--brand-green-border)] text-[var(--brand-green)] text-xs flex items-center gap-2.5"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {addresses.length === 0 ? (
        <div className="text-center py-12 px-4 border border-dashed border-[var(--lead)] rounded-lg bg-[var(--tag-bg)]/30">
          <MapPin className="h-10 w-10 text-[var(--text-muted)] mx-auto mb-3" />
          <h3 className="text-sm font-bold text-[var(--text-main)] mb-1">No saved addresses yet</h3>
          <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto mb-4">
            Add your primary service location in Lagos, Abuja, or any active Nigerian city to pre-fill future service requests.
          </p>
          <button
            type="button"
            disabled={isOffline}
            onClick={openAddModal}
            className="min-h-[48px] px-5 py-2 bg-[var(--amber)] hover:bg-[var(--amber-hover)] text-white text-xs font-semibold rounded-lg transition inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            <span>Add First Address</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`p-5 rounded-lg border transition relative flex flex-col justify-between ${
                addr.isDefault
                  ? 'border-[var(--amber)] bg-[var(--tag-bg)]/40 shadow-xs ring-1 ring-[var(--amber)]/30'
                  : 'border-[var(--lead)] bg-[var(--card-bg)] hover:border-[var(--text-muted)]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--tag-bg)] text-[var(--text-main)] border border-[var(--lead)] text-[11px] font-bold">
                    <MapPin className="h-3.5 w-3.5 text-[var(--amber)]" />
                    {addr.label === 'Other' && addr.customLabel ? addr.customLabel : addr.label}
                  </span>

                  {addr.isDefault && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[var(--brand-green-dim)] text-[var(--brand-green)] border border-[var(--brand-green-border)] text-[10px] font-bold">
                      <Star className="h-3 w-3 fill-emerald-600 dark:fill-emerald-400 text-[var(--brand-green)]" />
                      Default Location
                    </span>
                  )}
                </div>

                <div className="space-y-1 mb-4">
                  <p className="text-xs font-bold text-[var(--text-main)]">{addr.streetAddress}</p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {addr.neighborhood ? `${addr.neighborhood}, ` : ''}
                    {addr.city}, {addr.state}
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)] bg-[var(--tag-bg)] border border-[var(--lead)] rounded-md p-2 mt-2">
                    <strong className="text-[var(--text-main)]">Landmark:</strong> {addr.landmark}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--lead)] flex items-center justify-between gap-2">
                {!addr.isDefault ? (
                  <button
                    type="button"
                    disabled={isOffline || isSubmitting}
                    onClick={() => onSetDefaultAddress(addr.id)}
                    className="min-h-[44px] text-xs font-medium text-[var(--text-muted)] hover:text-[var(--amber)] transition cursor-pointer disabled:opacity-50"
                  >
                    Set as default
                  </button>
                ) : (
                  <span className="text-[11px] text-[var(--text-muted)] font-medium">Primary location</span>
                )}

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={isOffline || isSubmitting}
                    onClick={() => openEditModal(addr)}
                    aria-label={`Edit ${addr.label} address`}
                    className="min-h-[44px] min-w-[44px] p-2 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--card-hover)] rounded-md transition flex items-center justify-center cursor-pointer disabled:opacity-50"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    disabled={isOffline || isSubmitting}
                    onClick={() => setDeleteConfirmAddress(addr)}
                    aria-label={`Delete ${addr.label} address`}
                    className="min-h-[44px] min-w-[44px] p-2 text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-red-500/10 rounded-md transition flex items-center justify-center cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal Dialog */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="address-modal-title"
            className="bg-[var(--card-bg)] text-[var(--text-main)] rounded-lg max-w-lg w-full p-6 shadow-xl border border-[var(--lead)] relative max-h-[90vh] overflow-y-auto"
          >
            <button
              type="button"
              onClick={closeModal}
              aria-label="Close address form"
              className="absolute top-4 right-4 p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--card-hover)] transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 id="address-modal-title" className="text-lg font-bold font-display text-[var(--text-main)] mb-1">
              {editingAddress ? 'Edit Service Location' : 'Add New Service Location'}
            </h3>
            <p className="text-xs text-[var(--text-muted)] mb-5">
              Ensure delivery landmarks are detailed so dispatched BrainWorkers find the premises without delay.
            </p>

            {modalError && (
              <div
                role="alert"
                className="mb-4 p-3 rounded-lg bg-[var(--danger-dim)] border border-[var(--danger-border)] text-[var(--danger)] text-xs flex items-center gap-2"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveModal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-main)] mb-1.5">
                  Location Label
                </label>
                <div className="flex gap-2">
                  {(['Home', 'Office', 'Other'] as AddressLabel[]).map((lbl) => (
                    <button
                      key={lbl}
                      type="button"
                      onClick={() => setLabel(lbl)}
                      className={`min-h-[44px] flex-1 py-2 px-3 text-xs font-semibold rounded-lg border transition cursor-pointer ${
                        label === lbl
                          ? 'bg-[var(--amber)] text-white border-[var(--amber)]'
                          : 'bg-[var(--tag-bg)] text-[var(--text-main)] border-[var(--lead)] hover:bg-[var(--card-hover)]'
                      }`}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>

              {label === 'Other' && (
                <div>
                  <label htmlFor="custom-label" className="block text-xs font-semibold text-[var(--text-main)] mb-1.5">
                    Custom Label Name
                  </label>
                  <input
                    id="custom-label"
                    type="text"
                    value={customLabel}
                    onChange={(e) => setCustomLabel(e.target.value)}
                    placeholder="e.g. Warehouse, Parents House, Project Site"
                    className="w-full px-3.5 py-2.5 text-xs bg-[var(--bg)] text-[var(--text-main)] border border-[var(--lead)] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[var(--amber)] focus:bg-[var(--card-bg)] transition"
                    required
                  />
                </div>
              )}

              <div>
                <label htmlFor="street-address" className="block text-xs font-semibold text-[var(--text-main)] mb-1.5">
                  Street Address
                </label>
                <input
                  ref={firstInputRef}
                  id="street-address"
                  type="text"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder="e.g. 14 Admiralty Way, Apartment 4B"
                  className="w-full px-3.5 py-2.5 text-xs bg-[var(--bg)] text-[var(--text-main)] border border-[var(--lead)] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[var(--amber)] focus:bg-[var(--card-bg)] transition"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="neighborhood" className="block text-xs font-semibold text-[var(--text-main)] mb-1.5">
                    Neighborhood or District
                  </label>
                  <input
                    id="neighborhood"
                    type="text"
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    placeholder="e.g. Lekki Phase 1, Wuse 2, GRA"
                    className="w-full px-3.5 py-2.5 text-xs bg-[var(--bg)] text-[var(--text-main)] border border-[var(--lead)] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[var(--amber)] focus:bg-[var(--card-bg)] transition"
                  />
                </div>

                <div>
                  <label htmlFor="city" className="block text-xs font-semibold text-[var(--text-main)] mb-1.5">
                    City
                  </label>
                  <input
                    id="city"
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Lagos, Abuja, Port Harcourt, Kano"
                    className="w-full px-3.5 py-2.5 text-xs bg-[var(--bg)] text-[var(--text-main)] border border-[var(--lead)] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[var(--amber)] focus:bg-[var(--card-bg)] transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="state" className="block text-xs font-semibold text-[var(--text-main)] mb-1.5">
                  State
                </label>
                <input
                  id="state"
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="e.g. Lagos State, FCT, Rivers State"
                  className="w-full px-3.5 py-2.5 text-xs bg-[var(--bg)] text-[var(--text-main)] border border-[var(--lead)] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[var(--amber)] focus:bg-[var(--card-bg)] transition"
                />
              </div>

              <div>
                <label htmlFor="landmark" className="block text-xs font-semibold text-[var(--text-main)] mb-1.5">
                  Landmark and Arrival Instructions <span className="text-[var(--danger)]">*</span>
                </label>
                <textarea
                  id="landmark"
                  rows={2}
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g. Beside Zenith Bank, opposite Ebeano Supermarket, black gate with gold handle."
                  className="w-full px-3.5 py-2.5 text-xs bg-[var(--bg)] text-[var(--text-main)] border border-[var(--lead)] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[var(--amber)] focus:bg-[var(--card-bg)] transition"
                  required
                />
                <p className="mt-1 text-[11px] text-[var(--text-muted)]">
                  Critical for Nigerian road dispatch. Help BrainWorkers locate your building quickly.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  id="is-default"
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="h-4 w-4 rounded-sm border-[var(--lead)] text-[var(--amber)] focus:ring-[var(--amber)]"
                />
                <label htmlFor="is-default" className="text-xs font-medium text-[var(--text-main)] cursor-pointer">
                  Set as my primary service address
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-[var(--lead)]">
                <button
                  type="button"
                  onClick={closeModal}
                  className="min-h-[48px] px-4 py-2 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-h-[48px] px-6 py-2.5 bg-[var(--amber)] hover:bg-[var(--amber-hover)] text-white text-xs font-semibold rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Location</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmAddress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
            className="bg-[var(--card-bg)] text-[var(--text-main)] rounded-lg max-w-sm w-full p-6 shadow-xl border border-[var(--lead)] relative text-center"
          >
            <div className="mx-auto w-12 h-12 rounded-lg bg-[var(--danger-dim)] text-[var(--danger)] border border-[var(--danger-border)] flex items-center justify-center mb-3">
              <Trash2 className="h-6 w-6" />
            </div>
            <h3 id="delete-modal-title" className="text-lg font-bold font-display text-[var(--text-main)] mb-2">
              Remove Saved Address?
            </h3>
            <p className="text-xs text-[var(--text-muted)] mb-6 leading-relaxed">
              Are you sure you want to remove <strong className="text-[var(--text-main)]">{deleteConfirmAddress.streetAddress}</strong> from your saved addresses? Active bookings will preserve their originally dispatched address.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmAddress(null)}
                className="min-h-[48px] flex-1 py-2 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--lead)] rounded-lg transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                ref={deleteConfirmButtonRef}
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmDelete}
                className="min-h-[48px] flex-1 py-2 bg-[var(--danger)] text-white text-xs font-semibold rounded-lg hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Removing...</span>
                  </>
                ) : (
                  <span>Yes, Remove</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
