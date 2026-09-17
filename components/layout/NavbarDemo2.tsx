'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, X, User as UserIcon, Phone, Car, Package, Home, LayoutTemplate, Heart } from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/#packages', label: 'Tour Packages', icon: Package },
  { href: '/', label: 'Cabs', icon: Car },
  { href: '/', label: 'Demo 1', icon: LayoutTemplate },
  { href: '/demo2', label: 'Demo 2', icon: LayoutTemplate },
  { href: '/demo3', label: 'Demo 3', icon: LayoutTemplate },
];

export default function NavbarDemo2() {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-[1400px] mx-auto px-4 xl:px-6 h-[72px] flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <div className="flex items-baseline font-black italic text-teal-600 text-3xl">
            SK<span className="text-teal-400 transform -rotate-12 translate-x-0.5 -translate-y-1 text-sm">✈</span>
          </div>
          <div className="flex flex-col ml-1">
            <span className="text-xl font-bold tracking-tight text-slate-900 leading-tight">
              Tours & Travels
            </span>
            <span className="text-[10px] font-medium tracking-wide text-slate-500 uppercase leading-none">
              Explore • Book • Experience
            </span>
          </div>
        </Link>

        {/* Desktop Nav Items */}
        <nav className="hidden xl:flex items-center justify-center flex-1 mx-8 h-full">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              className={`flex flex-col items-center justify-center min-w-[80px] h-full transition-colors relative group
                ${pathname === href ? 'text-teal-600' : 'text-slate-600 hover:text-teal-600'}`}
            >
              <Icon size={20} className="mb-1" />
              <span className="text-[11px] font-bold tracking-wide">{label}</span>
              {/* Bottom active line */}
              {pathname === href && (
                <div className="absolute bottom-0 left-0 w-full h-[3px] bg-teal-600 rounded-t-md" />
              )}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="hidden xl:flex items-center gap-5 shrink-0 h-full">
          {/* <div className="flex items-center gap-4 border-r border-slate-200 pr-5 h-8">
            <Link href="/" className="flex flex-col items-center text-slate-600 hover:text-teal-600 transition-colors">
              <UserIcon size={18} />
              <span className="text-[10px] font-bold mt-1">My Trips</span>
            </Link>
            <Link href="/" className="flex flex-col items-center text-slate-600 hover:text-teal-600 transition-colors">
              <Heart size={18} />
              <span className="text-[10px] font-bold mt-1">Wishlist</span>
            </Link>
          </div> */}

          <div className="flex items-center gap-3">
            <a href="tel:+918796807060" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors">
                <Phone size={14} className="fill-current" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-900 leading-none">+91 8795687060</span>
                <span className="text-[10px] text-slate-500 font-medium mt-0.5">Call us for best deals</span>
              </div>
            </a>
          </div>

          <Link
            href="/login"
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-full text-sm font-bold transition-colors ml-2 shadow-sm"
          >
            <UserIcon size={16} />
            <span>Login / Sign Up</span>
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="xl:hidden w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-50 rounded-full"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="xl:hidden border-t border-gray-100 bg-white">
          <div className="flex flex-col p-4 gap-2">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 p-3 rounded-xl transition-colors font-semibold ${pathname === href ? 'bg-teal-50 text-teal-600' : 'text-slate-600 hover:bg-slate-50'
                  }`}
              >
                <Icon size={18} />
                <span>{label}</span>
              </Link>
            ))}

            <div className="h-px bg-slate-100 my-2" />

            <Link href="/" className="flex items-center gap-3 p-3 rounded-xl text-slate-600 font-semibold hover:bg-slate-50">
              <UserIcon size={18} />
              <span>My Trips</span>
            </Link>
            <Link href="/" className="flex items-center gap-3 p-3 rounded-xl text-slate-600 font-semibold hover:bg-slate-50">
              <Heart size={18} />
              <span>Wishlist</span>
            </Link>

            <a href="tel:+918796807060" className="flex items-center gap-3 p-3 rounded-xl text-teal-600 font-bold bg-teal-50">
              <Phone size={18} className="fill-current" />
              <span>+91 8795687060</span>
            </a>

            <Link href="/login" className="flex items-center justify-center gap-2 w-full p-3 mt-2 rounded-xl text-white font-bold bg-teal-600">
              <UserIcon size={18} />
              <span>Login / Sign Up</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
