const mongoose = require('mongoose');

const businessAccountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    businessType: {
      type: String,
      enum: ['retailer', 'wholesaler', 'business_customer'],
      required: true,
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    businessRegistrationNumber: {
      type: String,
      trim: true,
    },
    taxId: {
      type: String,
      trim: true,
    },
    // Business Address
    businessAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    // Contact Information
    contactPerson: {
      name: String,
      email: String,
      phone: String,
      designation: String,
    },
    // Credit Terms
    creditLimit: {
      type: Number,
      default: 0,
      min: 0,
    },
    creditUsed: {
      type: Number,
      default: 0,
      min: 0,
    },
    creditAvailable: {
      type: Number,
      default: 0,
      min: 0,
    },
    paymentTerms: {
      type: String,
      enum: ['net15', 'net30', 'net45', 'net60', 'cod', 'prepaid'],
      default: 'net30',
    },
    // Pricing Tier
    pricingTier: {
      type: String,
      enum: ['standard', 'retailer', 'wholesaler', 'premium'],
      default: 'standard',
    },
    // Approval Settings
    requiresApproval: {
      type: Boolean,
      default: false,
    },
    approvalLimit: {
      type: Number,
      default: 0, // Orders above this amount require approval
    },
    // Status
    status: {
      type: String,
      enum: ['pending', 'active', 'suspended', 'inactive'],
      default: 'pending',
    },
    // Account Manager
    accountManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    // Notes
    notes: [
      {
        note: String,
        addedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // Documents
    documents: [
      {
        type: {
          type: String, // 'license', 'tax_certificate', 'registration', etc.
        },
        url: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // Verification
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifiedAt: Date,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Calculate available credit
businessAccountSchema.methods.calculateAvailableCredit = function () {
  this.creditAvailable = Math.max(0, this.creditLimit - this.creditUsed);
  return this.creditAvailable;
};

// Check if order requires approval
businessAccountSchema.methods.requiresOrderApproval = function (orderAmount) {
  if (!this.requiresApproval) return false;
  return orderAmount > this.approvalLimit;
};

// Indexes
businessAccountSchema.index({ userId: 1 });
businessAccountSchema.index({ businessType: 1 });
businessAccountSchema.index({ status: 1 });
businessAccountSchema.index({ pricingTier: 1 });

module.exports = mongoose.model('BusinessAccount', businessAccountSchema);

