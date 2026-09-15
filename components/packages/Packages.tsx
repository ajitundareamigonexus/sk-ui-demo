"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, MapPin } from "lucide-react";
import SectionHeading from "../SectionHeading";
import DomesticPackages from "./DomesticPackages";
import InternationalPackages from "./InternationalPackages";

interface PackagesProps {
  onEnquireClick: (pkgTitle: string) => void;
}

export default function Packages({ onEnquireClick }: PackagesProps) {
  const [activeTab, setActiveTab] = useState<"domestic" | "international">("domestic");

  return (
    <section
      id="packages"
      className="bg-background text-foreground px-4 py-16 transition-colors duration-300 relative overflow-hidden"
    >
      {/* Ambient blobs */}
      <div className="pointer-events-none absolute top-0 right-0 w-80 h-80 rounded-full bg-teal-500/5 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 w-80 h-80 rounded-full bg-cyan-500/5 blur-3xl" />

      <div className="max-w-7xl mx-auto relative z-10">
        <SectionHeading
          badge="Featured Packages"
          title="Trending Holiday Packages"
          subtitle="Browse our highest-rated vacation plans carefully tailored with premium hotels, private luxury cabs, scenic sightseeing, and delectable meals."
        />

        {/* Tab Switcher */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mt-10 mb-6"
        >
          <div className="relative inline-flex items-center bg-gray-100 dark:bg-gray-700 border border-border rounded-2xl p-1.5 shadow-lg gap-1">
            {/* Sliding pill indicator */}
            <motion.div
              className="absolute top-1.5 bottom-1.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 shadow-md"
              animate={{
                left: activeTab === "domestic" ? "6px" : "50%",
                right: activeTab === "domestic" ? "50%" : "6px",
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />

            <button
              onClick={() => setActiveTab("domestic")}
              className={`relative z-10 flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-200 cursor-pointer ${activeTab === "domestic"
                ? "text-black"
                : "text-slate-600 dark:text-white hover:text-black-900 dark:hover:text-white"
                }`}
            >
              <MapPin className="w-4 h-4" />
              Domestic Packages
            </button>
            <button
              onClick={() => setActiveTab("international")}
              className={`relative z-10 flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-200 cursor-pointer ${activeTab === "international"
                ? "text-black"
                : "text-slate-600 dark:text-white hover:text-slate-900 dark:hover:text-white"
                }`}
            >
              <Globe className="w-4 h-4" />
              International Packages
            </button>
          </div>
        </motion.div>

        {/* Active Tab Label */}
        <motion.p
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-sm text-muted mb-8"
        >
          {activeTab === "domestic"
            ? "✈️ Explore the best of India — from misty mountains to coastal retreats."
            : "🌍 Discover world-class destinations handpicked by our travel experts."}
        </motion.p>

        {/* Package Grid */}
        <AnimatePresence mode="wait">
          {activeTab === "domestic" ? (
            <motion.div
              key="domestic"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <DomesticPackages onEnquireClick={onEnquireClick} />
            </motion.div>
          ) : (
            <motion.div
              key="international"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <InternationalPackages onEnquireClick={onEnquireClick} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
