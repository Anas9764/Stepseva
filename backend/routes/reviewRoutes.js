const express = require('express');
const router = express.Router();
const {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  markHelpful,
  getAllReviews,
  approveReview,
} = require('../controllers/reviewController');
const { protect, admin } = require('../middleware/authMiddleware');
const { reviewLimiter, helpfulLimiter } = require('../middleware/rateLimiter');
const { validate, reviewSchemas } = require('../middleware/validation');

// Public routes
router.get('/product/:productId', getProductReviews);

// Admin routes (must be before parameterized routes)
router.get('/', protect, admin, getAllReviews);

// Protected routes with rate limiting
router.post('/', protect, reviewLimiter, validate(reviewSchemas.create), createReview);
router.put('/:reviewId', protect, validate(reviewSchemas.update), updateReview);
router.post('/:reviewId/helpful', protect, helpfulLimiter, markHelpful);

// Admin routes with parameters
router.delete('/:reviewId', protect, admin, deleteReview);
router.put('/:reviewId/approve', protect, admin, validate(reviewSchemas.approve), approveReview);

module.exports = router;

