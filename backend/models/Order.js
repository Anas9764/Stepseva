const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Allow guest checkout
    },
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        size: {
          type: String,
          required: true,
        },
      },
    ],
    shippingAddress: {
      firstName: String,
      lastName: String,
      address: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    email: {
      type: String,
      required: true,
    },
    phone: String,
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    orderStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    paymentType: {
      type: String,
      enum: ['cod', 'online'],
      required: true,
    },
    orderId: {
      type: String,
      unique: true,
      sparse: true,
    },
    orderTimeline: [
      {
        status: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        note: String,
      },
    ],
    stripeSessionId: String,
    trackingNumber: String,
    carrier: String,
    estimatedDelivery: Date,
    notes: [
      {
        note: String,
        addedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        isInternal: {
          type: Boolean,
          default: true, // true for admin notes, false for customer notes
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    metadata: {
      source: String, // 'web', 'mobile', 'admin'
      ipAddress: String,
      userAgent: String,
      referrer: String,
    },
    tags: [String], // For categorization
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for better query performance
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ orderId: 1 });
orderSchema.index({ orderStatus: 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ paymentType: 1 });
orderSchema.index({ email: 1 });
orderSchema.index({ 'shippingAddress.zipCode': 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ isDeleted: 1 });
orderSchema.index({ trackingNumber: 1 });

module.exports = mongoose.model('Order', orderSchema);

