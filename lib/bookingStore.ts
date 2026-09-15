import type { Booking, Cab, SearchQuery, BookingLeg, MultiLegBooking } from './types';

const KEYS = {
  SEARCH: 'sk_search_query',
  CAB: 'sk_selected_cab',
  BOOKINGS: 'sk_bookings',
  CABS: 'sk_cabs',
  MULTI_LEG_DRAFT: 'sk_multi_leg_draft',   // legs being built
  MULTI_LEG_BOOKINGS: 'sk_multi_leg_bookings', // confirmed multi-leg history
} as const;

function generateBookingId(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `SK-${date}-${rand}`;
}

function safeGet<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function safeSet(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    console.error('localStorage write failed for key:', key);
  }
}

export function saveSearchQuery(query: SearchQuery): void {
  safeSet(KEYS.SEARCH, query);
}

export function getSearchQuery(): SearchQuery | null {
  return safeGet<SearchQuery>(KEYS.SEARCH);
}

export function saveSelectedCab(cab: Cab): void {
  safeSet(KEYS.CAB, cab);
}

export function getSelectedCab(): Cab | null {
  return safeGet<Cab>(KEYS.CAB);
}

export function getAllBookings(): Booking[] {
  return safeGet<Booking[]>(KEYS.BOOKINGS) ?? [];
}

export function saveBooking(
  data: Omit<Booking, 'id' | 'createdAt' | 'status'> & { id?: string }
): Booking {
  const booking: Booking = {
    ...data,
    id: data.id || generateBookingId(),
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  };

  const existing = getAllBookings();
  safeSet(KEYS.BOOKINGS, [booking, ...existing]);
  return booking;
}

export function getLatestBooking(): Booking | null {
  const all = getAllBookings();
  return all.length > 0 ? all[0] : null;
}

export function updateBookingStatus(id: string, status: Booking['status']): void {
  const all = getAllBookings();
  const updated = all.map(b => (b.id === id ? { ...b, status } : b));
  safeSet(KEYS.BOOKINGS, updated);
}

export function updateBookingDriverAndStatus(
  id: string,
  driverName: string,
  driverCarNumber: string,
  status: Booking['status']
): void {
  const all = getAllBookings();
  const updated = all.map(b =>
    b.id === id ? { ...b, driverName, driverCarNumber, status } : b
  );
  safeSet(KEYS.BOOKINGS, updated);
}

export function clearCurrentSearch(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEYS.SEARCH);
  localStorage.removeItem(KEYS.CAB);
}

export function getAllCabs(): Cab[] {
  const local = safeGet<Cab[]>(KEYS.CABS);
  if (!local || local.length === 0) {
    if (typeof window !== 'undefined') {
      const defaultCabs = require('@/data/data').cabs;
      safeSet(KEYS.CABS, defaultCabs);
      return defaultCabs;
    }
    return [];
  }
  return local;
}

export function saveCab(cabData: Omit<Cab, 'id'>): Cab {
  const cabs = getAllCabs();
  const newCab: Cab = {
    ...cabData,
    id: `cab-${Date.now()}`,
    image: cabData.image || '/images/hyundai_aura.png',
  };
  safeSet(KEYS.CABS, [...cabs, newCab]);
  return newCab;
}

export function updateLocalCab(id: string, cabData: Partial<Cab>): Cab | null {
  const cabs = getAllCabs();
  let updatedCab: Cab | null = null;
  const updatedCabs = cabs.map(c => {
    if (String(c.id) === String(id)) {
      updatedCab = { ...c, ...cabData };
      return updatedCab;
    }
    return c;
  });
  safeSet(KEYS.CABS, updatedCabs);
  return updatedCab;
}

export function deleteLocalCab(id: string | number): void {
  const cabs = getAllCabs();
  const filtered = cabs.filter(c => String(c.id) !== String(id));
  safeSet(KEYS.CABS, filtered);
}

// ─── Multi-Leg Draft (being built by customer) ────────────────────────────────
export function getMultiLegDraft(): BookingLeg[] {
  return safeGet<BookingLeg[]>(KEYS.MULTI_LEG_DRAFT) ?? [];
}

export function saveMultiLegDraft(legs: BookingLeg[]): void {
  safeSet(KEYS.MULTI_LEG_DRAFT, legs);
}

export function clearMultiLegDraft(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEYS.MULTI_LEG_DRAFT);
}

export function isMultiLegMode(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('sk_multi_leg_mode') === 'true';
}

export function setMultiLegMode(on: boolean): void {
  if (typeof window === 'undefined') return;
  if (on) {
    localStorage.setItem('sk_multi_leg_mode', 'true');
  } else {
    localStorage.removeItem('sk_multi_leg_mode');
  }
}

// ─── Multi-Leg Booking History ────────────────────────────────────────────────
function generateMasterRef(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `SK-ML-${date}-${rand}`;
}

export function getAllMultiLegBookings(): MultiLegBooking[] {
  return safeGet<MultiLegBooking[]>(KEYS.MULTI_LEG_BOOKINGS) ?? [];
}

export function saveMultiLegBooking(
  data: Omit<MultiLegBooking, 'masterRef' | 'createdAt' | 'status'>
): MultiLegBooking {
  const booking: MultiLegBooking = {
    ...data,
    masterRef: generateMasterRef(),
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  };
  const existing = getAllMultiLegBookings();
  safeSet(KEYS.MULTI_LEG_BOOKINGS, [booking, ...existing]);
  return booking;
}

export function cancelMultiLegBooking(masterRef: string): void {
  const all = getAllMultiLegBookings();
  const updated = all.map(b => b.masterRef === masterRef ? { ...b, status: 'cancelled' as const } : b);
  safeSet(KEYS.MULTI_LEG_BOOKINGS, updated);
}

export function getLatestMultiLegBooking(): MultiLegBooking | null {
  const all = getAllMultiLegBookings();
  return all.length > 0 ? all[0] : null;
}
