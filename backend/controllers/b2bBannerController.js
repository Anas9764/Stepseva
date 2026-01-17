const B2BBanner = require('../models/B2BBanner');

// @desc    Get all B2B banners
// @route   GET /api/b2b/banners
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
    const banners = await B2BBanner.find(query)
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

// @desc    Get single B2B banner
// @route   GET /api/b2b/banners/:id
// @access  Public
exports.getBannerById = async (req, res, next) => {
  try {
    const banner = await B2BBanner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'B2B banner not found',
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

// @desc    Create new B2B banner
// @route   POST /api/b2b/banners
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

    const banner = await B2BBanner.create({
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
      message: 'B2B banner created successfully',
      data: banner,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update B2B banner
// @route   PUT /api/b2b/banners/:id
// @access  Private/Admin
exports.updateBanner = async (req, res, next) => {
  try {
    let banner = await B2BBanner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'B2B banner not found',
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

    banner = await B2BBanner.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'B2B banner updated successfully',
      data: banner,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete B2B banner
// @route   DELETE /api/b2b/banners/:id
// @access  Private/Admin
exports.deleteBanner = async (req, res, next) => {
  try {
    const banner = await B2BBanner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'B2B banner not found',
      });
    }

    await B2BBanner.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'B2B banner deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

