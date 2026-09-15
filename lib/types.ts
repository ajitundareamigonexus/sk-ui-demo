// ─── Trip Types ───────────────────────────────────────────────────────────────
export type TripType = 'oneway' | 'round' | 'local' | 'airport';

// ─── Agent ────────────────────────────────────────────────────────────────────
export interface AgentPricingRules {
  baseDiscountPct: number;          // % discount off published price applied to agent
  maxMarkupPct: number;             // Max % the agent is allowed to add as markup
  tripOverrides: {
    oneway?: number;                // Trip-type specific override discount %
    round?: number;
    local?: number;
    airport?: number;
  };
}

export interface Agent {
  id: string;
  agentCode: string;               // e.g. "AGT-001"
  businessName: string;
  contactName: string;
  email: string;
  mobile: string;
  gstNumber?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  pricingRules: AgentPricingRules;
}

export interface AgentUser {
  id: string;
  agentId: string;
  fullName: string;
  email: string;
  mobile: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface AgentBookingSummary {
  agentId: string;
  totalBookings: number;
  totalRevenue: number;            // Customer selling price total
  totalCostPrice: number;          // Agent cost price total
  totalMarkup: number;             // Revenue - Cost = markup earned
  totalPaid: number;
  totalOutstanding: number;
}

// ─── Search Query ─────────────────────────────────────────────────────────────
export interface SearchQuery {
  from: string;
  to: string;
  date: string;      // ISO date string  e.g. "2026-05-28"
  time: string;      // "HH:MM"
  returnDate?: string;
  returnTime?: string;
  airportTripType?: 'drop' | 'pickup';
  tripType: TripType;
  passengers?: number;
}

// ─── Cab ──────────────────────────────────────────────────────────────────────
export interface Cab {
  id: string;
  CarType: string;
  image: string;
  basePrice: number; // in ₹ (without GST) – price for 300 km/day included
  carName: string;       // e.g. "Aura, Dzire"
  totalSeat: number;
  bags: number;
  inclusionsNotes?: string[];
  exclusionNotes?: string[];
  rating: number;
  fuelType: 'CNG' | 'Diesel' | 'Petrol' | 'Electric';
  ac: boolean;
  advancePercent?: number; // % of total fare to pay as advance (e.g. 20 = 20%)
  extraKmRate?: number;        // ₹ per km beyond 300 km/day limit
}

// ─── Booking Contact ──────────────────────────────────────────────────────────
export interface BookingContact {
  fullName: string;
  mobile: string;
  email: string;
  gstNumber?: string;
  pickupAddress: string;
  dropAddress: string;
  preferredLoginType?: string;
}

// ─── Payment Option ───────────────────────────────────────────────────────────
export type PaymentOption = 'zero' | 'advance' | 'full';

// ─── Booking (Saved) ──────────────────────────────────────────────────────────
export interface Booking {
  id: string;            // e.g. "SK-20260528-1234"
  searchQuery: SearchQuery;
  selectedCab: Cab;
  contact: BookingContact;
  paymentOption: PaymentOption;
  baseFare: number;
  gst: number;
  discount: number;      // coupon discount amount in ₹
  totalFare: number;
  couponCode?: string;   // applied coupon code
  status: 'draft' | 'payment_pending' | 'initiated' | 'confirmed' | 'driver_assignment_pending'
    | 'driver_assigned' | 'trip_started' | 'completed' | 'rescheduled'
    | 'cancelled' | 'refund_pending' | 'refunded' | 'no_show';
  createdAt: string;     // ISO timestamp
  preferredLoginMethod?: 'phone' | 'email';
  driverName?: string;
  driverCarNumber?: string;
  driverMobileNo?: string;
  // ─── Agent fields (present only for agent-originated bookings) ──────────────
  agentId?: string;
  agentCode?: string;
  agentBusinessName?: string;
  agentContactName?: string;
  agentEmail?: string;
  agentMobile?: string;
  agentCostPrice?: number;   // price agent paid (after discount)
  agentMarkup?: number;      // markup agent added (₹)
  agentSellingPrice?: number;// price charged to customer
  agentAmountPaid?: number;
  agentAmountDue?: number;
}

// ─── Multi-Leg Booking ────────────────────────────────────────────────────────
// One journey leg within a multi-leg booking
export interface BookingLeg {
  legNumber: number;            // 1-based index
  search: SearchQuery;
  cab: Cab;
  pickupAddress: string;
  dropAddress: string;
  baseFare: number;
  gst: number;
  totalFare: number;
  backendBookingRef?: string;   // ref returned from API per leg
}

// A confirmed booking that may contain one or more legs
export interface MultiLegBooking {
  masterRef: string;            // e.g. "SK-20260910-1234"
  legs: BookingLeg[];
  contact: BookingContact;
  couponCode?: string;
  discount: number;
  grandTotal: number;           // sum of all leg totalFares - discount
  paymentOption: PaymentOption;
  status: 'confirmed' | 'cancelled' | 'completed' | 'driver_assigned';
  createdAt: string;
}

// ─── Driver ───────────────────────────────────────────────────────────────────
export interface Driver {
  id: number;
  name: string;
  contactNumber: string;
  licenseNumber: string;
  licenseExpiryDate?: string;       // ISO date string e.g. "2027-05-30"
  status: 'ACTIVE' | 'INACTIVE';    // same Active/Inactive pattern as Agent
  availabilityStatus: 'AVAILABLE' | 'ON_TRIP' | 'UNAVAILABLE';
  documentsJson?: string;           // JSON string of document URL references
  createdAt?: string;
}
