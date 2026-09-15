'use client';

import { Route as RouteIcon, BarChart3 } from 'lucide-react';

interface RouteReportProps {
  topRoutes: [string, { trips: number; revenue: number; baseFare: number; gst: number }][];
}

export default function RouteReport({ topRoutes }: RouteReportProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2"><RouteIcon size={20} className="text-purple-400" />Route Wise Profit Report</h2>
        <p className="text-sm text-muted">Revenue and profit breakdown per route (non-cancelled bookings)</p>
      </div>

      {topRoutes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted">
          <RouteIcon size={40} className="mx-auto mb-3 opacity-30" />
          <p>No route data yet</p>
        </div>
      ) : (
        <>
          <div className="rounded-2xl border border-card-border bg-card p-6 space-y-4">
            <h3 className="text-sm font-bold mb-2 flex items-center gap-2"><BarChart3 size={15} className="text-purple-400" />Top Routes by Revenue</h3>
            {topRoutes.map(([route, data], idx) => {
              const maxRevenue = topRoutes[0]?.[1].revenue || 1;
              const pct = Math.round((data.revenue / maxRevenue) * 100);
              return (
                <div key={route}>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-foreground flex items-center gap-1.5"><span className="text-muted text-[10px]">#{idx + 1}</span>{route}</span>
                    <span className="text-muted">{data.trips} trips · ₹{data.revenue.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-purple-400 to-pink-400 transition-all duration-700" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="text-[10px] text-muted mt-0.5">Base: ₹{data.baseFare.toLocaleString('en-IN')} · GST: ₹{data.gst.toLocaleString('en-IN')}</div>
                </div>
              );
            })}
          </div>

          <div className="rounded-2xl border border-card-border bg-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-card-border bg-purple-400/5">
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-muted uppercase tracking-wider">Route</th>
                  <th className="text-right px-4 py-3 text-[11px] font-bold text-muted uppercase tracking-wider">Trips</th>
                  <th className="text-right px-4 py-3 text-[11px] font-bold text-muted uppercase tracking-wider">Base Fare</th>
                  <th className="text-right px-4 py-3 text-[11px] font-bold text-muted uppercase tracking-wider">GST</th>
                  <th className="text-right px-4 py-3 text-[11px] font-bold text-muted uppercase tracking-wider">Total Revenue</th>
                  <th className="text-right px-4 py-3 text-[11px] font-bold text-muted uppercase tracking-wider">Avg / Trip</th>
                </tr>
              </thead>
              <tbody>
                {topRoutes.map(([route, data]) => (
                  <tr key={route} className="border-b border-card-border/50 hover:bg-white/3 transition-colors">
                    <td className="px-4 py-3 font-semibold text-xs">{route}</td>
                    <td className="px-4 py-3 text-right">{data.trips}</td>
                    <td className="px-4 py-3 text-right">₹{data.baseFare.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-right text-blue-400">₹{data.gst.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-right text-green-400 font-bold">₹{data.revenue.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-right text-muted">₹{Math.round(data.revenue / data.trips).toLocaleString('en-IN')}</td>
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
