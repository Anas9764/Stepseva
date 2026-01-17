const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
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
    // Category type: 'b2c', 'b2b', or 'both' (available for both B2C and B2B)
    categoryType: {
      type: String,
      enum: ['b2c', 'b2b', 'both'],
      default: 'b2c', // Default to B2C for backward compatibility
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Category', categorySchema);

