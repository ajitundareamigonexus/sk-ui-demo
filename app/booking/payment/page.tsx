'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    QrCode,
    RefreshCw,
    AlertCircle,
    Loader2,
    ArrowLeft,
    CheckCircle2,
    Copy,
    Calendar,
    MapPin,
    Car,
    User,
    Phone,
    Clock,
    Check
} from 'lucide-react';
import { getLatestBooking } from '@/lib/bookingStore';
import type { Booking } from '@/lib/types';
import { updateBookingStatus as updateBookingStatusApi } from '@/services/api';

export default function PaymentPage() {
    const router = useRouter();

    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(false);

    const [paymentType, setPaymentType] = useState('');
    const [amount, setAmount] = useState(0);
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
    const [copySuccess, setCopySuccess] = useState(false);

    useEffect(() => {
        // Ensure OTP was verified on the booking page first
        const isOtpVerified = localStorage.getItem('bookingOtpVerified') === 'true';
        if (!isOtpVerified) {
            router.push('/');
            return;
        }

        const activeBooking = getLatestBooking();

        if (!activeBooking) {
            router.push('/');
            return;
        }

        setBooking(activeBooking);
        setPaymentType(activeBooking.paymentOption);

        if (activeBooking.paymentOption === 'zero') {
            router.replace('/booking/confirmation');
            return;
        }

        if (activeBooking.paymentOption === 'advance') {
            setAmount(Math.round(activeBooking.totalFare * 0.2));
        } else {
            setAmount(activeBooking.totalFare);
        }
    }, [router]);

    // Timer countdown effect for UPI QR
    useEffect(() => {
        if (timeLeft <= 0) return;
        const interval = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [timeLeft]);

    const formatTimeLeft = (sec: number) => {
        const m = Math.floor(sec / 60).toString().padStart(2, '0');
        const s = (sec % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    // const handleConfirmPayment = () => {
    //     setLoading(true);

    //     setTimeout(() => {
    //         localStorage.setItem('paymentVerified', 'true');
    //         localStorage.removeItem('bookingOtpVerified');

    //         await updateBookingStatusApi(
    //             booking.id,
    //             "requested"
    //         );

    //         router.push("/booking/confirmation");
    //     }, 1200);
    // };

    const handleConfirmPayment = async () => {
        if (!booking) return;
        setLoading(true);
        try {
            await updateBookingStatusApi(
                booking.id,
                "CONFIRMED"
            );
            localStorage.setItem("paymentVerified", "true");
            localStorage.removeItem("bookingOtpVerified");

            router.push("/booking/confirmation");
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    const copyToClipboard = () => {
        navigator.clipboard.writeText('skcarrental@okaxis');
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    };

    const resetTimer = () => {
        setTimeLeft(300);
    };

    if (!booking) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
            </div>
        );
    }

    const { searchQuery: sq, selectedCab: cab, contact, totalFare } = booking;
    const remainingAmount = totalFare - amount;

    // QR UPI Payment URL
    const qrData = `upi://pay?pa=skcarrental@okaxis&pn=SK%20Car%20Rental&am=${amount}&tn=Booking%20Payment&cu=INR`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrData)}`;

    return (
        <section className="min-h-screen bg-background text-foreground px-4 py-20 transition-colors duration-300">
            {/* Custom Scanner Line Animation CSS */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes scanner-swipe {
                    0% { top: 0%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
                .scanner-line {
                    position: absolute;
                    left: 0;
                    width: 100%;
                    height: 4px;
                    background: linear-gradient(to right, transparent, var(--color-primary, #2dd4bf), transparent);
                    box-shadow: 0 0 10px var(--color-primary, #2dd4bf);
                    animation: scanner-swipe 2.5s ease-in-out infinite;
                }
            ` }} />

            <div className="max-w-4xl mx-auto">
                {/* Header Back Link */}
                <div className="flex items-center gap-2 mb-6">
                    <button
                        onClick={() => router.push('/')}
                        className="flex items-center gap-2 text-muted hover:text-foreground text-sm font-medium transition cursor-pointer"
                    >
                        <ArrowLeft size={16} /> Back to Home
                    </button>
                </div>

                <div className="flex justify-center">
                    {/* LEFT PANEL: Summary & Payment Details (7 cols on desktop) */}
                    <div className="w-full max-w-3xl space-y-6">
                        {/* Selected Cab & Trip Info */}
                        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Car className="text-teal-400" size={22} /> Trip Summary
                            </h2>
                            <div className="grid sm:grid-cols-2 gap-4 text-sm">
                                <div className="space-y-3">
                                    <div className="flex items-start gap-2">
                                        <MapPin className="text-muted shrink-0 mt-0.5" size={16} />
                                        <div>
                                            <span className="font-semibold text-teal-400">{sq.from}</span>
                                            <span className="mx-2 text-muted">&rarr;</span>
                                            <span className="font-semibold text-teal-400">{sq.to}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="text-muted" size={16} />
                                        <span>{new Date(sq.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="text-muted" size={16} />
                                        <span>{sq.time}</span>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <User className="text-muted" size={16} />
                                        <span className="font-medium">{contact.fullName}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone className="text-muted" size={16} />
                                        <span>{contact.mobile}</span>
                                    </div>
                                    <div className="border-t border-border/60 pt-2 flex items-center justify-between font-semibold">
                                        <span className="text-muted">Vehicle:</span>
                                        <span>{cab.carName} ({cab.CarType})</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Details & QR Code */}
                        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm relative overflow-hidden">
                            {/* Selected Payment Option Header */}
                            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border/60">
                                <div>
                                    <p className="text-xs uppercase tracking-wider text-muted">Selected Mode</p>
                                    <h3 className="text-2xl font-black text-teal-400 mt-1">
                                        {paymentType === 'zero' && 'Book at Zero'}
                                        {paymentType === 'advance' && 'Advance Pay'}
                                        {paymentType === 'full' && 'Full Pay'}
                                    </h3>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-muted">Amount Payable Now</p>
                                    <p className="text-3xl font-black text-teal-400 mt-1">
                                        ₹{amount.toLocaleString('en-IN')}
                                    </p>
                                </div>
                            </div>

                            {paymentType !== 'zero' ? (
                                <div className="grid sm:grid-cols-2 gap-6 items-center">
                                    {/* QR Code Container */}
                                    <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white border border-slate-200 shadow-inner relative max-w-[280px] mx-auto w-full">
                                        {timeLeft > 0 ? (
                                            <div className="relative p-2 bg-white rounded-xl">
                                                <img
                                                    src={qrUrl}
                                                    alt="UPI QR Code"
                                                    className="w-full h-auto rounded-lg max-w-[200px]"
                                                />
                                                {/* Scanner line animation overlay */}
                                                <div className="scanner-line" />
                                            </div>
                                        ) : (
                                            <div className="w-[200px] h-[200px] flex flex-col items-center justify-center text-center p-4 bg-slate-50 rounded-xl">
                                                <AlertCircle className="text-red-500 mb-2" size={36} />
                                                <p className="text-sm font-semibold text-slate-800">QR Code Expired</p>
                                                <button
                                                    onClick={resetTimer}
                                                    className="mt-3 px-4 py-1.5 bg-teal-500 text-white rounded-lg text-xs font-bold hover:bg-teal-600 transition flex items-center gap-1.5 cursor-pointer"
                                                >
                                                    <RefreshCw size={12} /> Refresh
                                                </button>
                                            </div>
                                        )}
                                        {timeLeft > 0 && (
                                            <div className="mt-3 text-center text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                                <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                                                QR Code expires in <span className="font-mono text-red-500">{formatTimeLeft(timeLeft)}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Scan Info */}
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="font-bold text-md mb-1 flex items-center gap-1.5">
                                                <QrCode size={18} className="text-teal-400" /> Scan &amp; Pay
                                            </h4>
                                            <p className="text-sm text-muted">
                                                Scan the QR code with any UPI app (GPay, PhonePe, Paytm, BHIM) to complete the payment of <strong>₹{amount.toLocaleString('en-IN')}</strong>.
                                            </p>
                                        </div>

                                        <div className="p-3 bg-background/50 border border-border rounded-xl space-y-2 text-xs">
                                            <div className="flex justify-between items-center">
                                                <span className="text-muted">UPI ID:</span>
                                                <span className="font-mono font-bold flex items-center gap-1">
                                                    skcarrental@okaxis
                                                    <button
                                                        onClick={copyToClipboard}
                                                        className="text-teal-400 hover:text-teal-300 p-1 transition cursor-pointer"
                                                        title="Copy UPI ID"
                                                    >
                                                        {copySuccess ? <Check size={14} /> : <Copy size={14} />}
                                                    </button>
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted">Payee Name:</span>
                                                <span className="font-semibold">SK Car Rental</span>
                                            </div>
                                        </div>

                                        {paymentType === 'advance' && (
                                            <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl text-xs">
                                                <strong>Note:</strong> Balance amount of <strong>₹{remainingAmount.toLocaleString('en-IN')}</strong> is payable to the driver at the end of the trip.
                                            </div>
                                        )}
                                    </div>
                                    <div className="sm:col-span-2 flex justify-center mt-4">
                                        <button
                                            onClick={handleConfirmPayment}
                                            disabled={loading}
                                            className="w-full max-w-sm h-10 rounded-xl bg-teal-400 text-black font-bold
                                            hover:opacity-90 hover:scale-[1.01] active:scale-[0.99]
                                            transition disabled:opacity-60 shadow-md
                                            flex items-center justify-center gap-2 cursor-pointer text-sm"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 size={18} className="animate-spin" />
                                                    Finalizing Booking...
                                                </>
                                            ) : (
                                                'Complete Your Booking'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-6 text-center space-y-4 max-w-md mx-auto">
                                    <div className="w-16 h-16 rounded-full bg-teal-500/10 flex items-center justify-center mx-auto text-teal-400">
                                        <CheckCircle2 size={36} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg">Zero Payment Required</h4>
                                        <p className="text-sm text-muted mt-1">
                                            No advance payment is needed. Please click the confirmation button to complete your ride booking instantly.
                                        </p>
                                    </div>
                                    <div className="p-4 bg-background/50 border border-border rounded-xl text-sm font-semibold">
                                        Total Payable to Driver: <span className="text-teal-400 text-lg">₹{totalFare.toLocaleString('en-IN')}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}