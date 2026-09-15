'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCabs } from "@/services/api";

const cars = [
  {
    name: 'Swift Dzire',
    desc: 'Comfortable and budget-friendly sedan for city and outstation travel.',
    badge: 'Most Popular',
    image: '/images/maruti_dzire.png',
    price: '₹12/km',
  },
  {
    name: 'Ertiga',
    desc: 'Spacious MPV perfect for family trips and group journeys.',
    badge: 'Best Value',
    image: '/images/maruti_ertiga.png',
    price: '₹15/km',
  },
  {
    name: 'Toyota Innova Crysta',
    desc: 'Premium family car with luxury comfort and extra luggage space.',
    badge: 'Family Pick',
    image: '/images/innova_crysta.png',
    price: '₹18/km',
  },
  {
    name: 'Fortuner',
    desc: 'Luxury SUV for premium business trips and VIP travel.',
    badge: 'Premium',
    image: '/images/toyota_fortuner.png',
    price: '₹25/km',
  },
];

const getCabImage = (name: string) => {
  const n = String(name).toLowerCase();
  if (n.includes('cng')) return '/images/hyundai_aura.png';
  if (n.includes('diesel')) return '/images/maruti_dzire.png';
  if (n.includes('premium') || n.includes('city') || n.includes('executive')) return '/images/honda_city.png';
  if (n.includes('ertiga') || n.includes('suv')) return '/images/maruti_ertiga.png';
  if (n.includes('crysta') || n.includes('innova')) return '/images/innova_crysta.png';
  if (n.includes('fortuner')) return '/images/toyota_fortuner.png';
  if (n.includes('traveller')) return '/images/mini_traveller.png';
  return '/images/hyundai_aura.png';
};

const getCabDesc = (name: string) => {
  const n = String(name).toLowerCase();
  if (n.includes('cng')) return 'Comfortable and budget-friendly sedan for city and outstation travel.';
  if (n.includes('diesel')) return 'Economical diesel sedan for longer distances and business rides.';
  if (n.includes('premium')) return 'Premium executive sedan with luxury comfort and features.';
  if (n.includes('ertiga') || n.includes('suv')) return 'Spacious MPV perfect for family trips and group journeys.';
  if (n.includes('crysta') || n.includes('innova')) return 'Premium family car with luxury comfort and extra luggage space.';
  if (n.includes('fortuner')) return 'Luxury SUV for premium business trips and VIP travel.';
  return 'Comfortable and fully equipped car for your safe journey.';
};

const getCabBadge = (name: string) => {
  const n = String(name).toLowerCase();
  if (n.includes('cng') || n.includes('diesel')) return 'Most Popular';
  if (n.includes('suv')) return 'Best Value';
  if (n.includes('innova')) return 'Family Pick';
  if (n.includes('fortuner')) return 'Premium';
  return 'Premium';
};

const getCabRate = (name: string) => {
  const n = String(name).toLowerCase();
  if (n.includes('cng')) return '₹11.5/km';
  if (n.includes('diesel')) return '₹12/km';
  if (n.includes('premium')) return '₹14/km';
  if (n.includes('ertiga') || n.includes('suv')) return '₹15/km';
  if (n.includes('crysta') || n.includes('innova')) return '₹19/km';
  if (n.includes('fortuner')) return '₹28/km';
  if (n.includes('traveller')) return '₹25/km';
  return '₹12/km';
};

export default function Fleet() {
  const [fleetCars, setFleetCars] = useState<any[]>([]);

  useEffect(() => {
    getCabs()
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.slice(0, 3).map((v: any) => ({
            name: v.carName || 'Premium Cab',
            desc: getCabDesc(v.carName),
            badge: getCabBadge(v.carName),
            image: v.inclusionsNotes || getCabImage(v.carName),
            price: getCabRate(v.carName),
          }));
          setFleetCars(mapped);
        } else {
          setFleetCars(cars.slice(0, 3));
        }
      })
      .catch(err => {
        console.warn("Failed to fetch fleet from backend, using local static data:", err);
        setFleetCars(cars.slice(0, 3));
      });
  }, []);

  return (
    <section id="fleet" className="py-10 px-6 bg-background relative">
      <span id="gallery" className="absolute -top-24" />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-up">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase
                           tracking-widest bg-primary-light text-primary border border-card-border mb-5">
            Our Fleet
          </span>
          <h2 className="text-5xl font-bold text-foreground mb-4">
            Choose Your Perfect Ride
          </h2>
          <p className="text-muted max-w-xl mx-auto text-lg leading-7">
            From budget sedans to luxury SUVs — we have the right car for every journey.
          </p>
        </div>
        {/* Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-4 items-stretch">
          {fleetCars.map((car, i) => (
            <div
              key={i}
              className={`group rounded-3xl overflow-hidden border border-card-border bg-card
            card-hover animate-scale-in delay-${(i + 1) * 100}
            h-full flex flex-col`}
            >
              {/* Image with zoom + gradient overlay */}
              <div className="relative h-52 overflow-hidden bg-surface flex items-center justify-center">
                <img
                  src={car.image}
                  alt={car.name}
                  className="w-[90%] h-[90%] object-contain transition-transform duration-500 group-hover:scale-110"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />
                {/* Badge */}
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold
                                  bg-primary text-primary-contrast">
                  {car.badge}
                </span>
                {/* Price */}
                <span className="absolute bottom-3 right-3 px-3 py-1 rounded-full text-xs font-bold
                                  bg-black/60 text-white backdrop-blur-sm">
                  From {car.price}
                </span>
              </div>

              {/* Body */}
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-xl font-bold mb-2 text-foreground">{car.name}</h3>
                <p className="text-muted text-sm mb-5 leading-6">{car.desc}</p>
                <Link
                  href="/cabs"
                  className="w-full inline-flex items-center justify-center relative overflow-hidden bg-primary text-primary-contrast
                                py-3 rounded-xl font-semibold text-sm shimmer-btn
                                transition-all duration-200 hover:opacity-90 active:scale-95 mt-auto"
                  style={{ boxShadow: '0 4px 16px var(--glow)' }}
                >
                  Book Now
                </Link>
              </div>
            </div>
          ))}

          {/* 4th Card: See More */}
          <Link
            href="/cabs"
            className="group rounded-xl overflow-hidden border border-card-border bg-card
                       card-hover animate-scale-in delay-400 p-1 flex flex-col justify-between items-center text-center cursor-pointer min-h-[380px]"
            style={{ boxShadow: 'var(--shadow-sm)' }}
          >
            {/* Top decorative visual */}
            <div className="relative w-full h-52 overflow-hidden rounded-2xl">
              <img
                src="/images/toyota_fortuner.png"
                alt="More Cars"
                className="w-full h-full object-cover blur-md scale-110 opacity-40"
              />

              <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg
                    className="w-6 h-6 text-teal-400 group-hover:translate-x-1 transition-transform duration-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Content & Action */}
            <div className="w-full flex-1 flex flex-col justify-between pt-6 mb-6 px-3">
              <div>
                <h3 className="text-xl font-bold text-foreground group-hover:text-teal-400 transition-colors">See More Cars</h3>
                <p className="text-muted text-sm mb-5 leading-6">
                  Explore our full premium fleet options including SUVs, luxury sedans, and more.
                </p>
              </div>
              <span
                className="w-full inline-flex items-center justify-center relative overflow-hidden bg-primary text-primary-contrast
                               py-3 rounded-xl font-semibold text-sm shimmer-btn
                               transition-all duration-200 hover:opacity-90 active:scale-95"
              >
                See More
              </span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}