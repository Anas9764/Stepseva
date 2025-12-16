const Coupon = require('../models/Coupon');

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private/Admin
exports.getAllCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: coupons,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single coupon
// @route   GET /api/coupons/:id
// @access  Private/Admin
exports.getCouponById = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found',
      });
    }

    res.status(200).json({
      success: true,
      data: coupon,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new coupon
// @route   POST /api/coupons
// @access  Private/Admin
exports.createCoupon = async (req, res, next) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      minPurchase,
      expiryDate,
      usageLimit,
      isActive,
    } = req.body;

    // Check if coupon code already exists
    const couponExists = await Coupon.findOne({ code: code.toUpperCase() });
    if (couponExists) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code already exists',
      });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      minPurchase: minPurchase || 0,
      expiryDate,
      usageLimit,
      isActive: isActive !== false,
    });

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      data: coupon,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update coupon
// @route   PUT /api/coupons/:id
// @access  Private/Admin
exports.updateCoupon = async (req, res, next) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      minPurchase,
      expiryDate,
      usageLimit,
      isActive,
    } = req.body;

    let coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found',
      });
    }

    // Check if new code already exists (excluding current coupon)
    if (code && code.toUpperCase() !== coupon.code) {
      const codeExists = await Coupon.findOne({ code: code.toUpperCase() });
      if (codeExists) {
        return res.status(400).json({
          success: false,
          message: 'Coupon code already exists',
        });
      }
    }

    const updateData = {
      code: code ? code.toUpperCase() : coupon.code,
      discountType: discountType || coupon.discountType,
      discountValue: discountValue !== undefined ? discountValue : coupon.discountValue,
      minPurchase: minPurchase !== undefined ? minPurchase : coupon.minPurchase,
      expiryDate: expiryDate || coupon.expiryDate,
      usageLimit: usageLimit !== undefined ? usageLimit : coupon.usageLimit,
      isActive: isActive !== undefined ? isActive : coupon.isActive,
    };

    coupon = await Coupon.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Coupon updated successfully',
      data: coupon,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
exports.deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found',
      });
    }

    await Coupon.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Coupon deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Validate coupon
// @route   POST /api/coupons/validate
// @access  Public
exports.validateCoupon = async (req, res, next) => {
  try {
    const { code, orderTotal } = req.body;

    if (!code || !orderTotal) {
      return res.status(400).json({
        success: false,
        message: 'Please provide coupon code and order total',
      });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Invalid coupon code',
      });
    }

    // Check if coupon is valid
    if (!coupon.isValid()) {
      let message = 'Coupon is not valid';
      
      if (!coupon.isActive) {
        message = 'Coupon is inactive';
      } else if (new Date(coupon.expiryDate) < new Date()) {
        message = 'Coupon has expired';
      } else if (coupon.usageCount >= coupon.usageLimit) {
        message = 'Coupon usage limit reached';
      }

      return res.status(400).json({
        success: false,
        message,
      });
    }

    // Check minimum purchase requirement
    if (orderTotal < coupon.minPurchase) {
      return res.status(400).json({
        success: false,
        message: `Minimum purchase of $${coupon.minPurchase} required`,
      });
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (orderTotal * coupon.discountValue) / 100;
    } else {
      discount = coupon.discountValue;
    }

    // Ensure discount doesn't exceed order total
    discount = Math.min(discount, orderTotal);

    const finalAmount = orderTotal - discount;

    res.status(200).json({
      success: true,
      data: {
        isValid: true,
        discount: Math.round(discount * 100) / 100,
        finalAmount: Math.round(finalAmount * 100) / 100,
        coupon: {
          code: coupon.code,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Apply coupon (increment usage count)
// @route   POST /api/coupons/apply
// @access  Public
exports.applyCoupon = async (req, res, next) => {
  try {
    const { code } = req.body;

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found',
      });
    }

    // Increment usage count
    coupon.usageCount += 1;
    await coupon.save();

    res.status(200).json({
      success: true,
      message: 'Coupon applied successfully',
      data: coupon,
    });
  } catch (error) {
    next(error);
  }
};

