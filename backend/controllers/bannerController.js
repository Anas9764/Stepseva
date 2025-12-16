const Banner = require('../models/Banner');

// @desc    Get all banners
// @route   GET /api/banners
// @access  Public
exports.getAllBanners = async (req, res, next) => {
  try {
    const banners = await Banner.find({ isActive: true })
      .sort({ priority: 1, createdAt: -1 })
      .lean();

    if (!res.headersSent) {
      res.status(200).json({
        success: true,
        data: banners || [],
      });
    }
  } catch (error) {
    console.error('Error in getAllBanners:', error);
    next(error);
  }
};

// @desc    Get all banners (including inactive) - Admin
// @route   GET /api/banners/all
// @access  Private/Admin
exports.getAllBannersAdmin = async (req, res, next) => {
  try {
    const banners = await Banner.find().sort({ priority: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      data: banners,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single banner
// @route   GET /api/banners/:id
// @access  Public
exports.getBannerById = async (req, res, next) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found',
      });
    }

    res.status(200).json({
      success: true,
      data: banner,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new banner
// @route   POST /api/banners
// @access  Private/Admin
exports.createBanner = async (req, res, next) => {
  try {
    const { title, subtitle, image, ctaText, ctaLink, priority, isActive } = req.body;

    const banner = await Banner.create({
      title,
      subtitle,
      image,
      ctaText,
      ctaLink,
      priority: priority || 0,
      isActive: isActive !== false,
    });

    res.status(201).json({
      success: true,
      message: 'Banner created successfully',
      data: banner,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update banner
// @route   PUT /api/banners/:id
// @access  Private/Admin
exports.updateBanner = async (req, res, next) => {
  try {
    let banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found',
      });
    }

    banner = await Banner.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Banner updated successfully',
      data: banner,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete banner
// @route   DELETE /api/banners/:id
// @access  Private/Admin
exports.deleteBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found',
      });
    }

    await Banner.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Banner deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

