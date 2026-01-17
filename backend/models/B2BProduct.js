const mongoose = require('mongoose');

/**
 * B2B Product Model
 * Separate model for B2B (Business) products
 * No shared fields or dependencies with B2C products
 */
const b2bProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a product name'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a product description'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'B2BCategory',
      required: [true, 'Please provide a B2B category'],
    },
    // Base price (wholesale/base price)
    price: {
      type: Number,
      required: [true, 'Please provide a price'],
      min: 0,
    },
    // B2B Volume Pricing Tiers
    volumePricing: [
      {
        tier: {
          type: String,
          enum: ['standard', 'retailer', 'wholesaler', 'premium'],
        },
        price: {
          type: Number,
          min: 0,
        },
      },
    ],
    // Quantity-based pricing (volume discounts)
    quantityPricing: [
      {
        minQuantity: {
          type: Number,
          required: true,
          min: 1,
        },
        maxQuantity: {
          type: Number,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
        discount: {
          type: Number,
          min: 0,
          max: 100,
        },
      },
    ],
    // Minimum Order Quantity (MOQ) - Required for B2B
    moq: {
      type: Number,
      default: 10, // Higher default MOQ for B2B
      min: 1,
    },
    brand: {
      type: String,
      default: 'StepSeva',
    },
    // Footwear-specific fields
    gender: {
      type: String,
      enum: ['ladies', 'gents', 'kids', 'unisex'],
      default: 'unisex',
    },
    footwearType: {
      type: String,
      enum: ['sneakers', 'casual', 'formal', 'sports', 'sandals', 'boots', 'flip-flops', 'slippers', 'other'],
      default: 'other',
    },
    sizes: {
      type: [String],
      default: [],
    },
    // Size-specific stock tracking
    sizeStock: {
      type: Map,
      of: Number,
      default: {},
    },
    image: {
      type: String,
      default: '',
    },
    images: {
      type: [String],
      default: [],
    },
    stock: {
      type: Number,
      required: [true, 'Please provide stock quantity'],
      min: 0,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for search functionality
b2bProductSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('B2BProduct', b2bProductSchema);

