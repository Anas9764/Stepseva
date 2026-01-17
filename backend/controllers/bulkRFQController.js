const BulkRFQ = require('../models/BulkRFQ');
const Product = require('../models/Product');
const mongoose = require('mongoose');
const logger = require('../config/logger');

const computePriority = (items) => {
  const totalQty = (items || []).reduce((sum, i) => sum + (Number(i.quantityRequired) || 0), 0);
  if (totalQty >= 1000) return 'high';
  if (totalQty >= 500) return 'medium';
  return 'low';
};

// @desc    Create a new bulk RFQ
// @route   POST /api/bulk-rfqs
// @access  Public (optional auth; can be gated via Settings middleware)
exports.createBulkRFQ = async (req, res) => {
  try {
    const {
      buyerName,
      buyerEmail,
      buyerPhone,
      buyerCity,
      buyerState,
      buyerCountry,
      businessType,
      companyName,
      gstNumber,
      inquiryType,
      notes,
      requirements,
      items,
    } = req.body;

    if (!buyerName || !buyerEmail || !buyerPhone || !buyerCity) {
      return res.status(400).json({
        success: false,
        message: 'Please provide buyer name, email, phone, and city',
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one RFQ item',
      });
    }

    // Validate products and build normalized item list
    const productIds = items
      .map((i) => {
        if (!i.productId) return null;
        // Convert to ObjectId if it's a string, otherwise use as-is
        try {
          const idStr = String(i.productId);
          if (mongoose.Types.ObjectId.isValid(idStr)) {
            return new mongoose.Types.ObjectId(idStr);
          }
          return null;
        } catch (err) {
          console.error('Error converting productId to ObjectId:', i.productId, err);
          return null;
        }
      })
      .filter(Boolean);
    
    if (productIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No valid product IDs provided. Please check that all product IDs are valid.' 
      });
    }

    if (productIds.length !== items.length) {
      return res.status(400).json({ 
        success: false, 
        message: 'Some product IDs are invalid. Please check all product IDs.' 
      });
    }

    const products = await Product.find({ _id: { $in: productIds } }).select('_id name moq').lean();
    
    if (!products || products.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'No products found with the provided IDs' 
      });
    }
    
    const productMap = new Map(products.map((p) => [String(p._id), p]));

    const normalizedItems = [];
    for (const item of items) {
      if (!item.productId) {
        return res.status(400).json({ success: false, message: 'One or more items missing productId' });
      }
      
      // Normalize productId to string for comparison
      const productIdStr = String(item.productId);
      const p = productMap.get(productIdStr);
      
      if (!p) {
        return res.status(404).json({ 
          success: false, 
          message: `Product not found: ${productIdStr}. Please ensure all products exist.` 
        });
      }

      const qty = parseInt(item.quantityRequired);
      if (!qty || qty < 1) {
        return res.status(400).json({ success: false, message: 'Invalid quantity for one or more items' });
      }

      const min = p.moq || 1;
      if (qty < min) {
        return res.status(400).json({
          success: false,
          message: `Minimum order quantity for ${p.name} is ${min}`,
        });
      }

      normalizedItems.push({
        productId: p._id,
        productName: p.name,
        quantityRequired: qty,
        size: item.size || '',
        color: item.color || '',
      });
    }

    let buyerUserId = null;
    let businessAccountId = null;
    if (req.user) {
      buyerUserId = req.user._id;
      if (req.user.businessAccountId) businessAccountId = req.user.businessAccountId;
    }

    const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
    const userAgent = req.headers['user-agent'];

    const rfq = await BulkRFQ.create({
      buyerName,
      buyerEmail: buyerEmail.toLowerCase().trim(),
      buyerPhone: buyerPhone.trim(),
      buyerCity: buyerCity.trim(),
      buyerState: buyerState?.trim(),
      buyerCountry: buyerCountry || 'India',
      businessType: businessType || 'other',
      companyName: companyName?.trim(),
      gstNumber: gstNumber?.trim(),
      inquiryType: inquiryType || 'bulk_inquiry',
      notes: notes?.trim(),
      requirements: requirements?.trim(),
      items: normalizedItems,
      buyerUserId,
      businessAccountId,
      ipAddress,
      userAgent,
      source: 'website',
      status: 'new',
      priority: computePriority(normalizedItems),
    });

    logger.info('New bulk RFQ created', { rfqId: rfq._id, buyerEmail: rfq.buyerEmail, items: rfq.items.length });

    return res.status(201).json({
      success: true,
      message: 'Your bulk inquiry has been submitted successfully. We will contact you soon!',
      data: { rfq: { _id: rfq._id, status: rfq.status, createdAt: rfq.createdAt } },
    });
  } catch (error) {
    console.error('❌ Error in createBulkRFQ:', error);
    logger.error('Error creating bulk RFQ', { error: error.message, stack: error.stack });
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Server error. Please try again later.' 
    });
  }
};

// @desc    Admin: Get all bulk RFQs
// @route   GET /api/bulk-rfqs
// @access  Admin
exports.getAllBulkRFQs = async (req, res) => {
  try {
    const { status, q, page = 1, limit = 20 } = req.query;

    console.log('📥 getAllBulkRFQs called with params:', { status, q, page, limit });

    const query = {};
    if (status) query.status = status;
    if (q) {
      query.$or = [
        { buyerName: { $regex: q, $options: 'i' } },
        { buyerEmail: { $regex: q, $options: 'i' } },
        { companyName: { $regex: q, $options: 'i' } },
        { 'items.productName': { $regex: q, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const skip = (pageNum - 1) * limitNum;

    console.log('🔍 Query:', JSON.stringify(query));
    console.log('📄 Pagination:', { page: pageNum, limit: limitNum, skip });

    const [total, data] = await Promise.all([
      BulkRFQ.countDocuments(query),
      BulkRFQ.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
    ]);

    // Populate product details for items in bulk RFQs
    if (data && data.length > 0) {
      const allProductIds = [];
      data.forEach(rfq => {
        if (rfq.items && Array.isArray(rfq.items)) {
          rfq.items.forEach(item => {
            if (item.productId && !allProductIds.includes(item.productId.toString())) {
              allProductIds.push(item.productId);
            }
          });
        }
      });

      if (allProductIds.length > 0) {
        const products = await Product.find({ _id: { $in: allProductIds } })
          .select('_id name image moq')
          .lean();
        
        const productMap = new Map(products.map(p => [String(p._id), p]));

        // Attach product details to items
        data.forEach(rfq => {
          if (rfq.items && Array.isArray(rfq.items)) {
            rfq.items = rfq.items.map(item => {
              const product = productMap.get(String(item.productId));
              if (product) {
                return {
                  ...item,
                  productId: {
                    _id: product._id,
                    name: product.name,
                    image: product.image,
                    moq: product.moq,
                  },
                };
              }
              return item;
            });
          }
        });
      }
    }

    console.log('✅ Found', total, 'total RFQs, returning', data.length, 'RFQs');
    console.log('✅ Sample RFQ data:', data.length > 0 ? JSON.stringify(data[0], null, 2) : 'No data');

    const response = {
      success: true,
      message: 'Bulk RFQs fetched successfully',
      data: data || [], // Ensure data is always an array
      pagination: { 
        page: pageNum, 
        limit: limitNum, 
        total: total || 0, 
        pages: Math.ceil((total || 0) / limitNum) 
      },
    };

    console.log('✅ Response structure:', {
      success: response.success,
      dataLength: response.data.length,
      pagination: response.pagination
    });

    return res.status(200).json(response);
  } catch (error) {
    console.error('❌ Error in getAllBulkRFQs:', error);
    console.error('❌ Error stack:', error.stack);
    logger.error('Error fetching bulk RFQs', { error: error.message, stack: error.stack });
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Server error. Please try again later.' 
    });
  }
};

// @desc    Admin: Get single bulk RFQ
// @route   GET /api/bulk-rfqs/:id
// @access  Admin
exports.getBulkRFQById = async (req, res) => {
  try {
    const rfq = await BulkRFQ.findById(req.params.id).lean();
    if (!rfq) return res.status(404).json({ success: false, message: 'Bulk RFQ not found' });
    return res.status(200).json({ success: true, data: rfq });
  } catch (error) {
    console.error('❌ Error in getBulkRFQById:', error.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Admin: Update bulk RFQ
// @route   PUT /api/bulk-rfqs/:id
// @access  Admin
exports.updateBulkRFQ = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;

    const update = {};
    if (status) update.status = status;
    if (adminNotes !== undefined) update.adminNotes = adminNotes;

    const rfq = await BulkRFQ.findByIdAndUpdate(req.params.id, update, { new: true }).lean();
    if (!rfq) return res.status(404).json({ success: false, message: 'Bulk RFQ not found' });

    return res.status(200).json({ success: true, message: 'Bulk RFQ updated', data: rfq });
  } catch (error) {
    console.error('❌ Error in updateBulkRFQ:', error.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
