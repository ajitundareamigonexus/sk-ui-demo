"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import PackageCard, { PackageType } from "./PackageCard";
import { getPackagesApi } from "@/services/api";

interface InternationalPackagesProps {
  onEnquireClick: (pkgTitle: string) => void;
}

export default function InternationalPackages({
  onEnquireClick,
}: InternationalPackagesProps) {
  const [packages, setPackages] = useState<PackageType[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchSheet = fetch("https://opensheet.elk.sh/1Z1raUjzntY0_rYsGA1zDCrMb7VtJtdx5PQ5yXGD8P0M/Sheet1")
      .then((res) => res.ok ? res.json() : [])
      .catch(() => []);

    const fetchBackend = getPackagesApi().catch(() => []);

    Promise.all([fetchSheet, fetchBackend]).then(([sheetData, backendData]) => {
      const sheetInternational = Array.isArray(sheetData)
        ? sheetData
          .filter((item: any) => item.category === "international")
          .map((item: any, index: number) => ({
            ...item,
            id: item.id ? String(item.id) : `i-${index}`,
            image: item.image === "image-link" || !item.image ? "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=800" : item.image,
            rating: Number(item.rating) || 4.5,
            reviews: Number(item.reviews) || 0,
            featured: String(item.featured).toLowerCase() === "true",
            tags: item.tags ? String(item.tags).split(",") : [],
            highlights: item.highlights ? String(item.highlights).split(",") : [],
          }))
        : [];

      const backendInternational = Array.isArray(backendData)
        ? backendData
          .filter((item: any) => item.category === "international")
          .map((v: any) => ({
            id: v.id,
            title: v.packageName || '',
            location: `${v.sourceCity || ''} to ${v.destinationCity || ''}`,
            duration: v.validDays ? `${v.validDays} Days` : '1 Day',
            image: v.image || "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=800",
            price: v.packageFare ? `₹${Number(v.packageFare).toLocaleString('en-IN')}` : '₹0',
            rating: Number(v.rating || 4.8),
            reviews: Number(v.reviews || 12),
            tags: v.highlights ? String(v.highlights).split(",") : ["Tour", "Private Cab"],
            highlights: v.highlights ? String(v.highlights).split(",") : ["Private Cab", "Sightseeing", "Hotel Stay"],
            featured: true,
          }))
        : [];

      setPackages([...backendInternational, ...sheetInternational]);
    });
  }, []);

  const displayPackages = showAll ? packages : packages.slice(0, 5);
  const hasMore = packages.length > 5 && !showAll;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
      {displayPackages.map((pkg) => (
        <PackageCard
          key={pkg.id}
          pkg={pkg}
          onEnquireClick={onEnquireClick}
        />
      ))}
      {hasMore && (
        <motion.div
          whileHover={{ scale: 1.02 }}
          onClick={() => setShowAll(true)}
          className="relative flex flex-col items-center justify-center p-8 rounded-[2rem] overflow-hidden cursor-pointer h-full min-h-[400px] group bg-card border border-border shadow-md hover:shadow-xl transition-all duration-300"
        >
          {/* Background image preview */}
          <div className="absolute inset-0 z-0">
            <Image
              src={packages[5]?.image || "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=800"}
              alt="More Packages"
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-110 filter blur-[2px]"
              unoptimized
            />
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-slate-950/60 dark:bg-slate-950/70 group-hover:bg-slate-950/50 transition-colors duration-300" />
          </div>

          {/* Content on top */}
          <div className="relative z-10 flex flex-col items-center text-center">
            <motion.div
              whileHover={{ scale: 1.2, rotate: 10 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-4 transition-transform duration-300 border border-white/30 shadow-lg"
            >
              <span className="text-2xl font-extrabold text-white">+{packages.length - 5}</span>
            </motion.div>
            <motion.h3
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-xl font-bold text-white mb-2"
            >
              See More Packages
            </motion.h3>
            <p className="text-slate-200 text-sm max-w-[200px]">
              Click to view all {packages.length} packages
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
