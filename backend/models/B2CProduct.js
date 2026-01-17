const mongoose = require('mongoose');

/**
 * B2C Product Model
 * Separate model for B2C (Consumer) products
 * No shared fields or dependencies with B2B products
 */
const b2cProductSchema = new mongoose.Schema(
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
      ref: 'B2CCategory',
      required: [true, 'Please provide a B2C category'],
    },
    // Retail price
    price: {
      type: Number,
      required: [true, 'Please provide a price'],
      min: 0,
    },
    // Discount price (sale price)
    discountPrice: {
      type: Number,
      min: 0,
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
    // Variant support for B2C
    parentProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'B2CProduct',
      default: null,
    },
    variantColor: {
      type: String,
      trim: true,
    },
    variantName: {
      type: String,
      trim: true,
    },
    isVariant: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for search functionality
b2cProductSchema.index({ name: 'text', description: 'text' });

// Index for variant queries
b2cProductSchema.index({ parentProduct: 1 });
b2cProductSchema.index({ isVariant: 1 });

// Virtual to get all variants of a product
b2cProductSchema.virtual('variants', {
  ref: 'B2CProduct',
  localField: '_id',
  foreignField: 'parentProduct',
});

module.exports = mongoose.model('B2CProduct', b2cProductSchema);

