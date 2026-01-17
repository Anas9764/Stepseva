const B2BProduct = require('../models/B2BProduct');
const B2BCategory = require('../models/B2BCategory');
const BusinessAccount = require('../models/BusinessAccount');
const mongoose = require('mongoose');
const { getPricingInfo } = require('../utils/b2bPricing');
const { logActivity } = require('../middleware/activityLogger');

// @desc    Get all B2B products
// @route   GET /api/b2b/products
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
        const categoryDoc = await B2BCategory.findOne({ name: { $regex: new RegExp(`^${category}$`, 'i') } });
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

    // Get total count and products
    const total = await B2BProduct.countDocuments(query);
    const products = await B2BProduct.find(query)
      .populate('category', 'name description')
      .sort(sortSpec)
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Get business account if user is authenticated
    let businessAccount = null;
    const isB2BUser = req.user && req.user.isBusinessAccount && req.user.businessAccountId;
    if (isB2BUser) {
      try {
        businessAccount = await BusinessAccount.findById(req.user.businessAccountId)
          .select('pricingTier status')
          .lean();
        if (!businessAccount || businessAccount.status !== 'active') {
          businessAccount = null;
        }
      } catch (err) {
        console.error('Error fetching business account:', err);
        businessAccount = null;
      }
    }

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
        
        const productData = {
          ...p,
          gender: p.gender || 'unisex',
          footwearType: p.footwearType || 'other',
          sizes: Array.isArray(p.sizes) ? p.sizes : [],
          sizeStock: sizeStockObj,
        };

        // Add B2B pricing information if available
        if (businessAccount && p.volumePricing && p.volumePricing.length > 0) {
          try {
            const pricingInfo = getPricingInfo(p, businessAccount);
            if (pricingInfo && pricingInfo.tierPrice < p.price) {
              productData.b2bPricing = {
                standardPrice: pricingInfo.standardPrice,
                tierPrice: pricingInfo.tierPrice,
                pricingTier: pricingInfo.pricingTier,
                discount: Math.round(((pricingInfo.standardPrice - pricingInfo.tierPrice) / pricingInfo.standardPrice) * 100),
              };
            }
          } catch (pricingError) {
            console.error('Error calculating pricing info:', pricingError);
          }
        }

        return productData;
      });

    const totalPages = Math.ceil(total / limitNum);

    res.status(200).json({
      success: true,
      message: 'B2B products fetched successfully',
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

// @desc    Get single B2B product
// @route   GET /api/b2b/products/:id
// @access  Public
exports.getProductById = async (req, res, next) => {
  try {
    const product = await B2BProduct.findById(req.params.id)
      .populate({
        path: 'category',
        select: 'name description',
      })
      .lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'B2B product not found',
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

    // Get business account if user is authenticated
    let businessAccount = null;
    if (req.user && req.user.isBusinessAccount && req.user.businessAccountId) {
      try {
        businessAccount = await BusinessAccount.findById(req.user.businessAccountId)
          .select('pricingTier status')
          .lean();
        if (!businessAccount || businessAccount.status !== 'active') {
          businessAccount = null;
        }
      } catch (err) {
        console.error('Error fetching business account:', err);
        businessAccount = null;
      }
    }

    // Add B2B pricing information if available
    if (businessAccount && product.volumePricing && product.volumePricing.length > 0) {
      try {
        const pricingInfo = getPricingInfo(product, businessAccount);
        if (pricingInfo && pricingInfo.tierPrice < product.price) {
          product.b2bPricing = {
            standardPrice: pricingInfo.standardPrice,
            tierPrice: pricingInfo.tierPrice,
            pricingTier: pricingInfo.pricingTier,
            discount: Math.round(((pricingInfo.standardPrice - pricingInfo.tierPrice) / pricingInfo.standardPrice) * 100),
            quantityPricing: pricingInfo.quantityPricing,
            moq: pricingInfo.moq,
          };
        }
      } catch (pricingError) {
        console.error('Error calculating pricing info:', pricingError);
      }
    }

    res.status(200).json({
      success: true,
      message: 'B2B product fetched successfully',
      data: product,
    });
  } catch (error) {
    console.error('Error in getProductById:', error);
    next(error);
  }
};

// @desc    Create B2B product
// @route   POST /api/b2b/products
// @access  Private/Admin
exports.createProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      category,
      price,
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
      volumePricing,
      quantityPricing,
      moq,
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
      volumePricing: volumePricing || [],
      quantityPricing: quantityPricing || [],
      moq: moq || 10,
    };

    const product = await B2BProduct.create(productData);
    
    // Populate category before sending response
    await product.populate('category', 'name description');

    // Log activity
    if (req.user && req.user.role === 'admin') {
      await logActivity(req, {
        action: 'create',
        entityType: 'product',
        entityId: product._id,
        entityName: product.name,
        description: `Created B2B product: ${product.name}`,
      });
    }

    res.status(201).json({
      success: true,
      message: 'B2B product created successfully',
      data: product,
    });
  } catch (error) {
    console.error('Error in createProduct:', error);
    next(error);
  }
};

// @desc    Update B2B product
// @route   PUT /api/b2b/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res, next) => {
  try {
    let product = await B2BProduct.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'B2B product not found',
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
    if (updateData.stock !== undefined) updateData.stock = Number(updateData.stock);
    if (updateData.moq) updateData.moq = Number(updateData.moq);

    product = await B2BProduct.findByIdAndUpdate(
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
        description: `Updated B2B product: ${product.name}`,
      });
    }

    res.status(200).json({
      success: true,
      message: 'B2B product updated successfully',
      data: product,
    });
  } catch (error) {
    console.error('Error in updateProduct:', error);
    next(error);
  }
};

// @desc    Delete B2B product
// @route   DELETE /api/b2b/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await B2BProduct.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'B2B product not found',
      });
    }

    // Log activity before deletion
    if (req.user && req.user.role === 'admin') {
      await logActivity(req, {
        action: 'delete',
        entityType: 'product',
        entityId: product._id,
        entityName: product.name,
        description: `Deleted B2B product: ${product.name}`,
      });
    }

    await B2BProduct.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'B2B product deleted successfully',
      data: {},
    });
  } catch (error) {
    console.error('Error in deleteProduct:', error);
    next(error);
  }
};

