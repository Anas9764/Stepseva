const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
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
      ref: 'Category',
      required: [true, 'Please provide a category'],
    },
    price: {
      type: Number,
      required: [true, 'Please provide a price'],
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
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    featured: {
      type: Boolean,
      default: false,
    },
    // Variant support
    parentProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
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
productSchema.index({ name: 'text', description: 'text' });

// Index for variant queries
productSchema.index({ parentProduct: 1 });
productSchema.index({ isVariant: 1 });

// Virtual to get all variants of a product
productSchema.virtual('variants', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'parentProduct',
});

module.exports = mongoose.model('Product', productSchema);

