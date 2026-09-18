'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Users, MapPin, Headphones, Building2, ChevronLeft, ChevronRight } from 'lucide-react';
import BookingTabs from '../bookings/BookingTabs';

// 7 local background images
const heroImages = [
  '/hero/hero-1.png',
  '/hero/hero-2.png',
  '/hero/hero-3.png',
  '/hero/hero-4.png',
  '/hero/hero-5.png',
  '/hero/hero-6.png',
  '/hero/hero-7.png',
];

// Stats bar data
const stats = [
  { icon: Users, value: '5000+', label: 'Happy Travelers' },
  { icon: MapPin, value: '100+', label: 'Destinations' },
  { icon: Headphones, value: '24/7', label: 'Customer Support' },
  { icon: Building2, value: '50+', label: 'Corporate Clients' },
];

const popularDestinations = [
  { name: 'Kashmir', tagline: 'Heaven on Earth', image: '/hero/hero-3.png' },
  {
    name: 'Manali',
    tagline: 'Adventure Awaits',
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=800',
  },
  { name: 'Goa', tagline: 'Sun, Sand & Serenity', image: '/hero/hero-6.png' },
  {
    name: 'Rajasthan',
    tagline: 'Royal Heritage',
    image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=800',
  },
  {
    name: 'Kerala',
    tagline: "God's Own Country",
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=800',
  },
  {
    name: 'Mahabaleshwar',
    tagline: 'Scenic Hill Retreat',
    image: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=800',
  },
  {
    name: 'Ooty',
    tagline: 'Queen of Nilgiris',
    image: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?q=80&w=800',
  },
  {
    name: 'Lonavala',
    tagline: 'Misty Waterfalls & Forts',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=800',
  },
  {
    name: 'Rishikesh',
    tagline: 'Ganga & Adventure',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800',
  },
  {
    name: 'Shirdi',
    tagline: 'Divine Spiritual Journey',
    image: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?q=80&w=800',
  },
];

export default function Hero() {
  const [currentImage, setCurrentImage] = useState(0);

  const [destIndex, setDestIndex] = useState(0);
  const [isDestPaused, setIsDestPaused] = useState(false);
  const [itemsPerView, setItemsPerView] = useState(5);
  const [isTransitioning, setIsTransitioning] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) =>
        prev === heroImages.length - 1 ? 0 : prev + 1
      );
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    const updateView = () => {
      if (window.innerWidth >= 1024) {
        setItemsPerView(5);
      } else if (window.innerWidth >= 768) {
        setItemsPerView(3);
      } else if (window.innerWidth >= 640) {
        setItemsPerView(2);
      } else {
        setItemsPerView(1);
      }
    };
    updateView();
    window.addEventListener('resize', updateView);
    return () => window.removeEventListener('resize', updateView);
  }, []);

  const extendedDestinations = [
    ...popularDestinations,
    ...popularDestinations.slice(0, 5),
  ];

  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const handleNextDest = () => {
    setIsTransitioning(true);
    setDestIndex((prev) => prev + 1);
  };

  const handlePrevDest = () => {
    setIsTransitioning(true);
    setDestIndex((prev) => (prev <= 0 ? popularDestinations.length - 1 : prev - 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDestPaused(true);
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsDestPaused(false);
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (diff > 45) {
      handleNextDest();
    } else if (diff < -45) {
      handlePrevDest();
    }
    setTouchStartX(null);
  };

  useEffect(() => {
    if (destIndex >= popularDestinations.length) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setDestIndex(0);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setIsTransitioning(true);
          });
        });
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [destIndex]);

  useEffect(() => {
    if (isDestPaused) return;
    const interval = setInterval(() => {
      handleNextDest();
    }, 3500);
    return () => clearInterval(interval);
  }, [isDestPaused]);

  return (
    <div id="home">
      <section className="relative overflow-hidden min-h-[680px] sm:min-h-[720px] lg:min-h-[580px]">
        {/* Adaptive background — works in both light and dark mode */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-slate-900 via-teal-950 to-slate-800 dark:from-slate-950 dark:via-teal-900/40 dark:to-slate-900" />
        <div className="absolute inset-0 z-0 opacity-30 dark:opacity-20" style={{ backgroundImage: 'radial-gradient(ellipse at 30% 50%, rgba(20,184,166,0.35) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(6,182,212,0.2) 0%, transparent 50%)' }} />
        <div className="absolute inset-0 z-0">
          {/* Images commented out — background gradient active */}
          {heroImages.map((image, index) => (
            <div
              key={image}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${currentImage === index ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
            >
              <Image
                src={image}
                alt={`Travel destination ${index + 1}`}
                fill
                priority={index === 0}
                className="object-cover object-center"
                sizes="100vw"
              />
            </div>
          ))}
          <div className="absolute inset-0 z-20 bg-black/10" />
          <div className="absolute inset-0 z-20 bg-gradient-to-r from-black/40 via-black/5 to-transparent" />
          <div className="absolute inset-0 z-20 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
        </div>

        {/* Hero content grid — vertically centered between navbar and stats bar */}
        <div className="relative inset-0 z-30 flex flex-col justify-center sm:px-6 pt-20 sm:pt-36 md:pt-32 pb-2 sm:pb-32 md:pb-26">
          <div className="max-w-7xl mx-auto w-full mx-10">
            <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-5 lg:gap-10 items-start lg:items-center w-full">
              <div className="flex flex-col gap-4">
                <p className="text-xs sm:text-sm font-extrabold tracking-[0.22em] text-white/80 uppercase flex items-center gap-2 drop-shadow-sm">
                  <span>TRAVEL</span>
                  <span className="text-teal-400">•</span>
                  <span>EXPLORE</span>
                  <span className="text-teal-400">•</span>
                  <span>EXPERIENCE</span>
                </p>

                <div>
                  <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-[1.05] tracking-tight drop-shadow-lg">
                    Let&apos;s Make
                  </h1>
                  <span className="font-script text-5xl sm:text-6xl md:text-7xl font-bold text-teal-300 leading-none block -mt-1 drop-shadow-lg">
                    Travel Happen
                  </span>
                  <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 pt-2">
                    {/* Explore India badge */}
                    <button
                      type="button"
                      onClick={() => window.dispatchEvent(new CustomEvent('openPackagesTab'))}
                      className="relative w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full shrink-0 hover:scale-110 active:scale-95 transition-transform duration-200 drop-shadow-xl cursor-pointer focus:outline-none"
                      title="Explore India Packages"
                    >
                      <Image src="/badges/explore-india.jpg" alt="Explore India" fill className="object-cover rounded-full" sizes="(max-width:640px) 64px, (max-width:1024px) 80px, 96px" />
                    </button>

                    {/* International Travel Packages badge */}
                    <button
                      type="button"
                      onClick={() => window.dispatchEvent(new CustomEvent('openPackagesTab'))}
                      className="relative w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full shrink-0 hover:scale-110 active:scale-95 transition-transform duration-200 drop-shadow-xl cursor-pointer focus:outline-none"
                      title="International Travel Packages"
                    >
                      <Image src="/badges/international.jpg" alt="International Travel Packages" fill className="object-cover rounded-full" sizes="(max-width:640px) 64px, (max-width:1024px) 80px, 96px" />
                    </button>

                    {/* Book Cab badge */}
                    <a
                      href="#booking-tabs-section"
                      className="relative w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full shrink-0 hover:scale-110 active:scale-95 transition-transform duration-200 drop-shadow-xl focus:outline-none"
                      title="Book Cab"
                    >
                      <Image src="/badges/book-cab.jpg" alt="Book Cab" fill className="object-cover rounded-full" sizes="(max-width:640px) 64px, (max-width:1024px) 80px, 96px" />
                    </a>
                  </div>
                </div>
              </div>
              <div
                id="booking-tabs-section"
                className="lg:ml-auto lg:w-full lg:max-w-[460px] lg:min-h-[350px]"
              >
                <BookingTabs />
              </div>
            </div>
          </div>
        </div>

        {/* STATS BAR — absolutely pinned to bottom, never moves */}
        <div className="absolute bottom-4 sm:bottom-5 left-3 right-3 sm:left-6 sm:right-6 z-30 hidden sm:block ">
          <div
            className="max-w-7xl mx-auto rounded-2xl sm:rounded-3xl border border-white/15 bg-black/20 backdrop-blur-full py-3 sm:py-4 px-4 sm:px-6 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 items-center text-white"
            style={{ boxShadow: 'var(--shadow-lg)' }}
          >
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className={`flex items-center gap-2 sm:gap-3 group ${idx < 3 ? 'sm:border-r border-white/10 sm:pr-3 lg:pr-4' : ''}`}
                >
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300 shrink-0 shadow-sm group-hover:scale-110 group-hover:bg-teal-400 group-hover:text-slate-950 transition-all duration-200">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <div className="text-lg sm:text-2xl font-black text-white tracking-tight leading-none">
                      {stat.value}
                    </div>
                    <div className="text-[10px] sm:text-sm font-medium text-white/70 tracking-wide mt-0.5">
                      {stat.label}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Quote */}
            <div className="col-span-2 sm:col-span-4 lg:col-span-1 flex items-center justify-center border-t sm:border-t-0 lg:border-l border-white/10 pt-2.5 sm:pt-0 lg:pl-4">
              <div className="flex items-center gap-1.5 text-center">
                <span className="text-amber-400 text-2xl sm:text-4xl font-serif leading-none select-none">&ldquo;</span>
                <p className="font-script text-base sm:text-xl font-bold text-white leading-tight">
                  Not just trips,<br />we create memories
                </p>
                <span className="text-amber-400 text-2xl sm:text-4xl font-serif leading-none select-none">&rdquo;</span>
              </div>
            </div>
          </div>
        </div>

      </section>


      <section className="relative overflow-hidden py-8 sm:py-10 md:py-12 px-3 sm:px-6 bg-background transition-colors duration-300 w-full">
        <div className="absolute inset-0 z-0">
          <Image
            src={heroImages[currentImage]}
            alt="Travel destination background"
            fill
            className="object-cover object-center transition-all duration-1000 opacity-15 dark:opacity-40"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-background/90 dark:bg-background/95 backdrop-blur-[2px] transition-colors duration-300" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/90 transition-colors duration-300" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5 sm:mb-6">
            <div>
              <p className="text-[10px] sm:text-xs font-extrabold tracking-[0.2em] text-teal-600 dark:text-teal-400 uppercase mb-1 drop-shadow-sm transition-colors duration-300">
                — POPULAR DESTINATIONS —
              </p>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-foreground tracking-tight drop-shadow-sm transition-colors duration-300">
                Top Destinations for Your Next Adventure
              </h2>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-2.5">
              <Link
                href="/#packages"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-foreground bg-surface/90 hover:bg-surface border border-border rounded-full px-4 sm:px-5 py-2 sm:py-2.5 transition-all duration-200 w-fit whitespace-nowrap shadow-sm hover:shadow-md hover:scale-105 active:scale-95"
              >
                View All Destinations →
              </Link>
            </div>
          </div>
          <div
            className="relative overflow-hidden -mx-2 px-2 py-1 select-none"
            onMouseEnter={() => setIsDestPaused(true)}
            onMouseLeave={() => setIsDestPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className={`flex ${isTransitioning ? 'transition-transform duration-700 ease-in-out' : ''}`}
              style={{
                transform: `translateX(-${(destIndex * 100) / itemsPerView}%)`,
              }}
            >
              {extendedDestinations.map((dest, idx) => (
                <div
                  key={`${dest.name}-${idx}`}
                  className="shrink-0 px-2"
                  style={{ width: `${100 / itemsPerView}%` }}
                >
                  <div
                    className="group relative aspect-video rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-border/80 dark:border-white/20 backdrop-blur-sm"
                    onClick={() => {
                      const el = document.getElementById('packages');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    <Image
                      src={dest.image}
                      alt={dest.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                      <div>
                        <h3 className="text-white font-bold text-sm leading-tight drop-shadow-sm">{dest.name}</h3>
                        <p className="text-white/80 text-[11px] drop-shadow-sm">{dest.tagline}</p>
                      </div>
                      <div className="w-7 h-7 rounded-full bg-white/90 text-slate-900 flex items-center justify-center group-hover:bg-teal-400 group-hover:text-black transition-colors shrink-0 shadow-sm text-xs font-bold ml-2">
                        →
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-center gap-1.5 mt-4 sm:mt-5">
            {popularDestinations.map((dest, idx) => {
              const activeIndex = destIndex % popularDestinations.length;
              const isActive = activeIndex === idx;
              return (
                <button
                  key={dest.name}
                  type="button"
                  onClick={() => {
                    setIsTransitioning(true);
                    setDestIndex(idx);
                  }}
                  aria-label={`Go to ${dest.name}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${isActive
                    ? 'w-6 bg-teal-500'
                    : 'w-1.5 bg-foreground/25 hover:bg-foreground/50'
                    }`}
                />
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
