const BusinessAccount = require('../models/BusinessAccount');
const User = require('../models/User');

// @desc    Create business account
// @route   POST /api/business-accounts
// @access  Private
exports.createBusinessAccount = async (req, res, next) => {
  try {
    const {
      businessType,
      companyName,
      businessRegistrationNumber,
      taxId,
      businessAddress,
      contactPerson,
      creditLimit,
      paymentTerms,
      pricingTier,
    } = req.body;

    const userId = req.user._id;

    // Check if user already has a business account
    const existingAccount = await BusinessAccount.findOne({ userId });
    if (existingAccount) {
      return res.status(400).json({
        success: false,
        message: 'Business account already exists for this user',
      });
    }

    // Create business account
    const businessAccount = await BusinessAccount.create({
      userId,
      businessType,
      companyName,
      businessRegistrationNumber,
      taxId,
      businessAddress,
      contactPerson,
      creditLimit: creditLimit || 0,
      creditAvailable: creditLimit || 0,
      paymentTerms: paymentTerms || 'net30',
      pricingTier: pricingTier || 'standard',
      status: 'pending', // Requires admin approval
    });

    // Update user
    await User.findByIdAndUpdate(userId, {
      isBusinessAccount: true,
      businessAccountId: businessAccount._id,
      role: businessType, // Set role based on business type
    });

    res.status(201).json({
      success: true,
      message: 'Business account created successfully. Pending admin approval.',
      data: businessAccount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's business account
// @route   GET /api/business-accounts/me
// @access  Private
exports.getMyBusinessAccount = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const businessAccount = await BusinessAccount.findOne({ userId })
      .populate('accountManager', 'name email')
      .populate('verifiedBy', 'name email');

    if (!businessAccount) {
      return res.status(404).json({
        success: false,
        message: 'Business account not found',
      });
    }

    // Calculate available credit
    businessAccount.calculateAvailableCredit();

    res.status(200).json({
      success: true,
      data: businessAccount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update business account
// @route   PUT /api/business-accounts/me
// @access  Private
exports.updateBusinessAccount = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const updateData = req.body;

    // Remove fields that shouldn't be updated by user
    delete updateData.status;
    delete updateData.isVerified;
    delete updateData.creditUsed;
    delete updateData.accountManager;

    const businessAccount = await BusinessAccount.findOneAndUpdate(
      { userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!businessAccount) {
      return res.status(404).json({
        success: false,
        message: 'Business account not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Business account updated successfully',
      data: businessAccount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all business accounts (Admin only)
// @route   GET /api/business-accounts
// @access  Private/Admin
exports.getAllBusinessAccounts = async (req, res, next) => {
  try {
    const { status, businessType, page = 1, limit = 10 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (businessType) query.businessType = businessType;

    const skip = (page - 1) * limit;

    const businessAccounts = await BusinessAccount.find(query)
      .populate('userId', 'name email')
      .populate('accountManager', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await BusinessAccount.countDocuments(query);

    res.status(200).json({
      success: true,
      data: businessAccounts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve/Reject business account (Admin only)
// @route   PUT /api/business-accounts/:id/approve
// @access  Private/Admin
exports.approveBusinessAccount = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action, notes } = req.body; // action: 'approve' or 'reject'

    const businessAccount = await BusinessAccount.findById(id);
    if (!businessAccount) {
      return res.status(404).json({
        success: false,
        message: 'Business account not found',
      });
    }

    if (action === 'approve') {
      businessAccount.status = 'active';
      businessAccount.isVerified = true;
      businessAccount.verifiedAt = new Date();
      businessAccount.verifiedBy = req.user._id;
      businessAccount.calculateAvailableCredit();
    } else if (action === 'reject') {
      businessAccount.status = 'inactive';
      if (notes) {
        businessAccount.notes.push({
          note: notes,
          addedBy: req.user._id,
        });
      }
    }

    await businessAccount.save();

    res.status(200).json({
      success: true,
      message: `Business account ${action}d successfully`,
      data: businessAccount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update credit limit (Admin only)
// @route   PUT /api/business-accounts/:id/credit
// @access  Private/Admin
exports.updateCreditLimit = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { creditLimit } = req.body;

    const businessAccount = await BusinessAccount.findById(id);
    if (!businessAccount) {
      return res.status(404).json({
        success: false,
        message: 'Business account not found',
      });
    }

    businessAccount.creditLimit = creditLimit;
    businessAccount.calculateAvailableCredit();

    await businessAccount.save();

    res.status(200).json({
      success: true,
      message: 'Credit limit updated successfully',
      data: businessAccount,
    });
  } catch (error) {
    next(error);
  }
};

