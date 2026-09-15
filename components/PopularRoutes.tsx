'use client';

import { useState } from 'react';

const routes = [
  {
    title: 'From Pune',
    items: [
      'Pune to Mumbai', 'Pune to Lonavala', 'Pune to Mulshi', 'Pune to Karjat',
      'Pune to Khopoli', 'Pune to Mahabaleshwar', 'Pune to Goa', 'Pune to Nashik',
      'Pune to Igatpuri', 'Pune to Shirdi', 'Pune to Thane', 'Pune to Navi Mumbai',
      'Pune to Kalyan',
    ],
  },
  {
    title: 'Airport & Local',
    items: [
      'Pune Airport to Kondhwa',
      'Pune Airport to Pune Railway Station',
      'Pune Airport to Hinjewadi',
      'Pune Airport to Pimpri Chinchwad',
      'Pune Airport to Bavdhan',
      'Kondhwa to Pune Airport',
      'Pune Railway Station to Pune Airport',
      'Hinjewadi to Pune Airport',
      'Pimpri Chinchwad to Pune Airport',
      'Bavdhan to Pune Airport',
      'Mumbai Airport to Mumbai',
      'Mumbai Airport to South Mumbai',
      'Mumbai Airport to Mira Road',
      'Mumbai Airport to Thane',
      'Mumbai Airport to Navi Mumbai',
      'Mumbai Airport to Kalyan',
      'South Mumbai to Mumbai Airport',
      'Mira Road to Mumbai Airport',
    ],
  },
  {
    title: 'From Nashik',
    items: [
      'Nashik to Mumbai', 'Nashik to Pune', 'Nashik to Thane',
      'Nashik to Navi Mumbai', 'Nashik to Kalyan', 'Nashik to Igatpuri',
      'Nashik to Shirdi', 'Nashik to Goa', 'Nashik to Mahabaleshwar',
      'Nashik to Karjat', 'Nashik to Lonavala', 'Nashik to Khopoli',
      'Nashik to Mulshi',
    ],
  },
  {
    title: 'From Kalyan',
    items: [
      'Kalyan to Pune', 'Kalyan to Lonavala', 'Kalyan to Mulshi',
      'Kalyan to Karjat', 'Kalyan to Khopoli', 'Kalyan to Mahabaleshwar',
      'Kalyan to Goa', 'Kalyan to Nashik', 'Kalyan to Igatpuri',
      'Kalyan to Shirdi', 'Kalyan to Thane', 'Kalyan to Mumbai',
      'Kalyan to Navi Mumbai', 'Kalyan to Mumbai Airport',
    ],
  },
  {
    title: 'From Thane',
    items: [
      'Thane to Pune', 'Thane to Lonavala', 'Thane to Mulshi',
      'Thane to Karjat', 'Thane to Khopoli', 'Thane to Mahabaleshwar',
      'Thane to Goa', 'Thane to Nashik', 'Thane to Igatpuri',
      'Thane to Shirdi', 'Thane to Mumbai', 'Thane to Navi Mumbai',
      'Thane to Kalyan', 'Thane to Mumbai Airport',
    ],
  },
  {
    title: 'From Navi Mumbai',
    items: [
      'Navi Mumbai to Pune', 'Navi Mumbai to Lonavala',
      'Navi Mumbai to Mulshi', 'Navi Mumbai to Karjat',
      'Navi Mumbai to Khopoli', 'Navi Mumbai to Mahabaleshwar',
      'Navi Mumbai to Goa', 'Navi Mumbai to Nashik',
      'Navi Mumbai to Igatpuri', 'Navi Mumbai to Shirdi',
      'Navi Mumbai to Mumbai', 'Navi Mumbai to Thane',
      'Navi Mumbai to Kalyan', 'Navi Mumbai to Mumbai Airport',
    ],
  },
  {
    title: 'From Mumbai',
    items: [
      'Mumbai to Pune', 'Mumbai to Lonavala', 'Mumbai to Mulshi',
      'Mumbai to Karjat', 'Mumbai to Khopoli', 'Mumbai to Mahabaleshwar',
      'Mumbai to Goa', 'Mumbai to Nashik', 'Mumbai to Igatpuri',
      'Mumbai to Shirdi', 'Mumbai to Thane', 'Mumbai to Navi Mumbai',
      'Mumbai to Kalyan', 'Mumbai to Mumbai Airport',
    ],
  },
];

export default function PopularRoutes() {
  const [showMore, setShowMore] = useState(false);

  const handleRouteClick = (routeStr: string) => {
    const parts = routeStr.split(' to ');

    if (parts.length === 2) {
      const from = parts[0];
      const to = parts[1];

      window.dispatchEvent(
        new CustomEvent('setRoute', {
          detail: { from, to },
        })
      );
    }
  };
  const visibleRoutes = showMore ? routes : routes.slice(0, 4);

  return (
    <section
      id="popular-routes"
      className="py-8 px-6 bg-background relative"
    >
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-px divider-line" />

      <div className="text-center mb-8 animate-fade-up">
        {/* Header */}
        <div className="mb-16 animate-fade-up">
          <span
            className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase
                       tracking-widest bg-primary-light text-primary border border-card-border mb-5"
          >
            Routes
          </span>
          <h2 className="text-4xl font-bold text-foreground">Popular Routes</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-14">

          {visibleRoutes.map((route, index) => (
            <div
              key={route.title}
              className="animate-fade-up"
              style={{
                animationDelay: `${index * 60}ms`,
              }}
            >
              <h3
                className="text-xs font-bold uppercase tracking-[3px] text-primary
                           mb-5 pb-3 border-b border-card-border"
              >
                {route.title}
              </h3>

              <div className="space-y-3">
                {route.items.map((item) => (
                  <p
                    key={item}
                    onClick={() => handleRouteClick(item)}
                    className="text-sm text-muted cursor-pointer
                               hover:text-primary hover:translate-x-1
                               transition-all duration-200"
                  >
                    → {item}
                  </p>
                ))}
              </div>
            </div>
          ))}

        </div>

        {/* See More / See Less Button */}
        <div className="flex justify-center mt-8">
          <button
            onClick={() => setShowMore(!showMore)}
            className="px-6 py-3 rounded-full
                       bg-primary text-white
                       font-semibold text-sm
                       hover:opacity-90
                       transition-all duration-300
                       hover:scale-105"
          >
            {showMore ? 'See Less' : 'See More Routes'}
          </button>
        </div>
      </div>
    </section>
  );
}