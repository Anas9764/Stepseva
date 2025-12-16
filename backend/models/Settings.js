const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    storeName: {
      type: String,
      default: 'StepSeva',
    },
    storeEmail: {
      type: String,
      default: 'contact@stepseva.com',
    },
    storePhone: {
      type: String,
    },
    storeAddress: {
      type: String,
    },
    facebook: {
      type: String,
    },
    instagram: {
      type: String,
    },
    twitter: {
      type: String,
    },
    homepageTitle: {
      type: String,
    },
    homepageSubtitle: {
      type: String,
    },
    footerText: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Settings', settingsSchema);

