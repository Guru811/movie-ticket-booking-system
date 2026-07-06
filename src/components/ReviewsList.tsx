import React, { useState, useEffect } from 'react';
import { Review } from '../types';
import { useApp } from '../context/AppContext';
import { Star, MessageSquare, Trash, CornerDownRight, PlusCircle, Calendar } from 'lucide-react';

interface ReviewsListProps {
  movieId: string;
  onReviewAdded: () => void;
}

export const ReviewsList: React.FC<ReviewsListProps> = ({ movieId, onReviewAdded }) => {
  const { user, apiFetch } = useApp();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

  const fetchReviews = async () => {
    try {
      const data = await apiFetch(`/api/reviews/movie/${movieId}`);
      setReviews(data);
    } catch (e) {
      console.error('Failed to load reviews', e);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [movieId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setIsSubmitting(true);
    try {
      await apiFetch('/api/reviews', {
        method: 'POST',
        body: JSON.stringify({ movieId, rating, comment }),
      });
      setComment('');
      setRating(5);
      await fetchReviews();
      onReviewAdded();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete your review?')) return;
    try {
      await apiFetch(`/api/reviews/${reviewId}`, { method: 'DELETE' });
      await fetchReviews();
      onReviewAdded();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div id="movie-reviews-engine" className="space-y-6">
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <MessageSquare size={16} className="text-rose-500" />
        <h3 className="text-sm font-black text-white uppercase tracking-wider">User Reviews ({reviews.length})</h3>
      </div>

      {/* Review Submission Form */}
      {user ? (
        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-4 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs font-bold text-zinc-300">Share your rating:</span>
            
            {/* Star selector */}
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(null)}
                  className="p-1 cursor-pointer transition-transform duration-100 hover:scale-110"
                >
                  <Star
                    size={20}
                    className={`stroke-none ${
                      star <= (hoveredStar ?? rating)
                        ? 'fill-amber-400'
                        : 'fill-white/10 hover:fill-white/20'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-mono text-amber-400 font-bold ml-2">({rating} / 5)</span>
            </div>
          </div>

          <div className="space-y-2">
            <textarea
              placeholder="What did you think of the cinematography, story, cast performance? Write your review..."
              rows={3}
              required
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full bg-white/5 border border-white/10 focus:border-rose-500/50 text-zinc-200 rounded-xl p-3 text-xs focus:outline-none placeholder:text-zinc-600 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-white/10 hover:bg-white/15 border border-white/10 hover:text-white text-zinc-300 font-bold py-2 rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <PlusCircle size={14} />
            {isSubmitting ? 'Posting...' : 'Post Review'}
          </button>
        </form>
      ) : (
        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl text-center backdrop-blur-md">
          <p className="text-xs text-zinc-500">Please sign in to rate this movie and share your review.</p>
        </div>
      )}

      {/* Review Feed */}
      {reviews.length === 0 ? (
        <div className="text-center py-6 text-xs text-zinc-500 italic">
          No reviews yet. Be the first to review this movie!
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((rev) => (
            <div key={rev.id} className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-2 relative backdrop-blur-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-extrabold text-amber-400 uppercase shadow-inner">
                    {rev.userName.substring(0, 1)}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-zinc-200">{rev.userName}</h5>
                    <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                      <Calendar size={10} />
                      <span>{rev.createdAt.split('T')[0]}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/10">
                  <Star size={11} className="fill-amber-400 stroke-none" />
                  <span className="text-[10px] font-bold text-amber-400">{rev.rating}</span>
                </div>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed pl-1">
                {rev.comment}
              </p>

              {/* Action Toolbar for owner */}
              {user && rev.userId === user.id && (
                <button
                  onClick={() => handleDelete(rev.id)}
                  className="absolute bottom-3 right-4 p-1 text-zinc-650 hover:text-rose-400 transition-colors"
                  title="Delete Review"
                >
                  <Trash size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
