'use client';

import { useEffect } from 'react';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error('Unhandled app error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-foreground px-4 text-center">
      <div className="w-16 h-16 rounded-full border border-red-500/20 bg-red-500/10 flex items-center justify-center mb-6 text-red-500">
        <AlertTriangle className="w-8 h-8" />
      </div>
      
      <h1 className="text-2xl font-black text-foreground mb-2">Something went wrong!</h1>
      <p className="text-sm text-muted max-w-sm mb-8">
        An unexpected error occurred during your session. Please try again or return home.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => reset()}
          className="inline-flex items-center justify-center gap-2 bg-teal-400 text-black px-6 py-3 rounded-xl font-bold text-sm hover:opacity-90 active:scale-95 transition-all shadow-md"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
        <button
          onClick={() => router.push('/')}
          className="inline-flex items-center justify-center gap-2 bg-card hover:bg-neutral-800 text-foreground border border-border px-6 py-3 rounded-xl font-bold text-sm active:scale-95 transition-all"
        >
          <Home className="w-4 h-4" />
          Go Home
        </button>
      </div>
    </div>
  );
}
