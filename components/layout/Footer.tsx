'use client';

import Link from 'next/link';
import {
    Compass,
    Phone,
    Mail,
    MapPin,
    Clock,
    ShieldCheck,
    Car,
    Headphones,
    ChevronRight,
    Sparkles,
} from 'lucide-react';
import { FaFacebookF, FaInstagram, FaXTwitter, FaWhatsapp } from 'react-icons/fa6';

const quickLinks = [
    { label: 'Home', href: '/' },
    { label: 'About Us', href: '/#about' },
    { label: 'Services', href: '/#services' },
    { label: 'Tour Packages', href: '/#packages' },
    { label: 'Car Fleet', href: '/#fleet' },
    { label: 'Popular Routes', href: '/#popular-routes' },
    { label: 'Customer Reviews', href: '/#testimonials' },
    { label: 'Contact Us', href: '/#contact' },
];

const popularServices = [
    { label: 'Pune to Mumbai Cab', href: '/#booking-tabs-section' },
    { label: 'Mumbai to Pune Express', href: '/#booking-tabs-section' },
    { label: 'Pune to Shirdi Darshan', href: '/#packages' },
    { label: 'Pune to Mahabaleshwar Tour', href: '/#packages' },
    { label: 'Pune to Goa Roadtrip', href: '/#packages' },
    { label: 'Airport Pickup & Drop', href: '/#booking-tabs-section' },
    { label: 'Outstation One-Way & Round', href: '/#booking-tabs-section' },
];

const socials = [
    {
        icon: FaWhatsapp,
        href: 'https://wa.me/918796807060?text=Hello%20Shree%20Krushna%20Travels,%20I%20want%20to%20enquire%20about%20cab%20booking',
        label: 'WhatsApp',
        color: 'hover:text-emerald-500 hover:border-emerald-500 hover:bg-emerald-500/10',
    },
    {
        icon: FaInstagram,
        href: 'https://instagram.com',
        label: 'Instagram',
        color: 'hover:text-pink-500 hover:border-pink-500 hover:bg-pink-500/10',
    },
    {
        icon: FaFacebookF,
        href: 'https://facebook.com',
        label: 'Facebook',
        color: 'hover:text-blue-500 hover:border-blue-500 hover:bg-blue-500/10',
    },
    {
        icon: FaXTwitter,
        href: 'https://twitter.com',
        label: 'Twitter / X',
        color: 'hover:text-cyan-500 hover:border-cyan-500 hover:bg-cyan-500/10',
    },
];

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="relative overflow-hidden border-t border-border bg-background text-foreground transition-colors duration-300">
            {/* Background ambient light effects */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div
                    className="absolute -top-24 left-1/4 h-[350px] w-[350px] rounded-full blur-3xl opacity-10 dark:opacity-20"
                    style={{
                        background: 'radial-gradient(circle, rgba(20,184,166,0.6) 0%, transparent 70%)',
                    }}
                />
                <div
                    className="absolute bottom-0 right-1/4 h-[350px] w-[350px] rounded-full blur-3xl opacity-10 dark:opacity-15"
                    style={{
                        background: 'radial-gradient(circle, rgba(45,212,191,0.5) 0%, transparent 70%)',
                    }}
                />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 mb-12">
                    <div className="lg:col-span-4 flex flex-col justify-between">
                        <div>
                            <Link href="/#home" className="flex items-center gap-3 group w-fit">
                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-slate-950 shadow-md group-hover:scale-105 transition-transform duration-300">
                                    <Compass className="w-5 h-5 stroke-[2.5]" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xl font-black tracking-tight text-foreground">
                                        Shree Krushna <span className="text-primary">Travels</span>
                                    </span>
                                    <span className="text-[10px] font-bold tracking-widest uppercase text-muted">
                                        Your Trusted Travel Partner
                                    </span>
                                </div>
                            </Link>

                            <p className="text-muted text-xs sm:text-sm leading-relaxed mt-4 max-w-sm">
                                Maharashtra&apos;s leading car rental and tour package specialist. Providing premium,
                                reliable, and affordable travel solutions across Pune, Mumbai, Nashik, and all major
                                destinations with sanitized cabs and experienced drivers.
                            </p>
                        </div>
                        <div className="mt-6">
                            <span className="text-xs font-bold uppercase tracking-wider text-muted block mb-2.5">
                                Connect With Us
                            </span>
                            <div className="flex items-center gap-2.5">
                                {socials.map((social, i) => {
                                    const Icon = social.icon;
                                    return (
                                        <a
                                            key={i}
                                            href={social.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label={social.label}
                                            className={`w-9 h-9 rounded-xl border border-border bg-surface flex items-center justify-center text-muted transition-all duration-300 hover:scale-110 shadow-sm ${social.color}`}
                                        >
                                            <Icon className="w-4 h-4" />
                                        </a>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <div className="mb-4">
                            <h3 className="text-sm sm:text-base font-bold text-foreground tracking-tight uppercase">
                                Quick Navigation
                            </h3>
                            <div className="h-0.5 w-10 bg-primary rounded-full mt-1.5" />
                        </div>
                        <ul className="space-y-2.5">
                            {quickLinks.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        className="group inline-flex items-center gap-1.5 text-xs sm:text-sm text-muted hover:text-primary transition-colors duration-200"
                                    >
                                        <ChevronRight className="w-3.5 h-3.5 opacity-0 -ml-1 text-primary group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                                        <span>{link.label}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="lg:col-span-3">
                        <div className="mb-4">
                            <h3 className="text-sm sm:text-base font-bold text-foreground tracking-tight uppercase">
                                Popular Services
                            </h3>
                            <div className="h-0.5 w-10 bg-primary rounded-full mt-1.5" />
                        </div>
                        <ul className="space-y-2.5">
                            {popularServices.map((route) => (
                                <li key={route.label}>
                                    <Link
                                        href={route.href}
                                        className="group inline-flex items-center gap-1.5 text-xs sm:text-sm text-muted hover:text-primary transition-colors duration-200"
                                    >
                                        <ChevronRight className="w-3.5 h-3.5 opacity-0 -ml-1 text-primary group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                                        <span>{route.label}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="lg:col-span-3 flex flex-col justify-between">
                        <div>
                            <div className="mb-4">
                                <h3 className="text-sm sm:text-base font-bold text-foreground tracking-tight uppercase">
                                    24/7 Helpline
                                </h3>
                                <div className="h-0.5 w-10 bg-primary rounded-full mt-1.5" />
                            </div>

                            <div className="space-y-3.5">
                                <a
                                    href="tel:+918796807060"
                                    className="flex items-start gap-3 p-2.5 rounded-xl border border-border bg-surface hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 group shadow-xs"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                        <Phone className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                Call Anytime
                                            </span>
                                        </div>
                                        <div className="text-sm font-bold text-foreground mt-0.5 group-hover:text-primary transition-colors">
                                            +91 8796807060
                                        </div>
                                    </div>
                                </a>

                                <a
                                    href="mailto:Skholidays9000@gmail.com"
                                    className="flex items-start gap-3 p-2.5 rounded-xl border border-border bg-surface hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 group shadow-xs"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-bold tracking-wider uppercase text-muted">
                                            Email Support
                                        </span>
                                        <div className="text-xs font-medium text-foreground mt-0.5 group-hover:text-primary transition-colors break-all">
                                            Skholidays9000@gmail.com
                                        </div>
                                    </div>
                                </a>

                                <div className="flex items-start gap-3 px-2 py-1">
                                    <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                    <span className="text-xs text-muted">
                                        Pune, Maharashtra, India
                                    </span>
                                </div>

                                <div className="flex items-start gap-3 px-2 py-1">
                                    <Clock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                    <span className="text-xs text-muted">
                                        Operating 24 Hours • 365 Days
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Direct WhatsApp CTA Button */}
                        <div className="mt-4">
                            <a
                                href="https://wa.me/918796807060?text=Hello%20Shree%20Krushna%20Travels,%20I%20want%20to%20enquire%20about%20cab%20booking"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md"
                            >
                                <FaWhatsapp className="w-4 h-4 text-white" />
                                <span>Instant WhatsApp Booking</span>
                            </a>
                        </div>
                    </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent my-6" />

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted">
                    <p className="text-center sm:text-left">
                        © {currentYear}{' '}
                        <strong className="text-foreground font-semibold">
                            Shree Krushna Travels
                        </strong>
                        . All rights reserved.
                    </p>

                    <p className="text-center sm:text-right">
                        Website Developed By{' '}
                        <a
                            href="https://amigonexus.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-primary hover:opacity-80 transition-opacity underline decoration-primary/40 underline-offset-4"
                        >
                            AmigoNexus Technologies
                        </a>
                    </p>
                </div>
            </div>
        </footer>
    );
}