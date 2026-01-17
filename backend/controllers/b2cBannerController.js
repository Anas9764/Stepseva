const B2CBanner = require('../models/B2CBanner');

// @desc    Get all B2C banners
// @route   GET /api/b2c/banners
// @access  Public
exports.getAllBanners = async (req, res, next) => {
  try {
    const now = new Date();
    const placement = (req.query.placement || '').trim();
    const allBanners = req.query.all === 'true';

    // Build query
    let query = {};

    // For admin panel, show all banners (including inactive)
    if (allBanners || (req.user && req.user.role === 'admin')) {
      query = {};
    } else {
      // For public, only show active banners
      query.isActive = true;

      // Date range filter
      query.$and = [
        {
          $or: [
            { startAt: null },
            { startAt: { $lte: now } },
          ],
        },
        {
          $or: [
            { endAt: null },
            { endAt: { $gte: now } },
          ],
        },
      ];
    }

    // Placement filter
    if (placement) {
      query.placement = placement;
    }

    // Sort by priority (lower number = higher priority), then by createdAt (newest first)
    // Note: Lower priority number means higher display priority (1 shows before 2)
    const banners = await B2CBanner.find(query)
      .sort({ priority: 1, createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: banners,
    });
  } catch (error) {
    console.error('Error in getAllBanners:', error);
    next(error);
  }
};

// @desc    Get single B2C banner
// @route   GET /api/b2c/banners/:id
// @access  Public
exports.getBannerById = async (req, res, next) => {
  try {
    const banner = await B2CBanner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'B2C banner not found',
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

// @desc    Create new B2C banner
// @route   POST /api/b2c/banners
// @access  Private/Admin
exports.createBanner = async (req, res, next) => {
  try {
    const {
      title,
      subtitle,
      image,
      ctaText,
      ctaLink,
      placement,
      startAt,
      endAt,
      priority,
      isActive,
    } = req.body;

    // Validate required fields
    if (!title || !image) {
      return res.status(400).json({
        success: false,
        message: 'Title and image are required fields',
      });
    }

    const banner = await B2CBanner.create({
      title,
      subtitle: subtitle || '',
      image,
      ctaText: ctaText || '',
      ctaLink: ctaLink || '',
      placement: placement || 'global',
      startAt: startAt ? new Date(startAt) : null,
      endAt: endAt ? new Date(endAt) : null,
      priority: priority || 0,
      isActive: isActive !== false,
    });

    res.status(201).json({
      success: true,
      message: 'B2C banner created successfully',
      data: banner,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update B2C banner
// @route   PUT /api/b2c/banners/:id
// @access  Private/Admin
exports.updateBanner = async (req, res, next) => {
  try {
    let banner = await B2CBanner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'B2C banner not found',
      });
    }

    const updateData = { ...req.body };

    // Convert date strings to Date objects if provided
    if (updateData.startAt) {
      updateData.startAt = new Date(updateData.startAt);
    }
    if (updateData.endAt) {
      updateData.endAt = new Date(updateData.endAt);
    }

    banner = await B2CBanner.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'B2C banner updated successfully',
      data: banner,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete B2C banner
// @route   DELETE /api/b2c/banners/:id
// @access  Private/Admin
exports.deleteBanner = async (req, res, next) => {
  try {
    const banner = await B2CBanner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'B2C banner not found',
      });
    }

    await B2CBanner.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'B2C banner deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

