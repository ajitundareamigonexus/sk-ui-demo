import { Car, Home } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-foreground px-4 text-center">
      <div className="w-20 h-20 rounded-full border border-teal-500/20 bg-teal-500/5 flex items-center justify-center mb-6 text-teal-400 relative">
        <div className="absolute w-full h-full rounded-full border border-teal-400/10 animate-ping" />
        <Car className="w-10 h-10" />
      </div>
      
      <h1 className="text-7xl font-black text-teal-400 tracking-wider mb-2">404</h1>
      <h2 className="text-xl font-bold text-foreground mb-3">Page Not Found</h2>
      <p className="text-sm text-muted max-w-sm mb-8">
        We can take you anywhere, but this page isn't on our map! Let's get you back on route.
      </p>

      <Link
        href="/"
        className="inline-flex items-center justify-center gap-2 bg-teal-400 text-black px-8 py-3.5 rounded-full font-bold text-sm hover:opacity-90 active:scale-95 transition-all shadow-md"
        style={{ boxShadow: '0 0 25px rgba(34,211,238,0.3)' }}
      >
        <Home className="w-4 h-4" />
        Back To Home
      </Link>
    </div>
  );
}
