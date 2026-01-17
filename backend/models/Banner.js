const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
    },
    subtitle: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      required: [true, 'Please provide an image'],
    },
    ctaText: {
      type: String,
      trim: true,
    },
    ctaLink: {
      type: String,
      trim: true,
    },

    placement: {
      type: String,
      trim: true,
      default: 'global',
      index: true,
    },
    // Banner type: 'b2c', 'b2b', or 'both' (available for both B2C and B2B)
    bannerType: {
      type: String,
      enum: ['b2c', 'b2b', 'both'],
      default: 'b2c', // Default to B2C for backward compatibility
    },
    startAt: {
      type: Date,
      default: null,
      index: true,
    },
    endAt: {
      type: Date,
      default: null,
      index: true,
    },
    priority: {
      type: Number,
      default: 0,
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

module.exports = mongoose.model('Banner', bannerSchema);

