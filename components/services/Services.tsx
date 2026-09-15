"use client";

import { motion } from "framer-motion";
import {
  Compass,
  Plane,
  Car,
  Building,
  Notebook,
  ShieldCheck,
} from "lucide-react";
import SectionHeading from "../SectionHeading";
import ServiceCard from "./ServiceCard";

const SERVICES = [
  {
    title: "Holiday Packages",
    description:
      "Tailor-made domestic & international holiday plans. We manage pristine itineraries, guided sightseeing, and top-tier activities curated for families, couples, and groups.",
    icon: Compass,
  },
  {
    title: "Car Rental Services",
    description:
      "Premium sanitized private cars with polite, verified professional drivers. Available for airport transfers, local sightseeing, outstation tours, and long scenic drives.",
    icon: Car,
    link: "/cabs",
  },
  {
    title: "Flight Booking",
    description:
      "Get the best deals on flight reservations. We offer instant booking, 24/7 rescheduling support, priority check-in assistance, and highly discounted group rates.",
    icon: Plane,
  },
  {
    title: "Hotel Booking",
    description:
      "Enjoy verified premium stays at handpicked 3★, 4★ & 5★ luxury boutique resorts, fully vetted for stellar hospitality, hygiene, safety, and scenic views.",
    icon: Building,
  },
  {
    title: "Passport & Visa Assistance",
    description:
      "Comprehensive support for passport renewal and visa applications. Expert guidance, document preparation, and a smooth process for hassle-free international travel.",
    icon: Notebook,
  },
  {
    title: "Travel Insurance",
    description:
      "Protect your journey with comprehensive travel insurance. Coverage for trip cancellations, medical emergencies, lost luggage, and more — ensuring total peace of mind.",
    icon: ShieldCheck,
  },
];

export default function Services() {
  return (
    <section
      id="services"
      className="bg-background text-foreground px-4 py-16 transition-colors duration-300 relative overflow-hidden"
    >
      {/* Ambient background blobs */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full bg-teal-500/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-cyan-500/5 blur-3xl" />

      <div className="max-w-7xl mx-auto relative z-10">
        <SectionHeading
          badge="Our Offerings"
          title="Premium Travel Services"
          subtitle="From fully-guided private holiday itineraries and flight reservations to sanitized local cabs and luxury resort bookings — we handle everything for a completely stress-free journey."
        />

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap justify-center gap-8 mb-14 mt-2"
        >
          {[
            { value: "10,000+", label: "Happy Customers" },
            { value: "500+", label: "Destinations" },
            { value: "15+", label: "Years Experience" },
            { value: "24/7", label: "Customer Support" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl font-extrabold text-teal-500">{stat.value}</div>
              <div className="text-xs text-muted mt-0.5 font-medium uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((service, index) => (
            <ServiceCard
              key={index}
              title={service.title}
              description={service.description}
              icon={service.icon}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
