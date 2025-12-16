const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      model: 'Product',
      populate: {
        path: 'category',
        model: 'Category',
      },
    });

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    // Format response to match frontend expectations
    const items = cart.items
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
          quantity: item.quantity,
          size: item.size,
        };
      });

    // Calculate totals
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    res.status(200).json({
      success: true,
      message: 'Cart fetched successfully',
      data: {
        items,
        totalItems,
        totalAmount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add product to cart
// @route   POST /api/cart
// @access  Private
exports.addToCart = async (req, res, next) => {
  try {
    const { productId, size, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a product ID',
      });
    }

    // Size is required only if product has sizes
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // If product has sizes, size is required
    if (product.sizes && product.sizes.length > 0 && !size) {
      return res.status(400).json({
        success: false,
        message: 'Please select a size',
      });
    }

    // Check if size is available (only if product has sizes)
    if (product.sizes && product.sizes.length > 0) {
      if (!product.sizes.includes(size)) {
        return res.status(400).json({
          success: false,
          message: `Size ${size} is not available for this product`,
        });
      }
    }

    // Check size-specific stock if available, otherwise use general stock
    let sizeStock = product.stock;
    if (size && product.sizeStock) {
      let sizeStockValue;
      // Handle both Map and object formats
      if (product.sizeStock instanceof Map) {
        sizeStockValue = product.sizeStock.get(size);
      } else if (typeof product.sizeStock === 'object') {
        sizeStockValue = product.sizeStock[size];
      }
      if (sizeStockValue !== undefined && sizeStockValue !== null) {
        sizeStock = sizeStockValue;
      }
    }
    
    if (sizeStock < quantity) {
      return res.status(400).json({
        success: false,
        message: size 
          ? `Only ${sizeStock} items available in size ${size}`
          : `Only ${sizeStock} items available`,
      });
    }

    // Find or create cart
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    // Check if product with same size already in cart (for products with sizes)
    // For products without sizes, check by product ID only
    const existingItem = cart.items.find((item) => {
      const productMatch = item.product.toString() === productId.toString();
      if (product.sizes && product.sizes.length > 0) {
        return productMatch && item.size === size;
      }
      return productMatch && (!item.size || item.size === '');
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > sizeStock) {
        return res.status(400).json({
          success: false,
          message: `Only ${sizeStock} items available in size ${size}`,
        });
      }
      existingItem.quantity = newQuantity;
    } else {
      // Use empty string for size if product doesn't have sizes
      const itemSize = (product.sizes && product.sizes.length > 0) ? size : '';
      cart.items.push({ product: productId, size: itemSize, quantity });
    }

    await cart.save();

    // Populate and return updated cart
    await cart.populate({
      path: 'items.product',
      model: 'Product',
      populate: {
        path: 'category',
        model: 'Category',
      },
    });

    const cartItem = cart.items.find((item) => {
      const productMatch = item.product._id.toString() === productId.toString();
      if (product.sizes && product.sizes.length > 0) {
        return productMatch && item.size === size;
      }
      return productMatch && (!item.size || item.size === '');
    });

    res.status(200).json({
      success: true,
      message: 'Product added to cart',
      data: {
        _id: cartItem.product._id,
        name: cartItem.product.name,
        description: cartItem.product.description,
        price: cartItem.product.price,
        image: cartItem.product.image,
        images: cartItem.product.images,
        category: cartItem.product.category,
        stock: cartItem.product.stock,
        brand: cartItem.product.brand,
        isActive: cartItem.product.isActive,
        featured: cartItem.product.featured,
        quantity: cartItem.quantity,
        size: cartItem.size,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:productId
// @access  Private
exports.updateQuantity = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { size, quantity } = req.body;

    if (!quantity || quantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid quantity',
      });
    }

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    // Check product stock if increasing quantity
    if (quantity > 0) {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      // Size is required only if product has sizes
      if (product.sizes && product.sizes.length > 0 && !size) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a size',
        });
      }

      let sizeStock = product.stock;
      if (size && product.sizeStock) {
        let sizeStockValue;
        // Handle both Map and object formats
        if (product.sizeStock instanceof Map) {
          sizeStockValue = product.sizeStock.get(size);
        } else if (typeof product.sizeStock === 'object') {
          sizeStockValue = product.sizeStock[size];
        }
        if (sizeStockValue !== undefined && sizeStockValue !== null) {
          sizeStock = sizeStockValue;
        }
      }

      if (quantity > sizeStock) {
        return res.status(400).json({
          success: false,
          message: size 
            ? `Only ${sizeStock} items available in size ${size}`
            : `Only ${sizeStock} items available`,
        });
      }
    }

    // Update quantity
    await cart.updateQuantity(productId, size, quantity);

    res.status(200).json({
      success: true,
      message: 'Cart updated successfully',
      data: { productId, size, quantity },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove product from cart
// @route   DELETE /api/cart/:productId
// @access  Private
exports.removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { size } = req.query;

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    // Check if product has sizes - if it does, size is required
    const product = await Product.findById(productId);
    if (product && product.sizes && product.sizes.length > 0 && !size) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a size',
      });
    }

    // Use empty string for size if not provided (for products without sizes)
    const itemSize = size || '';

    // Remove product from cart
    await cart.removeProduct(productId, itemSize);

    res.status(200).json({
      success: true,
      message: 'Product removed from cart',
      data: { productId, size: itemSize },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
exports.clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    await cart.clearCart();

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
    });
  } catch (error) {
    next(error);
  }
};

