import { useState, useEffect } from 'react';
import { getAdminReviews, approveReview, rejectReview, hideReview } from '@/services/api';
import { Check, X, EyeOff, Eye, Star } from 'lucide-react';
import { hasPermission } from '@/helper/permissions-handler';

export default function AdminReviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [statusTab, setStatusTab] = useState('PENDING'); // PENDING, APPROVED, REJECTED
  const [loading, setLoading] = useState(false);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const data = await getAdminReviews(statusTab, 0, 50);
      setReviews(data.content || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [statusTab]);

  const handleAction = async (id: string, action: 'approve' | 'reject' | 'hide') => {
    try {
      if (action === 'approve') await approveReview(id);
      else if (action === 'reject') await rejectReview(id, 'Admin rejected');
      else if (action === 'hide') await hideReview(id, 'Admin hidden');

      fetchReviews();
    } catch (err) {
      alert('Action failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4 border-b border-border overflow-x-auto pb-2">
        {['PENDING', 'APPROVED', 'REJECTED'].map(tab => (
          <button
            key={tab}
            onClick={() => setStatusTab(tab)}
            className={`px-4 py-2 font-semibold whitespace-nowrap rounded-t-lg transition-colors ${statusTab === tab
              ? 'text-teal-400 border-b-2 border-teal-400 bg-surface'
              : 'text-muted hover:text-foreground'
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-10 text-muted animate-pulse">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-10 text-muted bg-surface rounded-2xl border border-border">
          No reviews found in this category.
        </div>
      ) : (
        <div className="grid gap-4">
          {reviews.map(r => (
            <div key={r.id} className="bg-card border border-border p-6 rounded-2xl flex flex-col md:flex-row justify-between md:items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-contrast flex items-center justify-center font-bold flex-shrink-0">
                    {(r.customerName || r.customerEmail || 'A').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-foreground">
                      {r.customerName || r.customerEmail || 'Anonymous'}
                    </div>
                    <div className="text-xs text-muted flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-surface border border-border">
                        {r.reviewType}
                      </span>
                      {r.submittedAt && new Date(r.submittedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-primary mb-2">
                  {Array.from({ length: r.rating || 5 }).map((_, i) => (
                    <Star key={i} size={16} className="fill-primary" />
                  ))}
                </div>

                <h4 className="font-semibold text-lg text-foreground mb-1">{r.title}</h4>
                <p className="text-muted text-sm leading-relaxed">{r.reviewText}</p>
              </div>

              <div className="flex md:flex-col gap-2 shrink-0">
                {(statusTab === 'PENDING' || statusTab === 'HIDDEN' || statusTab === 'REJECTED') && hasPermission('Review', 'approve') && (
                  <button
                    onClick={() => handleAction(r.id, 'approve')}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500/10 text-green-500 rounded-xl hover:bg-green-500/20 transition-colors font-medium text-sm w-full md:w-32"
                  >
                    <Check size={16} /> Approve
                  </button>
                )}

                {statusTab === 'PENDING' && hasPermission('Review', 'reject') && (
                  <button
                    onClick={() => handleAction(r.id, 'reject')}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-colors font-medium text-sm w-full md:w-32"
                  >
                    <X size={16} /> Reject
                  </button>
                )}

                {(statusTab === 'APPROVED') && hasPermission('Review', 'hide') && (
                  <button
                    onClick={() => handleAction(r.id, 'hide')}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-yellow-500/10 text-yellow-500 rounded-xl hover:bg-yellow-500/20 transition-colors font-medium text-sm w-full md:w-32"
                  >
                    <EyeOff size={16} /> Hide
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
