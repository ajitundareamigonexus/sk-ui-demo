import type { Cab } from '@/lib/types';

// ─── Cities ───────────────────────────────────────────────────────────────────
export const fromCities = [
  'Pune', 'Mumbai', 'Nashik', 'Thane', 'Navi Mumbai', 'Kalyan',
  'Aurangabad', 'Nagpur', 'Kolhapur', 'Solapur', 'Mira Road',
  'South Mumbai', 'Kondhwa', 'Pune Railway Station', 'Hinjewadi',
  'Pimpri Chinchwad', 'Bavdhan', 'Mumbai Airport', 'Pune Airport'
];

export const toCities = [
  'Mumbai', 'Pune', 'Goa', 'Mahabaleshwar', 'Lonavala', 'Shirdi',
  'Nashik', 'Aurangabad', 'Nagpur', 'Kolhapur', 'Mulshi', 'Karjat',
  'Khopoli', 'Igatpuri', 'Thane', 'Navi Mumbai', 'Kalyan', 'Mira Road',
  'South Mumbai', 'Kondhwa', 'Pune Railway Station', 'Hinjewadi',
  'Pimpri Chinchwad', 'Bavdhan', 'Mumbai Airport', 'Pune Airport'
];

export const GST_RATE = 0.05;

// ─── Coupons ──────────────────────────────────────────────────────────────────
export const COUPONS: Record<string, { discount: number; type: 'flat' | 'percent'; label: string; minFare?: number }> = {
  'FIRST10': { discount: 10, type: 'percent', label: '10% off on total fare', minFare: 500 },
  'FLAT500': { discount: 500, type: 'flat', label: '₹500 off on total fare', minFare: 1500 },
  'SK20': { discount: 20, type: 'percent', label: '20% off on total fare', minFare: 2000 },
  'SKFIRST': { discount: 15, type: 'percent', label: '15% off for new users', minFare: 1000 },
};

// export const cabs: Cab[] = [
//   {
//     id: 'sedan-cng',
//     name: 'Sedan CNG',
//     image: '/images/hyundai_aura.png',
//     basePrice: 2500,
//     car: 'Aura, Dzire',
//     seats: 4,
//     bags: 2,
//     rating: 4.5,
//     fuelType: 'CNG',
//     ac: true,
//     advancePercent: 20,
//   },
//   {
//     id: 'sedan-diesel',
//     name: 'Sedan Diesel',
//     image: '/images/maruti_dzire.png',
//     basePrice: 2700,
//     car: 'Dzire, Amaze',
//     seats: 4,
//     bags: 2,
//     rating: 4.6,
//     fuelType: 'Diesel',
//     ac: true,
//     advancePercent: 20,
//   },
//   {
//     id: 'premium-executive',
//     name: 'Premium Executive',
//     image: '/images/honda_city.png',
//     basePrice: 3000,
//     car: 'Honda City',
//     seats: 4,
//     bags: 2,
//     rating: 4.7,
//     fuelType: 'Petrol',
//     ac: true,
//     advancePercent: 25,
//   },
//   {
//     id: 'suv',
//     name: 'SUV',
//     image: '/images/maruti_ertiga.png',
//     basePrice: 3800,
//     car: 'Ertiga',
//     seats: 6,
//     bags: 4,
//     rating: 4.5,
//     fuelType: 'Petrol',
//     ac: true,
//     advancePercent: 25,
//   },
//   {
//     id: 'innova-crysta',
//     name: 'Innova Crysta',
//     image: '/images/innova_crysta.png',
//     basePrice: 4900,
//     car: 'Toyota Innova',
//     seats: 7,
//     bags: 5,
//     rating: 4.8,
//     fuelType: 'Diesel',
//     ac: true,
//     advancePercent: 30,
//   },
//   {
//     id: 'fortuner',
//     name: 'Fortuner',
//     image: '/images/toyota_fortuner.png',
//     basePrice: 7500,
//     car: 'Toyota Fortuner',
//     seats: 7,
//     bags: 5,
//     rating: 4.9,
//     fuelType: 'Diesel',
//     ac: true,
//     advancePercent: 30,
//   },
//   {
//     id: 'mini-traveller-15',
//     name: 'Mini Traveller',
//     image: '/images/mini_traveller.png',
//     basePrice: 9500,
//     car: 'Force Traveller or similar',
//     seats: 15,
//     bags: 8,
//     rating: 4.8,
//     fuelType: 'Diesel',
//     ac: true,
//     advancePercent: 30,
//   },
// ];
const DISTANCES: Record<string, Record<string, number>> = {
  mumbai: {
    pune: 150,
    lonavala: 85,
    mulshi: 140,
    karjat: 65,
    khopoli: 70,
    mahabaleshwar: 260,
    goa: 600,
    nashik: 170,
    igatpuri: 120,
    shirdi: 240,
    thane: 25,
    navimumbai: 25,
    kalyan: 45,
    mumbaiairport: 25,
    puneairport: 165,
  },
  pune: {
    mumbai: 150,
    lonavala: 65,
    mulshi: 45,
    karjat: 100,
    khopoli: 80,
    mahabaleshwar: 120,
    goa: 450,
    nashik: 210,
    igatpuri: 245,
    shirdi: 185,
    thane: 140,
    navimumbai: 120,
    kalyan: 135,
    puneairport: 15,
    mumbaiairport: 165,
  },
  nashik: {
    mumbai: 170,
    pune: 210,
    thane: 145,
    navimumbai: 160,
    kalyan: 130,
    igatpuri: 45,
    shirdi: 90,
    goa: 750,
    mahabaleshwar: 330,
    karjat: 165,
    lonavala: 215,
    khopoli: 200,
    mulshi: 235,
  },
  kalyan: {
    pune: 135,
    lonavala: 100,
    mulshi: 155,
    karjat: 40,
    khopoli: 55,
    mahabaleshwar: 285,
    goa: 625,
    nashik: 130,
    igatpuri: 85,
    shirdi: 205,
    thane: 20,
    mumbai: 45,
    navimumbai: 35,
    mumbaiairport: 45,
  },
  thane: {
    pune: 140,
    lonavala: 90,
    mulshi: 145,
    karjat: 55,
    khopoli: 65,
    mahabaleshwar: 270,
    goa: 610,
    nashik: 145,
    igatpuri: 100,
    shirdi: 220,
    mumbai: 25,
    navimumbai: 20,
    kalyan: 20,
    mumbaiairport: 25,
  },
  navimumbai: {
    pune: 120,
    lonavala: 70,
    mulshi: 125,
    karjat: 45,
    khopoli: 50,
    mahabaleshwar: 250,
    goa: 580,
    nashik: 160,
    igatpuri: 115,
    shirdi: 235,
    mumbai: 25,
    thane: 20,
    kalyan: 35,
    mumbaiairport: 30,
  },
  mumbaiairport: {
    mumbai: 25,
    southmumbai: 30,
    miraroad: 30,
    thane: 30,
    navimumbai: 35,
    kalyan: 50,
    pune: 165,
  },
  southmumbai: {
    mumbaiairport: 30,
  },
  miraroad: {
    mumbaiairport: 30,
  },
  puneairport: {
    kondhwa: 15,
    punerailwaystation: 8,
    hinjewadi: 25,
    pimprichinchwad: 20,
    bavdhan: 22,
  },
  kondhwa: {
    puneairport: 15,
  },
  punerailwaystation: {
    puneairport: 8,
  },
  hinjewadi: {
    puneairport: 25,
  },
  pimprichinchwad: {
    puneairport: 20,
  },
  bavdhan: {
    puneairport: 22,
  }
};

const CAB_RATES: Record<string, number> = {
  'sedan-cng': 11.5,
  'sedan-diesel': 12,
  'premium-executive': 14,
  'suv': 15,
  'innova-crysta': 19,
  'fortuner': 28,
  'mini-traveller-15': 25,
  'luxury-minibus-20': 40,
};

export function getRouteDistance(from: string, to: string, tripType: string): number {
  const fromKey = from.toLowerCase().replace(/\s+/g, '');
  const toKey = to.toLowerCase().replace(/\s+/g, '');

  if (tripType === 'local') return 80;

  const dist = DISTANCES[fromKey]?.[toKey] || DISTANCES[toKey]?.[fromKey];
  if (dist !== undefined) {
    return tripType === 'round' ? dist * 2 : dist;
  }

  // Fallback defaults
  if (tripType === 'round') return 300;
  if (tripType === 'airport') return 35;
  return 150;
}

export function calculateBasePrice(cabId: string, from: string, to: string, tripType: string): number {
  const rate = CAB_RATES[cabId] || 12;
  const distance = getRouteDistance(from, to, tripType);
  const driverAllowance = tripType === 'round' ? 600 : 300;
  return Math.round((distance * rate) + driverAllowance);
}

// ─── Dynamic Fare Breakdown (per-car pricing model) ──────────────────────────
export interface FareBreakdown {
  days: number;
  includedKmPerDay: number;   // always 300
  baseFare: number;           // cabPrice × days
  driverAllowance: number;    // driverAllowancePerDay × days
  extraKmRate: number;        // per km beyond limit (for reference)
  subtotal: number;           // baseFare + driverAllowance
  gst: number;                // 5 % of subtotal
  total: number;              // subtotal + gst
}

// export function calculateFareBreakdown(
//   cab: { basePrice: number; extraKmRate?: number; driverAllowancePerDay?: number },
//   pickupDate: string,
//   returnDate?: string,
//   tripType?: string,
// ): FareBreakdown {
//   const INCLUDED_KM = 300;
//   const GST_PCT = 0.05;

//   // Calculate number of days
//   let days = 1;
//   if (tripType === 'round' && returnDate && pickupDate) {
//     const from = new Date(pickupDate);
//     const to = new Date(returnDate);
//     const diff = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
//     days = Math.max(1, diff);
//   }

//   const baseFare = Math.round(cab.basePrice * days);
//   const driverAllowance = Math.round((cab.driverAllowancePerDay ?? 300) * days);
//   const extraKmRate = cab.extraKmRate ?? 0;
//   const subtotal = baseFare + driverAllowance;
//   const gst = Math.round(subtotal * GST_PCT);
//   const total = subtotal + gst;

//   return {
//     days,
//     includedKmPerDay: INCLUDED_KM,
//     baseFare,
//     driverAllowance,
//     extraKmRate,
//     subtotal,
//     gst,
//     total,
//   };
// }
export function calculateFareBreakdown(
  cab: {
    basePrice: number;
    extraKmRate?: number;
    gstPercent?: number;
  },
  pickupDate: string,
  returnDate?: string,
  tripType?: string,
): FareBreakdown {

  const INCLUDED_KM = 300;
  // Car-wise GST, default 5%
  const GST_PCT = (cab.gstPercent ?? 5) / 100;

  let days = 1;

  if (tripType === 'round' && returnDate && pickupDate) {
    const from = new Date(pickupDate);
    const to = new Date(returnDate);

    const diff = Math.ceil(
      (to.getTime() - from.getTime()) /
      (1000 * 60 * 60 * 24)
    );

    days = Math.max(1, diff);
  }

  const baseFare = Math.round(cab.basePrice * days);

  const extraKmRate = cab.extraKmRate ?? 0;

  // Driver Allowance removed
  const subtotal = baseFare;

  const gst = Math.round(subtotal * GST_PCT);

  const total = subtotal + gst;

  return {
    days,
    includedKmPerDay: INCLUDED_KM,
    baseFare,
    driverAllowance: 0,
    extraKmRate,
    subtotal,
    gst,
    total,
  };
}