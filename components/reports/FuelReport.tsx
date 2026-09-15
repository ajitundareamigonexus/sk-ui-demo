'use client';

import { useEffect, useState } from 'react';
import { Fuel, Plus, Trash2, Loader2 } from 'lucide-react';
import ConfirmModal from '@/components/ConfirmModal';
import { getFuelEntries, addFuelEntry, deleteFuelEntry } from '@/services/api';

function fmt(dateStr: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

interface FuelEntry {
  id: number;
  date: string;
  vehicle: string;
  litres: number;
  rate: number;
  amount: number;
  driver: string;
}

export default function FuelReport() {
  const [fuelEntries, setFuelEntries] = useState<FuelEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [fuelForm, setFuelForm] = useState({ date: '', vehicle: '', litres: 0, rate: 0, driver: '' });
  const [showFuelForm, setShowFuelForm] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: number | null }>({ isOpen: false, id: null });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    getFuelEntries()
      .then(data => {
        setFuelEntries(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch fuel entries:", err);
        setLoading(false);
      });
  }, []);

  const saveFuelEntry = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const amount = +(fuelForm.litres * fuelForm.rate).toFixed(2);
    const entry = { ...fuelForm, amount };
    addFuelEntry(entry)
      .then(savedEntry => {
        setFuelEntries(prev => [...prev, savedEntry]);
        setFuelForm({ date: '', vehicle: '', litres: 0, rate: 0, driver: '' });
        setShowFuelForm(false);
        setSubmitting(false);
      })
      .catch(err => {
        console.error("Failed to save fuel entry:", err);
        setSubmitting(false);
      });
  };

  const handleDeleteClick = (id: number) => {
    setDeleteModal({ isOpen: true, id });
  };

  const handleConfirmDelete = () => {
    if (deleteModal.id === null) return;
    deleteFuelEntry(deleteModal.id)
      .then(() => {
        setFuelEntries(prev => prev.filter(e => e.id !== deleteModal.id));
        setDeleteModal({ isOpen: false, id: null });
      })
      .catch(err => {
        console.error("Failed to delete fuel entry:", err);
        setDeleteModal({ isOpen: false, id: null });
      });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2"><Fuel size={20} className="text-orange-400" />Fuel Expense Report</h2>
          <p className="text-sm text-muted">Track vehicle fuel consumption and expenses</p>
        </div>
        <button
          onClick={() => setShowFuelForm(v => !v)}
          className="flex items-center gap-2 bg-orange-400/10 border border-orange-400/20 text-orange-400 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-orange-400 hover:text-black transition-all shrink-0 cursor-pointer"
        >
          <Plus size={14} /> Add Entry
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted">
          <Loader2 className="animate-spin text-orange-400 mb-3" size={32} />
          <p className="text-sm">Loading fuel records...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total Expense', value: `₹${fuelEntries.reduce((s, e) => s + e.amount, 0).toLocaleString('en-IN')}`, color: 'text-orange-400' },
              { label: 'Total Litres', value: `${fuelEntries.reduce((s, e) => s + e.litres, 0).toFixed(1)} L`, color: 'text-yellow-400' },
              { label: 'Total Entries', value: fuelEntries.length, color: 'text-teal-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-2xl border border-card-border bg-card p-5">
                <div className={`text-2xl font-black ${color}`}>{value}</div>
                <div className="text-xs text-muted mt-1">{label}</div>
              </div>
            ))}
          </div>

          {showFuelForm && (
            <form onSubmit={saveFuelEntry} className="rounded-2xl border border-orange-400/20 bg-orange-400/5 p-6 space-y-4">
              <h3 className="text-sm font-bold text-orange-400">New Fuel Entry</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-muted uppercase tracking-wider block mb-1">Date</label>
                  <input required type="date" value={fuelForm.date} onChange={e => setFuelForm({ ...fuelForm, date: e.target.value })} className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-muted uppercase tracking-wider block mb-1">Vehicle</label>
                  <input required value={fuelForm.vehicle} onChange={e => setFuelForm({ ...fuelForm, vehicle: e.target.value })} placeholder="e.g. Swift DZire" className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-muted uppercase tracking-wider block mb-1">Driver</label>
                  <input value={fuelForm.driver} onChange={e => setFuelForm({ ...fuelForm, driver: e.target.value })} placeholder="Driver name" className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-muted uppercase tracking-wider block mb-1">Litres</label>
                  <input required type="number" step="0.1" value={fuelForm.litres || ''} onChange={e => setFuelForm({ ...fuelForm, litres: parseFloat(e.target.value) || 0 })} className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-muted uppercase tracking-wider block mb-1">Rate (₹/L)</label>
                  <input required type="number" step="0.01" value={fuelForm.rate || ''} onChange={e => setFuelForm({ ...fuelForm, rate: parseFloat(e.target.value) || 0 })} className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400" />
                </div>
                <div className="flex items-end">
                  <div className="bg-orange-400/10 rounded-xl px-4 py-2 text-sm font-bold text-orange-400 w-full text-center">₹{((fuelForm.litres || 0) * (fuelForm.rate || 0)).toFixed(2)}</div>
                </div>
              </div>
              <div className="flex gap-3"><button type="submit" className="px-5 py-2 bg-orange-400 text-black rounded-xl text-sm font-bold cursor-pointer">Save Entry</button><button type="button" onClick={() => setShowFuelForm(false)} className="px-5 py-2 border border-border rounded-xl text-sm font-semibold cursor-pointer">Cancel</button></div>
            </form>
          )}

          {fuelEntries.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted">
              <Fuel size={40} className="mx-auto mb-3 opacity-30" />
              <p>No fuel entries yet. Add your first entry above.</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-card-border bg-card overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-card-border bg-orange-400/5">
                    <th className="text-left px-4 py-3 text-[11px] font-bold text-muted uppercase tracking-wider">Date</th>
                    <th className="text-left px-4 py-3 text-[11px] font-bold text-muted uppercase tracking-wider">Vehicle</th>
                    <th className="text-left px-4 py-3 text-[11px] font-bold text-muted uppercase tracking-wider">Driver</th>
                    <th className="text-right px-4 py-3 text-[11px] font-bold text-muted uppercase tracking-wider">Litres</th>
                    <th className="text-right px-4 py-3 text-[11px] font-bold text-muted uppercase tracking-wider">Rate</th>
                    <th className="text-right px-4 py-3 text-[11px] font-bold text-muted uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {[...fuelEntries].reverse().map(e => (
                    <tr key={e.id} className="border-b border-card-border/50 hover:bg-white/3 transition-colors">
                      <td className="px-4 py-3">{fmt(e.date)}</td>
                      <td className="px-4 py-3 font-semibold">{e.vehicle}</td>
                      <td className="px-4 py-3 text-muted">{e.driver || '—'}</td>
                      <td className="px-4 py-3 text-right">{e.litres} L</td>
                      <td className="px-4 py-3 text-right">₹{e.rate}/L</td>
                      <td className="px-4 py-3 text-right font-bold text-orange-400">₹{e.amount.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 text-right"><button onClick={() => handleDeleteClick(e.id)} className="text-red-400 hover:text-red-300 transition-colors cursor-pointer"><Trash2 size={14} /></button></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-card-border bg-orange-400/5">
                    <td colSpan={5} className="px-4 py-3 text-sm font-bold text-right">Total:</td>
                    <td className="px-4 py-3 text-right font-black text-orange-400">₹{fuelEntries.reduce((s, e) => s + e.amount, 0).toLocaleString('en-IN')}</td>
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
        title="Delete Fuel Entry?"
        message="Are you sure you want to delete this fuel record? This expense detail will be permanently removed."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}
