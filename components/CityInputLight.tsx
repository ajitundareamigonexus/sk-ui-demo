'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';

interface CityInputProps {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    suggestions: string[];
}

export default function CityInputLight({
    id,
    label,
    value,
    onChange,
    suggestions,
}: CityInputProps) {
    const [query, setQuery] = useState(value);
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setQuery(value);
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                ref.current &&
                !ref.current.contains(e.target as Node)
            ) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () =>
            document.removeEventListener(
                'mousedown',
                handleClickOutside
            );
    }, []);

    const filtered = query.trim()
        ? suggestions.filter(city =>
            city.toLowerCase().includes(query.toLowerCase())
        )
        : suggestions;

    const selectCity = (city: string) => {
        setQuery(city);
        onChange(city);
        setOpen(false);
    };

    return (
        <div ref={ref} className="relative" id={id}>
            <label className="block text-[11px] font-semibold text-slate-900 mb-1">
                {label}
            </label>

            <div className="relative">
                <MapPin
                    size={12}
                    className="absolute left-2 top-1/2 -translate-y-1/2 text-teal-400"
                />

                <input
                    type="text"
                    value={query}
                    autoComplete="off"
                    onFocus={() => setOpen(true)}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        onChange(e.target.value);
                        setOpen(true);
                    }}
                    className="w-full h-8 rounded-xl border border-slate-400 bg-white text-slate-900 pl-8 pr-3 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all placeholder:text-slate-400 font-medium"
                />
            </div>

            {open && filtered.length > 0 && (
                <ul className="absolute z-50 left-0 right-0 mt-2 max-h-52 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl py-1">
                    {filtered.map((city) => (
                        <li
                            key={city}
                            onMouseDown={() => selectCity(city)}
                            className="px-4 py-2.5 text-sm cursor-pointer hover:bg-slate-50 text-slate-700 font-medium transition-colors"
                        >
                            {city}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}