const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Please provide a coupon code'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: [true, 'Please specify discount type'],
    },
    discountValue: {
      type: Number,
      required: [true, 'Please provide discount value'],
      min: 0,
    },
    minPurchase: {
      type: Number,
      default: 0,
      min: 0,
    },
    expiryDate: {
      type: Date,
      required: [true, 'Please provide expiry date'],
    },
    usageLimit: {
      type: Number,
      required: [true, 'Please provide usage limit'],
      min: 1,
    },
    usageCount: {
      type: Number,
      default: 0,
      min: 0,
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

// Check if coupon is valid
couponSchema.methods.isValid = function () {
  const now = new Date();
  return (
    this.isActive &&
    this.expiryDate > now &&
    this.usageCount < this.usageLimit
  );
};

module.exports = mongoose.model('Coupon', couponSchema);

