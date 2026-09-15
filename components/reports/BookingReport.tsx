'use client';

import type { Booking } from '@/lib/types';
import { useMemo, useState } from 'react';

interface BookingReportProps {
  bookings: Booking[];
  totalCompleted: number;
}

export default function BookingReport({ bookings, totalCompleted }: BookingReportProps) {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const bookingDate = new Date(
        booking.createdAt || booking.searchQuery.date
      );
      if (fromDate) {
        const from = new Date(fromDate);

        if (bookingDate < from) {
          return false;
        }
      }
      if (toDate) {
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999);

        if (bookingDate > to) {
          return false;
        }
      }
      return true;
    });
  }, [bookings, fromDate, toDate]);

  const totalRevenue = filteredBookings.reduce(
    (sum, booking) => sum + booking.totalFare,
    0
  );

  const averageFare = filteredBookings.length
    ? Math.round(totalRevenue / filteredBookings.length)
    : 0;

  const exportToCsv = () => {
    const headers = [
      'Booking ID',
      'From',
      'To',
      'Date',
      'Time',
      'Vehicle',
      'Base Fare',
      'GST',
      'Total Fare',
      'Payment Option',
      'Status',
      'Created At',
    ];

    const rows = filteredBookings.map(booking => [
      booking.id,
      booking.searchQuery.from,
      booking.searchQuery.to,
      booking.searchQuery.date,
      booking.searchQuery.time,
      booking.selectedCab.carName,
      booking.baseFare.toString(),
      booking.gst.toString(),
      booking.totalFare.toString(),
      booking.paymentOption,
      booking.status,
      booking.createdAt,
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'completed-bookings-report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs text-muted mb-1">
            From Date
          </label>

          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="h-10 rounded-xl border border-border bg-background px-3 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs text-muted mb-1">
            To Date
          </label>

          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="h-10 rounded-xl border border-border bg-background px-3 text-sm"
          />
        </div>

        <button
          onClick={() => {
            setFromDate('');
            setToDate('');
          }}
          className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-2 text-sm font-semibold text-red-400"
        >
          Clear
        </button>

        <button
          onClick={exportToCsv}
          className="rounded-2xl border border-blue-400/20 bg-blue-400/10 px-4 py-2 text-sm font-semibold text-blue-500 hover:bg-blue-400/20 transition-colors"
        >
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Completed Bookings', value: filteredBookings.length, color: 'text-teal-400', bg: 'bg-teal-400/10 border-teal-400/20' },
          { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/20' },
          { label: 'Average Fare', value: `₹${averageFare.toLocaleString('en-IN')}`, color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/20' },
          { label: 'Unique Routes', value: new Set(filteredBookings.map(b => `${b.searchQuery.from}|${b.searchQuery.to}`)).size, color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`rounded-2xl border ${bg} p-5`}>
            <div className={`text-3xl font-black ${color}`}>{value}</div>
            <div className="text-xs font-semibold text-foreground mt-1">{label}</div>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-card-border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-card-border bg-blue-400/5">
              <th className="text-left px-4 py-3 text-[11px] font-bold text-muted uppercase tracking-wider">Booking ID</th>
              <th className="text-left px-4 py-3 text-[11px] font-bold text-muted uppercase tracking-wider">Route</th>
              <th className="text-left px-4 py-3 text-[11px] font-bold text-muted uppercase tracking-wider">Date</th>
              <th className="text-left px-4 py-3 text-[11px] font-bold text-muted uppercase tracking-wider">Vehicle</th>
              <th className="text-right px-4 py-3 text-[11px] font-bold text-muted uppercase tracking-wider">Amount</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="text-center py-10 text-muted"
                >
                  No bookings found for selected date range
                </td>
              </tr>
            )}
            {filteredBookings.map(booking => (
              <tr key={booking.id} className="border-b border-card-border/50 hover:bg-white/3 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-teal-400">{booking.id}</td>
                <td className="px-4 py-3">{booking.searchQuery.from} → {booking.searchQuery.to}</td>
                <td className="px-4 py-3">{new Date(booking.searchQuery.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                <td className="px-4 py-3 font-semibold">{booking.selectedCab.carName}</td>
                <td className="px-4 py-3 text-right font-bold text-blue-400">₹{booking.totalFare.toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}