const Category = require('../models/Category');
const Product = require('../models/Product');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getAllCategories = async (req, res, next) => {
  try {
    const categoryType = req.query.categoryType; // Optional: b2b, b2c, both
    const allCategories = req.query.all === 'true'; // Admin can request all categories
    
    // Build query
    let query = {};
    
    // If admin requests all categories, skip filtering
    if (allCategories || (req.user && req.user.role === 'admin')) {
      // Admin sees all categories - no filtering
      query = {};
    } else if (categoryType) {
      // Filter by categoryType if specified
      if (categoryType === 'b2b') {
        // Only show B2B and 'both' categories - no backward compatibility
        query.$or = [
          { categoryType: 'b2b' },
          { categoryType: 'both' },
        ];
      } else if (categoryType === 'b2c') {
        // Only show B2C and 'both' categories - no backward compatibility
        query.$or = [
          { categoryType: 'b2c' },
          { categoryType: 'both' },
        ];
      } else {
        query.categoryType = categoryType;
      }
    } else {
      // Default: For business frontend (B2B), show only B2B and both categories
      query.$or = [
        { categoryType: 'b2b' },
        { categoryType: 'both' },
      ];
    }

    const categories = await Category.find(query).sort({ createdAt: -1 }).lean();

    // Add product count for each category (only count active products)
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        try {
          const productCount = await Product.countDocuments({ 
            category: category._id,
            isActive: true,
          });
          return {
            ...category,
            productCount,
          };
        } catch (err) {
          console.error(`Error counting products for category ${category._id}:`, err);
          return {
            ...category,
            productCount: 0,
          };
        }
      })
    );

    if (!res.headersSent) {
      res.status(200).json({
        success: true,
        data: categoriesWithCount,
      });
    }
  } catch (error) {
    console.error('Error in getAllCategories:', error);
    next(error);
  }
};

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
exports.getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new category
// @route   POST /api/categories
// @access  Private/Admin
exports.createCategory = async (req, res, next) => {
  try {
    const { name, description, image, categoryType } = req.body;

    // Check if category already exists
    const categoryExists = await Category.findOne({ name });
    if (categoryExists) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists',
      });
    }

    const category = await Category.create({
      name,
      description,
      image: image || '',
      categoryType: categoryType || 'b2c', // Default to 'b2c' if not specified
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
exports.updateCategory = async (req, res, next) => {
  try {
    const { name, description, image } = req.body;

    let category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    // Check if new name already exists (excluding current category)
    if (name && name !== category.name) {
      const nameExists = await Category.findOne({ name });
      if (nameExists) {
        return res.status(400).json({
          success: false,
          message: 'Category with this name already exists',
        });
      }
    }

    // Build update object
    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (image !== undefined) updateData.image = image;
    if (req.body.categoryType !== undefined) updateData.categoryType = req.body.categoryType;

    category = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    // Check if category has products
    const productsCount = await Product.countDocuments({ category: req.params.id });
    if (productsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. It has ${productsCount} product(s) associated with it.`,
      });
    }

    await Category.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

