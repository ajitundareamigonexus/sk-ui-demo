'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Moon, Sun, Menu, X, LogOut, User as UserIcon, Compass, Phone, Mail, Headphones, Tag, ShieldCheck, Home, Package, Car, LayoutTemplate } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6';
import { getCurrentUser, logout, type User } from '@/lib/authStore';
import NavbarDemo2 from './NavbarDemo2';

// const navLinks = [
//   // { href: '/#about', label: 'ABOUT' },
//   // { href: '/#services', label: 'SERVICES' },
//   { href: '/#packages', label: 'PACKAGES' },
//   { href: '/', label: 'DEMO 1' },
//   { href: '/demo2', label: 'DEMO 2' },
//   { href: '/demo3', label: 'DEMO 3' },
//   // { href: '/#packages', label: 'PACKAGES' },
//   // { href: '/#gallery', label: 'BOOK CAB' },
//   // { href: '/my-bookings', label: 'MY BOOKIGS' },
//   // { href: '/admin', label: 'ADMIN PANEL' },
//   // { href: '/#contact', label: 'CONTACT' },
// ];
const navLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/#packages', label: 'Tour Packages', icon: Package },
  { href: '/', label: 'Cabs', icon: Car },
  { href: '/', label: 'Demo 1', icon: LayoutTemplate },
  { href: '/demo2', label: 'Demo 2', icon: LayoutTemplate },
  { href: '/demo3', label: 'Demo 3', icon: LayoutTemplate },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<Omit<User, 'password'> | null>(null);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const initial = saved ?? 'light';
    setTheme(initial);
    document.documentElement.classList.toggle('dark', initial === 'dark');

    setUser(getCurrentUser());

    const handleAuth = () => {
      setUser(getCurrentUser());
    };

    window.addEventListener('authChange', handleAuth);
    window.addEventListener('storage', handleAuth);
    return () => {
      window.removeEventListener('authChange', handleAuth);
      window.removeEventListener('storage', handleAuth);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', next);
    setTheme(next);
    document.documentElement.classList.toggle('dark', next === 'dark');
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setMenuOpen(false);
    router.push('/');
  };

  const activeLinks = navLinks.filter(link => {
    if (link.href === '/admin') {
      return user?.role === 'admin';
    }
    if (link.href === '/my-bookings') {
      return user && user?.role !== 'admin';
    }
    return true;
  });

  const isTransparentPage = pathname === '/' || pathname === '/demo2' || pathname === '/demo3';
  const isSolid = scrolled || !isTransparentPage;

  if (pathname === '/demo2') {
    return <NavbarDemo2 />;
  }

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isSolid
        ? 'bg-surface/95 backdrop-blur-xl border-b border-border'
        : 'bg-transparent border-b border-transparent text-white'
        }`}
    >
      {/* ── Top Info Bar ── */}
      <div className={`hidden sm:flex items-center justify-between px-6 py-1.5 text-[11px] font-medium border-b transition-colors duration-300 px-35 ${isSolid
        ? 'bg-slate-900 border-white/5 text-white/65'
        : 'bg-black/40 border-white/10 text-white/70'
        }`}>
        {/* Left — contact info */}
        <div className="flex items-center gap-4">
          <a
            href="tel:+919876543210"
            className="flex items-center gap-1.5 hover:text-teal-400 transition-colors duration-200"
          >
            <Phone className="w-3 h-3 shrink-0" />
            <span>+91 8796807060</span>
          </a>
          <span className="text-white/20">|</span>
          <a
            href="mailto:info@shreekrushnatravels.com"
            className="flex items-center gap-1.5 hover:text-teal-400 transition-colors duration-200"
          >
            <Mail className="w-3 h-3 shrink-0" />
            <span>info@shreekrushnatravels.com</span>
          </a>
          <span className="text-white/20">|</span>
          <a
            href="https://wa.me/919876543210"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-green-400 hover:text-green-300 transition-colors duration-200"
          >
            <FaWhatsapp className="w-3.5 h-3.5" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>

        {/* Right — trust badges */}
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 hover:text-teal-400 transition-colors duration-200 cursor-default">
            <Headphones className="w-3 h-3 shrink-0" />
            <span>24/7 Support</span>
          </span>
          <span className="text-white/20">|</span>
          <span className="flex items-center gap-1.5 hover:text-teal-400 transition-colors duration-200 cursor-default">
            <Tag className="w-3 h-3 shrink-0" />
            <span>Best Price Guarantee</span>
          </span>
          <span className="text-white/20">|</span>
          <span className="flex items-center gap-1.5 hover:text-teal-400 transition-colors duration-200 cursor-default">
            <ShieldCheck className="w-3 h-3 shrink-0" />
            <span>Safe &amp; Reliable</span>
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-teal-400 flex items-center justify-center text-slate-950 shrink-0">
            <Compass className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className={`text-2xl font-black tracking-tight transition-colors duration-200 ${isSolid ? 'text-primary' : 'text-teal-400 group-hover:text-teal-300'
              }`}>
              Shree Krushna <span className={isSolid ? 'text-foreground' : 'text-white'}>Travels</span>
            </span>
            <span className={`text-[11px] font-bold tracking-widest uppercase transition-colors duration-200 ${isSolid ? 'text-muted' : 'text-white/80'
              }`}>
              Your Trusted Travel Partner
            </span>
          </div>
        </Link>

        <nav className="hidden xl:flex items-center p-4 gap-8 text-sm font-semibold tracking-wide">
          {activeLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`relative flex flex-col justify-center items-center py-1 transition-colors duration-200
                         after:absolute after:-bottom-0.5 after:left-0 after:h-[2px] after:w-0
                         after:bg-teal-400 after:rounded-full after:transition-all after:duration-300
                         hover:after:w-full
                         ${isSolid ? 'text-muted hover:text-primary' : 'text-white hover:text-teal-300'}`}
            >
              <Icon size={20} className="mb-1" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">

          {/* <Link
            href="/"
            className="hidden md:inline-flex items-center justify-center rounded-full bg-teal-400 hover:bg-teal-300 text-slate-950 px-5 py-2 text-sm font-bold transition-colors duration-200 cursor-pointer"
          >
            Book Now
          </Link> */}

          {user ? (
            <div ref={dropdownRef} className="hidden md:block relative">
              <button
                onClick={() => setDropdownOpen(v => !v)}
                className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer relative overflow-hidden ${isSolid
                  ? 'border-border bg-surface text-muted hover:border-primary hover:text-primary'
                  : 'border-white/20 bg-white/10 text-white hover:border-white hover:bg-white/20'
                  }`}
                aria-label="User menu"
              >
                <div className="w-8 h-8 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-sm">
                  {(user.fullName || user.email || 'U').charAt(0).toUpperCase()}
                </div>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-border bg-surface/95 backdrop-blur-xl shadow-xl overflow-hidden z-50 animate-scale-in">
                  <div className="p-4 border-b border-border bg-muted/20">
                    <div>
                      <p className="font-semibold text-foreground truncate mt-0.5">{user.fullName || user.email || 'User'}</p>
                      {user.email && <p className="text-xs text-muted truncate mt-0.5">{user.email}</p>}
                    </div>
                  </div>

                  <div className="p-2 flex flex-col gap-1">
                    <button
                      onClick={toggleTheme}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm text-muted hover:bg-white/5 hover:text-foreground transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        {theme === 'light' ? (
                          <>
                            <Moon size={16} className="text-teal-400" />
                            <span>Dark Mode</span>
                          </>
                        ) : (
                          <>
                            <Sun size={16} className="text-teal-400" />
                            <span>Light Mode</span>
                          </>
                        )}
                      </div>
                    </button>

                    {user.role === 'admin' ? (
                      <Link
                        href="/"
                        onClick={() => setDropdownOpen(false)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted hover:bg-white/5 hover:text-foreground transition-all"
                      >
                        <UserIcon size={16} className="text-teal-400" />
                        <span>Admin Panel</span>
                      </Link>
                    ) : (
                      <Link
                        href="/"
                        onClick={() => setDropdownOpen(false)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted hover:bg-white/5 hover:text-foreground transition-all"
                      >
                        <UserIcon size={16} className="text-teal-400" />
                        <span>My Bookings</span>
                      </Link>
                    )}

                    <div className="h-px bg-border my-1" />

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-all cursor-pointer font-semibold"
                    >
                      <LogOut size={16} />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className={`w-10 h-10 rounded-full border flex items-center justify-center transition-colors duration-200 cursor-pointer ${isSolid
                  ? 'border-border bg-surface text-muted hover:border-primary hover:text-primary'
                  : 'border-white/20 bg-white/10 text-white hover:border-white hover:bg-white/20'
                  }`}
                aria-label="Toggle theme"
              >
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              </button>

              <Link
                href="/"
                className={`inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold border transition-colors duration-200 cursor-pointer ${isSolid
                  ? 'border-primary text-primary hover:bg-primary hover:text-primary-contrast'
                  : 'border-white/30 text-white bg-white/15 hover:bg-white hover:text-slate-950'
                  }`}
              >
                Sign In
              </Link>
            </div>
          )}

          <button
            onClick={() => setMenuOpen(v => !v)}
            className={`xl:hidden w-10 h-10 rounded-full border flex items-center justify-center transition-colors duration-200 cursor-pointer ${isSolid
              ? 'border-border bg-surface text-muted hover:border-primary hover:text-primary'
              : 'border-white/20 bg-white/10 text-white hover:border-white hover:bg-white/20'
              }`}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      <div
        className={`xl:hidden overflow-hidden transition-all duration-300
          ${menuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="px-4 pb-4">
          <div className="bg-surface/95 backdrop-blur-xl border border-border rounded-3xl p-6 flex flex-col gap-4 shadow-2xl">

            {/* User Status in Mobile Menu */}
            {user && (
              <div className="flex items-center bg-card border border-card-border px-4 py-2.5 rounded-2xl text-xs font-semibold text-teal-400 gap-1.5 w-fit">
                <UserIcon size={13} />
                <span>{user.fullName}</span>
              </div>
            )}

            {activeLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="text-muted hover:text-primary transition-colors py-1 text-sm font-medium"
              >
                {label}
              </Link>
            ))}

            {/* Divider and secondary actions for Mobile Menu */}
            <div className="border-t border-border/40 my-1" />

            <button
              onClick={toggleTheme}
              className="flex items-center gap-2.5 text-muted hover:text-primary transition-colors py-1.5 text-sm font-medium cursor-pointer w-full text-left"
            >
              {theme === 'light' ? (
                <>
                  <Moon size={16} className="text-teal-400 animate-pulse" />
                  <span>Dark Mode</span>
                </>
              ) : (
                <>
                  <Sun size={16} className="text-teal-400 animate-pulse" />
                  <span>Light Mode</span>
                </>
              )}
            </button>

            <Link
              href="/#booking-tabs-section"
              onClick={() => setMenuOpen(false)}
              className="inline-flex items-center justify-center rounded-full bg-primary
                         text-primary-contrast px-5 py-2 text-sm font-semibold w-fit mt-1 hover:bg-primary-dark"
            >
              Book Now
            </Link>

            {user ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-red-400 hover:text-red-500 transition-colors py-1 text-sm font-medium cursor-pointer w-fit mt-1"
              >
                <LogOut size={16} />
                <span>Log Out</span>
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 text-muted hover:text-primary transition-colors py-1 text-sm font-medium w-fit mt-1"
              >
                <UserIcon size={16} className="text-teal-400" />
                <span>Sign In / Register</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}