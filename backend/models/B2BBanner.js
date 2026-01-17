const mongoose = require('mongoose');

const b2bBannerSchema = new mongoose.Schema(
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
    // No bannerType field needed as it's explicitly B2B
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('B2BBanner', b2bBannerSchema);

