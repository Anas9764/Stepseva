const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const mongoose = require('mongoose');
const { socketHelpers } = require('../config/socket');
const logger = require('../config/logger');

// @desc    Get reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
exports.getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { rating, sort = '-createdAt', page = 1, limit = 10 } = req.query;

    // Validate productId first
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    const productObjectId = new mongoose.Types.ObjectId(productId);

    const query = {
      product: productObjectId,
      isActive: true,
      isApproved: true,
    };

    if (rating) {
      query.rating = parseInt(rating);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get reviews - populate user, but handle deleted users gracefully
    let reviews = await Review.find(query)
      .populate('user', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Filter out reviews where user is null (user was deleted) and format response
    const validReviews = reviews
      .filter(review => review.user !== null && review.user !== undefined)
      .map(review => ({
        ...review.toObject(),
        user: {
          _id: review.user._id,
          name: review.user.name,
          email: review.user.email,
        },
      }));

    const total = await Review.countDocuments(query);

    // Calculate rating distribution - use the productObjectId we already created
    let ratingDistribution = [];
    try {
      ratingDistribution = await Review.aggregate([
        { 
          $match: { 
            product: productObjectId,
            isActive: true, 
            isApproved: true 
          } 
        },
        {
          $group: {
            _id: '$rating',
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: -1 } },
      ]);
    } catch (aggError) {
      console.error('Error in rating distribution aggregate:', aggError);
      // Continue with empty distribution if aggregate fails
      ratingDistribution = [];
    }

    // Calculate average rating
    let avgRating = [];
    try {
      avgRating = await Review.aggregate([
        { 
          $match: { 
            product: productObjectId,
            isActive: true, 
            isApproved: true 
          } 
        },
        {
          $group: {
            _id: null,
            avgRating: { $avg: '$rating' },
            totalReviews: { $sum: 1 },
          },
        },
      ]);
    } catch (aggError) {
      console.error('Error in average rating aggregate:', aggError);
      // Continue with default values if aggregate fails
      avgRating = [{ avgRating: 0, totalReviews: 0 }];
    }

    res.status(200).json({
      success: true,
      data: {
        reviews: validReviews,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
        ratingDistribution: ratingDistribution || [],
        averageRating: avgRating[0]?.avgRating || 0,
        totalReviews: avgRating[0]?.totalReviews || 0,
      },
    });
  } catch (error) {
    console.error('Error in getProductReviews:', error);
    next(error);
  }
};

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res, next) => {
  try {
    const { productId, rating, title, comment, images } = req.body;

    // Validate required fields
    if (!comment || typeof comment !== 'string' || comment.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Review comment is required',
      });
    }

    if (comment.trim().length > 5000) {
      return res.status(400).json({
        success: false,
        message: 'Review comment is too long (max 5000 characters)',
      });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5',
      });
    }

    if (title && title.trim().length > 200) {
      return res.status(400).json({
        success: false,
        message: 'Review title is too long (max 200 characters)',
      });
    }

    // Validate productId
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      product: productId,
      user: req.user._id,
      isActive: true, // Only check active reviews
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product',
      });
    }

    // Check if user has purchased this product (for verified purchase badge)
    const hasPurchased = await Order.findOne({
      userId: req.user._id,
      'products.productId': productId,
      orderStatus: { $in: ['delivered', 'shipped'] },
    });

    // Sanitize input (basic - remove leading/trailing whitespace)
    const sanitizedComment = comment.trim();
    const sanitizedTitle = title ? title.trim() : '';

    const review = await Review.create({
      product: productId,
      user: req.user._id,
      rating: parseInt(rating),
      title: sanitizedTitle || undefined,
      comment: sanitizedComment,
      images: images || [],
      verifiedPurchase: !!hasPurchased,
    });

    await review.populate('user', 'name email');
    await review.populate('product', 'name');

    // Emit real-time notification to admin if review needs approval
    if (!review.isApproved) {
      socketHelpers.emitNewReview(review);
    }

    logger.info('Review created', {
      reviewId: review._id,
      productId,
      userId: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: review,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product',
      });
    }
    next(error);
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/:reviewId
// @access  Private
exports.updateReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { rating, title, comment, images } = req.body;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    // Check if user owns the review or is admin
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this review',
      });
    }

    if (rating) review.rating = rating;
    if (title !== undefined) review.title = title;
    if (comment) review.comment = comment;
    if (images !== undefined) review.images = images;

    await review.save();
    await review.populate('user', 'name email');

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a review (Admin only)
// @route   DELETE /api/reviews/:reviewId
// @access  Private/Admin
exports.deleteReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid review ID',
      });
    }

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    // Admin can delete any review
    // For regular users (if needed in future), check ownership
    if (req.user.role !== 'admin' && review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review',
      });
    }

    // Soft delete by setting isActive to false
    review.isActive = false;
    await review.save();

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    next(error);
  }
};

// @desc    Mark review as helpful
// @route   POST /api/reviews/:reviewId/helpful
// @access  Private
exports.markHelpful = async (req, res, next) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    const userId = req.user._id.toString();

    // Check if user already marked as helpful
    const alreadyHelpful = review.helpfulUsers.some(
      (id) => id.toString() === userId
    );

    if (alreadyHelpful) {
      // Remove helpful
      review.helpfulUsers = review.helpfulUsers.filter(
        (id) => id.toString() !== userId
      );
      review.helpful = Math.max(0, review.helpful - 1);
    } else {
      // Add helpful
      review.helpfulUsers.push(req.user._id);
      review.helpful += 1;
    }

    await review.save();

    res.status(200).json({
      success: true,
      data: {
        helpful: review.helpful,
        isHelpful: !alreadyHelpful,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reviews (Admin)
// @route   GET /api/reviews
// @access  Private/Admin
exports.getAllReviews = async (req, res, next) => {
  try {
    const { productId, rating, isApproved, page = 1, limit = 20, includeInactive = false } = req.query;

    const query = {};
    // By default, only show active reviews unless explicitly requested
    if (includeInactive !== 'true') {
      query.isActive = true;
    }
    if (productId) {
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product ID',
        });
      }
      query.product = productId;
    }
    if (rating) query.rating = parseInt(rating);
    if (isApproved !== undefined && isApproved !== '') {
      query.isApproved = isApproved === 'true' || isApproved === true;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get reviews - populate product and user
    let reviews = await Review.find(query)
      .populate('product', 'name image')
      .populate('user', 'name email')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    // Filter out reviews where product or user is null (in case they were deleted)
    reviews = reviews.filter(review => review.product !== null && review.user !== null);

    const total = await Review.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        reviews,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve/Reject review (Admin)
// @route   PUT /api/reviews/:reviewId/approve
// @access  Private/Admin
exports.approveReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { isApproved } = req.body;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    review.isApproved = isApproved;
    // If rejecting, also set isActive to false to hide from website
    if (!isApproved) {
      review.isActive = false;
    }
    await review.save();

    res.status(200).json({
      success: true,
      message: `Review ${isApproved ? 'approved' : 'rejected'} successfully`,
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

