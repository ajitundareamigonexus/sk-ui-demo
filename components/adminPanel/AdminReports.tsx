'use client';

import { useState, useMemo } from 'react';
import {
  IndianRupee, FileText, Car, Route as RouteIcon, Fuel, Wrench, AlertCircle, ChevronRight,
} from 'lucide-react';
import type { Booking } from '@/lib/types';
import BookingReport from '../reports/BookingReport';
import FuelReport from '../reports/FuelReport';
import GstReport from '../reports/GstReport';
import MaintenanceReport from '../reports/MaintenanceReport';
import OutstandingReport from '../reports/OutstandingReport';
import RevenueReport from '../reports/RevenueReport';
import RouteReport from '../reports/RouteReport';
import VehicleReport from '../reports/VehicleReport';

const TRIP_LABELS: Record<string, string> = {
  oneway: 'One Way',
  round: 'Round Trip',
  local: 'Local',
  airport: 'Airport',
};

interface AdminReportsProps {
  bookings: Booking[];
}

export default function AdminReports({ bookings }: AdminReportsProps) {
  const [activeReport, setActiveReport] = useState<'revenue' | 'booking' | 'gst' | 'vehicle' | 'route' | 'fuel' | 'maintenance' | 'outstanding'>('booking');

  const normalizeBooking = (b: any): Booking => {
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
        CarType: vehicleDetails.carName || vehicleDetails.cabName || b.cabName || 'Cab',
        carName: vehicleDetails.carType || vehicleDetails.model || b.cabCar || '',
        basePrice: Number(b.totalFare ?? b.baseFare ?? 0),
        totalSeat: vehicleDetails.totalSeat || vehicleDetails.capacity || b.cabSeats || 4,
        bags: 0,
        rating: vehicleDetails.rating || 0,
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
  };

  const bookingsNorm = (bookings || []).map(normalizeBooking);
  // const completedBookings = bookingsNorm.filter(b => b.status === 'completed');
  const completedBookings = bookingsNorm.filter(
    b =>
      b.status === 'confirmed' ||
      b.status === 'driver_assigned' ||
      b.status === 'completed'
  );
  const stats = useMemo(() => {
    const total = bookingsNorm.length;
    const confirmed = bookingsNorm.filter(b => b.status === 'confirmed').length;
    const completed = bookingsNorm.filter(b => b.status === 'completed').length;
    const cancelled = bookingsNorm.filter(b => b.status === 'cancelled').length;
    const revenue = bookingsNorm
      .filter(b => b.status !== 'cancelled')
      .reduce((s, b) => s + b.totalFare, 0);
    return { total, confirmed, completed, cancelled, revenue };
  }, [bookingsNorm]);

  const reportsData = useMemo(() => {
    const tripTypeCounts: Record<string, number> = {};
    const tripTypeRevenue: Record<string, number> = {};
    bookingsNorm.forEach(b => {
      const t = TRIP_LABELS[b.searchQuery.tripType] ?? b.searchQuery.tripType;
      tripTypeCounts[t] = (tripTypeCounts[t] || 0) + 1;
      if (b.status !== 'cancelled') {
        tripTypeRevenue[t] = (tripTypeRevenue[t] || 0) + b.totalFare;
      }
    });

    const cabStats: Record<string, { bookings: number; revenue: number; completed: number; cancelled: number }> = {};
    bookingsNorm.forEach(b => {
      const name = b.selectedCab.carName;
      if (!cabStats[name]) cabStats[name] = { bookings: 0, revenue: 0, completed: 0, cancelled: 0 };
      cabStats[name].bookings++;
      if (b.status !== 'cancelled') cabStats[name].revenue += b.totalFare;
      if (b.status === 'completed') cabStats[name].completed++;
      if (b.status === 'cancelled') cabStats[name].cancelled++;
    });
    const topCabs = Object.entries(cabStats)
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 8);

    const monthlyData: Record<string, { bookings: number; revenue: number }> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
      monthlyData[key] = { bookings: 0, revenue: 0 };
    }
    bookingsNorm.forEach(b => {
      const d = new Date(b.createdAt);
      const key = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
      if (monthlyData[key]) {
        monthlyData[key].bookings++;
        if (b.status !== 'cancelled') monthlyData[key].revenue += b.totalFare;
      }
    });

    const routeStats: Record<string, { trips: number; revenue: number; baseFare: number; gst: number }> = {};
    bookingsNorm.forEach(b => {
      if (b.status === 'cancelled') return;
      const key = `${b.searchQuery.from} → ${b.searchQuery.to}`;
      if (!routeStats[key]) routeStats[key] = { trips: 0, revenue: 0, baseFare: 0, gst: 0 };
      routeStats[key].trips++;
      routeStats[key].revenue += b.totalFare;
      routeStats[key].baseFare += b.baseFare;
      routeStats[key].gst += b.gst;
    });
    const topRoutes = Object.entries(routeStats)
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 10);

    const paid = bookingsNorm.filter(b => b.paymentOption === 'full').length;
    const payAtDrop = bookingsNorm.filter(b => b.paymentOption === 'zero').length;
    const onlineRevenue = bookingsNorm.filter(b => b.paymentOption === 'full' && b.status !== 'cancelled').reduce((s, b) => s + b.totalFare, 0);
    const dropRevenue = bookingsNorm.filter(b => b.paymentOption === 'zero' && b.status !== 'cancelled').reduce((s, b) => s + b.totalFare, 0);

    const totalGST = bookingsNorm.filter(b => b.status !== 'cancelled').reduce((s, b) => s + b.gst, 0);
    const totalBaseFare = bookingsNorm.filter(b => b.status !== 'cancelled').reduce((s, b) => s + b.baseFare, 0);

    const maxMonthlyBookings = Math.max(...Object.values(monthlyData).map(m => m.bookings), 1);
    const maxMonthlyRevenue = Math.max(...Object.values(monthlyData).map(m => m.revenue), 1);
    const totalTripCount = Object.values(tripTypeCounts).reduce((a, b) => a + b, 0) || 1;
    const maxCabRevenue = topCabs.length ? topCabs[0][1].revenue || 1 : 1;
    const maxRouteRevenue = topRoutes.length ? topRoutes[0][1].revenue || 1 : 1;

    return {
      tripTypeCounts, tripTypeRevenue,
      topCabs, cabStats,
      topRoutes, routeStats,
      monthlyData, maxMonthlyBookings, maxMonthlyRevenue,
      paid, payAtDrop, onlineRevenue, dropRevenue,
      totalGST, totalBaseFare,
      totalTripCount, maxCabRevenue, maxRouteRevenue,
    };
  }, [bookingsNorm]);

  const completedReportsData = useMemo(() => {
    const tripTypeCounts: Record<string, number> = {};
    const tripTypeRevenue: Record<string, number> = {};
    const monthlyData: Record<string, { bookings: number; revenue: number }> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
      monthlyData[key] = { bookings: 0, revenue: 0 };
    }
    completedBookings.forEach(b => {
      const t = TRIP_LABELS[b.searchQuery.tripType] ?? b.searchQuery.tripType;
      tripTypeCounts[t] = (tripTypeCounts[t] || 0) + 1;
      tripTypeRevenue[t] = (tripTypeRevenue[t] || 0) + b.totalFare;
      const d = new Date(b.createdAt);
      const key = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
      if (monthlyData[key]) {
        monthlyData[key].bookings++;
        monthlyData[key].revenue += b.totalFare;
      }
    });
    const maxMonthlyBookings = Math.max(...Object.values(monthlyData).map(m => m.bookings), 1);
    return { tripTypeCounts, tripTypeRevenue, monthlyData, maxMonthlyBookings, totalCompleted: completedBookings.length };
  }, [completedBookings]);

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="w-full lg:w-56 shrink-0 hidden lg:block">
        <div className="rounded-2xl border border-card-border bg-card overflow-hidden sticky top-28">
          <div className="px-4 py-3 border-b border-card-border">
            <p className="text-[11px] font-bold text-muted uppercase tracking-widest">Reports</p>
          </div>
          {([
            { id: 'booking', label: 'Booking Report', icon: FileText },
            { id: 'revenue', label: 'Revenue Report', icon: IndianRupee },
            { id: 'vehicle', label: 'Vehicle Utilization', icon: Car },
            { id: 'gst', label: 'GST Report', icon: IndianRupee },
            { id: 'route', label: 'Route Wise Profit', icon: RouteIcon },
            { id: 'fuel', label: 'Fuel Expense', icon: Fuel },
            { id: 'maintenance', label: 'Maintenance Report', icon: Wrench },
            { id: 'outstanding', label: 'Outstanding Payment', icon: AlertCircle },
          ] as const).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveReport(id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all border-l-2 cursor-pointer ${activeReport === id
                ? 'bg-teal-400/10 text-teal-400 border-teal-400'
                : 'text-muted border-transparent hover:bg-white/5 hover:text-foreground'
                }`}
            >
              <Icon size={15} />
              <span className="flex-1 text-left">{label}</span>
              {activeReport === id && <ChevronRight size={13} />}
            </button>
          ))}
        </div>
      </div>

      <div className="lg:hidden w-full mb-4">
        <select
          value={activeReport}
          onChange={e => setActiveReport(e.target.value as typeof activeReport)}
          className="w-full h-11 rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-teal-400"
        >
          <option value="revenue">Revenue Report</option>
          <option value="gst">GST Report</option>
          <option value="booking">Booking Report</option>
          <option value="vehicle">Vehicle Utilization Report</option>
          <option value="route">Route Wise Profit Report</option>
          <option value="fuel">Fuel Expense Report</option>
          <option value="maintenance">Maintenance Report</option>
          <option value="outstanding">Outstanding Payment Report</option>
        </select>
      </div>

      <div className="flex-1 min-w-0">
        {activeReport === 'revenue' && <RevenueReport stats={stats} reportsData={reportsData} bookings={bookingsNorm} />}

        {activeReport === 'booking' && (
          <BookingReport
            bookings={completedBookings}
            totalCompleted={completedReportsData.totalCompleted}
          />
        )}

        {activeReport === 'gst' && <GstReport bookings={completedBookings} />}

        {activeReport === 'vehicle' && <VehicleReport topCabs={reportsData.topCabs} maxCabRevenue={reportsData.maxCabRevenue} />}
        {activeReport === 'route' && <RouteReport topRoutes={reportsData.topRoutes} />}
        {activeReport === 'fuel' && <FuelReport />}
        {activeReport === 'maintenance' && <MaintenanceReport />}
        {activeReport === 'outstanding' && <OutstandingReport bookings={bookingsNorm} />}
      </div>
    </div>
  );
}
