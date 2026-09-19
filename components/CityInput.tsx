'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';

interface CityInputProps {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    suggestions: string[];
    inputClassName?: string;
}

export default function CityInput({
    id,
    label,
    value,
    onChange,
    suggestions,
    inputClassName = 'h-8 text-xs',
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
            <label className="block text-[8px] font-semibold text-white/60 mb-0.5">
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
                    className={`w-full rounded-lg border border-border bg-background text-foreground pl-6 pr-2 outline-none focus:border-primary ${inputClassName}`}
                />
            </div>

            {open && filtered.length > 0 && (
                <ul className="absolute z-50 left-0 right-0 mt-1 max-h-52 overflow-y-auto rounded-lg border border-border bg-black/60 backdrop-blur-2xl shadow-xl">
                    {filtered.map((city) => (
                        <li
                            key={city}
                            onMouseDown={() => selectCity(city)}
                            className="px-3 py-2 text-xs cursor-pointer hover:bg-white/5"
                        >
                            {city}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}