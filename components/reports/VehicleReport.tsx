'use client';

import { Car, Award } from 'lucide-react';

interface VehicleReportProps {
  topCabs: [string, { bookings: number; revenue: number; completed: number; cancelled: number }][];
  maxCabRevenue: number;
}

export default function VehicleReport({ topCabs, maxCabRevenue }: VehicleReportProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2"><Car size={20} className="text-teal-400" />Vehicle Utilization Report</h2>
        <p className="text-sm text-muted">Per-cab booking count, revenue, completion, and cancellation rate</p>
      </div>

      {topCabs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted">
          <Car size={40} className="mx-auto mb-3 opacity-30" />
          <p>No booking data yet</p>
        </div>
      ) : (
        <>
          <div className="rounded-2xl border border-card-border bg-card p-6 space-y-4">
            <h3 className="text-sm font-bold flex items-center gap-2"><Award size={15} className="text-teal-400" />Top Cabs by Revenue</h3>
            {topCabs.map(([name, data], idx) => {
              const pct = Math.round((data.revenue / maxCabRevenue) * 100);
              const medals = ['🥇', '🥈', '🥉'];
              const utilRate = data.bookings ? Math.round((data.completed / data.bookings) * 100) : 0;
              return (
                <div key={name} className="flex items-center gap-4">
                  <div className="w-8 text-center text-base shrink-0">{medals[idx] ?? `#${idx + 1}`}</div>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span>{name}</span>
                      <span className="text-muted">{data.bookings} trips · {utilRate}% completion</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-teal-400 to-blue-400 transition-all duration-700" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="text-[10px] text-muted mt-0.5">₹{data.revenue.toLocaleString('en-IN')} · {data.completed} completed · {data.cancelled} cancelled</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="rounded-2xl border border-card-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-card-border bg-teal-400/5">
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-muted uppercase tracking-wider">Vehicle</th>
                  <th className="text-right px-4 py-3 text-[11px] font-bold text-muted uppercase tracking-wider">Total Trips</th>
                  <th className="text-right px-4 py-3 text-[11px] font-bold text-muted uppercase tracking-wider">Completed</th>
                  <th className="text-right px-4 py-3 text-[11px] font-bold text-muted uppercase tracking-wider">Cancelled</th>
                  <th className="text-right px-4 py-3 text-[11px] font-bold text-muted uppercase tracking-wider">Revenue</th>
                  <th className="text-right px-4 py-3 text-[11px] font-bold text-muted uppercase tracking-wider">Util %</th>
                </tr>
              </thead>
              <tbody>
                {topCabs.map(([name, data]) => (
                  <tr key={name} className="border-b border-card-border/50 hover:bg-white/3 transition-colors">
                    <td className="px-4 py-3 font-semibold">{name}</td>
                    <td className="px-4 py-3 text-right">{data.bookings}</td>
                    <td className="px-4 py-3 text-right text-blue-400 font-semibold">{data.completed}</td>
                    <td className="px-4 py-3 text-right text-red-400 font-semibold">{data.cancelled}</td>
                    <td className="px-4 py-3 text-right text-green-400 font-semibold">₹{data.revenue.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-right font-bold">{data.bookings ? Math.round((data.completed / data.bookings) * 100) : 0}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
