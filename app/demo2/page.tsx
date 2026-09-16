'use client';

import { useRef, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import HeroDemo2 from '../../components/home/HeroDemo2';
import Services from '../../components/services/Services';
import Packages from '../../components/packages/Packages';
import Fleet from '../../components/Fleet';
import Testimonials from '../../components/review/Testimonials';
import PopularRoutes from '../../components/PopularRoutes';
import ContactForm from '../../components/ContactForm';
import ContactFormModal from '../../components/ContactFormModal';
import About from '@/components/about/About';

const highlights = [
  'Free Initial Itinerary Design & Consulting',
  '100% Transparency — No Hidden Markups',
  'Fully Refundable Booking Schemes Available',
];

export default function HomePage() {
  const [selectedPackage, setSelectedPackage] = useState('');
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const contactRef = useRef<HTMLElement>(null);

  const handleEnquireClick = (pkgTitle: string) => {
    setSelectedPackage(pkgTitle);
    setIsEnquiryModalOpen(true);
  };

  const handleModalClose = () => {
    setIsEnquiryModalOpen(false);
    setSelectedPackage('');
  };

  return (
    <>
      <ContactFormModal
        isOpen={isEnquiryModalOpen}
        selectedPackage={selectedPackage}
        onClose={handleModalClose}
      />
      <HeroDemo2 />
      <About />
      <Services />
      <Packages onEnquireClick={handleEnquireClick} />
      <Fleet />
      <PopularRoutes />
      <Testimonials />

      {/* Contact / Enquiry Form */}
      <section
        id="contact"
        ref={contactRef}
        className="py-16 px-4 bg-background transition-colors duration-300"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* ── Left: Info Panel ── */}
            <div className="flex flex-col justify-center">
              {/* Badge */}
              <span className="inline-block w-fit px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 mb-6">
                Start Your Journey
              </span>

              {/* Heading */}
              <h2 className="text-4xl md:text-5xl font-extrabold text-foreground leading-tight mb-5">
                Ready to Customize<br />
                <span className="text-teal-500">Your Dream Holiday?</span>
              </h2>

              {/* Description */}
              <p className="text-muted text-base leading-relaxed mb-8 max-w-md">
                Connect with our local destination experts today! We&apos;ll guide you step-by-step, booking{' '}
                <span className="text-teal-500 font-semibold">pristine stays</span>, hiring{' '}
                <span className="text-teal-500 font-semibold">highly-elite guides</span>, and providing top quality services within your planned budget.
              </p>

              {/* Highlights */}
              <ul className="space-y-3">
                {highlights.map((point, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-muted">
                    <CheckCircle2 className="w-5 h-5 text-teal-500 shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* ── Right: Contact Form ── */}
            <div>
              <ContactForm
                selectedPackage={selectedPackage}
                onClearPackage={() => setSelectedPackage('')}
              />
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
