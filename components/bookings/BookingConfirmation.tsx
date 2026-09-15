'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2, ArrowRight, CalendarDays, Clock,
  User, Phone, Mail, MapPin, Car, Home, Building2, Loader2,
} from 'lucide-react';
import { getLatestBooking, getLatestMultiLegBooking, isMultiLegMode } from '@/lib/bookingStore';
import type { Booking, MultiLegBooking } from '@/lib/types';

const TRIP_LABELS: Record<string, string> = {
  oneway: 'One Way',
  round: 'Round Trip',
  local: 'Local',
  airport: 'Airport',
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

function formatTime(timeStr: string) {
  const [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${ampm}`;
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={15} className="text-teal-400" />
      </div>
      <div>
        <p className="text-xs text-muted uppercase tracking-wider">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

export default function BookingConfirmation() {
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | MultiLegBooking | null>(null);
  const [isMultiLeg, setIsMultiLeg] = useState(false);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const multi = isMultiLegMode();
    setIsMultiLeg(multi);
    const latestBooking = multi ? getLatestMultiLegBooking() : getLatestBooking();
    setBooking(latestBooking);
    setLoading(false);

    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-teal-400" />
      </section>
    );
  }

  if (!booking || (!isMultiLeg && !('searchQuery' in booking)) || (isMultiLeg && !('legs' in booking))) {
    // Clear stale paymentVerified so next booking works correctly
    if (typeof window !== 'undefined') {
      localStorage.removeItem('paymentVerified');
    }
    return (
      <section className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <h2 className="text-xl font-bold">Booking data not found</h2>
          <p className="text-sm text-muted">Please complete the booking process from the beginning.</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 bg-teal-400 text-black px-6 py-3 rounded-xl font-semibold"
          >
            Go Home
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-background text-foreground px-4 py-24">
      <div className="max-w-3xl mx-auto">

        {/* ── Success Banner ── */}
        <div
          className={`text-center mb-6 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
        >
          {/* Animated checkmark */}
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="absolute w-28 h-28 rounded-full bg-teal-400/10 animate-ping" />
            <div className="relative w-20 h-20 rounded-full bg-teal-400/15 border-2 border-teal-400/30
                            flex items-center justify-center">
              <CheckCircle2 size={44} className="text-teal-400" />
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black mb-2">
            Booking Confirmed! 🎉
          </h1>
          <p className="text-muted">
            Your cab is booked. confirm and driver details will be sent to your emailid and mobile number.
          </p>

          {/* Booking ID badge */}
          <div className="mt-4 inline-flex flex-col items-center gap-1 mb-6">
            <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 rounded-full px-4 py-2">
              <span className="text-xs text-muted uppercase tracking-widest">Booking Ref</span>
              <span className="text-teal-400 font-bold tracking-wider">
                {'masterRef' in booking ? booking.masterRef : booking.id}
              </span>
            </div>
            {isMultiLeg && (
              <span className="text-xs text-muted mt-1 px-3">This is a multi-leg booking.</span>
            )}
          </div>

          {/* ── Agent Branding (P0-14) ── */}
          {'agentId' in booking && booking.agentId && (
            <div className="mx-auto max-w-sm bg-teal-500/5 border border-teal-500/20 rounded-2xl p-4 text-left mb-6 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center shrink-0">
                <Building2 size={20} className="text-teal-400" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-0.5">Booking Managed By</p>
                <p className="text-sm font-bold text-foreground">{('agentBusinessName' in booking && booking.agentBusinessName) || 'Travel Partner'}</p>
                <div className="flex flex-col gap-0.5 mt-1">
                  {'agentMobile' in booking && booking.agentMobile && (
                    <p className="text-xs text-muted flex items-center gap-1">
                      <Phone size={10} className="text-teal-400" /> {booking.agentMobile}
                    </p>
                  )}
                  {'agentEmail' in booking && booking.agentEmail && (
                    <p className="text-xs text-muted flex items-center gap-1">
                      <Mail size={10} className="text-teal-400" /> {booking.agentEmail}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Summary Card ── */}
        <div
          className={`rounded-3xl border border-card-border bg-card overflow-hidden mb-4 transition-all duration-700 delay-100 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          {isMultiLeg ? (
            <div className="p-6 space-y-6">
              {/* Multi-Leg Render */}
              {('legs' in booking) && booking.legs.map((leg, idx) => (
                <div key={idx} className="border border-teal-500/20 rounded-2xl p-5 bg-surface/30 relative">
                  <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-black font-black text-sm border-4 border-card">
                    {leg.legNumber}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mb-4 pl-4">
                    <span className="text-teal-400 font-bold text-lg">{leg.search.from}</span>
                    <ArrowRight size={16} className="text-muted" />
                    <span className="text-teal-400 font-bold text-lg">{leg.search.to}</span>
                    <span className="ml-auto bg-teal-500/10 text-teal-400 border border-teal-500/20 text-xs font-semibold px-3 py-1 rounded-full">
                      {TRIP_LABELS[leg.search.tripType]}
                    </span>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <InfoRow icon={Car} label="Vehicle" value={`${leg.cab.CarType} (${leg.cab.carName})`} />
                      <InfoRow icon={CalendarDays} label="Pickup Date" value={formatDate(leg.search.date)} />
                      <InfoRow icon={Clock} label="Pickup Time" value={formatTime(leg.search.time)} />
                    </div>
                    <div className="space-y-3">
                      <InfoRow icon={MapPin} label="Pickup" value={leg.pickupAddress} />
                      <InfoRow icon={MapPin} label="Drop" value={leg.dropAddress} />
                      {leg.backendBookingRef && (
                        <InfoRow icon={CheckCircle2} label="Leg Booking ID" value={leg.backendBookingRef} />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Single-Leg Render */}
              {('searchQuery' in booking) && (
                <>
                  <div className="bg-teal-500/10 px-6 py-4 border-b border-teal-500/10 flex flex-wrap items-center gap-3">
                    <span className="text-teal-400 font-bold text-lg">{booking.searchQuery.from}</span>
                    <ArrowRight size={16} className="text-muted" />
                    <span className="text-teal-400 font-bold text-lg">{booking.searchQuery.to}</span>
                    <span className="ml-auto bg-surface border border-border text-xs font-semibold px-3 py-1 rounded-full">
                      {TRIP_LABELS[booking.searchQuery.tripType]}
                    </span>
                  </div>

                  <div className="p-6 grid sm:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <InfoRow icon={Car} label="Vehicle" value={`${booking.selectedCab.CarType} (${booking.selectedCab.carName})${booking.searchQuery.passengers ? ` — ${booking.searchQuery.passengers} Passengers` : ''}`} />
                      <InfoRow icon={CalendarDays} label="Pickup Date" value={formatDate(booking.searchQuery.date)} />
                      <InfoRow icon={Clock} label="Pickup Time" value={formatTime(booking.searchQuery.time)} />
                      <InfoRow icon={MapPin} label="Pickup" value={booking.contact.pickupAddress} />
                      <InfoRow icon={MapPin} label="Drop" value={booking.contact.dropAddress} />
                    </div>

                    <div className="space-y-4">
                      <InfoRow icon={User} label="Passenger" value={booking.contact.fullName} />
                      <InfoRow icon={Phone} label="Mobile" value={booking.contact.mobile} />
                      <InfoRow icon={Mail} label="Email" value={booking.contact.email} />
                      {booking.contact.gstNumber && (
                        <InfoRow icon={CheckCircle2} label="GST Number" value={booking.contact.gstNumber} />
                      )}
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {/* Contact Details (For multi-leg, show once at bottom) */}
          {isMultiLeg && (
            <div className="p-6 border-t border-border grid sm:grid-cols-2 gap-6 bg-background/50">
              <div className="space-y-4">
                <InfoRow icon={User} label="Passenger" value={booking.contact.fullName} />
                <InfoRow icon={Phone} label="Mobile" value={booking.contact.mobile} />
              </div>
              <div className="space-y-4">
                <InfoRow icon={Mail} label="Email" value={booking.contact.email} />
                {booking.contact.gstNumber && (
                  <InfoRow icon={CheckCircle2} label="GST Number" value={booking.contact.gstNumber} />
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Fare Card ── */}
        <div
          className={`rounded-3xl border border-card-border bg-card p-6 mb-8 transition-all duration-700 delay-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
        >
          <h2 className="text-lg font-bold mb-4">Fare Summary</h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Base Fare</span>
              <span>₹{('baseFare' in booking) ? booking.baseFare.toLocaleString('en-IN') : (booking as MultiLegBooking).legs.reduce((s, l) => s + l.baseFare, 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">GST (5%)</span>
              <span>₹{('gst' in booking) ? booking.gst.toLocaleString('en-IN') : (booking as MultiLegBooking).legs.reduce((s, l) => s + l.gst, 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="border-t border-border pt-3 flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-teal-400">₹{('totalFare' in booking) ? booking.totalFare.toLocaleString('en-IN') : (booking as MultiLegBooking).grandTotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-xs text-muted pt-1">
              <span>Payment Mode</span>
              <span className="capitalize font-medium">
                {booking.paymentOption === 'zero' ? 'Pay at drop (₹0 now)' : 'Full payment done'}
              </span>
            </div>
          </div>
        </div>

        {/* ── Actions ── */}
        <div
          className={`flex flex-col sm:flex-row gap-4 transition-all duration-700 delay-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
        >
          <button
            onClick={() => {
              if ('agentId' in booking && booking.agentId) {
                router.push('/agent');
              } else {
                router.push('/');
              }
            }}
            className="flex-1 flex items-center justify-center gap-2 h-14 rounded-2xl
                       bg-teal-400 text-black font-bold text-base hover:scale-[1.02] transition-all"
          >
            <Home size={18} />
            {'agentId' in booking && booking.agentId ? 'Back to Agent Portal' : 'Back to Home'}
          </button>

          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.print();
              }
            }}
            className="flex-1 h-14 rounded-2xl border-2 border-teal-400 text-teal-400
                       font-bold text-base hover:bg-teal-400/10 transition-all"
          >
            Print / Save Receipt
          </button>
        </div>

      </div>
    </section>
  );
}
