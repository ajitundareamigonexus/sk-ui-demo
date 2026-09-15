'use client';
import { Star, Quote, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getPublicReviews } from '@/services/api';
import ReviewModal from './ReviewModal';
import { getCurrentUser } from '@/lib/authStore';
import { useRouter } from 'next/navigation';
const reviews = [
  {
    name: 'Rahul Sharma',
    role: 'Mumbai → Pune, Sedan',
    initials: 'RS',
    text: 'Excellent cab service! The driver was professional, the car was spotless, and we reached Pune 10 minutes early. Will definitely book again.',
    stars: 5,
  },
  {
    name: 'Priya Desai',
    role: 'Pune → Goa, SUV',
    initials: 'PD',
    text: 'Such a smooth and comfortable Goa trip. The SUV was spacious for all 5 of us and the driver knew all the best routes. Highly recommended!',
    stars: 5,
  },
  {
    name: 'Amit Joshi',
    role: 'Mumbai Airport Transfer',
    initials: 'AJ',
    text: 'Booked a midnight airport transfer and the driver arrived 15 minutes early. Very polite and helped with luggage. Great experience overall.',
    stars: 5,
  },
];

export default function Testimonials() {
  const [fetchedReviews, setFetchedReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await getPublicReviews(0, 10);
      setFetchedReviews(data.content || []);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setUser(getCurrentUser());
    loadReviews();
  }, []);

  const handleWriteReview = () => {
    if (!user) {
      alert("Please login to submit a review.");
      router.push('/login');
      return;
    }
    setIsModalOpen(true);
  };

  // Display fetched reviews, fallback to hardcoded if none exist yet
  const displayReviews = fetchedReviews.length > 0
    ? fetchedReviews.map(r => ({
      name: r.customerName || 'Anonymous',
      role: r.reviewType || 'GENERAL',
      initials: (r.customerName || 'A').charAt(0).toUpperCase(),
      text: r.reviewText,
      stars: r.rating || 5
    }))
    : reviews;

  return (
    <section id="testimonials" className="py-10 px-6 bg-background relative overflow-hidden">
      <ReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          alert('Review submitted successfully! It will be visible after admin approval.');
          loadReviews();
        }}
      />
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-px divider-line" />

      {/* Decorative large quote */}
      <div className="pointer-events-none absolute top-12 right-12 text-primary opacity-5 select-none"
        style={{ fontSize: '20rem', fontFamily: 'serif', lineHeight: 1 }}>
        "
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div className="animate-fade-up flex-1">
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase
                             tracking-widest bg-primary-light text-primary border border-card-border mb-5">
              Testimonials
            </span>
            <h2 className="text-5xl font-bold text-foreground mb-4">What Clients Say</h2>
            <p className="text-muted text-lg max-w-lg">
              Thousands of happy travellers trust Shree Krushna Travels every day.
            </p>
          </div>

          <button
            onClick={handleWriteReview}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-contrast rounded-full font-bold hover:bg-primary-dark transition-all shadow-lg hover:shadow-primary/30 w-fit"
          >
            <Plus size={20} />
            Write a Review
          </button>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {loading ? (
            <div className="col-span-3 text-center py-10 text-muted animate-pulse">Loading reviews...</div>
          ) : (
            displayReviews.map((r, i) => (
              <div
                key={i}
                className={`card-hover relative rounded-3xl border border-card-border bg-surface p-8
                          animate-scale-in delay-${(i + 1) * 100}`}
                style={{ boxShadow: 'var(--shadow-sm)' }}
              >
                {/* Quote icon */}
                <Quote
                  className="absolute top-6 right-6 text-primary opacity-20"
                  size={32}
                />

                {/* Stars */}
                <div className="flex gap-1 mb-5">
                  {Array.from({ length: r.stars }).map((_, s) => (
                    <Star key={s} className="text-primary fill-primary" size={18} />
                  ))}
                </div>

                {/* Review text */}
                <p className="text-muted leading-8 text-sm mb-6 italic">{r.text}</p>

                {/* Reviewer */}
                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center
                              text-sm font-bold text-primary-contrast bg-primary flex-shrink-0"
                  >
                    {r.initials}
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-sm">{r.name}</p>
                    <p className="text-xs text-muted">{r.role}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px divider-line" />
    </section>
  );
}