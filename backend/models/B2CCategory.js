const mongoose = require('mongoose');

/**
 * B2C Category Model
 * Separate model for B2C (Consumer) categories
 * No shared fields or dependencies with B2B categories
 */
const b2cCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a category name'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
    },
    image: {
      type: String,
      default: '',
    },
    // B2C-specific fields can be added here
    // e.g., displayOrder, featured, etc.
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('B2CCategory', b2cCategorySchema);

