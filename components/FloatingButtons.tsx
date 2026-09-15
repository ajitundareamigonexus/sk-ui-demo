import { MessageCircle, Phone } from 'lucide-react';

export default function FloatingButtons() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '918796807060';
  const phoneNumber = process.env.NEXT_PUBLIC_PHONE_NUMBER || '8796807060';

  return (
    <>
      {/* WhatsApp */}
      <div className="fixed bottom-4 sm:bottom-6 left-4 sm:left-6 z-50 group">
        <span
          className="absolute inset-0 w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-green-500 opacity-40"
          style={{ animation: 'pulse-ring 2s ease-out infinite' }}
        />
        <a
          href={`https://wa.me/${whatsappNumber}?text=Hi!%20I%20want%20to%20book%20a%20cab%20with%20SK%20Car%20Rental.`}
          target="_blank"
          rel="noopener noreferrer"
          className="relative w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-green-500 hover:bg-green-400
                     flex items-center justify-center text-white shadow-2xl
                     transition-all duration-200 hover:scale-110 active:scale-95"
          style={{ boxShadow: '0 4px 24px rgba(34,197,94,0.55)' }}
          aria-label="WhatsApp"
        >
          <MessageCircle size={18} className="sm:hidden" />
          <MessageCircle size={24} className="hidden sm:block" />
        </a>
        <span className="absolute left-12 sm:left-16 bottom-2 sm:bottom-3 bg-gray-900 text-white text-xs
                         font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap
                         opacity-0 group-hover:opacity-100 pointer-events-none
                         transition-opacity duration-200 shadow-lg">
          Chat on WhatsApp
        </span>
      </div>

      {/* Call */}
      <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 group">
        <span
          className="absolute inset-0 w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-orange-500 opacity-40"
          style={{ animation: 'pulse-ring 2s ease-out infinite 0.5s' }}
        />
        <a
          href={`tel:${phoneNumber}`}
          className="relative w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-orange-500 hover:bg-orange-400
                     flex items-center justify-center text-white shadow-2xl
                     transition-all duration-200 hover:scale-110 active:scale-95"
          style={{ boxShadow: '0 4px 24px rgba(249,115,22,0.55)' }}
          aria-label="Call"
        >
          <Phone size={18} className="sm:hidden" />
          <Phone size={24} className="hidden sm:block" />
        </a>
        <span className="absolute right-12 sm:right-16 bottom-2 sm:bottom-3 bg-gray-900 text-white text-xs
                         font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap
                         opacity-0 group-hover:opacity-100 pointer-events-none
                         transition-opacity duration-200 shadow-lg">
          Call Now
        </span>
      </div>
    </>
  );
}