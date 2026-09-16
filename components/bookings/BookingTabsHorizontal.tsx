'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, RotateCcw, Navigation, Plane, AlertCircle, Package, Car, ShieldCheck, Clock } from 'lucide-react';
import { saveSearchQuery } from '@/lib/bookingStore';
import { fromCities, toCities } from '@/data/data';
import type { TripType } from '@/lib/types';
import CityInput from '../CityInputLight';

const airportSuggestions = [
  'Mumbai Airport (BOM)',
  'Pune Airport (PNQ)',
  'Nashik Airport (ISK)',
  'Aurangabad Airport (IXU)',
  'Kolhapur Airport (KLH)',
  'Nagpur Airport (NAG)',
];

const cabTabs = [
  { id: 'oneway' as const, label: 'One Way', Icon: MapPin },
  { id: 'round' as const, label: 'Round Trip', Icon: RotateCcw },
  { id: 'local' as const, label: 'Local', Icon: Navigation },
  { id: 'airport' as const, label: 'Airport', Icon: Plane },
];

// Popular package destinations
const packageDestinations = [
  'Mahabaleshwar',
  'Lonavala',
  'Shirdi',
  'Nashik',
  'Kolhapur',
  'Aurangabad',
  'Pune',
  'Mumbai',
  'Goa',
  'Konkan',
  'Alibaug',
  'Ratnagiri',
];

const packageDurations = [
  '1 Day / 1 Night',
  '2 Days / 1 Night',
  '3 Days / 2 Nights',
  '4 Days / 3 Nights',
  '5 Days / 4 Nights',
  '6 Days / 5 Nights',
  '7 Days / 6 Nights',
  'Custom Duration',
];

const packageTypes = [
  'Family Package',
  'Honeymoon Package',
  'Group Tour',
  'Corporate Tour',
  'Pilgrimage Tour',
  'Adventure Trip',
  'Weekend Getaway',
];

export default function BookingTabs() {
  const router = useRouter();

  const [mainTab, setMainTab] = useState<'cab' | 'packages'>('cab');
  const [cabTab, setCabTab] = useState<TripType>('oneway');
  const [from, setFrom] = useState(fromCities[0]);
  const [to, setTo] = useState(toCities[0]);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  // Round trip specific
  const [returnDate, setReturnDate] = useState('');
  const [returnTime, setReturnTime] = useState('');

  // Airport specific
  const [airportTripType, setAirportTripType] = useState<'drop' | 'pickup'>('drop');

  // Package specific
  const [pkgDestination, setPkgDestination] = useState(packageDestinations[0]);
  const [pkgDuration, setPkgDuration] = useState(packageDurations[0]);
  const [pkgType, setPkgType] = useState(packageTypes[0]);
  const [pkgPassengers, setPkgPassengers] = useState('2');
  const [pkgName, setPkgName] = useState('');
  const [pkgMobile, setPkgMobile] = useState('');

  const [error, setError] = useState('');
  const [pkgSuccess, setPkgSuccess] = useState(false);
  const [pkgErrors, setPkgErrors] = useState<{ name?: boolean; mobile?: boolean; date?: boolean }>({});

  const today = new Date().toISOString().split('T')[0];

  // Set default current date and time on client mount
  useEffect(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;
    setDate(todayStr);
    setTime(timeStr);
  }, []);

  // Listen for popular route clicks
  useEffect(() => {
    const handleSetRoute = (e: CustomEvent) => {
      const { from: newFrom, to: newTo } = e.detail;
      if (newFrom) setFrom(newFrom);
      if (newTo) setTo(newTo);
      setMainTab('cab');
      setCabTab('oneway');
      const element = document.getElementById('booking-tabs-section');
      if (element) {
        const offset = 100;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = element.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    window.addEventListener('setRoute', handleSetRoute as EventListener);
    return () => window.removeEventListener('setRoute', handleSetRoute as EventListener);
  }, []);

  // Listen for "Explore Travel Packages" button click
  useEffect(() => {
    const handleOpenPackages = () => {
      setMainTab('packages');
      setError('');
      setPkgSuccess(false);
      const element = document.getElementById('booking-tabs-section');
      if (element) {
        const offset = 100;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = element.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    window.addEventListener('openPackagesTab', handleOpenPackages as EventListener);
    return () => window.removeEventListener('openPackagesTab', handleOpenPackages as EventListener);
  }, []);

  const handleSearch = () => {
    setError('');

    if (!date) { setError('Please select a pickup date.'); return; }
    if (!time) { setError('Please select a pickup time.'); return; }

    if (cabTab === 'oneway' || cabTab === 'round') {
      if (from === to) {
        setError('From and To cities cannot be the same.'); return;
      }
    }

    if (cabTab === 'round') {
      if (!returnDate) { setError('Please select a return date.'); return; }
      if (!returnTime) { setError('Please select a return time.'); return; }
      if (returnDate < date) { setError('Return date cannot be before pickup date.'); return; }
    }

    saveSearchQuery({
      from,
      to,
      date,
      time,
      tripType: cabTab,
      returnDate: cabTab === 'round' ? returnDate : undefined,
      returnTime: cabTab === 'round' ? returnTime : undefined,
      airportTripType: cabTab === 'airport' ? airportTripType : undefined
    });
    // router.push('/cabs');
  };

  const handlePackageEnquiry = () => {
    const errors: { name?: boolean; mobile?: boolean; date?: boolean } = {};
    if (!pkgName.trim()) errors.name = true;
    if (!/^[6-9]\d{9}$/.test(pkgMobile)) errors.mobile = true;
    if (!date) errors.date = true;

    if (Object.keys(errors).length > 0) {
      setPkgErrors(errors);
      return;
    }
    setPkgErrors({});

    // Build WhatsApp message
    const msg = encodeURIComponent(
      `Hi Shree Krushna Travels! I'd like to enquire about a travel package.\n\n` +
      `📦 Package Type: ${pkgType}\n` +
      `📍 Destination: ${pkgDestination}\n` +
      `📅 Duration: ${pkgDuration}\n` +
      `🗓️ Travel Date: ${date}\n` +
      `👥 Passengers: ${pkgPassengers}\n` +
      `👤 Name: ${pkgName}\n` +
      `📞 Mobile: ${pkgMobile}\n\n` +
      `Please share the itinerary and pricing details.`
    );
    const whatsappUrl = `https://wa.me/918796807060?text=${msg}`;
    window.open(whatsappUrl, '_blank');
    setPkgSuccess(true);
  };

  const isRound = cabTab === 'round';
  const isAirport = cabTab === 'airport';
  const isLocal = cabTab === 'local';
  const isPackages = mainTab === 'packages';

  return (
    <div className="w-full rounded-[1rem] bg-white p-4 sm:p-6 lg:p-8 relative backdrop-blur-full shadow-2xl flex flex-col gap-2">
      {/* ── Main Category Switcher (CAB Booking vs Travel Packages) ── */}
      <div className="flex items-center gap-2 mb-3 bg-slate-50 rounded-full w-fit p-1.5 shadow-inner border border-slate-200">
        <button
          type="button"
          onClick={() => {
            setMainTab('cab');
            setError('');
          }}
          className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-extrabold transition-all duration-200 cursor-pointer ${mainTab === 'cab'
            ? 'bg-teal-500 text-white shadow-md'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
        >
          <Car size={16} />
          <span>CAB Booking</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setMainTab('packages');
            setError('');
            setPkgSuccess(false);
          }}
          className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-extrabold transition-all duration-200 cursor-pointer ${mainTab === 'packages'
            ? 'bg-teal-500 text-white shadow-md'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
        >
          <Package size={16} />
          <span>Travel Packages</span>
        </button>
      </div>

      {/* ── Cab Booking Sub-Tabs (Only visible when CAB Booking is active) ── */}
      {mainTab === 'cab' && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 snap-x">
          {cabTabs.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setCabTab(id);
                setError('');
              }}
              className={`flex items-center justify-center py-2 px-4 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${cabTab === id
                ? 'bg-teal-500 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 shadow-sm'
                }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* ── Packages Tab Content ── */}
      {isPackages ? (
        <div className="space-y-1 mb-2">
          {pkgSuccess ? (
            <div className="flex flex-col items-center justify-center py-6 space-y-3 text-center">
              <div className="w-14 h-14 rounded-full bg-teal-500/20 flex items-center justify-center">
                <Package size={28} className="text-teal-400" />
              </div>
              <p className="text-teal-400 font-bold text-sm">Enquiry Sent via WhatsApp!</p>
              <p className="text-white/60 text-xs max-w-[200px]">
                Our team will contact you shortly with the best package deals.
              </p>
              <button
                onClick={() => setPkgSuccess(false)}
                className="text-xs text-white/60 underline hover:text-white transition-colors"
              >
                Submit another enquiry
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="sm:col-span-2 lg:col-span-1">
                  <CityInput id="package-destination" label="Destination" value={pkgDestination} onChange={setPkgDestination} suggestions={packageDestinations} />
                </div>
                <div className="sm:col-span-1 lg:col-span-1">
                  <CityInput id="package-type" label="Package Type" value={pkgType} onChange={setPkgType} suggestions={packageTypes} />
                </div>
                <div className="sm:col-span-1 lg:col-span-1">
                  <CityInput id="package-duration" label="Duration" value={pkgDuration} onChange={setPkgDuration} suggestions={packageDurations} />
                </div>

                {/* Passengers & Travel Date (grouped for mobile) */}
                <div className="grid grid-cols-2 gap-4 sm:col-span-2 lg:col-span-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-900 mb-1">Passengers</label>
                    <select
                      value={pkgPassengers}
                      onChange={e => setPkgPassengers(e.target.value)}
                      className="w-full h-8 rounded-xl border border-slate-200 bg-white text-slate-900 px-3 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 font-medium"
                    >
                      {['1', '2', '3', '4', '5', '6', '7', '8', '10', '12', '15+'].map(n => (
                        <option key={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                  {/* Travel Date */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-900 mb-1">Travel Date</label>
                    <input
                      type="date"
                      min={today}
                      value={date}
                      onChange={e => { setDate(e.target.value); setPkgErrors(p => ({ ...p, date: false })); }}
                      className={`w-full h-8 rounded-xl border bg-white text-slate-900 px-3 text-sm outline-none transition-colors ${pkgErrors.date ? 'border-red-500 ring-1 ring-red-500/40' : 'border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500'
                        }`}
                    />
                  </div>
                </div>

                {/* Contact Info & CTA */}
                <div className="sm:col-span-1 lg:col-span-1">
                  <label className="block text-[11px] font-semibold text-slate-900 mb-1">Your Name *</label>
                  <input
                    type="text"
                    placeholder="Full name"
                    value={pkgName}
                    onChange={e => { setPkgName(e.target.value); setPkgErrors(p => ({ ...p, name: false })); }}
                    className={`w-full h-8 rounded-xl border bg-white text-slate-900 px-3 text-sm outline-none placeholder:text-slate-400 transition-colors ${pkgErrors.name ? 'border-red-500 ring-1 ring-red-500/40' : 'border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500'
                      }`}
                  />
                </div>
                <div className="sm:col-span-1 lg:col-span-1">
                  <label className="block text-[11px] font-semibold text-slate-900 mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={pkgMobile}
                    onChange={e => { setPkgMobile(e.target.value.replace(/\D/g, '').slice(0, 10)); setPkgErrors(p => ({ ...p, mobile: false })); }}
                    className={`w-full h-8 rounded-xl border bg-white text-slate-900 px-3 text-sm outline-none placeholder:text-slate-400 transition-colors ${pkgErrors.mobile ? 'border-red-500 ring-1 ring-red-500/40' : 'border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500'
                      }`}
                  />
                </div>
                <div className="sm:col-span-2 lg:col-span-1 flex items-end">
                  <button
                    onClick={handlePackageEnquiry}
                    className="w-full h-10 rounded-xl font-bold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-1 text-white shadow-lg shadow-teal-500/30"
                    style={{ background: 'linear-gradient(135deg, #14b8a6, #06b6d4)', color: '#000' }}
                  >
                    <Package size={14} />
                    Send Enquiry via WhatsApp
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        /* ── Cab Booking Fields ── */
        <div className="flex flex-col lg:flex-row items-stretch lg:items-end gap-4 w-full">

          {isAirport ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-1 gap-4 w-full">
              <div className="w-full sm:col-span-2 lg:w-48 shrink-0">
                <label className="block text-[11px] font-semibold text-slate-900 mb-1">Trip</label>
                <select
                  value={airportTripType}
                  onChange={e => setAirportTripType(e.target.value as 'drop' | 'pickup')}
                  className="w-full h-8 rounded-xl border border-slate-200 bg-white text-slate-900 px-3 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 font-medium"
                >
                  <option value="drop">Drop to Airport</option>
                  <option value="pickup">Pickup from Airport</option>
                </select>
              </div>
              <div className="w-full flex-1">
                <CityInput id="airport-from" label={airportTripType === 'drop' ? 'Pickup City' : 'Drop City'} value={from} onChange={setFrom} suggestions={fromCities} />
              </div>
              <div className="w-full flex-1">
                <CityInput id="airport-to" label={airportTripType === 'drop' ? 'Drop Airport' : 'Pickup Airport'} value={to} onChange={setTo} suggestions={airportSuggestions} />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-1 gap-4 w-full">
              <div className="w-full flex-1">
                <CityInput id="from" label="From" value={from} onChange={setFrom} suggestions={fromCities} />
              </div>

              {!isLocal && (
                <div className="w-full flex-1">
                  <CityInput id="to" label="To" value={to} onChange={setTo} suggestions={toCities} />
                </div>
              )}
            </div>
          )}

          {/* Date & Time Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:flex lg:flex-1 gap-4 w-full">
            <div className="w-full flex-1">
              <label className="block text-[11px] font-semibold text-slate-900 mb-1">Pickup Date</label>
              <input
                type="date"
                min={today}
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full h-8 rounded-xl border border-slate-200 bg-white text-slate-900 px-3 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 font-medium"
              />
            </div>

            <div className="w-full flex-1">
              <label className="block text-[11px] font-semibold text-slate-900 mb-1">Pickup Time</label>
              <input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                className="w-full h-8 rounded-xl border border-slate-200 bg-white text-slate-900 px-3 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 font-medium"
              />
            </div>

            {isRound && (
              <>
                <div className="w-full flex-1">
                  <label className="block text-[11px] font-semibold text-slate-900 mb-1">Return Date</label>
                  <input
                    type="date"
                    min={date || today}
                    value={returnDate}
                    onChange={e => setReturnDate(e.target.value)}
                    className="w-full h-8 rounded-xl border border-slate-200 bg-white text-slate-900 px-3 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 font-medium"
                  />
                </div>
                <div className="w-full flex-1">
                  <label className="block text-[11px] font-semibold text-slate-900 mb-1">Return Time</label>
                  <input
                    type="time"
                    value={returnTime}
                    onChange={e => setReturnTime(e.target.value)}
                    className="w-full h-8 rounded-xl border border-slate-200 bg-white text-slate-900 px-3 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 font-medium"
                  />
                </div>
              </>
            )}
          </div>

          {/* CTA */}
          <div className="w-full lg:w-auto shrink-0 flex flex-col justify-end mt-2 lg:mt-0">
            <button
              onClick={handleSearch}
              className="w-full lg:w-[180px] h-8 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-teal-500/30"
              style={{ boxShadow: '0 4px 20px var(--glow)' }}
            >
              Explore Cabs →
            </button>
          </div>
        </div>
      )}

      {/* ── Features Footer ── */}
      <div className=" border-t border-slate-100/50">
        <div className="w-full rounded-2xl bg-[#f0f7ff] sm:p-4 flex flex-col sm:flex-row items-center justify-between ">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 flex-1">

            {/* Feature 1 */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-teal-600 flex items-center justify-center text-white shrink-0">
                <ShieldCheck size={14} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-800 leading-tight">Transparent Pricing</span>
                <span className="text-[8px] font-medium text-slate-500 leading-tight">No hidden charges</span>
              </div>
            </div>

            {/* Divider */}
            <div className="hidden sm:block w-px h-8 bg-teal-200/50"></div>

            {/* Feature 2 */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-teal-600 flex items-center justify-center text-white shrink-0">
                <Car size={14} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-800 leading-tight">Wide Range of Vehicles</span>
                <span className="text-[8px] font-medium text-slate-500 leading-tight">Hatchback to Luxury</span>
              </div>
            </div>

            {/* Divider */}
            <div className="hidden sm:block w-px h-8 bg-teal-200/50"></div>

            {/* Feature 3 */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-teal-600 flex items-center justify-center text-white shrink-0">
                <Clock size={14} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-800 leading-tight">Safe & Reliable</span>
                <span className="text-[8px] font-medium text-slate-500 leading-tight">24/7 Support</span>
              </div>
            </div>

          </div>

          {/* Right Text */}
          <div className="flex shrink-0">
            <span className="font-script text-sm sm:text-lg font-bold text-teal-600 leading-tight -rotate-2 drop-shadow-sm text-center sm:text-right pr-2">
              Travel Smart<br />
              <span className="text-xs sm:text-sm">with SK Tours & Travels</span>
            </span>
          </div>
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="mt-4 flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
          <AlertCircle size={16} />
          {error}
        </div>
      )}
    </div>
  );
}