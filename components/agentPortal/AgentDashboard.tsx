'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard, BookOpen, Car, Search, LogOut, Building2,
  TrendingUp, IndianRupee, Clock, CheckCircle2, XCircle, AlertCircle,
  ArrowRight, CalendarDays, Phone, Mail, X, Eye, Ban, RefreshCw,
  ChevronRight, Wallet, UserCheck,
} from 'lucide-react';
import { getAgentContext } from '@/lib/agentStore';
import { getMyAgentBookings, cancelAgentBooking } from '@/services/api';
import { logout } from '@/lib/authStore';
import { toast } from 'sonner';

// ─── Mock agent bookings ──────────────────────────────────────────────────────
const MOCK_MY_BOOKINGS = [
  {
    id: 'SK-AGT001-0001', customer: 'Priya Patel', mobile: '9823401234', email: 'priya@example.com',
    from: 'Pune', to: 'Mumbai', date: '2026-08-10', time: '09:00', tripType: 'oneway',
    cabType: 'Sedan', costPrice: 3520, markup: 480, sellingPrice: 4000,
    status: 'completed', amountPaid: 4000, amountDue: 0,
    pickupAddress: 'Shivaji Nagar, Pune', dropAddress: 'CST, Mumbai',
    createdAt: '2026-08-05T10:30:00.000Z',
  },
  {
    id: 'SK-AGT001-0002', customer: 'Raj Kumar', mobile: '9912345678', email: 'raj@example.com',
    from: 'Mumbai', to: 'Goa', date: '2026-09-18', time: '07:00', tripType: 'oneway',
    cabType: 'SUV', costPrice: 7040, markup: 960, sellingPrice: 8000,
    status: 'confirmed', amountPaid: 2000, amountDue: 6000,
    pickupAddress: 'Bandra, Mumbai', dropAddress: 'Panaji, Goa',
    createdAt: '2026-08-20T14:00:00.000Z',
  },
  {
    id: 'SK-AGT001-0003', customer: 'Anita Shah', mobile: '9765432109', email: 'anita@example.com',
    from: 'Pune', to: 'Nashik', date: '2026-09-22', time: '08:30', tripType: 'round',
    cabType: 'Innova', costPrice: 4400, markup: 600, sellingPrice: 5000,
    status: 'driver_assigned', amountPaid: 5000, amountDue: 0,
    pickupAddress: 'Kothrud, Pune', dropAddress: 'Nashik Road',
    createdAt: '2026-08-22T09:15:00.000Z',
  },
  {
    id: 'SK-AGT001-0004', customer: 'Vivek Joshi', mobile: '9823401238', email: 'vivek@example.com',
    from: 'Pune', to: 'Shirdi', date: '2026-10-05', time: '06:00', tripType: 'round',
    cabType: 'Sedan', costPrice: 2640, markup: 360, sellingPrice: 3000,
    status: 'confirmed', amountPaid: 0, amountDue: 3000,
    pickupAddress: 'Hadapsar, Pune', dropAddress: 'Shirdi Temple',
    createdAt: '2026-08-28T16:45:00.000Z',
  },
];

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; border: string; icon: any }> = {
  confirmed: { label: 'Confirmed', color: 'text-teal-500', bg: 'bg-teal-500/10', border: 'border-teal-500/20', icon: Clock },
  driver_assigned: { label: 'Driver Assigned', color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: UserCheck },
  completed: { label: 'Completed', color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: XCircle },
};

const TRIP_LABELS: Record<string, string> = {
  oneway: 'One Way', round: 'Round Trip', local: 'Local', airport: 'Airport',
};

function fmt(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
function fmtTime(t: string) {
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

// ─── Booking Detail Drawer ────────────────────────────────────────────────────
function BookingDetailDrawer({ booking, onClose, onCancel }: {
  booking: any;
  onClose: () => void;
  onCancel: (id: string) => void;
}) {
  const cfg = STATUS_CFG[booking.status] || STATUS_CFG.confirmed;
  const canCancel = booking.status === 'confirmed';

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 260 }}
      className="fixed right-0 top-0 h-full w-full max-w-md bg-card border-l border-card-border shadow-2xl z-[110] flex flex-col"
    >
      <div className="p-5 border-b border-card-border bg-teal-500/5 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-foreground flex items-center gap-2">
            <BookOpen size={16} className="text-teal-400" />
            Booking Details
          </h3>
          <p className="text-xs font-mono text-teal-500 mt-0.5">{booking.id}</p>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-full border border-border bg-background flex items-center justify-center text-muted hover:text-foreground transition cursor-pointer">
          <X size={15} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* Status */}
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${cfg.bg} border ${cfg.border}`}>
          <cfg.icon size={14} className={cfg.color} />
          <span className={`text-xs font-bold ${cfg.color}`}>{cfg.label}</span>
        </div>

        {/* Customer */}
        <div className="rounded-xl border border-card-border bg-surface p-4">
          <h4 className="text-[10px] font-bold text-muted uppercase tracking-wider mb-3">Traveller</h4>
          <div className="font-bold text-foreground">{booking.customer}</div>
          <div className="flex items-center gap-1 text-xs text-muted mt-1.5"><Phone size={11} className="text-teal-400" />{booking.mobile}</div>
          <div className="flex items-center gap-1 text-xs text-muted mt-1"><Mail size={11} className="text-teal-400" />{booking.email}</div>
        </div>

        {/* Trip */}
        <div className="rounded-xl border border-card-border bg-surface p-4">
          <h4 className="text-[10px] font-bold text-muted uppercase tracking-wider mb-3">Trip Details</h4>
          <div className="flex items-center gap-2 font-bold text-sm mb-2">
            <span className="text-teal-500">{booking.from}</span>
            <ArrowRight size={14} className="text-muted" />
            <span className="text-teal-500">{booking.to}</span>
          </div>
          <div className="text-xs text-muted space-y-1">
            <div className="flex items-center gap-1.5"><CalendarDays size={11} className="text-teal-400" />{fmt(booking.date)} at {fmtTime(booking.time)}</div>
            <div className="flex items-center gap-1.5"><Car size={11} className="text-teal-400" />{booking.cabType} · {TRIP_LABELS[booking.tripType]}</div>
          </div>
          {booking.pickupAddress && (
            <div className="mt-3 text-xs text-muted space-y-1 border-t border-card-border pt-3">
              <div><span className="font-bold text-foreground">Pickup:</span> {booking.pickupAddress}</div>
              <div><span className="font-bold text-foreground">Drop:</span> {booking.dropAddress}</div>
            </div>
          )}
        </div>

        {/* Commercial */}
        <div className="rounded-xl border border-card-border bg-surface p-4">
          <h4 className="text-[10px] font-bold text-muted uppercase tracking-wider mb-3">Commercial Breakdown</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-muted">
              <span>Agent Cost Price</span>
              <span className="font-semibold text-foreground">₹{booking.costPrice.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-muted">
              <span>Your Markup</span>
              <span className="font-semibold text-teal-500">+₹{booking.markup.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-muted border-t border-card-border pt-2">
              <span className="font-bold text-foreground">Selling Price</span>
              <span className="font-black text-foreground">₹{booking.sellingPrice.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-muted">
              <span>Amount Paid</span>
              <span className="font-semibold text-green-500">₹{booking.amountPaid.toLocaleString('en-IN')}</span>
            </div>
            {booking.amountDue > 0 && (
              <div className="flex justify-between">
                <span className="text-muted">Amount Due</span>
                <span className="font-bold text-amber-400">₹{booking.amountDue.toLocaleString('en-IN')}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {canCancel && (
        <div className="p-5 border-t border-card-border">
          <button
            onClick={() => { onCancel(booking.id); onClose(); }}
            className="w-full h-11 bg-red-500/10 border border-red-500/30 text-red-400 font-bold text-sm rounded-xl hover:bg-red-500/20 transition cursor-pointer flex items-center justify-center gap-2"
          >
            <Ban size={14} /> Cancel Booking
          </button>
        </div>
      )}
    </motion.div>
  );
}

// ─── Main Agent Dashboard ─────────────────────────────────────────────────────
export default function AgentDashboard() {
  const router = useRouter();
  const [agentCtx, setAgentCtx] = useState<ReturnType<typeof getAgentContext>>(null);
  const [bookings, setBookings] = useState(MOCK_MY_BOOKINGS);
  const [statusFilter, setStatusFilter] = useState('all');
  const [detailBooking, setDetailBooking] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const ctx = getAgentContext();
    if (!ctx) {
      router.push('/sign-up');
      return;
    }
    setAgentCtx(ctx);
    // In production: load from API
    // getMyAgentBookings().then(data => setBookings(data || [])).catch(() => {});
  }, [router]);

  const stats = useMemo(() => ({
    total: bookings.length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
    totalRevenue: bookings.reduce((s, b) => s + b.sellingPrice, 0),
    totalMarkup: bookings.reduce((s, b) => s + b.markup, 0),
    totalPaid: bookings.reduce((s, b) => s + b.amountPaid, 0),
    totalDue: bookings.reduce((s, b) => s + b.amountDue, 0),
  }), [bookings]);

  const filtered = useMemo(() =>
    statusFilter === 'all' ? bookings : bookings.filter(b => b.status === statusFilter),
    [bookings, statusFilter]
  );

  const handleCancel = (id: string) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
    toast.success('Booking cancelled', { description: id });
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!agentCtx) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-muted">Loading agent portal…</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-card-border bg-card/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
              <Building2 size={16} className="text-teal-400" />
            </div>
            <div>
              <div className="text-sm font-black text-foreground leading-tight">{agentCtx.agentBusinessName}</div>
              <div className="text-[10px] text-muted font-mono">{agentCtx.agentCode} · Agent Portal</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push('/agent/search')}
              className="flex items-center gap-2 h-9 px-4 bg-teal-500 text-black text-xs font-bold rounded-xl hover:opacity-90 transition cursor-pointer shadow-sm"
            >
              <Search size={13} /> New Booking
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 h-9 px-3 border border-border text-xs text-muted font-semibold rounded-xl hover:text-red-400 hover:border-red-400/40 transition cursor-pointer"
            >
              <LogOut size={13} /> Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* ── Commercial Summary ─────────────────────────────────────────────── */}
        <div className="mb-6">
          <h1 className="text-2xl font-black mb-1">My Dashboard</h1>
          <p className="text-sm text-muted">Overview of your bookings and commercial activity.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Bookings', value: stats.total, color: 'text-teal-500', bg: 'bg-teal-500/10', Icon: BookOpen },
            { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`, color: 'text-green-500', bg: 'bg-green-500/10', Icon: IndianRupee },
            { label: 'Markup Earned', value: `₹${stats.totalMarkup.toLocaleString('en-IN')}`, color: 'text-blue-400', bg: 'bg-blue-500/10', Icon: TrendingUp },
            { label: 'Outstanding', value: `₹${stats.totalDue.toLocaleString('en-IN')}`, color: stats.totalDue > 0 ? 'text-amber-400' : 'text-muted', bg: 'bg-amber-500/10', Icon: Wallet },
          ].map(({ label, value, color, bg, Icon }) => (
            <div key={label} className="rounded-2xl border border-card-border bg-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>
                  <Icon size={14} className={color} />
                </div>
                <span className="text-[10px] text-muted font-bold uppercase tracking-wider">{label}</span>
              </div>
              <div className={`text-xl font-black ${color}`}>{value}</div>
            </div>
          ))}
        </div>

        {/* ── My Pricing Rules ───────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-card-border bg-card p-4 mb-6">
          <h2 className="text-xs font-bold text-muted uppercase tracking-wider mb-3">Your Pricing Rules</h2>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <span className="text-xs text-blue-400 font-bold">Base Discount: {agentCtx.pricingRules.baseDiscountPct}%</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-teal-500/10 border border-teal-500/20">
              <span className="text-xs text-teal-400 font-bold">Max Markup: {agentCtx.pricingRules.maxMarkupPct}%</span>
            </div>
            {Object.entries(agentCtx.pricingRules.tripOverrides).map(([trip, pct]) => (
              <div key={trip} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface border border-border">
                <span className="text-xs text-foreground font-semibold capitalize">{trip}: {pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Bookings Table ─────────────────────────────────────────────────── */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="text-lg font-bold">My Bookings</h2>
            <div className="flex gap-2 flex-wrap">
              {(['all', 'confirmed', 'driver_assigned', 'completed', 'cancelled'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`h-8 px-3 rounded-lg text-xs font-bold border transition cursor-pointer ${statusFilter === s
                    ? 'bg-teal-500 text-black border-teal-500'
                    : 'border-border text-muted hover:text-foreground'}`}
                >
                  {s === 'all' ? 'All' : s === 'driver_assigned' ? 'Assigned' : s.charAt(0).toUpperCase() + s.slice(1)}
                  {' '}({s === 'all' ? bookings.length : bookings.filter(b => b.status === s).length})
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border border-card-border bg-card text-muted">
              <BookOpen size={36} className="mx-auto mb-4 opacity-20" />
              <p className="font-semibold text-foreground">No bookings</p>
              <p className="text-sm mt-1">Make your first booking by clicking "New Booking".</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(b => {
                const cfg = STATUS_CFG[b.status] || STATUS_CFG.confirmed;
                return (
                  <motion.div
                    key={b.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border border-card-border bg-card p-4 hover:border-teal-500/30 transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <span className="font-mono text-xs text-teal-500 font-bold tracking-wider">{b.id}</span>
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
                            <cfg.icon size={9} />
                            {cfg.label}
                          </span>
                          <span className="text-[10px] text-muted">{fmt(b.createdAt)}</span>
                        </div>

                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-foreground text-sm">{b.customer}</span>
                          <span className="text-xs text-muted">·</span>
                          <span className="text-xs text-muted">{b.mobile}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm mb-3">
                          <span className="text-teal-500 font-semibold">{b.from}</span>
                          <ArrowRight size={12} className="text-muted" />
                          <span className="text-teal-500 font-semibold">{b.to}</span>
                          <span className="text-xs text-muted">· {TRIP_LABELS[b.tripType]} · {b.cabType}</span>
                          <span className="text-xs text-muted">· {fmt(b.date)} {fmtTime(b.time)}</span>
                        </div>

                        <div className="flex items-center gap-4 text-xs">
                          <span className="text-muted">Sell: <span className="font-bold text-foreground">₹{b.sellingPrice.toLocaleString('en-IN')}</span></span>
                          <span className="text-muted">Markup: <span className="font-bold text-teal-500">₹{b.markup.toLocaleString('en-IN')}</span></span>
                          <span className="text-muted">Paid: <span className="font-bold text-green-500">₹{b.amountPaid.toLocaleString('en-IN')}</span></span>
                          {b.amountDue > 0 && <span className="text-muted">Due: <span className="font-bold text-amber-400">₹{b.amountDue.toLocaleString('en-IN')}</span></span>}
                        </div>
                      </div>

                      <button
                        onClick={() => setDetailBooking(b)}
                        className="flex items-center gap-1 h-8 px-3 border border-border rounded-xl text-xs font-semibold text-muted hover:text-teal-400 hover:border-teal-400/50 transition cursor-pointer shrink-0"
                      >
                        <Eye size={12} /> View
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* ── Booking Detail Drawer ────────────────────────────────────────────── */}
      <AnimatePresence>
        {detailBooking && (
          <>
            <div className="fixed inset-0 z-[105] bg-slate-950/40 backdrop-blur-sm" onClick={() => setDetailBooking(null)} />
            <BookingDetailDrawer
              booking={detailBooking}
              onClose={() => setDetailBooking(null)}
              onCancel={handleCancel}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
