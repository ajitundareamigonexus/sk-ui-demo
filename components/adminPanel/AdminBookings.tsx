'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Hash, IndianRupee, Clock, CheckCircle2, XCircle, Search, Download, Car, ArrowRight,
  CalendarDays, Users, Phone, Mail, RefreshCw, Edit, UserCheck, Send, X,
  Calendar, AlertTriangle, TrendingUp, RotateCcw, BadgeCheck, BadgeX,
} from 'lucide-react';
import {
  cancelBooking as cancelBookingApi,
  updateBookingStatus as updateBookingStatusApi,
  getAllBookings as getAllBookingsApi,
  assignDriver as assignDriverApi,
  rescheduleBooking as rescheduleBookingApi,
  getAvailableDrivers,
  getAvailableVehicles,
} from '@/services/api';
import type { Booking, Driver } from '@/lib/types';
import { toast } from 'sonner';
import { hasPermission } from '@/helper/permissions-handler';

// ─── Status config — all 12 P0-24 lifecycle states ───────────────────────────
const STATUS_CFG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  draft: { label: 'Draft', color: 'text-slate-400', bg: 'bg-slate-400/10', border: 'border-slate-400/20' },
  payment_pending: { label: 'Payment Pending', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  initiated: { label: 'Initiated', color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  confirmed: { label: 'Confirmed', color: 'text-teal-500', bg: 'bg-teal-500/10', border: 'border-teal-500/20' },
  driver_assignment_pending: { label: 'Assign Pending', color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
  driver_assigned: { label: 'Driver Assigned', color: 'text-teal-500', bg: 'bg-teal-500/10', border: 'border-teal-500/20' },
  trip_started: { label: 'Trip Started', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
  completed: { label: 'Completed', color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  rescheduled: { label: 'Rescheduled', color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  cancelled: { label: 'Cancelled', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  refund_pending: { label: 'Refund Pending', color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/20' },
  refunded: { label: 'Refunded', color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20' },
  no_show: { label: 'No Show', color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20' },
};

// Valid next statuses per current status (lifecycle guard)
const NEXT_STATUSES: Record<string, string[]> = {
  draft: ['payment_pending', 'confirmed', 'cancelled'],
  payment_pending: ['confirmed', 'cancelled'],
  initiated: ['confirmed', 'cancelled'],
  confirmed: ['driver_assignment_pending', 'driver_assigned', 'rescheduled', 'cancelled'],
  driver_assignment_pending: ['driver_assigned', 'cancelled'],
  driver_assigned: ['trip_started', 'rescheduled', 'cancelled'],
  trip_started: ['completed', 'no_show'],
  completed: ['refund_pending'],
  rescheduled: ['confirmed', 'cancelled'],
  cancelled: ['refund_pending'],
  refund_pending: ['refunded'],
  refunded: [],
  no_show: ['refund_pending'],
};

const TERMINAL = new Set(['completed', 'cancelled', 'refunded', 'no_show']);

const TRIP_LABELS: Record<string, string> = {
  oneway: 'One Way', round: 'Round Trip', local: 'Local', airport: 'Airport',
};

// ─── Reused formatter helpers ─────────────────────────────────────────────────
function fmt(dateStr: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
function fmtTime(t: string) {
  if (!t) return '—';
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}
function fmtDT(iso: string) {
  return new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function getBalanceAmount(booking: Booking): number {
  if (booking.paymentOption === 'zero') return booking.totalFare;
  if (booking.paymentOption === 'advance') return booking.totalFare - Math.round(booking.totalFare * 0.2);
  return 0;
}

// ─── normalizeBooking — canonical version (AdminDashboard imports from here) ──
export function normalizeBooking(b: any): Booking {
  if (b.searchQuery && b.contact && b.selectedCab) {
    return { ...b, driverName: b.driverName, driverCarNumber: b.driverCarNumber };
  }
  let pickupDate = b.travelDate || '';
  let pickupTime = b.travelTime || '';
  if (b.onewayPickup) {
    const parts = b.onewayPickup.split('T');
    if (parts.length === 2) { pickupDate = parts[0]; pickupTime = parts[1].slice(0, 5); }
  }
  const rawStatus = (b.bookingStatus || b.status || 'confirmed').toLowerCase();
  const statusMap: Record<string, string> = {
    draft: 'draft', payment_pending: 'payment_pending', initiated: 'initiated',
    confirmed: 'confirmed', driver_assignment_pending: 'driver_assignment_pending',
    driver_assigned: 'driver_assigned', trip_started: 'trip_started',
    completed: 'completed', rescheduled: 'rescheduled', cancelled: 'cancelled',
    refund_pending: 'refund_pending', refunded: 'refunded', no_show: 'no_show',
  };
  const status = statusMap[rawStatus] || 'confirmed';
  let vehicleDetails: any = {};
  try { if (b.vehicleDetailsJson) vehicleDetails = JSON.parse(b.vehicleDetailsJson); } catch { }
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
      CarType: vehicleDetails.carName || vehicleDetails.cabName || b.cabName || 'Cab',
      carName: vehicleDetails.carType || vehicleDetails.model || b.cabCar || '',
      basePrice: Number(b.totalFare ?? b.baseFare ?? 0),
      totalSeat: vehicleDetails.totalSeat || vehicleDetails.capacity || b.cabSeats || 4,
      bags: 0, rating: vehicleDetails.rating || 0,
      fuelType: (vehicleDetails.fuelType as any) || 'Petrol',
      ac: vehicleDetails.ac ?? vehicleDetails.hasAc ?? true,
      image: vehicleDetails.image || vehicleDetails.imageUrl || '',
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
}

// ─── Reusable StatusBadge (same pattern as AdminAgents.tsx) ──────────────────
function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CFG[status];
  return (
    <span className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider ${cfg?.color || 'text-muted'} ${cfg?.bg || ''} ${cfg?.border || ''}`}>
      {cfg?.label || status}
    </span>
  );
}

// ─── Reusable Modal shell (same AnimatePresence pattern from existing modal) ──
function ModalShell({ children, onClose, title, subtitle }: {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-card border border-border rounded-3xl overflow-hidden shadow-2xl"
      >
        <div className="p-6 border-b border-border bg-teal-500/5 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-foreground">{title}</h3>
            {subtitle && <p className="text-xs text-muted font-mono font-semibold mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full border border-border bg-background flex items-center justify-center text-muted hover:text-foreground hover:bg-surface transition cursor-pointer">
            <X size={16} />
          </button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}

interface AdminBookingsProps {
  bookings: Booking[];
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
}

export default function AdminBookings({ bookings, setBookings }: AdminBookingsProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modals
  const [assignBooking, setAssignBooking] = useState<Booking | null>(null);
  const [statusBooking, setStatusBooking] = useState<Booking | null>(null);
  const [rescheduleBooking, setRescheduleBooking] = useState<Booking | null>(null);
  const [cancelBooking, setCancelBooking] = useState<Booking | null>(null);

  // Assign form — now with driver/vehicle dropdowns
  const [selectedDriverId, setSelectedDriverId] = useState<number | ''>('');
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | ''>('');
  const [availableDrivers, setAvailableDrivers] = useState<Driver[]>([]);
  const [availableVehicles, setAvailableVehicles] = useState<any[]>([]);
  // Other driver / vehicle fields
  const [isOtherDriver, setIsOtherDriver] = useState(false);
  const [isOtherVehicle, setIsOtherVehicle] = useState(false);
  const [otherDriverName, setOtherDriverName] = useState('');
  const [otherDriverMobile, setOtherDriverMobile] = useState('');
  const [otherVehicleNumber, setOtherVehicleNumber] = useState('');

  // Status update form
  const [bookingStatus, setBookingStatus] = useState<string>('confirmed');

  // Reschedule form
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');

  // Cancel form
  const [cancelReason, setCancelReason] = useState('');

  const [saving, setSaving] = useState(false);

  const bookingsNorm = (bookings || []).map(normalizeBooking);

  // Load available drivers & vehicles when assign modal opens
  useEffect(() => {
    if (assignBooking) {
      getAvailableDrivers()
        .then(d => setAvailableDrivers(d || []))
        .catch(() => setAvailableDrivers([]));
      getAvailableVehicles()
        .then(v => setAvailableVehicles(v || []))
        .catch(() => setAvailableVehicles([]));
      // Reset normal selection
      setSelectedDriverId('');
      setSelectedVehicleId('');
      // Reset "Other" fields
      setIsOtherDriver(false);
      setIsOtherVehicle(false);
      setOtherDriverName('');
      setOtherDriverMobile('');
      setOtherVehicleNumber('');
    }
  }, [assignBooking]);

  const refreshBookings = async () => {
    const data = await getAllBookingsApi();
    setBookings((data || []).map(normalizeBooking));
  };

  // ─── Assign Driver/Vehicle ────────────────────────────────────────────────
  const handleSaveAssign = async () => {
    if (!assignBooking) return;
    setSaving(true);
    try {
      await assignDriverApi(assignBooking.id, {
        driverId: !isOtherDriver && selectedDriverId !== '' ? Number(selectedDriverId) : undefined,
        vehicleId: !isOtherVehicle && selectedVehicleId !== '' ? Number(selectedVehicleId) : undefined,
        allottedDriverName: isOtherDriver ? otherDriverName : undefined,
        allottedDriverContact: isOtherDriver ? otherDriverMobile : undefined,
        allottedVehicleNumber: isOtherVehicle ? otherVehicleNumber : undefined,
      });
      await refreshBookings();
      toast.success('Driver & vehicle assigned successfully.', {
        description: 'Customer notification has been processed.',
      });
      setAssignBooking(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to assign driver. Please try again.');
    }
    setSaving(false);
  };

  // ─── Update Status ────────────────────────────────────────────────────────
  const handleSaveStatus = async () => {
    if (!statusBooking) return;
    setSaving(true);
    try {
      await updateBookingStatusApi(statusBooking.id, bookingStatus);
      await refreshBookings();
      toast.success('Booking status updated successfully.');
      setStatusBooking(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update status.');
    }
    setSaving(false);
  };

  // ─── Reschedule ───────────────────────────────────────────────────────────
  const handleReschedule = async () => {
    if (!rescheduleBooking) return;
    setSaving(true);
    try {
      const isoDate = newDate && newTime ? `${newDate}T${newTime}:00+05:30` : newDate ? `${newDate}T00:00:00+05:30` : undefined;
      await rescheduleBookingApi(rescheduleBooking.id, { newDate: isoDate, reason: rescheduleReason });
      await refreshBookings();
      toast.success('Booking rescheduled successfully.');
      setRescheduleBooking(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to reschedule booking.');
    }
    setSaving(false);
  };

  // ─── Cancel ───────────────────────────────────────────────────────────────
  const handleCancel = async () => {
    if (!cancelBooking) return;
    setSaving(true);
    try {
      await cancelBookingApi(cancelBooking.id);
      await refreshBookings();
      toast.success('Booking cancelled successfully.');
      setCancelBooking(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to cancel booking.');
    }
    setSaving(false);
  };

  const exportCSV = () => {
    const headers = [
      'Booking ID', 'Customer Name', 'Mobile', 'Email',
      'From', 'To', 'Trip Type', 'Travel Date', 'Travel Time',
      'Cab', 'Car Model', 'Passengers',
      'Base Fare', 'GST', 'Total Fare', 'Balance Amount', 'Payment Mode',
      'Driver Name', 'Driver Car Number',
      'Pickup Address', 'Drop Address',
      'Status', 'Booked At',
    ];
    const rows = bookingsNorm.map(b => [
      b.id, b.contact.fullName, b.contact.mobile, b.contact.email,
      b.searchQuery.from, b.searchQuery.to, TRIP_LABELS[b.searchQuery.tripType] ?? b.searchQuery.tripType,
      fmt(b.searchQuery.date), fmtTime(b.searchQuery.time),
      b.selectedCab.CarType, b.selectedCab.carName, b.searchQuery.passengers ?? 1,
      b.baseFare, b.gst, b.totalFare, getBalanceAmount(b),
      b.paymentOption === 'zero' ? 'Pay at Drop' : b.paymentOption === 'advance' ? 'Advance Paid' : 'Paid Online',
      b.driverName || '—', b.driverCarNumber || '—',
      b.contact.pickupAddress, b.contact.dropAddress,
      b.status, fmtDT(b.createdAt),
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SK_Bookings_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const stats = useMemo(() => {
    const total = bookingsNorm.length;
    const confirmed = bookingsNorm.filter(b => b.status === 'confirmed').length;
    const assigned = bookingsNorm.filter(b => b.status === 'driver_assigned').length;
    const completed = bookingsNorm.filter(b => b.status === 'completed').length;
    const cancelled = bookingsNorm.filter(b => b.status === 'cancelled').length;
    const revenue = bookingsNorm.filter(b => !TERMINAL.has(b.status) || b.status === 'completed')
      .reduce((s, b) => s + b.totalFare, 0);
    return { total, confirmed, assigned, completed, cancelled, revenue };
  }, [bookings]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return bookingsNorm.filter(b => {
      const matchSearch = !q || [b.id, b.contact.fullName, b.contact.mobile, b.contact.email,
      b.searchQuery.from, b.searchQuery.to, b.selectedCab.CarType, b.driverName || '']
        .some(v => v.toLowerCase().includes(q));
      const matchStatus = statusFilter === 'all' || b.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [bookings, search, statusFilter]);

  const sortedFiltered = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const dateA = new Date(a.searchQuery.date); dateA.setHours(0, 0, 0, 0);
      const dateB = new Date(b.searchQuery.date); dateB.setHours(0, 0, 0, 0);
      const aToday = dateA.getTime() === today.getTime();
      const bToday = dateB.getTime() === today.getTime();
      if (aToday && !bToday) return -1;
      if (!aToday && bToday) return 1;
      return dateB.getTime() - dateA.getTime();
    });
  }, [filtered]);

  useEffect(() => { setCurrentPage(1); }, [search, statusFilter, bookings]);

  const totalPages = Math.ceil(sortedFiltered.length / itemsPerPage);
  const paginatedBookings = sortedFiltered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <>
      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input type="text" placeholder="Search by name, driver, booking ID, mobile, route…"
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full h-11 rounded-xl border border-border bg-background pl-10 pr-4 text-sm outline-none focus:border-primary transition-colors" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="h-11 rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-primary transition-colors min-w-[160px]">
          <option value="all">All Status ({bookingsNorm.length})</option>
          {Object.entries(STATUS_CFG).map(([key, { label }]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        <button onClick={exportCSV} disabled={bookingsNorm.length === 0}
          className="flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 text-teal-500 dark:text-teal-400 px-4 py-2 rounded-xl text-sm font-semibold h-11 hover:bg-teal-500 hover:text-black transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
          <Download size={14} />
          Export CSV
        </button>
      </div>

      {search || statusFilter !== 'all' ? (
        <p className="text-xs text-muted mb-4">Showing {filtered.length} of {bookingsNorm.length} booking{bookingsNorm.length !== 1 ? 's' : ''}</p>
      ) : null}

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted border border-card-border bg-card rounded-2xl">
          <Car size={52} className="mx-auto mb-4 opacity-25 text-teal-400" />
          <p className="text-lg font-semibold text-foreground">
            {bookingsNorm.length === 0 ? 'No bookings yet' : 'No bookings match your search'}
          </p>
          <p className="text-sm mt-1">
            {bookingsNorm.length === 0 ? 'Once customers book cabs, they will appear here.' : 'Try clearing the search or changing the filter.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="overflow-x-auto rounded-2xl border border-card-border bg-card shadow-lg">
            <table className="w-full text-left border-collapse min-w-[1100px]">
              <thead>
                <tr className="border-b border-card-border bg-teal-500/5 text-[10px] font-bold uppercase tracking-wider text-muted">
                  <th className="p-2">Booking ID</th>
                  <th className="p-2">Customer Details</th>
                  <th className="p-2">Route</th>
                  <th className="p-2">Travel Date</th>
                  <th className="p-2">Car Type</th>
                  <th className="p-2">Fare &amp; Balance</th>
                  <th className="p-2">Driver Details</th>
                  <th className="p-2 text-center">Status</th>
                  <th className="p-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border text-sm">
                {paginatedBookings.map(booking => {
                  const sq = booking.searchQuery;
                  const balance = getBalanceAmount(booking);
                  const isTerminal = TERMINAL.has(booking.status);
                  const nextStatuses = NEXT_STATUSES[booking.status] || [];

                  return (
                    <tr key={booking.id} className="hover:bg-teal-500/[0.02] transition-colors">
                      {/* Booking ID */}
                      <td className="p-4">
                        <div className="font-bold text-teal-500 font-mono text-xs tracking-wider">{booking.id}</div>
                        <div className="text-[10px] text-muted mt-1 font-semibold">{fmtDT(booking.createdAt)}</div>
                      </td>
                      {/* Customer */}
                      <td className="p-4">
                        <div className="font-bold text-foreground text-xs">{booking.contact.fullName}</div>
                        <div className="text-xs text-muted flex items-center gap-1 mt-1 font-medium">
                          <Phone size={11} className="text-teal-500 shrink-0" />{booking.contact.mobile}
                        </div>
                        <div className="text-xs text-muted flex items-center gap-1 mt-0.5 font-medium">
                          <Mail size={11} className="text-teal-500 shrink-0" />{booking.contact.email}
                        </div>
                      </td>
                      {/* Route */}
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 font-bold text-xs">
                          <span className="text-teal-500">{sq.from}</span>
                          <ArrowRight size={12} className="text-muted shrink-0" />
                          <span className="text-teal-500">{sq.to}</span>
                        </div>
                        <div className="text-[10px] font-semibold text-muted mt-1 uppercase tracking-wider">
                          {TRIP_LABELS[sq.tripType] ?? sq.tripType}
                        </div>
                      </td>
                      {/* Date */}
                      <td className="p-4">
                        <div className="flex items-center gap-1 text-xs font-semibold text-foreground">
                          <CalendarDays size={12} className="text-teal-500 shrink-0" />{fmt(sq.date)}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted mt-1 font-medium">
                          <Clock size={12} className="text-teal-500 shrink-0" />{fmtTime(sq.time)}
                        </div>
                      </td>
                      {/* Car */}
                      <td className="p-4">
                        <div className="font-bold text-foreground text-xs flex items-center gap-1">
                          <Car size={12} className="text-teal-500 shrink-0" />{booking.selectedCab.CarType}
                        </div>
                        <div className="text-xs text-muted mt-1 font-medium">{booking.selectedCab.carName}</div>
                      </td>
                      {/* Fare */}
                      <td className="p-4">
                        <div className="font-extrabold text-foreground text-xs">₹{booking.totalFare.toLocaleString('en-IN')}</div>
                        <div className="text-[10px] font-bold mt-1 text-amber-500">Bal: ₹{balance.toLocaleString('en-IN')}</div>
                        <div className="text-[9px] font-bold text-muted uppercase tracking-wider mt-0.5">
                          {booking.paymentOption === 'zero' && '💵 Pay at Drop'}
                          {booking.paymentOption === 'advance' && '💳 20% Paid'}
                          {booking.paymentOption === 'full' && '💳 Full Paid'}
                        </div>
                      </td>
                      {/* Driver */}
                      <td className="p-4">
                        {booking.driverName ? (
                          <div>
                            <div className="font-bold text-foreground text-xs">{booking.driverName}</div>
                            <div className="text-[10px] text-muted font-mono font-bold mt-1 bg-surface px-1.5 py-0.5 rounded inline-block">
                              {booking.driverCarNumber || 'No Plate'}
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs text-muted/60 italic">Not Assigned</div>
                        )}
                      </td>
                      {/* Status */}
                      <td className="p-4 text-center">
                        <StatusBadge status={booking.status} />
                      </td>
                      {/* Actions */}
                      <td className="p-3">
                        <div className="flex flex-col gap-1.5 items-center">
                          {/* Assign / Re-assign */}
                          {!isTerminal && booking.status !== 'rescheduled' && hasPermission('Booking', 'assignDriver') && (
                            <button onClick={() => setAssignBooking(booking)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-teal-500/10 text-teal-500 border border-teal-500/20 hover:bg-teal-500 hover:text-black transition-all cursor-pointer whitespace-nowrap w-full justify-center">
                              <UserCheck size={11} />
                              {booking.driverName ? 'Re-assign' : 'Assign Driver'}
                            </button>
                          )}
                          {/* Status Update */}
                          {nextStatuses.length > 0 && hasPermission('Booking', 'update') && (
                            <button onClick={() => { setStatusBooking(booking); setBookingStatus(nextStatuses[0]); }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/20 hover:bg-blue-500 hover:text-white transition-all cursor-pointer whitespace-nowrap w-full justify-center">
                              <TrendingUp size={11} />
                              Update Status
                            </button>
                          )}
                          {/* Reschedule */}
                          {/* {!isTerminal && (
                            <button onClick={() => { setRescheduleBooking(booking); setNewDate(booking.searchQuery.date); setNewTime(booking.searchQuery.time); setRescheduleReason(''); }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-purple-500/10 text-purple-500 border border-purple-500/20 hover:bg-purple-500 hover:text-white transition-all cursor-pointer whitespace-nowrap w-full justify-center">
                              <RotateCcw size={11} />
                              Reschedule
                            </button>
                          )}
                          {/* Cancel 
                          {!isTerminal && (
                            <button onClick={() => { setCancelBooking(booking); setCancelReason(''); }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all cursor-pointer whitespace-nowrap w-full justify-center">
                              <XCircle size={11} />
                              Cancel
                            </button>
                          )} */}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-2">
              <span className="text-xs text-muted">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, sortedFiltered.length)} of {sortedFiltered.length} entries
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg bg-surface border border-border text-xs font-semibold hover:bg-teal-500 hover:text-black transition-colors disabled:opacity-50 disabled:hover:bg-surface disabled:hover:text-foreground cursor-pointer"
                >Previous</button>
                <div className="flex items-center justify-center px-3 py-1.5 rounded-lg bg-surface border border-border text-xs font-bold">
                  {currentPage} / {totalPages}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg bg-surface border border-border text-xs font-semibold hover:bg-teal-500 hover:text-black transition-colors disabled:opacity-50 disabled:hover:bg-surface disabled:hover:text-foreground cursor-pointer"
                >Next</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── Modals ─────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {/* Assign Driver Modal */}
        {assignBooking && (
          <ModalShell title="Assign Driver & Vehicle" subtitle={assignBooking.id} onClose={() => setAssignBooking(null)}>
            <div className="p-6 space-y-4">
              {/* Driver Dropdown */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted uppercase">Select Driver</label>
                <select
                  value={isOtherDriver ? 'other' : selectedDriverId}
                  onChange={e => {
                    const value = e.target.value;
                    if (value === 'other') {
                      setIsOtherDriver(true);
                      setSelectedDriverId('');
                    } else {
                      setIsOtherDriver(false);
                      setSelectedDriverId(value ? Number(value) : '');
                      // Clear manual fields
                      setOtherDriverName('');
                      setOtherDriverMobile('');
                    }
                  }}
                  className="w-full h-11 rounded-xl border border-border bg-surface px-3 text-sm"
                >
                  <option value="">— Select available driver —</option>
                  {availableDrivers.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} · {d.contactNumber} · Lic: {d.licenseNumber}
                    </option>
                  ))}
                  <option value="other">Other</option>
                </select>
                {isOtherDriver && (
                  <div className="mt-3 space-y-3 p-3 bg-teal-500/5 rounded-xl border border-teal-500/10">
                    {/* Driver Name */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted uppercase">
                        Driver Name
                      </label>
                      <input
                        type="text"
                        value={otherDriverName}
                        onChange={e => setOtherDriverName(e.target.value)}
                        placeholder="Enter driver name"
                        className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-teal-500"
                      />
                    </div>

                    {/* Driver Mobile */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted uppercase">
                        Mobile Number
                      </label>
                      <input
                        type="tel"
                        value={otherDriverMobile}
                        onChange={e => setOtherDriverMobile(e.target.value)}
                        placeholder="Enter mobile number"
                        maxLength={10}
                        className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>
                )}
                {availableDrivers.length === 0 && (
                  <p className="text-xs text-amber-500 flex items-center gap-1 mt-1">
                    <AlertTriangle size={11} /> No drivers available. Add drivers in the Drivers tab.
                  </p>
                )}
              </div>

              {/* Vehicle Dropdown */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted uppercase">
                  Select Vehicle
                </label>
                <select
                  value={isOtherVehicle ? 'other' : selectedVehicleId}
                  onChange={e => {
                    const value = e.target.value;
                    if (value === 'other') {
                      setIsOtherVehicle(true);
                      setSelectedVehicleId('');
                    } else {
                      setIsOtherVehicle(false);
                      setSelectedVehicleId(value ? Number(value) : '');
                      setOtherVehicleNumber(''); // clear manual field
                    }
                  }}
                  className="w-full h-11 rounded-xl border border-border bg-surface px-3 text-sm"
                >
                  <option value="">— Select available vehicle —</option>
                  {availableVehicles.map((v: any) => (
                    <option key={v.id} value={v.id}>
                      {v.carName} · {v.registrationNumber} · {v.carType}
                    </option>
                  ))}
                  <option value="other">Other</option>
                </select>
                {isOtherVehicle && (
                  <div className="mt-3 space-y-1 p-3 bg-teal-500/5 rounded-xl border border-teal-500/10">
                    <label className="text-[10px] font-bold text-muted uppercase">
                      Car Number
                    </label>
                    <input
                      type="text"
                      value={otherVehicleNumber}
                      onChange={e =>
                        setOtherVehicleNumber(e.target.value.toUpperCase())
                      }
                      placeholder="e.g. MH12AB1234"
                      className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-teal-500"
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="p-6 border-t border-border bg-surface flex gap-3">
              <button onClick={() => setAssignBooking(null)}
                className="flex-1 h-11 border border-border text-muted font-bold text-xs rounded-xl hover:text-foreground hover:bg-background transition cursor-pointer">
                Cancel
              </button>
              <button
                onClick={handleSaveAssign}
                disabled={saving || (!isOtherDriver && selectedDriverId === '' && !isOtherVehicle && selectedVehicleId === '') || (isOtherDriver && (!otherDriverName || !otherDriverMobile)) || (isOtherVehicle && !otherVehicleNumber)}
                className="flex-1 h-11 bg-teal-500 text-black font-extrabold text-xs rounded-xl hover:opacity-90 active:scale-[0.98] transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
                <Send size={13} />
                {saving ? 'Saving…' : 'Save & Notify'}
              </button>
            </div>
          </ModalShell>
        )}

        {/* Status Update Modal */}
        {statusBooking && (
          <ModalShell title="Update Booking Status" subtitle={statusBooking.id} onClose={() => setStatusBooking(null)}>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2 p-3 rounded-xl bg-surface border border-border">
                <span className="text-xs text-muted">Current:</span>
                <StatusBadge status={statusBooking.status} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted uppercase">New Status</label>
                <select value={bookingStatus} onChange={e => setBookingStatus(e.target.value)}
                  className="w-full h-11 rounded-xl border border-border bg-surface px-3 text-sm">
                  {(NEXT_STATUSES[statusBooking.status] || []).map(s => (
                    <option key={s} value={s}>{STATUS_CFG[s]?.label || s}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-border bg-surface flex gap-3">
              <button onClick={() => setStatusBooking(null)}
                className="flex-1 h-11 border border-border text-muted font-bold text-xs rounded-xl hover:text-foreground hover:bg-background transition cursor-pointer">
                Cancel
              </button>
              <button onClick={handleSaveStatus} disabled={saving}
                className="flex-1 h-11 bg-teal-500 text-black font-extrabold text-xs rounded-xl hover:opacity-90 transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50">
                <Send size={13} />{saving ? 'Updating…' : 'Update Status'}
              </button>
            </div>
          </ModalShell>
        )}

        {/* Reschedule Modal */}
        {rescheduleBooking && (
          <ModalShell title="Reschedule Booking" subtitle={rescheduleBooking.id} onClose={() => setRescheduleBooking(null)}>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted uppercase">New Date</label>
                  <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)}
                    className="w-full h-10 px-3 text-xs bg-surface border border-border rounded-xl" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted uppercase">New Time</label>
                  <input type="time" value={newTime} onChange={e => setNewTime(e.target.value)}
                    className="w-full h-10 px-3 text-xs bg-surface border border-border rounded-xl" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted uppercase">Reason (optional)</label>
                <textarea value={rescheduleReason} onChange={e => setRescheduleReason(e.target.value)}
                  placeholder="e.g. Customer request, flight change…"
                  rows={2}
                  className="w-full px-3 py-2 text-xs bg-surface border border-border rounded-xl resize-none" />
              </div>
            </div>
            <div className="p-6 border-t border-border bg-surface flex gap-3">
              <button onClick={() => setRescheduleBooking(null)}
                className="flex-1 h-11 border border-border text-muted font-bold text-xs rounded-xl hover:text-foreground hover:bg-background transition cursor-pointer">
                Cancel
              </button>
              <button onClick={handleReschedule} disabled={saving || !newDate}
                className="flex-1 h-11 bg-purple-500 text-white font-extrabold text-xs rounded-xl hover:opacity-90 transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50">
                <Calendar size={13} />{saving ? 'Rescheduling…' : 'Confirm Reschedule'}
              </button>
            </div>
          </ModalShell>
        )}

        {/* Cancel Modal */}
        {cancelBooking && (
          <ModalShell title="Cancel Booking" subtitle={cancelBooking.id} onClose={() => setCancelBooking(null)}>
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                <AlertTriangle size={16} className="text-red-400 shrink-0 mt-0.5" />
                <p className="text-xs text-muted leading-relaxed">
                  This will cancel booking <strong className="text-foreground">{cancelBooking.id}</strong> for{' '}
                  <strong className="text-foreground">{cancelBooking.contact.fullName}</strong>. The driver & vehicle will be released.
                </p>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted uppercase">Reason (optional)</label>
                <textarea value={cancelReason} onChange={e => setCancelReason(e.target.value)}
                  placeholder="e.g. Customer request, operational issue…"
                  rows={2}
                  className="w-full px-3 py-2 text-xs bg-surface border border-border rounded-xl resize-none" />
              </div>
            </div>
            <div className="p-6 border-t border-border bg-surface flex gap-3">
              <button onClick={() => setCancelBooking(null)}
                className="flex-1 h-11 border border-border text-muted font-bold text-xs rounded-xl hover:text-foreground hover:bg-background transition cursor-pointer">
                Keep Booking
              </button>
              <button onClick={handleCancel} disabled={saving}
                className="flex-1 h-11 bg-red-500 text-white font-extrabold text-xs rounded-xl hover:opacity-90 transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50">
                <XCircle size={13} />{saving ? 'Cancelling…' : 'Yes, Cancel Booking'}
              </button>
            </div>
          </ModalShell>
        )}
      </AnimatePresence>
    </>
  );
}