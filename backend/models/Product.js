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
    // Minimum Order Quantity (MOQ)
    moq: {
      type: Number,
      default: 1,
      min: 1,
    },
    // Bulk pricing enabled
    bulkPricingEnabled: {
      type: Boolean,
      default: false,
    },
    // Product type: 'b2c', 'b2b', or 'both' (available for both B2C and B2B)
    productType: {
      type: String,
      enum: ['b2c', 'b2b', 'both'],
      default: 'b2c', // Default to B2C for backward compatibility
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

