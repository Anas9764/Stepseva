const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema(
  {
    answer: {
      type: String,
      required: [true, 'Please provide an answer'],
      trim: true,
    },
    answeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    helpful: {
      type: Number,
      default: 0,
    },
    helpfulUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const questionSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Please provide a product'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide a user'],
    },
    question: {
      type: String,
      required: [true, 'Please provide a question'],
      trim: true,
    },
    answers: [answerSchema],
    helpful: {
      type: Number,
      default: 0,
    },
    helpfulUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
questionSchema.index({ product: 1, createdAt: -1 });
questionSchema.index({ product: 1, 'answers.createdAt': -1 });

module.exports = mongoose.model('Question', questionSchema);

