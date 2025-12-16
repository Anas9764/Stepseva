const Category = require('../models/Category');
const Product = require('../models/Product');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 }).lean();

    // Add product count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        try {
          const productCount = await Product.countDocuments({ category: category._id });
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
    const { name, description, image } = req.body;

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

    category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description, image },
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

