const Settings = require('../models/Settings');

// @desc    Get settings
// @route   GET /api/settings
// @access  Public
exports.getSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne();

    // If no settings exist, create default settings
    if (!settings) {
      settings = await Settings.create({
        storeName: 'Eclora',
        storeEmail: 'contact@eclora.com',
        homepageTitle: 'Welcome to Eclora',
        homepageSubtitle: 'Premium Handmade Candles, Bouquets, and Curated Gifts',
        footerText: '© 2024 Eclora. All rights reserved.',
      });
    }

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update settings
// @route   PUT /api/settings
// @access  Private/Admin
exports.updateSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne();

    if (!settings) {
      // Create new settings if none exist
      settings = await Settings.create(req.body);
    } else {
      // Update existing settings
      settings = await Settings.findOneAndUpdate({}, req.body, {
        new: true,
        runValidators: true,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

