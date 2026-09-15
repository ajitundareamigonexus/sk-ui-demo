"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface ServiceCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  index: number;
}

export default function ServiceCard({
  title,
  description,
  icon: Icon,
  index,
}: ServiceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      whileHover={{ y: -6, scale: 1.02 }}
      className="group relative flex flex-col p-6 bg-card border border-border rounded-2xl shadow-sm
                 hover:shadow-xl hover:border-teal-500/30 transition-all duration-300 overflow-hidden cursor-default"
    >
      {/* Ambient gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none" />

      {/* Top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-teal-500 to-cyan-500 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 rounded-t-2xl" />

      {/* Icon */}
      <div className="relative z-10 mb-5 flex items-center justify-center w-14 h-14 rounded-2xl
                      bg-teal-500/10 group-hover:bg-teal-500 transition-all duration-300 shadow-sm">
        <Icon className="w-7 h-7 text-teal-600 dark:text-teal-400 group-hover:text-white transition-colors duration-300 stroke-[1.75]" />
      </div>

      {/* Title */}
      <h3 className="relative z-10 text-base font-bold text-foreground group-hover:text-teal-500
                     transition-colors duration-300 mb-2">
        {title}
      </h3>

      {/* Description */}
      <p className="relative z-10 text-sm text-muted leading-relaxed font-light flex-1">
        {description}
      </p>

      {/* Bottom corner glow */}
      <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full bg-teal-500/10 blur-2xl
                      opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </motion.div>
  );
}
