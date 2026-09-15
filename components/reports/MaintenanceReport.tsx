'use client';

import { useEffect, useState } from 'react';
import { Wrench, Plus, Trash2, Loader2 } from 'lucide-react';
import ConfirmModal from '@/components/ConfirmModal';
import { getMaintenanceEntries, addMaintenanceEntry, deleteMaintenanceEntry } from '@/services/api';

function fmt(dateStr: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

interface MaintEntry {
  id: number;
  date: string;
  vehicle: string;
  type: string;
  cost: number;
  vendor: string;
  notes: string;
}

export default function MaintenanceReport() {
  const [maintEntries, setMaintEntries] = useState<MaintEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [maintForm, setMaintForm] = useState({ date: '', vehicle: '', type: '', cost: 0, vendor: '', notes: '' });
  const [showMaintForm, setShowMaintForm] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: number | null }>({ isOpen: false, id: null });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    getMaintenanceEntries()
      .then(data => {
        setMaintEntries(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch maintenance entries:", err);
        setLoading(false);
      });
  }, []);

  const saveMaintEntry = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const entry = { ...maintForm };
    addMaintenanceEntry(entry)
      .then(savedEntry => {
        setMaintEntries(prev => [...prev, savedEntry]);
        setMaintForm({ date: '', vehicle: '', type: '', cost: 0, vendor: '', notes: '' });
        setShowMaintForm(false);
        setSubmitting(false);
      })
      .catch(err => {
        console.error("Failed to save maintenance entry:", err);
        setSubmitting(false);
      });
  };

  const handleDeleteClick = (id: number) => {
    setDeleteModal({ isOpen: true, id });
  };

  const handleConfirmDelete = () => {
    if (deleteModal.id === null) return;
    deleteMaintenanceEntry(deleteModal.id)
      .then(() => {
        setMaintEntries(prev => prev.filter(e => e.id !== deleteModal.id));
        setDeleteModal({ isOpen: false, id: null });
      })
      .catch(err => {
        console.error("Failed to delete maintenance entry:", err);
        setDeleteModal({ isOpen: false, id: null });
      });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2"><Wrench size={20} className="text-blue-400" />Maintenance Report</h2>
          <p className="text-sm text-muted">Track vehicle service and repair expenses</p>
        </div>
        <button
          onClick={() => setShowMaintForm(v => !v)}
          className="flex items-center gap-2 bg-blue-400/10 border border-blue-400/20 text-blue-400 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-400 hover:text-black transition-all shrink-0 cursor-pointer"
        >
          <Plus size={14} /> Add Entry
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted">
          <Loader2 className="animate-spin text-blue-400 mb-3" size={32} />
          <p className="text-sm">Loading maintenance records...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total Cost', value: `₹${maintEntries.reduce((s, e) => s + e.cost, 0).toLocaleString('en-IN')}`, color: 'text-blue-400' },
              { label: 'Total Records', value: maintEntries.length, color: 'text-teal-400' },
              { label: 'Vehicles', value: new Set(maintEntries.map(e => e.vehicle)).size, color: 'text-purple-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-2xl border border-card-border bg-card p-5">
                <div className={`text-2xl font-black ${color}`}>{value}</div>
                <div className="text-xs text-muted mt-1">{label}</div>
              </div>
            ))}
          </div>

          {showMaintForm && (
            <form onSubmit={saveMaintEntry} className="rounded-2xl border border-blue-400/20 bg-blue-400/5 p-6 space-y-4">
              <h3 className="text-sm font-bold text-blue-400">New Maintenance Entry</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-muted uppercase tracking-wider block mb-1">Date</label>
                  <input required type="date" value={maintForm.date} onChange={e => setMaintForm({ ...maintForm, date: e.target.value })} className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-muted uppercase tracking-wider block mb-1">Vehicle</label>
                  <input required value={maintForm.vehicle} onChange={e => setMaintForm({ ...maintForm, vehicle: e.target.value })} placeholder="Vehicle name/model" className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-muted uppercase tracking-wider block mb-1">Type</label>
                  <select required value={maintForm.type} onChange={e => setMaintForm({ ...maintForm, type: e.target.value })} className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400">
                    <option value="">Select type</option>
                    {['Oil Change', 'Tyre Replacement', 'Brake Service', 'General Service', 'AC Repair', 'Engine Repair', 'Battery', 'Other'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-muted uppercase tracking-wider block mb-1">Cost (₹)</label>
                  <input required type="number" value={maintForm.cost || ''} onChange={e => setMaintForm({ ...maintForm, cost: parseFloat(e.target.value) || 0 })} className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-muted uppercase tracking-wider block mb-1">Vendor/Garage</label>
                  <input value={maintForm.vendor} onChange={e => setMaintForm({ ...maintForm, vendor: e.target.value })} placeholder="Vendor name" className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-muted uppercase tracking-wider block mb-1">Notes</label>
                  <input value={maintForm.notes} onChange={e => setMaintForm({ ...maintForm, notes: e.target.value })} placeholder="Optional notes" className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400" />
                </div>
              </div>
              <div className="flex gap-3"><button type="submit" className="px-5 py-2 bg-blue-400 text-black rounded-xl text-sm font-bold cursor-pointer">Save Entry</button><button type="button" onClick={() => setShowMaintForm(false)} className="px-5 py-2 border border-border rounded-xl text-sm font-semibold cursor-pointer">Cancel</button></div>
            </form>
          )}

          {maintEntries.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted">
              <Wrench size={40} className="mx-auto mb-3 opacity-30" />
              <p>No maintenance records yet.</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-card-border bg-card overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-card-border bg-blue-400/5">
                    <th className="text-left px-4 py-3 text-[11px] font-bold text-muted uppercase tracking-wider">Date</th>
                    <th className="text-left px-4 py-3 text-[11px] font-bold text-muted uppercase tracking-wider">Vehicle</th>
                    <th className="text-left px-4 py-3 text-[11px] font-bold text-muted uppercase tracking-wider">Type</th>
                    <th className="text-left px-4 py-3 text-[11px] font-bold text-muted uppercase tracking-wider">Vendor</th>
                    <th className="text-right px-4 py-3 text-[11px] font-bold text-muted uppercase tracking-wider">Cost</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {[...maintEntries].reverse().map(e => (
                    <tr key={e.id} className="border-b border-card-border/50 hover:bg-white/3 transition-colors">
                      <td className="px-4 py-3">{fmt(e.date)}</td>
                      <td className="px-4 py-3 font-semibold">{e.vehicle}</td>
                      <td className="px-4 py-3"><span className="bg-blue-400/10 text-blue-400 text-xs px-2 py-0.5 rounded-full">{e.type}</span></td>
                      <td className="px-4 py-3 text-muted">{e.vendor || '—'}</td>
                      <td className="px-4 py-3 text-right font-bold text-blue-400">₹{e.cost.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 text-right"><button onClick={() => handleDeleteClick(e.id)} className="text-red-400 hover:text-red-300 transition-colors cursor-pointer"><Trash2 size={14} /></button></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-card-border bg-blue-400/5">
                    <td colSpan={4} className="px-4 py-3 text-sm font-bold text-right">Total:</td>
                    <td className="px-4 py-3 text-right font-black text-blue-400">₹{maintEntries.reduce((s, e) => s + e.cost, 0).toLocaleString('en-IN')}</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </>
      )}
      {/* ── Confirm Delete Modal ── */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={handleConfirmDelete}
        title="Delete Maintenance Entry?"
        message="Are you sure you want to delete this maintenance record? This service detail will be permanently removed."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}
