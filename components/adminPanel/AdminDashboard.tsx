'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, Home, Car, User, Users } from 'lucide-react';
import { getAllCabs } from '@/lib/bookingStore';
import { isAdmin, logout as authLogout } from '@/lib/authStore';
import type { Booking } from '@/lib/types';
import { getAllBookings as getAllBookingsApi, getCabs } from '@/services/api';

import AdminBookings, { normalizeBooking } from './AdminBookings'; // reuse exported normalizeBooking
import AdminFleet from './AdminFleet';
import AdminReports from './AdminReports';
import AdminPackages from './AdminPackages';
import AdminReviews from './AdminReviews';
import AdminDrivers from './AdminDrivers';
import ManageUsers from './Users';
import { initializePermissionsBulk, hasPermission } from '@/helper/permissions-handler';

export default function AdminDashboard() {
    const router = useRouter();
    const [authed, setAuthed] = useState(false);
    const [activeTab, setActiveTab] = useState<'bookings' | 'fleet' | 'drivers' | 'reports' | 'packages' | 'reviews' | 'agents'>('bookings');
    const [, setPermVersion] = useState(0);

    const [bookings, setBookings] = useState<Booking[]>([]);
    const [cabs, setCabs] = useState<any[]>([]);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        if (isAdmin()) {
            setAuthed(true);
            initializePermissionsBulk().then(() => setPermVersion(v => v + 1)).catch(console.error);
        } else {
            setAuthed(false);
        }

        const handlePermUpdate = () => setPermVersion(v => v + 1);
        window.addEventListener('permissionsUpdated', handlePermUpdate);
        return () => window.removeEventListener('permissionsUpdated', handlePermUpdate);
    }, []);

    useEffect(() => {
        if (authed) {
            getAllBookingsApi()
                .then(data => setBookings((data || []).map(normalizeBooking)))
                .catch(err => {
                    console.error('Failed to load admin bookings from backend:', err);
                    setBookings([]);
                });

            getCabs()
                .then(data => setCabs(data || []))
                .catch(err => {
                    console.error('Failed to load cabs from backend:', err);
                    setCabs(getAllCabs());
                });
        }
    }, [authed, refreshKey]);

    const handleLogout = () => {
        authLogout();
        setAuthed(false);
        router.push('/auth');
    };

    if (!authed) {
        return (
            <section className="min-h-screen bg-background text-foreground flex items-center justify-center px-4 py-24">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-2 mb-4">
                            <ShieldCheck size={28} className="text-teal-400" />
                            <span className="text-2xl font-black text-primary">Shree Krushna Travels</span>
                        </div>
                        <p className="text-muted text-sm uppercase tracking-widest">Admin Portal</p>
                    </div>

                    <div className="rounded-3xl border border-card-border bg-card p-8 text-center shadow-lg">
                        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 mx-auto mb-6">
                            <Lock size={28} className="text-red-400" />
                        </div>

                        <h2 className="text-xl font-bold mb-2">Access Restricted</h2>
                        <p className="text-muted text-sm mb-6 leading-relaxed">
                            You must be logged in as an administrator to view booking statistics, manage trips, and export logs.
                        </p>

                        <div className="space-y-3">
                            <button
                                onClick={() => router.push('/sign-up?redirect=/admin')}
                                className="w-full h-12 rounded-xl bg-teal-400 text-black font-bold text-sm
                           hover:scale-[1.01] transition-all active:scale-[0.99] cursor-pointer shadow-md"
                                style={{ boxShadow: '0 4px 16px rgba(34,211,238,0.3)' }}
                            >
                                Sign In as Admin
                            </button>
                            <button
                                onClick={() => router.push('/')}
                                className="w-full h-12 rounded-xl border border-border text-muted font-bold text-sm
                           hover:text-foreground hover:bg-surface/50 transition-all cursor-pointer"
                            >
                                <Home size={14} className="inline mr-1.5 -mt-0.5" />
                                Back to Homepage
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    const ALL_TABS = [
        { key: 'bookings', label: 'Manage Bookings', resource: 'SideBarBookings', operation: 'ViewBookingsPage' },
        { key: 'fleet', label: 'Manage Fleet', resource: 'SideBarFleet', operation: 'ViewFleetPage' },
        { key: 'drivers', label: 'Manage Drivers', resource: 'SideBarDrivers', operation: 'ViewDriversPage' },
        { key: 'reports', label: 'Reports & Analytics', resource: 'SideBarReports', operation: 'ViewReportsPage' },
        { key: 'packages', label: 'Manage Packages', resource: 'SideBarPackages', operation: 'ViewPackagesPage' },
        { key: 'reviews', label: 'Manage Reviews', resource: 'SideBarReviews', operation: 'ViewReviewsPage' },
        { key: 'agents', label: 'Manage User', resource: 'SideBarUsers', operation: 'ViewUsersPage' },
    ] as const;

    const visibleTabs = ALL_TABS.filter(tab => hasPermission(tab.resource, tab.operation));

    return (
        <section className="min-h-screen bg-background text-foreground pt-24 pb-16 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <ShieldCheck size={20} className="text-teal-400" />
                            <h1 className="text-2xl sm:text-3xl font-black">Admin Panel</h1>
                        </div>
                    </div>
                </div>

                {/* Tab bar */}
                <div className="sticky top-16 z-40 flex gap-4 mb-4 border-b border-card-border overflow-x-auto bg-background/95 backdrop-blur-md py-2">
                    {visibleTabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`px-4 py-3 font-semibold transition-colors border-b-2 whitespace-nowrap cursor-pointer ${activeTab === tab.key
                                ? 'text-teal-400 border-teal-400'
                                : 'text-muted border-transparent hover:text-foreground'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {activeTab === 'bookings' && (
                    <AdminBookings bookings={bookings} setBookings={setBookings} />
                )}
                {activeTab === 'fleet' && (
                    <AdminFleet cabs={cabs} setRefreshKey={setRefreshKey} />
                )}
                {activeTab === 'drivers' && (
                    <AdminDrivers />
                )}
                {activeTab === 'reports' && (
                    <AdminReports bookings={bookings} />
                )}
                {activeTab === 'packages' && (
                    <AdminPackages />
                )}
                {activeTab === 'reviews' && (
                    <AdminReviews />
                )}
                {activeTab === 'agents' && (
                    <ManageUsers />
                )}
            </div>
        </section>
    );
}
