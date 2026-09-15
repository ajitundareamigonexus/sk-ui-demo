'use client';

import { useState, useMemo } from 'react';
import { IndianRupee, TrendingUp, PieChart, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Booking } from '@/lib/types';

interface RevenueReportProps {
  stats: {
    total: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    revenue: number;
  };
  reportsData: {
    totalBaseFare: number;
    totalGST: number;
    onlineRevenue: number;
    dropRevenue: number;
    paid: number;
    payAtDrop: number;
    monthlyData: Record<string, { bookings: number; revenue: number }>;
    maxMonthlyRevenue: number;
  };
  bookings?: Booking[];
}

export default function RevenueReport({ stats, reportsData, bookings = [] }: RevenueReportProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Get month-specific stats
  const monthStats = useMemo(() => {
    if (!bookings.length) return stats;

    const targetMonth = selectedDate.getMonth();
    const targetYear = selectedDate.getFullYear();

    const monthBookings = bookings.filter(b => {
      const d = new Date(b.createdAt);
      return d.getMonth() === targetMonth && d.getFullYear() === targetYear;
    });

    const total = monthBookings.length;
    const confirmed = monthBookings.filter(b => b.status === 'confirmed').length;
    const completed = monthBookings.filter(b => b.status === 'completed').length;
    const cancelled = monthBookings.filter(b => b.status === 'cancelled').length;
    const revenue = monthBookings
      .filter(b => b.status !== 'cancelled')
      .reduce((s, b) => s + b.totalFare, 0);

    return { total, confirmed, completed, cancelled, revenue };
  }, [bookings, selectedDate]);

  // Get month-specific breakdown
  const monthlyBreakdown = useMemo(() => {
    if (!bookings.length) return reportsData;

    const targetMonth = selectedDate.getMonth();
    const targetYear = selectedDate.getFullYear();

    const monthBookings = bookings.filter(b => {
      const d = new Date(b.createdAt);
      return d.getMonth() === targetMonth && d.getFullYear() === targetYear;
    });

    const totalBaseFare = monthBookings.filter(b => b.status !== 'cancelled').reduce((s, b) => s + b.baseFare, 0);
    const totalGST = monthBookings.filter(b => b.status !== 'cancelled').reduce((s, b) => s + b.gst, 0);
    const paid = monthBookings.filter(b => b.paymentOption === 'full').length;
    const payAtDrop = monthBookings.filter(b => b.paymentOption === 'zero').length;
    const onlineRevenue = monthBookings.filter(b => b.paymentOption === 'full' && b.status !== 'cancelled').reduce((s, b) => s + b.totalFare, 0);
    const dropRevenue = monthBookings.filter(b => b.paymentOption === 'zero' && b.status !== 'cancelled').reduce((s, b) => s + b.totalFare, 0);

    return {
      totalBaseFare,
      totalGST,
      onlineRevenue,
      dropRevenue,
      paid,
      payAtDrop,
      monthlyData: reportsData.monthlyData,
      maxMonthlyRevenue: reportsData.maxMonthlyRevenue,
    };
  }, [bookings, selectedDate, reportsData]);

  const isCurrentMonth = () => {
    const now = new Date();
    return selectedDate.getMonth() === now.getMonth() && selectedDate.getFullYear() === now.getFullYear();
  };

  const handlePrevMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1));
  };

  const handleTodayClick = () => {
    setSelectedDate(new Date());
  };

  const monthYearStr = selectedDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  const displayStats = bookings.length ? monthStats : stats;
  const displayData = bookings.length ? monthlyBreakdown : reportsData;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold flex items-center gap-2"><IndianRupee size={20} className="text-green-400" />Revenue Report</h2>
        </div>
        <p className="text-sm text-muted">Complete revenue breakdown including GST, base fare, and payment modes</p>
      </div>

      {/* Month Selector */}
      {bookings.length > 0 && (
        <div className="rounded-2xl border border-card-border bg-card/50 p-4 flex items-center justify-between gap-4">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-lg border border-border hover:bg-background transition-colors cursor-pointer"
            title="Previous month"
          >
            <ChevronLeft size={18} className="text-teal-400" />
          </button>
          
          <div className="flex-1 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Calendar size={16} className="text-teal-400" />
              <span className="text-sm font-bold">{monthYearStr}</span>
              {isCurrentMonth() && (
                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-400/10 text-green-400 border border-green-400/20">
                  Current
                </span>
              )}
            </div>
            {!isCurrentMonth() && (
              <button
                onClick={handleTodayClick}
                className="text-xs text-teal-400 hover:text-teal-300 font-semibold cursor-pointer"
              >
                Back to Today
              </button>
            )}
          </div>

          <button
            onClick={handleNextMonth}
            className="p-2 rounded-lg border border-border hover:bg-background transition-colors cursor-pointer"
            title="Next month"
          >
            <ChevronRight size={18} className="text-teal-400" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Revenue', value: `₹${displayStats.revenue.toLocaleString('en-IN')}`, sub: 'incl. GST', color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/20' },
          { label: 'Base Fare Total', value: `₹${displayData.totalBaseFare.toLocaleString('en-IN')}`, sub: 'before GST', color: 'text-teal-400', bg: 'bg-teal-400/10 border-teal-400/20' },
          { label: 'GST Collected', value: `₹${displayData.totalGST.toLocaleString('en-IN')}`, sub: '5% on base fare', color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/20' },
          { label: 'Online Revenue', value: `₹${displayData.onlineRevenue.toLocaleString('en-IN')}`, sub: `${displayData.paid} bookings`, color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/20' },
          { label: 'Pay-at-Drop Rev.', value: `₹${displayData.dropRevenue.toLocaleString('en-IN')}`, sub: `${displayData.payAtDrop} bookings`, color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20' },
          { label: 'Avg per Trip', value: displayStats.total ? `₹${Math.round(displayStats.revenue / (displayStats.completed + displayStats.confirmed || 1)).toLocaleString('en-IN')}` : '₹0', sub: 'active trips', color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/20' },
        ].map(({ label, value, sub, color, bg }) => (
          <div key={label} className={`rounded-2xl border ${bg} p-5`}>
            <div className={`text-2xl font-black ${color}`}>{value}</div>
            <div className="text-xs font-semibold text-foreground mt-1">{label}</div>
            <div className="text-[11px] text-muted">{sub}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-card-border bg-card p-6">
        <h3 className="text-sm font-bold mb-4 flex items-center gap-2"><TrendingUp size={15} className="text-teal-400" />Monthly Revenue (Last 6 Months)</h3>
        <div className="flex items-end gap-3 h-36">
          {Object.entries(displayData.monthlyData).map(([month, data]) => (
            <div key={month} className="flex-1 flex flex-col items-center gap-1">
              <div className="text-[9px] text-green-400 font-bold">{data.revenue > 0 ? `₹${(data.revenue / 1000).toFixed(0)}k` : ''}</div>
              <div
                className="w-full rounded-t-lg bg-gradient-to-t from-green-500 to-green-400/60 min-h-[4px] relative group transition-all duration-500"
                style={{ height: `${Math.max((data.revenue / displayData.maxMonthlyRevenue) * 120, 4)}px` }}
              >
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-card border border-card-border text-[10px] px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg z-10">
                  ₹{data.revenue.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="text-[9px] text-muted">{month}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-card-border bg-card p-6">
        <h3 className="text-sm font-bold mb-4 flex items-center gap-2"><PieChart size={15} className="text-teal-400" />Payment Mode Breakdown</h3>
        {displayStats.total === 0 ? <p className="text-muted text-sm text-center py-4">No data</p> : (
          <div className="space-y-3">
            {[
              { label: '💳 Paid Online', count: displayData.paid, rev: displayData.onlineRevenue, color: 'bg-green-400' },
              { label: '💵 Pay at Drop', count: displayData.payAtDrop, rev: displayData.dropRevenue, color: 'bg-yellow-400' },
            ].map(({ label, count, rev, color }) => {
              const pct = displayStats.total ? Math.round((count / displayStats.total) * 100) : 0;
              return (
                <div key={label}>
                  <div className="flex justify-between text-xs font-semibold mb-1"><span>{label}</span><span className="text-muted">{count} trips · ₹{rev.toLocaleString('en-IN')} · {pct}%</span></div>
                  <div className="h-2.5 rounded-full bg-white/5 overflow-hidden"><div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${pct}%` }} /></div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
