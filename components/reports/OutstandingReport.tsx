'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import type { Booking } from '@/lib/types';

function fmt(dateStr: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

interface OutstandingEntry {
  id: number;
  bookingId: string;
  customer: string;
  amount: number;
  due: string;
  status: 'pending' | 'received';
}

interface OutstandingReportProps {
  bookings: Booking[];
}

export default function OutstandingReport({ bookings }: OutstandingReportProps) {
  const [outstandingEntries, setOutstandingEntries] = useState<OutstandingEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem('sk_outstanding_entries') || '[]');
      const formatted = data.map((entry: any) => ({
        ...entry,
        status: (entry.status === 'received' ? 'received' : 'pending') as 'pending' | 'received',
      }));

      // Automatically sync any new bookings that aren't already tracked
      const existing = new Set(formatted.map((o: any) => o.bookingId));
      const newEntries = bookings
        .filter(b => b.paymentOption === 'zero' && b.status !== 'cancelled' && !existing.has(b.id))
        .map(b => ({
          id: Date.now() + Math.random(),
          bookingId: b.id,
          customer: b.contact.fullName,
          amount: b.totalFare,
          due: b.searchQuery.date,
          status: 'pending' as const,
        }));

      if (newEntries.length > 0) {
        const updated = [...formatted, ...newEntries];
        localStorage.setItem('sk_outstanding_entries', JSON.stringify(updated));
        setOutstandingEntries(updated);
      } else {
        setOutstandingEntries(formatted);
      }
    } catch (e) {
      console.error('Failed to load/sync outstanding entries', e);
    } finally {
      setIsLoaded(true);
    }
  }, [bookings]);

  const toggleOutstanding = (id: number) => {
    const updated = outstandingEntries.map((entry): OutstandingEntry => entry.id === id ? { ...entry, status: entry.status === 'pending' ? 'received' : 'pending' } : entry);
    setOutstandingEntries(updated);
    localStorage.setItem('sk_outstanding_entries', JSON.stringify(updated));
  };

  const syncOutstanding = () => {
    const existing = new Set(outstandingEntries.map(o => o.bookingId));
    const newEntries = bookings
      .filter(b => b.paymentOption === 'zero' && b.status !== 'cancelled' && !existing.has(b.id))
      .map(b => ({
        id: Date.now() + Math.random(),
        bookingId: b.id,
        customer: b.contact.fullName,
        amount: b.totalFare,
        due: b.searchQuery.date,
        status: 'pending' as const,
      }));
    if (newEntries.length === 0) {
      toast.info('No new outstanding entries to sync.');
      return;
    }
    const updated = [...outstandingEntries, ...newEntries];
    setOutstandingEntries(updated);
    localStorage.setItem('sk_outstanding_entries', JSON.stringify(updated));
    toast.success('Synced successfully!');
  };

  const pendingAmount = outstandingEntries.filter(e => e.status === 'pending').reduce((sum, e) => sum + e.amount, 0);
  const receivedAmount = outstandingEntries.filter(e => e.status === 'received').reduce((sum, e) => sum + e.amount, 0);
  const pendingCount = outstandingEntries.filter(e => e.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2"><AlertCircle size={20} className="text-red-400" />Outstanding Payment Report</h2>
          <p className="text-sm text-muted">Track pending pay-at-drop collections and payment status</p>
        </div>
        <button
          onClick={syncOutstanding}
          className="flex items-center gap-2 bg-teal-400/10 border border-teal-400/20 text-teal-400 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-teal-400 hover:text-black transition-all shrink-0 cursor-pointer"
        >
          <RefreshCw size={14} /> Sync from Bookings
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Outstanding', value: `₹${pendingAmount.toLocaleString('en-IN')}`, color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/20' },
          { label: 'Pending Count', value: pendingCount, color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20' },
          { label: 'Received', value: `₹${receivedAmount.toLocaleString('en-IN')}`, color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/20' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`rounded-2xl border ${bg} p-5`}>
            <div className={`text-2xl font-black ${color}`}>{value}</div>
            <div className="text-xs text-muted mt-1">{label}</div>
          </div>
        ))}
      </div>

      {!isLoaded ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted animate-pulse">
          <RefreshCw size={32} className="mx-auto mb-3 opacity-40 animate-spin" />
          <p className="text-sm">Loading outstanding records...</p>
        </div>
      ) : outstandingEntries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted">
          <AlertCircle size={40} className="mx-auto mb-3 opacity-30" />
          <p className="mb-2">No outstanding records yet.</p>
          <p className="text-xs">Click "Sync from Bookings" to import pay-at-drop bookings.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-card-border bg-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-card-border bg-red-400/5">
                <th className="text-left px-4 py-3 text-[11px] font-bold text-muted uppercase tracking-wider">Booking ID</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold text-muted uppercase tracking-wider">Customer</th>
                <th className="text-right px-4 py-3 text-[11px] font-bold text-muted uppercase tracking-wider">Amount</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold text-muted uppercase tracking-wider">Due Date</th>
                <th className="text-center px-4 py-3 text-[11px] font-bold text-muted uppercase tracking-wider">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {outstandingEntries.map(entry => (
                <tr key={entry.id} className={`border-b border-card-border/50 transition-colors hover:bg-white/3 ${entry.status === 'received' ? 'opacity-60' : ''}`}>
                  <td className="px-4 py-3 font-mono text-xs text-teal-400">{entry.bookingId}</td>
                  <td className="px-4 py-3 font-semibold">{entry.customer}</td>
                  <td className="px-4 py-3 text-right font-bold text-red-400">₹{entry.amount.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3">{fmt(entry.due)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${entry.status === 'pending' ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' : 'text-green-400 bg-green-400/10 border-green-400/20'}`}>
                      {entry.status === 'pending' ? '⏳ Pending' : '✅ Received'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => toggleOutstanding(entry.id)} className="text-xs font-semibold px-3 py-1 rounded-lg bg-white/5 border border-border hover:bg-teal-400/10 hover:text-teal-400 hover:border-teal-400/20 transition-all cursor-pointer">
                      {entry.status === 'pending' ? 'Mark Received' : 'Mark Pending'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
