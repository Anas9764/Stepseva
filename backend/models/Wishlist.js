const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide a user'],
      unique: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate products in wishlist
wishlistSchema.methods.addProduct = function (productId) {
  const existingItem = this.items.find(
    (item) => item.product.toString() === productId.toString()
  );
  
  if (!existingItem) {
    this.items.push({ product: productId });
  }
  
  return this.save();
};

wishlistSchema.methods.removeProduct = function (productId) {
  this.items = this.items.filter(
    (item) => item.product.toString() !== productId.toString()
  );
  return this.save();
};

module.exports = mongoose.model('Wishlist', wishlistSchema);

