import { Shield, Car, Plane, MapPin } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Safe Travel',
    description: 'Professional, verified drivers with GPS tracking and 24/7 monitoring for a secure journey.',
    stat: '100% Safe',
  },
  {
    icon: Car,
    title: 'Luxury Fleet',
    description: 'Premium sedans, SUVs and luxury vehicles — clean, air-conditioned and well-maintained.',
    stat: '50+ Cars',
  },
  {
    icon: Plane,
    title: 'Airport Transfers',
    description: '24/7 airport pickup and drop with real-time flight tracking and on-time guarantee.',
    stat: '24/7 Service',
  },
  {
    icon: MapPin,
    title: 'All India Service',
    description: 'Local, outstation and long-distance travel across Maharashtra and beyond.',
    stat: '50+ Cities',
  },
];

export default function About() {
  return (
    <section id="about" className="py-10 px-6 bg-background relative overflow-hidden">
      {/* Background accent */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-px divider-line" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-up">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase
                           tracking-widest bg-primary-light text-primary border border-card-border mb-5">
            Why Choose Us
          </span>
          <h2 className="text-5xl font-bold text-foreground mb-4">
            Premium Travel Experience
          </h2>
          <p className="text-muted max-w-xl mx-auto text-lg leading-7">
            Every ride is designed to be comfortable, safe and on-time.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((item, i) => (
            <div
              key={i}
              className={`card-hover rounded-2xl border border-card-border bg-surface p-4
                          animate-scale-in delay-${(i + 1) * 100}`}
              style={{ boxShadow: 'var(--shadow-sm)' }}
            >
              {/* Icon */}
              <div
                className="icon-glow w-12 h-12 rounded-2xl flex items-center justify-center mb-2
                            bg-primary-light transition-all duration-300"
              >
                <item.icon className="text-primary" size={20} />
              </div>

              {/* Stat badge */}
              <span className="text-xs font-bold uppercase tracking-widest text-primary mb-3 block">
                {item.stat}
              </span>

              <h3 className="text-xl font-bold mb-3 text-foreground">{item.title}</h3>
              <p className="text-muted leading-7 text-sm">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px divider-line" />
    </section>
  );
}