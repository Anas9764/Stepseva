// Order validation middleware
const validateOrder = (req, res, next) => {
  const { products, shippingAddress, email, phone, totalAmount, paymentType } = req.body;
  const errors = [];

  // Validate products
  if (!products || !Array.isArray(products) || products.length === 0) {
    errors.push('Products array is required and must not be empty');
  } else {
    products.forEach((product, index) => {
      if (!product.productId) {
        errors.push(`Product ${index + 1}: productId is required`);
      }
      if (!product.name || typeof product.name !== 'string') {
        errors.push(`Product ${index + 1}: name is required`);
      }
      if (typeof product.price !== 'number' || product.price <= 0) {
        errors.push(`Product ${index + 1}: price must be a positive number`);
      }
      if (typeof product.quantity !== 'number' || product.quantity < 1) {
        errors.push(`Product ${index + 1}: quantity must be at least 1`);
      }
    });
  }

  // Validate email
  if (!email || typeof email !== 'string') {
    errors.push('Email is required');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('Invalid email format');
    }
  }

  // Validate totalAmount
  if (typeof totalAmount !== 'number' || totalAmount <= 0) {
    errors.push('Total amount must be a positive number');
  }

  // Validate paymentType
  if (!paymentType || !['cod', 'online'].includes(paymentType)) {
    errors.push('Payment type must be either "cod" or "online"');
  }

  // Validate shippingAddress
  if (!shippingAddress || typeof shippingAddress !== 'object') {
    errors.push('Shipping address is required');
  } else {
    if (!shippingAddress.firstName || typeof shippingAddress.firstName !== 'string') {
      errors.push('Shipping address: firstName is required');
    }
    if (!shippingAddress.lastName || typeof shippingAddress.lastName !== 'string') {
      errors.push('Shipping address: lastName is required');
    }
    if (!shippingAddress.address || typeof shippingAddress.address !== 'string') {
      errors.push('Shipping address: address is required');
    }
    if (!shippingAddress.city || typeof shippingAddress.city !== 'string') {
      errors.push('Shipping address: city is required');
    }
    if (!shippingAddress.state || typeof shippingAddress.state !== 'string') {
      errors.push('Shipping address: state is required');
    }
    if (!shippingAddress.zipCode || typeof shippingAddress.zipCode !== 'string') {
      errors.push('Shipping address: zipCode is required');
    }
    if (!shippingAddress.country || typeof shippingAddress.country !== 'string') {
      errors.push('Shipping address: country is required');
    }
  }

  // Validate phone (optional but if provided, should be valid)
  if (phone && typeof phone !== 'string') {
    errors.push('Phone must be a string');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  next();
};

module.exports = validateOrder;

