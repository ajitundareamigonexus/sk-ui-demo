export default function CabsLoading() {
  return (
    <section className="min-h-screen bg-background text-foreground px-4 py-28 animate-pulse">
      <div className="max-w-7xl mx-auto">
        {/* Top Bar Skeleton */}
        <div className="mb-10 rounded-3xl border border-teal-500/10 bg-teal-500/5 h-20 w-full" />
        
        {/* Cab Grid Skeleton */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-3xl border border-card-border bg-card flex flex-col overflow-hidden h-[420px]">
              {/* Header */}
              <div className="bg-teal-500/5 px-4 py-4 border-b border-teal-500/5 h-10 w-full" />
              {/* Image box */}
              <div className="p-4 bg-surface/50 h-36 flex items-center justify-center">
                <div className="w-4/5 h-24 bg-neutral-800 rounded-xl" />
              </div>
              {/* Info section */}
              <div className="px-4 pb-4 pt-4 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="h-5 bg-neutral-800 rounded-lg w-2/3" />
                  <div className="h-4 bg-neutral-800 rounded-lg w-1/3" />
                  <div className="grid grid-cols-4 gap-2 py-2">
                    <div className="h-16 bg-neutral-800 rounded-xl" />
                    <div className="h-16 bg-neutral-800 rounded-xl" />
                    <div className="h-16 bg-neutral-800 rounded-xl" />
                    <div className="h-16 bg-neutral-800 rounded-xl" />
                  </div>
                </div>
                {/* Price and button */}
                <div className="flex items-center justify-between border-t border-border/40 pt-4">
                  <div className="space-y-2">
                    <div className="h-6 bg-neutral-800 rounded-lg w-16" />
                    <div className="h-3 bg-neutral-800 rounded-lg w-10" />
                  </div>
                  <div className="h-10 bg-neutral-800 rounded-xl w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
