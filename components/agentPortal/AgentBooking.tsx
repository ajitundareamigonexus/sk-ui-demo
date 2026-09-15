'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowRight, Car, Users, CalendarDays, Clock, Building2,
  TrendingUp, IndianRupee, Info, AlertTriangle, Check, Send,
  Phone, Mail, MapPin, CreditCard,
} from 'lucide-react';
import { getAgentContext, validateMarkup, calculateSellingPrice } from '@/lib/agentStore';
import { getCabs } from '@/services/api';
import { getAllCabs } from '@/lib/bookingStore';
import type { Cab } from '@/lib/types';
import { toast } from 'sonner';

const PAYMENT_OPTIONS = [
  { key: 'full', label: 'Full Payment', desc: 'Customer pays full selling price now' },
  { key: 'advance', label: 'Advance (20%)', desc: 'Collect 20% now, rest at pickup' },
  { key: 'zero', label: 'Pay at Drop', desc: 'Customer pays full on trip completion' },
] as const;

function fmt(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
function fmtTime(t: string) {
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

export default function AgentBooking() {
  const router = useRouter();
  const params = useSearchParams();

  const cabId = params.get('cabId') || '';
  const from = params.get('from') || '';
  const to = params.get('to') || '';
  const date = params.get('date') || '';
  const time = params.get('time') || '';
  const tripType = (params.get('tripType') || 'oneway') as any;
  const agentCostPrice = Number(params.get('agentCostPrice') || 0);
  const maxMarkup = Number(params.get('maxMarkup') || 0);
  const passengers = Number(params.get('passengers') || 2);

  const [agentCtx, setAgentCtx] = useState<ReturnType<typeof getAgentContext>>(null);
  const [cab, setCab] = useState<Cab | null>(null);
  const [markupAmount, setMarkupAmount] = useState(0);
  const [markupError, setMarkupError] = useState('');
  const [paymentOption, setPaymentOption] = useState<'full' | 'advance' | 'zero'>('zero');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [bookingRef, setBookingRef] = useState('');

  const [contact, setContact] = useState({
    fullName: '', mobile: '', email: '',
    pickupAddress: '', dropAddress: '',
  });
  const [contactErrors, setContactErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const ctx = getAgentContext();
    if (!ctx) { router.push('/sign-up'); return; }
    setAgentCtx(ctx);

    // Load cab
    const loadCab = async () => {
      try {
        const cabs = await getCabs();
        const found = (cabs || []).find((c: Cab) => String(c.id) === cabId);
        setCab(found || getAllCabs().find(c => String(c.id) === cabId) || null);
      } catch {
        setCab(getAllCabs().find(c => String(c.id) === cabId) || null);
      }
    };
    loadCab();
  }, [router, cabId]);

  const sellingPrice = calculateSellingPrice(agentCostPrice, markupAmount);
  const markupValidation = agentCtx
    ? validateMarkup(agentCostPrice, markupAmount, agentCtx.pricingRules)
    : { valid: true, maxMarkup };

  const gst = Math.round(sellingPrice * 0.05);
  const totalWithGst = sellingPrice + gst;
  const advanceAmount = Math.round(totalWithGst * 0.2);
  const amountDue = paymentOption === 'zero' ? totalWithGst : paymentOption === 'advance' ? totalWithGst - advanceAmount : 0;

  const handleMarkupChange = (val: string) => {
    const num = parseFloat(val) || 0;
    setMarkupAmount(num);
    if (num > maxMarkup) {
      setMarkupError(`Exceeds your allowed limit of ₹${maxMarkup.toLocaleString('en-IN')}`);
    } else {
      setMarkupError('');
    }
  };

  const validateContact = () => {
    const e: Record<string, string> = {};
    if (!contact.fullName.trim()) e.fullName = 'Required';
    if (!contact.mobile.trim() || !/^\d{10}$/.test(contact.mobile)) e.mobile = '10-digit mobile required';
    if (!contact.email.trim() || !/\S+@\S+\.\S+/.test(contact.email)) e.email = 'Valid email required';
    if (!contact.pickupAddress.trim()) e.pickupAddress = 'Required';
    setContactErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateContact()) return;
    if (!markupValidation.valid) { setMarkupError(`Exceeds your allowed limit of ₹${markupValidation.maxMarkup.toLocaleString('en-IN')}`); return; }
    if (!agentCtx || !cab) return;

    setSubmitting(true);
    try {
      // In production: call createAgentBooking(bookingPayload)
      await new Promise(r => setTimeout(r, 1200));
      const ref = `SK-AGT-${Date.now().toString().slice(-8)}`;
      setBookingRef(ref);
      setSubmitted(true);
      toast.success('Booking confirmed!', { description: ref });
    } catch {
      toast.error('Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!agentCtx || !cab) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-muted text-sm">Loading booking details…</div>
    </div>
  );

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-md text-center"
        >
          <div className="w-20 h-20 rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center mx-auto mb-6">
            <Check size={36} className="text-green-500" />
          </div>
          <h1 className="text-2xl font-black mb-2">Booking Confirmed!</h1>
          <p className="text-muted mb-1">Your booking reference is</p>
          <div className="font-mono text-xl font-bold text-teal-500 mb-6">{bookingRef}</div>

          {/* Agent-branded confirmation */}
          <div className="rounded-2xl border border-card-border bg-card p-5 text-left mb-6">
            <div className="text-xs font-bold text-muted uppercase tracking-wider mb-3">Booking via {agentCtx.agentBusinessName}</div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted">Traveller</span><span className="font-semibold">{contact.fullName}</span></div>
              <div className="flex justify-between"><span className="text-muted">Route</span><span className="font-semibold">{from} → {to}</span></div>
              <div className="flex justify-between"><span className="text-muted">Date & Time</span><span className="font-semibold">{fmt(date)} {fmtTime(time)}</span></div>
              <div className="flex justify-between"><span className="text-muted">Cab</span><span className="font-semibold">{cab.CarType}</span></div>
              <div className="flex justify-between border-t border-card-border pt-2 mt-2">
                <span className="text-muted">Selling Price (incl. GST)</span>
                <span className="font-black text-foreground">₹{totalWithGst.toLocaleString('en-IN')}</span>
              </div>
              {amountDue > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted">Amount Due</span>
                  <span className="font-bold text-amber-400">₹{amountDue.toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => router.push('/agent')} className="flex-1 h-11 border border-border text-muted font-bold text-sm rounded-xl hover:text-foreground transition cursor-pointer">
              Dashboard
            </button>
            <button onClick={() => router.push('/agent/search')} className="flex-1 h-11 bg-teal-500 text-black font-bold text-sm rounded-xl hover:opacity-90 transition cursor-pointer">
              New Booking
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-card-border bg-card/95 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
              <Building2 size={16} className="text-teal-400" />
            </div>
            <div>
              <div className="text-sm font-black leading-tight">{agentCtx.agentBusinessName}</div>
              <div className="text-[10px] text-muted font-mono">{agentCtx.agentCode} · New Booking</div>
            </div>
          </div>
          <button onClick={() => router.back()} className="text-xs text-muted hover:text-foreground transition cursor-pointer">
            ← Back to Search
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left: Form ─────────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-5">
            {/* Trip Summary */}
            <div className="rounded-2xl border border-card-border bg-card p-4">
              <h2 className="text-xs font-bold text-muted uppercase tracking-wider mb-3">Trip Summary</h2>
              <div className="flex items-center gap-3 mb-3">
                <span className="font-bold text-teal-500 text-sm">{from}</span>
                <ArrowRight size={14} className="text-muted" />
                <span className="font-bold text-teal-500 text-sm">{to}</span>
                <span className="text-xs text-muted ml-auto">{tripType}</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted">
                <span className="flex items-center gap-1"><CalendarDays size={11} className="text-teal-400" />{fmt(date)}</span>
                <span className="flex items-center gap-1"><Clock size={11} className="text-teal-400" />{fmtTime(time)}</span>
                <span className="flex items-center gap-1"><Car size={11} className="text-teal-400" />{cab.CarType}</span>
                <span className="flex items-center gap-1"><Users size={11} className="text-teal-400" />{passengers} pax</span>
              </div>
            </div>

            {/* Markup Section */}
            <div className="rounded-2xl border border-card-border bg-card p-5">
              <h2 className="text-xs font-bold text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
                <TrendingUp size={13} className="text-teal-400" /> Your Markup (P0-11)
              </h2>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="rounded-xl border border-card-border bg-surface p-3 text-center">
                  <div className="text-xs text-muted mb-1">Agent Cost</div>
                  <div className="font-black text-foreground">₹{agentCostPrice.toLocaleString('en-IN')}</div>
                </div>
                <div className="rounded-xl border border-teal-500/20 bg-teal-500/5 p-3 text-center">
                  <div className="text-xs text-muted mb-1">Your Markup</div>
                  <div className={`font-black ${markupError ? 'text-red-400' : 'text-teal-500'}`}>+₹{markupAmount.toLocaleString('en-IN')}</div>
                </div>
                <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-3 text-center">
                  <div className="text-xs text-muted mb-1">Customer Price</div>
                  <div className="font-black text-green-500">₹{sellingPrice.toLocaleString('en-IN')}</div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted uppercase">Markup Amount (₹)</label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    max={maxMarkup}
                    step={10}
                    value={markupAmount || ''}
                    onChange={e => handleMarkupChange(e.target.value)}
                    placeholder="Enter markup amount"
                    className={`w-full h-11 px-4 pr-32 text-sm bg-surface border rounded-xl outline-none transition ${markupError ? 'border-red-500' : 'border-border focus:border-teal-400'}`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted font-semibold">
                    Max: ₹{maxMarkup.toLocaleString('en-IN')}
                  </span>
                </div>
                {markupError && (
                  <div className="flex items-center gap-1.5 text-xs text-red-400">
                    <AlertTriangle size={11} /> {markupError}
                  </div>
                )}
                {!markupError && markupAmount > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-green-400">
                    <Check size={11} /> Valid markup · {((markupAmount / agentCostPrice) * 100).toFixed(1)}% of cost price
                  </div>
                )}
              </div>
            </div>

            {/* Traveller Details */}
            <div className="rounded-2xl border border-card-border bg-card p-5">
              <h2 className="text-xs font-bold text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
                <Users size={13} className="text-teal-400" /> Traveller Details
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Full Name *', field: 'fullName', placeholder: 'Traveller name', type: 'text' },
                    { label: 'Mobile *', field: 'mobile', placeholder: '10-digit mobile', type: 'tel' },
                  ].map(({ label, field, placeholder, type }) => (
                    <div key={field} className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted">{label}</label>
                      <input
                        type={type}
                        value={(contact as any)[field]}
                        onChange={e => { setContact(c => ({ ...c, [field]: e.target.value })); setContactErrors(e2 => ({ ...e2, [field]: '' })); }}
                        placeholder={placeholder}
                        className={`w-full h-10 px-3 text-sm bg-surface border rounded-xl outline-none transition ${contactErrors[field] ? 'border-red-500' : 'border-border focus:border-teal-400'}`}
                      />
                      {contactErrors[field] && <p className="text-[10px] text-red-400">{contactErrors[field]}</p>}
                    </div>
                  ))}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted">Email *</label>
                  <input
                    type="email"
                    value={contact.email}
                    onChange={e => { setContact(c => ({ ...c, email: e.target.value })); setContactErrors(e2 => ({ ...e2, email: '' })); }}
                    placeholder="traveller@email.com"
                    className={`w-full h-10 px-3 text-sm bg-surface border rounded-xl outline-none transition ${contactErrors.email ? 'border-red-500' : 'border-border focus:border-teal-400'}`}
                  />
                  {contactErrors.email && <p className="text-[10px] text-red-400">{contactErrors.email}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted">Pickup Address *</label>
                  <input
                    value={contact.pickupAddress}
                    onChange={e => { setContact(c => ({ ...c, pickupAddress: e.target.value })); setContactErrors(e2 => ({ ...e2, pickupAddress: '' })); }}
                    placeholder="Detailed pickup address"
                    className={`w-full h-10 px-3 text-sm bg-surface border rounded-xl outline-none transition ${contactErrors.pickupAddress ? 'border-red-500' : 'border-border focus:border-teal-400'}`}
                  />
                  {contactErrors.pickupAddress && <p className="text-[10px] text-red-400">{contactErrors.pickupAddress}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted">Drop Address</label>
                  <input
                    value={contact.dropAddress}
                    onChange={e => setContact(c => ({ ...c, dropAddress: e.target.value }))}
                    placeholder="Drop address (optional)"
                    className="w-full h-10 px-3 text-sm bg-surface border border-border rounded-xl outline-none focus:border-teal-400 transition"
                  />
                </div>
              </div>
            </div>

            {/* Payment Option */}
            <div className="rounded-2xl border border-card-border bg-card p-5">
              <h2 className="text-xs font-bold text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
                <CreditCard size={13} className="text-teal-400" /> Payment Option
              </h2>
              <div className="space-y-2">
                {PAYMENT_OPTIONS.map(({ key, label, desc }) => (
                  <button
                    key={key}
                    onClick={() => setPaymentOption(key)}
                    className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition cursor-pointer ${paymentOption === key ? 'border-teal-500/50 bg-teal-500/5' : 'border-border hover:border-teal-500/30'}`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 ${paymentOption === key ? 'border-teal-500' : 'border-border'}`}>
                      {paymentOption === key && <div className="w-2 h-2 rounded-full bg-teal-500" />}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-foreground">{label}</div>
                      <div className="text-xs text-muted">{desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right: Price Summary ────────────────────────────────────────── */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-card-border bg-card p-5 sticky top-24">
              <h2 className="text-xs font-bold text-muted uppercase tracking-wider mb-4">Price Breakdown</h2>

              <div className="space-y-3 mb-4">
                <div className="rounded-xl border border-card-border bg-surface p-3">
                  <div className="text-[10px] text-muted uppercase tracking-wider mb-2 font-bold">Internal (Agent)</div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted">Published Price</span>
                    <span className="line-through text-muted">₹{(agentCostPrice + (agentCostPrice * ((agentCtx?.pricingRules.baseDiscountPct || 0) / (100 - (agentCtx?.pricingRules.baseDiscountPct || 0))))).toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted">Your Cost Price</span>
                    <span className="font-bold text-foreground">₹{agentCostPrice.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-muted">Your Markup</span>
                    <span className="font-bold text-teal-500">+₹{markupAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="rounded-xl border border-card-border bg-surface p-3">
                  <div className="text-[10px] text-muted uppercase tracking-wider mb-2 font-bold">Customer Facing</div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted">Base Fare</span>
                    <span>₹{sellingPrice.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted">GST (5%)</span>
                    <span>₹{gst.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold border-t border-card-border pt-2 mt-2">
                    <span>Total</span>
                    <span className="text-foreground">₹{totalWithGst.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {amountDue > 0 && (
                  <div className="flex justify-between text-xs px-1">
                    <span className="text-muted">Amount Due at {paymentOption === 'advance' ? 'Pickup' : 'Drop'}</span>
                    <span className="font-bold text-amber-400">₹{amountDue.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>

              {/* Agent context note */}
              <div className="flex items-start gap-2 p-3 rounded-xl bg-teal-500/5 border border-teal-500/10 mb-4">
                <Info size={12} className="text-teal-400 mt-0.5 shrink-0" />
                <p className="text-[10px] text-teal-400 leading-relaxed">
                  This booking will be recorded under <strong>{agentCtx.agentBusinessName}</strong> ({agentCtx.agentCode}).
                  Customer confirmation will show your agency identity.
                </p>
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting || !!markupError}
                className="w-full h-12 bg-teal-500 text-black font-extrabold text-sm rounded-xl hover:opacity-90 transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
              >
                {submitting ? (
                  <><span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />Confirming…</>
                ) : (
                  <><Send size={14} /> Confirm Booking</>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
