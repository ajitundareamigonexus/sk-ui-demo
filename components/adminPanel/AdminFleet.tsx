'use client';

import { useState, useEffect } from 'react';
import {
  Car, Plus, Edit3, Trash2, Fuel, Users, Briefcase, Star,
  BadgeCheck, BadgeX, Activity, ToggleLeft, ToggleRight, FileText,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmModal from '@/components/ConfirmModal';
import { addCab, deleteCab, updateCab } from '@/services/api';
import { toast } from 'sonner';
import { hasPermission } from '@/helper/permissions-handler';

// Reuse same parseFeatures helper — unchanged
function parseFeatures(carFeatures: any): { fuelType: string; ac: boolean; bags: number; image: string } {
  try {
    if (typeof carFeatures === 'string' && carFeatures.startsWith('{')) {
      return { fuelType: 'Petrol', ac: true, bags: 2, image: '', ...JSON.parse(carFeatures) };
    }
  } catch { }
  return { fuelType: 'Petrol', ac: true, bags: 2, image: '' };
}

interface AdminFleetProps {
  cabs: any[];
  setRefreshKey: React.Dispatch<React.SetStateAction<number>>;
}

const CAR_TYPE_OPTIONS = ['SEDAN', 'HATCHBACK', 'SUV', 'BUS'];
const FUEL_OPTIONS = ['Petrol', 'Diesel', 'CNG', 'Electric'];

// P0-18: vehicle availability statuses
const AVAILABILITY_OPTIONS = ['AVAILABLE', 'ON_TRIP', 'MAINTENANCE', 'UNAVAILABLE'];
const AVAILABILITY_CFG: Record<string, { color: string; bg: string; border: string }> = {
  AVAILABLE: { color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20' },
  ON_TRIP: { color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  MAINTENANCE: { color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  UNAVAILABLE: { color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20' },
};

const initialForm = {
  carType: '',
  carName: '',
  registrationNumber: '',
  totalSeat: 4,
  bags: 2,
  basePrice: 1000,
  rating: 4.8,
  fuelType: 'Petrol',
  ac: true,
  image: '',
  inclusionsNotes: '',
  exclusionNotes: '',
  extraKmRate: 12,
  gstPercent: 5,
  // P0-18 document/expiry fields
  luggageCapacity: 2,
  fitnessExpiryDate: '',
  insuranceExpiryDate: '',
  permitExpiryDate: '',
  documentsJson: '',
};

export default function AdminFleet({ cabs, setRefreshKey }: AdminFleetProps) {
  const [showCabModal, setShowCabModal] = useState(false);
  const [editingCab, setEditingCab] = useState<any>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: number | null }>({ isOpen: false, id: null });
  const [saving, setSaving] = useState(false);
  const [cabForm, setCabForm] = useState({ ...initialForm });

  const openAddCab = () => {
    setEditingCab(null);
    setCabForm({ ...initialForm });
    setShowCabModal(true);
  };

  const openEditCab = (cab: any) => {
    setEditingCab(cab);
    const features = parseFeatures(cab.carFeatures);
    setCabForm({
      carType: cab.carType || '',
      carName: cab.carName || '',
      registrationNumber: cab.registrationNumber || '',
      totalSeat: cab.totalSeat || 4,
      bags: features.bags || 2,
      basePrice: cab.cabPrice || 1000,
      rating: cab.rating || 4.8,
      fuelType: features.fuelType || 'Petrol',
      ac: features.ac !== undefined ? features.ac : true,
      image: features.image || '',
      inclusionsNotes: cab.inclusionsNotes || '',
      exclusionNotes: cab.exclusionNotes || '',
      extraKmRate: cab.extraKmRate ?? 12,
      gstPercent: cab.gstPercent ?? 5,
      // P0-18 fields
      luggageCapacity: cab.luggageCapacity ?? 2,
      fitnessExpiryDate: cab.fitnessExpiryDate || '',
      insuranceExpiryDate: cab.insuranceExpiryDate || '',
      permitExpiryDate: cab.permitExpiryDate || '',
      documentsJson: cab.documentsJson || '',
    });
    setShowCabModal(true);
  };

  const handleSaveCab = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      carType: cabForm.carType,
      carName: cabForm.carName,
      registrationNumber: cabForm.registrationNumber,
      availabilityStatus: 'AVAILABLE',
      status: 'ACTIVE',
      totalSeat: cabForm.totalSeat,
      luggageCapacity: cabForm.luggageCapacity,
      carFeatures: JSON.stringify({ fuelType: cabForm.fuelType, ac: cabForm.ac, bags: cabForm.bags, image: cabForm.image }),
      cabPrice: cabForm.basePrice,
      gstPercent: cabForm.gstPercent,
      totalFare: Math.round(cabForm.basePrice + (cabForm.basePrice * cabForm.gstPercent) / 100),
      inclusionsNotes: cabForm.inclusionsNotes,
      exclusionNotes: cabForm.exclusionNotes,
      rating: cabForm.rating,
      extraKmRate: cabForm.extraKmRate,
      // P0-18 document / expiry fields
      fitnessExpiryDate: cabForm.fitnessExpiryDate || null,
      insuranceExpiryDate: cabForm.insuranceExpiryDate || null,
      permitExpiryDate: cabForm.permitExpiryDate || null,
      documentsJson: cabForm.documentsJson || null,
    };
    try {
      if (editingCab) {
        await updateCab(editingCab.id, payload);
        toast.success('Vehicle updated successfully.');
      } else {
        await addCab(payload);
        toast.success('Vehicle added to fleet.');
      }
    } catch (err) {
      console.error('Failed to save cab to backend', err);
      toast.error('Failed to save vehicle. Please try again.');
    }
    setSaving(false);
    setShowCabModal(false);
    setRefreshKey(k => k + 1);
  };

  const handleDeleteCabClick = (id: number) => setDeleteModal({ isOpen: true, id });

  const handleConfirmDelete = async () => {
    if (deleteModal.id === null) return;
    try {
      await deleteCab(deleteModal.id);
      toast.success('Vehicle removed from fleet.');
    } catch (err) {
      console.error('Failed to delete cab from backend', err);
      toast.error('Failed to remove vehicle.');
    }
    setDeleteModal({ isOpen: false, id: null });
    setRefreshKey(k => k + 1);
  };

  // ─── Reusable expiry badge helper ────────────────────────────────────────
  function ExpiryBadge({ label, date }: { label: string; date?: string }) {
    if (!date) return null;
    const days = Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
    const color = days < 30 ? 'text-red-400' : days < 90 ? 'text-amber-400' : 'text-green-500';
    return (
      <span className={`text-[9px] font-bold ${color}`}>
        {label}: {new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
        {days < 30 && ' ⚠️'}
      </span>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold">Fleet Management</h2>
          <p className="text-sm text-muted">Manage the vehicles available for booking</p>
        </div>
        {hasPermission('Fleet', 'create') && (
          <button onClick={openAddCab}
            className="flex items-center gap-2 bg-teal-400 text-black px-4 py-2 rounded-xl text-sm font-bold hover:scale-[1.02] transition-transform shadow-md shadow-teal-400/20 cursor-pointer">
            <Plus size={16} /> Add New Vehicle
          </button>
        )}
      </div>

      {cabs.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-2xl">
          <Car size={40} className="mx-auto mb-3 text-muted opacity-30" />
          <p className="text-muted">No vehicles added yet. Add your first vehicle!</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-card-border bg-card shadow-lg">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-card-border bg-teal-500/5 text-[10px] font-bold uppercase tracking-wider text-muted">
                <th className="p-3">Vehicle</th>
                <th className="p-3">Type</th>
                <th className="p-3">Features</th>
                <th className="p-3">Documents</th>
                <th className="p-3">Pricing</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border text-sm">
              {cabs?.map(cab => {
                const features = parseFeatures(cab.carFeatures);
                const avail = cab.availabilityStatus || 'AVAILABLE';
                const availCfg = AVAILABILITY_CFG[avail] || AVAILABILITY_CFG.UNAVAILABLE;
                const isActive = (cab.status || 'ACTIVE').toUpperCase() === 'ACTIVE';

                return (
                  <tr key={cab.id} className="hover:bg-teal-500/[0.02] transition-colors group">
                    {/* Vehicle */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-400/10 flex items-center justify-center shrink-0">
                          <Car size={20} className="text-teal-400" />
                        </div>
                        <div>
                          <div className="font-bold text-foreground text-sm">{cab.carName || '—'}</div>
                          {cab.registrationNumber && (
                            <div className="text-[10px] font-mono font-bold text-muted bg-surface px-1.5 py-0.5 rounded inline-block mt-1">
                              {cab.registrationNumber}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Type & Status */}
                    <td className="p-4">
                      <div className="flex flex-col gap-1.5 items-start">
                        <span className="text-[10px] font-black uppercase tracking-widest text-teal-400 bg-teal-400/10 px-2 py-0.5 rounded-full">
                          {cab.carType || '—'}
                        </span>
                        {/* <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${availCfg.color} ${availCfg.bg} ${availCfg.border}`}>
                          <Activity size={9} />
                          {avail}
                        </div> */}
                        {/* {isActive ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-500 mt-0.5">
                            <BadgeCheck size={10} /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-400 mt-0.5">
                            <BadgeX size={10} /> Inactive
                          </span>
                        )} */}
                      </div>
                    </td>

                    {/* Features */}
                    <td className="p-4">
                      <div className="grid grid-cols-2 gap-y-1 gap-x-3 text-xs">
                        <div className="flex items-center gap-1 text-muted">
                          <Users size={12} className="text-teal-400" />
                          <span>Seats:</span> <span className="text-foreground font-semibold">{cab.totalSeat}</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted">
                          <Briefcase size={12} className="text-teal-400" />
                          <span>Bags:</span> <span className="text-foreground font-semibold">{features.bags}</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted">
                          <Fuel size={12} className="text-teal-400" />
                          <span>Fuel:</span> <span className="text-foreground font-semibold">{features.fuelType}</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted">
                          <Star size={12} className="text-teal-400" />
                          <span>Rating:</span> <span className="text-foreground font-semibold">{cab.rating ?? '—'}</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted col-span-2 mt-0.5">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${features.ac ? 'bg-teal-400/10 text-teal-400' : 'bg-muted/10 text-muted'}`}>
                            {features.ac ? 'AC' : 'Non-AC'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Documents */}
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        {!cab.fitnessExpiryDate && !cab.insuranceExpiryDate && !cab.permitExpiryDate ? (
                          <span className="text-xs text-muted/60 italic">No documents</span>
                        ) : (
                          <>
                            <ExpiryBadge label="Fitness" date={cab.fitnessExpiryDate} />
                            <ExpiryBadge label="Insurance" date={cab.insuranceExpiryDate} />
                            <ExpiryBadge label="Permit" date={cab.permitExpiryDate} />
                          </>
                        )}
                      </div>
                    </td>

                    {/* Pricing */}
                    <td className="p-4">
                      <div className="font-extrabold text-foreground text-sm">₹{cab.cabPrice?.toLocaleString('en-IN') ?? '—'}</div>
                      {cab.extraKmRate != null && (
                        <div className="text-[10px] font-bold text-amber-400 mt-1">₹{cab.extraKmRate}/km extra</div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <div>
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-500">
                            <BadgeCheck size={10} /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-400">
                            <BadgeX size={10} /> Inactive
                          </span>
                        )}
                      </div>
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${availCfg.color} ${availCfg.bg} ${availCfg.border}`}>
                        <Activity size={9} />
                        {avail}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        {hasPermission('Fleet', 'update') && (
                          <button onClick={() => openEditCab(cab)}
                            className="p-2 bg-blue-400/10 text-blue-400 rounded-lg hover:bg-blue-400 hover:text-white transition-colors cursor-pointer" title="Edit Vehicle">
                            <Edit3 size={14} />
                          </button>
                        )}
                        {hasPermission('Fleet', 'delete') && (
                          <button onClick={() => handleDeleteCabClick(cab.id)}
                            className="p-2 bg-red-400/10 text-red-400 rounded-lg hover:bg-red-400 hover:text-white transition-colors cursor-pointer" title="Remove Vehicle">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Add/Edit Vehicle Modal ── */}
      {showCabModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-card border border-card-border rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-card-border">
              <h3 className="text-xl font-bold">{editingCab ? 'Edit Vehicle' : 'Add New Vehicle'}</h3>
            </div>
            <form onSubmit={handleSaveCab} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-4">

                {/* Car Type */}
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-muted mb-1">Car Category</label>
                  <select required value={cabForm.carType} onChange={e => setCabForm({ ...cabForm, carType: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm outline-none focus:border-teal-400">
                    <option value="">Select Category</option>
                    {CAR_TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                {/* Car Model Name */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-muted mb-1">Car Model Name</label>
                  <input required value={cabForm.carName} onChange={e => setCabForm({ ...cabForm, carName: e.target.value })}
                    placeholder="e.g. Honda City"
                    className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm outline-none focus:border-teal-400" />
                </div>

                {/* Registration Number */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-muted mb-1">Registration Number</label>
                  <input required value={cabForm.registrationNumber} onChange={e => setCabForm({ ...cabForm, registrationNumber: e.target.value })}
                    placeholder="e.g. MH-12-XX-1234"
                    className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm outline-none focus:border-teal-400" />
                </div>

                {/* Seats */}
                <div>
                  <label className="block text-xs font-bold text-muted mb-1">Total Seats</label>
                  <input required type="number" min={1} max={50} value={cabForm.totalSeat}
                    onChange={e => setCabForm({ ...cabForm, totalSeat: parseInt(e.target.value) })}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm outline-none focus:border-teal-400" />
                </div>

                {/* Luggage */}
                <div>
                  <label className="block text-xs font-bold text-muted mb-1">Luggage / Bags</label>
                  <input required type="number" min={0} max={20} value={cabForm.bags}
                    onChange={e => setCabForm({ ...cabForm, bags: parseInt(e.target.value) })}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm outline-none focus:border-teal-400" />
                </div>

                {/* Base Price */}
                <div>
                  <label className="block text-xs font-bold text-muted mb-1">Base Price (₹)</label>
                  <input required type="number" min={0} value={cabForm.basePrice}
                    onChange={e => setCabForm({ ...cabForm, basePrice: parseFloat(e.target.value) })}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm outline-none focus:border-teal-400" />
                </div>

                {/* GST */}
                <div>
                  <label className="block text-xs font-bold text-muted mb-1">GST (%)</label>
                  <input type="number" min={0} max={100} step={0.1} value={cabForm.gstPercent}
                    onChange={e => setCabForm({ ...cabForm, gstPercent: parseFloat(e.target.value) })}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm outline-none focus:border-teal-400" />
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-xs font-bold text-muted mb-1">Rating (0–5)</label>
                  <input required type="number" min={0} max={5} step={0.1} value={cabForm.rating}
                    onChange={e => setCabForm({ ...cabForm, rating: parseFloat(e.target.value) })}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm outline-none focus:border-teal-400" />
                </div>

                {/* Extra Km Rate */}
                <div>
                  <label className="block text-xs font-bold text-muted mb-1">Extra Km Rate (₹/km)</label>
                  <input required type="number" min={0} step={0.5} value={cabForm.extraKmRate}
                    onChange={e => setCabForm({ ...cabForm, extraKmRate: parseFloat(e.target.value) })}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm outline-none focus:border-teal-400" />
                </div>

                {/* Fuel Type */}
                <div>
                  <label className="block text-xs font-bold text-muted mb-1">Fuel Type</label>
                  <select value={cabForm.fuelType} onChange={e => setCabForm({ ...cabForm, fuelType: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm outline-none focus:border-teal-400">
                    {FUEL_OPTIONS.map(f => <option key={f}>{f}</option>)}
                  </select>
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-xs font-bold text-muted mb-1">Image URL (optional)</label>
                  <input type="text" value={cabForm.image} onChange={e => setCabForm({ ...cabForm, image: e.target.value })}
                    placeholder="https://... or /images/..."
                    className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm outline-none focus:border-teal-400" />
                </div>

                {/* Inclusions */}
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-muted mb-1">Inclusions (comma-separated)</label>
                  <input type="text" value={cabForm.inclusionsNotes} onChange={e => setCabForm({ ...cabForm, inclusionsNotes: e.target.value })}
                    placeholder="Driver allowance, Fuel"
                    className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm outline-none focus:border-teal-400" />
                </div>

                {/* Exclusions */}
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-muted mb-1">Exclusions (comma-separated)</label>
                  <input type="text" value={cabForm.exclusionNotes} onChange={e => setCabForm({ ...cabForm, exclusionNotes: e.target.value })}
                    placeholder="Toll & Parking charges"
                    className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm outline-none focus:border-teal-400" />
                </div>

                {/* AC Toggle */}
                <div className="col-span-2 flex items-center gap-2 mt-1">
                  <input type="checkbox" id="ac" checked={cabForm.ac} onChange={e => setCabForm({ ...cabForm, ac: e.target.checked })}
                    className="w-4 h-4 accent-teal-400" />
                  <label htmlFor="ac" className="text-sm font-semibold select-none cursor-pointer">Has Air Conditioning (AC)</label>
                </div>

                {/* ── P0-18: Document / Expiry fields ── */}
                <div className="col-span-2">
                  <div className="flex items-center gap-2 mb-3 mt-2">
                    <FileText size={14} className="text-teal-400" />
                    <span className="text-xs font-bold text-muted uppercase tracking-wider">Documents & Expiry Dates</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-muted mb-1">Fitness Expiry</label>
                      <input type="date" value={cabForm.fitnessExpiryDate}
                        onChange={e => setCabForm({ ...cabForm, fitnessExpiryDate: e.target.value })}
                        className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm outline-none focus:border-teal-400" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-muted mb-1">Insurance Expiry</label>
                      <input type="date" value={cabForm.insuranceExpiryDate}
                        onChange={e => setCabForm({ ...cabForm, insuranceExpiryDate: e.target.value })}
                        className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm outline-none focus:border-teal-400" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-muted mb-1">Permit Expiry</label>
                      <input type="date" value={cabForm.permitExpiryDate}
                        onChange={e => setCabForm({ ...cabForm, permitExpiryDate: e.target.value })}
                        className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm outline-none focus:border-teal-400" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-muted mb-1">Luggage Capacity</label>
                      <input type="number" min={0} value={cabForm.luggageCapacity}
                        onChange={e => setCabForm({ ...cabForm, luggageCapacity: parseInt(e.target.value) })}
                        className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm outline-none focus:border-teal-400" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-muted mb-1">Document URLs (JSON or comma-separated)</label>
                      <textarea value={cabForm.documentsJson}
                        onChange={e => setCabForm({ ...cabForm, documentsJson: e.target.value })}
                        placeholder='e.g. {"rc":"https://...", "insurance":"https://..."}'
                        rows={2}
                        className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm outline-none focus:border-teal-400 resize-none" />
                    </div>
                  </div>
                </div>

              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-card-border mt-4">
                <button type="button" onClick={() => setShowCabModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-background cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-teal-400 text-black text-sm font-bold shadow-md shadow-teal-400/20 cursor-pointer disabled:opacity-60">
                  {saving ? 'Saving…' : (editingCab ? 'Update Vehicle' : 'Save Vehicle')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Confirm Delete Modal — reuses existing ConfirmModal ── */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={handleConfirmDelete}
        title="Remove Vehicle?"
        message="Are you sure you want to remove this vehicle from the fleet? This action cannot be undone."
        confirmText="Remove"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}
