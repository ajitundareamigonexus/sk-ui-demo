export default function BookingLoading() {
  return (
    <section className="min-h-screen bg-background text-foreground pt-28 pb-16 px-4 animate-pulse">
      <div className="max-w-6xl mx-auto">
        <div className="h-10 bg-neutral-800 rounded-lg w-1/3 mx-auto mb-10" />
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-72 bg-card border border-card-border rounded-3xl p-6" />
            <div className="h-64 bg-card border border-card-border rounded-3xl p-6" />
          </div>
          <div className="h-96 bg-card border border-card-border rounded-3xl p-6" />
        </div>
      </div>
    </section>
  );
}
