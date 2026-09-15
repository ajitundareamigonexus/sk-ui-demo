import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-foreground px-4">
      <div className="relative flex flex-col items-center">
        <div className="absolute w-24 h-24 rounded-full border border-teal-500/20 bg-teal-500/5 animate-pulse" />
        <Loader2 className="w-10 h-10 text-teal-400 animate-spin relative z-10" />
      </div>
      <h3 className="text-lg font-bold tracking-wider uppercase text-teal-400 mt-6 animate-pulse">Loading</h3>
      <p className="text-xs text-muted mt-2">Preparing your premium travel experience...</p>
    </div>
  );
}
