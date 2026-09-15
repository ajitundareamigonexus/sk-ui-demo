"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    User,
    Mail,
    Phone,
    MapPin,
    MessageSquare,
    Send,
    CheckCircle,
    ShieldCheck,
    Clock,
    Sparkles,
} from "lucide-react";

interface ContactFormProps {
    selectedPackage?: string;
    onClearPackage?: () => void;
}

export default function ContactForm({
    selectedPackage = "",
    onClearPackage,
}: ContactFormProps) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        destination: "",
        message: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

    // Sync selected package prop to form state
    useEffect(() => {
        if (selectedPackage) {
            setFormData((prev) => ({ ...prev, destination: selectedPackage }));
        }
    }, [selectedPackage]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const WEB3FORMS_ACCESS_KEY = "YOUR_ACCESS_KEY_HERE";

            let emailSuccess = false;

            if (WEB3FORMS_ACCESS_KEY && WEB3FORMS_ACCESS_KEY !== "YOUR_ACCESS_KEY_HERE") {
                const response = await fetch("https://api.web3forms.com/submit", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    body: JSON.stringify({
                        access_key: WEB3FORMS_ACCESS_KEY,
                        name: formData.name,
                        email: formData.email,
                        phone: formData.phone,
                        destination: formData.destination,
                        message: formData.message,
                        subject: `New Travel Enquiry from ${formData.name} - Shree Krushna Travels`
                    })
                });

                const result = await response.json();
                if (result.success) emailSuccess = true;
            } else {
                await new Promise((resolve) => setTimeout(resolve, 1000));
                emailSuccess = true;
            }

            if (emailSuccess) {
                setSubmitStatus("success");

                const whatsappNumber = "918796807060";
                const messageText = `Hi Shree Krushna Travels! I just submitted an enquiry on your website:\n\n*Name:* ${formData.name}\n*Phone:* ${formData.phone}\n*Email:* ${formData.email}\n*Destination:* ${formData.destination}\n*Message:* ${formData.message}`;
                const encodedText = encodeURIComponent(messageText);
                const whatsappUrl = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodedText}`;

                window.open(whatsappUrl, "_blank");

                setFormData({ name: "", email: "", phone: "", destination: "", message: "" });
                if (onClearPackage) onClearPackage();
            } else {
                setSubmitStatus("error");
            }
        } catch {
            setSubmitStatus("error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClass =
        "w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-xl text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors";

    const labelClass = "text-xs font-bold uppercase tracking-wider text-foreground";

    return (
        <div className="w-full bg-card border border-border rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden">
            {/* Ambient glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-cyan-600/10 blur-3xl pointer-events-none" />

            <AnimatePresence mode="wait">
                {submitStatus === "success" ? (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex flex-col items-center justify-center text-center py-12 px-4"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 15 }}
                            className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-6"
                        >
                            <CheckCircle className="w-10 h-10" />
                        </motion.div>
                        <h3 className="text-2xl font-bold text-foreground mb-3">
                            Inquiry Submitted Successfully!
                        </h3>
                        <p className="text-muted max-w-sm mb-8 leading-relaxed font-light">
                            Thank you for choosing Shree Krushna Travels. Our executive will contact you within the next 2 hours with customized plans.
                        </p>
                        <button
                            onClick={() => setSubmitStatus("idle")}
                            className="px-6 py-2.5 font-bold text-sm text-white bg-teal-500 hover:bg-teal-600 rounded-xl shadow-md transition-colors cursor-pointer"
                        >
                            Submit Another Inquiry
                        </button>
                    </motion.div>
                ) : (
                    <motion.form
                        key="form"
                        onSubmit={handleSubmit}
                        className="space-y-6 relative z-10"
                    >
                        {/* Header */}
                        <div className="border-b border-border pb-5 mb-2">
                            <div className="flex items-center gap-2 text-teal-500 text-xs font-semibold uppercase tracking-wider mb-1">
                                <Sparkles className="w-4 h-4" />
                                <span>Tailor-made Journeys</span>
                            </div>
                            <h3 className="text-2xl font-bold text-foreground">
                                Plan Your Vacation
                            </h3>
                            <p className="text-muted text-sm font-light">
                                Fill out this quick form and we'll draft your absolute dream itinerary.
                            </p>
                        </div>

                        {/* Selected package badge */}
                        {selectedPackage && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-teal-500/10 border border-teal-500/20 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-teal-700 dark:text-teal-400"
                            >
                                <span>
                                    Inquiring about: <strong>{selectedPackage}</strong>
                                </span>
                                {onClearPackage && (
                                    <button
                                        type="button"
                                        onClick={onClearPackage}
                                        className="font-bold underline hover:text-teal-600 ml-2 cursor-pointer"
                                    >
                                        Change Destination
                                    </button>
                                )}
                            </motion.div>
                        )}

                        {/* Inputs Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Full Name */}
                            <div className="space-y-2">
                                <label className={labelClass}>Full Name</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted pointer-events-none">
                                        <User className="w-4 h-4" />
                                    </span>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter your name"
                                        className={inputClass}
                                    />
                                </div>
                            </div>

                            {/* Email Address */}
                            <div className="space-y-2">
                                <label className={labelClass}>Email Address</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted pointer-events-none">
                                        <Mail className="w-4 h-4" />
                                    </span>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        placeholder="name@example.com"
                                        className={inputClass}
                                    />
                                </div>
                            </div>

                            {/* Phone Number */}
                            <div className="space-y-2">
                                <label className={labelClass}>Phone Number</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted pointer-events-none">
                                        <Phone className="w-4 h-4" />
                                    </span>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter 10-digit mobile"
                                        className={inputClass}
                                    />
                                </div>
                            </div>

                            {/* Destination */}
                            <div className="space-y-2">
                                <label className={labelClass}>Destination</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted pointer-events-none">
                                        <MapPin className="w-4 h-4" />
                                    </span>
                                    <input
                                        type="text"
                                        name="destination"
                                        value={formData.destination}
                                        onChange={handleChange}
                                        required
                                        placeholder="e.g. Kashmir, Kerala, Bali"
                                        className={inputClass}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Message */}
                        <div className="space-y-2">
                            <label className={labelClass}>
                                Special Requirements &amp; Preferences
                            </label>
                            <div className="relative">
                                <span className="absolute top-3.5 left-3.5 text-muted pointer-events-none">
                                    <MessageSquare className="w-4 h-4" />
                                </span>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    rows={4}
                                    placeholder="Tell us about your interests: hotel category, flight preferences, dietary needs, or specific sightseeing..."
                                    className={`${inputClass} resize-none`}
                                />
                            </div>
                        </div>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-2 gap-4 pt-2 text-xs text-muted">
                            <div className="flex items-center gap-1.5">
                                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                <span>100% Private &amp; Secure</span>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-4 px-6 flex items-center justify-center gap-2 font-bold text-white bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 rounded-2xl shadow-lg shadow-teal-500/10 hover:shadow-teal-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer"
                        >
                            {isSubmitting ? (
                                <>
                                    <svg
                                        className="animate-spin h-5 w-5 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>
                                    <span>Processing Enquiry...</span>
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    <span>Submit Enquiry</span>
                                </>
                            )}
                        </button>
                    </motion.form>
                )}
            </AnimatePresence>
        </div>
    );
}
