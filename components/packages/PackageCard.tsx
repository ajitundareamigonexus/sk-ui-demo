"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Clock, MapPin, Check, Phone, X, Info } from "lucide-react";

export interface PackageType {
  id: string;
  title: string;
  location: string;
  duration: string;
  image: string;
  price: string;
  originalPrice?: string;
  rating: number;
  reviews: number;
  tags: string[];
  highlights: string[];
  featured?: boolean;
}

interface PackageCardProps {
  pkg: PackageType;
  onEnquireClick: (pkgTitle: string) => void;
}

export default function PackageCard({ pkg, onEnquireClick }: PackageCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const whatsappNumber = "918796807060";
  const encodedText = encodeURIComponent(
    `Hi Shree Krushna Travels, I am interested in the "${pkg.title}" package (${pkg.duration}). Please share more details and itinerary.`
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedText}`;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5 }}
        whileHover={{ y: -8 }}
        className="group relative flex flex-col h-full bg-card rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-border"
      >
        {/* Ribbon Tag if Featured */}
        {pkg.featured && (
          <div className="absolute top-4 left-4 z-10">
            <span className="px-3.5 py-1 text-xs font-semibold tracking-wider text-white bg-gradient-to-r from-teal-500 to-cyan-600 rounded-full shadow-lg">
              Best Seller
            </span>
          </div>
        )}

        {/* Package Image & Rating Float */}
        <div
          className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 cursor-pointer"
          onClick={() => setIsModalOpen(true)}
        >
          <Image
            src={pkg.image}
            alt={pkg.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            unoptimized // To allow loading raw external images easily during dev
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

          {/* Rating Floating Badge */}
          <div className="absolute bottom-4 left-4 flex items-center gap-1 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-slate-900 dark:text-teal-400 shadow-md">
            <Star className="w-3.5 h-3.5 fill-teal-400 text-teal-400" />
            <span>{pkg.rating.toFixed(1)}</span>
            <span className="text-slate-400 font-normal">({pkg.reviews})</span>
          </div>

          {/* Price tag floating */}
          <div className="absolute bottom-4 right-4 bg-teal-500 px-3 py-1 rounded-lg text-white font-bold text-sm shadow-md">
            {pkg.price}
          </div>

          {/* Overlay info text */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 text-white px-3 py-1.5 rounded-full backdrop-blur-sm text-sm font-semibold flex items-center gap-1">
            <Info className="w-4 h-4" /> View Details
          </div>
        </div>

        {/* Package Content */}
        <div className="flex flex-col flex-1 p-6">
          {/* Destination Location */}
          <div className="flex items-center gap-1.5 text-teal-600 dark:text-teal-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <MapPin className="w-3.5 h-3.5" />
            <span>{pkg.location}</span>
          </div>

          {/* Title */}
          <h3
            onClick={() => setIsModalOpen(true)}
            className="text-xl font-bold text-foreground group-hover:text-teal-500 transition-colors duration-300 line-clamp-1 mb-2 cursor-pointer"
          >
            {pkg.title}
          </h3>

          {/* Duration */}
          <div className="flex items-center gap-2 text-muted text-sm mb-4">
            <Clock className="w-4 h-4 text-muted" />
            <span>{pkg.duration}</span>
          </div>

          {/* Highlights/Inclusions */}
          <div className="grid grid-cols-2 gap-2 mb-6 text-xs text-muted">
            {pkg.highlights.slice(0, 4).map((highlight, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="line-clamp-1">{highlight}</span>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="mt-auto pt-4 border-t border-border grid grid-cols-2 gap-3">
            <button
              onClick={() => onEnquireClick(pkg.title)}
              className="w-full py-2.5 px-3 text-xs font-bold text-center text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all rounded-xl cursor-pointer"
            >
              Inquire Now
            </button>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-bold text-center text-white bg-emerald-500 hover:bg-emerald-600 transition-all rounded-xl shadow-md cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5 fill-current" />
              WhatsApp
            </a>
          </div>
        </div>
      </motion.div>

      {/* Package Details Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xl overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row my-8"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-all border border-white/20"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Image Section */}
              <div className="relative w-full md:w-2/5 aspect-[4/3] md:aspect-auto">
                <Image
                  src={pkg.image}
                  alt={pkg.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:bg-gradient-to-r md:from-black/20 md:to-transparent" />

                {pkg.featured && (
                  <div className="absolute top-4 left-4">
                    <span className="px-3.5 py-1 text-xs font-semibold tracking-wider text-white bg-gradient-to-r from-teal-500 to-cyan-600 rounded-full shadow-lg">
                      Best Seller
                    </span>
                  </div>
                )}
              </div>

              {/* Content Section */}
              <div className="w-full md:w-3/5 p-6 md:p-8 flex flex-col bg-white dark:bg-slate-900">
                <div className="flex items-center gap-1.5 text-teal-600 dark:text-teal-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{pkg.location}</span>
                </div>

                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-3">
                  {pkg.title}
                </h2>

                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-6">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-teal-500" />
                    <span>{pkg.duration}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span>{pkg.rating.toFixed(1)} ({pkg.reviews} reviews)</span>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 uppercase tracking-wider">Package Highlights</h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-600 dark:text-slate-300">
                    {pkg.highlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {pkg.tags && pkg.tags.length > 0 && (
                  <div className="mb-8 flex flex-wrap gap-2">
                    {pkg.tags.map((tag, idx) => (
                      <span key={idx} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-full border border-slate-200 dark:border-slate-700">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Starting from</p>
                      <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">{pkg.price}</div>
                    </div>

                    <div className="flex flex-row gap-3">
                      <button
                        onClick={() => {
                          setIsModalOpen(false);
                          onEnquireClick(pkg.title);
                        }}
                        className="px-6 py-3 font-bold text-white bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 transition-all rounded-xl shadow-md cursor-pointer"
                      >
                        Inquire
                      </button>
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-6 py-3 font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition-all rounded-xl shadow-md shadow-emerald-500/20 cursor-pointer"
                      >
                        <Phone className="w-4 h-4 fill-current" />
                        WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
