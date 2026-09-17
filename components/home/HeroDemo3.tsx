'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Users, MapPin, Headphones, Building2, ChevronLeft, ChevronRight, Plane, ShieldCheck, Star } from 'lucide-react';
import BookingTabsHorizontal from '../bookings/BookingTabsHorizontal';

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
  { icon: Users, value: '5000+', label: 'Happy Customers' },
  { icon: MapPin, value: '100+', label: 'Destinations' },
  { icon: ShieldCheck, value: 'Safe & Trusted', label: 'Reliable Service' },
  { icon: Star, value: 'Best Deals', label: 'on Cabs & Tour Packages' },
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
    name: 'Dubai',
    tagline: 'City of Gold',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=800',
  },
  {
    name: 'Maldives',
    tagline: 'Tropical Paradise',
    image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=800',
  },
  {
    name: 'Bali',
    tagline: 'Island of Gods',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=800',
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

export default function HeroDemo3() {
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
    <div id="home-demo2">
      <section className="relative overflow-hidden min-h-[700px] lg:min-h-[600px]">
        {/* Adaptive background — works in both light and dark mode */}
        <div className="absolute inset-x-0 top-0 h-[75%] z-0 bg-gradient-to-br from-slate-900 via-teal-950 to-slate-800 dark:from-slate-950 dark:via-teal-900/40 dark:to-slate-900" />
        <div className="absolute inset-x-0 top-0 h-[75%] z-0 opacity-20 dark:opacity-10" style={{ backgroundImage: 'radial-gradient(ellipse at 30% 50%, rgba(20,184,166,0.35) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(6,182,212,0.2) 0%, transparent 50%)' }} />
        {/* White background for the lower section */}
        <div className="absolute inset-x-0 bottom-0 h-[25%] z-[1] bg-background" />
        <div className="absolute inset-x-0 top-0 h-[75%] z-0">
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

        {/* Hero content grid — fixed top padding to prevent layout shift */}
        <div className="relative inset-0 z-30 flex flex-col justify-start sm:px-6 pt-24 sm:pt-28 md:pt-24 lg:pt-28 pb-16 sm:pb-16 lg:pb-18">
          <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-6 lg:gap-8 w-full">
              <div className="flex flex-col md:flex-row justify-between items-center w-full gap-8">
                {/* Left Side: Text */}
                <div className="flex flex-col items-center md:items-start text-center md:text-left gap-2 sm:gap-4 lg:gap-5 mt-4 md:mt-0">
                  <p className="text-sm sm:text-base md:text-lg font-medium tracking-wide text-white/90 drop-shadow-md">
                    Your Next Adventure Awaits
                  </p>

                  <div className="flex flex-col items-center md:items-start">
                    <h1 className="text-4xl sm:text-5xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight drop-shadow-lg text-center md:text-left">
                      Explore the World with
                    </h1>
                    <span className="font-script text-5xl sm:text-6xl md:text-6xl lg:text-7xl font-bold text-yellow-400 leading-none block mt-1 drop-shadow-lg text-center md:text-left">
                      SK Tours & Travels
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm md:text-base font-medium text-white/90 mt-1 md:mt-2 flex items-center justify-center md:justify-start gap-1.5 sm:gap-2 flex-wrap drop-shadow-md">
                    <span>Comfortable Rides</span>
                    <span className="text-white/60">•</span>
                    <span>Amazing Destinations</span>
                    <span className="text-white/60">•</span>
                    <span>Unforgettable Memories</span>
                  </p>
                </div>

                {/* Right Side: Cards */}
                <div className="flex flex-col items-center md:items-end gap-2 md:gap-3 shrink-0">
                  <div className="flex items-center gap-2 text-white font-script text-2xl sm:text-3xl lg:text-4xl drop-shadow-lg mb-1 md:mb-2 text-center md:text-right">
                    <span className="leading-tight">More Destinations<br />More Memories</span>
                    <Plane className="w-6 h-6 lg:w-8 lg:h-8 transform rotate-45 -mt-4 opacity-90" />
                  </div>
                  <div className="flex gap-2 sm:gap-3 overflow-x-auto max-w-[100vw] px-4 md:px-0 pb-2 md:pb-0 snap-x hide-scrollbar">
                    {[
                      { name: 'Goa', sub: 'Sun • Sand • Fun', img: '/hero/hero-6.png' },
                      { name: 'Kashmir', sub: 'Heaven on Earth', img: '/hero/hero-3.png' },
                      { name: 'Dubai', sub: 'City of Gold', img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=800' },
                      { isMore: true },
                    ].map((card, idx) => (
                      card.isMore ? (
                        <div
                          key="more"
                          onClick={() => {
                            const section = document.getElementById('popular-destinations');
                            if (section) section.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="relative w-20 sm:w-24 lg:w-[105px] rounded-2xl overflow-hidden shadow-xl border-[3px] border-white hover:-translate-y-1 transition-all cursor-pointer shrink-0 snap-center h-[112px] sm:h-[128px] lg:h-[135px] group"
                        >
                          <Image src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=800" alt="More Destinations" fill className="object-cover blur-[2px] group-hover:blur-sm transition-all duration-300 scale-110" sizes="(max-width: 768px) 80px, 112px" />
                          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
                          <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                            <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-teal-500 flex items-center justify-center text-white mb-1.5 shadow-sm">
                              <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6 ml-0.5" />
                            </div>
                            <span className="text-[10px] lg:text-[11px] font-extrabold text-white text-center drop-shadow-md leading-tight">View More</span>
                          </div>
                        </div>
                      ) : (
                        <div key={card.name!} className="w-20 sm:w-24 lg:w-[105px] bg-white rounded-2xl overflow-hidden shadow-xl border-[3px] border-white hover:-translate-y-1 transition-transform cursor-pointer shrink-0 snap-center">
                          <div className="relative h-16 sm:h-20 lg:h-[85px] w-full">
                            <Image src={card.img!} alt={card.name!} fill className="object-cover" sizes="(max-width: 768px) 80px, 112px" />
                          </div>
                          <div className="p-1 sm:p-1.5 text-center bg-white flex flex-col items-center justify-center h-12 lg:h-[50px]">
                            <div className="text-[11px] lg:text-xs font-extrabold text-slate-800 leading-tight">{card.name}</div>
                            <div className="text-[8px] lg:text-[9px] font-medium text-slate-500 whitespace-nowrap overflow-hidden text-ellipsis leading-tight mt-0.5 w-full">{card.sub}</div>
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              </div>
              <div
                id="booking-tabs-section"
                className="w-full max-w-[900px] mx-auto min-h-[450px] sm:min-h-[420px] lg:min-h-70 mt-2 lg:mt-4"
              >
                <BookingTabsHorizontal variant="demo3" />
              </div>
            </div>
          </div>
        </div>

        {/* STATS BAR — positioned relatively below the booking tabs */}
        <div className="relative z-30 w-full max-w-[1150px] mx-auto mt-10 sm:mt-[-25px] lg:mt-[-60px] px-4 sm:px-6 hidden sm:block">
          <div
            className="rounded-xl bg-[#f4f9ff]/95 backdrop-blur-md py-4 sm:py-5 px-6 sm:px-10 flex flex-wrap sm:flex-nowrap justify-between items-center text-slate-800 border border-teal-100 shadow-[0_8px_30px_rgb(0,0,0,0.06)]"
          >
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className={`flex flex-col lg:flex-row items-center justify-center gap-2 lg:gap-3 group flex-1 text-center lg:text-left ${idx < 3 ? 'sm:border-r border-teal-200/50 sm:pr-2 lg:pr-4' : ''} ${idx > 0 ? 'sm:pl-2 lg:pl-4' : ''}`}
                >
                  <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 shrink-0 shadow-sm transition-transform duration-200 group-hover:scale-110 group-hover:bg-teal-600 group-hover:text-white">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm lg:text-base font-bold text-slate-900 leading-tight">
                      {stat.value}
                    </div>
                    <div className="text-[10px] lg:text-[11px] font-medium text-slate-500 leading-tight">
                      {stat.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </section>


      <section id="popular-destinations" className="relative overflow-hidden py-8 sm:py-10 md:py-12 px-2 sm:px-6 bg-background transition-colors duration-300 w-full">
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
        {/* <div className="relative z-30 w-full max-w-[1150px] mx-auto mt-[-15px] sm:mt-[-25px] lg:mt-[-60px] px-4 sm:px-6 hidden sm:block">
          <div
            className="rounded-xl bg-[#f4f9ff]/95 backdrop-blur-md py-4 sm:py-5 px-6 sm:px-10 flex flex-wrap sm:flex-nowrap justify-between items-center text-slate-800 border border-teal-100 shadow-[0_8px_30px_rgb(0,0,0,0.06)]"
          >
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className={`flex flex-col lg:flex-row items-center justify-center gap-2 lg:gap-3 group flex-1 text-center lg:text-left ${idx < 3 ? 'sm:border-r border-teal-200/50 sm:pr-2 lg:pr-4' : ''} ${idx > 0 ? 'sm:pl-2 lg:pl-4' : ''}`}
                >
                  <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 shrink-0 shadow-sm transition-transform duration-200 group-hover:scale-110 group-hover:bg-teal-600 group-hover:text-white">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm lg:text-base font-bold text-slate-900 leading-tight">
                      {stat.value}
                    </div>
                    <div className="text-[10px] lg:text-[11px] font-medium text-slate-500 leading-tight">
                      {stat.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div> */}
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
