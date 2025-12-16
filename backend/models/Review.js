const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Please provide a product'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide a user'],
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating'],
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    comment: {
      type: String,
      required: [true, 'Please provide a review comment'],
      trim: true,
    },
    images: {
      type: [String],
      default: [],
    },
    verifiedPurchase: {
      type: Boolean,
      default: false,
    },
    helpful: {
      type: Number,
      default: 0,
    },
    helpfulUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isApproved: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate reviews from same user for same product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Index for efficient queries
reviewSchema.index({ product: 1, rating: 1 });
reviewSchema.index({ product: 1, createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);

