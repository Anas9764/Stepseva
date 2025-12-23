const Product = require('../models/Product');
const Category = require('../models/Category');
const BusinessAccount = require('../models/BusinessAccount');
const mongoose = require('mongoose');
const cloudinary = require('../utils/cloudinary');
const { getPricingInfo } = require('../utils/b2bPricing');
const { logActivity } = require('../middleware/activityLogger');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getAllProducts = async (req, res, next) => {
  try {
    const {
      category,
      brand,
      minPrice,
      maxPrice,
      search,
      product,
      page = 1,
      limit = 12,
      featured,
      gender,
      footwearType,
      size,
      color,
      rating,
      discount,
    } = req.query;

    // Build query
    let query = {};

    // For admin panel, show all products
    // For website, only show active products
    if (!req.user || req.user.role !== 'admin') {
      query.isActive = true;
    }

    // Handle category - can be name or ID
    if (category) {
      // Check if it's a valid ObjectId
      const Category = require('../models/Category');
      if (mongoose.Types.ObjectId.isValid(category)) {
        query.category = category;
      } else {
        // It's a name, find the category ID
        const categoryDoc = await Category.findOne({ name: { $regex: new RegExp(`^${category}$`, 'i') } });
        if (categoryDoc) {
          query.category = categoryDoc._id;
        } else {
          // Category name not found, return empty results
          return res.status(200).json({
            success: true,
            message: 'Products fetched successfully',
            data: [],
            pagination: {
              page: Number(page),
              limit: Number(limit),
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

    if (product) {
      query.name = { $regex: new RegExp(`^${product}$`, 'i') };
    }

    // Filter by size
    if (size) {
      query.sizes = { $in: [size] };
    }

    // Filter by color (variantColor)
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

    // Filter by gender
    if (gender) {
      query.gender = gender.toLowerCase();
    }

    // Filter by footwear type
    if (footwearType) {
      query.footwearType = footwearType.toLowerCase();
    }

    // Filter by product type based on user type (B2B vs B2C)
    // This ensures B2C users don't see B2B-only products and vice versa
    const productTypeFilter = req.query.productType; // Allow manual override via query param
    if (!productTypeFilter) {
      // Check if user is a B2B user
      const isB2BUser = req.user && req.user.isBusinessAccount && req.user.businessAccountId;
      
      if (isB2BUser) {
        // Check if user has active business account
        try {
          const BusinessAccount = require('../models/BusinessAccount');
          const businessAccount = await BusinessAccount.findById(req.user.businessAccountId)
            .select('status')
            .lean();
          if (businessAccount && businessAccount.status === 'active') {
            // B2B users see B2B and 'both' products
            query.productType = { $in: ['b2b', 'both'] };
          } else {
            // Inactive business account, show B2C products
            query.productType = { $in: ['b2c', 'both'] };
          }
        } catch (err) {
          // Error checking business account, default to B2C
          query.productType = { $in: ['b2c', 'both'] };
        }
      } else {
        // Regular users (B2C) or unauthenticated users
        // Check if request is from Business Frontend via header
        const isBusinessFrontend = req.headers['x-frontend-type'] === 'business' ||
                                   req.headers.referer?.includes('business') || 
                                   req.headers.origin?.includes('business');
        
        if (isBusinessFrontend) {
          // Business Frontend (even unauthenticated) can see 'both' and 'b2b' products
          query.productType = { $in: ['b2b', 'both'] };
        } else {
          // Regular frontend sees B2C and 'both' products
          query.productType = { $in: ['b2c', 'both'] };
        }
      }
    } else {
      // Manual filter specified
      query.productType = productTypeFilter;
    }

    // Check if we need to filter by rating or discount (these require extra queries)
    const needsRatingFilter = rating && rating !== 'All';
    const needsDiscountFilter = discount && discount !== 'All';
    
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 12;
    const skip = (pageNum - 1) * limitNum;

    let products;
    let total;
    let validProductIds = null;

    // If rating or discount filters are needed, we must filter IDs first
    if (needsRatingFilter || needsDiscountFilter) {
      // First, get all product IDs that match the base query
      let allProductIds;
      try {
        allProductIds = await Product.find(query)
          .select('_id')
          .lean();
      } catch (queryError) {
        console.error('❌ Product query error:', queryError);
        throw queryError;
      }

      validProductIds = allProductIds.map(p => p._id);

      // Filter by rating (if provided)
      if (needsRatingFilter) {
        const Review = require('../models/Review');
        const minRating = parseInt(rating.replace('+', ''));
        
        const reviews = await Review.aggregate([
          {
            $match: {
              product: { $in: validProductIds },
              isActive: true,
              isApproved: true,
            },
          },
          {
            $group: {
              _id: '$product',
              avgRating: { $avg: '$rating' },
            },
          },
        ]);

        const ratingMap = new Map();
        reviews.forEach(r => {
          const productId = r._id.toString();
          ratingMap.set(productId, r.avgRating);
        });

        validProductIds = validProductIds.filter(id => {
          const productId = id.toString();
          const avgRating = ratingMap.get(productId) || 0;
          return avgRating >= minRating;
        });
      }

      // Filter by discount (if provided)
      if (needsDiscountFilter) {
        const minDiscount = parseInt(discount.replace('%+', '').replace('+', ''));
        const productsForDiscount = await Product.find({
          _id: { $in: validProductIds }
        }).select('_id discount price salePrice').lean();
        
        validProductIds = productsForDiscount
          .filter(p => {
            let productDiscount = 0;
            if (p.discount && typeof p.discount === 'number') {
              productDiscount = p.discount;
            } else if (p.salePrice && p.price) {
              productDiscount = ((p.price - p.salePrice) / p.price) * 100;
            }
            return productDiscount >= minDiscount;
          })
          .map(p => p._id);
      }

      // Get total count before pagination
      total = validProductIds.length;

      // Get paginated products with filtered IDs
      try {
        products = await Product.find({
          _id: { $in: validProductIds }
        })
          .populate('category', 'name description')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum)
          .lean();
      } catch (queryError) {
        console.error('❌ Product query error:', queryError);
        throw queryError;
      }
    } else {
      // No rating/discount filters - use direct query with pagination (more efficient)
      try {
        // Get total count
        total = await Product.countDocuments(query);
        
        // Get paginated products
        products = await Product.find(query)
          .populate('category', 'name description')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum)
          .lean();
      } catch (queryError) {
        console.error('❌ Product query error:', queryError);
        throw queryError;
      }
    }

    // Get business account if user is authenticated
    let businessAccount = null;
    const isB2BUser = req.user && req.user.isBusinessAccount && req.user.businessAccountId;
    if (isB2BUser) {
      try {
        businessAccount = await BusinessAccount.findById(req.user.businessAccountId)
          .select('pricingTier status')
          .lean();
        // Only use if account is active
        if (!businessAccount || businessAccount.status !== 'active') {
          businessAccount = null;
        }
      } catch (err) {
        console.error('Error fetching business account:', err);
        businessAccount = null;
      }
    }

    // Filter out products with null categories and format
    // Note: Product type filtering is already done at database query level
    let validProducts = (products || [])
      .filter(p => p && p.category !== null && p.category !== undefined)
      .map(p => {
        // Convert Map to Object for JSON serialization
        let sizeStockObj = {};
        if (p.sizeStock && p.sizeStock instanceof Map) {
          sizeStockObj = Object.fromEntries(p.sizeStock);
        } else if (p.sizeStock && typeof p.sizeStock === 'object') {
          sizeStockObj = p.sizeStock;
        }
        
        // Get B2B pricing info if business account exists AND product supports B2B
        const productType = p.productType || 'b2c';
        const supportsB2B = productType === 'b2b' || productType === 'both';
        const pricingInfo = (businessAccount && supportsB2B && p.bulkPricingEnabled) 
          ? getPricingInfo(p, businessAccount) 
          : null;
        
        const productData = {
          ...p,
          gender: p.gender || 'unisex',
          footwearType: p.footwearType || 'other',
          sizes: Array.isArray(p.sizes) ? p.sizes : [],
          sizeStock: sizeStockObj,
          productType: productType, // Ensure productType is included
        };

        // Add B2B pricing information if available (only for B2B users and B2B-enabled products)
        if (pricingInfo && pricingInfo.tierPrice < p.price) {
          productData.b2bPricing = {
            standardPrice: pricingInfo.standardPrice,
            tierPrice: pricingInfo.tierPrice,
            pricingTier: pricingInfo.pricingTier,
            discount: Math.round(((pricingInfo.standardPrice - pricingInfo.tierPrice) / pricingInfo.standardPrice) * 100),
          };
        }

        return productData;
      });

    const totalPages = Math.ceil(total / limitNum);

    // Ensure response is sent only once
    if (!res.headersSent) {
      res.status(200).json({
        success: true,
        message: 'Products fetched successfully',
        data: validProducts,
        total,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: totalPages,
        },
      });
    }
  } catch (error) {
    console.error('❌ Error in getAllProducts:', error.message);
    console.error('Stack:', error.stack);
    next(error);
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate({
        path: 'category',
        select: 'name description',
      })
      .lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // If category is null or doesn't exist, set it to an empty object
    if (!product.category) {
      product.category = { name: 'Uncategorized', description: '' };
    }

    // Ensure footwear fields have defaults if missing
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

    // Get variants if this product has variants or is a variant
    let variants = [];
    if (product.isVariant && product.parentProduct) {
      // This is a variant, get all siblings (other variants) and parent
      const parent = await Product.findById(product.parentProduct)
        .populate('category', 'name description')
        .lean();
      
      variants = await Product.find({
        $or: [
          { parentProduct: product.parentProduct },
          { _id: product.parentProduct },
        ],
        isActive: true,
      })
        .select('_id name image images variantColor variantName price stock')
        .lean();
    } else if (!product.isVariant) {
      // This is a parent product, get all variants
      variants = await Product.find({
        parentProduct: product._id,
        isActive: true,
      })
        .select('_id name image images variantColor variantName price stock')
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
        stock: product.stock,
      });
    }

    product.variants = variants;

    // Add B2B pricing information if available
    if (businessAccount) {
      const pricingInfo = getPricingInfo(product, businessAccount);
      if (pricingInfo.tierPrice < product.price) {
        product.b2bPricing = {
          standardPrice: pricingInfo.standardPrice,
          tierPrice: pricingInfo.tierPrice,
          pricingTier: pricingInfo.pricingTier,
          discount: Math.round(((pricingInfo.standardPrice - pricingInfo.tierPrice) / pricingInfo.standardPrice) * 100),
          quantityPricing: pricingInfo.quantityPricing,
          moq: pricingInfo.moq,
        };
      }
    }

    res.status(200).json({
      success: true,
      message: 'Product fetched successfully',
      data: product,
    });
  } catch (error) {
    console.error('Error in getProductById:', error);
    next(error);
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = async (req, res, next) => {
  try {
    const { name, description, category, price, brand, stock, image, images, isActive, featured, gender, footwearType, sizes, sizeStock } = req.body;

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
        message: 'Please specify footwear type (sneakers, casual, formal, sports, sandals, boots, flip-flops, slippers)',
      });
    }

    if (!sizes || !Array.isArray(sizes) || sizes.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one size',
      });
    }

    // Handle image - support both single image and images array
    let imageUrls = [];
    if (image) {
      imageUrls = [image];
    } else if (images && Array.isArray(images)) {
      imageUrls = images;
    }

    // Handle sizeStock - convert object to Map if provided
    let sizeStockMap = new Map();
    if (sizeStock && typeof sizeStock === 'object') {
      Object.entries(sizeStock).forEach(([size, stock]) => {
        sizeStockMap.set(size, Number(stock));
      });
    }

    const { parentProduct, variantColor, variantName, isVariant } = req.body;

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
      status: isActive !== false ? 'active' : 'inactive',
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

    const product = await Product.create(productData);
    
    // Populate category before sending response
    await product.populate('category', 'name description');

    // Log activity
    if (req.user && req.user.role === 'admin') {
      await logActivity(req, {
        action: 'create',
        entityType: 'product',
        entityId: product._id,
        entityName: product.name,
        description: `Created product: ${product.name}`,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product,
    });
  } catch (error) {
    // Handle validation errors
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

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Handle isActive to status conversion
    const updateData = { ...req.body };
    if (updateData.isActive !== undefined) {
      updateData.status = updateData.isActive ? 'active' : 'inactive';
    }

    // Handle single image to images array
    if (updateData.image && !updateData.images) {
      updateData.images = [updateData.image];
    }
    
    // Handle featured field
    if (updateData.featured !== undefined) {
      updateData.featured = updateData.featured === true;
    }

    // Handle sizeStock - convert object to Map if provided
    if (updateData.sizeStock && typeof updateData.sizeStock === 'object' && !(updateData.sizeStock instanceof Map)) {
      const sizeStockMap = new Map();
      Object.entries(updateData.sizeStock).forEach(([size, stock]) => {
        sizeStockMap.set(size, Number(stock));
      });
      updateData.sizeStock = sizeStockMap;
    }

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

    const oldProduct = { ...product.toObject() };
    product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate('category', 'name description');

    // Log activity
    if (req.user && req.user.role === 'admin') {
      const changes = {};
      Object.keys(updateData).forEach(key => {
        if (oldProduct[key] !== product[key]) {
          changes[key] = { from: oldProduct[key], to: product[key] };
        }
      });
      await logActivity(req, {
        action: 'update',
        entityType: 'product',
        entityId: product._id,
        entityName: product.name,
        description: `Updated product: ${product.name}`,
        changes: Object.keys(changes).length > 0 ? changes : null,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
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

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const productName = product.name;
    await product.deleteOne();

    // Log activity
    if (req.user && req.user.role === 'admin') {
      await logActivity(req, {
        action: 'delete',
        entityType: 'product',
        entityId: req.params.id,
        entityName: productName,
        description: `Deleted product: ${productName}`,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

