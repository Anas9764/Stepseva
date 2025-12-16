import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiStar, FiThumbsUp, FiImage } from 'react-icons/fi';
import { reviewService } from '../services/reviewService';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

const ProductReviews = ({ productId }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState('');
  const [sortBy, setSortBy] = useState('-createdAt');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [ratingStats, setRatingStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    distribution: [],
  });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [markingHelpful, setMarkingHelpful] = useState(new Set());
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: '',
    comment: '',
    images: [],
  });

  useEffect(() => {
    fetchReviews();
  }, [productId, ratingFilter, sortBy, page]);

  // Smart refresh: Only check for updates when tab becomes visible or after longer interval
  useEffect(() => {
    if (!productId) return;

    let intervalId;
    let lastCheckTime = Date.now();

    // Function to check if we should refresh (only if tab is visible)
    const checkForUpdates = () => {
      // Only refresh if tab is visible and enough time has passed
      if (document.visibilityState === 'visible') {
        const timeSinceLastCheck = Date.now() - lastCheckTime;
        // Only refresh if it's been more than 2 minutes since last check
        if (timeSinceLastCheck > 120000) {
          fetchReviews();
          lastCheckTime = Date.now();
        }
      }
    };

    // Check when tab becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Refresh when user comes back to the tab
        fetchReviews();
        lastCheckTime = Date.now();
      }
    };

    // Set up interval to check every 2 minutes (only if tab is visible)
    intervalId = setInterval(checkForUpdates, 120000); // 2 minutes

    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        sort: sortBy,
      };
      if (ratingFilter) params.rating = ratingFilter;

      const response = await reviewService.getProductReviews(productId, params);
      setReviews(response.data.reviews || []);
      setTotalPages(response.data.pagination?.pages || 1);
      
      if (response.data.averageRating !== undefined) {
        setRatingStats({
          averageRating: response.data.averageRating || 0,
          totalReviews: response.data.totalReviews || 0,
          distribution: response.data.ratingDistribution || [],
        });
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to submit a review');
      return;
    }

    // Frontend validation
    if (!reviewForm.comment || reviewForm.comment.trim().length === 0) {
      toast.error('Please enter your review comment');
      return;
    }

    if (reviewForm.comment.trim().length > 5000) {
      toast.error('Review comment is too long (max 5000 characters)');
      return;
    }

    if (reviewForm.title && reviewForm.title.trim().length > 200) {
      toast.error('Review title is too long (max 200 characters)');
      return;
    }

    try {
      setSubmittingReview(true);
      await reviewService.createReview({
        productId,
        rating: reviewForm.rating,
        title: reviewForm.title,
        comment: reviewForm.comment,
        images: reviewForm.images,
      });
      setShowReviewForm(false);
      setReviewForm({ rating: 5, title: '', comment: '', images: [] });
      fetchReviews();
      toast.success('Review submitted successfully!');
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleMarkHelpful = async (reviewId) => {
    if (!isAuthenticated) {
      toast.error('Please login to mark as helpful');
      return;
    }

    if (markingHelpful.has(reviewId)) {
      return; // Prevent double-click
    }

    try {
      setMarkingHelpful(prev => new Set(prev).add(reviewId));
      await reviewService.markHelpful(reviewId);
      fetchReviews();
      toast.success('Thank you for your feedback!');
    } catch (error) {
      console.error('Error marking helpful:', error);
      toast.error(error.response?.data?.message || 'Failed to mark as helpful');
    } finally {
      setMarkingHelpful(prev => {
        const newSet = new Set(prev);
        newSet.delete(reviewId);
        return newSet;
      });
    }
  };

  const renderStars = (rating, size = 'text-lg') => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <FiStar
            key={star}
            className={`${size} ${
              star <= rating
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="mt-12 border-t border-gray-200 pt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-secondary">Customer Reviews</h2>
        {isAuthenticated && (
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Write a Review
          </button>
        )}
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200"
        >
          <h3 className="text-xl font-semibold mb-4">Write Your Review</h3>
          <form onSubmit={handleSubmitReview}>
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                    className="text-3xl"
                  >
                    <FiStar
                      className={
                        star <= reviewForm.rating
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">
                Title (Optional)
                {reviewForm.title && (
                  <span className="text-xs text-gray-500 ml-2">
                    {reviewForm.title.length}/200
                  </span>
                )}
              </label>
              <input
                type="text"
                value={reviewForm.title}
                onChange={(e) => {
                  if (e.target.value.length <= 200) {
                    setReviewForm({ ...reviewForm, title: e.target.value });
                  }
                }}
                maxLength={200}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Give your review a title"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">
                Your Review <span className="text-red-500">*</span>
                <span className="text-xs text-gray-500 ml-2">
                  {reviewForm.comment.length}/5000
                </span>
              </label>
              <textarea
                value={reviewForm.comment}
                onChange={(e) => {
                  if (e.target.value.length <= 5000) {
                    setReviewForm({ ...reviewForm, comment: e.target.value });
                  }
                }}
                rows={4}
                required
                maxLength={5000}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Share your experience with this product"
              />
              {reviewForm.comment.length > 4500 && (
                <p className="text-xs text-amber-600 mt-1">
                  {5000 - reviewForm.comment.length} characters remaining
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submittingReview || !reviewForm.comment.trim()}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submittingReview ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  'Submit Review'
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowReviewForm(false);
                  setReviewForm({ rating: 5, title: '', comment: '', images: [] });
                }}
                disabled={submittingReview}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Rating Summary */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-1">
          <div className="text-center p-6 bg-gray-50 rounded-xl">
            <div className="text-5xl font-bold text-secondary mb-2">
              {ratingStats.averageRating.toFixed(1)}
            </div>
            {renderStars(Math.round(ratingStats.averageRating), 'text-2xl')}
            <div className="text-sm text-gray-600 mt-2">
              {ratingStats.totalReviews} {ratingStats.totalReviews === 1 ? 'Review' : 'Reviews'}
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const dist = ratingStats.distribution.find((d) => d._id === rating);
              const count = dist?.count || 0;
              const percentage = ratingStats.totalReviews > 0 
                ? (count / ratingStats.totalReviews) * 100 
                : 0;

              return (
                <div key={rating} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-20">
                    <span className="text-sm font-semibold">{rating}</span>
                    <FiStar className="text-yellow-400 fill-yellow-400 text-sm" />
                  </div>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={ratingFilter}
          onChange={(e) => {
            setRatingFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="">All Ratings</option>
          <option value="5">5 Stars</option>
          <option value="4">4 Stars</option>
          <option value="3">3 Stars</option>
          <option value="2">2 Stars</option>
          <option value="1">1 Star</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="-createdAt">Newest First</option>
          <option value="createdAt">Oldest First</option>
          <option value="-rating">Highest Rating</option>
          <option value="rating">Lowest Rating</option>
          <option value="-helpful">Most Helpful</option>
        </select>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="text-center py-8">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No reviews yet. Be the first to review this product!
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <motion.div
              key={review._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-white border border-gray-200 rounded-xl"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="font-semibold text-secondary">
                      {review.user?.name || 'Anonymous'}
                    </div>
                    {review.verifiedPurchase && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  {renderStars(review.rating, 'text-sm')}
                  {review.title && (
                    <div className="font-semibold text-gray-800 mt-1">{review.title}</div>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString()}
                </div>
              </div>

              <p className="text-gray-700 mb-3">{review.comment}</p>

              {review.images && review.images.length > 0 && (
                <div className="flex gap-2 mb-3 flex-wrap">
                  {review.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Review ${idx + 1}`}
                      className="w-20 h-20 object-cover rounded-lg border border-gray-200 cursor-pointer hover:scale-105 transition-transform"
                    />
                  ))}
                </div>
              )}

              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleMarkHelpful(review._id)}
                  disabled={markingHelpful.has(review._id)}
                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {markingHelpful.has(review._id) ? (
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <FiThumbsUp />
                  )}
                  <span>Helpful ({review.helpful || 0})</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductReviews;

