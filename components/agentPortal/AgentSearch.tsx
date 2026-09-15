'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Search, ArrowRight, Car, Users, Fuel, Wind, Star,
  Building2, ChevronRight, Info, Tag, TrendingUp,
} from 'lucide-react';
import { getAgentContext, applyAgentDiscount } from '@/lib/agentStore';
import { getCabs } from '@/services/api';
import { getAllCabs } from '@/lib/bookingStore';
import type { Cab } from '@/lib/types';

const TRIP_TYPES = [
  { key: 'oneway', label: 'One Way' },
  { key: 'round', label: 'Round Trip' },
  { key: 'local', label: 'Local' },
  { key: 'airport', label: 'Airport Transfer' },
] as const;

const CITIES = [
  'Mumbai', 'Pune', 'Nashik', 'Goa', 'Shirdi', 'Aurangabad',
  'Nagpur', 'Kolhapur', 'Solapur', 'Sangli', 'Satara', 'Ratnagiri',
];

export default function AgentSearch() {
  const router = useRouter();
  const [agentCtx, setAgentCtx] = useState<ReturnType<typeof getAgentContext>>(null);
  const [cabs, setCabs] = useState<Cab[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const [form, setForm] = useState({
    from: '',
    to: '',
    date: '',
    time: '08:00',
    tripType: 'oneway' as 'oneway' | 'round' | 'local' | 'airport',
    passengers: 2,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const ctx = getAgentContext();
    if (!ctx) {
      router.push('/sign-up');
      return;
    }
    setAgentCtx(ctx);
  }, [router]);

  const agentPrices = useMemo(() => {
    if (!agentCtx) return {};
    return Object.fromEntries(
      cabs.map(c => [
        c.id,
        applyAgentDiscount(c.basePrice, agentCtx.pricingRules, form.tripType),
      ])
    );
  }, [cabs, agentCtx, form.tripType]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.from.trim()) e.from = 'Required';
    if (!form.to.trim()) e.to = 'Required';
    if (form.from.toLowerCase() === form.to.toLowerCase()) e.to = 'Cannot be same as pickup';
    if (!form.date) e.date = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSearch = async () => {
    if (!validate()) return;
    setLoading(true);
    setSearched(false);
    try {
      const data = await getCabs();
      setCabs(data || []);
    } catch {
      setCabs(getAllCabs());
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  const handleSelectCab = (cab: Cab) => {
    const agentPrice = agentPrices[cab.id] ?? cab.basePrice;
    const maxMarkup = agentCtx
      ? Math.round(agentPrice * (agentCtx.pricingRules.maxMarkupPct / 100))
      : 0;

    const params = new URLSearchParams({
      cabId: cab.id,
      from: form.from,
      to: form.to,
      date: form.date,
      time: form.time,
      tripType: form.tripType,
      passengers: String(form.passengers),
      agentCostPrice: String(agentPrice),
      maxMarkup: String(maxMarkup),
    });
    router.push(`/agent/book/${cab.id}?${params}`);
  };

  if (!agentCtx) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-muted">Loading…</div>
    </div>
  );

  const tripDiscount = agentCtx.pricingRules.tripOverrides[form.tripType] ?? agentCtx.pricingRules.baseDiscountPct;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-card-border bg-card/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
              <Building2 size={16} className="text-teal-400" />
            </div>
            <div>
              <div className="text-sm font-black text-foreground leading-tight">{agentCtx.agentBusinessName}</div>
              <div className="text-[10px] text-muted font-mono">{agentCtx.agentCode} · Cab Search</div>
            </div>
          </div>
          <button
            onClick={() => router.push('/agent')}
            className="flex items-center gap-1 text-xs text-muted hover:text-foreground transition cursor-pointer"
          >
            ← Back to Dashboard
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Agent Pricing Banner */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-teal-500/5 border border-teal-500/20 mb-6">
          <Tag size={14} className="text-teal-400 shrink-0" />
          <p className="text-xs text-teal-400 font-semibold">
            Showing <strong>agent-discounted prices</strong>. Your discount: <strong>{tripDiscount}%</strong> off published price for <strong>{form.tripType}</strong> trips.
            Max markup allowed: <strong>{agentCtx.pricingRules.maxMarkupPct}%</strong> on your cost.
          </p>
        </div>

        {/* Search Form */}
        <div className="rounded-2xl border border-card-border bg-card p-5 mb-6 shadow-sm">
          <h1 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Search size={18} className="text-teal-400" /> Search Cabs
          </h1>

          {/* Trip type */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {TRIP_TYPES.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setForm(f => ({ ...f, tripType: key }))}
                className={`h-9 px-4 rounded-xl text-xs font-bold border transition cursor-pointer ${form.tripType === key
                  ? 'bg-teal-500 text-black border-teal-500'
                  : 'border-border text-muted hover:text-foreground'}`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* From */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted uppercase">From *</label>
              <input
                list="city-list"
                value={form.from}
                onChange={e => { setForm(f => ({ ...f, from: e.target.value })); setErrors(e2 => ({ ...e2, from: '' })); }}
                placeholder="Pickup city"
                className={`w-full h-10 px-3 text-sm bg-surface border rounded-xl outline-none transition ${errors.from ? 'border-red-500' : 'border-border focus:border-teal-400'}`}
              />
              {errors.from && <p className="text-[10px] text-red-400">{errors.from}</p>}
            </div>
            {/* To */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted uppercase">To *</label>
              <input
                list="city-list"
                value={form.to}
                onChange={e => { setForm(f => ({ ...f, to: e.target.value })); setErrors(e2 => ({ ...e2, to: '' })); }}
                placeholder="Drop city"
                className={`w-full h-10 px-3 text-sm bg-surface border rounded-xl outline-none transition ${errors.to ? 'border-red-500' : 'border-border focus:border-teal-400'}`}
              />
              {errors.to && <p className="text-[10px] text-red-400">{errors.to}</p>}
            </div>
            {/* Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted uppercase">Date *</label>
              <input
                type="date"
                value={form.date}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => { setForm(f => ({ ...f, date: e.target.value })); setErrors(e2 => ({ ...e2, date: '' })); }}
                className={`w-full h-10 px-3 text-sm bg-surface border rounded-xl outline-none transition ${errors.date ? 'border-red-500' : 'border-border focus:border-teal-400'}`}
              />
              {errors.date && <p className="text-[10px] text-red-400">{errors.date}</p>}
            </div>
            {/* Time */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted uppercase">Time</label>
              <input
                type="time"
                value={form.time}
                onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                className="w-full h-10 px-3 text-sm bg-surface border border-border rounded-xl outline-none focus:border-teal-400 transition"
              />
            </div>
          </div>

          <datalist id="city-list">
            {CITIES.map(c => <option key={c} value={c} />)}
          </datalist>

          <button
            onClick={handleSearch}
            disabled={loading}
            className="h-11 px-8 bg-teal-500 text-black font-bold text-sm rounded-xl hover:opacity-90 transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? <><span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />Searching…</> : <><Search size={14} /> Search Cabs</>}
          </button>
        </div>

        {/* Results */}
        {searched && (
          <div>
            {cabs.length === 0 ? (
              <div className="text-center py-16 rounded-2xl border border-card-border bg-card text-muted">
                <Car size={40} className="mx-auto mb-4 opacity-20" />
                <p className="font-semibold text-foreground">No cabs available</p>
                <p className="text-sm mt-1">Try a different route or date.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted mb-2">{cabs.length} cab{cabs.length !== 1 ? 's' : ''} available · Prices shown are your agent rates</p>
                {cabs.map((cab, i) => {
                  const agentPrice = agentPrices[cab.id] ?? cab.basePrice;
                  const savedAmount = cab.basePrice - agentPrice;
                  const maxSell = agentPrice + Math.round(agentPrice * (agentCtx.pricingRules.maxMarkupPct / 100));

                  return (
                    <motion.div
                      key={cab.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="rounded-2xl border border-card-border bg-card p-4 hover:border-teal-500/30 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-12 rounded-xl bg-surface border border-card-border flex items-center justify-center shrink-0 overflow-hidden">
                            {cab.image ? (
                              <img src={cab.image} alt={cab.CarType} className="w-full h-full object-cover" />
                            ) : (
                              <Car size={24} className="text-teal-400 opacity-60" />
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-foreground">{cab.CarType}</div>
                            <div className="text-xs text-muted mt-0.5">{cab.carName}</div>
                            <div className="flex items-center gap-3 mt-1.5 text-xs text-muted">
                              <span className="flex items-center gap-1"><Users size={11} /> {cab.totalSeat} seats</span>
                              <span className="flex items-center gap-1"><Fuel size={11} /> {cab.fuelType}</span>
                              <span className="flex items-center gap-1"><Wind size={11} /> {cab.ac ? 'AC' : 'Non-AC'}</span>
                              {cab.rating > 0 && <span className="flex items-center gap-0.5"><Star size={10} className="text-amber-400 fill-amber-400" />{cab.rating}</span>}
                            </div>
                          </div>
                        </div>

                        {/* Pricing */}
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <div className="text-xs text-muted line-through">₹{cab.basePrice.toLocaleString('en-IN')}</div>
                            <div className="text-xl font-black text-teal-500">₹{agentPrice.toLocaleString('en-IN')}</div>
                            <div className="text-[10px] text-green-400 font-bold">Save ₹{savedAmount.toLocaleString('en-IN')} ({tripDiscount}% off)</div>
                            <div className="text-[10px] text-muted mt-0.5">Max sell: ₹{maxSell.toLocaleString('en-IN')}</div>
                          </div>
                          <button
                            onClick={() => handleSelectCab(cab)}
                            className="flex items-center gap-1.5 h-10 px-4 bg-teal-500 text-black text-xs font-bold rounded-xl hover:opacity-90 transition cursor-pointer whitespace-nowrap"
                          >
                            Select <ChevronRight size={13} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
