const mongoose = require('mongoose');

/**
 * B2B Category Model
 * Separate model for B2B (Business) categories
 * No shared fields or dependencies with B2C categories
 */
const b2bCategorySchema = new mongoose.Schema(
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
    // B2B-specific fields can be added here
    // e.g., moq, bulkDiscount, etc.
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('B2BCategory', b2bCategorySchema);

