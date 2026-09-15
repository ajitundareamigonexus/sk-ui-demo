'use client';

import { FileText, Download } from 'lucide-react';
import type { Booking } from '@/lib/types';

interface GstReportProps {
  bookings: Booking[];
}

function csvEscape(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

export default function GstReport({ bookings }: GstReportProps) {
  const totalBaseFare = bookings.reduce((sum, booking) => sum + booking.baseFare, 0);
  const totalGST = bookings.reduce((sum, booking) => sum + booking.gst, 0);
  const totalFare = bookings.reduce((sum, booking) => sum + booking.totalFare, 0);
  const averageGST = bookings.length ? totalGST / bookings.length : 0;

  const exportToCsv = () => {
    const headers = ['Booking ID', 'Route', 'Date', 'Vehicle', 'Base Fare', 'GST', 'Total Fare', 'Payment Option', 'Status'];
    const rows = bookings.map(booking => [
      booking.id,
      `${booking.searchQuery.from} → ${booking.searchQuery.to}`,
      booking.searchQuery.date,
      booking.selectedCab.carName,
      booking.baseFare.toString(),
      booking.gst.toString(),
      booking.totalFare.toString(),
      booking.paymentOption,
      booking.status,
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(value => csvEscape(String(value))).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'gst-report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2"><FileText size={20} className="text-slate-700" />GST Report</h2>
          <p className="text-sm text-muted">GST collection summary for completed bookings</p>
        </div>
        <button
          onClick={exportToCsv}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-200 transition"
        >
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total GST', value: `₹${totalGST.toLocaleString('en-IN')}`, color: 'text-emerald-600', bg: 'bg-emerald-500/10 border-emerald-500/20' },
          { label: 'Taxable Base Fare', value: `₹${totalBaseFare.toLocaleString('en-IN')}`, color: 'text-slate-700', bg: 'bg-slate-400/10 border-slate-400/20' },
          { label: 'Total Fare', value: `₹${totalFare.toLocaleString('en-IN')}`, color: 'text-blue-600', bg: 'bg-blue-500/10 border-blue-500/20' },
          { label: 'Avg GST / Booking', value: `₹${Math.round(averageGST).toLocaleString('en-IN')}`, color: 'text-violet-600', bg: 'bg-violet-500/10 border-violet-500/20' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`rounded-2xl border ${bg} p-5`}>
            <div className={`text-2xl font-black ${color}`}>{value}</div>
            <div className="text-xs text-muted mt-1">{label}</div>
          </div>
        ))}
      </div>

      {bookings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted">
          <p>No completed bookings available for GST reporting.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-card-border bg-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-card-border bg-slate-200/70">
                <th className="text-left px-4 py-3 text-[11px] font-bold text-muted uppercase tracking-wider">Booking ID</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold text-muted uppercase tracking-wider">Route</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold text-muted uppercase tracking-wider">Date</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold text-muted uppercase tracking-wider">Vehicle</th>
                <th className="text-right px-4 py-3 text-[11px] font-bold text-muted uppercase tracking-wider">Base Fare</th>
                <th className="text-right px-4 py-3 text-[11px] font-bold text-muted uppercase tracking-wider">GST</th>
                <th className="text-right px-4 py-3 text-[11px] font-bold text-muted uppercase tracking-wider">Total Fare</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(booking => (
                <tr key={booking.id} className="border-b border-card-border/50 hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-teal-400">{booking.id}</td>
                  <td className="px-4 py-3">{booking.searchQuery.from} → {booking.searchQuery.to}</td>
                  <td className="px-4 py-3">{booking.searchQuery.date}</td>
                  <td className="px-4 py-3 font-semibold">{booking.selectedCab.carName}</td>
                  <td className="px-4 py-3 text-right">₹{booking.baseFare.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-right text-blue-500">₹{booking.gst.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-right font-bold text-teal-600">₹{booking.totalFare.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
