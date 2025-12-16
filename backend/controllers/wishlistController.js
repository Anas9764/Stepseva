const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
exports.getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      model: 'Product',
      populate: {
        path: 'category',
        model: 'Category',
      },
    });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, items: [] });
    }

    // Format response to match frontend expectations
    const products = wishlist.items
      .filter((item) => item.product !== null && item.product !== undefined) // Filter out null products
      .map((item) => {
        const product = item.product;
        return {
          _id: product._id,
          name: product.name,
          description: product.description,
          price: product.price,
          image: product.image,
          images: product.images,
          category: product.category,
          stock: product.stock,
          brand: product.brand,
          isActive: product.isActive,
          featured: product.featured,
        };
      });

    res.status(200).json({
      success: true,
      message: 'Wishlist fetched successfully',
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add product to wishlist
// @route   POST /api/wishlist
// @access  Private
exports.addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a product ID',
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Find or create wishlist
    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, items: [] });
    }

    // Check if product already in wishlist
    const existingItem = wishlist.items.find(
      (item) => item.product.toString() === productId.toString()
    );

    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: 'Product already in wishlist',
      });
    }

    // Add product to wishlist
    wishlist.items.push({ product: productId });
    await wishlist.save();

    // Populate and return updated wishlist
    await wishlist.populate({
      path: 'items.product',
      model: 'Product',
      populate: {
        path: 'category',
        model: 'Category',
      },
    });

    const addedProduct = wishlist.items[wishlist.items.length - 1].product;

    res.status(200).json({
      success: true,
      message: 'Product added to wishlist',
      data: {
        _id: addedProduct._id,
        name: addedProduct.name,
        description: addedProduct.description,
        price: addedProduct.price,
        image: addedProduct.image,
        images: addedProduct.images,
        category: addedProduct.category,
        stock: addedProduct.stock,
        brand: addedProduct.brand,
        isActive: addedProduct.isActive,
        featured: addedProduct.featured,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
exports.removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found',
      });
    }

    // Remove product from wishlist
    wishlist.items = wishlist.items.filter(
      (item) => item.product.toString() !== productId.toString()
    );

    await wishlist.save();

    res.status(200).json({
      success: true,
      message: 'Product removed from wishlist',
      data: { productId },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear wishlist
// @route   DELETE /api/wishlist
// @access  Private
exports.clearWishlist = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found',
      });
    }

    wishlist.items = [];
    await wishlist.save();

    res.status(200).json({
      success: true,
      message: 'Wishlist cleared successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check if product is in wishlist
// @route   GET /api/wishlist/check/:productId
// @access  Private
exports.checkWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      return res.status(200).json({
        success: true,
        data: { inWishlist: false },
      });
    }

    const inWishlist = wishlist.items.some(
      (item) => item.product.toString() === productId.toString()
    );

    res.status(200).json({
      success: true,
      data: { inWishlist },
    });
  } catch (error) {
    next(error);
  }
};

