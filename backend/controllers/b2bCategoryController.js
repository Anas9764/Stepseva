const B2BCategory = require('../models/B2BCategory');
const B2BProduct = require('../models/B2BProduct');

// @desc    Get all B2B categories
// @route   GET /api/b2b/categories
// @access  Public
exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await B2BCategory.find({}).sort({ createdAt: -1 }).lean();

    // Add product count for each category (only count active products)
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        try {
          const productCount = await B2BProduct.countDocuments({ 
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

    res.status(200).json({
      success: true,
      data: categoriesWithCount,
    });
  } catch (error) {
    console.error('Error in getAllCategories:', error);
    next(error);
  }
};

// @desc    Get single B2B category
// @route   GET /api/b2b/categories/:id
// @access  Public
exports.getCategoryById = async (req, res, next) => {
  try {
    const category = await B2BCategory.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'B2B category not found',
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

// @desc    Create new B2B category
// @route   POST /api/b2b/categories
// @access  Private/Admin
exports.createCategory = async (req, res, next) => {
  try {
    const { name, description, image } = req.body;

    // Check if category already exists
    const categoryExists = await B2BCategory.findOne({ name });
    if (categoryExists) {
      return res.status(400).json({
        success: false,
        message: 'B2B category with this name already exists',
      });
    }

    const category = await B2BCategory.create({
      name,
      description,
      image: image || '',
    });

    res.status(201).json({
      success: true,
      message: 'B2B category created successfully',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update B2B category
// @route   PUT /api/b2b/categories/:id
// @access  Private/Admin
exports.updateCategory = async (req, res, next) => {
  try {
    const { name, description, image } = req.body;

    let category = await B2BCategory.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'B2B category not found',
      });
    }

    // Check if new name already exists (excluding current category)
    if (name && name !== category.name) {
      const nameExists = await B2BCategory.findOne({ name });
      if (nameExists) {
        return res.status(400).json({
          success: false,
          message: 'B2B category with this name already exists',
        });
      }
    }

    // Build update object
    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (image !== undefined) updateData.image = image;

    category = await B2BCategory.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'B2B category updated successfully',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete B2B category
// @route   DELETE /api/b2b/categories/:id
// @access  Private/Admin
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await B2BCategory.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'B2B category not found',
      });
    }

    // Check if category has products
    const productsCount = await B2BProduct.countDocuments({ category: req.params.id });
    if (productsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete B2B category. It has ${productsCount} product(s) associated with it.`,
      });
    }

    await B2BCategory.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'B2B category deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

