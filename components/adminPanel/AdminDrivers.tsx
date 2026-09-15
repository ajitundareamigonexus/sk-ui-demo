'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Plus, Edit3, Phone, Hash, BadgeCheck, BadgeX, Activity,
  Search, X, Save, AlertTriangle, IdCard, Calendar,
  CheckCircle2, XCircle, Clock,
} from 'lucide-react';
import {
  getAllDrivers,
  createDriver,
  updateDriver,
  toggleDriverStatus,
  updateDriverAvailability,
} from '@/services/api';
import type { Driver } from '@/lib/types';
import { toast } from 'sonner';
import ConfirmModal from '@/components/ConfirmModal';
import { hasPermission } from '@/helper/permissions-handler';

// ─── Reuse same availability badge pattern as AdminFleet ─────────────────────
const AVAILABILITY_CFG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  AVAILABLE: { label: 'Available', color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20' },
  ON_TRIP: { label: 'On Trip', color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  UNAVAILABLE: { label: 'Unavailable', color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20' },
};

// ─── Reuse StatusBadge pattern from AdminAgents.tsx ──────────────────────────
function StatusBadge({ status }: { status: 'ACTIVE' | 'INACTIVE' }) {
  return status === 'ACTIVE' ? (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-500 border border-green-500/20">
      <BadgeCheck size={11} /> Active
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20">
      <BadgeX size={11} /> Inactive
    </span>
  );
}

// ─── Reuse fmtDate helper pattern from AdminAgents.tsx ────────────────────────
function fmtDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

const initialForm = {
  name: '',
  contactNumber: '',
  licenseNumber: '',
  licenseExpiryDate: '',
  documentsJson: '',
};

export default function AdminDrivers() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [form, setForm] = useState({ ...initialForm });
  const [saving, setSaving] = useState(false);
  const [deactivateModal, setDeactivateModal] = useState<{ isOpen: boolean; driver: Driver | null }>({
    isOpen: false, driver: null,
  });

  const load = async () => {
    setLoading(true);
    try {
      const data = await getAllDrivers();
      setDrivers(data || []);
    } catch {
      toast.error('Failed to load drivers.');
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditingDriver(null);
    setForm({ ...initialForm });
    setShowModal(true);
  };

  const openEdit = (d: Driver) => {
    setEditingDriver(d);
    // Reuse same form-prefill pattern from AdminFleet.openEditCab
    setForm({
      name: d.name,
      contactNumber: d.contactNumber,
      licenseNumber: d.licenseNumber,
      licenseExpiryDate: d.licenseExpiryDate || '',
      documentsJson: d.documentsJson || '',
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingDriver) {
        await updateDriver(editingDriver.id, form);
        toast.success('Driver updated successfully.');
      } else {
        await createDriver({ ...form, status: 'ACTIVE', availabilityStatus: 'AVAILABLE' });
        toast.success('Driver added successfully.');
      }
      setShowModal(false);
      await load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save driver.');
    }
    setSaving(false);
  };

  // Toggle ACTIVE ↔ INACTIVE — reuses pattern from AdminAgents toggleAgentStatus
  const handleToggleStatus = async (d: Driver) => {
    if (d.status === 'ACTIVE') {
      setDeactivateModal({ isOpen: true, driver: d });
    } else {
      try {
        await toggleDriverStatus(d.id, 'ACTIVE');
        toast.success(`${d.name} reactivated.`);
        await load();
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Failed to activate driver.');
      }
    }
  };

  const handleConfirmDeactivate = async () => {
    if (!deactivateModal.driver) return;
    try {
      await toggleDriverStatus(deactivateModal.driver.id, 'INACTIVE');
      toast.success(`${deactivateModal.driver.name} deactivated.`);
      await load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to deactivate driver.');
    }
    setDeactivateModal({ isOpen: false, driver: null });
  };

  // Change availability
  const handleAvailability = async (d: Driver, avail: string) => {
    try {
      await updateDriverAvailability(d.id, avail);
      toast.success(`Availability updated to ${avail}.`);
      await load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update availability.');
    }
  };

  // ─── Stats — reuse same stats-card pattern from AdminBookings ────────────
  const stats = useMemo(() => ({
    total: drivers.length,
    active: drivers.filter(d => d.status === 'ACTIVE').length,
    onTrip: drivers.filter(d => d.availabilityStatus === 'ON_TRIP').length,
    unavailable: drivers.filter(d => d.availabilityStatus === 'UNAVAILABLE').length,
  }), [drivers]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return drivers;
    return drivers.filter(d =>
      [d.name, d.contactNumber, d.licenseNumber]
        .some(v => (v || '').toLowerCase().includes(q))
    );
  }, [drivers, search]);

  return (
    <div>
      {/* ── Stats bar — same pattern as AdminBookings stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Drivers', value: stats.total, Icon: User, color: 'text-teal-500', bg: 'bg-teal-500/10' },
          { label: 'Active', value: stats.active, Icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' },
          { label: 'On Trip', value: stats.onTrip, Icon: Activity, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Unavailable', value: stats.unavailable, Icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10' },
        ].map(({ label, value, Icon, color, bg }) => (
          <div key={label} className="rounded-2xl border border-card-border bg-card p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-8 h-8 rounded-md ${bg} flex items-center justify-center`}>
                <Icon size={14} className={color} />
              </div>
              <span className="text-[11px] text-muted font-bold uppercase tracking-wider">{label}</span>
            </div>
            <div className={`text-xl font-black ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-xl font-bold">Driver Management</h2>
          <p className="text-sm text-muted">Manage drivers, licences & availability</p>
        </div>
        {hasPermission('Driver', 'create') && (
          <button onClick={openAdd}
            className="flex items-center gap-2 bg-teal-400 text-black px-4 py-2 rounded-xl text-sm font-bold hover:scale-[1.02] transition-transform shadow-md shadow-teal-400/20 cursor-pointer">
            <Plus size={16} /> Add Driver
          </button>
        )}
      </div>

      {/* ── Search — reuse same search input pattern from AdminBookings ── */}
      <div className="relative mb-4 max-w-sm">
        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input type="text" placeholder="Search by name, contact, licence…"
          value={search} onChange={e => setSearch(e.target.value)}
          className="w-full h-11 rounded-xl border border-border bg-background pl-10 pr-4 text-sm outline-none focus:border-primary transition-colors" />
      </div>

      {/* ── Driver Table — reuses table structure from AdminBookings ── */}
      {loading ? (
        <div className="text-center py-16 text-muted">Loading drivers…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted border border-dashed border-border rounded-2xl">
          <User size={40} className="mx-auto mb-3 opacity-30" />
          <p>{drivers.length === 0 ? 'No drivers added yet.' : 'No drivers match your search.'}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-card-border bg-card shadow-lg">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-card-border bg-teal-500/5 text-[10px] font-bold uppercase tracking-wider text-muted">
                <th className="p-3">Driver</th>
                <th className="p-3">Contact</th>
                <th className="p-3">Licence</th>
                <th className="p-3">Expiry</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Availability</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border text-sm">
              {filtered.map(d => {
                const availCfg = AVAILABILITY_CFG[d.availabilityStatus] || AVAILABILITY_CFG.UNAVAILABLE;
                const expiryDays = d.licenseExpiryDate
                  ? Math.ceil((new Date(d.licenseExpiryDate).getTime() - Date.now()) / 86400000)
                  : null;

                return (
                  <tr key={d.id} className="hover:bg-teal-500/[0.02] transition-colors">
                    {/* Driver name */}
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-teal-500/10 flex items-center justify-center shrink-0">
                          <User size={14} className="text-teal-500" />
                        </div>
                        <div>
                          <div className="font-bold text-foreground text-xs">{d.name}</div>
                          <div className="text-[10px] text-muted">ID: {d.id}</div>
                        </div>
                      </div>
                    </td>
                    {/* Contact */}
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-xs font-medium text-muted">
                        <Phone size={11} className="text-teal-500 shrink-0" />{d.contactNumber}
                      </div>
                    </td>
                    {/* Licence */}
                    <td className="p-4">
                      <div className="text-xs font-mono font-bold text-foreground bg-surface px-1.5 py-0.5 rounded inline-block">
                        {d.licenseNumber}
                      </div>
                    </td>
                    {/* Expiry */}
                    <td className="p-4">
                      {d.licenseExpiryDate ? (
                        <div className={`text-xs font-semibold ${expiryDays !== null && expiryDays < 30 ? 'text-red-400' : expiryDays !== null && expiryDays < 90 ? 'text-amber-400' : 'text-green-500'}`}>
                          {fmtDate(d.licenseExpiryDate)}
                          {expiryDays !== null && expiryDays < 30 && <span className="ml-1">⚠️</span>}
                        </div>
                      ) : <span className="text-muted text-xs">—</span>}
                    </td>
                    {/* Status */}
                    <td className="p-4 text-center">
                      <StatusBadge status={d.status} />
                    </td>
                    {/* Availability */}
                    <td className="p-4 text-center">
                      <select
                        value={d.availabilityStatus}
                        disabled={d.status === 'INACTIVE'}
                        onChange={e => handleAvailability(d, e.target.value)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full border cursor-pointer bg-transparent ${availCfg.color} ${availCfg.bg} ${availCfg.border} disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <option value="AVAILABLE">Available</option>
                        <option value="ON_TRIP">On Trip</option>
                        <option value="UNAVAILABLE">Unavailable</option>
                      </select>
                    </td>
                    {/* Actions */}
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {hasPermission('Driver', 'update') && (
                          <button onClick={() => openEdit(d)}
                            className="p-2 bg-blue-400/10 text-blue-400 rounded-lg hover:bg-blue-400 hover:text-white transition-colors cursor-pointer" title="Edit">
                            <Edit3 size={13} />
                          </button>
                        )}
                        {hasPermission('Driver', 'update') && (
                          <button onClick={() => handleToggleStatus(d)}
                            className={`p-2 rounded-lg transition-colors cursor-pointer ${d.status === 'ACTIVE'
                              ? 'bg-red-400/10 text-red-400 hover:bg-red-400 hover:text-white'
                              : 'bg-green-400/10 text-green-400 hover:bg-green-400 hover:text-white'}`}
                            title={d.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}>
                            {d.status === 'ACTIVE' ? <BadgeX size={13} /> : <BadgeCheck size={13} />}
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

      {/* ── Add/Edit Modal — reuses same form grid pattern as AdminFleet ── */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-card-border rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-card-border flex items-center justify-between">
                <h3 className="text-xl font-bold">{editingDriver ? 'Edit Driver' : 'Add New Driver'}</h3>
                <button onClick={() => setShowModal(false)}
                  className="w-8 h-8 rounded-full border border-border bg-background flex items-center justify-center text-muted hover:text-foreground transition cursor-pointer">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto flex-1">
                {/* Reuse same grid grid-cols-2 gap-4 pattern from AdminFleet form */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-muted mb-1">Full Name</label>
                    <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Rajesh Kumar"
                      className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm outline-none focus:border-teal-400" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-muted mb-1">Mobile Number</label>
                    <input required type="tel" value={form.contactNumber}
                      onChange={e => setForm({ ...form, contactNumber: e.target.value })}
                      placeholder="e.g. 9876543210"
                      className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm outline-none focus:border-teal-400" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-muted mb-1">Licence Number</label>
                    <input required value={form.licenseNumber}
                      onChange={e => setForm({ ...form, licenseNumber: e.target.value })}
                      placeholder="e.g. MH1220234567890"
                      className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm outline-none focus:border-teal-400" />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-muted mb-1">Licence Expiry Date</label>
                    <input type="date" value={form.licenseExpiryDate}
                      onChange={e => setForm({ ...form, licenseExpiryDate: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm outline-none focus:border-teal-400" />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-muted mb-1">Documents (JSON or notes)</label>
                    <textarea value={form.documentsJson}
                      onChange={e => setForm({ ...form, documentsJson: e.target.value })}
                      placeholder='e.g. {"aadhar":"https://...", "licence":"https://..."}'
                      rows={2}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm outline-none focus:border-teal-400 resize-none" />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-card-border">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-background cursor-pointer">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving}
                    className="px-5 py-2.5 rounded-xl bg-teal-400 text-black text-sm font-bold shadow-md shadow-teal-400/20 cursor-pointer disabled:opacity-60 flex items-center gap-2">
                    <Save size={14} />
                    {saving ? 'Saving…' : (editingDriver ? 'Update Driver' : 'Add Driver')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Deactivate confirm — reuses ConfirmModal ── */}
      <ConfirmModal
        isOpen={deactivateModal.isOpen}
        onClose={() => setDeactivateModal({ isOpen: false, driver: null })}
        onConfirm={handleConfirmDeactivate}
        title="Deactivate Driver?"
        message={`${deactivateModal.driver?.name} will be marked INACTIVE and removed from the assignment dropdown. Their availability will be set to UNAVAILABLE.`}
        confirmText="Deactivate"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}
