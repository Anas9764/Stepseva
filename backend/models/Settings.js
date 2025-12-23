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
    storeWhatsApp: {
      type: String,
      default: '918261029700', // Default WhatsApp number
    },
    supplierContact: {
      phone: {
        type: String,
        default: '+91-8261029700',
      },
      whatsapp: {
        type: String,
        default: '918261029700',
      },
      email: {
        type: String,
        default: 'contact@stepseva.com',
      },
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

