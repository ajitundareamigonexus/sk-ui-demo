'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, CalendarDays, Clock, CheckCircle2, AlertCircle, Loader2, Car } from 'lucide-react';
import Link from 'next/link';
import {
  getSearchQuery,
  getSelectedCab,
  saveBooking,
  clearCurrentSearch,
  getMultiLegDraft,
  clearMultiLegDraft,
  setMultiLegMode,
  saveMultiLegBooking,
} from '@/lib/bookingStore';
import { getCurrentUser, type User } from '@/lib/authStore';
import { COUPONS, calculateFareBreakdown } from '@/data/data';
import { Tag, X, ShieldCheck } from 'lucide-react';
import type { SearchQuery, Cab, BookingContact, PaymentOption, BookingLeg, MultiLegBooking } from '@/lib/types';
import { createBooking, sendBookingOtpApi, verifyBookingOtpApi, updateBookingStatus as updateBookingStatusApi } from '@/services/api';

const TRIP_LABELS: Record<string, string> = {
  oneway: 'One Way',
  round: 'Round Trip',
  local: 'Local',
  airport: 'Airport',
};

function formatDate(dateStr: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function formatTime(timeStr: string) {
  if (!timeStr) return '—';
  const [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${ampm}`;
}

const inputCls =
  'w-full h-10 rounded-xl bg-background border border-border px-3 outline-none ' +
  'focus:border-primary transition-colors duration-200 text-sm placeholder:text-muted';

const errInputCls =
  'w-full h-10 rounded-xl bg-background border border-red-500 px-3 outline-none ' +
  'focus:border-red-400 transition-colors duration-200 text-sm placeholder:text-muted';

export default function BookingPage() {
  const router = useRouter();

  const [search, setSearch] = useState<SearchQuery | null>(null);
  const [cab, setCab] = useState<Cab | null>(null);
  // ── Multi-leg state ──────────────────────────────────────────────────────
  const [multiLegs, setMultiLegs] = useState<BookingLeg[]>([]);
  const isMultiLeg = multiLegs.length > 0;
  // ────────────────────────────────────────────────────────────────────────
  const [payment, setPayment] = useState<PaymentOption>('zero');
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<Omit<User, 'password'> | null>(null);

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; label: string } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  const [form, setForm] = useState<BookingContact>({
    fullName: '',
    mobile: '',
    email: '',
    gstNumber: '',
    pickupAddress: '',
    dropAddress: '',
  });

  // Return trip extra address fields
  const [returnPickupAddress, setReturnPickupAddress] = useState('');
  const [returnDropAddress, setReturnDropAddress] = useState('');

  const [errors, setErrors] = useState<Partial<Record<keyof BookingContact, string>>>({});
  const [globalError, setGlobalError] = useState('');
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Wizard states
  const [step, setStep] = useState(1);
  const [preferredLogin, setPreferredLogin] = useState('');
  const [preferredLoginError, setPreferredLoginError] = useState('');

  // OTP Modal states
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpVerifying, setOtpVerifying] = useState(false);

  useEffect(() => {
    const activeUser = getCurrentUser();

    setSearch(getSearchQuery());
    setCab(getSelectedCab());

    if (activeUser) {
      setUser(activeUser);

      if (activeUser.role !== 'admin') {
        setForm(prev => ({
          ...prev,
          fullName: activeUser.fullName || '',
          email: activeUser.email || '',
          mobile: activeUser.mobile || '',
        }));
      }
    }

    setCheckingAuth(false);
  }, [router]);

  /* ── Derived prices — single leg or multi-leg aggregate ── */
  const fareBreakdown = cab
    ? calculateFareBreakdown(cab, search?.date ?? '', search?.returnDate, search?.tripType)
    : null;

  // Single-leg values (used as fallback when not multi-leg)
  const singleBaseFare = fareBreakdown?.baseFare ?? 0;
  const singleGst = fareBreakdown?.gst ?? 0;
  const singleSubtotal = fareBreakdown?.subtotal ?? 0;

  // Multi-leg aggregates
  const multiBaseFare = multiLegs.reduce((s, l) => s + l.baseFare, 0);
  const multiGst = multiLegs.reduce((s, l) => s + l.gst, 0);
  const multiSubtotal = multiLegs.reduce((s, l) => s + l.totalFare, 0);

  const baseFare = isMultiLeg ? multiBaseFare : singleBaseFare;
  const gst = isMultiLeg ? multiGst : singleGst;
  const subtotal = isMultiLeg ? multiSubtotal : singleSubtotal;
  const discount = appliedCoupon?.discount ?? 0;
  const total = Math.max(0, subtotal - discount);

  // Advance amount for selected cab
  const advancePct = cab?.advancePercent ?? 20;
  const advanceAmount = Math.round((total * advancePct) / 100);

  /* ── Coupon handlers ── */
  const handleApplyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) { setCouponError('Please enter a coupon code'); return; }
    const coupon = COUPONS[code];
    if (!coupon) { setCouponError('Invalid coupon code'); setCouponSuccess(''); return; }
    if (coupon.minFare && subtotal < coupon.minFare) {
      setCouponError(`Minimum fare ₹${coupon.minFare.toLocaleString('en-IN')} required for this coupon`);
      setCouponSuccess('');
      return;
    }
    const discountAmt = coupon.type === 'percent'
      ? Math.round((subtotal * coupon.discount) / 100)
      : coupon.discount;
    setAppliedCoupon({ code, discount: discountAmt, label: coupon.label });
    setCouponError('');
    setCouponSuccess(`🎉 Coupon applied! You save ₹${discountAmt.toLocaleString('en-IN')}`);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError('');
    setCouponSuccess('');
  };

  /* ── Form helpers ── */
  const set = (field: keyof BookingContact) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }));

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof BookingContact, string>> = {};
    let isPrefLoginValid = true;

    if (!preferredLogin) {
      setPreferredLoginError('Please select a preferred login option.');
      isPrefLoginValid = false;
    } else {
      setPreferredLoginError('');
    }

    if (!form.fullName.trim())
      newErrors.fullName = 'Full name is required';

    if (!/^[6-9]\d{9}$/.test(form.mobile))
      newErrors.mobile = 'Enter a valid 10-digit mobile number';

    if (preferredLogin === 'email') {
      if (!form.email.trim()) {
        newErrors.email = 'Email ID is required when Email Login option is selected';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        newErrors.email = 'Enter a valid email address';
      }
    } else {
      if (
        form.email.trim() &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
      ) {
        newErrors.email = 'Enter a valid email address';
      }
    }

    const tripType = search?.tripType;
    const airportTripType = search?.airportTripType;

    const isPickupAddressRequired = !(tripType === 'airport' && airportTripType === 'pickup');
    const isDropAddressRequired = tripType !== 'local' && !(tripType === 'airport' && airportTripType === 'drop');

    if (isPickupAddressRequired && !form.pickupAddress.trim()) {
      newErrors.pickupAddress = 'Pickup address is required';
    }

    if (isDropAddressRequired && !form.dropAddress.trim()) {
      newErrors.dropAddress = 'Drop address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 && isPrefLoginValid;
  };

  const handleNext = () => {
    if (validate()) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleConfirm = async () => {
    setGlobalError('');

    if (!search || !cab) {
      setGlobalError('Missing booking details. Please go back and search again.');
      return;
    }

    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await sendBookingOtpApi(form.email);
      setSubmitting(false);

      if (res === 'OTP sent successfully') {
        setOtpCode('');
        setOtpError('');
        setShowOtpModal(true);
      } else {
        setGlobalError('Failed to send verification OTP. Please try again.');
      }
    } catch (err: any) {
      setSubmitting(false);
      setGlobalError('Failed to send verification OTP. Please check your connection.');
      console.error(err);
    }
  };

  const handleVerifyOtp = async () => {
    setOtpError('');

    if (!otpCode.trim()) {
      setOtpError('Please enter OTP');
      return;
    }

    setOtpVerifying(true);

    try {
      // 1. Verify OTP with backend
      let authToken: string | null = null;
      try {
        const authRes = await verifyBookingOtpApi(
          form.email,
          otpCode,
          form.fullName,
          form.mobile,
          preferredLogin.toUpperCase()
        );

        if (authRes?.token) {
          // Save session
          const role = authRes.role === 'ADMIN' ? 'admin' : 'user';
          const sessionUser = {
            id: authRes.id ? String(authRes.id) : `u-${Date.now()}`,
            fullName: authRes.fullName || '',
            email: authRes.email || '',
            mobile: authRes.mobile || '',
            role,
          };
          authToken = authRes.token;
          localStorage.setItem('token', authRes.token);
          localStorage.setItem('user', JSON.stringify(authRes));
          localStorage.setItem('sk_active_session', JSON.stringify(sessionUser));
          window.dispatchEvent(new Event('storage'));
          window.dispatchEvent(new CustomEvent('authChange'));
        } else {
          // API responded but no token = invalid OTP
          setOtpError('Invalid OTP. Please try again.');
          setOtpVerifying(false);
          return;
        }
      } catch (otpErr: any) {
        // If the error is a 4xx (bad OTP) → show error and stop
        const status = otpErr?.response?.status;
        if (status && status >= 400 && status < 500) {
          setOtpError(otpErr?.response?.data?.message || 'Invalid OTP. Please try again.');
          setOtpVerifying(false);
          return;
        }
        // Network/server error → continue with local booking (no token)
        console.warn('OTP API unavailable, proceeding with local booking:', otpErr?.message);
      }

      // ── Map frontend PaymentOption → backend PaymentType enum ──────────────
      const paymentTypeMap: Record<string, string> = {
        zero: 'BOOKATZERO',
        advance: 'ADVPAY',
        full: 'FULLPAY',
      };
      const pType = paymentTypeMap[payment] || 'BOOKATZERO';

      const buildPickupDateTime = (date: string, time: string) => {
        if (!date || !time) return undefined;
        return `${date}T${time}:00+05:30`;
      };

      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      if (isMultiLeg) {
        // ── 1. Multi-Leg Booking Flow ───────────────────────────────────────
        const updatedLegs = [...multiLegs];

        if (token) {
          // Post each leg to backend individually
          for (let i = 0; i < updatedLegs.length; i++) {
            const leg = updatedLegs[i];
            const bookingTypeMap: Record<string, string> = {
              oneway: 'ONEWAY', round: 'ROUND', local: 'LOCAL', airport: 'AIRPORT',
            };

            const payload = {
              vehicleMasterId: String(leg.cab.id),
              bookingType: bookingTypeMap[leg.search.tripType] || 'ONEWAY',
              from: leg.search.from,
              to: leg.search.tripType === 'local' ? 'Local' : leg.search.to,
              onewayPickup: buildPickupDateTime(leg.search.date, leg.search.time),
              returnPickup: leg.search.tripType === 'round' ? buildPickupDateTime(leg.search.returnDate || '', leg.search.returnTime || '') : undefined,
              onwardPickupAddress: leg.pickupAddress || form.pickupAddress,
              onwardDropAddress: leg.dropAddress || form.dropAddress,
              paymentType: pType,
              totalFare: leg.totalFare,
              gstAmount: leg.gst,
              advanceFare: payment === 'advance' ? Math.round((leg.totalFare * (leg.cab.advancePercent || 20)) / 100) : payment === 'full' ? leg.totalFare : 0,
              balanceFare: payment === 'advance' ? (leg.totalFare - Math.round((leg.totalFare * (leg.cab.advancePercent || 20)) / 100)) : payment === 'full' ? 0 : leg.totalFare,
            };

            try {
              const saved = await createBooking(payload);
              if (saved?.bookingRefId) {
                updatedLegs[i].backendBookingRef = saved.bookingRefId;
                if (payment === 'zero') {
                  await updateBookingStatusApi(saved.bookingRefId, "REQUESTED");
                }
              }
            } catch (err) {
              console.error(`Failed to post leg ${i + 1}:`, err);
            }
          }
        }

        saveMultiLegBooking({
          legs: updatedLegs,
          contact: form,
          couponCode: appliedCoupon?.code,
          discount: discount,
          grandTotal: total,
          paymentOption: payment,
        });

      } else {
        // ── 2. Single-Leg Booking Flow ──────────────────────────────────────
        const bookingTypeMap: Record<string, string> = {
          oneway: 'ONEWAY', round: 'ROUND', local: 'LOCAL', airport: 'AIRPORT',
        };

        const pickupAddressVal = search!.tripType === 'airport' && search!.airportTripType === 'pickup'
          ? (form.pickupAddress.trim() || `Pickup from ${search!.from}`)
          : form.pickupAddress;

        const dropAddressVal = search!.tripType === 'local'
          ? 'Local Trip'
          : (search!.tripType === 'airport' && search!.airportTripType === 'drop'
            ? (form.dropAddress.trim() || `Drop at ${search!.to}`)
            : form.dropAddress);

        const payload = {
          vehicleMasterId: String(cab!.id),
          bookingType: bookingTypeMap[search!.tripType] || 'ONEWAY',
          from: search!.from,
          to: search!.tripType === 'local' ? 'Local' : search!.to,
          onewayPickup: buildPickupDateTime(search!.date, search!.time),
          returnPickup: search!.tripType === 'round' ? buildPickupDateTime(search!.returnDate || '', search!.returnTime || '') : undefined,
          onwardPickupAddress: pickupAddressVal,
          onwardDropAddress: dropAddressVal,
          returnPickupAddress: search!.tripType === 'round' ? (returnPickupAddress.trim() || pickupAddressVal) : undefined,
          returnDropAddress: search!.tripType === 'round' ? (returnDropAddress.trim() || dropAddressVal) : undefined,
          paymentType: pType,
          totalFare: total,
          gstAmount: gst,
          advanceFare: payment === 'advance' ? advanceAmount : payment === 'full' ? total : 0,
          balanceFare: payment === 'advance' ? (total - advanceAmount) : payment === 'full' ? 0 : total,
        };

        let savedBooking = null;
        if (token) {
          try {
            savedBooking = await createBooking(payload);
          } catch (err: any) {
            console.error('Failed to post booking to Spring Boot API, falling back locally:', err);
          }
        }

        saveBooking({
          searchQuery: search!,
          selectedCab: cab!,
          contact: form,
          paymentOption: payment,
          baseFare,
          gst,
          discount,
          totalFare: total,
          couponCode: appliedCoupon?.code,
          preferredLoginMethod: preferredLogin as 'phone' | 'email' | undefined,
          ...(savedBooking?.bookingRefId ? { id: savedBooking.bookingRefId } : {}),
        });

        if (payment === 'zero' && savedBooking?.bookingRefId) {
          try {
            await updateBookingStatusApi(savedBooking.bookingRefId, "CONFIRMED");
          } catch (e) { }
        }
      }

      // ── Clean up and navigate ───────────────────────────────────────────
      localStorage.setItem('bookingOtpVerified', 'true');
      clearCurrentSearch();
      clearMultiLegDraft();
      setShowOtpModal(false);

      if (payment === 'zero') {
        localStorage.setItem('paymentVerified', 'true');
        localStorage.removeItem('bookingOtpVerified');
        router.replace("/booking/confirmation");
        return;
      }

      localStorage.setItem('paymentVerified', 'false');
      router.replace('/booking/payment');
    } catch (err: any) {
      console.error(err);
      setOtpError(err?.response?.data?.message || err?.message || 'Failed to confirm booking. Please try again.');
    } finally {
      setOtpVerifying(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
      </div>
    );
  }
  return (
    <section className="min-h-screen bg-background text-foreground px-4 py-20 transition-colors duration-300">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-[1fr_380px] gap-8">

        {/* ════ LEFT ════ */}
        <div className="space-y-4">

          {/* Booking Review */}
          <div className="rounded-2xl border border-teal-500/20 overflow-hidden">
            <div className="bg-teal-500 text-black px-2 py-2 font-bold text-xl">
              Review Your Booking
            </div>

            <div className="p-3 bg-card">
              {isMultiLeg ? (
                <>
                  <div className="space-y-4">
                    {multiLegs.map((leg, idx) => (
                      <div key={idx} className="border border-border rounded-xl p-3 bg-surface/30">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 text-xs font-black flex items-center justify-center">
                            {leg.legNumber}
                          </span>
                          <span className="text-green-400 font-semibold text-sm">{leg.search.from}</span>
                          <ArrowRight size={14} className="text-muted" />
                          <span className="text-red-400 font-semibold text-sm">{leg.search.to}</span>
                          <span className="ml-auto text-[10px] bg-teal-500/10 text-teal-400 px-2 py-0.5 rounded-full border border-teal-500/20 uppercase font-bold tracking-wider">
                            {TRIP_LABELS[leg.search.tripType]}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted mb-2">
                          <span className="flex items-center gap-1"><CalendarDays size={12} /> {formatDate(leg.search.date)}</span>
                          <span className="flex items-center gap-1"><Clock size={12} /> {formatTime(leg.search.time)}</span>
                          <span className="flex items-center gap-1"><Car size={12} /> {leg.cab.CarType} ({leg.cab.carName})</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-border">
                          <span className="text-xs text-muted">Leg Fare</span>
                          <span className="text-sm font-black text-foreground">₹{leg.totalFare.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Multi-leg Fare Summary */}
                  <div className="flex items-center justify-between border-t border-border pt-4 mt-4">
                    <span className="text-muted font-semibold">Grand Total</span>
                    <div className="text-right">
                      <div className="text-3xl font-black text-teal-400">
                        ₹{total.toLocaleString('en-IN')}
                      </div>
                      <div className="text-xs text-muted">incl. GST</div>
                    </div>
                  </div>
                </>
              ) : search && cab ? (
                <>
                  {/* Route */}
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span className="text-green-400 font-semibold text-lg">{search.from}</span>
                    <ArrowRight size={18} className="text-muted" />
                    <span className="text-red-400 font-semibold text-lg">{search.to}</span>
                    <span className="ml-auto border border-teal-500/20 px-3 py-1 rounded-full text-teal-400 text-sm">
                      {TRIP_LABELS[search.tripType]}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="flex flex-wrap gap-4 text-sm text-muted mb-3 items-center">
                    <span className="font-medium text-foreground">{cab.CarType} ({cab.carName})</span>
                    <span className="flex items-center gap-1">
                      <CalendarDays size={14} />
                      {formatDate(search.date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {formatTime(search.time)}
                    </span>
                    {search.passengers && (
                      <span className="bg-teal-500/10 text-teal-400 border border-teal-500/20 px-2 py-0.5 rounded-full text-xs font-semibold">
                        {search.passengers} Passengers
                      </span>
                    )}
                    <button
                      onClick={() => router.push('/cabs')}
                      className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-teal-400 border border-teal-500/30 bg-teal-500/10 hover:bg-teal-500/20 hover:border-teal-400 px-3 py-1.5 rounded-full transition-all duration-200 hover:scale-105"
                    >
                      🔄 Change Car
                    </button>
                  </div>

                  {/* Fare */}
                  <div className="flex items-center justify-between border-t border-border pt-2">
                    <span className="text-muted">Estimated Fare</span>
                    <div className="text-right">
                      <div className="text-2xl font-black text-teal-400">
                        ₹{baseFare.toLocaleString('en-IN')}
                      </div>
                      <div className="text-sm text-muted">
                        ₹{total.toLocaleString('en-IN')} incl. GST
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-muted text-sm py-4 text-center">
                  No booking details found.{' '}
                  <button
                    onClick={() => router.push('/')}
                    className="text-teal-400 underline"
                  >
                    Go back to search
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Contact & Pickup Form */}
          <div className="rounded-xl border border-border overflow-hidden bg-card">
            <div className="p-2 border-b border-border">
              <h2 className="text-xl font-bold mb-1">Contact &amp; Pickup Details</h2>
              <p className="text-muted text-xs">
                We&apos;ll use these for your booking confirmation and trip updates.
              </p>
            </div>

            {user ? (
              <div className="mx-4 mt-2 px-4 py-3 bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 size={14} className="shrink-0" />
                <span>Logged in as <strong>{user.fullName}</strong>. We have prefilled your contact details!</span>
              </div>
            ) : (
              <div className="mx-4 mt-2 px-6 py-5 bg-yellow-500/1 border border-yellow-500/5 text-muted text-xs rounded-xl flex items-center justify-between gap-2">
                {/* <span>Want to save time and track this booking?</span>
                <Link href={`/auth?redirect=/booking`} className="text-teal-400 font-bold hover:underline shrink-0">
                  Sign In Now &rarr;
                </Link> */}
              </div>
            )}

            <div className="p-4 grid md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium">Full Name *</label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={form.fullName}
                  onChange={set('fullName')}
                  className={errors.fullName ? errInputCls : inputCls}
                />
                {errors.fullName && (
                  <p className="text-red-400 text-xs flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.fullName}
                  </p>
                )}
              </div>

              {/* Mobile */}
              <div>
                <label className="block text-sm font-medium">Mobile No. *</label>
                <input
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={form.mobile}
                  onChange={set('mobile')}
                  maxLength={10}
                  className={errors.mobile ? errInputCls : inputCls}
                />
                {errors.mobile && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.mobile}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium">
                  Email ID {preferredLogin === 'email' ? <span className="text-red-500">*</span> : '(Optional)'}
                </label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={form.email}
                  onChange={set('email')}
                  className={errors.email ? errInputCls : inputCls}
                />
              </div>

              {/* GST */}
              <div>
                <label className="block text-sm font-medium">GST Number (Optional)</label>
                <input
                  type="text"
                  placeholder="15-digit GST number"
                  value={form.gstNumber}
                  onChange={set('gstNumber')}
                  maxLength={15}
                  className={inputCls}
                />
              </div>

              {/* Pickup Address */}
              {(!(search?.tripType === 'airport' && search?.airportTripType === 'pickup')) ? (
                <div>
                  <label className="block text-sm font-medium">Pickup Address *</label>
                  <input
                    type="text"
                    placeholder="Building, area, landmark"
                    value={form.pickupAddress}
                    onChange={set('pickupAddress')}
                    className={errors.pickupAddress ? errInputCls : inputCls}
                  />
                  {errors.pickupAddress && (
                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle size={12} /> {errors.pickupAddress}
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium">Flight Details &amp; Terminal (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Flight 6E-2412, Terminal 2"
                    value={form.pickupAddress}
                    onChange={set('pickupAddress')}
                    className={inputCls}
                  />
                </div>
              )}

              {/* Drop Address */}
              {search?.tripType !== 'local' && (
                (!(search?.tripType === 'airport' && search?.airportTripType === 'drop')) ? (
                  <div>
                    <label className="block text-sm font-medium">Drop Address *</label>
                    <input
                      type="text"
                      placeholder="Building, area, landmark"
                      value={form.dropAddress}
                      onChange={set('dropAddress')}
                      className={errors.dropAddress ? errInputCls : inputCls}
                    />
                    {errors.dropAddress && (
                      <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle size={12} /> {errors.dropAddress}
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium">Flight Details &amp; Terminal (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Flight 6E-2412, Terminal 2"
                      value={form.dropAddress}
                      onChange={set('dropAddress')}
                      className={inputCls}
                    />
                  </div>
                )
              )}

              {/* ── Round Trip Return Addresses ── */}
              {search?.tripType === 'round' && (
                <>
                  <div>
                    <label className="block text-sm font-medium">Return Pickup Address</label>
                    <input
                      type="text"
                      placeholder="Where to pick you up for return"
                      value={returnPickupAddress}
                      onChange={e => setReturnPickupAddress(e.target.value)}
                      className={inputCls}
                    />
                    <p className="text-xs text-muted mt-0.5">Leave blank to use same as onward pickup</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Return Drop Address</label>
                    <input
                      type="text"
                      placeholder="Where to drop you on return"
                      value={returnDropAddress}
                      onChange={e => setReturnDropAddress(e.target.value)}
                      className={inputCls}
                    />
                    <p className="text-xs text-muted mt-0.5">Leave blank to use same as onward drop</p>
                  </div>
                </>
              )}
            </div>

            {/* Preferred Login Option Widget - Full Width within Contact & Pickup details card */}
            <div className={`mx-4 mb-4 p-4 rounded-xl border space-y-3 transition-colors ${preferredLoginError ? 'border-red-500/20 bg-red-500/5' : 'border-teal-500/10 bg-teal-500/5'}`}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="font-bold text-sm text-teal-400 flex items-center gap-1.5">
                  Preferred Login Option for Next Time
                  <span className="text-red-500">*</span>
                  <span className="font-normal text-xs text-teal-400">
                    (OTP-based)
                  </span>
                </h3>

                {preferredLoginError && (
                  <span className="text-xs text-red-500 font-semibold flex items-center">
                    <AlertCircle size={12} />
                    {preferredLoginError}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-6 text-xs font-semibold pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="radio"
                    name="preferredLoginType"
                    checked={preferredLogin === 'phone'}
                    onChange={() => {
                      setPreferredLogin('phone');
                      setPreferredLoginError('');
                    }}
                    className="accent-teal-400 w-4 h-4 cursor-pointer"
                  />
                  <span className={preferredLoginError ? 'text-red-400' : ''}>Phone Number</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="radio"
                    name="preferredLoginType"
                    checked={preferredLogin === 'email'}
                    onChange={() => {
                      setPreferredLogin('email');
                      setPreferredLoginError('');
                    }}
                    className="accent-teal-400 w-4 h-4 cursor-pointer"
                  />
                  <span className={preferredLoginError ? 'text-red-400' : ''}>Email ID</span>
                </label>
              </div>
            </div>

            {/* Wizard Navigation / Next button (Full Width at the bottom of the card) */}
            <div className="p-4 border-t border-border flex justify-between items-center bg-background/30">
              {step === 2 ? (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="h-10 px-4 rounded-xl border border-border text-muted hover:text-foreground text-sm font-semibold transition-all hover:bg-card"
                >
                  &larr; Edit Details
                </button>
              ) : (
                <div />
              )}

              {step === 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="h-10 px-6 rounded-xl bg-teal-400 text-black font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
                >
                  Next <ArrowRight size={16} />
                </button>
              ) : (
                <span className="text-xs text-teal-400 font-semibold flex items-center gap-1.5 bg-teal-500/10 px-3 py-1.5 rounded-full border border-teal-500/20">
                  <CheckCircle2 size={14} /> Details Confirmed
                </span>
              )}
            </div>

          </div>
        </div>

        {/* ════ RIGHT ════ */}
        <div className="space-y-4 lg:sticky lg:top-24 self-start">
          {/* Booking Summary */}
          <div className="rounded-xl border border-teal-500/30 bg-teal-500/5 p-4 space-y-3">
            <h3 className="font-bold text-teal-400 text-sm border-b border-teal-500/20 pb-2">📋 Booking Summary</h3>
            <div className="space-y-2 text-sm">

              <div className="flex justify-between border-b border-border pb-1">
                <span className="text-muted">Customer</span>
                <span className="font-semibold">{form.fullName || '—'}</span>
              </div>

              <div className="flex justify-between border-b border-border pb-1">
                <span className="text-muted">Route</span>
                <span className="font-semibold text-right max-w-[70%] break-words">
                  {search?.from || '—'},{form.pickupAddress || '—'} → {search?.to || '—'},{form.dropAddress || '—'}
                </span>
              </div>
              <div className="flex justify-between border-b border-border pb-1">
                <span className="text-muted">Travel Date & Time</span>
                <span className="font-semibold text-right">
                  {search
                    ? `${formatDate(search.date)} | ${formatTime(search.time)}`
                    : '—'}
                </span>
              </div>

              <div className="flex justify-between border-b border-border pb-1">
                <span className="text-muted">Cab</span>
                <span className="font-semibold text-right">
                  {cab ? `${cab.CarType}` : '—'}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted">Fare</span>
                <span className="font-bold text-teal-400">
                  ₹{total.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Options */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="p-1 border-b border-border">
              <h2 className="text-lg font-bold">Payment Options</h2>
            </div>

            <div className="p-2 space-y-2">

              {/* Book at Zero */}
              <button
                onClick={() => setPayment('zero')}
                className={`w-full rounded-xl p-3 border-2 text-left transition-all duration-200
                  ${payment === 'zero'
                    ? 'border-teal-400 bg-teal-400/5'
                    : 'border-border hover:border-teal-400/40'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-sm">Book at Zero</h3>
                    <p className="text-muted text-xs">Pay later — pay the driver directly</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-teal-400">₹0</span>
                    {payment === 'zero' && (
                      <CheckCircle2 size={20} className="text-teal-400" />
                    )}
                  </div>
                </div>
              </button>

              {/* Advance Pay */}
              <button
                onClick={() => setPayment('advance')}
                className={`w-full rounded-xl p-2 border-2 text-left transition-all duration-200
                  ${payment === 'advance'
                    ? 'border-amber-400 bg-amber-400/5'
                    : 'border-border hover:border-amber-400/40'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm">Advance Pay</h3>
                      <span className="text-xs bg-amber-400/20 text-amber-400 border border-amber-400/30 px-2 py-0.5 rounded-full font-semibold">
                        {advancePct}% now
                      </span>
                    </div>
                    <p className="text-muted text-sm mt-0.5">Pay {advancePct}% advance — rest to driver</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="text-xl font-black text-amber-400">₹{advanceAmount.toLocaleString('en-IN')}</div>
                      <div className="text-xs text-muted">of ₹{total.toLocaleString('en-IN')}</div>
                    </div>
                    {payment === 'advance' && (
                      <CheckCircle2 size={20} className="text-amber-400" />
                    )}
                  </div>
                </div>
              </button>

              {/* Full Pay */}
              <button
                onClick={() => setPayment('full')}
                className={`w-full rounded-xl p-2 border-2 text-left transition-all duration-200
                  ${payment === 'full'
                    ? 'border-teal-400 bg-teal-400/5'
                    : 'border-border hover:border-teal-400/40'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-sm">Full Pay</h3>
                    <p className="text-muted text-xs">Pay full amount now online</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-teal-400">
                      ₹{total.toLocaleString('en-IN')}
                    </span>
                    {payment === 'full' && (
                      <CheckCircle2 size={20} className="text-teal-400" />
                    )}
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Apply Coupon */}
          {/* <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="p-3 border-b border-border flex items-center gap-2">
              <Tag size={18} className="text-teal-400" />
              <h2 className="text-lg font-bold">Apply Coupon</h2>
            </div>
            <div className="p-2">
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-teal-500/10 border border-teal-500/30 rounded-xl px-4 py-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-teal-400" />
                      <span className="font-bold text-teal-400 text-sm">{appliedCoupon.code}</span>
                    </div>
                    <p className="text-xs text-muted mt-0.5">
                      You save ₹{appliedCoupon.discount.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-muted hover:text-red-400 transition-colors p-1 rounded-full hover:bg-red-500/10"
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Enter coupon code (e.g. FIRST10)"
                      value={couponInput}
                      onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponError(''); }}
                      onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                      className="flex-1 h-8 rounded-xl bg-background border border-border px-4 outline-none focus:border-teal-400 transition-colors text-sm placeholder:text-muted uppercase tracking-widest font-mono"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      className="h-8 px-2 rounded-xl bg-teal-400 text-black font-bold text-sm hover:bg-teal-300 transition-all hover:scale-105 shrink-0"
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                      <AlertCircle size={12} /> {couponError}
                    </p>
                  )}
                  {couponSuccess && (
                    <p className="text-teal-400 text-xs mt-2">{couponSuccess}</p>
                  )}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {Object.entries(COUPONS).map(([code, c]) => (
                      <button
                        key={code}
                        onClick={() => { setCouponInput(code); setCouponError(''); }}
                        className="text-xs border border-dashed border-teal-500/30 text-teal-400 px-3 py-1 rounded-full hover:bg-teal-500/10 transition-colors font-mono"
                      >
                        {code}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div> */}

          {/* Fare Breakdown */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="p-2 border-b border-border">
              <h2 className="text-lg font-bold">Fare Summary</h2>
            </div>

            <div className="p-2 space-y-2">
              {/* Days badge for multi-day */}
              {fareBreakdown && fareBreakdown.days > 1 && (
                <div className="flex items-center justify-between bg-teal-500/5 border border-teal-500/15 rounded-lg px-3 py-1.5 text-xs">
                  <span className="text-teal-400 font-semibold">Trip Duration</span>
                  <span className="font-bold text-foreground">{fareBreakdown.days} days</span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-muted">
                  Base Fare
                  {fareBreakdown && fareBreakdown.days > 1 && (
                    <span className="text-xs text-muted ml-1">(×{fareBreakdown.days})</span>
                  )}
                </span>
                <span>₹{baseFare.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">GST (5%)</span>
                <span>₹{gst.toLocaleString('en-IN')}</span>
              </div>

              {fareBreakdown && fareBreakdown.extraKmRate > 0 && (
                <div className="flex justify-between text-xs bg-amber-400/5 border border-amber-400/15 rounded-lg px-3 py-1.5">
                  <span className="font-semibold text-amber-400">₹{fareBreakdown.extraKmRate}/km</span>
                </div>
              )}

              {appliedCoupon && (
                <div className="flex justify-between text-sm">
                  <span className="text-teal-400 flex items-center gap-1">
                    <Tag size={12} /> Coupon ({appliedCoupon.code})
                  </span>
                  <span className="text-teal-400 font-semibold">-₹{appliedCoupon.discount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="border-t border-border pt-2 flex justify-between text-md font-bold">
                <span>Total Fare</span>
                <span className="text-teal-400">₹{total.toLocaleString('en-IN')}</span>
              </div>
              <div className="h-[42px]">
                {payment === 'advance' ? (
                  <div className="flex justify-between text-sm bg-amber-400/10 border border-amber-400/20 rounded-xl px-3 py-2">
                    <span className="text-amber-400 font-medium">
                      Pay Now ({advancePct}%)
                    </span>
                    <span className="text-amber-400 font-bold">
                      ₹{advanceAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                ) : (
                  <div />
                )}
              </div>

              {/* Global error */}
              {globalError && (
                <div className="flex items-start gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-2 py-2">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  {globalError}
                </div>
              )}
              <button
                onClick={handleConfirm}
                disabled={submitting || step === 1}
                className="w-full h-[40px] rounded-xl font-bold text-md flex items-center justify-center gap-2 transition-all bg-teal-400 text-black hover:scale-[0.95] disabled:bg-gray-400 disabled:text-gray-700 disabled:hover:scale-100 disabled:cursor-not-allowed disabled:opacity-100"
              >
                {submitting ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Processing…
                  </>
                ) : (
                  'Confirm Booking'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* OTP Verification Modal Overlay */}
        {showOtpModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
            <div className="w-full max-w-md bg-card border border-teal-500/20 rounded-3xl p-6 shadow-2xl space-y-6 relative animate-scale-in">
              {/* Close button */}
              <button
                onClick={() => setShowOtpModal(false)}
                className="absolute top-4 right-4 text-muted hover:text-foreground hover:bg-muted/10 p-1.5 rounded-full transition cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="flex justify-center pt-2">
                <div className="w-14 h-14 rounded-full bg-teal-500/10 flex items-center justify-center">
                  <ShieldCheck className="text-teal-400" size={30} />
                </div>
              </div>

              <div className="text-center space-y-1">
                <h3 className="text-xl font-bold text-foreground">Mobile Verification</h3>
                <p className="text-sm text-muted">
                  We have generated a 6-digit OTP code to verify your mobile booking.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted">Enter OTP Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 123456"
                    className="w-full h-12 rounded-xl bg-background border border-border px-4 text-center text-lg font-mono font-bold tracking-widest outline-none focus:border-teal-400 transition"
                  />
                </div>

                {otpError && (
                  <div className="flex items-start gap-2 text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                    <AlertCircle size={14} className="mt-0.5 shrink-0" />
                    <span>{otpError}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={otpVerifying}
                  className="w-full h-12 rounded-xl bg-teal-400 text-black font-bold hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-75 cursor-pointer"
                >
                  {otpVerifying ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> Verifying OTP...
                    </>
                  ) : (
                    'Verify & Proceed'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}