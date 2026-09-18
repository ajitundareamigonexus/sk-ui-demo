'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Users, MapPin, ShieldCheck, Star, Plane } from 'lucide-react';
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

export default function HeroDemo5() {
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
    <div id="home-demo5" className="bg-white">
      <section className="relative overflow-hidden min-h-[650px] sm:min-h-[800px] lg:min-h-[600px] w-full pb-6">
        <div className="absolute inset-0 z-0">
          {heroImages.map((image, index) => (
            <div
              key={image}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${currentImage === index ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
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
          {/* Overlays to make text readable */}
          <div className="absolute inset-0 z-20 bg-black/20" />
          <div className="absolute inset-0 z-20 bg-gradient-to-r from-black/50 via-black/10 to-transparent" />
          <div className="absolute inset-0 z-20 bg-gradient-to-b from-transparent via-transparent to-black/40" />
        </div>

        {/* Hero content - Replaced with BookingTabsHorizontal centered */}
        <div className="relative z-30 flex flex-col justify-center items-center min-h-full w-full pt-28 sm:pt-32 lg:pt-36 pb-8 max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <section className="relative w-full px-2 sm:px-2 z-50">
            <div id="booking-tabs-section" className="w-full max-w-[1150px] mx-auto min-h-[150px]">
              <BookingTabsHorizontal variant="demo5" />
            </div>
          </section>

          <div className="items-center text-center gap-2 sm:gap-3 lg:gap-4 mt-6 sm:mt-10 lg:mt-12 relative z-40">
            <p className="text-sm sm:text-base md:text-lg font-medium tracking-wide text-white/90 drop-shadow-md">
              Your Next Adventure Awaits
            </p>

            <div className="flex flex-wrap items-baseline justify-center gap-2 sm:gap-3">
              <h1 className="text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-bold text-white leading-[1.1] tracking-tight drop-shadow-lg">
                Explore the World with
              </h1>
              <span className="font-script text-3xl sm:text-4xl md:text-4xl lg:text-5xl font-bold text-yellow-400 leading-none drop-shadow-lg">
                SK Tours & Travels
              </span>
            </div>
            <p className="text-xs sm:text-sm md:text-base font-medium text-white/90 mt-1 flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap drop-shadow-md">
              <span>Comfortable Rides</span>
              <span className="text-white/60">•</span>
              <span>Amazing Destinations</span>
              <span className="text-white/60">•</span>
              <span>Unforgettable Memories</span>
            </p>
          </div>
        </div>
      </section>

      {/* --- STATS BAR --- */}
      <section className="relative w-full px-2 sm:px-6 z-30 mt-6 sm:mt-8 lg:mt-4 hidden sm:block bg-white">
        <div className="max-w-[1150px] mx-auto">
          <div className="rounded-3xl bg-[#f0f7ff] py-4 sm:py-5 px-2 sm:px-10 flex flex-wrap sm:flex-nowrap justify-between items-center text-slate-800 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-blue-50">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className={`flex flex-col lg:flex-row items-center justify-center gap-2 lg:gap-3 group flex-1 text-center lg:text-left ${idx < 3 ? 'sm:border-r border-teal-200/40 sm:pr-2 lg:pr-4' : ''} ${idx > 0 ? 'sm:pl-2 lg:pl-4' : ''}`}
                >
                  <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 shrink-0 transition-transform duration-200 group-hover:scale-110 group-hover:bg-teal-600 group-hover:text-white">
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

      {/* --- POPULAR DESTINATIONS --- */}
      <section id="popular-destinations" className="relative py-2 sm:py-6 md:py-8 px-2 sm:px-6 bg-white w-full">
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 sm:mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Plane className="w-6 h-6 text-teal-500 transform rotate-45" />
                Popular Destinations
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                Handpicked destinations for your next getaway
              </p>
            </div>
            <div className="flex items-center justify-between sm:justify-end">
              <Link
                href="/#packages"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-teal-600 hover:text-teal-700 transition-colors"
              >
                View All Destinations →
              </Link>
            </div>
          </div>

          <div
            className="relative overflow-hidden -mx-4 px-4 sm:mx-0 sm:px-0 select-none"
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
                    className="group relative aspect-[4/3] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-slate-100"
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
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent opacity-80" />
                    <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                      <div>
                        <h3 className="text-white font-bold text-lg leading-tight drop-shadow-sm">{dest.name}</h3>
                        <p className="text-white/90 text-xs mt-0.5 drop-shadow-sm font-medium">{dest.tagline}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
