'use client';

import { useEffect, useState } from 'react';
import { Users, Briefcase, Snowflake, Star, CalendarDays, Clock, ArrowLeftRight, Search, Layers } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getSearchQuery, saveSelectedCab, saveSearchQuery, getAllCabs } from '@/lib/bookingStore';
import { GST_RATE, calculateBasePrice, calculateFareBreakdown, fromCities, toCities } from '@/data/data';
import type { SearchQuery, Cab } from '@/lib/types';
import CityInput from './CityInput';
import { getCabs } from '@/services/api';

const TRIP_LABELS: Record<string, string> = {
  oneway: 'One Way',
  round: 'Round Trip',
  local: 'Local',
  airport: 'Airport',
};

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function formatTime(timeStr: string) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
}

const getCabImage = (cab: Cab) => {
  if (cab.image) return cab.image;
  const n = String(cab.CarType).toLowerCase();
  if (n.includes('cng')) return '/images/hyundai_aura.png';
  if (n.includes('diesel')) return '/images/maruti_dzire.png';
  if (n.includes('premium') || n.includes('city') || n.includes('executive')) return '/images/honda_city.png';
  if (n.includes('ertiga') || n.includes('suv')) return '/images/maruti_ertiga.png';
  if (n.includes('crysta') || n.includes('innova')) return '/images/innova_crysta.png';
  if (n.includes('fortuner')) return '/images/toyota_fortuner.png';
  if (n.includes('traveller')) return '/images/mini_traveller.png';
  return '/images/hyundai_aura.png';
};

const mapVehicleToCab = (v: any): Cab => {
  let parsedFeatures: any = {};
  try {
    if (v.carFeatures && typeof v.carFeatures === 'string' && v.carFeatures.startsWith('{')) {
      parsedFeatures = JSON.parse(v.carFeatures);
    }
  } catch { }

  let fuelType: 'CNG' | 'Diesel' | 'Petrol' | 'Electric' = 'Petrol';
  if (parsedFeatures.fuelType) {
    const ft = String(parsedFeatures.fuelType).toLowerCase();
    if (ft === 'cng') fuelType = 'CNG';
    else if (ft === 'diesel') fuelType = 'Diesel';
    else if (ft === 'electric') fuelType = 'Electric';
    else fuelType = 'Petrol';
  }

  const ac: boolean = parsedFeatures.ac !== undefined ? Boolean(parsedFeatures.ac) : true;

  const bags: number = parsedFeatures.bags != null
    ? Number(parsedFeatures.bags)
    : (v.totalSeat >= 10 ? 8 : v.totalSeat >= 6 ? 4 : 2);

  const image: string = parsedFeatures.image || '';

  const displayName = v.carName || v.carType || 'Premium Cab';
  const categoryLabel = v.carType || '';

  let advancePercent = 20;
  const nameLower = String(v.carName || '').toLowerCase();
  const typeLower = String(v.carType || '').toLowerCase();
  if (nameLower.includes('premium') || typeLower.includes('suv') || nameLower.includes('suv')) advancePercent = 25;
  else if (nameLower.includes('innova') || nameLower.includes('fortuner') || nameLower.includes('traveller') || typeLower.includes('bus')) advancePercent = 30;

  return {
    id: String(v.id || ''),
    CarType: displayName,
    image: image,
    basePrice: Number(v.cabPrice ?? 0),
    carName: categoryLabel,
    totalSeat: Number(v.totalSeat ?? 4),
    bags: bags,
    rating: Number(v.rating ?? 4.5),
    fuelType: fuelType,
    ac: ac,
    advancePercent: advancePercent,
    extraKmRate: v.extraKmRate != null ? Number(v.extraKmRate) : undefined,
  };
};

export default function CabListingPage() {
  const router = useRouter();
  const [search, setSearch] = useState<SearchQuery | null>(null);
  const [passengers, setPassengers] = useState(4);
  const [cabs, setCabs] = useState<Cab[]>([]);

  const [editFrom, setEditFrom] = useState('');
  const [editTo, setEditTo] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editTripType, setEditTripType] = useState<string>('oneway');
  const [editReturnDate, setEditReturnDate] = useState('');
  const [editReturnTime, setEditReturnTime] = useState('');
  const [editAirportType, setEditAirportType] = useState<'drop' | 'pickup'>('drop');

  useEffect(() => {
    const query = getSearchQuery();
    setSearch(query);
    if (query?.passengers) setPassengers(query.passengers);
    if (query) {
      setEditFrom(query.from || '');
      setEditTo(query.to || '');
      setEditDate(query.date || '');
      setEditTime(query.time || '');
      setEditTripType(query.tripType || 'oneway');
      setEditReturnDate(query.returnDate || '');
      setEditReturnTime(query.returnTime || '');
      setEditAirportType((query.airportTripType as 'drop' | 'pickup') || 'drop');
    }

    const localCabs = getAllCabs();
    setCabs(localCabs);

    getCabs()
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map(mapVehicleToCab);
          setCabs(mapped);
        }
      })
      .catch(err => {
        console.warn("Failed to fetch cabs from backend, using local fleet data:", err);
      });
  }, []);

  const updateSearchState = (updatedFields: Partial<SearchQuery>) => {
    if (!search) return;
    const tripType = (updatedFields.tripType !== undefined ? updatedFields.tripType : editTripType) as SearchQuery['tripType'];
    const updated: SearchQuery = {
      ...search,
      from: updatedFields.from !== undefined ? updatedFields.from : editFrom,
      to: updatedFields.to !== undefined ? updatedFields.to : editTo,
      date: updatedFields.date !== undefined ? updatedFields.date : editDate,
      time: updatedFields.time !== undefined ? updatedFields.time : editTime,
      tripType,
      passengers: updatedFields.passengers !== undefined ? updatedFields.passengers : passengers,
      returnDate: tripType === 'round' ? (updatedFields.returnDate !== undefined ? updatedFields.returnDate : editReturnDate || undefined) : undefined,
      returnTime: tripType === 'round' ? (updatedFields.returnTime !== undefined ? updatedFields.returnTime : editReturnTime || undefined) : undefined,
      airportTripType: tripType === 'airport' ? (updatedFields.airportTripType !== undefined ? updatedFields.airportTripType : editAirportType) : undefined,
    };
    saveSearchQuery(updated);
    setSearch(updated);
  };

  const updatePassengers = (val: number) => {
    const newVal = Math.max(1, Math.min(20, val));
    setPassengers(newVal);
    updateSearchState({ passengers: newVal });
  };

  const handleInlineSearch = () => {
    if (!search) return;
    const tripType = (editTripType as SearchQuery['tripType']) || search.tripType;
    const updated: SearchQuery = {
      ...search,
      from: editFrom || search.from,
      to: editTo || search.to,
      date: editDate || search.date,
      time: editTime || search.time,
      tripType,
      passengers,
      returnDate: tripType === 'round' ? (editReturnDate || undefined) : undefined,
      returnTime: tripType === 'round' ? (editReturnTime || undefined) : undefined,
      airportTripType: tripType === 'airport' ? editAirportType : undefined,
    };
    saveSearchQuery(updated);
    setSearch(updated);
  };

  const handleBookNow = (cabId: string) => {
    const cab = cabs.find(c => c.id === cabId);
    if (!cab || !search) return;

    saveSelectedCab(cab);
    router.push('/booking');
  };

  return (
    <section className="min-h-screen bg-background text-foreground px-4 py-20 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">

        <div className="sticky top-18 z-30 mb-6 rounded-xl border border-teal-500/30 bg-background/90 backdrop-blur-md shadow-lg overflow-visible">
          {search ? (
            <div className="p-2 lg:p-4">
              <div className="flex flex-wrap lg:flex-nowrap items-end gap-2">
                <div className="w-full lg:w-[90px] text-left flex justify-center items-center">
                  <p className="text-lg font-bold text-foreground">Cab Booking</p>
                </div>
                <div className="shrink-0">
                  <p className="text-[9px] lg:text-[10px] font-bold uppercase tracking-widest text-teal-400 mb-0.5">Trip Type</p>
                  <select
                    value={editTripType}
                    onChange={e => {
                      const val = e.target.value as SearchQuery['tripType'];
                      setEditTripType(val);
                      updateSearchState({ tripType: val });
                    }}
                    className="h-8 lg:h-8 rounded-lg border border-teal-500/30 bg-background/60 text-foreground px-2.5 text-xs lg:text-sm outline-none focus:border-teal-400 font-semibold transition-colors cursor-pointer"
                  >
                    <option value="oneway">One Way</option>
                    <option value="round">Round Trip</option>
                    <option value="local">Local</option>
                    <option value="airport">Airport</option>
                  </select>
                </div>

                {editTripType === 'airport' ? (
                  <>
                    <div className="shrink-0">
                      <p className="text-[9px] lg:text-[10px] font-bold uppercase tracking-widest text-teal-400 mb-0.5">Sub Type</p>
                      <select
                        value={editAirportType}
                        onChange={e => {
                          const val = e.target.value as 'drop' | 'pickup';
                          setEditAirportType(val);
                          updateSearchState({ airportTripType: val });
                        }}
                        className="h-8 lg:h-8 rounded-lg border border-teal-500/30 bg-background/60 text-foreground px-2.5 text-xs lg:text-sm outline-none focus:border-teal-400 font-semibold transition-colors"
                      >
                        <option value="drop">Drop to Airport</option>
                        <option value="pickup">Pickup from Airport</option>
                      </select>
                    </div>

                    <div className="flex-1 min-w-[10px]">
                      <CityInput
                        id="bar-from-airport"
                        label={editAirportType === 'drop' ? 'Pickup City' : 'Drop City'}
                        value={editFrom}
                        onChange={val => {
                          setEditFrom(val);
                          updateSearchState({ from: val });
                        }}
                        suggestions={fromCities}
                      />
                    </div>

                    <div className="shrink-0">
                      <p className="text-[9px] lg:text-[10px] font-bold uppercase tracking-widest text-teal-400 mb-0.5">
                        {editAirportType === 'drop' ? 'Drop Airport' : 'Pickup Airport'}
                      </p>
                      <select
                        value={editTo}
                        onChange={e => {
                          const val = e.target.value;
                          setEditTo(val);
                          updateSearchState({ to: val });
                        }}
                        className="h-8 lg:h-8 rounded-lg border border-teal-500/30 bg-background/60 text-foreground px-2.5 text-xs lg:text-sm outline-none focus:border-teal-400 font-semibold transition-colors"
                      >
                        <option>Mumbai Airport</option>
                        <option>Pune Airport</option>
                        <option>Nashik Airport</option>
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex-1 min-w-[130px]">
                      <CityInput
                        id="bar-from"
                        label="From"
                        value={editFrom}
                        onChange={val => {
                          setEditFrom(val);
                          updateSearchState({ from: val });
                        }}
                        suggestions={fromCities}
                      />
                    </div>

                    {editTripType !== 'local' && (
                      <button
                        onClick={() => {
                          const t = editFrom;
                          setEditFrom(editTo);
                          setEditTo(t);
                          updateSearchState({ from: editTo, to: t });
                        }}
                        className="shrink-0 mb-0.5 w-9 h-8 lg:w-8 lg:h-8 flex items-center justify-center rounded-lg border border-teal-500/30 bg-background/60 text-teal-400 hover:bg-teal-500 hover:text-black transition-all hover:scale-110 active:scale-95"
                        title="Swap cities"
                      >
                        <ArrowLeftRight size={15} />
                      </button>
                    )}

                    {editTripType !== 'local' && (
                      <div className="flex-1 min-w-[130px]">
                        <CityInput
                          id="bar-to"
                          label="To"
                          value={editTo}
                          onChange={val => {
                            setEditTo(val);
                            updateSearchState({ to: val });
                          }}
                          suggestions={toCities}
                        />
                      </div>
                    )}
                  </>
                )}

                <div className="shrink-0">
                  <p className="text-[9px] lg:text-[10px] font-bold uppercase tracking-widest text-teal-400 mb-0.5 flex items-center gap-1">
                    <CalendarDays size={10} /> Date
                  </p>
                  <input
                    type="date"
                    value={editDate}
                    onChange={e => {
                      setEditDate(e.target.value);
                      updateSearchState({ date: e.target.value });
                    }}
                    className="h-8 lg:h-8 rounded-lg border border-teal-500/30 bg-background/60 text-foreground px-2 lg:px-3 text-xs lg:text-sm outline-none focus:border-teal-400 font-semibold transition-colors"
                  />
                </div>

                <div className="shrink-0">
                  <p className="text-[9px] lg:text-[10px] font-bold uppercase tracking-widest text-teal-400 mb-0.5 flex items-center gap-1">
                    <Clock size={10} /> Time
                  </p>
                  <input
                    type="time"
                    value={editTime}
                    onChange={e => {
                      setEditTime(e.target.value);
                      updateSearchState({ time: e.target.value });
                    }}
                    className="h-8 lg:h-8 rounded-lg border border-teal-500/30 bg-background/60 text-foreground px-2 lg:px-3 text-xs lg:text-sm outline-none focus:border-teal-400 font-semibold transition-colors"
                  />
                </div>

                {editTripType === 'round' && (
                  <>
                    <div className="shrink-0">
                      <p className="text-[9px] lg:text-[10px] font-bold uppercase tracking-widest text-teal-400 mb-0.5 flex items-center gap-1">
                        <CalendarDays size={10} /> Return
                      </p>
                      <input
                        type="date"
                        value={editReturnDate}
                        min={editDate}
                        onChange={e => {
                          setEditReturnDate(e.target.value);
                          updateSearchState({ returnDate: e.target.value });
                        }}
                        className="h-8 lg:h-8 rounded-lg border border-teal-500/30 bg-background/60 text-foreground px-2 lg:px-3 text-xs lg:text-sm outline-none focus:border-teal-400 font-semibold transition-colors"
                      />
                    </div>
                    <div className="shrink-0">
                      <p className="text-[9px] lg:text-[10px] font-bold uppercase tracking-widest text-teal-400 mb-0.5 flex items-center gap-1">
                        <Clock size={10} /> Ret. Time
                      </p>
                      <input
                        type="time"
                        value={editReturnTime}
                        onChange={e => {
                          setEditReturnTime(e.target.value);
                          updateSearchState({ returnTime: e.target.value });
                        }}
                        className="h-8 lg:h-8 rounded-lg border border-teal-500/30 bg-background/60 text-foreground px-2 lg:px-3 text-xs lg:text-sm outline-none focus:border-teal-400 font-semibold transition-colors"
                      />
                    </div>
                  </>
                )}
                <div className="shrink-0">
                  <p className="text-[9px] lg:text-[10px] font-bold uppercase tracking-widest text-teal-400 mb-0.5 flex items-center gap-1">
                    <Users size={10} /> Passengers
                  </p>
                  <div className="h-8 lg:h-8 flex items-center gap-2 rounded-lg border border-teal-500/30 bg-background/60 px-3">
                    <button
                      onClick={() => updatePassengers(passengers - 1)}
                      className="w-4 h-4 flex items-center justify-center rounded bg-teal-500/10 text-teal-400 hover:bg-teal-500 hover:text-black font-bold text-sm transition-colors"
                    >−</button>
                    <span className="text-sm font-bold text-foreground min-w-[20px] text-center">{passengers}</span>
                    <button
                      onClick={() => updatePassengers(passengers + 1)}
                      className="w-4 h-4 flex items-center justify-center rounded bg-teal-500/10 text-teal-400 hover:bg-teal-500 hover:text-black font-bold text-sm transition-colors"
                    >+</button>
                  </div>
                </div>

                {/* ── Search / Apply ── */}
                <button
                  onClick={handleInlineSearch}
                  className="shrink-0 h-8 lg:h-8 px-5 lg:px-6 rounded-lg bg-teal-400 text-black font-bold text-sm flex items-center gap-2 hover:bg-teal-300 active:scale-95 transition-all shadow-md"
                >
                  <Search size={15} />
                  Search
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3 text-muted text-sm">No search query found. <button onClick={() => router.push('/')} className="text-teal-400 underline">Go back and search.</button></div>
          )}
        </div>

        {/* ── Cab Cards ── */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {cabs.filter((cab) => cab.totalSeat >= passengers).map((cab) => {
            const fareBreakdown = calculateFareBreakdown(
              cab,
              search?.date ?? '',
              search?.returnDate,
              search?.tripType,
            );
            const dynamicPrice = fareBreakdown.subtotal;
            const gst = fareBreakdown.gst;
            const total = fareBreakdown.total;

            return (
              <div
                key={cab.id}
                className="rounded-2xl overflow-hidden border border-card-border bg-card card-hover flex flex-col"
              >
                {/* Top */}
                <div className="bg-teal-500/10 px-2 py-2 border-b border-teal-500/10">
                  <h3 className="text-teal-400 font-semibold text-xs truncate">
                    {search
                      ? `${search.from} To ${search.to}`
                      : 'Outstation Cab'}
                  </h3>
                </div>

                {/* Image + Features side by side */}
                <div className="flex items-center gap-2 px-2 pt-2 pb-1 bg-surface">
                  {/* Image */}
                  <div className="relative flex-shrink-0" style={{ width: '55%', height: '110px' }}>
                    <Image
                      src={getCabImage(cab)}
                      alt={cab.carName}
                      fill
                      priority={true}
                      className="object-contain"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  </div>

                  {/* Feature Pills */}
                  <div className="grid grid-cols-2 gap-1 flex-1">
                    <div className="border border-border rounded-lg flex flex-col items-center justify-center gap-0.5 bg-background/50 py-1.5">
                      <Users size={11} className="text-teal-400" />
                      <span className="text-[9px] text-muted uppercase font-bold tracking-wider">Seats</span>
                      <span className="text-[10px] font-bold text-foreground">Max {cab.totalSeat}</span>
                    </div>

                    <div className="border border-border rounded-lg flex flex-col items-center justify-center gap-0.5 bg-background/50 py-1.5">
                      <Briefcase size={11} className="text-teal-400" />
                      <span className="text-[9px] text-muted uppercase font-bold tracking-wider">Bags</span>
                      <span className="text-[10px] font-bold text-foreground">{cab.bags}</span>
                    </div>

                    <div className="border border-border rounded-lg flex flex-col items-center justify-center gap-0.5 bg-background/50 py-1.5">
                      <Snowflake size={11} className="text-teal-400" />
                      <span className="text-[9px] text-muted uppercase font-bold tracking-wider">AC</span>
                      <span className="text-[10px] font-bold text-foreground">Yes</span>
                    </div>

                    <div className="border border-border rounded-lg flex flex-col items-center justify-center gap-0.5 bg-background/50 py-1.5">
                      <span className="text-teal-400 text-[9px] font-black uppercase">⛽</span>
                      <span className="text-[9px] text-muted uppercase font-bold tracking-wider">Fuel</span>
                      <span className="text-[10px] font-bold text-foreground capitalize">{cab.fuelType}</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="px-4 pb-4 pt-1 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between mb-3 gap-2">
                      <div>
                        <h2 className="text-lg font-bold tracking-tight text-foreground">{cab.CarType}</h2>
                        <p className="text-muted text-xs">{cab.carName} or similar</p>
                      </div>

                      <div className="bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded-full text-teal-400 text-xs flex items-center gap-1 shrink-0">
                        {cab.rating} <Star size={11} fill="currentColor" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-muted mb-2 border-t border-border/50 pt-2">
                      <span>✔ Driver Allowance</span>
                      <span className="text-border/60">•</span>
                      <span>✔ Base Fare &amp; Fuel</span>
                    </div>
                  </div>

                  {/* Price + Book */}
                  <div className="flex items-end justify-between border-t border-border/40">
                    <div>
                      <span className="text-2xl font-black text-teal-400">
                        ₹{dynamicPrice.toLocaleString('en-IN')}
                      </span>
                      <p className="text-[10px] text-muted mt-0.5">excl. 5% GST</p>
                    </div>

                    <button
                      onClick={() => handleBookNow(cab.id)}
                      className="px-4 py-2 rounded-xl font-semibold transition-all text-xs bg-teal-400 text-black hover:opacity-90 active:scale-95"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}