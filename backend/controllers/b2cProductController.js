const B2CProduct = require('../models/B2CProduct');
const B2CCategory = require('../models/B2CCategory');
const mongoose = require('mongoose');
const { logActivity } = require('../middleware/activityLogger');

// @desc    Get all B2C products
// @route   GET /api/b2c/products
// @access  Public
exports.getAllProducts = async (req, res, next) => {
  try {
    const {
      category,
      brand,
      minPrice,
      maxPrice,
      search,
      page = 1,
      limit = 12,
      featured,
      gender,
      footwearType,
      size,
      color,
      sort,
    } = req.query;

    const resolveSort = (value) => {
      switch ((value || '').toString()) {
        case 'newest':
          return { createdAt: -1 };
        case 'oldest':
          return { createdAt: 1 };
        case 'price_low':
          return { price: 1, createdAt: -1 };
        case 'price_high':
          return { price: -1, createdAt: -1 };
        case 'name_asc':
          return { name: 1 };
        case 'name_desc':
          return { name: -1 };
        default:
          return { createdAt: -1 };
      }
    };

    const sortSpec = resolveSort(sort);
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 12;
    const skip = (pageNum - 1) * limitNum;

    // Build query
    let query = {};

    // Only show active products for public users
    if (!req.user || req.user.role !== 'admin') {
      query.isActive = true;
    }

    // Handle category - can be name or ID
    if (category) {
      if (mongoose.Types.ObjectId.isValid(category)) {
        query.category = category;
      } else {
        const categoryDoc = await B2CCategory.findOne({ name: { $regex: new RegExp(`^${category}$`, 'i') } });
        if (categoryDoc) {
          query.category = categoryDoc._id;
        } else {
          return res.status(200).json({
            success: true,
            message: 'Products fetched successfully',
            data: [],
            pagination: {
              page: pageNum,
              limit: limitNum,
              total: 0,
              pages: 0,
            },
          });
        }
      }
    }

    if (brand) {
      query.brand = brand;
    }

    if (size) {
      query.sizes = { $in: [size] };
    }

    if (color) {
      query.variantColor = { $regex: new RegExp(`^${color}$`, 'i') };
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (featured) {
      query.featured = true;
    }

    if (gender) {
      query.gender = gender.toLowerCase();
    }

    if (footwearType) {
      query.footwearType = footwearType.toLowerCase();
    }

    // Exclude variants from main listing (show only parent products)
    query.isVariant = false;

    // Get total count and products
    const total = await B2CProduct.countDocuments(query);
    const products = await B2CProduct.find(query)
      .populate('category', 'name description')
      .sort(sortSpec)
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Format products
    const validProducts = products
      .filter(p => p && p.category !== null && p.category !== undefined)
      .map(p => {
        // Convert Map to Object for JSON serialization
        let sizeStockObj = {};
        if (p.sizeStock && p.sizeStock instanceof Map) {
          sizeStockObj = Object.fromEntries(p.sizeStock);
        } else if (p.sizeStock && typeof p.sizeStock === 'object') {
          sizeStockObj = p.sizeStock;
        }
        
        // Calculate discount percentage if discountPrice exists
        let discount = null;
        if (p.discountPrice && p.price) {
          discount = Math.round(((p.price - p.discountPrice) / p.price) * 100);
        }

        return {
          ...p,
          gender: p.gender || 'unisex',
          footwearType: p.footwearType || 'other',
          sizes: Array.isArray(p.sizes) ? p.sizes : [],
          sizeStock: sizeStockObj,
          discount: discount,
        };
      });

    const totalPages = Math.ceil(total / limitNum);

    res.status(200).json({
      success: true,
      message: 'B2C products fetched successfully',
      data: validProducts,
      total,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: totalPages,
      },
    });
  } catch (error) {
    console.error('❌ Error in getAllProducts:', error.message);
    next(error);
  }
};

// @desc    Get single B2C product
// @route   GET /api/b2c/products/:id
// @access  Public
exports.getProductById = async (req, res, next) => {
  try {
    const product = await B2CProduct.findById(req.params.id)
      .populate({
        path: 'category',
        select: 'name description',
      })
      .lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'B2C product not found',
      });
    }

    // Ensure defaults
    if (!product.category) {
      product.category = { name: 'Uncategorized', description: '' };
    }
    if (!product.gender) product.gender = 'unisex';
    if (!product.footwearType) product.footwearType = 'other';
    if (!product.sizes) product.sizes = [];

    // Convert sizeStock Map to Object
    let sizeStockObj = {};
    if (product.sizeStock && product.sizeStock instanceof Map) {
      sizeStockObj = Object.fromEntries(product.sizeStock);
    } else if (product.sizeStock && typeof product.sizeStock === 'object') {
      sizeStockObj = product.sizeStock;
    }
    product.sizeStock = sizeStockObj;

    // Get variants if this product has variants or is a variant
    let variants = [];
    if (product.isVariant && product.parentProduct) {
      // This is a variant, get all siblings (other variants) and parent
      variants = await B2CProduct.find({
        $or: [
          { parentProduct: product.parentProduct },
          { _id: product.parentProduct },
        ],
        isActive: true,
      })
        .select('_id name image images variantColor variantName price discountPrice stock')
        .lean();
    } else if (!product.isVariant) {
      // This is a parent product, get all variants
      variants = await B2CProduct.find({
        parentProduct: product._id,
        isActive: true,
      })
        .select('_id name image images variantColor variantName price discountPrice stock')
        .lean();
      
      // Include parent in variants array
      variants.unshift({
        _id: product._id,
        name: product.name,
        image: product.image,
        images: product.images,
        variantColor: product.variantColor,
        variantName: product.variantName,
        price: product.price,
        discountPrice: product.discountPrice,
        stock: product.stock,
      });
    }

    product.variants = variants;

    // Calculate discount percentage
    if (product.discountPrice && product.price) {
      product.discount = Math.round(((product.price - product.discountPrice) / product.price) * 100);
    }

    res.status(200).json({
      success: true,
      message: 'B2C product fetched successfully',
      data: product,
    });
  } catch (error) {
    console.error('Error in getProductById:', error);
    next(error);
  }
};

// @desc    Create B2C product
// @route   POST /api/b2c/products
// @access  Private/Admin
exports.createProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      category,
      price,
      discountPrice,
      brand,
      stock,
      image,
      images,
      isActive,
      featured,
      gender,
      footwearType,
      sizes,
      sizeStock,
      parentProduct,
      variantColor,
      variantName,
      isVariant,
    } = req.body;

    // Validate required fields
    if (!name || !description || !category || !price) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, description, category, price',
      });
    }

    // Validate footwear-specific fields
    if (!gender) {
      return res.status(400).json({
        success: false,
        message: 'Please specify gender category (ladies, gents, kids, unisex)',
      });
    }

    if (!footwearType) {
      return res.status(400).json({
        success: false,
        message: 'Please specify footwear type',
      });
    }

    if (!sizes || !Array.isArray(sizes) || sizes.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one size',
      });
    }

    // Handle images
    let imageUrls = [];
    if (image) {
      imageUrls = [image];
    } else if (images && Array.isArray(images)) {
      imageUrls = images;
    }

    // Handle sizeStock
    let sizeStockMap = new Map();
    if (sizeStock && typeof sizeStock === 'object') {
      Object.entries(sizeStock).forEach(([size, stockQty]) => {
        sizeStockMap.set(size, Number(stockQty));
      });
    }

    const productData = {
      name,
      description,
      category,
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : null,
      brand: brand || 'StepSeva',
      stock: stock !== undefined ? Number(stock) : 0,
      image: image || '',
      images: imageUrls,
      isActive: isActive !== false,
      featured: featured === true,
      gender,
      footwearType,
      sizes,
      sizeStock: sizeStockMap.size > 0 ? sizeStockMap : undefined,
      parentProduct: parentProduct || null,
      variantColor: variantColor || null,
      variantName: variantName || null,
      isVariant: isVariant === true,
    };

    const product = await B2CProduct.create(productData);
    
    // Populate category before sending response
    await product.populate('category', 'name description');

    // Log activity
    if (req.user && req.user.role === 'admin') {
      await logActivity(req, {
        action: 'create',
        entityType: 'product',
        entityId: product._id,
        entityName: product.name,
        description: `Created B2C product: ${product.name}`,
      });
    }

    res.status(201).json({
      success: true,
      message: 'B2C product created successfully',
      data: product,
    });
  } catch (error) {
    console.error('Error in createProduct:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }
    next(error);
  }
};

// @desc    Update B2C product
// @route   PUT /api/b2c/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res, next) => {
  try {
    let product = await B2CProduct.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'B2C product not found',
      });
    }

    const updateData = { ...req.body };

    // Handle sizeStock conversion
    if (updateData.sizeStock && typeof updateData.sizeStock === 'object') {
      const sizeStockMap = new Map();
      Object.entries(updateData.sizeStock).forEach(([size, stockQty]) => {
        sizeStockMap.set(size, Number(stockQty));
      });
      updateData.sizeStock = sizeStockMap;
    }

    // Handle price and stock conversion
    if (updateData.price) updateData.price = Number(updateData.price);
    if (updateData.discountPrice !== undefined) {
      updateData.discountPrice = updateData.discountPrice ? Number(updateData.discountPrice) : null;
    }
    if (updateData.stock !== undefined) updateData.stock = Number(updateData.stock);

    // Handle variant fields
    if (updateData.parentProduct !== undefined) {
      updateData.parentProduct = updateData.parentProduct || null;
    }
    if (updateData.variantColor !== undefined) {
      updateData.variantColor = updateData.variantColor || null;
    }
    if (updateData.variantName !== undefined) {
      updateData.variantName = updateData.variantName || null;
    }
    if (updateData.isVariant !== undefined) {
      updateData.isVariant = updateData.isVariant === true;
    }

    product = await B2CProduct.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('category', 'name description');

    // Log activity
    if (req.user && req.user.role === 'admin') {
      await logActivity(req, {
        action: 'update',
        entityType: 'product',
        entityId: product._id,
        entityName: product.name,
        description: `Updated B2C product: ${product.name}`,
      });
    }

    res.status(200).json({
      success: true,
      message: 'B2C product updated successfully',
      data: product,
    });
  } catch (error) {
    console.error('Error in updateProduct:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }
    next(error);
  }
};

// @desc    Delete B2C product
// @route   DELETE /api/b2c/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await B2CProduct.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'B2C product not found',
      });
    }

    // Log activity before deletion
    if (req.user && req.user.role === 'admin') {
      await logActivity(req, {
        action: 'delete',
        entityType: 'product',
        entityId: product._id,
        entityName: product.name,
        description: `Deleted B2C product: ${product.name}`,
      });
    }

    await B2CProduct.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'B2C product deleted successfully',
      data: {},
    });
  } catch (error) {
    console.error('Error in deleteProduct:', error);
    next(error);
  }
};

