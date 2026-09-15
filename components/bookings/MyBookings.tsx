'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Car, CalendarDays, Clock, MapPin, IndianRupee, ArrowRight,
  Search, AlertCircle, XCircle, CheckCircle2, RefreshCw, Home, Phone, Mail, User, Layers
} from 'lucide-react';
import type { Booking, MultiLegBooking } from '@/lib/types';
import { getMyBookings, cancelBooking } from '@/services/api';
import { getAllMultiLegBookings, cancelMultiLegBooking } from '@/lib/bookingStore';

type BookingItem = Booking | MultiLegBooking;

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  confirmed: { label: 'Confirmed', color: 'text-teal-400', bg: 'bg-teal-400/10', border: 'border-teal-400/20', },
  initiated: { label: 'Initiated', color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20', },
  driver_assigned: { label: 'Driver Assigned', color: 'text-teal-400', bg: 'bg-teal-400/10', border: 'border-teal-400/20', },
  completed: { label: 'Completed', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20', },
  cancelled: { label: 'Cancelled', color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20', },
} as const;

const TRIP_LABELS: Record<string, string> = {
  oneway: 'One Way',
  round: 'Round Trip',
  local: 'Local',
  airport: 'Airport',
};

function fmtDate(dateStr: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function fmtTime(t: string) {
  if (!t) return '—';
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

export default function MyBookings() {
  const router = useRouter();
  const [items, setItems] = useState<BookingItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'confirmed' | 'completed' | 'cancelled'>('all');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Normalizer: converts backend BookingResponse DTO → local nested Booking shape
  const normalizeBooking = (b: any): Booking => {
    // Already in local shape (from localStorage)
    if (b.searchQuery && b.contact && b.selectedCab) return b as Booking;

    // Parse onewayPickup ISO string into date and time parts (timezone independent)
    let pickupDate = b.travelDate || '';
    let pickupTime = b.travelTime || '';
    if (b.onewayPickup) {
      const parts = b.onewayPickup.split('T');
      if (parts.length === 2) {
        pickupDate = parts[0];
        pickupTime = parts[1].slice(0, 5); // get "hh:mm"
      }
    }

    // Normalise status: backend sends CONFIRMED, CANCELLED, INITIATED, DRIVER_ASSIGNED etc.
    const rawStatus = (b.bookingStatus || b.status || 'confirmed').toLowerCase();
    const statusMap: Record<string, string> = {
      initiated: 'initiated',
      confirmed: 'confirmed',
      driver_assigned: 'driver_assigned',
      completed: 'completed',
      cancelled: 'cancelled',
    };
    const status = statusMap[rawStatus] || 'confirmed';

    // Parse vehicle details JSON if present
    let vehicleDetails: any = {};
    try {
      if (b.vehicleDetailsJson) vehicleDetails = JSON.parse(b.vehicleDetailsJson);
    } catch { }

    return {
      id: b.bookingRefId || (b.id ? String(b.id) : `SK-${Date.now()}`),
      searchQuery: {
        from: b.from || b.fromCity || '',
        to: b.to || b.toCity || '',
        date: pickupDate,
        time: pickupTime,
        tripType: (b.bookingType?.toLowerCase() || b.tripType || 'oneway') as any,
        passengers: b.passengers ?? 1,
      },
      selectedCab: {
        id: String(vehicleDetails.id || b.vehicleMasterId || b.cabId || ''),
        CarType: vehicleDetails.cabName || b.cabName || b.passengerName || 'Cab',
        carName: vehicleDetails.model || b.cabCar || '',
        basePrice: Number(b.totalFare ?? b.baseFare ?? 0),
        totalSeat: vehicleDetails.capacity || b.cabSeats || 4,
        bags: 0,
        rating: vehicleDetails.rating || 0,
        fuelType: (vehicleDetails.fuelType as any) || 'Petrol',
        ac: vehicleDetails.hasAc ?? true,
        image: vehicleDetails.imageUrl || '',
      },
      contact: {
        fullName: b.passengerName || b.fullName || b.customerName || '',
        mobile: b.passengerContact || b.mobile || b.customerMobile || '',
        email: b.passengerEmail || b.email || b.customerEmail || '',
        pickupAddress: b.onwardPickupAddress || b.pickupAddress || '',
        dropAddress: b.onwardDropAddress || b.dropAddress || '',
      },
      paymentOption: (b.paymentType === 'BOOKATZERO' || b.paymentType === 'ZERO_PAYMENT' ? 'zero'
        : b.paymentType === 'ADVPAY' || b.paymentType === 'ADVANCE' ? 'advance'
          : b.paymentType === 'FULLPAY' || b.paymentType === 'FULL' ? 'full'
            : (b.paymentOption || 'zero')) as any,
      baseFare: Number(b.totalFare ?? b.baseFare ?? 0),
      gst: Number(b.gstAmount ?? b.gst ?? 0),
      discount: Number(b.discount ?? 0),
      totalFare: Number(b.totalFare ?? 0),
      couponCode: b.couponCode ? String(b.couponCode) : undefined,
      status: status as any,
      createdAt: b.createdAt || new Date().toISOString(),
      driverName: b.allottedDriverName || b.driverName,
      driverCarNumber: b.allottedVehicleNumber || b.driverCarNumber,
      driverMobileNo: b.allottedDriverContact || b.driverMobileNo,
    };
  };

  const loadBookings = async () => {
    try {
      const data = await getMyBookings();
      const apiBookings = (data || []).map(normalizeBooking);
      const multiLegBookings = getAllMultiLegBookings();
      // 1. Identify all backend booking IDs that belong to a multi-leg booking
      const multiLegBackendIds = new Set<string>();
      multiLegBookings.forEach(ml => {
        ml.legs.forEach(leg => {
          if (leg.backendBookingRef) multiLegBackendIds.add(leg.backendBookingRef);
        });
      });

      // 2. Filter out API bookings that are already part of a multi-leg booking
      const standaloneBookings = apiBookings.filter((b: { id: string }) => !multiLegBackendIds.has(b.id));

      // 3. Combine them
      setItems([...multiLegBookings, ...standaloneBookings]);
    } catch (err) {
      console.error('Failed to load bookings from backend API:', err);
      const multiLegBookings = getAllMultiLegBookings();
      setItems([...multiLegBookings]); // At least show local multi-leg
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleConfirmCancel = async (id: string, isMulti: boolean) => {
    try {
      if (isMulti) {
        cancelMultiLegBooking(id);
      } else {
        await cancelBooking(id);
      }
      await loadBookings();
    } catch (err) {
      console.error('Failed to cancel booking via backend API:', err);
    }
  };

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return items.filter(b => {
      // Filter by search text (mobile, email, name, booking ID, cities)
      let matchesSearch = false;

      if (!q) {
        matchesSearch = true;
      } else if ('masterRef' in b) { // MultiLegBooking
        const froms = b.legs.map(l => l.search.from).join(' ');
        const tos = b.legs.map(l => l.search.to).join(' ');
        const cabs = b.legs.map(l => l.cab.CarType).join(' ');

        matchesSearch = [
          b.masterRef,
          b.contact.fullName,
          b.contact.mobile,
          b.contact.email,
          froms, tos, cabs
        ].some(v => String(v).toLowerCase().includes(q));
      } else { // Booking
        matchesSearch = [
          b.id,
          b.contact.fullName,
          b.contact.mobile,
          b.contact.email,
          b.searchQuery.from,
          b.searchQuery.to,
          b.selectedCab.CarType,
        ].some(v => String(v).toLowerCase().includes(q));
      }

      // Filter by tab
      const matchesTab =
        activeTab === 'all' ||
        (activeTab === 'confirmed'
          ? (b.status === 'confirmed' || b.status === 'driver_assigned')
          : b.status === activeTab);

      return matchesSearch && matchesTab;
    });
  }, [items, searchQuery, activeTab]);

  return (
    <section className="min-h-screen bg-background text-foreground pt-28 pb-16 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-4 border border-teal-500/20 bg-teal-500/5 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-teal-400">
            Customer Area
          </div>
          <h1 className="text-4xl font-black mb-3">My Cab Bookings</h1>
          <p className="text-muted text-sm max-w-md mx-auto">
            View details, check status, or manage your active and past cab bookings.
          </p>
        </div>

        {/* Dashboard Grid / Actions */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search by Mobile, Email, Name or Booking ID..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full h-12 bg-card border border-border rounded-xl pl-11 pr-4 text-sm outline-none focus:border-primary transition-all placeholder:text-muted"
            />
          </div>

          {/* Tab buttons */}
          <div className="flex bg-card border border-border p-1 rounded-xl overflow-x-auto shrink-0">
            {(['all', 'confirmed', 'completed', 'cancelled'] as const).map(tab => {
              const count = items.filter(b =>
                tab === 'all' ||
                (tab === 'confirmed'
                  ? (b.status === 'confirmed' || b.status === 'driver_assigned')
                  : b.status === tab)
              ).length;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg capitalize transition-all shrink-0 ${activeTab === tab
                    ? 'bg-primary text-primary-contrast shadow-sm'
                    : 'text-muted hover:text-foreground'
                    }`}
                >
                  {tab} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Bookings List */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 bg-card border border-card-border rounded-3xl p-8">
            <Car size={48} className="mx-auto mb-4 text-muted opacity-30 animate-pulse" />
            <h3 className="text-lg font-bold text-foreground mb-1">No Bookings Found</h3>
            <p className="text-muted text-sm max-w-sm mx-auto mb-6">
              {items.length === 0
                ? "You haven't booked any cabs on this browser yet."
                : "No bookings match your search query."}
            </p>
            <button
              onClick={() => router.push('/#booking-tabs-section')}
              className="inline-flex items-center gap-2 bg-primary text-primary-contrast px-6 py-3 rounded-xl font-bold text-sm hover:scale-105 transition-all"
            >
              <Home size={16} />
              Book Your Cab Now
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {[...filtered]
              .sort((a, b) => {
                // Latest travel date first
                let dateAStr = '';
                let timeAStr = '';
                if ('masterRef' in a) {
                  dateAStr = a.legs[0]?.search.date || '';
                  timeAStr = a.legs[0]?.search.time || '00:00';
                } else {
                  dateAStr = a.searchQuery.date || '';
                  timeAStr = a.searchQuery.time || '00:00';
                }

                let dateBStr = '';
                let timeBStr = '';
                if ('masterRef' in b) {
                  dateBStr = b.legs[0]?.search.date || '';
                  timeBStr = b.legs[0]?.search.time || '00:00';
                } else {
                  dateBStr = b.searchQuery.date || '';
                  timeBStr = b.searchQuery.time || '00:00';
                }

                const dateA = new Date(`${dateAStr}T${timeAStr}`);
                const dateB = new Date(`${dateBStr}T${timeBStr}`);
                return dateB.getTime() - dateA.getTime();
              })
              .map(item => {
                const isMulti = 'masterRef' in item;
                const bId = isMulti ? item.masterRef : item.id;
                const cfg = STATUS_CFG[item.status] || STATUS_CFG.confirmed;
                return (
                  <div
                    key={bId}
                    className="rounded-3xl border border-card-border bg-card overflow-hidden hover:border-primary/20 transition-all shadow-sm"
                  >
                    {/* Card Header */}
                    <div className="px-4 py-3 bg-teal-500/5 border-b border-card-border flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {isMulti && (
                          <span className="bg-teal-500/20 text-teal-400 p-1.5 rounded-lg border border-teal-500/30">
                            <Layers size={14} />
                          </span>
                        )}
                        <span className="text-teal-400 font-extrabold text-sm tracking-wider">{bId}</span>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
                          {cfg.label}
                        </span>
                      </div>
                      <span className="text-xs text-muted">
                        Booked on: {new Date(item.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 flex flex-col gap-6">
                      {/* If Multi-leg, iterate legs; else show single leg UI */}
                      {isMulti ? (
                        <div className="space-y-4">
                          {item.legs.map((leg, idx) => (
                            <div key={idx} className="relative border border-border rounded-xl p-3 bg-surface/30 grid md:grid-cols-3 gap-4">
                              <div className="absolute -top-3 -left-3 w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center text-black font-black text-xs border-2 border-card">
                                {leg.legNumber}
                              </div>
                              {/* Column 1: Route & Details */}
                              <div className="pl-2">
                                <h4 className="text-[10px] text-muted uppercase font-bold tracking-wider mb-2">Route Details</h4>
                                <div className="flex items-center gap-2 mb-1.5">
                                  <span className="font-bold text-foreground">{leg.search.from}</span>
                                  <ArrowRight size={14} className="text-muted" />
                                  <span className="font-bold text-foreground">{leg.search.to}</span>
                                </div>
                                <span className="inline-block bg-teal-500/10 text-teal-400 border border-teal-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider mb-3">
                                  {TRIP_LABELS[leg.search.tripType] || leg.search.tripType}
                                </span>
                                <div className="space-y-1.5 text-xs">
                                  <p className="flex items-center gap-2 text-muted">
                                    <Car size={13} className="text-teal-400" />
                                    {leg.cab.CarType} ({leg.cab.carName})
                                  </p>
                                  <p className="flex items-center gap-2 text-muted">
                                    <CalendarDays size={13} className="text-teal-400" />
                                    {fmtDate(leg.search.date)}
                                  </p>
                                  <p className="flex items-center gap-2 text-muted">
                                    <Clock size={13} className="text-teal-400" />
                                    {fmtTime(leg.search.time)}
                                  </p>
                                </div>
                              </div>
                              {/* Column 2: Pickup/Drop */}
                              <div>
                                <h4 className="text-[10px] text-muted uppercase font-bold tracking-wider mb-2">Addresses</h4>
                                <div className="space-y-2 text-xs">
                                  <p className="flex items-start gap-2 text-muted">
                                    <MapPin size={13} className="text-teal-400 shrink-0 mt-0.5" />
                                    <span className="line-clamp-2">{leg.pickupAddress || item.contact.pickupAddress || 'Not Provided'}</span>
                                  </p>
                                  <p className="flex items-start gap-2 text-muted">
                                    <MapPin size={13} className="text-red-400 shrink-0 mt-0.5" />
                                    <span className="line-clamp-2">{leg.dropAddress || item.contact.dropAddress || 'Not Provided'}</span>
                                  </p>
                                </div>
                              </div>
                              {/* Column 3: Leg Fare */}
                              <div>
                                <h4 className="text-[10px] text-muted uppercase font-bold tracking-wider mb-2">Leg Fare</h4>
                                <div className="text-lg font-black text-foreground mb-1">
                                  ₹{leg.totalFare.toLocaleString('en-IN')}
                                </div>
                                {leg.backendBookingRef && (
                                  <div className="mt-2 text-xs text-muted flex items-center gap-1">
                                    <CheckCircle2 size={12} className="text-teal-400" />
                                    Leg Ref: {leg.backendBookingRef}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (() => {
                        const b = item as Booking;
                        return (
                          <>
                            <div className="grid md:grid-cols-3 gap-6">
                              {/* Column 1: Route & Details */}
                              <div>
                                <h4 className="text-[10px] text-muted uppercase font-bold tracking-wider mb-2">Route Details</h4>
                                <div className="flex items-center gap-2 text-sm font-bold flex-wrap mb-1">
                                  <span className="text-foreground">{b.searchQuery.from}</span>
                                  <ArrowRight size={13} className="text-muted shrink-0" />
                                  <span className="text-foreground">{b.searchQuery.to}</span>
                                </div>
                                <p className="text-xs text-muted">
                                  {TRIP_LABELS[b.searchQuery.tripType]} &middot; {b.searchQuery.passengers ?? 1} Passengers
                                </p>

                                <div className="mt-4 space-y-1">
                                  <div className="text-xs flex items-center gap-1.5 text-muted">
                                    <CalendarDays size={13} className="text-teal-400 shrink-0" />
                                    <span>{fmtDate(b.searchQuery.date)}</span>
                                  </div>
                                  <div className="text-xs flex items-center gap-1.5 text-muted">
                                    <Clock size={13} className="text-teal-400 shrink-0" />
                                    <span>{fmtTime(b.searchQuery.time)}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Column 2: Cab & Fare */}
                              <div>
                                <h4 className="text-[10px] text-muted uppercase font-bold tracking-wider mb-2">Car &amp; Fare</h4>
                                <div className="flex items-center gap-2 text-sm font-bold mb-1">
                                  <Car size={15} className="text-teal-400 shrink-0" />
                                  <span>{b.selectedCab.CarType}</span>
                                </div>
                                <p className="text-xs text-muted">{b.selectedCab.carName} or similar</p>

                                <div className="mt-4">
                                  <span className="text-xs text-muted block">Total Price (incl. GST)</span>
                                  <span className="text-teal-400 text-xl font-black">₹{b.totalFare.toLocaleString('en-IN')}</span>
                                  <span className="text-[10px] text-muted block mt-0.5">
                                    {b.paymentOption === 'zero' ? '💵 Pay at Drop' : '💳 Paid Online'}
                                  </span>
                                </div>
                              </div>

                              {/* Column 3: Contact & Actions */}
                              <div className="flex flex-col justify-between">
                                <div>
                                  <h4 className="text-[10px] text-muted uppercase font-bold tracking-wider mb-2">Booking Contact</h4>
                                  <p className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1">
                                    <User size={12} className="text-teal-400 shrink-0" />
                                    {b.contact.fullName}
                                  </p>
                                  <p className="text-xs text-muted flex items-center gap-1.5">
                                    <Phone size={11} className="text-teal-400 shrink-0" />
                                    {b.contact.mobile}
                                  </p>
                                  {b.driverName && (
                                    <div className="mt-3 p-3 bg-teal-500/10 border border-teal-500/20 rounded-2xl">
                                      <p className="text-[10px] font-extrabold text-teal-400 uppercase tracking-wider mb-2">
                                        Driver Assigned
                                      </p>
                                      <div className="flex items-center justify-between gap-2">
                                        <p className="text-sm font-bold text-foreground">
                                          {b.driverName}
                                        </p>
                                        <span className="text-[10px] font-mono font-bold text-teal-400 bg-background border border-border px-2 py-1 rounded-lg">
                                          {b.driverCarNumber}
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Cancel Button */}
                                {(b.status === 'confirmed' || b.status === 'driver_assigned') && (
                                  cancellingId === b.id ? (
                                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-2xl flex flex-col gap-2 animate-fadeIn">
                                      <p className="text-[10px] font-extrabold text-red-400 uppercase tracking-wider text-center">Cancel this ride?</p>
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() => {
                                            handleConfirmCancel(b.id, false);
                                            setCancellingId(null);
                                          }}
                                          className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
                                        >
                                          Yes
                                        </button>
                                        <button
                                          onClick={() => setCancellingId(null)}
                                          className="flex-1 py-2 bg-surface hover:bg-neutral-800 text-foreground border border-border rounded-xl text-xs font-bold transition-all active:scale-95"
                                        >
                                          No
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => setCancellingId(b.id)}
                                      className="mt-4 flex items-center justify-center gap-1.5 w-full md:w-auto px-4 py-2.5 border border-red-500/20 bg-red-500/5 text-red-500 hover:bg-red-500 hover:text-white rounded-xl text-xs font-bold transition-all active:scale-95"
                                    >
                                      <XCircle size={14} />
                                      Cancel Ride
                                    </button>
                                  )
                                )}
                              </div>
                            </div>

                            {/* Pickup & Drop Addresses */}
                            <div className="px-3 pb-5 grid sm:grid-cols-2 gap-4 border-t border-border pt-2 bg-background/20">
                              <div className="flex items-start gap-2">
                                <MapPin size={13} className="text-green-400 mt-0.5 shrink-0" />
                                <div>
                                  <span className="text-[9px] text-muted uppercase font-bold tracking-wider">Pickup Address</span>
                                  <p className="text-xs font-medium text-foreground mt-0.5">{b.contact.pickupAddress}</p>
                                </div>
                              </div>
                              <div className="flex items-start gap-2">
                                <MapPin size={13} className="text-red-400 mt-0.5 shrink-0" />
                                <div>
                                  <span className="text-[9px] text-muted uppercase font-bold tracking-wider">Drop Address</span>
                                  <p className="text-xs font-medium text-foreground mt-0.5">{b.contact.dropAddress}</p>
                                </div>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </section>
  );
}
