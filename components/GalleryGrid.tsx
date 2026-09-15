"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Search, X, Image as ImageIcon } from "lucide-react";

interface GalleryItem {
    id: string;
    title: string;
    category: "mountains" | "beaches" | "heritage" | "adventure" | "group";
    image: string;
    location: string;
}

const GALLERY_ITEMS: GalleryItem[] = [
    {
        id: "g1",
        title: "Srinagar Shikara",
        category: "mountains",
        image: "https://images.unsplash.com/photo-1566228015668-4c45dbc4e2f5?q=80&w=800",
        location: "Kashmir, India",
    },
    {
        id: "g2",
        title: "Munnar Tea Gardens",
        category: "mountains",
        image: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=80&w=800",
        location: "Kerala, India",
    },
    {
        id: "g3",
        title: "Pangong Lake Tents",
        category: "adventure",
        image: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?q=80&w=800",
        location: "Ladakh, India",
    },
    {
        id: "g4",
        title: "Calangute Sandy Shore",
        category: "beaches",
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800",
        location: "Goa, India",
    },
    {
        id: "g5",
        title: "Taj Mahal Sunrise",
        category: "heritage",
        image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=800",
        location: "Agra, India",
    },
    {
        id: "g6",
        title: "Nusa Penida Cliffs",
        category: "adventure",
        image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=800",
        location: "Bali, Indonesia",
    },
    {
        id: "g7",
        title: "Hawa Mahal Facade",
        category: "heritage",
        image: "https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?q=80&w=800",
        location: "Jaipur, India",
    },
    {
        id: "g8",
        title: "Luxury Water Villa",
        category: "beaches",
        image: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?q=80&w=800",
        location: "Maldives",
    },
    {
        id: "g10",
        title: "Friends Trip to Mountains",
        category: "group",
        image: "https://images.unsplash.com/photo-1539635278303-d4002c07eae3?q=80&w=800",
        location: "Goa, India",
    },
];

export default function GalleryGrid() {
    const [activeFilter, setActiveFilter] = useState<string>("all");
    const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
    const [showAllImages, setShowAllImages] = useState(false);

    useEffect(() => {
        setShowAllImages(false);
    }, [activeFilter]);

    const categories = [
        { key: "all", name: "All Destinations" },
        { key: "mountains", name: "Hills & Mountains" },
        { key: "beaches", name: "Beaches & Islands" },
        { key: "heritage", name: "Heritage & Culture" },
        { key: "adventure", name: "Adventure & Lakes" },
        { key: "group", name: "Group Tours" },
    ];

    const filteredItems =
        activeFilter === "all"
            ? GALLERY_ITEMS
            : GALLERY_ITEMS.filter((item) => item.category === activeFilter);

    const displayItems = showAllImages ? filteredItems : filteredItems.slice(0, 7);
    const hasMore = filteredItems.length > 7 && !showAllImages;

    const handleInquireClick = (item: GalleryItem) => {
        setSelectedImage(null);

        // Smooth scroll to the contact form
        const contactSection = document.getElementById("contact");
        if (contactSection) {
            contactSection.scrollIntoView({ behavior: "smooth" });

            // Auto-fill destination input
            setTimeout(() => {
                const destInput = document.getElementById("destination") as HTMLInputElement;
                if (destInput) {
                    destInput.value = `${item.title} (${item.location})`;
                    // Focus name field to engage conversion
                    const nameInput = document.getElementById("fullName") as HTMLInputElement;
                    if (nameInput) nameInput.focus();
                }
            }, 800);
        }
    };

    return (
        <div className="w-full">
            {/* Category Navigation Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
                {categories.map((cat) => (
                    <button
                        key={cat.key}
                        onClick={() => setActiveFilter(cat.key)}
                        className={`px-5 py-2.5 text-xs md:text-sm font-semibold rounded-full border transition-all cursor-pointer ${activeFilter === cat.key
                            ? "bg-slate-900 border-slate-900 text-white dark:bg-teal-500 dark:border-teal-500 dark:text-slate-950 shadow-md"
                            : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:border-slate-700"
                            }`}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            {/* Grid Container */}
            <motion.div
                layout
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            >
                <AnimatePresence mode="popLayout">
                    {displayItems.map((item) => (
                        <motion.div
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.4 }}
                            key={item.id}
                            onClick={() => setSelectedImage(item)}
                            className="group relative aspect-square overflow-hidden rounded-3xl bg-slate-100 dark:bg-slate-800 border border-slate-100 dark:border-slate-800/80 shadow-sm cursor-zoom-in"
                        >
                            {/* Image with high hover scaling */}
                            <Image
                                src={item.image}
                                alt={item.title}
                                fill
                                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                className="object-cover transition-transform duration-700 ease-out group-hover:scale-115"
                                unoptimized
                            />

                            {/* Glassmorphic Overlay Description */}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5" />

                            {/* Sliding Content Container */}
                            <div className="absolute bottom-0 left-0 right-0 p-5 transform translate-y-6 group-hover:translate-y-0 transition-transform duration-300 z-10 flex flex-col gap-1 text-white">
                                <div className="flex items-center gap-1 text-teal-400 text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
                                    <MapPin className="w-3 h-3" />
                                    <span>{item.location}</span>
                                </div>
                                <h4 className="text-lg font-bold truncate opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                                    {item.title}
                                </h4>
                                <span className="text-xs text-slate-300 font-light opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-150">
                                    Click to view & inquire
                                </span>
                            </div>

                            {/* Centered magnifying glass decorative icon */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-md text-white rounded-full flex items-center justify-center scale-0 group-hover:scale-100 transition-transform duration-300 ease-out pointer-events-none border border-white/30 shadow-md">
                                <Search className="w-5 h-5" />
                            </div>
                        </motion.div>
                    ))}
                    {hasMore && (
                        <motion.div
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.4 }}
                            onClick={() => setShowAllImages(true)}
                            className="group relative aspect-square overflow-hidden rounded-3xl shadow-lg cursor-pointer flex flex-col items-center justify-center hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border border-slate-100 dark:border-slate-800"
                        >
                            {/* Background image preview */}
                            <div className="absolute inset-0 z-0">
                                <Image
                                    src={filteredItems[7]?.image || "https://images.unsplash.com/photo-1540206351-d6465b3ac5c1?q=80&w=800"}
                                    alt="More Images"
                                    fill
                                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-110 filter blur-[2px]"
                                    unoptimized
                                />
                                <div className="absolute inset-0 bg-slate-950/60 dark:bg-slate-950/70 group-hover:bg-slate-950/50 transition-colors duration-300" />
                            </div>

                            {/* Content */}
                            <div className="relative z-10 flex flex-col items-center text-center p-4">
                                <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110 border border-white/30 shadow-md">
                                    <ImageIcon className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-2xl font-extrabold text-white mb-1">+{filteredItems.length - 7}</span>
                                <span className="text-sm font-semibold text-slate-200">See More Images</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Lightbox Modal Overlay Popup */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedImage(null)}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xl cursor-zoom-out"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 180 }}
                            onClick={(e) => e.stopPropagation()} // Prevent modal closure when clicking inside the window
                            className="relative max-w-4xl w-full bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col cursor-default"
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setSelectedImage(null)}
                                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-all cursor-pointer border border-white/10"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {/* Large Image container */}
                            <div className="relative aspect-[4/3] sm:aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-950">
                                <Image
                                    src={selectedImage.image}
                                    alt={selectedImage.title}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            </div>

                            {/* Lightbox Footer Details */}
                            <div className="p-6 bg-white dark:bg-slate-900 text-slate-800 dark:text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-slate-100 dark:border-slate-800">
                                <div>
                                    <div className="flex items-center gap-1 text-teal-600 dark:text-teal-400 text-xs font-bold uppercase tracking-widest mb-1">
                                        <MapPin className="w-3.5 h-3.5" />
                                        <span>{selectedImage.location}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{selectedImage.title}</h3>
                                </div>

                                {/* Inquiry Trigger CTA Button */}
                                <button
                                    onClick={() => handleInquireClick(selectedImage)}
                                    className="px-6 py-3.5 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-bold text-xs md:text-sm rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer text-center"
                                >
                                    Inquire For This Destination
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}