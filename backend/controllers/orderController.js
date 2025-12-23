const Order = require('../models/Order');
const Product = require('../models/Product');
const BusinessAccount = require('../models/BusinessAccount');
const emailService = require('../services/emailService');
const mongoose = require('mongoose');
const { cache } = require('../config/redis');
const { queueHelpers } = require('../config/queue');
const { socketHelpers } = require('../config/socket');
const logger = require('../config/logger');
const { calculateB2BPrice } = require('../utils/b2bPricing');

// Generate unique order ID
const generateOrderId = async () => {
  const prefix = 'SS';
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  const orderId = `${prefix}${timestamp}${random}`;
  
  // Check if orderId already exists
  const existingOrder = await Order.findOne({ orderId });
  if (existingOrder) {
    // If exists, generate a new one recursively
    return generateOrderId();
  }
  
  return orderId;
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Public
exports.createOrder = async (req, res, next) => {
  try {
    const { 
      userId, 
      products, 
      shippingAddress, 
      email, 
      phone, 
      totalAmount, 
      stripeSessionId,
      paymentStatus,
      orderStatus,
      paymentType,
      // B2B Fields
      isB2BOrder,
      businessAccountId,
      purchaseOrderNumber,
      notes,
      requiresApproval,
    } = req.body;

    // Note: Basic validation is done by middleware, but we keep these checks as backup
    // Validate required fields
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide products in the order',
      });
    }

    if (!email || !totalAmount) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and total amount',
      });
    }

    // Validate payment type - B2B supports credit and invoice
    const validPaymentTypes = ['cod', 'online', 'credit', 'invoice'];
    if (!paymentType || !validPaymentTypes.includes(paymentType)) {
      return res.status(400).json({
        success: false,
        message: `Please provide payment type. Valid types: ${validPaymentTypes.join(', ')}`,
      });
    }

    // Start database transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Get business account if B2B order (within transaction)
      let businessAccount = null;
      if (isB2BOrder && businessAccountId) {
        businessAccount = await BusinessAccount.findById(businessAccountId).session(session);
        if (!businessAccount || businessAccount.status !== 'active') {
          await session.abortTransaction();
          return res.status(400).json({
            success: false,
            message: 'Invalid or inactive business account',
          });
        }

        // Validate credit limit for credit/invoice payments
        if ((paymentType === 'credit' || paymentType === 'invoice') && businessAccount.creditLimit > 0) {
          const creditAvailable = businessAccount.creditLimit - businessAccount.creditUsed;
          if (totalAmount > creditAvailable) {
            await session.abortTransaction();
            return res.status(400).json({
              success: false,
              message: `Insufficient credit. Available: ₹${creditAvailable.toLocaleString('en-IN')}, Required: ₹${totalAmount.toLocaleString('en-IN')}`,
            });
          }
        }
      }

      // Validate products and update stock within transaction
      // Also recalculate prices with B2B pricing if applicable
      const validatedProducts = [];
      for (const item of products) {
        const product = await Product.findById(item.productId).session(session);
        
        if (!product) {
          await session.abortTransaction();
          return res.status(404).json({
            success: false,
            message: `Product not found: ${item.name}`,
          });
        }

        // Check size-specific stock if available, otherwise use general stock
        if (item.size) {
          const sizeStock = product.sizeStock?.get(item.size) || product.stock;
          if (sizeStock < item.quantity) {
            await session.abortTransaction();
            return res.status(400).json({
              success: false,
              message: `Insufficient stock for ${product.name} in size ${item.size}`,
            });
          }
          
          // Update size-specific stock
          if (product.sizeStock) {
            const currentSizeStock = product.sizeStock.get(item.size) || 0;
            product.sizeStock.set(item.size, currentSizeStock - item.quantity);
          }
        }

        // Also update general stock
        if (product.stock < item.quantity) {
          await session.abortTransaction();
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for ${product.name}`,
          });
        }

        // Check MOQ for B2B orders
        if (isB2BOrder && product.moq && product.moq > 1) {
          if (item.quantity < product.moq) {
            await session.abortTransaction();
            return res.status(400).json({
              success: false,
              message: `Minimum order quantity for ${product.name} is ${product.moq} units`,
            });
          }
        }

        // Calculate B2B price if applicable
        let finalPrice = item.price;
        if (businessAccount) {
          finalPrice = calculateB2BPrice(product, businessAccount, item.quantity);
        }

        validatedProducts.push({
          ...item,
          price: finalPrice, // Use calculated B2B price
        });

        product.stock -= item.quantity;
        await product.save({ session });
      }

      // Recalculate total amount with B2B pricing if applicable
      let finalTotalAmount = totalAmount;
      if (businessAccount && validatedProducts.length > 0) {
        finalTotalAmount = validatedProducts.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        // Add tax (10%)
        finalTotalAmount = finalTotalAmount * 1.1;
      }

      // Generate unique order ID
      const orderId = await generateOrderId();
      
      // Determine initial payment status based on payment type
      let initialPaymentStatus = 'pending';
      if (paymentType === 'cod') {
        initialPaymentStatus = 'pending';
      } else if (paymentType === 'credit' || paymentType === 'invoice') {
        initialPaymentStatus = 'pending'; // Will be marked as paid when invoice is generated
      } else if (paymentType === 'online') {
        initialPaymentStatus = paymentStatus || 'pending';
      }

      const initialOrderStatus = orderStatus || 'pending';
      
      // Determine if approval is required
      const needsApproval = requiresApproval || (isB2BOrder && businessAccount?.requiresApproval) || false;
      
      // Calculate due date for credit/invoice payments
      let dueDate = null;
      if ((paymentType === 'credit' || paymentType === 'invoice') && businessAccount) {
        const paymentTerms = businessAccount.paymentTerms || 'net30';
        const days = parseInt(paymentTerms.replace('net', '')) || 30;
        dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + days);
      }
      
      // Create order with timeline within transaction
      const orderData = {
        userId,
        products: validatedProducts.length > 0 ? validatedProducts : products,
        shippingAddress,
        email,
        phone,
        totalAmount: finalTotalAmount,
        paymentType,
        orderId,
        stripeSessionId: stripeSessionId || (paymentType === 'online' ? `order-${Date.now()}` : null),
        paymentStatus: initialPaymentStatus,
        orderStatus: initialOrderStatus,
        // B2B Fields
        isB2BOrder: isB2BOrder || false,
        businessAccountId: businessAccountId || null,
        purchaseOrderNumber: purchaseOrderNumber || null,
        requiresApproval: needsApproval,
        approvalStatus: needsApproval ? 'pending' : 'approved',
        paymentTerms: businessAccount?.paymentTerms || null,
        dueDate: dueDate,
        orderTimeline: [
          {
            status: initialOrderStatus,
            timestamp: new Date(),
            note: paymentType === 'cod' 
              ? 'Order placed with Cash on Delivery' 
              : paymentType === 'credit'
              ? `Order placed with Credit Terms (${businessAccount?.paymentTerms?.replace('net', 'Net ') || 'Net 30'})`
              : paymentType === 'invoice'
              ? 'Order placed - Invoice will be generated'
              : 'Order placed with Online Payment',
          },
        ],
        metadata: {
          source: req.headers['user-agent']?.includes('Mobile') ? 'mobile' : 'web',
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.headers['user-agent'],
          referrer: req.headers.referer,
        },
      };

      // Add notes if provided
      if (notes) {
        orderData.notes = [{
          note: notes,
          addedBy: userId || null,
          isInternal: false,
          createdAt: new Date(),
        }];
      }

      const order = await Order.create([orderData], { session });

      const createdOrder = order[0];

      // Update credit used if credit/invoice payment
      if ((paymentType === 'credit' || paymentType === 'invoice') && businessAccount) {
        businessAccount.creditUsed += finalTotalAmount;
        await businessAccount.save({ session });
      }

      // Commit transaction
      await session.commitTransaction();

      // Populate for response (outside transaction)
      await createdOrder.populate('userId', 'name email');
      await createdOrder.populate('products.productId', 'name image images');
      if (createdOrder.businessAccountId) {
        await createdOrder.populate('businessAccountId', 'companyName pricingTier paymentTerms');
      }

      // Send emails via queue (non-blocking)
      queueHelpers.addOrderConfirmationEmail(createdOrder).catch(err => 
        logger.error('Failed to queue order confirmation email:', err)
      );
      queueHelpers.addAdminNotificationEmail(createdOrder).catch(err => 
        logger.error('Failed to queue admin notification email:', err)
      );

      // Emit real-time notification via Socket.io
      socketHelpers.emitNewOrder(createdOrder);

      // Invalidate orders cache
      cache.delPattern('orders:*').catch(err => 
        logger.error('Failed to invalidate orders cache:', err)
      );

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: createdOrder,
      });
    } catch (error) {
      // Abort transaction on error
      await session.abortTransaction();
      console.error('Order creation error:', error);
      next(error);
    } finally {
      // End session
      session.endSession();
    }
  } catch (error) {
    console.error('Order creation error:', error);
    next(error);
  }
};

// @desc    Get user orders
// @route   GET /api/orders/:userId
// @access  Private
exports.getUserOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .populate('userId', 'name email')
      .populate('products.productId', 'name images image');

    res.status(200).json({
      success: true,
      message: 'Orders fetched successfully',
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
exports.getAllOrders = async (req, res, next) => {
  try {
    const { 
      status, 
      paymentType, 
      paymentStatus,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      search,
      page = 1,
      limit = 20 
    } = req.query;
    
    let query = { isDeleted: { $ne: true } };
    
    // Status filter
    if (status && status !== 'All') {
      query.orderStatus = status;
    }
    
    // Payment type filter
    if (paymentType && paymentType !== 'All') {
      query.paymentType = paymentType;
    }
    
    // Payment status filter
    if (paymentStatus && paymentStatus !== 'All') {
      query.paymentStatus = paymentStatus;
    }
    
    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }
    
    // Amount range filter
    if (minAmount || maxAmount) {
      query.totalAmount = {};
      if (minAmount) {
        query.totalAmount.$gte = parseFloat(minAmount);
      }
      if (maxAmount) {
        query.totalAmount.$lte = parseFloat(maxAmount);
      }
    }
    
    // Search filter
    if (search) {
      query.$or = [
        { orderId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { 'shippingAddress.firstName': { $regex: search, $options: 'i' } },
        { 'shippingAddress.lastName': { $regex: search, $options: 'i' } },
      ];
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('userId', 'name email')
      .populate('products.productId', 'name image images');
    
    const total = await Order.countDocuments(query);

    // Transform orders to match admin panel expectations
    const transformedOrders = orders.map(order => ({
      _id: order._id,
      user: order.userId ? {
        _id: order.userId._id,
        name: order.userId.name,
        email: order.userId.email,
      } : null,
      items: order.products.map(item => ({
        product: item.productId ? {
          _id: item.productId._id,
          name: item.productId.name,
          image: item.productId.image || item.productId.images?.[0] || '',
        } : { name: item.name },
        quantity: item.quantity,
        price: item.price,
        size: item.size,
      })),
      shippingAddress: order.shippingAddress,
      email: order.email,
      phone: order.phone,
      subtotal: order.totalAmount,
      shippingCost: 0,
      discount: 0,
      totalAmount: order.totalAmount,
      status: order.orderStatus,
      paymentStatus: order.paymentStatus === 'paid' ? 'Paid' : (order.paymentStatus === 'pending' ? 'Pending' : order.paymentStatus),
      paymentType: order.paymentType,
      orderId: order.orderId,
      orderTimeline: order.orderTimeline || [],
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    }));

    const response = {
      success: true,
      message: 'Orders fetched successfully',
      data: transformedOrders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    };

    // Cache the response for 60 seconds (if Redis is available)
    // Note: Caching is optional - if Redis fails, we continue without cache
    try {
      if (cache && typeof cache.set === 'function') {
        const cacheKey = `orders:${JSON.stringify(req.query)}`;
        await cache.set(cacheKey, response, 60).catch(err => {
          // Silently fail if Redis is not available - this is expected in development
          if (process.env.NODE_ENV === 'development') {
            logger.warn('Redis cache not available, continuing without cache');
          }
        });
      }
    } catch (cacheError) {
      // If caching fails, continue without cache (Redis might not be available)
      // This is not a critical error, so we don't throw
      if (process.env.NODE_ENV === 'development') {
        logger.warn('Failed to cache orders response (non-critical):', cacheError.message);
      }
    }

    if (!res.headersSent) {
      res.status(200).json(response);
    }
  } catch (error) {
    logger.logError(error, req);
    next(error);
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id
// @access  Private/Admin
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, orderStatus, paymentStatus } = req.body;

    const order = await Order.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('products.productId', 'name image images');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Track previous status for timeline
    const previousStatus = order.orderStatus;
    const previousPaymentStatus = order.paymentStatus;
    
    // Handle both 'status' and 'orderStatus' field names
    if (status) order.orderStatus = status;
    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    // Add to timeline if status changed
    if (order.orderStatus !== previousStatus) {
      if (!order.orderTimeline) {
        order.orderTimeline = [];
      }
      order.orderTimeline.push({
        status: order.orderStatus,
        timestamp: new Date(),
        note: `Status changed from ${previousStatus} to ${order.orderStatus}`,
      });
    }

    // Add to timeline if payment status changed
    if (paymentStatus && order.paymentStatus !== previousPaymentStatus) {
      if (!order.orderTimeline) {
        order.orderTimeline = [];
      }
      order.orderTimeline.push({
        status: `payment_${order.paymentStatus}`,
        timestamp: new Date(),
        note: `Payment status changed to ${order.paymentStatus}`,
      });
    }

    await order.save();

    // Send status update email to customer via queue (if status changed)
    if (order.orderStatus !== previousStatus) {
      queueHelpers.addOrderStatusUpdateEmail(order, order.orderStatus).catch(err => 
        logger.error('Failed to queue status update email:', err)
      );

      // Emit real-time notification to user
      if (order.userId) {
        socketHelpers.emitOrderStatusUpdate(order, order.userId.toString());
      }
    }

    // Invalidate orders cache
    cache.delPattern('orders:*').catch(err => 
      logger.error('Failed to invalidate orders cache:', err)
    );

    // Transform for admin panel
    const transformedOrder = {
      _id: order._id,
      user: order.userId ? {
        _id: order.userId._id,
        name: order.userId.name,
        email: order.userId.email,
      } : null,
      items: order.products.map(item => ({
        product: item.productId ? {
          _id: item.productId._id,
          name: item.productId.name,
          image: item.productId.image || item.productId.images?.[0] || '',
        } : { name: item.name },
        quantity: item.quantity,
        price: item.price,
        size: item.size,
      })),
      shippingAddress: order.shippingAddress,
      email: order.email,
      phone: order.phone,
      totalAmount: order.totalAmount,
      status: order.orderStatus,
      paymentStatus: order.paymentStatus === 'paid' ? 'Paid' : (order.paymentStatus === 'pending' ? 'Pending' : order.paymentStatus),
      paymentType: order.paymentType,
      orderId: order.orderId,
      orderTimeline: order.orderTimeline || [],
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };

    res.status(200).json({
      success: true,
      message: 'Order updated successfully',
      data: transformedOrder,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/order/:id
// @access  Public
exports.getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate('userId', 'name email')
      .populate('products.productId', 'name image images description');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order fetched successfully',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order by Stripe session ID
// @route   GET /api/orders/session/:sessionId
// @access  Public
exports.getOrderBySession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    const order = await Order.findOne({ stripeSessionId: sessionId })
      .populate('userId', 'name email')
      .populate('products.productId', 'name image images description');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order fetched successfully',
      order: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate invoice PDF
// @route   GET /api/orders/:id/invoice
// @access  Private/Admin or Order Owner
exports.generateInvoice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const invoiceService = require('../services/invoiceService');

    const order = await Order.findById(id)
      .populate('userId', 'name email')
      .populate('products.productId', 'name image images');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Check if user owns the order or is admin
    if (req.user && req.user.role !== 'admin' && order.userId?.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this invoice',
      });
    }

    const pdfBuffer = await invoiceService.generateInvoice(order);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${order.orderId || order._id}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Invoice generation error:', error);
    next(error);
  }
};

// @desc    Export orders to CSV
// @route   GET /api/orders/export/csv
// @access  Private/Admin
exports.exportOrdersCSV = async (req, res, next) => {
  try {
    const { status, paymentType, startDate, endDate } = req.query;
    
    let query = { isDeleted: { $ne: true } };
    if (status && status !== 'All') query.orderStatus = status;
    if (paymentType && paymentType !== 'All') query.paymentType = paymentType;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .populate('userId', 'name email')
      .limit(10000); // Limit export to 10k orders

    // Generate CSV
    const csvHeaders = [
      'Order ID',
      'Order Date',
      'Customer Name',
      'Email',
      'Phone',
      'Items',
      'Total Amount',
      'Payment Type',
      'Payment Status',
      'Order Status',
      'Shipping Address',
    ];

    const csvRows = orders.map(order => {
      const items = order.products.map(p => `${p.name} (${p.quantity}x)`).join('; ');
      const address = order.shippingAddress 
        ? `${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}`
        : 'N/A';
      
      return [
        order.orderId || order._id,
        new Date(order.createdAt).toLocaleDateString('en-IN'),
        order.userId?.name || order.shippingAddress?.firstName + ' ' + order.shippingAddress?.lastName || 'Guest',
        order.email || order.userId?.email || 'N/A',
        order.phone || 'N/A',
        items,
        order.totalAmount,
        order.paymentType === 'cod' ? 'COD' : 'Online',
        order.paymentStatus,
        order.orderStatus,
        address,
      ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
    });

    const csvContent = [csvHeaders.map(h => `"${h}"`).join(','), ...csvRows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=orders-export-${new Date().toISOString().split('T')[0]}.csv`);
    res.send('\ufeff' + csvContent); // BOM for Excel compatibility
  } catch (error) {
    console.error('Export error:', error);
    next(error);
  }
};

// @desc    Add note to order
// @route   POST /api/orders/:id/notes
// @access  Private/Admin
exports.addOrderNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { note, isInternal = true } = req.body;

    if (!note || typeof note !== 'string' || note.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Note is required',
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (!order.notes) {
      order.notes = [];
    }

    order.notes.push({
      note: note.trim(),
      addedBy: req.user?.id || null,
      isInternal: isInternal !== false,
      createdAt: new Date(),
    });

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Note added successfully',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update tracking number
// @route   PUT /api/orders/:id/tracking
// @access  Private/Admin
exports.updateTracking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { trackingNumber, carrier, estimatedDelivery } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (carrier) order.carrier = carrier;
    if (estimatedDelivery) order.estimatedDelivery = new Date(estimatedDelivery);

    // Update status to shipped if tracking is added
    if (trackingNumber && order.orderStatus === 'processing') {
      order.orderStatus = 'shipped';
      if (!order.orderTimeline) {
        order.orderTimeline = [];
      }
      order.orderTimeline.push({
        status: 'shipped',
        timestamp: new Date(),
        note: `Order shipped with tracking number: ${trackingNumber}`,
      });
    }

    await order.save();

    // Send status update email via queue
    if (trackingNumber && order.orderStatus === 'shipped') {
      queueHelpers.addOrderStatusUpdateEmail(order, 'shipped').catch(err => 
        logger.error('Failed to queue shipping email:', err)
      );

      // Emit real-time notification to user
      if (order.userId) {
        socketHelpers.emitOrderStatusUpdate(order, order.userId.toString());
      }
    }

    // Invalidate orders cache
    cache.delPattern('orders:*').catch(err => 
      logger.error('Failed to invalidate orders cache:', err)
    );

    res.status(200).json({
      success: true,
      message: 'Tracking information updated successfully',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

