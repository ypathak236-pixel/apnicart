import React, { useState } from 'react';
import { X, Star, Heart, Check, Sparkles, MessageSquare } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface CustomerFeedbackModalProps {
  isOpen: boolean;
  orderId?: string;
  onClose: () => void;
}

export const CustomerFeedbackModal: React.FC<CustomerFeedbackModalProps> = ({
  isOpen,
  orderId,
  onClose
}) => {
  const { user, activeTown, submitFeedback } = useStore();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Super Fast Delivery', 'Fresh Items']);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');

  if (!isOpen) return null;

  const availableTags = [
    'Super Fast Delivery',
    'Fresh Items',
    'Safe Packaging',
    'Polite Rider',
    'Accurate Stock',
    'Easy Razorpay Payment'
  ];

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(prev => prev.filter(t => t !== tag));
    } else {
      setSelectedTags(prev => [...prev, tag]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setFeedbackError('Please write a short review before submitting.');
      setTimeout(() => setFeedbackError(''), 3000);
      return;
    }

    submitFeedback({
      rating,
      comment: comment.trim(),
      tags: selectedTags,
      orderId
    });

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
              <Star className="h-4 w-4 fill-amber-500" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white font-display text-base">
                Town Customer Feedback & Rating
              </h3>
              <p className="text-xs text-slate-500">
                Help improve quick commerce in {activeTown.name}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="py-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <Check className="h-8 w-8" />
            </div>
            <h4 className="mt-4 font-bold text-slate-900 dark:text-white text-base">
              Shukriya! Feedback Submitted
            </h4>
            <p className="mt-1 text-xs text-slate-500">
              Your feedback is now visible in our Town ratings and to store managers.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            
            {/* Star Selector */}
            <div className="text-center py-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Rate your 10-minute delivery experience:
              </label>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 transition-transform hover:scale-125"
                  >
                    <Star
                      className={`h-8 w-8 transition-colors ${
                        star <= rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-200 dark:text-slate-700'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="mt-1 block text-xs font-bold text-amber-600 dark:text-amber-400">
                {rating === 5 ? 'Excellent ⭐⭐⭐⭐⭐' : rating === 4 ? 'Very Good ⭐⭐⭐⭐' : rating === 3 ? 'Average ⭐⭐⭐' : 'Needs Improvement'}
              </span>
            </div>

            {/* Quick compliments */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                What went well?
              </label>
              <div className="flex flex-wrap gap-1.5">
                {availableTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Comment Textarea */}
            <div>
              {feedbackError && (
                <div className="mb-2 rounded-lg bg-rose-50 p-2 text-center text-xs font-semibold text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                  {feedbackError}
                </div>
              )}
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Your Feedback & Comments
              </label>
              <textarea
                rows={3}
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience (e.g. delivery time, product quality, rider behavior)..."
                className="w-full rounded-xl border border-slate-300 p-3 text-xs focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="text-[11px] text-slate-400">
              Posting as <strong className="text-slate-700 dark:text-slate-300">{user?.name || 'Local Town Customer'}</strong> from <span className="text-emerald-600 font-semibold">{activeTown.name}</span>.
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white hover:bg-emerald-700 active:scale-95 transition-all shadow-md"
            >
              Submit Customer Review
            </button>

          </form>
        )}

      </div>
    </div>
  );
};

