import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { reviewService } from '../services/reviewService';
import Table from '../components/Table';
import Button from '../components/Button';
import SearchInput from '../components/SearchInput';
import Loader from '../components/Loader';
import Pagination from '../components/Pagination';
import { Star, CheckCircle, XCircle, Trash2, Filter, X, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import useNotifications from '../hooks/useNotifications';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;
  const [filters, setFilters] = useState({
    productId: '',
    rating: '',
    isApproved: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { markReviewsAsSeen, notificationItems, markAsRead } = useNotifications();

  // Track last fetch time to prevent excessive calls
  const lastFetchRef = useRef(0);
  const MIN_FETCH_INTERVAL = 30000; // 30 seconds minimum between fetches

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        ...filters,
      };
      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null) {
          delete params[key];
        }
      });

      const response = await reviewService.getAllReviews(params);
      if (response.success) {
        setReviews(response.data.reviews || []);
        setTotalPages(response.data.pagination?.pages || 1);
        setTotalItems(response.data.pagination?.total || 0);
      } else {
        setError(response.message || 'Failed to fetch reviews');
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError(err.response?.data?.message || 'Failed to fetch reviews');
      toast.error(err.response?.data?.message || 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters, itemsPerPage]);

  useEffect(() => {
    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchRef.current;

    // Only fetch if enough time has passed since last fetch
    if (timeSinceLastFetch >= MIN_FETCH_INTERVAL) {
      fetchReviews();
      lastFetchRef.current = now;
    }
  }, [fetchReviews]);

  // Mark reviews as seen when page loads (separate effect to avoid dependency issues)
  useEffect(() => {
    markReviewsAsSeen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Mark review notifications as read when viewing reviews page (separate effect to avoid loops)
  useEffect(() => {
    const unreadReviewNotifications = notificationItems.filter(n => n.type === 'review' && !n.read);
    if (unreadReviewNotifications.length > 0) {
      unreadReviewNotifications.forEach(n => markAsRead(n.id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Smart refresh: Only check for updates when tab becomes visible (with throttling)
  useEffect(() => {
    let intervalId;
    let lastCheckTime = Date.now();
    const REFRESH_INTERVAL = 180000; // 3 minutes

    // Function to check if we should refresh (only if tab is visible)
    const checkForUpdates = () => {
      if (document.visibilityState === 'visible') {
        const timeSinceLastCheck = Date.now() - lastCheckTime;
        // Only refresh if it's been more than 3 minutes since last check
        if (timeSinceLastCheck > REFRESH_INTERVAL) {
          const timeSinceLastFetch = Date.now() - lastFetchRef.current;
          // Also check minimum fetch interval
          if (timeSinceLastFetch >= MIN_FETCH_INTERVAL) {
            fetchReviews();
            lastCheckTime = Date.now();
            lastFetchRef.current = Date.now();
          }
        }
      }
    };

    // Check when tab becomes visible (with throttling)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const timeSinceLastCheck = Date.now() - lastCheckTime;
        const timeSinceLastFetch = Date.now() - lastFetchRef.current;
        // Only refresh if enough time has passed
        if (timeSinceLastCheck > REFRESH_INTERVAL && timeSinceLastFetch >= MIN_FETCH_INTERVAL) {
          fetchReviews();
          lastCheckTime = Date.now();
          lastFetchRef.current = Date.now();
        }
      }
    };

    // Set up interval to check every 3 minutes (only if tab is visible)
    intervalId = setInterval(checkForUpdates, REFRESH_INTERVAL);

    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchReviews]); // Include fetchReviews in deps

  const handleApprove = async (reviewId, isApproved) => {
    try {
      await reviewService.approveReview(reviewId, isApproved);
      toast.success(`Review ${isApproved ? 'approved' : 'rejected'} successfully`);

      // Optimize: Update local state instead of full refetch
      setReviews(prevReviews =>
        prevReviews.map(review =>
          review._id === reviewId
            ? { ...review, isApproved, isActive: isApproved }
            : review
        )
      );

      // Update selected review if modal is open
      if (selectedReview?._id === reviewId) {
        setSelectedReview(prev => ({ ...prev, isApproved, isActive: isApproved }));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update review');
      // Fallback to full refetch on error
      fetchReviews();
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      await reviewService.deleteReview(reviewId);
      toast.success('Review deleted successfully');

      // Optimize: Remove from local state instead of full refetch
      setReviews(prevReviews => prevReviews.filter(review => review._id !== reviewId));
      setTotalItems(prev => Math.max(0, prev - 1));

      // Close modal if deleted review was selected
      if (selectedReview?._id === reviewId) {
        setIsModalOpen(false);
        setSelectedReview(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete review');
      // Fallback to full refetch on error
      fetchReviews();
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
          />
        ))}
      </div>
    );
  };

  // Filter reviews by search query
  const filteredReviews = useMemo(() => {
    if (!searchQuery) return reviews;
    const query = searchQuery.toLowerCase();
    return reviews.filter(
      (review) =>
        review.user?.name?.toLowerCase().includes(query) ||
        review.product?.name?.toLowerCase().includes(query) ||
        review.product?._id?.toLowerCase().includes(query) ||
        review.product?._id?.slice(-8).toLowerCase().includes(query) || // Last 8 chars of ID
        review.comment?.toLowerCase().includes(query) ||
        review.title?.toLowerCase().includes(query)
    );
  }, [reviews, searchQuery]);

  const columns = [
    {
      header: 'Product',
      render: (review) => (
        <div className="flex items-center gap-3">
          {review.product?.image && (
            <img
              src={review.product.image}
              alt={review.product.name}
              className="w-12 h-12 object-cover rounded-lg"
            />
          )}
          <div>
            <div className="font-medium text-gray-900">{review.product?.name || 'N/A'}</div>
            <div className="text-sm text-gray-500">ID: {review.product?._id?.slice(-8) || 'N/A'}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'User',
      render: (review) => (
        <div>
          <div className="font-medium text-gray-900">{review.user?.name || 'Anonymous'}</div>
          <div className="text-sm text-gray-500">{review.user?.email || 'N/A'}</div>
        </div>
      ),
    },
    {
      header: 'Rating',
      render: (review) => (
        <div className="flex items-center gap-2">
          {renderStars(review.rating)}
          <span className="text-sm font-medium text-gray-700">({review.rating})</span>
        </div>
      ),
    },
    {
      header: 'Title',
      render: (review) => (
        <div className="max-w-xs">
          <div className="font-medium text-gray-900 truncate">{review.title || 'No title'}</div>
          <div className="text-sm text-gray-500 truncate">{review.comment?.substring(0, 50)}...</div>
        </div>
      ),
    },
    {
      header: 'Status',
      render: (review) => (
        <div className="flex items-center gap-2">
          {review.isApproved ? (
            <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
              <CheckCircle size={12} />
              Approved
            </span>
          ) : (
            <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
              <XCircle size={12} />
              Pending
            </span>
          )}
          {review.verifiedPurchase && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
              Verified
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Date',
      render: (review) => (
        <div className="text-sm text-gray-600">
          {new Date(review.createdAt).toLocaleDateString()}
        </div>
      ),
    },
    {
      header: 'Actions',
      render: (review) => (
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setSelectedReview(review);
              setIsModalOpen(true);
            }}
            className="whitespace-nowrap"
          >
            <Eye size={16} className="mr-1" />
            View
          </Button>
          {!review.isApproved && (
            <Button
              variant="success"
              size="sm"
              onClick={() => handleApprove(review._id, true)}
              className="whitespace-nowrap"
            >
              Approve
            </Button>
          )}
          {review.isApproved && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleApprove(review._id, false)}
              className="whitespace-nowrap"
            >
              Reject
            </Button>
          )}
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDelete(review._id)}
            className="whitespace-nowrap"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      ),
    },
  ];

  if (loading && reviews.length === 0) {
    return <Loader />;
  }

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reviews</h1>
          <p className="text-gray-600 mt-1">Manage product reviews and ratings</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => setShowFilters(!showFilters)}
            className="whitespace-nowrap"
          >
            <Filter size={18} className="mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Filters</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product ID</label>
              <input
                type="text"
                value={filters.productId}
                onChange={(e) => {
                  setFilters({ ...filters, productId: e.target.value });
                  setCurrentPage(1);
                }}
                placeholder="Enter product ID"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
              <select
                value={filters.rating}
                onChange={(e) => {
                  setFilters({ ...filters, rating: e.target.value });
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.isApproved}
                onChange={(e) => {
                  setFilters({ ...filters, isApproved: e.target.value });
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="true">Approved</option>
                <option value="false">Pending</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by user name, product name, product ID, or review content..."
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <Loader />
      ) : filteredReviews.length === 0 ? (
        <div className="bg-white p-12 rounded-lg border border-gray-200 text-center">
          <p className="text-gray-500">No reviews found</p>
          {reviews.length === 0 && !error && (
            <p className="text-sm text-gray-400 mt-2">Try running the seed script: npm run seed:reviews</p>
          )}
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
            <Table data={filteredReviews} columns={columns} />
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            align="right"
          />
        </>
      )}

      {/* Review Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedReview(null);
        }}
        title="Review Details"
        size="lg"
      >
        {selectedReview && (
          <div className="space-y-6">
            {/* Review Header */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-semibold text-gray-900">{selectedReview.user?.name || 'Anonymous'}</div>
                  <div className="text-sm text-gray-500">{selectedReview.user?.email || 'N/A'}</div>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(selectedReview.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="flex items-center gap-3 mb-3">
                {renderStars(selectedReview.rating)}
                <span className="text-lg font-semibold text-gray-700">({selectedReview.rating}/5)</span>
              </div>
              {selectedReview.title && (
                <h3 className="font-semibold text-gray-900 mb-2">{selectedReview.title}</h3>
              )}
              <p className="text-gray-800">{selectedReview.comment}</p>
            </div>

            {/* Product Info */}
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              {selectedReview.product?.image && (
                <img
                  src={selectedReview.product.image}
                  alt={selectedReview.product.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
              )}
              <div>
                <div className="font-semibold text-gray-900">{selectedReview.product?.name || 'N/A'}</div>
                <div className="text-sm text-gray-500">Product ID: {selectedReview.product?._id || 'N/A'}</div>
              </div>
            </div>

            {/* Review Images */}
            {selectedReview.images && selectedReview.images.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Review Images</h3>
                <div className="grid grid-cols-3 gap-2">
                  {selectedReview.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Review image ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-gray-200"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Review Status */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-gray-900">Status:</span>
                {selectedReview.isApproved ? (
                  <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    <CheckCircle size={12} />
                    Approved
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                    <XCircle size={12} />
                    Pending
                  </span>
                )}
                {selectedReview.verifiedPurchase && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    Verified Purchase
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-500">
                Helpful: {selectedReview.helpful || 0}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-200">
              {!selectedReview.isApproved && (
                <Button
                  variant="success"
                  onClick={() => {
                    handleApprove(selectedReview._id, true);
                    setIsModalOpen(false);
                  }}
                  className="whitespace-nowrap"
                >
                  Approve Review
                </Button>
              )}
              {selectedReview.isApproved && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    handleApprove(selectedReview._id, false);
                  }}
                  className="whitespace-nowrap"
                >
                  Reject Review
                </Button>
              )}
              <Button
                variant="danger"
                onClick={() => {
                  handleDelete(selectedReview._id);
                  setIsModalOpen(false);
                }}
                className="whitespace-nowrap"
              >
                <Trash2 size={16} className="mr-1" />
                Delete Review
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Reviews;

